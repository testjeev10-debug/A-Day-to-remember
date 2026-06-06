import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';
import ActivityBadge from '../components/ActivityBadge';
import StarRating from '../components/StarRating';

export default function CompanionProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [companion, setCompanion] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get(`/api/companions/${id}`)
      .then((res) => setCompanion(res.data))
      .catch(() => setError('Companion not found.'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-10 animate-pulse">
        <div className="card overflow-hidden">
          <div className="h-64 bg-gray-200"></div>
          <div className="p-8 space-y-4">
            <div className="h-6 bg-gray-200 rounded w-1/3"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <div className="text-5xl mb-4">😕</div>
        <h2 className="text-2xl font-bold text-gray-700 mb-4">{error}</h2>
        <Link to="/companions" className="btn-primary">Back to Companions</Link>
      </div>
    );
  }

  const activities = (() => {
    try { return JSON.parse(companion.activities || '[]'); } catch { return []; }
  })();

  const handleBook = () => {
    if (!user) {
      navigate('/login');
    } else if (user.role === 'companion') {
      // do nothing
    } else {
      navigate(`/book/${companion.id}`);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <Link to="/companions" className="text-rose-600 hover:underline text-sm mb-6 inline-flex items-center gap-1">
        ← Back to Companions
      </Link>

      <div className="card overflow-hidden mt-4">
        {/* Header */}
        <div className="bg-gradient-to-r from-rose-500 to-amber-400 h-32 relative"></div>
        <div className="px-8 pb-8">
          <div className="flex flex-col sm:flex-row sm:items-end gap-4 -mt-16 mb-6">
            <img
              src={companion.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(companion.name)}&background=f43f5e&color=fff&size=200`}
              alt={companion.name}
              className="w-32 h-32 rounded-2xl object-cover border-4 border-white shadow-lg flex-shrink-0"
              onError={(e) => {
                e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(companion.name)}&background=f43f5e&color=fff&size=200`;
              }}
            />
            <div className="flex-1 sm:mt-16 sm:mb-0 mt-2">
              <h1 className="text-3xl font-bold text-gray-800">{companion.name}</h1>
              <div className="flex flex-wrap items-center gap-4 mt-1">
                <span className="text-gray-500 flex items-center gap-1">
                  <span>📍</span> {companion.city || 'Location not set'}
                </span>
                <div className="flex items-center gap-2">
                  <StarRating rating={companion.avg_rating} size="md" />
                  <span className="text-gray-600 font-medium">
                    {companion.avg_rating > 0 ? companion.avg_rating.toFixed(1) : 'New'}
                    {companion.review_count > 0 && <span className="text-gray-400 font-normal"> ({companion.review_count} reviews)</span>}
                  </span>
                </div>
              </div>
            </div>
            <div className="sm:mt-16">
              <div className="text-2xl font-bold text-rose-600">${companion.hourly_rate}<span className="text-base font-normal text-gray-400">/hr</span></div>
            </div>
          </div>

          {/* Bio */}
          {companion.bio && (
            <div className="mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-2">About Me</h2>
              <p className="text-gray-600 leading-relaxed">{companion.bio}</p>
            </div>
          )}

          {/* Activities */}
          <div className="mb-6">
            <h2 className="text-lg font-bold text-gray-800 mb-3">Available For</h2>
            <div className="flex flex-wrap gap-2">
              {activities.map((act) => <ActivityBadge key={act} activity={act} />)}
            </div>
          </div>

          {/* Book Button */}
          {user?.role !== 'companion' && (
            <button onClick={handleBook} className="btn-primary py-3 px-8 text-base">
              {!user ? 'Sign in to Book' : 'Book Now'}
            </button>
          )}
        </div>
      </div>

      {/* Reviews */}
      <div className="mt-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">
          Reviews {companion.reviews?.length > 0 && <span className="text-gray-400 font-normal text-lg">({companion.reviews.length})</span>}
        </h2>
        {companion.reviews?.length === 0 ? (
          <div className="card p-8 text-center text-gray-400">
            <div className="text-4xl mb-3">⭐</div>
            <p>No reviews yet. Be the first to book!</p>
          </div>
        ) : (
          <div className="space-y-4">
            {companion.reviews?.map((review) => (
              <div key={review.id} className="card p-5">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <p className="font-semibold text-gray-800">{review.reviewer_name}</p>
                    <StarRating rating={review.rating} size="sm" />
                  </div>
                  <span className="text-xs text-gray-400">
                    {new Date(review.created_at).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                  </span>
                </div>
                {review.comment && <p className="text-gray-600 text-sm mt-2">{review.comment}</p>}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
