import './index.css'
import UserChat from './pages/UserChat'
import AdminDashboard from './pages/AdminDashboard'

function App() {
  const isAdmin = window.location.pathname.startsWith('/admin')
  return isAdmin ? <AdminDashboard /> : <UserChat />
}

export default App
