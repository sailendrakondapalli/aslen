import { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User } from 'lucide-react'

const OR_KEY = import.meta.env.VITE_OPENROUTER_API_KEY

const SYSTEM_CONTEXT = 'You are ASLEN AI, the helpful assistant for ASLEN TECH SOLUTIONS, a digital agency in India. ' +
  'Company: aslen.in | WhatsApp: +91 8019733766 | Email: sailendrakondapalli@gmail.com. ' +
  'Founders: Sailendra Kondapalli (CEO) & Aswani Adduri (Co-Founder). ' +
  'Services & Pricing: Static Website Rs.3,999 (advance Rs.500), Dynamic Website Rs.9,999 (advance Rs.1,000), ' +
  'Mobile App Rs.30,000 (advance Rs.3,000), UI/UX Design Rs.2,999 (advance Rs.500), ' +
  'Logo Design Rs.599 (advance Rs.99), Business Card Rs.799 (advance Rs.99), ' +
  'Template Design Rs.399 (advance Rs.11), Google Business Profile Rs.1,799 (advance Rs.499), Custom Tech Solutions at custom pricing. ' +
  'How to book: Visit aslen.in, choose service, sign in via Google or mobile OTP, pay advance online (UPI/card/net banking/EMI). ' +
  'Policies: Advance required to start. Cancellation only within 24 hours before project starts. Refund only if ASLEN cannot deliver. ' +
  'Be friendly, helpful, and concise. Keep replies under 120 words.'

const QUICK_REPLIES = ['What services do you offer?', 'Website pricing?', 'How do I book?', 'Contact details']

var OR_MODELS = [
  'openai/gpt-3.5-turbo',
  'openai/gpt-4o-mini',
  'anthropic/claude-3-haiku',
  'meta-llama/llama-3.2-3b-instruct:free',
]

async function callOpenRouter(chatHistory) {
  if (!OR_KEY) return null
  var messages = [{ role: 'system', content: SYSTEM_CONTEXT }].concat(
    chatHistory.map(function(m) {
      return { role: m.role === 'assistant' ? 'assistant' : 'user', content: m.content }
    })
  )
  for (var i = 0; i < OR_MODELS.length; i++) {
    try {
      var res = await fetch('https://openrouter.ai/api/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': 'Bearer ' + OR_KEY,
          'Content-Type': 'application/json',
          'HTTP-Referer': 'https://aslen.in',
          'X-Title': 'ASLEN TECH SOLUTIONS',
        },
        body: JSON.stringify({
          model: OR_MODELS[i],
          messages: messages,
          max_tokens: 300,
          temperature: 0.7,
        }),
      })
      var data = await res.json()
      console.log('OR ' + OR_MODELS[i] + ':', res.status, data.error ? data.error.message : 'ok')
      if (res.ok && data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content) {
        return data.choices[0].message.content
      }
    } catch (e) { console.error('OR error:', e.message) }
  }
  return null
}

function getRuleBasedReply(text) {
  var q = text.toLowerCase()
  if (q.match(/service|offer|what do|what can/))
    return 'We offer 8 services:\n\u2022 Static Website \u2014 Rs.3,999\n\u2022 Dynamic Website \u2014 Rs.9,999\n\u2022 Mobile App \u2014 Rs.30,000\n\u2022 UI/UX Design \u2014 Rs.2,999\n\u2022 Logo Design \u2014 Rs.599\n\u2022 Business Card \u2014 Rs.799\n\u2022 Template Design \u2014 Rs.399\n\u2022 Google Business Profile \u2014 Rs.1,799\n\nVisit aslen.in to explore & book!'
  if (q.match(/website|static|dynamic/))
    return 'Website packages:\n\nStatic \u2014 Rs.3,999 (Rs.500 advance)\nDomain + Hosting 1yr, 5 pages, mobile responsive\n\nDynamic \u2014 Rs.9,999 (Rs.1,000 advance)\nAdmin panel, database, 5 pages\n\nBook at aslen.in!'
  if (q.match(/price|cost|how much|rate/))
    return 'Our pricing:\n\u2022 Static Website \u2014 Rs.3,999\n\u2022 Dynamic Website \u2014 Rs.9,999\n\u2022 Mobile App \u2014 Rs.30,000\n\u2022 UI/UX Design \u2014 Rs.2,999\n\u2022 Logo \u2014 Rs.599\n\u2022 Google Business Profile \u2014 Rs.1,799\n\nWhatsApp: +91 8019733766'
  if (q.match(/book|order|start|hire|get started/))
    return 'Booking steps:\n1. Visit aslen.in\n2. Click Explore on any service\n3. Choose your package\n4. Sign in (Google/mobile OTP)\n5. Pay the advance online\n\nOr WhatsApp: +91 8019733766'
  if (q.match(/contact|phone|whatsapp|email|reach/))
    return 'Contact ASLEN TECH SOLUTIONS:\n\nWhatsApp: +91 8019733766\nEmail: sailendrakondapalli@gmail.com\nWebsite: aslen.in\n\nAvailable Mon\u2013Sat!'
  if (q.match(/ceo|founder|owner|who.*start|sailendra|aswani|team/))
    return 'ASLEN TECH SOLUTIONS founders:\n\n\u2022 Sailendra Kondapalli \u2014 Founder & CEO\n\u2022 Aswani Adduri \u2014 Co-Founder\n\nWe help businesses grow through technology. Visit aslen.in!'
  if (q.match(/app|mobile|android|ios/))
    return 'Mobile App Development \u2014 Rs.30,000 (Rs.3,000 advance)\n\n\u2022 iOS & Android\n\u2022 Custom UI/UX\n\u2022 Backend + push notifications\n\u2022 3 months support\n\nContact: +91 8019733766'
  if (q.match(/logo|brand/))
    return 'Logo Design \u2014 Rs.599 (Rs.99 advance)\n\u2022 3 unique concepts\n\u2022 Unlimited revisions\n\u2022 All formats (PNG, SVG, PDF)\n\u2022 Brand guidelines\n\nBook at aslen.in!'
  if (q.match(/google|gmb|maps/))
    return 'Google Business Profile Setup \u2014 Rs.1,799 (Rs.499 advance)\n\u2022 Profile creation & verification\n\u2022 Google Maps listing\n\u2022 SEO optimization\n\u2022 Photo uploads\n\nBook at aslen.in!'
  if (q.match(/refund|cancel|policy/))
    return 'Our policies:\n\u2022 Cancellation: Within 24 hours before project starts\n\u2022 Refund: Only if ASLEN cannot deliver\n\u2022 Advance: Required to initiate any project\n\nDetails at aslen.in'
  if (q.match(/hi|hello|hey|namaste/))
    return 'Hi! Welcome to ASLEN TECH SOLUTIONS! I\'m ASLEN AI.\n\nI can help with:\n\u2022 Service info & pricing\n\u2022 How to book\n\u2022 Contact details\n\nWhat can I help you with?'
  if (q.match(/thank|thanks|great|awesome/))
    return 'You\'re welcome! Feel free to ask anything.\n\nReady to start? Visit aslen.in or WhatsApp +91 8019733766!'
  if (q.match(/sorry|oops/))
    return 'No worries! How can I help you? Ask about our services, pricing, or booking!'
  return null
}

export default function ChatBot() {
  var [open, setOpen] = useState(false)
  var [messages, setMessages] = useState([
    { role: 'assistant', content: 'Hi! I\'m ASLEN AI \uD83D\uDC4B How can I help you today? Ask about our services, pricing, or how to get started!' }
  ])
  var [input, setInput] = useState('')
  var [loading, setLoading] = useState(false)
  var bottomRef = useRef(null)
  var inputRef = useRef(null)

  useEffect(function() {
    if (bottomRef.current) bottomRef.current.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading])

  useEffect(function() {
    if (open) setTimeout(function() { if (inputRef.current) inputRef.current.focus() }, 100)
  }, [open])

  async function sendMessage(text) {
    var userMsg = (text || input).trim()
    if (!userMsg || loading) return
    setInput('')
    var updated = messages.concat([{ role: 'user', content: userMsg }])
    setMessages(updated)
    setLoading(true)

    try {
      var ruleReply = getRuleBasedReply(userMsg)
      if (ruleReply) {
        setTimeout(function() {
          setMessages(function(prev) { return prev.concat([{ role: 'assistant', content: ruleReply }]) })
          setLoading(false)
        }, 350)
        return
      }
      var aiReply = await callOpenRouter(updated)
      var reply = aiReply || 'For detailed help:\nWhatsApp: +91 8019733766\nEmail: sailendrakondapalli@gmail.com\nWebsite: aslen.in'
      setMessages(function(prev) { return prev.concat([{ role: 'assistant', content: reply }]) })
    } catch (err) {
      console.error('ChatBot error:', err.message)
      setMessages(function(prev) { return prev.concat([{ role: 'assistant', content: 'WhatsApp us: +91 8019733766\nEmail: sailendrakondapalli@gmail.com' }]) })
    } finally {
      setLoading(false)
    }
  }

  function handleKey(e) {
    if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage() }
  }

  return (
    <>
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 flex flex-col rounded-2xl shadow-2xl overflow-hidden"
          style={{ maxHeight: '70vh', fontFamily: 'Poppins, sans-serif', background: '#fff', border: '1px solid #e2e8f0' }}>

          <div className="flex items-center justify-between px-4 py-3 shrink-0" style={{ background: '#0B1B40' }}>
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-[#3B72C8] flex items-center justify-center">
                <Bot size={16} className="text-white" />
              </div>
              <div>
                <p className="text-white font-bold text-sm">ASLEN AI</p>
                <div className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400" />
                  <p className="text-white/50 text-xs">AI Assistant</p>
                </div>
              </div>
            </div>
            <button onClick={function() { setOpen(false) }} className="text-white/60 hover:text-white p-1 transition-colors">
              <X size={18} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3 min-h-0" style={{ background: '#f9f9f9' }}>
            {messages.map(function(m, i) {
              return (
                <div key={i} className={'flex gap-2 ' + (m.role === 'user' ? 'justify-end' : 'justify-start')}>
                  {m.role === 'assistant' && (
                    <div className="w-7 h-7 rounded-full bg-[#0B1B40] flex items-center justify-center shrink-0 mt-0.5">
                      <Bot size={13} className="text-white" />
                    </div>
                  )}
                  <div className={'max-w-[80%] px-3 py-2 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap ' +
                    (m.role === 'user' ? 'bg-[#0B1B40] text-white rounded-tr-sm' : 'bg-white text-[#1e293b] rounded-tl-sm border border-[#d0daf5]')}>
                    {m.content}
                  </div>
                  {m.role === 'user' && (
                    <div className="w-7 h-7 rounded-full bg-[#e2e8f0] flex items-center justify-center shrink-0 mt-0.5">
                      <User size={13} className="text-[#64748b]" />
                    </div>
                  )}
                </div>
              )
            })}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-7 h-7 rounded-full bg-[#0B1B40] flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={13} className="text-white" />
                </div>
                <div className="bg-white border border-[#d0daf5] rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B1B40] animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B1B40] animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B1B40] animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {messages.length === 1 && !loading && (
            <div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0" style={{ background: '#f9f9f9' }}>
              {QUICK_REPLIES.map(function(q) {
                return (
                  <button key={q} onClick={function() { sendMessage(q) }}
                    className="text-xs px-3 py-1.5 rounded-full border border-[#d0daf5] bg-white text-[#0B1B40] hover:bg-[#0B1B40] hover:text-white transition-colors">
                    {q}
                  </button>
                )
              })}
            </div>
          )}

          <div className="flex items-center gap-2 px-3 py-3 border-t border-[#e2e8f0] bg-white shrink-0">
            <input ref={inputRef} value={input}
              onChange={function(e) { setInput(e.target.value) }} onKeyDown={handleKey}
              placeholder="Ask me anything..."
              className="flex-1 text-sm border border-[#e2e8f0] rounded-xl px-3 py-2 text-[#1e293b] placeholder-[#94a3b8] outline-none"
              disabled={loading} />
            <button onClick={function() { sendMessage() }} disabled={!input.trim() || loading}
              className="w-9 h-9 rounded-xl bg-[#0B1B40] hover:bg-[#060e22] text-white flex items-center justify-center transition-colors disabled:opacity-40 shrink-0">
              <Send size={15} />
            </button>
          </div>
        </div>
      )}

      <button onClick={function() { setOpen(function(o) { return !o }) }}
        className="fixed bottom-5 right-4 sm:right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all hover:scale-110"
        style={{ background: '#0B1B40' }} aria-label="Chat with ASLEN AI">
        {open ? <X size={22} className="text-white" /> : <MessageCircle size={22} className="text-white" />}
        {!open && <span className="absolute top-0 right-0 w-3.5 h-3.5 bg-[#3B72C8] rounded-full border-2 border-white" />}
      </button>
    </>
  )
}
