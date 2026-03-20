/**
 * MARIAM PRO  ExamReview Component
 * Shows all questions in an exam with correct answers highlighted.
 */
import React, { useState } from 'react';
import { ChevronLeft, CheckCircle2, Printer, Loader2 } from 'lucide-react';
import { exportToPDF } from '../../utils/exportToPDF';

export default function ExamReview({ exam, onBack, addToast }) {
  const [exporting, setExporting] = useState(false);

  const handleExport = async () => {
    setExporting(true);
    await exportToPDF('exam', exam.questions, exam.title, addToast);
    setExporting(false);
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar scroll-content"
      style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}>
      <div className="w-full p-6 lg:p-8">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={onBack}
            className="glass px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2">
            <ChevronLeft size={18} />Back
          </button>
          <h2 className="font-black text-lg">{exam.title}  Review</h2>
          <button onClick={handleExport} disabled={exporting}
            className="ml-auto btn-accent px-4 py-2 rounded-xl text-xs font-black flex items-center gap-2 shadow-md">
            {exporting ? <Loader2 size={16} className="animate-spin" /> : <Printer size={16} />}
            Print PDF
          </button>
        </div>
        <div className="space-y-4">
          {exam.questions.map((q, i) => (
            <div key={i} className="glass rounded-2xl p-5 border border-[color:var(--border2,var(--border))]">
              <p className="text-xs font-black text-[var(--accent)] mb-2">Q{i + 1}</p>
              <p className="text-sm font-bold mb-3">{q.q}</p>
              <div className="space-y-1.5">
                {(q.options || []).map((opt, oi) => (
                  <div key={oi}
                    className="px-3 py-2 rounded-xl text-xs font-medium flex items-center gap-2"
                    style={oi === q.correct
                      ? { background: 'var(--success-bg)', color: 'var(--success)', border: '1px solid var(--success-border)', fontWeight: 700 }
                      : { opacity: 0.5 }}>
                    <span className="font-black mr-1">{String.fromCharCode(65 + oi)}.</span>
                    {opt}
                    {oi === q.correct && (
                      <CheckCircle2 size={14} className="inline ml-auto shrink-0" style={{ color: 'var(--success)' }} />
                    )}
                  </div>
                ))}
              </div>
              {q.explanation && (
                <p className="text-xs opacity-50 mt-3 italic">{q.explanation}</p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
