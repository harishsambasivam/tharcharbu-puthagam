import { useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { api } from './client'
import { useAdmin } from '../store/useApp'

export function useList(route) {
  const admin = useAdmin()
  return useQuery({ queryKey: [route, 'list', admin], queryFn: () => api.get(`/${route}`) })
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

// A link list with each entry's details filled in; links to items the viewer cannot see are left out.
export const resolveLinks = (catalog, list = []) => list.flatMap((l) => catalog.get(`${l.kind}/${l.id}`) || [])
