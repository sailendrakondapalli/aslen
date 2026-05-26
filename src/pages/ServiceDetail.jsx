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
    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.onload = () => resolve(true)
    script.onerror = () => resolve(false)
    document.body.appendChild(script)
  })
}

// ── Step 1: Package list ─────────────────────────────────────────────────────
function PackageList({ service, onSelect }) {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <p className="text-[#64748b] mb-2 text-base leading-relaxed">{service.description}</p>
      <h2 className="text-2xl font-black text-[#1e293b] mt-6 mb-2">Choose a Package</h2>
      <p className="text-[#94a3b8] text-sm mb-8">Select the package that fits your needs</p>
      <div className={`grid gap-6 ${service.packages.length === 1 ? 'grid-cols-1 max-w-md' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {service.packages.map((pkg, i) => (
          <button key={i} onClick={() => onSelect(pkg)}
            className="text-left rounded-2xl border-2 border-[#e2e8f0] overflow-hidden hover:border-[#222222] hover:shadow-lg transition-all group">
            {/* Package banner */}
            <div className="relative h-36 overflow-hidden bg-[#222222]">
              <img src={pkg.bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
              <div className="absolute inset-0 bg-[#222222]/70" />
              <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                <h3 className="text-white font-black text-xl">{pkg.name}</h3>
                {pkg.price > 0 && <p className="text-white/75 text-sm mt-1">from ₹{pkg.price.toLocaleString()}</p>}
              </div>
              <span className="absolute right-4 bottom-3 text-white/60 group-hover:text-[#f59e0b] text-2xl transition-colors">›</span>
            </div>
            <div className="bg-white p-5">
              <p className="text-[#64748b] text-sm mb-3 leading-relaxed">{pkg.description}</p>
              {pkg.price === 0 ? (
                <span className="text-xl font-black text-[#1e293b]">Custom Pricing</span>
              ) : (
                <div>
                  <div className="flex items-baseline gap-2">
                    <span className="text-2xl font-black text-[#1e293b]">₹{pkg.price.toLocaleString()}</span>
                    <span className="text-[#94a3b8] text-sm">total</span>
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1 bg-[#fff7ed] text-[#d97706] text-sm font-semibold px-3 py-1 rounded-full">
                    Advance: ₹{pkg.advance.toLocaleString()} (paid now)
                  </div>
                </div>
              )}
              <ul className="mt-3 space-y-1.5">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-[#64748b] text-sm">
                    <CheckCircle size={13} className="text-[#222222] shrink-0" />
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

// ── Step 2: Package detail + payment type ────────────────────────────────────
function PackageDetail({ service, pkg, onPaymentChoice, onBack }) {
  const [extraPages, setExtraPages] = useState(0)
  const isWebDev = service.id === 'web-development'
  const isCustom = pkg.price === 0
  const extraCost = isWebDev ? extraPages * (pkg.name === 'Static Website' ? 1999 : 3999) : 0
  const total = pkg.price + extraCost

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-6 transition-colors">
        <ArrowLeft size={18} /> Back to packages
      </button>

      {/* Package detail banner */}
      <div className="relative h-48 rounded-2xl overflow-hidden mb-6 bg-[#222222]">
        <img src={pkg.bgImage} alt="" className="absolute inset-0 w-full h-full object-cover" />
        <div className="absolute inset-0 bg-[#222222]/70" />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
          <h2 className="text-3xl font-black text-white">{pkg.name}</h2>
          {!isCustom && (
            <p className="text-white/75 text-sm mt-1">
              ₹{total.toLocaleString()} total · ₹{pkg.advance.toLocaleString()} advance
            </p>
          )}
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-5">
        <p className="text-gray-600 leading-relaxed mb-5">{pkg.description}</p>

        <h3 className="font-bold text-gray-900 mb-3">What's included</h3>
        <ul className="space-y-2 mb-6">
          {pkg.features.map((f) => (
            <li key={f} className="flex items-center gap-3 text-gray-700 text-sm">
              <CheckCircle size={15} className="text-green-500 shrink-0" />
              {f}
            </li>
          ))}
        </ul>

        {/* Real-world examples */}
        {pkg.examples && pkg.examples.length > 0 && (
          <>
            <h3 className="font-bold text-gray-900 mb-3">Real-world examples</h3>
            <div className="space-y-2 mb-6">
              {pkg.examples.map((ex, i) => (
                <div key={i} className="flex items-start gap-3 p-3 bg-gray-50 rounded-xl">
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${service.color} flex items-center justify-center shrink-0 text-white text-xs font-black`}>
                    {i + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 text-sm">{ex.label}</p>
                    <p className="text-gray-500 text-xs mt-0.5">{ex.desc}</p>
                    {ex.url && ex.url !== '#' && (
                      <a href={ex.url} target="_blank" rel="noopener noreferrer"
                        className="text-[#222222] text-xs hover:underline mt-0.5 inline-block">
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
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Extra Pages (beyond 5 included)
            </label>
            <div className="flex items-center gap-4">
              <button onClick={() => setExtraPages(Math.max(0, extraPages - 1))}
                className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-xl font-bold hover:bg-gray-50 transition-colors">−</button>
              <span className="text-xl font-black w-8 text-center">{extraPages}</span>
              <button onClick={() => setExtraPages(extraPages + 1)}
                className="w-10 h-10 rounded-xl border-2 border-gray-200 flex items-center justify-center text-xl font-bold hover:bg-gray-50 transition-colors">+</button>
              {extraPages > 0 && <span className="text-sm text-orange-600 font-semibold">+₹{extraCost.toLocaleString()}</span>}
            </div>
            <p className="text-xs text-[#222222] mt-2">Static: ₹999/page · Dynamic: ₹1999/page</p>
          </div>
        )}

        {isCustom ? (
          <button
            onClick={() => onPaymentChoice('whatsapp', extraPages, total)}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors"
          >
            <MessageCircle size={20} /> Send Enquiry via WhatsApp
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-gray-700 mb-2">How would you like to pay?</p>
            <button onClick={() => onPaymentChoice('advance', extraPages, total)}
              className="w-full p-5 rounded-xl border-2 border-[#e2e8f0] hover:border-[#f59e0b] hover:bg-[#fffbeb] transition-all text-left">
              <p className="font-bold text-[#1e293b] text-lg">Pay Advance Only</p>
              <p className="text-[#d97706] font-semibold mt-1">
                ₹{pkg.advance.toLocaleString()} now · ₹{(total - pkg.advance).toLocaleString()} after delivery
              </p>
              <p className="text-[#94a3b8] text-sm mt-1">Start your project with a small advance</p>
            </button>
            <button onClick={() => onPaymentChoice('full', extraPages, total)}
              className="w-full p-5 rounded-xl border-2 border-[#e2e8f0] hover:border-[#222222] hover:bg-[#f5f5f5] transition-all text-left">
              <p className="font-bold text-[#1e293b] text-lg">Pay Full Amount</p>
              <p className="text-[#222222] font-semibold mt-1">₹{total.toLocaleString()} — pay everything now</p>
              <p className="text-[#94a3b8] text-sm mt-1">Complete payment upfront</p>
            </button>
          </div>
        )}
      </div>
    </div>
  )
}

// ── Step 3: Description + payment methods ────────────────────────────────────
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
      user_id: user.id,
      user_email: user.email,
      service_id: service.id,
      service_title: service.title,
      package_name: pkg.name,
      payment_method: method,
      razorpay_payment_id: paymentId,
      advance_paid: amountToPay,
      total_amount: totalPrice,
      extra_pages: service.id === 'web-development' ? extraPages : 0,
      description,
      status: 'confirmed',
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
      key: RZP_KEY,
      amount: amountToPay * 100,
      currency: 'INR',
      name: 'ASLEN TECH SOLUTIONS',
      description: `${service.title} - ${pkg.name}`,
      image: '/favicon.svg',
      prefill: {
        name: user.user_metadata?.full_name || '',
        email: user.email,
        contact: '',
      },
      theme: { color: '#2563eb' },
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

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <button onClick={onBack} className="flex items-center gap-2 text-gray-500 hover:text-gray-800 mb-8 transition-colors">
        <ArrowLeft size={18} /> Back
      </button>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6">
        {!isCustom && (
          <div className="bg-[#f5f5f5] rounded-xl p-5 text-center">
            <p className="text-sm text-[#64748b]">{paymentType === 'full' ? 'Full payment' : 'Advance payment'}</p>
            <p className="text-4xl font-black text-[#222222] mt-1">₹{amountToPay.toLocaleString()}</p>
            {paymentType === 'advance' && (
              <p className="text-sm text-[#94a3b8] mt-1">Remaining ₹{(totalPrice - pkg.advance).toLocaleString()} after delivery</p>
            )}
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            {isCustom ? 'Describe your requirement' : 'Project requirements (optional)'}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder={isCustom
              ? 'Tell us what you need and we will reach out via WhatsApp...'
              : 'Describe what you need, any specific requirements...'}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#222222] resize-none"
          />
        </div>

        {isCustom ? (
          <button onClick={sendWhatsAppEnquiry}
            className="w-full bg-green-500 hover:bg-green-600 text-white py-4 rounded-xl font-bold text-lg flex items-center justify-center gap-2 transition-colors">
            <MessageCircle size={20} /> Send via WhatsApp
          </button>
        ) : (
          <>
            <div>
              <p className="text-sm font-semibold text-gray-700 mb-3">Choose payment method</p>
              <div className="space-y-2">
                {[
                  { id: 'upi',        label: 'UPI',                sub: 'GPay, PhonePe, Paytm, BHIM',   emoji: '📱' },
                  { id: 'card',       label: 'Debit / Credit Card', sub: 'Visa, Mastercard, RuPay',      emoji: '💳' },
                  { id: 'netbanking', label: 'Net Banking',         sub: 'SBI, HDFC, ICICI & 50+ banks', emoji: '🏦' },
                  { id: 'wallet',     label: 'Wallets',             sub: 'Paytm, Mobikwik & more',       emoji: '👛' },
                  { id: 'emi',        label: 'EMI',                 sub: 'No-cost EMI on select cards',  emoji: '📅' },
                ].map(({ id, label, sub, emoji }) => (
                  <button key={id} onClick={() => handleRazorpay(id)} disabled={loading}
                    className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-[#e2e8f0] hover:border-[#222222] hover:bg-[#f5f5f5] transition-all text-left disabled:opacity-60">
                    <span className="text-2xl w-10 text-center">{emoji}</span>
                    <div className="flex-1">
                      <p className="font-semibold text-sm text-[#1e293b]">{label}</p>
                      <p className="text-xs text-[#94a3b8] mt-0.5">{sub}</p>
                    </div>
                    <span className="text-[#94a3b8] text-xl">›</span>
                  </button>
                ))}
              </div>
            </div>

            <button onClick={() => handleRazorpay()} disabled={loading}
              className="w-full bg-[#222222] hover:bg-[#111111] text-white py-4 rounded-xl font-bold text-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {loading ? <Loader2 size={18} className="animate-spin" /> : null}
              {loading ? 'Loading...' : 'Open All Payment Options'}
            </button>

            <div className="flex items-center gap-2 bg-[#f5f5f5] rounded-xl p-3">
              <CheckCircle size={14} className="text-[#222222] shrink-0" />
              <p className="text-xs text-[#222222]">100% secure · SSL encrypted · Powered by Razorpay</p>
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
  const [step, setStep] = useState('packages') // packages | detail | payment
  const [selectedPkg, setSelectedPkg] = useState(null)
  const [paymentType, setPaymentType] = useState(null)
  const [extraPages, setExtraPages] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)

  const service = services.find((s) => s.id === id)

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Service not found.</p>
          <button onClick={() => navigate('/')} className="mt-4 text-[#222222] underline">Go Home</button>
        </div>
      </div>
    )
  }

  const Icon = Icons[service.icon] || Icons.Star

  const handleSelectPackage = (pkg) => {
    setSelectedPkg(pkg)
    setStep('detail')
  }

  const handlePaymentChoice = (type, extra, total) => {
    setPaymentType(type)
    setExtraPages(extra)
    setTotalPrice(total)
    setStep('payment')
  }

  const stepTitles = { packages: 'Choose a Package', detail: selectedPkg?.name, payment: 'Complete Payment' }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Hero */}
      <div className="relative py-14 overflow-hidden bg-[#222222]">
        <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 -translate-y-1/2 translate-x-1/3 pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 translate-y-1/2 -translate-x-1/4 pointer-events-none" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => step === 'packages' ? navigate(-1) : setStep(step === 'payment' ? 'detail' : 'packages')}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <div className="flex items-center gap-4 mb-3">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Icon size={28} className="text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-black text-white">{service.title}</h1>
          <p className="text-white/70 text-sm mt-0.5">{stepTitles[step]}</p>
            </div>
          </div>
          <p className="text-white/75 text-base max-w-2xl">{service.shortDesc}</p>

          {/* Step indicator */}
          <div className="flex items-center gap-2 mt-6">
            {['packages', 'detail', 'payment'].map((s, i) => (
              <div key={s} className={`h-1.5 rounded-full transition-all ${
                step === s ? 'w-8 bg-white' :
                ['packages','detail','payment'].indexOf(step) > i ? 'w-5 bg-white/60' : 'w-5 bg-white/25'
              }`} />
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
