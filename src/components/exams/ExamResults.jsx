/**
 * MARIAM PRO — ExamResults Component
 * Score display after completing an exam.
 */
import React from 'react';

export default function ExamResults({ score, total, onReview, onBack }) {
  const pct = Math.round((score / total) * 100);
  const grade = pct >= 90 ? 'A' : pct >= 80 ? 'B' : pct >= 70 ? 'C' : pct >= 60 ? 'D' : 'F';
  const scoreColor = pct >= 80 ? 'var(--success)' : pct >= 60 ? 'var(--warning)' : 'var(--danger)';
  const scoreMsg = pct >= 90 ? 'Outstanding!' : pct >= 80 ? 'Excellent work!' : pct >= 70 ? 'Good effort!' : pct >= 60 ? 'Keep studying' : 'More review needed';

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6 bg-mesh">
      <div className="glass rounded-3xl p-10 text-center max-w-sm w-full animate-scale-in"
        style={{ border: '1px solid var(--border2,var(--border))' }}>
        <div className="text-8xl font-black mb-1" style={{ color: scoreColor }}>{pct}%</div>
        <div className="text-3xl font-black mb-4" style={{ color: scoreColor }}>Grade {grade}</div>
        <p className="text-sm font-black mb-1" style={{ color: 'var(--text3)' }}>{score} / {total} correct</p>
        <p className="text-xs mb-6" style={{ color: 'var(--text3)' }}>{scoreMsg}</p>
        <div className="progress-bar" style={{ height: 10, borderRadius: 999 }}>
          <div className="progress-fill"
            style={{ width: `${pct}%`, background: scoreColor, transition: 'width 1.2s cubic-bezier(.34,1.2,.64,1)' }} />
        </div>
      </div>
      <div className="flex gap-3">
        <button onClick={onReview}
          className="glass px-6 py-3 rounded-2xl font-black"
          style={{ border: '1px solid var(--border2,var(--border))' }}>
          Review Answers
        </button>
        <button onClick={onBack}
          className="btn-accent px-6 py-3 rounded-2xl font-black shadow-xl">
          Back to Exams
        </button>
      </div>
    </div>
  );
}
