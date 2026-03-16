/**
 * MARIAM PRO — LibraryMergedView
 * Main home/library page — hero, stats, BG tasks, documents grid/list, drag-drop, quick actions.
 */
import React, { useState, useMemo, useCallback, useRef } from 'react';
import {
  FileText, Layers, CheckSquare, Activity, MessageSquare, FileUp, Loader2,
  Search, Grid, List, ChevronRight, Trash2, Zap, CheckCircle2
} from 'lucide-react';

const MARIAM_IMG = 'https://raw.githubusercontent.com/Waeil55/DrMariam/main/M.jpeg';

export default function LibraryMergedView({ docs, uploading, onUpload, onOpen, onDelete, flashcards, exams, cases, notes, setView, setActiveId, addToast, settings }) {
  const [search, setSearch] = useState('');
  const [sortBy, setSortBy] = useState('date');
  const [viewMode, setViewMode] = useState('grid');
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);

  const totalCards = flashcards.reduce((s, f) => s + (f.cards?.length || 0), 0);
  const totalQ = exams.reduce((s, e) => s + (e.questions?.length || 0), 0);
  const totalCases = cases.reduce((s, c) => s + (c.questions?.length || 0), 0);
  const dueCards = flashcards.reduce((s, f) => s + (f.cards?.filter(c => c.nextReview <= Date.now()).length || 0), 0);
  const streak = (typeof window !== 'undefined' && window.__MARIAM_ANALYTICS__?.streak) || 0;
  const bgTaskList = Object.values((typeof window !== 'undefined' && window.__MARIAM_BG__?.tasks) || {});

  const allStats = useMemo(() => ({
    docs: docs.length, cards: totalCards, exams: totalQ, cases: totalCases,
  }), [docs.length, totalCards, totalQ, totalCases]);

  const filtered = useMemo(() => {
    let d = docs.filter(doc => doc.name.toLowerCase().includes(search.toLowerCase()));
    if (sortBy === 'date') d = [...d].sort((a, b) => new Date(b.addedAt) - new Date(a.addedAt));
    else if (sortBy === 'name') d = [...d].sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'type') d = [...d].sort((a, b) => (a.fileCategory || 'pdf').localeCompare(b.fileCategory || 'pdf'));
    return d;
  }, [docs, search, sortBy]);

  const handleDrop = useCallback(e => {
    e.preventDefault(); setDragging(false);
    const files = Array.from(e.dataTransfer.files);
    if (files.length) onUpload({ target: { files } });
  }, [onUpload]);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar scroll-content bg-mesh" style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}
      onDragOver={e => { e.preventDefault(); setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}>

      {dragging && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center pointer-events-none"
          style={{ background: 'rgba(var(--acc-rgb,99,102,241),.15)', backdropFilter: 'blur(4px)' }}>
          <div className="glass rounded-3xl px-10 py-8 text-center shadow-2xl border-2 border-dashed border-[var(--accent)] animate-scale-in">
            <FileUp size={48} className="mx-auto mb-3 animate-bounce" style={{ color: 'var(--accent)' }} />
            <p className="text-xl font-black">Drop files here!</p>
            <p className="text-sm mt-1" style={{ color: 'var(--text3)' }}>PDF, Word, Excel, Images</p>
          </div>
        </div>
      )}

      <div className="w-full p-5 lg:p-10 space-y-6">
        {/* HERO */}
        <div className="relative overflow-hidden rounded-3xl animate-slide-in"
          style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent2,var(--accent)))', boxShadow: '0 16px 56px rgba(var(--acc-rgb,99,102,241),.4)' }}>
          <div className="absolute inset-0 opacity-10" style={{ backgroundImage: 'radial-gradient(circle at 80% 20%, white 0%, transparent 60%)' }} />
          <div className="relative p-6 lg:p-8 flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-[10px] font-black uppercase tracking-[.15em] px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,.2)', color: 'rgba(255,255,255,.9)' }}>
                  {new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })}
                </span>
                {streak >= 3 && <span className="text-[10px] font-black uppercase tracking-wider px-3 py-1 rounded-full" style={{ background: 'rgba(255,255,255,.2)', color: 'white' }}>🔥 {streak} day streak</span>}
              </div>
              <h1 className="text-2xl lg:text-3xl font-black text-white leading-tight" style={{ fontFamily: 'Plus Jakarta Sans,system-ui' }}>
                {new Date().getHours() < 12 ? 'Good morning ☀️' : new Date().getHours() < 17 ? 'Good afternoon 🌤' : 'Good evening 🌙'}
              </h1>
              <p className="text-sm mt-1 text-white/70 font-medium">
                {dueCards > 0 ? `${dueCards} flashcards due · ${docs.length} documents` : docs.length === 0 ? 'Upload your first document to get started' : `${totalCards} cards · ${totalQ} exam questions · ${totalCases} cases`}
              </p>
              <div className="flex gap-2 mt-4 flex-wrap">
                <button onClick={() => setView('flashcards')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:scale-105 active:scale-95" style={{ background: 'rgba(255,255,255,.2)', border: '1px solid rgba(255,255,255,.3)' }}>
                  <Layers size={15} /> Study Cards {dueCards > 0 && <span className="ml-1 px-1.5 py-0.5 rounded-full text-xs" style={{ background: 'rgba(255,255,255,.3)' }}>{dueCards}</span>}
                </button>
                <button onClick={() => setView('exams')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:scale-105 active:scale-95" style={{ background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.2)' }}>
                  <CheckSquare size={15} /> Take Exam
                </button>
                <button onClick={() => setView('cases')} className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-black text-white transition-all hover:scale-105 active:scale-95" style={{ background: 'rgba(255,255,255,.15)', border: '1px solid rgba(255,255,255,.2)' }}>
                  <Activity size={15} /> Cases
                </button>
              </div>
            </div>
            <div className="shrink-0 hidden sm:block">
              <img src={MARIAM_IMG} alt="MARIAM" className="w-20 h-20 rounded-2xl object-cover" style={{ boxShadow: '0 0 0 3px rgba(255,255,255,.3),0 8px 24px rgba(0,0,0,.2)' }} />
            </div>
          </div>
        </div>

        {/* STATS ROW */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Documents', value: allStats.docs, icon: FileText, color: '#6366f1', sub: 'uploaded' },
            { label: 'Flashcards', value: allStats.cards, icon: Layers, color: '#8b5cf6', sub: dueCards > 0 ? `${dueCards} due` : 'total', urgent: dueCards > 0 },
            { label: 'Exam Qs', value: allStats.exams, icon: CheckSquare, color: '#3b82f6', sub: `${exams.length} sets` },
            { label: 'Cases', value: allStats.cases, icon: Activity, color: '#06b6d4', sub: `${cases.length} sets` },
          ].map(({ label, value, icon: Icon, color, sub, urgent }, i) => (
            <div key={label} className={`card-lined rounded-2xl p-4 animate-slide-up stagger-${i + 1}`} style={urgent ? { borderTopColor: color + 'cc' } : {}}>
              <div className="flex items-center justify-between mb-3">
                <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: color + '18' }}><Icon size={17} style={{ color }} /></div>
                {urgent && <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: color }} />}
              </div>
              <p className="text-3xl font-black leading-none" style={{ color, fontFamily: 'Plus Jakarta Sans,system-ui' }}>{value}</p>
              <p className="text-[10px] font-black uppercase tracking-widest mt-1.5" style={{ color: 'var(--text3)' }}>{label}</p>
              <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--text3)' }}>{sub}</p>
            </div>
          ))}
        </div>

        {/* BG TASKS */}
        {bgTaskList.filter(t => t.status === 'running' || t.status === 'done').length > 0 && (
          <div className="card-lined rounded-2xl p-5 animate-fade-in">
            <h2 className="section-label mb-3 flex items-center gap-2"><Zap size={12} style={{ color: 'var(--accent)' }} />Active Generation</h2>
            <div className="space-y-2">
              {bgTaskList.map((t, i) => (
                <div key={i} className="flex items-center gap-3 p-3.5 rounded-xl border transition-all"
                  style={t.status === 'done' ? { borderColor: 'var(--success-border)', background: 'var(--success-bg)' } : { borderColor: 'var(--border2,var(--border))', background: 'var(--surface2,var(--card))' }}>
                  {t.status === 'running' ? <Loader2 size={14} className="animate-spin shrink-0" style={{ color: 'var(--accent)' }} /> : <CheckCircle2 size={14} className="shrink-0" style={{ color: 'var(--success)' }} />}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate capitalize">{t.type} · {t.docName?.slice(0, 28)}</p>
                    {t.status === 'running' && t.total > 1 && (
                      <div className="progress-bar mt-1.5"><div className="progress-fill" style={{ width: `${((t.done || 0) / t.total) * 100}%` }} /></div>
                    )}
                    {t.status === 'done' && <p className="text-xs mt-0.5" style={{ color: 'var(--text3)' }}>{t.result?.count} items ready</p>}
                  </div>
                  <span className={`text-xs font-black px-2.5 py-1 rounded-lg ${t.status === 'done' ? 'badge-success' : ''} badge`}>{t.status === 'done' ? 'Done' : 'Running'}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* DOCUMENTS */}
        <div className="card-lined rounded-2xl p-5 animate-slide-up stagger-3">
          <div className="flex items-center justify-between gap-3 mb-4 flex-wrap">
            <h2 className="section-label flex items-center gap-2"><FileText size={12} />My Documents</h2>
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 opacity-30" size={13} />
                <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search docs…" className="glass-input rounded-xl pl-9 pr-3 py-2 text-sm w-44 focus:w-56 transition-all" />
              </div>
              <select value={sortBy} onChange={e => setSortBy(e.target.value)} className="glass-input rounded-xl px-3 py-2 text-sm font-semibold cursor-pointer">
                <option value="date">Newest</option><option value="name">Name A–Z</option><option value="type">Type</option>
              </select>
              <div className="flex rounded-xl overflow-hidden border" style={{ borderColor: 'var(--border2,var(--border))' }}>
                <button onClick={() => setViewMode('grid')} className="p-2 transition-colors" style={viewMode === 'grid' ? { background: 'var(--accent)', color: '#fff' } : { opacity: .5 }}><Grid size={16} /></button>
                <button onClick={() => setViewMode('list')} className="p-2 transition-colors" style={viewMode === 'list' ? { background: 'var(--accent)', color: '#fff' } : { opacity: .5 }}><List size={16} /></button>
              </div>
              <label className={`btn-accent flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-black cursor-pointer ${uploading ? 'opacity-60' : ''}`}>
                {uploading ? <Loader2 size={15} className="animate-spin" /> : <FileUp size={15} />}
                {uploading ? 'Uploading…' : 'Import'}
                <input ref={inputRef} type="file" multiple className="hidden" onChange={onUpload} disabled={uploading}
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,.txt,.md,.js,.ts,.jsx,.tsx,.py,.png,.jpg,.jpeg,.gif,.webp" />
              </label>
            </div>
          </div>

          {filtered.length === 0 ? (
            <div className="empty-state cursor-pointer" onClick={() => inputRef.current?.click()}>
              <div className="empty-icon"><FileUp size={26} style={{ color: 'var(--accent)', opacity: .7 }} /></div>
              <p className="font-black text-base">{search ? 'No documents found' : 'No documents yet'}</p>
              <p className="text-sm" style={{ color: 'var(--text3)' }}>{search ? 'Try a different search' : 'Drop files here or click Import above'}</p>
              {!search && <button className="btn-accent px-5 py-2.5 rounded-xl text-sm font-black mt-2">Browse Files</button>}
            </div>
          ) : viewMode === 'grid' ? (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
              {filtered.map((doc, i) => (
                <div key={doc.id} onClick={() => onOpen(doc.id)}
                  className={`glass rounded-2xl p-4 cursor-pointer card-hover group animate-scale-in stagger-${Math.min(i + 1, 6)}`}>
                  <div className="w-11 h-11 rounded-xl flex items-center justify-center text-white text-sm font-black mb-3"
                    style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent2,var(--accent)))', boxShadow: '0 4px 14px rgba(var(--acc-rgb,99,102,241),.3)' }}>
                    {doc.name.slice(0, 2).toUpperCase()}
                  </div>
                  <p className="font-bold text-sm truncate leading-tight">{doc.name}</p>
                  <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--text3)' }}>{doc.totalPages} pages</p>
                  <button onClick={e => { e.stopPropagation(); onDelete(doc.id, e); }}
                    className="mt-3 w-full py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)' }}>Remove</button>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-2">
              {filtered.map((doc, i) => (
                <div key={doc.id} onClick={() => onOpen(doc.id)}
                  className={`flex items-center gap-3 p-3 rounded-xl card-hover cursor-pointer group animate-slide-in stagger-${Math.min(i + 1, 6)}`}
                  style={{ border: '1px solid var(--border2,var(--border))', background: 'var(--surface,var(--card))' }}>
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center text-white text-sm font-black shrink-0"
                    style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent2,var(--accent)))' }}>{doc.name.slice(0, 2).toUpperCase()}</div>
                  <div className="flex-1 min-w-0">
                    <p className="font-bold truncate">{doc.name}</p>
                    <p className="text-xs" style={{ color: 'var(--text3)' }}>{doc.totalPages} pages · {new Date(doc.addedAt || 0).toLocaleDateString()}</p>
                  </div>
                  <button onClick={e => { e.stopPropagation(); onDelete(doc.id, e); }}
                    className="shrink-0 px-3 py-1.5 rounded-lg text-xs font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                    style={{ background: 'var(--danger-bg)', color: 'var(--danger)', border: '1px solid var(--danger-border)' }}>Remove</button>
                  <ChevronRight size={14} className="shrink-0 opacity-0 group-hover:opacity-60 transition-opacity" style={{ color: 'var(--accent)' }} />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* QUICK ACTIONS */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-slide-up stagger-4">
          {[
            { lbl: 'Study Cards', Icon: Layers, v: 'flashcards', color: '#8b5cf6', count: totalCards },
            { lbl: 'Take Exam', Icon: CheckSquare, v: 'exams', color: '#3b82f6', count: totalQ },
            { lbl: 'Cases', Icon: Activity, v: 'cases', color: '#06b6d4', count: totalCases },
            { lbl: 'AI Tutor', Icon: MessageSquare, v: 'chat', color: 'var(--accent)', count: null },
          ].map(({ lbl, Icon, v, color, count }) => (
            <button key={v} onClick={() => setView(v)} className="glass card-hover rounded-2xl p-4 flex flex-col items-start gap-2 text-left group">
              <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ background: color + '18' }}><Icon size={18} style={{ color }} /></div>
              <div>
                <p className="font-black text-sm">{lbl}</p>
                {count !== null && <p className="text-xs mt-0.5 font-medium" style={{ color: 'var(--text3)' }}>{count} items</p>}
              </div>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
