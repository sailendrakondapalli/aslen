import { create } from 'zustand'
import { supabase } from '../lib/supabase'

const USER_CACHE_KEY = 'aslen_user'

const getCachedUser = () => {
  try {
    const raw = localStorage.getItem(USER_CACHE_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

const setCachedUser = (user) => {
  try {
    if (user) localStorage.setItem(USER_CACHE_KEY, JSON.stringify(user))
    else localStorage.removeItem(USER_CACHE_KEY)
  } catch {}
}

export const useAuthStore = create((set) => ({
  user: getCachedUser(),
  loading: true,

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
    set({ user: null })
  },

  initialize: () => {
    if (!supabase) {
      set({ loading: false })
      return
    }

    // Resolve session immediately on load
    supabase.auth.getSession().then(({ data: { session } }) => {
      const user = session?.user ?? null
      setCachedUser(user)
      set({ user, loading: false })
      if (user) syncUserToDb(user)
    })

    // Listen for ALL auth events
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      const user = session?.user ?? null
      setCachedUser(user)
      set({ user, loading: false })
      if (user) syncUserToDb(user)

      // After Google OAuth redirect, Supabase fires SIGNED_IN
      // Force a hard reload so the app re-hydrates cleanly with the new session
      if (event === 'SIGNED_IN') {
        // Small delay to let Supabase finish writing the session to localStorage
        setTimeout(() => {
          // Only reload if we're on the callback/dashboard route (not already reloaded)
          if (!window.__aslen_auth_reloaded) {
            window.__aslen_auth_reloaded = true
            window.location.replace('/dashboard')
          }
        }, 100)
      }

      if (event === 'SIGNED_OUT') {
        window.__aslen_auth_reloaded = false
      }
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
