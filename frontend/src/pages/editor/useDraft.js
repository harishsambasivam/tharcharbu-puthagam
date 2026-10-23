import { useEffect, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQueryClient } from '@tanstack/react-query'
import { api, errorText } from '../../api/client'

const SAVE_DELAY = 700

// Saves a form to the database as it is typed, and publishes, unpublishes or discards it.
// New items are created on the first change, then edited in place. `listPath` is where Discard goes.
export function useDraft({ route, item, form, listPath }) {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [meta, setMeta] = useState({ id: item?.id, status: item?.status || 'draft', dirty: item?.dirty ?? true })
  const [saveState, setSaveState] = useState(item ? 'saved' : 'idle')
  const [error, setError] = useState('')
  const idRef = useRef(item?.id)
  const creating = useRef(null)
  const pending = useRef(null)
  const timer = useRef()

  function ensureId() {
    if (idRef.current) return Promise.resolve(idRef.current)
    creating.current ??= api.post(`/${route}`, form.getValues()).then((created) => {
      idRef.current = created.id
      qc.setQueryData([route, created.id, true], created)
      setMeta((m) => ({ ...m, id: created.id }))
      navigate(`/${route}/${created.id}/edit`, { replace: true })
      return created.id
    })
    return creating.current
  }

  async function flush() {
    clearTimeout(timer.current)
    const data = pending.current
    if (!data) return
    pending.current = null
    setSaveState('saving')
    try {
      const id = await ensureId()
      await api.put(`/${route}/${id}`, data)
      setMeta((m) => ({ ...m, dirty: true }))
      setSaveState('saved')
    } catch (err) {
      pending.current ??= data
      setSaveState('error')
      setError(errorText(err))
    }
  }

  useEffect(() => {
    const sub = form.watch((values) => {
      pending.current = values
      clearTimeout(timer.current)
      timer.current = setTimeout(flush, SAVE_DELAY)
    })
    return () => {
      sub.unsubscribe()
      flush().then(() => qc.invalidateQueries({ queryKey: [route] }))
    }
  }, [])

  const publish = form.handleSubmit(async () => {
    setError('')
    try {
      await flush()
      const id = await ensureId()
      await api.post(`/${route}/${id}/publish`)
      setMeta((m) => ({ ...m, status: 'published', dirty: false }))
      qc.invalidateQueries({ queryKey: [route] })
    } catch (err) {
      setError(errorText(err))
    }
  })

  async function unpublish() {
    if (!idRef.current) return
    await api.post(`/${route}/${idRef.current}/unpublish`)
    setMeta((m) => ({ ...m, status: 'draft' }))
    qc.invalidateQueries({ queryKey: [route] })
  }

  async function leave() {
    if (meta.status === 'published') return navigate(`/${route}/${idRef.current}`)
    if (!window.confirm('Discard this draft? It will be deleted.')) return
    clearTimeout(timer.current)
    pending.current = null
    if (idRef.current) await api.delete(`/${route}/${idRef.current}`)
    await qc.invalidateQueries()
    navigate(listPath)
  }

  return { meta, saveState, error, ensureId, publish, unpublish, leave }
}
