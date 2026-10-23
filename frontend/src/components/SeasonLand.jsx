import { Check } from 'lucide-react'
import { LANDS, SEASONS } from '../config/seasons'
import { Kicker, Tag, cx } from './ui'
import { useT } from '../config/i18n'

// Selection grids for the six Tamil seasons and the five lands. Pass onToggle to make them editable.
export const SeasonGrid = (props) => <Grid {...props} options={SEASONS} cols="grid-cols-3" />
export const LandGrid = (props) => <Grid {...props} options={LANDS} cols="grid-cols-5" noCheck />

// Read-only grids show just the marked options (none marked, no grid); editable ones show all to pick from.
function Grid({ title, value = [], onToggle, options, cols, className, noCheck }) {
  const t = useT()
  const shown = onToggle ? options : options.filter((o) => value.includes(o.id))
  if (!shown.length) return null
  return (
    <div className={className}>
      <Kicker sub={onToggle && 'click to mark'}>{t(title)}</Kicker>
      <div className={cx('mt-2.5 grid gap-1.5', cols)}>
        {shown.map((o) => (
          <Tile key={o.id} option={o} on={value.includes(o.id)} check={!noCheck && onToggle} onClick={onToggle && (() => onToggle(o.id))} />
        ))}
      </div>
    </div>
  )
}

function Tile({ option: { name, en, ta, sub, subTa, Icon, tone }, on, check, onClick }) {
  const t = useT()
  const El = onClick ? 'button' : 'div'
  return (
    <El
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={cx('rounded-[4px] p-2.5 text-left short:p-2', on ? cx(tone, 'text-onlime') : cx('border border-dashed border-line text-ink opacity-40 grayscale', onClick && 'transition-opacity hover:opacity-80'))}
    >
      {!onClick && <Icon strokeWidth={1} className={cx('mb-1.5 size-6 short:mb-1 short:size-5 shorter:hidden', !on && 'text-ink-3')} />}
      <div className="flex items-center justify-between gap-1 text-[13px] font-semibold">
        {t.ta ? ta : name}
        {on && check && <Check className="size-3.5 shrink-0" />}
      </div>
      {!t.ta && en && <div className="text-[13px]">{en}</div>}
      <div className={cx('mt-0.5 text-[11px] leading-snug', on ? 'opacity-70' : 'text-ink-3')}>{t.ta ? subTa : sub}</div>
    </El>
  )
}

// `icons` shows every option as an icon, marked ones filled in, so rows line up in a table.
export function SeasonTags({ ids = [], kind = 'seasons', icons }) {
  const t = useT()
  const options = kind === 'seasons' ? SEASONS : LANDS
  if (!ids.length) return <span className="text-ink-3">—</span>
  if (icons)
    return (
      <div className="flex gap-1">
        {options.map(({ id, name, en, sub, ta, Icon, tone }) => {
          const on = ids.includes(id)
          return (
            <span key={id} className={cx('group/tip relative grid size-7 place-items-center rounded-[4px]', on ? cx(tone, 'text-onlime') : 'text-ink-3/40')}>
              <Icon className="size-4" strokeWidth={on ? 1.8 : 1.4} aria-label={on ? name : undefined} aria-hidden={!on} />
              <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-1.5 hidden -translate-x-1/2 whitespace-nowrap rounded-[4px] bg-ink px-2 py-1 text-[12px] leading-none text-paper shadow-md group-hover/tip:block">
                {t.ta ? ta : `${name} · ${en || sub}`}
              </span>
            </span>
          )
        })}
      </div>
    )
  return (
    <div className="flex flex-wrap gap-1.5">
      {options
        .filter((o) => ids.includes(o.id))
        .map((o) => (
          <Tag key={o.id} className={o.tone}>
            {t.ta ? o.ta : o.name}
          </Tag>
        ))}
    </div>
  )
}
