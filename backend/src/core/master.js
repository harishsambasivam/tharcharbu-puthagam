import { z } from 'zod'
import { GetCommand, PutCommand, QueryCommand } from '@aws-sdk/lib-dynamodb'
import { db, table } from './db.js'
import { HttpError } from './http.js'

// Master lists: the fixed choices a trait row can be tagged with, so the list pages can filter on them.
// Which rows use which list is fixed here; the options themselves are edited by editors and stored
// under pk "master". These defaults fill any list not saved yet.
//
// Each option is [id, English, Tamil, aliases]. Aliases are extra words (English or Tamil) that mean the
// option when tags are worked out from an item's text; the English and Tamil labels count too.
const opt = ([id, en, ta, aliases = []], extra) => ({ id, en, ta, ...extra, aliases })

const COLOURS = [
  ['white', 'White', 'வெள்ளை', '#ffffff', ['வெண்']],
  ['cream', 'Cream', 'இளமஞ்சள்', '#f2e3a6', []],
  ['yellow', 'Yellow', 'மஞ்சள்', '#e9c72f', []],
  ['gold', 'Gold', 'பொன்', '#c9a227', ['golden']],
  ['orange', 'Orange', 'ஆரஞ்சு', '#e8833a', ['apricot', 'செம்மஞ்சள்']],
  ['red', 'Red', 'சிவப்பு', '#b8322a', ['crimson', 'scarlet', 'maroon', 'செஞ்சிவப்பு']],
  ['pink', 'Pink', 'இளஞ்சிவப்பு', '#e58fb1', ['magenta', 'rose']],
  ['purple', 'Purple', 'ஊதா', '#6b3fa0', ['violet']],
  ['lilac', 'Lilac', 'இளஊதா', '#b49ad6', ['lavender', 'mauve']],
  ['blue', 'Blue', 'நீலம்', '#3b6fb6', ['இளநீலம்', 'அடர்நீலம்']],
  ['green', 'Green', 'பச்சை', '#4f8a3c', ['olive']],
  ['brown', 'Brown', 'பழுப்பு', '#8a5a34', ['tan', 'tawny', 'straw', 'buff', 'வைக்கோல்']],
  ['grey', 'Grey', 'சாம்பல்', '#9a9a95', ['gray', 'silver']],
  ['black', 'Black', 'கருப்பு', '#222222', ['கரு']],
]

export const LISTS = [
  {
    key: 'plantType', label: 'Type', multi: true,
    fields: { plant: ['plant.type'], tree: ['tree.type'] },
    options: [
      ['vegetable', 'Vegetable', 'காய்கறி', ['gourd', 'pod vegetable']],
      ['leafy-green', 'Leafy green', 'கீரை', ['leafy']],
      ['fruit', 'Fruit', 'பழம்', ['fig']],
      ['herb', 'Herb', 'மூலிகை'],
      ['medicinal', 'Medicinal', 'மருத்துவம்'],
      ['spice', 'Spice', 'நறுமணப் பொருள்'],
      ['pulse', 'Pulse', 'பயறு'],
      ['cereal', 'Cereal', 'தானியம்', ['grain', 'millet']],
      ['oilseed', 'Oil', 'எண்ணெய்', ['oilseed']],
      ['flowering', 'Flowering', 'பூக்கும்', ['flower']],
      ['climber', 'Climber', 'கொடி', ['vine', 'creeping', 'trailing']],
      ['shrub', 'Shrub', 'புதர்ச்செடி'],
      ['grass', 'Grass', 'புல்'],
      ['palm', 'Palm', 'பனை வகை'],
      ['shade', 'Shade', 'நிழல்'],
      ['timber', 'Timber', 'மரக்கட்டை'],
      ['fodder', 'Fodder', 'தீவனம்', ['fuel']],
      ['green-manure', 'Green manure', 'பசுந்தாள் உரம்'],
      ['useful', 'Dye or fibre', 'சாயம் / நார்', ['dye', 'fibre', 'soapnut']],
      ['sacred', 'Sacred', 'புனிதம்'],
    ],
  },
  {
    key: 'lifeCycle', label: 'Life cycle', multi: true,
    fields: { plant: ['plant.lifeCycle'], tree: ['tree.lifeCycle'] },
    options: [
      ['annual', 'Annual', 'ஓராண்டு'],
      ['biennial', 'Biennial', 'ஈராண்டு'],
      ['short-lived', 'Short-lived perennial', 'குறுகிய பல்லாண்டு', ['short-lived']],
      ['perennial', 'Perennial', 'பல்லாண்டு'],
    ],
  },
  {
    key: 'habit', label: 'Habit', multi: true,
    fields: { plant: ['plant.habit'], tree: ['tree.habit'] },
    options: [
      ['upright', 'Upright', 'நிமிர்ந்த', ['erect', 'straight', 'tall', 'நேரான']],
      ['bushy', 'Bushy', 'புதர்', ['bush', 'shrub', 'undershrub', 'branched']],
      ['spreading', 'Spreading', 'பரந்த', ['sprawling', 'wide', 'runners', 'open']],
      ['climbing', 'Climbing', 'ஏறும் கொடி', ['climber', 'climbing', 'vine', 'twining', 'tendril', 'scrambling', 'கொடி']],
      ['trailing', 'Trailing', 'தரையில் படரும்', ['creeping', 'படரும்']],
      ['clump', 'Clumping', 'குத்து', ['clump', 'clumping', 'rosette']],
      ['rounded', 'Rounded crown', 'உருண்டை', ['rounded', 'crown', 'umbrella', 'dense']],
      ['single', 'Single stem', 'ஒற்றைத் தண்டு', ['single', 'unbranched', 'trunk']],
    ],
  },
  {
    key: 'sunlight', label: 'Sunlight', multi: true,
    fields: { plant: ['grow.sunlight'], tree: ['grow.sunlight'] },
    options: [
      ['full-sun', 'Full sun', 'முழு வெயில்', ['sun']],
      ['part-shade', 'Part shade', 'பகுதி நிழல்', ['partial shade', 'light shade', 'semi-shade']],
      ['shade', 'Shade', 'நிழல்', ['full shade']],
    ],
  },
  {
    key: 'water', label: 'Water', multi: true,
    fields: { plant: ['grow.water'], tree: ['grow.water'] },
    options: [
      ['low', 'Low', 'குறைவு', ['drought', 'very low']],
      ['moderate', 'Moderate', 'மிதமாக', ['medium', 'regular']],
      ['high', 'High', 'அதிகம்', ['damp', 'wet', 'plenty']],
    ],
  },
  {
    key: 'soil', label: 'Soil', multi: true,
    fields: { plant: ['grow.soil'], tree: ['grow.soil'] },
    options: [
      ['well-drained', 'Well-drained', 'வடிகால்', ['drained']],
      ['loam', 'Loam', 'வண்டல்', ['loamy', 'alluvial']],
      ['sandy', 'Sandy', 'மணல்', ['sand']],
      ['red', 'Red soil', 'செம்மண்', ['red']],
      ['black', 'Black soil', 'கரிசல்', ['black']],
      ['clay', 'Clay', 'களிமண்'],
      ['rocky', 'Rocky', 'பாறை', ['rock']],
      ['saline', 'Saline', 'உப்பு', ['salt', 'coastal', 'கடற்கரை']],
      ['rich', 'Rich', 'வளமான', ['fertile', 'compost', 'மக்கிய உரம்']],
      ['any', 'Any soil', 'எந்த மண்', ['any']],
    ],
  },
  {
    key: 'germinationRate', label: 'Germination rate',
    fields: { plant: ['seed.germinationRate'], tree: ['seed.germinationRate'] },
    options: [
      ['high', 'High', 'அதிகம்'],
      ['medium', 'Medium', 'நடுத்தரம்'],
      ['low', 'Low', 'குறைவு'],
    ],
  },
  {
    key: 'grownFrom', label: 'Grown from', multi: true,
    fields: { plant: ['seed.grownFrom'], tree: ['seed.grownFrom'] },
    options: [
      ['seed', 'Seed', 'விதை', ['nut']],
      ['cuttings', 'Cuttings', 'தண்டுத் துண்டுகள்', ['cutting', 'stake']],
      ['grafting', 'Grafting', 'ஒட்டுக் கன்று', ['graft', 'budding', 'budded']],
      ['layering', 'Layering', 'பதியம்', ['layer']],
      ['rhizome', 'Rhizome or tuber', 'கிழங்கு', ['rhizome', 'tuber', 'corm', 'bulb']],
      ['suckers', 'Suckers', 'பக்கக் கன்றுகள்', ['sucker', 'slip', 'offset', 'plantlet']],
      ['division', 'Division', 'தூர் பிரித்தல்', ['clump']],
    ],
  },
  {
    key: 'leafStyle', label: 'Leaf style',
    fields: { plant: ['leaf.style'], tree: ['leaf.style'] },
    options: [
      ['simple', 'Simple', 'தனி இலை'],
      ['lobed', 'Lobed', 'மடல் இலை', ['lobe']],
      ['pinnate', 'Pinnate', 'சிறகுக் கூட்டிலை', ['pinnately', 'tripinnate', 'bipinnate']],
      ['digitate', 'Palmate', 'அங்கைக் கூட்டிலை', ['palmate', 'digitate', 'trifoliate', 'three leaflets']],
      ['palm', 'Palm fronds', 'ஓலை', ['frond', 'fan-shaped']],
    ],
  },
  {
    key: 'foliage', label: 'Leaf fall',
    fields: { plant: ['leaf.foliage'], tree: ['leaf.foliage'] },
    options: [
      ['evergreen', 'Evergreen', 'பசுமைமாறா', ['ever-green']],
      ['deciduous', 'Deciduous', 'இலையுதிர்', ['sheds its leaves', 'leafless']],
      ['brevideciduous', 'Briefly deciduous', 'சிறிது காலம் இலையுதிர்', ['brevideciduous', 'briefly']],
    ],
  },
  {
    key: 'arrangement', label: 'Leaf arrangement',
    fields: { plant: ['leaf.arrangement'], tree: ['leaf.arrangement'] },
    options: [
      ['alternate', 'Alternate', 'மாற்றடுக்கு'],
      ['opposite', 'Opposite', 'எதிரடுக்கு'],
      ['decussate', 'Decussate', 'குறுக்கெதிரடுக்கு'],
      ['spiral', 'Spiral', 'சுழல் அடுக்கு'],
      ['whorled', 'Whorled', 'வட்ட அடுக்கு', ['whorl']],
      ['rosette', 'Rosette', 'இலை வட்டம்'],
    ],
  },
  {
    key: 'thorns', label: 'Thorns',
    fields: { plant: ['leaf.thorn'], tree: ['leaf.thorn'] },
    options: [
      ['none', 'No thorns', 'முள் இல்லை', ['none']],
      ['thorny', 'Thorny', 'முள்ளுள்ளது', ['thorn', 'spine', 'spiny', 'prickle', 'hooked', 'முள்']],
    ],
  },
  {
    key: 'colour', label: 'Colour', multi: true, colour: true,
    fields: { plant: ['flower.colour', 'fruit.colour'], tree: ['flower.colour', 'fruit.colour'], insect: ['body.colour'], bird: ['body.colour'], animal: ['body.colour'] },
    options: COLOURS.map(([id, en, ta, hex, aliases]) => [id, en, ta, aliases, hex]),
  },
  {
    key: 'aroma', label: 'Aroma',
    fields: { plant: ['flower.aroma'], tree: ['flower.aroma'] },
    options: [
      ['none', 'None', 'இல்லை'],
      ['mild', 'Mild', 'லேசான மணம்', ['aromatic', 'faint']],
      ['fragrant', 'Fragrant', 'நறுமணம்', ['sweet', 'fruity', 'honey', 'scented']],
      ['strong', 'Strongly fragrant', 'அதிக நறுமணம்', ['very fragrant', 'intensely fragrant', 'strong smell']],
    ],
  },
  {
    key: 'fruitType', label: 'Fruit type',
    fields: { plant: ['fruit.type'], tree: ['fruit.type'] },
    options: [
      ['berry', 'Berry', 'சதைக்கனி', ['berries']],
      ['drupe', 'Drupe', 'உள்ளோட்டுக் கனி'],
      ['pod', 'Pod', 'நெற்று', ['legume']],
      ['capsule', 'Capsule', 'வெடிகனி', ['boll']],
      ['nut', 'Nut or nutlet', 'கொட்டை', ['nutlet']],
      ['achene', 'Achene', 'உலர் ஒற்றை விதைக் கனி', ['utricle', 'schizocarp']],
      ['grain', 'Grain', 'தானியக் கனி', ['caryopsis']],
      ['pepo', 'Gourd (pepo)', 'பூசணி வகைக் கனி', ['pepo']],
      ['pome', 'Pome', 'ஆப்பிள் வகைக் கனி'],
      ['citrus', 'Citrus (hesperidium)', 'எலுமிச்சை வகைக் கனி', ['hesperidium']],
      ['follicle', 'Follicle', 'ஒருபுற வெடிகனி'],
      ['multiple', 'Multiple or aggregate', 'கூட்டுக் கனி', ['multiple', 'aggregate', 'syconium', 'fig', 'balausta', 'hip']],
    ],
  },
  {
    key: 'insectOrder', label: 'Order',
    fields: { insect: ['body.order'] },
    options: [
      ['coleoptera', 'Beetles · Coleoptera', 'வண்டுகள்', ['coleoptera']],
      ['hemiptera', 'True bugs · Hemiptera', 'நாவாய்ப் பூச்சிகள்', ['hemiptera']],
      ['diptera', 'Flies · Diptera', 'ஈக்கள்', ['diptera']],
      ['lepidoptera', 'Butterflies and moths · Lepidoptera', 'வண்ணத்துப்பூச்சிகள், அந்துப்பூச்சிகள்', ['lepidoptera']],
      ['hymenoptera', 'Bees, wasps and ants · Hymenoptera', 'தேனீ, குளவி, எறும்பு', ['hymenoptera']],
      ['orthoptera', 'Grasshoppers · Orthoptera', 'வெட்டுக்கிளிகள்', ['orthoptera']],
      ['odonata', 'Dragonflies · Odonata', 'தட்டான்கள்', ['odonata']],
      ['blattodea', 'Termites and cockroaches · Blattodea', 'கறையான், கரப்பான்', ['blattodea', 'isoptera']],
      ['mantodea', 'Mantises · Mantodea', 'கும்பிடுபூச்சிகள்', ['mantodea']],
      ['neuroptera', 'Lacewings · Neuroptera', 'பச்சை இறகுப் பூச்சிகள்', ['neuroptera']],
    ],
  },
  {
    key: 'birdOrder', label: 'Order',
    fields: { bird: ['body.order'] },
    options: [
      ['passeriformes', 'Perching birds · Passeriformes', 'பாடும் பறவைகள்', ['passeriformes']],
      ['psittaciformes', 'Parrots · Psittaciformes', 'கிளிகள்', ['psittaciformes']],
      ['pelecaniformes', 'Herons and egrets · Pelecaniformes', 'கொக்குகள், நாரைகள்', ['pelecaniformes']],
      ['accipitriformes', 'Hawks and eagles · Accipitriformes', 'பருந்துகள், கழுகுகள்', ['accipitriformes']],
      ['strigiformes', 'Owls · Strigiformes', 'ஆந்தைகள்', ['strigiformes']],
      ['columbiformes', 'Pigeons and doves · Columbiformes', 'புறாக்கள்', ['columbiformes']],
      ['coraciiformes', 'Kingfishers and rollers · Coraciiformes', 'மீன்கொத்திகள்', ['coraciiformes']],
      ['piciformes', 'Woodpeckers and barbets · Piciformes', 'மரங்கொத்திகள்', ['piciformes']],
      ['cuculiformes', 'Cuckoos · Cuculiformes', 'குயில்கள்', ['cuculiformes']],
      ['galliformes', 'Fowl and peafowl · Galliformes', 'கோழி, மயில்', ['galliformes']],
    ],
  },
  {
    key: 'animalClass', label: 'Class',
    fields: { animal: ['body.class'] },
    options: [
      ['mammal', 'Mammal', 'பாலூட்டி', ['mammalia']],
      ['bird', 'Bird', 'பறவை', ['aves']],
      ['reptile', 'Reptile', 'ஊர்வன', ['reptilia']],
      ['amphibian', 'Amphibian', 'இருவாழ்வி', ['amphibia']],
      ['gastropod', 'Snail or slug', 'நத்தை', ['gastropod']],
      ['annelid', 'Earthworm', 'மண்புழு', ['clitellata', 'annelid']],
      ['arachnid', 'Spider or mite', 'சிலந்தி', ['arachnid']],
    ],
  },
  {
    key: 'activeAt', label: 'Active at', multi: true,
    fields: { insect: ['habits.activeAt'], bird: ['habits.activeAt'], animal: ['habits.activeAt'] },
    options: [
      ['day', 'Day', 'பகல்'],
      ['night', 'Night', 'இரவு'],
      ['dusk', 'Dawn and dusk', 'விடியல், அந்தி', ['dusk', 'dawn', 'twilight']],
      ['rain', 'Rainy days', 'மழை நாட்கள்', ['rain']],
    ],
  },
  {
    key: 'social', label: 'Social', multi: true,
    fields: { insect: ['habits.social'], bird: ['habits.social'], animal: ['habits.social'] },
    options: [
      ['solitary', 'Solitary', 'தனித்து', ['alone']],
      ['pairs', 'Pairs', 'இணையாக', ['pair']],
      ['groups', 'Groups', 'கூட்டமாக', ['group', 'flock', 'herd', 'many', 'together', 'gathers']],
      ['colony', 'Colony', 'குடியிருப்பு', ['colonies', 'roost']],
    ],
  },
  {
    key: 'diet', label: 'Feeds on', multi: true,
    fields: { insect: ['habits.feedsOn'], bird: ['habits.feedsOn'], animal: ['habits.feedsOn'] },
    options: [
      ['sap', 'Plant sap', 'சாறு', ['sap']],
      ['leaves', 'Leaves', 'இலைகள்', ['leaf', 'frond', 'shoot', 'bud', 'seedling', 'foliage']],
      ['wood', 'Stems and wood', 'தண்டு, மரம்', ['trunk', 'wood', 'bark', 'stem']],
      ['roots', 'Roots', 'வேர்கள்', ['root']],
      ['flowers', 'Flowers', 'பூக்கள்', ['flower']],
      ['nectar', 'Nectar', 'தேன்'],
      ['fruit', 'Fruit', 'பழம்'],
      ['seeds', 'Seeds and grain', 'விதை, தானியம்', ['seed', 'grain']],
      ['grass', 'Grass and fodder', 'புல், தீவனம்', ['straw', 'fodder']],
      ['insects', 'Insects', 'பூச்சிகள்', ['insect', 'aphid', 'mealybug', 'scale', 'moth', 'bee', 'grasshopper', 'cricket', 'tick']],
      ['animals', 'Small animals', 'சிறு உயிரினங்கள்', ['frog', 'snail', 'small animal', 'rodent', 'lizard']],
      ['decay', 'Decaying matter', 'மக்கும் பொருள்', ['decay', 'rotting', 'organic matter', 'dung', 'manure']],
    ],
  },
].map((l) => ({ ...l, multi: !!l.multi, colour: !!l.colour, options: l.options.map(([id, en, ta, aliases, hex]) => opt([id, en, ta, aliases], hex && { hex })) }))

const LIST = new Map(LISTS.map((l) => [l.key, l]))

// What editors save for one list. Ids stay fixed once made, so renaming an option keeps every item tagged with it.
const OptionModel = z.object({
  id: z.string().regex(/^[a-z0-9-]{1,40}$/, 'Ids are lower-case letters, digits and dashes'),
  en: z.string().trim().min(1, 'Every option needs an English name').max(60),
  ta: z.string().trim().max(60).default(''),
  hex: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  aliases: z.array(z.string().trim().max(40)).max(20).default([]),
})
const OptionsModel = z
  .array(OptionModel)
  .max(60)
  .refine((list) => new Set(list.map((o) => o.id)).size === list.length, 'Two options have the same id')

const strip = ({ key, label, multi, colour, fields }) => ({ key, label, multi, colour, fields })

// Every list with its options: saved ones from the table, defaults for the rest.
export async function getLists() {
  const saved = await db.send(new QueryCommand({ TableName: table(), KeyConditionExpression: 'pk = :k', ExpressionAttributeValues: { ':k': 'master' } }))
  const byKey = new Map(saved.Items.map((i) => [i.sk, i.options]))
  return LISTS.map((l) => ({ ...strip(l), options: byKey.get(l.key) || l.options }))
}

export async function getList(key) {
  const list = LIST.get(key)
  if (!list) throw new HttpError(404, 'No such list')
  const saved = await db.send(new GetCommand({ TableName: table(), Key: { pk: 'master', sk: key } }))
  return { ...strip(list), options: saved.Item?.options || list.options }
}

export async function saveList(key, options) {
  const list = LIST.get(key)
  if (!list) throw new HttpError(404, 'No such list')
  const parsed = OptionsModel.parse(options).map(({ hex, ...o }) => (list.colour ? { ...o, hex: hex || '#9a9a95' } : o))
  await db.send(new PutCommand({ TableName: table(), Item: { pk: 'master', sk: key, options: parsed, updatedAt: new Date().toISOString() } }))
  return { ...strip(list), options: parsed }
}

// ---- Working tags out from text, for the seed and the one-off migration ----

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// The options a phrase mentions, in the order it mentions them. Where one term contains another
// ("strongly fragrant" holds "fragrant"), the longer match wins.
export function optionsIn(text, options) {
  const lower = String(text || '').toLowerCase()
  if (!lower.trim()) return []
  const terms = options
    .flatMap((o) => [o.en, o.ta, ...(o.aliases || [])].filter(Boolean).map((term) => ({ term: term.toLowerCase(), id: o.id })))
    .sort((a, b) => b.term.length - a.term.length)
  const taken = []
  for (const { term, id } of terms) {
    // English words match from a word start ("cutting" finds "cuttings"); Tamil matches anywhere.
    const re = new RegExp(/^[a-z]/.test(term) ? `\\b${escape(term)}` : escape(term), 'g')
    for (const m of lower.matchAll(re)) {
      const span = [m.index, m.index + term.length]
      if (!taken.some((t) => span[0] < t.span[1] && t.span[0] < span[1])) taken.push({ span, id })
    }
  }
  return [...new Set(taken.sort((a, b) => a.span[0] - b.span[0]).map((t) => t.id))]
}

// Old key-strip values carried over: which lists each key.* value may tag. key.habit held both life
// cycle ("annual") and leaf fall ("evergreen"); only the list that has the option takes it.
const KEY_STRIP = { habit: ['lifeCycle', 'foliage'], leafType: ['leafStyle'], arrangement: ['arrangement'] }

// Tags for one item of `kind`, from its English and Tamil text and any old key strip. Rows that already
// have tags keep them unless `overwrite`.
export function tagsFor(kind, data, lists, { overwrite = false } = {}) {
  const tags = { ...(overwrite ? {} : data.tags) }
  for (const list of lists) {
    for (const path of list.fields[kind] || []) {
      if (tags[path]?.length) continue
      const [group, field] = path.split('.')
      // The English decides; the Tamil only when the English names nothing, as it often says a little more.
      let ids = optionsIn(data.en?.[group]?.[field], list.options)
      if (!ids.length) ids = optionsIn(data.ta?.[group]?.[field], list.options)
      const keyed = Object.entries(KEY_STRIP).find(([, keys]) => keys.includes(list.key))?.[0]
      if (keyed && data.key?.[keyed] && !ids.includes(data.key[keyed])) ids = [data.key[keyed], ...ids]
      if (path === 'flower.colour' && !ids.length && data.key?.flowerName) ids = optionsIn(data.key.flowerName, list.options)
      ids = ids.filter((id) => list.options.some((o) => o.id === id))
      if (ids.length) tags[path] = list.multi ? ids : ids.slice(0, 1)
    }
  }
  return tags
}
