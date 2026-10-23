import { useEffect } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { KINDS } from './config/kinds'
import { useAdmin, useApp } from './store/useApp'
import ListPage from './pages/list/ListPage'
import DetailPage from './pages/detail/DetailPage'
import EditorPage from './pages/editor/EditorPage'
import AdminPage from './pages/admin/AdminPage'
import ListsPage from './pages/admin/ListsPage'

export default function App() {
  const theme = useApp((s) => s.theme)
  const lang = useApp((s) => s.lang)
  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])
  useEffect(() => {
    document.documentElement.lang = lang
  }, [lang])

  return (
    <Routes>
      <Route path="/" element={<Navigate to="/plants" replace />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/lists" element={<EditorsOnly page={ListsPage} />} />
      <Route path="/:route" element={<Section page={ListPage} />} />
      <Route path="/:route/new" element={<Section page={EditorPage} editor />} />
      <Route path="/:route/:id" element={<Section page={DetailPage} />} />
      <Route path="/:route/:id/edit" element={<Section page={EditorPage} editor />} />
      <Route path="*" element={<Navigate to="/plants" replace />} />
    </Routes>
  )
}

function EditorsOnly({ page: Page }) {
  return useAdmin() ? <Page /> : <Navigate to="/admin" replace />
}

function Section({ page: Page, editor }) {
  const { route, id } = useParams()
  const admin = useAdmin()
  if (!KINDS[route]) return <Navigate to="/plants" replace />
  if (editor && !admin) return <Navigate to="/admin" replace />
  // The editor keeps its key when a new item gets its id, so typing is not interrupted.
  return <Page key={editor ? route : `${route}/${id}`} />
}
