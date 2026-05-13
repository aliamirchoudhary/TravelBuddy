import { create } from 'zustand';
import api from '../services/api';

/**
 * Zustand store for authentication state.
 * Access token is stored in memory only (never localStorage) for security.
 * Refresh token is stored as an httpOnly cookie (managed by the server).
 * On page refresh, initAuth() silently restores the session via the cookie.
 */
const useAuthStore = create((set, get) => ({
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,    // true on app load (checking if session exists)

  /**
   * Called on app startup to restore session silently.
   * Uses the httpOnly refresh token cookie to get a new access token.
   */
  initAuth: async () => {
    try {
      const res = await api.post('/auth/refresh');
      set({
        user: res.data.user,
        accessToken: res.data.accessToken,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch {
      // No valid session
      set({ user: null, accessToken: null, isAuthenticated: false, isLoading: false });
    }
  },

  /**
   * Login with email and password.
   */
  login: async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    set({
      user: res.data.user,
      accessToken: res.data.accessToken,
      isAuthenticated: true,
    });
    return res.data;
  },

  /**
   * Clear auth state on logout.
   */
  logout: async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // Ignore logout errors (token may already be invalid)
    } finally {
      set({ user: null, accessToken: null, isAuthenticated: false });
    }
  },

  /**
   * Set access token (used by auto-refresh interceptor and OAuth callback).
   */
  setAccessToken: (token) => set({ accessToken: token }),

  /**
   * Set user data.
   */
  setUser: (user) => set({ user, isAuthenticated: !!user }),

  /**
   * Update user profile data without changing the token.
   */
  updateUser: (updates) => {
    const current = get().user;
    const updated = { ...current, ...updates };
    set({ user: updated });
  },
}));

export default useAuthStore;
