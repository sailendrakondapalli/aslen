import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Phone, User, ArrowLeft, Loader2 } from 'lucide-react'
import { useAuthStore } from '../store/authStore'
import { isSupabaseReady, supabase } from '../lib/supabase'
import toast from 'react-hot-toast'

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
  </svg>
)

export default function Login() {
  const { user, signInWithGoogle, sendOTP, verifyOTP } = useAuthStore()
  const navigate = useNavigate()

  const [mode, setMode] = useState('login')
  const [busy, setBusy] = useState(false)
  const [countdown, setCountdown] = useState(0)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [otp, setOtp] = useState('')

  useEffect(() => { if (user) navigate('/dashboard') }, [user])
  useEffect(() => {
    if (countdown <= 0) return
    const t = setTimeout(() => setCountdown(c => c - 1), 1000)
    return () => clearTimeout(t)
  }, [countdown])

  const startCountdown = () => setCountdown(30)

  const handleGoogle = async () => {
    if (!isSupabaseReady) { toast.error('Supabase not configured'); return }
    setBusy(true)
    try { await signInWithGoogle() }
    catch (e) { toast.error(e.message || 'Sign in failed'); setBusy(false) }
  }

  const handleLoginSendOTP = async (e) => {
    e.preventDefault()
    if (!phone || phone.length < 10) { toast.error('Enter a valid 10-digit mobile number'); return }
    setBusy(true)
    try { await sendOTP(phone); toast.success('OTP sent to +91' + phone); setMode('login-otp'); startCountdown() }
    catch (e) { toast.error(e.message || 'Failed to send OTP') }
    finally { setBusy(false) }
  }

  const handleLoginVerifyOTP = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) { toast.error('Enter the 6-digit OTP'); return }
    setBusy(true)
    try { await verifyOTP(phone, otp); toast.success('Welcome back!'); navigate('/dashboard') }
    catch (e) { toast.error(e.message || 'Invalid OTP') }
    finally { setBusy(false) }
  }

  const handleRegisterSendOTP = async (e) => {
    e.preventDefault()
    if (!name.trim()) { toast.error('Enter your name'); return }
    if (!phone || phone.length < 10) { toast.error('Enter a valid 10-digit mobile number'); return }
    setBusy(true)
    try { await sendOTP(phone); toast.success('OTP sent to +91' + phone); setMode('register-otp'); startCountdown() }
    catch (e) { toast.error(e.message || 'Failed to send OTP') }
    finally { setBusy(false) }
  }

  const handleRegisterVerifyOTP = async (e) => {
    e.preventDefault()
    if (otp.length !== 6) { toast.error('Enter the 6-digit OTP'); return }
    setBusy(true)
    try {
      const data = await verifyOTP(phone, otp)
      const userId = data?.user?.id ?? data?.session?.user?.id
      if (!userId) { toast.error('Verification failed. Try again.'); setBusy(false); return }
      const formatted = phone.startsWith('+') ? phone : `+91${phone}`
      const { error: dbError } = await supabase.from('users').upsert({ id: userId, phone: formatted, name: name.trim(), profile_url: '' }, { onConflict: 'id' })
      if (dbError) console.error('DB save error:', dbError)
      toast.success('Account created! Welcome to ASLEN.')
      navigate('/dashboard')
    } catch (e) { toast.error(e.message || 'OTP verification failed') }
    finally { setBusy(false) }
  }

  const handleResendOTP = async () => {
    if (countdown > 0) return
    setBusy(true)
    try { await sendOTP(phone); toast.success('OTP resent!'); startCountdown() }
    catch (e) { toast.error(e.message || 'Failed to resend OTP') }
    finally { setBusy(false) }
  }

  const inp = "w-full border border-[#e2e8f0] rounded-xl px-4 py-3 text-sm text-[#1e293b] placeholder-[#94a3b8]"
  const otpInp = `${inp} text-center text-2xl tracking-widest font-bold`
  const btn = "w-full bg-[#222222] hover:bg-[#111111] text-white py-3 rounded-xl font-semibold transition-colors disabled:opacity-60 flex items-center justify-center gap-2"

  const OTPResend = () => (
    <div className="text-center">
      <button type="button" onClick={handleResendOTP} disabled={countdown > 0 || busy}
        className="text-sm font-medium text-[#222222] hover:underline disabled:text-[#94a3b8]">
        {countdown > 0 ? `Resend OTP in ${countdown}s` : 'Resend OTP'}
      </button>
    </div>
  )

  const titles = { login: 'Welcome Back', 'login-otp': 'Enter OTP', register: 'Create Account', 'register-otp': 'Verify Mobile' }
  const subtitles = {
    login: 'Sign in with your mobile number',
    'login-otp': `OTP sent to +91${phone}`,
    register: 'Join ASLEN TECH SOLUTIONS',
    'register-otp': `OTP sent to +91${phone}`,
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#222222] px-4 py-10" style={{ fontFamily: 'Poppins, sans-serif' }}>
      {/* Decorative circles */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full bg-white/5 -translate-y-1/3 translate-x-1/3 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full bg-white/5 translate-y-1/3 -translate-x-1/4 pointer-events-none" />

      <div className="bg-white rounded-3xl shadow-2xl p-8 w-full max-w-md relative z-10">
        {/* Header */}
        <div className="text-center mb-7">
          <div className="w-14 h-14 rounded-2xl bg-[#222222] flex items-center justify-center mx-auto mb-3">
            <img src="/logo.png" alt="A" className="w-10 h-10 rounded-xl object-cover" onError={e => { e.target.style.display='none'; e.target.nextSibling.style.display='block' }} />
            <span className="text-white font-black text-xl hidden">A</span>
          </div>
          <h1 className="text-2xl font-black text-[#1e293b]">{titles[mode]}</h1>
          <p className="text-[#64748b] text-sm mt-1">{subtitles[mode]}</p>
        </div>

        {/* LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSendOTP} className="space-y-4">
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
              <span className="absolute left-9 top-1/2 -translate-y-1/2 text-sm text-[#64748b] font-medium">+91</span>
              <input type="tel" placeholder="Mobile Number" value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className={`${inp} pl-16`} required />
            </div>
            <button type="submit" disabled={busy} className={btn}>
              {busy && <Loader2 size={16} className="animate-spin" />}
              {busy ? 'Sending OTP...' : 'Send OTP'}
            </button>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#e2e8f0]" />
              <span className="text-xs text-[#94a3b8]">or</span>
              <div className="flex-1 h-px bg-[#e2e8f0]" />
            </div>
            <button type="button" onClick={handleGoogle} disabled={busy}
              className="w-full flex items-center justify-center gap-3 border-2 border-[#e2e8f0] rounded-xl py-3 font-semibold text-[#1e293b] hover:bg-[#f5f5f5] transition-colors disabled:opacity-60">
              <GoogleIcon /> Continue with Google
            </button>
            <p className="text-center text-sm text-[#64748b]">
              Don't have an account?{' '}
              <button type="button" onClick={() => { setMode('register'); setOtp('') }}
                className="text-[#222222] font-semibold hover:underline">Register</button>
            </p>
          </form>
        )}

        {/* LOGIN OTP */}
        {mode === 'login-otp' && (
          <form onSubmit={handleLoginVerifyOTP} className="space-y-4">
            <div className="bg-[#f5f5f5] rounded-xl p-3 text-sm text-[#222222] text-center font-medium">
              OTP sent to <strong>+91{phone}</strong>
            </div>
            <input type="text" placeholder="• • • • • •" value={otp} maxLength={6}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className={otpInp} required />
            <button type="submit" disabled={busy} className={btn}>
              {busy && <Loader2 size={16} className="animate-spin" />}
              {busy ? 'Verifying...' : 'Verify & Sign In'}
            </button>
            <OTPResend />
            <button type="button" onClick={() => { setMode('login'); setOtp('') }}
              className="flex items-center gap-1 text-sm text-[#64748b] hover:text-[#1e293b] mx-auto">
              <ArrowLeft size={14} /> Back
            </button>
          </form>
        )}

        {/* REGISTER */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSendOTP} className="space-y-4">
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
              <input type="text" placeholder="Full Name" value={name}
                onChange={e => setName(e.target.value)}
                className={`${inp} pl-10`} required />
            </div>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" />
              <span className="absolute left-9 top-1/2 -translate-y-1/2 text-sm text-[#64748b] font-medium">+91</span>
              <input type="tel" placeholder="Mobile Number" value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className={`${inp} pl-16`} required />
            </div>
            <button type="submit" disabled={busy} className={btn}>
              {busy && <Loader2 size={16} className="animate-spin" />}
              {busy ? 'Sending OTP...' : 'Send OTP'}
            </button>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px bg-[#e2e8f0]" />
              <span className="text-xs text-[#94a3b8]">or</span>
              <div className="flex-1 h-px bg-[#e2e8f0]" />
            </div>
            <button type="button" onClick={handleGoogle} disabled={busy}
              className="w-full flex items-center justify-center gap-3 border-2 border-[#e2e8f0] rounded-xl py-3 font-semibold text-[#1e293b] hover:bg-[#f5f5f5] transition-colors disabled:opacity-60">
              <GoogleIcon /> Continue with Google
            </button>
            <p className="text-center text-sm text-[#64748b]">
              Already have an account?{' '}
              <button type="button" onClick={() => { setMode('login'); setOtp('') }}
                className="text-[#222222] font-semibold hover:underline">Sign In</button>
            </p>
          </form>
        )}

        {/* REGISTER OTP */}
        {mode === 'register-otp' && (
          <form onSubmit={handleRegisterVerifyOTP} className="space-y-4">
            <div className="bg-[#f5f5f5] rounded-xl p-3 text-sm text-[#222222] text-center font-medium">
              OTP sent to <strong>+91{phone}</strong>
            </div>
            <input type="text" placeholder="• • • • • •" value={otp} maxLength={6}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className={otpInp} required />
            <button type="submit" disabled={busy} className={btn}>
              {busy && <Loader2 size={16} className="animate-spin" />}
              {busy ? 'Creating account...' : 'Verify & Create Account'}
            </button>
            <OTPResend />
            <button type="button" onClick={() => { setMode('register'); setOtp('') }}
              className="flex items-center gap-1 text-sm text-[#64748b] hover:text-[#1e293b] mx-auto">
              <ArrowLeft size={14} /> Back
            </button>
          </form>
        )}

        {!isSupabaseReady && (
          <div className="mt-4 bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-600">
            Supabase not configured. Update VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
          </div>
        )}
        <p className="text-center text-xs text-[#94a3b8] mt-5">
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
