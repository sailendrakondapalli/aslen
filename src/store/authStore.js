import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set) => ({
  user: null,
  loading: true, // true until session is resolved

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

    // onAuthStateChange fires immediately with the current session,
    // including when Google redirects back with a token in the URL.
    // This is the single source of truth — no need for getSession separately.
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
