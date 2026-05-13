import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../services/api';
import { motion, AnimatePresence } from 'framer-motion';
import { FiSearch, FiMapPin, FiStar, FiFilter, FiTrendingUp, FiVideo, FiDollarSign, FiSun } from 'react-icons/fi';

const ExplorePage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [search, setSearch] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [filters, setFilters] = useState({ continent: '', budgetMax: '', season: '' });
  const [showFilters, setShowFilters] = useState(false);

  const [featured, setFeatured] = useState(null);
  const [popular, setPopular] = useState([]);
  const [trending, setTrending] = useState([]);
  const [vloggerContent, setVloggerContent] = useState([]);
  const [filtered, setFiltered] = useState([]);
  const [isFiltering, setIsFiltering] = useState(false);

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [featuredRes, popularRes, trendingRes, vloggerRes] = await Promise.all([
          api.get('/explore/featured'),
          api.get('/explore/popular'),
          api.get('/explore/trending'),
          api.get('/explore/vlogger-content'),
        ]);
        setFeatured(featuredRes.data);
        setPopular(popularRes.data);
        setTrending(trendingRes.data);
        setVloggerContent(vloggerRes.data);
      } catch (err) {
        console.error('Failed to load explore data:', err);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, []);

  // Pre-fill search from URL query param (e.g. /explore?search=Kyoto)
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const q = params.get('search');
    if (q) setSearch(q);
  }, [location.search]);

  // Search with debounce
  useEffect(() => {
    if (search.length < 2) {
      setSearchResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      try {
        const res = await api.get(`/explore/search?q=${encodeURIComponent(search)}`);
        setSearchResults(res.data);
      } catch (err) {
        console.error('Search failed:', err);
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [search]);

  const applyFilters = async () => {
    setIsFiltering(true);
    try {
      const params = new URLSearchParams();
      if (filters.continent) params.append('continent', filters.continent);
      if (filters.budgetMax) params.append('budgetMax', filters.budgetMax);
      if (filters.season) params.append('season', filters.season);
      
      const res = await api.get(`/explore/filter?${params.toString()}`);
      setFiltered(res.data);
    } catch (err) {
      console.error('Filter failed:', err);
    } finally {
      setIsFiltering(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
        <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
        <p className="mt-4 text-gray-600 font-medium animate-pulse">Discovering destinations...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white pb-20">
      {/* STICKY HEADER WITH SEARCH */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-md border-b border-gray-100 py-4 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row gap-4 items-center">
            <div className="relative w-full max-w-2xl group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 group-focus-within:text-blue-500 transition-colors">
                <FiSearch className="w-5 h-5" />
              </div>
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search destinations, cities, attractions..."
                className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all text-gray-700"
              />
              
              {/* Search Results Dropdown */}
              <AnimatePresence>
                {searchResults.length > 0 && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 bg-white border border-gray-100 rounded-2xl shadow-2xl z-40 mt-2 overflow-hidden"
                  >
                    {searchResults.map((result, idx) => (
                      <div
                        key={idx}
                        onClick={() => navigate(`/destination/${result.CityID}`)}
                        className="flex items-center gap-4 px-5 py-4 hover:bg-blue-50 cursor-pointer transition-colors border-b border-gray-50 last:border-0"
                      >
                        <div className="w-12 h-12 rounded-xl bg-gray-200 overflow-hidden flex-shrink-0">
                          <img src={result.ThumbnailURL} alt="" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex-1">
                          <div className="font-bold text-gray-800 flex items-center gap-2">
                            {result.CityName} <span className="text-lg">{result.FlagEmoji}</span>
                          </div>
                          <div className="text-xs text-gray-500 font-medium uppercase tracking-wider">
                            {result.CountryName} • {result.EntityType}
                          </div>
                        </div>
                        <div className="text-yellow-500 flex items-center gap-1 font-bold">
                          <FiStar className="fill-current" /> {result.TrustScore?.toFixed(1)}
                        </div>
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button 
              onClick={() => setShowFilters(!showFilters)}
              className={`flex items-center gap-2 px-6 py-3 rounded-2xl font-bold transition-all ${showFilters ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}
            >
              <FiFilter /> Filters
            </button>
          </div>

          {/* EXPANDABLE FILTERS */}
          <AnimatePresence>
            {showFilters && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                className="overflow-hidden"
              >
                <div className="pt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Continent</label>
                    <select
                      value={filters.continent}
                      onChange={(e) => setFilters({ ...filters, continent: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    >
                      <option value="">Global</option>
                      <option value="Asia">Asia</option>
                      <option value="Europe">Europe</option>
                      <option value="North America">North America</option>
                      <option value="South America">South America</option>
                      <option value="Africa">Africa</option>
                      <option value="Oceania">Oceania</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Season</label>
                    <select
                      value={filters.season}
                      onChange={(e) => setFilters({ ...filters, season: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    >
                      <option value="">Any Season</option>
                      <option value="Winter">Winter</option>
                      <option value="Spring">Spring</option>
                      <option value="Summer">Summer</option>
                      <option value="Autumn">Autumn</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-widest pl-1">Budget Max</label>
                    <select
                      value={filters.budgetMax}
                      onChange={(e) => setFilters({ ...filters, budgetMax: e.target.value })}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 focus:ring-2 focus:ring-blue-500/20 outline-none"
                    >
                      <option value="">No Limit</option>
                      <option value="50">Under $50/day</option>
                      <option value="100">Under $100/day</option>
                      <option value="200">Under $200/day</option>
                      <option value="500">Under $500/day</option>
                    </select>
                  </div>

                  <div className="flex items-end">
                    <button 
                      onClick={applyFilters}
                      className="w-full bg-black text-white rounded-xl py-2.5 font-bold hover:bg-gray-800 transition-colors shadow-lg"
                    >
                      Search Destinations
                    </button>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        
        {/* FILTER RESULTS SECTION */}
        {filtered.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-black text-gray-900 mb-6 flex items-center gap-2">
              <span className="w-2 h-8 bg-blue-600 rounded-full" />
              Filter Results ({filtered.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filtered.map((city) => (
                <DestinationCard key={city.CityID} city={city} navigate={navigate} />
              ))}
            </div>
            <div className="mt-8 border-b border-gray-100" />
          </div>
        )}

        {/* HERO FEATURED DESTINATION */}
        {featured && !filtered.length && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="relative rounded-[2.5rem] overflow-hidden aspect-[21/9] min-h-[350px] mb-12 shadow-2xl group cursor-pointer"
            onClick={() => navigate(`/destination/${featured.CityID}`)}
          >
            <img 
              src={featured.ThumbnailURL} 
              alt={featured.CityName} 
              className="absolute inset-0 w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
            <div className="absolute bottom-0 left-0 p-10 text-white max-w-2xl">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-yellow-400 text-black text-xs font-black uppercase tracking-widest mb-4 shadow-xl">
                <FiStar className="fill-current" /> Daily Featured
              </div>
              <h1 className="text-5xl md:text-7xl font-black mb-4 tracking-tighter">
                {featured.CityName} <span className="text-4xl md:text-5xl">{featured.FlagEmoji}</span>
              </h1>
              <p className="text-lg text-gray-200 mb-6 font-medium line-clamp-2 max-w-lg leading-relaxed">
                {featured.Description || `Experience the breathtaking beauty and vibrant culture of ${featured.CityName}. Explore hidden gems and world-class attractions.`}
              </p>
              <div className="flex flex-wrap gap-4 items-center">
                <button className="bg-white text-black px-8 py-4 rounded-2xl font-black hover:scale-105 transition-transform shadow-xl">
                  Explore Now
                </button>
                <div className="flex gap-6 text-sm font-bold bg-black/30 backdrop-blur-md px-6 py-4 rounded-2xl border border-white/10">
                  <span className="flex items-center gap-2"><FiStar className="text-yellow-400" /> {featured.TrustScore?.toFixed(1)}</span>
                  <span className="flex items-center gap-2"><FiDollarSign className="text-green-400" /> ${featured.AvgDailyBudget}/day</span>
                  <span className="flex items-center gap-2"><FiSun className="text-orange-400" /> {featured.BestSeasonVisit}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* POPULAR RIGHT NOW */}
        <section className="mb-12 overflow-hidden">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <FiTrendingUp className="text-blue-600" /> Popular Right Now
            </h2>
            <div className="flex gap-2">
              <div className="w-8 h-1 bg-gray-200 rounded-full" />
              <div className="w-4 h-1 bg-gray-100 rounded-full" />
            </div>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide -mx-4 px-4 snap-x">
            {popular.map((city) => (
              <div key={city.CityID} className="min-w-[280px] snap-start">
                <DestinationCard city={city} navigate={navigate} />
              </div>
            ))}
          </div>
        </section>

        {/* TRENDING IN REGION */}
        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <FiMapPin className="text-red-500" /> Trending in Your Region
            </h2>
            <span className="text-sm font-bold text-blue-600 cursor-pointer hover:underline">View All</span>
          </div>
          <div className="flex gap-6 overflow-x-auto pb-8 scrollbar-hide -mx-4 px-4 snap-x">
            {trending.length > 0 ? trending.map((city) => (
              <div key={city.CityID} className="min-w-[280px] snap-start">
                <DestinationCard city={city} navigate={navigate} />
              </div>
            )) : (
              <div className="w-full bg-gray-50 rounded-3xl py-12 text-center border-2 border-dashed border-gray-200">
                <p className="text-gray-400 font-bold italic">No regional data yet. Exploring global trends...</p>
              </div>
            )}
          </div>
        </section>

        {/* VLOGGER CONTENT GRID */}
        <section className="mb-20">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-black text-gray-900 flex items-center gap-3">
              <FiVideo className="text-purple-600" /> Travel Stories
            </h2>
            <div className="flex items-center gap-2 bg-purple-50 text-purple-600 px-4 py-2 rounded-full text-xs font-black tracking-widest uppercase">
              <span className="w-2 h-2 bg-purple-600 rounded-full animate-ping" /> Live Inspiration
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {vloggerContent.map((post) => (
              <VloggerCard key={post.PostID} post={post} />
            ))}
          </div>
        </section>

      </div>
    </div>
  );
};

// COMPONENT: Destination Card
const DestinationCard = ({ city, navigate }) => (
  <motion.div 
    whileHover={{ y: -10 }}
    className="bg-white rounded-[2rem] overflow-hidden shadow-lg border border-gray-100 group cursor-pointer h-full"
    onClick={() => navigate(`/destination/${city.CityID}`)}
  >
    <div className="relative aspect-[4/5] overflow-hidden">
      <img 
        src={city.ThumbnailURL} 
        alt={city.CityName} 
        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 group-hover:opacity-90 transition-opacity" />
      
      <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-md px-3 py-1.5 rounded-full shadow-lg flex items-center gap-1.5 text-sm font-black">
        <FiStar className="text-yellow-500 fill-current" /> {city.TrustScore?.toFixed(1)}
      </div>

      <div className="absolute bottom-5 left-5 right-5 text-white">
        <div className="text-xs font-bold uppercase tracking-widest text-blue-400 mb-1">{city.CountryName}</div>
        <h3 className="text-2xl font-black tracking-tight">{city.CityName} {city.FlagEmoji}</h3>
      </div>
    </div>
    <div className="p-5 flex justify-between items-center bg-white">
      <div className="space-y-0.5">
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Avg. Budget</div>
        <div className="text-lg font-black text-gray-900">${city.AvgDailyBudget}<span className="text-xs text-gray-400">/day</span></div>
      </div>
      <div className="space-y-0.5 text-right">
        <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Best Time</div>
        <div className="text-sm font-bold text-gray-700">{city.BestSeasonVisit || 'Year-round'}</div>
      </div>
    </div>
  </motion.div>
);

// COMPONENT: Vlogger Content Card
const VloggerCard = ({ post }) => (
  <div className="group cursor-pointer">
    <div className="relative aspect-video rounded-3xl overflow-hidden mb-3 shadow-md">
      <img src={post.ThumbnailURL} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      <div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors" />
      <div className="absolute bottom-3 right-3 bg-black/60 backdrop-blur-md px-2 py-1 rounded-lg text-[10px] text-white font-bold uppercase tracking-wider">
        {post.MediaType === 'video' ? 'Video' : 'Gallery'}
      </div>
      <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
        <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-2xl scale-75 group-hover:scale-100 transition-transform">
          <FiVideo className="text-black w-5 h-5 ml-0.5" />
        </div>
      </div>
    </div>
    <div className="px-1">
      <h4 className="font-bold text-gray-900 line-clamp-1 mb-1 group-hover:text-blue-600 transition-colors">{post.Title}</h4>
      <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
        <span className="font-black text-gray-800">@{post.CreatorHandle}</span>
        <span>•</span>
        <span>{post.CityName}, {post.CountryName}</span>
      </div>
    </div>
  </div>
);

export default ExplorePage;
