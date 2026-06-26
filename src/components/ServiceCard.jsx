import * as Icons from 'lucide-react'
import { useNavigate } from 'react-router-dom'

export default function ServiceCard({ service }) {
  const Icon = Icons[service.icon] || Icons.Star
  const navigate = useNavigate()

  return (
    <div className="svc-card rounded-2xl p-6 flex flex-col" style={{ background: '#111928' }}>
      <div className="svc-icon w-12 h-12 rounded-[13px] flex items-center justify-center mb-4">
        <Icon size={22} className="text-[#00C8FF]" />
      </div>
      <h3 className="font-bold text-white text-lg mb-2" style={{ fontFamily: 'Space Grotesk, sans-serif' }}>
        {service.title}
      </h3>
      <p className="text-sm leading-relaxed flex-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{service.shortDesc}</p>
      <div className="mt-4 flex items-center justify-between">
        <span className="font-bold text-sm text-[#00C8FF]">
          {service.packages[0].price === 0
            ? 'Custom Pricing'
            : `From ₹${service.packages[0].price.toLocaleString()}`}
        </span>
        <button
          onClick={() => navigate(`/services/${service.id}`)}
          className="btn-primary px-4 py-2 rounded-lg text-sm font-semibold">
          Explore
        </button>
      </div>
    </div>
  )
}
