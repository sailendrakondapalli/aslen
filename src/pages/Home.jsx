import { useState, useEffect, useRef } from 'react'
import { ArrowRight, CheckCircle, Users, Award, Zap, Loader2, Star, MessageSquare, ExternalLink } from 'lucide-react'
import { Link, useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import ServiceCard from '../components/ServiceCard'
import { services } from '../data/services'
import { useScrollReveal } from '../hooks/useScrollReveal'
import toast from 'react-hot-toast'

const PROJECTS = [
  // E-Commerce Sites
  { name: 'Lakshmi Ram Collections', url: 'https://www.lakshmiramcollections.in/', desc: 'Premium fashion & collections', tag: 'E-Commerce', category: 'ecommerce' },
  { name: 'Nashe Jewels', url: 'https://www.nashejewels.in/', desc: 'Exquisite jewelry collection', tag: 'E-Commerce', category: 'ecommerce' },
  { name: 'Rudraksha Divines', url: 'https://www.rudrakshadivines.com/', desc: 'Spiritual & divine products', tag: 'E-Commerce', category: 'ecommerce' },
  
  // Static/Service Websites
  { name: 'Kerala Memory Travels', url: 'https://www.keralamemorytravels.in/', desc: 'Kerala tourism & travel packages', tag: 'Travel', category: 'static' },
  { name: 'Saravana Travel', url: 'https://www.saravanatravel.in/', desc: 'Tour & travel booking platform', tag: 'Travel', category: 'static' },
  { name: 'WedFeast', url: 'https://www.wedfeast.in/', desc: 'Wedding catering & feast services', tag: 'Food & Events', category: 'static' },
  { name: 'Modak Beauty Parlour', url: 'https://www.modaknaturalbeautyparlour.in/', desc: 'Natural beauty parlour services', tag: 'Beauty & Wellness', category: 'static' },
  { name: 'Rishika Pro Makeup Academy', url: 'https://www.rishikapromakeupacademy.beauty/', desc: 'Professional makeup training', tag: 'Beauty & Education', category: 'static' },
  { name: 'Neurotherapy India', url: 'https://www.neurotherapyindia.website/', desc: 'Neurotherapy & wellness services', tag: 'Healthcare', category: 'static' },
]

function useCountUp(target, duration = 1800, start = false) {
  const [value, setValue] = useState(0)
  useEffect(() => {
    if (!start) return
    let startTime = null
    const step = (ts) => {
      if (!startTime) startTime = ts
      const progress = Math.min((ts - startTime) / duration, 1)
      const eased = 1 - Math.pow(1 - progress, 3)
      setValue(Math.round(eased * target))
      if (progress < 1) requestAnimationFrame(step)
    }
    requestAnimationFrame(step)
  }, [start, target, duration])
  return value
}

function ProjectCard({ site }) {
  return (
    <a href={site.url} target="_blank" rel="noopener noreferrer"
      className="dark-card card-hover group rounded-2xl overflow-hidden flex flex-col"
      style={{ background: '#111928' }}>
      <div className="h-36 flex items-center justify-center relative overflow-hidden"
        style={{ background: 'rgba(0,200,255,0.04)' }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,200,255,0.05), rgba(0,98,255,0.08))' }} />
        <div className="relative text-center px-4">
          <p className="font-bold text-white text-lg" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{site.name}</p>
          <span className="text-xs px-2 py-0.5 rounded-full mt-1 inline-block font-semibold"
            style={{ background: 'rgba(0,200,255,0.12)', color: '#00C8FF', border: '1px solid rgba(0,200,255,0.25)' }}>
            {site.tag}
          </span>
        </div>
        <ExternalLink size={14} className="absolute top-3 right-3" style={{ color: 'rgba(0,200,255,0.4)' }} />
      </div>
      <div className="p-4 flex flex-col flex-1">
        <p className="text-sm flex-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{site.desc}</p>
        <div className="mt-3 flex items-center gap-1 text-sm font-semibold text-[#00C8FF]">
          Visit Site <ArrowRight size={14} />
        </div>
      </div>
    </a>
  )
}

function Particles() {
  const colors = ['rgba(0,200,255,0.6)', 'rgba(0,98,255,0.5)', 'rgba(94,223,255,0.5)']
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {Array.from({ length: 18 }).map((_, i) => {
        const size = (i % 3) + 2
        const left = ((i * 5.5) % 100).toFixed(1)
        const top = ((i * 7.3) % 100).toFixed(1)
        const dur = (i % 8) + 6
        const delay = (i % 6)
        return (
          <div key={i} className="particle absolute rounded-full" style={{
            width: `${size}px`, height: `${size}px`,
            left: `${left}%`, top: `${top}%`,
            background: colors[i % colors.length],
            animationDuration: `${dur}s`,
            animationDelay: `${delay}s`,
            opacity: 0,
          }} />
        )
      })}
    </div>
  )
}

export default function Home() {
  const [contactForm, setContactForm] = useState({ name: '', email: '', message: '' })
  const [submitting, setSubmitting] = useState(false)
  const [reviews, setReviews] = useState([])
  const [statsVisible, setStatsVisible] = useState(false)
  const statsRef = useRef(null)
  const navigate = useNavigate()

  useScrollReveal()

  const count1 = useCountUp(50, 1800, statsVisible)
  const count2 = useCountUp(30, 1800, statsVisible)

  useEffect(() => {
    if (!supabase) return
    supabase.from('feedback').select('*').order('created_at', { ascending: false }).limit(6)
      .then(({ data }) => {
        setReviews(data || [])
        // Re-run scroll reveal after async data loads
        setTimeout(() => {
          const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .stagger-children')
          els.forEach(el => {
            const rect = el.getBoundingClientRect()
            if (rect.top < window.innerHeight * 0.88) el.classList.add('visible')
          })
        }, 50)
      })
  }, [])

  useEffect(() => {
    const obs = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) { setStatsVisible(true); obs.disconnect() }
    }, { threshold: 0.5 })
    if (statsRef.current) obs.observe(statsRef.current)
    return () => obs.disconnect()
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
    <div className="pt-16" style={{ background: '#080E1C' }}>
      <Particles />

      {/* ── Hero ─────────────────────────────────────────────────────────── */}
      <section id="home" className="min-h-screen flex items-center relative overflow-hidden" style={{ padding: '80px 0 64px' }}>
        <div className="hero-orb hero-orb-1" />
        <div className="hero-orb hero-orb-2" />
        <div className="hero-orb hero-orb-3" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 w-full">
          <div className="max-w-3xl">
            <div className="inline-flex items-center gap-2 rounded-full px-4 py-2 mb-7"
              style={{ border: '1px solid rgba(0,200,255,0.35)', animation: 'fadeUp 0.7s ease both' }}>
              <div className="w-2 h-2 rounded-full bg-[#00C8FF] relative pulse-ring" />
              <span className="text-[#00C8FF] text-xs font-semibold tracking-widest uppercase">Smart Digital Solutions</span>
            </div>

            <h1 className="font-black leading-none mb-3 text-white"
              style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: 'clamp(44px, 8vw, 72px)', letterSpacing: '-1.5px', animation: 'fadeUp 0.8s ease 0.15s both' }}>
              ASLEN<br />
              <span className="shimmer-accent">TECH SOLUTIONS</span>
            </h1>

            <p className="mb-10 leading-relaxed" style={{ fontSize: '17px', color: 'rgba(255,255,255,0.6)', maxWidth: '480px', animation: 'fadeUp 0.8s ease 0.3s both' }}>
              Empowering Businesses with Smart Digital Solutions
            </p>

            <div className="flex flex-wrap gap-4" style={{ animation: 'fadeUp 0.8s ease 0.45s both' }}>
              <a href="#services" className="btn-primary inline-flex items-center gap-2 px-8 py-4 rounded-xl font-bold text-lg">
                Explore Services <ArrowRight size={20} />
              </a>
              <a href="#contact"
                className="btn-outline-cyan inline-flex items-center px-8 py-4 rounded-xl font-bold text-lg text-white">
                Contact Us
              </a>
            </div>

            <div ref={statsRef} className="flex flex-wrap gap-10 mt-14" style={{ animation: 'fadeUp 0.8s ease 0.6s both' }}>
              {[{ val: `${count1}+`, label: 'Projects Done' }, { val: `${count2}+`, label: 'Happy Clients' }, { val: '24/7', label: 'Support' }].map(({ val, label }, i) => (
                <div key={label} className="flex items-start gap-3">
                  {i > 0 && <div className="w-px self-stretch mt-1" style={{ background: 'rgba(255,255,255,0.1)' }} />}
                  <div>
                    <div className="font-black text-[#00C8FF]" style={{ fontFamily: 'Space Grotesk, sans-serif', fontSize: '28px' }}>{val}</div>
                    <div className="text-xs mt-0.5 uppercase tracking-wider" style={{ color: 'rgba(255,255,255,0.4)' }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Services ─────────────────────────────────────────────────────── */}
      <section id="services" className="py-20" style={{ background: '#0C1325' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#00C8FF]">What We Offer</span>
            <h2 className="text-4xl font-black text-white mt-2 mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Our Services</h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Everything your business needs to thrive in the digital world
            </p>
          </div>
          <div className="stagger-children grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {services.map((s) => (
              <div key={s.id} className="card-hover">
                <ServiceCard service={s} />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Portfolio ────────────────────────────────────────────────────── */}
      <section id="portfolio" className="py-20" style={{ background: '#080E1C' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal text-center mb-14">
            <span className="text-xs font-bold uppercase tracking-widest text-[#00C8FF]">Our Work</span>
            <h2 className="text-4xl font-black text-white mt-2 mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Live Client Websites</h2>
            <p className="text-lg max-w-xl mx-auto" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Real websites we built and delivered for our clients
            </p>
          </div>
          
          {/* Infinite Scrolling Carousel */}
          <div className="relative overflow-hidden">
            <div className="flex gap-6 infinite-scroll">
              {/* First set of projects */}
              {PROJECTS.map((site, index) => (
                <div key={`first-${site.url}-${index}`} className="w-[320px] flex-shrink-0">
                  <ProjectCard site={site} />
                </div>
              ))}
              {/* Duplicate set for seamless loop */}
              {PROJECTS.map((site, index) => (
                <div key={`second-${site.url}-${index}`} className="w-[320px] flex-shrink-0">
                  <ProjectCard site={site} />
                </div>
              ))}
            </div>
            
            {/* Gradient fade edges */}
            <div className="pointer-events-none absolute left-0 top-0 bottom-0 w-16 z-10" 
              style={{ background: 'linear-gradient(to right, #080E1C, transparent)' }} />
            <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-16 z-10" 
              style={{ background: 'linear-gradient(to left, #080E1C, transparent)' }} />
          </div>
          
          <div className="text-center mt-8">
            <p className="text-sm font-semibold" style={{ color: 'rgba(0,200,255,0.7)' }}>
              And Many More Sites We Built! 🚀
            </p>
          </div>
        </div>
      </section>

      {/* ── About ────────────────────────────────────────────────────────── */}
      <section id="about" className="py-20" style={{ background: '#0C1325' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-14 items-center">
            <div className="reveal-left">
              <span className="text-xs font-bold uppercase tracking-widest text-[#00C8FF]">Who We Are</span>
              <h2 className="text-4xl font-black text-white mt-2 mb-4" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>About ASLEN</h2>
              <p className="leading-relaxed mb-4" style={{ color: 'rgba(255,255,255,0.6)' }}>
                ASLEN TECH SOLUTIONS is a forward-thinking digital agency dedicated to helping businesses grow through technology. We combine creativity with technical expertise to deliver solutions that make a real impact.
              </p>
              <p className="leading-relaxed mb-8" style={{ color: 'rgba(255,255,255,0.6)' }}>
                From startups to established enterprises, we partner with businesses of all sizes to build their digital presence and streamline their operations.
              </p>
              <ul className="space-y-3">
                {['Expert team of developers & designers', 'Affordable pricing with premium quality', 'On-time delivery guaranteed', 'Post-delivery support included'].map((item) => (
                  <li key={item} className="flex items-center gap-3" style={{ color: 'rgba(255,255,255,0.85)' }}>
                    <CheckCircle size={18} className="shrink-0 text-[#00C8FF]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="reveal-right stagger-children grid grid-cols-2 gap-4">
              {[
                { icon: Users, label: 'Happy Clients', value: '50+' },
                { icon: Award, label: 'Projects Completed', value: '80+' },
                { icon: Zap, label: 'Years Experience', value: '3+' },
                { icon: CheckCircle, label: 'Success Rate', value: '100%' },
              ].map(({ icon: Icon, label, value }) => (
                <div key={label}
                  className="dark-card card-hover rounded-2xl p-6 text-white"
                  style={{ background: '#111928' }}>
                  <Icon size={28} className="mb-3 text-[#00C8FF]" />
                  <div className="text-3xl font-black" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>{value}</div>
                  <div className="text-sm opacity-70 mt-1">{label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── Reviews ──────────────────────────────────────────────────────── */}
      <section id="reviews" className="py-20" style={{ background: '#080E1C' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#00C8FF]">Testimonials</span>
            <h2 className="text-4xl font-black text-white mt-2 mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>What Our Clients Say</h2>
            <p className="text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>Real feedback from real clients</p>
          </div>
          {reviews.length === 0 ? (
            <div className="reveal text-center py-10">
              <MessageSquare size={40} className="mx-auto mb-3" style={{ color: 'rgba(0,200,255,0.2)' }} />
              <p className="mb-4" style={{ color: 'rgba(255,255,255,0.5)' }}>No reviews yet — be the first!</p>
              <Link to="/feedback" className="btn-primary inline-flex items-center gap-2 px-6 py-3 rounded-xl">
                <Star size={16} /> Write a Review
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                {reviews.map((r) => (
                  <div key={r.id}
                    className="dark-card card-hover rounded-2xl p-5 flex flex-col gap-3"
                    style={{ background: '#111928' }}>
                    <div className="flex items-center gap-1">
                      {[1,2,3,4,5].map(s => (
                        <Star key={s} size={15} className={s <= r.rating ? 'fill-[#00C8FF] text-[#00C8FF]' : 'fill-white/10 text-white/10'} />
                      ))}
                    </div>
                    <p className="text-sm leading-relaxed flex-1" style={{ color: 'rgba(255,255,255,0.6)' }}>"{r.comment}"</p>
                    <div className="flex items-center gap-2 pt-2" style={{ borderTop: '1px solid rgba(255,255,255,0.07)' }}>
                      <img src={r.avatar_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name || 'U')}&background=00C8FF&color=080E1C`}
                        alt={r.name} className="w-9 h-9 rounded-full object-cover shrink-0" style={{ border: '2px solid rgba(0,200,255,0.3)' }} />
                      <div>
                        <p className="text-sm font-semibold text-white">{r.name || 'Anonymous'}</p>
                        <p className="text-xs" style={{ color: 'rgba(255,255,255,0.4)' }}>{new Date(r.created_at).toLocaleDateString('en-IN', { month: 'short', year: 'numeric' })}</p>
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
      <section id="contact" className="py-20" style={{ background: '#0C1325' }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="reveal text-center mb-12">
            <span className="text-xs font-bold uppercase tracking-widest text-[#00C8FF]">Contact</span>
            <h2 className="text-4xl font-black text-white mt-2 mb-3" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>Get In Touch</h2>
            <p className="text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>Have a project in mind? Let's talk.</p>
          </div>
          <form onSubmit={handleContact}
            className="reveal rounded-2xl p-8 space-y-5 border"
            style={{ background: '#111928', borderColor: 'rgba(0,200,255,0.15)' }}>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Name</label>
                <input type="text" required value={contactForm.name}
                  onChange={(e) => setContactForm({ ...contactForm, name: e.target.value })}
                  placeholder="Your name"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white"
                  style={{ background: '#080E1C', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-white mb-2">Email</label>
                <input type="email" required value={contactForm.email}
                  onChange={(e) => setContactForm({ ...contactForm, email: e.target.value })}
                  placeholder="your@email.com"
                  className="w-full rounded-xl px-4 py-3 text-sm text-white"
                  style={{ background: '#080E1C', border: '1px solid rgba(255,255,255,0.1)' }} />
              </div>
            </div>
            <div>
              <label className="block text-sm font-semibold text-white mb-2">Message</label>
              <textarea required rows={5} value={contactForm.message}
                onChange={(e) => setContactForm({ ...contactForm, message: e.target.value })}
                placeholder="Tell us about your project..."
                className="w-full rounded-xl px-4 py-3 text-sm text-white resize-none"
                style={{ background: '#080E1C', border: '1px solid rgba(255,255,255,0.1)' }} />
            </div>
            <button type="submit" disabled={submitting}
              className="btn-primary w-full py-4 rounded-xl font-bold text-lg disabled:opacity-60 flex items-center justify-center gap-2">
              {submitting && <Loader2 size={18} className="animate-spin" />}
              {submitting ? 'Sending...' : 'Send Message →'}
            </button>
          </form>
        </div>
      </section>

    </div>
  )
}
