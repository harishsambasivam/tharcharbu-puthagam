import { Link, NavLink } from 'react-router-dom'
import { KINDS } from '../config/kinds'
import { useApp } from '../store/useApp'
import { cx } from '../components/ui'
import { LangButton, ThemeButton } from './HeaderButtons'
import { useT } from '../config/i18n'

export default function DesktopHeader({ wide }) {
  const lang = useApp((s) => s.lang)
  const t = useT()
  return (
    <header className="border-b border-line bg-card">
      <div className={cx('mx-auto flex h-14 items-center gap-8', wide ? 'px-10' : 'max-w-[1240px] px-6')}>
        <Link to="/plants" className="font-serif text-[22px] tracking-tight">
          {t('Tharcharbu Puthagam')}
        </Link>
        <nav className="ml-auto flex items-center gap-7 text-[15px]">
          {Object.values(KINDS).map((k) => (
            <NavLink key={k.route} to={`/${k.route}`} className={({ isActive }) => (isActive ? 'font-semibold text-ink' : 'text-ink-2 hover:text-ink')}>
              {lang === 'ta' ? k.ta : k.label}
            </NavLink>
          ))}
        </nav>
        <div className="flex gap-2">
          <LangButton className="size-9" />
          <ThemeButton className="size-9" />
        </div>
      </div>
    </header>
  )
}
