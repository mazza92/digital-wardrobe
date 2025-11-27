import React, { createContext, useState, useContext, useEffect } from 'react';
import * as api from '../utils/supabaseApi';
import { supabase, safeGetSession } from '../utils/supabaseClient';

// Check if Supabase is properly initialized before using it
const isSupabaseConfigured = !!supabase;

const AuthContext = createContext(null);

// Helper to check if user needs onboarding
const checkNeedsOnboarding = (userData) => {
  if (!userData) return false;
  const prefs = userData.preferences;
  // User needs onboarding if they have no preferences or onboarding not completed
  return !prefs || 
         (!prefs.onboardingCompleted && 
          (!prefs.styleInterests || prefs.styleInterests.length === 0));
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [needsOnboarding, setNeedsOnboarding] = useState(false);
  const [pendingSignup, setPendingSignup] = useState(false); // Track if we're in signup flow

  useEffect(() => {
    if (!isSupabaseConfigured) {
      setLoading(false);
      return;
    }

    // Check for active session on load
    const initAuth = async () => {
      try {
        const currentPath = window.location.pathname;
        const isOnSignupPage = currentPath === '/signup';

        const { data: { session } } = await safeGetSession();
        if (session?.user && !isOnSignupPage) {
          // If we have a session and we're not on signup page, set the user
          try {
            const profile = await api.getCurrentUser();
            setUser(profile);
            setNeedsOnboarding(checkNeedsOnboarding(profile));
          } catch (profileErr) {
            // Profile fetch failed, but we have a session - use basic user info
            console.log('Profile fetch failed, using session user:', profileErr.message);
            setUser(session.user);
            setNeedsOnboarding(true);
          }
        }
      } catch (err) {
        console.error("Auth init error:", err);
        // Even on error, we should stop loading
      }
      // Always set loading to false
      setLoading(false);
    };
    
    // Run init with a timeout fallback in case it hangs
    initAuth();
    
    // Fallback: ensure loading is false after 3 seconds no matter what
    const loadingTimeout = setTimeout(() => {
      setLoading(false);
    }, 3000);

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      const currentPath = window.location.pathname;
      const isOnSignupPage = currentPath === '/signup';
      const isOnCallbackPage = currentPath === '/auth/callback';
      
      console.log('Auth event:', event, 'Path:', currentPath, 'Pending signup:', pendingSignup);
      
      // Skip setting user if we're on the signup page (user hasn't confirmed email yet)
      // The signup page will handle showing the confirmation screen
      if (isOnSignupPage && event === 'SIGNED_IN') {
        console.log('On signup page, skipping user set - waiting for email confirmation');
        return;
      }
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED' || event === 'INITIAL_SESSION') {
        if (session?.user) {
          // Only skip setting user if we're on the signup page
          // (user just signed up and we're showing the confirmation screen)
          // In all other cases, trust the session
          if (isOnSignupPage) {
            console.log('On signup page, not setting user yet');
            return;
          }

          // Set user immediately from session (no async calls that might hang)
          console.log('Setting user from session:', session.user.id);
          setUser(session.user);
          setPendingSignup(false);

          // Fetch profile data in background (non-blocking)
          api.getProfile(session.user.id).then(profile => {
            if (profile) {
              console.log('Profile loaded:', profile);
              setUser({ ...session.user, ...profile });
              setNeedsOnboarding(checkNeedsOnboarding({ ...session.user, ...profile }));
            } else {
              setNeedsOnboarding(true);
            }
          }).catch(err => {
            console.log('Profile fetch failed:', err.message);
            setNeedsOnboarding(true);
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
        setNeedsOnboarding(false);
        setPendingSignup(false);
      }
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(loadingTimeout);
    };
  }, [pendingSignup]);

  const login = async (email, password) => {
    if (!isSupabaseConfigured) {
        setError("Authentication service not configured.");
        return;
    }
    setLoading(true);
    setError(null);
    try {
      const response = await api.login(email, password);
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
  };

  const signup = async (email, password, marketingOptIn) => {
    if (!isSupabaseConfigured) {
        setError("Authentication service not configured.");
        return;
    }
    setLoading(true);
    setError(null);
    setPendingSignup(true); // Set flag to prevent auto-login from onAuthStateChange
    try {
      const response = await api.signup(email, password, marketingOptIn);
      // DON'T set user here - wait for email confirmation
      // The pendingSignup flag prevents onAuthStateChange from setting the user
      // Return the user data but don't set it in state yet
      return response.user;
    } catch (err) {
      setError(err.message);
      setPendingSignup(false); // Clear flag on error
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const logout = async () => {
    if (!isSupabaseConfigured) return;
    try {
      await api.logout();
      setUser(null);
    } catch (err) {
      console.error("Logout failed", err);
    }
  };

  const updateProfile = async (preferences) => {
    if (!isSupabaseConfigured) return { success: false };
    
    try {
      const response = await api.updatePreferences(user?.id, preferences);
      
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
      const localResult = api.savePendingPreferences(preferences);
      if (localResult.success) {
        return localResult;
      }
      setError(err.message);
      throw err;
    }
  };

  // Function to clear pending signup flag (called from AuthCallback)
  const clearPendingSignup = () => {
    setPendingSignup(false);
  };

  const value = {
    user,
    loading,
    error,
    login,
    signup,
    logout,
    updateProfile,
    isAuthenticated: !!user,
    needsOnboarding,
    clearPendingSignup
  };

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
