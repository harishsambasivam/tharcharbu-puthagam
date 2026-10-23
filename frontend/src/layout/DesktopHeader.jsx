import { Link, useLocation } from 'react-router-dom'
import { NAV } from '../config/kinds'
import { useApp } from '../store/useApp'
import { cx } from '../components/ui'
import { Logo } from '../components/Icons'
import { LangButton, ThemeButton } from './HeaderButtons'
import { useT } from '../config/i18n'

export default function DesktopHeader({ wide }) {
  const lang = useApp((s) => s.lang)
  const t = useT()
  const { pathname } = useLocation()
  return (
    <header className="border-b border-line bg-card">
      <div className={cx('mx-auto flex h-14 items-center gap-8', wide ? 'px-10' : 'max-w-[1240px] px-6')}>
        <Link to="/" className="flex items-center gap-2.5 font-serif text-[22px] tracking-tight">
          <Logo className="size-8 shrink-0 text-moss" />
          {t('Tharcharbu Puthagam')}
        </Link>
        <nav className="ml-auto flex items-center gap-7 text-[15px]">
          {NAV.map((n) => (
            <Link key={n.to} to={n.to} className={n.match(pathname) ? 'font-semibold text-ink' : 'text-ink-2 hover:text-ink'}>
              {lang === 'ta' ? n.ta : n.label}
            </Link>
          ))}
        </nav>
        <div className="flex gap-2">
          <LangButton className="size-8" />
          <ThemeButton className="size-8" />
        </div>
      </div>
    </header>
  )
}
