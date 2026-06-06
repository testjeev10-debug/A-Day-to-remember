import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import CompanionCard from '../components/CompanionCard';

const MOODS = [
  { id: 'lonely', emoji: '🥺', label: 'Lonely', description: 'Could use some company', activities: ['Dining & Cafes', 'Movies & Entertainment', 'Outdoor & City Tours'] },
  { id: 'bored', emoji: '😴', label: 'Bored', description: 'Need something fun to do', activities: ['Movies & Entertainment', 'Shopping', 'Outdoor & City Tours'] },
  { id: 'stressed', emoji: '😮‍💨', label: 'Stressed', description: 'Need to unwind and breathe', activities: ['Emotional Support', 'Outdoor & City Tours', 'Dining & Cafes'] },
  { id: 'adventurous', emoji: '🌟', label: 'Adventurous', description: 'Ready to explore!', activities: ['Outdoor & City Tours', 'Movies & Entertainment', 'Shopping'] },
  { id: 'curious', emoji: '🧐', label: 'Curious', description: 'Want to learn something new', activities: ['Outdoor & City Tours', 'Dining & Cafes', 'Movies & Entertainment'] },
  { id: 'motivated', emoji: '💪', label: 'Motivated', description: "Let's get things done!", activities: ['Shopping', 'Outdoor & City Tours', 'Dining & Cafes'] },
  { id: 'celebrating', emoji: '🎉', label: 'Celebrating', description: 'Something great happened!', activities: ['Dining & Cafes', 'Movies & Entertainment', 'Shopping'] },
  { id: 'new_in_town', emoji: '🗺️', label: 'New in town', description: 'Just arrived, need a guide', activities: ['Outdoor & City Tours', 'Dining & Cafes', 'Shopping'] },
];

export default function MoodMatcher() {
  const { user, token } = useAuth();
  const [selectedMood, setSelectedMood] = useState(null);
  const [recommendations, setRecommendations] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleMoodSelect = async (mood) => {
    setSelectedMood(mood);
    setLoading(true);
    try {
      const headers = token ? { Authorization: `Bearer ${token}` } : {};
      await axios.post('/api/mood', { selected_mood: mood.id, recommended_activity: '' }, { headers });
    } catch {
      // ignore errors — proceed to show recommendations
    }
    try {
      const res = await axios.get('/api/companions');
      const companions = res.data || [];
      const filtered = companions.filter((c) => {
        try {
          const acts = JSON.parse(c.activities || '[]');
          return mood.activities.some((a) => acts.includes(a));
        } catch {
          return false;
        }
      });
      setRecommendations(filtered.slice(0, 6));
    } catch {
      setRecommendations([]);
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setSelectedMood(null);
    setRecommendations(null);
    setLoading(false);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 py-10">
      {!selectedMood ? (
        <>
          <div className="text-center mb-10">
            <h1 className="text-4xl font-extrabold text-gray-800 mb-3">How are you feeling today? 💭</h1>
            <p className="text-gray-500 text-lg">We'll find the perfect companion and activity for your mood</p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {MOODS.map((mood) => (
              <button
                key={mood.id}
                onClick={() => handleMoodSelect(mood)}
                className="bg-white rounded-2xl border-2 border-gray-200 p-5 text-center hover:border-violet-400 hover:shadow-md hover:scale-105 transition-all duration-200 cursor-pointer"
              >
                <div className="text-4xl mb-2">{mood.emoji}</div>
                <div className="font-bold text-gray-800 text-base mb-1">{mood.label}</div>
                <div className="text-xs text-gray-500">{mood.description}</div>
              </button>
            ))}
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
            <h2 className="text-2xl font-extrabold text-gray-800">
              Based on your mood: <span className="text-gradient">{selectedMood.emoji} {selectedMood.label}</span>
            </h2>
            <button onClick={handleReset} className="btn-outline text-sm py-2 px-4">
              Change Mood
            </button>
          </div>

          {!user && (
            <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3 text-amber-800 text-sm mb-6">
              Sign in to save your mood history and get personalized matches
            </div>
          )}

          <div className="mb-6">
            <h3 className="font-semibold text-gray-700 mb-3">Recommended Activities</h3>
            <div className="flex flex-wrap gap-2">
              {selectedMood.activities.map((act) => (
                <span key={act} className="px-4 py-1.5 rounded-full text-sm font-medium bg-violet-100 text-violet-700">
                  {act}
                </span>
              ))}
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="h-40 bg-gray-200 rounded-xl mb-3"></div>
                  <div className="h-4 bg-gray-200 rounded w-2/3 mb-2"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </div>
              ))}
            </div>
          ) : (
            <>
              <h3 className="font-bold text-xl text-gray-800 mb-4">Recommended Companions</h3>
              {recommendations && recommendations.length > 0 ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 mb-8">
                  {recommendations.map((companion) => (
                    <CompanionCard key={companion.id} companion={companion} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500 mb-8">
                  <div className="text-4xl mb-3">🔍</div>
                  <p>No companions found for this mood right now.</p>
                </div>
              )}
              <div className="text-center">
                <Link to="/companions" className="btn-primary inline-block py-3 px-8">
                  Explore All Companions
                </Link>
              </div>
            </>
          )}
        </>
      )}
    </div>
  );
}
