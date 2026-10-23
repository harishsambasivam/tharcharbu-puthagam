import { Link, useLocation } from 'react-router-dom'
import { NAV } from '../config/kinds'
import { useApp } from '../store/useApp'
import { cx } from '../components/ui'

export default function MobileTabBar() {
  const lang = useApp((s) => s.lang)
  const { pathname } = useLocation()
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-4 border-t border-line bg-card px-2 pb-[max(env(safe-area-inset-bottom),10px)] pt-2.5">
      {NAV.map(({ to, label, ta, Icon, match }) => {
        const active = match(pathname)
        return (
          <Link key={to} to={to} className="flex flex-col items-center gap-1 text-[13px]">
            <span className={cx('rounded-full px-5 py-1.5', active ? 'bg-lime text-onlime' : 'text-ink-2')}>
              <Icon className="size-6" strokeWidth={1.6} />
            </span>
            <span className={active ? 'font-semibold' : 'text-ink-2'}>{lang === 'ta' ? ta : label}</span>
          </Link>
        )
      })}
    </nav>
  )
}
