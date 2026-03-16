import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';

const ACHIEVEMENT_DEFS = [
  { id: 'first_upload', icon: '📄', label: 'First Upload', desc: 'Upload your first document', color: '#6366f1', check: (d) => d.length >= 1 },
  { id: 'first_card', icon: '🃏', label: 'Flashcard Pioneer', desc: 'Create your first flashcard deck', color: '#8b5cf6', check: (d, fc) => fc.filter(f => !f.isBuiltin).length >= 1 },
  { id: 'first_exam', icon: '📝', label: 'First Exam', desc: 'Complete your first exam', color: '#3b82f6', check: (d, fc, ex) => ex.some(e => e.lastScore !== undefined) },
  { id: '10_cards', icon: '🧠', label: '10 Cards Studied', desc: 'Study 10 flashcards', color: '#6366f1', check: (d, fc) => fc.reduce((s, f) => s + (f.cards?.filter(c => c.lastReview).length || 0), 0) >= 10 },
  { id: '50_cards', icon: '⚡', label: '50 Cards Mastered', desc: 'Study 50 flashcards', color: '#f59e0b', check: (d, fc) => fc.reduce((s, f) => s + (f.cards?.filter(c => c.lastReview).length || 0), 0) >= 50 },
  { id: '100_cards', icon: '🏆', label: '100 Cards Champion', desc: 'Study 100 flashcards', color: '#f97316', check: (d, fc) => fc.reduce((s, f) => s + (f.cards?.filter(c => c.lastReview).length || 0), 0) >= 100 },
  { id: 'perfect_exam', icon: '💯', label: 'Perfect Score', desc: 'Score 100% on any exam', color: '#10b981', check: (d, fc, ex) => ex.some(e => e.lastScore === 100) },
  { id: '5_docs', icon: '📚', label: 'Library Builder', desc: 'Upload 5 documents', color: '#06b6d4', check: (d) => d.length >= 5 },
  { id: 'early_adopter', icon: '👑', label: 'Early Adopter', desc: 'First time using MARIAM PRO', color: '#f43f5e', check: () => true },
];

export default function AchievementsView({ docs, flashcards, exams, cases, notes, chatSessions }) {
  const [showUnlock, setShowUnlock] = useState(null);
  const [prevUnlocked, setPrevUnlocked] = useState(() => new Set(JSON.parse(localStorage.getItem('mariam_achievements') || '[]')));
  const unlocked = useMemo(() => { const set = new Set(); ACHIEVEMENT_DEFS.forEach(a => { try { if (a.check(docs, flashcards, exams, cases, notes, chatSessions)) set.add(a.id); } catch {} }); return set; }, [docs, flashcards, exams, cases, notes, chatSessions]);

  useEffect(() => {
    const newly = [...unlocked].filter(id => !prevUnlocked.has(id));
    if (newly.length > 0) { const def = ACHIEVEMENT_DEFS.find(a => a.id === newly[0]); if (def) setShowUnlock(def); localStorage.setItem('mariam_achievements', JSON.stringify([...unlocked])); setPrevUnlocked(new Set(unlocked)); }
  }, [unlocked]);

  const pct = Math.round((unlocked.size / ACHIEVEMENT_DEFS.length) * 100);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar scroll-content p-4 space-y-4">
      {showUnlock && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }} onClick={() => setShowUnlock(null)}>
          <div className="glass rounded-3xl p-10 flex flex-col items-center gap-4 animate-scale-in max-w-sm mx-4" style={{ border: `2px solid ${showUnlock.color}40` }}>
            <div className="text-7xl">{showUnlock.icon}</div><div className="text-center"><div className="text-xs font-black uppercase tracking-widest opacity-40 mb-1">Achievement Unlocked!</div><h2 className="text-2xl font-black" style={{ color: showUnlock.color }}>{showUnlock.label}</h2><p className="text-sm opacity-60 mt-2">{showUnlock.desc}</p></div>
            <button onClick={() => setShowUnlock(null)} className="btn-accent px-8 py-3 rounded-2xl font-black">Awesome!</button>
          </div>
        </div>
      )}
      <div className="glass rounded-3xl p-6 relative overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="bg-mesh absolute inset-0 opacity-20" />
        <div className="relative z-10 flex items-center gap-6"><div className="text-5xl">🏆</div><div className="flex-1"><h2 className="text-2xl font-black">Achievements</h2><p className="text-sm opacity-50 mt-1">{unlocked.size} / {ACHIEVEMENT_DEFS.length} unlocked</p><div className="progress-bar mt-3 h-2"><div className="progress-fill" style={{ width: `${pct}%`, transition: 'width 1s ease' }} /></div></div><div className="text-3xl font-black" style={{ color: 'var(--accent)' }}>{pct}%</div></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {ACHIEVEMENT_DEFS.map(a => { const isU = unlocked.has(a.id); return (
          <div key={a.id} className="glass rounded-2xl p-4 flex flex-col items-center gap-2 text-center transition-all" style={{ border: `1px solid ${isU ? a.color + '40' : 'var(--border)'}`, background: isU ? a.color + '08' : 'transparent', opacity: isU ? 1 : 0.5 }}>
            <div className="text-3xl">{isU ? a.icon : '🔒'}</div><div className="text-xs font-black" style={{ color: isU ? a.color : 'var(--text3)' }}>{a.label}</div><div className="text-xs opacity-40 leading-tight">{a.desc}</div>{isU && <div className="text-xs font-black mt-1" style={{ color: a.color }}>✓ Unlocked</div>}
          </div>); })}
      </div>
    </div>
  );
}
