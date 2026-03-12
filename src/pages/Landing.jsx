import { useState, useEffect, useRef } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion, useScroll, useTransform, AnimatePresence } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import CountUp from 'react-countup'
import {
  Map, Users, Star, Compass, Video, Shield, Zap, Globe,
  ArrowRight, Play, ChevronRight, Award, Camera, MessageCircle
} from 'lucide-react'
import Footer from '../components/Footer.jsx'
import PageTransition from '../components/PageTransition.jsx'

/* ── DATA ── */
const destinations = [
  { id: 1, name: 'Santorini', country: 'Greece', emoji: '🇬🇷', tag: 'Islands', color: '#1a6eb5', rating: 4.9 },
  { id: 2, name: 'Kyoto', country: 'Japan', emoji: '🇯🇵', tag: 'Culture', color: '#8b3dca', rating: 4.8 },
  { id: 3, name: 'Patagonia', country: 'Argentina', emoji: '🇦🇷', tag: 'Adventure', color: '#1f8a55', rating: 4.7 },
  { id: 4, name: 'Marrakech', country: 'Morocco', emoji: '🇲🇦', tag: 'Explore', color: '#e8541a', rating: 4.8 },
  { id: 5, name: 'Bali', country: 'Indonesia', emoji: '🇮🇩', tag: 'Relax', color: '#c9a227', rating: 4.9 },
  { id: 6, name: 'Cappadocia', country: 'Turkey', emoji: '🇹🇷', tag: 'Unique', color: '#e85d8a', rating: 4.6 },
]

const features = [
  {
    icon: Users,
    title: 'Smart Buddy Matching',
    desc: 'AI-powered algorithm pairs you with compatible travelers based on budget, style, and personality.',
    color: 'var(--accent)',
    badge: 'Core Feature',
  },
  {
    icon: Map,
    title: 'Full Trip Planner',
    desc: 'Everything from destination databases to AI-generated itineraries, cost estimates, and routes.',
    color: 'var(--accent2)',
    badge: 'Planning',
  },
  {
    icon: Video,
    title: 'Vlogger Ecosystem',
    desc: 'Dedicated hub for content creators: upload, collaborate, sell guides, and grow your audience.',
    color: 'var(--accent4)',
    badge: 'Creator',
  },
  {
    icon: Star,
    title: 'Trust System',
    desc: 'Weighted ratings from verified trips ensure authentic reviews and trustworthy buddy profiles.',
    color: 'var(--accent3)',
    badge: 'Community',
  },
  {
    icon: Zap,
    title: 'AI Itinerary Generator',
    desc: 'Get personalised day-by-day plans based on your preferences — adventure, culture, or relaxation.',
    color: 'var(--accent5)',
    badge: 'AI Powered',
  },
  {
    icon: Shield,
    title: 'Expense Sharing',
    desc: 'Built-in cost-splitting for accommodation, transport, and food between travel buddies.',
    color: '#e85d8a',
    badge: 'Finance',
  },
]

const stats = [
  { value: 195, suffix: '+', label: 'Countries' },
  { value: 50000, suffix: '+', label: 'Travelers' },
  { value: 12000, suffix: '+', label: 'Buddy Matches' },
  { value: 4.9, suffix: '', label: 'Avg Rating', decimals: 1 },
]

const testimonials = [
  {
    name: 'Amara N.',
    tag: 'Solo Traveler',
    text: 'Found my perfect travel buddy for a 3-week Southeast Asia trip. The matching algorithm is uncannily accurate — we had the same budget, travel pace, and obsession with street food.',
    avatar: '🌍',
    rating: 5,
    trips: 12,
  },
  {
    name: 'Luca M.',
    tag: 'Vlogger · 80k followers',
    text: 'The Vlogger Hub changed how I work. I collaborate with creators in every city I visit, and the Marketplace lets me sell my travel guides directly to my followers.',
    avatar: '🎥',
    rating: 5,
    trips: 28,
  },
  {
    name: 'Priya S.',
    tag: 'Trip Planner',
    text: 'Planned a 10-day Japan trip in 30 minutes with the AI itinerary tool. Currency converter, emergency contacts, offline maps — everything I needed in one place.',
    avatar: '🗺️',
    rating: 5,
    trips: 7,
  },
]

const badges = [
  { emoji: '🌍', label: '195+ Countries' },
  { emoji: '🏆', label: 'Top Rated App' },
  { emoji: '🤝', label: 'Trusted Matching' },
  { emoji: '⚡', label: 'AI Powered' },
  { emoji: '🎥', label: 'Creator Friendly' },
  { emoji: '💰', label: 'Expense Sharing' },
  { emoji: '📴', label: 'Offline Mode' },
  { emoji: '🌐', label: 'AR/VR Previews' },
]

/* ── COMPONENTS ── */
function AnimatedStat({ value, suffix, label, decimals = 0, delay = 0 }) {
  const [ref, inView] = useInView({ threshold: 0.5, triggerOnce: true })
  return (
    <div ref={ref} style={{ textAlign: 'center' }}>
      <div style={{
        fontFamily: 'var(--font-display)',
        fontSize: 'clamp(36px, 5vw, 60px)',
        fontWeight: 700,
        lineHeight: 1,
        color: 'var(--paper)',
        marginBottom: 8,
      }}>
        {inView ? (
          <CountUp
            start={0}
            end={value}
            duration={2.5}
            delay={delay}
            decimals={decimals}
            separator=","
          />
        ) : '0'}
        <span style={{ color: 'var(--accent)' }}>{suffix}</span>
      </div>
      <div style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 11,
        fontWeight: 600,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color: 'rgba(247,244,238,0.4)',
      }}>{label}</div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, desc, color, badge, index }) {
  const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true })
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 40 }}
      animate={inView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay: index * 0.08, ease: [0.4, 0, 0.2, 1] }}
      style={{
        background: 'rgba(255,253,248,0.03)',
        border: '1px solid rgba(255,253,248,0.07)',
        borderRadius: 'var(--r-md)',
        padding: '28px 24px',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
        overflow: 'hidden',
      }}
      whileHover={{ y: -6, background: 'rgba(255,253,248,0.05)' }}
    >
      {/* Glow */}
      <div style={{
        position: 'absolute', top: 0, left: 0,
        width: 80, height: 80,
        background: color,
        opacity: 0.06,
        borderRadius: '0 0 80px 0',
        filter: 'blur(20px)',
      }} />

      <div style={{
        width: 44, height: 44,
        background: `${color}18`,
        borderRadius: 12,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        marginBottom: 16,
        border: `1px solid ${color}30`,
      }}>
        <Icon size={20} style={{ color }} />
      </div>

      <span style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 9,
        fontWeight: 700,
        letterSpacing: 2,
        textTransform: 'uppercase',
        color,
        opacity: 0.8,
        display: 'block',
        marginBottom: 8,
      }}>{badge}</span>

      <h3 style={{
        fontFamily: 'var(--font-heading)',
        fontSize: 16,
        fontWeight: 700,
        color: 'var(--paper)',
        marginBottom: 10,
        lineHeight: 1.3,
      }}>{title}</h3>

      <p style={{
        color: 'rgba(247,244,238,0.5)',
        fontSize: 13,
        lineHeight: 1.7,
      }}>{desc}</p>
    </motion.div>
  )
}

function DestinationCard({ dest, index }) {
  const [ref, inView] = useInView({ threshold: 0.15, triggerOnce: true })
  const [hovered, setHovered] = useState(false)
  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.92 }}
      animate={inView ? { opacity: 1, scale: 1 } : {}}
      transition={{ duration: 0.5, delay: index * 0.07 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{ cursor: 'pointer' }}
    >
      <Link to={`/destination/${dest.id}`} style={{ textDecoration: 'none' }}>
        <div style={{
          borderRadius: 'var(--r-md)',
          overflow: 'hidden',
          position: 'relative',
          aspectRatio: '3/4',
          background: `linear-gradient(135deg, ${dest.color}40, ${dest.color}10)`,
          border: `1px solid ${dest.color}30`,
          transition: 'all 0.3s ease',
          transform: hovered ? 'scale(1.02)' : 'scale(1)',
          boxShadow: hovered ? `0 20px 60px ${dest.color}40` : 'none',
        }}>
          {/* Backdrop */}
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 80,
            opacity: hovered ? 0.25 : 0.15,
            transition: 'opacity 0.3s',
          }}>
            {dest.emoji}
          </div>

          {/* Content */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0,
            padding: '24px 18px 20px',
            background: 'linear-gradient(transparent, rgba(10,14,26,0.92))',
          }}>
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 9,
              fontWeight: 700,
              letterSpacing: 2,
              textTransform: 'uppercase',
              color: dest.color,
              display: 'block',
              marginBottom: 4,
            }}>{dest.tag}</span>
            <h4 style={{
              fontFamily: 'var(--font-display)',
              fontSize: 20,
              fontWeight: 700,
              color: 'white',
              lineHeight: 1.1,
              marginBottom: 4,
            }}>{dest.name}</h4>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12 }}>
              {dest.emoji} {dest.country}
            </p>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 4,
              marginTop: 8,
            }}>
              <Star size={11} fill="#c9a227" style={{ color: '#c9a227' }} />
              <span style={{ color: '#c9a227', fontSize: 12, fontWeight: 700 }}>{dest.rating}</span>
            </div>
          </div>

          {/* Top badge */}
          <div style={{
            position: 'absolute', top: 12, right: 12,
            background: 'rgba(10,14,26,0.6)',
            backdropFilter: 'blur(10px)',
            borderRadius: 8,
            padding: '4px 10px',
            fontFamily: 'var(--font-heading)',
            fontSize: 10,
            fontWeight: 700,
            color: 'rgba(255,255,255,0.7)',
          }}>
            Explore →
          </div>
        </div>
      </Link>
    </motion.div>
  )
}

/* ── INTENT GATEWAY MODAL ── */
function IntentGateway({ onClose }) {
  const navigate = useNavigate()
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      style={{
        position: 'fixed', inset: 0, zIndex: 2000,
        background: 'rgba(10,14,26,0.8)',
        backdropFilter: 'blur(10px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.88, y: 30, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.92, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        onClick={e => e.stopPropagation()}
        style={{
          background: 'linear-gradient(145deg, #111827, #0d1220)',
          border: '1px solid rgba(255,253,248,0.1)',
          borderRadius: 'var(--r-lg)',
          padding: 'clamp(30px, 5vw, 48px)',
          maxWidth: 520,
          width: '100%',
          boxShadow: '0 40px 100px rgba(0,0,0,0.5)',
        }}
      >
        <div style={{
          width: 56, height: 56,
          background: 'rgba(232,84,26,0.15)',
          borderRadius: 16,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontSize: 28,
          marginBottom: 24,
          border: '1px solid rgba(232,84,26,0.3)',
        }}>🧭</div>

        <h2 style={{
          fontFamily: 'var(--font-display)',
          fontSize: 'clamp(22px, 4vw, 30px)',
          fontWeight: 700,
          color: 'var(--paper)',
          marginBottom: 10,
          lineHeight: 1.2,
        }}>
          Where's your journey taking you?
        </h2>
        <p style={{ color: 'rgba(247,244,238,0.5)', fontSize: 14, marginBottom: 30, lineHeight: 1.7 }}>
          Tell us your intent and we'll route you to the perfect experience.
        </p>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[
            { emoji: '🗺️', label: "I'm planning a trip", sub: 'Trip Planner + Buddy Matching', href: '/plan', color: 'var(--accent2)' },
            { emoji: '🧭', label: "I need trip inspiration", sub: 'Explore Destinations + Community', href: '/explore', color: 'var(--accent3)' },
            { emoji: '🤝', label: "I need a travel buddy", sub: 'Buddy Matching + Expense Sharing', href: '/buddy', color: 'var(--accent)' },
            { emoji: '🎥', label: "I'm a content creator", sub: 'Vlogger Hub + Marketplace', href: '/vloggers', color: 'var(--accent4)' },
          ].map(({ emoji, label, sub, href, color }) => (
            <button
              key={href}
              onClick={() => { onClose(); navigate(href) }}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '16px 20px',
                background: 'rgba(255,253,248,0.04)',
                border: '1px solid rgba(255,253,248,0.08)',
                borderRadius: 'var(--r-md)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                textAlign: 'left',
              }}
              onMouseEnter={e => {
                e.currentTarget.style.borderColor = color
                e.currentTarget.style.background = 'rgba(255,253,248,0.07)'
              }}
              onMouseLeave={e => {
                e.currentTarget.style.borderColor = 'rgba(255,253,248,0.08)'
                e.currentTarget.style.background = 'rgba(255,253,248,0.04)'
              }}
            >
              <span style={{ fontSize: 24 }}>{emoji}</span>
              <div>
                <div style={{
                  fontFamily: 'var(--font-heading)',
                  fontWeight: 700, fontSize: 14,
                  color: 'var(--paper)',
                  marginBottom: 2,
                }}>{label}</div>
                <div style={{ color: 'rgba(247,244,238,0.4)', fontSize: 11 }}>{sub}</div>
              </div>
              <ChevronRight size={16} style={{ marginLeft: 'auto', color: 'rgba(247,244,238,0.3)' }} />
            </button>
          ))}
        </div>

        <button
          onClick={onClose}
          style={{
            marginTop: 16,
            width: '100%',
            padding: 12,
            background: 'transparent',
            border: '1px solid rgba(255,253,248,0.08)',
            borderRadius: 'var(--r-md)',
            color: 'rgba(247,244,238,0.35)',
            fontFamily: 'var(--font-heading)',
            fontSize: 12,
            fontWeight: 600,
            letterSpacing: 1,
            cursor: 'pointer',
            transition: 'all 0.2s',
          }}
        >
          JUST BROWSING — SHOW ME EVERYTHING
        </button>
      </motion.div>
    </motion.div>
  )
}

/* ══════════════════════════════════════════
   LANDING PAGE
══════════════════════════════════════════ */
export default function Landing() {
  const [gatewayOpen, setGatewayOpen] = useState(false)
  const [activeTestimonial, setActiveTestimonial] = useState(0)
  const heroRef = useRef(null)
  const { scrollYProgress } = useScroll({ target: heroRef })
  const heroY = useTransform(scrollYProgress, [0, 1], ['0%', '30%'])
  const heroOpacity = useTransform(scrollYProgress, [0, 0.8], [1, 0])

  const [statsRef, statsInView] = useInView({ threshold: 0.3, triggerOnce: true })

  useEffect(() => {
    const timer = setTimeout(() => setGatewayOpen(true), 2200)
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    const t = setInterval(() => setActiveTestimonial(v => (v + 1) % testimonials.length), 5000)
    return () => clearInterval(t)
  }, [])

  return (
    <PageTransition>
      <div style={{ background: 'var(--ink)', minHeight: '100vh' }}>

        {/* ─── HERO ─── */}
        <section
          ref={heroRef}
          style={{
            minHeight: '100vh',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            overflow: 'hidden',
          }}
        >
          {/* Background */}
          <motion.div style={{ position: 'absolute', inset: 0, y: heroY }}>
            {/* Deep space gradient */}
            <div style={{
              position: 'absolute', inset: 0,
              background: 'radial-gradient(ellipse 80% 60% at 50% 0%, #1a2744 0%, #0a0e1a 60%)',
            }} />

            {/* Floating orbs */}
            <motion.div
              animate={{ x: [0, 30, 0], y: [0, -20, 0] }}
              transition={{ duration: 12, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute', top: '20%', right: '15%',
                width: 400, height: 400,
                background: 'radial-gradient(circle, rgba(232,84,26,0.12) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(40px)',
              }}
            />
            <motion.div
              animate={{ x: [0, -20, 0], y: [0, 30, 0] }}
              transition={{ duration: 15, repeat: Infinity, ease: 'easeInOut' }}
              style={{
                position: 'absolute', bottom: '20%', left: '10%',
                width: 500, height: 500,
                background: 'radial-gradient(circle, rgba(26,110,181,0.1) 0%, transparent 70%)',
                borderRadius: '50%',
                filter: 'blur(60px)',
              }}
            />

            {/* Grid lines */}
            <div style={{
              position: 'absolute', inset: 0,
              backgroundImage: `
                linear-gradient(rgba(255,253,248,0.025) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255,253,248,0.025) 1px, transparent 1px)
              `,
              backgroundSize: '60px 60px',
            }} />

            {/* Floating emojis */}
            {['✈️', '🌍', '🗺️', '🏔️', '🌊', '🎒'].map((emoji, i) => (
              <motion.div
                key={i}
                animate={{
                  y: [0, -15, 0],
                  rotate: [-5, 5, -5],
                  opacity: [0.3, 0.6, 0.3],
                }}
                transition={{
                  duration: 4 + i,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.7,
                }}
                style={{
                  position: 'absolute',
                  top: `${15 + (i * 13) % 70}%`,
                  left: `${5 + (i * 17) % 90}%`,
                  fontSize: 24 + (i % 3) * 10,
                  filter: 'blur(0.5px)',
                  userSelect: 'none',
                }}
              >
                {emoji}
              </motion.div>
            ))}
          </motion.div>

          {/* Hero content */}
          <motion.div
            style={{ position: 'relative', zIndex: 10, opacity: heroOpacity }}
            className="container"
          >
            <div style={{
              maxWidth: 780,
              paddingTop: 100,
              paddingBottom: 60,
            }}>
              {/* Tag */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 8,
                  marginBottom: 24,
                  padding: '6px 14px',
                  borderRadius: 100,
                  background: 'rgba(232,84,26,0.12)',
                  border: '1px solid rgba(232,84,26,0.25)',
                }}
              >
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', display: 'inline-block' }} />
                <span style={{
                  fontFamily: 'var(--font-heading)',
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  color: 'var(--accent)',
                }}>
                  AI-Powered Travel Platform
                </span>
              </motion.div>

              {/* Headline */}
              <motion.h1
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(42px, 8vw, 90px)',
                  fontWeight: 700,
                  lineHeight: 1.0,
                  letterSpacing: '-0.03em',
                  color: 'var(--paper)',
                  marginBottom: 24,
                }}
              >
                Travel Better.
                <br />
                Together.<span style={{ color: 'var(--accent)' }}>✈</span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.7, delay: 0.35 }}
                style={{
                  fontSize: 'clamp(15px, 2vw, 18px)',
                  color: 'rgba(247,244,238,0.6)',
                  maxWidth: 520,
                  lineHeight: 1.8,
                  marginBottom: 40,
                  fontWeight: 300,
                }}
              >
                Plan trips, find compatible travel companions, and explore the world with a platform built around your journey — powered by AI, trusted by community.
              </motion.p>

              {/* CTAs */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.5 }}
                style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
              >
                <button
                  onClick={() => setGatewayOpen(true)}
                  className="btn btn-primary"
                  style={{ fontSize: 14, padding: '14px 32px' }}
                >
                  Start Your Journey <ArrowRight size={16} />
                </button>
                <Link to="/explore" className="btn btn-outline" style={{ fontSize: 14, padding: '14px 28px' }}>
                  <Play size={14} /> Explore Destinations
                </Link>
              </motion.div>

              {/* Trust badges */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.6, delay: 0.8 }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  marginTop: 40, flexWrap: 'wrap',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: -6 }}>
                  {['🇵🇰', '🇹🇷', '🇺🇸', '🇯🇵'].map((flag, i) => (
                    <div key={i} style={{
                      width: 30, height: 30,
                      borderRadius: '50%',
                      background: '#1a1f2e',
                      border: '2px solid var(--ink)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontSize: 14,
                      marginLeft: i > 0 ? -8 : 0,
                    }}>{flag}</div>
                  ))}
                </div>
                <p style={{ color: 'rgba(247,244,238,0.45)', fontSize: 12 }}>
                  <span style={{ color: 'var(--paper)', fontWeight: 600 }}>50,000+</span> travelers from 195 countries
                </p>
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 4,
                  padding: '4px 12px',
                  background: 'rgba(31,138,85,0.12)',
                  border: '1px solid rgba(31,138,85,0.25)',
                  borderRadius: 100,
                }}>
                  <Star size={10} fill="var(--accent3)" style={{ color: 'var(--accent3)' }} />
                  <span style={{ color: 'var(--accent3)', fontSize: 11, fontWeight: 700 }}>4.9 · Top Rated</span>
                </div>
              </motion.div>
            </div>
          </motion.div>

          {/* Scroll indicator */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            style={{
              position: 'absolute', bottom: 32, left: '50%',
              transform: 'translateX(-50%)',
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
            }}
          >
            <span style={{
              fontFamily: 'var(--font-heading)',
              fontSize: 9, letterSpacing: 3,
              textTransform: 'uppercase',
              color: 'rgba(247,244,238,0.25)',
            }}>Scroll</span>
            <motion.div
              animate={{ y: [0, 8, 0] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              style={{
                width: 1.5, height: 30,
                background: 'linear-gradient(to bottom, rgba(247,244,238,0.3), transparent)',
              }}
            />
          </motion.div>
        </section>

        {/* ─── MARQUEE BADGES ─── */}
        <div style={{
          background: 'var(--accent)',
          padding: '14px 0',
          overflow: 'hidden',
        }}>
          <motion.div
            animate={{ x: [0, '-50%'] }}
            transition={{ duration: 25, repeat: Infinity, ease: 'linear' }}
            style={{ display: 'flex', whiteSpace: 'nowrap', width: 'max-content' }}
          >
            {[...badges, ...badges].map((b, i) => (
              <span key={i} style={{
                fontFamily: 'var(--font-heading)',
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 1.5,
                textTransform: 'uppercase',
                color: 'white',
                marginRight: 40,
                display: 'inline-flex', alignItems: 'center', gap: 8,
              }}>
                <span>{b.emoji}</span> {b.label}
                <span style={{ opacity: 0.4, marginLeft: 20 }}>·</span>
              </span>
            ))}
          </motion.div>
        </div>

        {/* ─── STATS ─── */}
        <section style={{
          padding: 'clamp(60px, 8vw, 100px) 0',
          background: 'linear-gradient(180deg, #0d1220 0%, #0a0e1a 100%)',
        }}>
          <div className="container">
            <div ref={statsRef} style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: 40,
            }}>
              {stats.map(({ value, suffix, label, decimals }, i) => (
                <AnimatedStat key={label} value={value} suffix={suffix} label={label} decimals={decimals} delay={i * 0.2} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── DESTINATIONS ─── */}
        <section className="section" style={{ background: 'var(--ink)' }}>
          <div className="container">
            <div style={{ marginBottom: 48, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', flexWrap: 'wrap', gap: 20 }}>
              <div>
                <p className="tag" style={{ marginBottom: 10 }}>✈ Destinations</p>
                <h2 className="display-heading" style={{ fontSize: 'clamp(28px, 5vw, 48px)', color: 'var(--paper)' }}>
                  Where will you<br />go next?
                </h2>
              </div>
              <Link to="/explore" className="btn btn-outline" style={{ fontSize: 13 }}>
                Browse All <ArrowRight size={14} />
              </Link>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
              gap: 16,
            }}>
              {destinations.map((dest, i) => (
                <DestinationCard key={dest.id} dest={dest} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── FEATURES ─── */}
        <section className="section" style={{ background: 'linear-gradient(180deg, #0a0e1a 0%, #0d1525 100%)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <p className="tag" style={{ marginBottom: 10 }}>⚡ Platform Features</p>
              <h2 className="display-heading" style={{ fontSize: 'clamp(28px, 5vw, 52px)', color: 'var(--paper)', marginBottom: 14 }}>
                Everything you need.<br />All in one place.
              </h2>
              <p style={{ color: 'rgba(247,244,238,0.45)', maxWidth: 500, margin: '0 auto', lineHeight: 1.7 }}>
                From AI-powered planning to community-driven buddy matching — TravelBuddy covers every part of your journey.
              </p>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
              gap: 20,
            }}>
              {features.map((feat, i) => (
                <FeatureCard key={feat.title} {...feat} index={i} />
              ))}
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS ─── */}
        <section className="section" style={{ background: 'var(--ink)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 56 }}>
              <p className="tag" style={{ marginBottom: 10 }}>🔁 How it Works</p>
              <h2 className="display-heading" style={{ fontSize: 'clamp(28px, 5vw, 48px)', color: 'var(--paper)' }}>
                Your journey in 4 steps
              </h2>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: 24,
            }}>
              {[
                { step: '01', icon: '🧭', title: 'Tell Us Your Intent', desc: 'Answer a quick question about your travel goals — planning, exploring, finding a buddy, or creating content.' },
                { step: '02', icon: '🗺️', title: 'Plan Your Trip', desc: 'Use our AI planner, browse destinations, estimate costs, and set up your full itinerary.' },
                { step: '03', icon: '🤝', title: 'Find Your Buddy', desc: 'Our matching algorithm connects you with compatible travelers for shared adventures and split expenses.' },
                { step: '04', icon: '✨', title: 'Travel & Share', desc: 'Go on your trip, rate your buddy and destinations, share your experience, and earn badges.' },
              ].map(({ step, icon, title, desc }, i) => {
                const [ref, inView] = useInView({ threshold: 0.2, triggerOnce: true })
                return (
                  <motion.div
                    key={step}
                    ref={ref}
                    initial={{ opacity: 0, y: 30 }}
                    animate={inView ? { opacity: 1, y: 0 } : {}}
                    transition={{ duration: 0.6, delay: i * 0.1 }}
                    style={{
                      position: 'relative',
                      padding: '28px 24px',
                      borderRadius: 'var(--r-md)',
                      background: 'rgba(255,253,248,0.02)',
                      border: '1px solid rgba(255,253,248,0.06)',
                    }}
                  >
                    <div style={{
                      fontFamily: 'var(--font-display)',
                      fontSize: 60,
                      fontWeight: 700,
                      color: 'rgba(232,84,26,0.08)',
                      lineHeight: 1,
                      marginBottom: 12,
                      letterSpacing: '-0.05em',
                    }}>{step}</div>
                    <div style={{ fontSize: 32, marginBottom: 12 }}>{icon}</div>
                    <h3 style={{
                      fontFamily: 'var(--font-heading)',
                      fontSize: 16,
                      fontWeight: 700,
                      color: 'var(--paper)',
                      marginBottom: 10,
                    }}>{title}</h3>
                    <p style={{ color: 'rgba(247,244,238,0.45)', fontSize: 13, lineHeight: 1.7 }}>{desc}</p>
                    {i < 3 && (
                      <div style={{
                        position: 'absolute', top: '50%', right: -12,
                        transform: 'translateY(-50%)',
                        color: 'rgba(232,84,26,0.3)',
                        fontSize: 20,
                      }} className="hide-mobile">→</div>
                    )}
                  </motion.div>
                )
              })}
            </div>
          </div>
        </section>

        {/* ─── TESTIMONIALS ─── */}
        <section className="section" style={{ background: 'linear-gradient(135deg, #0d1220, #0a0e1a)' }}>
          <div className="container">
            <div style={{ textAlign: 'center', marginBottom: 48 }}>
              <p className="tag" style={{ marginBottom: 10 }}>💬 Testimonials</p>
              <h2 className="display-heading" style={{ fontSize: 'clamp(26px, 4.5vw, 44px)', color: 'var(--paper)' }}>
                Loved by travelers worldwide
              </h2>
            </div>

            <div style={{ maxWidth: 720, margin: '0 auto' }}>
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ duration: 0.4 }}
                  style={{
                    padding: 'clamp(28px, 5vw, 48px)',
                    background: 'rgba(255,253,248,0.04)',
                    border: '1px solid rgba(255,253,248,0.08)',
                    borderRadius: 'var(--r-lg)',
                    textAlign: 'center',
                  }}
                >
                  <div style={{ fontSize: 40, marginBottom: 20 }}>
                    {testimonials[activeTestimonial].avatar}
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 3, marginBottom: 20 }}>
                    {[...Array(testimonials[activeTestimonial].rating)].map((_, i) => (
                      <Star key={i} size={14} fill="#c9a227" style={{ color: '#c9a227' }} />
                    ))}
                  </div>
                  <p style={{
                    fontSize: 'clamp(15px, 2vw, 18px)',
                    color: 'rgba(247,244,238,0.8)',
                    fontStyle: 'italic',
                    lineHeight: 1.8,
                    marginBottom: 24,
                    fontWeight: 300,
                  }}>
                    "{testimonials[activeTestimonial].text}"
                  </p>
                  <div>
                    <div style={{
                      fontFamily: 'var(--font-heading)',
                      fontWeight: 700,
                      color: 'var(--paper)',
                      fontSize: 15,
                      marginBottom: 4,
                    }}>{testimonials[activeTestimonial].name}</div>
                    <div style={{ color: 'var(--accent)', fontSize: 12 }}>{testimonials[activeTestimonial].tag}</div>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Dots */}
              <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
                {testimonials.map((_, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveTestimonial(i)}
                    style={{
                      width: i === activeTestimonial ? 24 : 8,
                      height: 8,
                      borderRadius: 4,
                      background: i === activeTestimonial ? 'var(--accent)' : 'rgba(255,253,248,0.15)',
                      border: 'none',
                      cursor: 'pointer',
                      transition: 'all 0.3s ease',
                    }}
                  />
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ─── CTA BANNER ─── */}
        <section style={{
          padding: 'clamp(60px, 8vw, 100px) 0',
          background: 'linear-gradient(135deg, #1a0d08 0%, #0a0e1a 50%, #0d1a2e 100%)',
          position: 'relative',
          overflow: 'hidden',
        }}>
          {/* bg decoration */}
          <div style={{
            position: 'absolute', top: -100, right: -100,
            width: 500, height: 500,
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(232,84,26,0.1) 0%, transparent 70%)',
            filter: 'blur(60px)',
          }} />
          <div className="container" style={{ textAlign: 'center', position: 'relative', zIndex: 1 }}>
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.7 }}
            >
              <p style={{ fontSize: 40, marginBottom: 16 }}>🌍</p>
              <h2 className="display-heading" style={{
                fontSize: 'clamp(28px, 6vw, 60px)',
                color: 'var(--paper)',
                marginBottom: 16,
              }}>
                Ready to find your<br /><span style={{ color: 'var(--accent)' }}>Travel Buddy?</span>
              </h2>
              <p style={{
                color: 'rgba(247,244,238,0.5)',
                fontSize: 16,
                marginBottom: 36,
                maxWidth: 420,
                margin: '0 auto 36px',
                lineHeight: 1.7,
              }}>
                Join 50,000+ travelers planning unforgettable trips together.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link to="/signup" className="btn btn-primary" style={{ fontSize: 15, padding: '16px 36px' }}>
                  Create Free Account <ArrowRight size={16} />
                </Link>
                <button
                  onClick={() => setGatewayOpen(true)}
                  className="btn btn-outline"
                  style={{ fontSize: 14, padding: '14px 28px' }}
                >
                  Explore the Platform
                </button>
              </div>
            </motion.div>
          </div>
        </section>

        <Footer />
      </div>

      {/* Intent Gateway Modal */}
      <AnimatePresence>
        {gatewayOpen && <IntentGateway onClose={() => setGatewayOpen(false)} />}
      </AnimatePresence>
    </PageTransition>
  )
}
