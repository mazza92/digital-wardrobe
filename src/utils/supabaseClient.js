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

// Use window.localStorage directly - it's been replaced with hybrid storage in index.html
// that handles native vs memory fallback automatically
console.log('Supabase client using window.localStorage (hybrid storage from index.html)');

export const supabase = createClient(safeUrl, safeKey, {
  auth: {
    storage: window.localStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Safe wrapper for getSession that suppresses storage errors
export const safeGetSession = async () => {
  try {
    const result = await supabase.auth.getSession();
    return result;
  } catch (error) {
    // Suppress storage-related errors
    const msg = error?.message || '';
    if (msg.includes('storage') ||
        msg.includes('Storage') ||
        msg.includes('Access to storage')) {
      console.log('[safeGetSession] Storage blocked, using null session');
      return { data: { session: null }, error: null };
    }
    throw error;
  }
}
