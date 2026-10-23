import { Languages, Moon, Sun } from 'lucide-react'
import { useApp } from '../store/useApp'
import { RoundButton, cx } from '../components/ui'
import { useT } from '../config/i18n'

export function LangButton({ className }) {
  const { lang, toggleLang } = useApp()
  const t = useT()
  return (
    <RoundButton onClick={toggleLang} title={t('Tamil or English')} className={cx(lang === 'ta' && 'border-transparent bg-lime text-onlime', className)}>
      <Languages className="size-4" strokeWidth={1.6} />
    </RoundButton>
  )
}

export function ThemeButton({ className }) {
  const { theme, toggleTheme } = useApp()
  const t = useT()
  const Icon = theme === 'dark' ? Sun : Moon
  return (
    <RoundButton onClick={toggleTheme} title={t('Light or dark')} className={className}>
      <Icon className="size-4" strokeWidth={1.6} />
    </RoundButton>
  )
}
