import 'dotenv/config'
import { UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { db, table, queryKind } from '../src/core/db.js'

// One-off datafix: items seeded before sowing moved to the seed card still keep it at grow.sowing, which
// nothing reads. Moves it to seed.sowing (unless that is already filled) in the draft and live copies,
// English and Tamil: npm run fix:sowing. --dry-run prints what it would change without writing.
const apply = !process.argv.includes('--dry-run')

// The item's text with sowing moved; null when there is nothing to move.
function move(copy) {
  let changed = false
  const out = { ...copy }
  for (const lang of ['en', 'ta']) {
    const { sowing, ...grow } = copy?.[lang]?.grow || {}
    if (sowing === undefined) continue
    const seed = copy[lang].seed || {}
    out[lang] = { ...copy[lang], grow, seed: { ...seed, sowing: seed.sowing || sowing } }
    changed = true
  }
  return changed ? out : null
}

for (const kind of ['plant', 'tree']) {
  for (const item of await queryKind(kind)) {
    const sets = [['data', move(item.data)], ['live', item.live && move(item.live)]].filter(([, v]) => v)
    if (!sets.length) continue
    if (apply)
      await db.send(
        new UpdateCommand({
          TableName: table(),
          Key: { pk: item.pk, sk: item.sk },
          UpdateExpression: `SET ${sets.map(([k]) => `#${k} = :${k}`).join(', ')}`,
          ExpressionAttributeNames: Object.fromEntries(sets.map(([k]) => [`#${k}`, k])),
          ExpressionAttributeValues: Object.fromEntries(sets.map(([k, v]) => [`:${k}`, v])),
        }),
      )
    console.log(`${apply ? 'moved' : 'would move'} ${kind}/${item.sk}: ${sets[0][1].en?.seed?.sowing}`)
  }
}
if (!apply) console.log('\nDry run; nothing written.')
