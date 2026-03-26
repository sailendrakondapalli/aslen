import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import { ADMIN_EMAILS } from '../data/services'
import { Loader2, Clock, IndianRupee, Users, ShoppingBag, Image, X, Star } from 'lucide-react'
import toast from 'react-hot-toast'

const STATUS_OPTIONS = ['pending_verification', 'confirmed', 'in_progress', 'completed', 'cancelled']

const statusColor = {
  pending_verification: 'bg-orange-100 text-orange-700',
  confirmed: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

export default function AdminDashboard() {
  const { user, loading: authLoading } = useAuthStore()
  const navigate = useNavigate()
  const [bookings, setBookings] = useState([])
  const [clients, setClients] = useState([])
  const [feedbacks, setFeedbacks] = useState([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('bookings')
  const [lightboxUrl, setLightboxUrl] = useState(null)

  const isAdmin = user && ADMIN_EMAILS.includes(user.email)

  useEffect(() => {
    if (!authLoading && !user) navigate('/login')
    if (!authLoading && user && !isAdmin) navigate('/')
  }, [user, authLoading, isAdmin, navigate])

  useEffect(() => {
    if (!isAdmin) return
    fetchAll()
  }, [isAdmin])

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
    setBookings((prev) => prev.map((b) => b.id === id ? { ...b, status } : b))
    toast.success('Status updated')
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-blue-600" />
      </div>
    )
  }

  if (!isAdmin) return null

  const totalRevenue = bookings.filter(b => b.status !== 'cancelled').reduce((s, b) => s + (b.advance_paid || 0), 0)
  const pendingRevenue = bookings.filter(b => b.status !== 'cancelled' && b.status !== 'completed')
    .reduce((s, b) => s + ((b.total_amount || 0) - (b.advance_paid || 0)), 0)

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-black text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-500 mt-1">ASLEN TECH SOLUTIONS — {user.email}</p>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Bookings', value: bookings.length, icon: ShoppingBag, color: 'text-blue-600' },
            { label: 'Total Clients', value: clients.length, icon: Users, color: 'text-purple-600' },
            { label: 'Advance Collected', value: `₹${totalRevenue.toLocaleString()}`, icon: IndianRupee, color: 'text-green-600' },
            { label: 'Pending Balance', value: `₹${pendingRevenue.toLocaleString()}`, icon: Clock, color: 'text-orange-600' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100">
              <Icon size={22} className={`${color} mb-2`} />
              <div className="text-2xl font-black text-gray-900">{value}</div>
              <div className="text-gray-500 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {['bookings', 'clients', 'feedback'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className={`px-5 py-2 rounded-xl font-semibold text-sm capitalize transition-colors ${
                tab === t ? 'bg-blue-600 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {t}
            </button>
          ))}
        </div>

        {/* Bookings Table */}
        {tab === 'bookings' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">All Bookings ({bookings.length})</h2>
              <button onClick={fetchAll} className="text-sm text-blue-600 hover:underline">Refresh</button>
            </div>
            {bookings.length === 0 ? (
              <div className="text-center py-16 text-gray-400">No bookings yet</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
                    <tr>
                      {['Client', 'Service', 'Package', 'Advance', 'Total', 'Pending', 'Status', 'Screenshot', 'Date'].map(h => (
                        <th key={h} className="px-4 py-3 text-left font-semibold whitespace-nowrap">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-50">
                    {bookings.map((b) => (
                      <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-2">
                            <img
                              src={b.users?.profile_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(b.users?.name || b.user_email || 'U')}&background=3b82f6&color=fff`}
                              alt=""
                              className="w-8 h-8 rounded-full object-cover shrink-0"
                            />
                            <div>
                              <p className="font-semibold text-gray-900 text-xs">{b.users?.name || '—'}</p>
                              <p className="text-gray-400 text-xs">{b.user_email || b.user_id?.slice(0, 8)}</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-700 whitespace-nowrap">{b.service_title}</td>
                        <td className="px-4 py-3 text-gray-600 whitespace-nowrap">{b.package_name}</td>
                        <td className="px-4 py-3 text-green-600 font-semibold whitespace-nowrap">₹{(b.advance_paid || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-gray-900 font-semibold whitespace-nowrap">₹{(b.total_amount || 0).toLocaleString()}</td>
                        <td className="px-4 py-3 text-orange-600 font-semibold whitespace-nowrap">
                          ₹{Math.max(0, (b.total_amount || 0) - (b.advance_paid || 0)).toLocaleString()}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <select
                            value={b.status}
                            onChange={(e) => updateStatus(b.id, e.target.value)}
                            className={`text-xs font-semibold px-2 py-1 rounded-lg border-0 cursor-pointer ${statusColor[b.status] || 'bg-gray-100 text-gray-700'}`}
                          >
                            {STATUS_OPTIONS.map(s => (
                              <option key={s} value={s}>{s.replace('_', ' ')}</option>
                            ))}
                          </select>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {b.payment_screenshot_url ? (
                            <button
                              onClick={() => setLightboxUrl(b.payment_screenshot_url)}
                              className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 font-medium"
                            >
                              <Image size={14} /> View
                            </button>
                          ) : (
                            <span className="text-gray-400 text-xs">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-gray-500 whitespace-nowrap">
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

        {/* Clients Table */}
        {tab === 'clients' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-900 text-lg">All Clients ({clients.length})</h2>
            </div>
            {clients.length === 0 ? (
              <div className="text-center py-16 text-gray-400">No clients yet</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {clients.map((c) => {
                  const clientBookings = bookings.filter(b => b.user_id === c.id)
                  const spent = clientBookings.reduce((s, b) => s + (b.advance_paid || 0), 0)
                  return (
                    <div key={c.id} className="p-4 flex items-center gap-4 hover:bg-gray-50 transition-colors">
                      <img
                        src={c.profile_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(c.name || 'U')}&background=3b82f6&color=fff`}
                        alt={c.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900 truncate">{c.name || 'Unknown'}</p>
                        <p className="text-sm text-gray-500 truncate">{c.email}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-sm font-bold text-blue-600">{clientBookings.length} bookings</p>
                        <p className="text-xs text-green-600 font-semibold">₹{spent.toLocaleString()} paid</p>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

        {/* Feedback Tab */}
        {tab === 'feedback' && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex items-center justify-between">
              <h2 className="font-bold text-gray-900 text-lg">All Feedback ({feedbacks.length})</h2>
              <button onClick={fetchAll} className="text-sm text-blue-600 hover:underline">Refresh</button>
            </div>
            {feedbacks.length === 0 ? (
              <div className="text-center py-16 text-gray-400">No feedback yet</div>
            ) : (
              <div className="divide-y divide-gray-50">
                {feedbacks.map((f) => (
                  <div key={f.id} className="p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between gap-3 mb-2">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                          {f.name?.charAt(0)?.toUpperCase() || 'U'}
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900 text-sm">{f.name || 'Anonymous'}</p>
                          <p className="text-xs text-gray-400">{f.user_email || '—'}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1 shrink-0">
                        {[1,2,3,4,5].map(s => (
                          <Star key={s} size={14} className={s <= f.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'} />
                        ))}
                        <span className="text-xs text-gray-500 ml-1">{f.rating}/5</span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-700 ml-10">{f.comment}</p>
                    <p className="text-xs text-gray-400 ml-10 mt-1">
                      {new Date(f.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

      {/* Screenshot Lightbox */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative max-w-lg w-full" onClick={(e) => e.stopPropagation()}>
            <button
              onClick={() => setLightboxUrl(null)}
              className="absolute -top-10 right-0 text-white hover:text-gray-300 transition-colors"
            >
              <X size={28} />
            </button>
            <img
              src={lightboxUrl}
              alt="Payment Screenshot"
              className="w-full rounded-2xl shadow-2xl object-contain max-h-[80vh]"
            />
            <p className="text-center text-white text-sm mt-3 opacity-70">Payment Screenshot</p>
          </div>
        </div>
      )}
    </div>
  )
}
