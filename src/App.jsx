import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useNavigate, useLocation } from 'react-router-dom'
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
import Feedback from './pages/Feedback'
import PrivacyPolicy from './pages/PrivacyPolicy'
import RefundPolicy from './pages/RefundPolicy'
import CancellationPolicy from './pages/CancellationPolicy'

// Scroll to top on every route change
function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => { window.scrollTo(0, 0) }, [pathname])
  return null
}

// Inner component so useNavigate works inside BrowserRouter
function AppInner() {
  const initialize = useAuthStore((s) => s.initialize)
  const navigate = useNavigate()

  useEffect(() => {
    const cleanup = initialize(navigate)
    return cleanup
  }, [])

  return (
    <>
      <ScrollToTop />
      <Toaster position="top-right" toastOptions={{ duration: 3000 }} />
      <Navbar />
      <Routes>
        <Route path="/" element={<><Home /><Footer /></>} />
        <Route path="/login" element={<Login />} />
        <Route path="/services/:id" element={<><ServiceDetail /><Footer /></>} />
        <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />
        <Route path="/feedback" element={<><Feedback /><Footer /></>} />
        <Route path="/Policy/PrivacyPolicy" element={<><PrivacyPolicy /><Footer /></>} />
        <Route path="/Policy/RefundPolicy" element={<><RefundPolicy /><Footer /></>} />
        <Route path="/Policy/CancellationPolicy" element={<><CancellationPolicy /><Footer /></>} />
      </Routes>
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <AppInner />
    </BrowserRouter>
  )
}
