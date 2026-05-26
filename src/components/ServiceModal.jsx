import { useState } from 'react'
import { X, CheckCircle, ArrowLeft, MessageCircle, Loader2 } from 'lucide-react'
import * as Icons from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { WHATSAPP_NUMBER } from '../data/services'
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

// Step 1 — list all packages for the service
function PackageList({ service, onSelect, onClose }) {
  const Icon = Icons[service.icon] || Icons.Star
  return (
    <div className="p-6 space-y-4">
      <div className={`flex items-center gap-3 p-4 rounded-2xl bg-gradient-to-br ${service.color}`}>
        <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center shrink-0">
          <Icon size={24} className="text-white" />
        </div>
        <div>
          <h3 className="text-white font-black text-lg leading-tight">{service.title}</h3>
          <p className="text-white/75 text-sm mt-0.5">{service.shortDesc}</p>
        </div>
      </div>

      <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">Choose a Package</p>

      <div className="space-y-3">
        {service.packages.map((pkg, i) => (
          <button
            key={i}
            onClick={() => onSelect(pkg)}
            className="w-full text-left p-4 rounded-xl border-2 border-gray-100 hover:border-[#222222] hover:bg-[#f5f5f5] transition-all group"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="font-bold text-gray-900 group-hover:text-[#222222]">{pkg.name}</p>
                <p className="text-sm text-gray-500 mt-0.5">
                  {pkg.price === 0 ? 'Custom Pricing' : `₹${pkg.price.toLocaleString()} total · ₹${pkg.advance.toLocaleString()} advance`}
                </p>
              </div>
              <span className="text-gray-300 group-hover:text-[#444444] text-xl">›</span>
            </div>
            <ul className="mt-2 flex flex-wrap gap-1">
              {pkg.features.slice(0, 3).map((f) => (
                <span key={f} className="text-xs bg-gray-100 group-hover:bg-[#ebebeb] text-gray-600 group-hover:text-[#222222] px-2 py-0.5 rounded-full">{f}</span>
              ))}
              {pkg.features.length > 3 && (
                <span className="text-xs bg-gray-100 text-gray-400 px-2 py-0.5 rounded-full">+{pkg.features.length - 3} more</span>
              )}
            </ul>
          </button>
        ))}
      </div>
    </div>
  )
}

// Step 2 — package detail + payment type choice
function PackageDetail({ service, pkg, onPaymentChoice, onBack }) {
  const isCustom = pkg.price === 0
  const [extraPages, setExtraPages] = useState(0)
  const isWebDev = service.id === 'web-development'
  const extraCost = isWebDev ? extraPages * (pkg.name === 'Static Website' ? 500 : 1000) : 0
  const total = pkg.price + extraCost

  return (
    <div className="p-6 space-y-4">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft size={15} /> Back to packages
      </button>

      <div>
        <h3 className="text-xl font-black text-gray-900">{pkg.name}</h3>
        {!isCustom && (
          <p className="text-sm text-gray-500 mt-0.5">
            Total: <span className="font-bold text-gray-800">₹{total.toLocaleString()}</span>
            {' · '}Advance: <span className="font-bold text-orange-600">₹{pkg.advance.toLocaleString()}</span>
          </p>
        )}
      </div>

      <ul className="space-y-2">
        {pkg.features.map((f) => (
          <li key={f} className="flex items-center gap-2 text-sm text-gray-700">
            <CheckCircle size={15} className="text-green-500 shrink-0" />
            {f}
          </li>
        ))}
      </ul>

      {isWebDev && (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Extra Pages (beyond 5 included)</label>
          <div className="flex items-center gap-3">
            <button onClick={() => setExtraPages(Math.max(0, extraPages - 1))}
              className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-lg font-bold hover:bg-gray-50">−</button>
            <span className="text-lg font-bold w-8 text-center">{extraPages}</span>
            <button onClick={() => setExtraPages(extraPages + 1)}
              className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-lg font-bold hover:bg-gray-50">+</button>
            {extraPages > 0 && <span className="text-sm text-orange-600 font-medium">+₹{extraCost.toLocaleString()}</span>}
          </div>
        </div>
      )}

      {service.id === 'web-development' && (
        <div className="bg-[#f5f5f5] border border-[#e2e8f0] rounded-xl p-3 text-xs text-[#222222]">
          Static: ₹500/extra page · Dynamic: ₹1,000/extra page
        </div>
      )}

      {isCustom ? (
        <button
          onClick={() => onPaymentChoice('whatsapp', pkg, extraPages, total)}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors"
        >
          <MessageCircle size={18} /> Send Enquiry via WhatsApp
        </button>
      ) : (
        <div className="space-y-2 pt-2">
          <p className="text-sm font-semibold text-gray-700">How would you like to pay?</p>
          <button
            onClick={() => onPaymentChoice('advance', pkg, extraPages, total)}
            className="w-full p-4 rounded-xl border-2 border-orange-200 hover:border-orange-400 hover:bg-orange-50 transition-all text-left"
          >
            <p className="font-bold text-gray-900">Pay Advance Only</p>
            <p className="text-sm text-orange-600 font-semibold">₹{pkg.advance.toLocaleString()} now · ₹{(total - pkg.advance).toLocaleString()} after delivery</p>
          </button>
          <button
            onClick={() => onPaymentChoice('full', pkg, extraPages, total)}
            className="w-full p-4 rounded-xl border-2 border-green-200 hover:border-green-400 hover:bg-green-50 transition-all text-left"
          >
            <p className="font-bold text-gray-900">Pay Full Amount</p>
            <p className="text-sm text-green-600 font-semibold">₹{total.toLocaleString()} — pay everything now</p>
          </button>
        </div>
      )}
    </div>
  )
}

// Step 3 — description + payment methods
function PaymentStep({ service, pkg, paymentType, extraPages, totalPrice, onBack, onClose }) {
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
      `👤 *Name:* ${user.user_metadata?.full_name || 'User'}\n` +
      `📧 *Email:* ${user.email}\n` +
      `🛠️ *Service:* ${service.title}\n` +
      `📝 *Requirement:* ${description || 'N/A'}`
    )
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank')
    onClose()
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
          onClose()
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

  if (isCustom) {
    return (
      <div className="p-6 space-y-4">
        <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
          <ArrowLeft size={15} /> Back
        </button>
        <h3 className="font-black text-gray-900 text-lg">Describe your requirement</h3>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={5}
          placeholder="Tell us what you need and we will reach out via WhatsApp..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#222222] resize-none"
        />
        <button onClick={sendWhatsAppEnquiry}
          className="w-full bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-colors">
          <MessageCircle size={18} /> Send via WhatsApp
        </button>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-4">
      <button onClick={onBack} className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-800">
        <ArrowLeft size={15} /> Back
      </button>

      <div className="bg-[#f5f5f5] rounded-xl p-4 text-center">
        <p className="text-sm text-gray-600">{paymentType === 'full' ? 'Full payment' : 'Advance payment'}</p>
        <p className="text-3xl font-black text-orange-600 mt-1">₹{amountToPay.toLocaleString()}</p>
        {paymentType === 'advance' && (
          <p className="text-xs text-gray-500 mt-1">Remaining ₹{(totalPrice - pkg.advance).toLocaleString()} after delivery</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Project requirements</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
          placeholder="Describe what you need..."
          className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[#222222] resize-none"
        />
      </div>

      <p className="text-sm font-semibold text-gray-700">Choose payment method</p>
      <div className="space-y-2">
        {[
          { id: 'upi',        label: 'UPI',                sub: 'GPay, PhonePe, Paytm, BHIM',     emoji: '📱' },
          { id: 'card',       label: 'Debit / Credit Card', sub: 'Visa, Mastercard, RuPay',        emoji: '💳' },
          { id: 'netbanking', label: 'Net Banking',         sub: 'SBI, HDFC, ICICI & 50+ banks',   emoji: '🏦' },
          { id: 'wallet',     label: 'Wallets',             sub: 'Paytm, Mobikwik & more',         emoji: '👛' },
          { id: 'emi',        label: 'EMI',                 sub: 'No-cost EMI on select cards',    emoji: '📅' },
        ].map(({ id, label, sub, emoji }) => (
          <button key={id} onClick={() => handleRazorpay(id)} disabled={loading}
            className="w-full flex items-center gap-4 p-3 rounded-xl border-2 border-gray-200 hover:border-[#222222] hover:bg-[#f5f5f5] transition-all text-left disabled:opacity-60">
            <span className="text-2xl w-8 text-center">{emoji}</span>
            <div className="flex-1">
              <p className="font-semibold text-sm text-gray-900">{label}</p>
              <p className="text-xs text-gray-400">{sub}</p>
            </div>
            <span className="text-gray-300 text-lg">›</span>
          </button>
        ))}
      </div>

      <button onClick={() => handleRazorpay()} disabled={loading}
        className="w-full bg-gradient-to-r from-[#222222] to-[#444444] text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
        {loading ? <Loader2 size={16} className="animate-spin" /> : null}
        {loading ? 'Loading...' : 'Open All Payment Options'}
      </button>

      <div className="flex items-center gap-2 bg-green-50 rounded-xl p-3">
        <CheckCircle size={14} className="text-green-500 shrink-0" />
        <p className="text-xs text-green-700">100% secure · SSL encrypted · Powered by Razorpay</p>
      </div>
    </div>
  )
}

// ── Main Modal ───────────────────────────────────────────────────────────────
export default function ServiceModal({ service, onClose }) {
  const { user } = useAuthStore()
  const navigate = useNavigate()
  const [step, setStep] = useState('packages') // packages | detail | payment
  const [selectedPkg, setSelectedPkg] = useState(null)
  const [paymentType, setPaymentType] = useState(null)
  const [extraPages, setExtraPages] = useState(0)
  const [totalPrice, setTotalPrice] = useState(0)

  const handleSelectPackage = (pkg) => {
    setSelectedPkg(pkg)
    setStep('detail')
  }

  const handlePaymentChoice = (type, pkg, extra, total) => {
    if (type === 'whatsapp') {
      setSelectedPkg(pkg)
      setExtraPages(extra)
      setTotalPrice(total)
      setPaymentType('whatsapp')
      setStep('payment')
      return
    }
    if (!user) {
      toast.error('Please sign in to book a service')
      navigate('/login')
      onClose()
      return
    }
    setPaymentType(type)
    setExtraPages(extra)
    setTotalPrice(total)
    setStep('payment')
  }

  const titles = { packages: service.title, detail: selectedPkg?.name || '', payment: 'Complete Payment' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <h2 className="text-lg font-black text-gray-900">{titles[step]}</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {step === 'packages' && (
          <PackageList service={service} onSelect={handleSelectPackage} onClose={onClose} />
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
            onClose={onClose}
          />
        )}
      </div>
    </div>
  )
}
