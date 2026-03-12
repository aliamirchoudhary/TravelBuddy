import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Map, Zap, CheckSquare, DollarSign, Navigation, Globe, AlertTriangle, Download,
  Users, Plus, Trash2, ChevronDown, RefreshCw, ArrowRight
} from 'lucide-react'
import Footer from '../components/Footer.jsx'
import PageTransition from '../components/PageTransition.jsx'

const tabs = [
  { id: 'destination', label: 'Destination', icon: Map },
  { id: 'itinerary', label: 'AI Itinerary', icon: Zap },
  { id: 'todos', label: 'To-Do Lists', icon: CheckSquare },
  { id: 'budget', label: 'Budget', icon: DollarSign },
  { id: 'routes', label: 'Routes', icon: Navigation },
  { id: 'utilities', label: 'Utilities', icon: Globe },
  { id: 'buddy', label: 'Find Buddy', icon: Users },
]

const countries = ['Greece', 'Japan', 'Indonesia', 'Morocco', 'Turkey', 'Maldives', 'France', 'Italy', 'Spain', 'Thailand', 'Pakistan', 'UAE']
const cities = {
  'Greece': ['Athens', 'Santorini', 'Mykonos', 'Thessaloniki'],
  'Japan': ['Tokyo', 'Kyoto', 'Osaka', 'Hiroshima'],
  'Indonesia': ['Bali', 'Lombok', 'Jakarta', 'Yogyakarta'],
  'Morocco': ['Marrakech', 'Fes', 'Casablanca', 'Chefchaouen'],
  'France': ['Paris', 'Nice', 'Lyon', 'Bordeaux'],
  'Italy': ['Rome', 'Florence', 'Venice', 'Amalfi'],
  'Thailand': ['Bangkok', 'Chiang Mai', 'Phuket', 'Koh Samui'],
}

const aiItinerary = [
  { day: 1, title: 'Arrival & Orientation', activities: ['Check into hotel', 'Walk the old town', 'Sunset at the viewpoint', 'Welcome dinner at local restaurant'] },
  { day: 2, title: 'Historical Sites', activities: ['Morning at the archaeological site', 'Guided cultural tour', 'Local market exploration', 'Traditional cuisine evening'] },
  { day: 3, title: 'Nature & Adventure', activities: ['Hiking to scenic viewpoint', 'Waterfall visit', 'Local village tour', 'Beach sunset'] },
  { day: 4, title: 'Culture & Art', activities: ['Museum morning', 'Art galleries', 'Traditional workshop', 'Farewell dinner'] },
]

const transportOptions = [
  { mode: '✈️', name: 'Flight', time: '3h 20m', cost: '$280', rating: '4.2' },
  { mode: '🚂', name: 'Train', time: '8h 45m', cost: '$85', rating: '4.5' },
  { mode: '🚌', name: 'Bus', time: '12h 00m', cost: '$35', rating: '3.8' },
  { mode: '🚗', name: 'Car Rental', time: '6h 30m', cost: '$120', rating: '4.0' },
]

export default function TripPlanner() {
  const [activeTab, setActiveTab] = useState('destination')
  const [selectedCountry, setSelectedCountry] = useState('')
  const [selectedCity, setSelectedCity] = useState('')
  const [todos, setTodos] = useState({
    packing: [
      { id: 1, text: 'Pack passport & documents', done: true },
      { id: 2, text: 'Book accommodation', done: true },
      { id: 3, text: 'Get travel insurance', done: false },
      { id: 4, text: 'Exchange currency', done: false },
    ],
    activities: [
      { id: 5, text: 'Research local attractions', done: false },
      { id: 6, text: 'Book guided tours', done: false },
    ]
  })
  const [newTodo, setNewTodo] = useState('')
  const [activeTodoList, setActiveTodoList] = useState('packing')
  const [aiGenerating, setAiGenerating] = useState(false)
  const [generatedPlan, setGeneratedPlan] = useState(null)
  const [budget, setBudget] = useState({ accommodation: 800, transport: 400, food: 300, activities: 200, misc: 100 })
  const [currency, setCurrency] = useState('USD')
  const [fromAmount, setFromAmount] = useState('')
  const [convertedAmount, setConvertedAmount] = useState('')

  const totalBudget = Object.values(budget).reduce((a, b) => a + b, 0)

  const toggleTodo = (listKey, id) => {
    setTodos(prev => ({
      ...prev,
      [listKey]: prev[listKey].map(t => t.id === id ? { ...t, done: !t.done } : t)
    }))
  }

  const addTodo = () => {
    if (!newTodo.trim()) return
    setTodos(prev => ({
      ...prev,
      [activeTodoList]: [...prev[activeTodoList], { id: Date.now(), text: newTodo, done: false }]
    }))
    setNewTodo('')
  }

  const removeTodo = (listKey, id) => {
    setTodos(prev => ({
      ...prev,
      [listKey]: prev[listKey].filter(t => t.id !== id)
    }))
  }

  const generateItinerary = () => {
    setAiGenerating(true)
    setTimeout(() => {
      setGeneratedPlan(aiItinerary)
      setAiGenerating(false)
    }, 1800)
  }

  const convertCurrency = () => {
    const rates = { USD: 1, EUR: 0.92, GBP: 0.79, JPY: 149, PKR: 278, AED: 3.67 }
    if (fromAmount) {
      setConvertedAmount((parseFloat(fromAmount) * (rates[currency] || 1)).toFixed(2))
    }
  }

  return (
    <PageTransition>
      <div style={{ background: 'var(--paper)', minHeight: '100vh' }}>

        {/* Header */}
        <div style={{
          background: 'linear-gradient(180deg, #0a0e1a 0%, #0d1525 100%)',
          padding: 'clamp(90px, 10vw, 120px) 0 40px',
        }}>
          <div className="container">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
              <p className="tag" style={{ marginBottom: 10 }}>🗺️ Planning Tools</p>
              <h1 className="display-heading" style={{ fontSize: 'clamp(30px, 6vw, 56px)', color: 'var(--paper)', marginBottom: 10 }}>
                Trip Planner Dashboard
              </h1>
              <p style={{ color: 'rgba(247,244,238,0.45)', fontSize: 15 }}>
                Everything you need to plan the perfect trip — all in one place.
              </p>
            </motion.div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div style={{
          background: 'var(--ink)',
          borderBottom: '1px solid rgba(255,253,248,0.06)',
          position: 'sticky', top: 60, zIndex: 100,
        }}>
          <div className="container">
            <div style={{ display: 'flex', gap: 0, overflow: 'auto' }}>
              {tabs.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => setActiveTab(id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 7,
                    padding: '14px 18px',
                    fontFamily: 'var(--font-heading)',
                    fontSize: 12, fontWeight: 700,
                    letterSpacing: 0.3,
                    color: activeTab === id ? 'var(--accent)' : 'rgba(247,244,238,0.45)',
                    borderBottom: activeTab === id ? '2px solid var(--accent)' : '2px solid transparent',
                    marginBottom: -1,
                    transition: 'all 0.2s',
                    whiteSpace: 'nowrap',
                    cursor: 'pointer',
                  }}
                >
                  <Icon size={13} />
                  {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="container" style={{ padding: 'clamp(24px, 5vw, 48px) clamp(20px, 5vw, 80px)' }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.25 }}
            >

              {/* ── DESTINATION TAB ── */}
              {activeTab === 'destination' && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'var(--ink)', marginBottom: 24 }}>
                    Choose Your Destination
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
                    {/* Country selector */}
                    <div>
                      <label style={{ fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 8 }}>Country</label>
                      <select
                        className="input-light"
                        style={{ width: '100%', borderRadius: 'var(--r-md)', padding: '13px 16px', border: '1.5px solid var(--border)', fontFamily: 'var(--font-body)', cursor: 'pointer', appearance: 'none' }}
                        value={selectedCountry}
                        onChange={e => { setSelectedCountry(e.target.value); setSelectedCity('') }}
                      >
                        <option value="">Select country...</option>
                        {countries.map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>

                    {/* City selector */}
                    <div>
                      <label style={{ fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 8 }}>City</label>
                      <select
                        className="input-light"
                        style={{ width: '100%', borderRadius: 'var(--r-md)', padding: '13px 16px', border: '1.5px solid var(--border)', fontFamily: 'var(--font-body)', cursor: 'pointer', appearance: 'none', opacity: !selectedCountry ? 0.5 : 1 }}
                        value={selectedCity}
                        onChange={e => setSelectedCity(e.target.value)}
                        disabled={!selectedCountry}
                      >
                        <option value="">Select city...</option>
                        {(cities[selectedCountry] || []).map(c => <option key={c}>{c}</option>)}
                      </select>
                    </div>

                    {/* Dates */}
                    <div>
                      <label style={{ fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 8 }}>Departure Date</label>
                      <input type="date" className="input-light" style={{ width: '100%', borderRadius: 'var(--r-md)', padding: '13px 16px', border: '1.5px solid var(--border)', fontFamily: 'var(--font-body)' }} />
                    </div>

                    <div>
                      <label style={{ fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 8 }}>Return Date</label>
                      <input type="date" className="input-light" style={{ width: '100%', borderRadius: 'var(--r-md)', padding: '13px 16px', border: '1.5px solid var(--border)', fontFamily: 'var(--font-body)' }} />
                    </div>
                  </div>

                  {selectedCity && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                      style={{
                        padding: 24,
                        background: 'linear-gradient(135deg, #f7f4ee, #fffdf8)',
                        border: '1px solid var(--border)',
                        borderRadius: 'var(--r-md)',
                      }}
                    >
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--ink)', marginBottom: 16 }}>
                        📍 {selectedCity}, {selectedCountry} — Pre-populated Info
                      </h3>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}>
                        {['Attractions Database', 'Hotel Directory', 'Restaurant Guide', 'Cost Estimation Ready'].map(item => (
                          <div key={item} style={{
                            display: 'flex', alignItems: 'center', gap: 8,
                            padding: '10px 14px',
                            background: 'white',
                            border: '1px solid var(--border)',
                            borderRadius: 8,
                            fontSize: 13, color: 'var(--ink)', fontWeight: 600,
                          }}>
                            <span style={{ color: 'var(--accent3)', fontSize: 14 }}>✓</span>
                            {item}
                          </div>
                        ))}
                      </div>
                      <div style={{ marginTop: 16, display: 'flex', gap: 10 }}>
                        <button onClick={() => setActiveTab('itinerary')} className="btn btn-primary" style={{ fontSize: 13, padding: '10px 22px' }}>
                          Generate AI Itinerary <ArrowRight size={13} />
                        </button>
                        <button onClick={() => setActiveTab('budget')} className="btn btn-outline" style={{ fontSize: 13, padding: '10px 18px', color: 'var(--ink)', borderColor: 'var(--border)' }}>
                          Estimate Budget
                        </button>
                      </div>
                    </motion.div>
                  )}
                </div>
              )}

              {/* ── ITINERARY TAB ── */}
              {activeTab === 'itinerary' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 24, flexWrap: 'wrap', gap: 14 }}>
                    <div>
                      <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'var(--ink)', marginBottom: 4 }}>AI Itinerary Generator</h2>
                      <p style={{ color: 'var(--muted)', fontSize: 13 }}>Personalised day-by-day plans based on your preferences</p>
                    </div>
                    <button
                      onClick={generateItinerary}
                      disabled={aiGenerating}
                      className="btn btn-primary"
                      style={{ fontSize: 13, padding: '11px 22px' }}
                    >
                      {aiGenerating ? (
                        <><RefreshCw size={14} style={{ animation: 'spin 1s linear infinite' }} /> Generating...</>
                      ) : (
                        <><Zap size={14} /> Generate Plan</>
                      )}
                    </button>
                  </div>

                  {/* Style preferences */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 28, flexWrap: 'wrap' }}>
                    {['🏔️ Adventure', '🏖️ Relaxation', '🏛️ Culture', '🍜 Foodie', '📸 Photography', '🌿 Nature'].map(style => (
                      <button key={style} style={{
                        padding: '7px 14px',
                        borderRadius: 100,
                        border: '1.5px solid var(--border)',
                        fontFamily: 'var(--font-heading)',
                        fontSize: 12, fontWeight: 600,
                        cursor: 'pointer',
                        background: 'white', color: 'var(--ink)',
                        transition: 'all 0.2s',
                      }}
                        onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)' }}
                        onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.color = 'var(--ink)' }}
                      >{style}</button>
                    ))}
                  </div>

                  {generatedPlan && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
                      {generatedPlan.map((day, i) => (
                        <motion.div
                          key={day.day}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: i * 0.12 }}
                          style={{
                            display: 'flex', gap: 16, marginBottom: 20,
                          }}
                        >
                          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0 }}>
                            <div style={{
                              width: 40, height: 40,
                              background: 'var(--accent)',
                              borderRadius: '50%',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, color: 'white',
                            }}>D{day.day}</div>
                            {i < generatedPlan.length - 1 && <div style={{ width: 1, flex: 1, background: 'var(--border)', margin: '6px 0' }} />}
                          </div>
                          <div style={{
                            flex: 1, padding: '14px 18px',
                            background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 10,
                            marginBottom: 4,
                          }}>
                            <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, color: 'var(--ink)', marginBottom: 12 }}>
                              Day {day.day}: {day.title}
                            </h3>
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                              {day.activities.map((act, j) => (
                                <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: 'var(--muted)' }}>
                                  <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', flexShrink: 0 }} />
                                  {act}
                                </div>
                              ))}
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </motion.div>
                  )}

                  {!generatedPlan && (
                    <div style={{ textAlign: 'center', padding: '60px 20px', border: '2px dashed var(--border)', borderRadius: 'var(--r-md)' }}>
                      <div style={{ fontSize: 40, marginBottom: 14 }}>🤖</div>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--ink)', marginBottom: 8 }}>AI Plan Ready to Generate</h3>
                      <p style={{ color: 'var(--muted)', fontSize: 13 }}>Select your travel style above, then click "Generate Plan"</p>
                    </div>
                  )}
                </div>
              )}

              {/* ── TO-DO TAB ── */}
              {activeTab === 'todos' && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'var(--ink)', marginBottom: 24 }}>Trip To-Do Lists</h2>

                  {/* List selector */}
                  <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
                    {Object.keys(todos).map(key => (
                      <button key={key} onClick={() => setActiveTodoList(key)}
                        style={{
                          padding: '7px 18px', borderRadius: 100,
                          fontFamily: 'var(--font-heading)', fontSize: 12, fontWeight: 700,
                          cursor: 'pointer',
                          background: activeTodoList === key ? 'var(--ink)' : 'white',
                          color: activeTodoList === key ? 'white' : 'var(--ink)',
                          border: '1.5px solid',
                          borderColor: activeTodoList === key ? 'var(--ink)' : 'var(--border)',
                          textTransform: 'capitalize',
                          transition: 'all 0.2s',
                        }}
                      >{key}</button>
                    ))}
                  </div>

                  {/* Add new */}
                  <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
                    <input
                      className="input-light"
                      placeholder={`Add to ${activeTodoList} list...`}
                      value={newTodo}
                      onChange={e => setNewTodo(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && addTodo()}
                      style={{ flex: 1, borderRadius: 'var(--r-md)', padding: '11px 16px', border: '1.5px solid var(--border)' }}
                    />
                    <button onClick={addTodo} className="btn btn-primary" style={{ padding: '11px 18px' }}>
                      <Plus size={15} />
                    </button>
                  </div>

                  {/* Todo items */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {todos[activeTodoList].map(todo => (
                      <motion.div
                        key={todo.id}
                        layout
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12,
                          padding: '13px 16px',
                          background: 'var(--cream)',
                          border: '1px solid var(--border)',
                          borderRadius: 10,
                          opacity: todo.done ? 0.6 : 1,
                        }}
                      >
                        <button
                          onClick={() => toggleTodo(activeTodoList, todo.id)}
                          style={{
                            width: 20, height: 20, borderRadius: 5,
                            border: `2px solid ${todo.done ? 'var(--accent3)' : 'var(--border)'}`,
                            background: todo.done ? 'var(--accent3)' : 'white',
                            flexShrink: 0,
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer',
                          }}
                        >
                          {todo.done && <span style={{ color: 'white', fontSize: 11, fontWeight: 700 }}>✓</span>}
                        </button>
                        <span style={{
                          flex: 1, fontSize: 14, color: 'var(--ink)',
                          textDecoration: todo.done ? 'line-through' : 'none',
                          fontWeight: todo.done ? 400 : 500,
                        }}>{todo.text}</span>
                        <button
                          onClick={() => removeTodo(activeTodoList, todo.id)}
                          style={{ color: 'var(--muted)', transition: 'color 0.2s' }}
                          onMouseEnter={e => e.currentTarget.style.color = 'var(--accent)'}
                          onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
                        >
                          <Trash2 size={13} />
                        </button>
                      </motion.div>
                    ))}
                  </div>

                  {/* Progress */}
                  <div style={{ marginTop: 20, padding: '14px 16px', background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 10 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                      <span style={{ fontFamily: 'var(--font-heading)', fontSize: 12, fontWeight: 700, color: 'var(--ink)' }}>Progress</span>
                      <span style={{ fontSize: 12, color: 'var(--muted)' }}>
                        {todos[activeTodoList].filter(t => t.done).length}/{todos[activeTodoList].length} done
                      </span>
                    </div>
                    <div style={{ height: 6, background: 'var(--border)', borderRadius: 3 }}>
                      <div style={{
                        height: '100%', borderRadius: 3,
                        background: 'var(--accent3)',
                        width: `${todos[activeTodoList].length > 0 ? (todos[activeTodoList].filter(t => t.done).length / todos[activeTodoList].length * 100) : 0}%`,
                        transition: 'width 0.4s ease',
                      }} />
                    </div>
                  </div>
                </div>
              )}

              {/* ── BUDGET TAB ── */}
              {activeTab === 'budget' && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'var(--ink)', marginBottom: 24 }}>
                    Budget Estimator
                  </h2>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 32, flexWrap: 'wrap' }}>
                    <div>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, marginBottom: 24 }}>
                        {Object.entries(budget).map(([key, val]) => (
                          <div key={key}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                              <label style={{ fontFamily: 'var(--font-heading)', fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: 'capitalize', color: 'var(--ink)' }}>{key}</label>
                              <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--accent)' }}>${val}</span>
                            </div>
                            <input
                              type="range" min="0" max="2000" step="50" value={val}
                              onChange={e => setBudget(b => ({ ...b, [key]: parseInt(e.target.value) }))}
                              style={{ width: '100%', accentColor: 'var(--accent)' }}
                            />
                          </div>
                        ))}
                      </div>

                      <div style={{
                        padding: '16px 20px',
                        background: 'var(--ink)',
                        borderRadius: 'var(--r-md)',
                        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      }}>
                        <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 13, color: 'rgba(247,244,238,0.7)' }}>Total Estimate</span>
                        <span style={{ fontFamily: 'var(--font-display)', fontSize: 24, fontWeight: 700, color: 'var(--paper)' }}>
                          ${totalBudget.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Currency converter */}
                    <div>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--ink)', marginBottom: 16 }}>Currency Converter</h3>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                        <div>
                          <label style={{ fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 7 }}>USD Amount</label>
                          <input
                            type="number"
                            className="input-light"
                            placeholder="Enter amount in USD"
                            value={fromAmount}
                            onChange={e => setFromAmount(e.target.value)}
                            style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--r-md)', border: '1.5px solid var(--border)' }}
                          />
                        </div>
                        <div>
                          <label style={{ fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 7 }}>Convert To</label>
                          <select
                            className="input-light"
                            style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--r-md)', border: '1.5px solid var(--border)' }}
                            value={currency} onChange={e => setCurrency(e.target.value)}
                          >
                            {['EUR', 'GBP', 'JPY', 'PKR', 'AED', 'USD'].map(c => <option key={c}>{c}</option>)}
                          </select>
                        </div>
                        <button onClick={convertCurrency} className="btn btn-primary" style={{ fontSize: 13, padding: '11px', justifyContent: 'center' }}>
                          Convert
                        </button>
                        {convertedAmount && (
                          <div style={{
                            padding: '14px 16px', background: 'rgba(31,138,85,0.08)', border: '1px solid rgba(31,138,85,0.2)',
                            borderRadius: 10, textAlign: 'center',
                          }}>
                            <span style={{ fontFamily: 'var(--font-display)', fontSize: 22, fontWeight: 700, color: 'var(--accent3)' }}>
                              {convertedAmount} {currency}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* ── ROUTES TAB ── */}
              {activeTab === 'routes' && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'var(--ink)', marginBottom: 24 }}>Routes & Transport</h2>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 24 }}>
                    {['From (Origin)', 'To (Destination)'].map(label => (
                      <div key={label}>
                        <label style={{ fontFamily: 'var(--font-heading)', fontSize: 10, fontWeight: 700, letterSpacing: 1.5, textTransform: 'uppercase', color: 'var(--muted)', display: 'block', marginBottom: 7 }}>{label}</label>
                        <input className="input-light" placeholder={label} style={{ width: '100%', padding: '12px 16px', borderRadius: 'var(--r-md)', border: '1.5px solid var(--border)' }} />
                      </div>
                    ))}
                  </div>

                  <button className="btn btn-primary" style={{ fontSize: 13, padding: '11px 24px', marginBottom: 28 }}>
                    <Navigation size={14} /> Find Best Routes
                  </button>

                  {/* Map placeholder */}
                  <div style={{
                    height: 200, borderRadius: 'var(--r-md)',
                    background: 'linear-gradient(135deg, #e8f4fd, #d4eef9)',
                    border: '1px solid var(--border)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    marginBottom: 24,
                  }}>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 32, marginBottom: 8 }}>🗺️</div>
                      <p style={{ color: 'var(--muted)', fontSize: 13 }}>Interactive map (Google Maps / OpenStreetMap integration)</p>
                    </div>
                  </div>

                  {/* Transport options */}
                  <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 16, color: 'var(--ink)', marginBottom: 14 }}>Transport Comparison</h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {transportOptions.map(opt => (
                      <div key={opt.name} style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        padding: '14px 18px',
                        background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 10,
                        flexWrap: 'wrap', gap: 10,
                      }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                          <span style={{ fontSize: 20 }}>{opt.mode}</span>
                          <span style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 14, color: 'var(--ink)' }}>{opt.name}</span>
                        </div>
                        <div style={{ display: 'flex', gap: 16 }}>
                          <span style={{ fontSize: 13, color: 'var(--muted)' }}>⏱ {opt.time}</span>
                          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>{opt.cost}</span>
                          <span style={{ fontSize: 12, color: 'var(--muted)' }}>★ {opt.rating}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* ── UTILITIES TAB ── */}
              {activeTab === 'utilities' && (
                <div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 20, color: 'var(--ink)', marginBottom: 24 }}>Travel Utilities</h2>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 20 }}>
                    {/* Emergency contacts */}
                    <div style={{ padding: 20, background: 'var(--cream)', border: '1.5px solid rgba(232,84,26,0.2)', borderRadius: 'var(--r-md)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                        <AlertTriangle size={18} style={{ color: 'var(--accent)' }} />
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>Emergency Contacts</h3>
                      </div>
                      {[
                        { country: 'Greece', police: '100', ambulance: '166', embassy: '+1-202-939-5800' },
                        { country: 'Japan', police: '110', ambulance: '119', embassy: '+81-3-3224-5000' },
                      ].map(c => (
                        <div key={c.country} style={{ marginBottom: 12, padding: '10px 12px', background: 'white', borderRadius: 8 }}>
                          <div style={{ fontWeight: 700, fontSize: 13, color: 'var(--ink)', marginBottom: 6 }}>{c.country}</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Police: {c.police} · Ambulance: {c.ambulance}</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>Embassy: {c.embassy}</div>
                        </div>
                      ))}
                    </div>

                    {/* Language phrases */}
                    <div style={{ padding: 20, background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
                      <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, color: 'var(--ink)', marginBottom: 14 }}>🗣️ Language Phrase Guide</h3>
                      {[
                        { phrase: 'Hello', japanese: 'こんにちは (Konnichiwa)', greek: 'Γεια σας (Yia sas)' },
                        { phrase: 'Thank you', japanese: 'ありがとう (Arigatou)', greek: 'Ευχαριστώ (Efcharistó)' },
                        { phrase: 'Where is...?', japanese: '...はどこですか？', greek: 'Πού είναι...;' },
                      ].map(p => (
                        <div key={p.phrase} style={{ marginBottom: 10, padding: '8px 12px', background: 'white', borderRadius: 8 }}>
                          <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--ink)', marginBottom: 4 }}>{p.phrase}</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>JP: {p.japanese}</div>
                          <div style={{ fontSize: 12, color: 'var(--muted)' }}>GR: {p.greek}</div>
                        </div>
                      ))}
                    </div>

                    {/* Offline maps */}
                    <div style={{ padding: 20, background: 'var(--cream)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                        <Download size={18} style={{ color: 'var(--accent2)' }} />
                        <h3 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 15, color: 'var(--ink)' }}>Offline Maps</h3>
                      </div>
                      <p style={{ color: 'var(--muted)', fontSize: 13, marginBottom: 14, lineHeight: 1.7 }}>
                        Download maps for your destination to use without internet — perfect for remote areas.
                      </p>
                      {['Greece (Santorini)', 'Japan (Kyoto)'].map(map => (
                        <div key={map} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8, padding: '10px 12px', background: 'white', borderRadius: 8 }}>
                          <span style={{ fontSize: 13, color: 'var(--ink)', fontWeight: 500 }}>{map}</span>
                          <button style={{ fontSize: 11, color: 'var(--accent2)', fontWeight: 700, fontFamily: 'var(--font-heading)', cursor: 'pointer' }}>DOWNLOAD</button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ── BUDDY TAB ── */}
              {activeTab === 'buddy' && (
                <div style={{ textAlign: 'center', padding: '40px 20px' }}>
                  <div style={{ fontSize: 48, marginBottom: 16 }}>🤝</div>
                  <h2 style={{ fontFamily: 'var(--font-heading)', fontWeight: 700, fontSize: 22, color: 'var(--ink)', marginBottom: 10 }}>
                    Find a Travel Buddy
                  </h2>
                  <p style={{ color: 'var(--muted)', fontSize: 15, marginBottom: 28, maxWidth: 400, margin: '0 auto 28px', lineHeight: 1.7 }}>
                    Link your trip to the buddy matching system to find a compatible travel companion who shares your destination and dates.
                  </p>
                  <Link to="/buddy" className="btn btn-primary" style={{ fontSize: 15, padding: '14px 32px' }}>
                    Go to Buddy Matching <ArrowRight size={15} />
                  </Link>
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
