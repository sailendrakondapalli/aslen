import { useState, useEffect } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu, X, LogOut, LayoutDashboard } from 'lucide-react'
import { useAuthStore } from '../store/authStore'

const NAV_LINKS = [
  { label: 'Home', href: '/#home' },
  { label: 'Services', href: '/#services' },
  { label: 'Portfolio', href: '/#portfolio' },
  { label: 'About', href: '/#about' },
  { label: 'Contact', href: '/#contact' },
]

export default function Navbar() {
  const [open, setOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const { user, signOut } = useAuthStore()
  const navigate = useNavigate()
  const location = useLocation()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', onScroll)
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(10,15,46,0.97)' : 'rgba(10,15,46,0.85)',
        backdropFilter: 'blur(12px)',
        borderBottom: scrolled ? '1px solid rgba(255,255,255,0.08)' : 'none',
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2">
            <img src="/logo.png" alt="ASLEN TECH SOLUTIONS" className="h-9 w-9 rounded-full object-cover" />
            <span className="text-white font-black text-base tracking-wide">ASLEN TECH</span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href}
                className="text-white/70 hover:text-white text-sm font-medium transition-colors">
                {l.label}
              </a>
            ))}
          </div>

          {/* Desktop auth */}
          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <button onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition-colors">
                  <LayoutDashboard size={15} /> Dashboard
                </button>
                <button onClick={handleSignOut}
                  className="flex items-center gap-1.5 text-white/70 hover:text-white text-sm font-medium transition-colors">
                  <LogOut size={15} /> Sign Out
                </button>
              </>
            ) : (
              <Link to="/login"
                className="btn-navy px-4 py-2 rounded-lg text-sm font-semibold">
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile toggle */}
          <button className="md:hidden text-white p-1" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden px-4 pb-4 pt-2 space-y-2"
          style={{ background: 'rgba(10,15,46,0.98)' }}>
          {NAV_LINKS.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)}
              className="block text-white/80 hover:text-white py-2 text-sm font-medium border-b border-white/10">
              {l.label}
            </a>
          ))}
          {user ? (
            <>
              <button onClick={() => { navigate('/dashboard'); setOpen(false) }}
                className="block w-full text-left text-white/80 hover:text-white py-2 text-sm font-medium">
                Dashboard
              </button>
              <button onClick={() => { handleSignOut(); setOpen(false) }}
                className="block w-full text-left text-white/80 hover:text-white py-2 text-sm font-medium">
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)}
              className="block btn-navy text-center px-4 py-2 rounded-lg text-sm font-semibold mt-2">
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
