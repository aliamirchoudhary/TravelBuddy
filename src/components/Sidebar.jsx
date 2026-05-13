import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Home, TrendingUp, Map, Users, MessageCircle, Video, Settings, User, ChevronLeft, ChevronRight } from 'lucide-react'
import useTripStore from '../store/tripStore'

const sidebarLinks = [
  { to: '/', label: 'Feed', icon: Home },
  { to: '/explore', label: 'Explore', icon: TrendingUp },
  { to: '/plan', label: 'Map', icon: Map },
  { to: '/buddy', label: 'Buddies', icon: Users },
  { to: '/social', label: 'Community', icon: MessageCircle },
  { to: '/messages', label: 'Messages', icon: MessageCircle },
  { to: '/vloggers', label: 'Vlogs', icon: Video },
]

export default function Sidebar({ isCollapsed = false, setIsCollapsed }) {
  const location = useLocation()
  const navigate = useNavigate()
  const { setActiveTab } = useTripStore()

  return (
    <motion.aside
      initial={{ width: 280 }}
      animate={{ width: isCollapsed ? 80 : 280 }}
      transition={{ duration: 0.3, ease: 'easeInOut' }}
      className="glass"
      style={{
        position: 'fixed',
        left: 0,
        top: 80,
        bottom: 0,
        zIndex: 900,
        borderRight: '1px solid var(--border)',
        padding: isCollapsed ? '32px 12px' : '32px 24px',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        overflow: 'hidden'
      }}
    >
      {/* Toggle Button */}
      <button
        onClick={() => setIsCollapsed(prev => !prev)}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          gap: 12,
          padding: isCollapsed ? '12px' : '10px 16px',
          borderRadius: 'var(--r-md)',
          background: 'rgba(255,255,255,0.03)',
          border: '1px solid var(--border)',
          color: 'var(--paper-muted)',
          cursor: 'pointer',
          marginBottom: 16,
          transition: 'all 0.2s',
          fontSize: 13,
          fontWeight: 700,
        }}
        onMouseEnter={e => {
          e.currentTarget.style.color = 'var(--paper)'
          e.currentTarget.style.background = 'rgba(255,255,255,0.06)'
        }}
        onMouseLeave={e => {
          e.currentTarget.style.color = 'var(--paper-muted)'
          e.currentTarget.style.background = 'rgba(255,255,255,0.03)'
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {isCollapsed ? <ChevronRight size={18} style={{ margin: '0 auto' }} /> : <ChevronLeft size={18} />}
          {!isCollapsed && <span>Collapse Sidebar</span>}
        </div>
      </button>

      {/* Navigation Links */}
      <nav style={{ flex: 1 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {sidebarLinks.map(({ to, label, icon: Icon }) => {
            const active = location.pathname === to || location.pathname.startsWith(to + '/')

            // Map button → TripPlanner routes tab
            const handleClick = (e) => {
              if (label === 'Map') {
                e.preventDefault()
                setActiveTab('routes')
                navigate('/TripPlanner')
              }
            }

            return (
              <Link
                key={to}
                to={to}
                onClick={handleClick}
                title={isCollapsed ? label : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: isCollapsed ? 'center' : 'flex-start',
                  gap: 12,
                  padding: isCollapsed ? '12px' : '12px 16px',
                  borderRadius: 'var(--r-md)',
                  background: active ? 'rgba(129,236,255,0.08)' : 'transparent',
                  color: active ? 'var(--accent)' : 'var(--paper-muted)',
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'none',
                  border: active ? '1px solid rgba(129,236,255,0.2)' : '1px solid transparent',
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap'
                }}
              >
                <Icon size={18} style={{ flexShrink: 0 }} />
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.span
                      key="label"
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )
          })}
        </div>
      </nav>

      {/* Bottom Actions */}
      <div style={{ borderTop: '1px solid var(--border)', paddingTop: 16, display: 'flex', flexDirection: 'column', gap: 4 }}>
        <Link
          to="/profile"
          title={isCollapsed ? "Profile" : undefined}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: 12,
            padding: isCollapsed ? '12px' : '12px 16px',
            borderRadius: 'var(--r-md)',
            color: 'var(--paper-muted)',
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap'
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
          <User size={18} style={{ flexShrink: 0 }} />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                key="profile-label"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
              >
                Profile
              </motion.span>
            )}
          </AnimatePresence>
        </Link>

        <div
          title={isCollapsed ? "Settings — Coming Soon" : "Coming Soon"}
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'flex-start',
            gap: 12,
            padding: isCollapsed ? '12px' : '12px 16px',
            borderRadius: 'var(--r-md)',
            color: 'var(--paper-muted)',
            fontSize: 14,
            fontWeight: 600,
            textDecoration: 'none',
            transition: 'all 0.2s',
            whiteSpace: 'nowrap',
            opacity: 0.4,
            cursor: 'not-allowed',
          }}
        >
          <Settings size={18} style={{ flexShrink: 0 }} />
          <AnimatePresence>
            {!isCollapsed && (
              <motion.span
                key="settings-label"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: 'auto' }}
                exit={{ opacity: 0, width: 0 }}
                style={{ overflow: 'hidden', whiteSpace: 'nowrap' }}
              >
                Settings
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.aside>
  )
}