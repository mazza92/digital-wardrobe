import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

const safeUrl = supabaseUrl || 'https://placeholder.supabase.co'
const safeKey = supabaseAnonKey || 'placeholder-key'

export const supabase = createClient(safeUrl, safeKey, {
  auth: {
    storage: window.localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

export const safeGetSession = async () => {
  try {
    const result = await supabase.auth.getSession();
    return result;
  } catch (error) {
    const msg = error?.message || '';
    if (msg.includes('storage') ||
        msg.includes('Storage') ||
        msg.includes('Access to storage')) {
      return { data: { session: null }, error: null };
    }
    throw error;
  }
}
