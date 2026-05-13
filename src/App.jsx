import { useEffect } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext.jsx'
import useAuthStore from './store/authStore'

import Navbar from './components/Navbar.jsx'
import StitchShell from './components/StitchShell.jsx'
import BadgeAwardModal from './components/profile/BadgeAwardModal.jsx'
import ProtectedRoute from './components/ProtectedRoute.jsx'

// Pages
import LandingPage from './pages/LandingPage.jsx'
import TripPlanner from './pages/TripPlanner.jsx'
import NewTrip from './pages/NewTrip.jsx'
import Explore from './pages/Explore.jsx'
import DestinationDetail from './pages/DestinationDetail.jsx'
import SocialHub from './pages/SocialHub.jsx'
import VloggerHub from './pages/VloggerHub.jsx'
import FindBuddy from './pages/FindBuddy.jsx'
import UserProfile from './pages/UserProfile.jsx'
import Messages from './pages/Messages.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'
import SharedTodoView from './pages/SharedTodoView.jsx'
import VerifyEmail from './pages/VerifyEmail.jsx'
import ForgotPassword from './pages/ForgotPassword.jsx'
import ResetPassword from './pages/ResetPassword.jsx'
import OAuthCallback from './pages/OAuthCallback.jsx'

import MainLayout from './components/MainLayout.jsx'

function AppContent() {
  const { initAuth, isLoading } = useAuthStore()

  useEffect(() => {
    initAuth()
  }, [])

  if (isLoading) {
    return (
      <div style={{
        minHeight: '100vh', background: 'var(--ink, #030712)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column', gap: 16,
      }}>
        <div style={{
          width: 40, height: 40,
          border: '3px solid rgba(0,212,255,0.3)',
          borderTopColor: 'var(--accent, #00d4ff)',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite',
        }} />
        <p style={{ color: 'rgba(248,250,252,0.5)', fontFamily: 'var(--font-heading, Inter)', fontSize: 13, fontWeight: 600 }}>
          Loading TravelBuddy...
        </p>
        <style>{`@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }`}</style>
      </div>
    )
  }

  return (
    <BrowserRouter>
      <Routes>
        {/* Public Landing Page (No shell/sidebar) */}
        <Route path="/" element={<LandingPage />} />

        {/* All internal pages wrapped in MainLayout (StitchShell + Navbar + Sidebar) */}
        <Route element={<MainLayout />}>
          <Route path="/planner/new" element={<ProtectedRoute><NewTrip /></ProtectedRoute>} />
          <Route path="/planner" element={<ProtectedRoute><NewTrip /></ProtectedRoute>} />
          <Route path="/TripPlanner" element={<ProtectedRoute><TripPlanner /></ProtectedRoute>} />
          <Route path="/TripPlanner/:tripId" element={<ProtectedRoute><TripPlanner /></ProtectedRoute>} />
          <Route path="/trip/:tripId" element={<ProtectedRoute><TripPlanner /></ProtectedRoute>} />
          <Route path="/explore" element={<Explore />} />
          <Route path="/destination/:id" element={<DestinationDetail />} />
          <Route path="/social-hub" element={<SocialHub />} />
          <Route path="/social" element={<SocialHub />} />
          <Route path="/vlogger-hub" element={<VloggerHub />} />
          <Route path="/vloggers" element={<VloggerHub />} />
          <Route path="/find-buddy" element={<ProtectedRoute><FindBuddy /></ProtectedRoute>} />
          <Route path="/buddy" element={<ProtectedRoute><FindBuddy /></ProtectedRoute>} />
          <Route path="/profile" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/profile/me" element={<ProtectedRoute><UserProfile /></ProtectedRoute>} />
          <Route path="/profile/:id" element={<UserProfile />} />
          <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password" element={<ResetPassword />} />
          <Route path="/auth/callback" element={<OAuthCallback />} />
          <Route path="/shared/todos/:token" element={<SharedTodoView />} />
          <Route path="/shared/todos" element={<SharedTodoView />} />
        </Route>
      </Routes>
      <BadgeAwardModal />
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            background: '#161b22',
            color: '#f8fafc',
            border: '1px solid rgba(45,212,191,0.22)',
            fontFamily: 'Inter, system-ui, sans-serif',
            fontSize: '13px',
            boxShadow: '0 12px 40px rgba(0,0,0,0.55)',
          },
          success: { iconTheme: { primary: '#34d399', secondary: '#161b22' } },
          error:   { iconTheme: { primary: '#fb7185', secondary: '#161b22' } },
        }}
      />
    </BrowserRouter>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  )
}
