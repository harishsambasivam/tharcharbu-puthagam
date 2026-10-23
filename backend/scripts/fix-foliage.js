import 'dotenv/config'
import ExcelJS from 'exceljs'
import { UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { db, table, queryKind } from '../src/core/db.js'
import { getLists } from '../src/core/master.js'

// One-off datafix: evergreen / deciduous were tagged on the life cycle row, carried over from the old key
// strip. They now have their own row, leaf.foliage ("Leaf fall"). Moves the tags there and writes the
// row's English and Tamil text, in the draft and live copies, and adds the row to the seed sheet:
// npm run fix:foliage. --dry-run prints what it would change without writing.
const apply = !process.argv.includes('--dry-run')
const FILE = new URL('../seed/flora-fauna.xlsx', import.meta.url).pathname
const foliage = (await getLists()).find((l) => l.key === 'foliage').options
const option = (id) => foliage.find((o) => o.id === id)

// The item with leaf-fall tags moved off its life cycle row; null when it has none there.
function move(kind, copy) {
  const from = `${kind}.lifeCycle`
  const ids = copy?.tags?.[from] || []
  const moved = ids.filter(option)
  if (!moved.length) return null
  const tags = { ...copy.tags, [from]: ids.filter((id) => !option(id)), 'leaf.foliage': moved }
  if (!tags[from].length) delete tags[from]
  const out = { ...copy, tags }
  for (const lang of ['en', 'ta']) {
    const leaf = copy[lang]?.leaf || {}
    if (!leaf.foliage) out[lang] = { ...copy[lang], leaf: { ...leaf, foliage: moved.map((id) => option(id)[lang]).join(', ') } }
  }
  return out
}

for (const kind of ['plant', 'tree']) {
  for (const item of await queryKind(kind)) {
    const sets = [['data', move(kind, item.data)], ['live', item.live && move(kind, item.live)]].filter(([, v]) => v)
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
    console.log(`${apply ? 'moved' : 'would move'} ${kind}/${item.sk}: ${sets[0][1].tags['leaf.foliage'].join('+')}`)
  }
}

// The seed sheet: en.leaf.foliage and ta.leaf.foliage columns after the arrangement ones, filled from key.habit.
const wb = new ExcelJS.Workbook()
await wb.xlsx.readFile(FILE)
let filled = 0
for (const name of ['Plants', 'Trees']) {
  const ws = wb.getWorksheet(name)
  const header = () => ws.getRow(1).values
  if (header().includes('en.leaf.foliage')) continue
  const habit = header().indexOf('key.habit')
  for (const lang of ['en', 'ta']) {
    const at = header().indexOf(`${lang}.leaf.arrangement`) + 1
    const values = [`${lang}.leaf.foliage`]
    ws.eachRow((row, n) => {
      if (n === 1) return
      const o = option(String(row.getCell(habit).value || '').trim())
      values[n - 1] = o ? o[lang] : null
      if (o && lang === 'en') filled++
    })
    ws.spliceColumns(at, 0, values)
  }
}
if (apply) await wb.xlsx.writeFile(FILE)
console.log(`${apply ? 'added' : 'would add'} leaf.foliage columns to ${FILE.split('/').pop()}, ${filled} rows filled`)
if (!apply) console.log('\nDry run; nothing written.')
