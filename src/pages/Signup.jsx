import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Eye, EyeOff, ArrowRight, User, Mail, Lock } from 'lucide-react'
import { useAuth } from '../context/AuthContext.jsx'
import toast from 'react-hot-toast'
import PageTransition from '../components/PageTransition.jsx'
import ParticleField from '../components/ParticleField.jsx'

const roles = [
  { value: 'traveler',   emoji: '🧭', label: 'Traveler',          desc: 'Plan trips & find buddies',          color: 'var(--accent)' },
  { value: 'vlogger',    emoji: '🎥', label: 'Vlogger / Creator', desc: 'Create content & monetize',          color: '#FF61D8' },
  { value: 'companion',  emoji: '🤝', label: 'Companion',         desc: 'Find travel partners',               color: 'var(--accent3)' },
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

  const selectedRoleColor = roles.find(r => r.value === form.role)?.color || 'var(--accent)'

  return (
    <PageTransition>
      <div style={{
        minHeight: '100vh', background: 'var(--ink)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 'clamp(80px,10vw,120px) clamp(20px,5vw,40px)',
        position: 'relative', overflow: 'hidden',
      }}>
        <ParticleField count={50} />
        <div className="grid-overlay" />
        {/* Glow orb */}
        <div style={{
          position: 'absolute', top: '10%', left: '20%',
          width: 500, height: 500, borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(123,97,255,0.07) 0%, transparent 70%)',
          filter: 'blur(60px)', pointerEvents: 'none',
        }} />

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          style={{
            maxWidth: 480, width: '100%',
            background: 'rgba(10,22,40,0.85)',
            backdropFilter: 'blur(20px)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--r-lg)',
            padding: 'clamp(28px,5vw,48px)',
            position: 'relative', zIndex: 1,
            boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
          }}
        >
          {/* Logo */}
          <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32, textDecoration: 'none' }}>
            <div style={{ width: 36, height: 36, background: 'var(--accent)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18, boxShadow: '0 0 16px rgba(0,212,255,0.35)' }}>✈️</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 800, fontSize: 18, color: 'var(--paper)' }}>
              Travel<span style={{ color: 'var(--accent)' }}>Buddy</span>
            </span>
          </Link>

          {/* Progress */}
          <div style={{ display: 'flex', gap: 6, marginBottom: 32 }}>
            {[1, 2].map(s => (
              <div key={s} style={{
                height: 3, flex: 1, borderRadius: 2,
                background: s <= step ? 'var(--accent)' : 'var(--border)',
                boxShadow: s <= step ? '0 0 8px rgba(0,212,255,0.4)' : 'none',
                transition: 'all 0.3s',
              }} />
            ))}
          </div>

          <motion.div key={step} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.3 }}>
            {step === 1 ? (
              <>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: 'var(--paper)', marginBottom: 6 }}>
                  Create your account
                </h1>
                <p style={{ color: 'var(--paper-dim)', fontSize: 13, marginBottom: 28 }}>
                  Already have one? <Link to="/login" style={{ color: 'var(--accent)', fontWeight: 600 }}>Sign in</Link>
                </p>

                <form onSubmit={handleStep1} style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {[
                    { key: 'name',     label: 'Full Name', icon: User,  type: 'text',     placeholder: 'Your full name' },
                    { key: 'email',    label: 'Email',     icon: Mail,  type: 'email',    placeholder: 'you@example.com' },
                    { key: 'password', label: 'Password',  icon: Lock,  type: showPass ? 'text' : 'password', placeholder: 'Min. 6 characters' },
                  ].map(({ key, label, icon: Icon, type, placeholder }) => (
                    <div key={key}>
                      <label style={{ fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--paper-dim)', display: 'block', marginBottom: 7 }}>{label}</label>
                      <div style={{ position: 'relative' }}>
                        <Icon size={14} style={{ position: 'absolute', left: 15, top: '50%', transform: 'translateY(-50%)', color: 'var(--paper-dim)' }} />
                        <input className="input" name={key} type={type} placeholder={placeholder} value={form[key]} onChange={handleChange} style={{ paddingLeft: 42, paddingRight: key === 'password' ? 42 : 16 }} />
                        {key === 'password' && (
                          <button type="button" onClick={() => setShowPass(v => !v)} style={{ position: 'absolute', right: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--paper-dim)' }}>
                            {showPass ? <EyeOff size={14} /> : <Eye size={14} />}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                  <button type="submit" className="btn btn-primary" style={{ marginTop: 6, width: '100%', justifyContent: 'center', padding: '14px' }}>
                    Continue <ArrowRight size={14} />
                  </button>
                </form>
              </>
            ) : (
              <>
                <h1 style={{ fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: 'var(--paper)', marginBottom: 8 }}>
                  What brings you here?
                </h1>
                <p style={{ color: 'var(--paper-dim)', fontSize: 13, marginBottom: 28, lineHeight: 1.7 }}>
                  Choose your primary role. You can always change this later.
                </p>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 28 }}>
                  {roles.map(({ value, emoji, label, desc, color }) => (
                    <button key={value} type="button" onClick={() => selectRole(value)} style={{
                      display: 'flex', alignItems: 'center', gap: 16,
                      padding: '16px 18px',
                      background: form.role === value ? `${color}12` : 'rgba(255,255,255,0.03)',
                      border: form.role === value ? `1.5px solid ${color}50` : '1.5px solid var(--border)',
                      borderRadius: 'var(--r-md)',
                      cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                      boxShadow: form.role === value ? `0 0 20px ${color}15` : 'none',
                    }}
                      onMouseEnter={e => { if (form.role !== value) { e.currentTarget.style.borderColor = 'var(--border-cyan)'; e.currentTarget.style.background = 'rgba(255,255,255,0.06)' } }}
                      onMouseLeave={e => { if (form.role !== value) { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.background = 'rgba(255,255,255,0.03)' } }}
                    >
                      <span style={{ fontSize: 26 }}>{emoji}</span>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: form.role === value ? color : 'var(--paper)' }}>{label}</div>
                        <div style={{ color: 'var(--paper-dim)', fontSize: 11 }}>{desc}</div>
                      </div>
                      {form.role === value && (
                        <div style={{ width: 18, height: 18, borderRadius: '50%', background: color, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: `0 0 10px ${color}60` }}>
                          <span style={{ color: 'white', fontSize: 10 }}>✓</span>
                        </div>
                      )}
                    </button>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: 10 }}>
                  <button onClick={() => setStep(1)} className="btn btn-outline" style={{ flex: 1, justifyContent: 'center', fontSize: 13 }}>Back</button>
                  <motion.button onClick={handleFinal} disabled={loading} className="btn btn-primary" style={{ flex: 2, justifyContent: 'center', fontSize: 14 }} whileTap={{ scale: 0.98 }}>
                    {loading
                      ? <motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: 16, height: 16, border: '2px solid rgba(5,11,20,0.3)', borderTopColor: 'var(--ink)', borderRadius: '50%' }} />
                      : <><span>Create Account</span><ArrowRight size={14} /></>
                    }
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
