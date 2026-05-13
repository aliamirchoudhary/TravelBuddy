import { useState } from 'react'
import { useSearchParams, Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Lock, Eye, EyeOff, ArrowRight, CheckCircle, XCircle } from 'lucide-react'
import api from '../services/api.js'
import toast from 'react-hot-toast'
import PageTransition from '../components/PageTransition.jsx'
import ParticleField from '../components/ParticleField.jsx'

export default function ResetPassword() {
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [showPass, setShowPass] = useState(false)
  const [loading, setLoading] = useState(false)
  const [status, setStatus] = useState(null) // null | 'success' | 'error'
  const [errMsg, setErrMsg] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (password.length < 8) return toast.error('Password must be 8+ characters')
    if (password !== confirm) return toast.error('Passwords do not match')
    setLoading(true)
    try {
      await api.post('/auth/reset-password', { token, newPassword: password })
      setStatus('success')
    } catch (err) {
      setStatus('error')
      setErrMsg(err.response?.data?.error || 'Reset failed')
    }
    setLoading(false)
  }

  if (!token) {
    return (
      <PageTransition>
        <div style={{ minHeight:'100vh', background:'var(--ink)', display:'flex', alignItems:'center', justifyContent:'center', padding:40 }}>
          <div style={{ textAlign:'center', color:'var(--paper)' }}>
            <XCircle size={48} style={{ color:'#ef4444', margin:'0 auto 16px' }} />
            <h1 style={{ fontFamily:'var(--font-heading)', fontSize:22, fontWeight:800, marginBottom:12 }}>Invalid Link</h1>
            <p style={{ color:'var(--paper-dim)', marginBottom:24 }}>No reset token found in the URL.</p>
            <Link to="/forgot-password" className="btn btn-primary" style={{ display:'inline-flex', padding:'12px 32px' }}>Request New Link</Link>
          </div>
        </div>
      </PageTransition>
    )
  }

  if (status === 'success') {
    return (
      <PageTransition>
        <div style={{ minHeight:'100vh', background:'var(--ink)', display:'flex', alignItems:'center', justifyContent:'center', padding:40, position:'relative' }}>
          <ParticleField count={20} />
          <motion.div initial={{ opacity:0 }} animate={{ opacity:1 }} style={{ maxWidth:420, width:'100%', textAlign:'center', background:'rgba(10,22,40,0.85)', backdropFilter:'blur(20px)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:48, zIndex:1 }}>
            <CheckCircle size={48} style={{ color:'#22c55e', margin:'0 auto 16px' }} />
            <h1 style={{ fontFamily:'var(--font-heading)', fontSize:22, fontWeight:800, color:'var(--paper)', marginBottom:12 }}>Password Reset!</h1>
            <p style={{ color:'var(--paper-dim)', fontSize:14, marginBottom:32 }}>You can now log in with your new password.</p>
            <Link to="/login" className="btn btn-primary" style={{ display:'inline-flex', justifyContent:'center', padding:'14px 40px' }}>Go to Login</Link>
          </motion.div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div style={{ minHeight:'100vh', background:'var(--ink)', display:'flex', alignItems:'center', justifyContent:'center', padding:40, position:'relative' }}>
        <ParticleField count={30} />
        <motion.div initial={{ opacity:0, y:20 }} animate={{ opacity:1, y:0 }} style={{ maxWidth:440, width:'100%', background:'rgba(10,22,40,0.85)', backdropFilter:'blur(20px)', border:'1px solid var(--border)', borderRadius:'var(--r-lg)', padding:48, zIndex:1 }}>
          <h1 style={{ fontFamily:'var(--font-heading)', fontSize:22, fontWeight:800, color:'var(--paper)', marginBottom:8 }}>Reset Password</h1>
          <p style={{ color:'var(--paper-dim)', fontSize:13, marginBottom:28 }}>Enter your new password below.</p>

          {status === 'error' && (
            <div style={{ background:'rgba(239,68,68,0.1)', border:'1px solid rgba(239,68,68,0.3)', borderRadius:'var(--r-md)', padding:'12px 16px', marginBottom:20, color:'#fca5a5', fontSize:13 }}>
              {errMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ position:'relative' }}>
              <Lock size={14} style={{ position:'absolute', left:15, top:'50%', transform:'translateY(-50%)', color:'var(--paper-dim)' }} />
              <input className="input" type={showPass?'text':'password'} placeholder="New password (min 8 chars)" value={password} onChange={e=>setPassword(e.target.value)} required style={{ paddingLeft:42, paddingRight:42 }} />
              <button type="button" onClick={()=>setShowPass(v=>!v)} style={{ position:'absolute', right:14, top:'50%', transform:'translateY(-50%)', color:'var(--paper-dim)', background:'none', border:'none', cursor:'pointer' }}>
                {showPass ? <EyeOff size={14}/> : <Eye size={14}/>}
              </button>
            </div>
            <div style={{ position:'relative' }}>
              <Lock size={14} style={{ position:'absolute', left:15, top:'50%', transform:'translateY(-50%)', color:'var(--paper-dim)' }} />
              <input className="input" type={showPass?'text':'password'} placeholder="Confirm new password" value={confirm} onChange={e=>setConfirm(e.target.value)} required style={{ paddingLeft:42 }} />
            </div>
            <button type="submit" disabled={loading} className="btn btn-primary" style={{ width:'100%', justifyContent:'center', padding:'14px', marginTop:6 }}>
              {loading ? 'Resetting...' : <>Reset Password <ArrowRight size={14}/></>}
            </button>
          </form>
        </motion.div>
      </div>
    </PageTransition>
  )
}
