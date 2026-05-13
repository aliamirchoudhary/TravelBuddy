import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronRight, ArrowRight, X } from 'lucide-react';
import useGatewayStore from '../store/gatewayStore';

const IntentGateway = () => {
  const navigate = useNavigate();
  const { step, setStep, isVisible, hideGateway } = useGatewayStore();

  // Only show on first visit
  useEffect(() => {
    const seen = localStorage.getItem('gateway_seen');
    if (seen && isVisible) hideGateway();
  }, [isVisible, hideGateway]);

  const markSeen = () => localStorage.setItem('gateway_seen', 'true');

  const handleRoute = (path) => {
    markSeen();
    hideGateway();
    navigate(path);
  };

  const handleDismiss = () => {
    markSeen();
    hideGateway();
  };

  if (!isVisible) return null;

  const steps = {
    0: {
      question: 'Are you thinking of visiting somewhere?',
      emoji: '✈️',
      buttons: [
        { label: "Yes, let's plan!", action: () => setStep('1A'), primary: true },
        { label: 'Just browsing', action: () => setStep('1B'), primary: false },
      ],
    },
    '1A': {
      question: 'Do you have a destination in mind?',
      emoji: '🗺️',
      buttons: [
        { label: 'Yes, I know where!', action: () => handleRoute('/planner/new'), primary: true },
        { label: 'Not yet, show me ideas', action: () => handleRoute('/explore'), primary: false },
      ],
    },
    '1B': {
      question: 'Are you a travel content creator?',
      emoji: '🎬',
      buttons: [
        { label: 'Yes, I create content!', action: () => handleRoute('/vlogger-hub'), primary: true },
        { label: 'Just exploring', action: () => handleRoute('/social-hub'), primary: false },
      ],
    },
  };

  const current = steps[step] || steps[0];
  const isStep0 = step === 0;

  return (
    <div className="glass-card p-10 md:p-12 w-full max-w-lg mx-auto relative overflow-hidden">
      {/* Glow */}
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-blue-600/20 rounded-full blur-[80px] pointer-events-none" />

      {/* Dismiss button */}
      <button
        onClick={handleDismiss}
        className="absolute top-5 right-5 w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-gray-500 hover:text-white hover:bg-white/10 transition-all z-20"
        aria-label="Dismiss"
      >
        <X size={14} />
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.25, ease: 'easeOut' }}
          className="relative z-10"
        >
          <div className="text-6xl mb-8 text-center">{current.emoji}</div>
          <h2 className="text-3xl font-black text-white text-center mb-10 tracking-tight leading-tight">
            {current.question}
          </h2>

          <div className="flex flex-col gap-4">
            {current.buttons.map((btn, idx) => (
              <button
                key={idx}
                onClick={btn.action}
                className={`w-full py-5 px-8 rounded-2xl font-bold text-lg transition-all duration-300 flex items-center justify-between group ${btn.primary
                  ? 'bg-blue-600 text-white hover:bg-blue-700 shadow-xl shadow-blue-600/20 hover:-translate-y-0.5'
                  : 'bg-white/5 text-white hover:bg-white/10 border border-white/10 hover:-translate-y-0.5'
                  }`}
              >
                <span>{btn.label}</span>
                {btn.primary ? (
                  <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />
                ) : (
                  <ChevronRight size={20} className="group-hover:translate-x-1 transition-transform opacity-50" />
                )}
              </button>
            ))}
          </div>

          {/* Go Back */}
          {!isStep0 && (
            <button
              onClick={() => setStep(0)}
              className="mt-8 text-sm font-bold text-gray-500 hover:text-white transition-colors block mx-auto uppercase tracking-widest"
            >
              ← Go Back
            </button>
          )}

          {/* Progress dots */}
          <div className="flex justify-center gap-3 mt-10">
            {[0, 1].map((dot) => {
              const active = (dot === 0 && step === 0) || (dot === 1 && (step === '1A' || step === '1B'));
              return (
                <div
                  key={dot}
                  className={`h-1.5 rounded-full transition-all duration-500 ${active ? 'w-12 bg-blue-600' : 'w-2 bg-white/10'
                    }`}
                />
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default IntentGateway;
