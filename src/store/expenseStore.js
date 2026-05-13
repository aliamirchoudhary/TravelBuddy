import { create } from 'zustand';
import api from '../services/api';

const useExpenseStore = create((set, get) => ({
  expenses:   [],
  settlement: [],
  rates:      {},           // { 'USD:PKR': 278.5, ... }
  currency:   'PKR',        // display currency
  isLoading:  false,

  setCurrency: (c) => set({ currency: c }),

  fetchExpenses: async (tripId) => {
    set({ isLoading: true });
    try {
      const { data } = await api.get(`/expenses/${tripId}`);
      set({ expenses: data.expenses, isLoading: false });
    } catch (e) {
      console.error('Failed to fetch expenses', e);
      set({ isLoading: false });
    }
  },

  fetchSettlement: async (tripId) => {
    try {
      const { data } = await api.get(`/expenses/${tripId}/settlement`);
      set({ settlement: data.settlement });
    } catch(e) {
      console.error('Failed to fetch settlement', e);
    }
  },

  fetchRate: async (base, target) => {
    const key = `${base}:${target}`;
    if (get().rates[key]) return get().rates[key];
    try {
      const { data } = await api.get(`/expenses/rates?base=${base}&target=${target}`);
      set(s => ({ rates: { ...s.rates, [key]: data.rate } }));
      return data.rate;
    } catch(e) {
      console.error('Failed to fetch rate', e);
      return 1;
    }
  },

  addExpenseOptimistic: (expense) =>
    set(s => ({ expenses: [expense, ...s.expenses] })),
}));

export default useExpenseStore;
