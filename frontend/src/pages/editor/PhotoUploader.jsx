import { useRef, useState } from 'react'
import { useFormContext } from 'react-hook-form'
import { Upload, X } from 'lucide-react'
import { errorText, uploadPhoto } from '../../api/client'
import { Button, Photo, cx, lineInput } from '../../components/ui'
import { TA_PLACEHOLDER } from './Fields'
import { blankCaption } from './form'

// Photos go straight to S3 with a presigned URL; the first photo is the main one.
export default function PhotoUploader({ kind, ensureId }) {
  const { watch, setValue, formState } = useFormContext()
  const captionError = (i) => formState.errors.en?.photos?.[i]?.caption?.message
  // The files live in `photos`; their captions in `en.photos` and `ta.photos`, lined up by position,
  // so all three lists change together.
  const photos = watch('photos') || []
  const captions = { en: watch('en.photos') || [], ta: watch('ta.photos') || [] }
  const padded = (lang) => photos.map((_, i) => captions[lang][i] || blankCaption())
  const setAll = (change) => {
    setValue('photos', change(photos), { shouldDirty: true })
    for (const lang of ['en', 'ta']) setValue(`${lang}.photos`, change(padded(lang)), { shouldDirty: true })
  }
  const input = useRef()
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const [dragging, setDragging] = useState(null)

  async function upload(files) {
    const images = [...files].filter((f) => f.type.startsWith('image/'))
    if (!images.length) return
    setBusy(true)
    setError('')
    try {
      const id = await ensureId()
      const keys = []
      for (const file of images) keys.push(await uploadPhoto(kind, id, file))
      setValue('photos', [...photos, ...keys.map((key) => ({ key, hint: '' }))], { shouldDirty: true })
      for (const lang of ['en', 'ta']) setValue(`${lang}.photos`, [...padded(lang), ...keys.map(blankCaption)], { shouldDirty: true })
    } catch (err) {
      setError(errorText(err))
    } finally {
      setBusy(false)
    }
  }

  const text = (i, field, lang = 'en') => ({
    value: captions[lang][i]?.[field] ?? '',
    onChange: (e) =>
      setValue(`${lang}.photos`, padded(lang).map((x, j) => (j === i ? { ...x, [field]: e.target.value } : x)), { shouldDirty: true }),
  })

  const move = (from, to) =>
    setAll((list) => {
      const next = [...list]
      next.splice(to, 0, next.splice(from, 1)[0])
      return next
    })

  return (
    <div className="space-y-2">
      <div
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault()
          upload(e.dataTransfer.files)
        }}
        className="stripes flex aspect-[4/3] flex-col items-center justify-center rounded-md border border-dashed border-ink-3 p-6 text-center"
      >
        <Upload className="size-9" strokeWidth={1.4} />
        <p className="mt-3 text-[14px]">
          {photos.length ? `${photos.length} photo${photos.length > 1 ? 's' : ''} · drag to reorder, drop more here` : 'Drop photos here, or upload. The first one becomes the main photo.'}
        </p>
        <Button className="mt-4" disabled={busy} onClick={() => input.current.click()}>
          {busy ? 'Uploading…' : 'Upload photos'}
        </Button>
        {error && <p className="mt-2 text-[12px] text-[#b4472e]">{error}</p>}
        <input ref={input} type="file" accept="image/*" multiple hidden onChange={(e) => upload(e.target.files)} />
      </div>

      {photos.map((p, i) => (
        <div
          key={p.key || i}
          draggable
          onDragStart={() => setDragging(i)}
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault()
            e.stopPropagation()
            if (dragging !== null) move(dragging, i)
            setDragging(null)
          }}
          className={cx('flex cursor-grab items-center gap-3 rounded-md border bg-card p-2', i === 0 ? 'border-ink' : 'border-line')}
        >
          <Photo photo={{ ...p, ...captions.en[i] }} className="size-12 shrink-0 rounded-[3px]" />
          <div className="grid flex-1 grid-cols-[8rem_1fr] gap-x-3 gap-y-1">
            <input {...text(i, 'label')} placeholder={i === 0 ? 'Label · main photo' : 'Label, e.g. Flower'} className={cx(lineInput, 'text-[13px]')} />
            <input
              {...text(i, 'caption')}
              placeholder={captionError(i) || 'Caption (required)'}
              className={cx(lineInput, 'text-[13px]', captionError(i) && 'border-[#b4472e] placeholder:text-[#b4472e]')}
            />
            <input {...text(i, 'label', 'ta')} placeholder={TA_PLACEHOLDER} className={cx(lineInput, 'text-[13px]')} />
            <input {...text(i, 'caption', 'ta')} placeholder={TA_PLACEHOLDER} className={cx(lineInput, 'text-[13px]')} />
          </div>
          <button type="button" onClick={() => setAll((list) => list.filter((_, j) => j !== i))} aria-label="Remove photo" className="text-ink-2 hover:text-ink">
            <X className="size-4" />
          </button>
        </div>
      ))}
    </div>
  )
}
