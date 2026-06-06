import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';
import CompanionCard from '../components/CompanionCard';

const ALL_ACTIVITIES = [
  'Shopping',
  'Movies & Entertainment',
  'Dining & Cafes',
  'Outdoor & City Tours',
  'Emotional Support',
];

const RATING_OPTIONS = [
  { value: '', label: 'Any Rating' },
  { value: '4', label: '4+ Stars' },
  { value: '4.5', label: '4.5+ Stars' },
];

export default function AvailableNow() {
  const [companions, setCompanions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ activity: '', maxRate: '', minRating: '' });

  const fetchCompanions = useCallback(async () => {
    try {
      const params = {};
      if (filters.activity) params.activity = filters.activity;
      if (filters.maxRate) params.maxRate = filters.maxRate;
      if (filters.minRating) params.minRating = filters.minRating;

      const res = await axios.get('/api/companions/available-now', { params });
      setCompanions(res.data || []);
    } catch (err) {
      if (err.response?.status === 404) {
        setCompanions([]);
      } else {
        setCompanions([]);
      }
    } finally {
      setLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    fetchCompanions();
    const interval = setInterval(fetchCompanions, 30000);
    return () => clearInterval(interval);
  }, [fetchCompanions]);

  const handleFilterChange = (key, value) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div>
      {/* Header */}
      <div className="bg-gradient-to-r from-violet-600 to-pink-500 py-12 px-4">
        <div className="max-w-5xl mx-auto text-center">
          <h1 className="text-4xl font-extrabold text-white mb-3">Available Now ⚡</h1>
          <p className="text-violet-100 text-lg">Find companions ready to meet you today</p>
          <div className="flex items-center justify-center gap-2 mt-4">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-green-400"></span>
            </span>
            <span className="text-white font-semibold text-sm">
              {companions.length} companion{companions.length !== 1 ? 's' : ''} available now
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-8">
        {/* Safety banner */}
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800 text-sm mb-6">
          This platform is for safe, public, platonic companionship only. All meetups must be in public places.
        </div>

        {/* Filter bar */}
        <div className="card p-4 mb-6 flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[160px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Activity</label>
            <select
              value={filters.activity}
              onChange={(e) => handleFilterChange('activity', e.target.value)}
              className="input-field"
            >
              <option value="">All Activities</option>
              {ALL_ACTIVITIES.map((act) => (
                <option key={act} value={act}>{act}</option>
              ))}
            </select>
          </div>
          <div className="flex-1 min-w-[130px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Max Rate ($/hr)</label>
            <input
              type="number"
              min="1"
              value={filters.maxRate}
              onChange={(e) => handleFilterChange('maxRate', e.target.value)}
              placeholder="Any rate"
              className="input-field"
            />
          </div>
          <div className="flex-1 min-w-[140px]">
            <label className="block text-xs font-medium text-gray-600 mb-1">Min Rating</label>
            <select
              value={filters.minRating}
              onChange={(e) => handleFilterChange('minRating', e.target.value)}
              className="input-field"
            >
              {RATING_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>
          <button
            onClick={fetchCompanions}
            className="btn-primary py-2.5 px-5 whitespace-nowrap"
          >
            Refresh ⚡
          </button>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="card p-4 animate-pulse">
                <div className="h-40 bg-gray-200 rounded-xl mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : companions.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-4">🕐</div>
            <h3 className="text-xl font-bold text-gray-700 mb-2">No companions available right now</h3>
            <p className="text-gray-500">Check back soon!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {companions.map((companion) => (
              <div key={companion.id} className="relative">
                <div className="absolute top-3 left-3 z-10 flex items-center gap-1.5 bg-green-500 text-white text-xs font-semibold px-2.5 py-1 rounded-full shadow-md">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-white"></span>
                  </span>
                  Available Now
                </div>
                <CompanionCard companion={companion} />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
