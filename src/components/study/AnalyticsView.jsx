import React, { useState, useEffect, useMemo } from 'react';
import { BarChart2 } from 'lucide-react';
import { openDB } from '../../services/db/openDB';

function MasteryHeatmap() {
  const [activityMap, setActivityMap] = useState({});
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  useEffect(() => {
    openDB().then(db => {
      const tx = db.transaction('analytics', 'readonly');
      const req = tx.objectStore('analytics').getAll();
      req.onsuccess = e => {
        const rows = e.target.result || [];
        const map = {};
        rows.forEach(r => { if (r.type === 'study' && r.ts) { const d = new Date(r.ts); const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; map[key] = (map[key] || 0) + 1; } });
        setActivityMap(map);
        let s = 0, best = 0, cur = 0;
        const today = new Date();
        for (let d = 0; d < 365; d++) { const dt = new Date(today.getFullYear(), today.getMonth(), today.getDate() - d); const key = `${dt.getFullYear()}-${String(dt.getMonth()+1).padStart(2,'0')}-${String(dt.getDate()).padStart(2,'0')}`; if (map[key]) { cur++; if (d === 0 || s > 0) s = cur; } else { if (d === 0) s = 0; best = Math.max(best, cur); cur = 0; } }
        best = Math.max(best, cur); setStreak(s); setBestStreak(best);
      };
    }).catch(() => {});
  }, []);

  const cells = useMemo(() => { const arr = []; const today = new Date(); for (let i = 90; i >= 0; i--) { const d = new Date(today.getFullYear(), today.getMonth(), today.getDate() - i); const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; arr.push({ key, count: activityMap[key] || 0, date: d }); } return arr; }, [activityMap]);
  const getColor = count => { if (!count) return 'rgba(var(--acc-rgb,99,102,241),0.08)'; if (count < 5) return 'rgba(var(--acc-rgb,99,102,241),0.25)'; if (count < 15) return 'rgba(var(--acc-rgb,99,102,241),0.55)'; return 'rgba(var(--acc-rgb,99,102,241),1)'; };

  return (
    <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
      <div className="flex items-center justify-between mb-4">
        <h2 className="font-black text-sm opacity-70">Study Activity — Last 91 Days</h2>
        <div className="flex gap-4 text-xs font-bold">
          {streak > 0 && <span style={{ color: 'var(--accent)' }}> {streak}d streak</span>}
          {bestStreak > 0 && <span className="opacity-40">Best: {bestStreak}d</span>}
        </div>
      </div>
      <div className="overflow-x-auto"><div className="grid gap-0.5" style={{ gridTemplateColumns: 'repeat(13, 1fr)', minWidth: 260 }}>
        {cells.map(cell => (<div key={cell.key} title={`${cell.date.toLocaleDateString()} · ${cell.count} sessions`} className="rounded-sm transition-colors" style={{ aspectRatio: '1', background: getColor(cell.count) }} />))}
      </div></div>
      <div className="flex items-center gap-2 mt-3 justify-end"><span className="text-xs opacity-30">Less</span>{[0,2,8,20].map(n => (<div key={n} className="w-3 h-3 rounded-sm" style={{ background: getColor(n) }} />))}<span className="text-xs opacity-30">More</span></div>
    </div>
  );
}

export { MasteryHeatmap };

export default function AnalyticsView({ flashcards, exams, cases, docs, settings }) {
  const FSRS = window.__MARIAM_FSRS__ || { predictedScore: () => 0, masteryLevel: () => 'new' };
  const allCards = useMemo(() => flashcards.flatMap(s => s.cards || []), [flashcards]);
  const predictedScore = useMemo(() => FSRS.predictedScore(allCards), [allCards]);
  const masteryDist = useMemo(() => { const d = { new: 0, learning: 0, reviewing: 0, mastered: 0, struggling: 0 }; allCards.forEach(c => { d[FSRS.masteryLevel(c)] = (d[FSRS.masteryLevel(c)] || 0) + 1; }); return d; }, [allCards]);
  const dueToday = useMemo(() => allCards.filter(c => !c.nextReview || c.nextReview <= Date.now()).length, [allCards]);
  const dueThisWeek = useMemo(() => allCards.filter(c => c.nextReview && c.nextReview <= Date.now() + 7 * 86400000).length, [allCards]);
  const forecast = useMemo(() => { const days = []; for (let d = 0; d < 14; d++) { const t = Date.now() + d * 86400000; days.push({ d, count: allCards.filter(c => { const nr = c.nextReview || 0; return nr >= t && nr < t + 86400000; }).length, label: d === 0 ? 'Today' : d === 1 ? 'Tom' : `D+${d}` }); } return days; }, [allCards]);
  const maxForecast = Math.max(...forecast.map(d => d.count), 1);
  const topSets = useMemo(() => flashcards.map(set => ({ ...set, score: FSRS.predictedScore(set.cards || []), due: (set.cards || []).filter(c => !c.nextReview || c.nextReview <= Date.now()).length })).sort((a, b) => a.score - b.score), [flashcards]);
  const scoreColor = predictedScore >= 80 ? 'var(--success)' : predictedScore >= 60 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-4">
      <div className="glass rounded-3xl p-6 relative overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="bg-mesh absolute inset-0 opacity-30" />
        <div className="relative z-10 flex flex-col items-center text-center">
          <p className="text-xs font-black uppercase tracking-widest opacity-40 mb-2">Predicted Exam Score</p>
          <div className="text-7xl font-black tabular-nums" style={{ color: scoreColor, fontFamily: 'Plus Jakarta Sans,system-ui' }}>{predictedScore}%</div>
          <p className="text-sm opacity-50 mt-2">{allCards.length} cards tracked · {dueToday} due today</p>
          <div className="progress-bar w-full max-w-xs mt-4" style={{ height: 10 }}><div className="progress-fill" style={{ width: `${predictedScore}%`, background: scoreColor, transition: 'width 1s ease' }} /></div>
          <div className="flex gap-6 mt-4">
            {[['Due Today', dueToday, 'var(--warning)'], ['Due 7d', dueThisWeek, 'var(--info)'], ['Total', allCards.length, 'var(--text3)']].map(([l, v, c]) => (<div key={l} className="text-center"><div className="text-2xl font-black" style={{ color: c }}>{v}</div><div className="text-xs opacity-40 font-bold">{l}</div></div>))}
          </div>
        </div>
      </div>
      <MasteryHeatmap />
      <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
        <h2 className="font-black text-sm mb-4 opacity-70">Mastery Distribution</h2>
        <div className="space-y-2">
          {[{ k: 'mastered', label: 'Mastered', col: 'var(--success)' },{ k: 'learning', label: 'Learning', col: 'var(--info)' },{ k: 'reviewing', label: 'Reviewing', col: 'var(--accent)' },{ k: 'struggling', label: 'Struggling', col: 'var(--danger)' },{ k: 'new', label: 'New', col: 'var(--text3)' }].map(({ k, label, col }) => { const val = masteryDist[k] || 0; const pct = allCards.length ? Math.round(val / allCards.length * 100) : 0; return (
            <div key={k} className="flex items-center gap-3"><div className="text-xs font-black w-20 shrink-0" style={{ color: col }}>{label}</div><div className="flex-1 progress-bar h-2"><div className="progress-fill h-full" style={{ width: `${pct}%`, background: col }} /></div><div className="text-xs font-black w-10 text-right opacity-60">{val}</div></div>
          ); })}
        </div>
      </div>
      <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
        <h2 className="font-black text-sm mb-4 opacity-70">14-Day Review Forecast</h2>
        <div className="flex items-end gap-1 h-28">
          {forecast.map(({ d, count, label }) => (<div key={d} className="flex-1 flex flex-col items-center gap-1"><div className="text-xs font-black tabular-nums" style={{ color: 'var(--accent)', fontSize: 9, opacity: count ? 1 : .3 }}>{count || ''}</div><div className="w-full rounded-sm transition-all" style={{ height: `${Math.max(2, (count / maxForecast) * 80)}px`, background: d === 0 ? 'var(--accent)' : count > 10 ? 'var(--warning)' : 'rgba(var(--acc-rgb,99,102,241),.4)' }} /><div className="text-xs opacity-40" style={{ fontSize: 9 }}>{label}</div></div>))}
        </div>
      </div>
      {topSets.length > 0 && (<div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}><h2 className="font-black text-sm mb-4 opacity-70">Deck Mastery (Weakest First)</h2><div className="space-y-3">{topSets.slice(0, 8).map(set => (<div key={set.id} className="flex items-center gap-3"><div className="flex-1 min-w-0"><div className="text-xs font-black truncate">{set.title}</div><div className="flex-1 progress-bar mt-1 h-1.5"><div className="progress-fill" style={{ width: `${set.score}%`, background: set.score >= 80 ? 'var(--success)' : set.score >= 60 ? 'var(--warning)' : 'var(--danger)' }} /></div></div><div className="text-xs font-black shrink-0 w-10 text-right" style={{ color: set.score >= 80 ? 'var(--success)' : set.score >= 60 ? 'var(--warning)' : 'var(--danger)' }}>{set.score}%</div>{set.due > 0 && <span className="badge badge-warn shrink-0" style={{ fontSize: 10 }}>{set.due} due</span>}</div>))}</div></div>)}
      {allCards.length === 0 && (<div className="empty-state py-16"><div className="empty-icon"><BarChart2 size={40} /></div><p className="font-black text-lg mt-4">No analytics yet</p><p className="text-sm opacity-40 mt-1">Study flashcards to start tracking mastery</p></div>)}
    </div>
  );
}
