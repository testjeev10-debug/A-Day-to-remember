import React from 'react';
import { Link } from 'react-router-dom';
import ActivityBadge from './ActivityBadge';
import StarRating from './StarRating';

export default function CompanionCard({ companion }) {
  const activities = (() => {
    try { return JSON.parse(companion.activities || '[]'); } catch { return []; }
  })();

  return (
    <div className="card-lift group relative bg-gradient-to-b from-white/8 to-white/3 border border-white/10 rounded-2xl overflow-hidden hover:border-violet-500/40">
      {/* Photo */}
      <div className="relative overflow-hidden h-56">
        <img
          src={companion.photo_url || `https://ui-avatars.com/api/?name=${encodeURIComponent(companion.name)}&background=7c3aed&color=fff&size=300`}
          alt={companion.name}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
          onError={(e) => {
            e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(companion.name)}&background=7c3aed&color=fff&size=300`;
          }}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-[#0f0c1a] via-[#0f0c1a]/20 to-transparent" />

        {/* Rate badge */}
        <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-sm border border-white/20 rounded-xl px-3 py-1 text-sm font-bold text-amber-300">
          ${companion.hourly_rate}/hr
        </div>

        {/* Rating floating at bottom of image */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 bg-black/60 backdrop-blur-sm border border-white/10 rounded-full px-2.5 py-1">
          <StarRating rating={companion.avg_rating} size="sm" />
          <span className="text-xs font-bold text-white">
            {companion.avg_rating > 0 ? companion.avg_rating.toFixed(1) : 'New'}
          </span>
          {companion.review_count > 0 && (
            <span className="text-xs text-gray-400">({companion.review_count})</span>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex flex-col flex-1">
        <div className="flex items-start justify-between mb-1.5">
          <h3 className="font-extrabold text-lg text-white leading-tight">{companion.name}</h3>
        </div>

        <p className="text-xs text-violet-400 font-semibold mb-3 flex items-center gap-1.5">
          <span className="text-base">📍</span> {companion.city || 'Location not set'}
        </p>

        <p className="text-sm text-gray-400 mb-4 line-clamp-2 leading-relaxed">
          {companion.bio || 'No bio yet.'}
        </p>

        {/* Activity badges */}
        <div className="flex flex-wrap gap-1.5 mb-5">
          {activities.slice(0, 3).map((act) => (
            <ActivityBadge key={act} activity={act} size="sm" />
          ))}
          {activities.length > 3 && (
            <span className="badge bg-white/10 text-gray-400 text-xs px-2.5 py-1">
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
