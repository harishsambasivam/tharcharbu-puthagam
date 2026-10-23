import { useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { useLists } from '../../api/queries'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useAdmin, useLocalize } from '../../store/useApp'
import { GROUPS, KINDS, sharedCfg } from '../../config/kinds'
import { applyFilters, filtersFor } from './table'
import { useOptionLabel, useTagLists } from '../../config/master'
import ListDesktop from './ListDesktop'
import ListMobile from './ListMobile'

// Flora or fauna: every kind in the group in one table. A kind chip (`?kind=trees`) narrows it to that kind,
// with that kind's own filters and columns; "All" keeps to what the kinds share.
export default function ListPage() {
  const group = GROUPS[useParams().route]
  const [params, setParams] = useSearchParams()
  const kind = group.kinds.includes(params.get('kind')) ? params.get('kind') : null
  const cfg = useMemo(() => (kind ? KINDS[kind] : sharedCfg(group)), [kind, group])
  const admin = useAdmin()
  const isMobile = useIsMobile()
  const localize = useLocalize()
  const { data: raw, isLoading } = useLists(kind ? [kind] : group.kinds)
  const data = useMemo(() => raw.map(localize), [raw, localize])
  const [q, setQ] = useState('')
  const [filters, setFilters] = useState({})
  const lists = useTagLists(KINDS[kind || group.kinds[0]].kind)
  const label = useOptionLabel()
  const defs = useMemo(() => filtersFor(cfg, admin, lists, label), [cfg, admin, lists, label])
  const items = useMemo(() => applyFilters(data, defs, q, filters), [data, defs, q, filters])
  // Filters belong to one kind's rows, so changing kind starts them afresh.
  const setKind = (next) => {
    setFilters({})
    setParams(next ? { kind: next } : {}, { replace: true })
  }

  const Screen = isMobile ? ListMobile : ListDesktop
  return <Screen {...{ group, kind, setKind, cfg, data, items, isLoading, q, setQ, filters, setFilters, defs }} />
}
