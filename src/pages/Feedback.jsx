import { useState, useEffect } from 'react'
import { Star, Send, Loader2, MessageSquare, LogIn } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

function StarRating({ value, onChange, readonly = false, size = 28 }) {
  const [hovered, setHovered] = useState(0)
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" disabled={readonly}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-transform ${!readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}>
          <Star size={size} className={`transition-colors ${
            star <= (hovered || value) ? 'fill-[#00C8FF] text-[#00C8FF]' : 'fill-white/10 text-white/10'
          }`} />
        </button>
      ))}
    </div>
  )
}

export default function Feedback() {
  const { user } = useAuthStore()
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [reviews, setReviews] = useState([])
  const [loadingReviews, setLoadingReviews] = useState(true)

  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || ''
  const userAvatar = user?.user_metadata?.avatar_url || ''

  useEffect(() => { fetchReviews() }, [])

  const fetchReviews = async () => {
    if (!supabase) { setLoadingReviews(false); return }
    const { data, error } = await supabase.from('feedback').select('*').order('created_at', { ascending: false })
    if (error) console.error('Fetch reviews error:', error)
    setReviews(data || [])
    setLoadingReviews(false)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!user) { toast.error('Please sign in to submit feedback'); return }
    if (rating === 0) { toast.error('Please select a star rating'); return }
    if (!comment.trim()) { toast.error('Please write a comment'); return }
    if (!supabase) { toast.error('Service unavailable'); return }
    setLoading(true)
    try {
      const { error } = await supabase.from('feedback').insert({
        user_id: user.id, user_email: user.email,
        name: userName, avatar_url: userAvatar, rating, comment: comment.trim(),
      })
      if (error) throw error
      toast.success('Thank you for your feedback!')
      setRating(0); setComment('')
      fetchReviews()
    } catch (err) {
      toast.error(err?.message || 'Failed to submit. Please try again.')
    } finally { setLoading(false) }
  }

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1) : 0

  return (
    <div className="min-h-screen pt-16" style={{ background: '#080E1C', fontFamily: 'Space Grotesk, sans-serif' }}>

      {/* Hero */}
      <div className="py-14 text-center relative overflow-hidden" style={{ background: '#0C1325' }}>
        {/* Orbs */}
        <div className="absolute top-0 right-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,200,255,0.15) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
        <div className="absolute bottom-0 left-0 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(0,98,255,0.12) 0%, transparent 70%)', transform: 'translate(-20%, 30%)' }} />

        <div className="max-w-2xl mx-auto px-4 relative z-10" style={{ animation: 'fadeUp 0.7s ease both' }}>
          <MessageSquare size={40} className="mx-auto mb-3" style={{ color: 'rgba(0,200,255,0.7)' }} />
          <h1 className="text-4xl font-black text-white mb-2">Share Your Experience</h1>
          <p className="text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>Your feedback helps us improve and grow</p>
          {reviews.length > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 rounded-full px-5 py-2"
              style={{ background: 'rgba(0,200,255,0.1)', border: '1px solid rgba(0,200,255,0.2)' }}>
              <Star size={18} className="fill-[#00C8FF] text-[#00C8FF]" />
              <span className="text-white font-bold text-lg">{avgRating}</span>
              <span className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>from {reviews.length} reviews</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">

        {/* Submit form */}
        <div className="rounded-2xl border p-6" style={{ background: '#111928', borderColor: 'rgba(0,200,255,0.15)', animation: 'fadeUp 0.8s ease 0.1s both' }}>
          <h2 className="text-xl font-bold text-white mb-6">Write a Review</h2>
          {!user ? (
            <div className="text-center py-8 space-y-3">
              <p style={{ color: 'rgba(255,255,255,0.5)' }}>Sign in to submit your review</p>
              <Link to="/login"
                className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold">
                <LogIn size={18} /> Sign In to Review
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="flex items-center gap-3 rounded-xl p-3" style={{ background: 'rgba(0,200,255,0.05)', border: '1px solid rgba(0,200,255,0.1)' }}>
                <img src={userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'U')}&background=00C8FF&color=080E1C`}
                  alt={userName} className="w-10 h-10 rounded-full object-cover" style={{ border: '2px solid rgba(0,200,255,0.3)' }} />
                <div>
                  <p className="font-semibold text-white text-sm">{userName || 'Anonymous'}</p>
                  <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{user.email || user.phone}</p>
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Rating</label>
                <StarRating value={rating} onChange={setRating} />
                {rating > 0 && (
                  <p className="text-sm mt-1 text-[#00C8FF]">{['','Poor','Fair','Good','Very Good','Excellent'][rating]}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-1">Your Comment</label>
                <textarea value={comment} onChange={(e) => setComment(e.target.value)} rows={4}
                  placeholder="Tell us about your experience with ASLEN TECH SOLUTIONS..."
                  className="w-full rounded-xl px-4 py-3 text-sm text-white resize-none"
                  style={{ background: '#080E1C', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <button type="submit" disabled={loading}
                className="btn-primary w-full py-3 rounded-xl font-bold disabled:opacity-60 flex items-center justify-center gap-2">
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>

        {/* Reviews list */}
        <div>
          <h2 className="text-xl font-bold text-white mb-4">
            What Our Clients Say{' '}
            {reviews.length > 0 && <span className="font-normal text-base" style={{ color: 'rgba(255,255,255,0.4)' }}>({reviews.length})</span>}
          </h2>
          {loadingReviews ? (
            <div className="flex justify-center py-10">
              <Loader2 size={28} className="animate-spin text-[#00C8FF]" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 rounded-2xl border" style={{ background: '#111928', borderColor: 'rgba(0,200,255,0.12)', color: 'rgba(255,255,255,0.4)' }}>
              <Star size={36} className="mx-auto mb-2" style={{ color: 'rgba(0,200,255,0.2)' }} />
              <p>No reviews yet. Be the first!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id}
                  className="rounded-2xl border p-5 transition-all"
                  style={{ background: '#111928', borderColor: 'rgba(255,255,255,0.07)' }}
                  onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(0,200,255,0.25)'}
                  onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)'}>
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img src={r.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name || 'U')}&background=00C8FF&color=080E1C`}
                        alt={r.name} className="w-10 h-10 rounded-full object-cover shrink-0" style={{ border: '2px solid rgba(0,200,255,0.3)' }} />
                      <div>
                        <p className="font-semibold text-white text-sm">{r.name || 'Anonymous'}</p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>
                          {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <StarRating value={r.rating} readonly size={16} />
                  </div>
                  <p className="mt-3 text-sm leading-relaxed" style={{ color: 'rgba(255,255,255,0.6)' }}>{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
