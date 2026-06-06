import React from 'react';

const ACTIVITY_CONFIG = {
  'Shopping': { emoji: '🛍️', color: 'bg-pink-100 text-pink-700' },
  'Movies & Entertainment': { emoji: '🎬', color: 'bg-purple-100 text-purple-700' },
  'Dining & Cafes': { emoji: '☕', color: 'bg-amber-100 text-amber-700' },
  'Outdoor & City Tours': { emoji: '🌳', color: 'bg-green-100 text-green-700' },
  'Emotional Support': { emoji: '💙', color: 'bg-blue-100 text-blue-700' },
};

export default function ActivityBadge({ activity, size = 'md' }) {
  const config = ACTIVITY_CONFIG[activity] || { emoji: '✨', color: 'bg-gray-100 text-gray-700' };
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span className={`badge ${config.color} ${sizeClass}`}>
      <span>{config.emoji}</span>
      <span>{activity}</span>
    </span>
  );
}

export { ACTIVITY_CONFIG };
