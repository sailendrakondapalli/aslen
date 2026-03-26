import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import { Loader2, CheckCircle, LogOut, LayoutDashboard, AlertCircle, X, Upload, ArrowLeft } from 'lucide-react'
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

// ── Remaining Payment Modal ──────────────────────────────────────────────────
function RemainingPayModal({ booking, onClose, onSuccess }) {
  const { user } = useAuthStore()
  const [screenshot, setScreenshot] = useState(null)
  const [preview, setPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const remaining = Math.max(0, (booking.total_amount || 0) - (booking.advance_paid || 0))

  const handleFile = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('File too large (max 5MB)'); return }
    setScreenshot(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async () => {
    if (!screenshot) { toast.error('Please upload your payment screenshot'); return }
    setLoading(true)
    try {
      const ext = screenshot.name.split('.').pop()
      const path = `${user.id}/remaining-${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('payment-screenshots')
        .upload(path, screenshot, { contentType: screenshot.type })
      if (uploadError) throw uploadError

      const { data: urlData } = supabase.storage.from('payment-screenshots').getPublicUrl(path)

      const { error, data: updateData } = await supabase.from('bookings').update({
        remaining_screenshot_url: urlData.publicUrl,
        status: 'pending_final_verification',
      }).eq('id', booking.id).select()
      if (error) {
        console.error('Supabase update error:', error)
        throw new Error(error.message)
      }
      console.log('Updated booking:', updateData)

      toast.success('Payment submitted! Admin will verify shortly.')
      onSuccess()
      onClose()
    } catch (err) {
      toast.error('Something went wrong. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Pay Remaining Balance</h2>
            <p className="text-sm text-gray-500 mt-0.5">{booking.service_title} — {booking.package_name}</p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Amount */}
          <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center">
            <p className="text-sm text-red-600 font-medium">Amount to Pay</p>
            <p className="text-3xl font-black text-red-700 mt-1">₹{remaining.toLocaleString()}</p>
            <p className="text-xs text-red-500 mt-1">Final payment after work delivery</p>
          </div>

          {/* QR */}
          <div className="flex flex-col items-center gap-3 bg-white border-2 border-dashed border-blue-200 rounded-2xl p-6">
            <img src="/qr.png" alt="Payment QR" className="w-48 h-48 object-contain rounded-xl" />
            <p className="text-xs text-gray-500 text-center">Scan with PhonePe, GPay, Paytm, or any UPI app</p>
            <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between gap-2">
              <div>
                <p className="text-xs text-gray-400 mb-0.5">UPI ID</p>
                <p className="text-sm font-bold text-gray-800 font-mono">8143724405-2@ibl</p>
              </div>
              <button
                onClick={() => { navigator.clipboard.writeText('8143724405-2@ibl'); toast.success('UPI ID copied!') }}
                className="text-xs bg-blue-100 text-blue-600 hover:bg-blue-200 px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0"
              >
                Copy
              </button>
            </div>
          </div>

          {/* Screenshot upload */}
          <div>
            <p className="text-sm font-medium text-gray-700 mb-2">Upload payment screenshot</p>
            <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors
              ${preview ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'}`}>
              {preview ? (
                <div className="flex flex-col items-center gap-2">
                  <img src={preview} alt="preview" className="h-20 object-contain rounded-lg" />
                  <p className="text-xs text-green-600 font-medium">Screenshot selected ✓</p>
                </div>
              ) : (
                <div className="flex flex-col items-center gap-2 text-gray-400">
                  <Upload size={24} />
                  <p className="text-sm">Click to upload screenshot</p>
                  <p className="text-xs">PNG, JPG up to 5MB</p>
                </div>
              )}
              <input type="file" accept="image/*" className="hidden" onChange={handleFile} />
            </label>
          </div>
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <button onClick={onClose}
            className="flex items-center gap-1 border border-gray-200 text-gray-700 px-4 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
            <ArrowLeft size={16} /> Back
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !screenshot}
            className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
            {loading ? 'Submitting...' : 'Confirm Payment'}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Main Dashboard ───────────────────────────────────────────────────────────
export default function Dashboard() {
  const { user, signOut } = useAuthStore()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [payingBooking, setPayingBooking] = useState(null)
  const navigate = useNavigate()

  const isAdmin = user && ADMIN_EMAILS.includes(user.email)

  const fetchBookings = () => {
    if (!user || !supabase) { setLoading(false); return }
    supabase
      .from('bookings')
      .select('*')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })
      .then(({ data }) => { setBookings(data || []); setLoading(false) })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchBookings() }, [user])

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
              <button onClick={() => navigate('/admin')}
                className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-xl text-sm font-semibold">
                <LayoutDashboard size={16} /> Admin Panel
              </button>
            )}
            <button onClick={handleSignOut}
              className="flex items-center gap-2 bg-white/20 hover:bg-white/30 transition-colors px-4 py-2 rounded-xl text-sm font-semibold">
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
              <button onClick={() => navigate('/#services')}
                className="mt-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-2 rounded-xl text-sm font-semibold hover:opacity-90">
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
                const isPendingFinal = b.status === 'pending_final_verification'
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

                    {/* Remaining balance — completed, needs payment */}
                    {isCompleted && remaining > 0 && (
                      <div className="mt-3 rounded-xl px-4 py-3 flex items-center justify-between gap-3 bg-red-50 border border-red-200">
                        <div className="flex items-center gap-2">
                          <AlertCircle size={15} className="text-red-500 shrink-0" />
                          <span className="text-red-700 font-semibold text-sm">Work done! Pay remaining balance</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-bold text-red-600">₹{remaining.toLocaleString()}</span>
                          <button
                            onClick={() => setPayingBooking(b)}
                            className="bg-red-600 hover:bg-red-700 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors">
                            Pay Now
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Pending final verification */}
                    {isPendingFinal && remaining > 0 && (
                      <div className="mt-3 rounded-xl px-4 py-2.5 flex items-center justify-between gap-2 bg-yellow-50 border border-yellow-200 text-sm">
                        <div className="flex items-center gap-2">
                          <AlertCircle size={15} className="text-yellow-500" />
                          <span className="text-yellow-700 font-semibold">Final payment submitted — awaiting admin verification</span>
                        </div>
                        <span className="font-bold text-yellow-600">₹{remaining.toLocaleString()}</span>
                      </div>
                    )}

                    {/* Pending advance verification */}
                    {isPending && remaining > 0 && (
                      <div className="mt-3 rounded-xl px-4 py-2.5 flex items-center justify-between gap-2 bg-gray-50 border border-gray-200 text-sm">
                        <div className="flex items-center gap-2">
                          <AlertCircle size={15} className="text-gray-400" />
                          <span className="text-gray-500">Awaiting payment verification by admin</span>
                        </div>
                        <span className="font-bold text-gray-500">₹{remaining.toLocaleString()}</span>
                      </div>
                    )}

                    {/* In progress — balance due after delivery */}
                    {!isCompleted && !isCancelled && !isPending && !isPendingFinal && remaining > 0 && (
                      <div className="mt-3 rounded-xl px-4 py-2.5 flex items-center justify-between gap-2 bg-orange-50 border border-orange-200 text-sm">
                        <div className="flex items-center gap-2">
                          <AlertCircle size={15} className="text-orange-500" />
                          <span className="text-orange-700">Remaining balance due after delivery</span>
                        </div>
                        <span className="font-bold text-orange-600">₹{remaining.toLocaleString()}</span>
                      </div>
                    )}

                    {/* Fully paid */}
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

      {/* Remaining payment modal */}
      {payingBooking && (
        <RemainingPayModal
          booking={payingBooking}
          onClose={() => setPayingBooking(null)}
          onSuccess={fetchBookings}
        />
      )}
    </div>
  )
}
