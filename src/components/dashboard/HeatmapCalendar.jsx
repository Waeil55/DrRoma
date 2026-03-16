/**
 * MARIAM PRO — HeatmapCalendar
 * GitHub-style contribution/mastery heatmap for flashcard review activity.
 * Desktop: 52-week grid. Mobile: last 90 days simplified.
 */
import React, { useMemo, useState } from 'react';

const LEVELS = [
  { min: 0,  max: 0,  cls: 'heatmap-0' },
  { min: 1,  max: 5,  cls: 'heatmap-1' },
  { min: 6,  max: 15, cls: 'heatmap-2' },
  { min: 16, max: Infinity, cls: 'heatmap-3' },
];

function getLevel(count) {
  return LEVELS.find(l => count >= l.min && count <= l.max)?.cls || 'heatmap-0';
}

export default function HeatmapCalendar({ reviewHistory = {}, isMobile = false }) {
  // reviewHistory: { 'YYYY-MM-DD': { count: N, avgScore: M } }
  const [tooltip, setTooltip] = useState(null);

  const days = useMemo(() => {
    const result = [];
    const numDays = isMobile ? 90 : 364;
    for (let i = numDays; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const entry = reviewHistory[key] || { count: 0, avgScore: 0 };
      result.push({ key, ...entry, dayOfWeek: d.getDay() });
    }
    return result;
  }, [reviewHistory, isMobile]);

  // Streak calc
  const { currentStreak, bestStreak } = useMemo(() => {
    let cur = 0, best = 0, streak = 0;
    for (let i = days.length - 1; i >= 0; i--) {
      if (days[i].count > 0) {
        streak++;
        if (i === days.length - 1 || days[i + 1]?.count > 0) cur = streak;
      } else {
        best = Math.max(best, streak);
        streak = 0;
        if (i >= days.length - 1) cur = 0;
      }
    }
    best = Math.max(best, streak);
    return { currentStreak: cur, bestStreak: best };
  }, [days]);

  if (isMobile) {
    // Simplified 1-row horizontal scroll
    return (
      <div>
        <div className="overflow-x-auto pb-2">
          <div className="flex gap-[2px]" style={{ minWidth: days.length * 10 }}>
            {days.map(d => (
              <div
                key={d.key}
                className={`w-2 h-2 rounded-sm ${getLevel(d.count)}`}
                onClick={() => setTooltip(tooltip === d.key ? null : d.key)}
                style={{ cursor: 'pointer' }}
              />
            ))}
          </div>
        </div>
        {tooltip && reviewHistory[tooltip] && (
          <p className="text-xs mt-1" style={{ color: 'var(--text2)' }}>
            {reviewHistory[tooltip].count} cards reviewed · Avg score {Math.round(reviewHistory[tooltip].avgScore || 0)}%
          </p>
        )}
        <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: 'var(--text2)' }}>
          <span>🔥 {currentStreak} day streak</span>
          <span>Best: {bestStreak} days</span>
        </div>
      </div>
    );
  }

  // Desktop: 52-week grid (7 rows × ~52 cols)
  const weeks = [];
  let week = [];
  days.forEach((d, i) => {
    week.push(d);
    if (d.dayOfWeek === 6 || i === days.length - 1) {
      weeks.push(week);
      week = [];
    }
  });

  return (
    <div>
      <div className="flex gap-[2px]">
        {weeks.map((w, wi) => (
          <div key={wi} className="flex flex-col gap-[2px]">
            {w.map(d => (
              <div
                key={d.key}
                className={`w-3 h-3 rounded-sm ${getLevel(d.count)}`}
                title={`${d.key}: ${d.count} cards`}
                style={{ cursor: 'pointer' }}
                onClick={() => setTooltip(tooltip === d.key ? null : d.key)}
              />
            ))}
          </div>
        ))}
      </div>
      {tooltip && reviewHistory[tooltip] && (
        <p className="text-xs mt-2" style={{ color: 'var(--text2)' }}>
          {tooltip}: {reviewHistory[tooltip].count} cards reviewed · Avg score {Math.round(reviewHistory[tooltip].avgScore || 0)}%
        </p>
      )}
      <div className="flex items-center gap-4 mt-2 text-xs" style={{ color: 'var(--text2)' }}>
        <span>🔥 {currentStreak} day streak</span>
        <span>Best: {bestStreak} days</span>
      </div>

      <style>{`
        .heatmap-0 { background: var(--bg); }
        .heatmap-1 { background: color-mix(in srgb, var(--accent) 25%, transparent); }
        .heatmap-2 { background: color-mix(in srgb, var(--accent) 55%, transparent); }
        .heatmap-3 { background: var(--accent); }
      `}</style>
    </div>
  );
}
