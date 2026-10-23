import { Bird, Bug, Newspaper, PawPrint, Sprout, House } from 'lucide-react'
import { TreeIcon } from '../components/Icons'

// One entry per section of the site. Pages, editor and filters are all driven from here.
const fields = (...list) => list.map(([key, label]) => ({ key, label }))

const PLANT_TRAITS = [
  { key: 'plant', label: 'Plant', fields: fields(['type', 'Type'], ['lifeCycle', 'Life cycle'], ['habit', 'Habit'], ['height', 'Height']) },
  { key: 'grow', label: 'Grow', fields: fields(['sunlight', 'Sunlight'], ['water', 'Water'], ['soil', 'Soil'], ['spacing', 'Spacing']) },
  { key: 'seed', label: 'Seed', fields: fields(['sowing', 'Sowing'], ['germinationTime', 'Germination time'], ['germinationRate', 'Germination rate'], ['grownFrom', 'Grown from']) },
  { key: 'leaf', label: 'Leaf', fields: fields(['style', 'Style'], ['arrangement', 'Arrangement'], ['foliage', 'Leaf fall'], ['thorn', 'Thorn'], ['length', 'Length'], ['width', 'Width']) },
  { key: 'flower', label: 'Flower', fields: fields(['colour', 'Colour'], ['aroma', 'Aroma'], ['size', 'Size']) },
  { key: 'fruit', label: 'Fruit', fields: fields(['colour', 'Colour'], ['size', 'Size'], ['type', 'Type']) },
]
const TREE_TRAITS = [
  { ...PLANT_TRAITS[0], key: 'tree', label: 'Tree' },
  { ...PLANT_TRAITS[1], fields: fields(['planting', 'Planting'], ['sunlight', 'Sunlight'], ['water', 'Water'], ['soil', 'Soil'], ['spacing', 'Spacing']) },
  // Trees are planted, not sown: their seed card has no sowing row.
  { ...PLANT_TRAITS[2], fields: PLANT_TRAITS[2].fields.filter((f) => f.key !== 'sowing') },
  ...PLANT_TRAITS.slice(3),
]
const HABITS = { key: 'habits', label: 'Habits', fields: fields(['livesIn', 'Lives in'], ['feedsOn', 'Feeds on'], ['activeAt', 'Active at'], ['social', 'Social']) }
const body = (...list) => ({ key: 'body', label: 'Body', fields: fields(...list) })

const PLANT_NOTES = fields(['description', 'Description'], ['habitat', 'Habitat'], ['landscape', 'Landscape'], ['propagation', 'Propagation'], ['harvesting', 'Harvesting'], ['uses', 'Food uses'], ['medicinal', 'Medicinal uses'], ['pests', 'Pests'])
const CREATURE_NOTES = fields(['description', 'Description'], ['habitat', 'Habitat'], ['behaviour', 'Behaviour'], ['onCrops', 'On crops'], ['signs', 'Signs'], ['management', 'Management'])

const DIFFICULTY = { key: 'difficulty', label: 'Difficulty', placeholder: 'Easy / Medium / Hard', options: ['Easy', 'Medium', 'Hard'], toned: true }
const ROLE = { key: 'role', label: 'Role', placeholder: 'Pest / Beneficial', options: ['Pest', 'Beneficial'], toned: true }
const DIET = { key: 'diet', label: 'Diet', placeholder: 'e.g. Insects' }
const TO_PEOPLE = { key: 'toPeople', label: 'To people', placeholder: 'e.g. Harmless' }

const flora = { flora: true, seasonLabel: 'Fruiting season', landLabel: 'Land type', notes: PLANT_NOTES }
const fauna = { flora: false, seasonLabel: 'Active season', landLabel: 'Found in', notes: CREATURE_NOTES, lifeCycle: true }

export const KINDS = {
  plants: { ...flora, route: 'plants', kind: 'plant', label: 'Plants', one: 'plant', ta: 'செடிகள்', Icon: Sprout, traits: PLANT_TRAITS,
    stats: [{ key: 'harvest', label: 'Harvest', range: 'days' }, DIFFICULTY] },
  trees: { ...flora, route: 'trees', kind: 'tree', label: 'Trees', one: 'tree', ta: 'மரங்கள்', Icon: TreeIcon, traits: TREE_TRAITS,
    stats: [{ key: 'firstFruit', label: 'First fruit', placeholder: 'e.g. 3–5 years' }, DIFFICULTY] },
  insects: { ...fauna, route: 'insects', kind: 'insect', label: 'Insects', one: 'insect', ta: 'பூச்சிகள்', Icon: Bug,
    traits: [body(['order', 'Order'], ['size', 'Size'], ['colour', 'Colour'], ['wings', 'Wings']), HABITS],
    stats: [ROLE, { key: 'eggToAdult', label: 'Egg to adult', placeholder: 'e.g. 3–4 weeks' }, TO_PEOPLE] },
  birds: { ...fauna, route: 'birds', kind: 'bird', label: 'Birds', one: 'bird', ta: 'பறவைகள்', Icon: Bird,
    traits: [body(['order', 'Order'], ['size', 'Size'], ['colour', 'Colour'], ['call', 'Call']), HABITS],
    stats: [ROLE, DIET, TO_PEOPLE] },
  animals: { ...fauna, route: 'animals', kind: 'animal', label: 'Animals', one: 'animal', ta: 'விலங்குகள்', Icon: PawPrint,
    traits: [body(['class', 'Class'], ['size', 'Size'], ['colour', 'Colour'], ['lifespan', 'Lifespan']), HABITS],
    stats: [ROLE, DIET, TO_PEOPLE] },
}

// A stat as display text: choices are translated, day ranges read as "60–80 days".
export function statText(stat, item, t) {
  const value = item[stat.key]
  if (stat.range) {
    const { min = null, max = null } = value || {}
    if (min === null && max === null) return ''
    return t('{n} days', { n: min !== null && max !== null && min !== max ? `${min}–${max}` : (min ?? max) })
  }
  return stat.options && value ? t(value) : value
}

export const ROUTE_OF = Object.fromEntries(Object.values(KINDS).map((k) => [k.kind, k.route]))
export const KIND_OF = Object.fromEntries(Object.values(KINDS).map((k) => [k.kind, k]))

// The site's two halves. Each lists its kinds in one table, narrowed by a chip per kind (`?kind=plants`).
export const GROUPS = {
  flora: { route: 'flora', label: 'Flora', ta: 'தாவரங்கள்', Icon: Sprout, kinds: ['plants', 'trees'] },
  fauna: { route: 'fauna', label: 'Fauna', ta: 'விலங்கினங்கள்', Icon: PawPrint, kinds: ['insects', 'birds', 'animals'] },
}
for (const g of Object.values(GROUPS)) for (const route of g.kinds) Object.assign(KINDS[route], { group: g.route, list: `/${g.route}?kind=${route}` })

// The four places in the nav. `match` says which paths light each one up.
export const NAV = [
  { to: '/', label: 'Home', ta: 'முகப்பு', Icon: House, match: (path) => path === '/' },
  { to: '/articles', label: 'Articles', ta: 'கட்டுரைகள்', Icon: Newspaper, match: (path) => path.startsWith('/articles') },
  ...Object.values(GROUPS).map((g) => ({ to: `/${g.route}`, label: g.label, ta: g.ta, Icon: g.Icon, match: (path) => [g.route, ...g.kinds].includes(path.split('/')[1]) })),
]

// What every kind in a group has in common, so "All" can share one set of filters and columns:
// the stats, trait cards and rows each kind has (matched by key).
export function sharedCfg(group) {
  const [first, ...rest] = group.kinds.map((r) => KINDS[r])
  const inAll = (find) => (x) => rest.every((k) => find(k, x))
  const traits = first.traits
    .filter(inAll((k, t) => k.traits.some((u) => u.key === t.key)))
    .map((t) => ({ ...t, fields: t.fields.filter(inAll((k, f) => k.traits.find((u) => u.key === t.key).fields.some((g) => g.key === f.key))) }))
    .filter((t) => t.fields.length)
  return {
    ...first,
    route: group.route,
    label: group.label,
    ta: group.ta,
    stats: first.stats.filter(inAll((k, s) => k.stats.some((u) => u.key === s.key))),
    traits,
    notes: first.notes.filter(inAll((k, n) => k.notes.some((u) => u.key === n.key))),
  }
}
