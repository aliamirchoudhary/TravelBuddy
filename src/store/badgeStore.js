import { create } from 'zustand';

const useBadgeStore = create((set) => ({
  activeBadge: null,
  showBadge: (badgeData) => set({ activeBadge: badgeData }),
  hideBadge: () => set({ activeBadge: null }),
}));

export default useBadgeStore;
