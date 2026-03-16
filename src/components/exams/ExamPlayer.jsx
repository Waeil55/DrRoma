/**
 * MARIAM PRO — ExamPlayer Component
 * Handles the active exam-taking experience (one question at a time).
 */
import React, { useState, useCallback } from 'react';
import { ChevronLeft, CheckCircle2 } from 'lucide-react';
import { renderAIContent } from '../../utils/markdown.js';

export default function ExamPlayer({ exam, onExit, onComplete, addToast }) {
  const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers, setAnswers] = useState([]);

  const q = exam.questions[qi];
  const progress = ((qi + 1) / exam.questions.length) * 100;

  const submit = useCallback(() => {
    if (selected === null) return;
    const correct = exam.questions[qi].correct === selected;
    const newAnswers = [...answers, { qi, selected, correct }];
    setAnswers(newAnswers);
    setSubmitted(true);
    if (qi === exam.questions.length - 1) {
      const sc = newAnswers.filter(a => a.correct).length;
      onComplete?.(sc, exam.questions.length, newAnswers);
    }
  }, [selected, qi, exam.questions, answers, onComplete]);

  const next = useCallback(() => {
    if (qi < exam.questions.length - 1) {
      setQi(i => i + 1);
      setSelected(null);
      setSubmitted(false);
    }
  }, [qi, exam.questions.length]);

  return (
    <div className="flex-1 min-h-0 flex flex-col overflow-hidden">
      {/* Top bar */}
      <div className="h-14 glass flex items-center justify-between px-5 shrink-0 border-b border-[color:var(--border2,var(--border))]">
        <button onClick={onExit} className="glass px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2">
          <ChevronLeft size={18} />Exit
        </button>
        <div className="text-center">
          <p className="text-sm font-black truncate max-w-xs">{exam.title}</p>
          <p className="text-xs opacity-40">{qi + 1} / {exam.questions.length} questions</p>
        </div>
        <div className="w-20" />
      </div>

      {/* Progress */}
      <div className="progress-bar shrink-0" style={{ borderRadius: 0, height: 3 }}>
        <div className="progress-fill" style={{ width: `${progress}%`, transition: 'width .5s ease' }} />
      </div>

      {/* Question & Options */}
      <div className="flex-1 min-w-0 overflow-y-auto custom-scrollbar p-4 lg:p-8 space-y-4">
        <div className="glass rounded-2xl p-4 lg:p-6 border border-[color:var(--border2,var(--border))]">
          {q.sourcePage && <p className="text-xs font-mono opacity-30 mb-3">Source: p.{q.sourcePage}</p>}
          <p className="text-base font-semibold leading-relaxed">{q.q}</p>
        </div>

        <div className="space-y-2.5">
          {(q.options || []).map((opt, oi) => (
            <button key={oi} disabled={submitted} onClick={() => setSelected(oi)}
              className={`answer-opt w-full text-left px-5 py-4 text-sm font-medium flex items-center gap-3
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
          <div className="rounded-2xl p-5 animate-slide-up"
            style={{ background: 'var(--info-bg)', border: '1px solid var(--info-border)', borderLeft: '4px solid var(--info)' }}>
            <p className="text-xs font-black mb-2 uppercase tracking-widest" style={{ color: 'var(--info)' }}>Explanation</p>
            <p className="text-sm leading-relaxed">{q.explanation}</p>
          </div>
        )}

        <div className="pb-4">
          {!submitted ? (
            <button onClick={submit} disabled={selected === null}
              className="w-full py-4 btn-accent rounded-2xl text-base font-black disabled:opacity-40 shadow-xl">
              Submit Answer
            </button>
          ) : qi < exam.questions.length - 1 ? (
            <button onClick={next}
              className="w-full py-4 btn-accent rounded-2xl text-base font-black shadow-xl">
              Next Question →
            </button>
          ) : (
            <button onClick={() => {
              const sc = answers.filter(a => a.correct).length;
              onComplete?.(sc, exam.questions.length, answers);
            }} className="w-full py-4 btn-accent rounded-2xl text-base font-black shadow-xl">
              See Results →
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
