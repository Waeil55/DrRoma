/**
 * MARIAM PRO — CasePlayer Component
 * Three-panel clinical case player: Vignette/Q + Lab Results + AI Tutor
 */
import React, { useState, useCallback } from 'react';
import { createPortal } from 'react-dom';
import {
  ChevronLeft, ChevronRight, ChevronDown, CheckCircle2, CheckSquare,
  Stethoscope, Thermometer, GripVertical, MessageSquare, Printer
} from 'lucide-react';
import { useDrag } from '../../hooks/useDrag';
import { exportToPDF } from '../../utils/exportToPDF';

export default function CasePlayer({ caseSet, settings, addToast, AiTutorPanel }) {
  const [ci, setCi] = useState(0);
  const [selOpt, setSelOpt] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [mobileTutorOpen, setMobileTutorOpen] = useState(false);

  const [labW, setLabW] = useState(420);
  const [tutorW, setTutorW] = useState(360);
  const handleLabDrag = useCallback(x => setLabW(Math.max(280, Math.min(600, window.innerWidth - x))), []);
  const handleTutorDrag = useCallback(x => setTutorW(Math.max(260, Math.min(520, window.innerWidth - x))), []);
  const startLabDrag = useDrag(handleLabDrag, [handleLabDrag]);
  const startTutorDrag = useDrag(handleTutorDrag, [handleTutorDrag]);

  const cas = caseSet.questions[ci];
  const q = cas.examQuestion || cas;
  const tutorCtx = `Clinical case: ${cas?.title || 'Untitled'}\nVignette: ${cas?.vignette || ''}\nDiagnosis: ${cas?.diagnosis || 'N/A'}\nQuestion: ${q?.q}\nCorrect answer: ${q?.options?.[q?.correct]}\nExplanation: ${q?.explanation || 'N/A'}`;

  const goNext = () => { setCi(i => i + 1); setSelOpt(null); setSubmitted(false); };
  const isLast = ci >= caseSet.questions.length - 1;

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* ── TOP BAR ── */}
      <div className="h-14 glass flex items-center justify-between px-5 shrink-0 border-b border-[color:var(--border2,var(--border))] border-x-0 border-t-0">
        <button onClick={() => window.history.back()}
          className="glass px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2 hover:border-[var(--accent)]/40 transition-all">
          <ChevronLeft size={18} />Exit
        </button>
        <div className="text-center">
          {cas.title && <p className="text-base font-black truncate max-w-xs">{cas.title}</p>}
          <div className="flex items-center gap-2 justify-center mt-0.5">
            <p className="text-xs font-bold opacity-50">Case {ci + 1} / {caseSet.questions.length}</p>
            <div className="flex gap-0.5">
              {caseSet.questions.map((_, i) => (
                <div key={i} className="h-1.5 rounded-full transition-all"
                  style={i === ci ? { width: 24, background: 'var(--accent)' } : i < ci ? { width: 8, background: 'var(--success)' } : { width: 8, background: 'var(--border2,var(--border))' }} />
              ))}
            </div>
          </div>
        </div>
        <button onClick={() => exportToPDF('cases', caseSet.questions, caseSet.title, addToast)}
          className="glass px-3 py-2 rounded-xl text-sm font-black opacity-60 hover:opacity-100 flex items-center gap-2">
          <Printer size={16} />PDF
        </button>
      </div>

      {/* ── MAIN THREE-PANEL ROW ── */}
      <div className="flex-1 min-h-0 flex overflow-hidden">
        {/* LEFT: Vignette + Question + Answers */}
        <div className="flex-1 min-w-0 overflow-y-auto custom-scrollbar p-5 space-y-4"
          style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}>
          {/* Vignette */}
          <div className="glass rounded-2xl p-5 border border-[color:var(--border2,var(--border))]">
            <p className="text-xs font-black uppercase tracking-widest text-[var(--accent)] mb-3 flex items-center gap-2">
              <Stethoscope size={13} /> Patient Vignette
            </p>
            <p className="text-sm leading-[1.85]">{cas.vignette}</p>
          </div>
          {/* Question */}
          <div className="glass rounded-2xl p-5 border border-[color:var(--border2,var(--border))]">
            <p className="text-sm font-black uppercase tracking-widest opacity-40 mb-3 flex items-center gap-2"><CheckSquare size={13} />Question</p>
            <p className="text-base font-semibold leading-relaxed">{q.q}</p>
          </div>
          {/* Options */}
          <div className="space-y-2.5">
            {(q.options || []).map((opt, oi) => (
              <button key={oi} disabled={submitted} onClick={() => setSelOpt(oi)}
                className={`answer-opt w-full text-left px-5 py-4 text-sm font-medium flex items-center gap-3 answer-revealed
                  ${submitted && oi === q.correct ? 'correct' :
                    submitted && oi === selOpt && oi !== q.correct ? 'wrong' :
                      selOpt === oi ? 'selected' : ''}`}>
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-black shrink-0 border transition-all
                  ${submitted && oi === q.correct ? 'bg-[var(--success)] border-[var(--success)] text-white' :
                    submitted && oi === selOpt && oi !== q.correct ? 'bg-[var(--danger)] border-[var(--danger)] text-white' :
                      selOpt === oi ? 'bg-[var(--accent)] border-[var(--accent)] text-white' : 'border-[color:var(--border2,var(--border))] opacity-50'}`}>
                  {String.fromCharCode(65 + oi)}
                </span>
                <span className="flex-1">{opt}</span>
                {submitted && oi === q.correct && <CheckCircle2 size={16} style={{ color: 'var(--success)', flexShrink: 0 }} />}
              </button>
            ))}
          </div>
          {/* Explanation */}
          {submitted && (
            <div className="rounded-2xl p-5 space-y-2 animate-slide-up"
              style={{ background: 'var(--success-bg)', border: '1px solid var(--success-border)', borderLeft: '4px solid var(--success)' }}>
              {cas.diagnosis && (
                <p className="text-sm font-black flex items-center gap-2" style={{ color: 'var(--success)' }}>
                  <CheckCircle2 size={15} />Diagnosis: {cas.diagnosis}
                </p>
              )}
              {q.explanation && <p className="text-sm leading-relaxed">{q.explanation}</p>}
              {q.evidence && (
                <p className="text-xs italic pt-3 border-t opacity-50" style={{ borderColor: 'var(--border2,var(--border))' }}>
                  "{q.evidence}" — p.{q.sourcePage}
                </p>
              )}
            </div>
          )}
          {/* Action */}
          <div className="pb-4">
            {!submitted ? (
              <button onClick={() => setSubmitted(true)} disabled={selOpt === null}
                className="w-full py-4 btn-accent rounded-2xl text-base font-black disabled:opacity-40 shadow-xl">
                Submit Answer
              </button>
            ) : !isLast ? (
              <button onClick={goNext}
                className="w-full py-4 btn-accent rounded-2xl text-base font-black shadow-xl flex items-center justify-center gap-2">
                <ChevronRight size={20} />Next Case
              </button>
            ) : (
              <button onClick={() => addToast('All cases complete! ', 'success')}
                className="w-full py-4 btn-accent rounded-2xl text-base font-black shadow-xl"
                style={{ background: 'var(--success)' }}>
                Finish Session 
              </button>
            )}
          </div>
        </div>

        {/* DRAG HANDLE */}
        <div ref={startLabDrag.ref} onMouseDown={startLabDrag}
          className="hidden lg:flex w-5 cursor-col-resize items-center justify-center hover:bg-[var(--accent)]/10 shrink-0 z-10 touch-none transition-colors group">
          <GripVertical size={14} className="opacity-20 group-hover:opacity-70 text-[var(--text)]" />
        </div>

        {/* MIDDLE: Lab Results */}
        <div className="hidden lg:flex flex-col border-l border-[color:var(--border2,var(--border))] bg-[var(--surface,var(--card))] overflow-hidden shrink-0"
          style={{ width: labW }}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[color:var(--border2,var(--border))] shrink-0 cursor-grab select-none touch-none"
            ref={startLabDrag.ref} onMouseDown={startLabDrag}>
            <Thermometer size={15} className="text-[var(--accent)] shrink-0" />
            <span className="text-sm font-black uppercase tracking-widest text-[var(--accent)]">Laboratory Results</span>
            <GripVertical size={13} className="ml-auto opacity-20" />
          </div>
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-5">
            {cas.labPanels?.length > 0 ? cas.labPanels.map((panel, pi) => (
              <div key={pi}>
                <p className="text-xs font-black uppercase tracking-widest opacity-50 mb-2 px-1">{panel.panelName}</p>
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[color:var(--border2,var(--border))]">
                      {['TEST', 'RESULT', 'RANGE', 'UNITS'].map(h => (
                        <th key={h} className="text-left py-1.5 px-2 text-xs font-black uppercase tracking-wider opacity-40">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {(panel.rows || []).map((row, ri) => (
                      <tr key={ri} className="border-b border-[color:var(--border2,var(--border))]/20 hover:bg-[var(--accent)]/4 transition-colors">
                        <td className="py-2 px-2 font-bold text-sm">{row.test}</td>
                        <td className="py-2 px-2 font-black text-sm">
                          <span className="flex items-center gap-1"
                            style={{ color: row.flag === 'H' ? '#ef4444' : row.flag === 'L' ? '#3b82f6' : undefined }}>
                            {row.result}
                            {row.flag && (
                              <span className="text-xs font-black px-1 py-0.5 rounded"
                                style={{ backgroundColor: row.flag === 'H' ? '#ef444420' : row.flag === 'L' ? '#3b82f620' : 'transparent' }}>
                                {row.flag}
                              </span>
                            )}
                          </span>
                        </td>
                        <td className="py-2 px-2 text-sm opacity-45 font-mono">{row.range}</td>
                        <td className="py-2 px-2 text-sm opacity-35 font-mono">{row.units}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )) : (
              <div className="flex flex-col items-center justify-center h-32 opacity-25">
                <Thermometer size={28} className="mb-2" />
                <p className="text-sm font-bold">No lab data</p>
              </div>
            )}
          </div>
        </div>

        {/* DRAG HANDLE */}
        <div ref={startTutorDrag.ref} onMouseDown={startTutorDrag}
          className="hidden lg:flex w-5 cursor-col-resize items-center justify-center hover:bg-[var(--accent)]/10 shrink-0 z-10 touch-none transition-colors group">
          <GripVertical size={14} className="opacity-20 group-hover:opacity-70 text-[var(--text)]" />
        </div>

        {/* RIGHT: AI Tutor */}
        {AiTutorPanel && (
          <div className="hidden lg:flex flex-col border-l border-[color:var(--border2,var(--border))] shrink-0 overflow-hidden"
            style={{ width: tutorW }}>
            <AiTutorPanel settings={settings} context={tutorCtx} onClose={null} width={tutorW} onDragStart={startTutorDrag} alwaysOpen={true} />
          </div>
        )}
      </div>

      {/* Mobile: lab results collapsed accordion */}
      <div className="lg:hidden border-t border-[color:var(--border2,var(--border))]">
        {cas.labPanels?.length > 0 && (
          <details className="group">
            <summary className="flex items-center gap-2 px-4 py-3 cursor-pointer bg-[var(--surface,var(--card))] text-sm font-black select-none">
              <Thermometer size={15} className="text-[var(--accent)]" />
              <span className="text-[var(--accent)] uppercase tracking-widest text-xs">Lab Results</span>
              <ChevronDown size={14} className="ml-auto opacity-40 group-open:rotate-180 transition-transform" />
            </summary>
            <div className="p-4 overflow-x-auto">
              {cas.labPanels.map((panel, pi) => (
                <div key={pi} className="mb-4">
                  <p className="text-xs font-black uppercase tracking-widest opacity-50 mb-2">{panel.panelName}</p>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className="border-b border-[color:var(--border2,var(--border))]">
                        {['TEST', 'RESULT', 'RANGE', 'UNITS'].map(h => (
                          <th key={h} className="text-left py-1 px-2 font-black uppercase opacity-40">{h}</th>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {(panel.rows || []).map((row, ri) => (
                        <tr key={ri} className="border-b border-[color:var(--border2,var(--border))]/20">
                          <td className="py-1.5 px-2 font-bold">{row.test}</td>
                          <td className="py-1.5 px-2 font-black"
                            style={{ color: row.flag === 'H' ? '#ef4444' : row.flag === 'L' ? '#3b82f6' : undefined }}>
                            {row.result}{row.flag && ` ${row.flag}`}
                          </td>
                          <td className="py-1.5 px-2 opacity-40 font-mono">{row.range}</td>
                          <td className="py-1.5 px-2 opacity-35 font-mono">{row.units}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ))}
            </div>
          </details>
        )}
      </div>

      {/* MOBILE: floating AI Tutor FAB */}
      {AiTutorPanel && createPortal(
        <>
          <button onClick={() => setMobileTutorOpen(true)}
            className="lg:hidden fixed w-14 h-14 rounded-[22px] btn-accent shadow-2xl flex items-center justify-center transition-transform active:scale-90"
            style={{ bottom: 'calc(90px + env(safe-area-inset-bottom))', right: 16, zIndex: 9000 }} title="AI Tutor">
            <MessageSquare size={24} />
          </button>
          {mobileTutorOpen && (
            <div className="lg:hidden fixed inset-0 z-[99999] flex flex-col justify-end backdrop-blur-sm"
              style={{ background: 'rgba(0,0,0,0.55)' }}
              onClick={e => e.target === e.currentTarget && setMobileTutorOpen(false)}>
              <div className="glass rounded-t-[32px] flex flex-col overflow-hidden animate-slide-up"
                style={{ height: '85%', boxShadow: '0 -10px 50px rgba(0,0,0,0.4)' }}
                onClick={e => e.stopPropagation()}>
                <AiTutorPanel settings={settings} context={tutorCtx} onClose={() => setMobileTutorOpen(false)} width={window.innerWidth} />
              </div>
            </div>
          )}
        </>, document.body
      )}
    </div>
  );
}
