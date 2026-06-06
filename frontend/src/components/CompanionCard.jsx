import React from 'react';
import { Link } from 'react-router-dom';
import ActivityBadge from './ActivityBadge';
import StarRating from './StarRating';

export default function CompanionCard({ companion }) {
  const activities = (() => {
    try { return JSON.parse(companion.activities || '[]'); } catch { return []; }
  })();

  return (
    <div className="card hover:shadow-lg transition-shadow duration-200 flex flex-col">
      <div className="relative">
        <img
          src={companion.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(companion.name)}&background=f43f5e&color=fff&size=300`}
          alt={companion.name}
          className="w-full h-52 object-cover"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(companion.name)}&background=f43f5e&color=fff&size=300`;
          }}
        />
        <div className="absolute top-3 right-3 bg-white rounded-full px-2 py-0.5 text-sm font-bold text-rose-600 shadow">
          ${companion.hourly_rate}/hr
        </div>
      </div>

      <div className="p-4 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-1">
          <h3 className="font-bold text-lg text-gray-800">{companion.name}</h3>
          <div className="flex items-center gap-1 text-sm text-gray-500">
            <StarRating rating={companion.avg_rating} size="sm" />
            <span className="ml-1">{companion.avg_rating > 0 ? companion.avg_rating.toFixed(1) : 'New'}</span>
          </div>
        </div>

        <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
          <span>📍</span> {companion.city || 'Location not set'}
        </p>

        <p className="text-sm text-gray-600 mb-3 line-clamp-2 flex-1">
          {companion.bio || 'No bio yet.'}
        </p>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {activities.slice(0, 3).map((act) => (
            <ActivityBadge key={act} activity={act} size="sm" />
          ))}
          {activities.length > 3 && (
            <span className="badge bg-gray-100 text-gray-600 text-xs px-2 py-0.5">+{activities.length - 3} more</span>
          )}
        </div>

        <Link
          to={`/companions/${companion.id}`}
          className="btn-primary text-center text-sm w-full"
        >
          View Profile
        </Link>
      </div>
    </div>
  );
}
