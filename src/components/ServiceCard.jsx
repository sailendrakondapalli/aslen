import * as Icons from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ServiceCard({ service }) {
  const Icon = Icons[service.icon] || Icons.Star
  const navigate = useNavigate()

  return (
    <div className="bg-white rounded-2xl border border-[#e2e8f0] p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col">
      <div className="w-12 h-12 rounded-xl bg-[#222222] flex items-center justify-center mb-4">
        <Icon size={22} className="text-white" />
      </div>
      <h3 className="font-bold text-[#1e293b] text-lg mb-2" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {service.title}
      </h3>
      <p className="text-[#64748b] text-sm leading-relaxed flex-1">{service.shortDesc}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="text-[#222222] font-bold text-sm">
          {service.packages[0].price === 0
            ? 'Custom Pricing'
            : `From ₹${service.packages[0].price.toLocaleString()}`}
        </span>
        <button
          onClick={() => navigate(`/services/${service.id}`)}
          className="bg-[#222222] hover:bg-[#111111] text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
          Explore
        </button>
      </div>
    </div>
  )
}
