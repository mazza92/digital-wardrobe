import { supabase, safeGetSession } from './supabaseClient';

// --- Simple in-memory cache to reduce Supabase calls ---
const cache = {
  profile: { data: null, userId: null, timestamp: 0 },
  favorites: { data: null, userId: null, timestamp: 0 }
};
const CACHE_TTL = 60000; // 1 minute cache

const isCacheValid = (cacheEntry, userId) => {
  return cacheEntry.data !== null &&
         cacheEntry.userId === userId &&
         (Date.now() - cacheEntry.timestamp) < CACHE_TTL;
};

// --- Auth Endpoints ---

export const login = async (email, password) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) throw error;
  
  // Fetch profile
  const profile = await getProfile(data.user.id);
  
  return {
    user: {
      ...data.user,
      ...profile
    },
    session: data.session
  };
};

export const signup = async (name, email, password, marketingOptIn = false) => {
  // Get the current origin for the redirect URL (used when email confirmation is enabled)
  const redirectUrl = `${window.location.origin}/auth/callback`;
  // Email verification is currently commented out in the app for a simpler launch.
  // To have signup work without email confirmation, disable "Confirm email" in Supabase:
  // Authentication > Providers > Email > Confirm email = OFF.
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        name: name,
        marketing_opt_in: marketingOptIn
      },
      emailRedirectTo: redirectUrl
    }
  });

  if (error) throw error;
  
  // Create profile entry if not exists (handled by trigger usually, but we can do manual check)
  // For this implementation, we'll assume a Trigger creates the profile OR we create it here.
  // Let's do a manual create to be safe if triggers aren't set up.
  if (data.user) {
    await supabase.from('user_profiles').upsert({
      id: data.user.id,
      email: email,
      name: name,
      marketing_opt_in: marketingOptIn,
      preferences: {},
      updated_at: new Date()
    });
  }

  return {
    user: data.user,
    session: data.session
  };
};

export const logout = async () => {
  // Clear all caches on logout
  cache.profile = { data: null, userId: null, timestamp: 0 };
  cache.favorites = { data: null, userId: null, timestamp: 0 };

  const { error } = await supabase.auth.signOut();
  if (error) throw error;
  return { success: true };
};

export const requestPasswordReset = async (email) => {
  const configuredFrontendUrl = import.meta.env.VITE_FRONTEND_URL;
  const fallbackFrontendUrl = import.meta.env.DEV
    ? window.location.origin
    : 'https://emmanuellek.com';
  const frontendUrl = (configuredFrontendUrl || fallbackFrontendUrl).replace(/\/$/, '');
  const redirectUrl = `${frontendUrl}/auth/reset-password`;
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: redirectUrl
  });
  if (error) throw error;
  return { success: true };
};

export const getCurrentUser = async () => {
  const { data: { session }, error } = await safeGetSession();
  if (error) throw error;
  if (!session) return null;

  const profile = await getProfile(session.user.id);

  return {
    ...session.user,
    ...profile
  };
};

export const getProfile = async (userId) => {
  // Check cache first to reduce Supabase calls
  if (isCacheValid(cache.profile, userId)) {
    return cache.profile.data;
  }

  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle(); // Use maybeSingle to avoid error when row doesn't exist

  // RLS errors are expected before email confirmation - don't throw
  if (error && error.code !== '42501' && !error.message?.includes('row-level security')) {
    // Profile fetch failed
  }

  // Cache successful result
  if (data) {
    cache.profile = { data, userId, timestamp: Date.now() };
  }

  return data || {};
};

// --- User Profile & CRM Endpoints ---

// In-memory storage for pending preferences (fallback when localStorage is blocked)
let pendingPreferencesMemory = {};

// Local storage key for pending preferences (before email confirmation)
const PENDING_PREFERENCES_KEY = 'wardrobe_pending_preferences';

const isStorageAvailable = () => {
  try {
    const test = '__storage_test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

export const savePendingPreferences = (preferences) => {
  const merged = { ...pendingPreferencesMemory, ...preferences };
  pendingPreferencesMemory = merged;
  
  // Try localStorage as backup, but don't fail if blocked
  if (isStorageAvailable()) {
    try {
      const existing = JSON.parse(localStorage.getItem(PENDING_PREFERENCES_KEY) || '{}');
      const fullMerged = { ...existing, ...merged };
      localStorage.setItem(PENDING_PREFERENCES_KEY, JSON.stringify(fullMerged));
    } catch (err) {
      // Storage blocked, using memory only
    }
  }
  
  return { success: true, preferences: merged };
};

export const getPendingPreferences = () => {
  let prefs = { ...pendingPreferencesMemory };
  
  if (isStorageAvailable()) {
    try {
      const stored = JSON.parse(localStorage.getItem(PENDING_PREFERENCES_KEY) || '{}');
      prefs = { ...stored, ...prefs };
    } catch {
      // Storage blocked
    }
  }
  
  return prefs;
};

export const clearPendingPreferences = () => {
  pendingPreferencesMemory = {};
  if (isStorageAvailable()) {
    try {
      localStorage.removeItem(PENDING_PREFERENCES_KEY);
    } catch {
      // Storage blocked
    }
  }
};

export const updatePreferences = async (userId, preferences) => {
  // Always save to memory first (in case DB fails)
  savePendingPreferences(preferences);

  // Require userId to be provided - no fallback to prevent hanging
  if (!userId) {
    return { success: true, preferences, savedLocally: true };
  }

  try {
    const authenticatedUserId = userId;

    // Get current preferences to merge (if profile exists)
    let currentProfile = null;
    try {
      const { data } = await supabase
        .from('user_profiles')
        .select('preferences, email, marketing_opt_in')
        .eq('id', authenticatedUserId)
        .maybeSingle();
      currentProfile = data;
    } catch (err) {
      // Could not fetch current profile
    }

    // Merge all preferences
    const pendingPrefs = getPendingPreferences();
    const newPreferences = {
      ...(currentProfile?.preferences || {}),
      ...pendingPrefs,
      ...preferences
    };

    // Use upsert with the authenticated user's ID
    const upsertPayload = {
      id: authenticatedUserId,
      email: currentProfile?.email || null,
      marketing_opt_in: currentProfile?.marketing_opt_in ?? false,
      preferences: newPreferences,
      updated_at: new Date().toISOString()
    };

    const { data, error } = await supabase
      .from('user_profiles')
      .upsert(upsertPayload)
      .select()
      .single();

    if (error) {
      return { success: true, preferences: newPreferences, savedLocally: true, error: error.message };
    }

    // Clear pending preferences after successful sync
    clearPendingPreferences();

    return { success: true, user: data, savedToDb: true };
  } catch (err) {
    return { success: true, preferences, savedLocally: true, error: err.message };
  }
};

// Sync pending preferences when user logs in
export const syncPendingPreferences = async () => {
  const pending = getPendingPreferences();
  
  if (Object.keys(pending).length === 0) {
    return null;
  }
  
  try {
    const result = await updatePreferences(null, pending);
    return result;
  } catch (err) {
    return null;
  }
};

// --- Favorites Endpoints ---

export const syncFavorites = async (userId, localFavorites) => {
  try {
    if (!localFavorites || localFavorites.length === 0) {
      return getFavorites(userId);
    }

    // 1. Prepare items for upsert
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
    }));

    // 2. Upsert into Supabase
    const { error } = await supabase
      .from('favorites')
      .upsert(itemsToUpsert, { onConflict: 'user_id, product_id' });

    // If RLS error (403), just return local favorites - table might not have proper policies
    if (error) {
      if (error.code === '42501' || error.message?.includes('policy') || error.code === 'PGRST301') {
        return { favorites: localFavorites };
      }
      throw error;
    }

    // 3. Fetch updated list
    return getFavorites(userId);
  } catch (err) {
    // Return local favorites as fallback
    return { favorites: localFavorites };
  }
};

export const getFavorites = async (userId) => {
  // Check cache first to reduce Supabase calls
  if (isCacheValid(cache.favorites, userId)) {
    return { favorites: cache.favorites.data };
  }

  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId);

    // If RLS error, return empty - user will use local favorites
    if (error) {
      if (error.code === '42501' || error.message?.includes('policy') || error.code === 'PGRST301') {
        return { favorites: [] };
      }
      throw error;
    }

    // Map back to app format
    const mappedFavorites = (data || []).map(item => ({
      id: item.product_id,
      outfitId: item.outfit_id,
      name: item.product_name,
      brand: item.brand,
      imageUrl: item.image_url,
      price: item.price,
      link: item.link,
      favoritedAt: item.created_at
    }));

    // Cache successful result
    cache.favorites = { data: mappedFavorites, userId, timestamp: Date.now() };

    return { favorites: mappedFavorites };
  } catch (err) {
    return { favorites: [] };
  }
};

export const addFavorite = async (userId, product) => {
  // Invalidate cache immediately
  cache.favorites = { data: null, userId: null, timestamp: 0 };

  try {
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
        }, { onConflict: 'user_id, product_id' });

    if (error) {
      // If RLS error, return - local storage will handle it
      if (error.code === '42501' || error.message?.includes('policy') || error.code === 'PGRST301') {
        return { success: true, localOnly: true };
      }
      throw error;
    }
    return { success: true };
  } catch (err) {
    return { success: false };
  }
};

export const removeFavorite = async (userId, productId) => {
  // Invalidate cache immediately
  cache.favorites = { data: null, userId: null, timestamp: 0 };

  try {
    const { error } = await supabase
        .from('favorites')
        .delete()
        .match({ user_id: userId, product_id: productId });

    if (error) {
      if (error.code === '42501' || error.message?.includes('policy') || error.code === 'PGRST301') {
        return { success: true, localOnly: true };
      }
      throw error;
    }
    return { success: true };
  } catch (err) {
    return { success: false };
  }
};

export const clearFavorites = async (userId) => {
  // Invalidate cache immediately
  cache.favorites = { data: null, userId: null, timestamp: 0 };

  try {
    const { error } = await supabase
        .from('favorites')
        .delete()
        .match({ user_id: userId });

    if (error) {
      if (error.code === '42501' || error.message?.includes('policy') || error.code === 'PGRST301') {
        return { success: true, localOnly: true };
      }
      throw error;
    }
    return { success: true };
  } catch (err) {
    return { success: false };
  }
};

