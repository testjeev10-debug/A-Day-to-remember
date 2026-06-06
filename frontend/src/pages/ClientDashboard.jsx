import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StarRating from '../components/StarRating';
import ActivityBadge from '../components/ActivityBadge';

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: 'bg-amber-100 text-amber-700', icon: '⏳' },
  confirmed: { label: 'Confirmed', color: 'bg-green-100 text-green-700', icon: '✅' },
  completed: { label: 'Completed', color: 'bg-blue-100 text-blue-700', icon: '🎉' },
  cancelled: { label: 'Cancelled', color: 'bg-gray-100 text-gray-500', icon: '❌' },
};

function ReviewModal({ booking, onClose, onSubmit }) {
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await onSubmit({ booking_id: booking.id, rating, comment });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit review.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 px-4">
      <div className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-xl text-gray-800">Rate Your Experience</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-2xl leading-none">×</button>
        </div>
        <p className="text-gray-500 text-sm mb-4">
          How was your day with <strong>{booking.companion_name}</strong>?
        </p>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm mb-4">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Your Rating</label>
            <StarRating rating={rating} interactive onRate={setRating} size="lg" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Comment (optional)</label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={3}
              placeholder="Share your experience..."
              className="input-field resize-none"
            />
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-outline flex-1">Cancel</button>
            <button type="submit" disabled={submitting} className="btn-primary flex-1 disabled:opacity-60">
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function ClientDashboard() {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [reviewBooking, setReviewBooking] = useState(null);
  const [cancellingId, setCancellingId] = useState(null);
  const [activeFilter, setActiveFilter] = useState('all');

  const fetchBookings = async () => {
    try {
      const res = await axios.get('/api/bookings');
      setBookings(res.data);
    } catch {
      setBookings([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchBookings(); }, []);

  const handleCancel = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    setCancellingId(bookingId);
    try {
      await axios.put(`/api/bookings/${bookingId}/status`, { status: 'cancelled' });
      fetchBookings();
    } catch (err) {
      alert(err.response?.data?.error || 'Failed to cancel booking.');
    } finally {
      setCancellingId(null);
    }
  };

  const handleReviewSubmit = async (data) => {
    await axios.post('/api/reviews', data);
    fetchBookings();
  };

  const filters = [
    { key: 'all', label: 'All' },
    { key: 'pending', label: 'Pending' },
    { key: 'confirmed', label: 'Confirmed' },
    { key: 'completed', label: 'Completed' },
    { key: 'cancelled', label: 'Cancelled' },
  ];

  const filtered = activeFilter === 'all' ? bookings : bookings.filter((b) => b.status === activeFilter);

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-800">My Dashboard</h1>
        <p className="text-gray-500 mt-1">Welcome back, {user?.name}! Here are your bookings.</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
        {[
          { label: 'Total', value: bookings.length, color: 'text-gray-800' },
          { label: 'Pending', value: bookings.filter((b) => b.status === 'pending').length, color: 'text-amber-600' },
          { label: 'Confirmed', value: bookings.filter((b) => b.status === 'confirmed').length, color: 'text-green-600' },
          { label: 'Completed', value: bookings.filter((b) => b.status === 'completed').length, color: 'text-blue-600' },
        ].map((stat) => (
          <div key={stat.label} className="card p-4 text-center">
            <div className={`text-2xl font-bold ${stat.color}`}>{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 mb-6 flex-wrap">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActiveFilter(f.key)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
              activeFilter === f.key ? 'bg-rose-500 text-white' : 'bg-white text-gray-600 border border-gray-200 hover:border-rose-300'
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => (
            <div key={i} className="card p-5 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/3 mb-3"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-1/4"></div>
            </div>
          ))}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <div className="text-5xl mb-4">📅</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">No bookings yet</h3>
          <p className="text-gray-500 mb-6">
            {activeFilter === 'all' ? "You haven't made any bookings yet." : `No ${activeFilter} bookings.`}
          </p>
          <Link to="/companions" className="btn-primary">Find a Companion</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {filtered.map((booking) => {
            const cfg = STATUS_CONFIG[booking.status];
            return (
              <div key={booking.id} className="card p-5">
                <div className="flex flex-col sm:flex-row sm:items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className={`badge ${cfg.color} text-xs`}>{cfg.icon} {cfg.label}</span>
                      <ActivityBadge activity={booking.activity} size="sm" />
                    </div>
                    <h3 className="font-bold text-gray-800 text-lg">{booking.companion_name}</h3>
                    <div className="text-sm text-gray-500 mt-1 space-y-0.5">
                      <div>📅 {new Date(booking.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                      <div>⏱️ {booking.hours} hour{booking.hours > 1 ? 's' : ''}</div>
                      <div className="font-medium text-rose-600">💰 ${booking.total_price}</div>
                      {booking.notes && <div>📝 {booking.notes}</div>}
                    </div>
                  </div>

                  <div className="flex flex-col gap-2 sm:items-end">
                    <Link to={`/companions/${booking.companion_profile_id}`} className="text-rose-600 hover:underline text-sm">
                      View Profile →
                    </Link>
                    {booking.status === 'pending' && (
                      <button
                        onClick={() => handleCancel(booking.id)}
                        disabled={cancellingId === booking.id}
                        className="text-sm text-gray-500 hover:text-red-600 border border-gray-200 hover:border-red-300 rounded-lg px-3 py-1.5 transition-colors disabled:opacity-50"
                      >
                        {cancellingId === booking.id ? 'Cancelling...' : 'Cancel Booking'}
                      </button>
                    )}
                    {booking.status === 'completed' && !booking.has_review && (
                      <button
                        onClick={() => setReviewBooking(booking)}
                        className="btn-secondary text-sm py-1.5 px-3"
                      >
                        ⭐ Write Review
                      </button>
                    )}
                    {booking.status === 'completed' && booking.has_review && (
                      <span className="text-xs text-green-600 font-medium">✓ Reviewed</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {reviewBooking && (
        <ReviewModal
          booking={reviewBooking}
          onClose={() => setReviewBooking(null)}
          onSubmit={handleReviewSubmit}
        />
      )}
    </div>
  );
}
