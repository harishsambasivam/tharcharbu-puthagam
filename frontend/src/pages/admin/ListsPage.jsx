import { useMemo, useState } from 'react'
import { useQueries, useQueryClient } from '@tanstack/react-query'
import { ArrowDown, ArrowUp, Plus, Trash2 } from 'lucide-react'
import { api, errorText } from '../../api/client'
import { KINDS } from '../../config/kinds'
import { useMasterLists } from '../../config/master'
import DesktopHeader from '../../layout/DesktopHeader'
import { Button, Card, Kicker, Label, cx, lineInput } from '../../components/ui'

const ONE = Object.fromEntries(Object.values(KINDS).map((k) => [k.kind, k]))

// Where a list is used, e.g. "Plants, Trees · flower colour, fruit colour".
function usedIn(list) {
  const kinds = Object.keys(list.fields).map((k) => ONE[k]?.label)
  const rows = [...new Set(Object.values(list.fields).flat())].map((p) => p.replace('.', ' ').replace(/([A-Z])/g, ' $1').toLowerCase())
  return `${kinds.join(', ')} · ${rows.join(', ')}`
}

const slug = (s) =>
  s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40) || 'option'

// Hidden route: /admin/lists. The choices trait rows are tagged with, which the list pages filter on.
export default function ListsPage() {
  const lists = useMasterLists()
  const [key, setKey] = useState(null)
  const list = lists.find((l) => l.key === key) || lists[0]
  // Every item of every kind, to count how many use each option.
  const all = useQueries({ queries: Object.values(KINDS).map((k) => ({ queryKey: [k.route, 'list', true], queryFn: () => api.get(`/${k.route}`) })) })
  const items = all.flatMap((q) => q.data || [])

  return (
    <>
      <DesktopHeader wide />
      <main className="px-10 pb-20 pt-8">
        <h1 className="font-serif text-[40px] leading-none tracking-tight">Master lists</h1>
        <p className="mt-3 max-w-2xl text-[15px] text-ink-2">
          The choices a trait row can be tagged with. Readers filter the list pages by them, and the editor suggests them from the text you type.
        </p>
        <div className="mt-8 grid grid-cols-[17rem_1fr] items-start gap-8">
          <nav className="space-y-0.5">
            {lists.map((l) => (
              <button
                key={l.key}
                type="button"
                onClick={() => setKey(l.key)}
                className={cx('block w-full rounded-md px-3 py-2 text-left', l === list ? 'bg-card shadow-sm ring-1 ring-line' : 'hover:bg-ink/5')}
              >
                <span className="text-[15px] font-semibold">{l.label}</span> <span className="font-mono text-[11px] text-ink-3">{l.options.length}</span>
                <div className="truncate text-[12px] text-ink-2">{usedIn(l)}</div>
              </button>
            ))}
          </nav>
          {list && <ListEditor key={list.key} list={list} items={items} />}
        </div>
      </main>
    </>
  )
}

function ListEditor({ list, items }) {
  const qc = useQueryClient()
  const [rows, setRows] = useState(() => list.options.map((o) => ({ ...o, aliases: (o.aliases || []).join(', ') })))
  const [state, setState] = useState('')
  const [error, setError] = useState('')
  const count = useMemo(() => {
    const paths = Object.entries(list.fields)
    const n = {}
    for (const item of items)
      for (const [kind, ps] of paths) if (item.kind === kind) for (const p of ps) for (const id of item.tags?.[p] || []) n[id] = (n[id] || 0) + 1
    return n
  }, [items, list])

  const edit = (i, change) => {
    setRows(rows.map((r, j) => (j === i ? { ...r, ...change } : r)))
    setState('changed')
  }
  const move = (i, step) => {
    const next = [...rows]
    next.splice(i + step, 0, next.splice(i, 1)[0])
    setRows(next)
    setState('changed')
  }
  const remove = (i) => {
    const used = count[rows[i].id]
    if (used && !window.confirm(`${used} item${used > 1 ? 's use' : ' uses'} “${rows[i].en}”. Remove it? Those items lose this tag.`)) return
    setRows(rows.filter((_, j) => j !== i))
    setState('changed')
  }

  async function save() {
    setError('')
    setState('saving')
    // New options get an id from their English name; existing ids never change, so renaming keeps the tags.
    const taken = new Set(rows.filter((r) => r.id).map((r) => r.id))
    const options = rows.map(({ id, aliases, ...r }) => {
      let next = id
      if (!next) {
        next = slug(r.en)
        for (let n = 2; taken.has(next); n++) next = `${slug(r.en).slice(0, 36)}-${n}`
        taken.add(next)
      }
      return { ...r, id: next, aliases: aliases.split(',').map((a) => a.trim()).filter(Boolean) }
    })
    try {
      const saved = await api.put(`/master/${list.key}`, { options })
      setRows(saved.options.map((o) => ({ ...o, aliases: o.aliases.join(', ') })))
      qc.setQueryData(['master'], (old = []) => old.map((l) => (l.key === list.key ? saved : l)))
      setState('saved')
    } catch (err) {
      setError(errorText(err))
      setState('changed')
    }
  }

  const cols = list.colour ? 'grid-cols-[2rem_1fr_1fr_1fr_3.5rem_4.5rem]' : 'grid-cols-[1fr_1fr_1fr_3.5rem_4.5rem]'
  return (
    <Card className="px-6 pb-5 pt-5">
      <div className="flex items-center gap-4 border-b border-line pb-4">
        <div>
          <Kicker sub={list.multi ? 'several can be chosen' : 'one per row'}>{list.label}</Kicker>
          <p className="mt-1 text-[13px] text-ink-2">{usedIn(list)}</p>
        </div>
        <span className="ml-auto text-[13px] text-ink-2">{{ changed: 'Unsaved changes', saving: 'Saving…', saved: 'Saved' }[state]}</span>
        <Button onClick={save} disabled={state !== 'changed'}>
          Save list
        </Button>
      </div>
      {error && <p className="mt-3 text-[13px] text-[#b4472e]">{error}</p>}

      <div className={cx('grid items-center gap-x-4 border-b border-line py-2.5', cols)}>
        {list.colour && <span />}
        <Label>English</Label>
        <Label>தமிழ்</Label>
        <Label>Also matches</Label>
        <Label className="text-right">Used</Label>
        <span />
      </div>
      {rows.map((r, i) => (
        <div key={r.id || `new-${i}`} className={cx('grid items-start gap-x-4 border-b border-dashed border-line py-2.5', cols)}>
          {list.colour && (
            <input
              type="color"
              value={r.hex || '#9a9a95'}
              onChange={(e) => edit(i, { hex: e.target.value })}
              aria-label={`${r.en} colour`}
              className="mt-0.5 size-7 cursor-pointer rounded-full border border-line bg-transparent"
            />
          )}
          <div>
            <input value={r.en} onChange={(e) => edit(i, { en: e.target.value })} placeholder="English name" autoFocus={!r.id && !r.en} className={cx(lineInput, 'h-8 text-[15px]')} />
            <div className="mt-1 font-mono text-[10px] text-ink-3">{r.id || 'new · id set on save'}</div>
          </div>
          <input value={r.ta} onChange={(e) => edit(i, { ta: e.target.value })} placeholder="தமிழில்" className={cx(lineInput, 'h-8 text-[15px]')} />
          <input
            value={r.aliases}
            onChange={(e) => edit(i, { aliases: e.target.value })}
            placeholder="words, separated, by commas"
            title="Other words that mean this option, used to suggest tags from an item's text"
            className={cx(lineInput, 'h-8 text-[13px] text-ink-2')}
          />
          <span className="flex h-8 items-center justify-end font-mono text-[13px] text-ink-2">{count[r.id] || '—'}</span>
          <div className="flex h-8 items-center justify-end gap-1 text-ink-2">
            <button type="button" aria-label="Move up" disabled={i === 0} onClick={() => move(i, -1)} className="p-1 hover:text-ink disabled:opacity-30">
              <ArrowUp className="size-3.5" />
            </button>
            <button type="button" aria-label="Move down" disabled={i === rows.length - 1} onClick={() => move(i, 1)} className="p-1 hover:text-ink disabled:opacity-30">
              <ArrowDown className="size-3.5" />
            </button>
            <button type="button" aria-label={`Remove ${r.en}`} onClick={() => remove(i)} className="p-1 hover:text-[#b4472e]">
              <Trash2 className="size-3.5" />
            </button>
          </div>
        </div>
      ))}
      <button
        type="button"
        onClick={() => (setRows([...rows, { id: '', en: '', ta: '', aliases: '', ...(list.colour && { hex: '#9a9a95' }) }]), setState('changed'))}
        className="mt-4 flex items-center gap-1 rounded-full border border-dashed border-ink-3 px-3 py-1 text-[13px] font-medium text-ink-2 hover:text-ink"
      >
        <Plus className="size-3.5" /> Add option
      </button>
    </Card>
  )
}
