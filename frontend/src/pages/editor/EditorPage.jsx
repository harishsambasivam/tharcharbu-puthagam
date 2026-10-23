import { useNavigate, useParams } from 'react-router-dom'
import { FormProvider, useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { Eye, EyeOff } from 'lucide-react'
import { useItem } from '../../api/queries'
import { useKind } from '../../hooks/useKind'
import { KINDS } from '../../config/kinds'
import DesktopHeader from '../../layout/DesktopHeader'
import { LandGrid, SeasonGrid } from '../../components/SeasonLand'
import { Label, Loading, cx, lineInput } from '../../components/ui'
import { publishSchema, toForm } from './form'
import EditorBar from './EditorBar'
import PhotoUploader from './PhotoUploader'
import LinksEditor from './LinksEditor'
import { useDraft } from './useDraft'
import { ArticleField, FieldError, GroupField, LifeCycleField, NamesField, NotesFields, StatField, TamilNamesField, TraitFields } from './Fields'

export default function EditorPage() {
  const cfg = useKind()
  const { id } = useParams()
  const { data: item, isLoading } = useItem(cfg.route, id)
  if (id && isLoading) return <Loading />
  if (id && !item) return <div className="grid min-h-[50vh] place-items-center text-ink-2">Not found.</div>
  return <Editor cfg={cfg} item={item} />
}

function Editor({ cfg, item }) {
  const form = useForm({ defaultValues: toForm(cfg, item), resolver: zodResolver(publishSchema(cfg)) })
  const { meta, saveState, error, ensureId, publish, unpublish, leave } = useDraft({ route: cfg.route, item, form, listPath: cfg.list })

  const name = form.watch('name')
  const scientific = form.watch('scientific')
  const toggle = (field, value) => {
    const list = form.getValues(field)
    form.setValue(field, list.includes(value) ? list.filter((v) => v !== value) : [...list, value])
  }

  return (
    <FormProvider {...form}>
      <DesktopHeader wide />
      <EditorBar
        title={item ? `Editing · ${name || 'Untitled'}` : `New ${cfg.one}`}
        status={meta.status}
        dirty={meta.dirty}
        saveState={saveState}
        onStatus={(s) => (s === 'published' ? publish() : unpublish())}
        onLeft={leave}
        onPublish={publish}
      />
      {/* Laid out like the detail page, so each field sits where readers will see it. */}
      <form onSubmit={(e) => e.preventDefault()} className="px-10 pb-20">
        <section className="pb-6 pt-4">
          <div className="space-y-4">
            <Banner published={meta.status === 'published'} />
            {error && <p className="rounded-md border border-[#b4472e]/40 px-4 py-2.5 text-[13px] text-[#b4472e]">{error}</p>}
            {!item && <KindPicker cfg={cfg} />}
          </div>

          <div className="mt-5">
            <NamesField />
          </div>

          <div className="mt-4 grid grid-cols-[1.27fr_1fr] grid-rows-[auto_1fr] gap-x-8 gap-y-4 xl:gap-x-11">
            <dl className="col-start-1 grid grid-cols-[max-content_1fr] items-baseline gap-x-10 gap-y-3 pb-1">
              <dt>
                <Label>Scientific name</Label>
              </dt>
              <dd>
                <div className="flex items-baseline gap-4">
                  <input
                    {...form.register('scientific')}
                    placeholder="Genus species"
                    className={cx(lineInput, 'flex-1 font-serif text-[15px]', scientific && 'italic')}
                  />
                  <input
                    {...form.register('family')}
                    placeholder="FAMILY"
                    className={cx(lineInput, 'w-44 font-mono text-[11px] uppercase tracking-[0.28em] text-ink-2')}
                  />
                </div>
                <FieldError name="scientific" />
              </dd>
              <dt>
                <Label>Other names</Label>
              </dt>
              <dd>
                <TamilNamesField />
              </dd>
              {cfg.lifeCycle && (
                <>
                  <dt>
                    <Label>Group</Label>
                  </dt>
                  <dd>
                    <GroupField />
                  </dd>
                </>
              )}
            </dl>
            <div className="col-start-1 row-start-2">
              <PhotoUploader kind={cfg.kind} ensureId={ensureId} />
            </div>
            <div className="col-start-2 row-start-2 flex flex-col gap-4">
              <div className={cx('grid gap-2', cfg.stats.length === 3 ? 'grid-cols-3' : 'grid-cols-2')}>
                {cfg.stats.map((s) => (
                  <StatField key={s.key} stat={s} />
                ))}
              </div>
              <SeasonGrid title={cfg.seasonLabel} value={form.watch('seasons')} onToggle={(v) => toggle('seasons', v)} />
              <LandGrid title={cfg.landLabel} value={form.watch('lands')} onToggle={(v) => toggle('lands', v)} />
            </div>
          </div>
        </section>

        <div className="mt-4">
          <TraitFields cfg={cfg} />
        </div>
        {cfg.lifeCycle && (
          <div className="mt-11">
            <LifeCycleField />
          </div>
        )}
        <div className="mt-10">
          <NotesFields cfg={cfg} />
        </div>
        <div className="mt-11">
          <LinksEditor cfg={cfg} id={meta.id} ensureId={ensureId} />
        </div>
        <div className="mt-11">
          <ArticleField />
        </div>
      </form>
    </FormProvider>
  )
}

function Banner({ published }) {
  const Icon = published ? Eye : EyeOff
  return (
    <div className={cx('flex items-center gap-3 rounded-md px-4 py-3 text-[13px]', published ? 'border border-line bg-card' : 'border border-dashed border-amber bg-amber/15')}>
      <Icon className="size-4 shrink-0" strokeWidth={1.8} />
      {published ? (
        <p>
          <b className="font-semibold">Published — visible to everyone.</b> Edits are saved as you type and go live when you click “Update live page”. Switch to Draft to
          hide this page.
        </p>
      ) : (
        <p>
          <b className="font-semibold">Draft — hidden from readers.</b> Everything you type is saved to the database as you go. Readers see this page only after you publish.
        </p>
      )}
    </div>
  )
}

function KindPicker({ cfg }) {
  const navigate = useNavigate()
  return (
    <div className="flex items-center gap-2">
      <span className="mr-3 font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-moss">Kind</span>
      {Object.values(KINDS).map((k) => (
        <button
          key={k.route}
          type="button"
          onClick={() => navigate(`/${k.route}/new`, { replace: true })}
          className={cx('rounded-full px-4 py-2 text-[13px] font-semibold', k.route === cfg.route ? 'bg-ink text-paper' : 'border border-line')}
        >
          {k.one[0].toUpperCase() + k.one.slice(1)}
        </button>
      ))}
      <span className="ml-2 text-[12px] text-ink-2">Sets which fields appear below.</span>
    </div>
  )
}
