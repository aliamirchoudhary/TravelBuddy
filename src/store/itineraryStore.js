import { create } from 'zustand';
import api         from '../services/api';

const useItineraryStore = create((set, get) => ({
  // AI generation state
  generatedItinerary: null,     // { days: [...] } — in-memory before save
  isGenerating:       false,
  generationError:    null,
  fromCache:          false,

  // Saved itinerary (from DB)
  savedItinerary:     null,
  isSaving:           false,

  // Rate limit
  rateLimitInfo:      { used: 0, remaining: 3, limit: 3 },

  // Preferences
  preferences: {
    style:     'Cultural',
    interests: [],
    pace:      'moderate',
  },
  setPreferences: (prefs) => set(s => ({ preferences: { ...s.preferences, ...prefs } })),

  // Generate
  generate: async (tripId, cityName, countryName, days) => {
    const { preferences } = get();
    set({ isGenerating: true, generationError: null });
    try {
      const { data } = await api.post('/itinerary/generate', {
        tripId, cityName, countryName, days,
        style:     preferences.style,
        interests: preferences.interests,
        pace:      preferences.pace,
      });
      set({ generatedItinerary: data.itinerary, fromCache: data.fromCache, isGenerating: false });
    } catch (err) {
      const msg = err.response?.data?.message || 'Generation failed';
      set({ generationError: msg, isGenerating: false });
    }
  },

  // Edit a single activity in the in-memory itinerary
  updateActivity: (dayIndex, actIndex, updatedActivity) => {
    set(s => {
      const days = s.generatedItinerary.days.map((d, di) =>
        di !== dayIndex ? d : {
          ...d,
          activities: d.activities.map((a, ai) => ai !== actIndex ? a : { ...a, ...updatedActivity })
        }
      );
      return { generatedItinerary: { ...s.generatedItinerary, days } };
    });
  },

  // Remove an activity
  removeActivity: (dayIndex, actIndex) => {
    set(s => {
      const days = s.generatedItinerary.days.map((d, di) =>
        di !== dayIndex ? d : {
          ...d,
          activities: d.activities.filter((_, ai) => ai !== actIndex)
        }
      );
      return { generatedItinerary: { ...s.generatedItinerary, days } };
    });
  },

  // Save to DB
  save: async (tripId, startDate) => {
    const { generatedItinerary } = get();
    if (!generatedItinerary) return;
    set({ isSaving: true });
    try {
      await api.post('/itinerary/save', { tripId, itinerary: generatedItinerary, startDate });
      set({ savedItinerary: generatedItinerary, isSaving: false });
      // Clear the "unsaved" state
      set({ fromCache: false });
    } catch {
      set({ isSaving: false });
    }
  },

  // Load from DB
  load: async (tripId) => {
    const { data } = await api.get(`/itinerary/${tripId}`);
    if (data.itinerary) set({ savedItinerary: data.itinerary, generatedItinerary: data.itinerary });
  },

  // Fetch rate limit info
  fetchRateLimit: async () => {
    const { data } = await api.get('/itinerary/ratelimit');
    set({ rateLimitInfo: data });
  },
}));

export default useItineraryStore;
