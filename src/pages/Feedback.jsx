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
        <button
          key={star}
          type="button"
          disabled={readonly}
          onClick={() => !readonly && onChange && onChange(star)}
          onMouseEnter={() => !readonly && setHovered(star)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-transform ${!readonly ? 'hover:scale-110 cursor-pointer' : 'cursor-default'}`}
        >
          <Star
            size={size}
            className={`transition-colors ${
              star <= (hovered || value)
                ? 'fill-yellow-400 text-yellow-400'
                : 'fill-gray-200 text-gray-200'
            }`}
          />
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

  // Pull name & avatar from Google profile
  const userName = user?.user_metadata?.full_name || user?.user_metadata?.name || ''
  const userAvatar = user?.user_metadata?.avatar_url || ''

  useEffect(() => { fetchReviews() }, [])

  const fetchReviews = async () => {
    if (!supabase) { setLoadingReviews(false); return }
    const { data, error } = await supabase
      .from('feedback')
      .select('*')
      .order('created_at', { ascending: false })
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
        user_id: user.id,
        user_email: user.email,
        name: userName,
        avatar_url: userAvatar,
        rating,
        comment: comment.trim(),
      })
      if (error) throw error
      toast.success('Thank you for your feedback!')
      setRating(0)
      setComment('')
      fetchReviews()
    } catch (err) {
      console.error('Feedback error:', err)
      toast.error(err?.message || 'Failed to submit. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const avgRating = reviews.length
    ? (reviews.reduce((s, r) => s + r.rating, 0) / reviews.length).toFixed(1)
    : 0

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Hero */}
      <div className="py-14 text-center" style={{ background: 'linear-gradient(135deg, #1a0000 0%, #7f1d1d 40%, #b91c1c 100%)' }}>
        <div className="max-w-2xl mx-auto px-4">
          <MessageSquare size={40} className="text-white/80 mx-auto mb-3" />
          <h1 className="text-4xl font-black text-white mb-2">Share Your Experience</h1>
          <p className="text-white/70 text-lg">Your feedback helps us improve and grow</p>
          {reviews.length > 0 && (
            <div className="mt-4 inline-flex items-center gap-2 bg-white/20 rounded-full px-5 py-2">
              <Star size={18} className="fill-yellow-300 text-yellow-300" />
              <span className="text-white font-bold text-lg">{avgRating}</span>
              <span className="text-white/70 text-sm">from {reviews.length} reviews</span>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 py-10 space-y-10">

        {/* Submit form */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-6">Write a Review</h2>

          {!user ? (
            <div className="text-center py-8 space-y-3">
              <p className="text-gray-500">Sign in with Google to submit your review</p>
              <Link to="/login"
                className="btn-navy inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
                <LogIn size={18} /> Sign In to Review
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Google profile preview */}
              <div className="flex items-center gap-3 bg-gray-50 rounded-xl p-3">
                <img
                  src={userAvatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(userName || 'U')}&background=dc2626&color=fff`}
                  alt={userName}
                  className="w-10 h-10 rounded-full object-cover border-2 border-blue-200"
                />
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{userName || 'Anonymous'}</p>
                  <p className="text-xs text-gray-400">{user.email}</p>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Rating</label>
                <StarRating value={rating} onChange={setRating} />
                {rating > 0 && (
                  <p className="text-sm text-gray-500 mt-1">
                    {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Your Comment</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={4}
                  placeholder="Tell us about your experience with ASLEN TECH SOLUTIONS..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-navy w-full py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={18} />}
                {loading ? 'Submitting...' : 'Submit Review'}
              </button>
            </form>
          )}
        </div>

        {/* Reviews list */}
        <div>
          <h2 className="text-xl font-bold text-gray-900 mb-4">
            What Our Clients Say {reviews.length > 0 && <span className="text-gray-400 font-normal text-base">({reviews.length})</span>}
          </h2>

          {loadingReviews ? (
            <div className="flex justify-center py-10">
              <Loader2 size={28} className="animate-spin text-blue-500" />
            </div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 text-gray-400 bg-white rounded-2xl border border-gray-100">
              <Star size={36} className="mx-auto mb-2 text-gray-200" />
              <p>No reviews yet. Be the first!</p>
            </div>
          ) : (
            <div className="space-y-4">
              {reviews.map((r) => (
                <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={r.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name || 'U')}&background=dc2626&color=fff`}
                      />
                      <div>
                        <p className="font-semibold text-gray-900 text-sm">{r.name || 'Anonymous'}</p>
                        <p className="text-xs text-gray-400">
                          {r.user_email && <span className="mr-2">{r.user_email}</span>}
                          {new Date(r.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                    <StarRating value={r.rating} readonly size={16} />
                  </div>
                  <p className="mt-3 text-gray-700 text-sm leading-relaxed">{r.comment}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
