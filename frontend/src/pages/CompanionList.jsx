import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import CompanionCard from '../components/CompanionCard';
import { ALL_ACTIVITIES as ACTIVITIES } from '../constants/activities';

export default function CompanionList() {
  const [searchParams, setSearchParams] = useSearchParams();
  const [companions, setCompanions] = useState([]);
  const [loading, setLoading] = useState(true);
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

  useEffect(() => {
    fetchCompanions();
  }, [filters]);

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
    <div className="max-w-7xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Find a Companion</h1>
        <p className="text-gray-500">Browse our wonderful companions and find your perfect match.</p>
      </div>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Filters Sidebar */}
        <aside className="w-full lg:w-72 flex-shrink-0">
          <div className="card p-6 sticky top-24">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-bold text-gray-800 text-lg">Filters</h2>
              {hasFilters && (
                <button onClick={clearFilters} className="text-xs text-rose-600 hover:underline">
                  Clear all
                </button>
              )}
            </div>

            {/* Activity */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Activity</label>
              <div className="space-y-1.5">
                <label className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm transition-colors ${!filters.activity ? 'bg-rose-50 text-rose-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                  <input
                    type="radio"
                    name="activity"
                    value=""
                    checked={!filters.activity}
                    onChange={() => handleFilterChange('activity', '')}
                    className="accent-rose-500"
                  />
                  All Activities
                </label>
                {ACTIVITIES.map((act) => (
                  <label key={act} className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer text-sm transition-colors ${filters.activity === act ? 'bg-rose-50 text-rose-700 font-medium' : 'text-gray-600 hover:bg-gray-50'}`}>
                    <input
                      type="radio"
                      name="activity"
                      value={act}
                      checked={filters.activity === act}
                      onChange={() => handleFilterChange('activity', act)}
                      className="accent-rose-500"
                    />
                    {act}
                  </label>
                ))}
              </div>
            </div>

            {/* City */}
            <div className="mb-5">
              <label className="block text-sm font-semibold text-gray-700 mb-2">City</label>
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
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                Max Rate: {filters.maxRate ? `$${filters.maxRate}/hr` : 'Any'}
              </label>
              <input
                type="range"
                min="10"
                max="200"
                step="5"
                value={filters.maxRate || 200}
                onChange={(e) => handleFilterChange('maxRate', e.target.value === '200' ? '' : e.target.value)}
                className="w-full accent-rose-500"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>$10</span>
                <span>$200+</span>
              </div>
            </div>
          </div>
        </aside>

        {/* Companion Grid */}
        <main className="flex-1">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="card animate-pulse">
                  <div className="h-52 bg-gray-200"></div>
                  <div className="p-4 space-y-3">
                    <div className="h-4 bg-gray-200 rounded w-2/3"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                    <div className="h-3 bg-gray-200 rounded"></div>
                    <div className="h-3 bg-gray-200 rounded w-3/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : companions.length === 0 ? (
            <div className="text-center py-20">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No companions found</h3>
              <p className="text-gray-500 mb-6">Try adjusting your filters to see more results.</p>
              <button onClick={clearFilters} className="btn-primary">Clear Filters</button>
            </div>
          ) : (
            <>
              <p className="text-gray-500 text-sm mb-4">{companions.length} companion{companions.length !== 1 ? 's' : ''} found</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                {companions.map((c) => <CompanionCard key={c.id} companion={c} />)}
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  );
}
