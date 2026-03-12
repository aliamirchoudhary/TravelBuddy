import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, User, Mail, Lock, ChevronDown } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'
import PageTransition from '../components/PageTransition.jsx'

const roles = [
  { value: 'traveler', emoji: '🧭', label: 'Traveler', desc: 'Plan trips & find buddies' },
  { value: 'vlogger', emoji: '🎥', label: 'Vlogger / Creator', desc: 'Create content & monetize' },
  { value: 'companion', emoji: '🤝', label: 'Companion', desc: 'Find travel partners' },
]

export default function Signup() {
  const [step, setStep] = useState(1)
  const [form, setForm] = useState({ name: '', email: '', password: '', role: '' })
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))
  const selectRole = (role) => setForm(f => ({ ...f, role }))

  const handleStep1 = (e) => {
    e.preventDefault()
    if (!form.name || !form.email || !form.password) { toast.error('Please fill all fields'); return }
    if (form.password.length < 6) { toast.error('Password must be 6+ characters'); return }
    setStep(2)
  }

  const handleFinal = async () => {
    if (!form.role) { toast.error('Please select your travel style'); return }
    setLoading(true)
    await new Promise(r => setTimeout(r, 1400))
    login({ name: form.name, email: form.email, role: form.role })
    toast.success(`Welcome to TravelBuddy, ${form.name}!`)
    navigate('/')
  }

  return (
    <PageTransition>
      <div style={{
        minHeight: '100vh',
        background: 'var(--ink)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'clamp(80px, 10vw, 120px) clamp(20px, 5vw, 40px)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Background */}
        <div style={{
          position: 'absolute', inset: 0,
          background: 'radial-gradient(ellipse 60% 60% at 50% 30%, rgba(139,61,202,0.07) 0%, transparent 70%)',
        }} />
        <div style={{
          position: 'absolute', inset: 0,
          backgroundImage: `linear-gradient(rgba(255,253,248,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,253,248,0.02) 1px, transparent 1px)`,
          backgroundSize: '50px 50px',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            maxWidth: 480, width: '100%',
            background: 'rgba(255,253,248,0.03)',
            border: '1px solid rgba(255,253,248,0.08)',
            borderRadius: 'var(--r-lg)',
            padding: 'clamp(28px, 5vw, 48px)',
            position: 'relative', zIndex: 1,
          }}
        >
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32 }}>
            <div style={{ width: 36, height: 36, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>✈️</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 18, color: 'var(--paper)' }}>
              Travel<span style={{ color: 'var(--accent)' }}>Buddy</span>
            </span>
          </Link>

          {/* Progress */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
            {[1, 2].map(s => (
              <div key={s} style={{
                height: 4, flex: 1, borderRadius: 2,
                background: s <= step ? 'var(--accent)' : 'rgba(255,253,248,0.08)',
                transition: 'background 0.3s',
              }} />
            ))}
          </div>

          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            {step === 1 ? (
              <>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--paper)', marginBottom: 6 }}>
                  Create your account
                </h1>
                <p style={{ color: 'rgba(247,244,238,0.4)', fontSize: 13, marginBottom: 28 }}>
                  Already have one? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
                </p>

                <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  <div>
                    <label style={{ fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(247,244,238,0.35)', display: 'block', marginBottom: 7 }}>Full Name</label>
                    <div style={{ position: 'relative' }}>
                      <User size={14} style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: 'rgba(247,244,238,0.2)' }} />
                      <input className="input" type="text" name="name" placeholder="Your full name" value={form.name} onChange={handleChange} style={{ paddingLeft: 42 }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(247,244,238,0.35)', display: 'block', marginBottom: 7 }}>Email</label>
                    <div style={{ position: 'relative' }}>
                      <Mail size={14} style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: 'rgba(247,244,238,0.2)' }} />
                      <input className="input" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} style={{ paddingLeft: 42 }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(247,244,238,0.35)', display: 'block', marginBottom: 7 }}>Password</label>
                    <div style={{ position: 'relative' }}>
                      <Lock size={14} style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: 'rgba(247,244,238,0.2)' }} />
                      <input className="input" type={showPass ? 'text' : 'password'} name="password" placeholder="Min. 6 characters" value={form.password} onChange={handleChange} style={{ paddingLeft: 42, paddingRight: 42 }} />
                      <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'rgba(247,244,238,0.2)' }}>
                        {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                  <button type="submit" className="btn btn-primary" style={{ marginTop: 6, width: '100%', justifyContent: 'center', padding: '14px', fontSize: 14 }}>
                    Continue <ArrowRight size={14} />
                  </button>
                </form>
              </>
            ) : (
              <>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 700, color: 'var(--paper)', marginBottom: 8 }}>
                  What brings you here?
                </h1>
                <p style={{ color: 'rgba(247,244,238,0.4)', fontSize: 13, marginBottom: 28, lineHeight: 1.7 }}>
                  Choose your primary role. You can always change this later.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                  {roles.map(({ value, emoji, label, desc }) => (
                    <button
                      key={value}
                      type="button"
                      onClick={() => selectRole(value)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 16,
                        padding: '16px 18px',
                        background: form.role === value ? 'rgba(232,84,26,0.1)' : 'rgba(255,253,248,0.03)',
                        border: form.role === value ? '1.5px solid rgba(232,84,26,0.4)' : '1.5px solid rgba(255,253,248,0.07)',
                        borderRadius: 'var(--r-md)',
                        cursor: 'pointer', textAlign: 'left',
                        transition: 'all 0.2s',
                      }}
                    >
                      <span style={{ fontSize: 26 }}>{emoji}</span>
                      <div>
                        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: form.role === value ? 'var(--accent)' : 'var(--paper)' }}>{label}</div>
                        <div style={{ color: 'rgba(247,244,238,0.35)', fontSize: 11 }}>{desc}</div>
                      </div>
                      {form.role === value && (
                        <div style={{ marginLeft: 'auto', width: 18, height: 18, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          <span style={{ color: 'white', fontSize: 10 }}>✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setStep(1)} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}>
                    Back
                  </button>
                  <motion.button
                    onClick={handleFinal}
                    disabled={loading}
                    className="btn btn-primary"
                    style={{ flex: 2, justifyContent: 'center', fontSize: 14 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    {loading ? (
                      <motion.div
                        animate={{ rotate: 360 }}
                        transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                        style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }}
                      />
                    ) : (
                      <><span>Create Account</span><ArrowRight size={14} /></>
                    )}
                  </motion.button>
                </div>
              </>
            )}
          </motion.div>
        </motion.div>
      </div>
    </PageTransition>
  )
}
