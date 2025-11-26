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

// Check if localStorage is available
const isLocalStorageAvailable = () => {
  try {
    const test = '__supabase_storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

// Custom storage that falls back to memory when localStorage is blocked
const memoryStorage = {
  storage: {},
  getItem: (key) => memoryStorage.storage[key] || null,
  setItem: (key, value) => { memoryStorage.storage[key] = value },
  removeItem: (key) => { delete memoryStorage.storage[key] }
}

// Use localStorage if available, otherwise use memory storage
const customStorage = isLocalStorageAvailable() ? localStorage : memoryStorage

export const supabase = createClient(safeUrl, safeKey, {
  auth: {
    storage: customStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true
  }
})
