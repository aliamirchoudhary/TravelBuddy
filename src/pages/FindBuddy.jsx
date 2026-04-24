import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Search, Star, MessageSquare, UserCheck, MapPin, DollarSign, Users, Globe } from 'lucide-react'
import Footer from '../components/Footer.jsx'
import PageTransition from '../components/PageTransition.jsx'
import StudioSidebar from '../components/StudioSidebar.jsx'
import AnimatedGlobe from '../components/AnimatedGlobe.jsx'
import LiveBackground from '../components/LiveBackground.jsx'

const travelStyles = ['Adventure', 'Relaxation', 'Cultural', 'Mixed']

const mockBuddies = [
  { id: 1, name: 'Amara Nwosu',    avatar: '🌍', age: 27, nationality: 'Nigerian',  destination: 'Santorini, Greece',  dates: 'Jun 12–22', budget: '$2,000–3,000', style: 'Cultural',   rating: 4.9, trips: 12, trust: 98, match: 96, languages: ['English', 'French'],                  badges: ['5 Countries', 'Top Reviewer'],     bio: 'Solo traveler obsessed with history, food, and meeting locals. Always down for an unplanned adventure.' },
  { id: 2, name: 'Luca Moretti',   avatar: '🎒', age: 30, nationality: 'Italian',   destination: 'Kyoto, Japan',       dates: 'Jul 1–15',  budget: '$2,500–3,500', style: 'Cultural',   rating: 4.8, trips: 9,  trust: 94, match: 91, languages: ['English', 'Italian', 'Japanese'],    badges: ['Cultural Explorer', '10 Matches'], bio: 'Architect by day, street photographer by night. I move slowly and try to really live in each place.' },
  { id: 3, name: 'Sara Kim',       avatar: '📸', age: 25, nationality: 'Korean',    destination: 'Bali, Indonesia',    dates: 'Aug 5–18',  budget: '$1,200–1,800', style: 'Relaxation', rating: 4.7, trips: 6,  trust: 90, match: 88, languages: ['English', 'Korean'],                  badges: ['Beach Lover', 'Verified'],         bio: 'Digital nomad working remotely from cafes around the world. I love slow mornings and good coffee.' },
  { id: 4, name: 'Omar Rashid',    avatar: '🏔️', age: 32, nationality: 'Pakistani', destination: 'Patagonia',          dates: 'Oct 1–14',  budget: '$3,000–4,000', style: 'Adventure',  rating: 4.9, trips: 18, trust: 99, match: 85, languages: ['English', 'Urdu', 'Spanish'],         badges: ['Mountaineer', '5 Continents'],     bio: 'Trekking and mountaineering is my therapy. Looking for a partner who can keep up on the trail.' },
  { id: 5, name: 'Isabelle Dupont',avatar: '🌸', age: 28, nationality: 'French',    destination: 'Marrakech, Morocco', dates: 'May 20–28', budget: '$1,500–2,000', style: 'Mixed',      rating: 4.6, trips: 4,  trust: 85, match: 82, languages: ['French', 'English', 'Arabic'],        badges: ['Foodie', 'First Timer'],           bio: 'Love markets, textiles, and getting completely lost in medinas. Looking for a relaxed travel pace.' },
  { id: 6, name: 'Riya Sharma',    avatar: '💃', age: 26, nationality: 'Indian',    destination: 'Cappadocia, Turkey', dates: 'Sep 8–15',  budget: '$1,800–2,500', style: 'Adventure',  rating: 4.8, trips: 7,  trust: 92, match: 79, languages: ['English', 'Hindi'],                   badges: ['Hot Air Balloon', 'Verified'],     bio: 'Part-time vlogger, full-time explorer. I document every trip and love sharing hidden gems.' },
]

const styleColors = { Adventure: 'var(--accent3)', Cultural: 'var(--accent2)', Relaxation: 'var(--accent4)', Mixed: 'var(--accent5)' }

function MatchScore({ score }) {
  const color = score >= 90 ? 'var(--accent3)' : score >= 80 ? 'var(--accent5)' : 'var(--accent)'
  return (
    <div style={{ textAlign: 'center', flexShrink: 0 }}>
      <div style={{
        width: 54, height: 54, borderRadius: '50%',
        border: `2.5px solid ${color}`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: `${color}15`,
        boxShadow: `0 0 16px ${color}30`,
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 800, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 8, color, fontWeight: 700 }}>%</span>
      </div>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 8, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--paper-dim)', marginTop: 5 }}>Match</div>
    </div>
  )
}

function BuddyCard({ buddy, index }) {
  const [ref, inView] = useInView({ threshold: 0.08, triggerOnce: true })
  const [requested, setRequested] = useState(false)
  const styleColor = styleColors[buddy.style] || 'var(--accent)'

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
      whileHover={{ y: -5 }}
    >
      <div style={{
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-md)',
        overflow: 'hidden',
        transition: 'border-color 0.3s, box-shadow 0.3s',
      }}
        onMouseEnter={e => {
          e.currentTarget.style.borderColor = `${styleColor}50`
          e.currentTarget.style.boxShadow = `0 16px 48px rgba(0,0,0,0.4), 0 0 30px ${styleColor}15`
        }}
        onMouseLeave={e => {
          e.currentTarget.style.borderColor = 'var(--border)'
          e.currentTarget.style.boxShadow = 'none'
        }}
      >
        {/* Style accent strip */}
        <div style={{ height: 3, background: styleColor, boxShadow: `0 0 10px ${styleColor}60` }} />

        <div style={{ padding: '20px 20px 22px' }}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
            <div style={{
              width: 52, height: 52, borderRadius: '50%',
              background: `${styleColor}20`,
              border: `2px solid ${styleColor}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, flexShrink: 0,
            }}>{buddy.avatar}</div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3, flexWrap: 'wrap' }}>
                <h3 style={{
                  fontFamily: 'var(--font-heading)', fontWeight: 700,
                  fontSize: 15, color: 'var(--paper)', lineHeight: 1,
                }}>{buddy.name}</h3>
                {buddy.trust >= 95 && (
                  <span style={{
                    background: 'rgba(0,232,135,0.12)', color: 'var(--accent3)',
                    fontSize: 8, fontWeight: 700, fontFamily: 'var(--font-heading)',
                    letterSpacing: 1, padding: '2px 8px', borderRadius: 8,
                    border: '1px solid rgba(0,232,135,0.25)',
                  }}>TRUSTED</span>
                )}
              </div>
              <p style={{ color: 'var(--paper-muted)', fontSize: 12, marginBottom: 4 }}>
                Age {buddy.age} · {buddy.nationality}
              </p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                <Star size={11} fill="var(--accent5)" style={{ color: 'var(--accent5)' }} />
                <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--paper)' }}>{buddy.rating}</span>
                <span style={{ color: 'var(--paper-dim)', fontSize: 11 }}>· {buddy.trips} trips</span>
              </div>
            </div>

            <MatchScore score={buddy.match} />
          </div>

          {/* Bio */}
          <p style={{
            color: 'var(--paper-muted)', fontSize: 12,
            lineHeight: 1.7, marginBottom: 16,
            fontStyle: 'italic',
          }}>"{buddy.bio}"</p>

          {/* Trip details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 14 }}>
            {[
              { icon: MapPin,     text: buddy.destination,         color: 'var(--accent)' },
              { icon: DollarSign, text: `Budget: ${buddy.budget}`, color: 'var(--accent3)' },
              { icon: Users,      text: `Style: ${buddy.style}`,   color: styleColor },
            ].map(({ icon: Icon, text, color }) => (
              <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <div style={{
                  width: 22, height: 22, borderRadius: 6,
                  background: `${color}15`, border: `1px solid ${color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Icon size={11} style={{ color }} />
                </div>
                <span style={{ color: 'var(--paper)', fontSize: 12, fontWeight: 500 }}>{text}</span>
              </div>
            ))}
          </div>

          {/* Badges */}
          <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 12 }}>
            {buddy.badges.map(b => (
              <span key={b} style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid var(--border)',
                color: 'var(--paper-muted)', fontSize: 10,
                fontFamily: 'var(--font-heading)', fontWeight: 700,
                padding: '3px 10px', borderRadius: 20,
              }}>{b}</span>
            ))}
          </div>

          {/* Languages */}
          <p style={{ color: 'var(--paper-dim)', fontSize: 11, marginBottom: 16 }}>
            🗣 {buddy.languages.join(', ')}
          </p>

          {/* Actions */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setRequested(r => !r)}
              style={{
                flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
                padding: '10px 14px', borderRadius: 100,
                fontFamily: 'var(--font-heading)', fontSize: 12, fontWeight: 700,
                cursor: 'pointer', transition: 'all 0.25s', border: 'none',
                background: requested ? 'var(--accent3)' : 'var(--accent)',
                color: requested ? 'white' : 'var(--ink)',
                boxShadow: requested ? '0 0 16px rgba(0,232,135,0.3)' : '0 0 16px rgba(0,212,255,0.25)',
              }}
            >
              {requested ? <><UserCheck size={13} /> Requested</> : <><Users size={13} /> Connect</>}
            </button>
            <Link to="/messages" style={{
              width: 40, height: 40,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1.5px solid var(--border)', borderRadius: '50%',
              color: 'var(--paper-muted)', transition: 'all 0.2s', flexShrink: 0,
            }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--paper-muted)' }}
            >
              <MessageSquare size={15} />
            </Link>
          </div>
        </div>
      </div>
    </motion.div>
  )
}

export default function FindBuddy() {
  const [showResults, setShowResults] = useState(false)
  const [searching, setSearching]     = useState(false)
  const [form, setForm] = useState({ destination: '', style: '', budgetMin: '', budgetMax: '', ageMin: '', ageMax: '' })
  const [styleFilter, setStyleFilter] = useState('All')

  const handleSearch = (e) => {
    e.preventDefault()
    setSearching(true)
    setTimeout(() => { setSearching(false); setShowResults(true) }, 1600)
  }

  const filtered = styleFilter === 'All' ? mockBuddies : mockBuddies.filter(b => b.style === styleFilter)

  return (
    <PageTransition>
      <div style={{ background: 'var(--ink)', minHeight: '100vh' }}>

        {/* Hero */}
        <div style={{
          padding: 'clamp(90px,12vw,150px) 0 60px',
          background: 'var(--surface)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div className="grid-overlay" />
          <div style={{
            position: 'absolute', top: -80, right: '10%',
            width: 400, height: 400, borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(255,97,216,0.07) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }} />
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="tag" style={{ marginBottom: 10 }}>🤝 Buddy Matching</p>
              <h1 className="display-heading" style={{ fontSize: 'clamp(36px,7vw,70px)', color: 'var(--paper)', marginBottom: 14 }}>
                Find Your Perfect<br /><span style={{ color: 'var(--accent)' }}>Travel Companion</span>
              </h1>
              <p style={{ color: 'var(--paper-muted)', fontSize: 16, maxWidth: 500, lineHeight: 1.8 }}>
                Our AI matching algorithm pairs you with compatible travelers based on destination, budget, travel style, and personality.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Search Form */}
        <div style={{
          background: 'var(--surface2)',
          borderBottom: '1px solid var(--border)',
          borderTop: '1px solid var(--border)',
        }}>
          <div className="container" style={{ padding: 'clamp(28px,5vw,48px) clamp(20px,5vw,80px)' }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)', fontWeight: 700,
              fontSize: 15, color: 'var(--paper)', marginBottom: 22,
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <Globe size={16} style={{ color: 'var(--accent)' }} />
              Enter Your Preferences
            </h2>
            <form onSubmit={handleSearch}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 22 }}>
                {[
                  { key: 'destination', label: 'Destination', placeholder: 'e.g. Santorini', type: 'text' },
                  { key: 'budgetMin',   label: 'Budget Min ($)', placeholder: 'e.g. 1000', type: 'number' },
                  { key: 'budgetMax',   label: 'Budget Max ($)', placeholder: 'e.g. 3000', type: 'number' },
                  { key: 'ageMin',      label: 'Age Min',       placeholder: 'e.g. 22', type: 'number' },
                  { key: 'ageMax',      label: 'Age Max',       placeholder: 'e.g. 35', type: 'number' },
                ].map(({ key, label, placeholder, type }) => (
                  <div key={key}>
                    <label style={{
                      fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700,
                      letterSpacing: 1.5, textTransform: 'uppercase',
                      color: 'var(--paper-dim)', display: 'block', marginBottom: 8,
                    }}>{label}</label>
                    <input
                      className="input"
                      type={type}
                      placeholder={placeholder}
                      value={form[key]}
                      onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    />
                  </div>
                ))}
                <div>
                  <label style={{
                    fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700,
                    letterSpacing: 1.5, textTransform: 'uppercase',
                    color: 'var(--paper-dim)', display: 'block', marginBottom: 8,
                  }}>Travel Style</label>
                  <select
                    className="input"
                    value={form.style}
                    onChange={e => setForm(f => ({ ...f, style: e.target.value }))}
                  >
                    <option value="">Any style</option>
                    {travelStyles.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
              </div>

              <motion.button
                type="submit" disabled={searching}
                className="btn btn-primary"
                style={{ fontSize: 14, padding: '13px 32px' }}
                whileTap={{ scale: 0.97 }}
              >
                {searching ? (
                  <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                    style={{ width: 16, height: 16, border: '2px solid rgba(5,11,20,0.3)', borderTopColor: 'var(--ink)', borderRadius: '50%' }} />
                    Running Algorithm...</>
                ) : (
                  <><Search size={15} /> Find My Buddy</>
                )}
              </motion.button>
            </form>
          </div>
        </div>

        {/* Results */}
        <AnimatePresence>
          {showResults && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
              <div style={{ maxWidth: 1400, margin: '0 auto', padding: '40px clamp(16px,4vw,40px) 80px', display: 'flex', gap: 24, alignItems: 'flex-start' }}>
                <StudioSidebar activeOverride="/buddy" />
                <div style={{ flex: 1, minWidth: 0 }}>
                <div
                  className="bento-card"
                  style={{
                    position: 'relative',
                    minHeight: 340,
                    marginBottom: 28,
                    overflow: 'hidden',
                    borderRadius: 'var(--r-panel)',
                  }}
                >
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.4 }}>
                    <LiveBackground />
                  </div>
                  <div style={{ position: 'relative', zIndex: 1, height: 340, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <div className="hide-mobile" style={{ width: '100%', maxWidth: 420 }}>
                      <AnimatedGlobe />
                    </div>
                    <div className="hide-desktop" style={{ padding: 24, textAlign: 'center', color: 'var(--paper-muted)', fontSize: 13 }}>
                      Interactive globe — open on a larger display for the full map experience.
                    </div>
                  </div>
                  <div style={{
                    position: 'absolute', bottom: 16, right: 16, zIndex: 2,
                    padding: '10px 14px', borderRadius: 12,
                    background: 'rgba(13,17,23,0.85)', border: '1px solid var(--border)',
                    fontSize: 11, color: 'var(--accent)', fontFamily: 'var(--font-heading)', fontWeight: 700,
                  }}>
                    Live markers · {filtered.length} matches in view
                  </div>
                </div>

                {/* Results header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, color: 'var(--paper)', marginBottom: 4 }}>
                      <span style={{ color: 'var(--accent)' }}>{filtered.length}</span> Compatible Buddies Found
                    </h2>
                    <p style={{ color: 'var(--paper-dim)', fontSize: 12 }}>Sorted by compatibility score — highest first</p>
                  </div>
                  <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                    {['All', ...travelStyles].map(f => (
                      <button key={f} onClick={() => setStyleFilter(f)} style={{
                        padding: '6px 14px', borderRadius: 100,
                        fontFamily: 'var(--font-heading)', fontSize: 11, fontWeight: 700,
                        cursor: 'pointer', transition: 'all 0.2s',
                        background: styleFilter === f ? 'var(--accent)' : 'transparent',
                        color: styleFilter === f ? 'var(--ink)' : 'var(--paper-muted)',
                        border: `1.5px solid ${styleFilter === f ? 'var(--accent)' : 'var(--border)'}`,
                      }}>{f}</button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                  {filtered.map((buddy, i) => <BuddyCard key={buddy.id} buddy={buddy} index={i} />)}
                </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state */}
        {!showResults && !searching && (
          <div style={{ textAlign: 'center', padding: 'clamp(60px,10vw,100px) 20px' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
              <div style={{
                width: 80, height: 80, borderRadius: '50%', margin: '0 auto 24px',
                background: 'rgba(255,97,216,0.1)', border: '1px solid rgba(255,97,216,0.2)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 38,
              }}>🤝</div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'var(--paper)', marginBottom: 10 }}>
                Fill in your preferences above
              </h3>
              <p style={{ color: 'var(--paper-muted)', fontSize: 14, maxWidth: 380, margin: '0 auto', lineHeight: 1.7 }}>
                Our algorithm will match you with compatible travel buddies based on your destination, dates, budget, and style.
              </p>
            </motion.div>
          </div>
        )}

        <Footer />
      </div>
    </PageTransition>
  )
}
