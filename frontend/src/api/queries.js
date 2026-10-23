import { useMemo } from 'react'
import { useQueries, useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from './client'
import { useAdmin } from '../store/useApp'

const listQuery = (route, admin) => ({ queryKey: [route, 'list', admin], queryFn: () => api.get(`/${route}`) })

export function useList(route) {
  return useQuery(listQuery(route, useAdmin()))
}

// Several sections' lists as one, in the order given; shares its cache with useList.
export function useLists(routes) {
  const admin = useAdmin()
  return useQueries({
    queries: routes.map((route) => listQuery(route, admin)),
    combine: (results) => ({ data: results.flatMap((r) => r.data || []), isLoading: results.some((r) => r.isLoading) }),
  })
}

export function useItem(route, id) {
  const admin = useAdmin()
  return useQuery({ queryKey: [route, id, admin], queryFn: () => api.get(`/${route}/${id}`), enabled: !!id })
}

// Copies an item into a new draft and opens it in the editor, e.g. to make a variety.
export function useClone(cfg) {
  const qc = useQueryClient()
  const navigate = useNavigate()
  return async (id) => {
    const copy = await api.post(`/${cfg.route}/${id}/clone`)
    qc.invalidateQueries({ queryKey: [cfg.route] })
    navigate(`/${cfg.route}/${copy.id}/edit`)
  }
}

// Every item across the five categories, light fields only (name, names, first photo).
// Links store just { kind, id }; this fills in what they show.
export function useCatalog() {
  const admin = useAdmin()
  const { data = [] } = useQuery({ queryKey: ['catalog', admin], queryFn: () => api.get('/catalog') })
  return useMemo(() => new Map(data.map((i) => [`${i.kind}/${i.id}`, i])), [data])
}

// A link list with each entry's details filled in (and a companion's note kept); links to items the viewer
// cannot see are left out.
export const resolveLinks = (catalog, list = []) =>
  list.flatMap((l) => {
    const entry = catalog.get(`${l.kind}/${l.id}`)
    return entry ? { ...entry, note: l.note } : []
  })
