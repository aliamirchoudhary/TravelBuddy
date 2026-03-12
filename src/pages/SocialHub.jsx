import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Heart, MessageCircle, Share2, Bookmark, Star, Users, TrendingUp, Award, ArrowRight, Play } from 'lucide-react'
import Footer from '../components/Footer.jsx'
import PageTransition from '../components/PageTransition.jsx'

const posts = [
  { id: 1, user: 'Mia Chen', avatar: '📸', location: 'Kyoto, Japan', content: 'Cherry blossom season in Kyoto is absolutely surreal — woke up at 4am to catch this view before the crowds. The Philosopher\'s Path at dawn is something everyone should experience at least once.', likes: 2341, comments: 89, tag: '🌸 Culture', color: '#8b3dca', badge: 'Verified Traveler', type: 'photo' },
  { id: 2, user: 'Alex Rivera', avatar: '🏔️', location: 'Patagonia, Argentina', content: 'Day 8 of the Torres del Paine trek. My legs are destroyed but this view makes everything worth it. Found a travel buddy on TravelBuddy — couldn\'t have done this without having someone to share the load (literally).', likes: 1876, comments: 56, tag: '🏔️ Adventure', color: '#1f8a55', badge: 'Explorer', type: 'vlog' },
  { id: 3, user: 'Fatima Al-Hassan', avatar: '🌺', location: 'Marrakech, Morocco', content: 'The medina at golden hour is pure magic. If you\'re visiting Morocco, budget at least 3 days in Marrakech alone. The food, the sounds, the architecture — nothing quite compares.', likes: 3102, comments: 142, tag: '🏛️ Culture', color: '#e8541a', badge: 'Top Reviewer', type: 'photo' },
  { id: 4, user: 'Jake Thompson', avatar: '🤿', location: 'Maldives', content: 'Underwater life here is unreal. 3-day snorkeling guide dropping soon on my Vlogger Hub — follow me there for the full breakdown including gear recommendations and budget tips.', likes: 4230, comments: 203, tag: '🌊 Beach', color: '#38b2a0', badge: 'Vlogger · 120k', type: 'vlog' },
]

const popularPlaces = [
  { name: 'Santorini', country: 'Greece', emoji: '🇬🇷', rating: 4.9, posts: '12.4k' },
  { name: 'Bali', country: 'Indonesia', emoji: '🇮🇩', rating: 4.9, posts: '18.2k' },
  { name: 'Kyoto', country: 'Japan', emoji: '🇯🇵', rating: 4.8, posts: '9.8k' },
  { name: 'Marrakech', country: 'Morocco', emoji: '🇲🇦', rating: 4.8, posts: '6.7k' },
  { name: 'Maldives', country: 'Maldives', emoji: '🇲🇻', rating: 5.0, posts: '22.1k' },
]

const groups = [
  { name: 'Solo Travelers', emoji: '🧳', members: '14.2k', active: true },
  { name: 'Honeymooners', emoji: '💍', members: '8.9k', active: false },
  { name: 'Backpackers', emoji: '🎒', members: '22.1k', active: true },
  { name: 'Vloggers Network', emoji: '🎥', members: '5.4k', active: true },
  { name: 'Budget Travelers', emoji: '💰', members: '17.8k', active: false },
]

const featuredVloggers = [
  { name: 'Nomad Kai', avatar: '🎥', followers: '340k', specialty: 'Adventure' },
  { name: 'Travel with Zara', avatar: '📸', followers: '210k', specialty: 'Culture' },
  { name: 'The Beach Seeker', avatar: '🏖️', followers: '185k', specialty: 'Beach' },
]

const badges = [
  { emoji: '🌍', name: '5 Continents', user: 'Alex R.', color: '#1a6eb5' },
  { emoji: '⭐', name: 'Top Reviewer', user: 'Fatima H.', color: '#c9a227' },
  { emoji: '🤝', name: '10 Buddy Matches', user: 'Mia C.', color: '#1f8a55' },
  { emoji: '📸', name: '100 Photos Shared', user: 'Jake T.', color: '#8b3dca' },
]

function PostCard({ post, index }) {
  const [ref, inView] = useInView({ threshold: 0.1, triggerOnce: true })
  const [liked, setLiked] = useState(false)
  const [saved, setSaved] = useState(false)
  const navigate = useNavigate()

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.5, delay: (index % 3) * 0.08 }}
      style={{
        background: 'white',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r-md)',
        overflow: 'hidden',
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Thumbnail */}
      <div style={{
        aspectRatio: '16/9',
        background: `linear-gradient(145deg, ${post.color}30, ${post.color}10)`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 60, position: 'relative',
      }}>
        <span style={{ opacity: 0.25 }}>{post.avatar}</span>
        <div style={{
          position: 'absolute', top: 10, left: 10, right: 10,
          display: 'flex', justifyContent: 'space-between',
        }}>
          <span style={{
            background: post.color, color: 'white',
            fontSize: 10, fontFamily: 'var(--font-heading)', fontWeight: 700,
            padding: '3px 10px', borderRadius: 20,
          }}>{post.tag}</span>
          {post.type === 'vlog' && (
            <span style={{
              background: 'rgba(10,14,26,0.7)', color: 'white',
              fontSize: 10, fontFamily: 'var(--font-heading)', fontWeight: 700,
              padding: '3px 10px', borderRadius: 20,
              display: 'flex', alignItems: 'center', gap: 4,
            }}><Play size={9} fill="white" /> VIDEO</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div style={{ padding: '16px 18px 18px' }}>
        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: `${post.color}20`, border: `2px solid ${post.color}40`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16,
            }}>{post.avatar}</div>
            <div>
              <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>{post.user}</div>
              <div style={{ color: 'var(--muted)', fontSize: 11 }}>📍 {post.location}</div>
            </div>
          </div>
          <span style={{
            background: `${post.color}15`, color: post.color,
            fontSize: 9, fontFamily: 'var(--font-heading)', fontWeight: 700,
            letterSpacing: 0.5, padding: '3px 8px', borderRadius: 10,
          }}>{post.badge}</span>
        </div>

        {/* Text */}
        <p style={{ color: 'var(--ink)', fontSize: 13, lineHeight: 1.7, marginBottom: 14 }}>
          {post.content.length > 160 ? post.content.slice(0, 160) + '...' : post.content}
        </p>

        {/* "I want to go here" CTA */}
        <button
          onClick={() => navigate(`/plan?dest=${post.location}`)}
          style={{
            display: 'flex', alignItems: 'center', gap: 6,
            padding: '7px 14px', marginBottom: 14,
            background: 'rgba(232,84,26,0.08)',
            border: '1px solid rgba(232,84,26,0.2)',
            borderRadius: 100,
            color: 'var(--accent)',
            fontFamily: 'var(--font-heading)',
            fontSize: 11, fontWeight: 700,
            cursor: 'pointer', transition: 'all 0.2s',
          }}
          onMouseEnter={e => e.currentTarget.style.background = 'rgba(232,84,26,0.14)'}
          onMouseLeave={e => e.currentTarget.style.background = 'rgba(232,84,26,0.08)'}
        >
          ✈️ I want to go here!
        </button>

        {/* Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button
            onClick={() => setLiked(l => !l)}
            style={{ display: 'flex', alignItems: 'center', gap: 5, color: liked ? '#e85d8a' : 'var(--muted)', cursor: 'pointer', transition: 'color 0.2s' }}
          >
            <Heart size={15} fill={liked ? '#e85d8a' : 'transparent'} />
            <span style={{ fontSize: 12 }}>{post.likes + (liked ? 1 : 0)}</span>
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--muted)', cursor: 'pointer' }}>
            <MessageCircle size={15} />
            <span style={{ fontSize: 12 }}>{post.comments}</span>
          </button>
          <button style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--muted)', cursor: 'pointer' }}>
            <Share2 size={14} />
          </button>
          <button
            onClick={() => setSaved(s => !s)}
            style={{ marginLeft: 'auto', color: saved ? 'var(--accent)' : 'var(--muted)', cursor: 'pointer' }}
          >
            <Bookmark size={15} fill={saved ? 'var(--accent)' : 'transparent'} />
          </button>
        </div>
      </div>
    </motion.div>
  )
}

export default function SocialHub() {
  const [q3Visible, setQ3Visible] = useState(true)
  const navigate = useNavigate()
  const [filter, setFilter] = useState('Trending')

  return (
    <PageTransition>
      <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(180deg, #0a0e1a 0%, #0f1820 100%)',
          padding: 'clamp(90px, 10vw, 120px) 0 40px',
        }}>
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="tag" style={{ marginBottom: 10 }}>🌐 Community</p>
              <h1 className="display-heading" style={{ fontSize: 'clamp(30px, 6vw, 56px)', color: 'var(--paper)', marginBottom: 10 }}>
                Social Hub
              </h1>
              <p style={{ color: 'rgba(247,244,238,0.45)', fontSize: 15 }}>
                Discover travel stories, connect with creators, and find your community.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Q3 Creator Prompt */}
        <AnimatePresence>
          {q3Visible && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, height: 0, overflow: 'hidden' }}
              style={{
                background: 'linear-gradient(135deg, #1a0d1f, #2a1650)',
                borderBottom: '1px solid rgba(139,61,202,0.3)',
              }}
            >
              <div className="container" style={{ padding: '16px clamp(20px, 5vw, 80px)', display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 22 }}>🎥</span>
                <div style={{ flex: 1, minWidth: 200 }}>
                  <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, color: 'var(--paper)' }}>Are you a travel content creator? </span>
                  <span style={{ color: 'rgba(247,244,238,0.5)', fontSize: 12 }}>Get access to upload tools, marketplace, and collaboration features.</span>
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button onClick={() => navigate('/vloggers')} className="btn btn-primary" style={{ fontSize: 12, padding: '8px 18px' }}>
                    Yes, Unlock Creator Hub
                  </button>
                  <button onClick={() => setQ3Visible(false)} style={{ color: 'rgba(247,244,238,0.35)', fontSize: 11, fontFamily: 'var(--font-heading)', cursor: 'pointer' }}>
                    No thanks
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <div className="container" style={{ padding: 'clamp(28px, 5vw, 48px) clamp(20px, 5vw, 80px)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 32, alignItems: 'start' }}>

            {/* Feed */}
            <div>
              {/* Filters */}
              <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
                {['Trending', 'Recent', 'Following', 'Adventure', 'Culture', 'Beach'].map(f => (
                  <button key={f} onClick={() => setFilter(f)} style={{
                    padding: '7px 16px', borderRadius: 100,
                    fontFamily: 'var(--font-heading)', fontSize: 12, fontWeight: 700,
                    background: filter === f ? 'var(--ink)' : 'white',
                    color: filter === f ? 'white' : 'var(--muted)',
                    border: `1.5px solid ${filter === f ? 'var(--ink)' : 'var(--border)'}`,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}>{f}</button>
                ))}
              </div>

              {/* Posts */}
              <div style={{ display: 'grid', gap: 20 }}>
                {posts.map((post, i) => <PostCard key={post.id} post={post} index={i} />)}
              </div>
            </div>

            {/* Sidebar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }} className="hide-mobile">

              {/* Popular Places */}
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>🔥 Popular Places</h3>
                  <TrendingUp size={14} style={{ color: 'var(--accent)' }} />
                </div>
                <div style={{ padding: '10px 0' }}>
                  {popularPlaces.map((place, i) => (
                    <Link to={`/destination/${i + 1}`} key={place.name} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '9px 18px',
                      textDecoration: 'none',
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--paper)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ width: 18, height: 18, borderRadius: '50%', background: 'var(--paper)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 700, color: 'var(--muted)' }}>{i + 1}</span>
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{place.emoji} {place.name}</span>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                        <Star size={10} fill="#c9a227" style={{ color: '#c9a227' }} />
                        <span style={{ fontSize: 11, color: 'var(--muted)' }}>{place.rating}</span>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>

              {/* Active Groups */}
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>
                    <Users size={12} style={{ display: 'inline', marginRight: 5 }} />Groups
                  </h3>
                </div>
                <div style={{ padding: '10px 0' }}>
                  {groups.map(g => (
                    <div key={g.name} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '9px 18px',
                      cursor: 'pointer',
                      transition: 'background 0.15s',
                    }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--paper)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 16 }}>{g.emoji}</span>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{g.name}</div>
                          <div style={{ fontSize: 11, color: 'var(--muted)' }}>{g.members} members</div>
                        </div>
                      </div>
                      {g.active && <span style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--accent3)', flexShrink: 0 }} />}
                    </div>
                  ))}
                </div>
              </div>

              {/* Featured Vloggers */}
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>⭐ Featured Vloggers</h3>
                </div>
                <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {featuredVloggers.map(v => (
                    <div key={v.name} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{
                          width: 34, height: 34, borderRadius: '50%',
                          background: 'var(--paper)', fontSize: 18,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                        }}>{v.avatar}</div>
                        <div>
                          <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{v.name}</div>
                          <div style={{ fontSize: 10, color: 'var(--muted)' }}>{v.followers} · {v.specialty}</div>
                        </div>
                      </div>
                      <button style={{
                        fontSize: 10, color: 'var(--accent2)',
                        fontFamily: 'var(--font-heading)', fontWeight: 700,
                        background: 'rgba(26,110,181,0.1)', padding: '3px 10px',
                        borderRadius: 20, border: '1px solid rgba(26,110,181,0.2)',
                        cursor: 'pointer',
                      }}>FOLLOW</button>
                    </div>
                  ))}
                </div>
                <div style={{ padding: '0 18px 14px' }}>
                  <Link to="/vloggers" style={{ color: 'var(--accent)', fontSize: 12, fontWeight: 700, fontFamily: 'var(--font-heading)', display: 'flex', alignItems: 'center', gap: 5 }}>
                    View All Vloggers <ArrowRight size={11} />
                  </Link>
                </div>
              </div>

              {/* Badges Feed */}
              <div style={{ background: 'white', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', overflow: 'hidden' }}>
                <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, color: 'var(--ink)' }}>
                    <Award size={12} style={{ display: 'inline', marginRight: 5 }} />Recent Badges
                  </h3>
                </div>
                <div style={{ padding: '12px 18px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {badges.map(b => (
                    <div key={b.name} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <div style={{
                        width: 32, height: 32, borderRadius: 8,
                        background: `${b.color}15`,
                        border: `1px solid ${b.color}30`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 15,
                      }}>{b.emoji}</div>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--ink)' }}>{b.name}</div>
                        <div style={{ fontSize: 10, color: 'var(--muted)' }}>Earned by {b.user}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    </PageTransition>
  )
}
