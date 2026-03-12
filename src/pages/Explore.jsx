import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Search, Star, Filter, Map, Eye, ArrowRight, Sparkles } from 'lucide-react'
import Footer from '../components/Footer.jsx'
import PageTransition from '../components/PageTransition.jsx'

const categories = ['All', 'Islands', 'Adventure', 'Culture', 'Nature', 'City', 'Beach', 'Desert']

const destinations = [
  { id: 1, name: 'Santorini', country: 'Greece', emoji: '🇬🇷', category: 'Islands', rating: 4.9, reviews: 3421, color: '#1a6eb5', tag: 'Most Visited', budget: '$$$$', vr: true },
  { id: 2, name: 'Kyoto', country: 'Japan', emoji: '🇯🇵', category: 'Culture', rating: 4.8, reviews: 5102, color: '#8b3dca', tag: 'Top Rated', budget: '$$$', vr: true },
  { id: 3, name: 'Patagonia', country: 'Argentina', emoji: '🇦🇷', category: 'Adventure', rating: 4.7, reviews: 1893, color: '#1f8a55', tag: 'Hidden Gem', budget: '$$', vr: false },
  { id: 4, name: 'Marrakech', country: 'Morocco', emoji: '🇲🇦', category: 'Culture', rating: 4.8, reviews: 2890, color: '#e8541a', tag: 'Trending', budget: '$$', vr: false },
  { id: 5, name: 'Bali', country: 'Indonesia', emoji: '🇮🇩', category: 'Beach', rating: 4.9, reviews: 7230, color: '#c9a227', tag: 'Fan Favourite', budget: '$$', vr: true },
  { id: 6, name: 'Cappadocia', country: 'Turkey', emoji: '🇹🇷', category: 'Adventure', rating: 4.6, reviews: 2100, color: '#e85d8a', tag: 'Unique', budget: '$$$', vr: true },
  { id: 7, name: 'Faroe Islands', country: 'Denmark', emoji: '🇩🇰', category: 'Nature', rating: 4.8, reviews: 940, color: '#4a9ab8', tag: 'Off the Beaten', budget: '$$$$', vr: false },
  { id: 8, name: 'Petra', country: 'Jordan', emoji: '🇯🇴', category: 'Culture', rating: 4.9, reviews: 4120, color: '#d4882e', tag: 'UNESCO', budget: '$$$', vr: true },
  { id: 9, name: 'Serengeti', country: 'Tanzania', emoji: '🇹🇿', category: 'Nature', rating: 4.9, reviews: 2780, color: '#8a7a2e', tag: 'Wildlife', budget: '$$$$', vr: false },
  { id: 10, name: 'Dubai', country: 'UAE', emoji: '🇦🇪', category: 'City', rating: 4.7, reviews: 6890, color: '#1a6eb5', tag: 'Luxury', budget: '$$$$', vr: true },
  { id: 11, name: 'Sahara Desert', country: 'Morocco', emoji: '🇲🇦', category: 'Desert', rating: 4.8, reviews: 1560, color: '#c9a227', tag: 'Epic', budget: '$$', vr: false },
  { id: 12, name: 'Maldives', country: 'Maldives', emoji: '🇲🇻', category: 'Beach', rating: 5.0, reviews: 8940, color: '#38b2a0', tag: 'Paradise', budget: '$$$$', vr: true },
]

function DestCard({ dest, index }) {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [hovered, setHovered] = useState(false)

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 24 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 4) * 0.07 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <Link to={`/destination/${dest.id}`} style={{ textDecoration: 'none', display: 'block' }}>
        <div style={{
          borderRadius: 'var(--r-md)',
          overflow: 'hidden',
          background: 'var(--card)',
          border: '1px solid var(--border)',
          transition: 'all 0.3s ease',
          transform: hovered ? 'translateY(-6px)' : 'none',
          boxShadow: hovered ? `0 20px 50px rgba(0,0,0,0.12)` : 'var(--shadow-sm)',
        }}>
          {/* Thumbnail */}
          <div style={{
            aspectRatio: '4/3',
            background: `linear-gradient(145deg, ${dest.color}40, ${dest.color}15)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 70,
            position: 'relative',
            overflow: 'hidden',
          }}>
            <span style={{ opacity: hovered ? 0.5 : 0.3, transition: 'opacity 0.3s', transform: hovered ? 'scale(1.15)' : 'scale(1)', transition: 'all 0.4s', display: 'block' }}>
              {dest.emoji}
            </span>

            {/* Tags */}
            <div style={{ position: 'absolute', top: 10, left: 10, display: 'flex', gap: 6 }}>
              <span style={{
                background: 'rgba(10,14,26,0.75)',
                backdropFilter: 'blur(8px)',
                color: 'white',
                fontSize: 10,
                fontFamily: 'var(--font-heading)',
                fontWeight: 700,
                letterSpacing: 0.5,
                padding: '3px 9px',
                borderRadius: 20,
              }}>{dest.tag}</span>
              {dest.vr && (
                <span style={{
                  background: 'rgba(139,61,202,0.8)',
                  color: 'white', fontSize: 10,
                  fontFamily: 'var(--font-heading)', fontWeight: 700,
                  padding: '3px 9px', borderRadius: 20,
                }}>VR</span>
              )}
            </div>

            {/* Budget */}
            <span style={{
              position: 'absolute', top: 10, right: 10,
              background: 'rgba(10,14,26,0.7)',
              backdropFilter: 'blur(8px)',
              color: '#c9a227', fontSize: 11, fontWeight: 700,
              padding: '3px 8px', borderRadius: 8,
            }}>{dest.budget}</span>

            {/* Hover CTA */}
            <motion.div
              style={{
                position: 'absolute', inset: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: 'rgba(10,14,26,0.4)',
                opacity: hovered ? 1 : 0,
                transition: 'opacity 0.3s',
              }}
            >
              <span style={{
                background: 'var(--accent)',
                color: 'white',
                padding: '8px 20px',
                borderRadius: 100,
                fontFamily: 'var(--font-heading)',
                fontSize: 12, fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 6,
              }}>
                <Eye size={12} /> View Details
              </span>
            </motion.div>
          </div>

          {/* Info */}
          <div style={{ padding: '16px 16px 18px', background: 'var(--card)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
              <div>
                <h3 style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700, fontSize: 15,
                  color: 'var(--ink)', lineHeight: 1.2, marginBottom: 3,
                }}>{dest.name}</h3>
                <p style={{ color: 'var(--muted)', fontSize: 12 }}>{dest.emoji} {dest.country}</p>
              </div>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 3,
                background: '#fff8e1',
                padding: '3px 8px',
                borderRadius: 8,
              }}>
                <Star size={11} fill="#c9a227" style={{ color: '#c9a227' }} />
                <span style={{ color: '#856404', fontWeight: 700, fontSize: 12 }}>{dest.rating}</span>
              </div>
            </div>
            <p style={{ color: 'var(--muted)', fontSize: 11 }}>
              {dest.reviews.toLocaleString()} reviews
            </p>
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

export default function Explore() {
  const [activeCategory, setActiveCategory] = useState('All')
  const [search, setSearch] = useState('')

  const filtered = destinations.filter(d => {
    const matchCat = activeCategory === 'All' || d.category === activeCategory
    const matchSearch = d.name.toLowerCase().includes(search.toLowerCase()) || d.country.toLowerCase().includes(search.toLowerCase())
    return matchCat && matchSearch
  })

  return (
    <PageTransition>
      <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>

        {/* Hero */}
        <div style={{
          background: 'linear-gradient(180deg, #0a0e1a 0%, #0d1a2e 100%)',
          padding: 'clamp(100px, 12vw, 150px) 0 60px',
          position: 'relative',
          overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', inset: 0,
            backgroundImage: `linear-gradient(rgba(255,253,248,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(255,253,248,0.025) 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }} />
          <div style={{ position: 'absolute', top: -100, right: 100, width: 400, height: 400, borderRadius: '50%', background: 'radial-gradient(circle, rgba(31,138,85,0.1) 0%, transparent 70%)', filter: 'blur(60px)' }} />

          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="tag" style={{ marginBottom: 10 }}>🧭 Discover</p>
              <h1 className="display-heading" style={{ fontSize: 'clamp(36px, 7vw, 72px)', color: 'var(--paper)', marginBottom: 14 }}>
                Explore the World
              </h1>
              <p style={{ color: 'rgba(247,244,238,0.5)', fontSize: 16, marginBottom: 32, maxWidth: 480 }}>
                Browse 195+ destinations, view AR/VR previews, and start planning your perfect trip.
              </p>

              {/* Search */}
              <div style={{ maxWidth: 520, position: 'relative' }}>
                <Search size={16} style={{ position: 'absolute', left: 18, top: '50%', transform: 'translateY(-50%)', color: 'rgba(247,244,238,0.35)' }} />
                <input
                  className="input"
                  placeholder="Search destinations, countries..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  style={{ paddingLeft: 50, paddingRight: 20, borderRadius: 100 }}
                />
              </div>
            </motion.div>
          </div>
        </div>

        {/* Content */}
        <div className="container" style={{ paddingTop: 40, paddingBottom: 80 }}>
          {/* Category filters */}
          <div style={{
            display: 'flex', gap: 8, flexWrap: 'wrap',
            marginBottom: 36,
            paddingBottom: 20,
            borderBottom: '1px solid var(--border)',
          }}>
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                style={{
                  padding: '7px 16px',
                  borderRadius: 100,
                  fontFamily: 'var(--font-heading)',
                  fontSize: 12, fontWeight: 700,
                  letterSpacing: 0.3,
                  cursor: 'pointer',
                  border: '1.5px solid',
                  transition: 'all 0.2s',
                  borderColor: activeCategory === cat ? 'var(--accent)' : 'var(--border)',
                  background: activeCategory === cat ? 'var(--accent)' : 'white',
                  color: activeCategory === cat ? 'white' : 'var(--muted)',
                }}
              >
                {cat}
              </button>
            ))}
            <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 6, color: 'var(--muted)', fontSize: 12 }}>
              <span>{filtered.length} destinations</span>
            </div>
          </div>

          {/* AR/VR Banner */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            style={{
              background: 'linear-gradient(135deg, #1a2744, #0d1a2e)',
              border: '1px solid rgba(139,61,202,0.3)',
              borderRadius: 'var(--r-md)',
              padding: '20px 24px',
              marginBottom: 32,
              display: 'flex', alignItems: 'center', gap: 16,
              flexWrap: 'wrap',
            }}
          >
            <div style={{
              width: 44, height: 44,
              background: 'rgba(139,61,202,0.15)',
              borderRadius: 12,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 22,
              border: '1px solid rgba(139,61,202,0.3)',
            }}>🥽</div>
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: 'var(--paper)', marginBottom: 3 }}>
                AR/VR Destination Previews Available
              </div>
              <div style={{ color: 'rgba(247,244,238,0.45)', fontSize: 12 }}>
                Destinations with 🥽 VR badge have virtual tour previews — experience before you book
              </div>
            </div>
            <span style={{
              background: 'rgba(139,61,202,0.2)', color: '#b57ce0',
              padding: '5px 14px', borderRadius: 100,
              fontFamily: 'var(--font-heading)', fontSize: 11, fontWeight: 700,
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
              <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 18, color: 'var(--ink)', marginBottom: 8 }}>
                No destinations found
              </h3>
              <p style={{ color: 'var(--muted)', fontSize: 14 }}>Try a different search or category</p>
            </div>
          )}
        </div>

        <Footer />
      </div>
    </PageTransition>
  )
}
