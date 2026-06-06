import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import ActivityBadge from '../components/ActivityBadge';

export default function BookingPage() {
  const { companionId } = useParams();
  const navigate = useNavigate();
  const [companion, setCompanion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [form, setForm] = useState({
    activity: '',
    date: '',
    hours: 1,
    notes: '',
  });

  useEffect(() => {
    axios.get(`/api/companions/${companionId}`)
      .then((res) => {
        setCompanion(res.data);
        const acts = (() => { try { return JSON.parse(res.data.activities || '[]'); } catch { return []; } })();
        if (acts.length > 0) setForm((f) => ({ ...f, activity: acts[0] }));
      })
      .catch(() => setError('Companion not found.'))
      .finally(() => setLoading(false));
  }, [companionId]);

  const activities = (() => {
    if (!companion) return [];
    try { return JSON.parse(companion.activities || '[]'); } catch { return []; }
  })();

  const totalPrice = companion ? companion.hourly_rate * form.hours : 0;

  const minDate = new Date();
  minDate.setDate(minDate.getDate() + 1);
  const minDateStr = minDate.toISOString().split('T')[0];

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!form.activity) { setError('Please select an activity.'); return; }
    if (!form.date) { setError('Please select a date.'); return; }
    setSubmitting(true);
    try {
      await axios.post('/api/bookings', {
        companion_id: companion.id,
        activity: form.activity,
        date: form.date,
        hours: parseInt(form.hours),
        notes: form.notes,
      });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.error || 'Booking failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return (
    <div className="max-w-2xl mx-auto px-4 py-10 animate-pulse">
      <div className="card p-8 space-y-4">
        <div className="h-6 bg-gray-200 rounded w-1/2"></div>
        <div className="h-4 bg-gray-200 rounded w-1/3"></div>
        <div className="h-40 bg-gray-200 rounded"></div>
      </div>
    </div>
  );

  if (error && !companion) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="text-5xl mb-4">😕</div>
      <h2 className="text-2xl font-bold text-gray-700 mb-4">{error}</h2>
      <Link to="/companions" className="btn-primary">Back to Companions</Link>
    </div>
  );

  if (success) return (
    <div className="max-w-2xl mx-auto px-4 py-20 text-center">
      <div className="card p-10">
        <div className="text-6xl mb-6">🎉</div>
        <h2 className="text-3xl font-bold text-gray-800 mb-3">Booking Requested!</h2>
        <p className="text-gray-500 mb-2">Your booking with <strong>{companion.name}</strong> has been sent.</p>
        <p className="text-gray-500 mb-8">They will confirm your request shortly.</p>
        <div className="bg-rose-50 rounded-xl p-4 mb-8 text-left">
          <div className="text-sm text-gray-600 space-y-1">
            <div className="flex justify-between"><span className="font-medium">Activity:</span><span>{form.activity}</span></div>
            <div className="flex justify-between"><span className="font-medium">Date:</span><span>{new Date(form.date + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</span></div>
            <div className="flex justify-between"><span className="font-medium">Duration:</span><span>{form.hours} hour{form.hours > 1 ? 's' : ''}</span></div>
            <div className="flex justify-between font-bold text-rose-700 pt-1 border-t border-rose-200 mt-1"><span>Total:</span><span>${totalPrice}</span></div>
          </div>
        </div>
        <div className="flex gap-3 justify-center">
          <Link to="/dashboard/client" className="btn-primary">View My Bookings</Link>
          <Link to="/companions" className="btn-outline">Browse More</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <Link to={`/companions/${companion.id}`} className="text-rose-600 hover:underline text-sm mb-6 inline-flex items-center gap-1">
        ← Back to {companion.name}'s Profile
      </Link>

      <div className="card mt-4 overflow-hidden">
        {/* Companion header */}
        <div className="bg-gradient-to-r from-rose-500 to-amber-400 p-6 flex items-center gap-4">
          <img
            src={companion.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(companion.name)}&background=fff&color=f43f5e&size=100`}
            alt={companion.name}
            className="w-16 h-16 rounded-xl object-cover border-2 border-white"
            onError={(e) => { e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(companion.name)}&background=fff&color=f43f5e&size=100`; }}
          />
          <div className="text-white">
            <h1 className="text-xl font-bold">Book {companion.name}</h1>
            <p className="text-rose-100">${companion.hourly_rate}/hr · {companion.city}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-4 py-3 text-sm">
              {error}
            </div>
          )}

          {/* Activity */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Select Activity</label>
            <div className="grid grid-cols-1 gap-2">
              {activities.map((act) => (
                <label
                  key={act}
                  className={`flex items-center gap-3 p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    form.activity === act ? 'border-rose-400 bg-rose-50' : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name="activity"
                    value={act}
                    checked={form.activity === act}
                    onChange={() => setForm({ ...form, activity: act })}
                    className="accent-rose-500"
                  />
                  <ActivityBadge activity={act} size="sm" />
                </label>
              ))}
            </div>
          </div>

          {/* Date */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Date</label>
            <input
              type="date"
              value={form.date}
              min={minDateStr}
              onChange={(e) => setForm({ ...form, date: e.target.value })}
              required
              className="input-field"
            />
          </div>

          {/* Hours */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Duration: <span className="text-rose-600">{form.hours} hour{form.hours > 1 ? 's' : ''}</span>
            </label>
            <input
              type="range"
              min="1"
              max="8"
              step="1"
              value={form.hours}
              onChange={(e) => setForm({ ...form, hours: parseInt(e.target.value) })}
              className="w-full accent-rose-500"
            />
            <div className="flex justify-between text-xs text-gray-400 mt-1">
              <span>1 hr</span>
              <span>8 hrs</span>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Notes (optional)</label>
            <textarea
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              rows={3}
              placeholder="Any special requests or details..."
              className="input-field resize-none"
            />
          </div>

          {/* Price summary */}
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4">
            <div className="flex justify-between text-sm text-gray-600 mb-1">
              <span>${companion.hourly_rate}/hr × {form.hours} hour{form.hours > 1 ? 's' : ''}</span>
              <span>${totalPrice}</span>
            </div>
            <div className="flex justify-between font-bold text-gray-800 text-lg border-t border-amber-200 pt-2 mt-1">
              <span>Total</span>
              <span className="text-rose-600">${totalPrice}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="btn-primary w-full py-3 text-base disabled:opacity-60 disabled:cursor-not-allowed"
          >
            {submitting ? 'Sending Request...' : `Request Booking — $${totalPrice}`}
          </button>
        </form>
      </div>
    </div>
  );
}
