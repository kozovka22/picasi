
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home from './pages/Home.jsx'
import Login from './pages/Login.jsx'
import AdminDashboard from './pages/AdminDashboard.jsx'
import AdminLogs from './pages/AdminLogs.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

function App(){
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/admin" element={
          <ProtectedRoute>
            <AdminDashboard />
          </ProtectedRoute>
        } />
        <Route path="/admin/logs" element={
          <ProtectedRoute>
            <AdminLogs />
          </ProtectedRoute>
        } />
      </Routes>
    </BrowserRouter>
  )
}

export default App