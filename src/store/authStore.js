import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set) => ({
  user: null,
  loading: true,

  signInWithGoogle: async () => {
    if (!supabase) throw new Error('Supabase not configured')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard`, skipBrowserRedirect: false },
    })
    if (error) throw error
  },

  signOut: async () => {
    if (supabase) await supabase.auth.signOut()
    set({ user: null })
  },

  initialize: () => {
    if (!supabase) {
      set({ loading: false })
      return
    }

    // Immediately resolve existing session so UI doesn't wait
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        set({ user: session.user, loading: false })
        syncUserToDb(session.user)
      } else {
        set({ user: null, loading: false })
      }
    })

    // Also listen for real-time auth changes (login, logout, token refresh)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        set({ user: session.user, loading: false })
        syncUserToDb(session.user)
      } else {
        set({ user: null, loading: false })
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
