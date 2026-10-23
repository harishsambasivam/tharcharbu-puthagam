import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, Plus } from 'lucide-react'
import Page from '../../layout/Page'
import { Card, Kicker, Photo, cx } from '../../components/ui'
import { useLists } from '../../api/queries'
import { useAdmin, useDisplayName, useLocalize, useSubName } from '../../store/useApp'
import { GROUPS, KINDS, KIND_OF, ROUTE_OF } from '../../config/kinds'
import { seasonOn } from '../../config/seasons'
import { useT } from '../../config/i18n'
import { ArticleCard, useArticles } from '../articles/parts'
import { MonthCalendar, SowNow, TodayCard } from './Almanac'

// The front page, laid out like a newsletter: the almanac (today in the Tamil calendar, the month, what to sow),
// the latest articles, what is in season now, and the way into flora and fauna.
export default function HomePage() {
  const t = useT()
  const admin = useAdmin()
  const { articles, isLoading } = useArticles()
  const [lead, ...more] = articles
  const season = seasonOn()

  return (
    <Page>
      <main className="mx-auto max-w-[1240px] px-4 pb-20 md:px-10">
        <section className="grid gap-3 border-b border-line py-6 md:grid-cols-[minmax(0,1fr)_minmax(0,2.35fr)] md:py-8">
          <TodayCard />
          <MonthCalendar />
          <SowNow className="md:col-span-2" />
        </section>

        {/* With nothing written yet, articles take one line rather than an empty page of space. */}
        {!lead ? (
          <section className={cx('flex flex-wrap items-center justify-between gap-3 border-b border-line py-5', isLoading && 'opacity-0')}>
            <p className="flex items-baseline gap-3">
              <Kicker>{t('Articles')}</Kicker>
              <span className="font-serif text-[18px] text-ink-2">{t('No articles yet.')}</span>
            </p>
            {admin && (
              <Link to="/articles/new" className="inline-flex items-center gap-2 rounded-[4px] bg-ink px-4 py-2 text-[14px] font-semibold text-paper">
                <Plus className="size-4" /> {t('Write the first article')}
              </Link>
            )}
          </section>
        ) : (
          <section className="grid gap-10 border-b border-line py-8 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)] md:gap-12 md:py-10">
            <div>
              <Kicker className="mb-3">{t('Latest')}</Kicker>
              <ArticleCard article={lead} size="lg" />
            </div>
            <aside className="md:border-l md:border-line md:pl-12">
              <Kicker>{t('More articles')}</Kicker>
              {more.length ? (
                <ul className="divide-y divide-line">
                  {more.slice(0, 5).map((a) => (
                    <li key={a.id} className="py-4">
                      <ArticleCard article={a} size="sm" />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="mt-3 text-[14px] text-ink-2">{t('More will appear here as they are written.')}</p>
              )}
              <Link to="/articles" className="mt-2 inline-flex items-center gap-1 text-[14px] font-semibold text-moss underline underline-offset-2">
                {t('All articles')} <ArrowRight className="size-4" />
              </Link>
            </aside>
          </section>
        )}

        <InSeason season={season} />
        <Sections />
      </main>
    </Page>
  )
}

const ALL_KINDS = Object.keys(KINDS)

// Flora and fauna marked for this season, in a row that scrolls sideways.
function InSeason({ season }) {
  const t = useT()
  const localize = useLocalize()
  const displayName = useDisplayName()
  const subName = useSubName()
  const { data } = useLists(ALL_KINDS)
  const items = useMemo(() => data.filter((i) => i.seasons?.includes(season.id)).map(localize), [data, season, localize])
  const { Icon } = season

  return (
    <section className="border-b border-line py-8 md:py-10">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-4">
          <span className={cx('grid size-14 shrink-0 place-items-center rounded-md text-onlime', season.tone)}>
            <Icon className="size-7" strokeWidth={1.3} />
          </span>
          <div>
            <Kicker>{t('In season now')}</Kicker>
            <h2 className="mt-1 font-serif text-[28px] leading-none md:text-[34px] ta:text-[24px]">
              {t.ta ? season.ta : season.name} <span className="text-[18px] text-ink-2 md:text-[20px]">{t.ta ? season.subTa : `${season.en} · ${season.sub}`}</span>
            </h2>
          </div>
        </div>
        <span className="font-mono text-[12px] text-ink-2">{items.length}</span>
      </div>
      {items.length ? (
        <div className="-mx-4 mt-5 flex snap-x scroll-px-4 gap-3 overflow-x-auto px-4 pb-2 md:-mx-1 md:px-1">
          {items.map((i) => (
            <Link key={`${i.kind}/${i.id}`} to={`/${ROUTE_OF[i.kind]}/${i.id}`} className="group w-40 shrink-0 snap-start md:w-48">
              <Photo photo={i.photos?.[0]} className="aspect-square w-full rounded-md border border-line" />
              <div className="mt-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-2 ta:tracking-normal">{t(KIND_OF[i.kind].one)}</div>
              <div className="truncate text-[15px] font-semibold group-hover:underline group-hover:underline-offset-2">{displayName(i)}</div>
              <div className="truncate text-[13px] text-ink-2">{subName(i)}</div>
            </Link>
          ))}
        </div>
      ) : (
        <p className="mt-4 text-[14px] text-ink-2">{t('Nothing is marked for this season yet.')}</p>
      )}
    </section>
  )
}

// The way into the two halves of the book.
function Sections() {
  const t = useT()
  const { data } = useLists(ALL_KINDS)
  return (
    <section className="grid gap-3 pt-8 md:grid-cols-2 md:pt-10">
      {Object.values(GROUPS).map((g) => {
        const { Icon } = g
        const count = data.filter((i) => g.kinds.includes(ROUTE_OF[i.kind])).length
        return (
          <Link key={g.route} to={`/${g.route}`} className="group">
            <Card className="flex h-full items-start gap-5 p-5 transition group-hover:border-ink-3 md:p-7">
              <span className="grid size-12 shrink-0 place-items-center rounded-full bg-lime text-onlime">
                <Icon className="size-6" strokeWidth={1.6} />
              </span>
              <div className="min-w-0 flex-1">
                <h2 className="font-serif text-[30px] leading-none md:text-[36px] ta:text-[26px]">
                  {t.ta ? g.ta : g.label} <span className="text-[18px] text-ink-2">{t.ta ? g.label : g.ta}</span>
                </h2>
                <p className="mt-2 text-[14px] text-ink-2">
                  {g.kinds.map((r) => t(KINDS[r].label)).join(' · ')} <span className="font-mono text-[12px]">· {count}</span>
                </p>
              </div>
              <ArrowRight className="mt-2 size-5 shrink-0 text-ink-2 transition group-hover:translate-x-0.5 group-hover:text-ink" />
            </Card>
          </Link>
        )
      })}
    </section>
  )
}
