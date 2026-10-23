import { Router } from 'express'
import { QueryCommand } from '@aws-sdk/lib-dynamodb'
import { db, table } from '../core/db.js'
import { KINDS } from '../core/links.js'

const r = Router()

// Every item in every category, with only what a link or picker shows: name, other-language names
// and the first photo. The projection keeps the long text (notes, traits, en/ta) out of the read.
const PROJECTION = {
  ProjectionExpression: 'pk, sk, #status, #data.#name, #data.#names, #data.#photos[0], #live.#name, #live.#names, #live.#photos[0]',
  ExpressionAttributeNames: { '#status': 'status', '#data': 'data', '#live': 'live', '#name': 'name', '#names': 'names', '#photos': 'photos' },
}

async function queryLight(kind) {
  const items = []
  let ExclusiveStartKey
  do {
    const page = await db.send(
      new QueryCommand({ TableName: table(), KeyConditionExpression: 'pk = :k', ExpressionAttributeValues: { ':k': kind }, ExclusiveStartKey, ...PROJECTION }),
    )
    items.push(...page.Items)
    ExclusiveStartKey = page.LastEvaluatedKey
  } while (ExclusiveStartKey)
  return items
}

// Readers get published items only, from their live copy; editors see drafts too.
r.get('/', async (req, res) => {
  const items = (await Promise.all(KINDS.map(queryLight))).flat()
  res.json(
    items
      .filter((i) => req.admin || i.status === 'published')
      .map((i) => {
        const d = (req.admin ? i.data : i.live) || {}
        return { kind: i.pk, id: i.sk, status: i.status, name: d.name || '', names: d.names || {}, photo: d.photos?.[0]?.key || '' }
      }),
  )
})

export default r
