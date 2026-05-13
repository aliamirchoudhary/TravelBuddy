import { useState, useEffect, useRef } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Compass, Users, Video, Star, Globe, ShieldCheck, Heart, ArrowUpRight, ChevronRight } from 'lucide-react';
import CountUp from 'react-countup';
import { useInView } from 'react-intersection-observer';
import useAuthStore from '../store/authStore';
import IntentGateway from '../components/IntentGateway';
import Navbar from '../components/Navbar';
import api from '../services/api';

const LandingPage = () => {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthStore();
  const [trending, setTrending] = useState([]);
  const [stats, setStats] = useState({ totalUsers: 0, tripsPlanned: 0, countriesCovered: 0 });

  // ── Section refs for smooth-scroll ──
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const trendingRef = useRef(null);
  const statsRef = useRef(null);

  // Expose scroll helpers so Navbar can reach them
  useEffect(() => {
    window.__tbScroll = {
      hero: () => heroRef.current?.scrollIntoView({ behavior: 'smooth' }),
      features: () => featuresRef.current?.scrollIntoView({ behavior: 'smooth' }),
      trending: () => trendingRef.current?.scrollIntoView({ behavior: 'smooth' }),
      stats: () => statsRef.current?.scrollIntoView({ behavior: 'smooth' }),
    };
    return () => { delete window.__tbScroll; };
  }, []);

  // Auth redirect
  useEffect(() => {
    if (isAuthenticated) navigate('/social-hub');
  }, [isAuthenticated, navigate]);

  useEffect(() => {
    api.get('/explore/trending?limit=6')
      .then(res => setTrending(res.data))
      .catch(() => { });
    api.get('/stats/platform')
      .then(res => setStats(res.data))
      .catch(() => { });
  }, []);

  // CountUp fires only when stats section enters view
  const { ref: statsInViewRef, inView: statsInView } = useInView({ triggerOnce: true, threshold: 0.3 });

  const features = [
    {
      icon: <Compass className="w-8 h-8 text-blue-500" />,
      title: 'AI Trip Planner',
      description: 'Generate full day-by-day itineraries for any destination in seconds using AI.',
      cta: 'Start planning',
      path: '/planner/new',
      needsAuth: true,
    },
    {
      icon: <Users className="w-8 h-8 text-cyan-500" />,
      title: 'Find a Buddy',
      description: 'Match with verified travellers heading to the same destination at the same time.',
      cta: 'Find matches',
      path: '/find-buddy',
      needsAuth: true,
    },
    {
      icon: <Video className="w-8 h-8 text-purple-500" />,
      title: 'Vlogger Hub',
      description: 'Follow top creators, share your journey, and build your own travel audience.',
      cta: 'Explore hub',
      path: '/vlogger-hub',
      needsAuth: false,
    },
  ];

  const handleFeatureClick = (feature) => {
    if (feature.needsAuth && !isAuthenticated) {
      // Scroll to gateway instead of 404
      heroRef.current?.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate(feature.path);
    }
  };

  // Fallback cities while API loads
  const fallbackCities = [
    { CityID: 1, CityName: 'Kyoto', CountryName: 'Japan', FlagEmoji: '🇯🇵', TrustScore: '4.9', ThumbnailURL: 'https://images.unsplash.com/photo-1493976040374-85c8e12f0c0e?w=800&q=80' },
    { CityID: 2, CityName: 'Santorini', CountryName: 'Greece', FlagEmoji: '🇬🇷', TrustScore: '4.8', ThumbnailURL: 'https://images.unsplash.com/photo-1570077188670-e3a8d69ac5ff?w=800&q=80' },
    { CityID: 3, CityName: 'Marrakech', CountryName: 'Morocco', FlagEmoji: '🇲🇦', TrustScore: '4.7', ThumbnailURL: 'https://images.unsplash.com/photo-1597212720158-0f07c62f4c60?w=800&q=80' },
    { CityID: 4, CityName: 'Amalfi', CountryName: 'Italy', FlagEmoji: '🇮🇹', TrustScore: '4.9', ThumbnailURL: 'https://images.unsplash.com/photo-1533606688076-b6683a5f59f1?w=800&q=80' },
    { CityID: 5, CityName: 'Queenstown', CountryName: 'New Zealand', FlagEmoji: '🇳🇿', TrustScore: '4.8', ThumbnailURL: 'https://images.unsplash.com/photo-1507699622108-4be3abd695ad?w=800&q=80' },
    { CityID: 6, CityName: 'Cartagena', CountryName: 'Colombia', FlagEmoji: '🇨🇴', TrustScore: '4.7', ThumbnailURL: 'https://images.unsplash.com/photo-1605217613423-0aea4fb32906?w=800&q=80' },
  ];

  const displayCities = trending.length > 0 ? trending : fallbackCities;

  return (
    <div className="bg-[#030712] text-white min-h-screen">
      <Navbar scrollRefs={{ heroRef, featuresRef, trendingRef, statsRef }} />

      {/* ── HERO ── */}
      <section
        ref={heroRef}
        id="hero"
        className="relative min-h-[90vh] flex items-center justify-center overflow-hidden pt-20"
      >
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[#0b0f1a]" />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 via-transparent to-cyan-600/10" />
        </div>

        <div className="section-container relative z-10 flex flex-col items-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12 max-w-4xl"
          >
            <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter-custom leading-tight">
              Your Next <span className="text-gradient">Adventure</span> <br /> Starts Here
            </h1>
            <p className="text-lg md:text-xl text-gray-400 font-medium max-w-xl mx-auto leading-relaxed">
              Plan trips. Find travel buddies. Share experiences. <br className="hidden md:block" />
              The all-in-one platform for the modern explorer.
            </p>

            {/* Quick-scroll pills */}
            <div className="flex flex-wrap justify-center gap-3 mt-8">
              {[
                { label: '✨ Features', action: () => featuresRef.current?.scrollIntoView({ behavior: 'smooth' }) },
                { label: '🌍 Trending', action: () => trendingRef.current?.scrollIntoView({ behavior: 'smooth' }) },
                { label: '📊 Stats', action: () => statsRef.current?.scrollIntoView({ behavior: 'smooth' }) },
              ].map((pill) => (
                <button
                  key={pill.label}
                  onClick={pill.action}
                  className="px-5 py-2 rounded-full text-sm font-bold bg-white/5 border border-white/10 text-gray-300 hover:bg-white/10 hover:text-white hover:scale-105 transition-all duration-200"
                >
                  {pill.label}
                </button>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.1 }}
            className="w-full max-w-lg"
          >
            <IntentGateway />
          </motion.div>
        </div>
      </section>

      {/* ── FEATURE HIGHLIGHTS ── */}
      <section ref={featuresRef} id="features" className="py-24 relative">
        <div className="section-container">
          <motion.div
            initial={{ opacity: 0, y: 12 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-14"
          >
            <span className="inline-block px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest bg-blue-600/10 text-blue-400 border border-blue-600/20 mb-5">
              Platform Pillars
            </span>
            <h2 className="text-3xl md:text-5xl font-black tracking-tight mb-4">
              Everything you need<br />to travel smarter
            </h2>
            <p className="text-gray-400 font-medium max-w-md mx-auto">
              Three powerful tools, one seamless experience.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="bento-item p-8 group cursor-pointer flex flex-col"
                onClick={() => handleFeatureClick(f)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && handleFeatureClick(f)}
              >
                <div className="mb-6 p-3 rounded-xl bg-blue-600/10 w-fit">
                  {f.icon}
                </div>
                <h3 className="text-xl font-bold mb-3">{f.title}</h3>
                <p className="text-gray-400 text-base leading-relaxed flex-1">{f.description}</p>
                <div className="mt-6 flex items-center gap-2 text-sm font-bold text-blue-400 group-hover:text-blue-300 transition-colors">
                  <span>{f.cta}</span>
                  <ArrowUpRight size={15} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── TRENDING DESTINATIONS ── */}
      <section ref={trendingRef} id="trending" className="py-24 bg-white/[0.02] border-y border-white/5">
        <div className="section-container">
          <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-4">
            <div>
              <h2 className="text-3xl md:text-5xl font-black mb-4 tracking-tight">Trending Destinations</h2>
              <p className="text-gray-400 font-medium">Verified by our community for safety and excitement.</p>
            </div>
            <Link
              to="/explore"
              className="btn-outline px-6 py-2 text-sm inline-flex items-center gap-2 group"
            >
              <span>Explore All</span>
              <ArrowUpRight size={14} className="group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayCities.map((city, i) => (
              <motion.div
                key={city.CityID}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="group relative h-[360px] rounded-3xl overflow-hidden cursor-pointer border border-white/5 hover:border-blue-500/30 transition-all duration-300"
                onClick={() => navigate(`/explore?city=${city.CityID}`)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => e.key === 'Enter' && navigate(`/explore?city=${city.CityID}`)}
              >
                <img
                  src={city.ThumbnailURL || 'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=800&q=80'}
                  alt={city.CityName}
                  className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
                <div className="absolute inset-0 bg-blue-600/0 group-hover:bg-blue-600/8 transition-colors duration-300" />

                <div className="absolute bottom-8 left-8 right-8">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-xl">{city.FlagEmoji}</span>
                    <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">{city.CountryName}</span>
                  </div>
                  <h4 className="text-3xl font-black mb-3 tracking-tight">{city.CityName}</h4>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5">
                      <Star size={16} fill="#fbbf24" className="text-yellow-400" />
                      <span className="font-bold text-sm">{city.TrustScore || '4.8'}</span>
                    </div>
                    <span className="text-xs font-bold opacity-0 group-hover:opacity-70 transition-opacity flex items-center gap-1">
                      View city <ChevronRight size={12} />
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── STATS / SOCIAL PROOF ── */}
      <section
        ref={(el) => { statsRef.current = el; statsInViewRef(el); }}
        id="stats"
        className="py-24 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-blue-600 opacity-10 blur-[100px]" />
        <div className="section-container relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            {[
              { end: stats.totalUsers || 12450, color: 'text-blue-500', label: 'Travellers Registered', sep: true },
              { end: stats.tripsPlanned || 3820, color: 'text-cyan-500', label: 'Trips Planned', sep: true },
              { end: stats.countriesCovered || 84, color: 'text-purple-500', label: 'Countries Covered', sep: false },
            ].map((s, i) => (
              <div key={i} className="space-y-4">
                <div className={`text-6xl font-black tracking-tighter ${s.color}`}>
                  {statsInView
                    ? <CountUp end={s.end} duration={3} separator={s.sep ? ',' : ''} />
                    : '0'}+
                </div>
                <div className="text-sm font-black uppercase tracking-[0.3em] text-gray-500">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer id="footer" className="pt-32 pb-16 border-t border-white/10">
        <div className="section-container">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-24">

            {/* Brand */}
            <div className="col-span-1 md:col-span-2">
              <Link to="/" className="flex items-center gap-4 mb-8 group">
                <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
                  <span className="text-white font-black text-2xl">T</span>
                </div>
                <span className="text-3xl font-black text-white tracking-tighter">TravelBuddy</span>
              </Link>
              <p className="text-gray-500 text-lg max-w-md mb-10 leading-relaxed">
                Empowering travellers through AI-driven planning, verified safety, and a cinematic social community.
              </p>
              <div className="flex gap-6">
                <button
                  onClick={() => window.open('https://travelbuddy.com', '_blank')}
                  className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all group"
                  aria-label="Website"
                >
                  <Globe size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                </button>
                <Link
                  to="/guidelines"
                  className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center hover:bg-white/10 hover:border-white/20 transition-all group"
                  aria-label="Safety guidelines"
                >
                  <ShieldCheck size={20} className="text-gray-400 group-hover:text-white transition-colors" />
                </Link>
              </div>
            </div>

            {/* Platform links */}
            <div>
              <h4 className="font-black text-xs uppercase tracking-[0.3em] mb-10 text-gray-400">Platform</h4>
              <ul className="space-y-6">
                {[
                  { label: 'Platform Hub', to: '/explore', needsAuth: false },
                  { label: 'AI Planner', to: '/planner/new', needsAuth: true },
                  { label: 'Buddy Match', to: '/find-buddy', needsAuth: true },
                  { label: 'Creator Lab', to: '/vlogger-hub', needsAuth: false },
                ].map((link) => (
                  <li key={link.to}>
                    <Link
                      to={link.needsAuth && !isAuthenticated ? '/' : link.to}
                      onClick={() => {
                        if (link.needsAuth && !isAuthenticated) {
                          heroRef.current?.scrollIntoView({ behavior: 'smooth' });
                        }
                      }}
                      className="text-gray-500 hover:text-white transition-colors font-bold inline-flex items-center gap-1.5 group"
                    >
                      {link.label}
                      <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Support links */}
            <div>
              <h4 className="font-black text-xs uppercase tracking-[0.3em] mb-10 text-gray-400">Support</h4>
              <ul className="space-y-6">
                {[
                  { label: 'Guidelines', to: '/guidelines' },
                  { label: 'Contact Support', href: 'mailto:zohaib.mzg158@gmail.com' },
                  { label: 'Privacy Policy', to: '/privacy' },
                  { label: 'Terms of Service', to: '/terms' },
                ].map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <a
                        href={link.href}
                        className="text-gray-500 hover:text-white transition-colors font-bold inline-flex items-center gap-1.5 group"
                      >
                        {link.label}
                        <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </a>
                    ) : (
                      <Link
                        to={link.to}
                        className="text-gray-500 hover:text-white transition-colors font-bold inline-flex items-center gap-1.5 group"
                      >
                        {link.label}
                        <ArrowUpRight size={12} className="opacity-0 group-hover:opacity-100 transition-opacity" />
                      </Link>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Back to top */}
          <div className="flex justify-center mb-12">
            <button
              onClick={() => heroRef.current?.scrollIntoView({ behavior: 'smooth' })}
              className="flex items-center gap-2 px-6 py-3 rounded-2xl bg-white/5 border border-white/10 text-gray-500 hover:text-white hover:bg-white/10 hover:border-white/20 transition-all text-sm font-bold group"
            >
              <span>Back to top</span>
              <span className="inline-block group-hover:-translate-y-0.5 transition-transform">↑</span>
            </button>
          </div>

          <div className="flex flex-col md:flex-row justify-between items-center gap-10 pt-16 border-t border-white/5">
            <p className="text-gray-700 text-xs font-black uppercase tracking-[0.5em]">
              &copy; 2026 TravelBuddy. All Rights Reserved.
            </p>
            <div className="flex items-center gap-4 text-xs font-black uppercase tracking-widest text-gray-700">
              <span>Built with</span>
              <Heart size={14} className="text-red-500 fill-red-500" />
              <span>for explorers</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;
