import React from 'react';
import { Link } from 'react-router-dom';
import ActivityBadge from './ActivityBadge';
import StarRating from './StarRating';

export default function CompanionCard({ companion }) {
  const activities = (() => {
    try { return JSON.parse(companion.activities || '[]'); } catch { return []; }
  })();

  return (
    <div className="card-lift group bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 hover:border-violet-200 hover:shadow-xl">
      {/* Photo */}
      <div className="relative overflow-hidden h-56">
        <img
          src={companion.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(companion.name)}&background=7c3aed&color=fff&size=300`}
          alt={companion.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(companion.name)}&background=7c3aed&color=fff&size=300`;
          }}
        />
        {/* Subtle bottom gradient */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />

        {/* Price badge top-right */}
        <div className="absolute top-3 right-3 bg-gradient-to-r from-violet-600 to-pink-500 rounded-xl px-3 py-1 text-sm font-bold text-white shadow-md">
          ${companion.hourly_rate}/hr
        </div>

        {/* Rating badge bottom-left */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-white/95 backdrop-blur-sm rounded-full px-2.5 py-1 shadow-sm">
          <StarRating rating={companion.avg_rating} size="sm" />
          <span className="text-xs font-bold text-gray-800">
            {companion.avg_rating > 0 ? companion.avg_rating.toFixed(1) : 'New'}
          </span>
          {companion.review_count > 0 && (
            <span className="text-xs text-gray-500">({companion.review_count})</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col">
        <h3 className="font-extrabold text-lg text-gray-900 leading-tight mb-1">{companion.name}</h3>

        <p className="text-xs text-violet-600 font-semibold mb-3 flex items-center gap-1">
          <span>📍</span> {companion.city || 'Location not set'}
        </p>

        <p className="text-sm text-gray-500 mb-4 line-clamp-2 leading-relaxed">
          {companion.bio || 'No bio yet.'}
        </p>

        {/* Activity badges */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {activities.slice(0, 3).map((act) => (
            <ActivityBadge key={act} activity={act} size="sm" />
          ))}
          {activities.length > 3 && (
            <span className="badge bg-gray-100 text-gray-500 text-xs px-2.5 py-1 rounded-full">
              +{activities.length - 3} more
            </span>
          )}
        </div>

        <Link
          to={`/companions/${companion.id}`}
          className="block w-full text-center btn-primary py-2.5 text-sm mt-auto"
        >
          View Profile →
        </Link>
      </div>
    </div>
  );
}
