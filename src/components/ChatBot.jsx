import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react'

const API_KEY = import.meta.env.VITE_OPENROUTER_API_KEY

const SYSTEM_PROMPT = `You are ASLEN AI, the friendly assistant for ASLEN TECH SOLUTIONS — a digital agency based in India founded by Sailendra Kondapalli and Aswani Adduri.

ABOUT THE COMPANY:
- Website: https://aslen.in
- Email: sailendrakondapalli@gmail.com
- Phone/WhatsApp: +91 8143724405
- Services: Web Development, App Development, UI/UX Design, Logo Design, Template Design, Google Business Profile Setup, Business Card Design, Custom Tech Solutions

PRICING:
- Static Website: ₹3,999 (advance ₹500) — domain + hosting 1 year, 5 pages, mobile responsive
- Dynamic Website: ₹9,999 (advance ₹1,000) — admin panel, database, 5 pages
- Mobile App (iOS + Android): ₹30,000 (advance ₹3,000)
- UI/UX Design: ₹2,999 (advance ₹500)
- Logo Design: ₹599 (advance ₹99)
- Business Card Design: ₹799 (advance ₹99)
- Template Design: ₹399 (advance ₹11)
- Google Business Profile Setup: ₹1,799 (advance ₹499)
- Custom Tech Solutions: Custom pricing via WhatsApp

POLICIES:
- Advance payment required to start any project
- Cancellation allowed only before project starts (within 24 hours)
- Refunds only if ASLEN cannot deliver the service
- Post-delivery support included

BOOKING:
- Users can sign in with Google or mobile OTP on the website
- Book services directly by choosing a package and paying the advance online

Keep responses concise, helpful, and friendly. If asked something outside the business scope, politely redirect to what you know. Always encourage users to contact via WhatsApp or book on the website.`

const QUICK_REPLIES = [
  'What services do you offer?',
  'How much does a website cost?',
  'How do I book a service?',
  'Contact details',
]

export default function ChatBot() {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m ASLEN AI 👋 How can I help you today? I can answer questions about our services, pricing, and how to get started.' }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)
  const inputRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 100)
  }, [open])

  const sendMessage = async (text) => {
    const userMsg = text || input.trim()
    if (!userMsg || loading) return
    setInput('')

    const updated = [...messages, { role: 'user', content: userMsg }]
    setMessages(updated)
    setLoading(true)

    try {
      const res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${API_KEY}`,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://aslen.in',
          'X-Title': 'ASLEN TECH SOLUTIONS',
        },
        body: JSON.stringify({
          model: 'meta-llama/llama-3.1-8b-instruct:free',
          messages: [
            { role: 'system', content: SYSTEM_PROMPT },
            ...updated.map(m => ({ role: m.role, content: m.content }))
          ],
          max_tokens: 400,
          temperature: 0.7,
        }),
      })

      const data = await res.json()
      const reply = data?.choices?.[0]?.message?.content || 'Sorry, I couldn\'t get a response. Please try again or contact us on WhatsApp.'
      setMessages(prev => [...prev, { role: 'assistant', content: reply }])
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Something went wrong. Please contact us at +91 8143724405 on WhatsApp.' }])
    } finally {
      setLoading(false)
    }
  }

  const handleKey = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <>
      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 flex flex-col rounded-2xl shadow-2xl overflow-hidden"
          style={{ maxHeight: '70vh', fontFamily: 'Poppins, sans-serif', background: '#fff', border: '1px solid #e2e8f0' }}>

          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3" style={{ background: '#222222' }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#f59e0b] flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">ASLEN AI</p>
                <p className="text-white/50 text-xs">Always here to help</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} className="text-white/60 hover:text-white transition-colors p-1">
              <X size={18} />
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ background: '#f9f9f9', minHeight: 0 }}>
            {messages.map((m, i) => (
              <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'assistant' && (
                  <div className="w-7 h-7 rounded-full bg-[#222222] flex items-center justify-center shrink-0 mt-0.5">
                    <Bot size={13} className="text-white" />
                  </div>
                )}
                <div className={`max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-[#222222] text-white rounded-tr-sm'
                    : 'bg-white text-[#1e293b] rounded-tl-sm border border-[#e2e8f0]'
                }`}>
                  {m.content}
                </div>
                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-[#e2e8f0] flex items-center justify-center shrink-0 mt-0.5">
                    <User size={13} className="text-[#64748b]" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-[#222222] flex items-center justify-center shrink-0">
                  <Bot size={13} className="text-white" />
                </div>
                <div className="bg-white border border-[#e2e8f0] rounded-2xl rounded-tl-sm px-4 py-3">
                  <Loader2 size={14} className="animate-spin text-[#222222]" />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Quick replies — only show if first message */}
          {messages.length === 1 && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5" style={{ background: '#f9f9f9' }}>
              {QUICK_REPLIES.map(q => (
                <button key={q} onClick={() => sendMessage(q)}
                  className="text-xs px-3 py-1.5 rounded-full border border-[#e2e8f0] bg-white text-[#222222] hover:bg-[#222222] hover:text-white hover:border-[#222222] transition-colors">
                  {q}
                </button>
              ))}
            </div>
          )}

          {/* Input */}
          <div className="flex items-center gap-2 px-3 py-3 border-t border-[#e2e8f0] bg-white">
            <input
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask me anything..."
              className="flex-1 text-sm border border-[#e2e8f0] rounded-xl px-3 py-2 text-[#1e293b] placeholder-[#94a3b8] outline-none"
              disabled={loading}
            />
            <button onClick={() => sendMessage()} disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-[#222222] hover:bg-[#111111] text-white flex items-center justify-center transition-colors disabled:opacity-40 shrink-0">
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      {/* FAB toggle button */}
      <button
        onClick={() => setOpen(o => !o)}
        className="fixed bottom-5 right-4 sm:right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110"
        style={{ background: '#222222' }}
        aria-label="Open chat">
        {open
          ? <X size={22} className="text-white" />
          : <MessageCircle size={22} className="text-white" />
        }
        {/* Notification dot */}
        {!open && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-[#f59e0b] rounded-full border-2 border-white" />
        )}
      </button>
    </>
  )
}
