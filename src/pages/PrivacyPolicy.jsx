export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen pt-16" style={{ background: '#080E1C', fontFamily: 'Space Grotesk, sans-serif' }}>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black text-white mb-2">Privacy Policy</h1>
        <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>Last updated: March 2026</p>
        <div className="rounded-2xl p-8 space-y-6 leading-relaxed border" style={{ background: '#111928', borderColor: 'rgba(0,200,255,0.15)', color: 'rgba(255,255,255,0.65)' }}>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">Information We Collect</h2>
            <p>We collect basic user information such as name, email, and contact details for providing our web development and tech services.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">How We Use Your Information</h2>
            <p>Your information is used solely to process bookings, communicate about your project, and provide support. We do not share or sell user data to third parties.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">Payment Security</h2>
            <p>All payments are processed securely via Razorpay. We do not store your card or payment details on our servers.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">Contact</h2>
            <p>For any privacy-related queries, contact us at <a href="mailto:sailendrakondapalli@gmail.com" className="text-[#00C8FF] hover:underline">sailendrakondapalli@gmail.com</a></p>
          </section>
        </div>
      </div>
    </div>
  )
}
