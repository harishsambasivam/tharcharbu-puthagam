import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ROUTE_OF } from '../config/kinds'
import { Card, Photo, cx } from './ui'
import { useT } from '../config/i18n'
import { resolveLinks, useCatalog } from '../api/queries'

export const RELS = [
  { key: 'harms', title: 'Harms', tone: 'rose' },
  { key: 'harmedBy', title: 'Harmed by', tone: 'rose' },
  { key: 'helps', title: 'Helps', tone: 'lime' },
  { key: 'helpedBy', title: 'Helped by', tone: 'lime' },
]

export const LinkHeader = ({ rel, count, big }) => (
  <LinkTitle rel={rel} count={count} big={big} />
)

function LinkTitle({ rel, count, big }) {
  const t = useT()
  return (
  <div className={cx('flex items-center gap-2.5 border-b border-line', 'pb-3')}>
    <span className={cx('size-2.5 rounded-full', rel.tone === 'rose' ? 'bg-rose' : 'bg-lime')} />
    <span className={cx('font-semibold', big ? 'text-[17px]' : 'text-[14px]')}>{t(rel.title)}</span>
    {count !== undefined && <span className={cx('ml-auto font-mono text-ink-2', big ? 'text-[13px]' : 'text-[11px]')}>{count}</span>}
  </div>
  )
}

export function LinksBoard({ links = {}, big }) {
  const catalog = useCatalog()
  return (
    <div className={cx('grid gap-3', big ? 'grid-cols-1' : 'grid-cols-4')}>
      {RELS.map((rel) => (
        <LinkCard key={rel.key} rel={rel} list={resolveLinks(catalog, links[rel.key])} big={big} />
      ))}
    </div>
  )
}

function LinkCard({ rel, list, big }) {
  const t = useT()
  const [all, setAll] = useState(false)
  const shown = all ? list : list.slice(0, 3)
  return (
    <Card className={big ? 'px-5 py-4' : 'min-h-56 px-4 py-4'}>
      <LinkHeader rel={rel} count={list.length} big={big} />
      {!list.length && <p className={cx('pt-3 text-ink-2', big ? 'text-[15px]' : 'text-[13px]')}>{t('Nothing linked yet.')}</p>}
      {shown.map((l) => (
        <div key={`${l.kind}/${l.id}`} className={cx('flex items-center gap-3 border-b border-line last:border-b-0', big ? 'gap-4 py-3.5' : 'py-3')}>
          <Photo photo={{ key: l.photo }} className={cx('shrink-0 rounded-[3px]', big ? 'size-12' : 'size-8')} />
          <div className="min-w-0 flex-1">
            <span className={cx('block font-mono uppercase tracking-[0.2em] text-ink-2 ta:tracking-normal', big ? 'text-[11px]' : 'text-[10px]')}>{t(l.kind)}</span>
            <div className={cx('mt-0.5', big ? 'text-[16px]' : 'text-[13px]')}>
              <Link to={`/${ROUTE_OF[l.kind]}/${l.id}`} className="font-semibold text-moss underline underline-offset-2">
                {l.name}
              </Link>{' '}
              {l.names?.ta}
            </div>
          </div>
        </div>
      ))}
      {list.length > 3 && !all && (
        <button type="button" onClick={() => setAll(true)} className={cx('mt-3 font-medium text-moss underline underline-offset-2', big ? 'text-[14px]' : 'text-[12px]')}>
          {t('+ {n} more →', { n: list.length - 3 })}
        </button>
      )}
    </Card>
  )
}
