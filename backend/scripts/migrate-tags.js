import 'dotenv/config'
import { UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { db, table, queryKind } from '../src/core/db.js'
import { KINDS } from '../src/core/links.js'
import { getLists, tagsFor } from '../src/core/master.js'

// One-off: gives every stored item master-list tags worked out from its text, and folds the old
// key strip (key.habit, key.leafType, ...) into them: npm run migrate:tags
// Rows that already have tags are left alone unless --overwrite. --dry-run prints what it would do.
const apply = !process.argv.includes('--dry-run')
const overwrite = process.argv.includes('--overwrite')
const lists = await getLists()

const retag = (kind, copy) => {
  if (!copy) return copy
  const { key, ...rest } = copy
  return { ...rest, tags: tagsFor(kind, copy, lists, { overwrite }) }
}

for (const kind of KINDS) {
  for (const item of await queryKind(kind)) {
    const data = retag(kind, item.data)
    const live = retag(kind, item.live)
    const count = Object.values(data.tags).flat().length
    if (apply)
      await db.send(
        new UpdateCommand({
          TableName: table(),
          Key: { pk: item.pk, sk: item.sk },
          UpdateExpression: 'SET #data = :data, #live = :live',
          ExpressionAttributeNames: { '#data': 'data', '#live': 'live' },
          ExpressionAttributeValues: { ':data': data, ':live': live },
        }),
      )
    console.log(`${apply ? 'tagged' : 'would tag'} ${kind}/${item.sk}: ${count} tags`)
  }
}
if (!apply) console.log('\nDry run; nothing written.')
