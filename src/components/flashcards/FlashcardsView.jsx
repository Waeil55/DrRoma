/**
 * MARIAM PRO — FlashcardsView orchestrator
 * Full flashcard study mode with Quizlet-style 3D flip, swipe gestures,
 * FSRS rating, inline AI tutor, deck list, and PDF export.
 */
import React, { useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  Layers, ChevronLeft, Printer, RefreshCw, MessageSquare, FilePlus,
  Trash2, Loader2, GripVertical
} from 'lucide-react';
import { useSwipe } from '../../hooks/useSwipe';
import { useDrag } from '../../hooks/useDrag';
import { exportToPDF } from '../../utils/exportToPDF';
import { FSRS } from '../../utils/fsrs';
import { trackStudy } from '../../utils/analytics';
import { XP_TABLE, awardXP, checkVariableReward } from '../../utils/xpSystem';
import QuickGenerateModal from '../generate/QuickGenerateModal';
import AiTutorPanel from '../tutor/AiTutorPanel';

export default function FlashcardsView({ flashcards, setFlashcards, settings, addToast, docs, setExams, setCases }) {
  const [selSet, setSelSet] = useState(null);
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [exporting, setExporting] = useState(null);
  const [filterDocId, setFilterDocId] = useState('all');
  const [mobileTutorOpen, setMobileTutorOpen] = useState(false);

  const cardSwipe = useSwipe({
    onTap: () => setFlipped(f => !f),
    onSwipeRight: () => { if (flipped) rateCard(5); else setFlipped(true); },
    onSwipeLeft: () => { if (flipped) rateCard(0); else setFlipped(true); },
    onSwipeUp: () => { if (flipped) rateCard(3); else setFlipped(true); },
    threshold: 70,
  });

  const rateCard = useCallback(q => {
    trackStudy('flashcard');
    const fsrsGrade = q >= 5 ? 3 : q >= 3 ? 2 : q >= 2 ? 1 : 0;
    const isMastered = q >= 5;
    setFlashcards(p => p.map(set => {
      if (set.id !== selSet.id) return set;
      return { ...set, cards: set.cards.map((c, i) => i !== idx ? c : FSRS.schedule(c, fsrsGrade)) };
    }));
    const xpGain = isMastered ? XP_TABLE.card_mastered : XP_TABLE.card_studied;
    awardXP(xpGain);
    addToast(`+${xpGain} XP `, 'success');
    const insight = checkVariableReward();
    if (insight) setTimeout(() => addToast(insight, 'info'), 800);
    const nextIdx = idx + 1;
    if (nextIdx < selSet.cards.length) { setIdx(nextIdx); setFlipped(false); }
    else { addToast(' Set complete!', 'success'); setSelSet(null); setIdx(0); }
  }, [selSet, idx, setFlashcards, addToast]);

  const handleExport = async (set) => {
    setExporting(set.id);
    await exportToPDF('flashcards', set.cards, set.title, addToast);
    setExporting(null);
  };

  const filteredSets = useMemo(() => {
    if (filterDocId === 'all') return flashcards;
    return flashcards.filter(f => f.docId === filterDocId);
  }, [flashcards, filterDocId]);

  const [fcTutorW, setFcTutorW] = useState(380);
  const handleFcTutorDrag = useCallback(x => { setFcTutorW(Math.max(280, Math.min(560, window.innerWidth - x))); }, []);
  const startFcTutorDrag = useDrag(handleFcTutorDrag, [handleFcTutorDrag]);

  /* ═══ STUDY MODE ═══ */
  if (selSet) {
    const card = selSet.cards[idx];
    const progress = ((idx + 1) / selSet.cards.length) * 100;
    const tutorCtx = `Flashcard study session.\nSet: ${selSet.title}\nCard ${idx + 1}/${selSet.cards.length}\nQuestion: ${card?.q}\nAnswer: ${card?.a}\nEvidence: ${card?.evidence || 'N/A'}`;
    return (
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        {/* Top bar */}
        <div className="h-14 glass flex items-center justify-between px-5 shrink-0 border-b border-[color:var(--border2,var(--border))] border-x-0 border-t-0">
          <button onClick={() => { setSelSet(null); setIdx(0); setFlipped(false); }}
            className="glass px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2"><ChevronLeft size={18} />Exit</button>
          <div className="text-center">
            <p className="text-sm font-black truncate max-w-xs">{selSet.title}</p>
            <p className="text-xs opacity-40">{idx + 1} / {selSet.cards.length}</p>
          </div>
          <button onClick={() => handleExport(selSet)} className="glass px-3 py-2 rounded-xl text-sm font-black flex items-center gap-2 opacity-60 hover:opacity-100">
            <Printer size={16} />PDF
          </button>
        </div>
        {/* Progress */}
        <div className="progress-bar shrink-0" style={{ borderRadius: 0, height: 3 }}>
          <div className="progress-fill" style={{ width: `${progress}%`, transition: 'width .5s ease' }} />
        </div>
        {/* Two-panel row */}
        <div className="flex-1 min-h-0 flex overflow-hidden">
          {/* LEFT: card + controls */}
          <div className="flex-1 min-w-0 overflow-y-auto custom-scrollbar p-6 flex flex-col gap-5" style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}>
            {/* 3D flip card with swipe */}
            <div className="relative select-none" style={{ touchAction: 'none', userSelect: 'none' }}
              onPointerDown={cardSwipe.onPointerDown}
              onPointerMove={cardSwipe.onPointerMove}
              onPointerUp={cardSwipe.onPointerUp}>
              {cardSwipe.swipeHint === 'right' && (
                <div className="absolute inset-0 rounded-3xl z-10 flex items-center justify-start pl-8 pointer-events-none"
                  style={{ background: 'rgba(16,185,129,0.15)', border: '2px solid #10b981', borderRadius: '1.5rem' }}>
                  <span className="text-2xl font-black" style={{ color: '#10b981' }}> Easy</span>
                </div>
              )}
              {cardSwipe.swipeHint === 'left' && (
                <div className="absolute inset-0 rounded-3xl z-10 flex items-center justify-end pr-8 pointer-events-none"
                  style={{ background: 'rgba(239,68,68,0.15)', border: '2px solid #ef4444', borderRadius: '1.5rem' }}>
                  <span className="text-2xl font-black" style={{ color: '#ef4444' }}> Again</span>
                </div>
              )}
              <div style={{ perspective: '1200px', ...cardSwipe.swipeStyle }} className="cursor-grab active:cursor-grabbing">
                <div style={{
                  display: 'grid', width: '100%', minHeight: 220,
                  transformStyle: 'preserve-3d',
                  transition: 'transform 0.55s cubic-bezier(0.45,0.05,0.55,0.95)',
                  transform: flipped ? 'rotateX(180deg)' : 'rotateX(0deg)',
                }}>
                  {/* FRONT */}
                  <div style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', gridArea: '1 / 1' }}
                    className="glass rounded-3xl p-8 flex flex-col justify-between border border-[color:var(--border2,var(--border))] hover:border-[var(--accent)]/40 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border glass opacity-50">Question</span>
                      {card.sourcePage && <span className="text-xs font-mono opacity-30">p.{card.sourcePage}</span>}
                    </div>
                    <p className="text-base font-semibold leading-relaxed flex-1">{card.q}</p>
                    <p className="text-xs opacity-25 text-center mt-6 flex items-center justify-center gap-2">
                      <RefreshCw size={11} />Tap/swipe to flip
                      <span className="opacity-60">· → Easy · ← Again · ↑ Good</span>
                    </p>
                  </div>
                  {/* BACK */}
                  <div style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', gridArea: '1 / 1', transform: 'rotateX(180deg)' }}
                    className="glass rounded-3xl p-8 flex flex-col justify-between border border-[var(--accent)]/30 bg-[var(--accent)]/4 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-[var(--accent)]/40 text-[var(--accent)] bg-[var(--accent)]/10">Answer</span>
                      {card.sourcePage && <span className="text-xs font-mono opacity-30">p.{card.sourcePage}</span>}
                    </div>
                    <p className="text-base font-semibold leading-relaxed flex-1 text-[var(--accent)]" style={{ whiteSpace: 'pre-line' }}>{card.a}</p>
                    {card.evidence && <p className="text-xs opacity-40 mt-4 italic border-t border-[color:var(--border2,var(--border))] pt-3">"{card.evidence}"</p>}
                  </div>
                </div>
              </div>
            </div>
            {/* Rating buttons */}
            {flipped ? (
              <div className="grid grid-cols-4 gap-3">
                {[['Again', 0, '#ef4444', ''], ['Hard', 2, '#f59e0b', ''], ['Good', 3, '#3b82f6', ''], ['Easy', 5, '#10b981', '']].map(([l, q, col, em]) => (
                  <button key={l} onClick={() => rateCard(q)}
                    className="text-white py-4 rounded-2xl text-sm font-black uppercase tracking-wide shadow-lg active:scale-95 transition-all flex flex-col items-center gap-1"
                    style={{ background: col }}>
                    <span className="text-base">{em}</span>{l}
                  </button>
                ))}
              </div>
            ) : (
              <button onClick={() => setFlipped(true)} className="w-full py-4 btn-accent rounded-2xl text-base font-black shadow-xl">Show Answer</button>
            )}
            {/* Mobile AI trigger */}
            <div className="lg:hidden mt-2 flex-shrink-0">
              <button onClick={() => setMobileTutorOpen(true)} className="w-full glass py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-[var(--accent)] border border-[var(--accent)]/30 hover:bg-[var(--accent)]/10 transition-colors">
                <MessageSquare size={18} /> Ask AI Tutor
              </button>
            </div>
          </div>
          {/* Drag handle */}
          <div ref={startFcTutorDrag.ref} onMouseDown={startFcTutorDrag}
            className="hidden lg:flex w-5 cursor-col-resize items-center justify-center hover:bg-[var(--accent)]/10 shrink-0 touch-none transition-colors group">
            <GripVertical size={14} className="opacity-20 group-hover:opacity-70 text-[var(--text)]" />
          </div>
          {/* RIGHT: AI Tutor */}
          <div className="hidden lg:flex flex-col border-l border-[color:var(--border2,var(--border))] shrink-0" style={{ width: fcTutorW }}>
            <AiTutorPanel settings={settings} context={tutorCtx} onClose={null} width={fcTutorW} onDragStart={startFcTutorDrag} alwaysOpen={true} />
          </div>
        </div>
        {/* MOBILE FAB */}
        {createPortal(
          <>
            <button onClick={() => setMobileTutorOpen(true)}
              className="lg:hidden fixed w-14 h-14 rounded-[22px] btn-accent shadow-2xl flex items-center justify-center transition-transform active:scale-90"
              style={{ bottom: 'calc(90px + env(safe-area-inset-bottom))', right: 16, zIndex: 9000 }} title="AI Tutor">
              <MessageSquare size={24} />
            </button>
            {mobileTutorOpen && (
              <div className="lg:hidden fixed inset-0 z-[99999] flex flex-col justify-end backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.55)' }} onClick={e => e.target === e.currentTarget && setMobileTutorOpen(false)}>
                <div className="glass rounded-t-[32px] flex flex-col overflow-hidden animate-slide-up" style={{ height: '85%', boxShadow: '0 -10px 50px rgba(0,0,0,0.4)' }} onClick={e => e.stopPropagation()}>
                  <AiTutorPanel settings={settings} context={tutorCtx} onClose={() => setMobileTutorOpen(false)} width={window.innerWidth} />
                </div>
              </div>
            )}
          </>, document.body
        )}
      </div>
    );
  }

  /* ═══ DECK LIST ═══ */
  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar scroll-content" style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}>
      {showModal && <QuickGenerateModal type="flashcards" docs={docs || []} settings={settings}
        onClose={() => setShowModal(false)} addToast={addToast}
        setFlashcards={setFlashcards} setExams={setExams} setCases={setCases} />}
      <div className="w-full p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl lg:text-3xl font-black flex items-center gap-3"><Layers size={26} className="opacity-40" /> Flashcards</h1>
          <button onClick={() => setShowModal(true)}
            className="btn-accent px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg">
            <FilePlus size={18} /> New from File
          </button>
        </div>

        {flashcards.length > 0 && (
          <>
            <div className="grid grid-cols-3 gap-3">
              {[
                ['Sets', flashcards.length, '#6366f1'],
                ['Cards', flashcards.reduce((s, f) => s + (f.cards?.length || 0), 0), '#3b82f6'],
                ['Due Today', flashcards.reduce((s, f) => s + (f.cards?.filter(c => !c.nextReview || c.nextReview <= Date.now()).length || 0), 0), '#f59e0b'],
              ].map(([l, n, col]) => (
                <div key={l} className="glass rounded-2xl p-3 text-center border border-[color:var(--border2,var(--border))]">
                  <p className="text-xl font-black" style={{ color: col }}>{n}</p>
                  <p className="text-xs font-black uppercase tracking-widest opacity-50 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
            {docs?.length > 0 && (
              <select value={filterDocId} onChange={e => setFilterDocId(e.target.value)}
                className="glass rounded-xl px-3 py-2 text-xs font-bold border border-[color:var(--border2,var(--border))] outline-none text-[var(--text)]">
                <option value="all">All Documents</option>
                {[...new Set(flashcards.map(f => f.docId))].map(id => { const doc = docs?.find(d => d.id === id); return doc ? <option key={id} value={id}>{doc.name.slice(0, 30)}</option> : null; })}
              </select>
            )}
          </>
        )}

        {!flashcards.length ? (
          <div className="glass border-dashed border-2 border-[color:var(--border2,var(--border))] rounded-3xl p-12 text-center">
            <Layers size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-black opacity-40">No flashcard sets yet</p>
            <p className="text-sm opacity-30 mt-1 mb-6">Generate cards from any document</p>
            <button onClick={() => setShowModal(true)} className="btn-accent px-6 py-3 rounded-2xl font-black shadow-xl flex items-center gap-2 mx-auto">
              <FilePlus size={16} /> Generate from File
            </button>
          </div>
        ) : (filteredSets.map(set => (
          <div key={set.id} className={`glass rounded-2xl p-5 border transition-all card-hover ${set.isBuiltin ? 'border-[var(--accent)]/30 bg-[var(--accent)]/3' : 'border-[color:var(--border2,var(--border))] hover:border-[var(--accent)]/20'}`}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-black text-sm truncate">{set.title}</h3>
                  {(set.isBuiltin || set.isBuiltIn) && <span className="text-xs font-black px-2 py-0.5 rounded-full bg-[var(--accent)]/15 text-[var(--accent)] border border-[var(--accent)]/20 shrink-0"> Built-in</span>}
                </div>
                <p className="text-xs opacity-40 mt-0.5">{set.cards?.length} cards · {(set.isBuiltin || set.isBuiltIn) ? 'Always available' : new Date(set.createdAt).toLocaleDateString()}</p>
                {set.docId && docs?.find(d => d.id === set.docId) && (
                  <p className="text-xs opacity-30 mt-0.5 truncate"> {docs.find(d => d.id === set.docId).name}</p>
                )}
                {set.cards?.some(c => !c.nextReview || c.nextReview <= Date.now()) && (
                  <span className="badge badge-warn mt-1 inline-flex">
                    {set.cards.filter(c => !c.nextReview || c.nextReview <= Date.now()).length} due today
                  </span>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => handleExport(set)} disabled={exporting === set.id} title="Export PDF"
                  className="w-9 h-9 glass rounded-xl flex items-center justify-center transition-colors hover:bg-[var(--info-bg)]" style={{ color: 'var(--info)' }}>
                  {exporting === set.id ? <Loader2 size={14} className="animate-spin" /> : <Printer size={18} />}
                </button>
                <button onClick={() => { setSelSet(set); setIdx(0); setFlipped(false); }}
                  className="btn-accent px-4 py-2 rounded-xl text-xs font-black shadow-md flex items-center gap-2">
                  <Layers size={16} /> Study
                </button>
                {!(set.isBuiltin || set.isBuiltIn) && <button onClick={() => setFlashcards(p => p.filter(f => f.id !== set.id))} className="w-9 h-9 glass rounded-xl flex items-center justify-center transition-colors hover:bg-[var(--danger-bg)]" style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>}
              </div>
            </div>
          </div>
        )))}
      </div>
    </div>
  );
}
