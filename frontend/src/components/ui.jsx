import { useEffect, useRef, useState } from 'react'
import { Check, ChevronDown, Image as ImageIcon } from 'lucide-react'
import { mediaUrl } from '../api/client'
import { useApp } from '../store/useApp'

export const cx = (...c) => c.filter(Boolean).join(' ')

export const Label = ({ className, children }) => (
  <div className={cx('font-mono text-[11px] uppercase tracking-[0.2em] text-ink-2 ta:text-[12px] ta:font-medium ta:tracking-normal', className)}>{children}</div>
)

export const Kicker = ({ className, children, sub }) => (
  <div className={cx('font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-moss ta:text-[13px] ta:font-semibold ta:tracking-normal', className)}>
    {children}
    {sub && <span className="normal-case tracking-normal text-ink-2"> · {sub}</span>}
  </div>
)

export const Card = ({ className, ...props }) => <div className={cx('rounded-md border border-line bg-card', className)} {...props} />

export const Tag = ({ className, children }) => (
  <span className={cx('inline-flex items-center whitespace-nowrap rounded-[4px] px-2.5 py-1 text-[15px] leading-none text-onlime', className)}>{children}</span>
)

export const Badge = ({ tone = 'lime', className, children }) => (
  <span className={cx('rounded-[3px] px-1.5 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-onlime', tone === 'rose' ? 'bg-rose' : 'bg-lime', className)}>
    {children}
  </span>
)

export const DraftBadge = () => <Badge className="bg-amber! py-0">{useApp((s) => s.lang) === 'ta' ? 'வரைவு' : 'Draft'}</Badge>

export const RoundButton = ({ className, ...props }) => (
  <button type="button" className={cx('grid size-10 place-items-center rounded-full border border-line text-ink transition hover:border-ink-3', className)} {...props} />
)

const BUTTONS = {
  dark: 'bg-ink text-paper hover:opacity-90',
  outline: 'border border-ink text-ink hover:bg-ink/5',
  lime: 'bg-lime text-onlime hover:brightness-95',
  ghost: 'text-ink hover:bg-ink/5',
}
export const Button = ({ variant = 'dark', className, ...props }) => (
  <button
    type="button"
    className={cx('inline-flex items-center justify-center gap-1.5 rounded-[4px] px-4 py-2 text-[14px] font-semibold transition disabled:opacity-50', BUTTONS[variant], className)}
    {...props}
  />
)

export const Toggle = ({ checked, onChange }) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    onClick={() => onChange(!checked)}
    className={cx('relative h-6 w-11 rounded-full border-2 transition', checked ? 'border-ink bg-ink' : 'border-line bg-line/60')}
  >
    <span className={cx('absolute top-0.5 size-4 rounded-full bg-card transition-all', checked ? 'left-[22px]' : 'left-0.5')} />
  </button>
)

// Shows the uploaded photo, or the striped placeholder with its label and hint.
export function Photo({ photo, className, detailed }) {
  if (photo?.key) return <img src={mediaUrl(photo.key)} alt={photo.caption || photo.label} className={cx('object-cover', className)} />
  return (
    <div className={cx('stripes flex flex-col items-center justify-center text-center text-ink-2', className)}>
      {detailed && photo && (
        <>
          <ImageIcon strokeWidth={1.3} className="size-10 text-ink-2" />
          <div className="mt-3 font-mono text-[11px] uppercase tracking-[0.22em] text-ink">{photo.label}</div>
          {photo.hint && <div className="mt-2 text-[13px]">[PHOTO: {photo.hint}]</div>}
        </>
      )}
    </div>
  )
}

export function Popover({ trigger, children, align = 'left', className, rootClassName }) {
  const [open, setOpen] = useState(false)
  const ref = useRef()
  useEffect(() => {
    if (!open) return
    const close = (e) => !ref.current?.contains(e.target) && setOpen(false)
    const onKey = (e) => e.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', close)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', close)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])
  return (
    <div ref={ref} className={cx('relative', rootClassName)}>
      {trigger({ open, toggle: () => setOpen(!open) })}
      {open && (
        <div className={cx('absolute top-full z-30 mt-2 rounded-md border border-line bg-card shadow-xl', align === 'right' ? 'right-0' : 'left-0', className)}>
          {children(() => setOpen(false))}
        </div>
      )}
    </div>
  )
}

// A dropdown in the app's own style. Options are [value, label] pairs; `render` can draw an option with an icon.
// The placeholder row clears the value.
export function Select({ value, onChange, options, placeholder = '—', render = ([, label]) => label, className }) {
  const current = options.find(([v]) => v === value)
  return (
    <Popover
      rootClassName="w-full"
      className="min-w-full overflow-hidden py-1"
      trigger={({ open, toggle }) => (
        <button type="button" onClick={toggle} aria-haspopup="listbox" aria-expanded={open} className={cx('flex w-full items-center gap-2 text-left', className)}>
          <span className={cx('flex min-w-0 flex-1 items-center gap-2 truncate', !current && 'text-ink-3')}>{current ? render(current) : placeholder}</span>
          <ChevronDown className={cx('size-4 shrink-0 text-ink-2 transition', open && 'rotate-180')} strokeWidth={1.8} />
        </button>
      )}
    >
      {(close) => (
        <div role="listbox" className="font-sans text-[14px] leading-normal text-ink">
          {[['', placeholder], ...options].map((option) => {
            const [v] = option
            const on = v === (value || '')
            return (
              <button
                key={v || 'none'}
                type="button"
                role="option"
                aria-selected={on}
                onClick={() => (onChange(v), close())}
                className={cx('flex w-full items-center gap-2 whitespace-nowrap px-3 py-2 text-left hover:bg-ink/5', on && 'font-semibold', !v && 'text-ink-3')}
              >
                <Check className={cx('size-3.5 shrink-0', !on && 'invisible')} strokeWidth={2.2} />
                {v ? render(option) : placeholder}
              </button>
            )
          })}
        </div>
      )}
    </Popover>
  )
}

export const Loading = () => <div className="grid min-h-[50vh] place-items-center text-ink-3">{useApp((s) => s.lang) === 'ta' ? 'ஏற்றுகிறது…' : 'Loading…'}</div>

export const lineInput = 'w-full border-b border-dashed border-line bg-transparent pb-1 outline-none placeholder:text-ink-3 focus:border-ink'
