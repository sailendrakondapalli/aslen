import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { useAuthStore } from './store/authStore'
import Navbar from './components/Navbar'
import Footer from './components/Footer'
import ProtectedRoute from './components/ProtectedRoute'
import Home from './pages/Home'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import ServiceDetail from './pages/ServiceDetail'
import AdminDashboard from './pages/AdminDashboard'

export default function App() {
  const initialize = useAuthStore((s) => s.initialize)

  useEffect(() => {
    const cleanup = initialize()
    return cleanup
  }, [])

  // Don't block render — user is hydrated from cache instantly
  // loading only affects protected route redirects, not the whole UI
  return (
    <BrowserRouter>
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Navbar />
      <Routes>
        <Route path="/" element={<><Home /><Footer /></>} />
        <Route path="/login" element={<Login />} />
        <Route path="/services/:id" element={<><ServiceDetail /><Footer /></>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  )
}
