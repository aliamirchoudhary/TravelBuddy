import { Link, useLocation } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Home, TrendingUp, Map, Users, MessageCircle, Video, Settings, User } from 'lucide-react'

const sidebarLinks = [
  { to: '/', label: 'Feed', icon: Home },
  { to: '/explore', label: 'Explore', icon: TrendingUp },
  { to: '/plan', label: 'Map', icon: Map },
  { to: '/buddy', label: 'Buddies', icon: Users },
  { to: '/social', label: 'Community', icon: MessageCircle },
  { to: '/vloggers', label: 'Vlogs', icon: Video },
]

export default function Sidebar() {
  const location = useLocation()

  return (
    <motion.aside
      initial={{ x: -280 }}
      animate={{ x: 0 }}
      transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      className="glass"
      style={{
        position: 'fixed',
        left: 0,
        top: 72,
        bottom: 0,
        width: 280,
        zIndex: 900,
        borderRight: '1px solid var(--border)',
        padding: '32px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
      }}
    >
      {/* Navigation Links */}
      <nav style={{ flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sidebarLinks.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to || location.pathname.startsWith(to + '/')
            return (
              <Link
                key={to}
                to={to}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 12,
                  padding: '12px 16px',
                  borderRadius: 'var(--r-md)',
                  background: active ? 'rgba(129,236,255,0.08)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--paper-muted)',
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'none',
                  border: active ? '1px solid rgba(129,236,255,0.2)' : '1px solid transparent',
                  transition: 'all 0.2s',
                }}
              >
                <Icon size={18} />
                {label}
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16 }}>
        <Link
          to="/profile"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            borderRadius: 'var(--r-md)',
            color: 'var(--paper-muted)',
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--paper)'
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--paper-muted)'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <User size={18} />
          Profile
        </Link>

        <Link
          to="/settings"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            padding: '12px 16px',
            borderRadius: 'var(--r-md)',
            color: 'var(--paper-muted)',
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'all 0.2s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.color = 'var(--paper)'
            e.currentTarget.style.background = 'rgba(255,255,255,0.04)'
          }}
          onMouseLeave={e => {
            e.currentTarget.style.color = 'var(--paper-muted)'
            e.currentTarget.style.background = 'transparent'
          }}
        >
          <Settings size={18} />
          Settings
        </Link>
      </div>
    </motion.aside>
  )
}