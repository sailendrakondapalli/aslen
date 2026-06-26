export default function CancellationPolicy() {
  return (
    <div className="min-h-screen pt-16" style={{ background: '#080E1C', fontFamily: 'Space Grotesk, sans-serif' }}>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black text-white mb-2">Cancellation Policy</h1>
        <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>Last updated: March 2026</p>
        <div className="rounded-2xl p-8 space-y-6 leading-relaxed border" style={{ background: '#111928', borderColor: 'rgba(0,200,255,0.15)', color: 'rgba(255,255,255,0.65)' }}>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">Before Project Starts</h2>
            <p>Orders can be cancelled before the project work has started. To request a cancellation, contact us via WhatsApp or email within 24 hours of booking.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">After Project Starts</h2>
            <p>Once the development or design process begins, cancellation is not allowed. The advance payment will be retained as compensation for work already done.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">How to Cancel</h2>
            <p>To request a cancellation before work begins, contact us at <a href="mailto:sailendrakondapalli@gmail.com" className="text-[#00C8FF] hover:underline">sailendrakondapalli@gmail.com</a> or WhatsApp us at +91 81437 24405.</p>
          </section>
        </div>
      </div>
    </div>
  )
}
