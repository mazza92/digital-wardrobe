import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Only warn in development if config is missing
if (import.meta.env.DEV && (!supabaseUrl || !supabaseAnonKey)) {
  console.warn('Supabase URL or Anon Key is missing. Please check your environment variables.')
}

// Prevent crash if params are missing (during build or misconfig)
const safeUrl = supabaseUrl || 'https://placeholder.supabase.co'
const safeKey = supabaseAnonKey || 'placeholder-key'

export const supabase = createClient(safeUrl, safeKey)
