import { Card, Kicker, Label, cx } from './ui'
import { useT } from '../config/i18n'

export function LifeCycle({ stages = [], big }) {
  const t = useT()
  if (!stages.length) return null
  return (
    <section>
      <Kicker>{t('Life cycle')}</Kicker>
      <div className={cx('mt-3 grid gap-2', big ? 'grid-cols-2' : stages.length === 3 ? 'grid-cols-3' : 'grid-cols-4')}>
        {stages.map((s, i) => (
          <Card key={i} className={big ? 'p-6' : 'px-4 py-4'}>
            <div className="font-mono text-[11px] text-ink-2">
              {String(i + 1).padStart(2, '0')}
              {s.duration && ` · ${s.duration}`}
            </div>
            <div className={cx('mt-1 font-serif leading-tight', big ? 'text-[30px]' : 'text-[22px]')}>{s.stage}</div>
            <p className={cx('mt-1.5 text-ink-2', big ? 'text-[17px] leading-relaxed' : 'text-[13px]')}>{s.text}</p>
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
      <Kicker className="mb-3">{t('In depth')}</Kicker>
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

export function Notes({ cfg, notes = {}, big }) {
  const t = useT()
  const filled = cfg.notes.filter((n) => notes[n.key])
  return (
    <section className={cx('border-t border-line', big ? 'pt-2' : 'grid grid-cols-2 gap-x-12')}>
      {filled.map((n) => (
        <div key={n.key} className={cx('border-b border-line', big ? 'py-7' : 'grid grid-cols-[8rem_1fr] gap-4 py-6')}>
          <Label className="pt-1.5">{t(n.label)}</Label>
          <p className={cx('font-serif text-ink', big ? 'mt-3 text-[20px] leading-[1.6] ta:text-[18px]' : 'text-[16.5px] leading-[1.6] ta:text-[15px] ta:leading-[1.75]')}>{notes[n.key]}</p>
        </div>
      ))}
    </section>
  )
}
