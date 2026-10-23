import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight, Sprout } from 'lucide-react'
import { Card, Kicker, Photo, RoundButton, cx } from '../../components/ui'
import { useLists } from '../../api/queries'
import { useApp, useDisplayName, useSubName } from '../../store/useApp'
import { ROUTE_OF } from '../../config/kinds'
import { seasonOn } from '../../config/seasons'
import { useT } from '../../config/i18n'
import { ObservanceIcon, hasObservanceIcon } from '../../components/Icons'
import {
  WEEKDAYS, days, indiaDay, monthsIn, nextFestivals, nextMoons, pakshaName, starName, tMonthName, thithiName, today, weekdayName, yearName,
} from '../../config/calendar'

const DAY = 86400_000
const G_MONTHS = { en: 'en-GB', ta: 'ta-IN' }
const gMonthName = (d, lang, style = 'long') => new Date(Date.UTC(d.year, d.month, 15)).toLocaleDateString(G_MONTHS[lang], { month: style, timeZone: 'UTC' })

// An observance's mark: its icon, or a dot for one without.
const Mark = ({ observance, className = 'size-5' }) =>
  hasObservanceIcon(observance[2]) ? <ObservanceIcon name={observance[2]} className={cx('shrink-0', className)} /> : <span className="size-1.5 shrink-0 rounded-full bg-current" />

// "in 3 days", "tomorrow", "today".
function useIn() {
  const t = useT()
  return (n) => (n === 0 ? t('today') : n === 1 ? t('tomorrow') : t('in {n} days', { n }))
}

// The moon as it looks on a day: lit on the right while waxing, on the left while waning.
export function MoonIcon({ elongation, className }) {
  const r = 10
  const waxing = elongation < 180
  const phase = waxing ? elongation : 360 - elongation
  const rx = Math.abs(Math.cos(phase * (Math.PI / 180))) * r
  const crescent = phase < 90
  const lit = waxing ? `M0,-${r} A${r},${r} 0 0,1 0,${r} A${rx},${r} 0 0,${crescent ? 0 : 1} 0,-${r}` : `M0,-${r} A${r},${r} 0 0,0 0,${r} A${rx},${r} 0 0,${crescent ? 1 : 0} 0,-${r}`
  return (
    <svg viewBox="-11 -11 22 22" className={className} aria-hidden>
      <circle r={r} className="fill-ink/12 stroke-ink/40" strokeWidth="0.8" />
      {phase > 3 && <path d={lit} className="fill-[#f4e6a6] stroke-ink/40" strokeWidth="0.8" />}
    </svg>
  )
}

// Today in both calendars, the moon, the star, and what is coming up.
export function TodayCard({ className }) {
  const t = useT()
  const lang = useApp((s) => s.lang)
  const inDays = useIn()
  const d = useMemo(today, [])
  const moons = useMemo(() => nextMoons(), [])
  const festivals = useMemo(() => nextFestivals(4), [])
  const season = seasonOn()
  const tamil = `${tMonthName(d.tMonth, t.ta)} ${d.tDay}`
  const english = `${d.date} ${gMonthName(d, lang)} ${d.year}`

  return (
    <Card className={cx('flex flex-col p-5', className)}>
      <Kicker>{t('Today')}</Kicker>
      <div className="mt-3 font-serif text-[34px] leading-none tracking-tight ta:text-[28px]">{t.ta ? tamil : english}</div>
      <div className="mt-2 text-[14px] text-ink-2">
        {weekdayName(d.weekday, t.ta)} · {t.ta ? english : tamil} · {t('{name} year', { name: yearName(d, t.ta) })}
      </div>

      <div className="mt-5 flex items-center gap-3 border-t border-dashed border-line pt-4">
        <MoonIcon elongation={d.elongation} className="size-10 shrink-0" />
        <div className="min-w-0 text-[14px] leading-snug">
          <div className="font-semibold">
            {pakshaName(d.waxing, t.ta)} · {thithiName(d.thithi, t.ta)}
          </div>
          <div className="text-ink-2">
            {t('Star')}: {starName(d.star, t.ta)}
          </div>
          {d.observances.map((o) => (
            <div key={o[0]} className="flex items-center gap-1.5 font-semibold text-moss">
              <Mark observance={o} />
              {o[t.ta ? 1 : 0]}
            </div>
          ))}
        </div>
      </div>

      <dl className="mt-4 grid grid-cols-[auto_1fr] gap-x-4 gap-y-1.5 border-t border-dashed border-line pt-4 text-[14px]">
        <dt className="text-ink-2">{thithiName(15, t.ta)}</dt>
        <dd>{inDays(moons.full)}</dd>
        <dt className="text-ink-2">{thithiName(30, t.ta)}</dt>
        <dd>{inDays(moons.new)}</dd>
        <dt className="text-ink-2">{t('Season')}</dt>
        <dd>{t.ta ? season.ta : `${season.name} · ${season.en}`}</dd>
      </dl>

      {festivals.length > 0 && (
        <div className="mt-4 border-t border-dashed border-line pt-4">
          <Kicker>{t('Coming up')}</Kicker>
          <ul className="mt-2 space-y-1.5 text-[14px]">
            {festivals.map((f) => (
              <li key={`${f.day.day}${f.name[0]}`} className="flex items-baseline gap-2">
                <span className="size-1.5 shrink-0 translate-y-[-2px] rounded-full bg-[#c9952b]" />
                <span className="min-w-0 flex-1 truncate font-semibold">{f.name[t.ta ? 1 : 0]}</span>
                <span className="shrink-0 text-[13px] text-ink-2">
                  {t.ta ? `${tMonthName(f.day.tMonth, true)} ${f.day.tDay}` : `${f.day.date} ${gMonthName(f.day, lang, 'short')}`} · {inDays(f.in)}
                </span>
              </li>
            ))}
          </ul>
        </div>
      )}
    </Card>
  )
}

// A month on a grid: the Tamil month when reading in Tamil, the English month otherwise, each day carrying the
// other calendar's date, the full and new moons and the festivals.
export function MonthCalendar({ className }) {
  const t = useT()
  const lang = useApp((s) => s.lang)
  const [offset, setOffset] = useState(0)
  const now = indiaDay()
  const month = useMemo(() => (t.ta ? tamilMonth(now, offset) : englishMonth(now, offset)), [t.ta, now, offset])
  const first = month[0]
  const title = t.ta ? `${tMonthName(first.tMonth, true)} · ${yearName(first, true)}` : `${gMonthName(first, lang)} ${first.year}`
  const notable = month.filter((d) => d.festivals.length || d.observances.length || d.thithi === 15 || d.thithi === 30)
  // Festivals, observances and the full or new moon on a day, in the reader's language.
  const names = (d) =>
    [...d.festivals, ...d.observances].map((f) => f[t.ta ? 1 : 0]).concat((d.thithi === 15 || d.thithi === 30) && thithiName(d.thithi, t.ta)).filter(Boolean).join(' · ')

  return (
    <Card className={cx('grid gap-x-6 gap-y-4 p-5 lg:grid-cols-[minmax(0,1fr)_19rem]', className)}>
      <div>
        <div className="flex items-center justify-between gap-2">
          <div>
            <Kicker>{t('Calendar')}</Kicker>
            <div className="mt-1 font-serif text-[22px] leading-tight ta:text-[19px]">{title}</div>
          </div>
          <div className="flex gap-1.5">
            <RoundButton onClick={() => setOffset(offset - 1)} title={t('Previous month')}>
              <ChevronLeft className="size-4" />
            </RoundButton>
            {offset !== 0 && (
              <button type="button" onClick={() => setOffset(0)} className="rounded-full border border-line px-2.5 text-[12px] hover:border-ink-3">
                {t('Today')}
              </button>
            )}
            <RoundButton onClick={() => setOffset(offset + 1)} title={t('Next month')}>
              <ChevronRight className="size-4" />
            </RoundButton>
          </div>
        </div>

        <div className="mt-4 grid grid-cols-7 text-center font-mono text-[10px] uppercase tracking-[0.1em] text-ink-3 ta:text-[11px] ta:tracking-normal">
          {WEEKDAYS.map((w, i) => (
            <div key={i} className="pb-1.5">
              {t.ta ? w[1].slice(0, 2) : w[0].slice(0, 3)}
            </div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-px overflow-hidden rounded-[4px] border border-line bg-line">
          {Array.from({ length: first.weekday }, (_, i) => (
            <div key={`blank${i}`} className="bg-paper" />
          ))}
          {month.map((d) => {
            const isToday = d.day === now
            const moon = d.thithi === 15 || d.thithi === 30
            const other = t.ta ? (d.date === 1 ? gMonthName(d, lang, 'short') : d.date) : d.tDay === 1 ? tMonthName(d.tMonth, false) : d.tDay
            return (
              <div
                key={d.day}
                title={names(d) || undefined}
                className={cx('relative flex min-h-14 flex-col px-1 py-1 md:min-h-16', isToday ? 'bg-lime text-onlime' : d.festivals.length ? 'bg-[#f6e7a8]/45' : 'bg-card')}
              >
                <span className={cx('text-[14px] leading-none', isToday && 'font-semibold')}>{t.ta ? d.tDay : d.date}</span>
                <span className={cx('mt-0.5 truncate text-[10px] leading-none', isToday ? 'text-onlime/70' : 'text-ink-3')}>{other}</span>
                {moon && <MoonIcon elongation={d.elongation} className="absolute bottom-1 right-1 size-4" />}
                {(d.festivals.length > 0 || d.observances.length > 0) && (
                  <span className={cx('absolute bottom-1 left-1 flex items-center gap-1', isToday ? 'text-onlime' : 'text-moss')}>
                    {d.festivals.length > 0 && <span className="size-1.5 rounded-full bg-[#c9952b]" />}
                    {d.observances.map((o) => (
                      <Mark key={o[0]} observance={o} />
                    ))}
                  </span>
                )}
              </div>
            )
          })}
        </div>
      </div>

      {/* Beside the grid on wide screens, under it otherwise. */}
      {notable.length > 0 && (
        <ul className="space-y-1.5 text-[13px] lg:border-l lg:border-dashed lg:border-line lg:pl-6 lg:pt-1">
          {notable.map((d) => (
            <li key={d.day} className="flex items-center gap-2">
              <span className="flex w-11 shrink-0 items-center gap-1 text-moss">
                {d.festivals.length > 0 && <span className="mx-[7px] size-1.5 rounded-full bg-[#c9952b]" />}
                {d.observances.map((o) => (
                  <Mark key={o[0]} observance={o} />
                ))}
                {!d.festivals.length && !d.observances.length && <MoonIcon elongation={d.elongation} className="m-0.5 size-4" />}
              </span>
              <span className="w-14 shrink-0 text-ink-2 ta:w-24">{t.ta ? `${tMonthName(d.tMonth, true)} ${d.tDay}` : `${d.date} ${gMonthName(d, lang, 'short')}`}</span>
              <span className="truncate" title={names(d)}>
                {names(d)}
              </span>
            </li>
          ))}
        </ul>
      )}
    </Card>
  )
}

function englishMonth(now, offset) {
  const g = new Date(now + 5.5 * 3600_000)
  const start = Date.UTC(g.getUTCFullYear(), g.getUTCMonth() + offset, 1) - 5.5 * 3600_000
  const length = new Date(Date.UTC(g.getUTCFullYear(), g.getUTCMonth() + offset + 1, 0)).getUTCDate()
  return days(start, length)
}

// The Tamil month `offset` months from the one `now` is in. Months run 29 to 32 days.
function tamilMonth(now, offset) {
  const probe = days(now + Math.round(offset * 30.44) * DAY, 1)[0]
  const list = days(probe.day - (probe.tDay - 1) * DAY, 32)
  return list.filter((d) => d.tMonth === probe.tMonth)
}

// Plants and trees whose sowing months include this Tamil month, from their seed card.
export function SowNow({ className }) {
  const t = useT()
  const displayName = useDisplayName()
  const subName = useSubName()
  const [all, setAll] = useState(false)
  const d = useMemo(today, [])
  const { data } = useLists(['plants', 'trees'])
  const list = useMemo(() => data.filter((i) => monthsIn(i.ta?.seed?.sowing || '').has(d.tMonth)), [data, d.tMonth])
  const shown = all ? list : list.slice(0, 6)
  const month = tMonthName(d.tMonth, t.ta)

  return (
    <Card className={cx('flex flex-col p-5', className)}>
      <div className="flex items-baseline justify-between gap-2">
        <Kicker className="flex items-center gap-2">
          <Sprout className="size-4" strokeWidth={1.8} />
          {t('Sow in {month}', { month })}
        </Kicker>
        <span className="font-mono text-[12px] text-ink-2">{list.length}</span>
      </div>
      {list.length ? (
        <ul className="mt-2 grid gap-x-6 sm:grid-cols-2 lg:grid-cols-3">
          {shown.map((i) => (
            <li key={`${i.kind}/${i.id}`} className="border-b border-line">
              <Link to={`/${ROUTE_OF[i.kind]}/${i.id}`} className="group flex items-center gap-3 py-2">
                <Photo photo={i.photos?.[0]} className="size-9 shrink-0 rounded-[3px]" />
                <span className="min-w-0">
                  <span className="block truncate text-[14px] font-semibold group-hover:underline group-hover:underline-offset-2">{displayName(i)}</span>
                  <span className="block truncate text-[12px] text-ink-2">{subName(i)}</span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-3 text-[14px] text-ink-2">{t('Nothing in the book is sown this month yet.')}</p>
      )}
      {list.length > 6 && (
        <button type="button" onClick={() => setAll(!all)} className="mt-2 self-start text-[13px] font-semibold text-moss underline underline-offset-2">
          {all ? t('Show fewer') : t('Show all {n}', { n: list.length })}
        </button>
      )}
    </Card>
  )
}
