import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  BadgeCheck, CalendarRange, DollarSign, Languages,
  MapPin, MessageSquare, Send, ShieldCheck, Star, Users,
} from 'lucide-react';

const panelStyle = {
  borderRadius: 'var(--r-panel)',
  border: '1px solid var(--border)',
  background: 'var(--surface)',
  boxShadow: 'var(--shadow-md)',
};

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
};

function getStatusTone(status) {
  if (status === 'accepted') return 'var(--accent3)';
  if (status === 'declined') return 'var(--accent2)';
  if (status === 'pending') return 'var(--accent5)';
  return 'var(--paper-muted)';
}

function getStatusLabel(status) {
  if (status === 'accepted') return 'Connected';
  if (status === 'declined') return 'Declined';
  if (status === 'pending') return 'Requested';
  return 'Send Request';
}

function describeBudget(min, max) {
  return `${min.toLocaleString()} – ${max.toLocaleString()}`;
}

function MatchScore({ score }) {
  const color = score >= 90 ? 'var(--accent3)' : score >= 80 ? 'var(--accent5)' : score >= 65 ? 'var(--accent)' : 'var(--accent2)';
  return (
    <div style={{ textAlign: 'center', flexShrink: 0 }}>
      <div
        style={{
          width: 62, height: 62, borderRadius: '50%',
          border: `2px solid ${color}`,
          display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center',
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
  );
}

function InfoRow({ icon: Icon, label, value, color }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 10,
        padding: '10px 12px', borderRadius: 14,
        border: '1px solid var(--border)', background: 'rgba(255,255,255,0.025)',
      }}
    >
      <div
        style={{
          width: 24, height: 24, borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          flexShrink: 0, background: `${color}18`, border: `1px solid ${color}24`,
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
  );
}

/**
 * BuddyCard — Displays a matched traveler profile card.
 * Shows compatibility score, avatar, name, bio, trust stars,
 * trip details, and action buttons (View Profile / Send Request).
 */
export default function BuddyCard({ buddy, requestStatus = 'idle', onSendRequest }) {
  const color = buddy.style === 'Adventure'
    ? 'var(--accent3)'
    : buddy.style === 'Cultural'
      ? 'var(--accent2)'
      : buddy.style === 'Relaxation'
        ? 'var(--accent4)'
        : buddy.style === 'Foodie'
          ? 'var(--accent5)'
          : 'var(--accent6)';

  const statusTone = getStatusTone(requestStatus);
  const statusLabel = getStatusLabel(requestStatus);
  const isConnected = requestStatus === 'accepted';
  const canRequest = requestStatus === 'idle' || requestStatus === 'declined';

  return (
    <motion.article
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
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
          {/* Header: Avatar + Match Score */}
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
              <div
                style={{
                  width: 56, height: 56, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${color}18`, border: `1px solid ${color}35`,
                  fontSize: 28, flexShrink: 0,
                }}
              >
                {buddy.avatar || buddy.AvatarURL || '🌍'}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800, color: 'var(--paper)', margin: 0 }}>
                    {buddy.name || buddy.DisplayName}
                  </h3>
                  {(buddy.trust >= 95 || buddy.TrustScore >= 4.5) && (
                    <span style={{ ...badgeStyleBase, background: 'rgba(52,211,153,0.12)', color: 'var(--accent3)', borderColor: 'rgba(52,211,153,0.25)' }}>
                      <BadgeCheck size={11} />
                      Trusted
                    </span>
                  )}
                </div>
                <p style={{ color: 'var(--paper-dim)', fontSize: 12, margin: '4px 0 6px' }}>
                  {buddy.age ? `Age ${buddy.age} · ` : ''}{buddy.nationality || ''}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <Star size={12} fill="var(--accent5)" color="var(--accent5)" />
                  <span style={{ fontSize: 12, fontWeight: 800, color: 'var(--paper)' }}>{buddy.rating || buddy.TrustScore || 0}</span>
                  <span style={{ color: 'var(--paper-dim)', fontSize: 11 }}>· {buddy.trips || buddy.TripsCompleted || 0} trips</span>
                  <span style={{ color: statusTone, fontSize: 11, fontWeight: 800 }}>
                    · {statusLabel}
                  </span>
                </div>
              </div>
            </div>
            <MatchScore score={buddy.compatibilityScore} />
          </div>

          {/* Match Reasons */}
          {buddy.matchReasons?.length > 0 && (
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {buddy.matchReasons.map((reason) => (
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

          {/* Bio */}
          <p style={{ color: 'var(--paper-muted)', fontSize: 13, lineHeight: 1.7, margin: 0, fontStyle: 'italic' }}>
            "{buddy.bio || buddy.BioText || ''}"
          </p>

          {/* Detail rows */}
          <div style={{ display: 'grid', gap: 8 }}>
            {buddy.destination && (
              <InfoRow icon={MapPin} label="Destination" value={buddy.destination} color="var(--accent)" />
            )}
            {buddy.dates && (
              <InfoRow icon={CalendarRange} label="Dates" value={buddy.dates} color="var(--accent4)" />
            )}
            <InfoRow
              icon={DollarSign}
              label="Budget"
              value={describeBudget(buddy.budgetMin || buddy.BudgetMin || 0, buddy.budgetMax || buddy.BudgetMax || 0)}
              color="var(--accent3)"
            />
            <InfoRow icon={Users} label="Style" value={buddy.style || 'Mixed'} color={color} />
            {buddy.languages && (
              <InfoRow icon={Languages} label="Languages" value={buddy.languages.join(', ')} color="var(--accent6)" />
            )}
          </div>

          {/* Badges */}
          {buddy.badges?.length > 0 && (
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {buddy.badges.map((badge) => (
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
          )}

          {/* Actions */}
          <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
            <Link
              to={`/profile/${buddy.id || buddy.UserID}`}
              className="btn btn-surface"
              style={{
                flex: 1, justifyContent: 'center',
                padding: '11px 14px', fontSize: 13, borderRadius: 14,
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
                flex: 1, justifyContent: 'center',
                padding: '11px 14px', fontSize: 13, borderRadius: 14,
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
              display: 'flex', alignItems: 'center', gap: 8,
              justifyContent: 'center', color: 'var(--paper-dim)',
              fontSize: 12, fontWeight: 700, paddingTop: 2,
            }}
          >
            <MessageSquare size={14} />
            Open Messages
          </Link>
        </div>
      </div>
    </motion.article>
  );
}
