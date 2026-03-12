import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext.jsx'

import Navbar from './components/Navbar.jsx'
import Footer from './components/Footer.jsx'

// Pages
import Landing from './pages/Landing.jsx'
import IntentGateway from './pages/IntentGateway.jsx'
import TripPlanner from './pages/TripPlanner.jsx'
import Explore from './pages/Explore.jsx'
import DestinationDetail from './pages/DestinationDetail.jsx'
import SocialHub from './pages/SocialHub.jsx'
import VloggerHub from './pages/VloggerHub.jsx'
import FindBuddy from './pages/FindBuddy.jsx'
import UserProfile from './pages/UserProfile.jsx'
import Messages from './pages/Messages.jsx'
import Login from './pages/Login.jsx'
import Signup from './pages/Signup.jsx'

function AnimatedRoutes() {
  const location = useLocation()
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<Landing />} />
        <Route path="/gateway" element={<IntentGateway />} />
        <Route path="/plan" element={<TripPlanner />} />
        <Route path="/explore" element={<Explore />} />
        <Route path="/destination/:id" element={<DestinationDetail />} />
        <Route path="/social" element={<SocialHub />} />
        <Route path="/vloggers" element={<VloggerHub />} />
        <Route path="/buddy" element={<FindBuddy />} />
        <Route path="/profile/:id?" element={<UserProfile />} />
        <Route path="/messages" element={<Messages />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
      </Routes>
    </AnimatePresence>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Navbar />
        <AnimatedRoutes />
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: '#1a1f2e',
              color: '#f7f4ee',
              border: '1px solid rgba(255,253,248,0.1)',
              fontFamily: 'DM Sans, sans-serif',
              fontSize: '13px',
            },
          }}
        />
      </BrowserRouter>
    </AuthProvider>
  )
}
