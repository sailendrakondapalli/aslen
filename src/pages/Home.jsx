import { useState, useEffect } from 'react'
import { ArrowRight, CheckCircle, Users, Award, Zap, Loader2, Star, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ServiceCard from '../components/ServiceCard'
import { services } from '../data/services'
import { useScrollReveal } from '../hooks/useScrollReveal'
import toast from 'react-hot-toast'

export default function Home() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [reviews, setReviews] = useState([])

  useScrollReveal()

  useEffect(() => {
    if (!supabase) return
    supabase.from('feedback').select('*').order('created_at', { ascending: false }).limit(6)
      .then(({ data }) => setReviews(data || []))
  }, [])

  const handleContact = async (e) => {
    e.preventDefault()
    setSubmitting(true)
    try {
      if (supabase) {
        const { error } = await supabase.from('contacts').insert(contactForm)
        if (error) throw error
      }
      toast.success('Message sent! We will get back to you soon.')
      setContactForm({ name: '', email: '', message: '' })
    } catch {
      toast.error('Failed to send message. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="pt-16">

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section id="home" className="min-h-screen flex items-center relative overflow-hidden"
        style={{ background: 'linear-gradient(135deg, #1a0000 0%, #7f1d1d 40%, #b91c1c 100%)' }}>
        {/* Decorative blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-20 left-10 w-80 h-80 rounded-full blur-3xl opacity-20"
            style={{ background: 'radial-gradient(circle, #ef4444, transparent)' }} />
          <div className="absolute bottom-20 right-10 w-96 h-96 rounded-full blur-3xl opacity-15"
            style={{ background: 'radial-gradient(circle, #dc2626, transparent)' }} />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-3xl opacity-10"
            style={{ background: 'radial-gradient(circle, #f59e0b, transparent)' }} />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="max-w-3xl">
            <div className="reveal inline-flex items-center gap-2 border border-white/20 rounded-full px-4 py-2 mb-6"
              style={{ background: 'rgba(255,255,255,0.08)', backdropFilter: 'blur(8px)' }}>
              <Zap size={14} className="text-yellow-400" />
              <span className="text-white/80 text-sm font-medium">Smart Digital Solutions</span>
            </div>

            <h1 className="reveal reveal-delay-1 text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-4">
              ASLEN<br />
              <span style={{ background: 'linear-gradient(90deg, #fca5a5, #fbbf24)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                TECH SOLUTIONS
              </span>
            </h1>

            <p className="reveal reveal-delay-2 text-xl mb-8 leading-relaxed" style={{ color: 'rgba(255,255,255,0.65)' }}>
              Empowering Businesses with Smart Digital Solutions
            </p>

            <div className="reveal reveal-delay-3 flex flex-wrap gap-4">
              <a href="#services" className="btn-navy px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2 transition-opacity hover:opacity-90">
                Explore Services <ArrowRight size={20} />
              </a>
              <a href="#contact" className="px-8 py-4 rounded-xl font-bold text-lg text-white transition-colors"
                style={{ border: '1px solid rgba(255,255,255,0.25)' }}
                onMouseEnter={e => e.target.style.background = 'rgba(255,255,255,0.1)'}
                onMouseLeave={e => e.target.style.background = 'transparent'}>
                Contact Us
              </a>
            </div>

            <div className="reveal reveal-delay-4 flex flex-wrap gap-10 mt-14">
              {[['50+', 'Projects Done'], ['100%', 'Client Satisfaction'], ['24/7', 'Support']].map(([val, label]) => (
                <div key={label}>
                  <div className="text-3xl font-black text-white">{val}</div>
                  <div className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────────────────── */}
      <section id="services" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal text-center mb-14">
            <span className="text-sm font-bold uppercase tracking-widest" style={{ color: '#b91c1c' }}>What We Offer</span>
            <h2 className="text-4xl font-black text-gray-900 mt-2 mb-3">Our Services</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Everything your business needs to thrive in the digital world
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s, i) => (
              <div key={s.id} className={`reveal reveal-delay-${Math.min(i + 1, 5)} card-hover`}>
                <ServiceCard service={s} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────────────────── */}
      <section id="about" className="py-20" style={{ background: '#f0f4ff' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div className="reveal-left">
              <span className="text-sm font-bold uppercase tracking-widest" style={{ color: '#b91c1c' }}>Who We Are</span>
              <h2 className="text-4xl font-black text-gray-900 mt-2 mb-4">About ASLEN</h2>
              <p className="text-gray-600 leading-relaxed mb-4">
                ASLEN TECH SOLUTIONS is a forward-thinking digital agency dedicated to helping businesses grow through technology. We combine creativity with technical expertise to deliver solutions that make a real impact.
              </p>
              <p className="text-gray-600 leading-relaxed mb-8">
                From startups to established enterprises, we partner with businesses of all sizes to build their digital presence and streamline their operations.
              </p>
              <ul className="space-y-3">
                {[
                  'Expert team of developers & designers',
                  'Affordable pricing with premium quality',
                  'On-time delivery guaranteed',
                  'Post-delivery support included',
                ].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-gray-700">
                    <CheckCircle size={18} className="shrink-0" style={{ color: '#b91c1c' }} />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="reveal-right grid grid-cols-2 gap-4">
              {[
                { icon: Users, label: 'Happy Clients', value: '50+' },
                { icon: Award, label: 'Projects Completed', value: '80+' },
                { icon: Zap, label: 'Years Experience', value: '3+' },
                { icon: CheckCircle, label: 'Success Rate', value: '100%' },
              ].map(({ icon: Icon, label, value }, i) => (
                <div key={label} className={`reveal reveal-delay-${i + 1} card-hover rounded-2xl p-6 text-white`}
                  style={{ background: 'linear-gradient(135deg, #7f1d1d, #b91c1c)' }}>
                  <Icon size={28} className="mb-3 opacity-70" />
                  <div className="text-3xl font-black">{value}</div>
                  <div className="text-sm opacity-70 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews ──────────────────────────────────────────────────────── */}
      <section id="reviews" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal text-center mb-12">
            <span className="text-sm font-bold uppercase tracking-widest" style={{ color: '#b91c1c' }}>Testimonials</span>
            <h2 className="text-4xl font-black text-gray-900 mt-2 mb-3">What Our Clients Say</h2>
            <p className="text-gray-500 text-lg">Real feedback from real clients</p>
          </div>

          {reviews.length === 0 ? (
            <div className="reveal text-center py-10">
              <MessageSquare size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-400 mb-4">No reviews yet — be the first!</p>
              <Link to="/feedback" className="btn-navy inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold">
                <Star size={16} /> Write a Review
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                {reviews.map((r, i) => (
                  <div key={r.id} className={`reveal reveal-delay-${Math.min(i + 1, 5)} card-hover bg-white rounded-2xl p-5 flex flex-col gap-3`}
                    style={{ border: '1px solid #e8eeff', boxShadow: '0 2px 16px rgba(26,41,128,0.06)' }}>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={15} className={s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'} />
                      ))}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed flex-1">"{r.comment}"</p>
                    <div className="flex items-center gap-2 pt-2" style={{ borderTop: '1px solid #f0f4ff' }}>
                      <img
                        src={r.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name || 'U')}&background=b91c1c&color=fff`}
                        alt={r.name}
                        className="w-9 h-9 rounded-full object-cover shrink-0"
                        style={{ border: '2px solid #e8eeff' }}
                      />
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{r.name || 'Anonymous'}</p>
                        <p className="text-xs text-gray-400">
                          {new Date(r.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="reveal text-center">
                <Link to="/feedback" className="btn-navy inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold">
                  <Star size={16} /> Share Your Experience
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────────────────── */}
      <section id="contact" className="py-20" style={{ background: '#f0f4ff' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal text-center mb-12">
            <span className="text-sm font-bold uppercase tracking-widest" style={{ color: '#b91c1c' }}>Contact</span>
            <h2 className="text-4xl font-black text-gray-900 mt-2 mb-3">Get In Touch</h2>
            <p className="text-gray-500 text-lg">Have a project in mind? Let's talk.</p>
          </div>
          <form onSubmit={handleContact} className="reveal bg-white rounded-2xl p-8 space-y-5"
            style={{ boxShadow: '0 4px 32px rgba(26,41,128,0.08)', border: '1px solid #e8eeff' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Name</label>
                <input type="text" required value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="Your name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2"
                  style={{ '--tw-ring-color': '#1a2980' }} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email</label>
                <input type="email" required value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Message</label>
              <textarea required rows={5} value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                placeholder="Tell us about your project..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 resize-none" />
            </div>
            <button type="submit" disabled={submitting}
              className="btn-navy w-full py-4 rounded-xl font-bold text-lg disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting && <Loader2 size={18} className="animate-spin" />}
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
