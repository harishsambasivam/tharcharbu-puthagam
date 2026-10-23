import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import MobileTabBar from '../../layout/MobileTabBar'
import { LangButton, ThemeButton } from '../../layout/HeaderButtons'
import { SeasonTags } from '../../components/SeasonLand'
import { Card, DraftBadge } from '../../components/ui'
import { useAdmin, useDisplayName } from '../../store/useApp'
import { FilterMenu, MoreFilters, SearchBox } from './Filters'
import { useT } from '../../config/i18n'

export default function ListMobile({ cfg, data, items, q, setQ, filters, setFilters, defs }) {
  const admin = useAdmin()
  const t = useT()
  const displayName = useDisplayName()
  return (
    <div className="min-h-screen pb-32">
      <header className="flex items-center justify-between px-4 pt-5">
        <h1 className="font-serif text-[34px] leading-none">
          {t.ta ? cfg.ta : cfg.label} <span className="text-[20px] text-ink-2">{t.ta ? cfg.label : cfg.ta}</span>
        </h1>
        <div className="flex gap-2">
          <LangButton className="size-11" />
          <ThemeButton className="size-11" />
        </div>
      </header>

      <div className="mt-5 px-4">
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
          <li key={item.id}>
            <Link to={`/${cfg.route}/${item.id}`}>
              <Card className="p-3">
                <div className="flex items-center gap-2 text-[17px] font-semibold">
                  {displayName(item)} {item.status === 'draft' && <DraftBadge />}
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
        <Link to={`/${cfg.route}/new`} className="fixed bottom-28 right-4 z-20 grid size-14 place-items-center rounded-full bg-ink text-paper shadow-lg" aria-label={`New ${cfg.one}`}>
          <Plus />
        </Link>
      )}
      <MobileTabBar />
    </div>
  )
}
