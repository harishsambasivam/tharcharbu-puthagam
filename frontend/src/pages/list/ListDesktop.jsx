import { useMemo } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { AlignLeft, CircleCheck, List, Plus } from 'lucide-react'
import DesktopHeader from '../../layout/DesktopHeader'
import { DraftBadge, cx } from '../../components/ui'
import { useAdmin, useApp, useDisplayName } from '../../store/useApp'
import { columnsFor, defaultColumns } from './table'
import { FilterMenu, MoreFilters, SearchBox } from './Filters'
import ColumnsMenu from './ColumnsMenu'
import Cell from './Cell'
import { useT } from '../../config/i18n'

const HEAD_ICON = { seasons: List, lands: List, pill: CircleCheck }

export default function ListDesktop({ cfg, data, items, isLoading, q, setQ, filters, setFilters, defs }) {
  const admin = useAdmin()
  const t = useT()
  const displayName = useDisplayName()
  const navigate = useNavigate()
  const saved = useApp((s) => s.columns[cfg.route])
  const setColumns = useApp((s) => s.setColumns)
  const columns = useMemo(() => columnsFor(cfg), [cfg])
  const visible = saved || defaultColumns(cfg)
  const shown = columns.filter((c) => visible.includes(c.id))
  const drafts = data.filter((i) => i.status === 'draft').length

  return (
    <>
      <DesktopHeader wide />
      <main className="px-20 pb-20 pt-12">
        <div className="flex items-end justify-between gap-6">
          <div>
            <h1 className="font-serif text-[46px] leading-none tracking-tight">
              {t.ta ? cfg.ta : cfg.label} <span className="text-[32px] text-ink-2">{t.ta ? cfg.label : cfg.ta}</span>
            </h1>
            <p className="mt-5 text-[15px] text-ink-2">
              {t.ta ? t('{n} {label}', { n: data.length, label: cfg.ta }) : `${data.length} ${data.length === 1 ? cfg.one : cfg.label.toLowerCase()}`}
              {admin && drafts > 0 && (t.ta ? t(' · {n} drafts (drafts are visible to editors only)', { n: drafts }) : ` · ${drafts} draft${drafts > 1 ? 's' : ''} (drafts are visible to editors only)`)}
            </p>
          </div>
          {admin && (
            <Link to={`/${cfg.route}/new`} className="flex items-center gap-2 rounded-[4px] bg-ink px-6 py-3 text-[15px] font-semibold text-paper">
              <Plus className="size-4" /> {t('New {one}', { one: t(cfg.one) })}
            </Link>
          )}
        </div>

        <div className="mt-8 flex items-center gap-2.5">
          <SearchBox value={q} onChange={setQ} className="w-[280px]" />
          {defs.filter((d) => !d.more || filters[d.key]).map((d) => (
            <FilterMenu key={d.key} def={d} value={filters[d.key]} onChange={(v) => setFilters({ ...filters, [d.key]: v })} />
          ))}
          <MoreFilters defs={defs} filters={filters} setFilters={setFilters} />
          {Object.values(filters).some(Boolean) && (
            <button type="button" onClick={() => setFilters({})} className="px-3 text-[15px] text-ink-2 hover:text-ink">
              {t('Clear')}
            </button>
          )}
          <div className="ml-auto">
            <ColumnsMenu columns={columns} visible={visible} onChange={(ids) => setColumns(cfg.route, ids)} />
          </div>
        </div>

        <div className="mt-4 overflow-x-auto border-t border-line">
          <table className="w-max min-w-full border-collapse text-left text-[15px]">
            <thead>
              <tr className="border-b border-line text-ink-2">
                <th className="sticky left-0 z-10 min-w-[250px] border-r border-line bg-paper px-4 py-3.5 font-medium">
                  <span className="mr-2 font-semibold">Aa</span>{t('Name')}
                </th>
                {shown.map((c) => {
                  const Icon = HEAD_ICON[c.type] || AlignLeft
                  return (
                    <th key={c.id} className="min-w-[150px] border-r border-line px-4 py-3.5 font-medium whitespace-nowrap last:border-r-0">
                      <Icon className="mr-2 inline size-4 align-[-3px]" strokeWidth={1.6} />
                      {t(c.label)}
                    </th>
                  )
                })}
              </tr>
            </thead>
            <tbody>
              {items.map((item) => (
                <tr key={item.id} onClick={() => navigate(`/${cfg.route}/${item.id}`)} className="group cursor-pointer border-b border-line">
                  <td className="sticky left-0 z-10 border-r border-line bg-paper px-4 py-3 group-hover:bg-card">
                    {/* A real link too, so the name can be opened in a new tab. */}
                    <Link to={`/${cfg.route}/${item.id}`} onClick={(e) => e.stopPropagation()} className="flex items-center gap-2 font-semibold">
                      {displayName(item)} {item.status === 'draft' && <DraftBadge />}
                    </Link>
                  </td>
                  {shown.map((c) => (
                    <td key={c.id} className="border-r border-line px-4 py-3 whitespace-nowrap group-hover:bg-card last:border-r-0">
                      <Cell col={c} item={item} />
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className={cx('px-4 py-4 text-[15px] text-ink-2', isLoading && 'opacity-0')}>
          {t('Showing {n} of {total}', { n: items.length, total: data.length })}
        </p>
      </main>
    </>
  )
}
