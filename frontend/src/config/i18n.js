import { useMemo } from 'react'
import { useApp } from '../store/useApp'
import { KINDS } from './kinds'
import { LANDS, SEASONS } from './seasons'

// Tamil for every fixed label on the site, keyed by its English text. Anything missing stays in English.
// `{name}` marks a value filled in when the label is used.
const TA = {
  'Tharcharbu Puthagam': 'தற்சார்பு புத்தகம்',
  'Tamil or English': 'தமிழ் அல்லது ஆங்கிலம்',
  'Light or dark': 'வெளிச்சம் அல்லது இருள்',
  'Loading…': 'ஏற்றுகிறது…',
  'Not found.': 'கிடைக்கவில்லை.',
  Untitled: 'பெயரிடப்படாதது',

  // Sections and kinds
  ...Object.fromEntries(Object.values(KINDS).map((k) => [k.label, k.ta])),
  plant: 'தாவரம்',
  tree: 'மரம்',
  insect: 'பூச்சி',
  bird: 'பறவை',
  animal: 'விலங்கு',
  '{label} — all': '{label} அனைத்தும்',
  'New {one}': 'புதிய {one}',
  '{n} {label}': '{n} {label}',
  ' · {n} drafts (drafts are visible to editors only)': ' · {n} வரைவுகள் (ஆசிரியர்கள் மட்டுமே பார்க்க முடியும்)',

  // Detail page
  Names: 'பெயர்கள்',
  'Other names': 'மற்ற பெயர்கள்',
  Overview: 'கண்ணோட்டம்',
  Traits: 'பண்புகள்',
  About: 'விவரம்',
  Links: 'தொடர்புகள்',
  'In depth': 'விரிவாக',
  Edit: 'திருத்து',
  Clone: 'நகலெடு',
  Draft: 'வரைவு',
  Published: 'வெளியிடப்பட்டது',

  // Seasons and lands
  Season: 'பருவம்',
  'Fruiting season': 'காய்க்கும் பருவம்',
  'Active season': 'செயல்படும் பருவம்',
  Land: 'திணை',
  'Found in': 'காணப்படும் திணை',
  'Perum Pozhudhu': 'பெரும்பொழுது',
  Ainthinai: 'ஐந்திணை',
  ...Object.fromEntries([...SEASONS, ...LANDS].flatMap((o) => [[o.name, o.ta], [o.sub, o.subTa]])),

  // Stats and their values
  Harvest: 'அறுவடை',
  '{n} days': '{n} நாட்கள்',
  'Under 60 days': '60 நாட்களுக்குள்',
  '60–90 days': '60–90 நாட்கள்',
  '90–120 days': '90–120 நாட்கள்',
  'Over 120 days': '120 நாட்களுக்கு மேல்',
  'First fruit': 'முதல் காய்ப்பு',
  Difficulty: 'வளர்ப்பு',
  Role: 'பங்கு',
  'Egg to adult': 'முட்டை முதல் முதிர்வு வரை',
  Diet: 'உணவு',
  'To people': 'மனிதருக்கு',
  Easy: 'எளிது',
  Medium: 'நடுத்தரம்',
  Hard: 'கடினம்',
  Pest: 'தீங்குயிரி',
  Beneficial: 'நன்மை செய்வது',

  // Trait groups and fields
  Plant: 'செடி',
  Tree: 'மரம்',
  Grow: 'வளர்ப்பு',
  Seed: 'விதை',
  Leaf: 'இலை',
  Flower: 'பூ',
  'Flower colour': 'பூ நிறம்',
  Fruit: 'கனி',
  Body: 'உடல்',
  Habits: 'பழக்கங்கள்',
  Type: 'வகை',
  'Life cycle': 'வாழ்க்கைச் சுழற்சி',
  Habit: 'வளரியல்பு',
  Height: 'உயரம்',
  Sowing: 'விதைப்பு',
  Planting: 'நடவு',
  Sunlight: 'வெயில்',
  Water: 'நீர்',
  Soil: 'மண்',
  Spacing: 'இடைவெளி',
  'Germination time': 'முளைப்புக் காலம்',
  'Germination rate': 'முளைப்புத் திறன்',
  'Grown from': 'வளர்ப்பு முறை',
  Style: 'அமைப்பு',
  Arrangement: 'அடுக்கமைவு',
  Thorn: 'முள்',
  Length: 'நீளம்',
  Width: 'அகலம்',
  Colour: 'நிறம்',
  Aroma: 'மணம்',
  Size: 'அளவு',
  Order: 'வரிசை',
  Wings: 'இறக்கைகள்',
  Call: 'குரல்',
  Class: 'வகுப்பு',
  Lifespan: 'ஆயுள்',
  'Lives in': 'வசிப்பிடம்',
  'Feeds on': 'உண்பது',
  'Active at': 'செயல்படும் நேரம்',
  Social: 'கூட்டு வாழ்க்கை',

  // Notes
  Description: 'விளக்கம்',
  Habitat: 'வாழிடம்',
  Landscape: 'நிலவமைப்பில்',
  Propagation: 'பயிர்ப்பெருக்கம்',
  Harvesting: 'அறுவடை முறை',
  'Food uses': 'உணவுப் பயன்கள்',
  'Medicinal uses': 'மருத்துவப் பயன்கள்',
  Pests: 'பூச்சிகள்',
  Behaviour: 'நடத்தை',
  'On crops': 'பயிர்களில்',
  Signs: 'அறிகுறிகள்',
  Management: 'மேலாண்மை',

  // Key strip
  'At a glance': 'ஒரு பார்வையில்',
  'Leaf type': 'இலை வகை',
  'Leaf arrangement': 'இலை அடுக்கமைவு',
  Evergreen: 'பசுமைமாறா',
  Deciduous: 'இலையுதிர்',
  Brevideciduous: 'குறுகிய இலையுதிர்',
  Annual: 'ஓராண்டு',
  Simple: 'தனி இலை',
  Lobed: 'மடல் இலை',
  Pinnate: 'சிறகுக் கூட்டிலை',
  Digitate: 'கைவடிவக் கூட்டிலை',
  Palm: 'பனை இலை',
  Alternate: 'மாற்றடுக்கு',
  Opposite: 'எதிரடுக்கு',
  Decussate: 'குறுக்கெதிரடுக்கு',
  Spiral: 'சுழல் அடுக்கு',
  Whorled: 'வட்ட அடுக்கு',

  // Links
  Harms: 'தீங்கு செய்கிறது',
  'Harmed by': 'தீங்கு செய்பவை',
  Helps: 'உதவுகிறது',
  'Helped by': 'உதவுபவை',
  'Nothing linked yet.': 'இன்னும் தொடர்பு இல்லை.',
  '+ {n} more →': '+ இன்னும் {n} →',

  // List page
  Name: 'பெயர்',
  Family: 'குடும்பம்',
  'Scientific name': 'அறிவியல் பெயர்',
  Status: 'நிலை',
  Main: 'முதன்மை',
  Columns: 'நெடுவரிசைகள்',
  'Name is always shown.': 'பெயர் எப்போதும் காட்டப்படும்.',
  'Search name, Tamil name, family…': 'பெயர், தமிழ்ப் பெயர், குடும்பம் தேடுக…',
  Clear: 'நீக்கு',
  'More filters': 'மேலும் வடிகட்டிகள்',
  'Showing {n} of {total}': '{total} இல் {n} காட்டப்படுகிறது',
}

export const translate = (lang, text, vars = {}) =>
  Object.entries(vars).reduce((s, [k, v]) => s.replaceAll(`{${k}}`, v), (lang === 'ta' && TA[text]) || text)

// `t('Sowing')` gives the label in the chosen language; `t.ta` says whether that is Tamil.
export function useT() {
  const lang = useApp((s) => s.lang)
  return useMemo(() => Object.assign((text, vars) => translate(lang, text, vars), { ta: lang === 'ta' }), [lang])
}
