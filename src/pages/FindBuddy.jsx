import { useEffect, useMemo, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link, useNavigate } from 'react-router-dom'
import { useInView } from 'react-intersection-observer'
import {
  ArrowRight,
  BadgeCheck,
  DollarSign,
  Filter,
  Globe,
  Languages,
  MapPin,
  MessageSquare,
  RefreshCcw,
  Search,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  UserCheck,
  Users,
  CalendarRange,
} from 'lucide-react'
import toast from 'react-hot-toast'

import Footer from '../components/Footer.jsx'
import PageTransition from '../components/PageTransition.jsx'
import AnimatedGlobe from '../components/AnimatedGlobe.jsx'
import LiveBackground from '../components/LiveBackground.jsx'
import useSocket from '../hooks/useSocket.js'
import useBuddyStore from '../store/buddyStore.js'
import api from '../services/api.js'
import {
  BUDDY_PROFILES,
  DEFAULT_BUDDY_PREFS,
  GENDER_OPTIONS,
  GROUP_SIZE_OPTIONS,
  TRAVEL_STYLES,
} from '../data/buddyProfiles.js'

const SORT_OPTIONS = [
  { value: 'compatibility', label: 'Compatibility' },
  { value: 'rating', label: 'Rating' },
  { value: 'trips', label: 'Trips Taken' },
]

const STORAGE_KEYS = {
  activity: 'travelbuddy.buddy.activity.v1',
}

const fieldStyle = {
  width: '100%',
  borderRadius: '14px',
  border: '1px solid var(--border)',
  background: 'rgba(255,255,255,0.03)',
  color: 'var(--paper)',
  padding: '13px 14px',
  fontSize: '14px',
  lineHeight: 1.35,
  transition: 'border-color 0.2s ease, background 0.2s ease, box-shadow 0.2s ease',
  outline: 'none',
}

const heroCardStyle = {
  position: 'relative',
  overflow: 'hidden',
  minHeight: 320,
  borderRadius: 'var(--r-panel)',
  border: '1px solid var(--border)',
  background: 'var(--grad-card)',
  boxShadow: 'var(--shadow-md)',
}

const panelStyle = {
  borderRadius: 'var(--r-panel)',
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  boxShadow: 'var(--shadow-md)',
}

const badgeStyleBase = {
  display: 'inline-flex',
  alignItems: 'center',
  gap: 6,
  borderRadius: 999,
  padding: '4px 10px',
  border: '1px solid var(--border)',
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 0.2,
}

const labelStyle = {
  display: 'block',
  marginBottom: 8,
  color: 'var(--paper-dim)',
  fontSize: 10,
  fontWeight: 800,
  letterSpacing: 1.4,
  textTransform: 'uppercase',
}

const spinnerStyle = {
  width: 14,
  height: 14,
  borderRadius: '50%',
  border: '2px solid rgba(5,11,20,0.2)',
  borderTopColor: 'var(--ink)',
  flexShrink: 0,
}

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function tokenize(value) {
  return normalizeText(value).split(' ').filter(Boolean)
}

function parseNumber(value, fallback) {
  const next = Number(value)
  return Number.isFinite(next) ? next : fallback
}

function seededIncomingRequests() {
  const now = Date.now()
  return BUDDY_PROFILES.slice(1, 4).map((profile, index) => ({
    requestId: `seed-${profile.id}`,
    profileId: profile.id,
    status: 'pending',
    sentAt: now - (index + 1) * 1000 * 60 * 18,
    respondedAt: null,
    source: 'demo-inbox',
  }))
}

function loadActivityState() {
  if (typeof window === 'undefined') {
    return {
      outgoing: {},
      incoming: seededIncomingRequests(),
      connections: [],
    }
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.activity)
    if (!raw) {
      return {
        outgoing: {},
        incoming: seededIncomingRequests(),
        connections: [],
      }
    }

    const parsed = JSON.parse(raw)
    return {
      outgoing: parsed.outgoing || {},
      incoming: Array.isArray(parsed.incoming) && parsed.incoming.length ? parsed.incoming : seededIncomingRequests(),
      connections: Array.isArray(parsed.connections) ? parsed.connections : [],
    }
  } catch {
    return {
      outgoing: {},
      incoming: seededIncomingRequests(),
      connections: [],
    }
  }
}

function describeBudget(min, max) {
  if (!min || !max) return 'Budget not specified'
  return `${Number(min).toLocaleString()} – ${Number(max).toLocaleString()}`
}

function getStatusTone(status) {
  if (status === 'accepted') return 'var(--accent3)'
  if (status === 'declined') return 'var(--accent2)'
  if (status === 'pending') return 'var(--accent5)'
  return 'var(--paper-muted)'
}

function getStatusLabel(status) {
  if (status === 'accepted') return 'Connected'
  if (status === 'declined') return 'Declined'
  if (status === 'pending') return 'Requested'
  return 'Send Request'
}

function scoreProfile(profile, prefs) {
  if (prefs.genderPref && prefs.genderPref !== 'any' && profile.gender !== prefs.genderPref) {
    return null
  }

  let score = 0
  const reasons = []

  const destinationQuery = normalizeText(prefs.destination)
  const profileDestination = normalizeText(profile.destination)
  const profileTags = profile.tags.map(tokenize).flat()
  const destinationTokens = tokenize(destinationQuery)

  if (destinationQuery) {
    if (profileDestination === destinationQuery) {
      score += 20
      reasons.push('Exact destination match')
    } else if (profileDestination.includes(destinationQuery) || destinationQuery.includes(profileDestination)) {
      score += 16
      reasons.push('Same destination region')
    } else {
      const sharedTokens = destinationTokens.filter((token) => profileDestination.includes(token) || profileTags.includes(token))
      if (sharedTokens.length) {
        score += Math.min(14, 8 + sharedTokens.length * 2)
        reasons.push(`${sharedTokens.length} shared destination keyword${sharedTokens.length === 1 ? '' : 's'}`)
      }
    }
  } else {
    score += 6
    reasons.push('Open destination search')
  }

  if (prefs.travelStyleId) {
    if (profile.style === prefs.travelStyleId) {
      score += 18
      reasons.push('Travel style match')
    } else if (profile.style === 'Mixed') {
      score += 8
      reasons.push('Flexible travel style')
    }
  } else {
    score += 6
    reasons.push('No style filter applied')
  }

  const budgetMin = parseNumber(prefs.budgetMin, DEFAULT_BUDDY_PREFS.budgetMin)
  const budgetMax = parseNumber(prefs.budgetMax, DEFAULT_BUDDY_PREFS.budgetMax)
  const overlapMin = Math.max(profile.budgetMin, budgetMin)
  const overlapMax = Math.min(profile.budgetMax, budgetMax)
  const overlap = Math.max(0, overlapMax - overlapMin)
  const prefRange = Math.max(1, budgetMax - budgetMin)
  const overlapRatio = overlap / prefRange

  if (overlapRatio >= 0.9) {
    score += 20
    reasons.push('Strong budget overlap')
  } else if (overlapRatio >= 0.7) {
    score += 14
    reasons.push('Good budget overlap')
  } else if (overlapRatio >= 0.5) {
    score += 8
    reasons.push('Partial budget overlap')
  }

  const ageMin = parseNumber(prefs.ageMin, NaN)
  const ageMax = parseNumber(prefs.ageMax, NaN)
  if (Number.isFinite(ageMin) || Number.isFinite(ageMax)) {
    const lowerBound = Number.isFinite(ageMin) ? ageMin : 18
    const upperBound = Number.isFinite(ageMax) ? ageMax : 80
    if (profile.age >= lowerBound && profile.age <= upperBound) {
      score += 10
      reasons.push('Age preference matched')
    } else if (Math.abs(profile.age - lowerBound) <= 4 || Math.abs(profile.age - upperBound) <= 4) {
      score += 5
      reasons.push('Near your age range')
    }
  }

  if (prefs.groupSize) {
    if (profile.groupSize === prefs.groupSize) {
      score += 8
      reasons.push('Same group size')
    } else if (prefs.groupSize === 'small-group' && profile.groupSize === '1-on-1') {
      score += 4
      reasons.push('Comfortable with a smaller group')
    }
  }

  if (prefs.destination) {
    const keywordOverlap = tokenize(prefs.destination).filter((token) => profileTags.includes(token))
    if (keywordOverlap.length) {
      score += Math.min(10, keywordOverlap.length * 3)
      reasons.push('Shared interest keywords')
    }
  }

  score += (profile.trust / 100) * 12
  score += Math.min(profile.trips, 20) / 20 * 8

  return {
    ...profile,
    compatibilityScore: Math.round(Math.min(100, score)),
    matchReasons: reasons.slice(0, 4),
  }
}

function getRequestStatus(profileId, activity) {
  if (activity.connections.includes(profileId)) return 'accepted'
  if (activity.outgoing[profileId]) return activity.outgoing[profileId].status
  const incoming = activity.incoming.find((request) => request.profileId === profileId)
  if (incoming) return incoming.status
  return 'idle'
}

function MatchScore({ score }) {
  const color = score >= 90 ? 'var(--accent3)' : score >= 80 ? 'var(--accent5)' : score >= 65 ? 'var(--accent)' : 'var(--accent2)'

  return (
    <div style={{ textAlign: 'center', flexShrink: 0 }}>
      <div
        style={{
          width: 62,
          height: 62,
          borderRadius: '50%',
          border: `2px solid ${color}`,
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: `${color}14`,
          boxShadow: `0 0 20px ${color}28`,
        }}
      >
        <span style={{ fontFamily: 'var(--font-display)', fontSize: 18, fontWeight: 900, color, lineHeight: 1 }}>
          {score}
        </span>
        <span style={{ fontSize: 8, color, fontWeight: 800, letterSpacing: 1 }}>MATCH</span>
      </div>
    </div>
  )
}

function PreferenceForm({ form, onChange, onSubmit, onReset, isLoading }) {
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
      <div>
        <label style={labelStyle}>Destination</label>
        <input
          className="input"
          style={fieldStyle}
          placeholder="e.g. Kyoto, Japan"
          value={form.destination}
          onChange={(e) => onChange('destination', e.target.value)}
          required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
        <div>
          <label style={labelStyle}>Start Date</label>
          <input
            className="input"
            style={fieldStyle}
            type="date"
            value={form.startDate}
            onChange={(e) => onChange('startDate', e.target.value)}
            required
          />
        </div>
        <div>
          <label style={labelStyle}>End Date</label>
          <input
            className="input"
            style={fieldStyle}
            type="date"
            value={form.endDate}
            onChange={(e) => onChange('endDate', e.target.value)}
            required
          />
        </div>
      </div>

      <div>
        <label style={labelStyle}>
          Budget Range ({form.currency}) · {Number(form.budgetMin || 0).toLocaleString()} – {Number(form.budgetMax || 0).toLocaleString()}
        </label>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          <input
            className="input"
            style={fieldStyle}
            type="number"
            min="0"
            step="100"
            placeholder="Minimum budget"
            value={form.budgetMin}
            onChange={(e) => onChange('budgetMin', e.target.value)}
          />
          <input
            className="input"
            style={fieldStyle}
            type="number"
            min="0"
            step="100"
            placeholder="Maximum budget"
            value={form.budgetMax}
            onChange={(e) => onChange('budgetMax', e.target.value)}
          />
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 10, flexWrap: 'wrap' }}>
          {['USD', 'PKR'].map((currency) => (
            <button
              key={currency}
              type="button"
              onClick={() => onChange('currency', currency)}
              style={{
                ...badgeStyleBase,
                cursor: 'pointer',
                background: form.currency === currency ? 'rgba(129,236,255,0.12)' : 'rgba(255,255,255,0.03)',
                color: form.currency === currency ? 'var(--accent)' : 'var(--paper-muted)',
                borderColor: form.currency === currency ? 'var(--border-cyan)' : 'var(--border)',
              }}
            >
              {currency}
            </button>
          ))}
        </div>
      </div>

      <div>
        <label style={labelStyle}>Travel Style</label>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {TRAVEL_STYLES.map((style) => (
            <button
              key={style.value}
              type="button"
              onClick={() => onChange('travelStyleId', style.value)}
              style={{
                ...badgeStyleBase,
                cursor: 'pointer',
                background: form.travelStyleId === style.value ? 'rgba(129,236,255,0.14)' : 'rgba(255,255,255,0.03)',
                color: form.travelStyleId === style.value ? 'var(--accent)' : 'var(--paper-muted)',
                borderColor: form.travelStyleId === style.value ? 'var(--border-cyan)' : 'var(--border)',
              }}
            >
              {style.label}
            </button>
          ))}
        </div>
      </div>

      <div>
        <details>
          <summary style={{ ...labelStyle, cursor: 'pointer', listStyle: 'none' }}>Age Preference</summary>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginTop: 10 }}>
            <input
              className="input"
              style={fieldStyle}
              type="number"
              min="18"
              max="90"
              placeholder="Min age"
              value={form.ageMin}
              onChange={(e) => onChange('ageMin', e.target.value)}
            />
            <input
              className="input"
              style={fieldStyle}
              type="number"
              min="18"
              max="90"
              placeholder="Max age"
              value={form.ageMax}
              onChange={(e) => onChange('ageMax', e.target.value)}
            />
          </div>
        </details>
      </div>

      <div>
        <label style={labelStyle}>Gender Preference</label>
        <select
          className="input"
          style={fieldStyle}
          value={form.genderPref}
          onChange={(e) => onChange('genderPref', e.target.value)}
        >
          {GENDER_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label style={labelStyle}>Group Size</label>
        <select
          className="input"
          style={fieldStyle}
          value={form.groupSize}
          onChange={(e) => onChange('groupSize', e.target.value)}
        >
          {GROUP_SIZE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ display: 'flex', gap: 10, marginTop: 4 }}>
        <button
          type="submit"
          className="btn btn-primary"
          disabled={isLoading}
          style={{
            flex: 1,
            justifyContent: 'center',
            padding: '14px 18px',
            fontSize: 14,
            borderRadius: 16,
            boxShadow: 'none',
          }}
        >
          {isLoading ? (
            <>
              <span className="spin" style={spinnerStyle} />
              Running Match Engine...
            </>
          ) : (
            <>
              <Search size={15} />
              Find My Buddy
            </>
          )}
        </button>
        <button
          type="button"
          className="btn btn-surface"
          onClick={onReset}
          style={{
            justifyContent: 'center',
            padding: '14px 16px',
            fontSize: 14,
            borderRadius: 16,
          }}
        >
          <RefreshCcw size={15} />
        </button>
      </div>
    </form>
  )
}

function SortFilterBar({
  sortBy,
  onSortChange,
  styleFilter,
  onStyleFilterChange,
  totalMatches,
  visibleMatches,
}) {
  const filters = ['All', ...TRAVEL_STYLES.map((style) => style.value)]

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap: 14,
        padding: '18px 18px 16px',
        borderRadius: 22,
        border: '1px solid var(--border)',
        background: 'rgba(255,255,255,0.025)',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
            <Sparkles size={16} style={{ color: 'var(--accent)' }} />
            <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 18, fontWeight: 800, color: 'var(--paper)', margin: 0 }}>
              {visibleMatches} Compatible Buddies Found
            </h2>
          </div>
          <p style={{ color: 'var(--paper-dim)', fontSize: 12, margin: 0 }}>
            {totalMatches} total matches before filters · sorted by {SORT_OPTIONS.find((option) => option.value === sortBy)?.label.toLowerCase()}
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <Filter size={14} style={{ color: 'var(--paper-dim)' }} />
          <span style={{ color: 'var(--paper-dim)', fontSize: 12, fontWeight: 700 }}>Sort by</span>
          {SORT_OPTIONS.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onSortChange(option.value)}
              className="btn"
              style={{
                padding: '8px 14px',
                borderRadius: 999,
                fontSize: 12,
                fontWeight: 800,
                border: '1px solid var(--border)',
                background: sortBy === option.value ? 'rgba(129,236,255,0.14)' : 'transparent',
                color: sortBy === option.value ? 'var(--accent)' : 'var(--paper-muted)',
              }}
            >
              {option.label}
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {filters.map((filter) => {
          const active = styleFilter === filter
          return (
            <button
              key={filter}
              type="button"
              onClick={() => onStyleFilterChange(filter)}
              style={{
                ...badgeStyleBase,
                cursor: 'pointer',
                padding: '6px 12px',
                background: active ? 'rgba(129,236,255,0.14)' : 'rgba(255,255,255,0.03)',
                color: active ? 'var(--accent)' : 'var(--paper-muted)',
                borderColor: active ? 'var(--border-cyan)' : 'var(--border)',
              }}
            >
              {filter}
            </button>
          )
        })}
      </div>
    </div>
  )
}

function BuddyCard({ buddy, requestStatus, onSendRequest }) {
  const [ref, inView] = useInView({ threshold: 0.08, triggerOnce: true })
  const color = buddy.style === 'Adventure'
    ? 'var(--accent3)'
    : buddy.style === 'Cultural'
      ? 'var(--accent2)'
      : buddy.style === 'Relaxation'
        ? 'var(--accent4)'
        : buddy.style === 'Foodie'
          ? 'var(--accent5)'
          : 'var(--accent6)'

  const statusTone = getStatusTone(requestStatus)
  const statusLabel = getStatusLabel(requestStatus)
  const isConnected = requestStatus === 'accepted'
  const canRequest = requestStatus === 'idle' || requestStatus === 'declined'

  return (
    <motion.article
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
      transition={{ duration: 0.45 }}
      whileHover={{ y: -4 }}
    >
      <div
        style={{
          ...panelStyle,
          overflow: 'hidden',
          height: '100%',
          transition: 'transform 0.25s ease, box-shadow 0.25s ease, border-color 0.25s ease',
        }}
      >
        <div style={{ height: 4, background: color }} />
        <div style={{ padding: 18, display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <div
                style={{
                  width: 56,
                  height: 56,
                  borderRadius: '50%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  background: `${color}18`,
                  border: `1px solid ${color}35`,
                  fontSize: 28,
                  flexShrink: 0,
                }}
              >
                {buddy.avatar}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800, color: 'var(--paper)', margin: 0 }}>
                    {buddy.name}
                  </h3>
                  {buddy.trust >= 95 && (
                    <span style={{ ...badgeStyleBase, background: 'rgba(52,211,153,0.12)', color: 'var(--accent3)', borderColor: 'rgba(52,211,153,0.25)' }}>
                      <BadgeCheck size={11} />
                      Trusted
                    </span>
                  )}
                </div>
                <p style={{ color: 'var(--paper-dim)', fontSize: 12, margin: '4px 0 6px' }}>
                  Age {buddy.age} · {buddy.nationality}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Star size={12} fill="var(--accent5)" color="var(--accent5)" />
                  <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--paper)' }}>{buddy.rating}</span>
                  <span style={{ color: 'var(--paper-dim)', fontSize: 11 }}>· {buddy.trips} trips</span>
                  <span style={{ color: statusTone, fontSize: 11, fontWeight: 800 }}>
                    · {statusLabel}
                  </span>
                </div>
              </div>
            </div>
            <MatchScore score={buddy.compatibilityScore} />
          </div>

          {(buddy.matchReasons || []).length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(buddy.matchReasons || []).map((reason) => (
                <span
                  key={reason}
                  style={{
                    ...badgeStyleBase,
                    background: 'rgba(255,255,255,0.03)',
                    color: 'var(--paper-muted)',
                    padding: '5px 10px',
                  }}
                >
                  {reason}
                </span>
              ))}
            </div>
          )}

          <p style={{ color: 'var(--paper-muted)', fontSize: 13, lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
            “{buddy.bio}”
          </p>

          <div style={{ display: 'grid', gap: 8 }}>
            <InfoRow icon={MapPin} label="Destination" value={buddy.destination} color="var(--accent)" />
            <InfoRow icon={CalendarRange} label="Dates" value={buddy.dates} color="var(--accent4)" />
            <InfoRow icon={DollarSign} label="Budget" value={describeBudget(buddy.budgetMin, buddy.budgetMax)} color="var(--accent3)" />
            <InfoRow icon={Users} label="Style" value={buddy.style} color={color} />
            <InfoRow icon={Languages} label="Languages" value={(buddy.languages || []).join(', ')} color="var(--accent6)" />
          </div>

          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {(buddy.badges || []).map((badge) => (
              <span
                key={badge}
                style={{
                  ...badgeStyleBase,
                  background: 'rgba(255,255,255,0.03)',
                  color: 'var(--paper-muted)',
                  padding: '4px 10px',
                }}
              >
                {badge}
              </span>
            ))}
          </div>

          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Link
              to={`/profile/${buddy.id}`}
              className="btn btn-surface"
              style={{
                flex: 1,
                justifyContent: 'center',
                padding: '11px 14px',
                fontSize: 13,
                borderRadius: 14,
              }}
            >
              View Profile
            </Link>
            <button
              type="button"
              onClick={() => onSendRequest(buddy)}
              className="btn btn-primary"
              disabled={!canRequest}
              style={{
                flex: 1,
                justifyContent: 'center',
                padding: '11px 14px',
                fontSize: 13,
                borderRadius: 14,
                opacity: canRequest ? 1 : 0.7,
              }}
            >
              {isConnected ? (
                <>
                  <ShieldCheck size={15} />
                  Connected
                </>
              ) : (
                <>
                  <Send size={15} />
                  {statusLabel}
                </>
              )}
            </button>
          </div>

          <Link
            to="/messages"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              justifyContent: 'center',
              color: 'var(--paper-dim)',
              fontSize: 12,
              fontWeight: 700,
              paddingTop: 2,
            }}
          >
            <MessageSquare size={14} />
            Open Messages
          </Link>
        </div>
      </div>
    </motion.article>
  )
}

function InfoRow({ icon: Icon, label, value, color }) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        gap: 10,
        padding: '10px 12px',
        borderRadius: 14,
        border: '1px solid var(--border)',
        background: 'rgba(255,255,255,0.025)',
      }}
    >
      <div
        style={{
          width: 24,
          height: 24,
          borderRadius: 8,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          background: `${color}18`,
          border: `1px solid ${color}24`,
        }}
      >
        <Icon size={12} color={color} />
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{ color: 'var(--paper-dim)', fontSize: 10, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase' }}>
          {label}
        </div>
        <div style={{ color: 'var(--paper)', fontSize: 13, fontWeight: 600, lineHeight: 1.5 }}>
          {value}
        </div>
      </div>
    </div>
  )
}

function RequestActivity({ activity, profilesById, onAcceptIncoming, onDeclineIncoming, onClearOutgoing }) {
  const outgoingItems = Object.entries(activity.outgoing).map(([profileId, request]) => ({
    profileId: Number(profileId),
    ...request,
  }))
  const incomingItems = activity.incoming

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div
        style={{
          ...panelStyle,
          padding: 18,
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
          <div>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800, color: 'var(--paper)' }}>
              Request Activity
            </h3>
            <p style={{ margin: '4px 0 0', color: 'var(--paper-dim)', fontSize: 12 }}>
              Outgoing request tracker plus a demo inbox you can accept or decline.
            </p>
          </div>
          <span
            style={{
              ...badgeStyleBase,
              background: 'rgba(129,236,255,0.12)',
              color: 'var(--accent)',
              borderColor: 'var(--border-cyan)',
            }}
          >
            <Users size={11} />
            {activity.connections.length} connections
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, minmax(0, 1fr))', gap: 10 }}>
          <StatPill label="Outgoing" value={outgoingItems.length} />
          <StatPill label="Incoming" value={incomingItems.length} />
          <StatPill label="Connected" value={activity.connections.length} accent="var(--accent3)" />
        </div>
      </div>

      <div
        style={{
          ...panelStyle,
          padding: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <ShieldCheck size={15} style={{ color: 'var(--accent3)' }} />
          <h4 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 800, color: 'var(--paper)' }}>
            Incoming Demo Requests
          </h4>
        </div>

        <div style={{ display: 'grid', gap: 10 }}>
          {incomingItems.map((request) => {
            const profile = profilesById[request.profileId]
            if (!profile) return null

            const tone = getStatusTone(request.status)
            return (
              <div
                key={request.requestId}
                style={{
                  borderRadius: 16,
                  border: '1px solid var(--border)',
                  background: 'rgba(255,255,255,0.025)',
                  padding: 14,
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <div
                        style={{
                          width: 30,
                          height: 30,
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          background: 'rgba(255,255,255,0.05)',
                          border: '1px solid var(--border)',
                          fontSize: 16,
                          flexShrink: 0,
                        }}
                      >
                        {profile.avatar}
                      </div>
                      <div>
                        <div style={{ color: 'var(--paper)', fontSize: 14, fontWeight: 800 }}>{profile.name}</div>
                        <div style={{ color: 'var(--paper-dim)', fontSize: 11 }}>
                          from {profile.destination}
                        </div>
                      </div>
                    </div>
                    <p style={{ color: 'var(--paper-muted)', fontSize: 12, margin: '10px 0 0', lineHeight: 1.6 }}>
                      {profile.bio}
                    </p>
                  </div>
                  <span
                    style={{
                      ...badgeStyleBase,
                      background: `${tone}14`,
                      color: tone,
                      borderColor: `${tone}30`,
                      whiteSpace: 'nowrap',
                    }}
                  >
                    {getStatusLabel(request.status)}
                  </span>
                </div>

                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => onAcceptIncoming(request.requestId)}
                    disabled={request.status !== 'pending'}
                    style={{
                      padding: '9px 12px',
                      fontSize: 12,
                      borderRadius: 14,
                      opacity: request.status === 'pending' ? 1 : 0.65,
                    }}
                  >
                    <UserCheck size={14} />
                    Accept
                  </button>
                  <button
                    type="button"
                    className="btn btn-surface"
                    onClick={() => onDeclineIncoming(request.requestId)}
                    disabled={request.status !== 'pending'}
                    style={{
                      padding: '9px 12px',
                      fontSize: 12,
                      borderRadius: 14,
                      opacity: request.status === 'pending' ? 1 : 0.65,
                    }}
                  >
                    Decline
                  </button>
                  <Link
                    to="/messages"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: 6,
                      color: 'var(--paper-dim)',
                      fontSize: 12,
                      fontWeight: 700,
                      padding: '9px 0',
                    }}
                  >
                    <MessageSquare size={13} />
                    Open Chat
                  </Link>
                </div>
              </div>
            )
          })}
        </div>
      </div>

      <div
        style={{
          ...panelStyle,
          padding: 18,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Send size={15} style={{ color: 'var(--accent)' }} />
          <h4 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 800, color: 'var(--paper)' }}>
            Sent Requests
          </h4>
        </div>

        {outgoingItems.length ? (
          <div style={{ display: 'grid', gap: 10 }}>
            {outgoingItems.map((request) => {
              const profile = profilesById[request.profileId]
              if (!profile) return null

              const tone = getStatusTone(request.status)
              return (
                <div
                  key={request.profileId}
                  style={{
                    borderRadius: 16,
                    border: '1px solid var(--border)',
                    background: 'rgba(255,255,255,0.025)',
                    padding: 14,
                    display: 'flex',
                    justifyContent: 'space-between',
                    gap: 12,
                    alignItems: 'center',
                  }}
                >
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: 'var(--paper)', fontSize: 14, fontWeight: 800 }}>{profile.name}</div>
                    <div style={{ color: 'var(--paper-dim)', fontSize: 11 }}>
                      Request sent · {profile.destination}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span
                      style={{
                        ...badgeStyleBase,
                        background: `${tone}14`,
                        color: tone,
                        borderColor: `${tone}30`,
                      }}
                    >
                      {getStatusLabel(request.status)}
                    </span>
                    <button
                      type="button"
                      onClick={() => onClearOutgoing(request.profileId)}
                      style={{
                        background: 'transparent',
                        border: 'none',
                        color: 'var(--paper-dim)',
                        fontSize: 12,
                        fontWeight: 700,
                        cursor: 'pointer',
                      }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        ) : (
          <p style={{ margin: 0, color: 'var(--paper-dim)', fontSize: 12, lineHeight: 1.7 }}>
            Requests you send from the buddy cards will show up here for easy tracking.
          </p>
        )}
      </div>
    </div>
  )
}

function StatPill({ label, value, accent = 'var(--accent)' }) {
  return (
    <div
      style={{
        borderRadius: 16,
        padding: '12px 14px',
        border: '1px solid var(--border)',
        background: 'rgba(255,255,255,0.025)',
      }}
    >
      <div style={{ color: 'var(--paper-dim)', fontSize: 10, fontWeight: 800, letterSpacing: 1.2, textTransform: 'uppercase' }}>
        {label}
      </div>
      <div style={{ color: accent, fontSize: 20, fontWeight: 900, lineHeight: 1.1, marginTop: 4 }}>
        {value}
      </div>
    </div>
  )
}

function ResultsFeed({
  matches,
  visibleMatches,
  sortBy,
  styleFilter,
  onSortChange,
  onStyleFilterChange,
  requestActivity,
  onSendRequest,
  onAcceptIncoming,
  onDeclineIncoming,
  onClearOutgoing,
  profilesById,
}) {
  return (
    <div style={{ display: 'grid', gap: 18 }}>
      <SortFilterBar
        sortBy={sortBy}
        onSortChange={onSortChange}
        styleFilter={styleFilter}
        onStyleFilterChange={onStyleFilterChange}
        totalMatches={matches.length}
        visibleMatches={visibleMatches.length}
      />

      <AnimatePresence mode="wait">
        {visibleMatches.length ? (
          <motion.div
            key="results-grid"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.25 }}
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(290px, 1fr))',
              gap: 16,
            }}
          >
            {visibleMatches.map((buddy, index) => {
              const buddyId = buddy.id || buddy.UserID || `buddy-${index}`
              return (
              <BuddyCard
                key={buddyId}
                buddy={buddy}
                requestStatus={getRequestStatus(buddyId, requestActivity)}
                onSendRequest={onSendRequest}
              />
            )
            })}
          </motion.div>
        ) : (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            style={{
              ...panelStyle,
              padding: '30px 24px',
              textAlign: 'center',
            }}
          >
            <div
              style={{
                width: 84,
                height: 84,
                borderRadius: '50%',
                margin: '0 auto 18px',
                background: 'rgba(129,236,255,0.08)',
                border: '1px solid rgba(129,236,255,0.18)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 36,
              }}
            >
              🤝
            </div>
            <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 20, fontWeight: 800, color: 'var(--paper)', margin: '0 0 10px' }}>
              No buddies matched your current filters
            </h3>
            <p style={{ maxWidth: 440, margin: '0 auto', color: 'var(--paper-muted)', fontSize: 14, lineHeight: 1.8 }}>
              Loosen your destination, style, gender, or budget filters to surface more compatible travelers.
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      <RequestActivity
        activity={requestActivity}
        profilesById={profilesById}
        onAcceptIncoming={onAcceptIncoming}
        onDeclineIncoming={onDeclineIncoming}
        onClearOutgoing={onClearOutgoing}
      />
    </div>
  )
}

export default function FindBuddy() {
  const navigate = useNavigate()
  const socket = useSocket() // Activate real-time buddy notifications
  const [form, setForm] = useState(DEFAULT_BUDDY_PREFS)
  const [searching, setSearching] = useState(false)
  const [showResults, setShowResults] = useState(false)
  const [matches, setMatches] = useState([])
  const [sortBy, setSortBy] = useState('compatibility')
  const [styleFilter, setStyleFilter] = useState('All')
  const [activity, setActivity] = useState(() => loadActivityState())
  const searchTimerRef = useRef(null)
  const [useApi, setUseApi] = useState(true) // try API first, fallback to local

  const profilesById = useMemo(
    () => Object.fromEntries(BUDDY_PROFILES.map((profile) => [profile.id, profile])),
    [],
  )

  useEffect(() => {
    if (typeof window === 'undefined') return
    window.localStorage.setItem(STORAGE_KEYS.activity, JSON.stringify(activity))
  }, [activity])

  useEffect(() => {
    return () => {
      if (searchTimerRef.current) {
        window.clearTimeout(searchTimerRef.current)
      }
    }
  }, [])

  const visibleMatches = useMemo(() => {
    const filtered = matches.filter((buddy) => styleFilter === 'All' || buddy.style === styleFilter)

    const sorted = [...filtered].sort((a, b) => {
      if (sortBy === 'rating') return b.rating - a.rating
      if (sortBy === 'trips') return b.trips - a.trips
      return b.compatibilityScore - a.compatibilityScore
    })

    return sorted
  }, [matches, sortBy, styleFilter])

  const handleFormChange = (key, value) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSearch = async (event) => {
    event.preventDefault()
    setSearching(true)

    if (searchTimerRef.current) {
      window.clearTimeout(searchTimerRef.current)
    }

    // Try API-based matching first
    if (useApi) {
      try {
        const { data } = await api.post('/buddy/match', form)
        if (data.matches && data.matches.length >= 0) {
          setMatches(data.matches)
          setShowResults(true)
          setSearching(false)
          toast.success(
            data.matches.length
              ? `${data.matches.length} compatible buddies found (live)`
              : 'No matches found for this search',
          )
          return
        }
      } catch (err) {
        // API unavailable — fall through to local scoring
        console.info('API unavailable, using local matching engine:', err.message)
        setUseApi(false)
      }
    }

    // Fallback: local scoring engine
    searchTimerRef.current = window.setTimeout(() => {
      const evaluated = BUDDY_PROFILES
        .map((profile) => scoreProfile(profile, form))
        .filter(Boolean)
        .sort((a, b) => b.compatibilityScore - a.compatibilityScore)

      setMatches(evaluated)
      setShowResults(true)
      setSearching(false)

      toast.success(
        evaluated.length
          ? `${evaluated.length} compatible buddies found`
          : 'No matches found for this search',
      )
    }, 360)
  }

  const handleReset = () => {
    setForm(DEFAULT_BUDDY_PREFS)
    setMatches([])
    setShowResults(false)
    setSortBy('compatibility')
    setStyleFilter('All')
    toast('Filters reset', { icon: '↺' })
  }

  const handleSendRequest = async (buddy) => {
    const buddyId = buddy.id || buddy.UserID

    // Try API first (non-blocking — always update local state)
    if (useApi) {
      try {
        await api.post('/buddy/request', { receiverId: buddyId })
      } catch (err) {
        // API unavailable — local-only mode, no error shown
      }
    }

    setActivity((prev) => {
      const existing = prev.outgoing[buddyId]
      if (existing?.status === 'pending' || prev.connections.includes(buddyId)) {
        return prev
      }

      return {
        ...prev,
        outgoing: {
          ...prev.outgoing,
          [buddyId]: {
            status: 'pending',
            sentAt: Date.now(),
            respondedAt: null,
          },
        },
      }
    })

    toast.success(`Request sent to ${buddy.name || buddy.DisplayName}`)
  }

  const handleAcceptIncoming = (requestId) => {
    const request = activity.incoming.find((item) => item.requestId === requestId)
    if (!request) return

    const profile = profilesById[request.profileId]
    setActivity((prev) => ({
      ...prev,
      incoming: prev.incoming.map((item) =>
        item.requestId === requestId
          ? { ...item, status: 'accepted', respondedAt: Date.now() }
          : item,
      ),
      outgoing: {
        ...prev.outgoing,
        [request.profileId]: {
          status: 'accepted',
          sentAt: prev.outgoing[request.profileId]?.sentAt || request.sentAt,
          respondedAt: Date.now(),
        },
      },
      connections: prev.connections.includes(request.profileId)
        ? prev.connections
        : [...prev.connections, request.profileId],
    }))

    toast.success(`${profile?.name || 'Traveler'} is now connected`)
  }

  const handleDeclineIncoming = (requestId) => {
    const request = activity.incoming.find((item) => item.requestId === requestId)
    if (!request) return

    const profile = profilesById[request.profileId]
    setActivity((prev) => ({
      ...prev,
      incoming: prev.incoming.map((item) =>
        item.requestId === requestId
          ? { ...item, status: 'declined', respondedAt: Date.now() }
          : item,
      ),
    }))

    toast(`Declined request from ${profile?.name || 'traveler'}`, { icon: '✕' })
  }

  const handleClearOutgoing = (profileId) => {
    setActivity((prev) => {
      const nextOutgoing = { ...prev.outgoing }
      delete nextOutgoing[profileId]
      return { ...prev, outgoing: nextOutgoing }
    })
  }

  return (
    <PageTransition>
      <div style={{ minHeight: '100vh', background: 'var(--ink)' }}>
        <section style={{ position: 'relative', padding: 'clamp(84px, 10vw, 132px) 0 56px', overflow: 'hidden' }}>
          <div className="grid-overlay" />
          <div
            style={{
              position: 'absolute',
              inset: 'auto -8% -12% auto',
              width: 420,
              height: 420,
              borderRadius: '50%',
              background: 'radial-gradient(circle, rgba(129,236,255,0.10) 0%, transparent 68%)',
              filter: 'blur(24px)',
              pointerEvents: 'none',
            }}
          />
          <div className="container" style={{ position: 'relative', zIndex: 1 }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1.05fr) minmax(320px, 0.95fr)',
                gap: 24,
                alignItems: 'center',
              }}
            >
              <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}>
                <p className="tag" style={{ marginBottom: 10 }}>
                  🤝 Buddy Matching
                </p>
                <h1
                  className="display-heading"
                  style={{
                    fontSize: 'clamp(38px, 6.4vw, 76px)',
                    color: 'var(--paper)',
                    margin: 0,
                  }}
                >
                  Find Your Perfect
                  <br />
                  <span style={{ color: 'var(--accent)' }}>Travel Companion</span>
                </h1>
                <p
                  style={{
                    color: 'var(--paper-muted)',
                    fontSize: 16,
                    maxWidth: 560,
                    lineHeight: 1.85,
                    margin: '18px 0 0',
                  }}
                >
                  Search compatible travelers by destination, dates, budget, travel style, age, gender, and group preference.
                  The compatibility engine ranks the best matches first and keeps your requests organized locally for this build.
                </p>

                <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap', marginTop: 24 }}>
                  {[
                    { label: 'Compatibility ranking', tone: 'var(--accent)' },
                    { label: 'Request tracking', tone: 'var(--accent3)' },
                    { label: 'Desktop & mobile friendly', tone: 'var(--accent5)' },
                  ].map((item) => (
                    <span
                      key={item.label}
                      style={{
                        ...badgeStyleBase,
                        background: `${item.tone}14`,
                        color: item.tone,
                        borderColor: `${item.tone}28`,
                      }}
                    >
                      <Sparkles size={11} />
                      {item.label}
                    </span>
                  ))}
                </div>
              </motion.div>

              <motion.div
                className="hide-mobile"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.45 }}
              >
                <div style={heroCardStyle}>
                  <div style={{ position: 'absolute', inset: 0, opacity: 0.45 }}>
                    <LiveBackground />
                  </div>
                  <div style={{ position: 'relative', zIndex: 1, height: '100%', padding: 18 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <Globe size={16} style={{ color: 'var(--accent)' }} />
                        <span style={{ color: 'var(--paper)', fontSize: 13, fontWeight: 800 }}>Search Horizon</span>
                      </div>
                      <span style={{ ...badgeStyleBase, background: 'rgba(255,255,255,0.03)', color: 'var(--paper-dim)' }}>
                        Live preview
                      </span>
                    </div>

                    <div style={{ height: 'calc(100% - 44px)', display: 'grid', gridTemplateRows: '1fr auto', gap: 14 }}>
                      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 220 }}>
                        <div style={{ width: '100%', maxWidth: 420 }}>
                          <AnimatedGlobe />
                        </div>
                      </div>

                      <div
                        style={{
                          borderRadius: 18,
                          border: '1px solid var(--border)',
                          background: 'rgba(12,14,17,0.62)',
                          padding: 14,
                          display: 'flex',
                          justifyContent: 'space-between',
                          gap: 12,
                          alignItems: 'center',
                        }}
                      >
                        <div>
                          <div style={{ color: 'var(--paper)', fontSize: 13, fontWeight: 800 }}>Real-time match signals</div>
                          <div style={{ color: 'var(--paper-dim)', fontSize: 12, marginTop: 3 }}>
                            Buddies scored against your current trip profile
                          </div>
                        </div>
                        <div style={{ textAlign: 'right' }}>
                          <div style={{ color: 'var(--accent)', fontSize: 20, fontWeight: 900 }}>
                            {matches.length || BUDDY_PROFILES.length}
                          </div>
                          <div style={{ color: 'var(--paper-dim)', fontSize: 11 }}>profiles available</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        <section style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', background: 'var(--surface2)' }}>
          <div
            className="container"
            style={{
              paddingTop: 24,
              paddingBottom: 24,
              display: 'grid',
              gridTemplateColumns: 'minmax(300px, 340px) minmax(0, 1fr)',
              gap: 24,
              alignItems: 'start',
            }}
          >
            <motion.div
              initial={{ opacity: 0, x: -12 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.35 }}
              style={{
                ...panelStyle,
                padding: 20,
                position: 'sticky',
                top: 92,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 18 }}>
                <Search size={16} style={{ color: 'var(--accent)' }} />
                <h2 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800, color: 'var(--paper)', margin: 0 }}>
                  Enter Your Preferences
                </h2>
              </div>

              <PreferenceForm
                form={form}
                onChange={handleFormChange}
                onSubmit={handleSearch}
                onReset={handleReset}
                isLoading={searching}
              />
            </motion.div>

            <div style={{ minWidth: 0 }}>
              <AnimatePresence mode="wait">
                {showResults ? (
                  <motion.div
                    key="results"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    style={{ display: 'grid', gap: 18 }}
                  >
                    <ResultsFeed
                      matches={matches}
                      visibleMatches={visibleMatches}
                      sortBy={sortBy}
                      styleFilter={styleFilter}
                      onSortChange={setSortBy}
                      onStyleFilterChange={setStyleFilter}
                      requestActivity={activity}
                      onSendRequest={handleSendRequest}
                      onAcceptIncoming={handleAcceptIncoming}
                      onDeclineIncoming={handleDeclineIncoming}
                      onClearOutgoing={handleClearOutgoing}
                      profilesById={profilesById}
                    />
                  </motion.div>
                ) : (
                  <motion.div
                    key="empty"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -8 }}
                    transition={{ duration: 0.3 }}
                    style={{
                      ...panelStyle,
                      minHeight: 520,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      padding: 24,
                      textAlign: 'center',
                    }}
                  >
                    <div
                      style={{
                        width: 86,
                        height: 86,
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        marginBottom: 20,
                        background: 'rgba(129,236,255,0.08)',
                        border: '1px solid rgba(129,236,255,0.2)',
                        fontSize: 34,
                      }}
                    >
                      🤝
                    </div>
                    <h2 style={{ margin: '0 0 10px', fontFamily: 'var(--font-heading)', fontSize: 22, fontWeight: 800, color: 'var(--paper)' }}>
                      Fill in your preferences to start matching
                    </h2>
                    <p style={{ maxWidth: 480, color: 'var(--paper-muted)', fontSize: 14, lineHeight: 1.8, margin: 0 }}>
                      Use the form on the left to rank compatible travel buddies by destination, travel style, budget, age, and group preference.
                      Your results, requests, and demo inbox stay local to this browser session.
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </section>

        <Footer />

        <div className="hide-desktop" style={{ height: 10 }} />
      </div>
    </PageTransition>
  )
}
