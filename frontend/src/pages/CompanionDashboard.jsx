import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ActivityBadge from '../components/ActivityBadge';
import StarRating from '../components/StarRating';
import SafetyPanel from '../components/SafetyPanel';

const ALL_ACTIVITIES = [
  'Shopping',
  'Movies & Entertainment',
  'Dining & Cafes',
  'Outdoor & City Tours',
  'Emotional Support',
];

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: '⏳' },
  confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-700', icon: '✅' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700', icon: '🎉' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500', icon: '❌' },
};

export default function CompanionDashboard() {
  const { user, companion, updateCompanion } = useAuth();
  const [activeTab, setActiveTab] = useState('requests');
  const [bookings, setBookings] = useState([]);
  const [loadingBookings, setLoadingBookings] = useState(true);
  const [updatingId, setUpdatingId] = useState(null);

  // Profile edit state
  const [profile, setProfile] = useState({
    bio: companion?.bio || '',
    hourly_rate: companion?.hourly_rate || '',
    city: companion?.city || '',
    activities: (() => { try { return JSON.parse(companion?.activities || '[]'); } catch { return []; } })(),
    photo_url: companion?.photo_url || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);
  const [profileError, setProfileError] = useState('');
  const [profileSuccess, setProfileSuccess] = useState(false);
  const [isAvailable, setIsAvailable] = useState(companion?.is_available || false);
  const [availableToggling, setAvailableToggling] = useState(false);

  const fetchBookings = async () => {
    try {
      const res = await axios.get('/api/bookings');
      setBookings(res.data);
    } catch {
      setBookings([]);
    } finally {
      setLoadingBookings(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  useEffect(() => {
    if (companion) {
      setProfile({
        bio: companion.bio || '',
        hourly_rate: companion.hourly_rate || '',
        city: companion.city || '',
        activities: (() => { try { return JSON.parse(companion.activities || '[]'); } catch { return []; } })(),
        photo_url: companion.photo_url || '',
      });
    }
  }, [companion]);

  const handleStatusUpdate = async (bookingId, status) => {
    setUpdatingId(bookingId);
    try {
      await axios.put(`/api/bookings/${bookingId}/status`, { status });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to update booking.');
    } finally {
      setUpdatingId(null);
    }
  };

  const handleAvailableToggle = async () => {
    setAvailableToggling(true);
    try {
      const res = await axios.post('/api/companions/available-now/toggle');
      setIsAvailable(res.data?.is_available ?? !isAvailable);
    } catch {
      // Optimistically toggle anyway
      setIsAvailable((v) => !v);
    } finally {
      setAvailableToggling(false);
    }
  };

  const handleActivityToggle = (act) => {
    setProfile((prev) => ({
      ...prev,
      activities: prev.activities.includes(act)
        ? prev.activities.filter((a) => a !== act)
        : [...prev.activities, act],
    }));
  };

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setProfileError('');
    setProfileSuccess(false);
    if (profile.activities.length === 0) {
      setProfileError('Please select at least one activity.');
      return;
    }
    setProfileLoading(true);
    try {
      const res = await axios.put('/api/companions/profile', {
        bio: profile.bio,
        hourly_rate: parseFloat(profile.hourly_rate),
        city: profile.city,
        activities: profile.activities,
        photo_url: profile.photo_url,
      });
      updateCompanion(res.data);
      setProfileSuccess(true);
      setTimeout(() => setProfileSuccess(false), 3000);
    } catch (err) {
      setProfileError(err.response?.data?.error || 'Failed to update profile.');
    } finally {
      setProfileLoading(false);
    }
  };

  const pending = bookings.filter((b) => b.status === 'pending');
  const upcoming = bookings.filter((b) => b.status === 'confirmed');
  const past = bookings.filter((b) => ['completed', 'cancelled'].includes(b.status));

  const avgRating = companion?.avg_rating || 0;
  const reviewCount = companion?.review_count || 0;
  const totalEarnings = bookings.filter((b) => b.status === 'completed').reduce((sum, b) => sum + b.total_price, 0);

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">Companion Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.name}!</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{pending.length}</div>
          <div className="text-sm text-gray-500">Pending</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{upcoming.length}</div>
          <div className="text-sm text-gray-500">Confirmed</div>
        </div>
        <div className="card p-4 text-center">
          <div className="flex items-center justify-center gap-1">
            <span className="text-2xl font-bold text-rose-600">{avgRating > 0 ? avgRating.toFixed(1) : '—'}</span>
            {avgRating > 0 && <span className="text-amber-400 text-xl">★</span>}
          </div>
          <div className="text-sm text-gray-500">Rating ({reviewCount})</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">${totalEarnings}</div>
          <div className="text-sm text-gray-500">Earned</div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 mb-6 w-fit">
        {[
          { key: 'requests', label: '📋 Requests' },
          { key: 'profile', label: '✏️ My Profile' },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`px-5 py-2 rounded-lg text-sm font-medium transition-all ${
              activeTab === tab.key ? 'bg-white shadow text-gray-800' : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Requests Tab */}
      {activeTab === 'requests' && (
        <div className="space-y-6">
          {/* Pending requests */}
          {pending.length > 0 && (
            <div>
              <h2 className="font-bold text-lg text-gray-800 mb-3">⏳ New Requests ({pending.length})</h2>
              <div className="space-y-3">
                {pending.map((booking) => (
                  <div key={booking.id} className="card p-5 border-l-4 border-amber-400">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <ActivityBadge activity={booking.activity} size="sm" />
                        </div>
                        <p className="font-bold text-gray-800">{booking.client_name}</p>
                        <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                          <div>📅 {new Date(booking.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
                          <div>⏱️ {booking.hours} hour{booking.hours > 1 ? 's' : ''} · <span className="font-medium text-rose-600">${booking.total_price}</span></div>
                          {booking.notes && <div>📝 {booking.notes}</div>}
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleStatusUpdate(booking.id, 'confirmed')}
                          disabled={updatingId === booking.id}
                          className="btn-primary text-sm py-1.5 px-4 disabled:opacity-50"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleStatusUpdate(booking.id, 'cancelled')}
                          disabled={updatingId === booking.id}
                          className="btn-outline text-sm py-1.5 px-4 disabled:opacity-50"
                        >
                          Decline
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div>
              <h2 className="font-bold text-lg text-gray-800 mb-3">✅ Upcoming ({upcoming.length})</h2>
              <div className="space-y-3">
                {upcoming.map((booking) => (
                  <div key={booking.id} className="card p-5 border-l-4 border-green-400">
                    <div className="flex flex-col sm:flex-row sm:items-center gap-4">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <ActivityBadge activity={booking.activity} size="sm" />
                        </div>
                        <p className="font-bold text-gray-800">{booking.client_name}</p>
                        <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                          <div>📅 {new Date(booking.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' })}</div>
                          <div>⏱️ {booking.hours} hour{booking.hours > 1 ? 's' : ''} · <span className="font-medium text-rose-600">${booking.total_price}</span></div>
                        </div>
                      </div>
                      <button
                        onClick={() => handleStatusUpdate(booking.id, 'completed')}
                        disabled={updatingId === booking.id}
                        className="btn-secondary text-sm py-1.5 px-4 disabled:opacity-50"
                      >
                        Mark Complete
                      </button>
                    </div>
                    <div className="mt-4 pt-4 border-t border-gray-100">
                      <SafetyPanel
                        bookingId={booking.id}
                        userRole="companion"
                        bookingStatus={booking.status}
                        safetyData={booking.safety_data || null}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Past */}
          {past.length > 0 && (
            <div>
              <h2 className="font-bold text-lg text-gray-800 mb-3">📁 Past Bookings</h2>
              <div className="space-y-3">
                {past.map((booking) => {
                  const cfg = STATUS_CONFIG[booking.status];
                  return (
                    <div key={booking.id} className="card p-4 opacity-75">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className={`badge ${cfg.color} text-xs`}>{cfg.icon} {cfg.label}</span>
                        <ActivityBadge activity={booking.activity} size="sm" />
                        <span className="text-sm text-gray-600 font-medium">{booking.client_name}</span>
                        <span className="text-sm text-gray-400">
                          {new Date(booking.date + 'T12:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </span>
                        <span className="text-sm font-medium text-rose-600 ml-auto">${booking.total_price}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {bookings.length === 0 && !loadingBookings && (
            <div className="text-center py-16">
              <div className="text-5xl mb-4">📭</div>
              <h3 className="text-xl font-bold text-gray-700 mb-2">No bookings yet</h3>
              <p className="text-gray-500">Complete your profile to attract more clients!</p>
            </div>
          )}
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="card p-6 max-w-2xl">
          <h2 className="font-bold text-xl text-gray-800 mb-5">Edit Profile</h2>

          {/* Available Now toggle */}
          <div className="flex items-center justify-between p-4 rounded-xl bg-gray-50 border border-gray-200 mb-6">
            <div>
              <p className="font-semibold text-gray-800">Available Now ⚡</p>
              <p className="text-sm text-gray-500 mt-0.5">
                {isAvailable ? 'You are visible to clients looking for companions right now' : 'Toggle on to appear in the Available Now feed'}
              </p>
            </div>
            <button
              type="button"
              onClick={handleAvailableToggle}
              disabled={availableToggling}
              className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-300 focus:outline-none disabled:opacity-60 ${
                isAvailable ? 'bg-green-500' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-5 w-5 transform rounded-full bg-white shadow-md transition-transform duration-300 ${
                  isAvailable ? 'translate-x-8' : 'translate-x-1'
                }`}
              />
            </button>
          </div>

          {profileError && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm mb-4">{profileError}</div>
          )}
          {profileSuccess && (
            <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-4 py-3 text-sm mb-4">✓ Profile updated successfully!</div>
          )}

          <form onSubmit={handleProfileSave} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
              <input
                type="text"
                value={profile.city}
                onChange={(e) => setProfile({ ...profile, city: e.target.value })}
                placeholder="e.g. New York"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Hourly Rate (USD)</label>
              <input
                type="number"
                value={profile.hourly_rate}
                onChange={(e) => setProfile({ ...profile, hourly_rate: e.target.value })}
                min="1"
                step="0.5"
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={profile.bio}
                onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                rows={4}
                placeholder="Tell clients about yourself..."
                className="input-field resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Photo URL</label>
              <input
                type="url"
                value={profile.photo_url}
                onChange={(e) => setProfile({ ...profile, photo_url: e.target.value })}
                placeholder="https://..."
                className="input-field"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Activities You Offer</label>
              <div className="grid grid-cols-1 gap-2">
                {ALL_ACTIVITIES.map((act) => (
                  <label key={act} className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all ${
                    profile.activities.includes(act) ? 'border-rose-400 bg-rose-50' : 'border-gray-200 hover:border-gray-300'
                  }`}>
                    <input
                      type="checkbox"
                      checked={profile.activities.includes(act)}
                      onChange={() => handleActivityToggle(act)}
                      className="accent-rose-500"
                    />
                    <ActivityBadge activity={act} size="sm" />
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={profileLoading}
              className="btn-primary w-full py-3 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {profileLoading ? 'Saving...' : 'Save Profile'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}
