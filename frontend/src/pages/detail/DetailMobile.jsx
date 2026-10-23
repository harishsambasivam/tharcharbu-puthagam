import { Link, useLocation, useNavigate } from 'react-router-dom'
import { ChevronLeft, Copy, Pencil } from 'lucide-react'
import MobileTabBar from '../../layout/MobileTabBar'
import { LangButton, ThemeButton } from '../../layout/HeaderButtons'
import { Kicker, RoundButton, cx } from '../../components/ui'
import { LandGrid, SeasonGrid } from '../../components/SeasonLand'
import { TraitCards } from '../../components/Traits'
import { Article, Description, LifeCycle, Notes } from '../../components/About'
import { LinksBoard } from '../../components/Links'
import { Companions } from '../../components/Companions'
import { useAdmin } from '../../store/useApp'
import { useClone } from '../../api/queries'
import { useT } from '../../config/i18n'
import { PhotoCarousel, Stats, OtherNames, otherNames } from './parts'

export default function DetailMobile({ cfg, item }) {
  const admin = useAdmin()
  const clone = useClone(cfg)
  const t = useT()
  const navigate = useNavigate()
  const location = useLocation()
  // Direct visits have no in-app history; fall back to the list.
  const goBack = () => (location.key === 'default' ? navigate(cfg.list) : navigate(-1))

  return (
    <div className="min-h-screen pb-36">
      <header className="sticky top-0 z-10 border-b border-line bg-paper px-4 pb-5 pt-2">
        <div className="flex items-center gap-2">
          <RoundButton onClick={goBack} title={t('Back')} className="size-9">
            <ChevronLeft className="size-5" strokeWidth={1.6} />
          </RoundButton>
          {admin && (
            <>
              <Link to={`/${cfg.route}/${item.id}/edit`} aria-label={t('Edit')} className="ml-auto grid size-[52px] place-items-center rounded-full border border-line">
                <Pencil className="size-5" />
              </Link>
              <button type="button" onClick={() => clone(item.id)} aria-label={t('Clone')} className="grid size-[52px] place-items-center rounded-full border border-line">
                <Copy className="size-5" />
              </button>
            </>
          )}
          <LangButton className={cx('size-9', !admin && 'ml-auto')} />
          <ThemeButton className="size-9" />
        </div>
        <h1 className="mt-5 font-serif text-[29px] leading-tight">
          {item.names?.ta && <span className="font-sans">{item.names.ta} </span>}
          <span className={item.names?.ta ? 'text-[23px] text-ink-2' : ''}>{item.name || 'Untitled'}</span>
        </h1>
        {!t.ta && (item.scientific || item.family) && (
          <div className="mt-1 flex items-baseline justify-between gap-3 text-ink-2">
            <span className="font-serif text-[15px] italic">{item.scientific}</span>
            <span className="font-mono text-[11px] uppercase tracking-[0.28em]">{item.family}</span>
          </div>
        )}
      </header>

      <main className="space-y-4 px-4 pt-4">
        <PhotoCarousel photos={item.photos || []} className="aspect-[4/3]" />
        {otherNames(item, t.ta).length > 0 && (
          <div className="pt-3">
            <Kicker className="text-[12px]! ta:text-[14px]!">{t('Other names')}</Kicker>
            <OtherNames item={item} className="mt-2 text-[16px] leading-[1.7]" />
          </div>
        )}
        <Stats cfg={cfg} item={item} big />
        <SeasonGrid title={cfg.seasonLabel} value={item.seasons} className="pt-2" />
        <LandGrid title={cfg.landLabel} value={item.lands} className="[&_.grid]:grid-cols-3" />
        <Description text={item.notes?.description} className="pt-2" />
        <TraitCards cfg={cfg} item={item} big />
        {cfg.lifeCycle && <LifeCycle stages={item.lifeCycle} big />}
        <Notes cfg={cfg} notes={item.notes} big skip={['description']} />
        {cfg.flora && <Companions links={item.links} big className="pt-4" />}
        <LinksBoard links={item.links} big />
        <Article text={item.article} big />
      </main>
      <MobileTabBar />
    </div>
  )
}
