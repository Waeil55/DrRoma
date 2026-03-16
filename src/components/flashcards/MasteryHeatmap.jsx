/**
 * MARIAM PRO — Mastery Heatmap Component
 * Visualizes FSRS mastery levels as a grid heatmap.
 */
import React, { useMemo } from 'react';

const COLORS = {
  new:       'rgba(107,114,128,0.2)',
  learning:  '#f59e0b',
  review:    '#3b82f6',
  mastered:  '#10b981',
  overdue:   '#ef4444',
};

function getMasteryLevel(card) {
  if (!card.stability || card.stability === 0) return 'new';
  if (card.nextReview && card.nextReview < Date.now()) return 'overdue';
  if (card.stability < 1) return 'learning';
  if (card.stability < 10) return 'review';
  return 'mastered';
}

export default function MasteryHeatmap({ cards = [], title = 'Mastery Heatmap' }) {
  const levels = useMemo(() => {
    return cards.map(c => ({
      q: c.q || c.front || '',
      level: getMasteryLevel(c),
      stability: c.stability || 0,
    }));
  }, [cards]);

  const counts = useMemo(() => {
    const c = { new: 0, learning: 0, review: 0, mastered: 0, overdue: 0 };
    levels.forEach(l => { c[l.level]++; });
    return c;
  }, [levels]);

  return (
    <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
      <h3 className="font-black text-sm mb-3">{title}</h3>

      {/* Stats row */}
      <div className="flex gap-3 mb-4 flex-wrap">
        {Object.entries(counts).map(([level, count]) => (
          <div key={level} className="flex items-center gap-1.5 text-xs">
            <div className="w-3 h-3 rounded" style={{ background: COLORS[level] }} />
            <span className="opacity-60 capitalize">{level}</span>
            <span className="font-black">{count}</span>
          </div>
        ))}
      </div>

      {/* Heatmap grid */}
      <div className="flex flex-wrap gap-1">
        {levels.map((item, i) => (
          <div key={i}
            className="w-5 h-5 rounded-sm transition-all hover:scale-150 cursor-pointer"
            style={{ background: COLORS[item.level], opacity: 0.7 + (item.stability / 20) * 0.3 }}
            title={`${item.q.slice(0, 50)} — ${item.level} (S: ${item.stability.toFixed(1)})`}
          />
        ))}
      </div>

      {cards.length === 0 && (
        <p className="text-xs opacity-40 text-center py-4">No cards to display</p>
      )}
    </div>
  );
}
