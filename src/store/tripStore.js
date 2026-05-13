import { create } from 'zustand';
import api         from '../services/api';

const useTripStore = create((set, get) => ({
  // Core trip data
  trip:          null,
  days:          [],
  budget:        null,
  budgetItems:   [],
  todos:         [],
  routes:        [],
  collaborators: [],
  hotel:         null,
  activeTab:     'destination',
  isLoading:     false,
  error:         null,

  setActiveTab: (tab) => set({ activeTab: tab }),

  // Load full trip
  fetchTrip: async (tripId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/trips/${tripId}`);
      set({
        trip:          data.trip,
        days:          data.days,
        budget:        data.budget,
        budgetItems:   data.budgetItems,
        todos:         data.todos,
        routes:        data.routes,
        collaborators: data.collaborators,
        hotel:         data.hotel || null,
        isLoading:     false,
      });
    } catch (err) {
      set({ error: err.response?.data?.message || err.message, isLoading: false });
    }
  },

  // Optimistic update for trip top-level fields
  setTripField: (field, value) =>
    set(s => ({ trip: { ...s.trip, [field]: value } })),

  // Reload from server after mutation
  refreshTrip: async () => {
    const tripId = get().trip?.TripID;
    if (tripId) get().fetchTrip(tripId);
  },


  // Save hotel selection from Destination tab → persists to Trips.SelectedHotelID
  setSelectedHotel: async (hotelId) => {
    const tripId = get().trip?.TripID;
    if (!tripId) return;
    try {
      await api.patch(`/trips/${tripId}/hotel`, { hotelId });
      await get().fetchTrip(tripId);
    } catch (err) {
      console.error('setSelectedHotel failed', err);
    }
  },


}));



export default useTripStore;
