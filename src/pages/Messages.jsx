import { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { Send, Search, MoreHorizontal, Paperclip, Users, DollarSign, Map } from 'lucide-react'
import { io } from 'socket.io-client'
import PageTransition from '../components/PageTransition.jsx'
import ExpensePanel from '../components/expenses/ExpensePanel.jsx'
import SOSButton from '../components/emergency/SOSButton.jsx'
import { useAuth } from '../context/AuthContext.jsx'
import api from '../services/api.js'

const expenseParticipants = (user, activeConv) => [
  { UserID: user?.id || 1, DisplayName: 'You' },
  { UserID: activeConv?.OtherUserID || 99, DisplayName: activeConv?.Title || 'Buddy' },
]

function formatTime(value) {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return String(value)

  return date.toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit',
  })
}

function getServerUrl() {
  return import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5000'
}

export default function Messages() {
  const { user, isAuthenticated } = useAuth()

  const [conversations, setConversations] = useState([])
  const [users, setUsers] = useState([])
  const [activeConv, setActiveConv] = useState(null)
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [activePanel, setActivePanel] = useState('chat')
  const [showExpense, setShowExpense] = useState(false)
  const [socket, setSocket] = useState(null)

  const bottomRef = useRef(null)
  const activeConvRef = useRef(null)

  useEffect(() => {
    activeConvRef.current = activeConv
  }, [activeConv])

  const loadConversations = async () => {
    const res = await api.get('/messages/conversations')
    const rows = res.data.conversations || []
    setConversations(rows)

    if (!activeConvRef.current && rows.length > 0) {
      setActiveConv(rows[0])
    }

    return rows
  }

  const loadUsers = async () => {
    const res = await api.get('/messages/users')
    setUsers(res.data.users || [])
  }

  const loadMessages = async (convId) => {
    if (!convId) return

    const res = await api.get(`/messages/conversations/${convId}/messages`)
    setMessages(res.data.messages || [])
  }

  useEffect(() => {
    if (!isAuthenticated || !user?.id) return

    setLoading(true)
    setError('')

    Promise.all([loadConversations(), loadUsers()])
      .catch((err) => {
        setError(err.response?.data?.message || 'Could not load messages.')
      })
      .finally(() => setLoading(false))
  }, [isAuthenticated, user?.id])

  useEffect(() => {
    if (!activeConv?.ConvID) {
      setMessages([])
      return
    }

    loadMessages(activeConv.ConvID).catch((err) => {
      setError(err.response?.data?.message || 'Could not load this conversation.')
    })
  }, [activeConv?.ConvID])

  useEffect(() => {
    if (!user?.id) return

    const s = io(getServerUrl(), {
      withCredentials: true,
      transports: ['websocket', 'polling'],
    })

    s.emit('register', user.id)

    s.on('connect', () => {
      console.log('Connected to messaging socket:', s.id)
    })

    s.on('new_message', (message) => {
      const openConv = activeConvRef.current

      if (openConv?.ConvID === message.ConvID) {
        setMessages((prev) => {
          const exists = prev.some((m) => m.MessageID === message.MessageID)
          return exists ? prev : [...prev, message]
        })
      }

      loadConversations().catch(() => {})
    })

    setSocket(s)

    return () => {
      s.disconnect()
      setSocket(null)
    }
  }, [user?.id])

  useEffect(() => {
    if (!socket || !activeConv?.ConvID) return

    socket.emit('join_conversation', activeConv.ConvID)

    return () => {
      socket.emit('leave_conversation', activeConv.ConvID)
    }
  }, [socket, activeConv?.ConvID])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, activeConv?.ConvID])

  const startChatWithUser = async (targetUser) => {
    try {
      setError('')
      const res = await api.post('/messages/conversations/direct', {
        otherUserId: targetUser.UserID,
      })

      const conv = res.data.conversation
      setActiveConv(conv)
      await loadConversations()
    } catch (err) {
      setError(err.response?.data?.message || 'Could not start conversation.')
    }
  }

  const sendMessage = async () => {
    const text = input.trim()

    if (!text || !activeConv?.ConvID) return

    try {
      setInput('')

      await api.post('/messages/send', {
        convId: activeConv.ConvID,
        messageText: text,
      })

      // Socket normally updates the chat instantly.
      // This backup refresh keeps it safe if websocket is blocked.
      setTimeout(() => {
        if (activeConvRef.current?.ConvID) {
          loadMessages(activeConvRef.current.ConvID).catch(() => {})
          loadConversations().catch(() => {})
        }
      }, 250)
    } catch (err) {
      setInput(text)
      setError(err.response?.data?.message || 'Could not send message.')
    }
  }

  const filteredConvs = conversations.filter((conv) =>
    String(conv.Title || '').toLowerCase().includes(search.toLowerCase())
  )

  const filteredUsers = users.filter((u) =>
    String(u.DisplayName || u.Email || '').toLowerCase().includes(search.toLowerCase())
  )

  const activeCountry = useMemo(() => null, [])

  if (!isAuthenticated) {
    return (
      <PageTransition>
        <div style={{
          minHeight: '100vh',
          paddingTop: 72,
          background: 'var(--ink)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'var(--paper)',
        }}>
          <div className="bento-card" style={{ padding: 32, maxWidth: 460, textAlign: 'center' }}>
            <h2 style={{ fontFamily: 'var(--font-heading)', marginBottom: 10 }}>Login required</h2>
            <p style={{ color: 'rgba(247,244,238,0.55)' }}>
              Please login first. Then you can message Sara, Omar, Priya, Emma, or any newly registered user.
            </p>
          </div>
        </div>
      </PageTransition>
    )
  }

  return (
    <PageTransition>
      <div style={{
        height: '100vh',
        paddingTop: 72,
        display: 'flex',
        background: 'var(--ink)',
        overflow: 'hidden',
      }}>

        {/* SIDEBAR */}
        <div
          className="hide-mobile"
          style={{
            width: 320,
            flexShrink: 0,
            borderRight: '1px solid rgba(255,253,248,0.07)',
            display: 'flex',
            flexDirection: 'column',
            background: 'rgba(255,253,248,0.02)',
          }}
        >
          <div style={{ padding: '18px 16px 14px', borderBottom: '1px solid rgba(255,253,248,0.07)' }}>
            <h2 style={{
              fontFamily: 'var(--font-heading)',
              fontWeight: 700,
              fontSize: 15,
              color: 'var(--paper)',
              marginBottom: 6,
            }}>
              Messages
            </h2>

            <p style={{ color: 'rgba(247,244,238,0.38)', fontSize: 11, marginBottom: 12 }}>
              Logged in as {user?.displayName || user?.email || `User ${user?.id}`}
            </p>

            <div style={{ position: 'relative' }}>
              <Search
                size={13}
                style={{
                  position: 'absolute',
                  left: 12,
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'rgba(247,244,238,0.25)',
                }}
              />

              <input
                className="input"
                placeholder="Search people or chats..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                style={{
                  paddingLeft: 36,
                  fontSize: 12,
                  padding: '9px 12px 9px 34px',
                  borderRadius: 100,
                }}
              />
            </div>
          </div>

          <div style={{ flex: 1, overflowY: 'auto' }}>
            {loading && (
              <div style={{ padding: 16, color: 'rgba(247,244,238,0.45)', fontSize: 13 }}>
                Loading conversations...
              </div>
            )}

            {filteredConvs.length > 0 && (
              <div style={{
                padding: '12px 16px 6px',
                color: 'rgba(247,244,238,0.34)',
                fontSize: 10,
                textTransform: 'uppercase',
                letterSpacing: 1.5,
                fontWeight: 800,
              }}>
                Conversations
              </div>
            )}

            {filteredConvs.map((conv) => {
              const isActive = activeConv?.ConvID === conv.ConvID

              return (
                <button
                  key={conv.ConvID}
                  onClick={() => setActiveConv(conv)}
                  style={{
                    width: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    padding: '12px 16px',
                    textAlign: 'left',
                    background: isActive ? 'rgba(232,84,26,0.1)' : 'transparent',
                    borderLeft: isActive ? '2px solid var(--accent)' : '2px solid transparent',
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,253,248,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                    {conv.Avatar || '🧳'}
                  </div>

                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                      <span style={{
                        fontFamily: 'var(--font-heading)',
                        fontWeight: 700,
                        fontSize: 13,
                        color: 'var(--paper)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                      }}>
                        {conv.Title}
                      </span>

                      <span style={{ color: 'rgba(247,244,238,0.25)', fontSize: 10, flexShrink: 0, marginLeft: 6 }}>
                        {formatTime(conv.LastMessageAt)}
                      </span>
                    </div>

                    <span style={{
                      color: 'rgba(247,244,238,0.38)',
                      fontSize: 11,
                      display: 'block',
                      overflow: 'hidden',
                      textOverflow: 'ellipsis',
                      whiteSpace: 'nowrap',
                    }}>
                      {conv.LastMessage || 'No messages yet'}
                    </span>
                  </div>
                </button>
              )
            })}

            <div style={{
              padding: '14px 16px 6px',
              color: 'rgba(247,244,238,0.34)',
              fontSize: 10,
              textTransform: 'uppercase',
              letterSpacing: 1.5,
              fontWeight: 800,
            }}>
              Travel buddies
            </div>

            {filteredUsers.map((u) => (
              <button
                key={u.UserID}
                onClick={() => startChatWithUser(u)}
                style={{
                  width: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  padding: '12px 16px',
                  textAlign: 'left',
                  background: 'transparent',
                  borderLeft: '2px solid transparent',
                  cursor: 'pointer',
                }}
              >
                <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'rgba(255,253,248,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20 }}>
                  {u.Avatar || '🧳'}
                </div>

                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontFamily: 'var(--font-heading)',
                    fontWeight: 700,
                    fontSize: 13,
                    color: 'var(--paper)',
                  }}>
                    {u.DisplayName || u.Email}
                  </div>

                  <div style={{ color: 'rgba(247,244,238,0.38)', fontSize: 11 }}>
                    Click to start chat
                  </div>
                </div>
              </button>
            ))}

            {!loading && filteredConvs.length === 0 && filteredUsers.length === 0 && (
              <div style={{ padding: 16, color: 'rgba(247,244,238,0.45)', fontSize: 13 }}>
                No users found.
              </div>
            )}
          </div>
        </div>

        {/* MAIN CHAT AREA */}
        <div style={{ flex: 1, display: 'flex', minWidth: 0 }}>
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <div style={{
              padding: '12px 20px',
              borderBottom: '1px solid rgba(255,253,248,0.07)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgba(255,253,248,0.02)',
              flexShrink: 0,
            }}>
              {activeConv ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'rgba(255,253,248,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
                    {activeConv.Avatar || '🧳'}
                  </div>

                  <div>
                    <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: 'var(--paper)' }}>
                      {activeConv.Title}
                    </div>

                    <div style={{ color: 'rgba(247,244,238,0.35)', fontSize: 11 }}>
                      Direct message
                    </div>
                  </div>
                </div>
              ) : (
                <div>
                  <div style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: 'var(--paper)' }}>
                    Select a conversation
                  </div>

                  <div style={{ color: 'rgba(247,244,238,0.35)', fontSize: 11 }}>
                    Choose a user from the left to start messaging.
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', gap: 8 }}>
                {activeConv && (
                  <>
                    {[
                      { id: 'chat', icon: <span style={{ fontSize: 14 }}>💬</span>, label: 'Chat' },
                      { id: 'expense', icon: <DollarSign size={14} />, label: 'Expenses' },
                      { id: 'itinerary', icon: <Map size={14} />, label: 'Itinerary' },
                    ].map(({ id, icon, label }) => {
                      const isActive = id === 'expense' ? showExpense : activePanel === id && !showExpense

                      return (
                        <button
                          key={id}
                          onClick={() => {
                            if (id === 'expense') {
                              setShowExpense(!showExpense)
                            } else {
                              setActivePanel(id)
                              setShowExpense(false)
                            }
                          }}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            padding: '6px 12px',
                            borderRadius: 100,
                            fontFamily: 'var(--font-heading)',
                            fontSize: 11,
                            fontWeight: 700,
                            cursor: 'pointer',
                            background: isActive ? 'rgba(232,84,26,0.15)' : 'rgba(255,253,248,0.04)',
                            color: isActive ? 'var(--accent)' : 'rgba(247,244,238,0.4)',
                            border: isActive ? '1px solid rgba(232,84,26,0.3)' : '1px solid rgba(255,253,248,0.07)',
                          }}
                        >
                          {icon}<span className="hide-mobile">{label}</span>
                        </button>
                      )
                    })}
                  </>
                )}

                <button style={{ width: 34, height: 34, borderRadius: '50%', background: 'rgba(255,253,248,0.04)', border: '1px solid rgba(255,253,248,0.08)', color: 'rgba(247,244,238,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
                  <MoreHorizontal size={15} />
                </button>
              </div>
            </div>

            {error && (
              <div style={{
                padding: '10px 20px',
                background: 'rgba(255,80,80,0.12)',
                color: '#ffb4b4',
                fontSize: 12,
                borderBottom: '1px solid rgba(255,80,80,0.18)',
              }}>
                {error}
              </div>
            )}

            {activePanel === 'chat' && (
              <>
                <div style={{ flex: 1, overflowY: 'auto', padding: '20px 20px 10px', display: 'flex', flexDirection: 'column', gap: 12 }}>
                  {!activeConv && (
                    <div style={{ color: 'rgba(247,244,238,0.45)', fontSize: 15 }}>
                      Select Sara, Omar, Priya, Emma, or any registered user from the left.
                    </div>
                  )}

                  {activeConv && messages.length === 0 && (
                    <div style={{ color: 'rgba(247,244,238,0.45)', fontSize: 15 }}>
                      No messages yet. Send the first message to {activeConv.Title}.
                    </div>
                  )}

                  {messages.map((msg) => {
                    const isMine = Number(msg.SenderID) === Number(user?.id)

                    return (
                      <motion.div
                        key={msg.MessageID}
                        initial={{ opacity: 0, y: 10, scale: 0.97 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        transition={{ duration: 0.25 }}
                        style={{
                          display: 'flex',
                          justifyContent: isMine ? 'flex-end' : 'flex-start',
                        }}
                      >
                        {!isMine && (
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,253,248,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, flexShrink: 0, marginRight: 8, alignSelf: 'flex-end' }}>
                            {msg.SenderAvatar || activeConv?.Avatar || '🧳'}
                          </div>
                        )}

                        <div style={{ maxWidth: '68%' }}>
                          <div style={{
                            padding: '10px 14px',
                            borderRadius: isMine ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                            background: isMine ? 'var(--accent)' : 'rgba(255,253,248,0.07)',
                            color: isMine ? 'white' : 'rgba(247,244,238,0.85)',
                            fontSize: 13,
                            lineHeight: 1.55,
                          }}>
                            {msg.MessageText}
                          </div>

                          <div style={{
                            color: 'rgba(247,244,238,0.2)',
                            fontSize: 10,
                            marginTop: 3,
                            textAlign: isMine ? 'right' : 'left',
                          }}>
                            {formatTime(msg.SentAt)}
                          </div>
                        </div>
                      </motion.div>
                    )
                  })}

                  <div ref={bottomRef} />
                </div>

                <div style={{ padding: '12px 20px', borderTop: '1px solid rgba(255,253,248,0.07)', display: 'flex', gap: 10, alignItems: 'center', flexShrink: 0 }}>
                  <button style={{ color: 'rgba(247,244,238,0.3)', cursor: 'pointer' }}>
                    <Paperclip size={16} />
                  </button>

                  <input
                    className="input"
                    placeholder={activeConv ? `Message ${activeConv.Title}...` : 'Select a conversation first'}
                    value={input}
                    disabled={!activeConv}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    style={{ flex: 1, borderRadius: 100, padding: '10px 18px', fontSize: 13 }}
                  />

                  <motion.button
                    onClick={sendMessage}
                    whileTap={{ scale: 0.9 }}
                    disabled={!activeConv || !input.trim()}
                    style={{
                      width: 38,
                      height: 38,
                      borderRadius: '50%',
                      background: activeConv && input.trim() ? 'var(--accent)' : 'rgba(255,253,248,0.06)',
                      color: activeConv && input.trim() ? 'white' : 'rgba(247,244,238,0.25)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      cursor: activeConv && input.trim() ? 'pointer' : 'default',
                      transition: 'all 0.2s',
                      border: 'none',
                      flexShrink: 0,
                    }}
                  >
                    <Send size={15} />
                  </motion.button>
                </div>
              </>
            )}

            {activePanel === 'itinerary' && (
              <div style={{ flex: 1, overflowY: 'auto', padding: '24px 20px' }}>
                <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, color: 'var(--paper)', marginBottom: 20 }}>
                  Shared Itinerary
                </h3>

                <p style={{ color: 'rgba(247,244,238,0.5)', fontSize: 14 }}>
                  This can later connect to a shared trip itinerary for this conversation.
                </p>
              </div>
            )}
          </div>

          <ExpensePanel
            tripId={activeConv?.ConvID || 1}
            participants={expenseParticipants(user, activeConv)}
            isOpen={showExpense}
            onClose={() => setShowExpense(false)}
          />
        </div>

        <SOSButton countryName={activeCountry} />
      </div>
    </PageTransition>
  )
}
