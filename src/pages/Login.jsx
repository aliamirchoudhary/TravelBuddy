import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'
import PageTransition from '../components/PageTransition.jsx'
import ParticleField from '../components/ParticleField.jsx'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) { toast.error('Please fill in all fields'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    login({ name: form.email.split('@')[0], email: form.email, role: 'traveler' })
    toast.success('Welcome back, explorer!')
    navigate('/')
    setLoading(false)
  }

  return (
    <PageTransition>
      <div style={{
        minHeight: '100vh', background: 'var(--ink)',
        display: 'grid', gridTemplateColumns: '1fr 1fr',
      }}>
        {/* Left — Decorative */}
        <div style={{
          background: 'var(--surface)',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: 60,
          position: 'relative', overflow: 'hidden',
        }} className="hide-mobile">
          <ParticleField count={40} opacity={0.6} />
          <div className="grid-overlay" />
          {/* Cyan orb */}
          <div style={{
            position: 'absolute', top: -100, right: -80,
            width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(0,212,255,0.1) 0%, transparent 70%)',
            filter: 'blur(50px)',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 60, textDecoration: 'none' }}>
              <div style={{
                width: 40, height: 40, background: 'var(--accent)', borderRadius: 10,
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                boxShadow: '0 0 20px rgba(0,212,255,0.4)',
              }}>✈️</div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 20, color: 'var(--paper)' }}>
                Travel<span style={{ color: 'var(--accent)' }}>Buddy</span>
              </span>
            </Link>

            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 800,
              fontSize: 'clamp(32px,4vw,52px)',
              color: 'var(--paper)', lineHeight: 1.05, marginBottom: 16,
              letterSpacing: '-0.03em',
            }}>
              Welcome<br />back,<br /><span style={{ color: 'var(--accent)' }}>explorer.</span>
            </h2>
            <p style={{ color: 'var(--paper-muted)', fontSize: 15, lineHeight: 1.8, maxWidth: 320, marginBottom: 40 }}>
              Your next adventure is waiting. Sign in to access your trips, buddies, and the travel community.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {[
                { emoji: '🌍', text: '195+ countries in our database' },
                { emoji: '🤝', text: '12,000+ successful buddy matches' },
                { emoji: '⭐', text: '4.9 avg rating from 50k travelers' },
              ].map(({ emoji, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 36, height: 36,
                    background: 'var(--accent-dim)', border: '1px solid var(--border-cyan)',
                    borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16,
                  }}>{emoji}</div>
                  <span style={{ color: 'var(--paper-muted)', fontSize: 13 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Form */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center',
          padding: 'clamp(40px,8vw,80px)',
          background: 'var(--ink)',
          position: 'relative',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ maxWidth: 380, width: '100%', margin: '0 auto' }}
          >
            {/* Mobile logo */}
            <div className="hide-desktop" style={{ marginBottom: 32 }}>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
                <div style={{ width: 34, height: 34, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✈️</div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 17, color: 'var(--paper)' }}>
                  Travel<span style={{ color: 'var(--accent)' }}>Buddy</span>
                </span>
              </Link>
            </div>

            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 800, color: 'var(--paper)', marginBottom: 6 }}>
              Sign in
            </h1>
            <p style={{ color: 'var(--paper-dim)', fontSize: 13, marginBottom: 32 }}>
              New here? <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 600 }}>Create an account</Link>
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Email */}
              <div>
                <label style={{ fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--paper-dim)', display: 'block', marginBottom: 8 }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--paper-dim)' }} />
                  <input className="input" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} style={{ paddingLeft: 44 }} />
                </div>
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={{ fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--paper-dim)' }}>Password</label>
                  <a href="#" style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 600 }}>Forgot?</a>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'var(--paper-dim)' }} />
                  <input className="input" type={showPass ? 'text' : 'password'} name="password" placeholder="••••••••" value={form.password} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} style={{ paddingLeft: 44, paddingRight: 44 }} />
                  <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--paper-dim)', transition: 'color 0.2s' }}
                    onMouseEnter={e => e.currentTarget.style.color = 'var(--paper)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'var(--paper-dim)'}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <motion.button type="submit" disabled={loading} className="btn btn-primary" style={{ marginTop: 8, width: '100%', justifyContent: 'center', padding: '14px 20px', fontSize: 14 }} whileTap={{ scale: 0.98 }}>
                {loading
                  ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: 16, height: 16, border: '2px solid rgba(5,11,20,0.3)', borderTopColor: 'var(--ink)', borderRadius: '50%' }} />
                  : <><span>Sign In</span><ArrowRight size={15} /></>
                }
              </motion.button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
              <span style={{ color: 'var(--paper-dim)', fontSize: 10, fontFamily: 'var(--font-heading)', letterSpacing: 2 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
            </div>

            {[{ emoji: '🔵', provider: 'Google' }, { emoji: '⚫', provider: 'GitHub' }].map(({ emoji, provider }) => (
              <button key={provider} style={{
                width: '100%', padding: '12px 20px', marginBottom: 8,
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                background: 'rgba(255,255,255,0.04)', border: '1px solid var(--border)',
                borderRadius: 'var(--r-md)', color: 'var(--paper)',
                fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 600,
                cursor: 'pointer', transition: 'all 0.2s',
              }}
                onMouseEnter={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.07)'; e.currentTarget.style.borderColor = 'var(--border-cyan)' }}
                onMouseLeave={e => { e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; e.currentTarget.style.borderColor = 'var(--border)' }}
              >
                <span>{emoji}</span> Continue with {provider}
              </button>
            ))}
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}
