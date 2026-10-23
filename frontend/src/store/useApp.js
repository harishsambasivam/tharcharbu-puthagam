import { useCallback } from 'react'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export const useApp = create(
  persist(
    (set) => ({
      theme: 'light',
      lang: 'en',
      token: null,
      columns: {},
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),
      toggleLang: () => set((s) => ({ lang: s.lang === 'ta' ? 'en' : 'ta' })),
      setToken: (token) => set({ token }),
      setColumns: (route, ids) => set((s) => ({ columns: { ...s.columns, [route]: ids } })),
    }),
    { name: 'tp-app' },
  ),
)

export const useAdmin = () => useApp((s) => !!s.token)
// Items arrive as shared fields plus two text documents, `en` and `ta`. This flattens one item for the
// chosen language; any Tamil field still blank shows the English instead.
const isGroup = (v) => v && typeof v === 'object' && !Array.isArray(v)
const fill = (ta, en) =>
  Array.isArray(en)
    ? en.map((v, i) => fill(ta?.[i], v))
    : isGroup(en)
      ? Object.fromEntries(Object.entries(en).map(([k, v]) => [k, fill(ta?.[k], v)]))
      : typeof ta === 'string' && ta.trim()
        ? ta
        : en

export function localize(item, lang) {
  const { en = {}, ta = {}, ...shared } = item
  const { photos: captions = [], ...text } = lang === 'ta' ? fill(ta, en) : en
  return { ...shared, ...text, photos: (shared.photos || []).map((p, i) => ({ ...p, ...captions[i] })) }
}

export const useLocalize = () => {
  const lang = useApp((s) => s.lang)
  return useCallback((item) => localize(item, lang), [lang])
}

export const useDisplayName = () => {
  const lang = useApp((s) => s.lang)
  return (item) => (lang === 'ta' && item.names?.ta) || item.name || 'Untitled'
}

// The line under the display name: the name in the other language, so the two never repeat.
export const useSubName = () => {
  const lang = useApp((s) => s.lang)
  return (item) => (lang === 'ta' ? item.names?.ta && item.name : item.names?.ta) || ''
}
