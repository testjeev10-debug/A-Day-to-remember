import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import HappinessScoreForm from '../components/HappinessScoreForm';

const MOOD_EMOJIS = {
  lonely: '🥺', bored: '😴', stressed: '😮‍💨', adventurous: '🌟',
  curious: '🧐', motivated: '💪', celebrating: '🎉', new_in_town: '🗺️',
};

export default function HappinessDashboard() {
  const { token } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [rateBooking, setRateBooking] = useState(null);

  const fetchDashboard = async () => {
    try {
      const res = await axios.get('/api/happiness/dashboard', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Could not load happiness data.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchDashboard(); }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <div className="w-10 h-10 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <div className="text-5xl mb-4">💛</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-2">Your Happiness Journey</h2>
        <p className="text-gray-500 mb-4">Complete some bookings to start tracking your happiness journey!</p>
        <div className="text-sm text-gray-400">{error}</div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const sessions = data?.recent_sessions || [];
  const topCompanions = data?.top_companions || [];
  const pendingRating = data?.pending_rating_booking || null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-extrabold text-gray-800">Your Happiness Journey 💛</h1>
        <p className="text-gray-500 mt-1">Track how companionship has improved your wellbeing</p>
      </div>

      {/* CTA for pending rating */}
      {pendingRating && (
        <div className="card p-5 border-2 border-yellow-300 bg-yellow-50 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-3">
            <div>
              <p className="font-bold text-gray-800">How was your time with {pendingRating.companion_name}?</p>
              <p className="text-sm text-gray-500 mt-0.5">Rate your session to track your happiness journey</p>
            </div>
            <button
              onClick={() => setRateBooking(pendingRating)}
              className="btn-primary py-2 px-5 text-sm"
            >
              Rate Session 💛
            </button>
          </div>
        </div>
      )}

      {/* Stats row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        <div className="card p-4 text-center">
          <div className="text-3xl font-extrabold text-violet-600 mb-1">
            {stats.avg_score ? stats.avg_score.toFixed(1) : '—'}
          </div>
          <div className="text-amber-400 text-lg">★</div>
          <div className="text-sm text-gray-500 mt-1">Avg Score</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-3xl font-extrabold text-pink-600 mb-1">{stats.total_sessions ?? 0}</div>
          <div className="text-sm text-gray-500 mt-2">Total Sessions</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-2xl font-extrabold text-green-600 mb-1 leading-tight">{stats.best_activity || '—'}</div>
          <div className="text-sm text-gray-500 mt-1">Best Activity</div>
        </div>
        <div className="card p-4 text-center">
          <div className="text-3xl font-extrabold text-blue-600 mb-1">
            {stats.would_meet_again_pct != null ? `${stats.would_meet_again_pct}%` : '—'}
          </div>
          <div className="text-sm text-gray-500 mt-1">Meet Again</div>
        </div>
      </div>

      {/* Mood improvement */}
      {sessions.length > 0 && (
        <div className="card p-6 mb-6">
          <h2 className="font-bold text-xl text-gray-800 mb-4">Mood Improvement Over Time</h2>
          <div className="space-y-4">
            {sessions.map((session, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="w-24 text-sm text-gray-500 flex-shrink-0">
                  {session.date ? new Date(session.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `Session ${i + 1}`}
                </div>
                <div className="text-2xl flex-shrink-0" title={session.before_mood}>
                  {MOOD_EMOJIS[session.before_mood] || '😐'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-gray-100 rounded-full h-3">
                      <div
                        className="bg-gradient-to-r from-violet-500 to-pink-500 h-3 rounded-full transition-all duration-500"
                        style={{ width: `${((session.after_score || 0) / 10) * 100}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-bold text-gray-700 w-8">{session.after_score ?? '?'}</span>
                  </div>
                  <p className="text-xs text-gray-400 mt-1">{session.companion_name || 'Unknown companion'} · {session.activity || ''}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Top companions */}
      {topCompanions.length > 0 && (
        <div className="card p-6">
          <h2 className="font-bold text-xl text-gray-800 mb-4">Top Companions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {topCompanions.slice(0, 3).map((c, i) => (
              <div key={i} className="flex items-center gap-3 p-3 rounded-xl bg-gray-50">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white font-bold flex-shrink-0">
                  {(c.name || '?')[0].toUpperCase()}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-gray-800 truncate">{c.name}</p>
                  <div className="flex items-center gap-1">
                    <span className="text-amber-400 text-sm">★</span>
                    <span className="text-sm text-gray-600 font-medium">{c.avg_score ? c.avg_score.toFixed(1) : '—'}</span>
                    <span className="text-xs text-gray-400">happiness</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {!data || (sessions.length === 0 && topCompanions.length === 0) ? (
        <div className="text-center py-12 text-gray-500">
          <div className="text-5xl mb-4">💛</div>
          <p className="text-lg font-medium">Complete your first session to see your happiness journey!</p>
        </div>
      ) : null}

      {rateBooking && (
        <HappinessScoreForm
          bookingId={rateBooking.id}
          companionName={rateBooking.companion_name}
          activityType={rateBooking.activity}
          beforeMood={rateBooking.before_mood}
          onClose={() => setRateBooking(null)}
          onSubmit={() => { setRateBooking(null); fetchDashboard(); }}
        />
      )}
    </div>
  );
}
