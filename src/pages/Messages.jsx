import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Send, Users, DollarSign, Map, Search, MoreHorizontal, Phone, Video, Paperclip } from 'lucide-react'
import PageTransition from '../components/PageTransition.jsx'

/* ── Mock data ── */
const conversations = [
  {
    id: 1, type: 'buddy', name: 'Luca Moretti', avatar: '🎒', status: 'online',
    lastMsg: "Perfect! I'll book the ryokan tonight then 🇯🇵", time: '2m ago', unread: 2,
    dest: 'Kyoto, Japan', dates: 'Jul 1–15',
  },
  {
    id: 2, type: 'group', name: 'Backpackers Asia', avatar: '🎒', status: 'active',
    lastMsg: 'Omar: anyone tried the night market in Chiang Mai?', time: '15m ago', unread: 7,
    members: 142,
  },
  {
    id: 3, type: 'buddy', name: 'Sara Kim', avatar: '📸', status: 'offline',
    lastMsg: 'See you in Bali! 🌴', time: '2h ago', unread: 0,
    dest: 'Bali, Indonesia', dates: 'Aug 5–18',
  },
  {
    id: 4, type: 'group', name: 'Solo Female Travelers', avatar: '🌸', status: 'active',
    lastMsg: 'Priya: safety tips for Marrakech medina?', time: '4h ago', unread: 0,
    members: 8900,
  },
  {
    id: 5, type: 'buddy', name: 'Omar Rashid', avatar: '🏔️', status: 'online',
    lastMsg: 'Gear list sent — check the itinerary tab', time: 'Yesterday', unread: 0,
    dest: 'Patagonia', dates: 'Oct 1–14',
  },
]

const messageHistory = {
  1: [
    { id: 1, from: 'them', text: "Hey! Just confirmed my flight to Kyoto ✈️ Landing on July 1st around noon.", time: '10:14' },
    { id: 2, from: 'me',   text: "Amazing! I land July 1st too — around 2pm. Should we meet at the station?", time: '10:22' },
    { id: 3, from: 'them', text: "Yes! JR Kyoto Station, east exit? We can head to the ryokan together.", time: '10:25' },
    { id: 4, from: 'me',   text: "Sounds perfect. I've shortlisted a few places — I'll share the link now.", time: '10:31' },
    { id: 5, from: 'them', text: "Great, I'll check them out. Budget-wise I'm thinking ~$120/night split two ways.", time: '10:48' },
    { id: 6, from: 'me',   text: "That works! The Arashiyama ryokan I found is $230/night so $115 each. 🏯", time: '10:52' },
    { id: 7, from: 'them', text: "Perfect! I'll book the ryokan tonight then 🇯🇵", time: '11:03' },
  ],
  3: [
    { id: 1, from: 'them', text: "Excited for Bali! Any recommendations for Ubud areas?", time: 'Yesterday' },
    { id: 2, from: 'me',   text: "Yes! Stay near the rice terraces — Penestanan is quieter than central Ubud.", time: 'Yesterday' },
    { id: 3, from: 'them', text: "See you in Bali! 🌴", time: '2h ago' },
  ],
  5: [
    { id: 1, from: 'them', text: "Here's the complete gear list for Patagonia. Layering is key!", time: 'Yesterday' },
    { id: 2, from: 'me',   text: "This is incredibly detailed, thank you! What boots do you recommend?", time: 'Yesterday' },
    { id: 3, from: 'them', text: "Gear list sent — check the itinerary tab", time: 'Yesterday' },
  ],
}

const expenseData = [
  { description: 'Arashiyama Ryokan (3 nights)', total: 690, myShare: 345, paid: true },
  { description: 'JR Pass (7-day)',               total: 280, myShare: 140, paid: true },
  { description: 'Fushimi Inari Entry',            total: 0,   myShare: 0,   paid: true },
  { description: 'Nishiki Market dinner',          total: 80,  myShare: 40,  paid: false },
]

export default function Messages() {
  const [activeConv, setActiveConv]   = useState(conversations[0])
  const [input, setInput]             = useState('')
  const [messages, setMessages]       = useState(messageHistory)
  const [activePanel, setActivePanel] = useState('chat') // chat | expense | itinerary
  const [search, setSearch]           = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [activeConv, messages])

  const sendMessage = () => {
    const text = input.trim()
    if (!text) return
    setMessages(prev => ({
      ...prev,
      [activeConv.id]: [
        ...(prev[activeConv.id] || []),
        { id: Date.now(), from: 'me', text, time: 'now' },
      ],
    }))
    setInput('')
    // Fake auto-reply after 1.2s
    if (activeConv.type === 'buddy') {
      setTimeout(() => {
        setMessages(prev => ({
          ...prev,
          [activeConv.id]: [
            ...(prev[activeConv.id] || []),
            { id: Date.now() + 1, from: 'them', text: 'Sounds great! 🙌', time: 'now' },
          ],
        }))
      }, 1200)
    }
  }

  const filteredConvs = conversations.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase())
  )

  const currentMsgs = messages[activeConv.id] || []
  const totalExpenses = expenseData.reduce((a, e) => a + e.myShare, 0)
  const paid = expenseData.filter(e => e.paid).reduce((a, e) => a + e.myShare, 0)

  return (
    <PageTransition>
      <div style={{
        height: '100vh',
        paddingTop: 72,
        display: 'flex',
        background: 'var(--ink)',
        overflow: 'hidden',
      }}>

        {/* ── SIDEBAR ── */}
        <div style={{
          width: 300, flexShrink: 0,
          borderRight: '1px solid rgba(255,253,248,0.07)',
          display: 'flex', flexDirection: 'column',
          background: 'rgba(255,253,248,0.02)',
        }} className="hide-mobile">
          {/* Header */}
          <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid rgba(255,253,248,0.07)' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, color: 'var(--paper)', marginBottom: 12 }}>Messages</h2>
            <div style={{ position: 'relative' }}>
              <Search size={13} style={{ position: 'absolute', left: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(247,244,238,0.25)' }} />
              <input
                className="input"
                placeholder="Search conversations..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                style={{ paddingLeft: 36, fontSize: 12, padding: '9px 12px 9px 34px', borderRadius: 100 }}
              />
            </div>
          </div>

          {/* Conversation list */}
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredConvs.map(conv => (
              <button
                key={conv.id}
                onClick={() => setActiveConv(conv)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 16px', textAlign: 'left',
                  background: activeConv.id === conv.id ? 'rgba(232,84,26,0.1)' : 'transparent',
                  borderLeft: activeConv.id === conv.id ? '2px solid var(--accent)' : '2px solid transparent',
                  cursor: 'pointer', transition: 'all 0.15s',
                }}
                onMouseEnter={e => { if (activeConv.id !== conv.id) e.currentTarget.style.background = 'rgba(255,253,248,0.04)' }}
                onMouseLeave={e => { if (activeConv.id !== conv.id) e.currentTarget.style.background = 'transparent' }}
              >
                {/* Avatar */}
                <div style={{ position: 'relative', flexShrink: 0 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: 'rgba(255,253,248,0.07)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 20,
                  }}>{conv.avatar}</div>
                  {conv.type === 'buddy' && (
                    <div style={{
                      position: 'absolute', bottom: 1, right: 1,
                      width: 9, height: 9, borderRadius: '50%',
                      background: conv.status === 'online' ? 'var(--accent3)' : 'rgba(255,253,248,0.2)',
                      border: '2px solid rgba(10,14,26,0.8)',
                    }} />
                  )}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                    <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, color: 'var(--paper)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {conv.type === 'group' && <Users size={10} style={{ display: 'inline', marginRight: 4, opacity: 0.5 }} />}
                      {conv.name}
                    </span>
                    <span style={{ color: 'rgba(247,244,238,0.25)', fontSize: 10, flexShrink: 0, marginLeft: 6 }}>{conv.time}</span>
                  </div>
                  <span style={{ color: 'rgba(247,244,238,0.38)', fontSize: 11, display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{conv.lastMsg}</span>
                </div>

                {/* Unread badge */}
                {conv.unread > 0 && (
                  <div style={{
                    minWidth: 18, height: 18, borderRadius: 9,
                    background: 'var(--accent)', color: 'white',
                    fontSize: 10, fontWeight: 700, fontFamily: 'var(--font-heading)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 5px', flexShrink: 0,
                  }}>{conv.unread}</div>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* ── MAIN CHAT AREA ── */}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>

          {/* Chat header */}
          <div style={{
            padding: '12px 20px',
            borderBottom: '1px solid rgba(255,253,248,0.07)',
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            background: 'rgba(255,253,248,0.02)', flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,253,248,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>{activeConv.avatar}</div>
              <div>
                <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: 'var(--paper)' }}>{activeConv.name}</div>
                <div style={{ color: 'rgba(247,244,238,0.35)', fontSize: 11 }}>
                  {activeConv.type === 'buddy' ? `${activeConv.dest} · ${activeConv.dates}` : `${activeConv.members?.toLocaleString()} members`}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              {activeConv.type === 'buddy' && (
                <>
                  {/* Panel toggle buttons */}
                  {[
                    { id: 'chat',      icon: <span style={{ fontSize: 14 }}>💬</span>, label: 'Chat'     },
                    { id: 'expense',   icon: <DollarSign size={14} />,                  label: 'Expenses' },
                    { id: 'itinerary', icon: <Map size={14} />,                         label: 'Itinerary'},
                  ].map(({ id, icon, label }) => (
                    <button
                      key={id}
                      onClick={() => setActivePanel(id)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 5,
                        padding: '6px 12px', borderRadius: 100,
                        fontFamily: 'var(--font-heading)', fontSize: 11, fontWeight: 700,
                        cursor: 'pointer', transition: 'all 0.15s',
                        background: activePanel === id ? 'rgba(232,84,26,0.15)' : 'rgba(255,253,248,0.04)',
                        color: activePanel === id ? 'var(--accent)' : 'rgba(247,244,238,0.4)',
                        border: activePanel === id ? '1px solid rgba(232,84,26,0.3)' : '1px solid rgba(255,253,248,0.07)',
                      }}
                    >
                      {icon}<span className="hide-mobile">{label}</span>
                    </button>
                  ))}
                </>
              )}
              <button style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,253,248,0.04)', border: '1px solid rgba(255,253,248,0.08)', color: 'rgba(247,244,238,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                <MoreHorizontal size={15} />
              </button>
            </div>
          </div>

          {/* Panel content */}
          <AnimatePresence mode="wait">
            <motion.div key={`${activeConv.id}-${activePanel}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.2 }} style={{ flex: 1, overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

              {/* ── CHAT PANEL ── */}
              {activePanel === 'chat' && (
                <>
                  {/* Messages */}
                  <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 10px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {currentMsgs.map((msg) => (
                      <motion.div
                        key={msg.id}
                        initial={{ opacity: 0, y: 10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.25 }}
                        style={{
                          display: 'flex',
                          justifyContent: msg.from === 'me' ? 'flex-end' : 'flex-start',
                        }}
                      >
                        {msg.from === 'them' && (
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,253,248,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, marginRight: 8, alignSelf: 'flex-end' }}>{activeConv.avatar}</div>
                        )}
                        <div style={{ maxWidth: '68%' }}>
                          <div style={{
                            padding: '10px 14px',
                            borderRadius: msg.from === 'me' ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            background: msg.from === 'me' ? 'var(--accent)' : 'rgba(255,253,248,0.07)',
                            color: msg.from === 'me' ? 'white' : 'rgba(247,244,238,0.85)',
                            fontSize: 13, lineHeight: 1.55,
                          }}>
                            {msg.text}
                          </div>
                          <div style={{ color: 'rgba(247,244,238,0.2)', fontSize: 10, marginTop: 3, textAlign: msg.from === 'me' ? 'right' : 'left' }}>{msg.time}</div>
                        </div>
                      </motion.div>
                    ))}
                    <div ref={bottomRef} />
                  </div>

                  {/* Input */}
                  <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,253,248,0.07)', display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
                    <button style={{ color: 'rgba(247,244,238,0.3)', cursor: 'pointer' }}>
                      <Paperclip size={16} />
                    </button>
                    <input
                      className="input"
                      placeholder={`Message ${activeConv.name}...`}
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && sendMessage()}
                      style={{ flex: 1, borderRadius: 100, padding: '10px 18px', fontSize: 13 }}
                    />
                    <motion.button
                      onClick={sendMessage}
                      whileTap={{ scale: 0.9 }}
                      style={{
                        width: 38, height: 38, borderRadius: '50%',
                        background: input.trim() ? 'var(--accent)' : 'rgba(255,253,248,0.06)',
                        color: input.trim() ? 'white' : 'rgba(247,244,238,0.25)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: input.trim() ? 'pointer' : 'default',
                        transition: 'all 0.2s', border: 'none', flexShrink: 0,
                      }}
                    >
                      <Send size={15} />
                    </motion.button>
                  </div>
                </>
              )}

              {/* ── EXPENSE PANEL ── */}
              {activePanel === 'expense' && (
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
                  {/* Summary */}
                  <div style={{
                    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 14, marginBottom: 28,
                  }}>
                    {[
                      { label: 'Total Trip Cost', value: `$${totalExpenses * 2}`, color: 'var(--accent2)' },
                      { label: 'Your Share',       value: `$${totalExpenses}`,     color: 'var(--accent)'  },
                      { label: 'Still Owed',       value: `$${totalExpenses - paid}`, color: totalExpenses - paid > 0 ? 'var(--accent)' : 'var(--accent3)' },
                    ].map(({ label, value, color }) => (
                      <div key={label} style={{ padding: '14px 14px', background: 'rgba(255,253,248,0.04)', border: '1px solid rgba(255,253,248,0.08)', borderRadius: 'var(--r-md)', textAlign: 'center' }}>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color, marginBottom: 4 }}>{value}</div>
                        <div style={{ fontFamily: 'var(--font-heading)', fontSize: 9, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'rgba(247,244,238,0.3)' }}>{label}</div>
                      </div>
                    ))}
                  </div>

                  {/* Expense items */}
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: 'var(--paper)', marginBottom: 14 }}>Expense Breakdown</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {expenseData.map((e) => (
                      <div key={e.description} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '13px 16px',
                        background: 'rgba(255,253,248,0.03)', border: '1px solid rgba(255,253,248,0.07)', borderRadius: 10,
                        flexWrap: 'wrap', gap: 8,
                      }}>
                        <div style={{ flex: 1, minWidth: 160 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--paper)', marginBottom: 3 }}>{e.description}</div>
                          <div style={{ color: 'rgba(247,244,238,0.35)', fontSize: 11 }}>Total: ${e.total} · Your share: ${e.myShare}</div>
                        </div>
                        <span style={{
                          fontSize: 10, fontFamily: 'var(--font-heading)', fontWeight: 700,
                          padding: '3px 10px', borderRadius: 20,
                          background: e.paid ? 'rgba(31,138,85,0.12)' : 'rgba(232,84,26,0.12)',
                          color: e.paid ? 'var(--accent3)' : 'var(--accent)',
                        }}>
                          {e.paid ? '✓ Paid' : 'Pending'}
                        </span>
                      </div>
                    ))}
                  </div>

                  <button className="btn btn-primary" style={{ marginTop: 20, fontSize: 13, padding: '11px 22px' }}>
                    <DollarSign size={14} /> Add Expense
                  </button>
                </div>
              )}

              {/* ── ITINERARY PANEL ── */}
              {activePanel === 'itinerary' && (
                <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, color: 'var(--paper)', marginBottom: 20 }}>
                    Shared Itinerary — {activeConv.dest}
                  </h3>
                  {[
                    { day: 1, title: 'Arrival & Check-in',  items: ['Land at Kansai Airport', 'JR train to Kyoto', 'Check-in: Arashiyama Ryokan', 'Evening walk in Gion'] },
                    { day: 2, title: 'Temples & Shrines',   items: ['Fushimi Inari Shrine (6am)', 'Nishiki Market lunch', 'Kinkaku-ji afternoon', 'Gion Matsuri evening'] },
                    { day: 3, title: 'Arashiyama Day',      items: ['Bamboo Grove (7am)', 'Tenryu-ji Garden', 'Boat ride on Oi River', 'Dinner in Pontocho'] },
                  ].map((day, i) => (
                    <div key={day.day} style={{ display: 'flex', gap: 12, marginBottom: 20 }}>
                      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                        <div style={{ width: 34, height: 34, borderRadius: '50%', background: 'var(--accent)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-heading)', fontSize: 12, fontWeight: 700, color: 'white' }}>D{day.day}</div>
                        {i < 2 && <div style={{ width: 2, flex: 1, background: 'rgba(255,253,248,0.08)', margin: '4px 0' }} />}
                      </div>
                      <div style={{ flex: 1, padding: '12px 16px', background: 'rgba(255,253,248,0.04)', border: '1px solid rgba(255,253,248,0.07)', borderRadius: 10, marginBottom: 4 }}>
                        <h4 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, color: 'var(--paper)', marginBottom: 10 }}>Day {day.day}: {day.title}</h4>
                        {day.items.map((item) => (
                          <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
                            <span style={{ width: 5, height: 5, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                            <span style={{ color: 'rgba(247,244,238,0.55)', fontSize: 12 }}>{item}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </PageTransition>
  )
}
