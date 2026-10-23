import { Link } from 'react-router-dom'
import { Plus } from 'lucide-react'
import Page from '../../layout/Page'
import { Card, cx } from '../../components/ui'
import { useAdmin } from '../../store/useApp'
import { useT } from '../../config/i18n'
import { ArticleCard, useArticles } from './parts'

// Every article, newest first: the latest across the top, the rest in a grid.
export default function ArticlesPage() {
  const t = useT()
  const admin = useAdmin()
  const { articles, isLoading } = useArticles()
  const [lead, ...rest] = articles

  return (
    <Page>
      <main className="mx-auto max-w-[1240px] px-4 pb-20 md:px-10">
        <div className="flex items-end justify-between gap-6 border-b border-line pb-6 pt-6 md:pt-12">
          <h1 className="font-serif text-[34px] leading-none tracking-tight md:text-[46px]">
            {t('Articles')} <span className="text-[20px] text-ink-2 md:text-[32px]">{t.ta ? 'Articles' : 'கட்டுரைகள்'}</span>
          </h1>
          {admin && (
            <Link to="/articles/new" className="flex shrink-0 items-center gap-2 rounded-[4px] bg-ink px-4 py-2.5 text-[14px] font-semibold text-paper md:px-6 md:py-3 md:text-[15px]">
              <Plus className="size-4" /> {t('New article')}
            </Link>
          )}
        </div>

        {!articles.length ? (
          <Card className={cx('mt-8 px-6 py-12 text-center font-serif text-[22px]', isLoading && 'opacity-0')}>{t('No articles yet.')}</Card>
        ) : (
          <>
            <ArticleCard article={lead} size="lg" className="mt-8 max-w-[880px]" />
            {rest.length > 0 && (
              <div className="mt-10 grid gap-x-8 gap-y-10 border-t border-line pt-10 sm:grid-cols-2 lg:grid-cols-3">
                {rest.map((a) => (
                  <ArticleCard key={a.id} article={a} />
                ))}
              </div>
            )}
          </>
        )}
      </main>
    </Page>
  )
}
