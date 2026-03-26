import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import { Loader2, CheckCircle, Clock, XCircle, LogOut, LayoutDashboard, AlertCircle } from 'lucide-react'
import { ADMIN_EMAILS } from '../data/services'
import toast from 'react-hot-toast'

const statusColor = {
  pending_verification: 'bg-orange-100 text-orange-700',
  confirmed: 'bg-blue-100 text-blue-700',
  in_progress: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
}

const statusLabel = {
  pending_verification: 'Pending Verification',
  confirmed: 'Confirmed',
  in_progress: 'In Progress',
  completed: 'Completed',
  cancelled: 'Cancelled',
}

export default function Dashboard() {
  const { user, signOut } = useAuthStore()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  const isAdmin = user && ADMIN_EMAILS.includes(user.email)

  useEffect(() => {
    if (!user || !supabase) { setLoading(false); return }
    supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setBookings(data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }, [user])

  const handleSignOut = async () => {
    await signOut()
    toast.success('Signed out')
    navigate('/')
  }

  if (!user) return null

  const name = user.user_metadata?.full_name || user.user_metadata?.name || 'User'
  const avatar = user.user_metadata?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=3b82f6&color=fff`

  const totalSpent = bookings.reduce((s, b) => s + (b.advance_paid || 0), 0)
  const totalRemaining = bookings
    .filter(b => b.status !== 'cancelled')
    .reduce((s, b) => s + Math.max(0, (b.total_amount || 0) - (b.advance_paid || 0)), 0)

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Profile */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl p-6 text-white mb-8 flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <img src={avatar} alt="avatar" className="w-16 h-16 rounded-full border-4 border-white/30 object-cover" />
            <div>
              <h1 className="text-2xl font-black">{name}</h1>
              <p className="text-white/70 text-sm">{user.email}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button
                onClick={() => navigate('/admin')}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-xl text-sm font-semibold"
              >
                <LayoutDashboard size={16} /> Admin Panel
              </button>
            )}
            <button
              onClick={handleSignOut}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-xl text-sm font-semibold"
            >
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Bookings', value: bookings.length },
            { label: 'Completed', value: bookings.filter(b => b.status === 'completed').length },
            { label: 'Advance Paid', value: `₹${totalSpent.toLocaleString()}` },
            { label: 'Balance Due', value: `₹${totalRemaining.toLocaleString()}` },
          ].map(({ label, value }) => (
            <div key={label} className="bg-white rounded-2xl p-5 shadow-sm border border-gray-100 text-center">
              <div className="text-2xl font-black text-gray-900">{value}</div>
              <div className="text-gray-500 text-sm mt-1">{label}</div>
            </div>
          ))}
        </div>

        {/* Bookings */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="p-6 border-b border-gray-100">
            <h2 className="text-xl font-bold text-gray-900">My Bookings</h2>
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin text-blue-600" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="text-lg font-medium">No bookings yet</p>
              <button
                onClick={() => navigate('/#services')}
                className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:opacity-90"
              >
                Browse Services
              </button>
            </div>
          ) : (
            <div className="divide-y divide-gray-50">
              {bookings.map((b) => {
                const remaining = Math.max(0, (b.total_amount || 0) - (b.advance_paid || 0))
                const isCompleted = b.status === 'completed'
                const isCancelled = b.status === 'cancelled'
                const isPending = b.status === 'pending_verification'
                return (
                  <div key={b.id} className="p-5 hover:bg-gray-50 transition-colors">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-gray-900">{b.service_title}</p>
                        <p className="text-sm text-gray-500">{b.package_name}</p>
                        {b.description && <p className="text-xs text-gray-400 mt-1 truncate">{b.description}</p>}
                        <p className="text-xs text-gray-400 mt-1">
                          {new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-green-600">₹{(b.advance_paid || 0).toLocaleString()} paid</p>
                        <p className="text-xs text-gray-500">of ₹{(b.total_amount || 0).toLocaleString()} total</p>
                        <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor[b.status] || 'bg-gray-100 text-gray-600'}`}>
                          {statusLabel[b.status] || b.status?.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {/* Remaining balance banner */}
                    {!isCancelled && remaining > 0 && (
                      <div className={`mt-3 rounded-xl px-4 py-2.5 flex items-center justify-between gap-2 text-sm
                        ${isCompleted
                          ? 'bg-red-50 border border-red-200'
                          : isPending
                          ? 'bg-gray-50 border border-gray-200'
                          : 'bg-orange-50 border border-orange-200'
                        }`}>
                        <div className="flex items-center gap-2">
                          <AlertCircle size={15} className={isCompleted ? 'text-red-500' : isPending ? 'text-gray-400' : 'text-orange-500'} />
                          <span className={isCompleted ? 'text-red-700 font-semibold' : isPending ? 'text-gray-500' : 'text-orange-700'}>
                            {isCompleted
                              ? 'Work done! Please pay remaining balance'
                              : isPending
                              ? 'Awaiting payment verification by admin'
                              : 'Remaining balance due after delivery'}
                          </span>
                        </div>
                        <span className={`font-bold ${isCompleted ? 'text-red-600' : isPending ? 'text-gray-500' : 'text-orange-600'}`}>
                          ₹{remaining.toLocaleString()}
                        </span>
                      </div>
                    )}

                    {/* Fully paid badge */}
                    {!isCancelled && remaining === 0 && (
                      <div className="mt-3 rounded-xl px-4 py-2 flex items-center gap-2 bg-green-50 border border-green-200 text-sm text-green-700">
                        <CheckCircle size={15} className="text-green-500" />
                        <span className="font-semibold">Fully paid — no balance due</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
