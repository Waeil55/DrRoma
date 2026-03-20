/**
 * MARIAM PRO — ExamsView orchestrator
 * Switches between exam list, active exam, score screen, and review mode.
 * Includes inline AI tutor panel with draggable width.
 */
import React, { useState, useMemo, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  CheckSquare, ChevronLeft, Printer, FilePlus, Target, Eye,
  Trash2, Loader2, GripVertical, MessageSquare, CheckCircle2
} from 'lucide-react';
import { useDrag } from '../../hooks/useDrag';
import { exportToPDF } from '../../utils/exportToPDF';
import { trackStudy, ANALYTICS } from '../../utils/analytics';
import { XP_TABLE, awardXP } from '../../utils/xpSystem';
import QuickGenerateModal from '../generate/QuickGenerateModal';
import AiTutorPanel from '../tutor/AiTutorPanel';

export default function ExamsView({ exams, setExams, settings, addToast, docs, setFlashcards, setCases }) {
  const [selEx, setSelEx] = useState(null);
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filterDocId, setFilterDocId] = useState('all');
  const [sortMode, setSortMode] = useState('newest');
  const [examMobileOpen, setExamMobileOpen] = useState(false);

  const startExam = ex => { setSelEx(ex); setQi(0); setSelected(null); setSubmitted(false); setScore(null); setAnswers([]); setReviewMode(false); };
  const submit = () => {
    if (selected === null) return;
    const correct = selEx.questions[qi].correct === selected;
    const newAnswers = [...answers, { qi, selected, correct }];
    setAnswers(newAnswers); setSubmitted(true);
    if (qi === selEx.questions.length - 1) {
      const sc = newAnswers.filter(a => a.correct).length;
      setScore(sc);
      trackStudy('exam', sc, selEx.questions.length);
    }
  };
  const next = () => {
    if (qi < selEx.questions.length - 1) { setQi(i => i + 1); setSelected(null); setSubmitted(false); }
  };

  const handleExport = async (ex) => {
    setExporting(true);
    await exportToPDF('exam', ex.questions, ex.title, addToast);
    setExporting(false);
  };

  const filteredExams = useMemo(() => {
    let r = [...exams];
    if (filterDocId !== 'all') r = r.filter(e => e.docId === filterDocId);
    if (sortMode === 'newest') r.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
    if (sortMode === 'oldest') r.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    if (sortMode === 'most') r.sort((a, b) => (b.questions?.length || 0) - (a.questions?.length || 0));
    return r;
  }, [exams, filterDocId, sortMode]);

  const [examTutorW, setExamTutorW] = useState(380);
  const handleExamTutorDrag = useCallback(x => { setExamTutorW(Math.max(280, Math.min(580, window.innerWidth - x))); }, []);
  const startExamTutorDrag = useDrag(handleExamTutorDrag, [handleExamTutorDrag]);

  /* ═══ ACTIVE EXAM ═══ */
  if (selEx && score === null && !reviewMode) {
    const q = selEx.questions[qi];
    const progress = ((qi + 1) / selEx.questions.length) * 100;
    const tutorCtx = `Exam session: ${selEx.title}\nQuestion ${qi + 1}/${selEx.questions.length}\nQ: ${q?.q}\nOptions: ${(q?.options || []).join(' | ')}\nCorrect answer: ${q?.options?.[q?.correct]}\nExplanation: ${q?.explanation || 'N/A'}`;
    return (
      <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
        <div className="h-14 glass flex items-center justify-between px-5 shrink-0 border-b border-[color:var(--border2,var(--border))] border-x-0 border-t-0">
          <button onClick={() => { setSelEx(null); setScore(null); setAnswers([]); }} className="glass px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2"><ChevronLeft size={18} />Exit</button>
          <div className="text-center">
            <p className="text-sm font-black truncate max-w-xs">{selEx.title}</p>
            <p className="text-xs opacity-40">{qi + 1} / {selEx.questions.length} questions</p>
          </div>
          <button onClick={() => setReviewMode(true)} className="glass px-3 py-2 rounded-xl text-sm font-black opacity-60 hover:opacity-100">Review All</button>
        </div>
        <div className="progress-bar shrink-0" style={{ borderRadius: 0, height: 3 }}>
          <div className="progress-fill" style={{ width: `${progress}%`, transition: 'width .5s ease' }} />
        </div>
        <div className="flex-1 min-h-0 flex overflow-hidden">
          <div className="flex-1 min-w-0 overflow-y-auto custom-scrollbar p-4 lg:p-8 space-y-4" style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}>
            <div className="glass rounded-2xl p-4 lg:p-6 border border-[color:var(--border2,var(--border))]">
              {q.sourcePage && <p className="text-xs font-mono opacity-30 mb-3">Source: p.{q.sourcePage}</p>}
              <p className="text-base font-semibold leading-relaxed">{q.q}</p>
            </div>
            <div className="space-y-2.5">
              {(q.options || []).map((opt, oi) => (
                <button key={oi} disabled={submitted} onClick={() => setSelected(oi)}
                  className={`answer-opt w-full text-left px-5 py-4 text-sm font-medium flex items-center gap-3 answer-revealed
                    ${submitted && oi === q.correct ? 'correct' :
                      submitted && oi === selected && oi !== q.correct ? 'wrong' :
                        selected === oi ? 'selected' : ''}`}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 border transition-all
                    ${submitted && oi === q.correct ? 'bg-[var(--success)] border-[var(--success)] text-white' :
                      submitted && oi === selected && oi !== q.correct ? 'bg-[var(--danger)] border-[var(--danger)] text-white' :
                        selected === oi ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'border-[color:var(--border2,var(--border))] opacity-50'}`}>
                    {String.fromCharCode(65 + oi)}
                  </span>
                  <span className="flex-1">{opt}</span>
                  {submitted && oi === q.correct && <CheckCircle2 size={15} style={{ color: 'var(--success)', flexShrink: 0 }} />}
                </button>
              ))}
            </div>
            {submitted && q.explanation && (
              <div className="rounded-2xl p-5 animate-slide-up" style={{ background: 'var(--info-bg)', border: '1px solid var(--info-border)', borderLeft: '4px solid var(--info)' }}>
                <p className="text-xs font-black mb-2 uppercase tracking-widest" style={{ color: 'var(--info)' }}>📖 Explanation</p>
                <p className="text-sm leading-relaxed">{q.explanation}</p>
                {q.evidence && <p className="text-xs italic mt-3 pt-3 border-t opacity-50" style={{ borderColor: 'var(--border2,var(--border))' }}>"{q.evidence}"</p>}
              </div>
            )}
            <div className="pb-4">
              {!submitted ?
                <button onClick={submit} disabled={selected === null} className="w-full py-4 btn-accent rounded-2xl text-base font-black disabled:opacity-40 shadow-xl">Submit Answer</button> :
                qi < selEx.questions.length - 1 ?
                  <button onClick={next} className="w-full py-4 btn-accent rounded-2xl text-base font-black shadow-xl">Next Question →</button> :
                  <button onClick={() => { const sc = answers.filter(a => a.correct).length; setScore(sc); trackStudy('exam', sc, selEx.questions.length); const xpGain = XP_TABLE.exam_completed + sc * XP_TABLE.exam_correct; awardXP(xpGain); addToast(`+${xpGain} XP 📝`, 'success'); }} className="w-full py-4 btn-accent rounded-2xl text-base font-black shadow-xl">See Results →</button>
              }
            </div>
            <div className="lg:hidden mt-4 flex-shrink-0">
              <button onClick={() => setExamMobileOpen(true)} className="w-full glass py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-[var(--accent)] border border-[var(--accent)]/30 hover:bg-[var(--accent)]/10 transition-colors">
                <MessageSquare size={18} /> Ask AI Tutor
              </button>
            </div>
          </div>
          <div ref={startExamTutorDrag.ref} onMouseDown={startExamTutorDrag}
            className="hidden lg:flex w-5 cursor-col-resize items-center justify-center hover:bg-[var(--accent)]/10 shrink-0 touch-none transition-colors group">
            <GripVertical size={14} className="opacity-20 group-hover:opacity-70 text-[var(--text)]" />
          </div>
          {createPortal(
            <>
              <button onClick={() => setExamMobileOpen(true)}
                className="lg:hidden fixed w-14 h-14 rounded-[22px] btn-accent shadow-2xl flex items-center justify-center transition-transform active:scale-90"
                style={{ bottom: 'calc(90px + env(safe-area-inset-bottom))', right: 16, zIndex: 9000 }} title="AI Tutor">
                <MessageSquare size={24} />
              </button>
              {examMobileOpen && (
                <div className="lg:hidden fixed inset-0 z-[99999] flex flex-col justify-end backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.55)' }} onClick={e => e.target === e.currentTarget && setExamMobileOpen(false)}>
                  <div className="glass rounded-t-[32px] flex flex-col overflow-hidden animate-slide-up" style={{ height: '85%', boxShadow: '0 -10px 50px rgba(0,0,0,0.4)' }} onClick={e => e.stopPropagation()}>
                    <AiTutorPanel settings={settings} context={tutorCtx} onClose={() => setExamMobileOpen(false)} width={window.innerWidth} />
                  </div>
                </div>
              )}
            </>, document.body
          )}
          <div className="hidden lg:flex flex-col border-l border-[color:var(--border2,var(--border))] shrink-0" style={{ width: examTutorW }}>
            <AiTutorPanel settings={settings} context={tutorCtx} onClose={null} width={examTutorW} onDragStart={startExamTutorDrag} alwaysOpen={true} />
          </div>
        </div>
      </div>
    );
  }

  /* ═══ REVIEW MODE ═══ */
  if (reviewMode && selEx) {
    return (
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar scroll-content" style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}>
        <div className="w-full p-6 lg:p-8">
          <div className="flex items-center gap-3 mb-6">
            <button onClick={() => setReviewMode(false)} className="glass px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2"><ChevronLeft size={18} />Back</button>
            <h2 className="font-black text-lg">{selEx.title} — Review</h2>
            <button onClick={() => handleExport(selEx)} disabled={exporting}
              className="ml-auto btn-accent px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-md">
              {exporting ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}Print PDF
            </button>
          </div>
          <div className="space-y-4">
            {selEx.questions.map((q, i) => (
              <div key={i} className="glass rounded-2xl p-5 border border-[color:var(--border2,var(--border))]">
                <p className="text-xs font-black text-[var(--accent)] mb-2">Q{i + 1}</p>
                <p className="text-sm font-bold mb-3">{q.q}</p>
                <div className="space-y-1.5">
                  {(q.options || []).map((opt, oi) => (
                    <div key={oi} className="px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2"
                      style={oi === q.correct ? { background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)', fontWeight: 700 } : { opacity: .5 }}>
                      <span className="font-black mr-1">{String.fromCharCode(65 + oi)}.</span>{opt}
                      {oi === q.correct && <CheckCircle2 size={14} className="inline ml-auto shrink-0" style={{ color: 'var(--success)' }} />}
                    </div>
                  ))}
                </div>
                {q.explanation && <p className="text-xs opacity-50 mt-3 italic">{q.explanation}</p>}
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  /* ═══ SCORE SCREEN ═══ */
  if (score !== null && selEx) {
    const pct = Math.round((score / selEx.questions.length) * 100);
    const grade = pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F';
    const scoreColor = pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--warning)' : 'var(--danger)';
    const scoreMsg = pct >= 90 ? 'Outstanding! 🏆' : pct >= 80 ? 'Excellent work! 🎉' : pct >= 70 ? 'Good effort! 📚' : pct >= 60 ? 'Keep studying 💪' : 'More review needed 🔁';
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 bg-mesh">
        <div className="glass rounded-3xl p-10 text-center max-w-sm w-full animate-scale-in" style={{ border: '1px solid var(--border2,var(--border))' }}>
          <div className="text-8xl font-black mb-1" style={{ color: scoreColor, fontFamily: 'Plus Jakarta Sans,system-ui' }}>{pct}%</div>
          <div className="text-3xl font-black mb-4" style={{ color: scoreColor }}>Grade {grade}</div>
          <p className="text-sm font-black mb-1" style={{ color: 'var(--text3)' }}>{score} / {selEx.questions.length} correct</p>
          <p className="text-xs mb-6" style={{ color: 'var(--text3)' }}>{scoreMsg}</p>
          <div className="progress-bar" style={{ height: 10, borderRadius: 999 }}>
            <div className="progress-fill" style={{ width: `${pct}%`, background: scoreColor, transition: 'width 1.2s cubic-bezier(.34,1.2,.64,1)' }} />
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={() => setReviewMode(true)} className="glass px-6 py-3 rounded-2xl font-black" style={{ border: '1px solid var(--border2,var(--border))' }}>Review Answers</button>
          <button onClick={() => { setSelEx(null); setScore(null); setAnswers([]); }} className="btn-accent px-6 py-3 rounded-2xl font-black shadow-xl">Back to Exams</button>
        </div>
      </div>
    );
  }

  /* ═══ EXAM LIST ═══ */
  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar scroll-content" style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}>
      {showModal && <QuickGenerateModal type="exam" docs={docs || []} settings={settings}
        onClose={() => setShowModal(false)} addToast={addToast}
        setFlashcards={setFlashcards || (() => { })} setExams={setExams} setCases={setCases || (() => { })} />}
      <div className="w-full p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl lg:text-3xl font-black flex items-center gap-3"><CheckSquare size={26} className="opacity-40" /> Exams</h1>
          <button onClick={() => setShowModal(true)} className="btn-accent px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg">
            <FilePlus size={18} /> New from File
          </button>
        </div>
        {exams.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                ['Total Exams', exams.length, '#3b82f6'],
                ['Questions', exams.reduce((s, e) => s + (e.questions?.length || 0), 0), '#6366f1'],
                ['Avg Score', ANALYTICS.scores.length ? `${Math.round(ANALYTICS.scores.reduce((s, r) => s + r.pct, 0) / ANALYTICS.scores.length)}%` : '—', '#10b981'],
                ['Attempts', ANALYTICS.scores.length, '#f59e0b'],
              ].map(([l, n, col]) => (
                <div key={l} className="glass rounded-2xl p-3 text-center border border-[color:var(--border2,var(--border))]">
                  <p className="text-xl font-black" style={{ color: col }}>{n}</p>
                  <p className="text-xs font-black uppercase tracking-widest opacity-50 mt-0.5">{l}</p>
                </div>
              ))}
            </div>
            <div className="flex gap-2 flex-wrap">
              <select value={filterDocId} onChange={e => setFilterDocId(e.target.value)}
                className="glass rounded-xl px-3 py-2 text-xs font-bold border border-[color:var(--border2,var(--border))] outline-none text-[var(--text)]">
                <option value="all">All Documents</option>
                {[...new Set(exams.map(e => e.docId))].map(id => { const doc = docs?.find(d => d.id === id); return doc ? <option key={id} value={id}>{doc.name.slice(0, 30)}</option> : null; })}
              </select>
              <select value={sortMode} onChange={e => setSortMode(e.target.value)}
                className="glass rounded-xl px-3 py-2 text-xs font-bold border border-[color:var(--border2,var(--border))] outline-none text-[var(--text)]">
                <option value="newest">Newest first</option>
                <option value="oldest">Oldest first</option>
                <option value="most">Most questions</option>
              </select>
            </div>
          </>
        )}
        {!exams.length ? (
          <div className="glass border-dashed border-2 border-[color:var(--border2,var(--border))] rounded-3xl p-12 text-center">
            <CheckSquare size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-black opacity-40">No exams yet</p>
            <p className="text-sm opacity-30 mt-1 mb-6">Generate exams from any document</p>
            <button onClick={() => setShowModal(true)} className="btn-accent px-6 py-3 rounded-2xl font-black shadow-xl flex items-center gap-2 mx-auto">
              <FilePlus size={16} /> Generate from File
            </button>
          </div>
        ) : (filteredExams.map(ex => (
          <div key={ex.id} className="glass rounded-2xl p-5 border transition-all card-hover"
            style={ex.isBuiltin ? { borderColor: 'var(--success-border)', background: 'var(--success-bg)' } : { borderColor: 'var(--border2,var(--border))' }}>
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-black text-sm truncate">{ex.title}</h3>
                  {ex.isBuiltin && <span className="badge badge-success shrink-0">📚 Built-in</span>}
                </div>
                <p className="text-xs opacity-40 mt-0.5">{ex.questions?.length} questions · {ex.isBuiltin ? 'Always available' : new Date(ex.createdAt).toLocaleDateString()}</p>
                {ex.docId && docs?.find(d => d.id === ex.docId) && (
                  <p className="text-xs opacity-30 mt-0.5 truncate">📄 {docs.find(d => d.id === ex.docId).name}</p>
                )}
              </div>
              <div className="flex gap-2 shrink-0">
                <button onClick={() => handleExport(ex)} disabled={exporting} title="Export as PDF"
                  className="w-9 h-9 glass rounded-xl flex items-center justify-center transition-colors hover:bg-[var(--info-bg)] hover:text-[var(--info)]">
                  {exporting ? <Loader2 size={14} className="animate-spin" /> : <Printer size={18} />}
                </button>
                <button onClick={() => { setSelEx(ex); setReviewMode(true); }} title="Review all questions"
                  className="w-9 h-9 glass rounded-xl flex items-center justify-center hover:bg-[var(--accent)]/10 transition-colors" style={{ color: 'var(--accent)' }}>
                  <Eye size={18} />
                </button>
                <button onClick={() => startExam(ex)} className="btn-accent px-4 py-2 rounded-xl text-xs font-black shadow-md flex items-center gap-2"><Target size={18} /> Start</button>
                {!(ex.isBuiltin || ex.isBuiltIn) && <button onClick={() => setExams(p => p.filter(f => f.id !== ex.id))} className="w-9 h-9 glass rounded-xl flex items-center justify-center transition-colors hover:bg-[var(--danger-bg)]" style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>}
              </div>
            </div>
          </div>
        )))}
      </div>
    </div>
  );
}
