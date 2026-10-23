import { NavLink } from 'react-router-dom'
import { KINDS } from '../config/kinds'
import { useApp } from '../store/useApp'
import { cx } from '../components/ui'

export default function MobileTabBar() {
  const lang = useApp((s) => s.lang)
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 grid grid-cols-5 border-t border-line bg-card px-2 pb-[max(env(safe-area-inset-bottom),10px)] pt-2.5">
      {Object.values(KINDS).map(({ route, label, ta, Icon }) => (
        <NavLink key={route} to={`/${route}`} className="flex flex-col items-center gap-1 text-[13px]">
          {({ isActive }) => (
            <>
              <span className={cx('rounded-full px-5 py-1.5', isActive ? 'bg-lime text-onlime' : 'text-ink-2')}>
                <Icon className="size-6" strokeWidth={1.6} />
              </span>
              <span className={isActive ? 'font-semibold' : 'text-ink-2'}>{lang === 'ta' ? ta : label}</span>
            </>
          )}
        </NavLink>
      ))}
    </nav>
  )
}
