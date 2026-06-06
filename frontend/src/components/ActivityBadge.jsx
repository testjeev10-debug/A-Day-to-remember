import React from 'react';

const ACTIVITY_CONFIG = {
  'Shopping': { emoji: '🛍️', color: 'bg-pink-100 text-pink-700' },
  'Movies & Entertainment': { emoji: '🎬', color: 'bg-violet-100 text-violet-700' },
  'Dining & Cafes': { emoji: '☕', color: 'bg-amber-100 text-amber-700' },
  'Outdoor & City Tours': { emoji: '🌳', color: 'bg-emerald-100 text-emerald-700' },
  'Emotional Support': { emoji: '💙', color: 'bg-blue-100 text-blue-700' },
  'Picnic': { emoji: '🧺', color: 'bg-lime-100 text-lime-700' },
  'Hiking & Nature Walks': { emoji: '🥾', color: 'bg-emerald-100 text-emerald-700' },
  'Beach Day': { emoji: '🏖️', color: 'bg-cyan-100 text-cyan-700' },
  'Camping': { emoji: '🏕️', color: 'bg-teal-100 text-teal-700' },
  'Cycling': { emoji: '🚴', color: 'bg-green-100 text-green-700' },
  'Stargazing': { emoji: '🔭', color: 'bg-indigo-100 text-indigo-700' },
  'Morning Walk': { emoji: '🌅', color: 'bg-orange-100 text-orange-700' },
  'Gardening': { emoji: '🌱', color: 'bg-lime-100 text-lime-700' },
  'Arcade Gaming': { emoji: '🕹️', color: 'bg-violet-100 text-violet-700' },
  'Binge Watching': { emoji: '📺', color: 'bg-purple-100 text-purple-700' },
  'Board Games & Puzzles': { emoji: '🎲', color: 'bg-yellow-100 text-yellow-700' },
  'Karaoke': { emoji: '🎤', color: 'bg-rose-100 text-rose-700' },
  'Dancing': { emoji: '💃', color: 'bg-fuchsia-100 text-fuchsia-700' },
  'Escape Rooms': { emoji: '🔐', color: 'bg-red-100 text-red-700' },
  'Concerts & Live Music': { emoji: '🎵', color: 'bg-pink-100 text-pink-700' },
  'Comedy Shows': { emoji: '🎭', color: 'bg-amber-100 text-amber-700' },
  'Painting & Art': { emoji: '🎨', color: 'bg-orange-100 text-orange-700' },
  'Cooking Together': { emoji: '🍳', color: 'bg-amber-100 text-amber-700' },
  'Brunch Date': { emoji: '🥞', color: 'bg-yellow-100 text-yellow-700' },
  'Food Tour': { emoji: '🍜', color: 'bg-red-100 text-red-700' },
  'Dessert & Cafe Hopping': { emoji: '🍰', color: 'bg-pink-100 text-pink-700' },
  'Bar & Nightlife': { emoji: '🍻', color: 'bg-purple-100 text-purple-700' },
  'Cuddling & Comfort': { emoji: '🤗', color: 'bg-rose-100 text-rose-700' },
  'Yoga & Meditation': { emoji: '🧘', color: 'bg-teal-100 text-teal-700' },
  'Gym & Workout': { emoji: '💪', color: 'bg-orange-100 text-orange-700' },
  'Spa Day': { emoji: '💆', color: 'bg-emerald-100 text-emerald-700' },
  'Thrift Shopping': { emoji: '👗', color: 'bg-pink-100 text-pink-700' },
  'Grocery Shopping': { emoji: '🛒', color: 'bg-green-100 text-green-700' },
  'Museum & Art Gallery': { emoji: '🖼️', color: 'bg-stone-100 text-stone-700' },
  'Book Club & Reading': { emoji: '📚', color: 'bg-blue-100 text-blue-700' },
  'Sports Watching': { emoji: '🏟️', color: 'bg-green-100 text-green-700' },
  'Photography Walk': { emoji: '📷', color: 'bg-gray-100 text-gray-700' },
  'Volunteering Together': { emoji: '🤝', color: 'bg-cyan-100 text-cyan-700' },
  'DIY Projects': { emoji: '🔨', color: 'bg-yellow-100 text-yellow-700' },
};

export default function ActivityBadge({ activity, size = 'md' }) {
  const config = ACTIVITY_CONFIG[activity] || { emoji: '✨', color: 'bg-violet-100 text-violet-700' };
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span className={`badge ${config.color} ${sizeClass} rounded-full font-semibold`}>
      <span>{config.emoji}</span>
      <span>{activity}</span>
    </span>
  );
}

export { ACTIVITY_CONFIG };
