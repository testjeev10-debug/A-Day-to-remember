import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import CompanionCard from '../components/CompanionCard';
import { ALL_ACTIVITIES as ACTIVITIES } from '../constants/activities';

export default function CompanionList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [companions, setCompanions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [filters, setFilters] = useState({
    activity: searchParams.get('activity') || '',
    city: searchParams.get('city') || '',
    maxRate: searchParams.get('maxRate') || '',
  });

  const fetchCompanions = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filters.activity) params.activity = filters.activity;
      if (filters.city) params.city = filters.city;
      if (filters.maxRate) params.maxRate = filters.maxRate;
      const res = await axios.get('/api/companions', { params });
      setCompanions(res.data);
    } catch {
      setCompanions([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCompanions(); }, [filters]);

  const handleFilterChange = (key, value) => {
    const newFilters = { ...filters, [key]: value };
    setFilters(newFilters);
    const params = {};
    if (newFilters.activity) params.activity = newFilters.activity;
    if (newFilters.city) params.city = newFilters.city;
    if (newFilters.maxRate) params.maxRate = newFilters.maxRate;
    setSearchParams(params);
  };

  const clearFilters = () => {
    setFilters({ activity: '', city: '', maxRate: '' });
    setSearchParams({});
  };

  const hasFilters = filters.activity || filters.city || filters.maxRate;

  return (
    <div className="min-h-screen bg-mesh">
      {/* Page header */}
      <div className="relative overflow-hidden border-b border-white/5 py-14 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-violet-600/10 via-transparent to-fuchsia-600/10 pointer-events-none" />
        <div className="max-w-7xl mx-auto relative">
          <h1 className="text-4xl md:text-5xl font-black text-white mb-3">
            Find Your <span className="text-gradient">Companion</span>
          </h1>
          <p className="text-gray-400 text-lg">Browse {companions.length > 0 ? companions.length : ''} wonderful companions and find your perfect match.</p>

          {/* Active filter pills */}
          {hasFilters && (
            <div className="flex flex-wrap gap-2 mt-4">
              {filters.activity && (
                <span className="inline-flex items-center gap-2 bg-violet-500/20 border border-violet-500/30 text-violet-300 rounded-full px-4 py-1.5 text-sm font-semibold">
                  🎯 {filters.activity}
                  <button onClick={() => handleFilterChange('activity', '')} className="hover:text-white ml-1">×</button>
                </span>
              )}
              {filters.city && (
                <span className="inline-flex items-center gap-2 bg-blue-500/20 border border-blue-500/30 text-blue-300 rounded-full px-4 py-1.5 text-sm font-semibold">
                  📍 {filters.city}
                  <button onClick={() => handleFilterChange('city', '')} className="hover:text-white ml-1">×</button>
                </span>
              )}
              {filters.maxRate && (
                <span className="inline-flex items-center gap-2 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-full px-4 py-1.5 text-sm font-semibold">
                  💰 Max ${filters.maxRate}/hr
                  <button onClick={() => handleFilterChange('maxRate', '')} className="hover:text-white ml-1">×</button>
                </span>
              )}
              <button onClick={clearFilters} className="text-gray-500 hover:text-gray-300 text-sm underline ml-1 transition-colors">
                Clear all
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 py-10">
        <div className="flex flex-col lg:flex-row gap-8">

          {/* Filters Sidebar */}
          <aside className="w-full lg:w-72 flex-shrink-0">
            {/* Mobile toggle */}
            <button
              onClick={() => setFiltersOpen(!filtersOpen)}
              className="lg:hidden w-full flex items-center justify-between bg-white/5 border border-white/10 rounded-2xl px-5 py-3.5 mb-4 text-white font-semibold"
            >
              <span>🎛️ Filters {hasFilters ? `(active)` : ''}</span>
              <span className={`transition-transform ${filtersOpen ? 'rotate-180' : ''}`}>▾</span>
            </button>

            <div className={`${filtersOpen ? 'block' : 'hidden'} lg:block`}>
              <div className="glass rounded-2xl border border-white/10 p-6 sticky top-24 space-y-7">
                <div className="flex items-center justify-between">
                  <h2 className="font-extrabold text-white text-lg">🎛️ Filters</h2>
                  {hasFilters && (
                    <button onClick={clearFilters} className="text-xs text-violet-400 hover:text-violet-300 font-semibold transition-colors">
                      Clear all
                    </button>
                  )}
                </div>

                {/* Activity */}
                <div>
                  <label className="block text-xs font-black tracking-widest text-gray-500 uppercase mb-3">Activity</label>
                  <div className="space-y-1 max-h-72 overflow-y-auto pr-1 custom-scroll">
                    <button
                      onClick={() => handleFilterChange('activity', '')}
                      className={`w-full text-left px-3 py-2 rounded-xl text-sm font-semibold transition-all ${
                        !filters.activity
                          ? 'bg-violet-500/20 text-violet-300 border border-violet-500/30'
                          : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                      }`}
                    >
                      ✦ All Activities
                    </button>
                    {ACTIVITIES.map((act) => (
                      <button
                        key={act}
                        onClick={() => handleFilterChange('activity', act)}
                        className={`w-full text-left px-3 py-2 rounded-xl text-sm transition-all ${
                          filters.activity === act
                            ? 'bg-violet-500/20 text-violet-300 font-semibold border border-violet-500/30'
                            : 'text-gray-500 hover:text-gray-300 hover:bg-white/5'
                        }`}
                      >
                        {act}
                      </button>
                    ))}
                  </div>
                </div>

                {/* City */}
                <div>
                  <label className="block text-xs font-black tracking-widest text-gray-500 uppercase mb-3">City</label>
                  <input
                    type="text"
                    value={filters.city}
                    onChange={(e) => handleFilterChange('city', e.target.value)}
                    placeholder="Search city..."
                    className="input-field text-sm"
                  />
                </div>

                {/* Max Rate */}
                <div>
                  <label className="block text-xs font-black tracking-widest text-gray-500 uppercase mb-3">
                    Max Rate: <span className="text-amber-400">{filters.maxRate ? `$${filters.maxRate}/hr` : 'Any'}</span>
                  </label>
                  <input
                    type="range" min="10" max="200" step="5"
                    value={filters.maxRate || 200}
                    onChange={(e) => handleFilterChange('maxRate', e.target.value === '200' ? '' : e.target.value)}
                    className="w-full accent-violet-500"
                  />
                  <div className="flex justify-between text-xs text-gray-600 mt-1">
                    <span>$10</span><span>$200+</span>
                  </div>
                </div>
              </div>
            </div>
          </aside>

          {/* Companion Grid */}
          <main className="flex-1">
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {[1,2,3,4,5,6].map((i) => (
                  <div key={i} className="glass rounded-2xl border border-white/10 overflow-hidden animate-pulse">
                    <div className="h-56 bg-white/5" />
                    <div className="p-5 space-y-3">
                      <div className="h-4 bg-white/10 rounded w-2/3" />
                      <div className="h-3 bg-white/5 rounded w-1/2" />
                      <div className="h-3 bg-white/5 rounded" />
                    </div>
                  </div>
                ))}
              </div>
            ) : companions.length === 0 ? (
              <div className="text-center py-24">
                <div className="text-6xl mb-4">🔍</div>
                <h3 className="text-2xl font-extrabold text-white mb-3">No companions found</h3>
                <p className="text-gray-500 mb-8">Try adjusting your filters to see more results.</p>
                <button onClick={clearFilters} className="btn-primary py-3 px-8">Clear Filters</button>
              </div>
            ) : (
              <>
                <p className="text-gray-600 text-sm mb-5 font-medium">
                  {companions.length} companion{companions.length !== 1 ? 's' : ''} found
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {companions.map((c) => <CompanionCard key={c.id} companion={c} />)}
                </div>
              </>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
