import crypto from 'node:crypto'
import { Router } from 'express'
import { DeleteCommand, PutCommand, UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { db, table, getRaw, queryKind, visible, view } from './db.js'
import { HttpError } from './http.js'
import { requireAdmin } from './auth.js'
import { addLink, emptyLinks, linksOf, removeLink, unlinkAll } from './links.js'

const now = () => new Date().toISOString()

// Drafts are saved with `schema`; publishing checks the stricter `publishSchema`.
export function createManager(kind, { schema, publishSchema }) {
  const find = async (id, admin) => {
    const item = await getRaw(kind, id)
    if (!item || !visible(item, admin)) throw new HttpError(404, 'Not found')
    return item
  }
  const set = (id, values) =>
    db.send(
      new UpdateCommand({
        TableName: table(),
        Key: { pk: kind, sk: id },
        ConditionExpression: 'attribute_exists(pk)',
        UpdateExpression: `SET ${Object.keys(values).map((k) => `#${k} = :${k}`).join(', ')}`,
        ExpressionAttributeNames: Object.fromEntries(Object.keys(values).map((k) => [`#${k}`, k])),
        ExpressionAttributeValues: Object.fromEntries(Object.entries(values).map(([k, v]) => [`:${k}`, v])),
      }),
    )

  return {
    kind,
    async list(admin) {
      const items = await queryKind(kind)
      return items
        .filter((i) => visible(i, admin))
        .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
        .map((i) => view(i, admin))
    },
    async get(id, admin) {
      const item = await find(id, admin)
      return { ...view(item, admin), links: linksOf(item) }
    },
    async create(data) {
      const item = {
        pk: kind,
        sk: crypto.randomUUID().slice(0, 8),
        status: 'draft',
        dirty: true,
        data: schema.parse(data || {}),
        live: null,
        links: emptyLinks(),
        createdAt: now(),
        updatedAt: now(),
      }
      await db.send(new PutCommand({ TableName: table(), Item: item, ConditionExpression: 'attribute_not_exists(pk)' }))
      return { ...view(item, true), links: emptyLinks() }
    },
    // A new draft with the same working copy, for making a variety. Links stay with the original.
    async clone(id) {
      const item = await find(id, true)
      return this.create({ ...item.data, name: `${item.data.name || 'Untitled'} (copy)`.slice(0, 80) })
    },
    async save(id, data) {
      const parsed = schema.parse(data)
      await set(id, { data: parsed, dirty: true, updatedAt: now() })
      return parsed
    },
    async publish(id) {
      const item = await find(id, true)
      publishSchema.parse(item.data)
      await set(id, { live: item.data, status: 'published', dirty: false, publishedAt: now() })
    },
    async unpublish(id) {
      await set(id, { status: 'draft', updatedAt: now() })
    },
    async remove(id) {
      const item = await find(id, true)
      await unlinkAll(item)
      await db.send(new DeleteCommand({ TableName: table(), Key: { pk: kind, sk: id } }))
    },
  }
}

export function createController(m) {
  const r = Router()
  const done = (res) => res.status(204).end()

  r.get('/', async (req, res) => res.json(await m.list(req.admin)))
  r.get('/:id', async (req, res) => res.json(await m.get(req.params.id, req.admin)))

  r.use(requireAdmin)
  r.post('/', async (req, res) => res.status(201).json(await m.create(req.body)))
  r.post('/:id/clone', async (req, res) => res.status(201).json(await m.clone(req.params.id)))
  r.put('/:id', async (req, res) => res.json(await m.save(req.params.id, req.body)))
  r.post('/:id/publish', async (req, res) => done(res, await m.publish(req.params.id)))
  r.post('/:id/unpublish', async (req, res) => done(res, await m.unpublish(req.params.id)))
  r.delete('/:id', async (req, res) => done(res, await m.remove(req.params.id)))
  r.post('/:id/links', async (req, res) => done(res, await addLink(m.kind, req.params.id, req.body)))
  r.delete('/:id/links/:rel/:kind/:target', async (req, res) => {
    const { id, rel, kind, target } = req.params
    done(res, await removeLink(m.kind, id, rel, { kind, id: target }))
  })
  return r
}
