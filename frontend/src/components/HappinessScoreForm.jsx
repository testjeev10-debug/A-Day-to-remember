import React, { useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import StarRating from './StarRating';

const SCORE_EMOJIS = {
  1: '😞', 2: '😞', 3: '😕', 4: '😕', 5: '😐',
  6: '🙂', 7: '🙂', 8: '😊', 9: '😊', 10: '😊',
};

export default function HappinessScoreForm({ bookingId, companionName, activityType, beforeMood, onClose, onSubmit }) {
  const { token } = useAuth();
  const [form, setForm] = useState({
    after_score: 5,
    safety_rating: 5,
    would_meet_again: true,
    feedback_text: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Prevent body scroll
  React.useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError('');
    try {
      await axios.post(`/api/happiness/${bookingId}`, form, {
        headers: { Authorization: `Bearer ${token}` },
      });
      onSubmit && onSubmit();
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to submit. Please try again.');
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">How was your time? 💛</h2>
            <p className="text-sm text-gray-500 mt-0.5">
              With <span className="font-semibold text-violet-600">{companionName}</span>
              {activityType && <> · {activityType}</>}
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-700 transition-colors text-lg leading-none"
          >
            ×
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg px-3 py-2 text-sm">
              {error}
            </div>
          )}

          {/* Mood improvement score 1-10 */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Did this improve your mood? <span className="text-gray-400 font-normal">(1–10)</span>
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {Array.from({ length: 10 }, (_, i) => i + 1).map((score) => (
                <button
                  key={score}
                  type="button"
                  onClick={() => setForm((f) => ({ ...f, after_score: score }))}
                  className={`flex flex-col items-center gap-1 w-[calc(10%-5px)] min-w-[36px] py-2 px-1 rounded-xl border-2 transition-all duration-150 ${
                    form.after_score === score
                      ? 'border-violet-500 bg-violet-50 shadow-md scale-110'
                      : 'border-gray-200 hover:border-violet-300'
                  }`}
                >
                  <span className="text-base leading-none">{SCORE_EMOJIS[score]}</span>
                  <span className={`text-xs font-bold ${form.after_score === score ? 'text-violet-700' : 'text-gray-500'}`}>
                    {score}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-400 mt-1.5 px-1">
              <span>Not at all</span>
              <span>Very much!</span>
            </div>
          </div>

          {/* Safety rating */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Did you feel safe?
            </label>
            <StarRating
              rating={form.safety_rating}
              interactive
              onRate={(val) => setForm((f) => ({ ...f, safety_rating: val }))}
              size="lg"
            />
          </div>

          {/* Would meet again */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3">
              Would you meet again?
            </label>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, would_meet_again: true }))}
                className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                  form.would_meet_again
                    ? 'border-green-500 bg-green-50 text-green-700'
                    : 'border-gray-200 text-gray-500 hover:border-green-300'
                }`}
              >
                Yes! 👍
              </button>
              <button
                type="button"
                onClick={() => setForm((f) => ({ ...f, would_meet_again: false }))}
                className={`flex-1 py-3 rounded-xl font-bold text-sm border-2 transition-all ${
                  !form.would_meet_again
                    ? 'border-red-400 bg-red-50 text-red-600'
                    : 'border-gray-200 text-gray-500 hover:border-red-300'
                }`}
              >
                No 👎
              </button>
            </div>
          </div>

          {/* Feedback */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">
              Tell us more <span className="text-gray-400 font-normal">(optional)</span>
            </label>
            <textarea
              value={form.feedback_text}
              onChange={(e) => setForm((f) => ({ ...f, feedback_text: e.target.value }))}
              rows={3}
              placeholder="How did it go? Any highlights or suggestions?"
              className="input-field resize-none"
            />
          </div>

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-outline flex-1">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-primary flex-1 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {submitting ? 'Submitting...' : 'Submit 💛'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
