import { LANDS, SEASONS } from '../../config/seasons'

// Day-range filter buckets. An item matches every bucket its range overlaps.
const DAY_BUCKETS = [
  ['under60', 'Under 60 days', 0, 59],
  ['60-90', '60–90 days', 60, 90],
  ['90-120', '90–120 days', 91, 120],
  ['over120', 'Over 120 days', 121, Infinity],
]

// Filters and table columns for a section, built from its config. `lists` maps trait rows to their master
// lists (see config/master.js); each tagged row becomes a filter under "More filters".
export function filtersFor(cfg, admin, lists = new Map(), label = (o) => o.en) {
  const pick = (key) => (item, v) => item[key] === v
  const has = (key) => (item, v) => item[key]?.includes(v)
  const choice = cfg.stats.find((s) => s.options)
  const overlaps = (key) => (item, v) => {
    const { min = null, max = null } = item[key] || {}
    const [, , lo, hi] = DAY_BUCKETS.find(([id]) => id === v)
    return (min ?? max) !== null && (min ?? max) <= hi && (max ?? min) >= lo
  }
  return [
    { key: 'seasons', label: cfg.seasonLabel, options: SEASONS.map((s) => [s.id, s.name]), test: has('seasons') },
    { key: 'lands', label: cfg.landLabel, options: LANDS.map((l) => [l.id, l.name]), test: has('lands') },
    ...cfg.stats.filter((s) => s.range).map((s) => ({ key: s.key, label: s.label, options: DAY_BUCKETS.map(([id, label]) => [id, label]), test: overlaps(s.key) })),
    { key: choice.key, label: choice.label, options: choice.options.map((o) => [o, o]), test: pick(choice.key) },
    admin && { key: 'status', label: 'Status', options: [['published', 'Published'], ['draft', 'Draft']], test: pick('status') },
    ...cfg.traits.flatMap((t) =>
      t.fields.flatMap((f) => {
        const path = `${t.key}.${f.key}`
        const list = lists.get(path)
        if (!list) return []
        return {
          key: `tags:${path}`,
          label: f.label,
          group: t.label,
          more: true,
          options: list.options.map((o) => [o.id, label(o)]),
          swatch: list.colour && Object.fromEntries(list.options.map((o) => [o.id, o.hex])),
          test: (item, v) => item.tags?.[path]?.includes(v),
        }
      }),
    ),
  ].filter(Boolean)
}

export function applyFilters(items, defs, q, filters) {
  const needle = q.trim().toLowerCase()
  return items.filter(
    (i) =>
      (!needle || [i.name, i.names?.ta, i.names?.en, i.family, i.scientific].some((v) => v?.toLowerCase().includes(needle))) &&
      defs.every((d) => !filters[d.key] || d.test(i, filters[d.key])),
  )
}

// `withKind` adds a Kind column, for a group's "All" table.
export function columnsFor(cfg, withKind) {
  const main = [
    withKind && { id: 'kind', label: 'Kind', type: 'kind' },
    { id: 'seasons', label: cfg.seasonLabel, type: 'seasons' },
    { id: 'lands', label: cfg.landLabel, type: 'lands' },
    ...cfg.stats.map((s) => ({ id: s.key, label: s.label, type: s.options ? 'pill' : s.range ? 'stat' : 'text', stat: s })),
    { id: 'family', label: 'Family', type: 'text' },
    { id: 'scientific', label: 'Scientific name', type: 'italic' },
  ]
    .filter(Boolean)
    .map((c) => ({ ...c, group: 'Main', get: (i) => i[c.id] }))
  const traits = cfg.traits.flatMap((t) =>
    t.fields.map((f) => ({ id: `${t.key}.${f.key}`, label: f.label, group: t.label, type: 'text', get: (i) => i[t.key]?.[f.key] })),
  )
  return [...main, ...traits]
}

export const defaultColumns = (cfg, withKind) =>
  columnsFor(cfg, withKind)
    .filter((c) => c.group === 'Main')
    .map((c) => c.id)
