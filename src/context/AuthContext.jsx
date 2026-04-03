import React, { createContext, useState, useContext, useEffect, useMemo, useCallback, useRef } from 'react';
import { trackSignup } from '../utils/analytics';
import {
  mightHaveSession,
  safeGetSessionLazy,
  lazyLogin,
  lazySignup,
  lazyLogout,
  lazyRequestPasswordReset,
  lazyGetCurrentUser,
  lazyGetProfile,
  lazyUpdatePreferences,
  savePendingPreferences,
  onAuthStateChange
} from '../utils/supabaseLazy';

// Check if Supabase URL is configured (doesn't load SDK)
const isSupabaseConfigured = !!import.meta.env.VITE_SUPABASE_URL;

// Single context instance for the whole app (survives Vite HMR and avoids duplicate
// createContext() when auth routes are in a separate chunk — without this, lazy-loaded
// Profile can read a different context object than AuthProvider and get null → crash).
const AUTH_CTX_KEY = '__dw_AuthContext_singleton__'
function getAuthContext() {
  const g = typeof globalThis !== 'undefined' ? globalThis : {}
  if (!g[AUTH_CTX_KEY]) {
    g[AUTH_CTX_KEY] = createContext(null)
  }
  return g[AUTH_CTX_KEY]
}
const AuthContext = getAuthContext()
const SIGNUP_WELCOME_PENDING_KEY = 'dw_signup_welcome_pending';
const SIGNUP_WELCOME_SHOWN_KEY = 'dw_signup_welcome_shown';
const SIGNUP_WELCOME_EVENT = 'dw-signup-welcome-ready';

// V1: Onboarding flow commented out for MVP
// Helper to check if user needs onboarding
const checkNeedsOnboarding = (userData) => {
  // V1: Always return false to skip onboarding
  return false;

  // V2: Uncomment below to re-enable onboarding check
  // if (!userData) return false;
  // const prefs = userData.preferences;
  // // User needs onboarding if they have no preferences or onboarding not completed
  // return !prefs ||
  //        (!prefs.onboardingCompleted &&
  //         (!prefs.styleInterests || prefs.styleInterests.length === 0));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  // Start with loading=false to not block initial render
  // Content will show immediately, auth state updates in background
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [pendingSignup, setPendingSignup] = useState(false); // Track if we're in signup flow
  const [authInitialized, setAuthInitialized] = useState(false);
  const subscriptionRef = useRef(null);
  const pendingSignupRef = useRef(pendingSignup);

  // Keep ref in sync with state for use in callbacks
  useEffect(() => {
    pendingSignupRef.current = pendingSignup;
  }, [pendingSignup]);

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setAuthInitialized(true);
      return;
    }

    // OPTIMIZATION: Skip Supabase entirely for anonymous visitors
    // This saves ~174KB (45KB gzip) on initial load
    const hasExistingSession = mightHaveSession();
    const currentPath = window.location.pathname;
    const isAuthPage = currentPath === '/login' || currentPath === '/signup' ||
                       currentPath.startsWith('/auth/');

    // If no session token and not on auth page, skip loading Supabase
    if (!hasExistingSession && !isAuthPage) {
      
      setAuthInitialized(true);
      return;
    }

    // Auth state change handler
    const handleAuthChange = async (event, session) => {
      const path = window.location.pathname;
      const isOnSignupPage = path === '/signup';

      

      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        if (session?.user) {
          // Reliable welcome trigger: set it from auth event itself.
          if (event === 'SIGNED_IN' && pendingSignupRef.current) {
            try {
              sessionStorage.setItem(SIGNUP_WELCOME_PENDING_KEY, '1');
              sessionStorage.removeItem(SIGNUP_WELCOME_SHOWN_KEY);
              window.dispatchEvent(new Event(SIGNUP_WELCOME_EVENT));
            } catch {
              // ignore storage/event failures
            }
          }

          // Set user immediately from session (no async calls that might hang)
          
          setUser(session.user);
          setPendingSignup(false);

          // Fetch profile data in background (non-blocking)
          lazyGetProfile(session.user.id).then(profile => {
            if (profile) {
              
              setUser({ ...session.user, ...profile });
              setNeedsOnboarding(checkNeedsOnboarding({ ...session.user, ...profile }));
            } else {
              setNeedsOnboarding(true);
            }
          }).catch(err => {
            
            setNeedsOnboarding(true);
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setNeedsOnboarding(false);
        setPendingSignup(false);
      }
    };

    // Check for active session on load - deferred to not block render
    const initAuth = async () => {
      try {
        const isOnSignupPage = currentPath === '/signup';

        const { data: { session } } = await safeGetSessionLazy();
        if (session?.user && !isOnSignupPage) {
          // If we have a session and we're not on signup page, set the user
          try {
            const profile = await lazyGetCurrentUser();
            setUser(profile);
            setNeedsOnboarding(checkNeedsOnboarding(profile));
          } catch (profileErr) {
            // Profile fetch failed, but we have a session - use basic user info
            
            setUser(session.user);
            setNeedsOnboarding(true);
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
      }
      setAuthInitialized(true);
    };

    // Set up auth state listener (loads Supabase)
    const setupAuthListener = async () => {
      const { data: { subscription } } = await onAuthStateChange(handleAuthChange);
      subscriptionRef.current = subscription;
    };

    // Defer auth init to allow content to render first
    // Use requestIdleCallback for best performance
    if ('requestIdleCallback' in window) {
      requestIdleCallback(() => {
        initAuth();
        setupAuthListener();
      }, { timeout: 2000 });
    } else {
      setTimeout(() => {
        initAuth();
        setupAuthListener();
      }, 50);
    }

    return () => {
      if (subscriptionRef.current) {
        subscriptionRef.current.unsubscribe();
      }
    };
  }, []);

  const login = useCallback(async (email, password) => {
    if (!isSupabaseConfigured) {
        setError("Authentication service not configured.");
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await lazyLogin(email, password);
      setUser(response.user);
      return response.user;
    } catch (err) {
      // Handle specific Supabase auth errors
      let errorMessage = err.message;
      if (err.message?.includes('Invalid login credentials')) {
        errorMessage = 'Invalid email or password. Please try again.';
      } else if (err.message?.includes('Email not confirmed')) {
        errorMessage = 'Please confirm your email before logging in.';
      }
      setError(errorMessage);
      setLoading(false); // Ensure loading is false on error
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const signup = useCallback(async (name, email, password, marketingOptIn) => {
    if (!isSupabaseConfigured) {
        setError("Authentication service not configured.");
        return;
    }
    setLoading(true);
    setError(null);
    setPendingSignup(true); // Set flag to prevent auto-login from onAuthStateChange
    try {
      const response = await lazySignup(name, email, password, marketingOptIn);
      try {
        sessionStorage.setItem(SIGNUP_WELCOME_PENDING_KEY, '1');
        sessionStorage.removeItem(SIGNUP_WELCOME_SHOWN_KEY);
      } catch {
        // ignore storage failures
      }
      // Track signup event for analytics (non-blocking)
      if (response?.user?.id) {
        const currentPath = window.location?.pathname || '';
        const outfitMatch = currentPath.match(/^\/outfits\/([^/]+)/);
        trackSignup(response.user.id, 'signup_form', outfitMatch ? outfitMatch[1] : null);
      }

      // With email confirmation disabled, set user immediately after successful signup
      // This ensures the redirect works without waiting for onAuthStateChange
      if (response?.user && response?.session) {
        
        setUser(response.user);
        setPendingSignup(false);
      }

      return response.user;
    } catch (err) {
      setError(err.message);
      setPendingSignup(false); // Clear flag on error
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const logout = useCallback(async () => {
    if (!isSupabaseConfigured) return;
    try {
      await lazyLogout();
      setUser(null);
    } catch (err) {
      console.error("Logout failed", err);
    }
  }, []);

  const forgotPassword = useCallback(async (email) => {
    if (!isSupabaseConfigured) {
      setError("Authentication service not configured.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      return await lazyRequestPasswordReset(email);
    } catch (err) {
      let errorMessage = err.message;
      if (err.message?.includes('Invalid email')) {
        errorMessage = 'Please enter a valid email address.';
      }
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const updateProfile = useCallback(async (preferences) => {
    if (!isSupabaseConfigured) return { success: false };

    try {
      const response = await lazyUpdatePreferences(user?.id, preferences);

      // If we got user data back, update the state
      if (response.user) {
        setUser(prev => ({ ...prev, preferences: response.user.preferences }));
        // Check if onboarding is now complete
        if (response.user.preferences?.onboardingCompleted) {
          setNeedsOnboarding(false);
        }
      } else if (response.preferences) {
        // Preferences saved locally (no active session)
        // Update local user state if we have one
        if (user) {
          const newPrefs = { ...user?.preferences, ...response.preferences };
          setUser(prev => ({ ...prev, preferences: newPrefs }));
          if (newPrefs.onboardingCompleted) {
            setNeedsOnboarding(false);
          }
        }
      }

      return response;
    } catch (err) {
      // Save locally as fallback
      const localResult = savePendingPreferences(preferences);
      if (localResult.success) {
        return localResult;
      }
      setError(err.message);
      throw err;
    }
  }, [user]);

  // Function to clear pending signup flag (called from AuthCallback)
  const clearPendingSignup = useCallback(() => {
    setPendingSignup(false);
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Memoize the context value to prevent unnecessary re-renders
  const value = useMemo(() => ({
    user,
    loading,
    error,
    login,
    signup,
    forgotPassword,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    needsOnboarding,
    clearPendingSignup,
    clearError
  }), [user, loading, error, login, signup, forgotPassword, logout, updateProfile, needsOnboarding, clearPendingSignup, clearError]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
