import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Search, Star, MessageSquare, UserCheck, Filter, MapPin, DollarSign, Users, ArrowRight, ChevronDown } from 'lucide-react'
import Footer from '../components/Footer.jsx'
import PageTransition from '../components/PageTransition.jsx'

const travelStyles = ['Adventure', 'Relaxation', 'Cultural', 'Mixed']

const mockBuddies = [
  { id: 1, name: 'Amara Nwosu',      avatar: '🌍', age: 27, nationality: 'Nigerian', destination: 'Santorini, Greece', dates: 'Jun 12–22', budget: '$2,000–3,000', style: 'Cultural',   rating: 4.9, trips: 12, trust: 98, match: 96, languages: ['English', 'French'], badges: ['5 Countries', 'Top Reviewer'], bio: 'Solo traveler obsessed with history, food, and meeting locals. Always down for an unplanned adventure.' },
  { id: 2, name: 'Luca Moretti',     avatar: '🎒', age: 30, nationality: 'Italian',  destination: 'Kyoto, Japan',      dates: 'Jul 1–15',  budget: '$2,500–3,500', style: 'Cultural',   rating: 4.8, trips: 9,  trust: 94, match: 91, languages: ['English', 'Italian', 'Japanese'], badges: ['Cultural Explorer', '10 Matches'], bio: 'Architect by day, street photographer by night. I move slowly and try to really live in each place.' },
  { id: 3, name: 'Sara Kim',         avatar: '📸', age: 25, nationality: 'Korean',   destination: 'Bali, Indonesia',   dates: 'Aug 5–18',  budget: '$1,200–1,800', style: 'Relaxation', rating: 4.7, trips: 6,  trust: 90, match: 88, languages: ['English', 'Korean'], badges: ['Beach Lover', 'Verified'], bio: 'Digital nomad working remotely from cafes around the world. I love slow mornings and good coffee.' },
  { id: 4, name: 'Omar Rashid',      avatar: '🏔️', age: 32, nationality: 'Pakistani',destination: 'Patagonia',         dates: 'Oct 1–14',  budget: '$3,000–4,000', style: 'Adventure',  rating: 4.9, trips: 18, trust: 99, match: 85, languages: ['English', 'Urdu', 'Spanish'], badges: ['Mountaineer', '5 Continents', 'Trusted'], bio: 'Trekking and mountaineering is my therapy. Looking for a partner who can keep up on the trail.' },
  { id: 5, name: 'Isabelle Dupont',  avatar: '🌸', age: 28, nationality: 'French',   destination: 'Marrakech, Morocco',dates: 'May 20–28', budget: '$1,500–2,000', style: 'Mixed',      rating: 4.6, trips: 4,  trust: 85, match: 82, languages: ['French', 'English', 'Arabic'], badges: ['Foodie', 'First Timer'], bio: 'Love markets, textiles, and getting completely lost in medinas. Looking for a relaxed travel pace.' },
  { id: 6, name: 'Riya Sharma',      avatar: '💃', age: 26, nationality: 'Indian',   destination: 'Cappadocia, Turkey',dates: 'Sep 8–15',  budget: '$1,800–2,500', style: 'Adventure',  rating: 4.8, trips: 7,  trust: 92, match: 79, languages: ['English', 'Hindi'], badges: ['Hot Air Balloon', 'Verified'], bio: 'Part-time vlogger, full-time explorer. I document every trip and love sharing hidden gems.' },
]

function MatchScore({ score }) {
  const color = score >= 90 ? 'var(--accent3)' : score >= 80 ? 'var(--accent5)' : 'var(--accent2)'
  return (
    <div style={{ textAlign: 'center', flexShrink: 0 }}>
      <div style={{
        width: 52, height: 52, borderRadius: '50%',
        border: `3px solid ${color}`,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        background: `${color}12`,
      }}>
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color, lineHeight: 1 }}>{score}</span>
        <span style={{ fontSize: 8, color, fontWeight: 700 }}>%</span>
      </div>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 8, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', color: 'var(--muted)', marginTop: 4 }}>Match</div>
    </div>
  )
}

function BuddyCard({ buddy, index }) {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [requested, setRequested] = useState(false)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
      style={{
        background: 'white', border: '1px solid var(--border)',
        borderRadius: 'var(--r-md)', overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)', transition: 'box-shadow 0.3s, transform 0.3s',
      }}
      whileHover={{ y: -4, boxShadow: '0 16px 48px rgba(0,0,0,0.1)' }}
    >
      {/* Top stripe by style */}
      <div style={{
        height: 4,
        background: buddy.style === 'Adventure' ? 'var(--accent3)' : buddy.style === 'Cultural' ? 'var(--accent2)' : buddy.style === 'Relaxation' ? 'var(--accent4)' : 'var(--accent5)',
      }} />

      <div style={{ padding: '18px 18px 20px' }}>
        {/* Header row */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 14 }}>
          {/* Avatar */}
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'var(--paper)', border: '2px solid var(--border)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 26, flexShrink: 0,
          }}>{buddy.avatar}</div>

          {/* Name + meta */}
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 7, marginBottom: 3, flexWrap: 'wrap' }}>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, color: 'var(--ink)', lineHeight: 1 }}>{buddy.name}</h3>
              {buddy.trust >= 95 && (
                <span style={{ background: 'rgba(31,138,85,0.1)', color: 'var(--accent3)', fontSize: 9, fontWeight: 700, fontFamily: 'var(--font-heading)', letterSpacing: 0.5, padding: '2px 7px', borderRadius: 10 }}>TRUSTED</span>
              )}
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 12, marginBottom: 4 }}>Age {buddy.age} · {buddy.nationality}</p>
            <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
              <Star size={11} fill="#c9a227" style={{ color: '#c9a227' }} />
              <span style={{ fontWeight: 700, fontSize: 12, color: 'var(--ink)' }}>{buddy.rating}</span>
              <span style={{ color: 'var(--muted)', fontSize: 11 }}>· {buddy.trips} trips</span>
            </div>
          </div>

          <MatchScore score={buddy.match} />
        </div>

        {/* Bio */}
        <p style={{ color: 'var(--muted)', fontSize: 12, lineHeight: 1.65, marginBottom: 14 }}>{buddy.bio}</p>

        {/* Trip details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 7, marginBottom: 14 }}>
          {[
            { icon: MapPin,     text: buddy.destination },
            { icon: DollarSign, text: `Budget: ${buddy.budget}` },
            { icon: Users,      text: `Style: ${buddy.style}` },
          ].map(({ icon: Icon, text }) => (
            <div key={text} style={{ display: 'flex', alignItems: 'center', gap: 7 }}>
              <Icon size={12} style={{ color: 'var(--muted)', flexShrink: 0 }} />
              <span style={{ color: 'var(--ink)', fontSize: 12, fontWeight: 500 }}>{text}</span>
            </div>
          ))}
        </div>

        {/* Badges */}
        <div style={{ display: 'flex', gap: 5, flexWrap: 'wrap', marginBottom: 16 }}>
          {buddy.badges.map(b => (
            <span key={b} style={{ background: 'var(--paper)', border: '1px solid var(--border)', color: 'var(--muted)', fontSize: 10, fontFamily: 'var(--font-heading)', fontWeight: 700, padding: '2px 9px', borderRadius: 20 }}>
              {b}
            </span>
          ))}
        </div>

        {/* Languages */}
        <p style={{ color: 'var(--muted)', fontSize: 11, marginBottom: 14 }}>
          🗣 {buddy.languages.join(', ')}
        </p>

        {/* Actions */}
        <div style={{ display: 'flex', gap: 8 }}>
          <button
            onClick={() => setRequested(r => !r)}
            style={{
              flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6,
              padding: '10px',
              borderRadius: 100,
              fontFamily: 'var(--font-heading)', fontSize: 12, fontWeight: 700,
              cursor: 'pointer', transition: 'all 0.25s',
              background: requested ? 'var(--accent3)' : 'var(--ink)',
              color: 'white', border: 'none',
            }}
          >
            {requested ? <><UserCheck size={13} /> Requested</> : <><Users size={13} /> Connect</>}
          </button>
          <Link to="/messages" style={{
            width: 40, height: 40,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            border: '1.5px solid var(--border)', borderRadius: '50%',
            color: 'var(--muted)', transition: 'all 0.2s', flexShrink: 0,
          }}
            onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
            onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--muted)' }}
          >
            <MessageSquare size={15} />
          </Link>
        </div>
      </div>
    </motion.div>
  )
}

export default function FindBuddy() {
  const [showResults, setShowResults] = useState(false)
  const [searching,   setSearching]   = useState(false)
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

        {/* ── HERO ── */}
        <div style={{
          padding: 'clamp(90px, 10vw, 130px) 0 50px',
          background: 'linear-gradient(180deg, #0a0e1a 0%, #0d1a2e 100%)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -80, right: '10%', width: 420, height: 420, borderRadius: '50%', background: 'radial-gradient(circle, rgba(232,84,26,0.1) 0%, transparent 70%)', filter: 'blur(60px)' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(255,253,248,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,253,248,0.025) 1px, transparent 1px)`, backgroundSize: '50px 50px' }} />
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="tag" style={{ marginBottom: 10 }}>🤝 Buddy Matching</p>
              <h1 className="display-heading" style={{ fontSize: 'clamp(34px, 7vw, 68px)', color: 'var(--paper)', marginBottom: 14 }}>
                Find Your Perfect<br />Travel Companion
              </h1>
              <p style={{ color: 'rgba(247,244,238,0.5)', fontSize: 16, maxWidth: 500, lineHeight: 1.8 }}>
                Our AI matching algorithm pairs you with compatible travelers based on destination, budget, travel style, and personality.
              </p>
            </motion.div>
          </div>
        </div>

        {/* ── PREFERENCE FORM ── */}
        <div style={{ background: 'rgba(255,253,248,0.02)', borderBottom: '1px solid rgba(255,253,248,0.06)' }}>
          <div className="container" style={{ padding: 'clamp(28px, 5vw, 48px) clamp(20px, 5vw, 80px)' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 17, color: 'var(--paper)', marginBottom: 22 }}>
              Enter Your Preferences
            </h2>
            <form onSubmit={handleSearch}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14, marginBottom: 20 }}>
                {/* Destination */}
                <div>
                  <label style={{ fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(247,244,238,0.35)', display: 'block', marginBottom: 8 }}>Destination</label>
                  <input className="input" placeholder="e.g. Santorini, Greece" value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} />
                </div>
                {/* Travel style */}
                <div>
                  <label style={{ fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(247,244,238,0.35)', display: 'block', marginBottom: 8 }}>Travel Style</label>
                  <select className="input" style={{ cursor: 'pointer' }} value={form.style} onChange={e => setForm(f => ({ ...f, style: e.target.value }))}>
                    <option value="">Any style</option>
                    {travelStyles.map(s => <option key={s}>{s}</option>)}
                  </select>
                </div>
                {/* Budget min */}
                <div>
                  <label style={{ fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(247,244,238,0.35)', display: 'block', marginBottom: 8 }}>Budget Min (USD)</label>
                  <input className="input" type="number" placeholder="e.g. 1000" value={form.budgetMin} onChange={e => setForm(f => ({ ...f, budgetMin: e.target.value }))} />
                </div>
                {/* Budget max */}
                <div>
                  <label style={{ fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(247,244,238,0.35)', display: 'block', marginBottom: 8 }}>Budget Max (USD)</label>
                  <input className="input" type="number" placeholder="e.g. 3000" value={form.budgetMax} onChange={e => setForm(f => ({ ...f, budgetMax: e.target.value }))} />
                </div>
                {/* Age min */}
                <div>
                  <label style={{ fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(247,244,238,0.35)', display: 'block', marginBottom: 8 }}>Age Range (Min)</label>
                  <input className="input" type="number" placeholder="e.g. 22" value={form.ageMin} onChange={e => setForm(f => ({ ...f, ageMin: e.target.value }))} />
                </div>
                {/* Age max */}
                <div>
                  <label style={{ fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(247,244,238,0.35)', display: 'block', marginBottom: 8 }}>Age Range (Max)</label>
                  <input className="input" type="number" placeholder="e.g. 35" value={form.ageMax} onChange={e => setForm(f => ({ ...f, ageMax: e.target.value }))} />
                </div>
              </div>

              <motion.button
                type="submit"
                disabled={searching}
                className="btn btn-primary"
                style={{ fontSize: 14, padding: '13px 32px' }}
                whileTap={{ scale: 0.97 }}
              >
                {searching ? (
                  <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} /> Running Algorithm...</>
                ) : (
                  <><Search size={15} /> Find My Buddy</>
                )}
              </motion.button>
            </form>
          </div>
        </div>

        {/* ── RESULTS ── */}
        <AnimatePresence>
          {showResults && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.4 }}>
              <div className="container" style={{ padding: 'clamp(28px, 5vw, 48px) clamp(20px, 5vw, 80px)', paddingBottom: 80 }}>

                {/* Results header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
                  <div>
                    <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, color: 'var(--paper)', marginBottom: 4 }}>
                      {filtered.length} Compatible Buddies Found
                    </h2>
                    <p style={{ color: 'rgba(247,244,238,0.4)', fontSize: 12 }}>Sorted by compatibility score — highest first</p>
                  </div>
                  {/* Style filters */}
                  <div style={{ display: 'flex', gap: 7, flexWrap: 'wrap' }}>
                    {['All', ...travelStyles].map(f => (
                      <button key={f} onClick={() => setStyleFilter(f)} style={{
                        padding: '6px 14px', borderRadius: 100,
                        fontFamily: 'var(--font-heading)', fontSize: 11, fontWeight: 700,
                        cursor: 'pointer', transition: 'all 0.2s',
                        background: styleFilter === f ? 'var(--accent)' : 'rgba(255,253,248,0.05)',
                        color: styleFilter === f ? 'white' : 'rgba(247,244,238,0.45)',
                        border: styleFilter === f ? '1.5px solid var(--accent)' : '1.5px solid rgba(255,253,248,0.1)',
                      }}>{f}</button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 20 }}>
                  {filtered.map((buddy, i) => <BuddyCard key={buddy.id} buddy={buddy} index={i} />)}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Empty state when no search yet */}
        {!showResults && !searching && (
          <div style={{ textAlign: 'center', padding: 'clamp(50px, 8vw, 90px) 20px' }}>
            <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5 }}>
              <div style={{ fontSize: 52, marginBottom: 16 }}>🤝</div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'var(--paper)', marginBottom: 10 }}>
                Fill in your preferences above
              </h3>
              <p style={{ color: 'rgba(247,244,238,0.4)', fontSize: 14, maxWidth: 380, margin: '0 auto', lineHeight: 1.7 }}>
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
