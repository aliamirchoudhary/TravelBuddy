import { useEffect, useState } from 'react'
import { useScroll, useTransform, motion } from 'framer-motion'
import LiveBackground from './LiveBackground.jsx'
import ParticleField from './ParticleField.jsx'
import Sidebar from './Sidebar.jsx'

export default function StitchShell({ children }) {
  const [isCollapsed, setIsCollapsed] = useState(false)
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
        <Sidebar isCollapsed={isCollapsed} setIsCollapsed={setIsCollapsed} />
      </div>

      <motion.div
        className="stitch-content"
        animate={{ marginLeft: isCollapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        style={{
          position: 'relative',
          zIndex: 20,
          minHeight: '100vh',
        }}
      >
        {children}
      </motion.div>
    </div>
  )
}
