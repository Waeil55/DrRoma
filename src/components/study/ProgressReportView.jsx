import React, { useState } from 'react';
import { Layers, CheckSquare, TrendingUp, Award, Loader2, Sparkles } from 'lucide-react';
import callAIStreaming from '../../services/ai/callAIStreaming';

const PERIODS = [{ id: 'week', label: 'This Week' }, { id: 'month', label: 'This Month' }, { id: 'all', label: 'All Time' }];

export default function ProgressReportView({ flashcards, exams, docs, settings, addToast }) {
  const [period, setPeriod] = useState('week'); // week | month | all
  const [generating, setGenerating] = useState(false);
  const [aiReport, setAiReport] = useState('');
  const [showAiReport, setShowAiReport] = useState(false);

  const now = Date.now();
  const periodMs = period === 'week' ? 7 * 86400000 : period === 'month' ? 30 * 86400000 : Infinity;
  const since = now - periodMs;

  const cardsStudied = flashcards.reduce((s, f) =>
    s + (f.cards?.filter(c => c.lastReview && c.lastReview >= since).length || 0), 0);
  const examsAttempted = exams.filter(e => (e.lastAttempt || 0) >= since).length;
  const avgScore = (() => {
    const recent = exams.filter(e => (e.lastAttempt || 0) >= since && e.lastScore !== undefined);
    return recent.length ? Math.round(recent.reduce((s, e) => s + e.lastScore, 0) / recent.length) : null;
  })();
  const docsAdded = docs.filter(d => (d.addedAt || d.uploadedAt || 0) >= since).length;
  const totalCards = flashcards.reduce((s, f) => s + (f.cards?.length || 0), 0);
  const masteredCards = flashcards.reduce((s, f) => s + (f.cards?.filter(c => (c.stability || 0) >= 7).length || 0), 0);

  // Daily breakdown for bar chart
  const dailyData = [...Array(period === 'week' ? 7 : 30)].map((_, i) => {
    const d = new Date(); d.setDate(d.getDate() - (period === 'week' ? 6 - i : 29 - i));
    const k = d.toISOString().slice(0, 10);
    const stored = JSON.parse(localStorage.getItem(`mariam_daily_${k}`) || '{"cards":0,"exams":0}');
    return { label: d.toLocaleDateString('en', { weekday: 'short' }), cards: stored.cards || 0, exams: stored.exams || 0 };
  });
  const maxCards = Math.max(1, ...dailyData.map(d => d.cards));

  // Subject breakdown
  const subjectBreakdown = flashcards.filter(f => !f.isBuiltin).map(f => {
    const studied = f.cards?.filter(c => c.lastReview && c.lastReview >= since).length || 0;
    const mastered = f.cards?.filter(c => (c.stability || 0) >= 7).length || 0;
    const total = f.cards?.length || 0;
    return { name: f.title, studied, mastered, total, pct: total > 0 ? Math.round((mastered / total) * 100) : 0 };
  }).sort((a, b) => b.studied - a.studied);

  const generateAiReport = async () => {
    if (!settings.apiKey) { addToast('Set an API key in Settings', 'warn'); return; }
    setGenerating(true); setShowAiReport(true);
    try {
      let out = '';
      await callAIStreaming(
        `Generate a concise, encouraging weekly progress report for a medical student. 3 paragraphs: performance summary, strengths, areas to improve.

Stats:
- Cards studied: ${cardsStudied} in past ${period}
- Exams attempted: ${examsAttempted}
- Average exam score: ${avgScore ?? 'N/A'}%
- Total mastered cards: ${masteredCards}/${totalCards}
- Docs uploaded: ${docsAdded}
- Top subjects: ${subjectBreakdown.slice(0,3).map(s => `${s.name} (${s.pct}% mastery)`).join(', ')}

Be specific, motivating, and educational. Max 200 words.`,
        chunk => { out += chunk; setAiReport(p => p + chunk); },
        settings, 400
      );
    } catch (e) { addToast('Report generation failed', 'error'); }
    setGenerating(false);
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar scroll-content p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-black flex items-center gap-2">📊 Progress Report</h2>
        <div className="flex gap-1.5">
          {PERIODS.map(p => (
            <button key={p.id} onClick={() => { setPeriod(p.id); setAiReport(''); setShowAiReport(false); }}
              className="px-3 py-1.5 rounded-xl text-xs font-black transition-all"
              style={p.id === period ? { background: 'var(--accent)', color: '#fff' } : { opacity: .5 }}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* KPI grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Cards Studied', value: cardsStudied, icon: Layers, color: '#8b5cf6' },
          { label: 'Exams Done', value: examsAttempted, icon: CheckSquare, color: '#3b82f6' },
          { label: 'Avg Score', value: avgScore !== null ? `${avgScore}%` : '—', icon: TrendingUp, color: avgScore >= 80 ? '#10b981' : avgScore >= 60 ? '#f59e0b' : '#ef4444' },
          { label: 'Mastered Cards', value: masteredCards, icon: Award, color: '#f59e0b' },
        ].map(({ label, value, icon: Icon, color }) => (
          <div key={label} className="glass rounded-2xl p-4 text-center" style={{ border: '1px solid var(--border)' }}>
            <Icon size={18} className="mx-auto mb-2" style={{ color }} />
            <div className="text-2xl font-black" style={{ color }}>{value}</div>
            <div className="text-xs opacity-40 mt-1">{label}</div>
          </div>
        ))}
      </div>

      {/* Daily activity chart */}
      {period !== 'all' && (
        <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
          <h3 className="font-black text-sm opacity-70 mb-4">Daily Card Activity</h3>
          <div className="flex items-end gap-1.5" style={{ height: 80 }}>
            {dailyData.map((d, i) => (
              <div key={i} className="flex-1 flex flex-col items-center gap-1">
                <div className="w-full rounded-t-lg transition-all relative group"
                  style={{ height: `${Math.max(4, (d.cards / maxCards) * 72)}px`, background: d.cards > 0 ? 'var(--accent)' : 'var(--border)', cursor: 'default' }}>
                  {d.cards > 0 && <div className="absolute -top-7 left-1/2 -translate-x-1/2 text-xs font-black opacity-0 group-hover:opacity-100 whitespace-nowrap" style={{ color: 'var(--accent)' }}>{d.cards}</div>}
                </div>
                <span className="text-xs opacity-30">{d.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Subject mastery */}
      {subjectBreakdown.length > 0 && (
        <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
          <h3 className="font-black text-sm opacity-70 mb-4">Subject Mastery</h3>
          <div className="space-y-3">
            {subjectBreakdown.slice(0, 8).map(s => (
              <div key={s.name}>
                <div className="flex justify-between text-sm mb-1">
                  <span className="font-bold truncate max-w-[60%]">{s.name}</span>
                  <span className="font-black text-xs opacity-60">{s.mastered}/{s.total} mastered</span>
                </div>
                <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full transition-all"
                    style={{ width: `${s.pct}%`, background: s.pct >= 80 ? '#10b981' : s.pct >= 50 ? '#f59e0b' : 'var(--accent)' }} />
                </div>
                <div className="flex justify-between text-xs opacity-30 mt-0.5">
                  <span>{s.studied} studied {period !== 'all' ? `this ${period}` : ''}</span>
                  <span>{s.pct}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Exam performance */}
      {exams.filter(e => e.lastScore !== undefined).length > 0 && (
        <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
          <h3 className="font-black text-sm opacity-70 mb-4">Exam Performance</h3>
          <div className="space-y-2">
            {exams.filter(e => e.lastScore !== undefined && (e.lastAttempt || 0) >= since).slice(0, 8).map(e => (
              <div key={e.id} className="flex items-center gap-3">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{e.title}</p>
                  <p className="text-xs opacity-40">{e.questions?.length || 0} questions</p>
                </div>
                <div className="w-16 text-right">
                  <div className="text-sm font-black" style={{ color: e.lastScore >= 80 ? '#10b981' : e.lastScore >= 60 ? '#f59e0b' : '#ef4444' }}>{e.lastScore}%</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AI Report */}
      <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="font-black text-sm">AI Report Summary</h3>
          <button onClick={() => { setAiReport(''); generateAiReport(); }} disabled={generating}
            className="glass px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5"
            style={{ color: 'var(--accent)', border: '1px solid var(--accent)/30' }}>
            {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            {generating ? 'Writing…' : showAiReport ? '↺ Refresh' : '✨ Generate'}
          </button>
        </div>
        {showAiReport && (
          <p className="text-sm opacity-70 leading-relaxed whitespace-pre-wrap">{aiReport || (generating ? 'Writing your report…' : '')}</p>
        )}
        {!showAiReport && <p className="text-xs opacity-30">Click Generate to get an AI-written analysis of your study performance.</p>}
      </div>
    </div>
  );
}
