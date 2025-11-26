import { supabase, safeGetSession } from './supabaseClient';

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

export const signup = async (email, password, marketingOptIn = false) => {
  // Get the current origin for the redirect URL
  const redirectUrl = `${window.location.origin}/auth/callback`;
  
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
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
  const { error } = await supabase.auth.signOut();
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

const getProfile = async (userId) => {
  const { data, error } = await supabase
    .from('user_profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle(); // Use maybeSingle to avoid error when row doesn't exist
    
  // Don't log RLS errors - they're expected before email confirmation
  if (error && error.code !== '42501' && !error.message?.includes('row-level security')) {
    console.error('Error fetching profile:', error);
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
  
  try {
    // Get current authenticated user
    const { data: { user: authUser }, error: authError } = await supabase.auth.getUser();
    
    // If not authenticated or session missing, preferences are saved in memory
    if (authError || !authUser) {
      console.log('No authenticated user, preferences saved in memory');
      return { success: true, preferences, savedLocally: true };
    }
    
    // Use authUser.id to ensure it matches auth.uid() for RLS
    const authenticatedUserId = authUser.id;
    
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
      console.log('Could not fetch current profile:', err.message);
    }
    
    // Merge all preferences
    const pendingPrefs = getPendingPreferences();
    const newPreferences = {
      ...(currentProfile?.preferences || {}),
      ...pendingPrefs,
      ...preferences
    };

    // Use upsert with the authenticated user's ID
    const { data, error } = await supabase
      .from('user_profiles')
      .upsert({
        id: authenticatedUserId,
        email: currentProfile?.email || authUser.email || null,
        marketing_opt_in: currentProfile?.marketing_opt_in ?? false,
        preferences: newPreferences,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) {
      console.log('Error saving to database:', error.message);
      // Preferences are already in memory, so this is still a "success" for the user
      return { success: true, preferences: newPreferences, savedLocally: true };
    }
    
    // Clear pending preferences after successful sync
    clearPendingPreferences();
    
    return { success: true, user: data, savedToDb: true };
  } catch (err) {
    console.log('updatePreferences error:', err.message);
    // Preferences are in memory, return success
    return { success: true, preferences, savedLocally: true };
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
    console.error('Failed to sync pending preferences:', err);
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
        console.warn('Favorites sync skipped - RLS policy issue. Using local favorites.');
        return { favorites: localFavorites };
      }
      throw error;
    }

    // 3. Fetch updated list
    return getFavorites(userId);
  } catch (err) {
    console.error('Favorites sync error:', err);
    // Return local favorites as fallback
    return { favorites: localFavorites };
  }
};

export const getFavorites = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('favorites')
      .select('*')
      .eq('user_id', userId);

    // If RLS error, return empty - user will use local favorites
    if (error) {
      if (error.code === '42501' || error.message?.includes('policy') || error.code === 'PGRST301') {
        console.warn('Get favorites skipped - RLS policy issue. Using local favorites.');
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

    return { favorites: mappedFavorites };
  } catch (err) {
    console.error('Get favorites error:', err);
    return { favorites: [] };
  }
};

export const addFavorite = async (userId, product) => {
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
      // If RLS error, just log and return - local storage will handle it
      if (error.code === '42501' || error.message?.includes('policy') || error.code === 'PGRST301') {
        console.warn('Add favorite skipped - RLS policy issue. Saved locally only.');
        return { success: true, localOnly: true };
      }
      throw error;
    }
    return { success: true };
  } catch (err) {
    console.error('Add favorite error:', err);
    return { success: false };
  }
};

export const removeFavorite = async (userId, productId) => {
  try {
    const { error } = await supabase
        .from('favorites')
        .delete()
        .match({ user_id: userId, product_id: productId });

    if (error) {
      if (error.code === '42501' || error.message?.includes('policy') || error.code === 'PGRST301') {
        console.warn('Remove favorite skipped - RLS policy issue.');
        return { success: true, localOnly: true };
      }
      throw error;
    }
    return { success: true };
  } catch (err) {
    console.error('Remove favorite error:', err);
    return { success: false };
  }
};

export const clearFavorites = async (userId) => {
  try {
    const { error } = await supabase
        .from('favorites')
        .delete()
        .match({ user_id: userId });
        
    if (error) {
      if (error.code === '42501' || error.message?.includes('policy') || error.code === 'PGRST301') {
        console.warn('Clear favorites skipped - RLS policy issue.');
        return { success: true, localOnly: true };
      }
      throw error;
    }
    return { success: true };
  } catch (err) {
    console.error('Clear favorites error:', err);
    return { success: false };
  }
};

