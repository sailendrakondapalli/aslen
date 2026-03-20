import { useState } from 'react'
import { X, Loader2, MessageCircle } from 'lucide-react'
import { supabase } from '../lib/supabase'
import { useAuthStore } from '../store/authStore'
import { WHATSAPP_NUMBER } from '../data/services'
import toast from 'react-hot-toast'

export default function BookingModal({ service, onClose }) {
  const { user } = useAuthStore()
  const [description, setDescription] = useState('')
  const [extraPages, setExtraPages] = useState(0)
  const [loading, setLoading] = useState(false)

  const isWebDev = service.serviceId === 'web-development'
  const isOther = service.serviceId === 'other-solutions'
  const isCustom = service.price === 0

  const extraCost = isWebDev
    ? extraPages * (service.name === 'Static Website' ? 500 : 1000)
    : 0

  const totalPrice = service.price + extraCost
  const advanceAmount = service.advance

  const sendWhatsApp = (bookingDetails) => {
    const msg = encodeURIComponent(
      `🔔 *New Booking - ASLEN TECH SOLUTIONS*\n\n` +
      `👤 *Client:* ${user.user_metadata?.full_name || 'User'}\n` +
      `📧 *Email:* ${user.email}\n` +
      `🛠️ *Service:* ${service.serviceTitle} - ${service.name}\n` +
      `💰 *Total Price:* ₹${totalPrice.toLocaleString()}\n` +
      `💳 *Advance Paid:* ₹${advanceAmount.toLocaleString()}\n` +
      `💳 *Payment ID:* ${bookingDetails.paymentId}\n` +
      `📝 *Description:* ${description || 'N/A'}\n` +
      (isWebDev && extraPages > 0 ? `📄 *Extra Pages:* ${extraPages}\n` : '') +
      `\n_Booking ID: ${bookingDetails.bookingId}_`
    )
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank')
  }

  const sendWhatsAppEnquiry = () => {
    const msg = encodeURIComponent(
      `🔔 *New Enquiry - ASLEN TECH SOLUTIONS*\n\n` +
      `👤 *Name:* ${user.user_metadata?.full_name || 'User'}\n` +
      `📧 *Email:* ${user.email}\n` +
      `🛠️ *Service:* ${service.serviceTitle}\n` +
      `📝 *Requirement:* ${description || 'Please contact me for details'}`
    )
    window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`, '_blank')
    onClose()
  }

  const loadRazorpay = () =>
    new Promise((resolve) => {
      if (window.Razorpay) return resolve(true)
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })

  const handlePayment = async () => {
    if (!description.trim()) {
      toast.error('Please describe your requirements')
      return
    }

    const razorpayKey = import.meta.env.VITE_RAZORPAY_KEY_ID
    if (!razorpayKey || razorpayKey === 'your_razorpay_key_id') {
      toast.error('Payment not configured. Contact support.')
      return
    }

    setLoading(true)

    const loaded = await loadRazorpay()
    if (!loaded) {
      toast.error('Failed to load payment gateway')
      setLoading(false)
      return
    }

    const options = {
      key: razorpayKey,
      amount: advanceAmount * 100,
      currency: 'INR',
      name: 'ASLEN TECH SOLUTIONS',
      description: `${service.serviceTitle} - ${service.name} (Advance)`,
      image: 'https://ui-avatars.com/api/?name=ASLEN&background=3b82f6&color=fff',
      prefill: {
        name: user.user_metadata?.full_name || '',
        email: user.email || '',
        contact: '',
      },
      theme: { color: '#3b82f6' },
      handler: async (response) => {
        try {
          const { data, error } = await supabase.from('bookings').insert({
            user_id: user.id,
            service_id: service.serviceId,
            service_title: service.serviceTitle,
            package_name: service.name,
            payment_id: response.razorpay_payment_id,
            advance_paid: advanceAmount,
            total_amount: totalPrice,
            extra_pages: isWebDev ? extraPages : 0,
            description,
            status: 'confirmed',
          }).select().single()

          if (error) throw error

          toast.success('Booking confirmed! Advance payment received.')
          sendWhatsApp({ paymentId: response.razorpay_payment_id, bookingId: data.id })
          onClose()
        } catch {
          toast.error('Payment done but booking save failed. Contact support.')
        }
      },
      modal: {
        ondismiss: () => {
          setLoading(false)
          toast('Payment cancelled')
        },
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.on('payment.failed', () => {
      toast.error('Payment failed. Please try again.')
      setLoading(false)
    })
    rzp.open()
    setLoading(false)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b border-gray-100 sticky top-0 bg-white rounded-t-2xl">
          <h2 className="text-xl font-bold text-gray-900">
            {isCustom ? 'Send Enquiry' : 'Book Service'}
          </h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 space-y-4">
          {/* Service info */}
          <div className="bg-gray-50 rounded-xl p-4 space-y-1">
            <p className="text-sm text-gray-500">Service</p>
            <p className="font-semibold text-gray-900">{service.serviceTitle}</p>
            <p className="text-sm text-gray-600">{service.name}</p>
          </div>

          {/* Pricing */}
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

          {/* Extra pages for web dev */}
          {isWebDev && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Extra Pages (beyond 5 included)
              </label>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setExtraPages(Math.max(0, extraPages - 1))}
                  className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-lg font-bold hover:bg-gray-50"
                >−</button>
                <span className="text-lg font-bold w-8 text-center">{extraPages}</span>
                <button
                  onClick={() => setExtraPages(extraPages + 1)}
                  className="w-9 h-9 rounded-lg border border-gray-200 flex items-center justify-center text-lg font-bold hover:bg-gray-50"
                >+</button>
                {extraPages > 0 && (
                  <span className="text-sm text-orange-600 font-medium">
                    +₹{extraCost.toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Description */}
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
              Only the advance amount of ₹{advanceAmount.toLocaleString()} will be charged now. Remaining ₹{(totalPrice - advanceAmount).toLocaleString()} after project delivery.
            </div>
          )}
        </div>

        <div className="p-6 pt-0 flex gap-3">
          <button onClick={onClose} className="flex-1 border border-gray-200 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-colors">
            Cancel
          </button>

          {isCustom ? (
            <button
              onClick={sendWhatsAppEnquiry}
              className="flex-1 bg-green-500 hover:bg-green-600 text-white py-3 rounded-xl font-semibold transition-colors flex items-center justify-center gap-2"
            >
              <MessageCircle size={18} />
              WhatsApp Us
            </button>
          ) : (
            <button
              onClick={handlePayment}
              disabled={loading}
              className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading && <Loader2 size={18} className="animate-spin" />}
              Pay ₹{advanceAmount.toLocaleString()} Advance
            </button>
          )}
        </div>
      </div>
    </div>
  )
}
