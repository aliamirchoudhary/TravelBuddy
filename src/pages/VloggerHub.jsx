import { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import {
  Upload, DollarSign, Users, FileText, BarChart2, Globe,
  Eye, Heart, CheckCircle, ShieldCheck, Plus, Video, Image,
  Send, Download, MessageCircle,
} from 'lucide-react'
import PageTransition from '../components/PageTransition.jsx'
import Footer from '../components/Footer.jsx'
import api from '../services/api'

const tabs = [
  { id: 'content', label: 'My Content', icon: Globe },
  { id: 'upload', label: 'Upload', icon: Upload },
  { id: 'analytics', label: 'Analytics', icon: BarChart2 },
  { id: 'marketplace', label: 'Marketplace', icon: DollarSign },
  { id: 'collabs', label: 'Collabs', icon: Users },
  { id: 'docs', label: 'Documentation', icon: FileText },
]

const niches = ['adventure', 'food', 'budget', 'luxury', 'solo', 'family', 'photography', 'backpacking']
const productTypes = ['guide', 'packing_list', 'budget_guide', 'itinerary_template']

const card = {
  background: 'rgba(255,253,248,0.04)',
  border: '1px solid rgba(255,253,248,0.08)',
  borderRadius: 'var(--r-md)',
}

const input = {
  width: '100%',
  background: '#0f1318',
  color: 'var(--paper)',
  border: '1px solid rgba(255,255,255,0.14)',
  borderRadius: 12,
  padding: '12px 13px',
  outline: 'none',
  boxSizing: 'border-box',
}

function Field({ label, children }) {
  return (
    <label style={{ display: 'block' }}>
      <span style={{ display: 'block', marginBottom: 8, fontSize: 11, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase', color: 'rgba(247,244,238,0.42)' }}>
        {label}
      </span>
      {children}
    </label>
  )
}

function StatCard({ label, value, icon: Icon, color = 'var(--accent)' }) {
  return (
    <div style={{ ...card, padding: 18 }}>
      <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}18`, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}>
        <Icon size={17} style={{ color }} />
      </div>
      <div style={{ color: 'var(--paper)', fontSize: 24, fontWeight: 800, lineHeight: 1 }}>{value}</div>
      <div style={{ marginTop: 6, color: 'rgba(247,244,238,0.42)', fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1 }}>{label}</div>
    </div>
  )
}

function RegisterCreatorForm({ onCreated }) {
  const [form, setForm] = useState({ handle: '', niche: 'adventure', socialInstagram: '', socialYouTube: '', bio: '', agree: false })
  const [loading, setLoading] = useState(false)

  const submit = async (e) => {
    e.preventDefault()
    if (!form.handle.trim()) return toast.error('Creator handle is required')
    if (!form.agree) return toast.error('Please agree to the creator guidelines')

    try {
      setLoading(true)
      const res = await api.post('/creators/register', {
        handle: form.handle,
        niche: form.niche,
        socialInstagram: form.socialInstagram,
        socialYouTube: form.socialYouTube,
        bio: form.bio,
      })
      toast.success('Creator profile created')
      onCreated(res.data.creator)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not create creator profile')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{ minHeight: '70vh', display: 'grid', placeItems: 'center', padding: '100px 20px 60px' }}>
      <form onSubmit={submit} style={{ ...card, width: '100%', maxWidth: 760, padding: 28 }}>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 13px', borderRadius: 999, background: 'rgba(123,97,255,0.12)', color: '#b99cff', fontSize: 12, fontWeight: 800, marginBottom: 18 }}>
          <Video size={14} /> Become a Creator
        </div>
        <h1 style={{ color: 'var(--paper)', fontSize: 34, lineHeight: 1.1, margin: '0 0 10px' }}>Unlock your Vlogger Hub</h1>
        <p style={{ color: 'rgba(247,244,238,0.55)', lineHeight: 1.7, marginBottom: 24 }}>
          Create a creator profile, upload travel content, track analytics, manage digital guides, send collab requests, and generate travel documentation.
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <Field label="Creator Handle">
            <input style={input} placeholder="e.g. lucatravels" value={form.handle} onChange={e => setForm({ ...form, handle: e.target.value })} />
          </Field>
          <Field label="Niche">
            <select style={input} value={form.niche} onChange={e => setForm({ ...form, niche: e.target.value })}>
              {niches.map(n => <option key={n} value={n}>{n}</option>)}
            </select>
          </Field>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
          <Field label="Instagram Link">
            <input style={input} placeholder="optional" value={form.socialInstagram} onChange={e => setForm({ ...form, socialInstagram: e.target.value })} />
          </Field>
          <Field label="YouTube Link">
            <input style={input} placeholder="optional" value={form.socialYouTube} onChange={e => setForm({ ...form, socialYouTube: e.target.value })} />
          </Field>
        </div>
        <Field label="Bio">
          <textarea style={{ ...input, minHeight: 100, resize: 'vertical' }} placeholder="Tell travellers what you create..." value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} />
        </Field>
        <label style={{ display: 'flex', gap: 10, alignItems: 'center', marginTop: 18, color: 'rgba(247,244,238,0.58)', fontSize: 13 }}>
          <input type="checkbox" checked={form.agree} onChange={e => setForm({ ...form, agree: e.target.checked })} />
          I agree to the creator content guidelines.
        </label>
        <button className="btn btn-primary" disabled={loading} style={{ marginTop: 22, width: '100%', justifyContent: 'center', padding: 14 }}>
          {loading ? 'Creating...' : 'Become a Creator'}
        </button>
      </form>
    </div>
  )
}

function MediaPreview({ post }) {
  const url = post.ThumbnailURL || post.MediaURL
  if (!url) return <div style={{ fontSize: 36 }}>{post.MediaType === 'video' ? '🎥' : post.MediaType === 'travellog' ? '📝' : '📸'}</div>

  if (post.MediaType === 'video') {
    return <video src={post.MediaURL} controls style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
  }

  return <img src={url} alt={post.Title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
}

export default function VloggerHub() {
  const [creator, setCreator] = useState(null)
  const [activeTab, setActiveTab] = useState('content')
  const [posts, setPosts] = useState([])
  const [analytics, setAnalytics] = useState(null)
  const [products, setProducts] = useState([])
  const [collabs, setCollabs] = useState([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const [upload, setUpload] = useState({ title: '', description: '', mediaType: 'video', mediaFile: null, mediaUrl: '', thumbnailUrl: '', destinationCityId: '', tripId: '' })
  const [product, setProduct] = useState({ title: '', description: '', productType: 'guide', priceAmount: '', currencyCode: 'PKR', fileUrl: '', coverImageUrl: '' })
  const [collab, setCollab] = useState({ toCreatorHandle: '', destinationCityId: '', message: '' })
  const [travelLogTripId, setTravelLogTripId] = useState('')

  const loadCreator = async () => {
    try {
      setLoading(true)
      const res = await api.get('/creators/me')
      setCreator(res.data.creator)
    } catch (err) {
      if (err.response?.status !== 404) toast.error('Login as a user to access Vlogger Hub')
      setCreator(null)
    } finally {
      setLoading(false)
    }
  }

  const loadDashboard = async () => {
    if (!creator) return
    try {
      const [contentRes, analyticsRes, productsRes, collabsRes] = await Promise.all([
        api.get('/creators/me/content'),
        api.get('/creators/me/analytics'),
        api.get('/creators/me/products'),
        api.get('/creators/me/collabs'),
      ])
      setPosts(contentRes.data.posts || [])
      setAnalytics(analyticsRes.data || null)
      setProducts(productsRes.data.products || [])
      setCollabs(collabsRes.data.collabs || [])
    } catch (err) {
      toast.error('Could not load creator dashboard data')
    }
  }

  useEffect(() => { loadCreator() }, [])
  useEffect(() => { loadDashboard() }, [creator?.CreatorID])

  const stats = useMemo(() => {
    const s = analytics?.summary || {}
    return [
      { label: 'Total Views', value: s.TotalViews || creator?.TotalViews || 0, icon: Eye, color: 'var(--accent2)' },
      { label: 'Followers', value: creator?.FollowerCount || 0, icon: Users, color: 'var(--accent4)' },
      { label: 'Likes', value: s.TotalLikes || 0, icon: Heart, color: '#e85d8a' },
      { label: 'Posts', value: s.TotalPosts || posts.length || 0, icon: Image, color: 'var(--accent3)' },
      { label: 'Est. Earnings', value: `${Number(s.EstimatedEarnings || 0).toFixed(0)} PKR`, icon: DollarSign, color: '#f5c542' },
    ]
  }, [analytics, creator, posts.length])

  const submitUpload = async (e) => {
    e.preventDefault()
    if (!upload.title.trim()) return toast.error('Title is required')
    if (!upload.mediaFile && !upload.mediaUrl.trim()) return toast.error('Upload a file or paste a media URL')

    try {
      setUploading(true)
      const formData = new FormData()
      formData.append('title', upload.title)
      formData.append('description', upload.description)
      formData.append('mediaType', upload.mediaType)
      formData.append('mediaUrl', upload.mediaUrl)
      formData.append('thumbnailUrl', upload.thumbnailUrl)
      formData.append('destinationCityId', upload.destinationCityId)
      formData.append('tripId', upload.tripId)
      if (upload.mediaFile) formData.append('media', upload.mediaFile)

      await api.post('/content/upload', formData, { headers: { 'Content-Type': 'multipart/form-data' } })
      toast.success('Content published')
      setUpload({ title: '', description: '', mediaType: 'video', mediaFile: null, mediaUrl: '', thumbnailUrl: '', destinationCityId: '', tripId: '' })
      await loadDashboard()
      setActiveTab('content')
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not publish content')
    } finally {
      setUploading(false)
    }
  }

  const submitProduct = async (e) => {
    e.preventDefault()
    if (!product.title.trim()) return toast.error('Product title is required')
    try {
      await api.post('/creators/me/products', product)
      toast.success('Digital product listed')
      setProduct({ title: '', description: '', productType: 'guide', priceAmount: '', currencyCode: 'PKR', fileUrl: '', coverImageUrl: '' })
      await loadDashboard()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not list product')
    }
  }

  const submitCollab = async (e) => {
    e.preventDefault()
    if (!collab.toCreatorHandle.trim()) return toast.error('Enter creator handle')
    try {
      await api.post('/creators/me/collabs', collab)
      toast.success('Collab request sent')
      setCollab({ toCreatorHandle: '', destinationCityId: '', message: '' })
      await loadDashboard()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not send collab request')
    }
  }

  const generateTravelLog = async () => {
    if (!travelLogTripId) return toast.error('Enter a completed trip ID')
    try {
      const res = await api.post(`/creators/trips/${travelLogTripId}/travel-log`, {}, { responseType: 'blob' })
      const url = window.URL.createObjectURL(new Blob([res.data], { type: 'application/pdf' }))
      const a = document.createElement('a')
      a.href = url
      a.download = `travel-log-trip-${travelLogTripId}.pdf`
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (err) {
      toast.error(err.response?.data?.message || 'Could not generate travel log')
    }
  }

  if (loading) return <PageTransition><div style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', color: 'var(--paper)' }}>Loading Vlogger Hub...</div></PageTransition>
  if (!creator) return <PageTransition><RegisterCreatorForm onCreated={setCreator} /></PageTransition>

  return (
    <PageTransition>
      <div style={{ background: 'var(--ink)', minHeight: '100vh' }}>
        <div style={{ padding: '110px 0 40px', background: 'var(--surface)', borderBottom: '1px solid var(--border)' }}>
          <div className="container">
            <div style={{ display: 'grid', gridTemplateColumns: 'minmax(240px, 320px) 1fr', gap: 24, alignItems: 'stretch' }}>
              <aside style={{ ...card, padding: 22 }}>
                <div style={{ width: 64, height: 64, borderRadius: '50%', background: 'rgba(123,97,255,0.2)', display: 'grid', placeItems: 'center', fontSize: 28, marginBottom: 14 }}>{creator.Avatar || '🎥'}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <h2 style={{ color: 'var(--paper)', margin: 0, fontSize: 22 }}>@{creator.Handle}</h2>
                  {creator.IsVerified ? <ShieldCheck size={18} style={{ color: '#60a5fa' }} /> : null}
                </div>
                <p style={{ color: 'rgba(247,244,238,0.54)', lineHeight: 1.6, margin: '12px 0 16px' }}>{creator.Bio || 'Travel creator on TravelBuddy.'}</p>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ padding: '5px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', color: 'rgba(247,244,238,0.72)', fontSize: 12 }}>{creator.Niche || 'travel'}</span>
                  <span style={{ padding: '5px 10px', borderRadius: 999, background: 'rgba(255,255,255,0.06)', color: 'rgba(247,244,238,0.72)', fontSize: 12 }}>{creator.FollowerCount || 0} followers</span>
                </div>
              </aside>

              <main>
                <motion.h1 initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="display-heading" style={{ color: 'var(--paper)', fontSize: 'clamp(38px, 6vw, 68px)', marginBottom: 10 }}>Vlogger Hub</motion.h1>
                <p style={{ color: 'rgba(247,244,238,0.58)', maxWidth: 760, lineHeight: 1.8, marginBottom: 22 }}>
                  Upload content through Cloudinary, manage your creator profile, track engagement, list digital guides, request collabs, and generate travel documentation.
                </p>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 14 }}>
                  {stats.map(s => <StatCard key={s.label} {...s} />)}
                </div>
              </main>
            </div>
          </div>
        </div>

        <div style={{ position: 'sticky', top: 72, zIndex: 50, background: 'rgba(12,16,22,0.85)', borderBottom: '1px solid var(--border)', backdropFilter: 'blur(20px)' }}>
          <div className="container" style={{ display: 'flex', overflowX: 'auto' }}>
            {tabs.map(({ id, label, icon: Icon }) => (
              <button key={id} onClick={() => setActiveTab(id)} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '15px 18px', color: activeTab === id ? '#67e8f9' : 'rgba(247,244,238,0.46)', borderBottom: activeTab === id ? '2px solid #22d3ee' : '2px solid transparent', cursor: 'pointer', fontWeight: 800, fontSize: 13 }}>
                <Icon size={14} /> {label}
              </button>
            ))}
          </div>
        </div>

        <div className="container" style={{ padding: '38px 20px 80px' }}>
          {activeTab === 'content' && (
            <section>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, marginBottom: 20 }}>
                <h2 style={{ color: 'var(--paper)', margin: 0 }}>My Content</h2>
                <button className="btn btn-primary" onClick={() => setActiveTab('upload')}><Plus size={15} /> Upload</button>
              </div>
              {posts.length === 0 ? <div style={{ ...card, padding: 28, color: 'rgba(247,244,238,0.58)' }}>No posts yet. Upload your first travel video, photo, or travel log.</div> : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 16 }}>
                  {posts.map(post => (
                    <article key={post.PostID} style={{ ...card, overflow: 'hidden' }}>
                      <div style={{ aspectRatio: '16/9', background: 'linear-gradient(135deg, rgba(34,211,238,0.16), rgba(123,97,255,0.18))', display: 'grid', placeItems: 'center', color: 'rgba(247,244,238,0.6)' }}><MediaPreview post={post} /></div>
                      <div style={{ padding: 16 }}>
                        <h3 style={{ color: 'var(--paper)', margin: '0 0 8px', fontSize: 16 }}>{post.Title}</h3>
                        <p style={{ color: 'rgba(247,244,238,0.44)', minHeight: 38, fontSize: 13, lineHeight: 1.5 }}>{post.Description || 'No description'}</p>
                        <div style={{ display: 'flex', gap: 14, marginTop: 14, color: 'rgba(247,244,238,0.55)', fontSize: 12 }}><span>👁 {post.ViewCount || 0}</span><span>❤️ {post.LikeCount || 0}</span><span>💬 {post.CommentCount || 0}</span></div>
                      </div>
                    </article>
                  ))}
                </div>
              )}
            </section>
          )}

          {activeTab === 'upload' && (
            <form onSubmit={submitUpload} style={{ ...card, maxWidth: 820, padding: 24 }}>
              <h2 style={{ color: 'var(--paper)', marginTop: 0 }}>Upload Content</h2>
              <p style={{ color: 'rgba(247,244,238,0.5)', lineHeight: 1.7 }}>Upload an image/video file to Cloudinary. You can also paste a media URL as fallback.</p>
              <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', gap: 14, marginBottom: 16 }}>
                <Field label="Media Type"><select style={input} value={upload.mediaType} onChange={e => setUpload({ ...upload, mediaType: e.target.value })}>{['video', 'photo', 'photoset', 'travellog'].map(t => <option key={t} value={t}>{t}</option>)}</select></Field>
                <Field label="Title"><input style={input} placeholder="e.g. Hunza road trip cinematic vlog" value={upload.title} onChange={e => setUpload({ ...upload, title: e.target.value })} /></Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <Field label="Cloudinary File"><input style={input} type="file" accept="image/*,video/*" onChange={e => setUpload({ ...upload, mediaFile: e.target.files?.[0] || null })} /></Field>
                <Field label="Fallback Media URL"><input style={input} placeholder="optional https://..." value={upload.mediaUrl} onChange={e => setUpload({ ...upload, mediaUrl: e.target.value })} /></Field>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 16 }}>
                <Field label="Thumbnail URL"><input style={input} placeholder="optional" value={upload.thumbnailUrl} onChange={e => setUpload({ ...upload, thumbnailUrl: e.target.value })} /></Field>
                <Field label="Destination City ID"><input style={input} placeholder="optional, e.g. 1" value={upload.destinationCityId} onChange={e => setUpload({ ...upload, destinationCityId: e.target.value })} /></Field>
              </div>
              <Field label="Trip ID"><input style={input} placeholder="optional completed/related trip id" value={upload.tripId} onChange={e => setUpload({ ...upload, tripId: e.target.value })} /></Field>
              <div style={{ height: 16 }} />
              <Field label="Description"><textarea style={{ ...input, minHeight: 120, resize: 'vertical' }} placeholder="Describe the experience..." value={upload.description} onChange={e => setUpload({ ...upload, description: e.target.value })} /></Field>
              <button className="btn btn-primary" disabled={uploading} style={{ marginTop: 20, justifyContent: 'center', minWidth: 170 }}>{uploading ? 'Uploading...' : 'Publish Content'}</button>
            </form>
          )}

          {activeTab === 'analytics' && (
            <section>
              <h2 style={{ color: 'var(--paper)', marginTop: 0 }}>Analytics</h2>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 14, marginBottom: 24 }}>{stats.map(s => <StatCard key={s.label} {...s} />)}</div>
              <div style={{ ...card, padding: 22 }}>
                <h3 style={{ color: 'var(--paper)', marginTop: 0 }}>Top Content</h3>
                {(analytics?.topPosts || []).length === 0 ? <p style={{ color: 'rgba(247,244,238,0.5)' }}>No analytics yet. Publish content first.</p> : analytics.topPosts.map(p => <div key={p.PostID} style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'rgba(247,244,238,0.7)' }}><span>{p.Title}</span><span>{p.ViewCount || 0} views</span></div>)}
              </div>
            </section>
          )}

          {activeTab === 'marketplace' && (
            <section style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 420px) 1fr', gap: 18 }}>
              <form onSubmit={submitProduct} style={{ ...card, padding: 24 }}>
                <h2 style={{ color: 'var(--paper)', marginTop: 0 }}>List Digital Product</h2>
                <Field label="Title"><input style={input} value={product.title} onChange={e => setProduct({ ...product, title: e.target.value })} placeholder="e.g. Northern Areas Budget Guide PDF" /></Field><div style={{ height: 12 }} />
                <Field label="Product Type"><select style={input} value={product.productType} onChange={e => setProduct({ ...product, productType: e.target.value })}>{productTypes.map(t => <option key={t} value={t}>{t}</option>)}</select></Field><div style={{ height: 12 }} />
                <Field label="Price"><input style={input} type="number" value={product.priceAmount} onChange={e => setProduct({ ...product, priceAmount: e.target.value })} placeholder="PKR" /></Field><div style={{ height: 12 }} />
                <Field label="File URL"><input style={input} value={product.fileUrl} onChange={e => setProduct({ ...product, fileUrl: e.target.value })} placeholder="PDF / guide URL" /></Field><div style={{ height: 12 }} />
                <Field label="Description"><textarea style={{ ...input, minHeight: 90 }} value={product.description} onChange={e => setProduct({ ...product, description: e.target.value })} /></Field>
                <button className="btn btn-primary" style={{ marginTop: 16 }}><Plus size={14} /> List Product</button>
              </form>
              <div style={{ ...card, padding: 24 }}>
                <h2 style={{ color: 'var(--paper)', marginTop: 0 }}>Your Marketplace</h2>
                {products.length === 0 ? <p style={{ color: 'rgba(247,244,238,0.56)' }}>No digital products yet. Phase 1 uses request-payment/manual DM model.</p> : products.map(p => <div key={p.ProductID} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'rgba(247,244,238,0.7)' }}><strong style={{ color: 'var(--paper)' }}>{p.Title}</strong><div>{p.ProductType} • {p.PriceAmount} {p.CurrencyCode}</div></div>)}
              </div>
            </section>
          )}

          {activeTab === 'collabs' && (
            <section style={{ display: 'grid', gridTemplateColumns: 'minmax(280px, 420px) 1fr', gap: 18 }}>
              <form onSubmit={submitCollab} style={{ ...card, padding: 24 }}>
                <h2 style={{ color: 'var(--paper)', marginTop: 0 }}>Send Collab Request</h2>
                <Field label="Creator Handle"><input style={input} value={collab.toCreatorHandle} onChange={e => setCollab({ ...collab, toCreatorHandle: e.target.value })} placeholder="e.g. saratravels" /></Field><div style={{ height: 12 }} />
                <Field label="Destination City ID"><input style={input} value={collab.destinationCityId} onChange={e => setCollab({ ...collab, destinationCityId: e.target.value })} placeholder="optional" /></Field><div style={{ height: 12 }} />
                <Field label="Message"><textarea style={{ ...input, minHeight: 100 }} value={collab.message} onChange={e => setCollab({ ...collab, message: e.target.value })} placeholder="Pitch the collaboration..." /></Field>
                <button className="btn btn-primary" style={{ marginTop: 16 }}><Send size={14} /> Send Request</button>
              </form>
              <div style={{ ...card, padding: 24 }}>
                <h2 style={{ color: 'var(--paper)', marginTop: 0 }}>Requests</h2>
                {collabs.length === 0 ? <p style={{ color: 'rgba(247,244,238,0.56)' }}>No collab requests yet.</p> : collabs.map(c => <div key={c.CollabID} style={{ padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.06)', color: 'rgba(247,244,238,0.7)' }}><strong style={{ color: 'var(--paper)' }}>@{c.FromHandle} → @{c.ToHandle}</strong><div>{c.Status} {c.DestinationName ? `• ${c.DestinationName}` : ''}</div><div style={{ fontSize: 13 }}>{c.Message}</div></div>)}
              </div>
            </section>
          )}

          {activeTab === 'docs' && (
            <section style={{ ...card, padding: 24, maxWidth: 720 }}>
              <h2 style={{ color: 'var(--paper)', marginTop: 0 }}>Documentation / Auto Visa Log</h2>
              <p style={{ color: 'rgba(247,244,238,0.56)', lineHeight: 1.7 }}>Generate a PDF travel log from a completed trip. It can support visa documentation, sponsorship proof, or creator portfolio evidence.</p>
              <Field label="Trip ID"><input style={input} value={travelLogTripId} onChange={e => setTravelLogTripId(e.target.value)} placeholder="e.g. 12" /></Field>
              <button onClick={generateTravelLog} className="btn btn-primary" style={{ marginTop: 18 }}><Download size={14} /> Generate Travel Log PDF</button>
              <div style={{ marginTop: 18, color: 'rgba(247,244,238,0.45)', fontSize: 13 }}><MessageCircle size={14} /> Includes title page, trip summary, itinerary evidence, accommodation/cost note.</div>
            </section>
          )}
        </div>
        <Footer />
      </div>
    </PageTransition>
  )
}
