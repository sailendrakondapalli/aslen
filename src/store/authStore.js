import { create } from 'zustand'
import { supabase } from '../lib/supabase'

export const useAuthStore = create((set) => ({
  user: null,
  loading: false, // start false so UI always renders

  signInWithGoogle: async () => {
    if (!supabase) throw new Error('Supabase not configured')
    const { error } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/dashboard` },
    })
    if (error) throw error
  },

  signOut: async () => {
    if (supabase) await supabase.auth.signOut()
    set({ user: null })
  },

  initialize: () => {
    if (!supabase) return

    // Get current session without blocking render
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        set({ user: session.user })
        syncUserToDb(session.user)
      }
    }).catch(() => {})

    // Listen for auth changes
    supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        set({ user: session.user })
        syncUserToDb(session.user)
      } else {
        set({ user: null })
      }
    })
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
