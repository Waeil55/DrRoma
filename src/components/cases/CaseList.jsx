/**
 * MARIAM PRO  CaseList Component
 * Clinical case set listing with stats and actions.
 */
import React, { useState } from 'react';
import { Activity, FilePlus, Stethoscope, Trash2, Printer, Loader2 } from 'lucide-react';
import { exportToPDF } from '../../utils/exportToPDF';

export default function CaseList({ cases, setCases, docs, onStartCase, onShowModal, addToast }) {
  const [exporting, setExporting] = useState(null);

  const handleExport = async (set) => {
    setExporting(set.id);
    await exportToPDF('cases', set.questions, set.title, addToast);
    setExporting(null);
  };

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar scroll-content"
      style={{ touchAction: 'pan-y', WebkitOverflowScrolling: 'touch' }}>
      <div className="w-full p-6 lg:p-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl lg:text-3xl font-black flex items-center gap-3">
            <Activity size={26} className="opacity-40" /> Clinical Cases
          </h1>
          <button onClick={onShowModal}
            className="btn-accent px-4 py-2.5 rounded-xl text-xs font-black flex items-center gap-2 shadow-lg">
            <FilePlus size={18} /> New from File
          </button>
        </div>

        {cases.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              ['Case Sets', cases.length, '#8b5cf6'],
              ['Total Cases', cases.reduce((s, c) => s + (c.questions?.length || 0), 0), '#06b6d4'],
              ['Docs Used', [...new Set(cases.map(c => c.docId))].filter(Boolean).length, '#10b981'],
            ].map(([l, n, col]) => (
              <div key={l} className="glass rounded-2xl p-3 text-center border border-[color:var(--border2,var(--border))]">
                <p className="text-xl font-black" style={{ color: col }}>{n}</p>
                <p className="text-xs font-black uppercase tracking-widest opacity-50 mt-0.5">{l}</p>
              </div>
            ))}
          </div>
        )}

        {!cases.length ? (
          <div className="glass border-dashed border-2 border-[color:var(--border2,var(--border))] rounded-3xl p-12 text-center">
            <Activity size={48} className="mx-auto mb-4 opacity-20" />
            <p className="text-lg font-black opacity-40">No cases yet</p>
            <p className="text-sm opacity-30 mt-1 mb-6">Generate clinical cases from any medical document</p>
            <button onClick={onShowModal}
              className="btn-accent px-6 py-3 rounded-2xl font-black shadow-xl flex items-center gap-2 mx-auto">
              <FilePlus size={16} /> Generate from File
            </button>
          </div>
        ) : (
          cases.map(set => (
            <div key={set.id}
              className="glass rounded-2xl p-5 border border-[color:var(--border2,var(--border))] hover:border-[var(--accent)]/20 transition-all card-hover">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-sm truncate">{set.title}</h3>
                  <p className="text-xs opacity-40 mt-0.5">
                    {set.questions?.length} cases · {new Date(set.createdAt || 0).toLocaleDateString()}
                  </p>
                  {set.docId && docs?.find(d => d.id === set.docId) && (
                    <p className="text-xs opacity-30 mt-0.5 truncate"> {docs.find(d => d.id === set.docId).name}</p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <button onClick={() => handleExport(set)} disabled={exporting === set.id} title="Export PDF"
                    className="w-9 h-9 glass rounded-xl flex items-center justify-center transition-colors hover:bg-[var(--info-bg)]"
                    style={{ color: 'var(--info)' }}>
                    {exporting === set.id ? <Loader2 size={14} className="animate-spin" /> : <Printer size={18} />}
                  </button>
                  <button onClick={() => onStartCase(set)}
                    className="btn-accent px-4 py-2 rounded-xl text-xs font-black shadow-md flex items-center gap-2">
                    <Stethoscope size={18} /> Practice
                  </button>
                  {!(set.isBuiltin || set.isBuiltIn) && (
                    <button onClick={() => setCases(p => p.filter(x => x.id !== set.id))}
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
