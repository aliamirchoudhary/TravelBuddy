import { useEffect } from 'react'
import { useScroll, useTransform, motion } from 'framer-motion'
import LiveBackground from './LiveBackground.jsx'
import ParticleField from './ParticleField.jsx'
import Sidebar from './Sidebar.jsx'

export default function StitchShell({ children }) {
  const { scrollY } = useScroll()
  const y1 = useTransform(scrollY, [0, 1200], [0, -80])
  const y2 = useTransform(scrollY, [0, 1200], [0, 120])

  useEffect(() => {
    const unsub = scrollY.on('change', (y) => {
      document.body.style.setProperty('--scroll-amount', `${Math.min(1, y / 1200)}`)
    })
    return unsub
  }, [scrollY])

  return (
    <div className="stitch-shell">
      <LiveBackground accent="#81ecff" style={{ opacity: 0.35 }} />
      <ParticleField count={76} opacity={0.22} />
      <div className="grid-overlay" style={{ opacity: 0.11 }} />

      <motion.div
        className="stitch-pulse-ring"
        style={{ y: y1, x: y2 }}
        animate={{ opacity: [0.08, 0.26, 0.08] }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      />

      {/* Sidebar for larger screens */}
      <div className="hide-mobile">
        <Sidebar />
      </div>

      <div
        className="stitch-content"
        style={{
          position: 'relative',
          zIndex: 20,
          marginLeft: '280px', // Account for sidebar width
          minHeight: '100vh',
        }}
      >
        {children}
      </div>
    </div>
  )
}
