import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL
const key = import.meta.env.VITE_SUPABASE_ANON_KEY

// Only create client if we have valid-looking credentials
export const supabase = (url && key && url.startsWith('http'))
  ? createClient(url, key)
  : null

export const isSupabaseReady = !!supabase
