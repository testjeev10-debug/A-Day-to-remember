import React from 'react';

const ACTIVITY_CONFIG = {
  'Shopping': { emoji: '🛍️', color: 'bg-pink-500/20 text-pink-300 border border-pink-500/30' },
  'Movies & Entertainment': { emoji: '🎬', color: 'bg-purple-500/20 text-purple-300 border border-purple-500/30' },
  'Dining & Cafes': { emoji: '☕', color: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
  'Outdoor & City Tours': { emoji: '🌳', color: 'bg-green-500/20 text-green-300 border border-green-500/30' },
  'Emotional Support': { emoji: '💙', color: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
  'Picnic': { emoji: '🧺', color: 'bg-lime-500/20 text-lime-300 border border-lime-500/30' },
  'Hiking & Nature Walks': { emoji: '🥾', color: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
  'Beach Day': { emoji: '🏖️', color: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' },
  'Camping': { emoji: '🏕️', color: 'bg-teal-500/20 text-teal-300 border border-teal-500/30' },
  'Cycling': { emoji: '🚴', color: 'bg-green-500/20 text-green-300 border border-green-500/30' },
  'Stargazing': { emoji: '🔭', color: 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' },
  'Morning Walk': { emoji: '🌅', color: 'bg-orange-500/20 text-orange-300 border border-orange-500/30' },
  'Gardening': { emoji: '🌱', color: 'bg-lime-500/20 text-lime-300 border border-lime-500/30' },
  'Arcade Gaming': { emoji: '🕹️', color: 'bg-violet-500/20 text-violet-300 border border-violet-500/30' },
  'Binge Watching': { emoji: '📺', color: 'bg-purple-500/20 text-purple-300 border border-purple-500/30' },
  'Board Games & Puzzles': { emoji: '🎲', color: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' },
  'Karaoke': { emoji: '🎤', color: 'bg-rose-500/20 text-rose-300 border border-rose-500/30' },
  'Dancing': { emoji: '💃', color: 'bg-fuchsia-500/20 text-fuchsia-300 border border-fuchsia-500/30' },
  'Escape Rooms': { emoji: '🔐', color: 'bg-red-500/20 text-red-300 border border-red-500/30' },
  'Concerts & Live Music': { emoji: '🎵', color: 'bg-pink-500/20 text-pink-300 border border-pink-500/30' },
  'Comedy Shows': { emoji: '🎭', color: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
  'Painting & Art': { emoji: '🎨', color: 'bg-orange-500/20 text-orange-300 border border-orange-500/30' },
  'Cooking Together': { emoji: '🍳', color: 'bg-amber-500/20 text-amber-300 border border-amber-500/30' },
  'Brunch Date': { emoji: '🥞', color: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' },
  'Food Tour': { emoji: '🍜', color: 'bg-red-500/20 text-red-300 border border-red-500/30' },
  'Dessert & Cafe Hopping': { emoji: '🍰', color: 'bg-pink-500/20 text-pink-300 border border-pink-500/30' },
  'Bar & Nightlife': { emoji: '🍻', color: 'bg-purple-500/20 text-purple-300 border border-purple-500/30' },
  'Cuddling & Comfort': { emoji: '🤗', color: 'bg-rose-500/20 text-rose-300 border border-rose-500/30' },
  'Yoga & Meditation': { emoji: '🧘', color: 'bg-teal-500/20 text-teal-300 border border-teal-500/30' },
  'Gym & Workout': { emoji: '💪', color: 'bg-orange-500/20 text-orange-300 border border-orange-500/30' },
  'Spa Day': { emoji: '💆', color: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' },
  'Thrift Shopping': { emoji: '👗', color: 'bg-pink-500/20 text-pink-300 border border-pink-500/30' },
  'Grocery Shopping': { emoji: '🛒', color: 'bg-green-500/20 text-green-300 border border-green-500/30' },
  'Museum & Art Gallery': { emoji: '🖼️', color: 'bg-stone-500/20 text-stone-300 border border-stone-500/30' },
  'Book Club & Reading': { emoji: '📚', color: 'bg-blue-500/20 text-blue-300 border border-blue-500/30' },
  'Sports Watching': { emoji: '🏟️', color: 'bg-green-500/20 text-green-300 border border-green-500/30' },
  'Photography Walk': { emoji: '📷', color: 'bg-gray-500/20 text-gray-300 border border-gray-500/30' },
  'Volunteering Together': { emoji: '🤝', color: 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30' },
  'DIY Projects': { emoji: '🔨', color: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30' },
};

export default function ActivityBadge({ activity, size = 'md' }) {
  const config = ACTIVITY_CONFIG[activity] || { emoji: '✨', color: 'bg-white/10 text-gray-300 border border-white/15' };
  const sizeClass = size === 'sm' ? 'text-xs px-2 py-0.5' : 'text-sm px-3 py-1';

  return (
    <span className={`badge ${config.color} ${sizeClass} rounded-full`}>
      <span>{config.emoji}</span>
      <span>{activity}</span>
    </span>
  );
}

export { ACTIVITY_CONFIG };
