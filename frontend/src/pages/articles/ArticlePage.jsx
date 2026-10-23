import { useMemo } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ArrowLeft, Pencil } from 'lucide-react'
import Page from '../../layout/Page'
import { DraftBadge, Kicker, Loading, Photo } from '../../components/ui'
import { resolveLinks, useCatalog, useItem } from '../../api/queries'
import { useAdmin, useDisplayName, useLocalize, useSubName } from '../../store/useApp'
import { ROUTE_OF } from '../../config/kinds'
import { useT } from '../../config/i18n'
import { Cover, paragraphs, useArticleDate } from './parts'

export default function ArticlePage() {
  const { id } = useParams()
  const t = useT()
  const admin = useAdmin()
  const localize = useLocalize()
  const date = useArticleDate()
  const { data, isLoading } = useItem('articles', id)
  const a = useMemo(() => data && localize(data), [data, localize])

  if (isLoading) return <Loading />
  if (!a) return <div className="grid min-h-[50vh] place-items-center text-ink-2">{t('Not found.')}</div>

  // The cover leads; any further photos follow the text with their captions.
  const [, ...photos] = a.photos || []
  return (
    <Page>
      <main className="mx-auto max-w-[760px] px-4 pb-20 pt-6 md:pt-10">
        <div className="flex items-center gap-3 text-[13px] text-ink-2">
          <Link to="/articles" className="flex items-center gap-1 text-moss underline underline-offset-2">
            <ArrowLeft className="size-3.5" /> {t('All articles')}
          </Link>
          {a.status === 'draft' && <DraftBadge />}
          {admin && (
            <Link to={`/articles/${a.id}/edit`} className="ml-auto flex items-center gap-1.5 font-semibold text-ink">
              <Pencil className="size-3.5" /> {t('Edit')}
            </Link>
          )}
        </div>

        <header className="mt-6 md:mt-10">
          <div className="font-mono text-[11px] uppercase tracking-[0.2em] text-ink-2 ta:text-[12px] ta:tracking-normal">{date(a)}</div>
          <h1 className="mt-3 font-serif text-[36px] leading-[1.08] tracking-tight md:text-[52px] ta:text-[30px] md:ta:text-[42px]">{a.title || t('Untitled')}</h1>
          {a.summary && <p className="mt-4 text-[18px] leading-relaxed text-ink-2 md:text-[20px]">{a.summary}</p>}
        </header>

        {a.photos?.[0] && (
          <figure className="mt-8">
            <Cover article={a} className="aspect-[16/9] rounded-md border border-line" />
            {a.photos[0].caption && <figcaption className="mt-2 text-[13px] text-ink-2">{a.photos[0].caption}</figcaption>}
          </figure>
        )}

        <div className="mt-8 space-y-5 font-serif text-[18px] leading-[1.75] md:text-[19px] ta:text-[16px] ta:leading-[1.85]">
          {paragraphs(a.body).map((p, i) => (
            <p key={i} className="whitespace-pre-line">
              {p}
            </p>
          ))}
        </div>

        {photos.map((p, i) => (
          <figure key={i} className="mt-8">
            <Photo photo={p} className="w-full rounded-md border border-line" />
            {p.caption && <figcaption className="mt-2 text-[13px] text-ink-2">{p.caption}</figcaption>}
          </figure>
        ))}

        <Mentioned refs={a.items} />
      </main>
    </Page>
  )
}

// The plants, trees and creatures the article is about, each linking to its page.
function Mentioned({ refs }) {
  const t = useT()
  const catalog = useCatalog()
  const displayName = useDisplayName()
  const subName = useSubName()
  const list = resolveLinks(catalog, refs)
  if (!list.length) return null
  return (
    <section className="mt-12 border-t border-line pt-6">
      <Kicker>{t('In this article')}</Kicker>
      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        {list.map((i) => (
          <Link key={`${i.kind}/${i.id}`} to={`/${ROUTE_OF[i.kind]}/${i.id}`} className="flex items-center gap-3 rounded-md border border-line bg-card p-2.5 transition hover:border-ink-3">
            <Photo photo={{ key: i.photo }} className="size-12 shrink-0 rounded-[3px]" />
            <span className="min-w-0">
              <span className="block font-mono text-[10px] uppercase tracking-[0.2em] text-ink-2 ta:tracking-normal">{t(i.kind)}</span>
              <span className="block truncate text-[15px] font-semibold">{displayName(i)}</span>
              <span className="block truncate text-[13px] text-ink-2">{subName(i)}</span>
            </span>
          </Link>
        ))}
      </div>
    </section>
  )
}
