import { SeasonTags } from '../../components/SeasonLand'
import { Tag } from '../../components/ui'
import { PILL_TONES } from '../../config/seasons'
import { useT } from '../../config/i18n'
import { statText } from '../../config/kinds'

export default function Cell({ col, item }) {
  const t = useT()
  const value = col.type === 'stat' ? statText(col.stat, item, t) : col.get(item)
  if (col.type === 'seasons' || col.type === 'lands') return <SeasonTags ids={value} kind={col.type} icons />
  if (!value) return <span className="text-ink-3">—</span>
  if (col.type === 'pill') return <Tag className={PILL_TONES[value]}>{t(value)}</Tag>
  if (col.type === 'italic') return <span className="font-serif text-[16px] italic">{value}</span>
  return value
}
