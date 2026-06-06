import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const REPORT_REASONS = [
  'Inappropriate behavior',
  'No-show',
  'Harassment',
  'Felt unsafe',
  'Misrepresentation',
  'Other',
];

export default function SafetyPanel({ bookingId, userRole, bookingStatus, safetyData }) {
  const { token } = useAuth();

  const [checkedIn, setCheckedIn] = useState(!!safetyData?.checkin_time);
  const [checkedOut, setCheckedOut] = useState(!!safetyData?.checkout_time);
  const [checkinTime, setCheckinTime] = useState(safetyData?.checkin_time || null);
  const [checkoutTime, setCheckoutTime] = useState(safetyData?.checkout_time || null);
  const [sosLoading, setSosLoading] = useState(false);
  const [checkinLoading, setCheckinLoading] = useState(false);
  const [checkoutLoading, setCheckoutLoading] = useState(false);
  const [showReportForm, setShowReportForm] = useState(false);
  const [report, setReport] = useState({ reason: '', description: '' });
  const [reportSubmitting, setReportSubmitting] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const headers = { Authorization: `Bearer ${token}` };

  const handleCheckin = async () => {
    setCheckinLoading(true);
    setError('');
    try {
      const res = await axios.post(`/api/safety/bookings/${bookingId}/checkin`, {}, { headers });
      setCheckedIn(true);
      setCheckinTime(res.data?.checkin_time || new Date().toISOString());
      setSuccessMsg('Check-in recorded! Stay safe.');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to check in. Please try again.');
    } finally {
      setCheckinLoading(false);
    }
  };

  const handleCheckout = async () => {
    setCheckoutLoading(true);
    setError('');
    try {
      const res = await axios.post(`/api/safety/bookings/${bookingId}/checkout`, {}, { headers });
      setCheckedOut(true);
      setCheckoutTime(res.data?.checkout_time || new Date().toISOString());
      setSuccessMsg('Check-out recorded. Glad you had a great time!');
      setTimeout(() => setSuccessMsg(''), 3000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to check out. Please try again.');
    } finally {
      setCheckoutLoading(false);
    }
  };

  const handleSOS = async () => {
    const confirmed = window.confirm(
      'This will alert emergency services and log this booking. Continue?'
    );
    if (!confirmed) return;
    setSosLoading(true);
    setError('');
    try {
      await axios.post(`/api/safety/bookings/${bookingId}/sos`, {}, { headers });
      setSuccessMsg('Emergency alert sent. Help is on the way. Stay safe!');
    } catch (err) {
      setError(err.response?.data?.error || 'SOS failed. Please call emergency services directly.');
    } finally {
      setSosLoading(false);
    }
  };

  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!report.reason) { setError('Please select a reason.'); return; }
    setReportSubmitting(true);
    setError('');
    try {
      await axios.post('/api/safety/reports', {
        booking_id: bookingId,
        reason: report.reason,
        description: report.description,
      }, { headers });
      setReportSuccess(true);
      setShowReportForm(false);
      setReport({ reason: '', description: '' });
      setSuccessMsg('Report submitted. Our team will review it shortly.');
      setTimeout(() => setSuccessMsg(''), 4000);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit report.');
    } finally {
      setReportSubmitting(false);
    }
  };

  const formatTime = (iso) => {
    if (!iso) return '';
    try {
      return new Date(iso).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } catch { return iso; }
  };

  return (
    <div className="card p-5 border-l-4 border-violet-400">
      <h3 className="font-bold text-gray-800 mb-1">🛡️ Safety &amp; Check-in</h3>
      <p className="text-xs text-gray-500 mb-4">All meetups should be in public places</p>

      {/* Success/Error messages */}
      {successMsg && (
        <div className="bg-green-50 border border-green-200 text-green-700 rounded-lg px-3 py-2 text-sm mb-3">
          ✓ {successMsg}
        </div>
      )}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm mb-3">
          {error}
        </div>
      )}

      {/* Check-in / Check-out buttons */}
      <div className="flex flex-wrap gap-2 mb-4">
        {!checkedIn ? (
          <button
            onClick={handleCheckin}
            disabled={checkinLoading}
            className="btn-primary py-2 px-4 text-sm disabled:opacity-60"
          >
            {checkinLoading ? 'Checking in...' : '📍 I Have Arrived'}
          </button>
        ) : (
          <div className="flex items-center gap-2 px-4 py-2 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700 font-medium">
            <span className="text-green-500 text-base">✅</span>
            Checked in{checkinTime ? ` at ${formatTime(checkinTime)}` : ''}
          </div>
        )}

        {checkedIn && !checkedOut ? (
          <button
            onClick={handleCheckout}
            disabled={checkoutLoading}
            className="bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-xl text-sm transition-colors disabled:opacity-60"
          >
            {checkoutLoading ? 'Checking out...' : '✅ I Left Safely'}
          </button>
        ) : checkedOut ? (
          <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 border border-blue-200 rounded-xl text-sm text-blue-700 font-medium">
            <span className="text-blue-500">✅</span>
            Left safely{checkoutTime ? ` at ${formatTime(checkoutTime)}` : ''}
          </div>
        ) : null}
      </div>

      {/* SOS + Report buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleSOS}
          disabled={sosLoading}
          className="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded-xl text-sm transition-colors disabled:opacity-60"
        >
          {sosLoading ? 'Sending SOS...' : '🆘 Emergency SOS'}
        </button>

        {!reportSuccess && !showReportForm && (
          <button
            onClick={() => setShowReportForm(true)}
            className="border-2 border-red-400 text-red-600 hover:bg-red-50 font-semibold py-2 px-4 rounded-xl text-sm transition-colors"
          >
            🚨 Report Issue
          </button>
        )}
        {reportSuccess && (
          <span className="text-sm text-green-600 font-medium py-2">✓ Report submitted</span>
        )}
      </div>

      {/* Inline report form */}
      {showReportForm && (
        <form onSubmit={handleReportSubmit} className="mt-4 p-4 bg-red-50 border border-red-200 rounded-xl space-y-3">
          <h4 className="font-semibold text-gray-800 text-sm">Report an Issue</h4>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Reason</label>
            <select
              value={report.reason}
              onChange={(e) => setReport((r) => ({ ...r, reason: e.target.value }))}
              className="input-field text-sm"
              required
            >
              <option value="">Select a reason…</option>
              {REPORT_REASONS.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-600 mb-1">Description</label>
            <textarea
              value={report.description}
              onChange={(e) => setReport((r) => ({ ...r, description: e.target.value }))}
              rows={3}
              placeholder="Describe what happened…"
              className="input-field resize-none text-sm"
            />
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => { setShowReportForm(false); setError(''); }}
              className="btn-outline text-sm py-1.5 px-4"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={reportSubmitting}
              className="bg-red-500 hover:bg-red-600 text-white font-semibold py-1.5 px-4 rounded-xl text-sm transition-colors disabled:opacity-60"
            >
              {reportSubmitting ? 'Submitting…' : 'Submit Report'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
