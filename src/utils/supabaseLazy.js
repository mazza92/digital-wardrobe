// Lazy Supabase loader - only loads the SDK when auth is actually needed
// This saves ~174KB (45KB gzip) on initial load for anonymous visitors

let supabaseModule = null
let supabaseClient = null
let loadPromise = null

// Check if user might have an active session (quick localStorage check - no SDK needed)
export const mightHaveSession = () => {
  try {
    // Supabase stores auth tokens with this key pattern
    const keys = Object.keys(localStorage)
    return keys.some(key =>
      key.startsWith('sb-') && key.includes('-auth-token')
    )
  } catch {
    return false
  }
}

// Lazy load the Supabase client
export const getSupabase = async () => {
  if (supabaseClient) return supabaseClient

  if (!loadPromise) {
    loadPromise = (async () => {
      const { createClient } = await import('@supabase/supabase-js')

      const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
      const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

      const safeUrl = supabaseUrl || 'https://placeholder.supabase.co'
      const safeKey = supabaseAnonKey || 'placeholder-key'

      supabaseClient = createClient(safeUrl, safeKey, {
        auth: {
          storage: window.localStorage,
          autoRefreshToken: true,
          persistSession: true,
          detectSessionInUrl: true
        }
      })

      return supabaseClient
    })()
  }

  return loadPromise
}

// Safe wrapper for getSession that loads Supabase lazily
export const safeGetSessionLazy = async () => {
  try {
    const supabase = await getSupabase()
    const result = await supabase.auth.getSession()
    return result
  } catch (error) {
    const msg = error?.message || ''
    if (msg.includes('storage') || msg.includes('Storage') || msg.includes('Access to storage')) {
      console.log('[safeGetSessionLazy] Storage blocked, using null session')
      return { data: { session: null }, error: null }
    }
    throw error
  }
}

// Lazy API functions that only load Supabase when called
export const lazyLogin = async (email, password) => {
  const supabase = await getSupabase()
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error

  // Fetch profile
  const profile = await lazyGetProfile(data.user.id)
  return {
    user: { ...data.user, ...profile },
    session: data.session
  }
}

export const lazySignup = async (name, email, password, marketingOptIn = false) => {
  const supabase = await getSupabase()
  const redirectUrl = `${window.location.origin}/auth/callback`

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { name, marketing_opt_in: marketingOptIn },
      emailRedirectTo: redirectUrl
    }
  })

  if (error) throw error

  if (data.user) {
    await supabase.from('user_profiles').upsert({
      id: data.user.id,
      email,
      name,
      marketing_opt_in: marketingOptIn,
      preferences: {},
      updated_at: new Date()
    })
  }

  return { user: data.user, session: data.session }
}

export const lazyLogout = async () => {
  const supabase = await getSupabase()
  const { error } = await supabase.auth.signOut()
  if (error) throw error
  return { success: true }
}

export const lazyRequestPasswordReset = async (email) => {
  const supabase = await getSupabase()
  const configuredFrontendUrl = import.meta.env.VITE_FRONTEND_URL
  const fallbackFrontendUrl = import.meta.env.DEV ? window.location.origin : 'https://emmanuellek.com'
  const frontendUrl = (configuredFrontendUrl || fallbackFrontendUrl).replace(/\/$/, '')
  const redirectUrl = `${frontendUrl}/auth/reset-password`

  const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo: redirectUrl })
  if (error) throw error
  return { success: true }
}

export const lazyGetCurrentUser = async () => {
  const { data: { session }, error } = await safeGetSessionLazy()
  if (error) throw error
  if (!session) return null

  const profile = await lazyGetProfile(session.user.id)
  return { ...session.user, ...profile }
}

export const lazyGetProfile = async (userId) => {
  const supabase = await getSupabase()
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error && error.code !== '42501' && !error.message?.includes('row-level security')) {
    console.error('Error fetching profile:', error)
  }

  return data || {}
}

// Storage helpers (don't need Supabase)
let pendingPreferencesMemory = {}
const PENDING_PREFERENCES_KEY = 'wardrobe_pending_preferences'

const isStorageAvailable = () => {
  try {
    const test = '__storage_test__'
    localStorage.setItem(test, test)
    localStorage.removeItem(test)
    return true
  } catch {
    return false
  }
}

export const savePendingPreferences = (preferences) => {
  const merged = { ...pendingPreferencesMemory, ...preferences }
  pendingPreferencesMemory = merged

  if (isStorageAvailable()) {
    try {
      const existing = JSON.parse(localStorage.getItem(PENDING_PREFERENCES_KEY) || '{}')
      localStorage.setItem(PENDING_PREFERENCES_KEY, JSON.stringify({ ...existing, ...merged }))
    } catch {}
  }

  return { success: true, preferences: merged }
}

export const getPendingPreferences = () => {
  let prefs = { ...pendingPreferencesMemory }
  if (isStorageAvailable()) {
    try {
      const stored = JSON.parse(localStorage.getItem(PENDING_PREFERENCES_KEY) || '{}')
      prefs = { ...stored, ...prefs }
    } catch {}
  }
  return prefs
}

export const clearPendingPreferences = () => {
  pendingPreferencesMemory = {}
  if (isStorageAvailable()) {
    try { localStorage.removeItem(PENDING_PREFERENCES_KEY) } catch {}
  }
}

export const lazyUpdatePreferences = async (userId, preferences) => {
  savePendingPreferences(preferences)

  if (!userId) {
    return { success: true, preferences, savedLocally: true }
  }

  try {
    const supabase = await getSupabase()

    let currentProfile = null
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('preferences, email, marketing_opt_in')
        .eq('id', userId)
        .maybeSingle()
      currentProfile = data
    } catch {}

    const pendingPrefs = getPendingPreferences()
    const newPreferences = {
      ...(currentProfile?.preferences || {}),
      ...pendingPrefs,
      ...preferences
    }

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: userId,
        email: currentProfile?.email || null,
        marketing_opt_in: currentProfile?.marketing_opt_in ?? false,
        preferences: newPreferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      return { success: true, preferences: newPreferences, savedLocally: true, error: error.message }
    }

    clearPendingPreferences()
    return { success: true, user: data, savedToDb: true }
  } catch (err) {
    return { success: true, preferences, savedLocally: true, error: err.message }
  }
}

// Subscribe to auth changes (loads Supabase if needed)
export const onAuthStateChange = async (callback) => {
  const supabase = await getSupabase()
  return supabase.auth.onAuthStateChange(callback)
}

// ============================================================================
// FAVORITES API (lazy loaded)
// ============================================================================

export const lazySyncFavorites = async (userId, localFavorites) => {
  try {
    if (!localFavorites || localFavorites.length === 0) {
      return lazyGetFavorites(userId)
    }

    const supabase = await getSupabase()

    const itemsToUpsert = localFavorites.map(item => ({
      user_id: userId,
      product_id: item.id,
      outfit_id: item.outfitId || 'unknown',
      product_name: item.name,
      brand: item.brand,
      image_url: item.imageUrl,
      price: item.price,
      link: item.link,
      created_at: item.favoritedAt || new Date()
    }))

    const { error } = await supabase
      .from('favorites')
      .upsert(itemsToUpsert, { onConflict: 'user_id, product_id' })

    if (error) {
      if (error.code === '42501' || error.message?.includes('policy') || error.code === 'PGRST301') {
        return { favorites: localFavorites }
      }
      throw error
    }

    return lazyGetFavorites(userId)
  } catch (err) {
    console.error('Favorites sync error:', err)
    return { favorites: localFavorites }
  }
}

export const lazyGetFavorites = async (userId) => {
  try {
    const supabase = await getSupabase()
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId)

    if (error) {
      if (error.code === '42501' || error.message?.includes('policy') || error.code === 'PGRST301') {
        return { favorites: [] }
      }
      throw error
    }

    const mappedFavorites = (data || []).map(item => ({
      id: item.product_id,
      outfitId: item.outfit_id,
      name: item.product_name,
      brand: item.brand,
      imageUrl: item.image_url,
      price: item.price,
      link: item.link,
      favoritedAt: item.created_at
    }))

    return { favorites: mappedFavorites }
  } catch (err) {
    console.error('Get favorites error:', err)
    return { favorites: [] }
  }
}

export const lazyAddFavorite = async (userId, product) => {
  try {
    const supabase = await getSupabase()
    const { error } = await supabase
      .from('favorites')
      .upsert({
        user_id: userId,
        product_id: product.id,
        outfit_id: product.outfitId || 'unknown',
        product_name: product.name,
        brand: product.brand,
        image_url: product.imageUrl,
        price: product.price,
        link: product.link,
        created_at: new Date()
      }, { onConflict: 'user_id, product_id' })

    if (error) {
      if (error.code === '42501' || error.message?.includes('policy') || error.code === 'PGRST301') {
        return { success: true, localOnly: true }
      }
      throw error
    }
    return { success: true }
  } catch (err) {
    console.error('Add favorite error:', err)
    return { success: false }
  }
}

export const lazyRemoveFavorite = async (userId, productId) => {
  try {
    const supabase = await getSupabase()
    const { error } = await supabase
      .from('favorites')
      .delete()
      .match({ user_id: userId, product_id: productId })

    if (error) {
      if (error.code === '42501' || error.message?.includes('policy') || error.code === 'PGRST301') {
        return { success: true, localOnly: true }
      }
      throw error
    }
    return { success: true }
  } catch (err) {
    console.error('Remove favorite error:', err)
    return { success: false }
  }
}

export const lazyClearFavorites = async (userId) => {
  try {
    const supabase = await getSupabase()
    const { error } = await supabase
      .from('favorites')
      .delete()
      .match({ user_id: userId })

    if (error) {
      if (error.code === '42501' || error.message?.includes('policy') || error.code === 'PGRST301') {
        return { success: true, localOnly: true }
      }
      throw error
    }
    return { success: true }
  } catch (err) {
    console.error('Clear favorites error:', err)
    return { success: false }
  }
}
