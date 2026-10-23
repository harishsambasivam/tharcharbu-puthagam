import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useList } from '../../api/queries'
import { useApp, useLocalize } from '../../store/useApp'
import { DraftBadge, Photo, cx } from '../../components/ui'
import { useT } from '../../config/i18n'

// Articles, newest first, in the reader's language.
export function useArticles() {
  const localize = useLocalize()
  const { data, isLoading } = useList('articles')
  const articles = useMemo(
    () => (data || []).map(localize).sort((a, b) => (b.publishedAt || b.createdAt || '').localeCompare(a.publishedAt || a.createdAt || '')),
    [data, localize],
  )
  return { articles, isLoading }
}

// "23 October 2026", in the reader's language; drafts go by when they were started.
export function useArticleDate() {
  const lang = useApp((s) => s.lang)
  return (a) => {
    const when = a.publishedAt || a.createdAt
    return when ? new Date(when).toLocaleDateString(lang === 'ta' ? 'ta-IN' : 'en-GB', { day: 'numeric', month: 'long', year: 'numeric' }) : ''
  }
}

export const paragraphs = (text = '') =>
  text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

export const Cover = ({ article, className }) => <Photo photo={article.photos?.[0]} className={cx('w-full', className)} />

// One article in a list: cover, date, title and summary. `size` sets how much room it takes.
export function ArticleCard({ article: a, size = 'md', className }) {
  const t = useT()
  const date = useArticleDate()
  const big = size === 'lg'
  return (
    <Link to={`/articles/${a.id}`} className={cx('group block', className)}>
      {size !== 'sm' && <Cover article={a} className={cx('rounded-md border border-line', big ? 'aspect-[16/9]' : 'aspect-[3/2]')} />}
      <div className={cx('flex items-center gap-2 font-mono text-[11px] uppercase tracking-[0.2em] text-ink-2 ta:text-[12px] ta:tracking-normal', size !== 'sm' && 'mt-3')}>
        {date(a)} {a.status === 'draft' && <DraftBadge />}
      </div>
      <h3
        className={cx(
          'mt-1.5 font-serif leading-tight tracking-tight group-hover:underline group-hover:decoration-1 group-hover:underline-offset-4',
          big ? 'text-[34px] md:text-[42px] ta:text-[28px] md:ta:text-[34px]' : size === 'sm' ? 'text-[19px] ta:text-[17px]' : 'text-[23px] ta:text-[20px]',
        )}
      >
        {a.title || t('Untitled')}
      </h3>
      {a.summary && size !== 'sm' && <p className={cx('mt-2 text-ink-2', big ? 'text-[17px] leading-relaxed' : 'line-clamp-3 text-[15px] leading-snug')}>{a.summary}</p>}
    </Link>
  )
}
