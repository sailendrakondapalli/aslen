import { useState, useEffect } from 'react'
import { ArrowRight, CheckCircle, Users, Award, Zap, Loader2, Star, MessageSquare, ExternalLink } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ServiceCard from '../components/ServiceCard'
import { services } from '../data/services'
import { useScrollReveal } from '../hooks/useScrollReveal'
import toast from 'react-hot-toast'

const PROJECTS = [
  { name: 'WedFeast', url: 'https://www.wedfeast.in', desc: 'Wedding catering & feast services', tag: 'Food & Events' },
  { name: 'Saravana Travel', url: 'https://www.saravanatravel.in', desc: 'Tour & travel booking platform', tag: 'Travel' },
  { name: 'Modak Beauty Parlour', url: 'https://www.modaknaturalbeautyparlour.in', desc: 'Natural beauty parlour services', tag: 'Beauty & Wellness' },
  { name: 'Kerala Memory Travels', url: 'https://www.keralamemorytravels.in', desc: 'Kerala tourism & travel packages', tag: 'Travel' },
]

function ProjectCard({ site }) {
  return (
    <a href={site.url} target="_blank" rel="noopener noreferrer"
      className="card-hover group bg-white rounded-2xl overflow-hidden flex flex-col border border-[#e2e8f0] hover:border-[#222222]/30">
      <div className="h-36 bg-[#f5f5f5] flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[#222222]/5 to-[#222222]/10" />
        <div className="relative text-center px-4">
          <p className="font-bold text-[#222222] text-lg">{site.name}</p>
          <span className="text-xs bg-[#222222] text-white px-2 py-0.5 rounded-full mt-1 inline-block">{site.tag}</span>
        </div>
        <ExternalLink size={14} className="absolute top-3 right-3 text-[#222222]/40 group-hover:text-[#222222] transition-colors" />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-[#64748b] text-sm flex-1">{site.desc}</p>
        <div className="mt-3 flex items-center gap-1 text-sm font-semibold text-[#222222]">
          Visit Site <ArrowRight size={14} />
        </div>
      </div>
    </a>
  )
}

export default function Home() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [reviews, setReviews] = useState([])
  const navigate = useNavigate()

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
      <section id="home" className="min-h-screen flex items-center bg-[#222222] relative overflow-hidden">
        {/* Decorative shapes */}
        <div className="absolute top-0 right-0 w-[600px] h-[600px] rounded-full bg-white/5 -translate-y-1/3 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-[400px] h-[400px] rounded-full bg-white/5 translate-y-1/3 -translate-x-1/4 pointer-events-none" />
        <div className="absolute top-1/2 left-1/2 w-[800px] h-[800px] rounded-full bg-white/3 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 relative z-10">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 border border-white/20 rounded-full px-4 py-2 mb-6 bg-white/10">
              <Zap size={14} className="text-[#f59e0b]" />
              <span className="text-white/80 text-sm font-medium">Smart Digital Solutions</span>
            </div>
            <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black text-white leading-tight mb-4">
              ASLEN<br />
              <span className="text-[#f59e0b]">TECH SOLUTIONS</span>
            </h1>
            <p className="text-xl mb-8 leading-relaxed text-white/70">
              Empowering Businesses with Smart Digital Solutions
            </p>
            <div className="flex flex-wrap gap-4">
              <a href="#services" className="btn-accent px-8 py-4 rounded-xl font-bold text-lg flex items-center gap-2">
                Explore Services <ArrowRight size={20} />
              </a>
              <a href="#contact" className="px-8 py-4 rounded-xl font-bold text-lg text-white border border-white/25 hover:bg-white/10 transition-colors">
                Contact Us
              </a>
            </div>
            <div className="flex flex-wrap gap-10 mt-14">
              {[['50+', 'Projects Done'], ['100%', 'Client Satisfaction'], ['24/7', 'Support']].map(([val, label]) => (
                <div key={label}>
                  <div className="text-3xl font-black text-[#f59e0b]">{val}</div>
                  <div className="text-sm mt-0.5 text-white/50">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────────────────── */}
      <section id="services" className="py-20 bg-[#f5f5f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal text-center mb-14">
            <span className="text-sm font-bold uppercase tracking-widest text-[#222222]">What We Offer</span>
            <h2 className="text-4xl font-black text-[#1e293b] mt-2 mb-3">Our Services</h2>
            <p className="text-[#64748b] text-lg max-w-xl mx-auto">
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

      {/* ── Portfolio ────────────────────────────────────────────────────── */}
      <section id="portfolio" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal text-center mb-14">
            <span className="text-sm font-bold uppercase tracking-widest text-[#222222]">Our Work</span>
            <h2 className="text-4xl font-black text-[#1e293b] mt-2 mb-3">Live Client Websites</h2>
            <p className="text-[#64748b] text-lg max-w-xl mx-auto">
              Real websites we built and delivered for our clients
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {PROJECTS.map((site, i) => (
              <div key={site.url} className={`reveal reveal-delay-${i + 1}`}>
                <ProjectCard site={site} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────────────────── */}
      <section id="about" className="py-20 bg-[#222222]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div className="reveal-left">
              <span className="text-sm font-bold uppercase tracking-widest text-[#f59e0b]">Who We Are</span>
              <h2 className="text-4xl font-black text-white mt-2 mb-4">About ASLEN</h2>
              <p className="leading-relaxed mb-4 text-white/75">
                ASLEN TECH SOLUTIONS is a forward-thinking digital agency dedicated to helping businesses grow through technology. We combine creativity with technical expertise to deliver solutions that make a real impact.
              </p>
              <p className="leading-relaxed mb-8 text-white/75">
                From startups to established enterprises, we partner with businesses of all sizes to build their digital presence and streamline their operations.
              </p>
              <ul className="space-y-3">
                {['Expert team of developers & designers', 'Affordable pricing with premium quality', 'On-time delivery guaranteed', 'Post-delivery support included'].map((item) => (
                  <li key={item} className="flex items-center gap-3 text-white/90">
                    <CheckCircle size={18} className="shrink-0 text-[#f59e0b]" />
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
                <div key={label} className={`reveal reveal-delay-${i + 1} card-hover rounded-2xl p-6 text-white bg-white/10 border border-white/15`}>
                  <Icon size={28} className="mb-3 text-[#f59e0b]" />
                  <div className="text-3xl font-black">{value}</div>
                  <div className="text-sm opacity-70 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews ──────────────────────────────────────────────────────── */}
      <section id="reviews" className="py-20 bg-[#f5f5f5]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal text-center mb-12">
            <span className="text-sm font-bold uppercase tracking-widest text-[#222222]">Testimonials</span>
            <h2 className="text-4xl font-black text-[#1e293b] mt-2 mb-3">What Our Clients Say</h2>
            <p className="text-[#64748b] text-lg">Real feedback from real clients</p>
          </div>
          {reviews.length === 0 ? (
            <div className="reveal text-center py-10">
              <MessageSquare size={40} className="mx-auto text-[#222222]/20 mb-3" />
              <p className="text-[#64748b] mb-4">No reviews yet — be the first!</p>
              <Link to="/feedback" className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl">
                <Star size={16} /> Write a Review
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                {reviews.map((r, i) => (
                  <div key={r.id} className={`reveal reveal-delay-${Math.min(i + 1, 5)} card-hover bg-white rounded-2xl p-5 flex flex-col gap-3 border border-[#e2e8f0]`}>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={15} className={s <= r.rating ? 'fill-[#f59e0b] text-[#f59e0b]' : 'fill-gray-200 text-gray-200'} />
                      ))}
                    </div>
                    <p className="text-[#64748b] text-sm leading-relaxed flex-1">"{r.comment}"</p>
                    <div className="flex items-center gap-2 pt-2 border-t border-[#f5f5f5]">
                      <img src={r.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name || 'U')}&background=222222&color=fff`}
                        alt={r.name} className="w-9 h-9 rounded-full object-cover shrink-0 border-2 border-[#e2e8f0]" />
                      <div>
                        <p className="text-sm font-semibold text-[#1e293b]">{r.name || 'Anonymous'}</p>
                        <p className="text-xs text-[#64748b]">{new Date(r.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="reveal text-center">
                <Link to="/feedback" className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl">
                  <Star size={16} /> Share Your Experience
                </Link>
              </div>
            </>
          )}
        </div>
      </section>

      {/* ── Contact ──────────────────────────────────────────────────────── */}
      <section id="contact" className="py-20 bg-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal text-center mb-12">
            <span className="text-sm font-bold uppercase tracking-widest text-[#222222]">Contact</span>
            <h2 className="text-4xl font-black text-[#1e293b] mt-2 mb-3">Get In Touch</h2>
            <p className="text-[#64748b] text-lg">Have a project in mind? Let's talk.</p>
          </div>
          <form onSubmit={handleContact} className="reveal bg-white rounded-2xl p-8 space-y-5 border border-[#e2e8f0] shadow-sm">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-[#1e293b] mb-2">Name</label>
                <input type="text" required value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="Your name"
                  className="w-full border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1e293b] mb-2">Email</label>
                <input type="email" required value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-[#1e293b] mb-2">Message</label>
              <textarea required rows={5} value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                placeholder="Tell us about your project..."
                className="w-full border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm resize-none" />
            </div>
            <button type="submit" disabled={submitting}
              className="btn-primary w-full py-4 rounded-xl font-bold text-lg disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting && <Loader2 size={18} className="animate-spin" />}
              {submitting ? 'Sending...' : 'Send Message'}
            </button>
          </form>
        </div>
      </section>

    </div>
  )
}
