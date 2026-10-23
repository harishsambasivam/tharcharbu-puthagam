import { Link } from 'react-router-dom'
import { useIsMobile } from '../hooks/useIsMobile'
import { Logo } from '../components/Icons'
import DesktopHeader from './DesktopHeader'
import MobileTabBar from './MobileTabBar'
import { LangButton, ThemeButton } from './HeaderButtons'

// The frame for pages that read the same on any screen (home, articles): the header and, on phones, the tab bar.
export default function Page({ children }) {
  if (!useIsMobile())
    return (
      <>
        <DesktopHeader wide />
        {children}
      </>
    )
  return (
    <div className="min-h-screen pb-32">
      <header className="flex items-center justify-between px-4 pt-5">
        <Link to="/" aria-label="Home">
          <Logo className="size-9 shrink-0 text-moss" />
        </Link>
        <div className="flex gap-2">
          <LangButton className="size-9" />
          <ThemeButton className="size-9" />
        </div>
      </header>
      {children}
      <MobileTabBar />
    </div>
  )
}
