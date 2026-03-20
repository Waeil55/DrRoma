/**
 * MARIAM PRO  ExamList Component
 * Exam listing with stats, filters, and actions.
 */
import React, { useState, useMemo } from 'react';
import { CheckSquare, FilePlus, Eye, Target, Trash2, Printer, Loader2 } from 'lucide-react';
import { exportToPDF } from '../../utils/exportToPDF';

export default function ExamList({
  exams, setExams, docs, settings,
  onStartExam, onReview, onShowModal,
  addToast, analytics = {}
}) {
  const [filterDocId, setFilterDocId] = useState('all');
  const [sortMode, setSortMode] = useState('newest');
  const [exporting, setExporting] = useState(null);

  const handleExport = async (ex) => {
    setExporting(ex.id);
    await exportToPDF('exam', ex.questions, ex.title, addToast);
    setExporting(null);
  };

  const filteredExams = useMemo(() => {
    let list = filterDocId === 'all' ? exams : exams.filter(e => e.docId === filterDocId);
    if (sortMode === 'newest') list = [...list].sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0));
    else if (sortMode === 'oldest') list = [...list].sort((a, b) => (a.createdAt || 0) - (b.createdAt || 0));
    else if (sortMode === 'most') list = [...list].sort((a, b) => (b.questions?.length || 0) - (a.questions?.length || 0));
    return list;
  }, [exams, filterDocId, sortMode]);

  const scores = analytics.scores || [];

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar scroll-content"
      style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}>
      <div className="w-full p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl lg:text-3xl font-black flex items-center gap-3">
            <CheckSquare size={26} className="opacity-40" /> Exams
          </h1>
          <button onClick={onShowModal}
            className="btn-accent px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg">
            <FilePlus size={18} /> New from File
          </button>
        </div>

        {exams.length > 0 && (
          <>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {[
                ['Total Exams', exams.length, '#3b82f6'],
                ['Questions', exams.reduce((s, e) => s + (e.questions?.length || 0), 0), '#6366f1'],
                ['Avg Score', scores.length ? `${Math.round(scores.reduce((s, r) => s + r.pct, 0) / scores.length)}%` : '', '#10b981'],
                ['Attempts', scores.length, '#f59e0b'],
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
                {[...new Set(exams.map(e => e.docId))].map(id => {
                  const doc = docs?.find(d => d.id === id);
                  return doc ? <option key={id} value={id}>{doc.name.slice(0, 30)}</option> : null;
                })}
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
            <button onClick={onShowModal}
              className="btn-accent px-6 py-3 rounded-2xl font-black shadow-xl flex items-center gap-2 mx-auto">
              <FilePlus size={16} /> Generate from File
            </button>
          </div>
        ) : (
          filteredExams.map(ex => (
            <div key={ex.id}
              className="glass rounded-2xl p-5 border transition-all card-hover"
              style={ex.isBuiltin
                ? { borderColor: 'var(--success-border)', background: 'var(--success-bg)' }
                : { borderColor: 'var(--border2,var(--border))' }}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="font-black text-sm truncate">{ex.title}</h3>
                    {ex.isBuiltin && <span className="badge badge-success shrink-0"> Built-in</span>}
                  </div>
                  <p className="text-xs opacity-40 mt-0.5">
                    {ex.questions?.length} questions · {ex.isBuiltin ? 'Always available' : new Date(ex.createdAt).toLocaleDateString()}
                  </p>
                  {ex.docId && docs?.find(d => d.id === ex.docId) && (
                    <p className="text-xs opacity-30 mt-0.5 truncate"> {docs.find(d => d.id === ex.docId).name}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleExport(ex)} disabled={exporting === ex.id} title="Export as PDF"
                    className="w-9 h-9 glass rounded-xl flex items-center justify-center transition-colors hover:bg-[var(--info-bg)] hover:text-[var(--info)]">
                    {exporting === ex.id ? <Loader2 size={14} className="animate-spin" /> : <Printer size={18} />}
                  </button>
                  <button onClick={() => onReview(ex)} title="Review all questions"
                    className="w-9 h-9 glass rounded-xl flex items-center justify-center hover:bg-[var(--accent)]/10 transition-colors"
                    style={{ color: 'var(--accent)' }}>
                    <Eye size={18} />
                  </button>
                  <button onClick={() => onStartExam(ex)}
                    className="btn-accent px-4 py-2 rounded-xl text-xs font-black shadow-md flex items-center gap-2">
                    <Target size={18} /> Start
                  </button>
                  {!(ex.isBuiltin || ex.isBuiltIn) && (
                    <button onClick={() => setExams(p => p.filter(f => f.id !== ex.id))}
                      className="w-9 h-9 glass rounded-xl flex items-center justify-center transition-colors hover:bg-[var(--danger-bg)]"
                      style={{ color: 'var(--danger)' }}>
                      <Trash2 size={14} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
