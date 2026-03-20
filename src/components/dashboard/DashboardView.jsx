/**
 * MARIAM PRO — DashboardView Component
 * Main dashboard with stats, recent docs, study progress, quick actions.
 */
import React from 'react';
import {
  FileText, Layers, CheckSquare, Activity, PenLine, Flame,
  History, ChevronRight, BarChart, TrendingUp, Zap, MessageSquare,
  Loader2, CheckCircle2, AlertCircle, X
} from 'lucide-react';
import { getTotalXP, getXPLevel, getLevelPct, getXPToNext } from '../../utils/xpSystem';

const MARIAM_IMG = 'https://raw.githubusercontent.com/Waeil55/DrMariam/main/M.jpeg';

export default function DashboardView({
  docs, flashcards, exams, cases, notes, chatSessions,
  setView, setActiveId, addToast, settings, analytics = {}
}) {
  const totalCards = flashcards.reduce((s, f) => s + (f.cards?.length || 0), 0);
  const totalQ = exams.reduce((s, e) => s + (e.questions?.length || 0), 0);
  const totalCases = cases.reduce((s, c) => s + (c.questions?.length || 0), 0);
  const dueCards = flashcards.reduce((s, f) => s + (f.cards?.filter(c => c.nextReview <= Date.now()).length || 0), 0);
  const recentScores = (analytics.scores || []).slice(-7);
  const avgScore = recentScores.length ? Math.round(recentScores.reduce((s, r) => s + r.pct, 0) / recentScores.length) : 0;
  const streak = analytics.streak || 0;

  const STAT_CARDS = [
    { label: 'Documents', value: docs.length, icon: FileText, color: '#6366f1', sub: 'uploaded' },
    { label: 'Flashcards', value: totalCards, icon: Layers, color: '#8b5cf6', sub: `${dueCards} due today`, urgent: dueCards > 0 },
    { label: 'Exam Qs', value: totalQ, icon: CheckSquare, color: '#3b82f6', sub: `${exams.length} exams` },
    { label: 'Cases', value: totalCases, icon: Activity, color: '#06b6d4', sub: `${cases.length} sets` },
    { label: 'Notes', value: notes.length, icon: PenLine, color: '#f59e0b', sub: 'saved' },
    { label: 'Study Streak', value: streak, icon: Flame, color: '#ef4444', sub: 'days 🔥', urgent: streak >= 3 },
  ];

  const recentDocs = docs.slice(-4).reverse();
  const bgTaskList = Object.values(window.__MARIAM_BG__?.tasks || {});
  const totalXP = getTotalXP();
  const curLevel = getXPLevel(totalXP);
  const levelPct = getLevelPct(totalXP);
  const xpToNext = getXPToNext(totalXP);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar scroll-content"
      style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}>
      <div className="w-full p-5 lg:p-10 space-y-6">
        {/* HERO */}
        <div className="flex items-start justify-between gap-4 animate-slide-in">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="badge text-xs">
                {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
              </span>
              {streak >= 3 && <span className="badge" style={{ color: '#f59e0b', borderColor: 'rgba(245,158,11,.3)', background: 'rgba(245,158,11,.1)' }}>🔥 {streak} day streak</span>}
              <span className="badge" style={{ color: 'var(--accent)', borderColor: 'rgba(99,102,241,.3)', background: 'rgba(99,102,241,.1)' }}>🏆 Lv.{curLevel.n} {curLevel.title}</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-black leading-tight"
              style={{ fontFamily: 'Plus Jakarta Sans,system-ui', color: 'var(--text)' }}>
              {new Date().getHours() < 12 ? 'Good morning ☀️' : new Date().getHours() < 17 ? 'Good afternoon 🌤' : 'Good evening 🌙'} 👋
            </h1>
            <p className="text-base mt-1 font-medium" style={{ color: 'var(--text2)' }}>
              {docs.length === 0 ? 'Upload a document to get started' : 'Your AI-powered study command center'}
            </p>
            {/* XP mini progress bar */}
            <div className="mt-3 flex items-center gap-2 max-w-xs">
              <div className="flex-1 h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div className="h-full rounded-full" style={{ width: `${levelPct}%`, background: 'var(--accent)', transition: 'width 1s ease' }} />
              </div>
              <span className="text-xs font-bold" style={{ color: 'var(--text3)', whiteSpace: 'nowrap' }}>
                {totalXP.toLocaleString()} XP{xpToNext > 0 ? ` · ${xpToNext.toLocaleString()} to next` : ''}
              </span>
            </div>
          </div>
          <div className="relative shrink-0 hidden sm:block">
            <img src={MARIAM_IMG} alt="" className="w-16 h-16 rounded-2xl object-cover"
              style={{ boxShadow: '0 0 0 3px rgba(var(--acc-rgb,99,102,241),.25),0 8px 24px rgba(0,0,0,.3)' }} />
          </div>
        </div>

        {/* STAT CARDS */}
        <div className="grid grid-cols-3 lg:grid-cols-6 gap-3">
          {STAT_CARDS.map(({ label, value, icon: Icon, color, sub, urgent }, i) => (
            <div key={label}
              className={`card-lined rounded-2xl p-4 cursor-default animate-slide-up stagger-${Math.min(i + 1, 6)}`}
              style={urgent ? { borderTopColor: color + '99' } : {}}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + '18' }}>
                  <Icon size={17} style={{ color }} />
                </div>
                {urgent && <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />}
              </div>
              <p className="text-3xl lg:text-4xl font-black leading-none" style={{ color, fontFamily: 'Plus Jakarta Sans,system-ui' }}>{value}</p>
              <p className="text-xs font-black uppercase tracking-widest mt-1.5" style={{ color: 'var(--text3)', fontSize: 10 }}>{label}</p>
              <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--text3)' }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* BG TASKS */}
        {bgTaskList.filter(t => t.status === 'running' || t.status === 'done').length > 0 && (
          <div className="card-lined rounded-2xl p-5 animate-fade-in" style={{ borderTopColor: 'rgba(var(--acc-rgb,99,102,241),.4)' }}>
            <h2 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: 'var(--text3)' }}>
              <Zap size={13} style={{ color: 'var(--accent)' }} /> Active Generation
            </h2>
            <div className="space-y-2.5">
              {bgTaskList.map((t, i) => (
                <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl border transition-all"
                  style={t.status === 'done'
                    ? { borderColor: 'rgba(16,185,129,.3)', background: 'rgba(16,185,129,.05)' }
                    : { borderColor: 'var(--border2,var(--border))', background: 'var(--surface2,var(--card))' }}>
                  {t.status === 'running' ? <Loader2 size={14} className="animate-spin shrink-0" style={{ color: 'var(--accent)' }} /> : <CheckCircle2 size={14} className="shrink-0" style={{ color: '#10b981' }} />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate capitalize">{t.type} · {t.docName?.slice(0, 28)}</p>
                    {t.status === 'running' && t.total > 1 && (
                      <div className="mt-1.5 h-1 rounded-full overflow-hidden" style={{ background: 'var(--border2,var(--border))' }}>
                        <div className="h-full rounded-full transition-all duration-500"
                          style={{ width: `${((t.done || 0) / t.total) * 100}%`, background: 'linear-gradient(90deg,var(--accent),var(--accent2,var(--accent)))' }} />
                      </div>
                    )}
                    {t.status === 'done' && <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{t.result?.count} items ready</p>}
                  </div>
                  <span className="text-xs font-black px-2.5 py-1 rounded-lg"
                    style={t.status === 'done' ? { background: 'rgba(16,185,129,.15)', color: '#10b981' } : { background: 'rgba(var(--acc-rgb,99,102,241),.12)', color: 'var(--accent)' }}>
                    {t.status === 'done' ? 'Done' : 'Running'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
          {/* Recent Docs */}
          <div className="card-lined rounded-2xl p-5 lg:col-span-3 animate-slide-up stagger-2">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-black uppercase tracking-widest flex items-center gap-2" style={{ color: 'var(--text3)' }}>
                <History size={13} style={{ color: 'var(--accent)' }} /> Recent Documents
              </h2>
              <button onClick={() => setView('library')} className="text-xs font-bold transition-all" style={{ color: 'var(--accent)', opacity: .7 }}>View all →</button>
            </div>
            {recentDocs.length === 0 ? (
              <div className="empty-state">
                <div className="empty-icon"><FileText size={24} style={{ color: 'var(--accent)', opacity: .6 }} /></div>
                <p className="text-sm font-bold" style={{ color: 'var(--text3)' }}>No documents yet</p>
                <p className="text-xs" style={{ color: 'var(--text3)', opacity: .7 }}>Upload a PDF, Word doc, or image to get started</p>
                <button onClick={() => setView('library')} className="btn-accent px-5 py-2.5 rounded-xl text-sm font-black mt-1">Upload Document</button>
              </div>
            ) : recentDocs.map(doc => (
              <button key={doc.id} onClick={() => { setActiveId(doc.id); setView('reader'); }}
                className="w-full flex items-center gap-3.5 p-3 rounded-xl transition-all group card-interactive mb-1"
                style={{ border: '1px solid transparent' }}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-white text-sm font-black"
                  style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent2,var(--accent)))', boxShadow: '0 4px 12px rgba(var(--acc-rgb,99,102,241),.25)' }}>
                  {doc.name.slice(0, 2).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1 text-left">
                  <p className="text-sm font-semibold truncate" style={{ color: 'var(--text)' }}>{doc.name}</p>
                  <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{doc.totalPages} pages · {new Date(doc.addedAt || 0).toLocaleDateString()}</p>
                </div>
                <ChevronRight size={14} className="shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--accent)' }} />
              </button>
            ))}
          </div>

          {/* Right col */}
          <div className="flex flex-col gap-4 lg:col-span-2">
            {/* Study Stats */}
            <div className="card-lined rounded-2xl p-5 animate-slide-up stagger-3">
              <h2 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: 'var(--text3)' }}>
                <BarChart size={13} style={{ color: 'var(--accent)' }} /> Study Progress
              </h2>
              {[
                { label: 'Avg Score', val: `${avgScore}%`, pct: avgScore, color: '#818cf8' },
                { label: 'Cards Studied', val: analytics.totalCards || 0, pct: Math.min(100, Math.round(((analytics.totalCards || 0) / Math.max(1, totalCards)) * 100)), color: '#a78bfa' },
                { label: 'Due Cards', val: dueCards, pct: Math.min(100, Math.round((dueCards / Math.max(1, totalCards)) * 100)), color: dueCards > 0 ? '#f43f5e' : '#10b981' },
              ].map(({ label, val, pct, color }) => (
                <div key={label} className="mb-3">
                  <div className="flex justify-between mb-1">
                    <span className="text-xs font-medium" style={{ color: 'var(--text2)' }}>{label}</span>
                    <span className="text-xs font-black" style={{ color }}>{val}</span>
                  </div>
                  <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'var(--border2,var(--border))' }}>
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${pct}%`, background: color }} />
                  </div>
                </div>
              ))}
            </div>

            {/* Quick Actions */}
            <div className="card-lined rounded-2xl p-5 animate-slide-up stagger-4">
              <h2 className="text-xs font-black uppercase tracking-widest mb-3 flex items-center gap-2" style={{ color: 'var(--text3)' }}>
                <Zap size={13} style={{ color: 'var(--accent)' }} /> Quick Actions
              </h2>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { lbl: 'Study Cards', Icon: Layers, v: 'flashcards', col: '#a78bfa' },
                  { lbl: 'Take Exam', Icon: CheckSquare, v: 'exams', col: '#818cf8' },
                  { lbl: 'Cases', Icon: Activity, v: 'cases', col: '#22d3ee' },
                  { lbl: 'AI Chat', Icon: MessageSquare, v: 'chat', col: '#34d399' },
                ].map(({ lbl, Icon, v, col }) => (
                  <button key={v} onClick={() => setView(v)}
                    className="flex flex-col items-start gap-2 p-3.5 rounded-xl card-hover transition-all"
                    style={{ background: 'var(--surface2,var(--card))', border: '1px solid var(--border2,var(--border))' }}>
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: col + '18' }}>
                      <Icon size={16} style={{ color: col }} />
                    </div>
                    <span className="text-xs font-black" style={{ color: 'var(--text)' }}>{lbl}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Recent Scores Chart */}
        {recentScores.length > 0 && (
          <div className="card-lined rounded-2xl p-5 animate-slide-up stagger-5">
            <h2 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2" style={{ color: 'var(--text3)' }}>
              <TrendingUp size={13} style={{ color: 'var(--accent)' }} /> Exam Score History
            </h2>
            <div className="flex items-end gap-2" style={{ height: 80 }}>
              {recentScores.map((s, i) => {
                const col = s.pct >= 80 ? '#10b981' : s.pct >= 60 ? '#f59e0b' : '#f43f5e';
                return (
                  <div key={i} className="flex-1 flex flex-col items-center gap-1">
                    <span className="text-xs font-black" style={{ color: col, fontSize: 10 }}>{s.pct}%</span>
                    <div className="w-full rounded-t-lg relative overflow-hidden"
                      style={{ height: `${Math.max(4, s.pct * .7)}px`, background: `${col}22`, border: `1px solid ${col}44` }}>
                      <div className="absolute inset-x-0 bottom-0" style={{ height: '60%', background: `${col}88` }} />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
