import { useState, useEffect } from 'react'
import { ArrowRight, CheckCircle, Users, Award, Zap, Loader2, Star, MessageSquare } from 'lucide-react'
import { Link } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ServiceCard from '../components/ServiceCard'
import { services } from '../data/services'
import toast from 'react-hot-toast'

export default function Home() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [reviews, setReviews] = useState([])

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

      {/* Hero */}
      <section id="home" className="min-h-screen flex items-center bg-gradient-to-br from-slate-900 via-blue-950 to-purple-950 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500 rounded-full blur-3xl opacity-20" />
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500 rounded-full blur-3xl opacity-20" />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm border border-white/20 rounded-full px-4 py-2 mb-6">
              <Zap size={14} className="text-yellow-400" />
              <span className="text-white/80 text-sm">Smart Digital Solutions</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-4">
              ASLEN<br />
              <span className="bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
                TECH SOLUTIONS
              </span>
            </h1>
            <p className="text-xl text-white/70 mb-8 leading-relaxed">
              Empowering Businesses with Smart Digital Solutions
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#services" className="bg-gradient-to-r from-blue-500 to-purple-600 text-white px-8 py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity flex items-center gap-2">
                Explore Services <ArrowRight size={20} />
              </a>
              <a href="#contact" className="border border-white/30 text-white px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/10 transition-colors">
                Contact Us
              </a>
            </div>
            <div className="flex flex-wrap gap-8 mt-12">
              {[['50+', 'Projects Done'], ['100%', 'Client Satisfaction'], ['24/7', 'Support']].map(([val, label]) => (
                <div key={label}>
                  <div className="text-3xl font-black text-white">{val}</div>
                  <div className="text-white/50 text-sm">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Services */}
      <section id="services" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-3">Our Services</h2>
            <p className="text-gray-500 text-lg max-w-xl mx-auto">
              Everything your business needs to thrive in the digital world
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s) => (
              <ServiceCard key={s.id} service={s} />
            ))}
          </div>
        </div>
      </section>

      {/* About */}
      <section id="about" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-black text-gray-900 mb-4">About ASLEN</h2>
              <p className="text-gray-600 leading-relaxed mb-6">
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
                    <CheckCircle size={18} className="text-green-500 shrink-0" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="grid grid-cols-2 gap-4">
              {[
                { icon: Users, label: 'Happy Clients', value: '50+', color: 'from-blue-500 to-cyan-500' },
                { icon: Award, label: 'Projects Completed', value: '80+', color: 'from-purple-500 to-pink-500' },
                { icon: Zap, label: 'Years Experience', value: '3+', color: 'from-orange-500 to-red-500' },
                { icon: CheckCircle, label: 'Success Rate', value: '100%', color: 'from-green-500 to-teal-500' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className={`bg-gradient-to-br ${color} rounded-2xl p-6 text-white`}>
                  <Icon size={28} className="mb-3 opacity-80" />
                  <div className="text-3xl font-black">{value}</div>
                  <div className="text-sm opacity-80 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Reviews / Feedback */}
      <section id="reviews" className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-3">What Our Clients Say</h2>
            <p className="text-gray-500 text-lg">Real feedback from real clients</p>
          </div>

          {reviews.length === 0 ? (
            <div className="text-center py-10">
              <MessageSquare size={40} className="mx-auto text-gray-200 mb-3" />
              <p className="text-gray-400 mb-4">No reviews yet — be the first!</p>
              <Link to="/feedback" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
                <Star size={16} /> Write a Review
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                {reviews.map((r) => (
                  <div key={r.id} className="bg-white rounded-2xl border border-gray-100 p-5 shadow-sm flex flex-col gap-3">
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={16} className={s <= r.rating ? 'fill-yellow-400 text-yellow-400' : 'fill-gray-200 text-gray-200'} />
                      ))}
                    </div>
                    <p className="text-gray-700 text-sm leading-relaxed flex-1">"{r.comment}"</p>
                    <div className="flex items-center gap-2 pt-2 border-t border-gray-50">
                      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                        {r.name?.charAt(0)?.toUpperCase() || 'U'}
                      </div>
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
              <div className="text-center">
                <Link to="/feedback" className="inline-flex items-center gap-2 bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:opacity-90 transition-opacity">
                  <Star size={16} /> Share Your Experience
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* Contact */}
      <section id="contact" className="py-20 bg-gray-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-black text-gray-900 mb-3">Get In Touch</h2>
            <p className="text-gray-500 text-lg">Have a project in mind? Let's talk.</p>
          </div>
          <form onSubmit={handleContact} className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-5">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Name</label>
                <input
                  type="text" required
                  value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="Your name"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="email" required
                  value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Message</label>
              <textarea
                required rows={5}
                value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                placeholder="Tell us about your project..."
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
            <button
              type="submit" disabled={submitting}
              className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-4 rounded-xl font-bold text-lg hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {submitting && <Loader2 size={18} className="animate-spin" />}
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </section>
    </div>
  )
}
