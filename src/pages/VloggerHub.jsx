import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Upload, DollarSign, Users, FileText, BarChart2,
  Globe, Video, Image, Plus, ArrowRight, Star,
  CheckCircle, TrendingUp, Eye, Heart, Download
} from 'lucide-react'
import Footer from '../components/Footer.jsx'
import PageTransition from '../components/PageTransition.jsx'

const tabs = [
  { id: 'overview',     label: 'Hub Overview',    icon: Globe },
  { id: 'upload',       label: 'Upload Content',  icon: Upload },
  { id: 'marketplace',  label: 'Marketplace',     icon: DollarSign },
  { id: 'collabs',      label: 'Collaborations',  icon: Users },
  { id: 'docs',         label: 'Documentation',   icon: FileText },
  { id: 'analytics',    label: 'Analytics',       icon: BarChart2 },
]

const marketplaceItems = [
  { id: 1, title: 'Ultimate Japan 14-Day Guide',       author: 'Nomad Kai',        price: 29,  sales: 3421, rating: 4.9, emoji: '🇯🇵', type: 'Guide'   },
  { id: 2, title: 'Bali Budget Travel Masterclass',    author: 'Travel with Zara', price: 19,  sales: 1892, rating: 4.8, emoji: '🇮🇩', type: 'Course'  },
  { id: 3, title: 'Santorini Photo Walks Tour',        author: 'The Beach Seeker', price: 45,  sales: 734,  rating: 5.0, emoji: '🇬🇷', type: 'Meetup'  },
  { id: 4, title: 'Solo Female Travel Safety Pack',    author: 'Mia Chen',         price: 15,  sales: 5210, rating: 4.9, emoji: '🌍', type: 'Guide'   },
]

const collabRequests = [
  { name: 'Alex Rivera',   avatar: '🏔️', specialty: 'Adventure',    location: 'Patagonia', followers: '89k',  status: 'pending'  },
  { name: 'Fatima Hassan', avatar: '🌺', specialty: 'Culture',       location: 'Morocco',   followers: '125k', status: 'pending'  },
  { name: 'Jake Thompson', avatar: '🤿', specialty: 'Beach / Water', location: 'Maldives',  followers: '200k', status: 'accepted' },
]

const analyticsData = [
  { label: 'Total Views',    value: '284k',  icon: Eye,       color: 'var(--accent2)' },
  { label: 'Followers',      value: '47.2k', icon: Users,     color: 'var(--accent4)' },
  { label: 'Likes',          value: '18.9k', icon: Heart,     color: '#e85d8a'        },
  { label: 'Guide Sales',    value: '$3,840',icon: DollarSign,color: 'var(--accent3)' },
]

/* ── small stat card ── */
function StatCard({ label, value, icon: Icon, color }) {
  return (
    <div style={{
      padding: '18px 20px',
      background: 'rgba(255,253,248,0.04)',
      border: '1px solid rgba(255,253,248,0.08)',
      borderRadius: 'var(--r-md)',
    }}>
      <div style={{
        width: 38, height: 38,
        background: `${color}18`,
        border: `1px solid ${color}30`,
        borderRadius: 10,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 12,
      }}>
        <Icon size={17} style={{ color }} />
      </div>
      <div style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--paper)', lineHeight: 1, marginBottom: 4 }}>{value}</div>
      <div style={{ fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(247,244,238,0.35)' }}>{label}</div>
    </div>
  )
}

export default function VloggerHub() {
  const [activeTab, setActiveTab]   = useState('overview')
  const [uploadType, setUploadType] = useState('video')
  const [uploadTitle, setUploadTitle] = useState('')
  const [uploadDesc, setUploadDesc]   = useState('')
  const [uploading, setUploading]     = useState(false)
  const [uploadDone, setUploadDone]   = useState(false)
  const [collabs, setCollabs]         = useState(collabRequests)

  const handleUpload = () => {
    if (!uploadTitle.trim()) return
    setUploading(true)
    setTimeout(() => { setUploading(false); setUploadDone(true) }, 2000)
  }

  const respondCollab = (name, action) => {
    setCollabs(prev => prev.map(c => c.name === name ? { ...c, status: action } : c))
  }

  return (
    <PageTransition>
      <div style={{ background: 'var(--ink)', minHeight: '100vh' }}>

        {/* ── HERO ── */}
        <div style={{
          padding: 'clamp(90px, 10vw, 130px) 0 50px',
          background: 'linear-gradient(180deg, #0d0516 0%, #1a0d26 50%, #0a0e1a 100%)',
          position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ position: 'absolute', top: -100, left: '30%', width: 500, height: 500, borderRadius: '50%', background: 'radial-gradient(circle, rgba(139,61,202,0.15) 0%, transparent 70%)', filter: 'blur(60px)', pointerEvents: 'none' }} />
          <div style={{ position: 'absolute', inset: 0, backgroundImage: `linear-gradient(rgba(255,253,248,0.02) 1px, transparent 1px), linear-gradient(90deg, rgba(255,253,248,0.02) 1px, transparent 1px)`, backgroundSize: '50px 50px', pointerEvents: 'none' }} />

          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 8, marginBottom: 18,
                padding: '6px 14px', borderRadius: 100,
                background: 'rgba(139,61,202,0.15)', border: '1px solid rgba(139,61,202,0.3)',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#8b3dca', display: 'inline-block' }} />
                <span style={{ fontFamily: 'var(--font-heading)', fontSize: 11, fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', color: '#b57ce0' }}>Creator Platform</span>
              </div>

              <h1 className="display-heading" style={{ fontSize: 'clamp(36px, 7vw, 72px)', color: 'var(--paper)', marginBottom: 14 }}>
                Vlogger Hub
              </h1>
              <p style={{ color: 'rgba(247,244,238,0.5)', fontSize: 16, maxWidth: 500, lineHeight: 1.8, marginBottom: 32 }}>
                Upload content, sell your travel guides, collaborate with creators worldwide, and grow your audience — all from one place.
              </p>

              {/* Quick stats */}
              <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
                {[
                  { emoji: '🎥', label: '18k+ videos uploaded' },
                  { emoji: '💰', label: '$2.4M earned by creators' },
                  { emoji: '🤝', label: '4,200+ collaborations' },
                ].map(({ emoji, label }) => (
                  <div key={label} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 18 }}>{emoji}</span>
                    <span style={{ color: 'rgba(247,244,238,0.5)', fontSize: 13 }}>{label}</span>
                  </div>
                ))}
              </div>
            </motion.div>
          </div>
        </div>

        {/* ── TAB NAVIGATION ── */}
        <div style={{ background: 'rgba(10,14,26,0.95)', borderBottom: '1px solid rgba(255,253,248,0.06)', position: 'sticky', top: 60, zIndex: 100, backdropFilter: 'blur(20px)' }}>
          <div className="container">
            <div style={{ display: 'flex', gap: 0, overflow: 'auto' }}>
              {tabs.map(({ id, label, icon: Icon }) => (
                <button key={id} onClick={() => setActiveTab(id)} style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  padding: '14px 18px',
                  fontFamily: 'var(--font-heading)', fontSize: 12, fontWeight: 700,
                  color: activeTab === id ? '#b57ce0' : 'rgba(247,244,238,0.4)',
                  borderBottom: activeTab === id ? '2px solid #8b3dca' : '2px solid transparent',
                  marginBottom: -1, transition: 'all 0.2s', whiteSpace: 'nowrap', cursor: 'pointer',
                }}>
                  <Icon size={13} />{label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ── TAB CONTENT ── */}
        <div className="container" style={{ padding: 'clamp(28px, 5vw, 56px) clamp(20px, 5vw, 80px)', paddingBottom: 80 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >

              {/* ══ OVERVIEW ══ */}
              {activeTab === 'overview' && (
                <div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 40 }}>
                    {analyticsData.map(d => <StatCard key={d.label} {...d} />)}
                  </div>

                  {/* Feature list */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 16 }}>
                    {[
                      { icon: Upload,    color: '#8b3dca', title: 'Content Upload',         desc: 'Upload videos, photos, and travel logs tied to your trips. Supports all major formats.' },
                      { icon: DollarSign,color: 'var(--accent3)', title: 'Marketplace',      desc: 'Sell travel guides, run paid meetups, and offer exclusive experiences to your audience.' },
                      { icon: Users,     color: 'var(--accent2)', title: 'Creator Network',  desc: 'Connect with vloggers in every destination. Send and receive collaboration requests.' },
                      { icon: FileText,  color: 'var(--accent5)', title: 'Auto Documentation', desc: 'Automatically generate structured travel logs for visa applications or sponsorship decks.' },
                      { icon: BarChart2, color: 'var(--accent)',  title: 'Analytics Dashboard', desc: 'Track views, follower growth, engagement rates, and marketplace revenue in real time.' },
                      { icon: Globe,     color: '#e85d8a',         title: 'Socializing Hub',  desc: 'A dedicated space for vloggers to share announcements, tips, and collaborations.' },
                    ].map(({ icon: Icon, color, title, desc }) => (
                      <div key={title} style={{
                        padding: '22px 20px',
                        background: 'rgba(255,253,248,0.03)',
                        border: '1px solid rgba(255,253,248,0.07)',
                        borderRadius: 'var(--r-md)',
                        transition: 'border-color 0.2s',
                        cursor: 'default',
                      }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = `${color}50`}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,253,248,0.07)'}
                      >
                        <div style={{ width: 38, height: 38, background: `${color}18`, border: `1px solid ${color}30`, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 14 }}>
                          <Icon size={17} style={{ color }} />
                        </div>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: 'var(--paper)', marginBottom: 8 }}>{title}</h3>
                        <p style={{ color: 'rgba(247,244,238,0.4)', fontSize: 12, lineHeight: 1.7 }}>{desc}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ══ UPLOAD ══ */}
              {activeTab === 'upload' && (
                <div style={{ maxWidth: 680 }}>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'var(--paper)', marginBottom: 24 }}>Upload Content</h2>

                  {/* Type selector */}
                  <div style={{ display: 'flex', gap: 10, marginBottom: 28 }}>
                    {[
                      { id: 'video', emoji: '🎥', label: 'Video' },
                      { id: 'photo', emoji: '📸', label: 'Photo' },
                      { id: 'log',   emoji: '📝', label: 'Travel Log' },
                    ].map(t => (
                      <button key={t.id} onClick={() => setUploadType(t.id)} style={{
                        display: 'flex', alignItems: 'center', gap: 8,
                        padding: '10px 20px', borderRadius: 100,
                        fontFamily: 'var(--font-heading)', fontSize: 12, fontWeight: 700,
                        cursor: 'pointer', transition: 'all 0.2s',
                        background: uploadType === t.id ? '#8b3dca' : 'rgba(255,253,248,0.05)',
                        color: uploadType === t.id ? 'white' : 'rgba(247,244,238,0.5)',
                        border: uploadType === t.id ? '1.5px solid #8b3dca' : '1.5px solid rgba(255,253,248,0.1)',
                      }}>
                        <span>{t.emoji}</span>{t.label}
                      </button>
                    ))}
                  </div>

                  {/* Drop zone */}
                  <div style={{
                    border: '2px dashed rgba(139,61,202,0.4)',
                    borderRadius: 'var(--r-md)',
                    padding: '48px 32px',
                    textAlign: 'center', marginBottom: 24,
                    background: 'rgba(139,61,202,0.05)',
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'rgba(139,61,202,0.7)'; e.currentTarget.style.background = 'rgba(139,61,202,0.09)' }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'rgba(139,61,202,0.4)'; e.currentTarget.style.background = 'rgba(139,61,202,0.05)' }}
                  >
                    <div style={{ fontSize: 36, marginBottom: 12 }}>
                      {uploadType === 'video' ? '🎥' : uploadType === 'photo' ? '📸' : '📝'}
                    </div>
                    <p style={{ color: 'rgba(247,244,238,0.5)', fontSize: 14, marginBottom: 8 }}>
                      Drag & drop your {uploadType} here, or click to browse
                    </p>
                    <p style={{ color: 'rgba(247,244,238,0.25)', fontSize: 11 }}>
                      {uploadType === 'video' ? 'MP4, MOV up to 2GB' : uploadType === 'photo' ? 'JPG, PNG, WEBP up to 50MB' : 'Markdown or plain text'}
                    </p>
                  </div>

                  {/* Fields */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                    <div>
                      <label style={{ fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(247,244,238,0.35)', display: 'block', marginBottom: 8 }}>Title *</label>
                      <input className="input" placeholder="Give your content a title..." value={uploadTitle} onChange={e => setUploadTitle(e.target.value)} />
                    </div>
                    <div>
                      <label style={{ fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(247,244,238,0.35)', display: 'block', marginBottom: 8 }}>Description</label>
                      <textarea className="input" rows={3} placeholder="Describe your experience..." value={uploadDesc} onChange={e => setUploadDesc(e.target.value)} style={{ resize: 'vertical' }} />
                    </div>
                    <div>
                      <label style={{ fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(247,244,238,0.35)', display: 'block', marginBottom: 8 }}>Linked Destination</label>
                      <input className="input" placeholder="e.g. Kyoto, Japan" />
                    </div>

                    <AnimatePresence mode="wait">
                      {uploadDone ? (
                        <motion.div key="done" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                          style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '14px 18px', background: 'rgba(31,138,85,0.12)', border: '1px solid rgba(31,138,85,0.3)', borderRadius: 'var(--r-md)' }}
                        >
                          <CheckCircle size={18} style={{ color: 'var(--accent3)' }} />
                          <span style={{ color: 'var(--accent3)', fontFamily: 'var(--font-heading)', fontSize: 13, fontWeight: 700 }}>Content uploaded successfully!</span>
                        </motion.div>
                      ) : (
                        <motion.button key="btn" onClick={handleUpload} disabled={uploading} className="btn btn-primary" style={{ justifyContent: 'center', padding: '14px', fontSize: 14 }}>
                          {uploading ? (
                            <><motion.div animate={{ rotate: 360 }} transition={{ duration: 1, repeat: Infinity, ease: 'linear' }} style={{ width: 16, height: 16, border: '2px solid rgba(255,255,255,0.3)', borderTopColor: 'white', borderRadius: '50%' }} /> Uploading...</>
                          ) : (
                            <><Upload size={15} /> Publish Content</>
                          )}
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              )}

              {/* ══ MARKETPLACE ══ */}
              {activeTab === 'marketplace' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
                    <div>
                      <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'var(--paper)', marginBottom: 4 }}>Marketplace</h2>
                      <p style={{ color: 'rgba(247,244,238,0.4)', fontSize: 13 }}>Sell travel guides, paid meetups, and merchandise to your audience</p>
                    </div>
                    <button className="btn btn-primary" style={{ fontSize: 13, padding: '10px 20px' }}>
                      <Plus size={14} /> List New Item
                    </button>
                  </div>

                  {/* Type filters */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
                    {['All', 'Guide', 'Course', 'Meetup', 'Merch'].map(f => (
                      <button key={f} style={{
                        padding: '6px 16px', borderRadius: 100,
                        fontFamily: 'var(--font-heading)', fontSize: 11, fontWeight: 700,
                        background: f === 'All' ? '#8b3dca' : 'rgba(255,253,248,0.05)',
                        color: f === 'All' ? 'white' : 'rgba(247,244,238,0.4)',
                        border: f === 'All' ? '1.5px solid #8b3dca' : '1.5px solid rgba(255,253,248,0.1)',
                        cursor: 'pointer', transition: 'all 0.2s',
                      }}>{f}</button>
                    ))}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                    {marketplaceItems.map((item, i) => (
                      <motion.div key={item.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
                        style={{ background: 'rgba(255,253,248,0.04)', border: '1px solid rgba(255,253,248,0.08)', borderRadius: 'var(--r-md)', overflow: 'hidden', transition: 'border-color 0.2s' }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = 'rgba(139,61,202,0.4)'}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,253,248,0.08)'}
                      >
                        {/* Thumbnail */}
                        <div style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg, rgba(139,61,202,0.2), rgba(10,14,26,0.4))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 48, position: 'relative' }}>
                          <span style={{ opacity: 0.6 }}>{item.emoji}</span>
                          <span style={{ position: 'absolute', top: 10, left: 10, background: '#8b3dca', color: 'white', fontSize: 9, fontFamily: 'var(--font-heading)', fontWeight: 700, letterSpacing: 1, padding: '3px 9px', borderRadius: 20 }}>{item.type.toUpperCase()}</span>
                        </div>
                        <div style={{ padding: '16px 16px 18px' }}>
                          <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: 'var(--paper)', marginBottom: 4, lineHeight: 1.3 }}>{item.title}</h3>
                          <p style={{ color: 'rgba(247,244,238,0.4)', fontSize: 11, marginBottom: 12 }}>by {item.author}</p>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                              <span style={{ fontFamily: 'var(--font-display)', fontSize: 20, fontWeight: 700, color: 'var(--accent3)' }}>${item.price}</span>
                              <span style={{ color: 'rgba(247,244,238,0.3)', fontSize: 11 }}>{item.sales.toLocaleString()} sold</span>
                            </div>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 3 }}>
                              <Star size={11} fill="#c9a227" style={{ color: '#c9a227' }} />
                              <span style={{ color: '#c9a227', fontSize: 12, fontWeight: 700 }}>{item.rating}</span>
                            </div>
                          </div>
                          <button className="btn btn-primary" style={{ width: '100%', justifyContent: 'center', marginTop: 12, padding: '9px', fontSize: 12 }}>
                            Buy Now
                          </button>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* ══ COLLABORATIONS ══ */}
              {activeTab === 'collabs' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 28, flexWrap: 'wrap', gap: 14 }}>
                    <div>
                      <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'var(--paper)', marginBottom: 4 }}>Collaboration Requests</h2>
                      <p style={{ color: 'rgba(247,244,238,0.4)', fontSize: 13 }}>Connect with travel creators worldwide for joint projects</p>
                    </div>
                    <button className="btn btn-primary" style={{ fontSize: 13, padding: '10px 20px' }}>
                      <Plus size={14} /> Send Request
                    </button>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                    {collabs.map((c) => (
                      <motion.div key={c.name} layout
                        style={{
                          display: 'flex', alignItems: 'center', gap: 16,
                          padding: '18px 20px',
                          background: 'rgba(255,253,248,0.03)',
                          border: `1px solid ${c.status === 'accepted' ? 'rgba(31,138,85,0.3)' : 'rgba(255,253,248,0.08)'}`,
                          borderRadius: 'var(--r-md)',
                          flexWrap: 'wrap',
                        }}
                      >
                        <div style={{ width: 46, height: 46, borderRadius: '50%', background: 'rgba(255,253,248,0.06)', border: '2px solid rgba(255,253,248,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, flexShrink: 0 }}>
                          {c.avatar}
                        </div>
                        <div style={{ flex: 1, minWidth: 140 }}>
                          <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: 'var(--paper)', marginBottom: 3 }}>{c.name}</div>
                          <div style={{ color: 'rgba(247,244,238,0.4)', fontSize: 12 }}>
                            {c.specialty} · 📍{c.location} · {c.followers} followers
                          </div>
                        </div>

                        {c.status === 'accepted' ? (
                          <span style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(31,138,85,0.12)', color: 'var(--accent3)', padding: '6px 14px', borderRadius: 100, fontFamily: 'var(--font-heading)', fontSize: 11, fontWeight: 700 }}>
                            <CheckCircle size={12} /> Accepted
                          </span>
                        ) : c.status === 'declined' ? (
                          <span style={{ color: 'rgba(247,244,238,0.25)', fontFamily: 'var(--font-heading)', fontSize: 11, fontWeight: 700 }}>Declined</span>
                        ) : (
                          <div style={{ display: 'flex', gap: 8 }}>
                            <button onClick={() => respondCollab(c.name, 'accepted')} className="btn btn-primary" style={{ padding: '8px 18px', fontSize: 12 }}>Accept</button>
                            <button onClick={() => respondCollab(c.name, 'declined')} className="btn btn-outline" style={{ padding: '8px 14px', fontSize: 12 }}>Decline</button>
                          </div>
                        )}
                      </motion.div>
                    ))}
                  </div>
                </div>
              )}

              {/* ══ DOCUMENTATION ══ */}
              {activeTab === 'docs' && (
                <div style={{ maxWidth: 680 }}>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'var(--paper)', marginBottom: 8 }}>Auto Documentation Tools</h2>
                  <p style={{ color: 'rgba(247,244,238,0.4)', fontSize: 13, marginBottom: 28, lineHeight: 1.7 }}>
                    Automatically generate structured travel logs from your trips — perfect for visa applications, sponsorship decks, and portfolio building.
                  </p>

                  {/* Doc type cards */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginBottom: 32 }}>
                    {[
                      { emoji: '📄', title: 'Visa Application Log', desc: 'Structured proof-of-travel document with dates, destinations, and accommodations.', color: 'var(--accent2)' },
                      { emoji: '💼', title: 'Sponsorship Deck', desc: 'Auto-filled deck with your stats, destinations covered, and audience demographics.', color: '#8b3dca' },
                      { emoji: '🏆', title: 'Creator Portfolio', desc: 'A polished portfolio PDF with your best content, engagement stats, and collaborations.', color: 'var(--accent5)' },
                      { emoji: '📊', title: 'Trip Report', desc: 'Detailed report of a specific trip: itinerary, costs, ratings, and photos.', color: 'var(--accent3)' },
                    ].map(({ emoji, title, desc, color }) => (
                      <div key={title} style={{
                        padding: '18px 18px 20px',
                        background: 'rgba(255,253,248,0.03)',
                        border: '1px solid rgba(255,253,248,0.08)',
                        borderRadius: 'var(--r-md)',
                        cursor: 'pointer', transition: 'border-color 0.2s',
                      }}
                        onMouseEnter={e => e.currentTarget.style.borderColor = `${color}50`}
                        onMouseLeave={e => e.currentTarget.style.borderColor = 'rgba(255,253,248,0.08)'}
                      >
                        <div style={{ fontSize: 28, marginBottom: 10 }}>{emoji}</div>
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, color: 'var(--paper)', marginBottom: 7 }}>{title}</h3>
                        <p style={{ color: 'rgba(247,244,238,0.38)', fontSize: 11, lineHeight: 1.65 }}>{desc}</p>
                        <button style={{
                          marginTop: 14, display: 'flex', alignItems: 'center', gap: 6,
                          color, fontSize: 11, fontFamily: 'var(--font-heading)', fontWeight: 700,
                          letterSpacing: 0.5, cursor: 'pointer', background: 'none', border: 'none',
                        }}>
                          <Download size={12} /> Generate
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Connected trips */}
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, color: 'var(--paper)', marginBottom: 14 }}>Your Trips Available for Documentation</h3>
                  {[
                    { dest: 'Kyoto, Japan', dates: 'Mar 4–14, 2025', status: 'Completed' },
                    { dest: 'Bali, Indonesia', dates: 'Jan 12–24, 2025', status: 'Completed' },
                  ].map(trip => (
                    <div key={trip.dest} style={{
                      display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                      padding: '13px 16px', marginBottom: 8,
                      background: 'rgba(255,253,248,0.03)', border: '1px solid rgba(255,253,248,0.07)', borderRadius: 10,
                    }}>
                      <div>
                        <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--paper)' }}>{trip.dest}</div>
                        <div style={{ color: 'rgba(247,244,238,0.35)', fontSize: 11 }}>{trip.dates}</div>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <span style={{ background: 'rgba(31,138,85,0.12)', color: 'var(--accent3)', fontSize: 10, fontFamily: 'var(--font-heading)', fontWeight: 700, padding: '2px 9px', borderRadius: 20 }}>{trip.status}</span>
                        <button style={{ fontSize: 11, color: '#8b3dca', fontFamily: 'var(--font-heading)', fontWeight: 700, cursor: 'pointer' }}>USE →</button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* ══ ANALYTICS ══ */}
              {activeTab === 'analytics' && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'var(--paper)', marginBottom: 24 }}>Analytics Dashboard</h2>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 14, marginBottom: 32 }}>
                    {analyticsData.map(d => <StatCard key={d.label} {...d} />)}
                  </div>

                  {/* Fake bar chart */}
                  <div style={{ background: 'rgba(255,253,248,0.03)', border: '1px solid rgba(255,253,248,0.07)', borderRadius: 'var(--r-md)', padding: '24px 24px 20px', marginBottom: 24 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: 'var(--paper)' }}>Views — Last 7 Days</h3>
                      <TrendingUp size={16} style={{ color: 'var(--accent3)' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'flex-end', gap: 10, height: 120 }}>
                      {[40, 65, 55, 80, 70, 95, 88].map((h, i) => (
                        <motion.div key={i} initial={{ height: 0 }} animate={{ height: `${h}%` }} transition={{ delay: i * 0.07, duration: 0.5, ease: 'easeOut' }}
                          style={{ flex: 1, background: `linear-gradient(to top, #8b3dca, rgba(139,61,202,0.3))`, borderRadius: '4px 4px 0 0', minHeight: 4 }}
                        />
                      ))}
                    </div>
                    <div style={{ display: 'flex', gap: 10, marginTop: 10 }}>
                      {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map(d => (
                        <div key={d} style={{ flex: 1, textAlign: 'center', fontFamily: 'var(--font-heading)', fontSize: 9, fontWeight: 700, color: 'rgba(247,244,238,0.25)' }}>{d}</div>
                      ))}
                    </div>
                  </div>

                  {/* Top content */}
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: 'var(--paper)', marginBottom: 14 }}>Top Performing Content</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {[
                      { title: 'Kyoto at dawn — hidden spots', views: '84.2k', type: 'Video' },
                      { title: 'Japan 14-Day Guide (PDF)', views: '12.1k downloads', type: 'Guide' },
                      { title: 'Arashiyama Bamboo Grove walk', views: '61.5k', type: 'Video' },
                    ].map(c => (
                      <div key={c.title} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '12px 16px',
                        background: 'rgba(255,253,248,0.03)', border: '1px solid rgba(255,253,248,0.07)', borderRadius: 10,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <span style={{ fontSize: 18 }}>{c.type === 'Video' ? '🎥' : '📄'}</span>
                          <span style={{ fontWeight: 600, fontSize: 13, color: 'var(--paper)' }}>{c.title}</span>
                        </div>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                          <Eye size={12} style={{ color: 'rgba(247,244,238,0.3)' }} />
                          <span style={{ color: 'rgba(247,244,238,0.5)', fontSize: 12 }}>{c.views}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>

        <Footer />
      </div>
    </PageTransition>
  )
}
