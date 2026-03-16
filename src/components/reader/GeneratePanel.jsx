/**
 * MARIAM PRO — GeneratePanel
 * 16 AI tools with config, page range, count, difficulty, language, results preview + save.
 */
import React, { useState, useEffect } from 'react';
import {
  Layers, CheckSquare, AlignLeft, Activity, Stethoscope, Pill, Thermometer,
  Lightbulb, Baby, Network, Tag, Clock, Languages, Wand2, FlaskConical, Code,
  BookOpen, Zap, ListChecks, AlertCircle, CheckCircle2, Save, Loader2
} from 'lucide-react';
import MindMap from '../visualization/MindMap';
import TimelineView from '../visualization/TimelineView';

const TOOLS = [
  ['flashcards', 'Cards', Layers, '#6366f1'], ['exam', 'Exam', CheckSquare, '#3b82f6'],
  ['summary', 'Summary', AlignLeft, '#10b981'], ['cases', 'Cases', Activity, '#8b5cf6'],
  ['clinical', 'Clinical', Stethoscope, '#06b6d4'], ['treatment', 'Treat', Pill, '#f59e0b'],
  ['labs', 'Labs', Thermometer, '#ef4444'], ['mnemonics', 'Memory', Lightbulb, '#84cc16'],
  ['eli5', 'ELI5', Baby, '#f97316'], ['mindmap', 'MindMap', Network, '#a855f7'],
  ['concepts', 'Concepts', Tag, '#14b8a6'], ['timeline', 'Timeline', Clock, '#6366f1'],
  ['translate', 'Translate', Languages, '#ec4899'], ['smart-summary', 'SmartSum', Wand2, '#f59e0b'],
  ['differential', 'Diff Dx', FlaskConical, '#8b5cf6'], ['code-explain', 'Explain', Code, '#94a3b8'],
];

export default function GeneratePanel({ activeDoc, bgTask, onStart, onClear, setFlashcards, setExams, setCases, setNotes, onVault, currentPage, addToast, settings, mindMaps, setMindMaps, timelines, setTimelines }) {
  const [startPage, setStartPage] = useState(currentPage);
  const [endPage, setEndPage] = useState(currentPage);
  const [entireFile, setEntireFile] = useState(false);
  const [type, setType] = useState('exam');
  const [count, setCount] = useState(20);
  const [difficulty, setDifficulty] = useState(2);
  const [targetLang, setTargetLang] = useState('Spanish');
  const levels = ['Hard', 'Expert', 'Insane'];

  useEffect(() => { if (!bgTask) { setStartPage(currentPage); if (!entireFile) setEndPage(currentPage); } }, [currentPage, bgTask]);
  useEffect(() => { if (entireFile && activeDoc) { setStartPage(1); setEndPage(activeDoc.totalPages); } }, [entireFile, activeDoc]);

  if (!activeDoc) return <div className="flex-1 flex items-center justify-center text-sm opacity-40 font-bold">No document open.</div>;

  const go = () => onStart(type, activeDoc.id, startPage, endPage, { count, difficultyLevel: levels[difficulty - 1], targetLang });

  const save = () => {
    if (!bgTask?.result) return;
    const g = bgTask.result;
    if (g.type === 'flashcards') {
      const cards = g.data.map(c => ({ id: Date.now() + Math.random(), q: c.q, a: c.a, evidence: c.evidence, sourcePage: c.sourcePage, repetitions: 0, ef: 2.5, interval: 1, nextReview: Date.now(), lastReview: Date.now() }));
      setFlashcards(p => [...p, { id: Date.now().toString(), docId: activeDoc.id, sourcePages: g.pages, title: `Cards — Pgs ${g.pages}`, cards, createdAt: new Date().toISOString() }]);
      addToast(`${cards.length} flashcards saved!`, 'success');
    } else if (g.type === 'cases') {
      setCases(p => [...p, { id: Date.now().toString(), docId: activeDoc.id, sourcePages: g.pages, title: 'Patient Cases', questions: g.data, createdAt: new Date().toISOString() }]);
      addToast(`${g.data.length} cases saved!`, 'success');
    } else if (g.type === 'exam') {
      setExams(p => [...p, { id: Date.now().toString(), docId: activeDoc.id, sourcePages: g.pages, title: `Exam — Pgs ${g.pages}`, questions: g.data, createdAt: new Date().toISOString() }]);
      addToast(`${g.data.length} questions saved!`, 'success');
    } else if (g.type === 'mindmap') {
      if (setMindMaps) setMindMaps(p => [...p, { id: Date.now().toString(), docId: activeDoc.id, pages: g.pages, data: g.data, createdAt: new Date().toISOString() }]);
      addToast('Mind map saved!', 'success');
    } else if (g.type === 'timeline') {
      if (setTimelines) setTimelines(p => [...p, { id: Date.now().toString(), docId: activeDoc.id, pages: g.pages, events: g.data, createdAt: new Date().toISOString() }]);
      addToast('Timeline saved!', 'success');
    } else {
      setNotes(p => [...p, { id: Date.now().toString(), docId: activeDoc.id, title: `${g.title || 'Note'} · Pgs ${g.pages}`, content: g.data, createdAt: new Date().toISOString() }]);
      addToast('Saved!', 'success');
    }
    onClear(); onVault();
  };

  /* ── RESULTS VIEW ── */
  if (bgTask?.isFinished) return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex items-center justify-between px-4 py-3 border-b shrink-0" style={{ background: 'var(--success-bg)', borderColor: 'var(--success-border)' }}>
        <span className="text-xs font-black flex items-center gap-2" style={{ color: 'var(--success)' }}>
          <CheckCircle2 size={15} />{Array.isArray(bgTask.result?.data) ? `${bgTask.result.data.length} items ready` : 'Done!'}
        </span>
        <div className="flex gap-2">
          <button onClick={onClear} className="px-3 py-1.5 glass rounded-xl text-xs font-black uppercase opacity-60 hover:opacity-100">Discard</button>
          <button onClick={save} className="px-3 py-1.5 rounded-xl text-xs font-black uppercase flex items-center gap-1.5 shadow-md text-white" style={{ background: 'var(--success)' }}>
            <Save size={16} /> Save
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-4" style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}>
        {bgTask.result?.type === 'flashcards' && bgTask.result.data.slice(0, 5).map((item, i) => (
          <div key={i} className="glass p-4 rounded-2xl">
            <p className="font-bold text-xs mb-3 leading-relaxed"><span className="opacity-30 mr-1.5 font-mono text-xs">Q{i + 1}</span>{item.q}</p>
            <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-3 rounded-xl text-xs text-[var(--accent)]">{item.a}</div>
            {item.evidence && <p className="mt-2 text-xs opacity-40 italic">"{item.evidence}" — Pg {item.sourcePage}</p>}
          </div>
        ))}
        {(bgTask.result?.type === 'exam' || bgTask.result?.type === 'cases') && bgTask.result.data.slice(0, 3).map((item, i) => {
          const q = item.examQuestion || item;
          return (
            <div key={i} className="glass p-4 rounded-2xl">
              <p className="font-bold text-xs mb-3"><span className="opacity-30 mr-1.5 text-xs">Q{i + 1}</span>{item.vignette || q.q}</p>
              <div className="space-y-1.5">
                {(q.options || []).map((opt, oi) => (
                  <div key={oi} className="px-3 py-2 rounded-xl text-xs font-medium border"
                    style={oi === q.correct ? { background: 'var(--success-bg)', borderColor: 'var(--success-border)', color: 'var(--success)', fontWeight: 700 } : { opacity: .5, border: '1px solid transparent' }}>
                    <span className="font-black opacity-50 mr-2">{String.fromCharCode(65 + oi)}.</span>{opt}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
        {bgTask.result?.type === 'mindmap' && <MindMap data={bgTask.result.data} />}
        {bgTask.result?.type === 'timeline' && <TimelineView events={bgTask.result.data.events || bgTask.result.data} />}
        {bgTask.result?.type === 'concepts' && bgTask.result.data.slice(0, 5).map((c, i) => (
          <div key={i} className="glass p-4 rounded-2xl">
            <p className="font-black text-xs mb-1 text-[var(--accent)]">{c.concept || c.term}</p>
            <p className="text-xs leading-relaxed opacity-80">{c.definition || c.explanation}</p>
            {c.example && <p className="text-xs mt-2 opacity-50 italic">Ex: {c.example}</p>}
          </div>
        ))}
        {['summary', 'clinical', 'treatment', 'labs', 'eli5', 'mnemonics', 'translate', 'differential', 'smart-summary', 'code-explain'].includes(bgTask.result?.type) && (
          <div className="glass p-4 rounded-2xl">
            <pre className="text-xs leading-relaxed whitespace-pre-wrap text-[var(--text)] opacity-90">{bgTask.result.data}</pre>
          </div>
        )}
        {bgTask.result?.data?.length > 5 && <p className="text-center text-xs opacity-40 font-bold">+{bgTask.result.data.length - 5} more items saved</p>}
      </div>
    </div>
  );

  /* ── CONFIG VIEW ── */
  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-4 h-full">
      <div className="glass rounded-2xl p-4">
        <h3 className="text-sm font-black uppercase tracking-widest opacity-60 mb-4 flex items-center gap-2"><BookOpen size={16} /> Page Range</h3>
        <label className="flex items-center gap-2 mb-3 cursor-pointer">
          <div onClick={() => setEntireFile(v => !v)}
            className={`w-9 h-5 rounded-full transition-colors relative ${entireFile ? 'bg-[var(--accent)]' : 'bg-gray-300 dark:bg-zinc-600'}`}>
            <div className={`absolute top-0.5 w-4 h-4 bg-white rounded-full shadow transition-transform ${entireFile ? 'translate-x-4' : 'translate-x-0.5'}`} />
          </div>
          <span className="text-xs font-bold opacity-60">Entire file</span>
        </label>
        {!entireFile && (
          <div className="flex gap-3">
            {[['From', startPage, setStartPage], ['To', endPage, setEndPage]].map(([l, v, s]) => (
              <div key={l} className="flex-1">
                <label className="text-xs font-black uppercase tracking-widest opacity-40 block mb-1">{l}</label>
                <input type="number" min={1} max={activeDoc.totalPages} value={v} onChange={e => s(Number(e.target.value))}
                  className="w-full glass rounded-xl px-3 py-2.5 text-center font-mono font-bold text-sm outline-none focus:border-[var(--accent)] border border-[color:var(--border2,var(--border))] text-[var(--text)]" />
              </div>
            ))}
          </div>
        )}
        {entireFile && <p className="text-xs text-[var(--accent)] font-bold mt-2 text-center">All {activeDoc.totalPages} pages selected</p>}
      </div>

      <div className="glass rounded-2xl p-4">
        <h3 className="text-sm font-black uppercase tracking-widest opacity-60 mb-4 flex items-center gap-2"><Zap size={16} /> AI Tool</h3>
        <div className="grid grid-cols-4 gap-1.5">
          {TOOLS.map(([id, lbl, Icon, color]) => (
            <button key={id} onClick={() => setType(id)}
              className={`py-2.5 flex flex-col items-center gap-1 rounded-xl text-xs font-black uppercase tracking-wider transition-all border
                ${type === id ? 'text-white border-transparent shadow-md scale-105' : 'glass opacity-60 hover:opacity-100 border-[color:var(--border2,var(--border))]'}`}
              style={type === id ? { backgroundColor: color } : {}}>
              <Icon size={18} />{lbl}
            </button>
          ))}
        </div>
      </div>

      {type === 'translate' && (
        <div className="glass rounded-2xl p-4">
          <h3 className="text-sm font-black uppercase tracking-widest opacity-60 mb-4">Target Language</h3>
          <div className="flex flex-wrap gap-2">
            {['Arabic', 'Spanish', 'French', 'German', 'Chinese', 'Japanese', 'Portuguese', 'Turkish', 'Hindi', 'Urdu'].map(lang => (
              <button key={lang} onClick={() => setTargetLang(lang)}
                className={`px-3 py-1.5 rounded-xl text-xs font-black transition-all ${targetLang === lang ? 'bg-[var(--accent)] text-white' : 'glass opacity-60 hover:opacity-100'}`}>{lang}</button>
            ))}
          </div>
          <input value={targetLang} onChange={e => setTargetLang(e.target.value)} placeholder="Or type any language…"
            className="mt-3 w-full glass border border-[color:var(--border2,var(--border))] rounded-xl px-3 py-2 text-xs outline-none focus:border-[var(--accent)] text-[var(--text)]" />
        </div>
      )}

      {['flashcards', 'exam', 'cases'].includes(type) && (
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black uppercase tracking-widest opacity-60 flex items-center gap-2"><ListChecks size={16} /> Quantity</h3>
            <span className="text-sm font-black text-[var(--accent)]">{count}</span>
          </div>
          <input type="range" min="1" max="1000" value={count} onChange={e => setCount(+e.target.value)} className="w-full accent-[var(--accent)] mb-2" />
          <div className="flex gap-1.5 flex-wrap">
            {[5, 10, 20, 50, 100, 250, 500, 1000].map(n => (
              <button key={n} onClick={() => setCount(n)}
                className={`px-2 py-1 rounded-lg text-xs font-black transition-colors ${count === n ? 'bg-[var(--accent)] text-white' : 'glass opacity-60 hover:opacity-100'}`}>{n}</button>
            ))}
          </div>
          {count > 50 && <p className="text-xs font-bold mt-2 flex items-center gap-1" style={{ color: 'var(--warning)' }}><AlertCircle size={10} />Parallel AI — {count}+ items in ~30-120s</p>}
        </div>
      )}

      {['flashcards', 'exam', 'cases'].includes(type) && (
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <h3 className="text-xs font-black uppercase tracking-widest opacity-60">Difficulty</h3>
            <span className="text-xs font-black text-[var(--accent)]">{levels[difficulty - 1]}</span>
          </div>
          <input type="range" min="1" max="3" value={difficulty} onChange={e => setDifficulty(+e.target.value)} className="w-full accent-[var(--accent)]" />
        </div>
      )}

      <button onClick={go} disabled={!!bgTask}
        className="w-full py-4 btn-accent rounded-2xl text-sm font-black uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-3 shadow-xl">
        {bgTask ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} fill="currentColor" />}
        {bgTask ? `${bgTask.msg}` : '⚡ Generate Now'}
      </button>

      {bgTask && !bgTask.isFinished && (
        <div className="glass rounded-2xl p-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-black opacity-60">{bgTask.msg}</span>
            <span className="text-xs font-black text-[var(--accent)]">{bgTask.done || 0}/{bgTask.total || 1}</span>
          </div>
          <div className="progress-bar" style={{ height: 8, borderRadius: 8 }}>
            <div className="progress-fill animate-pulse" style={{ width: `${bgTask.total ? ((bgTask.done || 0) / bgTask.total) * 100 : 10}%` }} />
          </div>
        </div>
      )}
    </div>
  );
}
