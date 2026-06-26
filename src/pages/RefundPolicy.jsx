export default function RefundPolicy() {
  return (
    <div className="min-h-screen pt-16" style={{ background: '#080E1C', fontFamily: 'Space Grotesk, sans-serif' }}>
      <div className="max-w-3xl mx-auto px-4 py-12">
        <h1 className="text-3xl font-black text-white mb-2">Refund Policy</h1>
        <p className="text-sm mb-8" style={{ color: 'rgba(255,255,255,0.4)' }}>Last updated: March 2026</p>
        <div className="rounded-2xl p-8 space-y-6 leading-relaxed border" style={{ background: '#111928', borderColor: 'rgba(0,200,255,0.15)', color: 'rgba(255,255,255,0.65)' }}>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">No Refund After Project Start</h2>
            <p>All payments made for web development and tech services are non-refundable once the project has been started. This includes advance payments and any milestone payments.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">Support & Resolution</h2>
            <p>In case of any issues with the delivered work, users can contact us for support and resolution. We are committed to ensuring client satisfaction within the agreed project scope.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">Exceptional Cases</h2>
            <p>Refunds may be considered only if ASLEN TECH SOLUTIONS is unable to deliver the agreed service. Each case will be reviewed individually.</p>
          </section>
          <section>
            <h2 className="text-lg font-bold text-white mb-2">Contact</h2>
            <p>For refund-related queries, contact us at <a href="mailto:sailendrakondapalli@gmail.com" className="text-[#00C8FF] hover:underline">sailendrakondapalli@gmail.com</a></p>
          </section>
        </div>
      </div>
    </div>
  )
}
