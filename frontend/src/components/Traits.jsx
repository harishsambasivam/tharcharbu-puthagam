import {
  Apple, ArrowDownToLine, ArrowUp, Axe, Ban, Blocks, Bean, Carrot, Cherry, Citrus, Cloud, CloudRain, CloudSun, Droplet, Droplets, Flower2, Footprints, GitMerge, Grape, Grip, Hexagon, Info, Infinity, Layers, Leaf,
  Milk, Mountain, Moon, MoveHorizontal, Palette, Pill as PillIcon, Recycle, Salad, Shrub, Spline, TreeDeciduous, TreePalm, Umbrella, Flame, Flower, Nut, Scissors, ShieldCheck, SignalHigh, SignalLow, SignalMedium, Sparkles, Split, Sprout, Sun, Sunset, TriangleAlert, User, Users, UsersRound, Waves, Wheat, Wind,
} from 'lucide-react'
import { FlowerIcon, KeyIcon, TreeIcon, hasKeyIcon } from './Icons'
import { Card, Popover, cx } from './ui'
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
          'mt-1 grid min-w-0 grid-cols-[fit-content(36%)_minmax(0,1fr)] content-start gap-x-4 leading-snug [&>*]:border-b [&>*]:border-dashed [&>*]:border-line [&>*:last-child]:border-0',
          big ? 'text-[15px] [&>*]:py-3' : 'text-[14px] [&>*]:py-2.5',
        )}
      >
        {children}
      </dl>
    </Card>
  )
}

// Each pair spans both columns on a subgrid, so label and value share one row and one rule.
export const TraitRow = ({ label, children }) => (
  <div className="col-span-2 grid grid-cols-subgrid items-baseline">
    <dt className="min-w-0 text-ink-2 [overflow-wrap:break-word]">{label}</dt>
    <dd className="min-w-0 [overflow-wrap:break-word]">{children}</dd>
  </div>
)

// Header icons per trait group; the body card uses the section's own icon.
const GROUP_ICONS = { plant: Sprout, tree: TreeIcon, grow: Sun, seed: Bean, leaf: Leaf, flower: Flower2, fruit: Cherry, habits: Footprints }
// Lists whose choices have their own drawn icon (see Icons.jsx); those rows show as a lime pill with it.
const KEY_LISTS = ['lifeCycle', 'foliage', 'leafStyle', 'arrangement']
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
          // Long parts wrap, so the pill keeps soft corners rather than turning into an oval, and the swatches sit by the first line.
          <span key={i} className="inline-flex items-start gap-1.5 rounded-[12px] border border-line py-0.5 pl-1.5 pr-2.5">
            <span className="flex h-[1lh] shrink-0 items-center -space-x-1">
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

// Whether a row's text says more than its chosen options: what is left once their names and aliases
// (and joining words like "or") are taken out.
function saysMore(text, options) {
  let rest = ` ${text.toLowerCase()} `
  const terms = options.flatMap((o) => [o.en, o.ta, ...(o.aliases || [])]).filter(Boolean).map((term) => term.toLowerCase())
  for (const term of terms.sort((a, b) => b.length - a.length)) rest = rest.split(term).join(' ')
  return /[\p{L}\p{N}]/u.test(rest.replace(/\b(or|and|with)\b|அல்லது|மற்றும்/g, ' '))
}

// One row's value: its text, dressed up by the row's tags where they have a picture.
function TraitValue({ path, value, list, options, label, big }) {
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
  const keyed = KEY_LISTS.includes(list?.key)
  const pictures = PICTURE_LISTS[list?.key]
  if (!options.length || (!keyed && !pictures)) return text
  // One chip per chosen option, named as the master list names it, like a multi-select. When the row's own
  // text says more than the chips do ("6+ hours", "with 3 nodes"), it follows in small type on mobile and
  // behind an info button on desktop.
  const chip = (o) => {
    const Icon = pictures && (pictures.icons[o.id] || pictures.icons['*'])
    return (
      <Pill key={o.id} tone={pictures && (pictures.tones?.[o.id] || pictures.tone)}>
        {keyed && hasKeyIcon(o.id) && <KeyIcon name={o.id} className="size-[18px] shrink-0" />}
        {Icon && <Icon className="size-4 shrink-0" strokeWidth={1.8} />}
        {label(o)}
      </Pill>
    )
  }
  const more = value && saysMore(value, options)
  if (big)
    return (
      <span className="-my-0.5 flex flex-col items-start gap-1">
        <span className="inline-flex flex-wrap gap-1.5">{options.map(chip)}</span>
        {more && <span className="text-[13px] leading-snug text-ink-3 ta:text-[13.5px]">{value}</span>}
      </span>
    )
  return (
    <span className="-my-0.5 inline-flex flex-wrap items-center gap-1.5">
      {options.map(chip)}
      {more && (
        <Popover
          align="right"
          className="w-max max-w-56 px-3 py-2 text-[13px] leading-snug text-ink-2"
          trigger={({ open, toggle }) => (
            <button type="button" onClick={toggle} aria-label={value} aria-expanded={open} className={cx('grid size-7 place-items-center rounded-full text-ink-3 hover:text-ink', open && 'text-ink')}>
              <Info className="size-4" strokeWidth={1.8} />
            </button>
          )}
        >
          {() => value}
        </Popover>
      )}
    </span>
  )
}

export function TraitCards({ cfg, item, big }) {
  const t = useT()
  const lists = useTagLists(cfg.kind)
  const label = useOptionLabel()
  const row = (group, f) => {
    const path = `${group.key}.${f.key}`
    const list = lists.get(path)
    return { path, list, value: item[group.key]?.[f.key], options: tagged(item, path, list) }
  }
  const groups = cfg.traits.filter((g) => g.fields.some((f) => row(g, f).value || row(g, f).options.length))
  if (!groups.length) return null
  return (
    <div className={cx('grid gap-3', !big && (cfg.traits.length > 2 ? 'grid-cols-3' : 'grid-cols-2'))}>
      {groups.map((group) => (
        <TraitCard key={group.key} title={t(group.label)} icon={GROUP_ICONS[group.key] || cfg.Icon} big={big}>
          {group.fields.map((f) => (
            <TraitRow key={f.key} label={t(f.label)}>
              <TraitValue {...row(group, f)} label={label} big={big} />
            </TraitRow>
          ))}
        </TraitCard>
      ))}
    </div>
  )
}
