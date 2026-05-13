import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Mail, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import api from '../services/api.js'
import toast from 'react-hot-toast'
import PageTransition from '../components/PageTransition.jsx'
import ParticleField from '../components/ParticleField.jsx'

export default function ForgotPassword() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!email) return toast.error('Please enter your email')
    setLoading(true)
    try {
      await api.post('/auth/forgot-password', { email })
      setSent(true)
    } catch (err) {
      toast.error(err.response?.data?.error || 'Something went wrong')
    }
    setLoading(false)
  }

  if (sent) {
    return (
      <PageTransition>
        <div style={{ minHeight:'100vh', background:'var(--ink)', display:'flex', alignItems:'center', justifyContent:'center', padding:40, position:'relative' }}>
          <ParticleField count={30} />
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ maxWidth:440, width:'100%', textAlign:'center', background:'rgba(10,22,40,0.85)', backdropFilter:'blur(20px)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:48, zIndex:1, boxShadow:'0 40px 100px rgba(0,0,0,0.6)' }}>
            <div style={{ width:64, height:64, borderRadius:'50%', margin:'0 auto 24px', background:'rgba(34,197,94,0.1)', border:'2px solid rgba(34,197,94,0.3)', display:'flex', alignItems:'center', justifyContent:'center' }}>
              <CheckCircle size={28} style={{ color:'#22c55e' }} />
            </div>
            <h1 style={{ fontFamily:'var(--font-heading)', fontSize:22, fontWeight:800, color:'var(--paper)', marginBottom:12 }}>Check Your Email</h1>
            <p style={{ color:'var(--paper-dim)', fontSize:14, lineHeight:1.7, marginBottom:32 }}>
              If an account exists for <strong style={{ color:'var(--accent)' }}>{email}</strong>, we sent a reset link.
            </p>
            <Link to="/login" className="btn btn-primary" style={{ display:'inline-flex', justifyContent:'center', padding:'14px 40px' }}>Back to Login</Link>
          </motion.div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div style={{ minHeight:'100vh', background:'var(--ink)', display:'flex', alignItems:'center', justifyContent:'center', padding:40, position:'relative' }}>
        <ParticleField count={30} />
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ maxWidth:440, width:'100%', background:'rgba(10,22,40,0.85)', backdropFilter:'blur(20px)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:48, zIndex:1, boxShadow:'0 40px 100px rgba(0,0,0,0.6)' }}>
          <Link to="/login" style={{ display:'inline-flex', alignItems:'center', gap:6, color:'var(--paper-dim)', fontSize:12, fontWeight:600, marginBottom:24, textDecoration:'none' }}>
            <ArrowLeft size={14} /> Back to login
          </Link>
          <h1 style={{ fontFamily:'var(--font-heading)', fontSize:22, fontWeight:800, color:'var(--paper)', marginBottom:8 }}>Forgot Password?</h1>
          <p style={{ color:'var(--paper-dim)', fontSize:13, lineHeight:1.7, marginBottom:28 }}>Enter your email and we'll send a reset link.</p>
          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:16 }}>
            <div style={{ position:'relative' }}>
              <Mail size={14} style={{ position:'absolute', left:15, top:'50%', transform:'translateY(-50%)', color:'var(--paper-dim)' }} />
              <input className="input" type="email" placeholder="you@example.com" value={email} onChange={e=>setEmail(e.target.value)} required style={{ paddingLeft:42 }} />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'14px' }}>
              {loading ? 'Sending...' : <>Send Reset Link <ArrowRight size={14} /></>}
            </button>
          </form>
        </motion.div>
      </div>
    </PageTransition>
  )
}
