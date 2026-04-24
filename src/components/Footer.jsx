import { Link } from 'react-router-dom'
import { Twitter, Instagram, Github } from 'lucide-react'

const links = [
  { to: '/', label: 'Privacy' },
  { to: '/', label: 'Terms' },
  { to: '/', label: 'Safety' },
  { to: '/gateway', label: 'Join the Community' },
]

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--surface)',
      borderTop: '1px solid rgba(45,212,191,0.1)',
      padding: '28px 0 36px',
    }}>
      <div className="container">
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 20,
        }}>
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
            <div style={{
              width: 32, height: 32,
              background: 'linear-gradient(135deg, var(--accent), #0ea5e9)',
              borderRadius: 10,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 15,
              boxShadow: '0 0 16px rgba(45,212,191,0.3)',
            }}>✈️</div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 800, fontSize: 16,
              color: 'var(--paper)',
            }}>
              Travel<span style={{ color: 'var(--accent)' }}>Buddy</span>
            </span>
          </Link>

          <nav style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center' }}>
            {links.map(({ to, label }) => (
              <Link
                key={label}
                to={to}
                style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  color: 'var(--paper-dim)',
                  padding: '6px 12px',
                  borderRadius: 8,
                  transition: 'color 0.2s',
                }}
                onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent)' }}
                onMouseLeave={e => { e.currentTarget.style.color = 'var(--paper-dim)' }}
              >
                {label}
              </Link>
            ))}
          </nav>

          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {[Twitter, Instagram, Github].map((Icon, i) => (
              <button
                key={i}
                type="button"
                title="Social"
                style={{
                  width: 34, height: 34,
                  borderRadius: 10,
                  background: 'rgba(255,255,255,0.04)',
                  border: '1px solid var(--border)',
                  color: 'var(--paper-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  transition: 'all 0.2s',
                  cursor: 'pointer',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = 'rgba(45,212,191,0.35)'
                  e.currentTarget.style.color = 'var(--accent)'
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border)'
                  e.currentTarget.style.color = 'var(--paper-muted)'
                }}
              >
                <Icon size={14} />
              </button>
            ))}
          </div>
        </div>

        <div
          style={{
            marginTop: 22,
            paddingTop: 20,
            borderTop: '1px solid var(--border)',
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: 12,
            alignItems: 'center',
          }}
        >
          <p style={{ color: 'var(--paper-dim)', fontSize: 11, letterSpacing: 0.5 }}>
            © {new Date().getFullYear()} TravelBuddy. All rights reserved.
          </p>
          <p style={{ color: 'var(--paper-dim)', fontSize: 10, letterSpacing: 1.5, textTransform: 'uppercase' }}>
            The cinematic explorer — plan, connect, create.
          </p>
        </div>
      </div>
    </footer>
  )
}
