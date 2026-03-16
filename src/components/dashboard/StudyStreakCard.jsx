/**
 * MARIAM PRO — StudyStreakCard
 * Visual streak tracker showing last 7 days plus milestone badges.
 */
import React, { useMemo } from 'react';
import { Flame, Shield } from 'lucide-react';

const MILESTONES = [7, 14, 30, 60, 100];

export default function StudyStreakCard({ streakDays = 0, longestStreak = 0, dailyHistory = [], freezesAvailable = 0, freezesUsed = {} }) {
  // dailyHistory: [{ date: 'YYYY-MM-DD', studied: bool }] last 7 days
  // freezesUsed: { 'YYYY-MM-DD': true } days where a freeze was consumed

  const last7 = useMemo(() => {
    const days = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const key = d.toISOString().slice(0, 10);
      const entry = dailyHistory.find(h => h.date === key);
      const frozen = freezesUsed[key];
      days.push({ key, studied: entry?.studied || false, frozen: !!frozen, label: d.toLocaleDateString('en', { weekday: 'short' }).slice(0, 2) });
    }
    return days;
  }, [dailyHistory, freezesUsed]);

  const earnedMilestones = MILESTONES.filter(m => longestStreak >= m);

  return (
    <div className="rounded-2xl p-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      {/* Streak count */}
      <div className="flex items-center gap-2 mb-3">
        <Flame size={24} style={{ color: streakDays > 0 ? '#f97316' : 'var(--text3)' }} />
        <span className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{streakDays}</span>
        <span className="text-sm" style={{ color: 'var(--text2)' }}>day streak</span>
        {freezesAvailable > 0 && (
          <div className="ml-auto flex items-center gap-1">
            <Shield size={14} style={{ color: '#3b82f6' }} />
            <span className="text-xs" style={{ color: 'var(--text2)' }}>{freezesAvailable} freeze{freezesAvailable > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Last 7 days row */}
      <div className="flex items-center justify-between gap-1 mb-3">
        {last7.map(day => (
          <div key={day.key} className="flex flex-col items-center gap-1">
            <span className="text-[10px]" style={{ color: 'var(--text3)' }}>{day.label}</span>
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-sm" style={{
              background: day.frozen ? 'color-mix(in srgb, #3b82f6 20%, transparent)' :
                day.studied ? 'color-mix(in srgb, #f97316 20%, transparent)' :
                'var(--bg)',
            }}>
              {day.frozen ? <Shield size={14} style={{ color: '#3b82f6' }} /> :
                day.studied ? <Flame size={14} style={{ color: '#f97316' }} /> :
                <Flame size={14} style={{ color: 'var(--text3)', opacity: 0.3 }} />
              }
            </div>
          </div>
        ))}
      </div>

      {/* Best streak */}
      <div className="flex items-center justify-between text-xs" style={{ color: 'var(--text2)' }}>
        <span>Best: {longestStreak} days</span>
        {earnedMilestones.length > 0 && (
          <div className="flex gap-1">
            {earnedMilestones.map(m => (
              <span key={m} className="px-1.5 py-0.5 rounded-full text-[10px] font-semibold"
                style={{ background: 'color-mix(in srgb, var(--accent) 20%, transparent)', color: 'var(--accent)' }}>
                🏆{m}d
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
