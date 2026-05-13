import { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Menu, X, Compass, Map, Users, Video, Bell, User, LogOut, ChevronDown } from 'lucide-react';
import useAuthStore from '../store/authStore';
import useGatewayStore from '../store/gatewayStore';

const navLinks = [
  { to: '/explore', label: 'Explore', icon: Compass },
  { to: '/planner/new', label: 'Plan a Trip', icon: Map, needsAuth: true },
  { to: '/find-buddy', label: 'Find a Buddy', icon: Users, needsAuth: true },
  { to: '/vlogger-hub', label: 'Vloggers', icon: Video },
];

const Navbar = ({ scrollRefs }) => {
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('');

  const location = useLocation();
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { resetGateway } = useGatewayStore();

  const isLanding = location.pathname === '/';

  // ── Scroll shadow ──
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // ── Active section tracker (landing page only) ──
  useEffect(() => {
    if (!isLanding) return;
    const ids = ['hero', 'features', 'trending', 'stats', 'footer'];
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) setActiveSection(entry.target.id);
        });
      },
      { threshold: 0.3 }
    );
    ids.forEach(id => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });
    return () => observer.disconnect();
  }, [isLanding]);

  // Close mobile menu on route change
  useEffect(() => setMobileOpen(false), [location.pathname]);

  // ── Link click handler ──
  // If user is unauthenticated and link needs auth → show gateway on landing,
  // or navigate to landing first and then gateway resets.
  const handleLinkClick = (e, link) => {
    if (link.needsAuth && !isAuthenticated) {
      e.preventDefault();
      resetGateway();
      if (location.pathname !== '/') {
        navigate('/');
      } else {
        window.__tbScroll?.hero();
      }
    }
  };

  // ── Logo click: if on landing scroll to top, else navigate home ──
  const handleLogoClick = (e) => {
    if (isLanding) {
      e.preventDefault();
      window.__tbScroll?.hero();
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  // Utility: is a nav link currently "active"?
  const isActive = (link) => {
    if (!isLanding) return location.pathname === link.to;
    // On landing page, no nav link is "active" — we use section highlighting instead
    return false;
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-[1000] transition-all duration-300 ${scrolled
        ? 'bg-[#030712]/90 backdrop-blur-md border-b border-white/10 py-3 shadow-lg'
        : 'bg-transparent py-5'
        }`}
    >
      <div className="max-w-7xl mx-auto px-6 flex justify-between items-center">

        {/* ── Logo ── */}
        <Link to="/" onClick={handleLogoClick} className="flex items-center gap-3 group">
          <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20 group-hover:scale-105 transition-transform">
            <span className="text-white font-black text-xl">T</span>
          </div>
          <span className="text-2xl font-black text-white tracking-tighter">TravelBuddy</span>
        </Link>

        {/* ── Desktop Nav Links ── */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map((link) => (
            <Link
              key={link.to}
              to={link.to}
              onClick={(e) => handleLinkClick(e, link)}
              className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all relative group ${isActive(link)
                ? 'text-white bg-white/10'
                : 'text-gray-400 hover:text-white hover:bg-white/5'
                }`}
            >
              {link.label}
              {/* Underline indicator for active route (non-landing) */}
              {isActive(link) && (
                <motion.div
                  layoutId="nav-active-indicator"
                  className="absolute bottom-0 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-blue-500"
                />
              )}
              {/* Auth lock hint */}
              {link.needsAuth && !isAuthenticated && (
                <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-blue-500 opacity-0 group-hover:opacity-100 transition-opacity" />
              )}
            </Link>
          ))}
        </div>

        {/* ── Right Actions ── */}
        <div className="hidden md:flex items-center gap-4">
          {isAuthenticated ? (
            <div className="flex items-center gap-5">
              <div className="flex items-center gap-3 pr-4 border-r border-white/10">
                <button className="text-gray-400 hover:text-white transition-colors relative">
                  <Bell size={20} />
                  {/* Notification dot */}
                  <span className="absolute -top-0.5 -right-0.5 w-2 h-2 rounded-full bg-blue-500" />
                </button>
                <Link
                  to="/TripPlanner"
                  className="text-sm font-bold text-gray-400 hover:text-white transition-colors"
                >
                  My Trips
                </Link>
              </div>
              <div className="flex items-center gap-4">
                <Link to="/profile" className="flex items-center gap-3 group">
                  <div className="w-9 h-9 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold border-2 border-white/20 overflow-hidden group-hover:border-blue-400 transition-colors">
                    {user?.avatarUrl
                      ? <img src={user.avatarUrl} alt="" className="w-full h-full object-cover" />
                      : <User size={18} />
                    }
                  </div>
                  <span className="text-sm font-bold text-white group-hover:text-blue-400 transition-colors">
                    {user?.displayName?.split(' ')[0]}
                  </span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-red-400 hover:text-red-500 transition-colors hover:scale-110"
                  title="Logout"
                >
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link
                to="/login"
                className="px-6 py-2.5 rounded-xl font-bold text-sm text-white hover:bg-white/5 transition-all"
              >
                Login
              </Link>
              <Link
                to="/signup"
                className="bg-blue-600 text-white px-8 py-2.5 rounded-xl font-bold text-sm shadow-lg shadow-blue-600/20 hover:bg-blue-700 hover:scale-105 transition-all"
              >
                Sign Up
              </Link>
            </div>
          )}
        </div>

        {/* ── Mobile Menu Toggle ── */}
        <button
          className="md:hidden p-2 text-white/70 hover:text-white transition-colors"
          onClick={() => setMobileOpen(!mobileOpen)}
          aria-label="Toggle menu"
        >
          {mobileOpen ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* ── Mobile Menu ── */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden bg-[#030712] border-t border-white/10 overflow-hidden"
          >
            <div className="px-6 py-8 space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.to}
                  to={link.to}
                  onClick={(e) => {
                    handleLinkClick(e, link);
                    setMobileOpen(false);
                  }}
                  className={`flex items-center gap-4 px-6 py-4 rounded-2xl font-bold transition-all ${location.pathname === link.to
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                    }`}
                >
                  <link.icon size={22} className="text-blue-600" />
                  <span>{link.label}</span>
                  {link.needsAuth && !isAuthenticated && (
                    <span className="ml-auto text-[10px] font-black uppercase tracking-widest text-blue-500 bg-blue-500/10 px-2 py-0.5 rounded-full">
                      Login needed
                    </span>
                  )}
                </Link>
              ))}

              {/* Mobile section quick-jumps (landing only) */}
              {isLanding && (
                <div className="pt-4 border-t border-white/5">
                  <p className="text-[10px] font-black uppercase tracking-widest text-gray-600 px-6 mb-3">
                    Jump to section
                  </p>
                  {[
                    { label: 'Features', action: () => { window.__tbScroll?.features(); setMobileOpen(false); } },
                    { label: 'Trending', action: () => { window.__tbScroll?.trending(); setMobileOpen(false); } },
                    { label: 'Stats', action: () => { window.__tbScroll?.stats(); setMobileOpen(false); } },
                  ].map((s) => (
                    <button
                      key={s.label}
                      onClick={s.action}
                      className="w-full text-left flex items-center gap-4 px-6 py-3 rounded-2xl text-gray-500 hover:text-white hover:bg-white/5 font-bold text-sm transition-all"
                    >
                      <ChevronDown size={16} className="text-blue-600 rotate-[-90deg]" />
                      {s.label}
                    </button>
                  ))}
                </div>
              )}

              {/* Auth buttons */}
              <div className="pt-6 mt-2 border-t border-white/10 grid grid-cols-2 gap-4">
                {isAuthenticated ? (
                  <>
                    <Link
                      to="/profile"
                      className="flex items-center justify-center gap-2 p-4 bg-white/5 rounded-2xl font-bold text-white"
                      onClick={() => setMobileOpen(false)}
                    >
                      <User size={18} /> Profile
                    </Link>
                    <button
                      onClick={() => { handleLogout(); setMobileOpen(false); }}
                      className="flex items-center justify-center gap-2 p-4 bg-red-500/10 text-red-500 rounded-2xl font-bold"
                    >
                      <LogOut size={18} /> Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      className="flex items-center justify-center p-4 bg-white/5 rounded-2xl font-bold text-white"
                      onClick={() => setMobileOpen(false)}
                    >
                      Login
                    </Link>
                    <Link
                      to="/signup"
                      className="flex items-center justify-center p-4 bg-blue-600 text-white rounded-2xl font-bold shadow-lg shadow-blue-600/20"
                      onClick={() => setMobileOpen(false)}
                    >
                      Sign Up
                    </Link>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

export default Navbar;
