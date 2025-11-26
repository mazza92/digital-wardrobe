// Mock API to simulate backend behavior for User Account & CRM features
// This replaces the need for a real backend for the current phase

const DELAY = 800; // Simulate network latency

// Helper to simulate async API call
const mockRequest = (data, shouldFail = false) => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      if (shouldFail) {
        reject(new Error('API Request Failed'));
      } else {
        resolve(data);
      }
    }, DELAY);
  });
};

// LocalStorage keys
const DB_USERS = 'dw_users_db';
const DB_CURRENT_USER = 'dw_current_user_session';

// Check if localStorage is available
const isStorageAvailable = () => {
  try {
    const test = '__test__';
    localStorage.setItem(test, test);
    localStorage.removeItem(test);
    return true;
  } catch {
    return false;
  }
};

// In-memory fallback
let memoryUsers = [];
let memoryCurrentUser = null;

// --- Database Helpers ---

const getUsers = () => {
  if (!isStorageAvailable()) return memoryUsers;
  try {
    return JSON.parse(localStorage.getItem(DB_USERS) || '[]');
  } catch {
    return memoryUsers;
  }
};

const saveUsers = (users) => {
  memoryUsers = users;
  if (isStorageAvailable()) {
    try {
      localStorage.setItem(DB_USERS, JSON.stringify(users));
    } catch {
      // Storage blocked
    }
  }
};

// --- Auth Endpoints ---

const saveCurrentUser = (user) => {
  memoryCurrentUser = user;
  if (isStorageAvailable()) {
    try {
      localStorage.setItem(DB_CURRENT_USER, JSON.stringify(user));
    } catch {
      // Storage blocked
    }
  }
};

const getCurrentUserFromStorage = () => {
  if (!isStorageAvailable()) return memoryCurrentUser;
  try {
    const session = localStorage.getItem(DB_CURRENT_USER);
    return session ? JSON.parse(session) : memoryCurrentUser;
  } catch {
    return memoryCurrentUser;
  }
};

const clearCurrentUser = () => {
  memoryCurrentUser = null;
  if (isStorageAvailable()) {
    try {
      localStorage.removeItem(DB_CURRENT_USER);
    } catch {
      // Storage blocked
    }
  }
};

export const login = async (email, password) => {
  const users = getUsers();
  const user = users.find(u => u.email === email && u.password === password);

  if (user) {
    const { password, ...safeUser } = user;
    saveCurrentUser(safeUser);
    return mockRequest({ user: safeUser, token: 'mock-jwt-token' });
  }
  
  return new Promise((_, reject) => setTimeout(() => reject(new Error('Invalid credentials')), DELAY));
};

export const signup = async (email, password, marketingOptIn = false) => {
  const users = getUsers();
  
  if (users.find(u => u.email === email)) {
    return new Promise((_, reject) => setTimeout(() => reject(new Error('Email already exists')), DELAY));
  }

  const newUser = {
    id: 'user_' + Date.now(),
    email,
    password,
    marketingOptIn,
    preferences: {},
    favorites: [],
    createdAt: new Date().toISOString()
  };

  users.push(newUser);
  saveUsers(users);

  const { password: _, ...safeUser } = newUser;
  saveCurrentUser(safeUser);
  
  return mockRequest({ user: safeUser, token: 'mock-jwt-token' });
};

export const logout = async () => {
  clearCurrentUser();
  return mockRequest({ success: true });
};

export const getCurrentUser = async () => {
  const session = getCurrentUserFromStorage();
  if (session) {
    return mockRequest(session);
  }
  return Promise.reject('No session');
};

// --- User Profile & CRM Endpoints ---

export const updatePreferences = async (userId, preferences) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);
  
  if (index !== -1) {
    users[index].preferences = { ...users[index].preferences, ...preferences };
    saveUsers(users);
    
    // Update session if it's current user
    const currentUser = getCurrentUserFromStorage() || {};
    if (currentUser.id === userId) {
      currentUser.preferences = users[index].preferences;
      saveCurrentUser(currentUser);
    }

    return mockRequest({ success: true, user: users[index] });
  }
  return Promise.reject('User not found');
};

// --- Favorites Endpoints ---

export const syncFavorites = async (userId, localFavorites) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);

  if (index !== -1) {
    // Merge strategy: specific logic can be applied here. 
    // For now, we'll just replace or merge unique items.
    const currentFavorites = users[index].favorites || [];
    
    // Simple merge: add local favorites to server favorites if not present
    const newFavorites = [...currentFavorites];
    localFavorites.forEach(localItem => {
      if (!newFavorites.find(i => i.id === localItem.id)) {
        newFavorites.push(localItem);
      }
    });
    
    users[index].favorites = newFavorites;
    saveUsers(users);
    
    return mockRequest({ favorites: newFavorites });
  }
  return Promise.reject('User not found');
};

export const replaceFavorites = async (userId, newFavorites) => {
  const users = getUsers();
  const index = users.findIndex(u => u.id === userId);

  if (index !== -1) {
    users[index].favorites = newFavorites;
    saveUsers(users);
    return mockRequest({ success: true });
  }
  return Promise.reject('User not found');
};

