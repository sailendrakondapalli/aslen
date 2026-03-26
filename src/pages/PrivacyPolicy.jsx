export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Privacy Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: March 2026</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Information We Collect</h2>
            <p>We collect basic user information such as name, email, and contact details for providing our web development and tech services.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">How We Use Your Information</h2>
            <p>Your information is used solely to process bookings, communicate about your project, and provide support. We do not share or sell user data to third parties.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Payment Security</h2>
            <p>All payments are processed securely via Razorpay. We do not store your card or payment details on our servers.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Contact</h2>
            <p>For any privacy-related queries, contact us at <a href="mailto:sailendrakondapalli@gmail.com" className="text-blue-600 hover:underline">sailendrakondapalli@gmail.com</a></p>
          </section>
        </div>
      </div>
    </div>
  )
}
