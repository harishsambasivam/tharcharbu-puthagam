import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight, ChevronRight, Handshake, X } from 'lucide-react'
import { ROUTE_OF } from '../config/kinds'
import { Card, Kicker, Modal, Photo, RoundButton, cx } from './ui'
import { useT } from '../config/i18n'
import { resolveLinks, useCatalog } from '../api/queries'

// The note on how two companions help each other, in the reader's language (English when no Tamil was written).
export const noteText = (note, ta) => (ta && note?.ta) || note?.en || ''

// Plants that grow well alongside this one, in a row that scrolls sideways. Each opens a dialog with how the two help each other.
export function Companions({ links = {}, big, className }) {
  const t = useT()
  const catalog = useCatalog()
  const [open, setOpen] = useState(null)
  const list = resolveLinks(catalog, links.companions)
  return (
    <div className={className}>
      <Kicker className="mb-3 flex items-center gap-2">
        <Handshake className="size-4" strokeWidth={1.8} />
        {t('Companion plants')}
      </Kicker>
      <div className={cx('-mx-1 flex snap-x gap-2 overflow-x-auto px-1 pb-2', big && 'scroll-px-4')}>
        {!list.length && <Card className="w-full px-4 py-4 text-[13px] text-ink-2">{t('No companion plants yet.')}</Card>}
        {list.map((c) => (
          <button
            key={`${c.kind}/${c.id}`}
            type="button"
            onClick={() => setOpen(c)}
            className={cx('flex shrink-0 snap-start items-center gap-3 rounded-md border border-line bg-card p-2.5 text-left transition hover:border-ink-3', big ? 'w-64' : 'w-60')}
          >
            <Photo photo={{ key: c.photo }} className="size-12 shrink-0 rounded-[3px]" />
            <span className="min-w-0 flex-1">
              <span className="block truncate text-[14px] font-semibold">{(t.ta && c.names?.ta) || c.name}</span>
              <span className="block truncate text-[13px] text-ink-2">{t.ta ? c.name : c.names?.ta}</span>
            </span>
            <ChevronRight className="size-4 shrink-0 text-ink-3" strokeWidth={1.8} />
          </button>
        ))}
      </div>
      {open && <CompanionModal companion={open} onClose={() => setOpen(null)} />}
    </div>
  )
}

function CompanionModal({ companion: c, onClose }) {
  const t = useT()
  const note = noteText(c.note, t.ta)
  const name = (t.ta && c.names?.ta) || c.name
  return (
    <Modal onClose={onClose} label={name}>
      <div className="relative">
        <Photo photo={{ key: c.photo }} className="aspect-[16/9] w-full" />
        <RoundButton onClick={onClose} title={t('Close')} className="absolute right-3 top-3 size-9 bg-card/90">
          <X className="size-4" />
        </RoundButton>
      </div>
      <div className="px-5 pb-5 pt-4">
        <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-2 ta:tracking-normal">{t(c.kind)}</span>
        <h2 className="font-serif text-[24px] leading-tight">
          {name} <span className="text-[18px] text-ink-2">{t.ta ? c.name : c.names?.ta}</span>
        </h2>
        <Kicker className="mt-5">{t('How they help each other')}</Kicker>
        <p className={cx('mt-2 whitespace-pre-line text-[15px] leading-relaxed', !note && 'text-ink-3')}>{note || t('No description yet.')}</p>
        <Link to={`/${ROUTE_OF[c.kind]}/${c.id}`} onClick={onClose} className="mt-5 inline-flex items-center gap-1 rounded-[4px] bg-ink px-4 py-2.5 text-[14px] font-semibold text-paper">
          {t('Open {name}', { name })} <ArrowRight className="size-4" />
        </Link>
      </div>
    </Modal>
  )
}
