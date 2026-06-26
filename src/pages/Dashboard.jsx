import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import { Loader2, CheckCircle, LogOut, LayoutDashboard, AlertCircle, X, ArrowLeft, Star, Send, PartyPopper } from 'lucide-react'
import { ADMIN_EMAILS } from '../data/services'
import toast from 'react-hot-toast'

const statusColor = {
  pending_verification:       'bg-orange-500/15 text-orange-300',
  confirmed:                  'bg-[#00C8FF]/10 text-[#00C8FF]',
  in_progress:                'bg-yellow-500/15 text-yellow-300',
  completed:                  'bg-green-500/15 text-green-300',
  pending_final_verification: 'bg-yellow-500/15 text-yellow-300',
  fully_completed:            'bg-emerald-500/15 text-emerald-300',
  cancelled:                  'bg-red-500/15 text-red-400',
}
const statusLabel = {
  pending_verification:       'Pending Verification',
  confirmed:                  'Confirmed',
  in_progress:                'In Progress',
  completed:                  'Completed',
  pending_final_verification: 'Final Payment Verification',
  fully_completed:            'Fully Completed ✓',
  cancelled:                  'Cancelled',
}

function StarRating({ value, onChange }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-2 justify-center">
      {[1,2,3,4,5].map((star) => (
        <button key={star} type="button" onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110">
          <Star size={36} className={`transition-colors ${star <= (hovered || value) ? 'fill-[#00C8FF] text-[#00C8FF]' : 'fill-white/10 text-white/10'}`} />
        </button>
      ))}
    </div>
  )
}

function ThankYouModal({ booking, onClose }) {
  const { user } = useAuthStore()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || ''
  const userAvatar = user?.user_metadata?.avatar_url || ''

  const handleSubmit = async () => {
    if (rating === 0) { toast.error('Please select a rating'); return }
    if (!comment.trim()) { toast.error('Please write a comment'); return }
    setLoading(true)
    try {
      const { error } = await supabase.from('feedback').insert({
        user_id: user.id, user_email: user.email,
        name: userName, avatar_url: userAvatar, rating, comment: comment.trim(),
      })
      if (error) throw error
      setSubmitted(true)
    } catch { toast.error('Failed to submit. Please try again.') }
    finally { setLoading(false) }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="rounded-2xl w-full max-w-md overflow-hidden border" style={{ background: '#111928', borderColor: 'rgba(0,200,255,0.2)' }}>
        {submitted ? (
          <div className="p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto"
              style={{ background: 'rgba(0,200,255,0.1)', border: '1px solid rgba(0,200,255,0.3)' }}>
              <CheckCircle size={32} className="text-[#00C8FF]" />
            </div>
            <h2 className="text-2xl font-black text-white">Thank You!</h2>
            <p style={{ color: 'rgba(255,255,255,0.55)' }}>Your feedback means a lot to us.</p>
            <button onClick={onClose} className="btn-primary w-full py-3 rounded-xl font-bold">Close</button>
          </div>
        ) : (
          <>
            <div className="p-6 text-center text-white" style={{ background: '#0C1325', borderBottom: '1px solid rgba(0,200,255,0.15)' }}>
              <PartyPopper size={36} className="mx-auto mb-2 text-[#00C8FF]" />
              <h2 className="text-2xl font-black">Project Completed!</h2>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.55)' }}>Thank you for choosing ASLEN TECH SOLUTIONS</p>
              <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>{booking.service_title} — {booking.package_name}</p>
            </div>
            <div className="p-6 space-y-5">
              <div className="text-center">
                <p className="text-white font-semibold mb-1">How was your experience?</p>
                <p className="text-sm mb-4" style={{ color: 'rgba(255,255,255,0.4)' }}>Rate us and share your feedback</p>
                <StarRating value={rating} onChange={setRating} />
                {rating > 0 && <p className="text-sm text-[#00C8FF] mt-2">{['','Poor','Fair','Good','Very Good','Excellent'][rating]}</p>}
              </div>
              <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={3}
                placeholder="Tell us about your experience..."
                className="w-full rounded-xl px-4 py-3 text-sm text-white resize-none"
                style={{ background: '#080E1C', border: '1px solid rgba(255,255,255,0.1)' }} />
              <div className="flex gap-3">
                <button onClick={onClose}
                  className="option-btn-neutral flex-1 py-3 rounded-xl font-semibold text-sm"
                  style={{ color: 'rgba(255,255,255,0.6)' }}>
                  Skip
                </button>
                <button onClick={handleSubmit} disabled={loading}
                  className="btn-primary flex-1 py-3 rounded-xl font-bold disabled:opacity-60 flex items-center justify-center gap-2">
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                  Submit
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return }
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

const RZP_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID

function RemainingPayModal({ booking, onClose, onSuccess }) {
  const { user } = useAuthStore()
  const [loading, setLoading] = useState(false)
  const remaining = Math.max(0, (booking.total_amount || 0) - (booking.advance_paid || 0))

  const handlePay = async () => {
    setLoading(true)
    const loaded = await loadRazorpay()
    if (!loaded) { toast.error('Payment gateway failed to load.'); setLoading(false); return }
    const options = {
      key: RZP_KEY, amount: remaining * 100, currency: 'INR',
      name: 'ASLEN TECH SOLUTIONS', description: `${booking.service_title} - Final Payment`,
      image: '/logo.png',
      prefill: { name: user.user_metadata?.full_name || '', email: user.email, contact: '' },
      theme: { color: '#00C8FF' },
      handler: async (response) => {
        try {
          const { error } = await supabase.from('bookings').update({
            razorpay_final_payment_id: response.razorpay_payment_id,
            status: 'pending_final_verification',
          }).eq('id', booking.id).select()
          if (error) throw new Error(error.message)
          toast.success('Final payment successful! Admin will confirm shortly.')
          onSuccess(); onClose()
        } catch { toast.error('Payment done but update failed. Contact support.') }
      },
      modal: { ondismiss: () => setLoading(false) }
    }
    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', (r) => { toast.error(`Payment failed: ${r.error.description}`); setLoading(false) })
    rzp.open(); setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="rounded-2xl w-full max-w-sm overflow-hidden border" style={{ background: '#111928', borderColor: 'rgba(0,200,255,0.2)' }}>
        <div className="flex items-center justify-between p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
          <div>
            <h2 className="text-xl font-bold text-white">Pay Remaining Balance</h2>
            <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{booking.service_title}</p>
          </div>
          <button onClick={onClose} className="p-2 rounded-lg transition-colors hover:text-[#00C8FF]"
            style={{ color: 'rgba(255,255,255,0.5)' }}><X size={20} /></button>
        </div>
        <div className="p-6 space-y-4">
          <div className="rounded-xl p-4 text-center" style={{ background: 'rgba(0,200,255,0.07)', border: '1px solid rgba(0,200,255,0.2)' }}>
            <p className="text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>Amount to Pay</p>
            <p className="text-3xl font-black text-[#00C8FF] mt-1">₹{remaining.toLocaleString()}</p>
            <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.35)' }}>Final payment after work delivery</p>
          </div>
          <div className="grid grid-cols-2 gap-2">
            {[{ label: 'UPI', emoji: '📱' }, { label: 'Cards', emoji: '💳' }, { label: 'Net Banking', emoji: '🏦' }, { label: 'Wallets', emoji: '👛' }].map(({ label, emoji }) => (
              <div key={label} className="rounded-xl p-2 flex items-center gap-2"
                style={{ background: 'rgba(0,200,255,0.05)', border: '1px solid rgba(0,200,255,0.1)' }}>
                <span>{emoji}</span>
                <p className="text-xs font-semibold text-white">{label}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-2 rounded-xl p-3" style={{ background: 'rgba(0,200,255,0.05)', border: '1px solid rgba(0,200,255,0.12)' }}>
            <CheckCircle size={14} className="text-[#00C8FF] shrink-0" />
            <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>Secure payment via Razorpay</p>
          </div>
        </div>
        <div className="p-6 pt-0 flex gap-3">
          <button onClick={onClose}
            className="option-btn-neutral flex items-center gap-1 px-4 py-3 rounded-xl font-semibold"
            style={{ color: 'rgba(255,255,255,0.5)' }}>
            <ArrowLeft size={16} /> Back
          </button>
          <button onClick={handlePay} disabled={loading}
            className="btn-primary flex-1 py-3 rounded-xl font-bold disabled:opacity-60 flex items-center justify-center gap-2">
            {loading ? <Loader2 size={18} className="animate-spin" /> : null}
            {loading ? 'Loading...' : `Pay ₹${remaining.toLocaleString()}`}
          </button>
        </div>
      </div>
    </div>
  )
}

export default function Dashboard() {
  const { user, signOut } = useAuthStore()
  const [bookings, setBookings] = useState([])
  const [loading, setLoading] = useState(true)
  const [payingBooking, setPayingBooking] = useState(null)
  const [thankYouBooking, setThankYouBooking] = useState(null)
  const [profile, setProfile] = useState(null)
  const navigate = useNavigate()
  const isAdmin = user && ADMIN_EMAILS.includes(user.email)

  useEffect(() => {
    if (!user || !supabase) return
    supabase.from('users').select('name, email, phone, profile_url').eq('id', user.id).single()
      .then(({ data }) => { if (data) setProfile(data) })
  }, [user])

  const fetchBookings = () => {
    if (!user || !supabase) { setLoading(false); return }
    supabase.from('bookings').select('*').eq('user_id', user.id).order('created_at', { ascending: false })
      .then(({ data }) => {
        setBookings(data || [])
        setLoading(false)
        const seen = JSON.parse(localStorage.getItem('seen_completed') || '[]')
        const newlyDone = (data || []).find(b => b.status === 'fully_completed' && !seen.includes(b.id))
        if (newlyDone) {
          setThankYouBooking(newlyDone)
          localStorage.setItem('seen_completed', JSON.stringify([...seen, newlyDone.id]))
        }
      })
      .catch(() => setLoading(false))
  }

  useEffect(() => { fetchBookings() }, [user])

  const handleSignOut = async () => { await signOut(); toast.success('Signed out'); navigate('/') }

  if (!user) return null

  const name = profile?.name || user.user_metadata?.full_name || user.user_metadata?.name || 'User'
  const avatar = profile?.profile_url || user.user_metadata?.avatar_url ||
    `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=00C8FF&color=080E1C`
  const displayContact = profile?.phone || user.phone || user.email || ''
  const totalSpent = bookings.reduce((s, b) => s + (b.advance_paid || 0), 0)
  const totalRemaining = bookings
    .filter(b => b.status !== 'cancelled' && b.status !== 'fully_completed')
    .reduce((s, b) => s + Math.max(0, (b.total_amount || 0) - (b.advance_paid || 0)), 0)

  return (
    <div className="min-h-screen pt-16" style={{ background: '#080E1C', fontFamily: 'Space Grotesk, sans-serif' }}>
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">

        {/* Profile */}
        <div className="rounded-2xl p-6 text-white mb-8 flex items-center justify-between flex-wrap gap-4 border"
          style={{ background: '#0C1325', borderColor: 'rgba(0,200,255,0.2)' }}>
          <div className="flex items-center gap-4">
            <img src={avatar} alt="avatar" className="w-16 h-16 rounded-full object-cover"
              style={{ border: '3px solid rgba(0,200,255,0.4)' }} />
            <div>
              <h1 className="text-2xl font-black text-white">{name}</h1>
              <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{displayContact}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {isAdmin && (
              <button onClick={() => navigate('/admin')}
                className="option-btn flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold text-[#00C8FF]">
                <LayoutDashboard size={16} /> Admin Panel
              </button>
            )}
            <button onClick={handleSignOut}
              className="option-btn-neutral flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold"
              style={{ color: 'rgba(255,255,255,0.7)' }}>
              <LogOut size={16} /> Sign Out
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: 'Total Bookings', value: bookings.length },
            { label: 'Completed', value: bookings.filter(b => b.status === 'completed' || b.status === 'fully_completed').length },
            { label: 'Advance Paid', value: `₹${totalSpent.toLocaleString()}` },
            { label: 'Balance Due', value: `₹${totalRemaining.toLocaleString()}` },
          ].map(({ label, value }) => (
              <div key={label} className="dark-card rounded-2xl p-5 text-center"
              style={{ background: '#111928' }}>
              <div className="text-2xl font-black text-[#00C8FF]">{value}</div>
              <div className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.45)' }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Bookings */}
        <div className="rounded-2xl border overflow-hidden" style={{ background: '#111928', borderColor: 'rgba(255,255,255,0.07)' }}>
          <div className="p-6" style={{ borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
            <h2 className="text-xl font-bold text-white">My Bookings</h2>
          </div>
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 size={28} className="animate-spin text-[#00C8FF]" />
            </div>
          ) : bookings.length === 0 ? (
            <div className="text-center py-16" style={{ color: 'rgba(255,255,255,0.4)' }}>
              <p className="text-lg font-medium">No bookings yet</p>
              <button onClick={() => navigate('/#services')}
                className="btn-primary mt-4 px-6 py-2 rounded-xl text-sm font-semibold">
                Browse Services
              </button>
            </div>
          ) : (
            <div className="divide-y" style={{ '--tw-divide-opacity': 1 }}>
              {bookings.map((b) => {
                const remaining = b.status === 'fully_completed' ? 0 : Math.max(0, (b.total_amount || 0) - (b.advance_paid || 0))
                const isCompleted = b.status === 'completed'
                const isCancelled = b.status === 'cancelled'
                const isPending = b.status === 'pending_verification'
                const isPendingFinal = b.status === 'pending_final_verification'
                return (
                  <div key={b.id} className="p-5 transition-colors" style={{ borderTop: '1px solid rgba(255,255,255,0.05)' }}
                    onMouseEnter={e => e.currentTarget.style.background = 'rgba(0,200,255,0.03)'}
                    onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-white">{b.service_title}</p>
                        <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>{b.package_name}</p>
                        {b.description && <p className="text-xs mt-1 truncate" style={{ color: 'rgba(255,255,255,0.35)' }}>{b.description}</p>}
                        <p className="text-xs mt-1" style={{ color: 'rgba(255,255,255,0.3)' }}>
                          {new Date(b.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="font-bold text-green-400">₹{(b.advance_paid || 0).toLocaleString()} paid</p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>of ₹{(b.total_amount || 0).toLocaleString()} total</p>
                        <span className={`inline-block mt-1 text-xs font-semibold px-2 py-0.5 rounded-full ${statusColor[b.status] || 'bg-white/10 text-white/60'}`}>
                          {statusLabel[b.status] || b.status?.replace(/_/g, ' ')}
                        </span>
                      </div>
                    </div>

                    {isCompleted && remaining > 0 && (
                      <div className="mt-3 rounded-xl px-4 py-3 flex items-center justify-between gap-3"
                        style={{ background: 'rgba(251,146,60,0.1)', border: '1px solid rgba(251,146,60,0.3)' }}>
                        <div className="flex items-center gap-2">
                          <AlertCircle size={15} className="text-orange-400 shrink-0" />
                          <span className="text-orange-300 font-semibold text-sm">Work done! Pay remaining balance</span>
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-bold text-orange-300">₹{remaining.toLocaleString()}</span>
                          <button onClick={() => setPayingBooking(b)}
                            className="btn-primary text-xs font-bold px-4 py-2 rounded-lg">Pay Now</button>
                        </div>
                      </div>
                    )}
                    {isPendingFinal && remaining > 0 && (
                      <div className="mt-3 rounded-xl px-4 py-2.5 flex items-center justify-between gap-2 text-sm"
                        style={{ background: 'rgba(234,179,8,0.08)', border: '1px solid rgba(234,179,8,0.25)' }}>
                        <div className="flex items-center gap-2">
                          <AlertCircle size={15} className="text-yellow-400" />
                          <span className="text-yellow-300 font-semibold">Final payment submitted — awaiting admin verification</span>
                        </div>
                        <span className="font-bold text-yellow-400">₹{remaining.toLocaleString()}</span>
                      </div>
                    )}
                    {isPending && remaining > 0 && (
                      <div className="mt-3 rounded-xl px-4 py-2.5 flex items-center justify-between gap-2 text-sm"
                        style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.1)' }}>
                        <div className="flex items-center gap-2">
                          <AlertCircle size={15} style={{ color: 'rgba(255,255,255,0.4)' }} />
                          <span style={{ color: 'rgba(255,255,255,0.5)' }}>Awaiting payment verification by admin</span>
                        </div>
                        <span className="font-bold" style={{ color: 'rgba(255,255,255,0.5)' }}>₹{remaining.toLocaleString()}</span>
                      </div>
                    )}
                    {!isCompleted && !isCancelled && !isPending && !isPendingFinal && b.status !== 'fully_completed' && remaining > 0 && (
                      <div className="mt-3 rounded-xl px-4 py-2.5 flex items-center justify-between gap-2 text-sm"
                        style={{ background: 'rgba(251,146,60,0.07)', border: '1px solid rgba(251,146,60,0.2)' }}>
                        <div className="flex items-center gap-2">
                          <AlertCircle size={15} className="text-orange-400" />
                          <span className="text-orange-300">Remaining balance due after delivery</span>
                        </div>
                        <span className="font-bold text-orange-300">₹{remaining.toLocaleString()}</span>
                      </div>
                    )}
                    {b.status === 'fully_completed' && (
                      <div className="mt-3 rounded-xl px-4 py-2 flex items-center gap-2 text-sm"
                        style={{ background: 'rgba(0,200,255,0.07)', border: '1px solid rgba(0,200,255,0.2)' }}>
                        <CheckCircle size={15} className="text-[#00C8FF]" />
                        <span className="font-semibold text-[#00C8FF]">Project fully completed — Thank you for choosing us!</span>
                      </div>
                    )}
                    {!isCancelled && b.status !== 'fully_completed' && remaining === 0 && (
                      <div className="mt-3 rounded-xl px-4 py-2 flex items-center gap-2 text-sm"
                        style={{ background: 'rgba(0,200,255,0.05)', border: '1px solid rgba(0,200,255,0.15)' }}>
                        <CheckCircle size={15} className="text-[#00C8FF]" />
                        <span className="font-semibold" style={{ color: 'rgba(0,200,255,0.8)' }}>Fully paid — no balance due</span>
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {payingBooking && <RemainingPayModal booking={payingBooking} onClose={() => setPayingBooking(null)} onSuccess={fetchBookings} />}
      {thankYouBooking && <ThankYouModal booking={thankYouBooking} onClose={() => setThankYouBooking(null)} />}
    </div>
  )
}
