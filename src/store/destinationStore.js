import { create } from 'zustand';
import api from '../services/api';

const useDestinationStore = create((set) => ({
  city:        null,
  hotels:      [],
  restaurants: [],
  attractions: [],
  activeTab:   'overview',
  isLoading:   false,
  error:       null,

  setActiveTab: (tab) => set({ activeTab: tab }),

  fetchCityDetail: async (cityId) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.get(`/destinations/city/${cityId}`);
      set({
        city:        data.city,
        hotels:      data.hotels,
        restaurants: data.restaurants,
        attractions: data.attractions,
        isLoading:   false,
      });
    } catch (err) {
      set({ error: err.response?.data?.message || err.message, isLoading: false });
    }
  },

  resolveCity: async (name) => {
    set({ isLoading: true, error: null });
    try {
      const { data } = await api.post('/destinations/resolve', { cityName: name });
      set({ isLoading: false });
      return data.city.CityID;
    } catch (err) {
      set({ error: 'Global discovery failed', isLoading: false });
      return null;
    }
  },

  fetchCities: async (params) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get('/destinations/cities', { params });
      set({ isLoading: false });
      return data.cities;
    } catch (err) {
      set({ isLoading: false });
      return [];
    }
  },

  searchCities: async (q) => {
    try {
      const { data } = await api.get('/destinations/search', { params: { q } });
      return data.results;
    } catch (err) {
      return [];
    }
  }
}));

export default useDestinationStore;
