import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  MessageSquare, Send, ShieldCheck, Sparkles, UserCheck, Users,
} from 'lucide-react';

import BuddyCard from './BuddyCard';
import SortFilterBar from './SortFilterBar';

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

function getRequestStatus(profileId, activity) {
  if (activity.connections.includes(profileId)) return 'accepted';
  if (activity.outgoing[profileId]) return activity.outgoing[profileId].status;
  const incoming = activity.incoming.find((request) => request.profileId === profileId);
  if (incoming) return incoming.status;
  return 'idle';
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
  );
}

function RequestActivity({ activity, profilesById, onAcceptIncoming, onDeclineIncoming, onClearOutgoing }) {
  const outgoingItems = Object.entries(activity.outgoing).map(([profileId, request]) => ({
    profileId: Number(profileId),
    ...request,
  }));
  const incomingItems = activity.incoming;

  return (
    <div style={{ display: 'grid', gap: 16 }}>
      <div style={{ ...panelStyle, padding: 18 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap', marginBottom: 14 }}>
          <div>
            <h3 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 16, fontWeight: 800, color: 'var(--paper)' }}>
              Request Activity
            </h3>
            <p style={{ margin: '4px 0 0', color: 'var(--paper-dim)', fontSize: 12 }}>
              Outgoing request tracker plus a demo inbox you can accept or decline.
            </p>
          </div>
          <span style={{ ...badgeStyleBase, background: 'rgba(129,236,255,0.12)', color: 'var(--accent)', borderColor: 'var(--border-cyan)' }}>
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

      {/* Incoming Requests */}
      <div style={{ ...panelStyle, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <ShieldCheck size={15} style={{ color: 'var(--accent3)' }} />
          <h4 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 800, color: 'var(--paper)' }}>
            Incoming Requests
          </h4>
        </div>
        <div style={{ display: 'grid', gap: 10 }}>
          {incomingItems.map((request) => {
            const profile = profilesById[request.profileId];
            if (!profile) return null;
            const tone = getStatusTone(request.status);
            return (
              <div key={request.requestId} style={{ borderRadius: 16, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.025)', padding: 14 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'flex-start' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                      <div style={{ width: 30, height: 30, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--border)', fontSize: 16, flexShrink: 0 }}>
                        {profile.avatar}
                      </div>
                      <div>
                        <div style={{ color: 'var(--paper)', fontSize: 14, fontWeight: 800 }}>{profile.name}</div>
                        <div style={{ color: 'var(--paper-dim)', fontSize: 11 }}>from {profile.destination}</div>
                      </div>
                    </div>
                    <p style={{ color: 'var(--paper-muted)', fontSize: 12, margin: '10px 0 0', lineHeight: 1.6 }}>
                      {profile.bio}
                    </p>
                  </div>
                  <span style={{ ...badgeStyleBase, background: `${tone}14`, color: tone, borderColor: `${tone}30`, whiteSpace: 'nowrap' }}>
                    {getStatusLabel(request.status)}
                  </span>
                </div>
                <div style={{ display: 'flex', gap: 8, marginTop: 12, flexWrap: 'wrap' }}>
                  <button type="button" className="btn btn-primary" onClick={() => onAcceptIncoming(request.requestId)} disabled={request.status !== 'pending'} style={{ padding: '9px 12px', fontSize: 12, borderRadius: 14, opacity: request.status === 'pending' ? 1 : 0.65 }}>
                    <UserCheck size={14} /> Accept
                  </button>
                  <button type="button" className="btn btn-surface" onClick={() => onDeclineIncoming(request.requestId)} disabled={request.status !== 'pending'} style={{ padding: '9px 12px', fontSize: 12, borderRadius: 14, opacity: request.status === 'pending' ? 1 : 0.65 }}>
                    Decline
                  </button>
                  <Link to="/messages" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, color: 'var(--paper-dim)', fontSize: 12, fontWeight: 700, padding: '9px 0' }}>
                    <MessageSquare size={13} /> Open Chat
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Outgoing Requests */}
      <div style={{ ...panelStyle, padding: 18 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
          <Send size={15} style={{ color: 'var(--accent)' }} />
          <h4 style={{ margin: 0, fontFamily: 'var(--font-heading)', fontSize: 14, fontWeight: 800, color: 'var(--paper)' }}>
            Sent Requests
          </h4>
        </div>
        {outgoingItems.length ? (
          <div style={{ display: 'grid', gap: 10 }}>
            {outgoingItems.map((request) => {
              const profile = profilesById[request.profileId];
              if (!profile) return null;
              const tone = getStatusTone(request.status);
              return (
                <div key={request.profileId} style={{ borderRadius: 16, border: '1px solid var(--border)', background: 'rgba(255,255,255,0.025)', padding: 14, display: 'flex', justifyContent: 'space-between', gap: 12, alignItems: 'center' }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ color: 'var(--paper)', fontSize: 14, fontWeight: 800 }}>{profile.name}</div>
                    <div style={{ color: 'var(--paper-dim)', fontSize: 11 }}>Request sent · {profile.destination}</div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <span style={{ ...badgeStyleBase, background: `${tone}14`, color: tone, borderColor: `${tone}30` }}>
                      {getStatusLabel(request.status)}
                    </span>
                    <button type="button" onClick={() => onClearOutgoing(request.profileId)} style={{ background: 'transparent', border: 'none', color: 'var(--paper-dim)', fontSize: 12, fontWeight: 700, cursor: 'pointer' }}>
                      Clear
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <p style={{ margin: 0, color: 'var(--paper-dim)', fontSize: 12, lineHeight: 1.7 }}>
            Requests you send from the buddy cards will show up here for easy tracking.
          </p>
        )}
      </div>
    </div>
  );
}

/**
 * ResultsFeed — Renders the buddy search results grid plus request activity panel.
 * Includes sort/filter controls and animated transitions.
 */
export default function ResultsFeed({
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
            {visibleMatches.map((buddy) => (
              <BuddyCard
                key={buddy.id || buddy.UserID}
                buddy={buddy}
                requestStatus={getRequestStatus(buddy.id || buddy.UserID, requestActivity)}
                onSendRequest={onSendRequest}
              />
            ))}
          </motion.div>
        ) : (
          <motion.div
            key="empty-state"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            transition={{ duration: 0.25 }}
            style={{ ...panelStyle, padding: '30px 24px', textAlign: 'center' }}
          >
            <div style={{ width: 84, height: 84, borderRadius: '50%', margin: '0 auto 18px', background: 'rgba(129,236,255,0.08)', border: '1px solid rgba(129,236,255,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 36 }}>
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
  );
}
