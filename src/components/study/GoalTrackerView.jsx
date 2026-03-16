import React, { useState, useEffect } from 'react';
import { Layers, CheckSquare, CalendarDays } from 'lucide-react';

export default function GoalTrackerView({ flashcards, exams, addToast }) {
  const [goals, setGoals] = useState(() => { try { return JSON.parse(localStorage.getItem('mariam_goals') || 'null') || { dailyCards: 20, dailyExams: 5, weeklyStudyDays: 5 }; } catch { return { dailyCards: 20, dailyExams: 5, weeklyStudyDays: 5 }; } });
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(goals);
  const [streak, setStreak] = useState(0);
  const [todayCards, setTodayCards] = useState(0);

  useEffect(() => {
    const key = new Date().toISOString().slice(0, 10);
    const stored = JSON.parse(localStorage.getItem(`mariam_daily_${key}`) || '{"cards":0,"exams":0}');
    setTodayCards(stored.cards || 0);
    let s = 0;
    for (let i = 0; i < 365; i++) { const d = new Date(); d.setDate(d.getDate() - i); const k = d.toISOString().slice(0, 10); const day = JSON.parse(localStorage.getItem(`mariam_daily_${k}`) || '{"cards":0}'); if ((day.cards || 0) >= goals.dailyCards) s++; else if (i > 0) break; }
    setStreak(s);
  }, [goals.dailyCards]);

  const saveGoals = () => { setGoals(draft); localStorage.setItem('mariam_goals', JSON.stringify(draft)); setEditing(false); addToast('Goals updated ✓', 'success'); };
  const cardPct = Math.min(100, Math.round((todayCards / Math.max(1, goals.dailyCards)) * 100));
  const circ = 2 * Math.PI * 40;
  const MILESTONES = [{ days: 3, label: '3-Day Streak', icon: '🔥', color: '#f59e0b' },{ days: 7, label: 'Weekly Warrior', icon: '⚡', color: '#f97316' },{ days: 14, label: '2-Week Champion', icon: '🏅', color: '#8b5cf6' },{ days: 30, label: 'Monthly Master', icon: '🥇', color: '#6366f1' },{ days: 60, label: '2-Month Legend', icon: '🏆', color: '#06b6d4' },{ days: 100, label: '100-Day Elite', icon: '💎', color: '#ec4899' },{ days: 365, label: 'Year-Long Scholar', icon: '👑', color: '#f43f5e' }];

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar scroll-content p-4 space-y-4">
      <div className="flex items-center justify-between"><h1 className="text-2xl font-black">Goal Tracker</h1><button onClick={() => { setDraft(goals); setEditing(!editing); }} className="glass px-4 py-2 rounded-xl text-sm font-black" style={{ border: '1px solid var(--border)', color: 'var(--accent)' }}>{editing ? 'Cancel' : '✏️ Edit'}</button></div>
      <div className="glass rounded-3xl p-6 relative overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="bg-mesh absolute inset-0 opacity-20" />
        <div className="relative z-10 flex flex-col items-center">
          <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-4">Today's Progress</p>
          <div className="relative w-32 h-32 flex items-center justify-center">
            <svg width={128} height={128} viewBox="0 0 100 100" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}><circle cx={50} cy={50} r={40} fill="none" stroke="var(--border)" strokeWidth={8} /><circle cx={50} cy={50} r={40} fill="none" stroke="var(--accent)" strokeWidth={8} strokeDasharray={`${(cardPct / 100) * circ} ${circ}`} strokeLinecap="round" style={{ transition: 'stroke-dasharray 1s ease', filter: 'drop-shadow(0 0 6px var(--accent))' }} /></svg>
            <div className="text-center z-10"><div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>{cardPct}%</div><div className="text-xs opacity-50">{todayCards}/{goals.dailyCards} cards</div></div>
          </div>
          <div className="flex gap-8 mt-6 text-center"><div><div className="text-3xl font-black" style={{ color: '#f59e0b' }}>🔥 {streak}</div><div className="text-xs opacity-40 font-bold">Day Streak</div></div><div><div className="text-3xl font-black" style={{ color: 'var(--success)' }}>{todayCards}</div><div className="text-xs opacity-40 font-bold">Cards Today</div></div></div>
        </div>
      </div>
      {editing ? (
        <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--accent)/40' }}>
          <h2 className="font-black mb-4 text-sm opacity-70">Edit Daily Goals</h2>
          {[{ key: 'dailyCards', label: 'Cards per day', icon: Layers, min: 5, max: 100, step: 5 },{ key: 'dailyExams', label: 'Exam questions per day', icon: CheckSquare, min: 1, max: 50, step: 5 },{ key: 'weeklyStudyDays', label: 'Study days per week', icon: CalendarDays, min: 1, max: 7, step: 1 }].map(({ key, label, icon: Icon, min, max, step }) => (
            <div key={key} className="mb-4"><div className="flex items-center justify-between mb-2"><span className="text-sm font-bold flex items-center gap-2"><Icon size={14} /> {label}</span><span className="font-black text-sm" style={{ color: 'var(--accent)' }}>{draft[key]}</span></div><input type="range" min={min} max={max} step={step} value={draft[key]} onChange={e => setDraft(p => ({ ...p, [key]: +e.target.value }))} className="w-full accent-[var(--accent)]" /><div className="flex justify-between text-xs opacity-30 mt-1"><span>{min}</span><span>{max}</span></div></div>
          ))}
          <button onClick={saveGoals} className="btn-accent w-full py-3 rounded-xl font-black">Save Goals</button>
        </div>
      ) : (
        <div className="grid grid-cols-3 gap-3">
          {[{ key: 'dailyCards', label: 'Cards/day', icon: Layers, color: '#8b5cf6' },{ key: 'dailyExams', label: 'Questions/day', icon: CheckSquare, color: '#3b82f6' },{ key: 'weeklyStudyDays', label: 'Days/week', icon: CalendarDays, color: '#06b6d4' }].map(({ key, label, icon: Icon, color }) => (
            <div key={key} className="glass rounded-2xl p-4 text-center" style={{ border: '1px solid var(--border)' }}><Icon size={20} className="mx-auto mb-2" style={{ color }} /><div className="text-2xl font-black" style={{ color }}>{goals[key]}</div><div className="text-xs opacity-40 mt-1">{label}</div></div>
          ))}
        </div>
      )}
      <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
        <h2 className="font-black text-sm opacity-70 mb-4">Streak Milestones</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {MILESTONES.map(({ days, label, icon, color }) => { const unlocked = streak >= days; return (
            <div key={days} className="rounded-2xl p-4 text-center transition-all" style={{ border: `1px solid ${unlocked ? color + '40' : 'var(--border)'}`, background: unlocked ? color + '10' : 'transparent', opacity: unlocked ? 1 : 0.45 }}>
              <div className="text-3xl mb-2">{unlocked ? icon : '🔒'}</div><div className="text-xs font-black" style={{ color: unlocked ? color : 'var(--text3)' }}>{label}</div><div className="text-xs opacity-40 mt-1">{days} days</div>
              {!unlocked && streak > 0 && <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}><div className="h-full rounded-full" style={{ width: `${Math.min(100, (streak / days) * 100)}%`, background: color }} /></div>}
            </div>); })}
        </div>
      </div>
      <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
        <h2 className="font-black text-sm opacity-70 mb-4">This Week</h2>
        <div className="grid grid-cols-7 gap-1.5">
          {[...Array(7)].map((_, i) => { const d = new Date(); d.setDate(d.getDate() - (6 - i)); const k = d.toISOString().slice(0, 10); const day = JSON.parse(localStorage.getItem(`mariam_daily_${k}`) || '{"cards":0}'); const pct = Math.min(1, (day.cards || 0) / Math.max(1, goals.dailyCards)); const dayLabel = ['S','M','T','W','T','F','S'][d.getDay()]; const isToday = i === 6; return (
            <div key={i} className="flex flex-col items-center gap-1"><div className="relative w-full" style={{ aspectRatio: '1' }}><div className="absolute inset-0 rounded-xl transition-all" style={{ background: `rgba(var(--acc-rgb,99,102,241),${pct * 0.85 + 0.05})`, border: isToday ? '2px solid var(--accent)' : '1px solid var(--border)' }} />{pct >= 1 && <div className="absolute inset-0 flex items-center justify-center text-xs">✓</div>}</div><span className="text-xs opacity-40">{dayLabel}</span></div>); })}
        </div>
      </div>
    </div>
  );
}
