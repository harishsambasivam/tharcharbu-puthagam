import { useSyncExternalStore } from 'react'

const query = window.matchMedia('(max-width: 767px)')
const subscribe = (cb) => {
  query.addEventListener('change', cb)
  return () => query.removeEventListener('change', cb)
}

export const useIsMobile = () => useSyncExternalStore(subscribe, () => query.matches)
