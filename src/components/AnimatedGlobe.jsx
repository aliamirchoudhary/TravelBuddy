import { useRef, useEffect } from 'react'
import { motion } from 'framer-motion'

/**
 * AnimatedGlobe — CSS + SVG based animated globe visual.
 * No Three.js dependency — uses CSS 3D transforms and SVG arcs.
 * Glows cyan, rotates slowly, used in Landing hero.
 */
export default function AnimatedGlobe() {
  const globeRef = useRef(null)

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 1.2, delay: 0.4, ease: [0.4, 0, 0.2, 1] }}
      style={{
        position: 'relative',
        width: 400,
        height: 400,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Outer glow ring */}
      <div style={{
        position: 'absolute',
        inset: -20,
        borderRadius: '50%',
        background: 'radial-gradient(circle, rgba(0,212,255,0.08) 0%, transparent 70%)',
        animation: 'breathe 4s ease-in-out infinite',
      }} />

      {/* The globe SVG */}
      <svg
        width="360"
        height="360"
        viewBox="0 0 360 360"
        style={{ animation: 'spin-slow 30s linear infinite' }}
      >
        {/* Base sphere */}
        <defs>
          <radialGradient id="globeGrad" cx="35%" cy="35%" r="65%">
            <stop offset="0%" stopColor="rgba(0,212,255,0.15)" />
            <stop offset="60%" stopColor="rgba(0,80,160,0.08)" />
            <stop offset="100%" stopColor="rgba(5,11,20,0.2)" />
          </radialGradient>
          <radialGradient id="glowGrad" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(0,212,255,0.06)" />
            <stop offset="100%" stopColor="transparent" />
          </radialGradient>
        </defs>

        {/* Sphere fill */}
        <circle cx="180" cy="180" r="170" fill="url(#globeGrad)" stroke="rgba(0,212,255,0.25)" strokeWidth="1" />

        {/* Latitude lines */}
        {[-60, -30, 0, 30, 60].map((lat, i) => {
          const y = 180 + (lat / 90) * 170
          const rx = Math.cos((lat * Math.PI) / 180) * 170
          return (
            <ellipse
              key={i}
              cx="180" cy={y}
              rx={rx} ry={rx * 0.25}
              fill="none"
              stroke="rgba(0,212,255,0.18)"
              strokeWidth="0.7"
            />
          )
        })}

        {/* Longitude lines */}
        {[0, 30, 60, 90, 120, 150].map((lon, i) => (
          <ellipse
            key={i}
            cx="180" cy="180"
            rx={10 + (i % 2) * 5} ry="170"
            fill="none"
            stroke="rgba(0,212,255,0.15)"
            strokeWidth="0.7"
            transform={`rotate(${lon} 180 180)`}
          />
        ))}

        {/* Highlight dots (destinations) */}
        {[
          { x: 220, y: 130 }, { x: 160, y: 200 }, { x: 250, y: 200 },
          { x: 130, y: 160 }, { x: 200, y: 250 }, { x: 290, y: 170 },
        ].map((dot, i) => (
          <circle
            key={i}
            cx={dot.x} cy={dot.y}
            r="4"
            fill="var(--accent)"
            opacity="0.9"
          >
            <animate
              attributeName="r"
              values="3;5;3"
              dur={`${2 + i * 0.4}s`}
              repeatCount="indefinite"
            />
            <animate
              attributeName="opacity"
              values="0.5;1;0.5"
              dur={`${2 + i * 0.4}s`}
              repeatCount="indefinite"
            />
          </circle>
        ))}

        {/* Outer glow circle */}
        <circle cx="180" cy="180" r="172" fill="none" stroke="rgba(0,212,255,0.3)" strokeWidth="1.5" />
      </svg>

      {/* Floating stat badges */}
      {[
        { label: '195+', sub: 'Countries', top: '8%', left: '-12%', delay: 0.6 },
        { label: '50k+', sub: 'Travelers', top: '75%', right: '-10%', delay: 0.8 },
        { label: '4.9★', sub: 'Rating',    top: '20%', right: '-8%', delay: 1.0 },
      ].map(({ label, sub, delay, ...pos }, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay, duration: 0.5 }}
          style={{
            position: 'absolute',
            ...Object.fromEntries(Object.entries(pos).filter(([k]) => ['top','left','right','bottom'].includes(k))),
            background: 'rgba(10,22,40,0.85)',
            backdropFilter: 'blur(12px)',
            border: '1px solid rgba(0,212,255,0.25)',
            borderRadius: 12,
            padding: '10px 16px',
            textAlign: 'center',
            boxShadow: '0 4px 24px rgba(0,0,0,0.4)',
          }}
        >
          <div style={{
            fontFamily: 'var(--font-display)',
            fontSize: 18, fontWeight: 800,
            color: 'var(--accent)',
            lineHeight: 1,
          }}>{label}</div>
          <div style={{
            fontFamily: 'var(--font-heading)',
            fontSize: 9, fontWeight: 600,
            letterSpacing: 1.5,
            textTransform: 'uppercase',
            color: 'rgba(255,255,255,0.45)',
            marginTop: 4,
          }}>{sub}</div>
        </motion.div>
      ))}
    </motion.div>
  )
}
