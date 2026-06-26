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

  const inp = "w-full rounded-xl px-4 py-3 text-sm text-white placeholder-white/30 outline-none transition-all"
  const inpStyle = { background: '#080E1C', border: '1px solid rgba(255,255,255,0.1)' }
  const otpInp = `${inp} text-center text-2xl tracking-widest font-bold`
  const btn = "w-full btn-primary py-3 rounded-xl font-semibold disabled:opacity-60 flex items-center justify-center gap-2"

  const OTPResend = () => (
    <div className="text-center">
      <button type="button" onClick={handleResendOTP} disabled={countdown > 0 || busy}
        className="text-sm font-medium text-[#00C8FF] hover:underline disabled:opacity-40">
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
    <div className="min-h-screen flex items-center justify-center px-4 py-10 relative" style={{ background: '#080E1C', fontFamily: 'Space Grotesk, sans-serif' }}>
      {/* Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,200,255,0.15) 0%, transparent 70%)', transform: 'translate(30%, -30%)' }} />
      <div className="absolute bottom-0 left-0 w-64 h-64 rounded-full pointer-events-none"
        style={{ background: 'radial-gradient(circle, rgba(0,98,255,0.12) 0%, transparent 70%)', transform: 'translate(-20%, 30%)' }} />

      <div className="rounded-3xl p-8 w-full max-w-md relative z-10 border" style={{ background: '#111928', borderColor: 'rgba(0,200,255,0.15)' }}>
        {/* Header */}
        <div className="text-center mb-7">
          <img src="/newlogo.png" alt="ASLEN" className="h-14 w-auto object-contain mx-auto mb-3" />
          <h1 className="text-2xl font-black text-white">{titles[mode]}</h1>
          <p className="text-sm mt-1" style={{ color: 'rgba(255,255,255,0.5)' }}>{subtitles[mode]}</p>
        </div>

        {/* LOGIN */}
        {mode === 'login' && (
          <form onSubmit={handleLoginSendOTP} className="space-y-4">
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.4)' }} />
              <span className="absolute left-9 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>+91</span>
              <input type="tel" placeholder="Mobile Number" value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className={`${inp} pl-16`} style={inpStyle} required />
            </div>
            <button type="submit" disabled={busy} className={btn}>
              {busy && <Loader2 size={16} className="animate-spin" />}
              {busy ? 'Sending OTP...' : 'Send OTP'}
            </button>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>or</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
            </div>
            <button type="button" onClick={handleGoogle} disabled={busy}
              className="w-full flex items-center justify-center gap-3 rounded-xl py-3 font-semibold text-white transition-all disabled:opacity-60"
              style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}>
              <GoogleIcon /> Continue with Google
            </button>
            <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Don't have an account?{' '}
              <button type="button" onClick={() => { setMode('register'); setOtp('') }}
                className="text-[#00C8FF] font-semibold hover:underline">Register</button>
            </p>
          </form>
        )}

        {mode === 'login-otp' && (
          <form onSubmit={handleLoginVerifyOTP} className="space-y-4">
            <div className="rounded-xl p-3 text-sm text-center font-medium"
              style={{ background: 'rgba(0,200,255,0.08)', color: '#00C8FF', border: '1px solid rgba(0,200,255,0.2)' }}>
              OTP sent to <strong>+91{phone}</strong>
            </div>
            <input type="text" placeholder="• • • • • •" value={otp} maxLength={6}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className={otpInp} style={inpStyle} required />
            <button type="submit" disabled={busy} className={btn}>
              {busy && <Loader2 size={16} className="animate-spin" />}
              {busy ? 'Verifying...' : 'Verify & Sign In'}
            </button>
            <OTPResend />
            <button type="button" onClick={() => { setMode('login'); setOtp('') }}
              className="flex items-center gap-1 text-sm mx-auto transition-colors hover:text-[#00C8FF]"
              style={{ color: 'rgba(255,255,255,0.5)' }}>
              <ArrowLeft size={14} /> Back
            </button>
          </form>
        )}

        {/* REGISTER */}
        {mode === 'register' && (
          <form onSubmit={handleRegisterSendOTP} className="space-y-4">
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.4)' }} />
              <input type="text" placeholder="Full Name" value={name}
                onChange={e => setName(e.target.value)}
                className={`${inp} pl-10`} style={inpStyle} required />
            </div>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(255,255,255,0.4)' }} />
              <span className="absolute left-9 top-1/2 -translate-y-1/2 text-sm font-medium" style={{ color: 'rgba(255,255,255,0.5)' }}>+91</span>
              <input type="tel" placeholder="Mobile Number" value={phone}
                onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                className={`${inp} pl-16`} style={inpStyle} required />
            </div>
            <button type="submit" disabled={busy} className={btn}>
              {busy && <Loader2 size={16} className="animate-spin" />}
              {busy ? 'Sending OTP...' : 'Send OTP'}
            </button>
            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
              <span className="text-xs" style={{ color: 'rgba(255,255,255,0.35)' }}>or</span>
              <div className="flex-1 h-px" style={{ background: 'rgba(255,255,255,0.1)' }} />
            </div>
            <button type="button" onClick={handleGoogle} disabled={busy}
              className="w-full flex items-center justify-center gap-3 rounded-xl py-3 font-semibold text-white transition-all disabled:opacity-60"
              style={{ border: '1px solid rgba(255,255,255,0.12)', background: 'rgba(255,255,255,0.04)' }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,0.08)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,0.04)'}>
              <GoogleIcon /> Continue with Google
            </button>
            <p className="text-center text-sm" style={{ color: 'rgba(255,255,255,0.5)' }}>
              Already have an account?{' '}
              <button type="button" onClick={() => { setMode('login'); setOtp('') }}
                className="text-[#00C8FF] font-semibold hover:underline">Sign In</button>
            </p>
          </form>
        )}

        {/* REGISTER OTP */}
        {mode === 'register-otp' && (
          <form onSubmit={handleRegisterVerifyOTP} className="space-y-4">
            <div className="rounded-xl p-3 text-sm text-center font-medium"
              style={{ background: 'rgba(0,200,255,0.08)', color: '#00C8FF', border: '1px solid rgba(0,200,255,0.2)' }}>
              OTP sent to <strong>+91{phone}</strong>
            </div>
            <input type="text" placeholder="• • • • • •" value={otp} maxLength={6}
              onChange={e => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className={otpInp} style={inpStyle} required />
            <button type="submit" disabled={busy} className={btn}>
              {busy && <Loader2 size={16} className="animate-spin" />}
              {busy ? 'Creating account...' : 'Verify & Create Account'}
            </button>
            <OTPResend />
            <button type="button" onClick={() => { setMode('register'); setOtp('') }}
              className="flex items-center gap-1 text-sm mx-auto transition-colors hover:text-[#00C8FF]"
              style={{ color: 'rgba(255,255,255,0.5)' }}>
              <ArrowLeft size={14} /> Back
            </button>
          </form>
        )}

        {!isSupabaseReady && (
          <div className="mt-4 rounded-xl p-3 text-xs" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
            Supabase not configured. Update VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY in .env
          </div>
        )}
        <p className="text-center text-xs mt-5" style={{ color: 'rgba(255,255,255,0.3)' }}>
          By signing in, you agree to our Terms of Service and Privacy Policy.
        </p>
      </div>
    </div>
  )
}
