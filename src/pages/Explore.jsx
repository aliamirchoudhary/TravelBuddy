import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Search, Star, Eye, ArrowRight } from 'lucide-react'
import Footer from '../components/Footer.jsx'
import PageTransition from '../components/PageTransition.jsx'
import StudioSidebar from '../components/StudioSidebar.jsx'
import LiveBackground from '../components/LiveBackground.jsx'

const categories = ['All', 'Islands', 'Adventure', 'Culture', 'Nature', 'City', 'Beach', 'Desert']

const destinations = [
  { id: 1,  name: 'Santorini',    country: 'Greece',    emoji: '🇬🇷', category: 'Islands',   rating: 4.9, reviews: 3421, color: '#00D4FF', tag: 'Most Visited',    budget: '$$$$', vr: true },
  { id: 2,  name: 'Kyoto',        country: 'Japan',     emoji: '🇯🇵', category: 'Culture',   rating: 4.8, reviews: 5102, color: '#7B61FF', tag: 'Top Rated',       budget: '$$$',  vr: true },
  { id: 3,  name: 'Patagonia',    country: 'Argentina', emoji: '🇦🇷', category: 'Adventure', rating: 4.7, reviews: 1893, color: '#00E887', tag: 'Hidden Gem',      budget: '$$',   vr: false },
  { id: 4,  name: 'Marrakech',    country: 'Morocco',   emoji: '🇲🇦', category: 'Culture',   rating: 4.8, reviews: 2890, color: '#FFD166', tag: 'Trending',        budget: '$$',   vr: false },
  { id: 5,  name: 'Bali',         country: 'Indonesia', emoji: '🇮🇩', category: 'Beach',     rating: 4.9, reviews: 7230, color: '#FF6B6B', tag: 'Fan Favourite',   budget: '$$',   vr: true },
  { id: 6,  name: 'Cappadocia',   country: 'Turkey',    emoji: '🇹🇷', category: 'Adventure', rating: 4.6, reviews: 2100, color: '#FF61D8', tag: 'Unique',          budget: '$$$',  vr: true },
  { id: 7,  name: 'Faroe Islands',country: 'Denmark',   emoji: '🇩🇰', category: 'Nature',    rating: 4.8, reviews: 940,  color: '#00D4FF', tag: 'Off the Beaten',  budget: '$$$$', vr: false },
  { id: 8,  name: 'Petra',        country: 'Jordan',    emoji: '🇯🇴', category: 'Culture',   rating: 4.9, reviews: 4120, color: '#FFD166', tag: 'UNESCO',          budget: '$$$',  vr: true },
  { id: 9,  name: 'Serengeti',    country: 'Tanzania',  emoji: '🇹🇿', category: 'Nature',    rating: 4.9, reviews: 2780, color: '#00E887', tag: 'Wildlife',        budget: '$$$$', vr: false },
  { id: 10, name: 'Dubai',        country: 'UAE',       emoji: '🇦🇪', category: 'City',      rating: 4.7, reviews: 6890, color: '#00D4FF', tag: 'Luxury',          budget: '$$$$', vr: true },
  { id: 11, name: 'Sahara Desert',country: 'Morocco',   emoji: '🇲🇦', category: 'Desert',    rating: 4.8, reviews: 1560, color: '#FFD166', tag: 'Epic',            budget: '$$',   vr: false },
  { id: 12, name: 'Maldives',     country: 'Maldives',  emoji: '🇲🇻', category: 'Beach',     rating: 5.0, reviews: 8940, color: '#00D4FF', tag: 'Paradise',        budget: '$$$$', vr: true },
]

function DestCard({ dest, index }) {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 28 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 4) * 0.07 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ y: -6 }}
    >
      <Link to={`/destination/${dest.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{
          borderRadius: 'var(--r-md)',
          overflow: 'hidden',
          background: 'var(--surface)',
          border: `1px solid ${hovered ? dest.color + '50' : 'var(--border)'}`,
          transition: 'all 0.3s ease',
          boxShadow: hovered ? `0 20px 50px rgba(0,0,0,0.4), 0 0 30px ${dest.color}20` : 'var(--shadow-sm)',
        }}>
          {/* Thumbnail */}
          <div style={{
            aspectRatio: '4/3',
            background: `linear-gradient(145deg, ${dest.color}25, var(--surface2))`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 70, position: 'relative', overflow: 'hidden',
          }}>
            <span style={{
              opacity: hovered ? 0.5 : 0.25,
              transition: 'all 0.4s',
              transform: hovered ? 'scale(1.15)' : 'scale(1)',
              display: 'block',
            }}>{dest.emoji}</span>

            {/* Tags */}
            <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 5 }}>
              <span style={{
                background: 'rgba(5,11,20,0.75)',
                backdropFilter: 'blur(8px)',
                color: 'white', fontSize: 9,
                fontFamily: 'var(--font-heading)', fontWeight: 700,
                letterSpacing: 0.5, padding: '3px 9px', borderRadius: 20,
                border: '1px solid rgba(255,255,255,0.08)',
              }}>{dest.tag}</span>
              {dest.vr && (
                <span style={{
                  background: 'rgba(123,97,255,0.7)',
                  color: 'white', fontSize: 9,
                  fontFamily: 'var(--font-heading)', fontWeight: 700,
                  padding: '3px 9px', borderRadius: 20,
                }}>VR</span>
              )}
            </div>

            {/* Budget */}
            <span style={{
              position: 'absolute', top: 10, right: 10,
              background: 'rgba(5,11,20,0.7)',
              backdropFilter: 'blur(8px)',
              color: dest.color, fontSize: 11, fontWeight: 700,
              padding: '3px 8px', borderRadius: 8,
              border: '1px solid rgba(255,255,255,0.08)',
            }}>{dest.budget}</span>

            {/* Hover overlay */}
            <div style={{
              position: 'absolute', inset: 0,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'rgba(5,11,20,0.5)',
              opacity: hovered ? 1 : 0, transition: 'opacity 0.3s',
            }}>
              <span style={{
                background: 'var(--accent)', color: 'var(--ink)',
                padding: '8px 20px', borderRadius: 100,
                fontFamily: 'var(--font-heading)', fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <Eye size={12} /> View Details
              </span>
            </div>
          </div>

          {/* Info */}
          <div style={{ padding: '16px 16px 18px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700, fontSize: 15,
                  color: 'var(--paper)', lineHeight: 1.2, marginBottom: 3,
                }}>{dest.name}</h3>
                <p style={{ color: 'var(--paper-muted)', fontSize: 12 }}>{dest.emoji} {dest.country}</p>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 3,
                background: 'rgba(255,209,102,0.1)',
                border: '1px solid rgba(255,209,102,0.2)',
                padding: '3px 8px', borderRadius: 8,
              }}>
                <Star size={11} fill="#FFD166" style={{ color: '#FFD166' }} />
                <span style={{ color: '#FFD166', fontWeight: 700, fontSize: 12 }}>{dest.rating}</span>
              </div>
            </div>
            <p style={{ color: 'var(--paper-dim)', fontSize: 11 }}>
              {dest.reviews.toLocaleString()} reviews
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function Explore() {
  const [searchParams] = useSearchParams()
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')

  useEffect(() => {
    const q = searchParams.get('q')
    if (q) setSearch(decodeURIComponent(q))
  }, [searchParams])

  const filtered = destinations.filter(d => {
    const matchCat = activeCategory === 'All' || d.category === activeCategory
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.country.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <PageTransition>
      <div style={{ background: 'var(--ink)', minHeight: '100vh', position: 'relative' }}>
        <div style={{ position: 'absolute', inset: 0, opacity: 0.35, pointerEvents: 'none' }}>
          <LiveBackground />
        </div>

        <div className="surface-light-band" style={{ position: 'relative', zIndex: 1 }}>
          <div style={{
            padding: 'clamp(96px,12vw,140px) 0 clamp(36px,6vw,72px)',
            position: 'relative', overflow: 'hidden',
          }}>
            <div className="grid-overlay" style={{ opacity: 0.15 }} />
            <div style={{ maxWidth: 1200, margin: '0 auto', padding: '0 clamp(20px,5vw,48px)' }}>
              <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
                <span style={{
                  display: 'inline-flex', padding: '4px 12px', borderRadius: 100,
                  background: 'rgba(251,146,60,0.15)', border: '1px solid rgba(251,146,60,0.35)',
                  fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 800, letterSpacing: 2, color: 'var(--accent4)', marginBottom: 14,
                }}>VLOG OF THE DAY</span>
                <h1 className="display-heading" style={{
                  fontSize: 'clamp(32px,6vw,56px)',
                  color: '#0f172a',
                  marginBottom: 12,
                  letterSpacing: '-0.03em',
                }}>
                  Explorer Grid
                </h1>
                <p style={{ color: 'rgba(15,23,42,0.65)', fontSize: 15, marginBottom: 28, maxWidth: 520 }}>
                  Curated destinations, AR/VR previews, and bento-style discovery — tuned for speed.
                </p>
                <div style={{ maxWidth: 520, position: 'relative' }}>
                  <Search size={16} style={{
                    position: 'absolute', left: 18, top: '50%',
                    transform: 'translateY(-50%)', color: 'rgba(15,23,42,0.45)',
                  }} />
                  <input
                    className="input"
                    placeholder="Search destinations, countries..."
                    value={search}
                    onChange={e => setSearch(e.target.value)}
                    style={{
                      paddingLeft: 50, paddingRight: 20,
                      borderRadius: 100,
                      background: 'rgba(255,255,255,0.85)',
                      border: '1.5px solid rgba(15,23,42,0.12)',
                      fontSize: 14,
                      color: '#0f172a',
                    }}
                  />
                </div>
              </motion.div>
            </div>
          </div>
        </div>

        <div style={{ maxWidth: 1400, margin: '0 auto', padding: '0 clamp(16px,4vw,40px) 80px', position: 'relative', zIndex: 1, display: 'flex', gap: 28, alignItems: 'flex-start' }}>
          <StudioSidebar activeOverride="/explore" />

          <div style={{ flex: 1, minWidth: 0, paddingTop: 8 }}>

          <div style={{
            display: 'flex', gap: 8, flexWrap: 'wrap',
            marginBottom: 28,
            paddingBottom: 18,
            borderBottom: '1px solid var(--border)',
            alignItems: 'center',
          }}>
            {[
              { key: 'all', label: 'All Stories', onClick: () => setActiveCategory('All'), active: activeCategory === 'All' },
              { key: 'buddy', label: 'Buddies', href: '/buddy' },
            ].map((item) =>
              item.href ? (
                <Link
                  key={item.key}
                  to={item.href}
                  style={{
                    padding: '9px 18px', borderRadius: 100,
                    fontFamily: 'var(--font-heading)',
                    fontSize: 12, fontWeight: 700,
                    border: '1.5px solid var(--border)',
                    color: 'var(--paper-muted)',
                    textDecoration: 'none',
                    transition: 'all 0.2s',
                  }}
                >{item.label}</Link>
              ) : (
                <button
                  key={item.key}
                  type="button"
                  onClick={item.onClick}
                  style={{
                    padding: '9px 18px', borderRadius: 100,
                    fontFamily: 'var(--font-heading)',
                    fontSize: 12, fontWeight: 700,
                    cursor: 'pointer', border: '1.5px solid', transition: 'all 0.2s',
                    borderColor: item.active ? 'var(--accent)' : 'var(--border)',
                    background: item.active ? 'rgba(45,212,191,0.12)' : 'transparent',
                    color: item.active ? 'var(--accent)' : 'var(--paper-muted)',
                  }}
                >{item.label}</button>
              )
            )}
            <div style={{ width: 1, height: 22, background: 'var(--border)', margin: '0 4px' }} className="hide-mobile" />
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '7px 14px', borderRadius: 100,
                  fontFamily: 'var(--font-heading)',
                  fontSize: 11, fontWeight: 700,
                  cursor: 'pointer', border: '1.5px solid', transition: 'all 0.2s',
                  borderColor: activeCategory === cat ? 'var(--accent)' : 'var(--border)',
                  background: activeCategory === cat ? 'var(--accent)' : 'transparent',
                  color: activeCategory === cat ? 'var(--ink)' : 'var(--paper-muted)',
                }}
              >{cat}</button>
            ))}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', color: 'var(--paper-dim)', fontSize: 12 }}>
              {filtered.length} destinations
            </div>
          </div>

          {/* AR/VR Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              background: 'var(--surface2)',
              border: '1px solid rgba(123,97,255,0.25)',
              borderRadius: 'var(--r-md)',
              padding: '18px 24px',
              marginBottom: 32,
              display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap',
            }}
          >
            <div style={{
              width: 44, height: 44,
              background: 'rgba(123,97,255,0.12)',
              borderRadius: 12, fontSize: 22,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              border: '1px solid rgba(123,97,255,0.25)',
            }}>🥽</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: 'var(--paper)', marginBottom: 3 }}>
                AR/VR Destination Previews Available
              </div>
              <div style={{ color: 'var(--paper-muted)', fontSize: 12 }}>
                Destinations with VR badge have virtual tour previews — experience before you book
              </div>
            </div>
            <span style={{
              background: 'rgba(123,97,255,0.12)', color: '#a589ff',
              padding: '5px 14px', borderRadius: 100,
              fontFamily: 'var(--font-heading)', fontSize: 11, fontWeight: 700,
              border: '1px solid rgba(123,97,255,0.25)',
            }}>NEW FEATURE</span>
          </motion.div>

          {/* Grid */}
          {filtered.length > 0 ? (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))',
              gap: 20,
            }}>
              {filtered.map((dest, i) => <DestCard key={dest.id} dest={dest} index={i} />)}
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '80px 20px' }}>
              <div style={{ fontSize: 40, marginBottom: 16 }}>🔍</div>
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, color: 'var(--paper)', marginBottom: 8 }}>
                No destinations found
              </h3>
              <p style={{ color: 'var(--paper-muted)', fontSize: 14 }}>Try a different search or category</p>
            </div>
          )}
          </div>
        </div>

        <Footer />
      </div>
    </PageTransition>
  )
}
