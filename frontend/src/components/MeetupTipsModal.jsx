import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function MeetupTipsModal({ bookingId, companionName, activityType, onClose }) {
  const { token } = useAuth();
  const [tips, setTips] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchTips = async () => {
      try {
        const res = await axios.get(`/api/social-coach/${bookingId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setTips(res.data);
      } catch (err) {
        setError(err.response?.data?.error || 'Could not load meetup tips.');
        // Provide default tips on error
        setTips({
          icebreakers: [
            'Ask about their favorite local spots in the city.',
            'Share something interesting that happened to you recently.',
            'Ask what drew them to companion work and what they enjoy most about it.',
          ],
          shared_topics: ['Travel', 'Food & Restaurants', 'Movies & Shows', 'Music', 'Local Events'],
          safety_reminders: [
            'Always meet in a busy, public place like a cafe or park.',
            'Share your plans, location, and companion details with a friend or family member.',
          ],
          activity_tip: `For ${activityType || 'your activity'}, arrive a few minutes early to get comfortable with the setting before your companion arrives.`,
        });
      } finally {
        setLoading(false);
      }
    };
    fetchTips();
  }, [bookingId, token, activityType]);

  // Prevent scroll on body
  useEffect(() => {
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = ''; };
  }, []);

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center px-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-800">🤝 Meetup Tips</h2>
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

        <div className="p-5 space-y-5">
          {loading ? (
            <div className="flex items-center justify-center py-10">
              <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          ) : (
            <>
              {/* Icebreakers */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3">💬 Icebreakers</h3>
                <div className="space-y-2">
                  {(tips?.icebreakers || []).slice(0, 3).map((item, i) => (
                    <div key={i} className="flex gap-3 bg-violet-50 rounded-xl p-3">
                      <span className="w-6 h-6 rounded-full bg-violet-200 text-violet-700 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                        {i + 1}
                      </span>
                      <p className="text-sm text-gray-700">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Shared Topics */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3">🌟 Shared Topics</h3>
                <div className="flex flex-wrap gap-2">
                  {(tips?.shared_topics || []).slice(0, 3).map((topic, i) => (
                    <span key={i} className="px-3 py-1.5 rounded-full text-sm font-medium bg-amber-100 text-amber-800">
                      {topic}
                    </span>
                  ))}
                </div>
              </div>

              {/* Safety Reminders */}
              <div>
                <h3 className="font-bold text-gray-800 mb-3">🛡️ Safety Reminders</h3>
                <div className="space-y-2">
                  {(tips?.safety_reminders || []).slice(0, 2).map((item, i) => (
                    <div key={i} className="flex gap-3 bg-green-50 border border-green-200 rounded-xl p-3">
                      <span className="text-green-600 flex-shrink-0">🛡️</span>
                      <p className="text-sm text-green-800 font-semibold">{item}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Activity Tip */}
              {tips?.activity_tip && (
                <div>
                  <h3 className="font-bold text-gray-800 mb-3">🎯 Activity Tip</h3>
                  <div className="rounded-xl p-4 bg-gradient-to-r from-violet-50 to-pink-50 border border-violet-200">
                    <p className="text-sm text-gray-700">{tips.activity_tip}</p>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* Safety footer */}
        <div className="px-5 pb-5">
          <div className="bg-gray-50 rounded-xl px-4 py-3 text-xs text-gray-500 text-center">
            Always meet in a public place • Share your plans with someone you trust
          </div>
        </div>
      </div>
    </div>
  );
}
