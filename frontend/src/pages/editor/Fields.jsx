import { useEffect, useState } from 'react'
import { useFieldArray, useFormContext } from 'react-hook-form'
import { Check, Pencil, Plus, X } from 'lucide-react'
import { Button, Card, Kicker, Label, Popover, Select, cx, lineInput } from '../../components/ui'
import { TraitCard, TraitRow } from '../../components/Traits'
import { KeyIcon, hasKeyIcon } from '../../components/Icons'
import { optionsIn, useTagLists } from '../../config/master'
import { PILL_TONES } from '../../config/seasons'
import { blankStage } from './form'

// Form pieces for the editor. They all read the form from context.
export function FieldError({ name }) {
  const { formState } = useFormContext()
  const error = name.split('.').reduce((e, k) => e?.[k], formState.errors)
  return error ? <p className="mt-1 text-[12px] text-[#b4472e]">{error.message}</p> : null
}

const addPill = 'flex shrink-0 items-center gap-1 rounded-full border border-dashed border-ink-3 px-3 py-1 text-[13px] font-medium text-ink-2 hover:text-ink'

function AddInline({ label, placeholder, onAdd, fields = 1 }) {
  const [open, setOpen] = useState(false)
  const [values, setValues] = useState(['', ''])
  const submit = () => {
    if (values[0].trim()) onAdd(values.map((v) => v.trim()))
    setValues(['', ''])
    setOpen(false)
  }
  if (!open)
    return (
      <button type="button" onClick={() => setOpen(true)} className={addPill}>
        <Plus className="size-3.5" /> {label}
      </button>
    )
  return (
    <span className="flex items-center gap-2 rounded-full border border-ink-3 px-3 py-0.5">
      {placeholder.slice(0, fields).map((p, i) => (
        <input
          key={p}
          autoFocus={i === 0}
          value={values[i]}
          placeholder={p}
          onChange={(e) => setValues(Object.assign([...values], { [i]: e.target.value }))}
          onKeyDown={(e) => {
            if (e.key === 'Enter') (e.preventDefault(), submit())
            if (e.key === 'Escape') setOpen(false)
          }}
          className="w-36 bg-transparent py-0.5 text-[13px] outline-none"
        />
      ))}
      <button type="button" onClick={submit} className="text-[13px] font-semibold">
        Add
      </button>
    </span>
  )
}

// Tamil sits right beside the English, so a field can be translated where it is typed.
export const TA_PLACEHOLDER = 'தமிழில்'

export function Pair({ en, ta, as: El = 'input', placeholder, className, stacked, ...props }) {
  const { register } = useFormContext()
  return (
    <div className={stacked ? 'space-y-1' : 'grid grid-cols-2 gap-3'}>
      <El {...register(en)} placeholder={placeholder} className={className} {...props} />
      <El {...register(ta)} placeholder={TA_PLACEHOLDER} className={className} {...props} />
    </div>
  )
}

const Remove = ({ onClick }) => (
  <button type="button" onClick={onClick} aria-label="Remove" className="text-ink-2 hover:text-ink">
    <X className="size-3.5" />
  </button>
)

export function TamilNamesField() {
  const { watch, setValue } = useFormContext()
  const list = watch('tamilNames') || []
  const set = (next) => setValue('tamilNames', next, { shouldDirty: true })
  return (
    <div className="flex flex-wrap items-center gap-2">
      {list.map((n, i) => (
        <span key={i} title={n.latin} className="flex items-center gap-2 rounded-full bg-line/60 px-3 py-1 text-[14px]">
          {n.ta} {n.latin && <span className="text-ink-2">{n.latin}</span>} <Remove onClick={() => set(list.filter((_, j) => j !== i))} />
        </span>
      ))}
      <AddInline
        label="Add a name"
        fields={2}
        placeholder={['தமிழ்ப் பெயர்', 'In English letters']}
        onAdd={([ta, latin]) => set([...list, { ta, latin }])}
      />
    </div>
  )
}

export function NamesField() {
  const { register } = useFormContext()
  const cols = [
    ['EN', 'names.en', 'English name'],
    ['TA', 'names.ta', 'தமிழ்ப் பெயர்', 'name', 'In English letters'],
    ['TE', 'names.te', 'తెలుగు పేరు', 'names.teLatin', 'In English letters'],
    ['KN', 'names.kn', 'ಕನ್ನಡ ಹೆಸರು', 'names.knLatin', 'In English letters'],
    ['ML', 'names.ml', 'മലയാളം പേര്', 'names.mlLatin', 'In English letters'],
  ]
  // Mirrors the detail page's heading: each language's name in its script, with its English spelling below.
  return (
    <div className="grid grid-cols-5 gap-6 border-b border-line pb-3">
      {cols.map(([code, field, placeholder, latin, latinPlaceholder]) => (
        <div key={field}>
          <div className="font-mono text-[10px] text-ink-3">{code}</div>
          <input {...register(field)} placeholder={placeholder} className={cx(lineInput, 'mt-1 font-serif text-[18px]', code !== 'EN' && 'font-sans text-[16px]')} />
          <FieldError name={field} />
          {latin && <input {...register(latin)} placeholder={latinPlaceholder} className={cx(lineInput, 'mt-1.5 text-[13px] text-ink-2')} />}
          {latin && <FieldError name={latin} />}
        </div>
      ))}
    </div>
  )
}

export function StatField({ stat }) {
  const { register, watch, setValue } = useFormContext()
  const cls = cx(lineInput, 'mt-1 font-serif text-[21px]')
  const value = watch(stat.key)
  // Choices tint the card the way the detail page does once one is picked.
  const toned = stat.toned && PILL_TONES[value]
  return (
    <div className={cx('rounded-md px-3.5 py-3', toned ? cx(toned, 'text-onlime') : 'border border-line bg-card')}>
      <Label className={cx('text-[10px]!', toned && 'text-onlime/80')}>{stat.label}</Label>
      {stat.options ? (
        <Select
          value={value}
          onChange={(v) => setValue(stat.key, v, { shouldDirty: true })}
          options={stat.options.map((o) => [o, o])}
          placeholder={stat.placeholder}
          className={cx('mt-1 pb-1 font-serif text-[21px] leading-tight', !toned && 'border-b border-dashed border-line')}
        />
      ) : stat.range ? (
        <div className="mt-1 flex items-baseline gap-2 font-serif text-[21px]">
          {['min', 'max'].map((end, i) => (
            <span key={end} className="contents">
              {i === 1 && <span className="text-ink-2">–</span>}
              <input
                type="number"
                min="0"
                {...register(`${stat.key}.${end}`, { setValueAs: (v) => (v === '' || v === null ? null : Number(v)) })}
                placeholder={end === 'min' ? 'From' : 'To'}
                className={cx(lineInput, 'w-20 [appearance:textfield]')}
              />
            </span>
          ))}
          <span className="text-[16px] text-ink-2">{stat.range}</span>
        </div>
      ) : (
        <Pair en={`en.${stat.key}`} ta={`ta.${stat.key}`} placeholder={stat.placeholder} className={cls} stacked />
      )}
      <FieldError name={stat.range ? `${stat.key}.max` : stat.key} />
    </div>
  )
}

export function TraitFields({ cfg }) {
  const { watch } = useFormContext()
  const [open, setOpen] = useState(null)
  const lists = useTagLists(cfg.kind)
  const rowsOf = (t) => t.fields.map((f) => ({ label: f.label, path: `${t.key}.${f.key}`, en: `en.${t.key}.${f.key}`, ta: `ta.${t.key}.${f.key}` }))
  // Cards show the full English text; editing both languages happens in the group's modal.
  return (
    <>
      <div className={cx('grid gap-3', cfg.traits.length > 2 ? 'grid-cols-3' : 'grid-cols-2')}>
        {cfg.traits.map((t) => (
          <TraitCard key={t.key} title={t.label} action={<EditButton rows={rowsOf(t)} onClick={() => setOpen(t)} />}>
            {rowsOf(t).map((r) => (
              <TraitRow key={r.en} label={r.label}>
                <button type="button" onClick={() => setOpen(t)} className={cx('w-full text-left hover:text-moss', !watch(r.en) && 'text-ink-3')}>
                  {watch(r.en) || `Add ${r.label.toLowerCase()}`}
                </button>
                {lists.has(r.path) && <TagPicker path={r.path} list={lists.get(r.path)} text={watch(r.en)} />}
              </TraitRow>
            ))}
          </TraitCard>
        ))}
      </div>
      {open && <TextDialog title={open.label} rows={rowsOf(open)} onClose={() => setOpen(null)} />}
    </>
  )
}

// A row's master-list choices, which the list page filters on. Options the row's text mentions but that are
// not chosen yet are offered as dashed suggestions.
function TagPicker({ path, list, text }) {
  const { watch, setValue } = useFormContext()
  // Row paths hold a dot ('grow.sunlight'), so the tag map is read and written whole rather than by path.
  const tags = watch('tags') || {}
  const ids = tags[path] || []
  const set = (next) => setValue('tags', { ...tags, [path]: next }, { shouldDirty: true })
  const toggle = (id) => set(ids.includes(id) ? ids.filter((x) => x !== id) : list.multi ? [...ids, id] : [id])
  const chosen = list.options.filter((o) => ids.includes(o.id))
  const suggested = (list.multi || !ids.length ? optionsIn(text, list.options) : []).filter((o) => !ids.includes(o.id))
  const mark = (o) =>
    list.colour ? (
      <span className="size-3 shrink-0 rounded-full border border-ink/25" style={{ background: o.hex }} />
    ) : (
      hasKeyIcon(o.id) && ['lifeCycle', 'leafStyle', 'arrangement'].includes(list.key) && <KeyIcon name={o.id} className="size-4 shrink-0" />
    )
  return (
    <div className="mt-1.5 flex flex-wrap items-center gap-1.5 text-[12px]">
      {chosen.map((o) => (
        <span key={o.id} className="flex items-center gap-1 rounded-full bg-lime py-0.5 pl-2 pr-1.5 text-onlime">
          {mark(o)} {o.en}
          <button type="button" aria-label={`Remove ${o.en}`} onClick={() => toggle(o.id)} className="opacity-60 hover:opacity-100">
            <X className="size-3" />
          </button>
        </span>
      ))}
      {suggested.map((o) => (
        <button
          key={o.id}
          type="button"
          title="Suggested from the text; click to tag"
          onClick={() => toggle(o.id)}
          className="flex items-center gap-1 rounded-full border border-dashed border-ink-3 px-2 py-0.5 text-ink-2 hover:border-ink hover:text-ink"
        >
          <Plus className="size-3" /> {mark(o)} {o.en}
        </button>
      ))}
      <Popover
        className="max-h-72 w-56 overflow-y-auto py-1"
        trigger={({ toggle: open }) => (
          <button type="button" onClick={open} className="rounded-full px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-[0.16em] text-ink-3 hover:text-ink">
            {chosen.length ? 'Change' : `Tag ${list.label.toLowerCase()}`}
          </button>
        )}
      >
        {(close) =>
          list.options.map((o) => (
            <button
              key={o.id}
              type="button"
              onClick={() => (toggle(o.id), list.multi || close())}
              className="flex w-full items-center gap-2 px-3 py-1.5 text-left text-[13px] hover:bg-ink/5"
            >
              <Check className={cx('size-3.5 shrink-0', !ids.includes(o.id) && 'invisible')} strokeWidth={2.2} />
              {mark(o)}
              <span className="flex-1">{o.en}</span>
              {o.ta && <span className="text-ink-3">{o.ta}</span>}
            </button>
          ))
        }
      </Popover>
    </div>
  )
}

// Opens a group's modal. Lime once every field has its Tamil too.
function EditButton({ rows, onClick }) {
  const { watch } = useFormContext()
  const done = rows.filter((r) => watch(r.ta)?.trim()).length
  const tone = done === rows.length ? 'border-transparent bg-lime text-onlime' : 'border-line text-ink-2'
  return (
    <button
      type="button"
      onClick={onClick}
      title={`Edit · Tamil ${done} of ${rows.length} filled`}
      className={cx('grid size-7 place-items-center rounded-full border hover:border-ink hover:text-ink', tone)}
    >
      <Pencil className="size-3.5" />
    </button>
  )
}

const growing = cx(lineInput, 'resize-none text-[15px] leading-relaxed [field-sizing:content]')

// One group's fields in full: English and Tamil side by side, each box growing to fit its text.
export function TextDialog({ title, rows, onClose }) {
  const { register } = useFormContext()
  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/25 p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <Card className="flex max-h-[85vh] w-full max-w-[880px] flex-col shadow-2xl">
        <div className="flex items-center gap-3 border-b border-line px-6 py-4">
          <Kicker sub="saved as you type">{title}</Kicker>
          <Button className="ml-auto px-3 py-1.5 text-[13px]" onClick={onClose}>
            Done
          </Button>
        </div>
        <div className="overflow-y-auto px-6 pb-4">
          <div className="grid grid-cols-[9rem_1fr_1fr] gap-5 border-b border-line py-2.5">
            <span />
            <Label>English</Label>
            <Label>தமிழ்</Label>
          </div>
          {rows.map((r, i) => (
            <div key={r.en} className="grid grid-cols-[9rem_1fr_1fr] items-start gap-5 border-b border-line py-3.5">
              <span className="pt-0.5 text-[15px] text-ink-2">{r.label}</span>
              <textarea {...register(r.en)} rows={1} autoFocus={i === 0} placeholder={`Add ${r.label.toLowerCase()}`} className={growing} />
              <textarea {...register(r.ta)} rows={1} placeholder={TA_PLACEHOLDER} className={growing} />
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export function GroupField() {
  return (
    <Pair en="en.group" ta="ta.group" placeholder="e.g. Pests, Beneficial, Livestock" className={cx(lineInput, 'text-[14px]')} />
  )
}

export function LifeCycleField() {
  const { control, register, getValues, setValue } = useFormContext()
  const { fields, append, remove } = useFieldArray({ control, name: 'en.lifeCycle' })
  // Tamil stages line up with the English ones by position, so they are added and removed together.
  const tamil = () => getValues('ta.lifeCycle') || []
  const add = () => {
    append(blankStage())
    setValue('ta.lifeCycle', [...tamil(), blankStage()], { shouldDirty: true })
  }
  const drop = (i) => {
    remove(i)
    setValue('ta.lifeCycle', tamil().filter((_, j) => j !== i), { shouldDirty: true })
  }
  return (
    <section>
      <Kicker>Life cycle</Kicker>
      <div className="mt-3 grid grid-cols-4 gap-2">
        {fields.map((f, i) => (
          <Card key={f.id} className="relative space-y-1.5 px-4 py-4">
            <div className="flex items-center gap-1 font-mono text-[11px] text-ink-2">
              {String(i + 1).padStart(2, '0')} ·
              <input {...register(`en.lifeCycle.${i}.duration`)} placeholder="duration" className="min-w-0 flex-1 bg-transparent outline-none" />
              <input {...register(`ta.lifeCycle.${i}.duration`)} placeholder={TA_PLACEHOLDER} className="min-w-0 flex-1 bg-transparent outline-none" />
              <Remove onClick={() => drop(i)} />
            </div>
            <Pair en={`en.lifeCycle.${i}.stage`} ta={`ta.lifeCycle.${i}.stage`} placeholder="Stage" className={cx(lineInput, 'font-serif text-[20px]')} stacked />
            <Pair as="textarea" en={`en.lifeCycle.${i}.text`} ta={`ta.lifeCycle.${i}.text`} rows={2} placeholder="What happens" className={cx(lineInput, 'resize-none text-[13px]')} stacked />
          </Card>
        ))}
        <button
          type="button"
          onClick={add}
          className="flex min-h-28 items-center justify-center gap-1 rounded-md border border-dashed border-ink-3 text-[13px] font-medium text-ink-2"
        >
          <Plus className="size-4" /> Add stage
        </button>
      </div>
    </section>
  )
}

export function ArticleField() {
  return (
    <section>
      <Kicker className="mb-3" sub="blank lines start a new paragraph">
        In depth
      </Kicker>
      <div className="grid grid-cols-2 gap-3">
        <Label>English</Label>
        <Label>தமிழ்</Label>
      </div>
      <Pair
        as="textarea"
        en="en.article"
        ta="ta.article"
        rows={14}
        placeholder="Write about this in depth"
        className={cx(lineInput, 'mt-2 resize-y font-serif text-[16.5px] leading-[1.7]')}
      />
    </section>
  )
}

export function NotesFields({ cfg }) {
  return (
    <section className="border-t border-line">
      <div className="grid grid-cols-[8rem_1fr] gap-4 border-b border-line py-2.5">
        <span />
        <div className="grid grid-cols-2 gap-3">
          <Label>English</Label>
          <Label>தமிழ்</Label>
        </div>
      </div>
      {cfg.notes.map((n) => (
        <div key={n.key} className="grid grid-cols-[8rem_1fr] gap-4 border-b border-line py-6">
          <Label className="pt-1.5">{n.label}</Label>
          <Pair
            as="textarea"
            en={`en.notes.${n.key}`}
            ta={`ta.notes.${n.key}`}
            rows={4}
            placeholder={`Add ${n.label.toLowerCase()}`}
            className={cx(lineInput, 'resize-y font-serif text-[16.5px] leading-[1.6]')}
          />
        </div>
      ))}
    </section>
  )
}
