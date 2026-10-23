import { Check } from 'lucide-react'
import { cx } from '../../components/ui'

export default function EditorBar({ title, status, dirty, saveState, onStatus, onLeft, onPublish }) {
  const published = status === 'published'
  const saved = {
    idle: 'Nothing saved yet',
    saving: 'Saving…',
    error: 'Could not save, will retry',
    saved: published ? (dirty ? 'Saved · not live yet' : 'Saved · live') : 'Draft saved · just now',
  }[saveState]
  const segment = (value, dot, label) => (
    <button
      type="button"
      onClick={() => value !== status && onStatus(value)}
      className={cx('flex items-center gap-1.5 rounded-full px-3 py-1 text-[12px] font-semibold', value === status ? 'bg-[#f8f8f3] text-onlime' : 'text-[#f8f8f3]')}
    >
      <span className={cx('size-1.5 rounded-full', dot)} /> {label}
    </button>
  )

  return (
    <div className="sticky top-0 z-30 bg-bar text-[#f8f8f3]">
      <div className="flex h-[52px] items-center gap-5 px-10">
        <span className="font-mono text-[11px] font-medium uppercase tracking-[0.24em]">{title}</span>
        <div className="flex rounded-full bg-white/12 p-0.5">
          {segment('draft', 'bg-amber', 'Draft')}
          {segment('published', 'bg-lime', 'Published')}
        </div>
        <span className="flex items-center gap-1.5 text-[12px] text-white/75">
          {saveState === 'saved' && <Check className="size-3.5" />} {saved}
        </span>
        <button type="button" onClick={onLeft} className="ml-auto px-3 py-1.5 text-[13px] font-semibold">
          {published ? 'Done' : 'Discard'}
        </button>
        <button
          type="button"
          onClick={onPublish}
          disabled={published && !dirty}
          className="rounded-[4px] bg-lime px-4 py-2 text-[13px] font-semibold text-onlime disabled:cursor-default"
        >
          {!published ? 'Publish' : dirty ? 'Update live page' : 'Up to date'}
        </button>
      </div>
    </div>
  )
}
