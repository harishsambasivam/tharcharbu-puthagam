import 'dotenv/config'
import ExcelJS from 'exceljs'
import { UpdateCommand } from '@aws-sdk/lib-dynamodb'
import { db, table, queryKind } from '../src/core/db.js'

// One-off datafix: spacing in feet rather than cm, and no pH in the soil text. Fixes the stored items
// (draft and live, English and Tamil) and the seed sheet, so a reseed agrees: npm run fix:spacing-soil
// --dry-run prints what it would change without writing.
const apply = !process.argv.includes('--dry-run')
const FILE = new URL('../seed/flora-fauna.xlsx', import.meta.url).pathname

// 30 cm -> 1, 45 cm -> 1.5, 20 cm -> 0.7: feet to one decimal place.
const feet = (cm) => String(Math.round((Number(cm) / 30.48) * 10) / 10)
const CM = /(\d+(?:\.\d+)?)(\s*×\s*)?(\d+(?:\.\d+)?)?\s*(cm\b|செ\.மீ)/g
export const spacing = (s) => s.replace(CM, (_, a, x, b, unit) => `${feet(a)}${b ? `${x}${feet(b)}` : ''} ${unit === 'cm' ? 'ft' : 'அடி'}`)
export const soil = (s) => s.replace(/,?\s*pH\s*[\d.]+(?:\s*[–-]\s*[\d.]+)?/g, '').trim()

const FIX = { spacing, soil }

// The item's text with both rows fixed; null when nothing changes.
function fixText(copy) {
  let changed = false
  const out = { ...copy }
  for (const lang of ['en', 'ta']) {
    const grow = copy?.[lang]?.grow
    if (!grow) continue
    const next = { ...grow }
    for (const [field, fix] of Object.entries(FIX)) if (typeof grow[field] === 'string') next[field] = fix(grow[field])
    if (JSON.stringify(next) !== JSON.stringify(grow)) {
      changed = true
      out[lang] = { ...copy[lang], grow: next }
    }
  }
  return changed ? out : null
}

for (const kind of ['plant', 'tree']) {
  for (const item of await queryKind(kind)) {
    const data = fixText(item.data)
    const live = item.live && fixText(item.live)
    if (!data && !live) continue
    const sets = [data && ['data', data], live && ['live', live]].filter(Boolean)
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
    const show = data || live
    console.log(`${apply ? 'fixed' : 'would fix'} ${kind}/${item.sk}: ${show.en?.grow?.spacing} · ${show.en?.grow?.soil}`)
  }
}

const wb = new ExcelJS.Workbook()
await wb.xlsx.readFile(FILE)
let cells = 0
for (const name of ['Plants', 'Trees']) {
  const ws = wb.getWorksheet(name)
  const header = ws.getRow(1).values
  const cols = header.flatMap((h, i) => {
    const field = /^(en|ta)\.grow\.(spacing|soil)$/.exec(h)?.[2]
    return field ? [[i, FIX[field]]] : []
  })
  ws.eachRow((row, n) => {
    if (n === 1) return
    for (const [i, fix] of cols) {
      const cell = row.getCell(i)
      if (typeof cell.value !== 'string') continue
      const next = fix(cell.value)
      if (next !== cell.value) {
        cell.value = next
        cells++
      }
    }
  })
}
if (apply) await wb.xlsx.writeFile(FILE)
console.log(`${apply ? 'fixed' : 'would fix'} ${cells} cells in ${FILE.split('/').pop()}`)
if (!apply) console.log('\nDry run; nothing written.')
