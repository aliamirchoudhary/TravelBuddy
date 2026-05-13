import { useEffect } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import useAuthStore from '../store/authStore'

export default function OAuthCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { setAccessToken, initAuth } = useAuthStore()

  useEffect(() => {
    const token = searchParams.get('token')
    if (token) {
      setAccessToken(token)
      initAuth().then(() => navigate('/social-hub'))
    } else {
      navigate('/login?error=oauth_failed')
    }
  }, [])

  return (
    <div style={{
      minHeight: '100vh', background: 'var(--ink)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      color: 'var(--paper)', fontFamily: 'var(--font-heading)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{
          width: 40, height: 40, margin: '0 auto 16px',
          border: '3px solid var(--accent)', borderTopColor: 'transparent',
          borderRadius: '50%', animation: 'spin 1s linear infinite',
        }} />
        <p style={{ fontSize: 14, fontWeight: 600 }}>Completing login...</p>
      </div>
      <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}
