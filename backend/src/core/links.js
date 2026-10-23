import { z } from 'zod'
import { UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { db, table, getRaw } from './db.js'
import { HttpError } from './http.js'

// Every link is written on both items, so it shows on both pages. A link is only `{ kind, id }`;
// the frontend fills in names and photos from the catalog.
const OPPOSITE = { harms: 'harmedBy', harmedBy: 'harms', helps: 'helpedBy', helpedBy: 'helps' }
export const KINDS = ['plant', 'tree', 'insect', 'bird', 'animal']
export const emptyLinks = () => ({ harms: [], harmedBy: [], helps: [], helpedBy: [] })

const ref = z.object({ kind: z.enum(KINDS), id: z.string().min(1).max(40) })
const linkInput = z.object({ rel: z.enum(Object.keys(OPPOSITE)), target: ref })

const without = (list = [], { kind, id }) => list.filter((l) => !(l.kind === kind && l.id === id))
export const linksOf = (item) => ({ ...emptyLinks(), ...item.links })
const saveLinks = (item, links) =>
  db.send(
    new UpdateCommand({
      TableName: table(),
      Key: { pk: item.pk, sk: item.sk },
      UpdateExpression: 'SET links = :l',
      ExpressionAttributeValues: { ':l': links },
    }),
  )

async function loadPair(kind, id, target) {
  if (target.kind === kind && target.id === id) throw new HttpError(400, 'An item cannot link to itself')
  const [a, b] = await Promise.all([getRaw(kind, id), getRaw(target.kind, target.id)])
  if (!a || !b) throw new HttpError(404, 'Not found')
  return [a, b]
}

export async function addLink(kind, id, body) {
  const { rel, target } = linkInput.parse(body)
  const [a, b] = await loadPair(kind, id, target)
  const la = linksOf(a)
  const lb = linksOf(b)
  la[rel] = [...without(la[rel], target), target]
  lb[OPPOSITE[rel]] = [...without(lb[OPPOSITE[rel]], { kind, id }), { kind, id }]
  await Promise.all([saveLinks(a, la), saveLinks(b, lb)])
}

export async function removeLink(kind, id, rel, target) {
  if (!OPPOSITE[rel]) throw new HttpError(400, 'Unknown link type')
  const [a, b] = await loadPair(kind, id, ref.parse(target))
  const la = linksOf(a)
  const lb = linksOf(b)
  la[rel] = without(la[rel], target)
  lb[OPPOSITE[rel]] = without(lb[OPPOSITE[rel]], { kind, id })
  await Promise.all([saveLinks(a, la), saveLinks(b, lb)])
}

export async function unlinkAll(item) {
  for (const [rel, list] of Object.entries(linksOf(item))) {
    for (const target of list) {
      const other = await getRaw(target.kind, target.id)
      if (!other) continue
      const lo = linksOf(other)
      lo[OPPOSITE[rel]] = without(lo[OPPOSITE[rel]], { kind: item.pk, id: item.sk })
      await saveLinks(other, lo)
    }
  }
}
