import { Link } from 'react-router-dom'
import { Mail, Phone, MapPin, Globe } from 'lucide-react'

export default function Footer() {
  return (
    <footer style={{ background: '#111111', fontFamily: 'Poppins, sans-serif' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <img src="/logo.png" alt="ASLEN" className="h-10 w-10 rounded-full object-cover" />
              <span className="text-white font-black text-lg">ASLEN TECH</span>
            </div>
            <p className="text-sm text-white/50 leading-relaxed">
              Empowering Businesses with Smart Digital Solutions.
            </p>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm text-white/60">
              {['Home', 'Services', 'About', 'Contact'].map((l) => (
                <li key={l}>
                  <a href={`/#${l.toLowerCase()}`} className="hover:text-[#f59e0b] transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm text-white/60">
              <li><Link to="/Policy/PrivacyPolicy" className="hover:text-[#f59e0b] transition-colors">Privacy Policy</Link></li>
              <li><Link to="/Policy/RefundPolicy" className="hover:text-[#f59e0b] transition-colors">Refund Policy</Link></li>
              <li><Link to="/Policy/CancellationPolicy" className="hover:text-[#f59e0b] transition-colors">Cancellation Policy</Link></li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm text-white/60">
              <li className="flex items-center gap-2"><Mail size={15} className="text-[#f59e0b] shrink-0" /><span>sailendrakondapalli@gmail.com</span></li>
              <li className="flex items-center gap-2"><Phone size={15} className="text-[#f59e0b] shrink-0" /><span>+91 8143724405</span></li>
              <li className="flex items-center gap-2"><MapPin size={15} className="text-[#f59e0b] shrink-0" /><span>India</span></li>
              <li className="flex items-center gap-2"><Globe size={15} className="text-[#f59e0b] shrink-0" /><span>www.aslen.in</span></li>
            </ul>
          </div>
        </div>

        <div className="mt-10 pt-6 text-center text-sm text-white/30" style={{ borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          © {new Date().getFullYear()} ASLEN TECH SOLUTIONS. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
