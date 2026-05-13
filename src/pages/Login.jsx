import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { ArrowRight, Eye, EyeOff, Mail, Lock } from 'lucide-react'
import useAuthStore from '../store/authStore'
import toast from 'react-hot-toast'
import PageTransition from '../components/PageTransition.jsx'
import ParticleField from '../components/ParticleField.jsx'

export default function Login() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const { login } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await login(email, password)
      toast.success('Welcome back!')
      navigate('/social-hub')
    } catch (err) {
      const errMsg = err.response?.data?.error || 'Login failed. Please try again.'
      const errCode = err.response?.data?.code
      if (errCode === 'EMAIL_NOT_VERIFIED') {
        setError('Please verify your email before logging in. Check your inbox.')
      } else {
        setError(errMsg)
      }
    } finally {
      setLoading(false)
    }
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
              Welcome<br /><span style={{ color: 'var(--accent)' }}>Back.</span>
            </h2>
            <p style={{ color: 'var(--paper-muted)', fontSize: 15, lineHeight: 1.8, maxWidth: 320, marginBottom: 40 }}>
              Sign in to continue planning your adventures, connecting with travel buddies, and exploring the world.
            </p>

            {/* Trust indicators */}
            <div style={{ display: 'flex', gap: 24 }}>
              {[
                { label: '50K+', desc: 'Travelers' },
                { label: '120+', desc: 'Countries' },
                { label: '4.9★', desc: 'Rating' },
              ].map(({ label, desc }) => (
                <div key={desc}>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 800, fontSize: 18, color: 'var(--accent)' }}>{label}</div>
                  <div style={{ color: 'var(--paper-dim)', fontSize: 11 }}>{desc}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right — Login Form */}
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
            <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 26, fontWeight: 800, color: 'var(--paper)', marginBottom: 6 }}>
              Sign In
            </h1>
            <p style={{ color: 'var(--paper-dim)', fontSize: 13, marginBottom: 28 }}>
              Enter your credentials to access your account.
            </p>

            {error && (
              <div style={{
                background: 'rgba(220,38,38,0.1)', border: '1px solid rgba(220,38,38,0.3)',
                borderRadius: 'var(--r-md)', padding: '12px 16px', marginBottom: 20,
                color: '#fca5a5', fontSize: 13, lineHeight: 1.5,
              }}>
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div>
                <label style={{ fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--paper-dim)', display: 'block', marginBottom: 7 }}>Email</label>
                <div style={{ position: 'relative' }}>
                  <Mail size={14} style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: 'var(--paper-dim)' }} />
                  <input
                    className="input"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    id="login-email"
                    style={{ paddingLeft: 42 }}
                  />
                </div>
              </div>

              <div>
                <label style={{ fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--paper-dim)', display: 'block', marginBottom: 7 }}>Password</label>
                <div style={{ position: 'relative' }}>
                  <Lock size={14} style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: 'var(--paper-dim)' }} />
                  <input
                    className="input"
                    type={showPass ? 'text' : 'password'}
                    placeholder="Min. 8 characters"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    id="login-password"
                    style={{ paddingLeft: 42, paddingRight: 42 }}
                  />
                  <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--paper-dim)', background: 'none', border: 'none', cursor: 'pointer' }}>
                    {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                  </button>
                </div>
              </div>

              <div style={{ textAlign: 'right' }}>
                <Link to="/forgot-password" style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 600 }}>
                  Forgot password?
                </Link>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn btn-primary"
                id="login-submit"
                style={{ marginTop: 6, width: '100%', justifyContent: 'center', padding: '14px' }}
              >
                {loading ? (
                  <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: 16, height: 16, border: '2px solid rgba(5,11,20,0.3)', borderTopColor: 'var(--ink)', borderRadius: '50%' }} />
                ) : (
                  <>Sign In <ArrowRight size={14} /></>
                )}
              </button>
            </form>

            <p style={{ textAlign: 'center', color: 'var(--paper-dim)', fontSize: 13, marginTop: 24 }}>
              Don't have an account?{' '}
              <Link to="/signup" style={{ color: 'var(--accent)', fontWeight: 700 }}>Sign up</Link>
            </p>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  )
}
