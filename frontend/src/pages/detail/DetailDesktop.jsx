import { Link } from 'react-router-dom'
import { ArrowLeft, ArrowRight, Copy, Pencil } from 'lucide-react'
import DesktopHeader from '../../layout/DesktopHeader'
import { Card, DraftBadge, Kicker, Label } from '../../components/ui'
import { LandGrid, SeasonGrid } from '../../components/SeasonLand'
import { TraitCards } from '../../components/Traits'
import { Article, LifeCycle, Notes } from '../../components/About'
import { LinksBoard } from '../../components/Links'
import { useAdmin } from '../../store/useApp'
import { useClone } from '../../api/queries'
import { useT } from '../../config/i18n'
import { PhotoCarousel, Stats, OtherNames, languageNames, otherNames } from './parts'

export default function DetailDesktop({ cfg, item, nav }) {
  const admin = useAdmin()
  const clone = useClone(cfg)
  const t = useT()

  return (
    <>
      <DesktopHeader wide />
      <main className="px-10 pb-16">
        <section className="pb-6 pt-4">
          <div className="flex items-center gap-3 text-[13px] text-ink-2">
            <span>
              <Link to={`/${cfg.route}`} className="text-moss underline underline-offset-2">
                {t(cfg.label)}
              </Link>
              {item.group && (
                <>
                  {' / '}
                  <Link to={`/${cfg.route}`} className="text-moss underline underline-offset-2">
                    {item.group}
                  </Link>
                </>
              )}
              {' / '}
              {item.name}
            </span>
            {item.status === 'draft' && <DraftBadge />}
            {admin && (
              <>
                <Link to={`/${cfg.route}/${item.id}/edit`} className="ml-auto flex items-center gap-1.5 font-semibold text-ink">
                  <Pencil className="size-3.5" /> {t('Edit')}
                </Link>
                <button type="button" onClick={() => clone(item.id)} className="ml-4 flex items-center gap-1.5 font-semibold text-ink">
                  <Copy className="size-3.5" /> {t('Clone')}
                </button>
              </>
            )}
          </div>

          <h1 className="mt-2 flex flex-wrap items-baseline gap-x-5 gap-y-1 border-b border-line pb-3">
            {languageNames(item).length ? (
              languageNames(item).map(([code, script, latin]) => (
                <span key={code} className="font-serif text-[16px] leading-tight">
                  <span className={code === 'EN' ? '' : 'font-sans'}>{script}</span> {latin && <span className="text-[13px] text-ink-2">{latin}</span>}{' '}
                  <span className="font-sans text-[10px] text-ink-3">{code}</span>
                </span>
              ))
            ) : (
              <span className="font-serif text-[16px] leading-tight">{item.name || 'Untitled'}</span>
            )}
          </h1>

          {/* Names sit in their own row so the right column lines up with the photo, top and bottom. */}
          <div className="mt-4 grid grid-cols-[1.27fr_1fr] grid-rows-[auto_1fr] gap-x-8 gap-y-4 xl:gap-x-11">
            {/* Labels share one column so the values line up. */}
            <dl className="col-start-1 grid grid-cols-[max-content_1fr] items-baseline gap-x-10 gap-y-3 pb-1">
              {!t.ta && (item.scientific || item.family) && (
                <>
                  <dt><Label>{t('Scientific name')}</Label></dt>
                  <dd className="flex flex-wrap items-baseline gap-x-4 gap-y-1">
                    <span className="font-serif text-[15px] italic">{item.scientific}</span>
                    {item.family && <span className="font-mono text-[11px] uppercase tracking-[0.28em] text-ink-2">{item.family}</span>}
                  </dd>
                </>
              )}
              {otherNames(item, t.ta).length > 0 && (
                <>
                  <dt><Label>{t('Other names')}</Label></dt>
                  <dd>
                    <OtherNames item={item} className="gap-x-4! text-[14px]" />
                  </dd>
                </>
              )}
            </dl>
            <PhotoCarousel photos={item.photos || []} className="col-start-1 row-start-2 aspect-[4/3] w-full self-start" />
            <div className="col-start-2 row-start-2 flex flex-col gap-4 short:gap-3">
              <Stats cfg={cfg} item={item} />
              <SeasonGrid title={cfg.seasonLabel} value={item.seasons} />
              <LandGrid title={cfg.landLabel} value={item.lands} />
            </div>
          </div>
        </section>

        <div className="mt-4">
          <TraitCards cfg={cfg} item={item} />
        </div>

        {cfg.lifeCycle && (
          <div className="mt-11">
            <LifeCycle stages={item.lifeCycle} />
          </div>
        )}

        <div className="mt-10">
          <Notes cfg={cfg} notes={item.notes} />
        </div>

        <section className="mt-11">
          <Kicker className="mb-3">{t('Links')}</Kicker>
          <LinksBoard links={item.links} />
        </section>

        {item.article && (
          <div className="mt-11">
            <Article text={item.article} />
          </div>
        )}

        <Card className="mt-10 flex items-center gap-3 px-5 py-4">
          <Link to={`/${cfg.route}`} className="text-[14px] text-moss underline underline-offset-2">
            {t.ta ? t('{label} — all', { label: cfg.ta }) : `All ${cfg.label.toLowerCase()}`}
          </Link>
          {nav.prev && (
            <Link
              to={`/${cfg.route}/${nav.prev.id}`}
              className="ml-auto flex items-center gap-1 rounded-[4px] border border-ink px-4 py-2.5 text-[14px] font-semibold"
            >
              <ArrowLeft className="size-4" /> {nav.prev.name}
            </Link>
          )}
          {nav.next && (
            <Link to={`/${cfg.route}/${nav.next.id}`} className="flex items-center gap-1 rounded-[4px] bg-ink px-4 py-2.5 text-[14px] font-semibold text-paper">
              {nav.next.name} <ArrowRight className="size-4" />
            </Link>
          )}
        </Card>
      </main>
    </>
  )
}
