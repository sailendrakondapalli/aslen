import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { ArrowLeft, CheckCircle } from 'lucide-react'
import * as Icons from 'lucide-react'
import { services } from '../data/services'
import BookingModal from '../components/BookingModal'
import { useAuthStore } from '../store/authStore'
import toast from 'react-hot-toast'

export default function ServiceDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuthStore()
  const [selectedPackage, setSelectedPackage] = useState(null)

  const service = services.find((s) => s.id === id)

  if (!service) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-16">
        <div className="text-center">
          <p className="text-gray-500 text-lg">Service not found.</p>
          <button onClick={() => navigate('/')} className="mt-4 text-blue-600 underline">Go Home</button>
        </div>
      </div>
    )
  }

  const Icon = Icons[service.icon] || Icons.Star

  const handleBook = (pkg) => {
    if (!user) {
      toast.error('Please sign in to book a service')
      navigate('/login')
      return
    }
    setSelectedPackage({ ...pkg, serviceTitle: service.title, serviceId: service.id })
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      {/* Hero */}
      <div className={`bg-gradient-to-br ${service.color} py-16`}>
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-white/80 hover:text-white mb-6 transition-colors"
          >
            <ArrowLeft size={18} /> Back
          </button>
          <div className="flex items-center gap-4 mb-4">
            <div className="w-14 h-14 bg-white/20 rounded-2xl flex items-center justify-center">
              <Icon size={28} className="text-white" />
            </div>
            <h1 className="text-4xl font-black text-white">{service.title}</h1>
          </div>
          <p className="text-white/80 text-lg max-w-2xl">{service.shortDesc}</p>
        </div>
      </div>

      {/* Packages */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h2 className="text-2xl font-black text-gray-900 mb-8">Choose a Package</h2>

        <div className={`grid gap-6 ${service.packages.length === 1 ? 'grid-cols-1 max-w-md' : 'grid-cols-1 sm:grid-cols-2'}`}>
          {service.packages.map((pkg, i) => (
            <div
              key={i}
              className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg transition-shadow flex flex-col"
            >
              <h3 className="text-xl font-bold text-gray-900 mb-2">{pkg.name}</h3>

              {pkg.price === 0 ? (
                <div className="mb-4">
                  <span className="text-2xl font-black text-gray-900">Custom Pricing</span>
                  <p className="text-gray-500 text-sm mt-1">We'll quote based on your requirements</p>
                </div>
              ) : (
                <div className="mb-4">
                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-black text-gray-900">₹{pkg.price.toLocaleString()}</span>
                    <span className="text-gray-400 text-sm">total</span>
                  </div>
                  <div className="mt-1 inline-flex items-center gap-1 bg-orange-50 text-orange-600 text-sm font-semibold px-3 py-1 rounded-full">
                    Advance: ₹{pkg.advance.toLocaleString()} (paid now)
                  </div>
                </div>
              )}

              <ul className="space-y-2 flex-1 mb-6">
                {pkg.features.map((f) => (
                  <li key={f} className="flex items-center gap-2 text-gray-600 text-sm">
                    <CheckCircle size={15} className="text-green-500 shrink-0" />
                    {f}
                  </li>
                ))}
              </ul>

              <button
                onClick={() => handleBook(pkg)}
                className={`w-full bg-gradient-to-r ${service.color} text-white py-3 rounded-xl font-bold hover:opacity-90 transition-opacity`}
              >
                {pkg.price === 0 ? 'Send Enquiry via WhatsApp' : `Book Now — Pay ₹${pkg.advance.toLocaleString()} Advance`}
              </button>
            </div>
          ))}
        </div>

        {/* Extra page note for web dev */}
        {service.id === 'web-development' && (
          <div className="mt-6 bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-700">
            Need more than 5 pages? Static: ₹500/extra page · Dynamic: ₹1,000/extra page. Mention in your booking description.
          </div>
        )}
      </div>

      {selectedPackage && (
        <BookingModal
          service={selectedPackage}
          onClose={() => setSelectedPackage(null)}
        />
      )}
    </div>
  )
}
