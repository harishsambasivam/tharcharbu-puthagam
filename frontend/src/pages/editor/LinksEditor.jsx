import { useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { Search, X } from 'lucide-react'
import { api, errorText } from '../../api/client'
import { resolveLinks, useCatalog, useItem } from '../../api/queries'
import { LinkHeader, RELS } from '../../components/Links'
import { Card, Kicker } from '../../components/ui'

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
            onAdd={(target) => run((itemId) => api.post(`/${cfg.route}/${itemId}/links`, { rel: rel.key, target }))}
            onRemove={(l) => run((itemId) => api.delete(`/${cfg.route}/${itemId}/links/${rel.key}/${l.kind}/${l.id}`))}
          />
        ))}
      </div>
      {error && <p className="mt-2 text-[13px] text-[#b4472e]">{error}</p>}
    </section>
  )
}

function LinkColumn({ rel, catalog, list, self, onAdd, onRemove }) {
  const [q, setQ] = useState('')
  const needle = q.trim().toLowerCase()
  const linked = new Set(list.map((l) => `${l.kind}/${l.id}`))
  const options = needle
    ? [...catalog.values()]
        .filter((o) => !(o.kind === self.kind && o.id === self.id) && !linked.has(`${o.kind}/${o.id}`))
        .filter((o) => [o.name, o.names?.ta, o.names?.en].some((v) => v?.toLowerCase().includes(needle)))
        .slice(0, 12)
    : []

  return (
    <Card className="min-h-52 px-4 py-4">
      <LinkHeader rel={rel} />
      <div className="relative mt-3">
        <label className="flex items-center gap-2 rounded-[4px] border border-line px-3 py-2">
          <Search className="size-3.5 text-ink-2" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Link a plant, insect, bird…" className="min-w-0 flex-1 bg-transparent text-[13px] outline-none placeholder:text-ink-2" />
        </label>
        {options.length > 0 && (
          <ul className="absolute inset-x-0 top-full z-20 mt-1 max-h-60 overflow-y-auto rounded-md border border-line bg-card py-1 shadow-xl">
            {options.map((o) => (
              <li key={`${o.kind}/${o.id}`}>
                <button
                  type="button"
                  onClick={() => {
                    onAdd({ kind: o.kind, id: o.id })
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
