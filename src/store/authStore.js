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
  loading: !getCachedUser(), // skip loading spinner if we have cached user

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

  signOut: async () => {
    if (supabase) await supabase.auth.signOut()
    setCachedUser(null)
    set({ user: null, loading: false })
  },

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

      // On fresh OAuth login, redirect to dashboard
      if (event === 'SIGNED_IN' && navigate) {
        const isOAuthCallback = window.location.hash.includes('access_token') ||
          window.location.search.includes('code=')
        if (isOAuthCallback) {
          navigate('/dashboard', { replace: true })
        }
      }
    })

    // Also resolve session on load for non-OAuth page loads
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null
      // Only update if different from cache to avoid flicker
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
  const { id, email, user_metadata } = user
  supabase.from('users').upsert({
    id,
    email,
    name: user_metadata?.full_name || user_metadata?.name || '',
    profile_url: user_metadata?.avatar_url || '',
  }, { onConflict: 'id' }).catch(() => {})
}
