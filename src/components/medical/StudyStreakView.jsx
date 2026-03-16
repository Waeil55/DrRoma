import { useState, useEffect } from 'react';

const RANKS = ['Intern', 'Resident', 'Fellow', 'Attending', 'Consultant', 'Professor', 'Dean', 'Legend'];

export default function StudyStreakView({ flashcards, exams }) {
  const [streakData, setStreakData] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mariam_streak_data') || '{}'); }
    catch { return {}; }
  });

  useEffect(() => {
    const today = new Date().toISOString().slice(0, 10);
    const cardsToday = flashcards.reduce((s, f) => s + (f.cards?.filter(c => c.lastReview && new Date(c.lastReview).toISOString().slice(0, 10) === today).length || 0), 0);
    if (cardsToday > 0 && !streakData[today]) {
      const updated = { ...streakData, [today]: { cards: cardsToday, ts: Date.now() } };
      setStreakData(updated);
      localStorage.setItem('mariam_streak_data', JSON.stringify(updated));
    }
  }, [flashcards]);

  const today = new Date().toISOString().slice(0, 10);
  const dates = Object.keys(streakData).sort().reverse();
  let currentStreak = 0;
  const d = new Date();
  for (let i = 0; i < 365; i++) {
    const k = d.toISOString().slice(0, 10);
    if (streakData[k]) currentStreak++;
    else if (i > 0) break;
    d.setDate(d.getDate() - 1);
  }
  const longestStreak = (() => {
    const sorted = Object.keys(streakData).sort();
    let max = 0, cur = 0, prev = null;
    sorted.forEach(s => {
      const dt = new Date(s);
      if (prev && (dt - prev) === 86400000) cur++;
      else cur = 1;
      if (cur > max) max = cur;
      prev = dt;
    });
    return max;
  })();

  const totalCards = flashcards.reduce((s, f) => s + (f.cards?.filter(c => c.lastReview).length || 0), 0);
  const totalExams = exams.filter(e => e.lastAttempt).length;
  const xp = totalCards * 10 + totalExams * 50 + currentStreak * 25;
  const level = Math.floor(xp / 500) + 1;
  const xpInLevel = xp % 500;
  const levelPct = Math.round((xpInLevel / 500) * 100);

  const rank = RANKS[Math.min(level - 1, RANKS.length - 1)];

  const heatmapDays = [...Array(30)].map((_, i) => {
    const dt = new Date(); dt.setDate(dt.getDate() - (29 - i));
    const k = dt.toISOString().slice(0, 10);
    return { date: k, label: dt.getDate(), active: !!streakData[k], day: dt.toLocaleDateString('en', { weekday: 'short' }) };
  });

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-4">
      <h2 className="text-xl font-black flex items-center gap-2">🔥 Study Streak</h2>

      {/* Level card */}
      <div className="glass rounded-3xl p-6 text-center relative overflow-hidden" style={{ border: '1px solid var(--accent)/30' }}>
        <div className="bg-mesh absolute inset-0 opacity-10" />
        <div className="relative z-10">
          <div className="text-5xl mb-2">🏆</div>
          <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>Level {level} — {rank}</div>
          <div className="text-sm opacity-50 mt-1">{xp.toLocaleString()} XP</div>
          <div className="mt-4 mx-auto max-w-xs">
            <div className="h-3 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${levelPct}%`, background: 'var(--accent)' }} />
            </div>
            <p className="text-xs opacity-40 mt-1">{xpInLevel}/500 XP to next level</p>
          </div>
        </div>
      </div>

      {/* Streak stats */}
      <div className="grid grid-cols-3 gap-3">
        <div className="glass rounded-2xl p-4 text-center" style={{ border: '1px solid var(--border)' }}>
          <div className="text-3xl font-black" style={{ color: currentStreak > 0 ? '#f59e0b' : 'var(--text-secondary)' }}>🔥 {currentStreak}</div>
          <div className="text-xs opacity-40 mt-1">Current Streak</div>
        </div>
        <div className="glass rounded-2xl p-4 text-center" style={{ border: '1px solid var(--border)' }}>
          <div className="text-3xl font-black" style={{ color: '#8b5cf6' }}>⚡ {longestStreak}</div>
          <div className="text-xs opacity-40 mt-1">Longest Streak</div>
        </div>
        <div className="glass rounded-2xl p-4 text-center" style={{ border: '1px solid var(--border)' }}>
          <div className="text-3xl font-black" style={{ color: '#10b981' }}>📅 {dates.length}</div>
          <div className="text-xs opacity-40 mt-1">Days Studied</div>
        </div>
      </div>

      {/* 30-day heatmap */}
      <div className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
        <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-3">Last 30 Days</h3>
        <div className="grid grid-cols-10 gap-1">
          {heatmapDays.map((d, i) => (
            <div key={i} className="aspect-square rounded-lg flex items-center justify-center text-xs font-bold relative group cursor-default"
              style={{ background: d.active ? 'var(--accent)' : 'var(--border)/50', color: d.active ? '#fff' : 'var(--text-secondary)', opacity: d.active ? 1 : .3 }}>
              {d.label}
              <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-xs px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 pointer-events-none">
                {d.day} {d.date}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* XP breakdown */}
      <div className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
        <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-3">XP Breakdown</h3>
        <div className="space-y-2">
          {[
            { label: 'Cards reviewed', count: totalCards, xp: totalCards * 10, icon: '📇' },
            { label: 'Exams completed', count: totalExams, xp: totalExams * 50, icon: '📝' },
            { label: 'Streak bonus', count: currentStreak + ' days', xp: currentStreak * 25, icon: '🔥' },
          ].map(item => (
            <div key={item.label} className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: 'var(--surface,var(--card))' }}>
              <span className="text-sm">{item.icon} {item.label}</span>
              <span className="text-sm opacity-50">{item.count}</span>
              <span className="text-sm font-black" style={{ color: 'var(--accent)' }}>+{item.xp} XP</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
