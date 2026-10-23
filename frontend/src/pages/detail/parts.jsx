import { useEffect, useState } from 'react'
import { createPortal } from 'react-dom'
import { ChevronLeft, ChevronRight, Maximize2, X } from 'lucide-react'
import { Card, Kicker, Label, Photo, cx } from '../../components/ui'
import { PILL_TONES } from '../../config/seasons'
import { useT } from '../../config/i18n'
import { statText } from '../../config/kinds'

// Pieces shared by the desktop and mobile detail screens.
export const languageNames = (item) =>
  [
    ['EN', item.names?.en],
    ['TA', item.names?.ta, item.name],
    ['TE', item.names?.te, item.names?.teLatin],
    ['KN', item.names?.kn, item.names?.knLatin],
    ['ML', item.names?.ml, item.names?.mlLatin],
  ].filter(([, script]) => script)

// The other Tamil names; the heading already shows the main one. Written in the reader's script: Tamil letters
// in Tamil, English letters in English (falling back to Tamil when no spelling was entered).
export const otherNames = (item, ta) => (item.tamilNames || []).map((n) => (ta ? n.ta : n.latin || n.ta)).filter(Boolean)

export function OtherNames({ item, className }) {
  const t = useT()
  return (
    <div className={cx('flex flex-wrap items-baseline gap-x-3 gap-y-1 font-serif', className)}>
      {otherNames(item, t.ta).map((name, i) => (
        <span key={name} className="contents">
          {i > 0 && <span className="text-ink-3" aria-hidden>·</span>}
          <span className={cx(t.ta && 'font-sans')}>{name}</span>
        </span>
      ))}
    </div>
  )
}

// Photos one at a time; the expand button opens the same carousel full screen.
export function PhotoCarousel({ photos, className }) {
  const [index, setIndex] = useState(0)
  const [full, setFull] = useState(false)
  const count = photos.length
  const i = Math.min(index, Math.max(count - 1, 0))
  const go = (step) => setIndex((i + step + count) % count)

  useEffect(() => {
    if (!full) return
    const onKey = (e) => {
      if (e.key === 'Escape') setFull(false)
      if (count > 1 && e.key === 'ArrowLeft') go(-1)
      if (count > 1 && e.key === 'ArrowRight') go(1)
    }
    const overflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = overflow
      window.removeEventListener('keydown', onKey)
    }
  })

  const slides = { photos, i, go, setIndex }
  return (
    <>
      <Slides {...slides} className={cx('rounded-md border border-line', className)}>
        {count > 0 && (
          <button type="button" aria-label="View full screen" onClick={() => setFull(true)} className="absolute left-3 top-3 rounded-full border border-line bg-card/90 p-2 hover:bg-card">
            <Maximize2 className="size-4" />
          </button>
        )}
      </Slides>
      {full &&
        createPortal(
          <div className="fixed inset-0 z-50 bg-paper p-4 sm:p-8">
            <Slides {...slides} contain className="size-full rounded-md">
              <button type="button" aria-label="Close full screen" onClick={() => setFull(false)} className="absolute left-3 top-3 rounded-full border border-line bg-card/90 p-2 hover:bg-card">
                <X className="size-4" />
              </button>
            </Slides>
          </div>,
          document.body,
        )}
    </>
  )
}

function Slides({ photos, i, go, setIndex, contain, className, children }) {
  const [touchX, setTouchX] = useState(null)
  const count = photos.length
  const photo = photos[i]

  return (
    <div
      className={cx('relative overflow-hidden', className)}
      onTouchStart={(e) => setTouchX(e.touches[0].clientX)}
      onTouchEnd={(e) => {
        const dx = e.changedTouches[0].clientX - (touchX ?? 0)
        if (count > 1 && touchX !== null && Math.abs(dx) > 40) go(dx < 0 ? 1 : -1)
        setTouchX(null)
      }}
    >
      <Photo photo={photo} detailed className={cx('size-full', contain && 'object-contain!')} />
      {photo?.caption && <span className="absolute bottom-3 left-3 rounded-[3px] bg-card px-2.5 py-1 text-[12px]">{photo.caption}</span>}
      {children}
      {count > 1 && (
        <>
          <button type="button" aria-label="Previous photo" onClick={() => go(-1)} className="absolute left-3 top-1/2 -translate-y-1/2 rounded-full border border-line bg-card/90 p-2 hover:bg-card">
            <ChevronLeft className="size-4" />
          </button>
          <button type="button" aria-label="Next photo" onClick={() => go(1)} className="absolute right-3 top-1/2 -translate-y-1/2 rounded-full border border-line bg-card/90 p-2 hover:bg-card">
            <ChevronRight className="size-4" />
          </button>
          <span className="absolute right-3 top-3 rounded-[3px] bg-card px-2 py-0.5 font-mono text-[11px] text-ink-2">
            {i + 1} / {count}
          </span>
          <div className="absolute bottom-3 right-3 flex gap-1.5">
            {photos.map((p, j) => (
              <button
                key={j}
                type="button"
                aria-label={p.label || `Photo ${j + 1}`}
                onClick={() => setIndex(j)}
                className={cx('size-2 rounded-full border border-ink', j === i ? 'bg-ink' : 'bg-card')}
              />
            ))}
          </div>
        </>
      )}
    </div>
  )
}

export function Stats({ cfg, item, big }) {
  const t = useT()
  const stats = cfg.stats.filter((s) => statText(s, item, t))
  if (!stats.length) return null
  const three = stats.length === 3
  return (
    <div className={cx('grid gap-2', three ? 'grid-cols-3' : 'grid-cols-2')}>
      {stats.map((s) => (
        <div key={s.key} className={cx('min-w-0 rounded-md py-3 short:py-2', three && big ? 'px-3' : 'px-3.5', s.toned ? cx(PILL_TONES[item[s.key]], 'text-onlime') : 'border border-line bg-card')}>
          <Label className={cx('text-[10px]! ta:text-[12px]!', s.toned && 'text-onlime/80')}>{t(s.label)}</Label>
          {/* Tamil words run long, so three across on a phone takes a smaller size; a word that still does not fit wraps. */}
          <div className={cx('mt-1 font-serif leading-tight [overflow-wrap:anywhere]', big ? (three ? 'text-[24px] ta:text-[17px]' : 'text-[24px] ta:text-[20px]') : 'text-[21px] ta:text-[18px]')}>
            {statText(s, item, t)}
          </div>
        </div>
      ))}
    </div>
  )
}

export function NamesCard({ item }) {
  const t = useT()
  return (
    <Card className="px-7 pt-6 pb-3">
      <Kicker className="pb-3">{t('Names')}</Kicker>
      {languageNames(item).map(([code, script, latin]) => (
        <div key={code} className="flex items-baseline gap-6 border-t border-line py-4 font-serif text-[22px]">
          <span className="w-8 font-mono text-[14px] text-ink-2">{code}</span>
          <span>
            <span className={code === 'EN' ? '' : 'font-sans'}>{script}</span> {latin && <span className="text-[20px] text-ink-2">{latin}</span>}
          </span>
        </div>
      ))}
    </Card>
  )
}

export function neighbours(list, id) {
  const i = list.findIndex((x) => x.id === id)
  if (i < 0 || list.length < 2) return {}
  return { prev: list[(i - 1 + list.length) % list.length], next: list[(i + 1) % list.length] }
}
