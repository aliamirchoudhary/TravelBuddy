import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Rss, TrendingUp, Map, MessageCircle, Settings, Video } from 'lucide-react'

const items = [
  { to: '/social', label: 'Feed', icon: Rss },
  { to: '/explore', label: 'Trending', icon: TrendingUp },
  { to: '/buddy', label: 'Map', icon: Map },
  { to: '/messages', label: 'Inbox', icon: MessageCircle },
  { to: '/profile', label: 'Settings', icon: Settings },
]

export default function StudioSidebar({ activeOverride }) {
  const location = useLocation()

  return (
    <aside
      className="hide-mobile"
      style={{
        width: 240,
        flexShrink: 0,
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        padding: '20px 14px',
        borderRadius: 'var(--r-panel)',
        background: 'var(--surface-elevated)',
        border: '1px solid var(--border)',
        boxShadow: 'var(--shadow-card)',
        minHeight: 420,
      }}
    >
      <div
        style={{
          fontFamily: 'var(--font-heading)',
          fontSize: 10,
          fontWeight: 700,
          letterSpacing: 2,
          textTransform: 'uppercase',
          color: 'var(--paper-dim)',
          padding: '0 8px 8px',
        }}
      >
        Creator Studio
      </div>
      <nav style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
        {items.map(({ to, label, icon: Icon }) => {
          const active =
            activeOverride === to ||
            location.pathname === to ||
            (to !== '/' && location.pathname.startsWith(to))
          return (
            <Link key={to} to={to} style={{ textDecoration: 'none' }}>
              <motion.div
                whileHover={{ x: 3 }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 14px',
                  borderRadius: 14,
                  position: 'relative',
                  background: active ? 'rgba(45,212,191,0.08)' : 'transparent',
                  border: active ? '1px solid rgba(45,212,191,0.2)' : '1px solid transparent',
                  color: active ? 'var(--accent)' : 'var(--paper-muted)',
                  fontFamily: 'var(--font-heading)',
                  fontSize: 13,
                  fontWeight: 600,
                  boxShadow: active ? '0 0 24px rgba(45,212,191,0.12)' : 'none',
                }}
              >
                {active && (
                  <span
                    style={{
                      position: 'absolute',
                      right: 0,
                      top: 8,
                      bottom: 8,
                      width: 3,
                      borderRadius: 2,
                      background: 'var(--accent)',
                      boxShadow: '0 0 12px var(--accent)',
                    }}
                  />
                )}
                <Icon size={18} strokeWidth={2} />
                {label}
              </motion.div>
            </Link>
          )
        })}
      </nav>

      <div style={{ flex: 1 }} />

      <div
        style={{
          padding: 16,
          borderRadius: 18,
          background: 'linear-gradient(145deg, rgba(45,212,191,0.08) 0%, rgba(15,23,42,0.9) 100%)',
          border: '1px solid var(--border-cyan)',
        }}
      >
        <p style={{ fontFamily: 'var(--font-heading)', fontSize: 12, fontWeight: 700, color: 'var(--paper)', marginBottom: 6 }}>
          Go live from anywhere
        </p>
        <p style={{ fontSize: 11, color: 'var(--paper-muted)', marginBottom: 12, lineHeight: 1.5 }}>
          Stream trips and sell guides from the Vlogger Hub.
        </p>
        <Link
          to="/vloggers"
          className="btn btn-primary"
          style={{
            width: '100%',
            justifyContent: 'center',
            padding: '11px 16px',
            fontSize: 12,
            boxShadow: '0 0 28px rgba(45,212,191,0.35)',
          }}
        >
          <Video size={14} /> Go Live
        </Link>
      </div>
    </aside>
  )
}
