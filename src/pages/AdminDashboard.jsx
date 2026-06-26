import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import { ADMIN_EMAILS } from '../data/services'
import { Loader2, Clock, IndianRupee, Users, ShoppingBag, Image, X, Star, RefreshCw } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['pending_verification','confirmed','in_progress','completed','pending_final_verification','fully_completed','cancelled']

const statusStyle = {
  pending_verification:       { bg: 'rgba(251,146,60,0.15)', color: '#fb923c' },
  confirmed:                  { bg: 'rgba(0,200,255,0.12)',  color: '#00C8FF' },
  in_progress:                { bg: 'rgba(234,179,8,0.15)',  color: '#eab308' },
  completed:                  { bg: 'rgba(34,197,94,0.15)',  color: '#22c55e' },
  pending_final_verification: { bg: 'rgba(234,179,8,0.15)',  color: '#eab308' },
  fully_completed:            { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
  cancelled:                  { bg: 'rgba(239,68,68,0.15)',  color: '#ef4444' },
}

const card = { background: '#111928', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 16 }
const cardHover = 'rgba(0,200,255,0.07)'

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuthStore()
  const navigate = useNavigate()
  const [bookings, setBookings]   = useState([])
  const [clients, setClients]     = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading]     = useState(true)
  const [tab, setTab]             = useState('bookings')
  const [lightboxUrl, setLightboxUrl] = useState(null)

  const isAdmin = user && ADMIN_EMAILS.includes(user.email)

  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
    if (!authLoading && user && !isAdmin) navigate('/')
  }, [user, authLoading, isAdmin, navigate])

  useEffect(() => { if (isAdmin) fetchAll() }, [isAdmin])

  const fetchAll = async () => {
    setLoading(true)
    const [{ data: b }, { data: u }, { data: f }] = await Promise.all([
      supabase.from('bookings').select('*, users(name, email, profile_url)').order('created_at', { ascending: false }),
      supabase.from('users').select('*').order('created_at', { ascending: false }),
      supabase.from('feedback').select('*').order('created_at', { ascending: false }),
    ])
    setBookings(b || [])
    setClients(u || [])
    setFeedbacks(f || [])
    setLoading(false)
  }

  const updateStatus = async (id, status) => {
    const { error } = await supabase.from('bookings').update({ status }).eq('id', id)
    if (error) { toast.error('Failed to update'); return }
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b))
    toast.success('Status updated')
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: '#080E1C' }}>
        <Loader2 size={32} className="animate-spin text-[#00C8FF]" />
      </div>
    )
  }

  if (!isAdmin) return null

  const totalRevenue  = bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.advance_paid || 0), 0)
  const pendingRevenue = bookings.filter(b => b.status !== 'cancelled' && b.status !== 'fully_completed')
    .reduce((s, b) => s + Math.max(0, (b.total_amount || 0) - (b.advance_paid || 0)), 0)

  const stats = [
    { label: 'Total Bookings',    value: bookings.length,                    icon: ShoppingBag,  color: '#00C8FF' },
    { label: 'Total Clients',     value: clients.length,                     icon: Users,        color: '#00C8FF' },
    { label: 'Advance Collected', value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, color: '#22c55e' },
    { label: 'Pending Balance',   value: `₹${pendingRevenue.toLocaleString()}`, icon: Clock,    color: '#fb923c' },
  ]

  return (
    <div className="min-h-screen pt-16" style={{ background: '#080E1C', fontFamily: 'Space Grotesk, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black text-white">Admin Dashboard</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
            ASLEN TECH SOLUTIONS — {user.email}
          </p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map(({ label, value, icon: Icon, color }) => (
            <div key={label} style={card} className="p-5 transition-all"
              onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,200,255,0.25)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}>
              <Icon size={22} style={{ color }} className="mb-3" />
              <div className="text-2xl font-black text-white">{value}</div>
              <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['bookings', 'clients', 'feedback'].map((t) => (
            <button key={t} onClick={() => setTab(t)}
              className="px-5 py-2 rounded-xl font-semibold text-sm capitalize transition-all"
              style={tab === t
                ? { background: 'linear-gradient(135deg,#00C8FF,#0062FF)', color: '#080E1C' }
                : { background: '#111928', color: 'rgba(255,255,255,0.55)', border: '1px solid rgba(255,255,255,0.08)' }}>
              {t}
            </button>
          ))}
        </div>

        {/* Bookings */}
        {tab === 'bookings' && (
          <div style={card} className="overflow-hidden">
            <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="font-bold text-white text-lg">All Bookings ({bookings.length})</h2>
              <button onClick={fetchAll} className="flex items-center gap-1.5 text-sm text-[#00C8FF] hover:opacity-80 transition-opacity">
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
            {bookings.length === 0 ? (
              <div className="text-center py-16" style={{ color: 'rgba(255,255,255,0.35)' }}>No bookings yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead style={{ background: 'rgba(0,200,255,0.04)' }}>
                    <tr>
                      {['Client','Service','Package','Advance','Total','Pending','Status','Screenshot','Final SS','Date'].map(h => (
                        <th key={h} className="px-4 py-3 text-left text-xs font-semibold whitespace-nowrap uppercase tracking-wider"
                          style={{ color: 'rgba(255,255,255,0.4)' }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {bookings.map((b, i) => (
                      <tr key={b.id} className="transition-colors"
                        style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                        onMouseEnter={e => e.currentTarget.style.background = cardHover}
                        onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <img
                              src={b.users?.profile_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.users?.name || b.user_email || 'U')}&background=00C8FF&color=080E1C`}
                              alt="" className="w-8 h-8 rounded-full object-cover shrink-0"
                              style={{ border: '1.5px solid rgba(0,200,255,0.3)' }}
                            />
                            <div>
                              <p className="font-semibold text-white text-xs">{b.users?.name || '—'}</p>
                              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{b.user_email || b.user_id?.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.8)' }}>{b.service_title}</td>
                        <td className="px-4 py-3 whitespace-nowrap" style={{ color: 'rgba(255,255,255,0.6)' }}>{b.package_name}</td>
                        <td className="px-4 py-3 whitespace-nowrap font-semibold text-green-400">₹{(b.advance_paid || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 whitespace-nowrap font-semibold text-white">₹{(b.total_amount || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 whitespace-nowrap font-semibold text-orange-400">
                          ₹{Math.max(0, (b.total_amount || 0) - (b.advance_paid || 0)).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <select value={b.status} onChange={e => updateStatus(b.id, e.target.value)}
                            className="text-xs font-semibold px-2 py-1.5 rounded-lg cursor-pointer outline-none border-0"
                            style={{
                              background: statusStyle[b.status]?.bg || 'rgba(255,255,255,0.1)',
                              color: statusStyle[b.status]?.color || 'white',
                            }}>
                            {STATUS_OPTIONS.map(s => (
                              <option key={s} value={s} style={{ background: '#111928', color: 'white' }}>
                                {s.replace(/_/g, ' ')}
                              </option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {b.payment_screenshot_url ? (
                            <button onClick={() => setLightboxUrl(b.payment_screenshot_url)}
                              className="flex items-center gap-1 text-xs text-[#00C8FF] hover:opacity-75 font-medium">
                              <Image size={13} /> View
                            </button>
                          ) : <span style={{ color: 'rgba(255,255,255,0.25)' }}>—</span>}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {b.remaining_screenshot_url ? (
                            <button onClick={() => setLightboxUrl(b.remaining_screenshot_url)}
                              className="flex items-center gap-1 text-xs text-emerald-400 hover:opacity-75 font-medium">
                              <Image size={13} /> View
                            </button>
                          ) : <span style={{ color: 'rgba(255,255,255,0.25)' }}>—</span>}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: '2-digit' })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* Clients */}
        {tab === 'clients' && (
          <div style={card} className="overflow-hidden">
            <div className="p-5" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="font-bold text-white text-lg">All Clients ({clients.length})</h2>
            </div>
            {clients.length === 0 ? (
              <div className="text-center py-16" style={{ color: 'rgba(255,255,255,0.35)' }}>No clients yet</div>
            ) : (
              <div>
                {clients.map((c) => {
                  const cb = bookings.filter(b => b.user_id === c.id)
                  const spent = cb.reduce((s, b) => s + (b.advance_paid || 0), 0)
                  return (
                    <div key={c.id} className="p-4 flex items-center gap-4 transition-colors"
                      style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                      onMouseEnter={e => e.currentTarget.style.background = cardHover}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                      <img src={c.profile_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name || 'U')}&background=00C8FF&color=080E1C`}
                        alt={c.name} className="w-10 h-10 rounded-full object-cover shrink-0"
                        style={{ border: '2px solid rgba(0,200,255,0.3)' }} />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white truncate">{c.name || 'Unknown'}</p>
                        <p className="text-sm truncate" style={{ color: 'rgba(255,255,255,0.45)' }}>{c.email || c.phone}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-[#00C8FF]">{cb.length} bookings</p>
                        <p className="text-xs font-semibold text-green-400">₹{spent.toLocaleString()} paid</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}

        {/* Feedback */}
        {tab === 'feedback' && (
          <div style={card} className="overflow-hidden">
            <div className="p-5 flex items-center justify-between" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <h2 className="font-bold text-white text-lg">All Feedback ({feedbacks.length})</h2>
              <button onClick={fetchAll} className="flex items-center gap-1.5 text-sm text-[#00C8FF] hover:opacity-80 transition-opacity">
                <RefreshCw size={14} /> Refresh
              </button>
            </div>
            {feedbacks.length === 0 ? (
              <div className="text-center py-16" style={{ color: 'rgba(255,255,255,0.35)' }}>No feedback yet</div>
            ) : (
              <div>
                {feedbacks.map((f) => (
                  <div key={f.id} className="p-4 transition-colors"
                    style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                    onMouseEnter={e => e.currentTarget.style.background = cardHover}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-black shrink-0"
                          style={{ background: 'linear-gradient(135deg,#00C8FF,#0062FF)', color: '#080E1C' }}>
                          {f.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{f.name || 'Anonymous'}</p>
                          <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{f.user_email || '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={14} className={s <= f.rating ? 'fill-[#00C8FF] text-[#00C8FF]' : 'fill-white/10 text-white/10'} />
                        ))}
                        <span className="text-xs ml-1" style={{ color: 'rgba(255,255,255,0.4)' }}>{f.rating}/5</span>
                      </div>
                    </div>
                    <p className="text-sm ml-10" style={{ color: 'rgba(255,255,255,0.65)' }}>{f.comment}</p>
                    <p className="text-xs ml-10 mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>
                      {new Date(f.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      </div>

      {/* Lightbox */}
      {lightboxUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: 'rgba(0,0,0,0.85)' }}
          onClick={() => setLightboxUrl(null)}>
          <div className="relative max-w-lg w-full" onClick={e => e.stopPropagation()}>
            <button onClick={() => setLightboxUrl(null)}
              className="absolute -top-10 right-0 text-white hover:text-[#00C8FF] transition-colors">
              <X size={28} />
            </button>
            <img src={lightboxUrl} alt="Payment Screenshot"
              className="w-full rounded-2xl object-contain"
              style={{ maxHeight: '80vh', border: '1px solid rgba(0,200,255,0.2)' }} />
            <p className="text-center text-sm mt-3" style={{ color: 'rgba(255,255,255,0.5)' }}>Payment Screenshot</p>
          </div>
        </div>
      )}
    </div>
  )
}
