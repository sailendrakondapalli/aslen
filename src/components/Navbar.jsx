import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Menu, X, LogOut, LayoutDashboard, ShieldCheck } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { ADMIN_EMAILS } from '../data/services'
import toast from 'react-hot-toast'

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const isAdmin = user && ADMIN_EMAILS.includes(user.email)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out')
    navigate('/')
    setOpen(false)
  }

  const navLinks = [
    { label: 'Home', href: '/#home' },
    { label: 'Services', href: '/#services' },
    { label: 'About', href: '/#about' },
    { label: 'Contact', href: '/#contact' },
    { label: 'Feedback', href: '/feedback' },
  ]

  const navBg = scrolled
    ? 'bg-white/95 backdrop-blur-md shadow-sm'
    : 'bg-transparent'

  const linkColor = scrolled ? 'text-gray-700 hover:text-red-600' : 'text-white/90 hover:text-white'
  const logoTextColor = scrolled ? 'text-gray-900' : 'text-white'
  const logoSubColor = scrolled ? 'text-gray-400' : 'text-white/60'

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${navBg}`}
      style={scrolled ? { borderBottom: '1px solid #fee2e2' } : {}}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #7f1d1d, #dc2626)' }}>
              <span className="text-white font-black text-sm">A</span>
            </div>
            <div className="leading-tight">
              <span className={`font-black text-lg tracking-tight ${logoTextColor}`}>ASLEN</span>
              <span className={`hidden sm:inline text-xs ml-1 ${logoSubColor}`}>TECH SOLUTIONS</span>
            </div>
          </Link>

          {/* Desktop nav links */}
          <div className="hidden md:flex items-center gap-6">
            {navLinks.map((l) => (
              <a key={l.label} href={l.href} className={`text-sm font-medium transition-colors ${linkColor}`}>
                {l.label}
              </a>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <div className="flex items-center gap-3">
                {isAdmin && (
                  <button onClick={() => navigate('/admin')}
                    className={`flex items-center gap-1 text-sm font-semibold transition-colors ${scrolled ? 'text-red-700 hover:text-red-900' : 'text-red-300 hover:text-white'}`}>
                    <ShieldCheck size={15} /> Admin
                  </button>
                )}
                <button onClick={() => navigate('/dashboard')}
                  className={`flex items-center gap-1 text-sm transition-colors ${linkColor}`}>
                  <LayoutDashboard size={15} /> Dashboard
                </button>
                <img
                  src={user.user_metadata?.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(user.user_metadata?.full_name || 'U')}&background=dc2626&color=fff`}
                  alt="avatar"
                  className="w-8 h-8 rounded-full object-cover border-2 border-red-200 cursor-pointer"
                  onClick={() => navigate('/dashboard')}
                />
                <button onClick={handleSignOut} className="text-red-400 hover:text-red-600 transition-colors">
                  <LogOut size={16} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="btn-navy px-4 py-2 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button
            className={`md:hidden p-2 transition-colors ${scrolled ? 'text-gray-700' : 'text-white'}`}
            onClick={() => setOpen(!open)}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu — always solid white when open */}
      {open && (
        <div className="md:hidden bg-white border-t border-red-100 px-4 py-4 space-y-3 shadow-lg">
          {navLinks.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)}
              className="block text-gray-700 font-medium py-1 hover:text-red-600 transition-colors">
              {l.label}
            </a>
          ))}
          <div className="pt-2 border-t border-gray-100">
            {user ? (
              <div className="space-y-2">
                {isAdmin && (
                  <button onClick={() => { navigate('/admin'); setOpen(false) }}
                    className="flex items-center gap-2 text-red-700 font-semibold w-full">
                    <ShieldCheck size={16} /> Admin Panel
                  </button>
                )}
                <button onClick={() => { navigate('/dashboard'); setOpen(false) }}
                  className="flex items-center gap-2 text-gray-700 font-medium w-full">
                  <LayoutDashboard size={16} /> Dashboard
                </button>
                <button onClick={handleSignOut}
                  className="flex items-center gap-2 text-red-500 font-medium w-full">
                  <LogOut size={16} /> Sign Out
                </button>
              </div>
            ) : (
              <Link to="/login" onClick={() => setOpen(false)}
                className="block btn-navy text-white text-center px-4 py-2 rounded-lg font-semibold">
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  )
}
