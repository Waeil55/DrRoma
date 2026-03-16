/**
 * MARIAM PRO — GlobalSearch overlay
 * Full-text search across docs, flashcards, exams, cases, notes.
 */
import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  Search, X, FileText, Layers, CheckSquare, Activity, PenLine
} from 'lucide-react';

export default function GlobalSearch({ docs, flashcards, exams, cases, notes, onNavigate, onClose }) {
  const [q, setQ] = useState('');
  const inputRef = useRef(null);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const results = useMemo(() => {
    if (!q.trim() || q.length < 2) return [];
    const lq = q.toLowerCase();
    const out = [];
    docs.forEach(d => {
      if (d.name.toLowerCase().includes(lq))
        out.push({ type: 'doc', icon: FileText, label: d.name, sub: `${d.totalPages} pages`, color: '#6366f1', action: () => onNavigate('reader', d.id) });
    });
    flashcards.forEach(set => set.cards?.forEach(c => {
      if ((c.q + c.a).toLowerCase().includes(lq))
        out.push({ type: 'card', icon: Layers, label: c.q.slice(0, 60), sub: set.title, color: '#8b5cf6', action: () => onNavigate('flashcards') });
    }));
    exams.forEach(ex => ex.questions?.forEach(q2 => {
      if ((q2.q || '').toLowerCase().includes(lq))
        out.push({ type: 'exam', icon: CheckSquare, label: (q2.q || '').slice(0, 60), sub: ex.title, color: '#3b82f6', action: () => onNavigate('exams') });
    }));
    cases.forEach(set => set.questions?.forEach(c => {
      if ((c.vignette || '').toLowerCase().includes(lq))
        out.push({ type: 'case', icon: Activity, label: (c.title || c.vignette || '').slice(0, 60), sub: set.title, color: '#06b6d4', action: () => onNavigate('cases') });
    }));
    notes.forEach(n => {
      if ((n.title + n.content).toLowerCase().includes(lq))
        out.push({ type: 'note', icon: PenLine, label: n.title, sub: n.content?.slice(0, 50), color: '#f59e0b', action: () => onNavigate('library') });
    });
    return out.slice(0, 12);
  }, [q, docs, flashcards, exams, cases, notes, onNavigate]);

  return (
    <div className="fixed inset-0 z-[9999] flex items-start justify-center pt-16 px-4"
      style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}>
      <div className="w-full max-w-2xl glass rounded-3xl shadow-2xl overflow-hidden animate-slide-up border border-[var(--accent)]/30"
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[color:var(--border2,var(--border))]">
          <Search size={20} className="text-[var(--accent)] shrink-0" />
          <input ref={inputRef} value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search everything — documents, cards, questions, cases, notes…"
            className="flex-1 bg-transparent text-sm outline-none font-medium placeholder:opacity-40 text-[var(--text)]" />
          <kbd className="text-xs font-black opacity-30 px-2 py-1 glass rounded-lg">ESC</kbd>
          <button onClick={onClose} className="opacity-40 hover:opacity-80"><X size={18} /></button>
        </div>
        {q.length >= 2 && (
          <div className="max-h-96 overflow-y-auto custom-scrollbar">
            {results.length === 0 ? (
              <div className="py-12 text-center opacity-40">
                <Search size={32} className="mx-auto mb-3" />
                <p className="text-sm font-bold">No results for "{q}"</p>
              </div>
            ) : results.map((r, i) => (
              <button key={i} onClick={() => { r.action(); onClose(); }}
                className="w-full flex items-center gap-4 px-5 py-3.5 hover:bg-[var(--accent)]/5 transition-colors text-left border-b border-[color:var(--border2,var(--border))]/50 last:border-0">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0" style={{ background: r.color + '20' }}>
                  <r.icon size={16} style={{ color: r.color }} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-bold truncate">{r.label}</p>
                  <p className="text-xs opacity-50 truncate">{r.sub}</p>
                </div>
                <span className="text-xs font-black uppercase tracking-widest opacity-30 px-2 py-1 glass rounded-lg shrink-0">{r.type}</span>
              </button>
            ))}
          </div>
        )}
        {!q && (
          <div className="p-5 grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[['Documents', 'doc', FileText, '#6366f1'], ['Flashcards', 'flashcards', Layers, '#8b5cf6'], ['Exams', 'exams', CheckSquare, '#3b82f6'], ['Cases', 'cases', Activity, '#06b6d4']].map(([lbl, v, Icon, col]) => (
              <button key={v} onClick={() => { onNavigate(v); onClose(); }}
                className="glass rounded-2xl p-3 flex flex-col items-center gap-2 hover:border-[var(--accent)]/30 transition-all">
                <Icon size={20} style={{ color: col }} />
                <span className="text-xs font-black">{lbl}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
