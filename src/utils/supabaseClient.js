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

// Custom storage that falls back to memory when localStorage is blocked
const memoryStorage = {
  storage: {},
  getItem: (key) => {
    return memoryStorage.storage[key] || null
  },
  setItem: (key, value) => {
    memoryStorage.storage[key] = value
  },
  removeItem: (key) => {
    delete memoryStorage.storage[key]
  }
}

// Check if localStorage is available (synchronously at module load)
let customStorage = memoryStorage
try {
  const test = '__supabase_storage_test__'
  localStorage.setItem(test, test)
  localStorage.removeItem(test)
  customStorage = localStorage
} catch (e) {
  // localStorage blocked, will use memory storage
  console.log('localStorage not available, using memory storage for auth')
}

export const supabase = createClient(safeUrl, safeKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})

// Safe wrapper for getSession that suppresses storage errors
export const safeGetSession = async () => {
  try {
    const result = await supabase.auth.getSession()
    return result
  } catch (error) {
    // Suppress storage-related errors
    const msg = error?.message || ''
    if (msg.includes('storage') || msg.includes('Storage') || msg.includes('Access to storage')) {
      console.log('Storage access blocked, using memory session')
      return { data: { session: null }, error: null }
    }
    throw error
  }
}
