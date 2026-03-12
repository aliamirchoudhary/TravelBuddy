import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'
import PageTransition from '../components/PageTransition.jsx'

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.email || !form.password) {
      toast.error('Please fill in all fields')
      return
    }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1200))
    login({ name: form.email.split('@')[0], email: form.email, role: 'traveler' })
    toast.success('Welcome back, explorer!')
    navigate('/')
    setLoading(false)
  }

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  return (
    <PageTransition>
      <div style={{
        minHeight: '100vh',
        background: 'var(--ink)',
        display: 'grid',
        gridTemplateColumns: '1fr 1fr',
      }}>
        {/* Left — decorative */}
        <div style={{
          background: 'linear-gradient(145deg, #0d1a2e 0%, #1a0d08 100%)',
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: 60,
          position: 'relative', overflow: 'hidden',
        }} className="hide-mobile">
          {/* Decorative orbs */}
          <div style={{
            position: 'absolute', top: -100, left: -100,
            width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(232,84,26,0.15) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }} />
          <div style={{
            position: 'absolute', bottom: -80, right: -80,
            width: 350, height: 350, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(26,110,181,0.12) 0%, transparent 70%)',
            filter: 'blur(40px)',
          }} />

          {/* Grid */}
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `linear-gradient(rgba(255,253,248,0.025) 1px, transparent 1px),
            linear-gradient(90deg, rgba(255,253,248,0.025) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }} />

          <div style={{ position: 'relative', zIndex: 1 }}>
            <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 60 }}>
              <div style={{ width: 40, height: 40, background: 'var(--accent)', borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>✈️</div>
              <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--paper)' }}>
                Travel<span style={{ color: 'var(--accent)' }}>Buddy</span>
              </span>
            </Link>

            <h2 style={{
              fontFamily: 'var(--font-display)', fontWeight: 700,
              fontSize: 'clamp(32px, 4vw, 52px)',
              color: 'var(--paper)', lineHeight: 1.1, marginBottom: 16,
              letterSpacing: '-0.03em',
            }}>
              Welcome<br />back,<br /><span style={{ color: 'var(--accent)' }}>explorer.</span>
            </h2>
            <p style={{ color: 'rgba(247,244,238,0.45)', fontSize: 15, lineHeight: 1.8, maxWidth: 320 }}>
              Your next adventure is waiting. Sign in to access your trips, buddies, and the travel community.
            </p>

            {/* Social proof */}
            <div style={{
              marginTop: 48,
              display: 'flex', flexDirection: 'column', gap: 14,
            }}>
              {[
                { emoji: '🌍', text: '195+ countries in our database' },
                { emoji: '🤝', text: '12,000+ successful buddy matches' },
                { emoji: '⭐', text: '4.9 avg rating from 50k travelers' },
              ].map(({ emoji, text }) => (
                <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 34, height: 34,
                    background: 'rgba(255,253,248,0.04)',
                    border: '1px solid rgba(255,253,248,0.08)',
                    borderRadius: 8,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 16,
                  }}>{emoji}</div>
                  <span style={{ color: 'rgba(247,244,238,0.5)', fontSize: 13 }}>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — form */}
        <div style={{
          display: 'flex', flexDirection: 'column',
          justifyContent: 'center', padding: 'clamp(40px, 8vw, 80px)',
          background: '#0a0e1a',
        }}>
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            style={{ maxWidth: 380, width: '100%', margin: '0 auto' }}
          >
            <div className="hide-desktop" style={{ marginBottom: 32 }}>
              <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{ width: 34, height: 34, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16 }}>✈️</div>
                <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 17, color: 'var(--paper)' }}>
                  Travel<span style={{ color: 'var(--accent)' }}>Buddy</span>
                </span>
              </Link>
            </div>

            <h1 style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 26, fontWeight: 700,
              color: 'var(--paper)', marginBottom: 8,
            }}>Sign in</h1>
            <p style={{ color: 'rgba(247,244,238,0.4)', fontSize: 13, marginBottom: 32 }}>
              New here? <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 600 }}>Create an account</Link>
            </p>

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {/* Email */}
              <div>
                <label style={{ fontFamily: 'var(--font-heading)', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(247,244,238,0.4)', display: 'block', marginBottom: 8 }}>
                  Email
                </label>
                <div style={{ position: 'relative' }}>
                  <Mail size={15} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(247,244,238,0.25)' }} />
                  <input
                    className="input"
                    type="email" name="email"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                    style={{ paddingLeft: 44 }}
                  />
                </div>
              </div>

              {/* Password */}
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                  <label style={{ fontFamily: 'var(--font-heading)', fontSize: 11, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(247,244,238,0.4)' }}>
                    Password
                  </label>
                  <a href="#" style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 600 }}>Forgot?</a>
                </div>
                <div style={{ position: 'relative' }}>
                  <Lock size={15} style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)', color: 'rgba(247,244,238,0.25)' }} />
                  <input
                    className="input"
                    type={showPass ? 'text' : 'password'}
                    name="password"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={handleChange}
                    style={{ paddingLeft: 44, paddingRight: 44 }}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPass(v => !v)}
                    style={{
                      position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)',
                      color: 'rgba(247,244,238,0.25)', transition: 'color 0.2s',
                    }}
                    onMouseEnter={e => e.currentTarget.style.color = 'rgba(247,244,238,0.6)'}
                    onMouseLeave={e => e.currentTarget.style.color = 'rgba(247,244,238,0.25)'}
                  >
                    {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                style={{ marginTop: 8, width: '100%', justifyContent: 'center', padding: '14px 20px', fontSize: 14 }}
                whileTap={{ scale: 0.98 }}
              >
                {loading ? (
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }}
                  />
                ) : (
                  <><span>Sign In</span><ArrowRight size={15} /></>
                )}
              </motion.button>
            </form>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, margin: '24px 0' }}>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,253,248,0.08)' }} />
              <span style={{ color: 'rgba(247,244,238,0.25)', fontSize: 11, fontFamily: 'var(--font-heading)', letterSpacing: 1 }}>OR</span>
              <div style={{ flex: 1, height: 1, background: 'rgba(255,253,248,0.08)' }} />
            </div>

            {/* OAuth buttons */}
            {[
              { emoji: '🔵', provider: 'Google' },
              { emoji: '⚫', provider: 'GitHub' },
            ].map(({ emoji, provider }) => (
              <button
                key={provider}
                style={{
                  width: '100%', padding: '12px 20px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
                  background: 'rgba(255,253,248,0.04)',
                  border: '1px solid rgba(255,253,248,0.08)',
                  borderRadius: 'var(--r-md)',
                  color: 'var(--paper)',
                  fontFamily: 'var(--font-heading)',
                  fontSize: 13, fontWeight: 600,
                  cursor: 'pointer',
                  marginBottom: 8,
                  transition: 'all 0.2s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,253,248,0.08)'}
                onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,253,248,0.04)'}
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
