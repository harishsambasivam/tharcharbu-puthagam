import { useMemo, useState } from 'react'
import { useList } from '../../api/queries'
import { useKind } from '../../hooks/useKind'
import { useIsMobile } from '../../hooks/useIsMobile'
import { useAdmin, useLocalize } from '../../store/useApp'
import { applyFilters, filtersFor } from './table'
import { useOptionLabel, useTagLists } from '../../config/master'
import ListDesktop from './ListDesktop'
import ListMobile from './ListMobile'

export default function ListPage() {
  const cfg = useKind()
  const admin = useAdmin()
  const isMobile = useIsMobile()
  const localize = useLocalize()
  const { data: raw, isLoading } = useList(cfg.route)
  const data = useMemo(() => (raw || []).map(localize), [raw, localize])
  const [q, setQ] = useState('')
  const [filters, setFilters] = useState({})
  const lists = useTagLists(cfg.kind)
  const label = useOptionLabel()
  const defs = useMemo(() => filtersFor(cfg, admin, lists, label), [cfg, admin, lists, label])
  const items = useMemo(() => applyFilters(data, defs, q, filters), [data, defs, q, filters])

  const Screen = isMobile ? ListMobile : ListDesktop
  return <Screen {...{ cfg, data, items, isLoading, q, setQ, filters, setFilters, defs }} />
}
