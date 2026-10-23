import { useMemo } from 'react'
import { useParams } from 'react-router-dom'
import { useLocalize } from '../../store/useApp'
import { useItem, useList } from '../../api/queries'
import { useKind } from '../../hooks/useKind'
import { useIsMobile } from '../../hooks/useIsMobile'
import { Loading } from '../../components/ui'
import { neighbours } from './parts'
import { useT } from '../../config/i18n'
import DetailDesktop from './DetailDesktop'
import DetailMobile from './DetailMobile'

export default function DetailPage() {
  const cfg = useKind()
  const { id } = useParams()
  const isMobile = useIsMobile()
  const localize = useLocalize()
  const t = useT()
  const { data, isLoading } = useItem(cfg.route, id)
  const item = useMemo(() => data && localize(data), [data, localize])
  const { data: list = [] } = useList(cfg.route)

  if (isLoading) return <Loading />
  if (!item) return <div className="grid min-h-[50vh] place-items-center text-ink-2">{t('Not found.')}</div>

  const Screen = isMobile ? DetailMobile : DetailDesktop
  return <Screen cfg={cfg} item={item} nav={neighbours(list, id)} />
}
