import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { Toaster } from 'react-hot-toast'
import { AuthProvider } from './context/AuthContext.jsx'

import Navbar from './components/Navbar.jsx'
import StitchShell from './components/StitchShell.jsx'

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

function AppRoutes() {
  return (
    <Routes>
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
  )
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <StitchShell>
          <Navbar />
          <AppRoutes />
        </StitchShell>
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
    </AuthProvider>
  )
}

/*
git remote add origin https://github.com/HassanNawaz14/Travel-Buddy-.git
git branch -M main 
git push -u origin main

*/
