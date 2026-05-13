import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Award } from 'lucide-react';
import Footer from '../components/Footer.jsx';
import PageTransition from '../components/PageTransition.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import api from '../services/api';

import ProfileHeader from '../components/profile/ProfileHeader';
import StatsRow from '../components/profile/StatsRow';
import BadgeShelf from '../components/profile/BadgeShelf';
import TravelTimeline from '../components/profile/TravelTimeline';
import ReviewsList from '../components/profile/ReviewsList';
import PrivacyControls from '../components/profile/PrivacyControls';

const tabs = [
  { id: 'timeline', label: 'Travel Timeline' },
  { id: 'reviews',  label: 'Reviews'         },
  { id: 'badges',   label: 'Badges'          },
];

export default function UserProfile() {
  const { id } = useParams();
  const { user: currentUser } = useAuth();
  
  // Determine if viewing own profile based on URL or ID match
  const isOwnProfile = id === 'me' || (currentUser && id && parseInt(id) === currentUser.id) || (!id && currentUser);
  const targetId = isOwnProfile ? currentUser?.id : id;

  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('timeline');

  useEffect(() => {
    if (!targetId) {
      setLoading(false);
      return;
    }

    const fetchProfile = async () => {
      setLoading(true);
      try {
        const res = await api.get(`/users/${targetId}/profile`);
        setProfileData(res.data);
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [targetId]);

  if (loading) {
    return (
      <PageTransition>
        <div style={{ background: 'var(--ink)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ color: 'var(--accent)', fontSize: 14 }}>Loading profile...</div>
        </div>
      </PageTransition>
    );
  }

  if (!profileData || (!profileData.user && !isOwnProfile)) {
    return (
      <PageTransition>
        <div style={{ background: 'var(--ink)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
          <h2 style={{ color: 'var(--paper)', marginBottom: 16 }}>User not found.</h2>
          <Link to="/explore" className="btn btn-primary">Go to Explore</Link>
        </div>
      </PageTransition>
    );
  }

  // Handle case where user is logged in but visiting /profile without ID, but auth is still loading or failed
  if (!profileData.user) {
      return (
          <PageTransition>
            <div style={{ background: 'var(--ink)', minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <h2 style={{ color: 'var(--paper)', marginBottom: 16 }}>Please log in to view your profile.</h2>
              <Link to="/login" className="btn btn-primary">Log In</Link>
            </div>
          </PageTransition>
        );
  }

  return (
    <PageTransition>
      <div style={{ background: 'var(--ink)', minHeight: '100vh' }}>
        
        <ProfileHeader 
          user={profileData.user} 
          isOwnProfile={isOwnProfile} 
          onUpdateUser={(updatedFields) => {
            setProfileData(prev => ({
              ...prev,
              user: { ...prev.user, ...updatedFields }
            }));
          }}
        />
        
        <StatsRow stats={profileData.stats} />

        <div className="container" style={{ padding: 'clamp(28px, 5vw, 48px) clamp(20px, 5vw, 80px)', paddingBottom: 80 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 36, alignItems: 'start' }}>
            
            {/* Left Column - Main Content */}
            <div>
              {/* Tab Navigation */}
              <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 28, overflowX: 'auto' }}>
                {tabs.map(t => (
                  <button key={t.id} onClick={() => setActiveTab(t.id)} style={{
                    padding: '10px 18px',
                    fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700,
                    color: activeTab === t.id ? 'var(--accent)' : 'var(--muted)',
                    borderBottom: activeTab === t.id ? '2px solid var(--accent)' : '2px solid transparent',
                    marginBottom: -1, transition: 'all 0.2s', whiteSpace: 'nowrap', cursor: 'pointer',
                  }}>{t.label}</button>
                ))}
              </div>

              <AnimatePresence mode="wait">
                <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }} transition={{ duration: 0.25 }}>
                  
                  {activeTab === 'timeline' && (
                    <TravelTimeline 
                      timeline={profileData.timeline} 
                      isVisible={profileData.privacySettings?.ShowTimeline}
                      isOwnProfile={isOwnProfile}
                    />
                  )}

                  {activeTab === 'reviews' && (
                    <ReviewsList userId={targetId} />
                  )}

                  {activeTab === 'badges' && (
                    <BadgeShelf badges={profileData.badges} />
                  )}

                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right Column - Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }} className="hide-mobile">
              
              {/* Badges Preview */}
              {/* Badge Shelf Component */}
              <BadgeShelf badges={profileData.badges} />

              {/* Privacy Controls (Own profile only) */}
              {isOwnProfile && profileData.privacySettings && (
                <PrivacyControls 
                  settings={profileData.privacySettings}
                  onUpdate={(newSettings) => {
                    setProfileData(prev => ({
                      ...prev,
                      privacySettings: newSettings
                    }));
                  }}
                />
              )}

            </div>
          </div>
        </div>

        <Footer />
      </div>
    </PageTransition>
  );
}
