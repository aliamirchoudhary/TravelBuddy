import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion, useScroll, useTransform } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { Map, Users, Star, Compass, Video, Shield, Zap, Globe, ArrowRight, Play } from 'lucide-react'

const features = [
  {
    icon: Users,
    title: 'Smart Buddy Matching',
    desc: 'AI-powered algorithm pairs you with compatible travelers based on budget, style, and personality.',
    color: '#81ecff',
    badge: 'Core Feature'
  },
  {
    icon: Map,
    title: 'Full Trip Planner',
    desc: 'Everything from destination databases to AI-generated itineraries, cost estimates, and routes.',
    color: '#ff7353',
    badge: 'Planning'
  },
  {
    icon: Video,
    title: 'Vlogger Ecosystem',
    desc: 'Dedicated hub for content creators: upload, collaborate, sell guides, and grow your audience.',
    color: '#ff61d8',
    badge: 'Creator'
  },
  {
    icon: Star,
    title: 'Trust System',
    desc: 'Weighted ratings from verified trips ensure authentic reviews and trustworthy buddy profiles.',
    color: '#ffd166',
    badge: 'Community'
  },
  {
    icon: Zap,
    title: 'AI Itinerary Generator',
    desc: 'Get personalised day-by-day plans based on your preferences — adventure, culture, or relaxation.',
    color: '#00e887',
    badge: 'AI Powered'
  },
  {
    icon: Shield,
    title: 'Expense Sharing',
    desc: 'Built-in cost-splitting for accommodation, transport, and food between travel buddies.',
    color: '#7b61ff',
    badge: 'Finance'
  },
]

const stats = [
  { value: 195, suffix: '+', label: 'Countries' },
  { value: 50000, suffix: '+', label: 'Travelers' },
  { value: 12000, suffix: '+', label: 'Buddy Matches' },
  { value: 4.9, suffix: '', label: 'Avg Rating', decimals: 1 },
]

export default function Landing() {
  const { scrollY } = useScroll()
  const heroY = useTransform(scrollY, [0, 1000], [0, -200])

  return (
    <div style={{ background: 'var(--ink)', minHeight: '100vh' }}>
      {/* Hero Section */}
      <section style={{
        minHeight: '100vh',
        position: 'relative',
        display: 'flex',
        alignItems: 'center',
        overflow: 'hidden',
        background: 'linear-gradient(135deg, var(--ink) 0%, #0f1419 50%, #0c0e11 100%)',
      }}>
        <motion.div
          style={{ y: heroY }}
          className="container"
        >
          <div style={{
            maxWidth: 800,
            margin: '0 auto',
            textAlign: 'center',
            padding: '120px 20px 80px',
          }}>
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8 }}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                marginBottom: 32,
                padding: '8px 16px',
                borderRadius: 100,
                background: 'rgba(129,236,255,0.08)',
                border: '1px solid rgba(129,236,255,0.2)',
              }}
            >
              <div style={{
                width: 6,
                height: 6,
                borderRadius: '50%',
                background: 'var(--accent)',
                boxShadow: '0 0 12px var(--accent)',
              }} />
              <span style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 2,
                textTransform: 'uppercase',
                color: 'var(--accent)',
              }}>
                AI-Powered Travel Platform
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.2 }}
              className="display-heading"
              style={{
                fontSize: 'clamp(48px, 10vw, 96px)',
                color: 'var(--paper)',
                marginBottom: 24,
                lineHeight: 1.05,
                letterSpacing: '-0.03em',
              }}
            >
              Travel.
              <span style={{ color: 'var(--accent)' }}> Record.</span>
              <br />
              <span style={{ color: 'var(--accent2)' }}>Connect.</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              style={{
                fontSize: 'clamp(16px, 2.5vw, 20px)',
                color: 'var(--paper-muted)',
                lineHeight: 1.7,
                marginBottom: 48,
                maxWidth: 600,
                margin: '0 auto 48px',
              }}
            >
              Plan trips, find companions, and publish the journey — a cinematic toolkit for explorers, creators, and communities.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.6 }}
              style={{
                display: 'flex',
                gap: 16,
                justifyContent: 'center',
                flexWrap: 'wrap',
              }}
            >
              <Link
                to="/explore"
                className="btn btn-primary"
                style={{
                  fontSize: 16,
                  padding: '16px 32px',
                  boxShadow: '0 0 40px rgba(129,236,255,0.3)',
                }}
              >
                Start Your Journey <ArrowRight size={18} />
              </Link>
              <Link
                to="/plan"
                className="btn btn-outline"
                style={{ fontSize: 16, padding: '16px 28px' }}
              >
                <Play size={16} /> Plan a Trip
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              style={{
                marginTop: 64,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 24,
                flexWrap: 'wrap',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {['🇵🇰', '🇹🇷', '🇺🇸', '🇯🇵'].map((flag, i) => (
                  <div key={i} style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    background: 'var(--surface)',
                    border: '2px solid var(--border)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 16,
                    marginLeft: i > 0 ? -8 : 0,
                  }}>{flag}</div>
                ))}
              </div>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                padding: '6px 16px',
                background: 'rgba(255,115,83,0.1)',
                border: '1px solid rgba(255,115,83,0.3)',
                borderRadius: 100,
              }}>
                <Star size={12} fill="#ffd166" style={{ color: '#ffd166' }} />
                <span style={{
                  color: '#ffd166',
                  fontSize: 12,
                  fontWeight: 700
                }}>4.9 · Top Rated</span>
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Scroll Indicator */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1.5 }}
          style={{
            position: 'absolute',
            bottom: 40,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap: 12,
          }}
        >
          <span style={{
            fontSize: 10,
            letterSpacing: 3,
            textTransform: 'uppercase',
            color: 'var(--paper-dim)',
          }}>Scroll to explore</span>
          <motion.div
            animate={{ y: [0, 12, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            style={{
              width: 2,
              height: 40,
              background: 'linear-gradient(to bottom, var(--accent), transparent)',
              borderRadius: 1,
            }}
          />
        </motion.div>
      </section>

      {/* Bento Grid Section */}
      <section className="section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center', marginBottom: 64 }}
          >
            <span className="tag" style={{ marginBottom: 16 }}>✦ Studio Mosaic</span>
            <h2 className="display-heading" style={{
              fontSize: 'clamp(32px, 6vw, 56px)',
              color: 'var(--paper)',
              marginBottom: 16,
            }}>
              Everything you need,<br />stitched into one flow
            </h2>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(12, 1fr)',
            gap: 20,
            gridAutoRows: 'minmax(140px, auto)',
          }}>
            {/* Large Buddy Matching Card */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
              style={{ gridColumn: 'span 7', gridRow: 'span 2' }}
              className="card"
            >
              <Link to="/buddy" style={{
                display: 'flex',
                flexDirection: 'column',
                height: '100%',
                textDecoration: 'none',
                color: 'inherit',
              }}>
                <div style={{
                  flex: 1,
                  padding: 32,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  background: 'linear-gradient(135deg, rgba(129,236,255,0.08), rgba(255,115,83,0.06))',
                  borderRadius: 'var(--r-md) var(--r-md) 0 0',
                }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    color: 'var(--accent2)',
                    marginBottom: 8,
                  }}>MATCH</span>
                  <h3 style={{
                    fontSize: 28,
                    fontWeight: 800,
                    color: 'var(--paper)',
                    marginBottom: 12,
                    lineHeight: 1.2,
                  }}>Find Your Buddy</h3>
                  <p style={{
                    color: 'var(--paper-muted)',
                    fontSize: 14,
                    lineHeight: 1.6,
                    maxWidth: 400,
                  }}>
                    Pair by budget, pace, and style — then split costs with confidence.
                  </p>
                </div>
                <div style={{
                  height: 160,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 80,
                  background: 'var(--surface)',
                  borderRadius: '0 0 var(--r-md) var(--r-md)',
                }}>🧭</div>
              </Link>
            </motion.div>

            {/* Trending Destinations */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
              style={{ gridColumn: 'span 5' }}
              className="card"
            >
              <div style={{ padding: 24, height: '100%' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: 20,
                }}>
                  <span style={{
                    fontSize: 12,
                    fontWeight: 700,
                    color: 'var(--accent2)',
                    textTransform: 'uppercase',
                    letterSpacing: 1,
                  }}>🔥 TRENDING NOW</span>
                  <Link to="/explore" style={{
                    fontSize: 12,
                    color: 'var(--accent)',
                    fontWeight: 700,
                    textDecoration: 'none',
                  }}>View all →</Link>
                </div>
                {[
                  { name: 'Icelandic Highlands', emoji: '🏔️' },
                  { name: 'Tokyo Neon Nights', emoji: '🗼' },
                  { name: 'Bali Rice Terraces', emoji: '🌾' },
                ].map((dest, i) => (
                  <div key={dest.name} style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    padding: '12px 0',
                    borderBottom: i < 2 ? '1px solid var(--border)' : 'none',
                  }}>
                    <div style={{
                      width: 40,
                      height: 40,
                      borderRadius: 12,
                      background: 'var(--surface)',
                      border: '1px solid var(--border)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 18,
                    }}>{dest.emoji}</div>
                    <span style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: 'var(--paper)',
                    }}>{dest.name}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            {/* Vlogger Hub */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.3 }}
              style={{ gridColumn: 'span 5' }}
              className="card"
            >
              <Link to="/vloggers" style={{
                padding: 24,
                display: 'block',
                textDecoration: 'none',
                color: 'inherit',
                height: '100%',
              }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 14,
                  background: 'rgba(255,97,216,0.1)',
                  border: '1px solid rgba(255,97,216,0.3)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <Video size={24} style={{ color: '#ff61d8' }} />
                </div>
                <h3 style={{
                  fontSize: 18,
                  fontWeight: 700,
                  color: 'var(--paper)',
                  marginBottom: 8,
                }}>Cinematic Presets</h3>
                <p style={{
                  fontSize: 13,
                  color: 'var(--paper-muted)',
                  lineHeight: 1.6,
                }}>
                  Creator LUT packs, pacing guides, and export templates tuned for travel stories.
                </p>
              </Link>
            </motion.div>

            {/* Community Hub */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.4 }}
              style={{ gridColumn: 'span 7' }}
              className="card"
            >
              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                height: '100%',
                minHeight: 280,
              }}>
                <div style={{
                  padding: 24,
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                }}>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: 2,
                    textTransform: 'uppercase',
                    color: 'var(--accent)',
                    marginBottom: 12,
                  }}>COMMUNITY</span>
                  <h3 style={{
                    fontSize: 24,
                    fontWeight: 800,
                    color: 'var(--paper)',
                    marginBottom: 12,
                    lineHeight: 1.2,
                  }}>Join the creative circle</h3>
                  <p style={{
                    fontSize: 13,
                    color: 'var(--paper-muted)',
                    lineHeight: 1.6,
                    marginBottom: 20,
                  }}>
                    Groups, live meetups, and collabs with creators in every time zone.
                  </p>
                  <Link to="/social" className="btn btn-outline" style={{
                    alignSelf: 'flex-start',
                    fontSize: 13,
                    padding: '10px 20px',
                  }}>Enter Social Hub</Link>
                </div>
                <div style={{
                  position: 'relative',
                  minHeight: 240,
                  background: 'linear-gradient(135deg, rgba(123,97,255,0.1), rgba(0,232,135,0.08))',
                  borderRadius: '0 var(--r-md) var(--r-md) 0',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <Globe size={120} style={{ color: 'var(--accent)', opacity: 0.6 }} />
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section style={{
        padding: '80px 0',
        background: 'var(--surface)',
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: 40,
          }}>
            {stats.map(({ value, suffix, label, decimals = 0 }, i) => (
              <motion.div
                key={label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                style={{ textAlign: 'center' }}
              >
                <div style={{
                  fontSize: 'clamp(40px, 6vw, 64px)',
                  fontWeight: 800,
                  color: 'var(--paper)',
                  marginBottom: 8,
                  lineHeight: 1,
                }}>
                  {value.toLocaleString()}{suffix}
                </div>
                <div style={{
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  color: 'var(--paper-dim)',
                }}>{label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="section">
        <div className="container">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            style={{ textAlign: 'center', marginBottom: 64 }}
          >
            <span className="tag" style={{ marginBottom: 16 }}>⚡ Platform Features</span>
            <h2 className="display-heading" style={{
              fontSize: 'clamp(32px, 6vw, 56px)',
              color: 'var(--paper)',
              marginBottom: 16,
            }}>
              Everything you need.<br />All in one place.
            </h2>
            <p style={{
              color: 'var(--paper-muted)',
              fontSize: 16,
              lineHeight: 1.7,
              maxWidth: 600,
              margin: '0 auto',
            }}>
              From AI-powered planning to community-driven buddy matching — TravelBuddy covers every part of your journey.
            </p>
          </motion.div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
            gap: 24,
          }}>
            {features.map((feature, i) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="card"
                style={{ padding: 32, height: '100%' }}
              >
                <div style={{
                  width: 52,
                  height: 52,
                  borderRadius: 16,
                  background: `${feature.color}20`,
                  border: `1px solid ${feature.color}40`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 20,
                }}>
                  <feature.icon size={24} style={{ color: feature.color }} />
                </div>

                <span style={{
                  fontSize: 11,
                  fontWeight: 700,
                  letterSpacing: 2,
                  textTransform: 'uppercase',
                  color: feature.color,
                  marginBottom: 12,
                  display: 'block',
                }}>{feature.badge}</span>

                <h3 style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: 'var(--paper)',
                  marginBottom: 12,
                  lineHeight: 1.3,
                }}>{feature.title}</h3>

                <p style={{
                  color: 'var(--paper-muted)',
                  fontSize: 14,
                  lineHeight: 1.6,
                }}>{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section style={{
        padding: '100px 0',
        background: 'linear-gradient(135deg, var(--ink) 0%, #0f1419 100%)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div className="grid-overlay" style={{ opacity: 0.05 }} />
        <div className="container" style={{ textAlign: 'center' }}>
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <span className="tag" style={{ marginBottom: 20 }}>🚀 Ready to explore?</span>
            <h2 className="display-heading" style={{
              fontSize: 'clamp(36px, 8vw, 72px)',
              color: 'var(--paper)',
              marginBottom: 24,
              lineHeight: 1.1,
            }}>
              Your adventure<br />
              starts <span style={{ color: 'var(--accent)' }}>today.</span>
            </h2>
            <p style={{
              color: 'var(--paper-muted)',
              fontSize: 16,
              lineHeight: 1.7,
              maxWidth: 500,
              margin: '0 auto 40px',
            }}>
              The world is waiting for your story. Join thousands of travelers already planning their next journey.
            </p>

            <div style={{
              display: 'flex',
              gap: 16,
              justifyContent: 'center',
              flexWrap: 'wrap',
            }}>
              <Link
                to="/signup"
                className="btn btn-primary"
                style={{
                  fontSize: 16,
                  padding: '16px 32px',
                  boxShadow: '0 0 40px rgba(129,236,255,0.3)',
                }}
              >
                Get Started Free <ArrowRight size={18} />
              </Link>
              <Link
                to="/explore"
                className="btn btn-outline"
                style={{ fontSize: 16, padding: '16px 28px' }}
              >
                <Compass size={16} /> Explore Destinations
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  )
}
