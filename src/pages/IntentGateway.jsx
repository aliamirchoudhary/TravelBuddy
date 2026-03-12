import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import PageTransition from '../components/PageTransition.jsx'

const questions = [
  {
    id: 'q1',
    emoji: '🌍',
    question: 'Are you thinking of visiting somewhere?',
    sub: 'Help us understand your current travel intent',
    options: [
      { id: 'yes', emoji: '✈️', label: "Yes, I want to visit somewhere", next: 'q2' },
      { id: 'no', emoji: '🔭', label: "No, just exploring for now", next: null, redirect: '/social' },
      { id: 'skip', emoji: '👀', label: "Skip — show me everything", next: null, redirect: '/' },
    ]
  },
  {
    id: 'q2',
    emoji: '🗺️',
    question: 'Do you have a destination in mind?',
    sub: 'This helps us personalise your planning tools',
    options: [
      { id: 'has_dest', emoji: '📍', label: "Yes, I know where I'm going", next: null, redirect: '/plan' },
      { id: 'no_dest', emoji: '🧭', label: "Not yet — I need inspiration", next: null, redirect: '/explore' },
    ]
  }
]

export default function IntentGateway() {
  const [currentQ, setCurrentQ] = useState('q1')
  const [selected, setSelected] = useState(null)
  const [history, setHistory] = useState([])
  const navigate = useNavigate()

  const question = questions.find(q => q.id === currentQ)

  const handleSelect = (option) => {
    setSelected(option.id)
    setTimeout(() => {
      if (option.next) {
        setHistory(h => [...h, currentQ])
        setCurrentQ(option.next)
        setSelected(null)
      } else if (option.redirect) {
        navigate(option.redirect)
      }
    }, 400)
  }

  const goBack = () => {
    if (history.length === 0) { navigate('/'); return }
    const prev = history[history.length - 1]
    setHistory(h => h.slice(0, -1))
    setCurrentQ(prev)
    setSelected(null)
  }

  return (
    <PageTransition>
      <div style={{
        minHeight: '100vh',
        background: 'var(--ink)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(80px, 12vw, 140px) clamp(20px, 5vw, 40px)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 70% 60% at 50% 40%, rgba(26,110,181,0.08) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `
            linear-gradient(rgba(255,253,248,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,253,248,0.02) 1px, transparent 1px)
          `,
          backgroundSize: '50px 50px',
        }} />

        {/* Back button */}
        <button
          onClick={goBack}
          style={{
            position: 'absolute', top: 30, left: 'clamp(20px, 5vw, 60px)',
            display: 'flex', alignItems: 'center', gap: 8,
            color: 'rgba(247,244,238,0.4)',
            fontFamily: 'var(--font-heading)',
            fontSize: 12, fontWeight: 600,
            letterSpacing: 1,
            transition: 'color 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--paper)'}
          onMouseLeave={e => e.currentTarget.style.color = 'rgba(247,244,238,0.4)'}
        >
          <ArrowLeft size={14} /> Back
        </button>

        {/* Progress dots */}
        <div style={{
          position: 'absolute', top: 30,
          display: 'flex', gap: 8,
        }}>
          {questions.map((q) => (
            <div key={q.id} style={{
              width: q.id === currentQ ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: q.id === currentQ
                ? 'var(--accent)'
                : history.includes(q.id)
                  ? 'rgba(232,84,26,0.4)'
                  : 'rgba(255,253,248,0.1)',
              transition: 'all 0.3s ease',
            }} />
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={currentQ}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.35, ease: [0.4, 0, 0.2, 1] }}
            style={{ maxWidth: 560, width: '100%', position: 'relative', zIndex: 1 }}
          >
            {/* Emoji */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: 'spring', stiffness: 400, damping: 20, delay: 0.1 }}
              style={{
                fontSize: 52,
                textAlign: 'center',
                marginBottom: 24,
                display: 'block',
              }}
            >
              {question.emoji}
            </motion.div>

            {/* Question */}
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(26px, 5vw, 40px)',
              fontWeight: 700,
              color: 'var(--paper)',
              textAlign: 'center',
              lineHeight: 1.15,
              marginBottom: 10,
              letterSpacing: '-0.02em',
            }}>
              {question.question}
            </h1>
            <p style={{
              textAlign: 'center',
              color: 'rgba(247,244,238,0.4)',
              fontSize: 14,
              marginBottom: 36,
              lineHeight: 1.6,
            }}>
              {question.sub}
            </p>

            {/* Options */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {question.options.map((option, i) => (
                <motion.button
                  key={option.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.15 + i * 0.07 }}
                  onClick={() => handleSelect(option)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16,
                    padding: '18px 22px',
                    background: selected === option.id
                      ? 'rgba(232,84,26,0.12)'
                      : 'rgba(255,253,248,0.04)',
                    border: selected === option.id
                      ? '1.5px solid rgba(232,84,26,0.5)'
                      : '1.5px solid rgba(255,253,248,0.08)',
                    borderRadius: 'var(--r-md)',
                    cursor: 'pointer',
                    textAlign: 'left',
                    transition: 'all 0.2s ease',
                    width: '100%',
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onMouseEnter={e => {
                    if (selected !== option.id) {
                      e.currentTarget.style.borderColor = 'rgba(255,253,248,0.2)'
                      e.currentTarget.style.background = 'rgba(255,253,248,0.07)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (selected !== option.id) {
                      e.currentTarget.style.borderColor = 'rgba(255,253,248,0.08)'
                      e.currentTarget.style.background = 'rgba(255,253,248,0.04)'
                    }
                  }}
                >
                  <span style={{ fontSize: 26 }}>{option.emoji}</span>
                  <span style={{
                    fontFamily: 'var(--font-heading)',
                    fontSize: 15,
                    fontWeight: 600,
                    color: selected === option.id ? 'var(--accent)' : 'var(--paper)',
                    flex: 1,
                  }}>
                    {option.label}
                  </span>
                  <motion.div
                    animate={{ x: selected === option.id ? 4 : 0 }}
                  >
                    <ChevronRight size={16} style={{
                      color: selected === option.id ? 'var(--accent)' : 'rgba(247,244,238,0.2)',
                    }} />
                  </motion.div>
                </motion.button>
              ))}
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </PageTransition>
  )
}
