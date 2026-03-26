export default function CancellationPolicy() {
  return (
    <div className="min-h-screen bg-gray-50 pt-16">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black text-gray-900 mb-2">Cancellation Policy</h1>
        <p className="text-sm text-gray-400 mb-8">Last updated: March 2026</p>
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 space-y-6 text-gray-700 leading-relaxed">
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">Before Project Starts</h2>
            <p>Orders can be cancelled before the project work has started. To request a cancellation, contact us via WhatsApp or email within 24 hours of booking.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">After Project Starts</h2>
            <p>Once the development or design process begins, cancellation is not allowed. The advance payment will be retained as compensation for work already done.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-gray-900 mb-2">How to Cancel</h2>
            <p>To request a cancellation before work begins, contact us at <a href="mailto:sailendrakondapalli@gmail.com" className="text-blue-600 hover:underline">sailendrakondapalli@gmail.com</a> or WhatsApp us at +91 81437 24405.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
