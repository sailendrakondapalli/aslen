import { useState } from 'react'
import { X, Loader2, MessageCircle, QrCode, CreditCard, Building2, Smartphone, Upload, CheckCircle, ArrowLeft } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { WHATSAPP_NUMBER } from '../data/services'
import toast from 'react-hot-toast'

// ── Payment methods ──────────────────────────────────────────────────────────
const PAYMENT_METHODS = [
  {
    id: 'upi',
    label: 'UPI / QR Code',
    icon: QrCode,
    active: true,
    description: 'Scan & pay instantly',
    badge: null,
  },
  {
    id: 'card',
    label: 'Card / Net Banking',
    icon: CreditCard,
    active: false,
    description: 'Coming soon',
    badge: 'Soon',
  },
  {
    id: 'bank',
    label: 'Bank Transfer',
    icon: Building2,
    active: false,
    description: 'Coming soon',
    badge: 'Soon',
  },
  {
    id: 'wallet',
    label: 'Wallets',
    icon: Smartphone,
    active: false,
    description: 'Coming soon',
    badge: 'Soon',
  },
]

const STEP_DETAILS = 'details'
const STEP_PAYMENT = 'payment'
const STEP_UPLOAD  = 'upload'

export default function BookingModal({ service, onClose }) {
  const { user } = useAuthStore()
  const [description, setDescription] = useState('')
  const [extraPages, setExtraPages] = useState(0)
  const [loading, setLoading] = useState(false)
  const [step, setStep] = useState(STEP_DETAILS)
  const [selectedMethod, setSelectedMethod] = useState('upi')
  const [screenshot, setScreenshot] = useState(null)
  const [screenshotPreview, setScreenshotPreview] = useState(null)

  const isWebDev      = service.serviceId === 'web-development'
  const isCustom      = service.price === 0
  const extraCost     = isWebDev ? extraPages * (service.name === 'Static Website' ? 500 : 1000) : 0
  const totalPrice    = service.price + extraCost
  const advanceAmount = service.advance

  // ── WhatsApp notification ────────────────────────────────────────────────
  const sendWhatsApp = (bookingId) => {
    const msg = encodeURIComponent(
      `🔔 *New Booking - ASLEN TECH SOLUTIONS*\n\n` +
      `👤 *Client:* ${user.user_metadata?.full_name || 'User'}\n` +
      `📧 *Email:* ${user.email}\n` +
      `🛠️ *Service:* ${service.serviceTitle} - ${service.name}\n` +
      `💰 *Total:* ₹${totalPrice.toLocaleString()}\n` +
      `💳 *Advance:* ₹${advanceAmount.toLocaleString()}\n` +
      `💳 *Method:* UPI/QR\n` +
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

  // ── Screenshot picker ────────────────────────────────────────────────────
  const handleScreenshotChange = (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) { toast.error('File too large (max 5MB)'); return }
    setScreenshot(file)
    setScreenshotPreview(URL.createObjectURL(file))
  }

  // ── Submit booking with screenshot ──────────────────────────────────────
  const handleSubmitBooking = async () => {
    if (!screenshot) { toast.error('Please upload your payment screenshot'); return }
    setLoading(true)
    try {
      // 0. Ensure user exists in public.users (avoids FK violation)
      await supabase.from('users').upsert({
        id: user.id,
        email: user.email,
        name: user.user_metadata?.full_name || user.user_metadata?.name || '',
        profile_url: user.user_metadata?.avatar_url || '',
      }, { onConflict: 'id' })
      // 1. Upload screenshot to Supabase Storage
      const ext  = screenshot.name.split('.').pop()
      const path = `${user.id}/${Date.now()}.${ext}`
      const { error: uploadError } = await supabase.storage
        .from('payment-screenshots')
        .upload(path, screenshot, { contentType: screenshot.type })
      if (uploadError) throw uploadError

      // 2. Get public URL
      const { data: urlData } = supabase.storage
        .from('payment-screenshots')
        .getPublicUrl(path)

      // 3. Save booking
      const { data, error } = await supabase.from('bookings').insert({
        user_id: user.id,
        user_email: user.email,
        service_id: service.serviceId,
        service_title: service.serviceTitle,
        package_name: service.name,
        payment_method: 'upi',
        payment_screenshot_url: urlData.publicUrl,
        advance_paid: advanceAmount,
        total_amount: totalPrice,
        extra_pages: isWebDev ? extraPages : 0,
        description,
        status: 'pending_verification',
      }).select().single()

      if (error) throw error

      toast.success('Booking submitted! We will verify your payment shortly.')
      sendWhatsApp(data.id)
      onClose()
    } catch (err) {
      toast.error('Something went wrong. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // ── Step: Details ────────────────────────────────────────────────────────
  const renderDetails = () => (
    <>
      <div className="p-6 space-y-4">
        <div className="bg-gray-50 rounded-xl p-4 space-y-1">
          <p className="text-sm text-gray-500">Service</p>
          <p className="font-semibold text-gray-900">{service.serviceTitle}</p>
          <p className="text-sm text-gray-600">{service.name}</p>
        </div>

        {!isCustom && (
          <div className="bg-blue-50 rounded-xl p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Total Price</span>
              <span className="font-bold text-gray-900">₹{totalPrice.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Advance (pay now)</span>
              <span className="font-bold text-orange-600">₹{advanceAmount.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Remaining (after delivery)</span>
              <span className="font-semibold text-gray-700">₹{(totalPrice - advanceAmount).toLocaleString()}</span>
            </div>
          </div>
        )}

        {isWebDev && (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Extra Pages (beyond 5 included)
            </label>
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

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            {isCustom ? 'Describe your requirement' : 'Project requirements'}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder={isCustom
              ? 'Tell us what you need and we will reach out via WhatsApp...'
              : 'Describe what you need, any specific requirements...'}
            className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
          />
        </div>

        {!isCustom && (
          <div className="bg-green-50 rounded-xl p-3 text-xs text-green-700">
            Only ₹{advanceAmount.toLocaleString()} advance is charged now. Remaining ₹{(totalPrice - advanceAmount).toLocaleString()} after delivery.
          </div>
        )}
      </div>

      <div className="p-6 pt-0 flex gap-3">
        <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
          Cancel
        </button>
        {isCustom ? (
          <button onClick={sendWhatsAppEnquiry}
            className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2">
            <MessageCircle size={18} /> WhatsApp Us
          </button>
        ) : (
          <button onClick={() => setStep(STEP_PAYMENT)}
            className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity flex items-center justify-center gap-2">
            Continue to Payment →
          </button>
        )}
      </div>
    </>
  )

  // ── Step: Payment method selection ──────────────────────────────────────
  const renderPayment = () => (
    <>
      <div className="p-6 space-y-4">
        <div className="bg-blue-50 rounded-xl p-3 flex justify-between text-sm">
          <span className="text-gray-600">Advance to pay</span>
          <span className="font-bold text-orange-600">₹{advanceAmount.toLocaleString()}</span>
        </div>

        <p className="text-sm font-medium text-gray-700">Select payment method</p>

        <div className="space-y-2">
          {PAYMENT_METHODS.map((method) => {
            const Icon = method.icon
            const isSelected = selectedMethod === method.id
            return (
              <button
                key={method.id}
                onClick={() => method.active && setSelectedMethod(method.id)}
                disabled={!method.active}
                className={`w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left
                  ${method.active ? 'cursor-pointer' : 'cursor-not-allowed opacity-60'}
                  ${isSelected && method.active ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white hover:border-gray-300'}
                `}
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center
                  ${isSelected && method.active ? 'bg-blue-500 text-white' : 'bg-gray-100 text-gray-500'}`}>
                  <Icon size={20} />
                </div>
                <div className="flex-1">
                  <p className={`font-semibold text-sm ${isSelected && method.active ? 'text-blue-700' : 'text-gray-800'}`}>
                    {method.label}
                  </p>
                  <p className="text-xs text-gray-500">{method.description}</p>
                </div>
                {method.badge && (
                  <span className="text-xs bg-gray-100 text-gray-500 px-2 py-1 rounded-full font-medium">
                    {method.badge}
                  </span>
                )}
                {isSelected && method.active && (
                  <CheckCircle size={18} className="text-blue-500 shrink-0" />
                )}
              </button>
            )
          })}
        </div>
      </div>

      <div className="p-6 pt-0 flex gap-3">
        <button onClick={() => setStep(STEP_DETAILS)}
          className="flex items-center gap-1 border border-gray-200 text-gray-700 px-4 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <button onClick={() => setStep(STEP_UPLOAD)}
          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity">
          Pay via QR →
        </button>
      </div>
    </>
  )

  // ── Step: QR + screenshot upload ─────────────────────────────────────────
  const renderUpload = () => (
    <>
      <div className="p-6 space-y-4">
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-3 text-center">
          <p className="text-sm font-bold text-orange-700">Pay ₹{advanceAmount.toLocaleString()} advance</p>
          <p className="text-xs text-orange-600 mt-0.5">Scan the QR below using any UPI app</p>
        </div>

        {/* QR Code */}
        <div className="flex flex-col items-center gap-3 bg-white border-2 border-dashed border-blue-200 rounded-2xl p-6">
          <img
            src="/qr.png"
            alt="Payment QR Code"
            className="w-48 h-48 object-contain rounded-xl"
          />
          <p className="text-xs text-gray-500 text-center">
            Scan with PhonePe, GPay, Paytm, or any UPI app
          </p>
          {/* UPI ID */}
          <div className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 flex items-center justify-between gap-2">
            <div>
              <p className="text-xs text-gray-400 mb-0.5">UPI ID</p>
              <p className="text-sm font-bold text-gray-800 font-mono">8143724405-2@ibl</p>
            </div>
            <button
              onClick={() => {
                navigator.clipboard.writeText('8143724405-2@ibl')
                toast.success('UPI ID copied!')
              }}
              className="text-xs bg-blue-100 text-blue-600 hover:bg-blue-200 px-3 py-1.5 rounded-lg font-semibold transition-colors shrink-0"
            >
              Copy
            </button>
          </div>
        </div>

        {/* Screenshot upload */}
        <div>
          <p className="text-sm font-medium text-gray-700 mb-2">Upload payment screenshot</p>
          <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-xl cursor-pointer transition-colors
            ${screenshotPreview ? 'border-green-400 bg-green-50' : 'border-gray-300 bg-gray-50 hover:border-blue-400 hover:bg-blue-50'}`}>
            {screenshotPreview ? (
              <div className="flex flex-col items-center gap-2">
                <img src={screenshotPreview} alt="preview" className="h-20 object-contain rounded-lg" />
                <p className="text-xs text-green-600 font-medium">Screenshot selected ✓</p>
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 text-gray-400">
                <Upload size={24} />
                <p className="text-sm">Click to upload screenshot</p>
                <p className="text-xs">PNG, JPG up to 5MB</p>
              </div>
            )}
            <input type="file" accept="image/*" className="hidden" onChange={handleScreenshotChange} />
          </label>
        </div>
      </div>

      <div className="p-6 pt-0 flex gap-3">
        <button onClick={() => setStep(STEP_PAYMENT)}
          className="flex items-center gap-1 border border-gray-200 text-gray-700 px-4 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
          <ArrowLeft size={16} /> Back
        </button>
        <button
          onClick={handleSubmitBooking}
          disabled={loading || !screenshot}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2">
          {loading ? <Loader2 size={18} className="animate-spin" /> : <CheckCircle size={18} />}
          {loading ? 'Submitting...' : 'Confirm Booking'}
        </button>
      </div>
    </>
  )

  // ── Render ───────────────────────────────────────────────────────────────
  const stepTitle = {
    [STEP_DETAILS]: isCustom ? 'Send Enquiry' : 'Book Service',
    [STEP_PAYMENT]: 'Choose Payment',
    [STEP_UPLOAD]:  'Complete Payment',
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl z-10">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{stepTitle[step]}</h2>
            {!isCustom && (
              <div className="flex gap-1 mt-1">
                {[STEP_DETAILS, STEP_PAYMENT, STEP_UPLOAD].map((s, i) => (
                  <div key={s} className={`h-1 rounded-full transition-all ${
                    step === s ? 'w-6 bg-blue-500' :
                    [STEP_DETAILS, STEP_PAYMENT, STEP_UPLOAD].indexOf(step) > i ? 'w-4 bg-blue-300' : 'w-4 bg-gray-200'
                  }`} />
                ))}
              </div>
            )}
          </div>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        {step === STEP_DETAILS && renderDetails()}
        {step === STEP_PAYMENT && renderPayment()}
        {step === STEP_UPLOAD  && renderUpload()}
      </div>
    </div>
  )
}
