import { create } from 'zustand';

const useGatewayStore = create((set) => ({
  step: 0,
  answers: {},
  isVisible: true,

  setStep: (step) => set({ step }),

  setAnswer: (question, answer) =>
    set((state) => ({ answers: { ...state.answers, [question]: answer } })),

  hideGateway: () => set({ isVisible: false }),

  // Show the gateway again (e.g. when a nav link triggers it)
  showGateway: () => set({ isVisible: true }),

  // Full reset: clear step, answers, make visible, and wipe localStorage
  // so returning users see it again after a manual reset (e.g. via Navbar auth link click)
  resetGateway: () => {
    localStorage.removeItem('gateway_seen');
    set({ step: 0, answers: {}, isVisible: true });
  },
}));

export default useGatewayStore;
