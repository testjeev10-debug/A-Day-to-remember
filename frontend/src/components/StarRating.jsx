import React from 'react';

export default function StarRating({ rating, max = 5, interactive = false, onRate, size = 'md' }) {
  const starSize = size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-2xl' : 'text-base';

  return (
    <div className={`flex items-center gap-0.5 ${starSize}`}>
      {Array.from({ length: max }, (_, i) => {
        const filled = i < Math.round(rating);
        return (
          <button
            key={i}
            type="button"
            onClick={() => interactive && onRate && onRate(i + 1)}
            className={`${interactive ? 'cursor-pointer hover:scale-125 transition-transform' : 'cursor-default'} ${filled ? 'text-amber-400 drop-shadow-[0_0_4px_rgba(251,191,36,0.6)]' : 'text-gray-600'}`}
            disabled={!interactive}
          >
            ★
          </button>
        );
      })}
    </div>
  );
}
