import axios from 'axios'
import { useApp } from '../store/useApp'

export const api = axios.create({ baseURL: '/api' })

api.interceptors.request.use((config) => {
  const token = useApp.getState().token
  if (token) config.headers['x-auth-token'] = token
  return config
})

api.interceptors.response.use(
  (res) => res.data,
  (err) => {
    if (err.response?.status === 401) useApp.getState().setToken(null)
    return Promise.reject(err)
  },
)

export const mediaUrl = (key) => `${import.meta.env.VITE_MEDIA_URL || ''}/${key}`

export async function uploadPhoto(kind, id, file) {
  const { key, uploadUrl } = await api.post('/uploads', { kind, id, contentType: file.type })
  await axios.put(uploadUrl, file, { headers: { 'Content-Type': file.type } })
  return key
}

export const errorText = (err) => err?.response?.data?.issues?.[0]?.message || err?.response?.data?.error || 'Something went wrong'
