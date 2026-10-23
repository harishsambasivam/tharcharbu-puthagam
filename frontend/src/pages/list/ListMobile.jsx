import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import MobileTabBar from '../../layout/MobileTabBar'
import { LangButton, ThemeButton } from '../../layout/HeaderButtons'
import { SeasonTags } from '../../components/SeasonLand'
import { Card, DraftBadge } from '../../components/ui'
import { Logo } from '../../components/Icons'
import { useAdmin, useDisplayName } from '../../store/useApp'
import { FilterMenu, KindChips, MoreFilters, SearchBox } from './Filters'
import { useT } from '../../config/i18n'
import { KIND_OF, KINDS, ROUTE_OF } from '../../config/kinds'

export default function ListMobile({ group, kind, setKind, data, items, q, setQ, filters, setFilters, defs }) {
  const admin = useAdmin()
  const t = useT()
  const displayName = useDisplayName()
  return (
    <div className="min-h-screen pb-32">
      <header className="flex items-center justify-between px-4 pt-5">
        <Logo className="size-9 shrink-0 text-moss" />
        <div className="flex gap-2">
          <LangButton className="size-9" />
          <ThemeButton className="size-9" />
        </div>
      </header>
      <div className="px-4 pt-4">
        <h1 className="font-serif text-[34px] leading-none">
          {t.ta ? group.ta : group.label} <span className="text-[20px] text-ink-2">{t.ta ? group.label : group.ta}</span>
        </h1>
      </div>
      <KindChips group={group} kind={kind} setKind={setKind} className="no-scrollbar mt-5 overflow-x-auto px-4 [&>button]:h-9 [&>button]:px-3 [&>button]:text-[14px]" />

      <div className="mt-3 px-4">
        <SearchBox value={q} onChange={setQ} className="h-11" />
      </div>
      <div className="no-scrollbar mt-3 flex gap-2 overflow-x-auto px-4">
        {defs.filter((d) => !d.more || filters[d.key]).map((d) => (
          <FilterMenu key={d.key} def={d} value={filters[d.key]} onChange={(v) => setFilters({ ...filters, [d.key]: v })} />
        ))}
        <MoreFilters defs={defs} filters={filters} setFilters={setFilters} />
      </div>
      <p className="px-4 pt-4 pb-2 text-[13px] text-ink-2">
        {t('Showing {n} of {total}', { n: items.length, total: data.length })}
      </p>

      <ul className="space-y-2 px-4">
        {items.map((item) => (
          <li key={`${item.kind}/${item.id}`}>
            <Link to={`/${ROUTE_OF[item.kind]}/${item.id}`}>
              <Card className="p-3">
                <div className="flex items-center gap-2 text-[17px] font-semibold">
                  {displayName(item)} {item.status === 'draft' && <DraftBadge />}
                  {!kind && <span className="ml-auto font-mono text-[10px] font-normal uppercase tracking-[0.2em] text-ink-2 ta:tracking-normal">{t(KIND_OF[item.kind].one)}</span>}
                </div>
                <div className="mt-2">
                  <SeasonTags ids={item.seasons} icons />
                </div>
              </Card>
            </Link>
          </li>
        ))}
      </ul>

      {admin && (
        <Link to={`/${kind || group.kinds[0]}/new`} className="fixed bottom-28 right-4 z-20 grid size-14 place-items-center rounded-full bg-ink text-paper shadow-lg" aria-label={`New ${KINDS[kind || group.kinds[0]].one}`}>
          <Plus />
        </Link>
      )}
      <MobileTabBar />
    </div>
  )
}
