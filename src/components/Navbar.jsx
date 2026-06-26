import { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
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
    <nav className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{
        background: scrolled ? 'rgba(8,14,28,0.97)' : 'rgba(8,14,28,0.82)',
        backdropFilter: 'blur(14px)',
        borderBottom: scrolled ? '1px solid rgba(0,200,255,0.18)' : '1px solid rgba(0,200,255,0.1)',
        boxShadow: scrolled ? '0 4px 24px rgba(0,0,0,0.4)' : 'none',
        animation: 'fadeIn 0.6s ease both',
      }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <Link to="/" className="flex items-center gap-2.5">
            <img src="/newlogo.png" alt="ASLEN" className="h-10 w-auto object-contain" />
            <span className="text-white font-bold text-sm tracking-wide" style={{ fontFamily: 'Space Grotesk, sans-serif', letterSpacing: '0.3px' }}>
              ASLEN TECH SOLUTIONS
            </span>
          </Link>

          <div className="hidden md:flex items-center gap-8">
            {NAV_LINKS.map((l) => (
              <a key={l.label} href={l.href}
                className="text-white/65 hover:text-[#00C8FF] text-sm font-medium transition-colors relative group">
                {l.label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-px bg-[#00C8FF] transition-all duration-250 group-hover:w-full" />
              </a>
            ))}
          </div>

          <div className="hidden md:flex items-center gap-3">
            {user ? (
              <>
                <button onClick={() => navigate('/dashboard')}
                  className="flex items-center gap-1.5 text-white/65 hover:text-[#00C8FF] text-sm font-medium transition-colors">
                  <LayoutDashboard size={15} /> Dashboard
                </button>
                <button onClick={handleSignOut}
                  className="flex items-center gap-1.5 text-white/65 hover:text-[#00C8FF] text-sm font-medium transition-colors">
                  <LogOut size={15} /> Sign Out
                </button>
              </>
            ) : (
              <Link to="/login"
                className="btn-primary text-[#080E1C] px-5 py-2 rounded-lg text-sm font-bold transition-all">
                Sign In
              </Link>
            )}
          </div>

          <button className="md:hidden text-white p-1" onClick={() => setOpen(!open)}>
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden px-4 pb-4 pt-2 space-y-1" style={{ background: 'rgba(8,14,28,0.99)' }}>
          {NAV_LINKS.map((l) => (
            <a key={l.label} href={l.href} onClick={() => setOpen(false)}
              className="block text-white/70 hover:text-[#00C8FF] py-2.5 text-sm font-medium border-b border-white/10 transition-colors">
              {l.label}
            </a>
          ))}
          {user ? (
            <>
              <button onClick={() => { navigate('/dashboard'); setOpen(false) }}
                className="block w-full text-left text-white/70 hover:text-[#00C8FF] py-2.5 text-sm font-medium transition-colors">
                Dashboard
              </button>
              <button onClick={() => { handleSignOut(); setOpen(false) }}
                className="block w-full text-left text-white/70 hover:text-[#00C8FF] py-2.5 text-sm font-medium transition-colors">
                Sign Out
              </button>
            </>
          ) : (
            <Link to="/login" onClick={() => setOpen(false)}
              className="block btn-primary text-[#080E1C] text-center px-4 py-2.5 rounded-lg text-sm font-bold mt-2">
              Sign In
            </Link>
          )}
        </div>
      )}
    </nav>
  )
}
