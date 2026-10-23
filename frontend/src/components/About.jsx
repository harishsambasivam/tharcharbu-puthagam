import { Bug, Footprints, HeartPulse, Info, MapPin, RefreshCw, ScrollText, Search, ShieldCheck, ShoppingBasket, Sprout, Trees, Utensils, Wheat } from 'lucide-react'
import { Card, Kicker, Label, cx } from './ui'
import { useT } from '../config/i18n'

// An icon for each note heading, so the write-up reads at a glance.
const NOTE_ICONS = {
  description: Info, habitat: MapPin, landscape: Trees, propagation: Sprout, harvesting: ShoppingBasket, uses: Utensils, medicinal: HeartPulse, pests: Bug,
  behaviour: Footprints, onCrops: Wheat, signs: Search, management: ShieldCheck,
}

export function LifeCycle({ stages = [], big }) {
  const t = useT()
  if (!stages.length) return null
  return (
    <section>
      <Kicker className="flex items-center gap-2">
        <RefreshCw className="size-4" strokeWidth={1.8} />
        {t('Life cycle')}
      </Kicker>
      <div className={cx('mt-3 grid gap-2', big ? 'grid-cols-2' : stages.length === 3 ? 'grid-cols-3' : 'grid-cols-4')}>
        {stages.map((s, i) => (
          <Card key={i} className="min-w-0 px-4 py-4">
            <div className="font-mono text-[11px] text-ink-2">
              {String(i + 1).padStart(2, '0')}
              {s.duration && ` · ${s.duration}`}
            </div>
            <div className={cx('mt-1 font-serif leading-tight [overflow-wrap:anywhere]', big ? 'text-[22px] ta:text-[18px]' : 'text-[22px] ta:text-[19px]')}>{s.stage}</div>
            <p className={cx('mt-1.5 text-ink-2', big ? 'text-[15px] leading-normal ta:text-[14px]' : 'text-[13px]')}>{s.text}</p>
          </Card>
        ))}
      </div>
    </section>
  )
}

// The long-form write-up, split into paragraphs on blank lines.
export function Article({ text = '', big }) {
  const t = useT()
  const paragraphs = text.split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean)
  if (!paragraphs.length) return null
  return (
    <section>
      <Kicker className="mb-3 flex items-center gap-2">
        <ScrollText className="size-4" strokeWidth={1.8} />
        {t('In depth')}
      </Kicker>
      <div className={cx('max-w-[68ch] space-y-5 font-serif text-ink', big ? 'text-[20px] leading-[1.7] ta:text-[18px]' : 'text-[17px] leading-[1.75] ta:text-[15.5px]')}>
        {paragraphs.map((p, i) => (
          <p key={i} className="whitespace-pre-line">
            {p}
          </p>
        ))}
      </div>
    </section>
  )
}

// The description on its own, for the top of the page beside the photo.
export function Description({ text, className }) {
  const t = useT()
  if (!text) return null
  return (
    <div className={className}>
      <Kicker>{t('Description')}</Kicker>
      <p className="mt-2 whitespace-pre-line font-serif text-[16.5px] leading-[1.6] text-ink ta:text-[15px] ta:leading-[1.75]">{text}</p>
    </div>
  )
}

// `skip` leaves out notes shown elsewhere on the page.
export function Notes({ cfg, notes = {}, big, skip = [] }) {
  const t = useT()
  const filled = cfg.notes.filter((n) => notes[n.key] && !skip.includes(n.key))
  return (
    <section className={cx('border-t border-line', big ? 'pt-2' : 'grid grid-cols-2 gap-x-12')}>
      {filled.map((n) => {
        const Icon = NOTE_ICONS[n.key]
        return (
          <div key={n.key} className={cx('border-b border-line', big ? 'py-7' : 'grid grid-cols-[8rem_1fr] gap-4 py-6')}>
            <Label className="flex items-start gap-2 pt-1.5">
              {Icon && <Icon className="size-4 shrink-0 text-moss" strokeWidth={1.8} />}
              {t(n.label)}
            </Label>
            <p
              className={cx(
                'font-serif text-ink',
                big ? 'mt-3 text-[20px] leading-[1.6] ta:text-[18px]' : 'text-[16.5px] leading-[1.6] ta:text-[15px] ta:leading-[1.75]',
              )}
            >
              {notes[n.key]}
            </p>
          </div>
        )
      })}
    </section>
  )
}
