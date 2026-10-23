import { useEffect } from 'react'
import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import { GROUPS, KINDS } from './config/kinds'
import { useAdmin, useApp } from './store/useApp'
import ListPage from './pages/list/ListPage'
import DetailPage from './pages/detail/DetailPage'
import EditorPage from './pages/editor/EditorPage'
import AdminPage from './pages/admin/AdminPage'
import ListsPage from './pages/admin/ListsPage'
import HomePage from './pages/home/HomePage'
import ArticlesPage from './pages/articles/ArticlesPage'
import ArticlePage from './pages/articles/ArticlePage'
import ArticleEditorPage from './pages/articles/ArticleEditorPage'

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
      <Route path="/" element={<HomePage />} />
      <Route path="/admin" element={<AdminPage />} />
      <Route path="/admin/lists" element={<EditorsOnly page={ListsPage} />} />
      <Route path="/articles" element={<ArticlesPage />} />
      <Route path="/articles/new" element={<EditorsOnly page={ArticleEditorPage} />} />
      <Route path="/articles/:id" element={<ArticlePage />} />
      <Route path="/articles/:id/edit" element={<EditorsOnly page={ArticleEditorPage} />} />
      <Route path="/:route" element={<Group />} />
      <Route path="/:route/new" element={<Section page={EditorPage} editor />} />
      <Route path="/:route/:id" element={<Section page={DetailPage} />} />
      <Route path="/:route/:id/edit" element={<Section page={EditorPage} editor />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

function EditorsOnly({ page: Page }) {
  return useAdmin() ? <Page /> : <Navigate to="/admin" replace />
}

// /flora and /fauna list their kinds; the old one-kind lists (/plants) open the group narrowed to that kind.
function Group() {
  const { route } = useParams()
  if (GROUPS[route]) return <ListPage key={route} />
  return <Navigate to={KINDS[route]?.list || '/'} replace />
}

function Section({ page: Page, editor }) {
  const { route, id } = useParams()
  const admin = useAdmin()
  if (!KINDS[route]) return <Navigate to="/" replace />
  if (editor && !admin) return <Navigate to="/admin" replace />
  // The editor keeps its key when a new item gets its id, so typing is not interrupted.
  return <Page key={editor ? route : `${route}/${id}`} />
}
