import { useState } from 'react'
import { X, Loader2, MessageCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { WHATSAPP_NUMBER } from '../data/services'
import toast from 'react-hot-toast'

const STEP_DETAILS = 'details'
const STEP_PAYMENT = 'payment'
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

export default function BookingModal({ service, onClose }) {
  const { user } = useAuthStore()
  const [description, setDescription] = useState('')
  const [extraPages, setExtraPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(STEP_DETAILS)

  const isWebDev      = service.serviceId === 'web-development'
  const isCustom      = service.price === 0
  const extraCost     = isWebDev ? extraPages * (service.name === 'Static Website' ? 500 : 1000) : 0
  const totalPrice    = service.price + extraCost
  const advanceAmount = service.advance

  const sendWhatsApp = (bookingId, method) => {
    const msg = encodeURIComponent(
      `🔔 *New Booking - ASLEN TECH SOLUTIONS*\n\n` +
      `👤 *Client:* ${user.user_metadata?.full_name || 'User'}\n` +
      `📧 *Email:* ${user.email}\n` +
      `🛠️ *Service:* ${service.serviceTitle} - ${service.name}\n` +
      `💰 *Total:* ₹${totalPrice.toLocaleString()}\n` +
      `💳 *Advance:* ₹${advanceAmount.toLocaleString()}\n` +
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
      `🛠️ *Service:* ${service.serviceTitle}\n` +
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
      user_id: user.id, user_email: user.email,
      service_id: service.serviceId, service_title: service.serviceTitle,
      package_name: service.name, payment_method: method,
      razorpay_payment_id: paymentId, advance_paid: advanceAmount,
      total_amount: totalPrice, extra_pages: isWebDev ? extraPages : 0,
      description, status: 'confirmed',
    }).select().single()

    if (error) throw error
    return data
  }

  const handleRazorpayPayment = async (method = null) => {
    setLoading(true)
    const loaded = await loadRazorpay()
    if (!loaded) { toast.error('Payment gateway failed to load.'); setLoading(false); return }

    const options = {
      key: RZP_KEY,
      amount: advanceAmount * 100,
      currency: 'INR',
      name: 'ASLEN TECH SOLUTIONS',
      description: `${service.serviceTitle} - ${service.name} (Advance)`,
      image: '/logo.png',
      prefill: { name: user.user_metadata?.full_name || '', email: user.email, contact: '' },
      theme: { color: '#222222' },
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
      modal: { ondismiss: () => setLoading(false) }
    }

    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', (r) => { toast.error(`Payment failed: ${r.error.description}`); setLoading(false) })
    rzp.open()
    setLoading(false)
  }

  const inp = "w-full border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm text-[#1e293b] resize-none"

  const renderDetails = () => (
    <>
      <div className="p-6 space-y-4">
        <div className="bg-[#f5f5f5] rounded-xl p-4 space-y-1">
          <p className="text-xs text-[#94a3b8] uppercase tracking-wide font-medium">Service</p>
          <p className="font-bold text-[#1e293b]">{service.serviceTitle}</p>
          <p className="text-sm text-[#64748b]">{service.name}</p>
        </div>

        {!isCustom && (
          <div className="bg-[#f5f5f5] rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[#64748b]">Total Price</span>
              <span className="font-bold text-[#1e293b]">₹{totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[#64748b]">Advance (pay now)</span>
              <span className="font-bold text-[#d97706]">₹{advanceAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm border-t border-[#e2e8f0] pt-2">
              <span className="text-[#64748b]">Remaining (after delivery)</span>
              <span className="font-semibold text-[#222222]">₹{(totalPrice - advanceAmount).toLocaleString()}</span>
            </div>
          </div>
        )}

        {isWebDev && (
          <div>
            <label className="block text-sm font-semibold text-[#1e293b] mb-2">Extra Pages (beyond 5)</label>
            <div className="flex items-center gap-3">
              <button onClick={() => setExtraPages(Math.max(0, extraPages - 1))}
                className="w-9 h-9 rounded-lg border border-[#e2e8f0] flex items-center justify-center text-lg font-bold hover:bg-[#f5f5f5] text-[#222222]">−</button>
              <span className="text-lg font-bold w-8 text-center text-[#1e293b]">{extraPages}</span>
              <button onClick={() => setExtraPages(extraPages + 1)}
                className="w-9 h-9 rounded-lg border border-[#e2e8f0] flex items-center justify-center text-lg font-bold hover:bg-[#f5f5f5] text-[#222222]">+</button>
              {extraPages > 0 && <span className="text-sm text-[#d97706] font-medium">+₹{extraCost.toLocaleString()}</span>}
            </div>
          </div>
        )}

        <div>
          <label className="block text-sm font-semibold text-[#1e293b] mb-2">
            {isCustom ? 'Describe your requirement' : 'Project requirements'}
          </label>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={4}
            placeholder={isCustom ? 'Tell us what you need...' : 'Describe your requirements...'}
            className={inp} />
        </div>

        {!isCustom && (
          <div className="bg-[#f5f5f5] rounded-xl p-3 text-xs text-[#222222] flex items-center gap-2">
            <CheckCircle size={13} className="shrink-0" />
            Only ₹{advanceAmount.toLocaleString()} advance now. Remaining ₹{(totalPrice - advanceAmount).toLocaleString()} after delivery.
          </div>
        )}
      </div>

      <div className="p-6 pt-0 flex gap-3">
        <button onClick={onClose}
          className="flex-1 border border-[#e2e8f0] text-[#64748b] py-3 rounded-xl font-semibold hover:bg-[#f5f5f5] transition-colors">
          Cancel
        </button>
        {isCustom ? (
          <button onClick={sendWhatsAppEnquiry}
            className="flex-1 bg-[#222222] hover:bg-[#111111] text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
            <MessageCircle size={18} /> WhatsApp Us
          </button>
        ) : (
          <button onClick={() => setStep(STEP_PAYMENT)}
            className="flex-1 bg-[#222222] hover:bg-[#111111] text-white py-3 rounded-xl font-bold transition-colors flex items-center justify-center gap-2">
            Continue to Payment →
          </button>
        )}
      </div>
    </>
  )

  const renderPayment = () => (
    <>
      <div className="p-6 space-y-4">
        <div className="bg-[#f5f5f5] rounded-xl p-4 text-center">
          <p className="text-sm text-[#64748b]">Advance to pay now</p>
          <p className="text-3xl font-black text-[#222222] mt-1">₹{advanceAmount.toLocaleString()}</p>
          <p className="text-xs text-[#94a3b8] mt-1">Secure payment via Razorpay</p>
        </div>

        <p className="text-sm font-semibold text-[#1e293b]">Choose how to pay</p>

        <div className="space-y-2">
          {[
            { id: 'upi',        label: 'UPI',                sub: 'GPay, PhonePe, Paytm, BHIM', emoji: '📱' },
            { id: 'card',       label: 'Debit / Credit Card', sub: 'Visa, Mastercard, RuPay',   emoji: '💳' },
            { id: 'netbanking', label: 'Net Banking',         sub: 'SBI, HDFC, ICICI & 50+ banks', emoji: '🏦' },
            { id: 'wallet',     label: 'Wallets',             sub: 'Paytm, Mobikwik & more',    emoji: '👛' },
            { id: 'emi',        label: 'EMI',                 sub: 'No-cost EMI on select cards', emoji: '📅' },
          ].map(({ id, label, sub, emoji }) => (
            <button key={id} onClick={() => handleRazorpayPayment(id)} disabled={loading}
              className="w-full flex items-center gap-4 p-4 rounded-xl border-2 border-[#e2e8f0] hover:border-[#222222] hover:bg-[#f5f5f5] transition-all text-left disabled:opacity-60">
              <span className="text-2xl w-10 text-center">{emoji}</span>
              <div className="flex-1">
                <p className="font-semibold text-sm text-[#1e293b]">{label}</p>
                <p className="text-xs text-[#94a3b8] mt-0.5">{sub}</p>
              </div>
              <span className="text-[#94a3b8] text-lg">›</span>
            </button>
          ))}
        </div>

        <button onClick={() => handleRazorpayPayment()} disabled={loading}
          className="w-full bg-[#222222] hover:bg-[#111111] text-white py-3 rounded-xl font-bold transition-colors disabled:opacity-60 flex items-center justify-center gap-2 text-sm">
          {loading ? <Loader2 size={16} className="animate-spin" /> : null}
          {loading ? 'Loading...' : 'Open All Payment Options'}
        </button>

        <div className="flex items-center gap-2 bg-[#f5f5f5] rounded-xl p-3">
          <CheckCircle size={14} className="text-[#222222] shrink-0" />
          <p className="text-xs text-[#222222]">100% secure · SSL encrypted · Powered by Razorpay</p>
        </div>
      </div>

      <div className="p-6 pt-0">
        <button onClick={() => setStep(STEP_DETAILS)}
          className="flex items-center gap-1 border border-[#e2e8f0] text-[#64748b] px-4 py-2.5 rounded-xl font-semibold hover:bg-[#f5f5f5] transition-colors text-sm">
          <ArrowLeft size={16} /> Back
        </button>
      </div>
    </>
  )

  const stepTitle = { [STEP_DETAILS]: isCustom ? 'Send Enquiry' : 'Book Service', [STEP_PAYMENT]: 'Complete Payment' }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" style={{ fontFamily: 'Poppins, sans-serif' }}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-[#e2e8f0] sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-xl font-bold text-[#1e293b]">{stepTitle[step]}</h2>
            {!isCustom && (
              <div className="flex gap-1 mt-1">
                {[STEP_DETAILS, STEP_PAYMENT].map((s, i) => (
                  <div key={s} className={`h-1 rounded-full transition-all ${
                    step === s ? 'w-6 bg-[#222222]' :
                    [STEP_DETAILS, STEP_PAYMENT].indexOf(step) > i ? 'w-4 bg-[#222222]/40' : 'w-4 bg-[#e2e8f0]'
                  }`} />
                ))}
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-[#f5f5f5] rounded-lg transition-colors text-[#64748b]">
            <X size={20} />
          </button>
        </div>
        {step === STEP_DETAILS && renderDetails()}
        {step === STEP_PAYMENT && renderPayment()}
      </div>
    </div>
  )
}
