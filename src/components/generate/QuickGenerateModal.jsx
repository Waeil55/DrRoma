/**
 * MARIAM PRO  QuickGenerateModal
 * Generate flashcards / exams / cases from any document.
 * Supports library pick or file upload, page range, count (1-1000), difficulty.
 */
import React, { useState, useRef, useEffect } from 'react';
import {
  X, Layers, CheckSquare, Activity, Loader2, FileText,
  BookOpen, FileUp, CheckCircle2, AlertCircle, Zap, Hash
} from 'lucide-react';
import { saveFile } from '../../services/db/fileOps';
import { extractUniversal } from '../../utils/fileExtractors';
import { runBgGeneration, bgClear } from '../../utils/bgTasks';

export default function QuickGenerateModal({
  type, docs, settings, onClose, onTaskStart, addToast,
  setFlashcards, setExams, setCases
}) {
  const [tab, setTab] = useState('library');
  const [selDocId, setSelDocId] = useState(docs[0]?.id || null);
  const [uploadedDoc, setUploadedDoc] = useState(null);
  const [uploading, setUploading] = useState(false);
  const [uploadPct, setUploadPct] = useState(0);
  const [entireFile, setEntireFile] = useState(true);
  const [startPage, setStartPage] = useState(1);
  const [endPage, setEndPage] = useState(1);
  const [count, setCount] = useState(20);
  const [difficulty, setDifficulty] = useState(2);
  const levels = ['Easy', 'Medium', 'Hard'];
  const inputRef = useRef(null);

  const activeDoc = tab === 'upload' ? uploadedDoc : (docs.find(d => d.id === selDocId) || null);

  useEffect(() => {
    if (activeDoc) { setStartPage(1); setEndPage(activeDoc.totalPages || 1); }
  }, [activeDoc?.id]);

  const handleFileUpload = async (files) => {
    const file = files[0]; if (!file) return;
    setUploading(true); setUploadPct(5);
    try {
      const data = await extractUniversal(file, p => setUploadPct(5 + p * 85));
      const id = 'tmp_' + Date.now();
      const doc = {
        id, name: file.name, size: file.size, fileCategory: data.fileCategory,
        totalPages: data.totalPages, createdAt: new Date().toISOString()
      };
      await saveFile(id, { ...data, name: file.name, size: file.size });
      setUploadedDoc(doc); setUploadPct(100);
      setStartPage(1); setEndPage(data.totalPages);
      addToast(`"${file.name}" loaded!`, 'success');
    } catch (e) { addToast(e.message, 'error'); }
    finally { setUploading(false); }
  };

  const typeConfig = {
    flashcards: { label: 'Flashcards', icon: Layers, color: '#6366f1' },
    exam: { label: 'Exam', icon: CheckSquare, color: '#3b82f6' },
    cases: { label: 'Cases', icon: Activity, color: '#8b5cf6' },
  };
  const tc = typeConfig[type] || typeConfig.flashcards;
  const Icon = tc.icon;

  const handleGo = () => {
    if (!activeDoc) { addToast('Select or upload a document first.', 'error'); return; }
    const sp = entireFile ? 1 : startPage;
    const ep = entireFile ? activeDoc.totalPages : endPage;
    const taskId = 'task_' + Date.now();
    const onSave = (data, tid) => {
      const now = new Date().toISOString();
      if (type === 'flashcards') {
        const cards = data.map(c => ({
          id: Date.now() + Math.random(), q: c.q, a: c.a, evidence: c.evidence,
          sourcePage: c.sourcePage, repetitions: 0, ef: 2.5, interval: 1, nextReview: Date.now(), lastReview: Date.now()
        }));
        setFlashcards(p => [...p, {
          id: taskId, docId: activeDoc.id, sourcePages: `${sp}-${ep}`,
          title: `Cards  ${activeDoc.name.slice(0, 30)}`, cards, createdAt: now
        }]);
        addToast(`${cards.length} flashcards saved! `, 'success');
      } else if (type === 'exam') {
        setExams(p => [...p, {
          id: taskId, docId: activeDoc.id, sourcePages: `${sp}-${ep}`,
          title: `Exam  ${activeDoc.name.slice(0, 30)}`, questions: data, createdAt: now
        }]);
        addToast(`${data.length} exam questions saved! `, 'success');
      } else if (type === 'cases') {
        setCases(p => [...p, {
          id: taskId, docId: activeDoc.id, sourcePages: `${sp}-${ep}`,
          title: `Cases  ${activeDoc.name.slice(0, 30)}`, questions: data, createdAt: now
        }]);
        addToast(`${data.length} cases saved! `, 'success');
      }
      bgClear(tid);
    };
    runBgGeneration({
      taskId, docId: activeDoc.id, docName: activeDoc.name,
      taskType: type, startPage: sp, endPage: ep, count,
      difficultyLevel: levels[difficulty - 1], settings, onSave
    });
    if (onTaskStart) onTaskStart(taskId);
    addToast(`Generating ${count} ${tc.label} runs in background!`, 'info');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-[9000] flex items-end sm:items-center justify-center p-0 sm:p-4"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(8px)' }}>
      <div className="w-full sm:max-w-lg glass rounded-t-3xl sm:rounded-3xl flex flex-col max-h-[92dvh] overflow-hidden shadow-2xl animate-slide-in">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-[color:var(--border2,var(--border))] shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl flex items-center justify-center" style={{ background: tc.color + '22' }}>
              <Icon size={20} style={{ color: tc.color }} />
            </div>
            <div>
              <h2 className="font-black text-sm">Generate {tc.label}</h2>
              <p className="text-xs opacity-50 font-bold">From any document · Runs in background</p>
            </div>
          </div>
          <button onClick={onClose} className="w-9 h-9 glass rounded-xl flex items-center justify-center opacity-60 hover:opacity-100"><X size={16} /></button>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-5 space-y-4 max-h-[70vh]">
          {/* Source tabs */}
          <div className="flex gap-1 p-1 glass rounded-2xl">
            {[['library', 'From Library', BookOpen], ['upload', 'Upload File', FileUp]].map(([id, lbl, TIcon]) => (
              <button key={id} onClick={() => setTab(id)}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-black transition-all
                  ${tab === id ? 'bg-[var(--accent)] text-white shadow-md' : 'opacity-50 hover:opacity-80'}`}>
                <TIcon size={16} />{lbl}
              </button>
            ))}
          </div>

          {/* Library picker */}
          {tab === 'library' && (
            <div className="space-y-2 max-h-48 overflow-y-auto custom-scrollbar">
              {!docs.length ? (
                <div className="text-center py-6 opacity-40">
                  <BookOpen size={28} className="mx-auto mb-2" />
                  <p className="text-xs font-bold">No documents in library</p>
                  <p className="text-xs mt-1">Switch to "Upload File" tab</p>
                </div>
              ) : docs.map(doc => (
                <button key={doc.id} onClick={() => setSelDocId(doc.id)}
                  className={`w-full flex items-center gap-3 p-3 rounded-2xl text-left transition-all border
                    ${selDocId === doc.id ? 'bg-[var(--accent)]/10 border-[var(--accent)]/40' : 'glass border-transparent hover:border-[color:var(--border2,var(--border))]'}`}>
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                    <FileText size={18} className="text-white opacity-80" />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate">{doc.name}</p>
                    <p className="text-xs opacity-40 font-mono">{doc.totalPages} pages</p>
                  </div>
                  {selDocId === doc.id && <CheckCircle2 size={16} className="text-[var(--accent)] shrink-0" />}
                </button>
              ))}
            </div>
          )}

          {/* File upload */}
          {tab === 'upload' && (
            <div>
              {!uploadedDoc ? (
                <div
                  onDragOver={e => e.preventDefault()}
                  onDrop={e => { e.preventDefault(); handleFileUpload(e.dataTransfer.files); }}
                  onClick={() => inputRef.current?.click()}
                  className="border-2 border-dashed border-[color:var(--border2,var(--border))] rounded-2xl p-8 text-center cursor-pointer hover:border-[var(--accent)]/50 transition-colors">
                  {uploading ? (
                    <div className="space-y-3">
                      <Loader2 size={28} className="mx-auto animate-spin" style={{ color: 'var(--accent)' }} />
                      <p className="text-xs font-bold">Processing</p>
                      <div className="progress-bar"><div className="progress-fill" style={{ width: `${uploadPct}%` }} /></div>
                    </div>
                  ) : (
                    <>
                      <FileUp size={32} className="mx-auto mb-3 opacity-30" />
                      <p className="text-sm font-black opacity-60">Drop file here or click to browse</p>
                      <p className="text-xs opacity-30 mt-1">PDF, Word, Excel, CSV, images, text</p>
                    </>
                  )}
                  <input ref={inputRef} type="file" className="hidden" accept=".pdf,.docx,.doc,.xlsx,.xls,.csv,.txt,.md,.jpg,.jpeg,.png,.webp"
                    onChange={e => handleFileUpload(e.target.files)} />
                </div>
              ) : (
                <div className="flex items-center gap-3 p-3 glass rounded-2xl" style={{ border: '1px solid var(--success-border)', background: 'var(--success-bg)' }}>
                  <CheckCircle2 size={18} className="shrink-0" style={{ color: 'var(--success)' }} />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-bold truncate">{uploadedDoc.name}</p>
                    <p className="text-xs opacity-40">{uploadedDoc.totalPages} pages extracted</p>
                  </div>
                  <button onClick={() => setUploadedDoc(null)} className="opacity-40 hover:opacity-80"><X size={14} /></button>
                </div>
              )}
            </div>
          )}

          {/* Page range */}
          {activeDoc && (
            <div className="glass rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-black uppercase tracking-widest opacity-60 flex items-center gap-2"><BookOpen size={16} />Page Range</h3>
                <span className="text-xs font-bold opacity-40">{activeDoc.totalPages} total</span>
              </div>
              <div className="flex gap-3 items-center">
                <button onClick={() => setEntireFile(true)}
                  className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all ${entireFile ? 'bg-[var(--accent)] text-white border-transparent' : 'glass border-[color:var(--border2,var(--border))] opacity-60'}`}>
                  Entire File
                </button>
                <button onClick={() => setEntireFile(false)}
                  className={`flex-1 py-2 rounded-xl text-xs font-black border transition-all ${!entireFile ? 'bg-[var(--accent)] text-white border-transparent' : 'glass border-[color:var(--border2,var(--border))] opacity-60'}`}>
                  Page Range
                </button>
              </div>
              {!entireFile && (
                <div className="flex gap-3">
                  {[['From', startPage, setStartPage], ['To', endPage, setEndPage]].map(([l, v, s]) => (
                    <div key={l} className="flex-1">
                      <label className="text-xs font-black uppercase tracking-widest opacity-40 block mb-1">{l}</label>
                      <input type="number" min={1} max={activeDoc.totalPages} value={v}
                        onChange={e => s(Math.max(1, Math.min(activeDoc.totalPages, Number(e.target.value))))}
                        className="w-full glass rounded-xl px-3 py-2.5 text-center font-mono font-bold text-sm outline-none focus:border-[var(--accent)] border border-[color:var(--border2,var(--border))] text-[var(--text)]" />
                    </div>
                  ))}
                </div>
              )}
              {entireFile && <p className="text-xs text-[var(--accent)] font-bold text-center">All {activeDoc.totalPages} pages selected</p>}
            </div>
          )}

          {/* Count */}
          <div className="glass rounded-2xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-xs font-black uppercase tracking-widest opacity-60 flex items-center gap-2"><Hash size={16} />Quantity</h3>
              <span className="text-lg font-black text-[var(--accent)]">{count}</span>
            </div>
            <input type="range" min="1" max="1000" value={count} onChange={e => setCount(+e.target.value)}
              className="w-full accent-[var(--accent)]" />
            <div className="flex gap-1.5 flex-wrap">
              {[5, 10, 20, 50, 100, 200, 500, 1000].map(n => (
                <button key={n} onClick={() => setCount(n)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-black transition-all ${count === n ? 'bg-[var(--accent)] text-white' : 'glass opacity-60 hover:opacity-100'}`}>{n}</button>
              ))}
            </div>
            {count > 50 && <p className="text-xs font-bold flex items-center gap-1.5" style={{ color: 'var(--warning)' }}><AlertCircle size={10} />Parallel AI  runs fully in background</p>}
          </div>

          {/* Difficulty */}
          <div className="glass rounded-2xl p-4 space-y-3">
            <h3 className="text-xs font-black uppercase tracking-widest opacity-60">Difficulty Level</h3>
            <div className="grid grid-cols-3 gap-2">
              {levels.map((l, i) => (
                <button key={l} onClick={() => setDifficulty(i + 1)}
                  className={`py-2.5 rounded-xl text-xs font-black border transition-all
                    ${difficulty === i + 1 ? 'text-white border-transparent shadow-md' : 'glass border-[color:var(--border2,var(--border))] opacity-60 hover:opacity-100'}`}
                  style={difficulty === i + 1 ? { background: ['#10b981', '#f59e0b', '#ef4444'][i] } : {}}>
                  {['', '', ''][i]} {l}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="p-5 border-t border-[color:var(--border2,var(--border))] shrink-0">
          <button onClick={handleGo} disabled={!activeDoc}
            className="w-full py-4 btn-accent rounded-2xl text-sm font-black uppercase tracking-widest disabled:opacity-40 flex items-center justify-center gap-3 shadow-xl">
            <Zap size={18} fill="currentColor" />
            Generate {count} {tc.label} in Background
          </button>
          <p className="text-xs text-center opacity-30 font-bold mt-2">You can switch pages  generation never stops</p>
        </div>
      </div>
    </div>
  );
}
