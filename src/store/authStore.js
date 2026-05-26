import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const USER_CACHE_KEY = 'aslen_user'

const getCachedUser = () => {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch { return null }
}

const setCachedUser = (user) => {
  try {
    if (user) localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user))
    else localStorage.removeItem(USER_CACHE_KEY)
  } catch {}
}

export const useAuthStore = create((set, get) => ({
  user: getCachedUser(),
  loading: !getCachedUser(),

  // ── Google OAuth ──────────────────────────────────────────────────────────
  signInWithGoogle: async () => {
    if (!supabase) throw new Error('Supabase not configured')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
        skipBrowserRedirect: false,
      },
    })
    if (error) throw error
  },

  // ── Phone + Password signup ───────────────────────────────────────────────
  signUpWithPhone: async (phone, password, name) => {
    if (!supabase) throw new Error('Supabase not configured')
    const formatted = phone.startsWith('+') ? phone : `+91${phone}`
    const { data, error } = await supabase.auth.signUp({
      phone: formatted,
      password,
      options: { data: { full_name: name } },
    })
    if (error) throw error
    // Immediately save to users table after signup
    if (data?.user) {
      await supabase.from('users').upsert({
        id: data.user.id,
        phone: formatted,
        name,
        email: null,
        profile_url: '',
      }, { onConflict: 'id' })
    }
    return data
  },

  // ── Phone + Password login ────────────────────────────────────────────────
  signInWithPhone: async (phone, password) => {
    if (!supabase) throw new Error('Supabase not configured')
    const formatted = phone.startsWith('+') ? phone : `+91${phone}`
    const { data, error } = await supabase.auth.signInWithPassword({
      phone: formatted,
      password,
    })
    if (error) throw error
    return data
  },

  // ── Send OTP for phone verification / login ───────────────────────────────
  sendOTP: async (phone) => {
    if (!supabase) throw new Error('Supabase not configured')
    const formatted = phone.startsWith('+') ? phone : `+91${phone}`
    const { error } = await supabase.auth.signInWithOtp({ phone: formatted })
    if (error) throw error
  },

  // ── Verify OTP ────────────────────────────────────────────────────────────
  verifyOTP: async (phone, token) => {
    if (!supabase) throw new Error('Supabase not configured')
    const formatted = phone.startsWith('+') ? phone : `+91${phone}`
    const { data, error } = await supabase.auth.verifyOtp({
      phone: formatted,
      token,
      type: 'sms',
    })
    if (error) throw error
    // Return the user/session directly
    return data
  },

  // ── Forgot password (sends OTP to reset) ─────────────────────────────────
  sendForgotOTP: async (phone) => {
    if (!supabase) throw new Error('Supabase not configured')
    const formatted = phone.startsWith('+') ? phone : `+91${phone}`
    const { error } = await supabase.auth.signInWithOtp({ phone: formatted })
    if (error) throw error
  },

  // ── Reset password after OTP verified ────────────────────────────────────
  resetPassword: async (newPassword) => {
    if (!supabase) throw new Error('Supabase not configured')
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) throw error
  },

  // ── Sign out ──────────────────────────────────────────────────────────────
  signOut: async () => {
    if (supabase) await supabase.auth.signOut()
    setCachedUser(null)
    set({ user: null, loading: false })
  },

  // ── Initialize auth listener ──────────────────────────────────────────────
  initialize: (navigate) => {
    if (!supabase) {
      set({ loading: false })
      return
    }

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user ?? null
      setCachedUser(user)
      set({ user, loading: false })
      if (user) syncUserToDb(user)

      if (event === 'SIGNED_IN' && navigate) {
        const isOAuthCallback = window.location.hash.includes('access_token') ||
          window.location.search.includes('code=')
        if (isOAuthCallback) navigate('/dashboard', { replace: true })
      }
    })
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null
      if (JSON.stringify(user) !== JSON.stringify(get().user)) {
        setCachedUser(user)
        set({ user, loading: false })
      } else {
        set({ loading: false })
      }
      if (user) syncUserToDb(user)
    })

    return () => subscription.unsubscribe()
  },
}))

function syncUserToDb(user) {
  if (!supabase) return
  const { id, email, phone, user_metadata } = user
  const payload = {
    id,
    name: user_metadata?.full_name || user_metadata?.name || '',
    profile_url: user_metadata?.avatar_url || '',
  }
  if (email) payload.email = email
  if (phone) payload.phone = phone

  supabase.from('users').upsert(payload, { onConflict: 'id' }).then(() => {})
}
