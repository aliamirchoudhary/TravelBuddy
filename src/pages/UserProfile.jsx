import { useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { MapPin, Star, Users, Award, Edit3, MessageSquare, Settings, Globe, Camera } from 'lucide-react'
import Footer from '../components/Footer.jsx'
import PageTransition from '../components/PageTransition.jsx'
import { useAuth } from '../context/AuthContext.jsx'

/* ── Mock data ── */
const profileData = {
  name: 'Amara Nwosu',
  avatar: '🌍',
  tagline: 'Chasing sunsets on every continent.',
  location: 'Lagos, Nigeria',
  nationality: 'Nigerian',
  joinedDate: 'March 2023',
  role: 'traveler',
  bio: 'Solo traveler | Culture enthusiast | Food lover. I believe the best conversations happen over shared meals in unfamiliar places. Currently working my way through every UNESCO site.',
  stats: { countries: 24, trips: 12, buddies: 8, reviews: 47 },
  rating: 4.9,
  trust: 98,
  travelStyle: 'Cultural',
  languages: ['English', 'French', 'Yoruba'],
  badges: [
    { emoji: '🌍', name: '5 Continents',    color: '#1a6eb5',    desc: 'Visited all five continents' },
    { emoji: '⭐', name: 'Top Reviewer',     color: '#c9a227',    desc: '50+ verified reviews' },
    { emoji: '🤝', name: '10 Buddy Matches', color: '#1f8a55',    desc: 'Matched with 10+ buddies' },
    { emoji: '🏛️', name: 'Culture Seeker',  color: '#8b3dca',    desc: '20+ cultural destinations' },
    { emoji: '✈️', name: 'Frequent Flyer',  color: '#e8541a',    desc: '12+ completed trips' },
    { emoji: '🥇', name: 'Trusted Member',  color: '#c9a227',    desc: 'Trust score 95+' },
  ],
}

const trips = [
  { id: 1, dest: 'Kyoto, Japan',       emoji: '🇯🇵', dates: 'Mar 4–14, 2025', status: 'Completed', color: '#8b3dca', buddies: 1, rating: 5.0 },
  { id: 2, dest: 'Marrakech, Morocco', emoji: '🇲🇦', dates: 'Jan 5–13, 2025',  status: 'Completed', color: '#e8541a', buddies: 0, rating: 4.8 },
  { id: 3, dest: 'Santorini, Greece',  emoji: '🇬🇷', dates: 'Jun 12–22, 2025', status: 'Upcoming',  color: '#1a6eb5', buddies: 1, rating: null },
  { id: 4, dest: 'Bali, Indonesia',    emoji: '🇮🇩', dates: 'Aug 10–20, 2025', status: 'Upcoming',  color: '#c9a227', buddies: 0, rating: null },
]

const reviews = [
  { dest: 'Kyoto, Japan',       emoji: '🇯🇵', rating: 5, date: '2 weeks ago', text: 'An absolute dream destination. The Philosopher\'s Path during cherry blossom season is everything the photos promise and more. Found the perfect travel buddy through TravelBuddy to share the experience.' },
  { dest: 'Marrakech, Morocco', emoji: '🇲🇦', rating: 5, date: '2 months ago', text: 'The medina is a sensory overload in the best possible way. Spent 3 days barely scratching the surface. The food scene is world-class and the people are incredibly warm.' },
]

const buddyHistory = [
  { name: 'Luca Moretti', avatar: '🎒', trip: 'Kyoto, Japan', rating: 5.0, date: 'Mar 2025' },
  { name: 'Sara Kim',     avatar: '📸', trip: 'Bali, Indonesia', rating: 4.8, date: 'Nov 2024' },
]

const tabs = [
  { id: 'timeline', label: 'Travel Timeline' },
  { id: 'reviews',  label: 'Reviews'         },
  { id: 'buddies',  label: 'Buddy History'   },
  { id: 'badges',   label: 'Badges'          },
]

export default function UserProfile() {
  const { id } = useParams()
  const { user } = useAuth()
  const isOwn = !id
  const profile = isOwn && user
    ? { ...profileData, name: user.name || profileData.name, role: user.role || profileData.role }
    : profileData

  const [activeTab, setActiveTab] = useState('timeline')

  return (
    <PageTransition>
      <div style={{ background: 'var(--ink)', minHeight: '100vh' }}>

        {/* ── COVER + AVATAR ── */}
        <div style={{
          background: 'linear-gradient(135deg, #0d1a2e 0%, #1a2744 50%, #0a0e1a 100%)',
          padding: 'clamp(90px, 10vw, 120px) 0 0',
          position: 'relative', overflow: 'hidden',
        }}>
          {/* Decorative background */}
          <div style={{ position: 'absolute', top: -60, right: -60, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,84,26,0.1) 0%, transparent 70%)', filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(255,253,248,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,253,248,0.02) 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />

          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ display: 'flex', gap: 24, alignItems: 'flex-end', flexWrap: 'wrap', paddingBottom: 28 }}>
                {/* Avatar */}
                <div style={{ position: 'relative' }}>
                  <div style={{
                    width: 100, height: 100, borderRadius: '50%',
                    background: 'rgba(232,84,26,0.15)',
                    border: '4px solid rgba(232,84,26,0.4)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 46,
                  }}>{profile.avatar}</div>
                  {isOwn && (
                    <button style={{
                      position: 'absolute', bottom: 2, right: 2,
                      width: 26, height: 26, borderRadius: '50%',
                      background: 'var(--accent)', color: 'white',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      border: '2px solid #0a0e1a', cursor: 'pointer',
                    }}>
                      <Camera size={11} />
                    </button>
                  )}
                </div>

                {/* Name block */}
                <div style={{ flex: 1, minWidth: 200 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                    <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 4vw, 34px)', fontWeight: 700, color: 'var(--paper)', letterSpacing: '-0.02em', lineHeight: 1 }}>
                      {profile.name}
                    </h1>
                    {profile.trust >= 95 && (
                      <span style={{ background: 'rgba(31,138,85,0.15)', color: 'var(--accent3)', fontSize: 10, fontFamily: 'var(--font-heading)', fontWeight: 700, letterSpacing: 1, padding: '3px 10px', borderRadius: 20, border: '1px solid rgba(31,138,85,0.3)' }}>TRUSTED</span>
                    )}
                  </div>
                  <p style={{ color: 'rgba(247,244,238,0.45)', fontSize: 13, marginBottom: 8 }}>{profile.tagline}</p>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 14, flexWrap: 'wrap' }}>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(247,244,238,0.5)', fontSize: 12 }}>
                      <MapPin size={12} /> {profile.location}
                    </span>
                    <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'rgba(247,244,238,0.5)', fontSize: 12 }}>
                      <Globe size={12} /> Joined {profile.joinedDate}
                    </span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                      <Star size={12} fill="#c9a227" style={{ color: '#c9a227' }} />
                      <span style={{ fontWeight: 700, fontSize: 13, color: '#c9a227' }}>{profile.rating}</span>
                    </div>
                  </div>
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                  {isOwn ? (
                    <>
                      <button className="btn btn-outline" style={{ fontSize: 12, padding: '9px 18px' }}>
                        <Edit3 size={13} /> Edit Profile
                      </button>
                      <button className="btn btn-ghost" style={{ width: 38, height: 38, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: '50%', border: '1px solid rgba(255,253,248,0.15)' }}>
                        <Settings size={15} />
                      </button>
                    </>
                  ) : (
                    <>
                      <Link to="/messages" className="btn btn-outline" style={{ fontSize: 12, padding: '9px 18px' }}>
                        <MessageSquare size={13} /> Message
                      </Link>
                      <button className="btn btn-primary" style={{ fontSize: 12, padding: '9px 18px' }}>
                        <Users size={13} /> Connect
                      </button>
                    </>
                  )}
                </div>
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── STATS STRIP ── */}
        <div style={{ background: 'var(--ink)', borderBottom: '1px solid rgba(255,253,248,0.06)' }}>
          <div className="container">
            <div style={{ display: 'flex', gap: 0, overflow: 'auto' }}>
              {[
                { label: 'Countries',  value: profile.stats.countries, emoji: '🌍' },
                { label: 'Trips',      value: profile.stats.trips,     emoji: '✈️' },
                { label: 'Buddies',    value: profile.stats.buddies,   emoji: '🤝' },
                { label: 'Reviews',    value: profile.stats.reviews,   emoji: '⭐' },
                { label: 'Trust Score',value: `${profile.trust}%`,     emoji: '🛡️' },
              ].map(({ label, value, emoji }) => (
                <div key={label} style={{ padding: '14px 24px', borderRight: '1px solid rgba(255,253,248,0.06)', minWidth: 110, flexShrink: 0, textAlign: 'center' }}>
                  <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--paper)', lineHeight: 1, marginBottom: 4 }}>{value}</div>
                  <div style={{ color: 'rgba(247,244,238,0.35)', fontSize: 10, fontFamily: 'var(--font-heading)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase' }}>{emoji} {label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── MAIN CONTENT ── */}
        <div className="container" style={{ padding: 'clamp(28px, 5vw, 48px) clamp(20px, 5vw, 80px)', paddingBottom: 80 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 280px', gap: 36, alignItems: 'start' }}>

            {/* Left — tabs */}
            <div>
              {/* Tab nav */}
              <div style={{ display: 'flex', gap: 0, borderBottom: '1px solid var(--border)', marginBottom: 28 }}>
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

                  {/* ── TIMELINE ── */}
                  {activeTab === 'timeline' && (
                    <div>
                      {trips.map((trip, i) => (
                        <motion.div key={trip.id} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
                          style={{ display: 'flex', gap: 14, marginBottom: 18 }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                            <div style={{
                              width: 38, height: 38, borderRadius: '50%',
                              background: trip.status === 'Upcoming' ? 'rgba(232,84,26,0.12)' : trip.color + '20',
                              border: `2px solid ${trip.status === 'Upcoming' ? 'rgba(232,84,26,0.35)' : trip.color + '50'}`,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontSize: 18,
                            }}>{trip.emoji}</div>
                            {i < trips.length - 1 && <div style={{ width: 2, flex: 1, background: 'var(--border)', margin: '4px 0' }} />}
                          </div>
                          <div style={{
                            flex: 1, padding: '13px 16px',
                            background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 10, marginBottom: 4,
                          }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 8 }}>
                              <div>
                                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: 'var(--paper)', marginBottom: 3 }}>{trip.dest}</h3>
                                <p style={{ color: 'var(--muted)', fontSize: 12 }}>{trip.dates}</p>
                              </div>
                              <div style={{ display: 'flex', gap: 7, alignItems: 'center' }}>
                                <span style={{
                                  fontSize: 10, fontFamily: 'var(--font-heading)', fontWeight: 700, letterSpacing: 0.5,
                                  padding: '3px 9px', borderRadius: 20,
                                  background: trip.status === 'Upcoming' ? 'rgba(232,84,26,0.1)' : 'rgba(31,138,85,0.1)',
                                  color: trip.status === 'Upcoming' ? 'var(--accent)' : 'var(--accent3)',
                                }}>
                                  {trip.status}
                                </span>
                                {trip.rating && (
                                  <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                                    <Star size={11} fill="#c9a227" style={{ color: '#c9a227' }} />
                                    <span style={{ fontSize: 12, fontWeight: 700, color: '#c9a227' }}>{trip.rating}</span>
                                  </div>
                                )}
                              </div>
                            </div>
                            {trip.buddies > 0 && (
                              <p style={{ color: 'var(--muted)', fontSize: 11, marginTop: 8, display: 'flex', alignItems: 'center', gap: 5 }}>
                                <Users size={11} /> {trip.buddies} buddy matched
                              </p>
                            )}
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                  {/* ── REVIEWS ── */}
                  {activeTab === 'reviews' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                      {reviews.map((r, i) => (
                        <div key={i} style={{ padding: '18px 18px 20px', background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 10 }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12, flexWrap: 'wrap', gap: 8 }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                              <span style={{ fontSize: 20 }}>{r.emoji}</span>
                              <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: 'var(--paper)' }}>{r.dest}</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <div style={{ display: 'flex', gap: 2 }}>
                                {[...Array(r.rating)].map((_, j) => <Star key={j} size={12} fill="#c9a227" style={{ color: '#c9a227' }} />)}
                              </div>
                              <span style={{ color: 'var(--muted)', fontSize: 11 }}>{r.date}</span>
                            </div>
                          </div>
                          <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.7 }}>{r.text}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── BUDDY HISTORY ── */}
                  {activeTab === 'buddies' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                      {buddyHistory.map((b, i) => (
                        <div key={i} style={{
                          display: 'flex', alignItems: 'center', gap: 14,
                          padding: '14px 18px', background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 10,
                        }}>
                          <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'var(--paper)', border: '2px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22 }}>{b.avatar}</div>
                          <div style={{ flex: 1 }}>
                            <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: 'var(--paper)', marginBottom: 3 }}>{b.name}</div>
                            <div style={{ color: 'var(--muted)', fontSize: 12 }}>Trip: {b.trip} · {b.date}</div>
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                            <Star size={12} fill="#c9a227" style={{ color: '#c9a227' }} />
                            <span style={{ fontWeight: 700, fontSize: 13, color: '#c9a227' }}>{b.rating}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {/* ── BADGES ── */}
                  {activeTab === 'badges' && (
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(190px, 1fr))', gap: 14 }}>
                      {profile.badges.map((b) => (
                        <motion.div key={b.name} whileHover={{ y: -3 }}
                          style={{
                            padding: '20px 18px', textAlign: 'center',
                            background: 'var(--surface3)', border: `1px solid ${b.color}30`, borderRadius: 'var(--r-md)',
                            transition: 'box-shadow 0.2s',
                          }}
                          onMouseEnter={e => e.currentTarget.style.boxShadow = `0 8px 24px ${b.color}20`}
                          onMouseLeave={e => e.currentTarget.style.boxShadow = 'none'}
                        >
                          <div style={{
                            width: 54, height: 54, borderRadius: '50%',
                            background: `${b.color}15`, border: `2px solid ${b.color}40`,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 26, margin: '0 auto 12px',
                          }}>{b.emoji}</div>
                          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, color: 'var(--paper)', marginBottom: 5 }}>{b.name}</div>
                          <div style={{ color: 'var(--muted)', fontSize: 11, lineHeight: 1.5 }}>{b.desc}</div>
                        </motion.div>
                      ))}
                    </div>
                  )}

                </motion.div>
              </AnimatePresence>
            </div>

            {/* Right sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }} className="hide-mobile">

              {/* About card */}
              <div style={{ background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '18px 18px 20px' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, color: 'var(--paper)', marginBottom: 12 }}>About</h3>
                <p style={{ color: 'var(--muted)', fontSize: 12, lineHeight: 1.7, marginBottom: 16 }}>{profile.bio}</p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    { label: 'Travel Style', value: profile.travelStyle },
                    { label: 'Languages',    value: profile.languages.join(', ') },
                    { label: 'Nationality',  value: profile.nationality },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <span style={{ fontFamily: 'var(--font-heading)', fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 2 }}>{label}</span>
                      <span style={{ fontSize: 12, color: 'var(--paper)', fontWeight: 600 }}>{value}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Top badges preview */}
              <div style={{ background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '18px 18px 20px' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, color: 'var(--paper)', marginBottom: 14 }}>
                  <Award size={13} style={{ display: 'inline', marginRight: 6 }} />Achievements
                </h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {profile.badges.slice(0, 4).map(b => (
                    <div key={b.name} style={{
                      width: 42, height: 42, borderRadius: 10,
                      background: `${b.color}15`, border: `1px solid ${b.color}30`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 20, cursor: 'pointer', title: b.name,
                    }} title={b.name}>{b.emoji}</div>
                  ))}
                  <button onClick={() => setActiveTab('badges')} style={{
                    width: 42, height: 42, borderRadius: 10,
                    background: 'var(--paper)', border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 11, color: 'var(--muted)', fontWeight: 700, cursor: 'pointer',
                  }}>+{profile.badges.length - 4}</button>
                </div>
              </div>

              {/* Expense History */}
              <div style={{ background: 'var(--surface3)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '18px 18px 20px' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, color: 'var(--paper)', marginBottom: 12 }}>💰 Expense History</h3>
                {[
                  { trip: 'Kyoto', amount: '$2,840', split: 'Split with Luca' },
                  { trip: 'Marrakech', amount: '$1,640', split: 'Solo' },
                ].map(e => (
                  <div key={e.trip} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: '1px solid var(--border)' }}>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--paper)' }}>{e.trip}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)' }}>{e.split}</div>
                    </div>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: 'var(--accent)' }}>{e.amount}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </PageTransition>
  )
}
