import 'dotenv/config'
import ExcelJS from 'exceljs'
import { PutCommand } from '@aws-sdk/lib-dynamodb'
import { db, table, getRaw } from '../src/core/db.js'
import { emptyLinks } from '../src/core/links.js'
import { getLists, tagsFor } from '../src/core/master.js'
import { PlantModel, PlantPublishModel } from '../src/plants/plant.model.js'
import { TreeModel, TreePublishModel } from '../src/trees/tree.model.js'
import { InsectModel, InsectPublishModel } from '../src/insects/insect.model.js'
import { BirdModel, BirdPublishModel } from '../src/birds/bird.model.js'
import { AnimalModel, AnimalPublishModel } from '../src/animals/animal.model.js'

// Seeds the table from seed/flora-fauna.xlsx: npm run seed
// Items that already exist are skipped unless --overwrite. --dry-run prints what it would do without writing.
// --only=plant/nel,tree/maa limits the run to those items (and links between them).
const apply = !process.argv.includes('--dry-run')
const overwrite = process.argv.includes('--overwrite')
const only = process.argv.find((a) => a.startsWith('--only='))?.slice(7).split(',')
const FILE = new URL('../seed/flora-fauna.xlsx', import.meta.url).pathname

const SHEETS = {
  Plants: ['plant', PlantModel, PlantPublishModel],
  Trees: ['tree', TreeModel, TreePublishModel],
  Insects: ['insect', InsectModel, InsectPublishModel],
  Birds: ['bird', BirdModel, BirdPublishModel],
  Animals: ['animal', AnimalModel, AnimalPublishModel],
}
const OPPOSITE = { harms: 'harmedBy', helps: 'helpedBy' }

const list = (s) => s.split(/[,;]/).map((x) => x.trim()).filter(Boolean)
// One entry per line, its parts separated by |, e.g. "Egg|3 days|Laid on leaves." Text may contain ; and commas.
const pairs = (s, keys) =>
  s.split(/\r?\n/).map((x) => x.trim()).filter(Boolean).map((x) => Object.fromEntries(x.split('|').map((v, i) => [keys[i], v.trim()])))
const day = (s) => (s === '' ? null : Number(s))

// A cell as the model expects it: lists, pairs and day numbers are written as text in the sheet.
function value(col, raw) {
  const s = raw === null || raw === undefined ? '' : String(raw?.text ?? raw?.result ?? raw).trim()
  if (col === 'seasons' || col === 'lands') return list(s)
  if (col === 'tamilNames') return pairs(s, ['ta', 'latin'])
  if (col === 'photos') return pairs(s, ['key', 'hint'])
  if (/^(en|ta)\.photos$/.test(col)) return pairs(s, ['label', 'caption'])
  if (/^(en|ta)\.lifeCycle$/.test(col)) return pairs(s, ['stage', 'duration', 'text'])
  if (col.startsWith('harvest.')) return day(s)
  return s
}

// Dotted column names become nested objects: "en.notes.uses" -> { en: { notes: { uses } } }.
function nest(row) {
  const out = {}
  for (const [col, v] of Object.entries(row)) {
    const path = col.split('.')
    let at = out
    path.slice(0, -1).forEach((k) => (at = at[k] ??= {}))
    at[path.at(-1)] = v
  }
  return out
}

const wb = new ExcelJS.Workbook()
await wb.xlsx.readFile(FILE)
const lists = await getLists()

const records = new Map()
const errors = []
for (const [title, [kind, Model, Publish]] of Object.entries(SHEETS)) {
  const ws = wb.getWorksheet(title)
  if (!ws) continue
  const header = ws.getRow(1).values
  ws.eachRow((r, n) => {
    if (n === 1) return
    const row = {}
    header.forEach((col, i) => col && (row[col] = value(col, r.getCell(i).value)))
    if (!row.id) return
    const { id, variety_of, status = 'published', ...fields } = nest(row)
    if (!['published', 'draft'].includes(status)) {
      errors.push(`${title} row ${n} (${id}): status must be published or draft`)
      return
    }
    // Master-list tags are worked out from the text (and any key.* columns) rather than kept in the sheet.
    fields.tags = tagsFor(kind, fields, lists)
    // Drafts only need to be valid; published rows must also pass the publish checks.
    const data = Model.safeParse(fields)
    const check = data.success && status === 'published' ? Publish.safeParse(data.data) : data
    if (!data.success || !check.success) {
      const issue = (data.error || check.error).issues[0]
      errors.push(`${title} row ${n} (${id}): ${issue.path.join('.')} ${issue.message}`)
      return
    }
    if (!only || only.includes(`${kind}/${id}`)) records.set(`${kind}/${id}`, { pk: kind, sk: id, status, data: data.data })
  })
}

const links = []
wb.getWorksheet('Links')?.eachRow((r, n) => {
  if (n === 1) return
  const [from, rel, to] = [1, 2, 3].map((i) => String(r.getCell(i).value ?? '').trim())
  if (!from || (only && !(only.includes(from) && only.includes(to)))) return
  if (!OPPOSITE[rel]) errors.push(`Links row ${n}: rel must be helps or harms`)
  else links.push([from, rel, to])
})

if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}

// Each item as it is now in the table (undefined if new), read once.
const now = new Date().toISOString()
const stored = new Map()
async function load(ref) {
  if (!stored.has(ref)) {
    const [kind, id] = ref.split('/')
    stored.set(ref, await getRaw(kind, id))
  }
  return stored.get(ref)
}

const writes = new Map()
for (const [ref, { pk, sk, status, data }] of records) {
  const existing = await load(ref)
  if (existing && !overwrite) {
    console.log(`skip ${ref} (exists)`)
    continue
  }
  const published = status === 'published'
  writes.set(ref, {
    pk, sk, status, dirty: !published, data, live: published ? data : null,
    links: existing?.links || emptyLinks(),
    createdAt: existing?.createdAt || now, updatedAt: now, ...(published && { publishedAt: now }),
  })
}

// Links may point at items already in the table; those are updated too. Links already there are left alone.
const has = (list, ref) => list.some((l) => `${l.kind}/${l.id}` === ref)
for (const [from, rel, to] of links) {
  const a = writes.get(from) || (await load(from))
  const b = writes.get(to) || (await load(to))
  if (!a || !b) {
    console.error(`Links: ${!a ? from : to} not found`)
    process.exit(1)
  }
  a.links = { ...emptyLinks(), ...a.links }
  b.links = { ...emptyLinks(), ...b.links }
  if (has(a.links[rel], to) && has(b.links[OPPOSITE[rel]], from)) continue
  if (!has(a.links[rel], to)) a.links[rel].push({ kind: b.pk, id: b.sk })
  if (!has(b.links[OPPOSITE[rel]], from)) b.links[OPPOSITE[rel]].push({ kind: a.pk, id: a.sk })
  for (const [ref, item] of [[from, a], [to, b]]) writes.set(ref, item)
}

for (const [ref, item] of writes) {
  if (apply) await db.send(new PutCommand({ TableName: table(), Item: item }))
  console.log(`${apply ? 'wrote' : 'would write'} ${ref}${records.has(ref) ? '' : ' (links only)'}`)
}
if (!apply) console.log('\nDry run; nothing written.')
