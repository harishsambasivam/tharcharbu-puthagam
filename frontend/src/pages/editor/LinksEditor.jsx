import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Check, Search, X } from 'lucide-react'
import { api, errorText } from '../../api/client'
import { resolveLinks, useCatalog, useItem } from '../../api/queries'
import { LinkHeader, RELS } from '../../components/Links'
import { Button, Card, Kicker, cx, lineInput } from '../../components/ui'

// Each link is saved immediately, on this item and on the linked one.
export default function LinksEditor({ cfg, id, ensureId }) {
  const qc = useQueryClient()
  const catalog = useCatalog()
  const { data } = useItem(cfg.route, id)
  const links = data?.links || {}
  const [error, setError] = useState('')

  async function run(request) {
    setError('')
    try {
      await request(await ensureId())
      await qc.invalidateQueries()
    } catch (err) {
      setError(errorText(err))
    }
  }

  return (
    <section>
      <Kicker className="mb-3" sub="each link also appears on the other item's page">
        Links
      </Kicker>
      <div className="grid grid-cols-4 gap-3">
        {RELS.map((rel) => (
          <LinkColumn
            key={rel.key}
            rel={rel}
            catalog={catalog}
            list={resolveLinks(catalog, links[rel.key])}
            self={{ kind: cfg.kind, id }}
            onAdd={(target) =>
              run((itemId) =>
                api.post(`/${cfg.route}/${itemId}/links`, {
                  rel: rel.key,
                  target,
                }),
              )
            }
            onRemove={(l) => run((itemId) => api.delete(`/${cfg.route}/${itemId}/links/${rel.key}/${l.kind}/${l.id}`))}
          />
        ))}
      </div>
      {cfg.flora && (
        <CompanionsColumn
          catalog={catalog}
          list={resolveLinks(catalog, links.companions)}
          self={{ kind: cfg.kind, id }}
          onSave={(target, note) =>
            run((itemId) =>
              api.post(`/${cfg.route}/${itemId}/links`, {
                rel: 'companions',
                target,
                note,
              }),
            )
          }
          onRemove={(l) => run((itemId) => api.delete(`/${cfg.route}/${itemId}/links/companions/${l.kind}/${l.id}`))}
        />
      )}
      {error && <p className="mt-2 text-[13px] text-[#b4472e]">{error}</p>}
    </section>
  )
}

function LinkColumn({ rel, catalog, list, self, onAdd, onRemove }) {
  return (
    <Card className="min-h-52 px-4 py-4">
      <LinkHeader rel={rel} />
      <LinkSearch catalog={catalog} list={list} self={self} onPick={onAdd} placeholder="Link a plant, insect, bird…" />
      <div className="mt-2">
        {list.map((l) => (
          <div key={`${l.kind}/${l.id}`} className="flex items-start justify-between gap-2 py-2.5">
            <div>
              <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-2">{l.kind}</div>
              <div className="text-[13px] font-semibold">{l.name}</div>
            </div>
            <button type="button" onClick={() => onRemove(l)} aria-label="Remove link" className="mt-2 text-ink-2 hover:text-ink">
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </Card>
  )
}

// Companions are plants or trees, linked both ways, each with a note on how the two help each other.
// Picking one opens its note to fill in; the link is saved with the note.
const FLORA = ['plant', 'tree']

function CompanionsColumn({ catalog, list, self, onSave, onRemove }) {
  const [adding, setAdding] = useState(null)
  return (
    <Card className="mt-3 px-4 py-4">
      <LinkHeader rel={{ title: 'Companion plants', tone: 'lime' }} />
      <LinkSearch catalog={catalog} list={list} self={self} only={FLORA} onPick={(target) => setAdding(catalog.get(`${target.kind}/${target.id}`))} placeholder="Add a companion plant or tree…" />
      <div className="mt-2 divide-y divide-line">
        {adding && <CompanionRow key="new" companion={adding} onSave={(note) => (onSave({ kind: adding.kind, id: adding.id }, note), setAdding(null))} onRemove={() => setAdding(null)} />}
        {list.map((l) => (
          <CompanionRow key={`${l.kind}/${l.id}`} companion={l} onSave={(note) => onSave({ kind: l.kind, id: l.id }, note)} onRemove={() => onRemove(l)} />
        ))}
      </div>
    </Card>
  )
}

function CompanionRow({ companion: c, onSave, onRemove }) {
  const saved = { en: c.note?.en || '', ta: c.note?.ta || '' }
  const [note, setNote] = useState(saved)
  const isNew = !c.note
  const changed = isNew || note.en !== saved.en || note.ta !== saved.ta
  const field = (lang, placeholder) => (
    <textarea value={note[lang]} onChange={(e) => setNote({ ...note, [lang]: e.target.value })} rows={2} maxLength={600} placeholder={placeholder} className={cx(lineInput, 'resize-y text-[13px]')} />
  )
  return (
    <div className="grid grid-cols-[12rem_1fr_1fr_auto] items-start gap-4 py-3">
      <div>
        <div className="font-mono text-[10px] uppercase tracking-[0.2em] text-ink-2">{c.kind}</div>
        <div className="text-[13px] font-semibold">{c.name}</div>
        <div className="text-[12px] text-ink-2">{c.names?.ta}</div>
      </div>
      {field('en', 'How they help each other')}
      {field('ta', 'தமிழில் (விருப்பம்)')}
      <div className="flex items-center gap-2">
        <Button variant={changed ? 'dark' : 'ghost'} disabled={!changed} onClick={() => onSave(note)} className="px-3 py-1.5 text-[13px]">
          <Check className="size-3.5" /> {isNew ? 'Add' : 'Save'}
        </Button>
        <button type="button" onClick={onRemove} aria-label={isNew ? 'Cancel' : 'Remove companion'} className="text-ink-2 hover:text-ink">
          <X className="size-4" />
        </button>
      </div>
    </div>
  )
}

// Finds an item to link. `only` limits it to some kinds; this item and ones already linked are left out.
export function LinkSearch({ catalog, list, self, only, onPick, placeholder }) {
  const [q, setQ] = useState('')
  const needle = q.trim().toLowerCase()
  const linked = new Set(list.map((l) => `${l.kind}/${l.id}`))
  const options = needle
    ? [...catalog.values()]
        .filter((o) => (!only || only.includes(o.kind)) && !(o.kind === self.kind && o.id === self.id) && !linked.has(`${o.kind}/${o.id}`))
        .filter((o) => [o.name, o.names?.ta, o.names?.en].some((v) => v?.toLowerCase().includes(needle)))
        .slice(0, 12)
    : []

  return (
    <div className="relative mt-3">
      <label className="flex items-center gap-2 rounded-[4px] border border-line px-3 py-2">
        <Search className="size-3.5 text-ink-2" />
        <input value={q} onChange={(e) => setQ(e.target.value)} placeholder={placeholder} className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-ink-2" />
      </label>
      {options.length > 0 && (
        <ul className="absolute inset-x-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-md border border-line bg-card py-1 shadow-xl">
          {options.map((o) => (
            <li key={`${o.kind}/${o.id}`}>
              <button
                type="button"
                onClick={() => {
                  onPick({ kind: o.kind, id: o.id })
                  setQ('')
                }}
                className="w-full px-3 py-2 text-left text-[13px] hover:bg-paper"
              >
                <span className="mr-2 font-mono text-[10px] uppercase tracking-[0.2em] text-ink-2">{o.kind}</span>
                {o.name} <span className="text-ink-2">{o.names?.ta}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
