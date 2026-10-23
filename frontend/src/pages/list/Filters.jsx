import { Check, ChevronDown, Search, SlidersHorizontal } from 'lucide-react'
import { Kicker, Popover, cx } from '../../components/ui'
import { useT } from '../../config/i18n'
import { KINDS } from '../../config/kinds'

export function SearchBox({ value, onChange, className }) {
  const t = useT()
  return (
  <label className={cx('flex h-10 items-center gap-2.5 rounded-[4px] border border-line bg-card px-3.5', className)}>
    <Search className="size-4 text-ink-2" />
    <input
      value={value}
      onChange={(e) => onChange(e.target.value)}
      placeholder={t('Search name, Tamil name, family…')}
      className="min-w-0 flex-1 bg-transparent text-[15px] outline-none placeholder:text-ink-2"
    />
  </label>
  )
}

export function FilterMenu({ def, value, onChange }) {
  const t = useT()
  const current = def.options.find(([v]) => v === value)
  return (
    <Popover
      trigger={({ toggle }) => (
        <button
          type="button"
          onClick={toggle}
          className={cx(
            'flex h-10 shrink-0 items-center gap-2 rounded-full px-4 text-[15px] whitespace-nowrap',
            current ? 'bg-lime text-onlime' : 'border border-line text-ink',
          )}
        >
          {t(def.label)}
          {current && (
            <>
              {' '}
              : <b className="font-semibold">{t(current[1])}</b>
            </>
          )}
          <ChevronDown className="size-3.5" />
        </button>
      )}
    >
      {(close) => (
        <ul className="w-52 py-1.5">
          {def.options.map(([v, label]) => (
            <li key={v}>
              <button
                type="button"
                onClick={() => {
                  onChange(v === value ? undefined : v)
                  close()
                }}
                className="flex w-full items-center justify-between px-4 py-2 text-left text-[14px] hover:bg-paper"
              >
                {t(label)}
                {v === value && <Check className="size-4" />}
              </button>
            </li>
          ))}
        </ul>
      )}
    </Popover>
  )
}

// The trait filters (from master lists), grouped by card. Chosen ones also show as chips in the filter row.
export function MoreFilters({ defs, filters, setFilters }) {
  const t = useT()
  const more = defs.filter((d) => d.more)
  if (!more.length) return null
  const active = more.filter((d) => filters[d.key]).length
  const groups = [...new Set(more.map((d) => d.group))]
  const set = (key, v) => setFilters({ ...filters, [key]: filters[key] === v ? undefined : v })
  return (
    <Popover
      className="max-h-[70vh] w-[min(560px,calc(100vw-2rem))] overflow-y-auto"
      trigger={({ toggle }) => (
        <button
          type="button"
          onClick={toggle}
          className="flex h-10 shrink-0 items-center gap-2 rounded-full border border-dashed border-ink-3 px-4 text-[15px] whitespace-nowrap text-ink"
        >
          <SlidersHorizontal className="size-3.5" />
          {t('More filters')}
          {active > 0 && <span className="font-mono text-[12px]">{active}</span>}
        </button>
      )}
    >
      {() => (
        <div className="divide-y divide-line px-5 pb-2">
          {groups.map((g) => (
            <div key={g} className="py-4">
              <Kicker className="mb-2.5">{t(g)}</Kicker>
              {more
                .filter((d) => d.group === g)
                .map((d) => (
                  <div key={d.key} className="grid grid-cols-[7.5rem_1fr] items-baseline gap-3 py-1.5">
                    <span className="text-[13px] text-ink-2">{t(d.label)}</span>
                    <div className="flex flex-wrap gap-1.5">
                      {d.options.map(([v, label]) => (
                        <button
                          key={v}
                          type="button"
                          onClick={() => set(d.key, v)}
                          className={cx(
                            'flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[13px]',
                            filters[d.key] === v ? 'bg-lime text-onlime' : 'border border-line hover:border-ink-3',
                          )}
                        >
                          {d.swatch && <span className="size-2.5 rounded-full border border-ink/25" style={{ background: d.swatch[v] }} />}
                          {label}
                        </button>
                      ))}
                    </div>
                  </div>
                ))}
            </div>
          ))}
        </div>
      )}
    </Popover>
  )
}

// All / Plants / Trees: narrows a group's table to one kind.
export function KindChips({ group, kind, setKind, className }) {
  const t = useT()
  const chip = (value, label, Icon) => (
    <button
      key={value || 'all'}
      type="button"
      onClick={() => setKind(value)}
      aria-pressed={kind === value}
      className={cx(
        'flex h-10 shrink-0 items-center gap-2 rounded-[4px] px-4 text-[15px] whitespace-nowrap',
        kind === value ? 'bg-ink font-semibold text-paper' : 'border border-line bg-card text-ink hover:border-ink-3',
      )}
    >
      {Icon && <Icon className="size-4" strokeWidth={1.7} />}
      {t(label)}
    </button>
  )
  return (
    <div className={cx('flex gap-2', className)}>
      {chip(null, 'All')}
      {group.kinds.map((r) => chip(r, KINDS[r].label, KINDS[r].Icon))}
    </div>
  )
}
