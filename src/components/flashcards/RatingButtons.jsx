/**
 * MARIAM PRO — Rating Buttons Component
 * FSRS rating buttons (Again/Hard/Good/Easy) for flashcard review.
 */
import React from 'react';

const RATINGS = [
  ['Again', 0, '#ef4444', '🔁'],
  ['Hard',  2, '#f59e0b', '😓'],
  ['Good',  3, '#3b82f6', '👍'],
  ['Easy',  5, '#10b981', '⚡'],
];

export default function RatingButtons({ onRate, flipped, onShowAnswer }) {
  if (!flipped) {
    return (
      <button onClick={onShowAnswer}
        className="w-full py-4 btn-accent rounded-2xl text-base font-black shadow-xl">
        Show Answer
      </button>
    );
  }

  return (
    <div className="grid grid-cols-4 gap-3">
      {RATINGS.map(([label, quality, color, emoji]) => (
        <button key={label} onClick={() => onRate(quality)}
          className="text-white py-4 rounded-2xl text-sm font-black uppercase tracking-wide shadow-lg active:scale-95 transition-all flex flex-col items-center gap-1"
          style={{ background: color }}>
          <span className="text-base">{emoji}</span>{label}
        </button>
      ))}
    </div>
  );
}
