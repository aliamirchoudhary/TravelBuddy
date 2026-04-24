import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight, ArrowLeft } from 'lucide-react'
import PageTransition from '../components/PageTransition.jsx'
import ParticleField from '../components/ParticleField.jsx'

const questions = [
  {
    id: 'q1',
    emoji: '🌍',
    question: 'Are you thinking of visiting somewhere?',
    sub: 'Help us understand your current travel intent',
    options: [
      { id: 'yes',  emoji: '✈️', label: 'Yes, I want to visit somewhere',  next: 'q2',  color: 'var(--accent)' },
      { id: 'no',   emoji: '🔭', label: 'No, just exploring for now',      next: null, redirect: '/social',  color: 'var(--accent3)' },
      { id: 'skip', emoji: '👀', label: 'Skip — show me everything',        next: null, redirect: '/',        color: 'var(--accent5)' },
    ]
  },
  {
    id: 'q2',
    emoji: '🗺️',
    question: 'Do you have a destination in mind?',
    sub: 'This helps us personalise your planning tools',
    options: [
      { id: 'has_dest', emoji: '📍', label: "Yes, I know where I'm going",    next: null, redirect: '/plan',    color: 'var(--accent)' },
      { id: 'no_dest',  emoji: '🧭', label: 'Not yet — I need inspiration',   next: null, redirect: '/explore', color: '#FF61D8' },
    ]
  }
]

export default function IntentGateway() {
  const [currentQ, setCurrentQ] = useState('q1')
  const [selected,  setSelected] = useState(null)
  const [history,   setHistory]  = useState([])
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
        minHeight: '100vh', background: 'var(--ink)',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(80px,12vw,140px) clamp(20px,5vw,40px)',
        position: 'relative', overflow: 'hidden',
      }}>
        <ParticleField count={60} />
        <div className="grid-overlay" />

        {/* Cyan orb center */}
        <div style={{
          position: 'absolute', top: '30%', left: '50%',
          transform: 'translate(-50%,-50%)',
          width: 600, height: 600, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(0,212,255,0.05) 0%, transparent 70%)',
          filter: 'blur(80px)', pointerEvents: 'none',
        }} />

        {/* Back button */}
        <button onClick={goBack} style={{
          position: 'absolute', top: 30, left: 'clamp(20px,5vw,60px)',
          display: 'flex', alignItems: 'center', gap: 8,
          color: 'var(--paper-dim)', fontFamily: 'var(--font-heading)',
          fontSize: 12, fontWeight: 600, letterSpacing: 1,
          transition: 'color 0.2s', zIndex: 10,
        }}
          onMouseEnter={e => e.currentTarget.style.color = 'var(--paper)'}
          onMouseLeave={e => e.currentTarget.style.color = 'var(--paper-dim)'}
        >
          <ArrowLeft size={14} /> Back
        </button>

        {/* Progress dots */}
        <div style={{ position: 'absolute', top: 32, display: 'flex', gap: 8, zIndex: 10 }}>
          {questions.map((q) => (
            <div key={q.id} style={{
              width: q.id === currentQ ? 28 : 8,
              height: 8, borderRadius: 4,
              background: q.id === currentQ
                ? 'var(--accent)'
                : history.includes(q.id)
                  ? 'rgba(0,212,255,0.35)'
                  : 'rgba(255,255,255,0.1)',
              boxShadow: q.id === currentQ ? '0 0 10px rgba(0,212,255,0.5)' : 'none',
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
                fontSize: 56, textAlign: 'center', marginBottom: 24, display: 'block',
                filter: 'drop-shadow(0 0 20px rgba(0,212,255,0.2))',
              }}
            >
              {question.emoji}
            </motion.div>

            {/* Question */}
            <h1 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(26px,5vw,42px)', fontWeight: 800,
              color: 'var(--paper)', textAlign: 'center',
              lineHeight: 1.1, marginBottom: 10, letterSpacing: '-0.02em',
            }}>
              {question.question}
            </h1>
            <p style={{ textAlign: 'center', color: 'var(--paper-muted)', fontSize: 14, marginBottom: 40, lineHeight: 1.6 }}>
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
                      ? `${option.color}15`
                      : 'rgba(255,255,255,0.03)',
                    border: selected === option.id
                      ? `1.5px solid ${option.color}60`
                      : '1.5px solid var(--border)',
                    borderRadius: 'var(--r-md)',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.2s ease', width: '100%',
                    boxShadow: selected === option.id ? `0 0 24px ${option.color}20` : 'none',
                  }}
                  whileHover={{ scale: 1.01 }}
                  whileTap={{ scale: 0.99 }}
                  onMouseEnter={e => {
                    if (selected !== option.id) {
                      e.currentTarget.style.borderColor = `${option.color}40`
                      e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
                    }
                  }}
                  onMouseLeave={e => {
                    if (selected !== option.id) {
                      e.currentTarget.style.borderColor = 'var(--border)'
                      e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
                    }
                  }}
                >
                  <span style={{ fontSize: 26 }}>{option.emoji}</span>
                  <span style={{
                    fontFamily: 'var(--font-heading)', fontSize: 15, fontWeight: 700,
                    color: selected === option.id ? option.color : 'var(--paper)', flex: 1,
                  }}>
                    {option.label}
                  </span>
                  <motion.div animate={{ x: selected === option.id ? 4 : 0 }}>
                    <ChevronRight size={16} style={{ color: selected === option.id ? option.color : 'var(--paper-dim)' }} />
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
