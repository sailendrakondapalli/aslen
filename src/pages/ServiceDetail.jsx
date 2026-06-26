import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle, MessageCircle, Loader2 } from 'lucide-react'
import * as Icons from 'lucide-react'
import { services, WHATSAPP_NUMBER } from '../data/services'
import { useAuthStore } from '../store/authStore'
import { supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const RZP_KEY = import.meta.env.VITE_RAZORPAY_KEY_ID

function loadRazorpay() {
  return new Promise((resolve) => {
    if (window.Razorpay) { resolve(true); return }
    const s = document.createElement('script')
    s.src = 'https://checkout.razorpay.com/v1/checkout.js'
    s.onload = () => resolve(true)
    s.onerror = () => resolve(false)
    document.body.appendChild(s)
  })
}

const cardStyle = { background: '#111928', borderColor: 'rgba(255,255,255,0.07)' }
const cardHover = (e) => (e.currentTarget.style.borderColor = 'rgba(0,200,255,0.35)')
const cardLeave = (e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.07)')

// ── Step 1 ───────────────────────────────────────────────────────────────────
function PackageList({ service, onSelect }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <p className="text-base leading-relaxed mb-2" style={{ color: 'rgba(255,255,255,0.6)' }}>
        {service.description}
      </p>
      <h2 className="text-2xl font-black text-white mt-6 mb-2">Choose a Package</h2>
      <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>
        Select the package that fits your needs
      </p>
      <div className={`grid gap-6 ${service.packages.length === 1 ? 'grid-cols-1 max-w-md' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {service.packages.map((pkg, i) => (
          <button
            key={i}
            onClick={() => onSelect(pkg)}
            className="text-left rounded-2xl overflow-hidden border transition-all group"
            style={cardStyle}
            onMouseEnter={cardHover}
            onMouseLeave={cardLeave}
          >
            <div className="relative h-36 overflow-hidden" style={{ background: '#080E1C' }}>
              <img src={pkg.bgImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
              <div className="absolute inset-0" style={{ background: 'rgba(8,14,28,0.6)' }} />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                <h3 className="text-white font-black text-xl">{pkg.name}</h3>
                {pkg.price > 0 && (
                  <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
                    from ₹{pkg.price.toLocaleString()}
                  </p>
                )}
              </div>
              <span
                className="absolute right-4 bottom-3 text-2xl transition-colors group-hover:text-[#00C8FF]"
                style={{ color: 'rgba(255,255,255,0.4)' }}
              >›</span>
            </div>
            <div className="p-5">
              <p className="text-sm mb-3 leading-relaxed" style={{ color: 'rgba(255,255,255,0.55)' }}>
                {pkg.description}
              </p>
              {pkg.price === 0 ? (
                <span className="text-xl font-black text-white">Custom Pricing</span>
              ) : (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-white">₹{pkg.price.toLocaleString()}</span>
                    <span className="text-sm" style={{ color: 'rgba(255,255,255,0.4)' }}>total</span>
                  </div>
                  <div
                    className="mt-2 inline-flex items-center gap-1 text-sm font-semibold px-3 py-1 rounded-full"
                    style={{ background: 'rgba(0,200,255,0.1)', color: '#00C8FF', border: '1px solid rgba(0,200,255,0.2)' }}
                  >
                    Advance: ₹{pkg.advance.toLocaleString()} (paid now)
                  </div>
                </div>
              )}
              <ul className="mt-3 space-y-1.5">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-sm" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    <CheckCircle size={13} className="text-[#00C8FF] shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>
            </div>
          </button>
        ))}
      </div>
    </div>
  )
}

// ── Step 2 ───────────────────────────────────────────────────────────────────
function PackageDetail({ service, pkg, onPaymentChoice, onBack }) {
  const [extraPages, setExtraPages] = useState(0)
  const isWebDev = service.id === 'web-development'
  const isCustom = pkg.price === 0
  const extraCost = isWebDev ? extraPages * (pkg.name === 'Static Website' ? 1999 : 3999) : 0
  const total = pkg.price + extraCost

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-6 transition-colors hover:text-[#00C8FF]"
        style={{ color: 'rgba(255,255,255,0.5)' }}
      >
        <ArrowLeft size={18} /> Back to packages
      </button>

      <div className="relative h-48 rounded-2xl overflow-hidden mb-6" style={{ background: '#080E1C' }}>
        <img src={pkg.bgImage} alt="" className="absolute inset-0 w-full h-full object-cover opacity-40" />
        <div className="absolute inset-0" style={{ background: 'rgba(8,14,28,0.6)' }} />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <h2 className="text-3xl font-black text-white">{pkg.name}</h2>
          {!isCustom && (
            <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.65)' }}>
              ₹{total.toLocaleString()} total · ₹{pkg.advance.toLocaleString()} advance
            </p>
          )}
        </div>
      </div>

      <div className="rounded-2xl p-6 mb-5 border" style={{ background: '#111928', borderColor: 'rgba(0,200,255,0.15)' }}>
        <p className="leading-relaxed mb-5" style={{ color: 'rgba(255,255,255,0.6)' }}>{pkg.description}</p>

        <h3 className="font-bold text-white mb-3">What's included</h3>
        <ul className="space-y-2 mb-6">
          {pkg.features.map((f) => (
            <li key={f} className="flex items-center gap-3 text-sm" style={{ color: 'rgba(255,255,255,0.7)' }}>
              <CheckCircle size={15} className="text-[#00C8FF] shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        {pkg.examples && pkg.examples.length > 0 && (
          <>
            <h3 className="font-bold text-white mb-3">Real-world examples</h3>
            <div className="space-y-2 mb-6">
              {pkg.examples.map((ex, i) => (
                <div
                  key={i}
                  className="flex items-start gap-3 p-3 rounded-xl"
                  style={{ background: 'rgba(0,200,255,0.05)', border: '1px solid rgba(0,200,255,0.1)' }}
                >
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-xs font-black"
                    style={{ background: 'linear-gradient(135deg,#00C8FF,#0062FF)', color: '#080E1C' }}
                  >
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{ex.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.45)' }}>{ex.desc}</p>
                    {ex.url && ex.url !== '#' && (
                      <a href={ex.url} target="_blank" rel="noopener noreferrer"
                        className="text-[#00C8FF] text-xs hover:underline mt-0.5 inline-block">
                        View live →
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </>
        )}

        {isWebDev && (
          <div className="mb-6">
            <label className="block text-sm font-semibold text-white mb-3">
              Extra Pages (beyond 5 included)
            </label>
            <div className="flex items-center gap-4">
              <button
                onClick={() => setExtraPages(Math.max(0, extraPages - 1))}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold text-white transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#00C8FF')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
              >−</button>
              <span className="text-xl font-black w-8 text-center text-white">{extraPages}</span>
              <button
                onClick={() => setExtraPages(extraPages + 1)}
                className="w-10 h-10 rounded-xl flex items-center justify-center text-xl font-bold text-white transition-all"
                style={{ border: '1px solid rgba(255,255,255,0.15)', background: 'rgba(255,255,255,0.05)' }}
                onMouseEnter={e => (e.currentTarget.style.borderColor = '#00C8FF')}
                onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)')}
              >+</button>
              {extraPages > 0 && (
                <span className="text-sm font-semibold text-[#00C8FF]">+₹{extraCost.toLocaleString()}</span>
              )}
            </div>
            <p className="text-xs mt-2" style={{ color: 'rgba(0,200,255,0.7)' }}>
              Static: ₹999/page · Dynamic: ₹1999/page
            </p>
          </div>
        )}

        {isCustom ? (
          <button
            onClick={() => onPaymentChoice('whatsapp', extraPages, total)}
            className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors text-white"
            style={{ background: '#22c55e' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#16a34a')}
            onMouseLeave={e => (e.currentTarget.style.background = '#22c55e')}
          >
            <MessageCircle size={20} /> Send Enquiry via WhatsApp
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-white mb-2">How would you like to pay?</p>
            <button
              onClick={() => onPaymentChoice('advance', extraPages, total)}
              className="w-full p-5 rounded-xl text-left transition-all"
              style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,200,255,0.03)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,200,255,0.4)'; e.currentTarget.style.background = 'rgba(0,200,255,0.07)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(0,200,255,0.03)' }}
            >
              <p className="font-bold text-white text-lg">Pay Advance Only</p>
              <p className="font-semibold mt-1 text-[#00C8FF]">
                ₹{pkg.advance.toLocaleString()} now · ₹{(total - pkg.advance).toLocaleString()} after delivery
              </p>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Start your project with a small advance</p>
            </button>
            <button
              onClick={() => onPaymentChoice('full', extraPages, total)}
              className="w-full p-5 rounded-xl text-left transition-all"
              style={{ border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.03)' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,200,255,0.4)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.1)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
            >
              <p className="font-bold text-white text-lg">Pay Full Amount</p>
              <p className="font-semibold mt-1 text-[#00C8FF]">₹{total.toLocaleString()} — pay everything now</p>
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>Complete payment upfront</p>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Step 3 ───────────────────────────────────────────────────────────────────
function PaymentStep({ service, pkg, paymentType, extraPages, totalPrice, onBack }) {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)

  const isCustom = pkg.price === 0
  const amountToPay = paymentType === 'full' ? totalPrice : pkg.advance

  const sendWhatsApp = (bookingId, method) => {
    const msg = encodeURIComponent(
      `🔔 *New Booking - ASLEN TECH SOLUTIONS*\n\n` +
      `👤 *Client:* ${user.user_metadata?.full_name || 'User'}\n` +
      `📧 *Email:* ${user.email}\n` +
      `🛠️ *Service:* ${service.title} - ${pkg.name}\n` +
      `💰 *Total:* ₹${totalPrice.toLocaleString()}\n` +
      `💳 *Paid:* ₹${amountToPay.toLocaleString()} (${paymentType})\n` +
      `💳 *Method:* ${method}\n` +
      `📝 *Notes:* ${description || 'N/A'}\n` +
      `\n_Booking ID: ${bookingId}_`
    )
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank')
  }

  const sendWhatsAppEnquiry = () => {
    const msg = encodeURIComponent(
      `🔔 *New Enquiry - ASLEN TECH SOLUTIONS*\n\n` +
      `👤 *Name:* ${user?.user_metadata?.full_name || 'Visitor'}\n` +
      `📧 *Email:* ${user?.email || 'N/A'}\n` +
      `🛠️ *Service:* ${service.title}\n` +
      `📝 *Requirement:* ${description || 'N/A'}`
    )
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank')
    navigate('/')
  }

  const saveBooking = async (paymentId, method) => {
    await supabase.from('users').upsert({
      id: user.id, email: user.email,
      name: user.user_metadata?.full_name || user.user_metadata?.name || '',
      profile_url: user.user_metadata?.avatar_url || '',
    }, { onConflict: 'id' })
    const { data, error } = await supabase.from('bookings').insert({
      user_id: user.id, user_email: user.email,
      service_id: service.id, service_title: service.title,
      package_name: pkg.name, payment_method: method,
      razorpay_payment_id: paymentId, advance_paid: amountToPay,
      total_amount: totalPrice,
      extra_pages: service.id === 'web-development' ? extraPages : 0,
      description, status: 'confirmed',
    }).select().single()
    if (error) throw error
    return data
  }

  const handleRazorpay = async (method = null) => {
    if (!user) { toast.error('Please sign in to book'); navigate('/login'); return }
    setLoading(true)
    const loaded = await loadRazorpay()
    if (!loaded) { toast.error('Payment gateway failed to load'); setLoading(false); return }
    const options = {
      key: RZP_KEY, amount: amountToPay * 100, currency: 'INR',
      name: 'ASLEN TECH SOLUTIONS', description: `${service.title} - ${pkg.name}`,
      image: '/favicon.svg',
      prefill: { name: user.user_metadata?.full_name || '', email: user.email, contact: '' },
      theme: { color: '#00C8FF' },
      handler: async (response) => {
        try {
          const booking = await saveBooking(response.razorpay_payment_id, method || 'razorpay')
          toast.success('Payment successful! Booking confirmed.')
          sendWhatsApp(booking.id, method || 'Razorpay')
          navigate('/dashboard')
        } catch (err) {
          console.error(err)
          toast.error('Payment done but booking save failed. Contact support.')
        }
      },
      modal: { ondismiss: () => setLoading(false) },
    }
    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', (r) => { toast.error(`Payment failed: ${r.error.description}`); setLoading(false) })
    rzp.open()
    setLoading(false)
  }

  const payMethods = [
    { id: 'upi',        label: 'UPI',                 sub: 'GPay, PhonePe, Paytm, BHIM',   emoji: '📱' },
    { id: 'card',       label: 'Debit / Credit Card', sub: 'Visa, Mastercard, RuPay',       emoji: '💳' },
    { id: 'netbanking', label: 'Net Banking',          sub: 'SBI, HDFC, ICICI & 50+ banks', emoji: '🏦' },
    { id: 'wallet',     label: 'Wallets',              sub: 'Paytm, Mobikwik & more',        emoji: '👛' },
    { id: 'emi',        label: 'EMI',                  sub: 'No-cost EMI on select cards',   emoji: '📅' },
  ]

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button
        onClick={onBack}
        className="flex items-center gap-2 mb-8 transition-colors hover:text-[#00C8FF]"
        style={{ color: 'rgba(255,255,255,0.5)' }}
      >
        <ArrowLeft size={18} /> Back
      </button>

      <div className="rounded-2xl p-8 space-y-6 border" style={{ background: '#111928', borderColor: 'rgba(0,200,255,0.15)' }}>
        {!isCustom && (
          <div className="rounded-xl p-5 text-center" style={{ background: 'rgba(0,200,255,0.06)', border: '1px solid rgba(0,200,255,0.15)' }}>
            <p className="text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              {paymentType === 'full' ? 'Full payment' : 'Advance payment'}
            </p>
            <p className="text-4xl font-black text-[#00C8FF] mt-1">₹{amountToPay.toLocaleString()}</p>
            {paymentType === 'advance' && (
              <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.4)' }}>
                Remaining ₹{(totalPrice - pkg.advance).toLocaleString()} after delivery
              </p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-white mb-2">
            {isCustom ? 'Describe your requirement' : 'Project requirements (optional)'}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder={isCustom ? 'Tell us what you need...' : 'Describe your requirements...'}
            className="w-full rounded-xl px-4 py-3 text-sm text-white resize-none"
            style={{ background: '#080E1C', border: '1px solid rgba(255,255,255,0.1)' }}
          />
        </div>

        {isCustom ? (
          <button
            onClick={sendWhatsAppEnquiry}
            className="w-full py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors text-white"
            style={{ background: '#22c55e' }}
            onMouseEnter={e => (e.currentTarget.style.background = '#16a34a')}
            onMouseLeave={e => (e.currentTarget.style.background = '#22c55e')}
          >
            <MessageCircle size={20} /> Send via WhatsApp
          </button>
        ) : (
          <>
            <div>
              <p className="text-sm font-semibold text-white mb-3">Choose payment method</p>
              <div className="space-y-2">
                {payMethods.map(({ id, label, sub, emoji }) => (
                  <button
                    key={id}
                    onClick={() => handleRazorpay(id)}
                    disabled={loading}
                    className="w-full flex items-center gap-4 p-4 rounded-xl text-left disabled:opacity-60 transition-all"
                    style={{ border: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.03)' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(0,200,255,0.35)'; e.currentTarget.style.background = 'rgba(0,200,255,0.05)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' }}
                  >
                    <span className="text-2xl w-10 text-center">{emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-white">{label}</p>
                      <p className="text-xs mt-0.5" style={{ color: 'rgba(255,255,255,0.4)' }}>{sub}</p>
                    </div>
                    <span className="text-xl" style={{ color: 'rgba(255,255,255,0.3)' }}>›</span>
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleRazorpay()}
              disabled={loading}
              className="btn-primary w-full py-4 rounded-xl font-bold text-lg disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              {loading ? 'Loading...' : 'Open All Payment Options'}
            </button>

            <div className="flex items-center gap-2 rounded-xl p-3" style={{ background: 'rgba(0,200,255,0.05)', border: '1px solid rgba(0,200,255,0.12)' }}>
              <CheckCircle size={14} className="text-[#00C8FF] shrink-0" />
              <p className="text-xs" style={{ color: 'rgba(255,255,255,0.5)' }}>
                100% secure · SSL encrypted · Powered by Razorpay
              </p>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

// ── Main Page ────────────────────────────────────────────────────────────────
export default function ServiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const [step, setStep] = useState('packages')
  const [selectedPkg, setSelectedPkg] = useState(null)
  const [paymentType, setPaymentType] = useState(null)
  const [extraPages, setExtraPages] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)

  const service = services.find((s) => s.id === id)

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16" style={{ background: '#080E1C' }}>
        <div className="text-center">
          <p className="text-lg" style={{ color: 'rgba(255,255,255,0.5)' }}>Service not found.</p>
          <button onClick={() => navigate('/')} className="mt-4 text-[#00C8FF] underline">Go Home</button>
        </div>
      </div>
    )
  }

  const Icon = Icons[service.icon] || Icons.Star
  const handleSelectPackage = (pkg) => { setSelectedPkg(pkg); setStep('detail') }
  const handlePaymentChoice = (type, extra, total) => {
    setPaymentType(type); setExtraPages(extra); setTotalPrice(total); setStep('payment')
  }
  const stepTitles = { packages: 'Choose a Package', detail: selectedPkg?.name, payment: 'Complete Payment' }

  return (
    <div className="min-h-screen pt-16" style={{ background: '#080E1C', fontFamily: 'Space Grotesk, sans-serif' }}>

      <div className="relative py-14 overflow-hidden" style={{ background: '#0C1325' }}>
        <div
          className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(0,200,255,0.15) 0%,transparent 70%)', transform: 'translate(30%,-30%)' }}
        />
        <div
          className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle,rgba(0,98,255,0.12) 0%,transparent 70%)', transform: 'translate(-20%,30%)' }}
        />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => step === 'packages' ? navigate(-1) : setStep(step === 'payment' ? 'detail' : 'packages')}
            className="flex items-center gap-2 mb-6 transition-colors hover:text-[#00C8FF]"
            style={{ color: 'rgba(255,255,255,0.6)' }}
          >
            <ArrowLeft size={18} /> Back
          </button>
          <div className="flex items-center gap-4 mb-3">
            <div
              className="w-14 h-14 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(0,200,255,0.1)', border: '1px solid rgba(0,200,255,0.25)' }}
            >
              <Icon size={28} className="text-[#00C8FF]" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">{service.title}</h1>
              <p className="text-sm mt-0.5" style={{ color: 'rgba(255,255,255,0.5)' }}>{stepTitles[step]}</p>
            </div>
          </div>
          <p className="text-base max-w-2xl" style={{ color: 'rgba(255,255,255,0.6)' }}>{service.shortDesc}</p>
          <div className="flex items-center gap-2 mt-6">
            {['packages', 'detail', 'payment'].map((s, i) => (
              <div
                key={s}
                className="h-1.5 rounded-full transition-all"
                style={{
                  width: step === s ? '32px' : '20px',
                  background: step === s
                    ? '#00C8FF'
                    : ['packages','detail','payment'].indexOf(step) > i
                      ? 'rgba(0,200,255,0.5)'
                      : 'rgba(255,255,255,0.2)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      {step === 'packages' && (
        <PackageList service={service} onSelect={handleSelectPackage} />
      )}
      {step === 'detail' && selectedPkg && (
        <PackageDetail
          service={service}
          pkg={selectedPkg}
          onPaymentChoice={handlePaymentChoice}
          onBack={() => setStep('packages')}
        />
      )}
      {step === 'payment' && selectedPkg && (
        <PaymentStep
          service={service}
          pkg={selectedPkg}
          paymentType={paymentType}
          extraPages={extraPages}
          totalPrice={totalPrice}
          onBack={() => setStep('detail')}
        />
      )}
    </div>
  )
}
