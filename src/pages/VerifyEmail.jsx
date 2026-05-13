import { useEffect, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { CheckCircle, XCircle, Loader } from 'lucide-react'
import api from '../services/api.js'
import PageTransition from '../components/PageTransition.jsx'
import ParticleField from '../components/ParticleField.jsx'

export default function VerifyEmail() {
  const [searchParams] = useSearchParams()
  const [status, setStatus] = useState('loading') // loading | success | error
  const [message, setMessage] = useState('')

  useEffect(() => {
    const token = searchParams.get('token')
    if (!token) {
      setStatus('error')
      setMessage('No verification token provided.')
      return
    }

    const verify = async () => {
      try {
        const { data } = await api.post('/auth/verify-email', { token })
        setStatus('success')
        setMessage(data.message || 'Email verified successfully!')
      } catch (err) {
        setStatus('error')
        setMessage(err.response?.data?.error || 'Verification failed. The link may be expired or invalid.')
      }
    }

    verify()
  }, [searchParams])

  const icon = {
    loading: <Loader size={32} style={{ color: 'var(--accent)', animation: 'spin 1s linear infinite' }} />,
    success: <CheckCircle size={32} style={{ color: '#22c55e' }} />,
    error: <XCircle size={32} style={{ color: '#ef4444' }} />,
  }

  const colors = {
    loading: { bg: 'rgba(0,212,255,0.1)', border: 'rgba(0,212,255,0.3)' },
    success: { bg: 'rgba(34,197,94,0.1)', border: 'rgba(34,197,94,0.3)' },
    error: { bg: 'rgba(239,68,68,0.1)', border: 'rgba(239,68,68,0.3)' },
  }

  return (
    <PageTransition>
      <div style={{
        minHeight: '100vh', background: 'var(--ink)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 40, position: 'relative', overflow: 'hidden',
      }}>
        <ParticleField count={30} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          style={{
            maxWidth: 440, width: '100%', textAlign: 'center',
            background: 'rgba(10,22,40,0.85)', backdropFilter: 'blur(20px)',
            border: '1px solid var(--border)', borderRadius: 'var(--r-lg)',
            padding: 'clamp(40px,5vw,60px)', position: 'relative', zIndex: 1,
            boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
          }}
        >
          <div style={{
            width: 72, height: 72, borderRadius: '50%', margin: '0 auto 24px',
            background: colors[status].bg, border: `2px solid ${colors[status].border}`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            {icon[status]}
          </div>

          <h1 style={{
            fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800,
            color: 'var(--paper)', marginBottom: 12,
          }}>
            {status === 'loading' ? 'Verifying...' : status === 'success' ? 'Email Verified!' : 'Verification Failed'}
          </h1>

          <p style={{ color: 'var(--paper-dim)', fontSize: 14, lineHeight: 1.7, marginBottom: 32 }}>
            {message || 'Please wait while we verify your email address.'}
          </p>

          {status !== 'loading' && (
            <Link
              to="/login"
              className="btn btn-primary"
              style={{ display: 'inline-flex', justifyContent: 'center', padding: '14px 40px' }}
            >
              Go to Login
            </Link>
          )}
        </motion.div>
      </div>

      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </PageTransition>
  )
}
