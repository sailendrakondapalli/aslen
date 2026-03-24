import { Mail, Phone, MapPin, Globe } from 'lucide-react'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ background: 'linear-gradient(135deg, #7f1d1d, #dc2626)' }}>
                <span className="text-white font-black text-sm">A</span>
              </div>
              <span className="text-white font-black text-lg">ASLEN TECH SOLUTIONS</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Empowering Businesses with Smart Digital Solutions. We build modern digital experiences that drive growth.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="text-white font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {['Home', 'Services', 'About', 'Contact'].map((l) => (
                <li key={l}>
                  <a href={`/#${l.toLowerCase()}`} className="hover:text-blue-400 transition-colors">{l}</a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="text-white font-semibold mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2">
                <Mail size={15} className="text-blue-400 shrink-0" />
                <span>contact@aslentech.com</span>
              </li>
              <li className="flex items-center gap-2">
                <Phone size={15} className="text-blue-400 shrink-0" />
                <span>+91 98765 43210</span>
              </li>
              <li className="flex items-center gap-2">
                <MapPin size={15} className="text-blue-400 shrink-0" />
                <span>India</span>
              </li>
              <li className="flex items-center gap-2">
                <Globe size={15} className="text-blue-400 shrink-0" />
                <span>www.aslentech.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-sm text-gray-500">
          © {new Date().getFullYear()} ASLEN TECH SOLUTIONS. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
