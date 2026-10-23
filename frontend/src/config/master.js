import { useCallback, useMemo } from 'react'
import { useQuery } from '@tanstack/react-query'
import { api } from '../api/client'
import { useApp } from '../store/useApp'

// Master lists: the fixed choices trait rows are tagged with (sunlight, colour, order…), edited on /admin/lists.
// Items keep their choices in `tags`, keyed by row: tags['grow.sunlight'] = ['full-sun'].
const NONE = []

export function useMasterLists() {
  const { data = NONE } = useQuery({ queryKey: ['master'], queryFn: () => api.get('/master'), staleTime: 5 * 60_000 })
  return data
}

// The lists one kind uses, as row path -> list, e.g. 'flower.colour' -> the colour list.
export function useTagLists(kind) {
  const lists = useMasterLists()
  return useMemo(() => new Map(lists.flatMap((l) => (l.fields[kind] || []).map((path) => [path, l]))), [lists, kind])
}

// An option's name in the reader's language.
export const useOptionLabel = () => {
  const ta = useApp((s) => s.lang) === 'ta'
  return useCallback((o) => (ta && o.ta) || o.en, [ta])
}

// An item's chosen options for one row, in the list's order. Options since deleted are skipped.
export const tagged = (item, path, list) => {
  const ids = item.tags?.[path] || []
  return list ? list.options.filter((o) => ids.includes(o.id)) : []
}

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

// The options a phrase mentions, in the order it mentions them; the longer term wins where two overlap.
// Mirrors optionsIn in the backend's core/master.js, which tags the seed data the same way.
export function optionsIn(text, options) {
  const lower = String(text || '').toLowerCase()
  if (!lower.trim()) return []
  const terms = options
    .flatMap((o) => [o.en, o.ta, ...(o.aliases || [])].filter(Boolean).map((term) => ({ term: term.toLowerCase(), o })))
    .sort((a, b) => b.term.length - a.term.length)
  const taken = []
  for (const { term, o } of terms) {
    const re = new RegExp(/^[a-z]/.test(term) ? `\\b${escape(term)}` : escape(term), 'g')
    for (const m of lower.matchAll(re)) {
      const span = [m.index, m.index + term.length]
      if (!taken.some((t) => span[0] < t.span[1] && t.span[0] < span[1])) taken.push({ span, o })
    }
  }
  return [...new Set(taken.sort((a, b) => a.span[0] - b.span[0]).map((t) => t.o))]
}
