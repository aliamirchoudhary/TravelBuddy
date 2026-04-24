import { useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { Star, Map, Users, ArrowLeft, Hotel, Utensils, Camera, Globe, AlertTriangle, ArrowRight } from 'lucide-react'
import Footer from '../components/Footer.jsx'
import PageTransition from '../components/PageTransition.jsx'

const destData = {
  1: { name: 'Santorini', country: 'Greece', emoji: '🇬🇷', color: '#1a6eb5', rating: 4.9, reviews: 3421, budget: '$$$$', category: 'Islands', desc: 'Famous for its stunning sunsets, white-washed buildings, and volcanic beaches, Santorini is the jewel of the Cyclades.', best_time: 'Apr–Oct', currency: 'EUR', language: 'Greek', safety: 'Very Safe', attractions: ['Oia Village', 'Red Beach', 'Akrotiri Ruins', 'Fira Town', 'Caldera Views'], hotels: ['Katikies Hotel', 'Grace Hotel', 'Canaves Oia'], restaurants: ['Ithaka Restaurant', 'Koukoumavlos', 'Selene'] },
  2: { name: 'Kyoto', country: 'Japan', emoji: '🇯🇵', color: '#8b3dca', rating: 4.8, reviews: 5102, budget: '$$$', category: 'Culture', desc: "Japan's ancient imperial capital, filled with thousands of shrines, temples, traditional tea houses, and geisha districts.", best_time: 'Mar–May, Oct–Nov', currency: 'JPY', language: 'Japanese', safety: 'Very Safe', attractions: ['Fushimi Inari Shrine', 'Arashiyama Bamboo Grove', 'Kinkaku-ji', 'Gion District', 'Nishiki Market'], hotels: ['The Ritz-Carlton Kyoto', 'Hyatt Regency', 'Tawaraya Ryokan'], restaurants: ['Nishiki Warai', 'Kikunoi', 'Mizai'] },
  5: { name: 'Bali', country: 'Indonesia', emoji: '🇮🇩', color: '#c9a227', rating: 4.9, reviews: 7230, budget: '$$', category: 'Beach', desc: 'A paradise island of temples, rice terraces, spiritual retreats, and world-class surf — Bali offers something for every kind of traveler.', best_time: 'Apr–Oct', currency: 'IDR', language: 'Balinese/Indonesian', safety: 'Safe', attractions: ['Ubud Monkey Forest', 'Tegalalang Rice Terrace', 'Tanah Lot Temple', 'Seminyak Beach', 'Mount Batur'], hotels: ['COMO Shambhala', 'Four Seasons Sayan', 'Alaya Resort Ubud'], restaurants: ['Locavore', 'Sardine', 'Métis Restaurant'] },
}

// Default fallback data for any destination
const defaultDest = (id) => ({
  name: `Destination ${id}`,
  country: 'World',
  emoji: '🌍',
  color: 'var(--accent2)',
  rating: 4.7,
  reviews: 1200,
  budget: '$$$',
  category: 'Explore',
  desc: 'A breathtaking destination waiting to be explored. Rich in culture, natural beauty, and unforgettable experiences.',
  best_time: 'Year Round',
  currency: 'USD',
  language: 'English',
  safety: 'Safe',
  attractions: ['Old Town', 'National Park', 'Local Market', 'Historic Cathedral', 'Scenic Viewpoint'],
  hotels: ['Grand Hotel', 'Boutique Inn', 'Resort Luxe'],
  restaurants: ['Local Cuisine Restaurant', 'Rooftop Dining', 'Street Food Market'],
})

const reviews = [
  { name: 'Sarah K.', avatar: '🌸', rating: 5, date: '2 weeks ago', text: 'Absolutely magical experience. The views are unlike anything I\'ve seen. Highly recommend visiting during sunset.', verified: true },
  { name: 'Marco L.', avatar: '🧳', rating: 5, date: '1 month ago', text: 'Found a great travel buddy through TravelBuddy — we split costs and had an amazing adventure together.', verified: true },
  { name: 'Aisha N.', avatar: '📸', rating: 4, date: '2 months ago', text: 'Beautiful destination! The local food was incredible. A bit crowded during peak season but still worth it.', verified: false },
]

export default function DestinationDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const dest = destData[id] || defaultDest(id)
  const [activeTab, setActiveTab] = useState('overview')

  const tabs = [
    { id: 'overview', label: 'Overview' },
    { id: 'attractions', label: 'Attractions' },
    { id: 'hotels', label: 'Hotels' },
    { id: 'restaurants', label: 'Food' },
    { id: 'reviews', label: `Reviews (${dest.reviews.toLocaleString()})` },
  ]

  return (
    <PageTransition>
      <div style={{ background: 'var(--ink)', minHeight: '100vh' }}>

        {/* Hero */}
        <div style={{
          background: `linear-gradient(180deg, #0a0e1a 0%, ${dest.color}30 50%, #0a0e1a 100%)`,
          padding: 'clamp(100px, 12vw, 140px) 0 60px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* big emoji bg */}
          <div style={{
            position: 'absolute', right: '5%', top: '50%', transform: 'translateY(-50%)',
            fontSize: 'clamp(120px, 20vw, 220px)',
            opacity: 0.08, userSelect: 'none',
          }}>{dest.emoji}</div>

          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <button
              onClick={() => navigate(-1)}
              style={{
                display: 'flex', alignItems: 'center', gap: 8,
                color: 'rgba(247,244,238,0.4)',
                fontFamily: 'var(--font-heading)',
                fontSize: 12, fontWeight: 600,
                marginBottom: 28,
                transition: 'color 0.2s',
              }}
              onMouseEnter={e => e.currentTarget.style.color = 'var(--paper)'}
              onMouseLeave={e => e.currentTarget.style.color = 'rgba(247,244,238,0.4)'}
            >
              <ArrowLeft size={14} /> Back to Explore
            </button>

            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 12 }}>
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: dest.color }}>{dest.category}</span>
                <span style={{ color: 'rgba(247,244,238,0.2)' }}>·</span>
                <span style={{ color: 'rgba(247,244,238,0.4)', fontSize: 12 }}>{dest.emoji} {dest.country}</span>
              </div>

              <h1 style={{
                fontFamily: 'var(--font-display)',
                fontSize: 'clamp(42px, 8vw, 80px)',
                fontWeight: 700,
                color: 'var(--paper)',
                lineHeight: 1.0,
                letterSpacing: '-0.03em',
                marginBottom: 16,
              }}>{dest.name}</h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} size={14} fill={i < Math.floor(dest.rating) ? '#c9a227' : 'transparent'} style={{ color: '#c9a227' }} />
                  ))}
                  <span style={{ color: '#c9a227', fontWeight: 700, fontSize: 14, marginLeft: 4 }}>{dest.rating}</span>
                  <span style={{ color: 'rgba(247,244,238,0.3)', fontSize: 13 }}>({dest.reviews.toLocaleString()} reviews)</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  {[dest.budget, dest.best_time && `Best: ${dest.best_time}`].filter(Boolean).map(tag => (
                    <span key={tag} style={{
                      background: 'rgba(255,253,248,0.08)',
                      color: 'rgba(247,244,238,0.6)',
                      fontSize: 11, fontFamily: 'var(--font-heading)', fontWeight: 600,
                      padding: '3px 10px', borderRadius: 20,
                    }}>{tag}</span>
                  ))}
                </div>
              </div>

              {/* CTA Buttons */}
              <div style={{ display: 'flex', gap: 10, marginTop: 28, flexWrap: 'wrap' }}>
                <Link
                  to={`/plan?dest=${dest.name}`}
                  className="btn btn-primary"
                  style={{ fontSize: 14, padding: '13px 28px' }}
                >
                  Plan a Trip Here <ArrowRight size={15} />
                </Link>
                <Link
                  to="/buddy"
                  className="btn btn-outline"
                  style={{ fontSize: 14, padding: '13px 22px' }}
                >
                  <Users size={14} /> Find Buddy for This Trip
                </Link>
              </div>
            </motion.div>
          </div>
        </div>

        {/* Quick Info Strip */}
        <div style={{ background: 'var(--ink)', borderBottom: '1px solid rgba(255,253,248,0.06)' }}>
          <div className="container">
            <div style={{ display: 'flex', gap: 0, overflow: 'auto' }}>
              {[
                { emoji: '💰', label: 'Currency', value: dest.currency },
                { emoji: '🗣️', label: 'Language', value: dest.language },
                { emoji: '🛡️', label: 'Safety', value: dest.safety },
                { emoji: '📅', label: 'Best Time', value: dest.best_time },
              ].map(({ emoji, label, value }) => (
                <div key={label} style={{
                  padding: '16px 24px',
                  borderRight: '1px solid rgba(255,253,248,0.06)',
                  minWidth: 140,
                  flexShrink: 0,
                }}>
                  <div style={{ color: 'rgba(247,244,238,0.35)', fontSize: 11, fontFamily: 'var(--font-heading)', fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 4 }}>{emoji} {label}</div>
                  <div style={{ color: 'var(--paper)', fontSize: 13, fontWeight: 600 }}>{value}</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="container" style={{ padding: 'clamp(30px, 5vw, 60px) clamp(20px, 5vw, 80px)' }}>
          {/* Tabs */}
          <div style={{ display: 'flex', gap: 4, borderBottom: '1px solid var(--border)', marginBottom: 36, overflow: 'auto' }}>
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                style={{
                  padding: '10px 18px',
                  fontFamily: 'var(--font-heading)',
                  fontSize: 13, fontWeight: 700,
                  color: activeTab === tab.id ? 'var(--accent)' : 'var(--muted)',
                  borderBottom: activeTab === tab.id ? '2px solid var(--accent)' : '2px solid transparent',
                  marginBottom: -1,
                  transition: 'all 0.2s',
                  whiteSpace: 'nowrap',
                  cursor: 'pointer',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <motion.div key={activeTab} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }}>
            {activeTab === 'overview' && (
              <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 40, alignItems: 'start', flexWrap: 'wrap' }}>
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 22, color: 'var(--paper)', marginBottom: 14 }}>About {dest.name}</h2>
                  <p style={{ color: 'var(--muted)', fontSize: 15, lineHeight: 1.85, marginBottom: 28 }}>{dest.desc}</p>

                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--paper)', marginBottom: 14 }}>Top Attractions</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {dest.attractions.slice(0, 3).map((a, i) => (
                      <div key={a} style={{
                        display: 'flex', alignItems: 'center', gap: 12,
                        padding: '12px 16px',
                        background: 'var(--surface3)',
                        border: '1px solid var(--border)',
                        borderRadius: 10,
                      }}>
                        <span style={{
                          width: 28, height: 28,
                          background: `${dest.color}20`,
                          color: dest.color,
                          borderRadius: '50%',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontFamily: 'var(--font-heading)',
                          fontSize: 11, fontWeight: 700,
                        }}>{i + 1}</span>
                        <span style={{ color: 'var(--paper)', fontSize: 14, fontWeight: 600 }}>{a}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* VR Preview box */}
                <div style={{
                  background: 'linear-gradient(135deg, #1a1f2e, #0d1220)',
                  border: '1px solid rgba(139,61,202,0.3)',
                  borderRadius: 'var(--r-md)',
                  padding: 24,
                  minWidth: 240,
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: 40, marginBottom: 12 }}>🥽</div>
                  <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, color: 'var(--paper)', marginBottom: 8 }}>AR/VR Preview</h4>
                  <p style={{ color: 'rgba(247,244,238,0.4)', fontSize: 12, lineHeight: 1.6, marginBottom: 16 }}>Experience {dest.name} virtually before you commit to the trip</p>
                  <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', fontSize: 12, padding: '10px 16px' }}>
                    Launch VR Tour
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'attractions' && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'var(--paper)', marginBottom: 24 }}>Things to Do in {dest.name}</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
                  {dest.attractions.map((a, i) => (
                    <div key={a} style={{
                      padding: '18px 18px',
                      background: 'var(--surface3)',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                      display: 'flex', alignItems: 'center', gap: 12,
                    }}>
                      <Camera size={16} style={{ color: dest.color, flexShrink: 0 }} />
                      <span style={{ color: 'var(--paper)', fontSize: 14, fontWeight: 600 }}>{a}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'hotels' && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'var(--paper)', marginBottom: 24 }}>Where to Stay</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {dest.hotels.map((h) => (
                    <div key={h} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '18px 20px',
                      background: 'var(--surface3)',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Hotel size={16} style={{ color: dest.color }} />
                        <span style={{ color: 'var(--paper)', fontSize: 14, fontWeight: 600 }}>{h}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star size={12} fill="#c9a227" style={{ color: '#c9a227' }} />
                        <span style={{ color: 'var(--muted)', fontSize: 12 }}>4.8</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'restaurants' && (
              <div>
                <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'var(--paper)', marginBottom: 24 }}>Where to Eat</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                  {dest.restaurants.map(r => (
                    <div key={r} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '18px 20px',
                      background: 'var(--surface3)',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                    }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <Utensils size={16} style={{ color: dest.color }} />
                        <span style={{ color: 'var(--paper)', fontSize: 14, fontWeight: 600 }}>{r}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                        <Star size={12} fill="#c9a227" style={{ color: '#c9a227' }} />
                        <span style={{ color: 'var(--muted)', fontSize: 12 }}>4.7</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'reviews' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'var(--paper)' }}>Traveler Reviews</h2>
                  <button className="btn btn-primary" style={{ fontSize: 12, padding: '8px 18px' }}>Write a Review</button>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                  {reviews.map((r, i) => (
                    <div key={i} style={{
                      padding: '20px',
                      background: 'var(--surface3)',
                      border: '1px solid var(--border)',
                      borderRadius: 10,
                    }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 24 }}>{r.avatar}</span>
                          <div>
                            <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--paper)', display: 'flex', alignItems: 'center', gap: 6 }}>
                              {r.name}
                              {r.verified && <span style={{ background: 'rgba(31,138,85,0.12)', color: 'var(--accent3)', fontSize: 9, fontWeight: 700, letterSpacing: 1, padding: '2px 7px', borderRadius: 10 }}>VERIFIED</span>}
                            </div>
                            <div style={{ color: 'var(--muted)', fontSize: 11 }}>{r.date}</div>
                          </div>
                        </div>
                        <div style={{ display: 'flex', gap: 2 }}>
                          {[...Array(r.rating)].map((_, i) => <Star key={i} size={12} fill="#c9a227" style={{ color: '#c9a227' }} />)}
                        </div>
                      </div>
                      <p style={{ color: 'var(--muted)', fontSize: 13, lineHeight: 1.7 }}>{r.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>

        <Footer />
      </div>
    </PageTransition>
  )
}
