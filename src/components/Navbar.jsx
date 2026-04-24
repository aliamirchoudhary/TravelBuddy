import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { Menu, X, Compass, Map, Users, MessageCircle, Video, Search, Bell, User, ChevronRight } from 'lucide-react'

const navLinks = [
  { to: '/explore',  label: 'Explore',   icon: Compass },
  { to: '/plan',     label: 'Maps',      icon: Map },
  { to: '/buddy',    label: 'Buddies',   icon: Users },
  { to: '/social',   label: 'Community', icon: MessageCircle },
  { to: '/vloggers', label: 'Vlogs',     icon: Video },
]

export default function Navbar() {
  const [scrolled, setScrolled]   = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [q, setQ] = useState('')
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12)
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const submitSearch = (e) => {
    e.preventDefault()
    const t = q.trim()
    if (!t) return
    navigate(`/explore?q=${encodeURIComponent(t)}`)
    setQ('')
  }

  return (
    <>
      <motion.nav
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ duration: 0.55, ease: [0.4, 0, 0.2, 1] }}
        className="glass"
        style={{
          position: 'fixed', top: 0, left: 0, right: 0, zIndex: 1000,
          height: 72,
          borderBottom: scrolled ? '1px solid var(--border-cyan)' : '1px solid var(--border)',
          transition: 'all 0.3s ease',
        }}
      >
        <div className="container" style={{
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 16,
          padding: '0 24px',
        }}>
          {/* Logo */}
          <Link to="/" style={{
            display: 'flex', alignItems: 'center', gap: 12,
            textDecoration: 'none', flexShrink: 0
          }}>
            <div style={{
              width: 40, height: 40,
              background: 'var(--grad-cyan)',
              borderRadius: 'var(--r-md)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 18, fontWeight: 900,
              color: 'var(--ink)',
              boxShadow: 'var(--shadow-cyan)',
            }}>A</div>
            <span className="display-heading" style={{
              fontSize: 20, color: 'var(--paper)',
              letterSpacing: '-0.03em',
            }}>
              Auteur
            </span>
          </Link>

          {/* Desktop Nav Links */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, flex: 1,
            justifyContent: 'center'
          }} className="hide-mobile">
            {navLinks.map(({ to, label }) => {
              const active = location.pathname === to || location.pathname.startsWith(to + '/')
              return (
                <Link
                  key={to} to={to}
                  className="btn-ghost"
                  style={{
                    fontSize: 13, fontWeight: 600,
                    color: active ? 'var(--accent)' : 'var(--paper-muted)',
                    borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
                    transition: 'all 0.2s',
                  }}
                >
                  {label}
                </Link>
              )
            })}
          </div>

          {/* Right Actions */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0
          }} className="hide-mobile">
            {/* Search */}
            <form onSubmit={submitSearch} style={{ width: 240 }}>
              <div style={{ position: 'relative' }}>
                <Search size={14} style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--paper-dim)'
                }} />
                <input
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  placeholder="Search destinations..."
                  aria-label="Search"
                  className="input"
                  style={{
                    paddingLeft: 42, borderRadius: 100, fontSize: 13,
                    background: 'rgba(255,255,255,0.04)',
                    border: '1px solid var(--border)',
                  }}
                />
              </div>
            </form>

            {/* Notifications */}
            <button
              type="button"
              title="Notifications"
              className="btn-ghost"
              style={{
                width: 40, height: 40, borderRadius: '50%',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                border: '1px solid var(--border)',
              }}
            >
              <Bell size={16} />
            </button>

            {/* Profile */}
            <Link
              to="/profile"
              style={{
                width: 40, height: 40, borderRadius: '50%',
                background: 'var(--grad-orange)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 14, fontWeight: 800, color: 'var(--paper)',
                textDecoration: 'none',
                boxShadow: 'var(--shadow-orange)',
              }}
            >
              <User size={16} />
            </Link>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="hide-desktop btn-ghost"
            onClick={() => setMobileOpen(o => !o)}
            style={{ padding: 8 }}
          >
            {mobileOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </motion.nav>

      {/* Mobile Menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.25 }}
            className="glass"
            style={{
              position: 'fixed', top: 72, left: 0, right: 0, zIndex: 999,
              borderBottom: '1px solid var(--border-cyan)',
              padding: '24px',
            }}
          >
            {/* Mobile Search */}
            <form onSubmit={submitSearch} style={{ marginBottom: 20 }}>
              <div style={{ position: 'relative' }}>
                <Search size={15} style={{
                  position: 'absolute', left: 14, top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--paper-dim)'
                }} />
                <input
                  className="input"
                  placeholder="Search destinations..."
                  value={q}
                  onChange={e => setQ(e.target.value)}
                  style={{ paddingLeft: 42, borderRadius: 100 }}
                />
              </div>
            </form>

            {/* Mobile Nav Links */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {navLinks.map(({ to, label, icon: Icon }) => {
                const active = location.pathname === to
                return (
                  <Link
                    key={to} to={to}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 12,
                      padding: '14px 16px',
                      borderRadius: 'var(--r-md)',
                      background: active ? 'rgba(129,236,255,0.08)' : 'transparent',
                      color: active ? 'var(--accent)' : 'var(--paper)',
                      fontSize: 15, fontWeight: 600,
                      border: active ? '1px solid rgba(129,236,255,0.2)' : '1px solid transparent',
                      transition: 'all 0.2s',
                      textDecoration: 'none',
                    }}
                  >
                    <Icon size={16} />
                    {label}
                  </Link>
                )
              })}
            </div>

            {/* Mobile Auth Buttons */}
            <div style={{ display: 'flex', gap: 12, marginTop: 24 }}>
              <Link to="/login" className="btn btn-outline" style={{
                flex: 1, justifyContent: 'center', fontSize: 14
              }}>Sign In</Link>
              <Link to="/gateway" className="btn btn-primary" style={{
                flex: 1, justifyContent: 'center', fontSize: 14
              }}>Get Started <ChevronRight size={14} /></Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
