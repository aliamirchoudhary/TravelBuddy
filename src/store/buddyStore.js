import { create } from 'zustand';

/**
 * Zustand store for buddy matching state.
 * Manages match results, loading state, preferences, and API requests.
 */
const useBuddyStore = create((set, get) => ({
  // Match results from the backend/local engine
  matches: [],
  isLoading: false,
  error: null,
  preferences: {},

  // Incoming buddy requests
  incomingRequests: [],

  // Buddy connections
  connections: [],

  setPreferences: (prefs) => set({ preferences: prefs }),

  /**
   * Fetch matches from the backend API.
   * @param {object} prefs - search preferences
   * @param {object} apiService - axios instance
   */
  fetchMatches: async (prefs, apiService) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await apiService.post('/buddy/match', prefs);
      set({ matches: data.matches, isLoading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || err.message || 'Matching failed',
        isLoading: false,
      });
    }
  },

  /**
   * Send a buddy request via the API.
   * @param {number} receiverId
   * @param {number|null} tripId
   * @param {object} apiService
   */
  sendBuddyRequest: async (receiverId, tripId, apiService) => {
    try {
      await apiService.post('/buddy/request', { receiverId, tripId });
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to send request',
      };
    }
  },

  /**
   * Respond to a buddy request (accept/decline).
   * @param {number} requestId
   * @param {string} action - 'accepted' | 'declined'
   * @param {object} apiService
   */
  respondToRequest: async (requestId, action, apiService) => {
    try {
      await apiService.put(`/buddy/request/${requestId}`, { action });
      // Remove from incoming requests
      set((state) => ({
        incomingRequests: state.incomingRequests.filter(r => r.RequestID !== requestId),
      }));
      return { success: true };
    } catch (err) {
      return {
        success: false,
        message: err.response?.data?.message || 'Failed to respond',
      };
    }
  },

  /**
   * Fetch incoming buddy requests from the API.
   * @param {object} apiService
   */
  fetchIncomingRequests: async (apiService) => {
    try {
      const { data } = await apiService.get('/buddy/requests');
      set({ incomingRequests: data.requests });
    } catch (err) {
      console.warn('Could not fetch incoming requests:', err.message);
    }
  },

  /**
   * Fetch buddy connections from the API.
   * @param {object} apiService
   */
  fetchConnections: async (apiService) => {
    try {
      const { data } = await apiService.get('/buddy/connections');
      set({ connections: data.connections });
    } catch (err) {
      console.warn('Could not fetch connections:', err.message);
    }
  },

  clearMatches: () => set({ matches: [], error: null }),
}));

export default useBuddyStore;
