import {
  Apple, ArrowDownToLine, ArrowUp, Axe, Ban, Blocks, Bean, Carrot, Cherry, Citrus, Cloud, CloudRain, CloudSun, Droplet, Droplets, Flower2, Footprints, GitMerge, Grape, Grip, Hexagon, Infinity, Layers, Leaf,
  Milk, Mountain, Moon, MoveHorizontal, Palette, Pill as PillIcon, Recycle, Salad, Shrub, Spline, TreeDeciduous, TreePalm, Umbrella, Flame, Flower, Nut, Scissors, ShieldCheck, SignalHigh, SignalLow, SignalMedium, Sparkles, Split, Sprout, Sun, Sunset, TriangleAlert, User, Users, UsersRound, Waves, Wheat, Wind,
} from 'lucide-react'
import { FlowerIcon, KeyIcon, TreeIcon, hasKeyIcon } from './Icons'
import { Card, cx } from './ui'
import { useT } from '../config/i18n'
import { optionsIn, tagged, useOptionLabel, useTagLists } from '../config/master'

export function TraitCard({ title, icon: Icon, big, className, action, children }) {
  return (
    <Card className={cx(big ? 'p-6' : 'p-5', className)}>
      <div className="flex items-center justify-between gap-3 border-b border-line pb-2.5">
        <div className="flex items-center gap-2 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-moss ta:text-[13px] ta:font-semibold ta:tracking-normal">
          {Icon && <Icon className="size-4" strokeWidth={1.8} />}
          {title}
        </div>
        {action}
      </div>
      <dl
        className={cx(
          'mt-1 grid min-w-0 grid-cols-[fit-content(40%)_minmax(0,1fr)] content-start items-baseline gap-x-5 [&>*]:border-b [&>*]:border-dashed [&>*]:border-line [&>*:nth-last-child(-n+2)]:border-0',
          big ? 'text-[17px] [&>*]:py-3' : 'text-[14px] [&>*]:py-2',
        )}
      >
        {children}
      </dl>
    </Card>
  )
}

export const TraitRow = ({ label, children }) => (
  <>
    <dt className="min-w-0 text-ink-2 [overflow-wrap:break-word]">{label}</dt>
    <dd className="min-w-0 [overflow-wrap:anywhere]">{children}</dd>
  </>
)

// Header icons per trait group; the body card uses the section's own icon.
const GROUP_ICONS = { plant: Sprout, tree: TreeIcon, grow: Sun, seed: Bean, leaf: Leaf, flower: Flower2, fruit: Cherry, habits: Footprints }
// Lists whose choices have their own drawn icon (see Icons.jsx); those rows show as a lime pill with it.
const KEY_LISTS = ['lifeCycle', 'leafStyle', 'arrangement']
// Every other list with pictures: the pill's colour, and an icon per option (`*` for any option not named).
const PICTURE_LISTS = {
  plantType: {
    tone: 'bg-[#d5e6c7]',
    icons: {
      vegetable: Carrot, 'leafy-green': Salad, fruit: Apple, herb: Leaf, medicinal: PillIcon, spice: Flame, pulse: Bean, cereal: Wheat, oilseed: Droplet,
      flowering: Flower, climber: Spline, shrub: Shrub, grass: Sprout, palm: TreePalm, shade: Umbrella, timber: Axe, fodder: Milk,
      'green-manure': Recycle, useful: Palette, sacred: Sparkles,
    },
  },
  habit: {
    tone: 'bg-[#dde5d3]',
    icons: { upright: ArrowUp, bushy: Shrub, spreading: MoveHorizontal, climbing: Spline, trailing: Waves, clump: Grip, rounded: TreeDeciduous, single: ArrowUp },
  },
  sunlight: { tone: 'bg-[#f6e7a8]', icons: { 'full-sun': Sun, 'part-shade': CloudSun, shade: Cloud } },
  water: { tone: 'bg-[#cfe1ee]', icons: { low: Droplet, moderate: Droplets, high: Waves } },
  soil: {
    tone: 'bg-[#efe1cc]',
    icons: { 'well-drained': ArrowDownToLine, loam: Layers, sandy: Grip, red: Dot('#a5462d'), black: Dot('#2b2622'), clay: Blocks, rocky: Mountain, saline: Waves, rich: Sprout, any: Infinity },
  },
  germinationRate: { tone: 'bg-[#dde5d3]', icons: { high: SignalHigh, medium: SignalMedium, low: SignalLow } },
  grownFrom: {
    tone: 'bg-[#efe1cc]',
    icons: { seed: Bean, cuttings: Scissors, grafting: GitMerge, layering: Layers, rhizome: Carrot, suckers: Sprout, division: Split },
  },
  aroma: { tone: 'bg-[#e9d7ec]', icons: { none: Ban, mild: Wind, fragrant: Sparkles, strong: Sparkles } },
  thorns: { tone: 'bg-[#dde5d3]', icons: { none: ShieldCheck, thorny: TriangleAlert }, tones: { thorny: 'bg-rose text-onrose' } },
  fruitType: { tone: 'bg-[#f3d9be]', icons: { berry: Grape, nut: Nut, grain: Wheat, citrus: Citrus, pome: Apple, '*': Cherry } },
  activeAt: { tone: 'bg-[#e3daf1]', icons: { day: Sun, night: Moon, dusk: Sunset, rain: CloudRain } },
  social: { tone: 'bg-[#d4eae2]', icons: { solitary: User, pairs: Users, groups: UsersRound, colony: Hexagon } },
}

// A soil colour as a small round swatch, standing in for an icon.
function Dot(hex) {
  return ({ className }) => (
    <span className={cx(className, 'grid place-items-center')}>
      <span className="size-2.5 rounded-full border border-ink/25" style={{ background: hex }} />
    </span>
  )
}

// A soft pill holding the row's icons and its full text.
const Pill = ({ tone = 'bg-lime', children }) => (
  <span className={cx('-my-0.5 inline-flex items-center gap-1.5 rounded-[4px] py-0.5 pl-1.5 pr-2 text-onlime', tone)}>{children}</span>
)

// "Purple, green or white" as one pill per colour, each part coloured by the tagged colours it names.
// Parts that name no colour ("spiny") stay plain text.
function ColourPills({ text, colours }) {
  const parts = text.split(/\s*(?:[,;]|\bor\b|அல்லது)\s*/).filter(Boolean)
  return (
    <span className="-my-0.5 inline-flex flex-wrap items-center gap-1.5">
      {parts.map((part, i) => {
        const swatches = optionsIn(part, colours)
        if (!swatches.length) return <span key={i} className="text-ink-2">{part}</span>
        return (
          <span key={i} className="inline-flex items-center gap-1.5 rounded-full border border-line py-0.5 pl-1.5 pr-2.5">
            <span className="flex shrink-0 -space-x-1">
              {swatches.map((o) => (
                <span key={o.id} className="size-3 rounded-full border border-ink/25" style={{ background: o.hex }} />
              ))}
            </span>
            {part}
          </span>
        )
      })}
    </span>
  )
}

// One row's value: its text, dressed up by the row's tags where they have a picture.
function TraitValue({ path, value, list, options, label }) {
  const text = value || options.map(label).join(', ')
  if (!text) return '—'
  if (path === 'flower.colour' && options.length)
    return (
      <span className="-my-0.5 inline-flex items-center gap-1.5 rounded-[4px] bg-lime py-0.5 pl-1.5 pr-2 text-onlime">
        <FlowerIcon colour={options.map((o) => o.hex)} className="size-5 shrink-0" />
        {text}
      </span>
    )
  if (list?.colour && options.length) return <ColourPills text={text} colours={options} />
  if (KEY_LISTS.includes(list?.key) && options.length)
    return (
      <Pill>
        {options.filter((o) => hasKeyIcon(o.id)).map((o) => <KeyIcon key={o.id} name={o.id} className="size-[18px] shrink-0" />)}
        {text}
      </Pill>
    )
  const pictures = PICTURE_LISTS[list?.key]
  if (pictures && options.length) {
    const icons = [...new Set(options.map((o) => pictures.icons[o.id] || pictures.icons['*']).filter(Boolean))].slice(0, 3)
    return (
      <Pill tone={pictures.tones?.[options[0].id] || pictures.tone}>
        {icons.map((Icon, i) => <Icon key={i} className="size-4 shrink-0" strokeWidth={1.8} />)}
        {text}
      </Pill>
    )
  }
  return text
}

export function TraitCards({ cfg, item, big }) {
  const t = useT()
  const lists = useTagLists(cfg.kind)
  const label = useOptionLabel()
  const row = (group, f) => {
    const path = `${group.key}.${f.key}`
    const list = lists.get(path)
    const value = item[group.key]?.[f.key]
    // Items saved before the master lists have no tags yet, so work them out from the text as the backend would.
    const options = tagged(item, path, list)
    return { path, list, value, options: options.length || !list ? options : optionsIn(value, list.options) }
  }
  const groups = cfg.traits.filter((g) => g.fields.some((f) => row(g, f).value || row(g, f).options.length))
  if (!groups.length) return null
  return (
    <div className={cx('grid gap-3', !big && (cfg.traits.length > 2 ? 'grid-cols-3' : 'grid-cols-2'))}>
      {groups.map((group) => (
        <TraitCard key={group.key} title={t(group.label)} icon={GROUP_ICONS[group.key] || cfg.Icon} big={big}>
          {group.fields.map((f) => (
            <TraitRow key={f.key} label={t(f.label)}>
              <TraitValue {...row(group, f)} label={label} />
            </TraitRow>
          ))}
        </TraitCard>
      ))}
    </div>
  )
}
