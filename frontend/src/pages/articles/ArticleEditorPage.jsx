import { useParams } from 'react-router-dom'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { X } from 'lucide-react'
import DesktopHeader from '../../layout/DesktopHeader'
import { Card, Kicker, Label, Loading, cx, lineInput } from '../../components/ui'
import { resolveLinks, useCatalog, useItem } from '../../api/queries'
import EditorBar from '../editor/EditorBar'
import PhotoUploader from '../editor/PhotoUploader'
import { FieldError, RichTextField, TA_PLACEHOLDER } from '../editor/Fields'
import { LinkSearch } from '../editor/LinksEditor'
import { useDraft } from '../editor/useDraft'
import { useApp } from '../../store/useApp'

const blankText = () => ({ title: '', summary: '', body: '', photos: [] })
const toForm = (item = {}) => ({
  photos: item.photos || [],
  items: item.items || [],
  en: { ...blankText(), ...item.en },
  ta: { ...blankText(), ...item.ta },
})
// Checked when publishing; drafts can be saved half-written.
const publishSchema = z.object({ en: z.object({ title: z.string().trim().min(1, 'Add a title') }).passthrough() }).passthrough()

export default function ArticleEditorPage() {
  const { id } = useParams()
  const { data: item, isLoading } = useItem('articles', id)
  if (id && isLoading) return <Loading />
  if (id && !item) return <div className="grid min-h-[50vh] place-items-center text-ink-2">Not found.</div>
  return <Editor item={item} />
}

function Editor({ item }) {
  const form = useForm({ defaultValues: toForm(item), resolver: zodResolver(publishSchema) })
  const { meta, saveState, error, ensureId, publish, unpublish, leave } = useDraft({ route: 'articles', item, form, listPath: '/articles' })
  // Written one language at a time, following the header's language toggle.
  const lang = useApp((s) => s.lang)
  const title = form.watch(`${lang}.title`) || form.watch('en.title')

  return (
    <FormProvider {...form}>
      <DesktopHeader wide />
      <EditorBar
        title={item ? `Editing · ${title || 'Untitled'}` : 'New article'}
        status={meta.status}
        dirty={meta.dirty}
        saveState={saveState}
        onStatus={(s) => (s === 'published' ? publish() : unpublish())}
        onLeft={leave}
        onPublish={publish}
      />
      {/* Laid out like the reading page: title and summary, cover, then the text. */}
      <form onSubmit={(e) => e.preventDefault()} className="mx-auto max-w-[1100px] space-y-10 px-10 pb-20 pt-8">
        {error && <p className="rounded-md border border-[#b4472e]/40 px-4 py-2.5 text-[13px] text-[#b4472e]">{error}</p>}
        {/* Keyed by language so each input opens with its own text. */}
        <section key={lang}>
          <Label>{lang === 'ta' ? 'தமிழ்' : 'English'} · switch with the language button</Label>
          <input
            {...form.register(`${lang}.title`)}
            placeholder={lang === 'ta' ? `தலைப்பு (${TA_PLACEHOLDER})` : 'Title'}
            className={cx(lineInput, 'mt-2 font-serif text-[34px] leading-tight')}
          />
          <FieldError name="en.title" />
          <textarea
            {...form.register(`${lang}.summary`)}
            rows={3}
            placeholder={lang === 'ta' ? `சுருக்கம் (${TA_PLACEHOLDER})` : 'A line or two that sums it up, shown in lists and under the title'}
            className={cx(lineInput, 'mt-5 resize-y text-[17px] leading-relaxed text-ink-2')}
          />
        </section>

        <section>
          <Kicker className="mb-3" sub="the first photo is the cover">
            Photos
          </Kicker>
          <div className="max-w-[640px]">
            <PhotoUploader kind="article" ensureId={ensureId} />
          </div>
        </section>

        <section>
          <Kicker className="mb-3" sub="select text to format · start a new line to add images · drag a block by its grip to move it">
            Article
          </Kicker>
          <RichTextField name="body" kind="article" lang={lang} ensureId={ensureId} placeholder="Tell your story…" className="text-[20px] leading-[1.75]" />
        </section>

        <MentionsField />
      </form>
    </FormProvider>
  )
}

// The plants, trees and creatures the article is about. Shown at its end, each linking to its page.
function MentionsField() {
  const { watch, setValue } = useFormContext()
  const catalog = useCatalog()
  const refs = watch('items') || []
  const list = resolveLinks(catalog, refs)
  const set = (next) => setValue('items', next, { shouldDirty: true })
  return (
    <section>
      <Kicker className="mb-3" sub="listed at the end of the article">
        In this article
      </Kicker>
      <Card className="px-4 py-4">
        <LinkSearch catalog={catalog} list={list} self={{}} onPick={(ref) => set([...refs, ref])} placeholder="Add a plant, tree, insect, bird…" />
        <div className="mt-2 flex flex-wrap gap-2">
          {list.map((l) => (
            <span key={`${l.kind}/${l.id}`} className="flex items-center gap-2 rounded-full border border-line py-1 pl-3 pr-2 text-[13px]">
              <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-2">{l.kind}</span>
              <span className="font-semibold">{l.name}</span>
              <button type="button" onClick={() => set(refs.filter((r) => !(r.kind === l.kind && r.id === l.id)))} aria-label="Remove" className="text-ink-2 hover:text-ink">
                <X className="size-3.5" />
              </button>
            </span>
          ))}
        </div>
      </Card>
    </section>
  )
}
