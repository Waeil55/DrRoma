import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  BookOpen, Layers, CheckSquare, Settings, ChevronLeft, ChevronRight, Upload, MessageSquare,
  CheckCircle2, XCircle, BrainCircuit, Library, Trash2, Loader2, List, Send, ShieldAlert,
  GraduationCap, Save, X, BookA, Crosshair, PanelRightClose, PanelRightOpen, KeyRound, AlertCircle,
  FileUp, Target, Info, Trash, Sparkles, Activity, Stethoscope, Lightbulb, Baby, Play, Bookmark, History,
  Dna, Microscope, Pill, Thermometer, ClipboardList, Zap, Database, Search, FileText, BarChart2, Globe, Bot, Code, Palette, Type, Download, Mic,
  Moon, Sun, HelpCircle, Printer, Menu, FlaskConical, UserCircle2, TrendingUp, TrendingDown, Minus, Plus, ZoomIn, ZoomOut, Maximize,
  PlusCircle, RefreshCcw, Star, Award, Clock, Eye, EyeOff, ChevronUp, ChevronDown, Filter, SortAsc, Hash, Percent,
  AlertTriangle, CheckCheck, Clipboard, Share2, MoreVertical, Flame, Brain, Cpu, Layers3, Grid3x3, LayoutGrid
} from 'lucide-react';

// ─── INDEXED DB LAYER ─────────────────────────────────────────────────────────
const DB_NAME = 'MariamProDB_v10';
const STORE_PDFS = 'pdfs';
const STORE_STATE = 'appState';

const openDB = () => new Promise((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, 3);
  request.onupgradeneeded = (e) => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains(STORE_PDFS)) db.createObjectStore(STORE_PDFS);
    if (!db.objectStoreNames.contains(STORE_STATE)) db.createObjectStore(STORE_STATE);
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

const dbOp = async (store, mode, op) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const s = tx.objectStore(store);
    const req = op(s);
    if (req && req.onsuccess !== undefined) {
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    } else {
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    }
  });
};

const savePdfData = (id, data) => dbOp(STORE_PDFS, 'readwrite', s => { s.put(data, id); });
const getPdfData = (id) => dbOp(STORE_PDFS, 'readonly', s => s.get(id));
const deletePdfData = (id) => dbOp(STORE_PDFS, 'readwrite', s => { s.delete(id); });
const saveAppState = (key, data) => dbOp(STORE_STATE, 'readwrite', s => { s.put(data, key); });
const getAppState = (key) => dbOp(STORE_STATE, 'readonly', s => s.get(key));

// ─── LIBRARY LOADERS ──────────────────────────────────────────────────────────
const loadPdfJs = async () => {
  if (window.pdfjsLib) return window.pdfjsLib;
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
      resolve(window.pdfjsLib);
    };
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

// ─── AI ENGINE ────────────────────────────────────────────────────────────────
const callAI = async (prompt, expectJson, strictMode, apiKey, maxTokens = 16384, model = 'gpt-4o-mini') => {
  if (!apiKey?.trim()) throw new Error("OpenAI API Key is missing. Please add it in Settings.");

  const sysPrompt = strictMode
    ? "You are a highly strict, elite medical AI data extractor. You MUST use ONLY the text provided. Do not hallucinate. NO OUTSIDE KNOWLEDGE. If info is not in the text, state 'Information not found in the selected pages.' or return empty array."
    : "You are an elite, hyper-intelligent medical AI assistant. You possess vast clinical knowledge. When given context from a document, prioritize it heavily. If the document lacks the specific answer, synthesize a brilliant advanced answer using your internal medical knowledge, clearly delineating what is from the text versus general medical science. Always be incredibly smart, helpful, and detailed.";

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey.trim()}` },
    body: JSON.stringify({
      model,
      messages: [
        { role: 'system', content: sysPrompt + (expectJson ? ' You MUST respond in strictly valid JSON format. No markdown wrappers.' : '') },
        { role: 'user', content: prompt }
      ],
      response_format: expectJson ? { type: 'json_object' } : { type: 'text' },
      max_tokens: maxTokens,
      temperature: strictMode ? 0.1 : 0.7,
      stream: false
    })
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(`API Error: ${errData.error?.message || response.statusText}`);
  }
  const data = await response.json();
  return data.choices[0].message.content.trim();
};

const parseJsonSafe = (text) => {
  let cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const first = cleaned.indexOf('{'), last = cleaned.lastIndexOf('}');
  if (first !== -1 && last !== -1) cleaned = cleaned.substring(first, last + 1);
  return JSON.parse(cleaned);
};

// ─── TURBO PARALLEL ENGINE ────────────────────────────────────────────────────
const runParallel = async (tasks, concurrency = 5, onProgress) => {
  const results = [];
  for (let i = 0; i < tasks.length; i += concurrency) {
    const batch = tasks.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(batch.map(fn => fn()));
    results.push(...batchResults);
    if (onProgress) onProgress(Math.min(i + concurrency, tasks.length), tasks.length);
  }
  return results;
};

// ─── UTILITY HOOKS ────────────────────────────────────────────────────────────
const useLocalState = (key, defaultVal) => {
  const [val, setVal] = useState(defaultVal);
  return [val, setVal];
};

const useDebounce = (value, delay) => {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
};

// ─── LAB TABLE COMPONENTS ────────────────────────────────────────────────────
function LabResultRow({ test, result, range, units, flag, note }) {
  const isLow = flag === 'L', isHigh = flag === 'H', isAbnormal = isLow || isHigh;
  return (
    <tr className={`border-b border-gray-100 dark:border-zinc-800/60 transition-colors ${isAbnormal ? 'bg-red-50 dark:bg-red-900/10' : 'bg-white dark:bg-zinc-900'}`}>
      <td className="py-2 px-3 text-sm font-medium text-gray-800 dark:text-zinc-200">
        {test}
        {note && <span className="block text-xs text-gray-500 dark:text-zinc-400 mt-0.5">{note}</span>}
      </td>
      <td className="py-2 px-3 text-sm text-center whitespace-nowrap">
        <span className={`font-semibold inline-flex items-center gap-1 ${isLow ? 'text-blue-600 dark:text-blue-400' : isHigh ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-zinc-300'}`}>
          {result}
          {flag && (
            <span className={`text-xs font-bold px-1.5 py-0.5 rounded-md ${isLow ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'}`}>{flag}</span>
          )}
        </span>
      </td>
      <td className="py-2 px-3 text-sm text-center text-gray-500 dark:text-zinc-400 font-mono">{range}</td>
      <td className="py-2 px-3 text-xs text-center text-gray-400 dark:text-zinc-500 font-mono">{units}</td>
    </tr>
  );
}

function LabTable({ rows }) {
  if (!rows || rows.length === 0) return null;
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-sm mb-4 bg-white dark:bg-zinc-900">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 dark:bg-zinc-800/50 border-b border-gray-200 dark:border-zinc-800">
            <th className="py-2 px-3 text-left text-xs font-semibold text-gray-500 dark:text-zinc-400 w-2/5">Test</th>
            <th className="py-2 px-3 text-center text-xs font-semibold text-gray-500 dark:text-zinc-400 w-1/5">Result</th>
            <th className="py-2 px-3 text-center text-xs font-semibold text-gray-500 dark:text-zinc-400 w-1/5">Range</th>
            <th className="py-2 px-3 text-center text-xs font-semibold text-gray-500 dark:text-zinc-400 w-1/5">Units</th>
          </tr>
        </thead>
        <tbody>{rows.map((row, i) => <LabResultRow key={i} {...row} />)}</tbody>
      </table>
    </div>
  );
}

// ─── SMART PROGRESS RING ─────────────────────────────────────────────────────
function ProgressRing({ value, max, size = 48, stroke = 4, color = 'var(--accent-color)' }) {
  const r = (size - stroke) / 2;
  const circ = 2 * Math.PI * r;
  const pct = max ? Math.min(value / max, 1) : 0;
  return (
    <svg width={size} height={size} className="-rotate-90">
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="currentColor" strokeWidth={stroke} className="text-gray-200 dark:text-zinc-800"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth={stroke} strokeDasharray={circ} strokeDashoffset={circ * (1 - pct)} strokeLinecap="round" style={{ transition: 'stroke-dashoffset 0.5s ease' }}/>
    </svg>
  );
}

// ─── TOAST NOTIFICATION SYSTEM ───────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((msg, type = 'success', duration = 3000) => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), duration);
  }, []);
  return { toasts, addToast };
}

function ToastContainer({ toasts }) {
  return (
    <div className="fixed top-4 right-4 z-[999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`px-4 py-3 rounded-xl text-sm font-medium shadow-lg border flex items-center gap-2 animate-slide-in pointer-events-auto ${t.type === 'success' ? 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800' : t.type === 'error' ? 'bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800' : 'bg-white dark:bg-zinc-900 text-gray-800 dark:text-zinc-200 border-gray-200 dark:border-zinc-800'}`}>
          {t.type === 'success' ? <CheckCircle2 size={16}/> : t.type === 'error' ? <AlertCircle size={16}/> : <Info size={16}/>}
          {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── PATIENT CASES PANEL ──────────────────────────────────────────────────────
function PanelPatientCases({ activeDoc, settings, setNotes, setExams, currentPage, addToast }) {
  const [status, setStatus] = useState({ loading: false, msg: '', err: false });
  const [cases, setCases] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [startPage, setStartPage] = useState(currentPage);
  const [endPage, setEndPage] = useState(Math.min(currentPage + 4, activeDoc?.totalPages || currentPage));
  const [caseCount, setCaseCount] = useState(5);
  const [progress, setProgress] = useState({ done: 0, total: 0 });

  useEffect(() => {
    setStartPage(currentPage);
    setEndPage(Math.min(currentPage + 4, activeDoc?.totalPages || currentPage));
  }, [currentPage, activeDoc?.totalPages]);

  const handleGenerate = async () => {
    setStatus({ loading: true, msg: 'Indexing clinical context...', err: false });
    setCases(null); setSelectedCase(null); setProgress({ done: 0, total: 0 });
    try {
      const pdfData = await getPdfData(activeDoc.id);
      const pagesText = pdfData?.pagesText || {};
      let text = '';
      for (let i = Number(startPage); i <= Number(endPage); i++) {
        if (pagesText[i]) text += `[Page ${i}]\n${pagesText[i]}\n\n`;
      }
      if (!text.trim() || text.length < 20) throw new Error("Not enough readable text found on selected pages.");

      const CHUNK_SIZE = 2;
      const numChunks = Math.ceil(caseCount / CHUNK_SIZE);
      setProgress({ done: 0, total: numChunks });

      const tasks = Array.from({ length: numChunks }, (_, i) => {
        const countForChunk = (i === numChunks - 1 && caseCount % CHUNK_SIZE !== 0) ? caseCount % CHUNK_SIZE : CHUNK_SIZE;
        return () => callAI(`You are an elite medical educator. Based ONLY on the diseases in the text, generate EXACTLY ${countForChunk} highly realistic USMLE Step 2/3 level patient cases.
        Each case MUST have:
        1. Long comprehensive vignette (Age, Sex, CC, HPI, PMH, ROS, Vitals, PE)
        2. Exactly 15 lab rows across panels (CBC, BMP, disease-specific)
        3. High-quality MCQ based on the vignette

        EXACT JSON format:
        {
          "cases": [
            {
              "id": "unique_id",
              "title": "Case Title",
              "vignette": "Detailed vignette...",
              "diagnosis": "Primary diagnosis",
              "keyFindings": ["finding1","finding2","finding3"],
              "labPanels": [
                { "panelName": "CBC", "rows": [{"test":"WBC","result":"12.5","flag":"H","range":"4.5-11.0","units":"K/uL"}] }
              ],
              "examQuestion": {
                "q": "Question text?",
                "options": ["A","B","C","D","E"],
                "correct": 0,
                "explanation": "Detailed explanation"
              }
            }
          ]
        }
        DOCUMENT TEXT:\n${text}`, true, false, settings.apiKey, 16384);
      });

      let allCases = [];
      const results = await runParallel(tasks, 5, (done, total) => {
        setProgress({ done, total });
        setStatus({ loading: true, msg: `Generating cases... ${done}/${total} batches`, err: false });
      });

      for (const res of results) {
        if (res.status === 'fulfilled') {
          try {
            const parsed = parseJsonSafe(res.value);
            if (parsed.cases) allCases = [...allCases, ...parsed.cases];
          } catch (e) { console.warn('Chunk parse failed', e); }
        }
      }

      if (allCases.length === 0) throw new Error("Failed to generate any cases. Check API key or try fewer pages.");
      allCases = allCases.slice(0, caseCount);
      setCases(allCases);
      setStatus({ loading: false, msg: `Generated ${allCases.length} advanced patient cases.`, err: false });
      addToast(`${allCases.length} cases ready!`, 'success');
    } catch (e) {
      setStatus({ loading: false, msg: e.message || 'Generation failed.', err: true });
      addToast(e.message || 'Generation failed', 'error');
    }
  };

  const saveAllAsNotes = () => {
    if (!cases) return;
    const newNotes = cases.map((c, i) => ({
      id: Date.now().toString() + i,
      docId: activeDoc.id,
      title: `Patient Case: ${c.title}`,
      content: [
        `PATIENT VIGNETTE\n${c.vignette}`,
        `\nDIAGNOSIS: ${c.diagnosis}`,
        `\nKEY FINDINGS:\n${c.keyFindings.map(f => `• ${f}`).join('\n')}`,
        ...(c.labPanels || []).map(panel =>
          `\n${panel.panelName.toUpperCase()}\n` +
          panel.rows.map(r => `${r.test}: ${r.result}${r.flag ? ` (${r.flag})` : ''} | Range: ${r.range} ${r.units}`).join('\n')
        ),
        `\nQUESTION:\n${c.examQuestion?.q}\nAnswer: ${c.examQuestion?.options[c.examQuestion?.correct]}\nExplanation: ${c.examQuestion?.explanation}`
      ].join('\n')
    }));
    setNotes(prev => [...prev, ...newNotes]);
    addToast(`${newNotes.length} cases saved to Clinical Notes Vault!`, 'success');
  };

  const saveAllAsExam = () => {
    if (!cases) return;
    const questions = cases.map(c => ({
      vignette: c.vignette,
      q: c.examQuestion.q,
      options: c.examQuestion.options,
      correct: c.examQuestion.correct,
      explanation: c.examQuestion.explanation,
      labPanels: c.labPanels || []
    }));
    const newExam = {
      id: Date.now().toString(),
      docId: activeDoc.id,
      sourcePages: `${startPage}-${endPage}`,
      title: `Patient Case Block (${questions.length} Qs)`,
      questions,
      createdAt: new Date().toISOString()
    };
    setExams(prev => [...prev, newExam]);
    addToast(`Exam block with ${questions.length} questions created!`, 'success');
  };

  if (selectedCase) {
    return (
      <div className="flex-1 overflow-y-auto p-6">
        <button onClick={() => setSelectedCase(null)} className="flex items-center gap-2 text-[var(--accent-color)] text-sm font-semibold mb-6 hover:opacity-80 transition-opacity">
          <ChevronLeft size={18}/> Back to Cases
        </button>
        <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-6 mb-6 shadow-sm">
          <span className="text-xs font-semibold text-[var(--accent-color)] bg-[var(--accent-color)]/10 px-2.5 py-1 rounded-md mb-3 inline-block">Primary Diagnosis</span>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-1">{selectedCase.title}</h2>
          <p className="text-base font-medium text-gray-600 dark:text-zinc-400 mb-4">{selectedCase.diagnosis}</p>
          <div className="bg-gray-50 dark:bg-zinc-950 p-4 rounded-lg border border-gray-100 dark:border-zinc-800">
             <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">{selectedCase.vignette}</p>
          </div>
        </div>
        {selectedCase.labPanels?.length > 0 && (
          <div className="mb-6">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white mb-4 flex items-center gap-2"><FlaskConical size={16} className="text-blue-500"/> Laboratory Results</h3>
            {selectedCase.labPanels.map((panel, pi) => (
              <div key={pi} className="mb-4">
                <h4 className="text-xs font-semibold text-gray-500 dark:text-zinc-400 mb-2">{panel.panelName}</h4>
                <LabTable rows={panel.rows}/>
              </div>
            ))}
          </div>
        )}
        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-xl p-6 mb-4">
          <h3 className="text-sm font-semibold text-emerald-700 dark:text-emerald-400 mb-4 flex items-center gap-2"><CheckSquare size={16}/> Exam Question</h3>
          <p className="text-sm font-medium text-gray-900 dark:text-white mb-4">{selectedCase.examQuestion.q}</p>
          <div className="space-y-2 mb-4">
            {selectedCase.examQuestion.options.map((opt, i) => (
              <div key={i} className={`text-sm p-3 rounded-lg border ${i === selectedCase.examQuestion.correct ? 'bg-emerald-100 dark:bg-emerald-900/30 border-emerald-300 dark:border-emerald-700 text-emerald-800 dark:text-emerald-300 font-medium' : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-700 dark:text-zinc-300'}`}>
                <span className="font-mono text-gray-400 dark:text-zinc-500 mr-2">{String.fromCharCode(65+i)}.</span>{opt}
              </div>
            ))}
          </div>
          <div className="bg-white/50 dark:bg-black/20 p-4 rounded-lg border border-emerald-200/50 dark:border-emerald-800/50">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 block mb-2">Explanation</span>
            <p className="text-sm text-gray-700 dark:text-zinc-300 leading-relaxed">{selectedCase.examQuestion.explanation}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-rose-100 dark:bg-rose-900/20 flex items-center justify-center">
          <Zap size={20} className="text-rose-500"/>
        </div>
        <div>
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">Case Generator</h2>
          <p className="text-xs text-gray-500 dark:text-zinc-400">Generate realistic clinical vignettes</p>
        </div>
      </div>

      {!cases && (
        <div className="flex flex-col gap-6">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm">
            <div className="flex justify-between items-center mb-4">
               <label className="text-sm font-medium text-gray-700 dark:text-zinc-300">Target Volume</label>
               <span className="text-sm font-semibold text-[var(--accent-color)]">{caseCount} Cases</span>
            </div>
            <input type="range" min="1" max="100" value={caseCount} onChange={e => setCaseCount(parseInt(e.target.value))} className="w-full mb-6"/>
            
            <label className="text-sm font-medium text-gray-700 dark:text-zinc-300 mb-3 block">Extraction Range</label>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <label className="text-xs text-gray-500 dark:text-zinc-400 mb-1 block">From Page</label>
                <input type="number" min={1} max={activeDoc?.totalPages || 1} value={startPage} onChange={e => setStartPage(Number(e.target.value))}
                  className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-center text-sm font-medium outline-none focus:border-[var(--accent-color)]"/>
              </div>
              <span className="text-gray-400 mt-5">→</span>
              <div className="flex-1">
                <label className="text-xs text-gray-500 dark:text-zinc-400 mb-1 block">To Page</label>
                <input type="number" min={1} max={activeDoc?.totalPages || 1} value={endPage} onChange={e => setEndPage(Number(e.target.value))}
                  className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-center text-sm font-medium outline-none focus:border-[var(--accent-color)]"/>
              </div>
            </div>
          </div>
          
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800/30 rounded-xl p-4">
            <div className="flex items-start gap-3">
              <Info size={16} className="text-blue-500 mt-0.5 shrink-0"/>
              <div>
                <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 mb-1">What this generates</p>
                <p className="text-xs text-blue-600 dark:text-blue-400 leading-relaxed">Realistic patient vignettes with complete lab panels in table format with flags for abnormal values, plus MCQs.</p>
              </div>
            </div>
          </div>

          {status.loading && progress.total > 0 && (
            <div className="bg-white dark:bg-zinc-900 rounded-xl p-4 border border-gray-200 dark:border-zinc-800 shadow-sm">
              <div className="flex justify-between items-center mb-2">
                <span className="text-xs font-medium text-gray-600 dark:text-zinc-400">Progress</span>
                <span className="text-xs font-semibold text-[var(--accent-color)]">{progress.done} / {progress.total}</span>
              </div>
              <div className="w-full bg-gray-100 dark:bg-zinc-800 rounded-full h-2">
                <div className="bg-[var(--accent-color)] h-2 rounded-full transition-all duration-300" style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}/>
              </div>
            </div>
          )}

          <button onClick={handleGenerate} disabled={status.loading}
            className="w-full py-3 bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/90 disabled:opacity-50 text-white rounded-xl text-sm font-semibold transition-all shadow-sm flex items-center justify-center gap-2">
            {status.loading ? <Loader2 size={16} className="animate-spin"/> : <Zap size={16}/>}
            {status.loading ? status.msg : 'Generate Cases'}
          </button>
        </div>
      )}

      {status.msg && !status.loading && (
        <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 border ${status.err ? 'bg-red-50 dark:bg-red-900/10 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800/30' : 'bg-emerald-50 dark:bg-emerald-900/10 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30'}`}>
          {status.err ? <AlertCircle size={16}/> : <CheckCircle2 size={16}/>}
          {status.msg}
        </div>
      )}

      {cases && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-gray-800 dark:text-white flex items-center gap-2">
              <CheckCircle2 size={16} className="text-emerald-500"/> {cases.length} Cases Ready
            </h3>
            <button onClick={() => { setCases(null); setStatus({ loading: false, msg: '', err: false }); }}
              className="text-xs font-medium text-gray-500 hover:text-red-500 flex items-center gap-1 transition-colors">
              <X size={14}/> Clear
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3">
            <button onClick={saveAllAsNotes} className="flex flex-col items-center justify-center gap-2 py-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl hover:border-blue-500 hover:text-blue-500 transition-colors shadow-sm">
              <BookA size={20} className="text-blue-500"/>
              <span className="text-xs font-medium text-gray-700 dark:text-zinc-300">Save to Notes</span>
            </button>
            <button onClick={saveAllAsExam} className="flex flex-col items-center justify-center gap-2 py-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl hover:border-emerald-500 hover:text-emerald-500 transition-colors shadow-sm">
              <GraduationCap size={20} className="text-emerald-500"/>
              <span className="text-xs font-medium text-gray-700 dark:text-zinc-300">Create Exam</span>
            </button>
          </div>
          
          <div className="space-y-3">
            {cases.map((c, i) => (
              <button key={c.id || i} onClick={() => setSelectedCase(c)}
                className="w-full text-left bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-[var(--accent-color)] rounded-xl p-4 transition-all shadow-sm">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs font-semibold text-[var(--accent-color)] bg-[var(--accent-color)]/10 px-2 py-0.5 rounded-md">{c.diagnosis}</span>
                    </div>
                    <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-1">{c.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2">{c.vignette}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-400 mt-1 shrink-0"/>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── SMART STUDY ANALYTICS ────────────────────────────────────────────────────
function StudyAnalytics({ flashcards, exams, notes }) {
  const totalCards = flashcards.reduce((s, set) => s + (set.cards?.length || 0), 0);
  const masteredCards = flashcards.reduce((s, set) => s + (set.cards?.filter(c => c.ef >= 2.5 && c.repetitions >= 3)?.length || 0), 0);
  const dueCards = flashcards.reduce((s, set) => s + (set.cards?.filter(c => c.nextReview <= Date.now())?.length || 0), 0);
  const avgScore = exams.length > 0 ? Math.round(exams.reduce((s, e) => s + (e.lastScore || 0), 0) / exams.length) : 0;

  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
      {[
        { label: 'Total Cards', value: totalCards, icon: Layers, color: 'text-blue-500', bg: 'bg-blue-500/10' },
        { label: 'Mastered', value: masteredCards, icon: Star, color: 'text-yellow-500', bg: 'bg-yellow-500/10' },
        { label: 'Due Today', value: dueCards, icon: Clock, color: 'text-red-500', bg: 'bg-red-500/10' },
        { label: 'Avg Score', value: `${avgScore}%`, icon: Award, color: 'text-emerald-500', bg: 'bg-emerald-500/10' },
      ].map(({ label, value, icon: Icon, color, bg }) => (
        <div key={label} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl p-5 flex items-center gap-4 shadow-sm">
          <div className={`w-12 h-12 rounded-lg ${bg} flex items-center justify-center shrink-0`}>
            <Icon size={20} className={color}/>
          </div>
          <div>
            <p className="text-2xl font-bold text-gray-900 dark:text-white">{value}</p>
            <p className="text-xs font-medium text-gray-500 dark:text-zinc-400 mt-0.5">{label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [openDocs, setOpenDocs] = useState([]);
  const [activeDocId, setActiveDocId] = useState(null);
  const [docPages, setDocPages] = useState({});
  const [flashcards, setFlashcards] = useState([]);
  const [exams, setExams] = useState([]);
  const [notes, setNotes] = useState([]);
  const [chatSessions, setChatSessions] = useState([]);
  const [userSettings, setUserSettings] = useState({ apiKey: '', strictMode: true, theme: 'system', fontSize: 'medium', accentColor: 'indigo' });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentView, setCurrentView] = useState('library');
  const [rightPanelTab, setRightPanelTab] = useState('generate');
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [online, setOnline] = useState(navigator.onLine);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({ x: 0, y: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [genFromSelection, setGenFromSelection] = useState('');
  const [aiWidth, setAiWidth] = useState(400);
  const [isResizing, setIsResizing] = useState(false);
  const { toasts, addToast } = useToast();

  useEffect(() => {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'viewport'; document.head.appendChild(meta); }
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedDocs, savedCards, savedExams, savedNotes, savedChats, savedSettings, savedOpen, savedPages] = await Promise.all([
          getAppState('docs'), getAppState('flashcards'), getAppState('exams'), getAppState('notes'),
          getAppState('chats'), getAppState('settings'), getAppState('openDocs'), getAppState('docPages')
        ]);
        if (savedDocs) setDocuments(savedDocs);
        if (savedCards) setFlashcards(savedCards);
        if (savedExams) setExams(savedExams);
        if (savedNotes) setNotes(savedNotes);
        if (savedChats) setChatSessions(savedChats);
        if (savedSettings) setUserSettings(savedSettings);
        if (savedOpen) setOpenDocs(savedOpen);
        if (savedPages) setDocPages(savedPages);
      } catch (e) { console.warn('Storage read error', e); }
      finally { setIsLoaded(true); }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const timer = setTimeout(async () => {
      try {
        const docsToSave = documents.map(d => { const c = { ...d }; delete c.pagesText; return c; });
        await Promise.all([
          saveAppState('docs', docsToSave), saveAppState('flashcards', flashcards),
          saveAppState('exams', exams), saveAppState('notes', notes),
          saveAppState('chats', chatSessions), saveAppState('settings', userSettings),
          saveAppState('openDocs', openDocs), saveAppState('docPages', docPages)
        ]);
      } catch (e) { console.warn('Storage write error', e); }
    }, 500);
    return () => clearTimeout(timer);
  }, [documents, flashcards, exams, notes, chatSessions, userSettings, openDocs, docPages, isLoaded]);

  const prefersDark = typeof window !== 'undefined' && window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  const isDark = userSettings.theme === 'dark' || (userSettings.theme === 'system' && prefersDark);
  const fontSizeMap = { small: '14px', medium: '16px', large: '18px', xl: '20px', xxl: '24px', xxxl: '28px' };

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) { root.classList.add('dark'); root.style.setProperty('color-scheme', 'dark'); }
    else { root.classList.remove('dark'); root.style.setProperty('color-scheme', 'light'); }
  }, [isDark]);

  useEffect(() => { document.documentElement.style.fontSize = fontSizeMap[userSettings.fontSize] || '16px'; }, [userSettings.fontSize]);

  useEffect(() => {
    const colors = { indigo: { hex: '#6366f1', rgb: '99, 102, 241' }, purple: { hex: '#a855f7', rgb: '168, 85, 247' }, blue: { hex: '#3b82f6', rgb: '59, 130, 246' }, emerald: { hex: '#10b981', rgb: '16, 185, 129' }, rose: { hex: '#f43f5e', rgb: '244, 63, 94' } };
    const color = colors[userSettings.accentColor] || colors.indigo;
    document.documentElement.style.setProperty('--accent-color', color.hex);
    document.documentElement.style.setProperty('--accent-color-rgb', color.rgb);
  }, [userSettings.accentColor]);

  useEffect(() => {
    const updateOnline = () => setOnline(navigator.onLine);
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    return () => { window.removeEventListener('online', updateOnline); window.removeEventListener('offline', updateOnline); };
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === '?' && !e.shiftKey && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') setShowShortcuts(true);
      if (e.key === 'Escape') setShowShortcuts(false);
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  useEffect(() => {
    const handleMove = (e) => {
      if (!isResizing) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      const newWidth = Math.max(300, Math.min(window.innerWidth - clientX, window.innerWidth - 300));
      setAiWidth(newWidth);
    };
    const handleUp = () => { if (isResizing) setIsResizing(false); };
    if (isResizing) {
      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleUp);
      document.body.style.userSelect = 'none';
    } else {
      document.body.style.userSelect = '';
    }
    return () => {
      document.removeEventListener('mousemove', handleMove);
      document.removeEventListener('mouseup', handleUp);
      document.removeEventListener('touchmove', handleMove);
      document.removeEventListener('touchend', handleUp);
      document.body.style.userSelect = '';
    };
  }, [isResizing]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== 'application/pdf') return;
    setIsUploading(true);
    setUploadProgress(10);
    try {
      const arrayBuffer = await file.arrayBuffer();
      setUploadProgress(30);
      const pdfjsLib = await loadPdfJs();
      setUploadProgress(50);
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages;
      const pagesText = {};
      for (let i = 1; i <= totalPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          pagesText[i] = textContent.items.map(s => s.str).join(' ');
          page.cleanup();
        } catch (e) { pagesText[i] = ''; }
        setUploadProgress(50 + Math.floor((i / totalPages) * 40));
      }
      try { await loadingTask.destroy(); } catch (e) {}
      const id = Date.now().toString();
      const newDoc = { id, name: file.name, totalPages, progress: 1, addedAt: new Date().toISOString() };
      await savePdfData(id, { buffer: arrayBuffer, pagesText });
      setDocuments(prev => [...prev, newDoc]);
      setOpenDocs(prev => prev.includes(id) ? prev : [...prev, id]);
      setActiveDocId(id);
      setDocPages(prev => ({ ...prev, [id]: 1 }));
      setCurrentView('reader');
      setRightPanelTab('generate');
      setRightPanelOpen(true);
      addToast(`"${file.name}" uploaded successfully!`, 'success');
    } catch (error) {
      console.error(error);
      addToast('Upload failed. File may be corrupted or too large.', 'error');
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (event.target) event.target.value = '';
    }
  };

  const closeDoc = (id) => {
    setOpenDocs(prev => prev.filter(d => d !== id));
    if (activeDocId === id) {
      const newActive = openDocs.filter(d => d !== id)[0] || null;
      setActiveDocId(newActive);
      if (!newActive && currentView === 'reader') setCurrentView('library');
    }
  };

  const deleteDocument = async (id, e) => {
    if (e) e.stopPropagation();
    await deletePdfData(id);
    setDocuments(prev => prev.filter(d => d.id !== id));
    setFlashcards(prev => prev.filter(f => f.docId !== id));
    setExams(prev => prev.filter(ex => ex.docId !== id));
    setNotes(prev => prev.filter(n => n.docId !== id));
    closeDoc(id);
    addToast('Document deleted', 'info');
  };

  const activeDoc = documents.find(d => d.id === activeDocId);
  const filteredDocuments = searchQuery ? documents.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase())) : documents;

  if (!isLoaded) {
    return (
      <div className="flex flex-col h-screen w-screen items-center justify-center bg-gray-50 dark:bg-zinc-950">
        <div className="relative mb-6">
          <div className="w-16 h-16 rounded-xl bg-[var(--accent-color)]/10 flex items-center justify-center">
            <BrainCircuit className="w-8 h-8 text-[var(--accent-color)] animate-pulse"/>
          </div>
        </div>
        <span className="text-sm font-semibold text-gray-500 dark:text-zinc-400 tracking-wider">Loading workspace...</span>
      </div>
    );
  }

  return (
    <>
      <style>{`:root { --bg-root: ${isDark ? '#09090b' : '#f9fafb'}; --text-main: ${isDark ? '#f4f4f5' : '#18181b'}; } html, body, #root { margin: 0; padding: 0; width: 100vw; height: 100vh; overflow: hidden; background-color: var(--bg-root); color: var(--text-main); font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; } * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; } .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; } .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(156, 163, 175, 0.5); border-radius: 4px; } .pdf-text-layer { position: absolute; inset: 0; overflow: hidden; opacity: 1; line-height: 1; } .pdf-text-layer span { position: absolute; color: transparent; transform-origin: 0% 0%; white-space: pre; cursor: text; } .pdf-text-layer ::selection { background: rgba(var(--accent-color-rgb), 0.3); } canvas { width: 100% !important; height: auto !important; display: block; } @keyframes slide-in { from { opacity: 0; transform: translateY(-10px); } to { opacity: 1; transform: translateY(0); } } .animate-slide-in { animation: slide-in 0.2s ease-out; }`}</style>

      <ToastContainer toasts={toasts}/>

      <div className="flex flex-col md:flex-row h-screen w-screen overflow-hidden bg-gray-50 dark:bg-zinc-950">
        
        {/* Navigation - Bottom on Mobile, Left on Desktop */}
        <nav className="fixed bottom-0 left-0 w-full h-16 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 z-50 flex items-center justify-around px-2
                        md:relative md:w-20 md:h-full md:flex-col md:justify-start md:border-t-0 md:border-r md:px-0 md:py-6 gap-2">
          
          <div className="hidden md:flex w-12 h-12 rounded-xl bg-[var(--accent-color)] items-center justify-center text-white mb-6 cursor-pointer shadow-sm" onClick={() => setCurrentView('library')}>
            <BrainCircuit size={24}/>
          </div>
          
          <SidebarBtn icon={BookOpen} label="Library" active={currentView === 'library'} onClick={() => setCurrentView('library')}/>
          <SidebarBtn icon={Layers} label="Cards" active={currentView === 'flashcards'} onClick={() => setCurrentView('flashcards')}/>
          <SidebarBtn icon={GraduationCap} label="Exams" active={currentView === 'exams'} onClick={() => setCurrentView('exams')}/>
          <SidebarBtn icon={MessageSquare} label="Chat" active={currentView === 'chat'} onClick={() => setCurrentView('chat')}/>
          
          {activeDocId && (
            <>
              <div className="hidden md:block w-8 h-px bg-gray-200 dark:bg-zinc-800 my-2 mx-auto"/>
              <SidebarBtn icon={BookOpen} label="Reader" active={currentView === 'reader'} onClick={() => setCurrentView('reader')} highlight/>
            </>
          )}
          
          <div className="md:mt-auto">
            <SidebarBtn icon={Settings} label="Config" active={currentView === 'settings'} onClick={() => setCurrentView('settings')}/>
          </div>
        </nav>

        {/* Main Content Area */}
        <main className="flex-1 flex flex-col relative min-w-0 h-full overflow-hidden pb-16 md:pb-0">
          {isUploading && (
            <div className="absolute top-0 left-0 w-full h-1 bg-gray-200 dark:bg-zinc-800 z-50">
              <div className="h-full bg-[var(--accent-color)] transition-all duration-300" style={{ width: `${uploadProgress}%` }}/>
            </div>
          )}

          <div className={currentView === 'library' ? 'flex-1 overflow-y-auto h-full' : 'hidden'}>
            <LibraryView documents={filteredDocuments} onUpload={handleFileUpload} onOpen={(id) => { setOpenDocs(prev => prev.includes(id) ? prev : [...prev, id]); setActiveDocId(id); setCurrentView('reader'); }} isUploading={isUploading} deleteDocument={deleteDocument} flashcards={flashcards} exams={exams} notes={notes} setView={setCurrentView} searchQuery={searchQuery} setSearchQuery={setSearchQuery} addToast={addToast}/>
          </div>
          
          <div className={currentView === 'flashcards' ? 'flex-1 overflow-y-auto h-full' : 'hidden'}>
            <FlashcardsGlobalView flashcards={flashcards} setFlashcards={setFlashcards} setView={setCurrentView} addToast={addToast}/>
          </div>
          
          <div className={currentView === 'exams' ? 'flex-1 overflow-y-auto h-full' : 'hidden'}>
            <ExamsGlobalView exams={exams} setExams={setExams} setView={setCurrentView} addToast={addToast}/>
          </div>
          
          <div className={currentView === 'chat' ? 'flex-1 h-full flex flex-col' : 'hidden'}>
            <ChatGlobalView documents={documents} settings={userSettings} chatSessions={chatSessions} setChatSessions={setChatSessions} addToast={addToast}/>
          </div>
          
          <div className={currentView === 'settings' ? 'flex-1 overflow-y-auto h-full p-6 md:p-10' : 'hidden'}>
            <div className="max-w-3xl mx-auto">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8 flex items-center gap-3"><Settings className="text-[var(--accent-color)]"/> Settings</h1>
              <PanelSettings settings={userSettings} setSettings={setUserSettings} addToast={addToast}/>
            </div>
          </div>
          
          <div className={currentView === 'reader' && activeDocId ? 'flex-1 flex flex-col h-full overflow-hidden' : 'hidden'}>
            {activeDocId && (
              <PdfWorkspace activeDoc={activeDoc} setDocuments={setDocuments} closeDoc={() => { closeDoc(activeDocId); setCurrentView('library'); }} rightPanelOpen={rightPanelOpen} setRightPanelOpen={setRightPanelOpen} currentPage={docPages[activeDocId] || 1} setCurrentPage={(updater) => { setDocPages(prev => { const oldVal = prev[activeDocId] || 1; const newVal = typeof updater === 'function' ? updater(oldVal) : updater; return { ...prev, [activeDocId]: newVal }; }); }} openDocs={openDocs} setActiveDocId={setActiveDocId} closeTab={closeDoc} setShowMenu={setShowMenu} setMenuPos={setMenuPos} setSelectedText={setSelectedText} setGenFromSelection={setGenFromSelection} setRightPanelTab={setRightPanelTab} documents={documents} settings={userSettings} setSettings={setUserSettings} isResizing={isResizing} addToast={addToast}/>
            )}
          </div>
        </main>

        {/* AI Sidebar Resize Handle */}
        {activeDocId && currentView === 'reader' && rightPanelOpen && (
          <div className="hidden md:flex w-1 hover:w-2 cursor-col-resize bg-gray-200 dark:bg-zinc-800 hover:bg-[var(--accent-color)] items-center justify-center shrink-0 z-40 transition-all"
            onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }}
            style={{ backgroundColor: isResizing ? 'var(--accent-color)' : '', width: isResizing ? '4px' : '' }} />
        )}

        {/* AI Tools Sidebar */}
        {activeDocId && currentView === 'reader' && (
          <aside
            style={typeof window !== 'undefined' && window.innerWidth > 768 && rightPanelOpen ? { width: `${aiWidth}px` } : {}}
            className={`fixed inset-0 top-0 bottom-16 z-40 flex flex-col md:relative md:bottom-0 bg-white dark:bg-zinc-900 border-l border-gray-200 dark:border-zinc-800 shrink-0 shadow-xl md:shadow-none transition-transform duration-300 ease-in-out ${rightPanelOpen ? 'translate-y-0 md:translate-x-0' : 'translate-y-full md:translate-x-full md:hidden'}`}>
            
            <div className="h-14 bg-gray-50 dark:bg-zinc-950 border-b border-gray-200 dark:border-zinc-800 px-4 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Target size={16} className="text-gray-500"/>
                <span className="text-sm font-medium text-gray-700 dark:text-zinc-300">Page {docPages[activeDocId] || 1}</span>
              </div>
              <button onClick={() => setRightPanelOpen(false)} className="md:hidden p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white"><X size={20}/></button>
            </div>
            
            <div className="flex border-b border-gray-200 dark:border-zinc-800 shrink-0 overflow-x-auto custom-scrollbar">
              <PanelTab active={rightPanelTab === 'generate'} onClick={() => setRightPanelTab('generate')} label="Studio" icon={Sparkles}/>
              <PanelTab active={rightPanelTab === 'cases'} onClick={() => setRightPanelTab('cases')} label="Cases" icon={Zap}/>
              <PanelTab active={rightPanelTab === 'chat'} onClick={() => setRightPanelTab('chat')} label="Chat" icon={MessageSquare}/>
              <PanelTab active={rightPanelTab === 'review'} onClick={() => setRightPanelTab('review')} label="Vault" icon={Layers}/>
            </div>
            
            <div className="flex-1 overflow-hidden relative flex flex-col bg-white dark:bg-zinc-900">
              {!userSettings.apiKey?.trim() ? (
                <div className="flex-1 overflow-y-auto p-6 flex flex-col items-center justify-center text-center">
                  <KeyRound className="w-12 h-12 text-gray-400 mb-4"/>
                  <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">API Key Required</h2>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 mb-6">Connect your OpenAI key to use AI features.</p>
                  <button onClick={() => setCurrentView('settings')} className="px-6 py-2 bg-[var(--accent-color)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Go to Settings</button>
                </div>
              ) : rightPanelTab === 'generate' ? (
                <PanelGenerate activeDoc={activeDoc} settings={userSettings} setFlashcards={setFlashcards} setExams={setExams} setNotes={setNotes} switchToReview={() => setRightPanelTab('review')} genFromSelection={genFromSelection} setGenFromSelection={setGenFromSelection} currentPage={docPages[activeDocId] || 1} addToast={addToast}/>
              ) : rightPanelTab === 'cases' ? (
                <PanelPatientCases activeDoc={activeDoc} settings={userSettings} setNotes={setNotes} setExams={setExams} currentPage={docPages[activeDocId] || 1} addToast={addToast}/>
              ) : rightPanelTab === 'chat' ? (
                <PanelChat activeDoc={activeDoc} settings={userSettings} currentPage={docPages[activeDocId] || 1}/>
              ) : rightPanelTab === 'review' ? (
                <PanelReview activeDocId={activeDocId} flashcards={flashcards} setFlashcards={setFlashcards} exams={exams} setExams={setExams} notes={notes} setNotes={setNotes} addToast={addToast}/>
              ) : null}
            </div>
          </aside>
        )}

        {/* Global Keyboard Shortcuts Modal */}
        {showShortcuts && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200] p-4" onClick={() => setShowShortcuts(false)}>
            <div className="bg-white dark:bg-zinc-900 p-6 rounded-xl max-w-sm w-full shadow-xl" onClick={e => e.stopPropagation()}>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-gray-900 dark:text-white"><HelpCircle className="text-[var(--accent-color)]"/> Shortcuts</h2>
              <ul className="space-y-3 text-sm text-gray-600 dark:text-zinc-300">
                {[['Left / Right', 'Change Page'], ['Ctrl +', 'Zoom In'], ['Ctrl -', 'Zoom Out'], ['?', 'Show Help'], ['Esc', 'Close']].map(([k, v]) => (
                  <li key={k} className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-2">
                    <span>{v}</span><kbd className="bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded font-mono text-xs">{k}</kbd>
                  </li>
                ))}
              </ul>
              <button onClick={() => setShowShortcuts(false)} className="mt-6 w-full py-2 bg-[var(--accent-color)] text-white font-medium rounded-lg">Close</button>
            </div>
          </div>
        )}

        {/* Global Context Menu */}
        {showMenu && (
          <div className="fixed inset-0 z-[200]" onClick={() => setShowMenu(false)}>
            <div className="absolute bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg shadow-lg p-1 min-w-[160px]" style={{ left: menuPos.x, top: menuPos.y }}>
              <button onClick={() => { setShowMenu(false); setGenFromSelection(selectedText); setRightPanelOpen(true); setRightPanelTab('generate'); }} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-md w-full text-left text-sm font-medium text-gray-700 dark:text-zinc-200">
                <Sparkles size={16} className="text-[var(--accent-color)]"/> Generate from Text
              </button>
              <button onClick={() => { setShowMenu(false); setGenFromSelection(selectedText); setRightPanelOpen(true); setRightPanelTab('chat'); }} className="flex items-center gap-2 px-3 py-2 hover:bg-gray-50 dark:hover:bg-zinc-800 rounded-md w-full text-left text-sm font-medium text-gray-700 dark:text-zinc-200">
                <MessageSquare size={16} className="text-blue-500"/> Ask AI about this
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── SIDEBAR BTN ──────────────────────────────────────────────────────────────
function SidebarBtn({ icon: Icon, label, active, onClick, highlight }) {
  return (
    <button onClick={onClick} className={`flex flex-col md:flex-row items-center justify-center md:justify-start gap-1 md:gap-3 w-16 md:w-full p-2 md:p-3 rounded-xl transition-colors ${active ? highlight ? 'bg-[var(--accent-color)] text-white' : 'bg-gray-100 dark:bg-zinc-800 text-[var(--accent-color)]' : 'text-gray-500 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 hover:text-gray-900 dark:hover:text-white'}`}>
      <Icon size={20} strokeWidth={active ? 2.5 : 2}/>
      <span className={`text-[10px] md:text-sm font-medium ${active ? '' : ''}`}>{label}</span>
    </button>
  );
}

// ─── PANEL TAB ────────────────────────────────────────────────────────────────
function PanelTab({ active, onClick, label, icon: Icon }) {
  return (
    <button onClick={onClick} className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 text-xs font-medium transition-colors border-b-2 ${active ? 'border-[var(--accent-color)] text-[var(--accent-color)] bg-[var(--accent-color)]/5' : 'border-transparent text-gray-500 hover:text-gray-900 dark:hover:text-white hover:bg-gray-50 dark:hover:bg-zinc-800'}`}>
      <Icon size={14}/> {label}
    </button>
  );
}

// ─── LIBRARY VIEW ─────────────────────────────────────────────────────────────
function LibraryView({ documents, onUpload, onOpen, isUploading, deleteDocument, flashcards, exams, notes, setView, searchQuery, setSearchQuery, addToast }) {
  const totalCardsCount = flashcards.reduce((sum, set) => sum + (set.cards ? set.cards.length : 0), 0);
  const dueCards = flashcards.reduce((s, set) => s + (set.cards?.filter(c => c.nextReview <= Date.now())?.length || 0), 0);

  return (
    <div className="flex-1 p-6 md:p-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white flex items-center gap-2">Nexus <span className="text-[var(--accent-color)]">Library</span></h1>
            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-1">Your local AI-powered knowledge base.</p>
          </div>
          <label className={`cursor-pointer flex items-center gap-2 bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/90 text-white px-5 py-2.5 rounded-lg font-medium transition-opacity ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
            {isUploading ? <Loader2 className="animate-spin" size={18}/> : <Upload size={18}/>}
            {isUploading ? 'Processing...' : 'Upload PDF'}
            <input type="file" accept="application/pdf" className="hidden" onChange={onUpload} disabled={isUploading}/>
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div onClick={() => setView('chat')} className="cursor-pointer bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-5 rounded-xl flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 flex items-center justify-center"><MessageSquare size={24}/></div>
            <div><p className="text-xl font-bold text-gray-900 dark:text-white">Smart Chat</p><p className="text-xs text-gray-500 dark:text-zinc-400">Global AI Assistant</p></div>
          </div>
          <div onClick={() => setView('flashcards')} className="cursor-pointer bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-5 rounded-xl flex items-center gap-4 hover:shadow-md transition-shadow relative">
            <div className="w-12 h-12 rounded-lg bg-emerald-100 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center"><Layers size={24}/></div>
            <div><p className="text-xl font-bold text-gray-900 dark:text-white">{totalCardsCount}</p><p className="text-xs text-gray-500 dark:text-zinc-400">Flashcards</p></div>
            {dueCards > 0 && <span className="absolute top-4 right-4 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full">{dueCards} Due</span>}
          </div>
          <div onClick={() => setView('exams')} className="cursor-pointer bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-5 rounded-xl flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-12 h-12 rounded-lg bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 flex items-center justify-center"><GraduationCap size={24}/></div>
            <div><p className="text-xl font-bold text-gray-900 dark:text-white">{exams.length}</p><p className="text-xs text-gray-500 dark:text-zinc-400">Exams Built</p></div>
          </div>
        </div>

        {documents.length > 0 && (
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18}/>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search documents..." className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg pl-12 pr-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] transition-shadow"/>
          </div>
        )}

        {documents.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 dark:border-zinc-800 rounded-xl p-12 text-center bg-white dark:bg-zinc-900/50">
            <FileUp size={40} className="text-gray-400 mx-auto mb-4"/>
            <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-2">No Documents Yet</h2>
            <p className="text-sm text-gray-500 dark:text-zinc-400">Upload a PDF to start extracting knowledge.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredDocuments.map(doc => {
              const docCards = flashcards.filter(f => f.docId === doc.id).reduce((sum, set) => sum + (set.cards ? set.cards.length : 0), 0);
              const docExams = exams.filter(e => e.docId === doc.id).length;
              return (
                <div key={doc.id} onClick={() => onOpen(doc.id)} className="bg-white dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 p-5 cursor-pointer hover:border-[var(--accent-color)] hover:shadow-md transition-all flex flex-col h-48 group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="w-10 h-10 rounded-lg bg-gray-100 dark:bg-zinc-800 flex items-center justify-center text-[var(--accent-color)]">
                      <BookOpen size={20}/>
                    </div>
                    <button onClick={(e) => deleteDocument(doc.id, e)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={16}/></button>
                  </div>
                  <h3 className="font-semibold text-gray-900 dark:text-white text-base line-clamp-2 mb-auto">{doc.name}</h3>
                  <div className="flex justify-between items-end mt-4">
                    <div className="flex gap-2">
                      <span className="text-[10px] font-medium text-gray-500 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded">{docCards} Cards</span>
                      <span className="text-[10px] font-medium text-gray-500 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded">{docExams} Exams</span>
                    </div>
                    <span className="text-xs font-medium text-[var(--accent-color)]">Pg {doc.progress}/{doc.totalPages}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FLASHCARDS GLOBAL VIEW ───────────────────────────────────────────────────
function FlashcardsGlobalView({ flashcards, setFlashcards, setView, addToast }) {
  const [studyingSet, setStudyingSet] = useState(null);

  const exportAnki = () => {
    const allCards = flashcards.flatMap(set => set.cards || []);
    if (allCards.length === 0) return;
    const csvContent = 'Front,Back\n' + allCards.map(f => `"${f.q.replace(/"/g, '""')}","${f.a.replace(/"/g, '""')}"`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = 'flashcards_anki.csv'; link.click();
    URL.revokeObjectURL(url);
    addToast('Exported to Anki CSV!', 'success');
  };

  const dueCards = flashcards.flatMap(set => (set.cards || []).filter(c => c.nextReview <= Date.now()));

  if (studyingSet) return <InPanelFlashcards title={studyingSet.title} initialCards={studyingSet.cards} onBack={() => setStudyingSet(null)} setFlashcards={setFlashcards} addToast={addToast}/>;
  
  if (flashcards.length === 0) return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full">
      <Layers size={64} className="text-gray-300 dark:text-zinc-700 mb-4"/>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Flashcards</h2>
      <p className="text-gray-500 text-sm mb-6">Extract cards from your documents in the Reader view.</p>
    </div>
  );

  return (
    <div className="flex-1 p-6 md:p-10">
      <div className="max-w-5xl mx-auto space-y-8">
        <div className="flex justify-between items-center flex-wrap gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><Layers className="text-[var(--accent-color)]"/> Flashcards</h1>
            <p className="text-sm text-gray-500 mt-1">{flashcards.reduce((s,f) => s+(f.cards?.length||0),0)} total cards</p>
          </div>
          <div className="flex gap-2">
            <button onClick={exportAnki} className="px-4 py-2 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-700 dark:text-zinc-300 rounded-lg text-sm font-medium flex items-center gap-2 hover:bg-gray-50 dark:hover:bg-zinc-700"><Download size={16}/> Anki</button>
            {dueCards.length > 0 && (
              <button onClick={() => setStudyingSet({ id: 'due', title: 'Due Cards', cards: dueCards })} className="px-4 py-2 bg-red-500 text-white rounded-lg text-sm font-medium flex items-center gap-2"><Clock size={16}/> {dueCards.length} Due</button>
            )}
            <button onClick={() => setStudyingSet({ id: 'all', title: 'All Cards', cards: flashcards.flatMap(s => s.cards || []) })} className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg text-sm font-medium flex items-center gap-2"><Play size={16}/> Study All</button>
          </div>
        </div>

        <StudyAnalytics flashcards={flashcards} exams={[]} notes={[]}/>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {flashcards.map(set => {
            const due = (set.cards || []).filter(c => c.nextReview <= Date.now()).length;
            const mastered = (set.cards || []).filter(c => c.ef >= 2.5 && c.repetitions >= 3).length;
            return (
              <div key={set.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-5 rounded-xl shadow-sm flex flex-col">
                <div className="flex justify-between items-start mb-2">
                  <p className="font-semibold text-gray-900 dark:text-white line-clamp-1">{set.title}</p>
                  {due > 0 && <span className="text-[10px] font-bold text-red-600 bg-red-100 dark:bg-red-900/30 px-2 py-0.5 rounded">{due} due</span>}
                </div>
                <div className="flex gap-2 mb-4 text-xs text-gray-500">
                  <span>{set.cards?.length || 0} Cards</span>•<span>{mastered} Mastered</span>
                </div>
                <div className="mt-auto flex gap-2">
                  <button onClick={() => setStudyingSet(set)} className="flex-1 py-2 bg-[var(--accent-color)]/10 text-[var(--accent-color)] hover:bg-[var(--accent-color)]/20 rounded-lg text-sm font-medium transition-colors">Study</button>
                  <button onClick={() => setFlashcards(flashcards.filter(f => f.id !== set.id))} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={16}/></button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── EXAMS GLOBAL VIEW ────────────────────────────────────────────────────────
function ExamsGlobalView({ exams, setExams, setView, addToast }) {
  const [selectedExam, setSelectedExam] = useState(null);
  
  if (selectedExam) return <InPanelExam exam={selectedExam} onBack={() => setSelectedExam(null)} onScoreUpdate={(id, score) => setExams(prev => prev.map(e => e.id === id ? { ...e, lastScore: score } : e))} addToast={addToast}/>;
  
  if (exams.length === 0) return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full">
      <GraduationCap size={64} className="text-gray-300 dark:text-zinc-700 mb-4"/>
      <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No Exams</h2>
      <p className="text-gray-500 text-sm mb-6">Generate exams from your documents in the Reader view.</p>
    </div>
  );
  
  return (
    <div className="flex-1 p-6 md:p-10">
      <div className="max-w-4xl mx-auto space-y-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2"><GraduationCap className="text-[var(--accent-color)]"/> Examinations</h1>
        <div className="grid grid-cols-1 gap-4">
          {exams.map(e => (
            <div key={e.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-5 rounded-xl shadow-sm flex sm:items-center flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <p className="font-semibold text-gray-900 dark:text-white mb-1">{e.title}</p>
                <div className="flex gap-3 text-xs">
                  <span className="text-gray-500">{e.questions.length} Questions</span>
                  {e.lastScore !== undefined && (
                    <span className={`font-medium ${e.lastScore >= 70 ? 'text-emerald-600' : 'text-red-600'}`}>Score: {e.lastScore}%</span>
                  )}
                </div>
              </div>
              <div className="flex gap-2">
                <button onClick={() => setSelectedExam(e)} className="px-4 py-2 bg-[var(--accent-color)] text-white rounded-lg text-sm font-medium hover:opacity-90 transition-opacity">Take Exam</button>
                <button onClick={() => setExams(exams.filter(ex => ex.id !== e.id))} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"><Trash2 size={18}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CHAT GLOBAL VIEW ─────────────────────────────────────────────────────────
function ChatGlobalView({ documents, settings, chatSessions, setChatSessions, addToast }) {
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState('none');
  const endRef = useRef(null);

  const activeSession = chatSessions.find(s => s.id === activeSessionId) || null;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [activeSession?.messages, loading]);

  const createNewChat = () => { setActiveSessionId(null); setInput(''); };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const sessionId = activeSessionId || Date.now().toString();
    const isNew = !activeSessionId;
    const msg = input;
    setInput('');
    let currentMessages = isNew ? [] : chatSessions.find(s => s.id === sessionId)?.messages || [];
    currentMessages = [...currentMessages, { role: 'user', content: msg }];
    let docIdToUse = isNew ? (selectedDocId !== 'none' ? selectedDocId : null) : chatSessions.find(s => s.id === sessionId)?.docId;
    const newTitle = isNew ? msg.substring(0, 40) + (msg.length > 40 ? '...' : '') : chatSessions.find(s => s.id === sessionId)?.title;
    
    setChatSessions(prev => {
      const exists = prev.find(s => s.id === sessionId);
      if (exists) return prev.map(s => s.id === sessionId ? { ...s, messages: currentMessages } : s);
      return [{ id: sessionId, title: newTitle, messages: currentMessages, docId: docIdToUse, createdAt: new Date().toISOString() }, ...prev];
    });
    
    if (isNew) setActiveSessionId(sessionId);
    setLoading(true);
    
    try {
      let contextText = '';
      if (docIdToUse) {
        const pdfData = await getPdfData(docIdToUse);
        if (pdfData?.pagesText) {
          contextText = Object.entries(pdfData.pagesText).slice(0, 30).map(([p, t]) => `[Page ${p}] ${t}`).join('\n').substring(0, 60000);
        }
      }
      const prompt = contextText ? `DOCUMENT CONTEXT:\n${contextText}\n\nUSER QUESTION:\n${msg}` : msg;
      const res = await callAI(prompt, false, false, settings.apiKey, 16384);
      setChatSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages: [...s.messages, { role: 'assistant', content: res }] } : s));
    } catch (e) {
      setChatSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages: [...s.messages, { role: 'assistant', content: `⚠️ Error: ${e.message}` }] } : s));
      addToast(e.message, 'error');
    } finally { setLoading(false); }
  };

  return (
    <div className="flex h-full w-full bg-white dark:bg-zinc-900">
      {/* Chat Sidebar */}
      <div className="hidden md:flex w-64 flex-col border-r border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950">
        <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
          <button onClick={createNewChat} className="w-full py-2 bg-[var(--accent-color)] text-white rounded-lg text-sm font-medium hover:opacity-90 flex items-center justify-center gap-2">
            <PlusCircle size={16}/> New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto p-2 space-y-1">
          {chatSessions.length === 0 && <div className="text-center p-4 text-xs text-gray-500">No History</div>}
          {chatSessions.map(session => (
            <div key={session.id} className="relative group">
              <button onClick={() => setActiveSessionId(session.id)} className={`w-full text-left p-2 rounded-lg text-sm transition-colors flex flex-col ${activeSessionId === session.id ? 'bg-gray-200 dark:bg-zinc-800 text-gray-900 dark:text-white' : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}>
                <span className="truncate">{session.title}</span>
                <span className="text-[10px] text-gray-400">{session.messages.length} msgs</span>
              </button>
              <button onClick={() => setChatSessions(prev => prev.filter(s => s.id !== session.id))} className="absolute right-2 top-2 p-1 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash size={14}/></button>
            </div>
          ))}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col h-full relative">
        <div className="h-14 border-b border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex items-center justify-between px-4 shrink-0">
          <div className="flex items-center gap-2">
            <Bot size={20} className="text-[var(--accent-color)]"/>
            <span className="font-semibold text-gray-900 dark:text-white">Assistant</span>
          </div>
          <div className="flex items-center gap-2">
            {!activeSessionId && (
              <select value={selectedDocId} onChange={e => setSelectedDocId(e.target.value)} className="bg-gray-50 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-sm rounded-md px-2 py-1 outline-none max-w-[150px] truncate">
                <option value="none">No Document attached</option>
                {documents.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            )}
            {activeSessionId && activeSession?.docId && <span className="text-xs text-[var(--accent-color)] bg-[var(--accent-color)]/10 px-2 py-1 rounded flex items-center gap-1"><BookOpen size={12}/> Doc Linked</span>}
            <button onClick={createNewChat} className="md:hidden p-1.5 bg-gray-100 dark:bg-zinc-800 rounded text-gray-600 dark:text-zinc-300"><PlusCircle size={16}/></button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-4 md:p-6 pb-24 flex flex-col">
          {!activeSession ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center">
              <Sparkles size={32} className="text-gray-300 dark:text-zinc-700 mb-4"/>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">How can I help today?</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-8 max-w-lg w-full text-left">
                {['Explain pathophysiology of HF', 'Diagnostic criteria for sepsis?', 'Summarize T2DM treatment', 'Labs for acute pancreatitis?'].map(q => (
                  <button key={q} onClick={() => { setInput(q); }} className="p-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-lg text-sm text-gray-600 dark:text-zinc-300 hover:border-[var(--accent-color)] transition-colors">{q}</button>
                ))}
              </div>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto w-full space-y-6">
              {activeSession.messages.map((m, i) => (
                <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-gray-200 dark:bg-zinc-700' : 'bg-[var(--accent-color)] text-white'}`}>
                    {m.role === 'user' ? <UserCircle2 size={16}/> : <Bot size={16}/>}
                  </div>
                  <div className={`p-4 text-sm leading-relaxed max-w-[85%] ${m.role === 'user' ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white rounded-2xl rounded-tr-sm' : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl rounded-tl-sm text-gray-800 dark:text-zinc-200 whitespace-pre-wrap'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-3">
                  <div className="w-8 h-8 rounded-full bg-[var(--accent-color)] text-white flex items-center justify-center"><Bot size={16}/></div>
                  <div className="p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl rounded-tl-sm flex gap-1 items-center">
                    {[0, 1, 2].map(i => <span key={i} className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}/>)}
                  </div>
                </div>
              )}
              <div ref={endRef}/>
            </div>
          )}
        </div>

        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800">
          <div className="max-w-3xl mx-auto relative flex items-center">
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Message Assistant..." disabled={loading} className="w-full bg-gray-100 dark:bg-zinc-800 border-none rounded-xl py-3 pl-4 pr-12 text-sm text-gray-900 dark:text-white outline-none resize-none h-12 custom-scrollbar"/>
            <button onClick={handleSend} disabled={loading || !input.trim()} className="absolute right-2 p-1.5 bg-[var(--accent-color)] disabled:bg-gray-300 dark:disabled:bg-zinc-700 rounded-lg text-white transition-colors">
              <Send size={16}/>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PDF WORKSPACE ────────────────────────────────────────────────────────────
function PdfWorkspace({ activeDoc, setDocuments, closeDoc, rightPanelOpen, setRightPanelOpen, currentPage, setCurrentPage, openDocs, setActiveDocId, closeTab, setShowMenu, setMenuPos, setSelectedText, setGenFromSelection, setRightPanelTab, documents, settings, setSettings, isResizing, addToast }) {
  const [pdf, setPdf] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageDims, setPageDims] = useState({ w: 0, h: 0 });
  const [scaleMultiplier, setScaleMultiplier] = useState(1);
  const [resizeTrigger, setResizeTrigger] = useState(0);
  const [goToPage, setGoToPage] = useState('');
  const [showGoTo, setShowGoTo] = useState(false);

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const textLayerRef = useRef(null);
  const renderTaskRef = useRef(null);
  const [localPage, setLocalPage] = useState(currentPage);

  useEffect(() => { setLocalPage(currentPage); }, [currentPage]);
  useEffect(() => { if (!isResizing) setResizeTrigger(prev => prev + 1); }, [isResizing]);

  useEffect(() => {
    let isMounted = true;
    const loadPdf = async () => {
      setIsLoading(true);
      try {
        const buffer = await getPdfData(activeDoc.id);
        if (buffer && isMounted) {
          const actualBuffer = buffer.buffer || buffer;
          const pdfjsLib = await loadPdfJs();
          const loadedPdf = await pdfjsLib.getDocument({ data: actualBuffer }).promise;
          if (isMounted) setPdf(loadedPdf);
        }
      } catch (e) { console.error(e); }
      finally { if (isMounted) setIsLoading(false); }
    };
    loadPdf();
    return () => { isMounted = false; };
  }, [activeDoc.id]);

  useEffect(() => {
    if (!pdf) return;
    let isMounted = true;
    const renderPage = async () => {
      try {
        const page = await pdf.getPage(localPage);
        const container = containerRef.current;
        if (!container || !isMounted) return;
        const containerWidth = container.clientWidth;
        if (!containerWidth) return;
        const tempViewport = page.getViewport({ scale: 1 });
        const baseScale = containerWidth / tempViewport.width;
        const finalScale = Math.min(Math.max(baseScale * scaleMultiplier, 0.5), 5.0);
        const viewport = page.getViewport({ scale: finalScale });
        if (isMounted) setPageDims({ w: viewport.width, h: viewport.height });
        const canvas = canvasRef.current;
        if (canvas) {
          const pixelRatio = window.devicePixelRatio || 1;
          canvas.width = Math.floor(viewport.width * pixelRatio);
          canvas.height = Math.floor(viewport.height * pixelRatio);
          const renderContext = { canvasContext: canvas.getContext('2d'), viewport, transform: [pixelRatio, 0, 0, pixelRatio, 0, 0] };
          if (renderTaskRef.current) renderTaskRef.current.cancel();
          renderTaskRef.current = page.render(renderContext);
          await renderTaskRef.current.promise;
        }
        const textLayer = textLayerRef.current;
        if (textLayer && isMounted) {
          textLayer.innerHTML = '';
          textLayer.style.setProperty('--scale-factor', viewport.scale);
          const textContent = await page.getTextContent();
          window.pdfjsLib.renderTextLayer({ textContentSource: textContent, container: textLayer, viewport, textDivs: [] });
        }
      } catch (e) { if (e.name !== 'RenderingCancelledException') console.error(e); }
    };
    renderPage();
    return () => { isMounted = false; if (renderTaskRef.current) renderTaskRef.current.cancel(); };
  }, [localPage, pdf, rightPanelOpen, scaleMultiplier, resizeTrigger]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA') return;
      if (e.key === 'ArrowLeft') handleNav(-1);
      else if (e.key === 'ArrowRight') handleNav(1);
      else if (e.ctrlKey && (e.key === '=' || e.key === '+')) { e.preventDefault(); setScaleMultiplier(prev => Math.min(prev + 0.15, 4)); }
      else if (e.ctrlKey && e.key === '-') { e.preventDefault(); setScaleMultiplier(prev => Math.max(prev - 0.15, 0.4)); }
      else if (e.key === 'g') setShowGoTo(true);
    };
    document.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeDoc.totalPages, localPage]);

  const handleNav = (dir) => {
    const next = Math.max(1, Math.min(activeDoc.totalPages, localPage + dir));
    if (next !== localPage) {
      setLocalPage(next); setCurrentPage(next);
      setDocuments(prev => prev.map(doc => doc.id === activeDoc.id ? { ...doc, progress: next } : doc));
      if (containerRef.current) containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleGoToPage = () => {
    const n = parseInt(goToPage);
    if (n >= 1 && n <= activeDoc.totalPages) {
      handleNav(n - localPage);
      setGoToPage('');
      setShowGoTo(false);
    }
  };

  const handleContextMenu = (e) => {
    const sel = window.getSelection().toString().trim();
    if (sel) { e.preventDefault(); setSelectedText(sel); setMenuPos({ x: e.pageX, y: e.pageY }); setShowMenu(true); }
  };

  const handleZoomIn = () => setScaleMultiplier(s => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScaleMultiplier(s => Math.max(s - 0.25, 0.5));
  const handleZoomReset = () => setScaleMultiplier(1);

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-100 dark:bg-[#0a0a0c] relative" onContextMenu={handleContextMenu}>
      {/* Top Header */}
      <div className="h-14 flex items-center justify-between px-4 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 shrink-0">
        <div className="flex items-center gap-3 overflow-hidden">
          <button onClick={closeDoc} className="p-1.5 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800 text-gray-500"><ChevronLeft size={20}/></button>
          <span className="text-sm font-medium text-gray-900 dark:text-white truncate max-w-[200px] md:max-w-md">{activeDoc.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-1 bg-gray-50 dark:bg-zinc-800 rounded-lg p-1 border border-gray-200 dark:border-zinc-700">
            <button onClick={handleZoomOut} className="p-1 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded"><ZoomOut size={16}/></button>
            <button onClick={handleZoomReset} className="p-1 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded"><Maximize size={16}/></button>
            <button onClick={handleZoomIn} className="p-1 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded"><ZoomIn size={16}/></button>
          </div>
          <button onClick={() => setRightPanelOpen(!rightPanelOpen)} className={`p-1.5 rounded-lg border transition-colors ${rightPanelOpen ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white' : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300'}`}>
            {rightPanelOpen ? <PanelRightClose size={18}/> : <PanelRightOpen size={18}/>}
          </button>
        </div>
      </div>

      {openDocs.length > 1 && (
        <div className="flex gap-2 px-4 py-2 bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 overflow-x-auto custom-scrollbar shrink-0">
          {openDocs.map(id => {
            const doc = documents.find(d => d.id === id);
            if (!doc) return null;
            return (
              <div key={id} className={`flex items-center gap-2 px-3 py-1 rounded-md cursor-pointer text-xs font-medium border ${id === activeDocId ? 'bg-gray-100 dark:bg-zinc-800 border-gray-300 dark:border-zinc-600 text-gray-900 dark:text-white' : 'bg-transparent border-transparent text-gray-500 hover:bg-gray-50 dark:hover:bg-zinc-800/50'}`} onClick={() => setActiveDocId(id)}>
                <span className="truncate max-w-[120px]">{doc.name}</span>
                <button onClick={(e) => { e.stopPropagation(); closeTab(id); }} className="p-0.5 rounded hover:bg-gray-200 dark:hover:bg-zinc-700"><X size={12}/></button>
              </div>
            );
          })}
        </div>
      )}

      {/* PDF Viewer */}
      <div ref={containerRef} className="flex-1 overflow-auto p-4 md:p-8 flex justify-center custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-gray-500">
            <Loader2 className="animate-spin text-[var(--accent-color)]" size={24}/>
            <span className="text-sm font-medium">Loading Document...</span>
          </div>
        ) : pdf ? (
          <div className="relative shadow-md bg-white shrink-0 origin-top"
            style={{ width: pageDims.w ? `${pageDims.w}px` : '100%', height: pageDims.h ? `${pageDims.h}px` : 'auto' }}>
            <canvas ref={canvasRef} className="block m-0 p-0"/>
            <div ref={textLayerRef} className="pdf-text-layer"/>
          </div>
        ) : (
          <div className="m-auto text-red-500 text-sm flex items-center gap-2 bg-red-50 p-4 rounded-lg"><AlertCircle size={16}/> Failed to load PDF.</div>
        )}
      </div>

      {/* Navigation Footer */}
      <div className="h-14 flex items-center justify-center gap-4 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 shrink-0">
        <button onClick={() => handleNav(-1)} disabled={localPage <= 1} className="p-2 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg disabled:opacity-30">
          <ChevronLeft size={20}/>
        </button>
        <button onClick={() => setShowGoTo(true)} className="px-3 py-1 text-sm font-medium text-gray-700 dark:text-zinc-200 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-md">
          Page {localPage} / {activeDoc.totalPages}
        </button>
        <button onClick={() => handleNav(1)} disabled={localPage >= activeDoc.totalPages} className="p-2 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg disabled:opacity-30">
          <ChevronRight size={20}/>
        </button>
      </div>

      {showGoTo && (
        <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setShowGoTo(false)}>
          <div className="bg-white dark:bg-zinc-900 p-5 rounded-xl shadow-xl w-64" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-bold text-gray-900 dark:text-white mb-3">Jump to Page</h3>
            <input type="number" min="1" max={activeDoc.totalPages} value={goToPage} onChange={e => setGoToPage(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleGoToPage()} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm outline-none focus:border-[var(--accent-color)] mb-4" autoFocus/>
            <div className="flex gap-2">
              <button onClick={() => setShowGoTo(false)} className="flex-1 py-1.5 bg-gray-100 dark:bg-zinc-800 rounded-lg text-sm font-medium">Cancel</button>
              <button onClick={handleGoToPage} className="flex-1 py-1.5 bg-[var(--accent-color)] text-white rounded-lg text-sm font-medium">Go</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── PANEL SETTINGS ───────────────────────────────────────────────────────────
function PanelSettings({ settings, setSettings, addToast }) {
  const fontSizes = ['small', 'medium', 'large', 'xl', 'xxl', 'xxxl'];
  const adjustFont = (dir) => {
    const currentIdx = fontSizes.indexOf(settings.fontSize || 'medium');
    const newIdx = Math.max(0, Math.min(fontSizes.length - 1, currentIdx + dir));
    setSettings({ ...settings, fontSize: fontSizes[newIdx] });
  };
  const [showKey, setShowKey] = useState(false);
  const [testingKey, setTestingKey] = useState(false);

  const testApiKey = async () => {
    if (!settings.apiKey?.trim()) return;
    setTestingKey(true);
    try {
      await callAI('Reply with exactly: OK', false, false, settings.apiKey, 10);
      addToast('API key is valid! ✓', 'success');
    } catch (e) {
      addToast('Invalid API key: ' + e.message, 'error');
    } finally { setTestingKey(false); }
  };

  return (
    <div className="flex flex-col gap-6 w-full pb-10">
      
      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-5 rounded-xl shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4"><KeyRound size={18}/> OpenAI API Key</h3>
        <div className="relative mb-3">
          <input type={showKey ? 'text' : 'password'} value={settings.apiKey} onChange={(e) => setSettings({ ...settings, apiKey: e.target.value })} placeholder="sk-proj-..." className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2.5 pr-10 text-sm focus:outline-none focus:border-[var(--accent-color)] font-mono"/>
          <button onClick={() => setShowKey(!showKey)} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
            {showKey ? <EyeOff size={16}/> : <Eye size={16}/>}
          </button>
        </div>
        <div className="flex gap-2">
          <button onClick={testApiKey} disabled={testingKey || !settings.apiKey?.trim()} className="px-4 py-1.5 bg-[var(--accent-color)] text-white rounded-md text-sm font-medium flex items-center gap-2 disabled:opacity-50 hover:opacity-90">
            {testingKey ? <Loader2 size={14} className="animate-spin"/> : <CheckCircle2 size={14}/>} Test Key
          </button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-5 rounded-xl shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4"><Type size={18}/> Text Size</h3>
        <div className="flex items-center justify-between bg-gray-50 dark:bg-zinc-950 p-2 rounded-lg border border-gray-200 dark:border-zinc-800">
          <button onClick={() => adjustFont(-1)} className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-md"><Minus size={18}/></button>
          <span className="font-medium text-sm text-gray-900 dark:text-white uppercase">{settings.fontSize}</span>
          <button onClick={() => adjustFont(1)} className="p-2 text-gray-500 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-md"><Plus size={18}/></button>
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-5 rounded-xl shadow-sm">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={settings.strictMode} onChange={(e) => setSettings({ ...settings, strictMode: e.target.checked })} className="mt-0.5 w-4 h-4 rounded text-[var(--accent-color)] focus:ring-[var(--accent-color)]"/>
          <div>
            <span className="text-sm font-semibold text-gray-900 dark:text-white block">Strict Grounding</span>
            <span className="text-xs text-gray-500 dark:text-zinc-400 mt-1 block">Forces AI to only use extracted PDF text to prevent hallucinations.</span>
          </div>
        </label>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-5 rounded-xl shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4"><Moon size={18}/> Theme</h3>
        <div className="flex gap-2">
          {[['system', 'System'], ['dark', 'Dark'], ['light', 'Light']].map(([t, l]) => (
            <button key={t} onClick={() => setSettings({ ...settings, theme: t })} className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${settings.theme === t ? 'bg-[var(--accent-color)] text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300'}`}>{l}</button>
          ))}
        </div>
      </div>

      <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-5 rounded-xl shadow-sm">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2 mb-4"><Palette size={18}/> Accent Color</h3>
        <div className="flex gap-3">
          {[['indigo', 'bg-indigo-500', 'ring-indigo-500'], ['purple', 'bg-purple-500', 'ring-purple-500'], ['blue', 'bg-blue-500', 'ring-blue-500'], ['emerald', 'bg-emerald-500', 'ring-emerald-500'], ['rose', 'bg-rose-500', 'ring-rose-500']].map(([c, bg, ring]) => (
            <button key={c} onClick={() => setSettings({ ...settings, accentColor: c })} className={`w-8 h-8 rounded-full ${bg} transition-transform ${settings.accentColor === c ? `ring-2 ring-offset-2 ${ring} dark:ring-offset-zinc-900 scale-110` : ''}`}/>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── PANEL GENERATE ───────────────────────────────────────────────────────────
function PanelGenerate({ activeDoc, settings, setFlashcards, setExams, setNotes, switchToReview, genFromSelection, setGenFromSelection, currentPage, addToast }) {
  const [startPage, setStartPage] = useState(currentPage);
  const [endPage, setEndPage] = useState(currentPage);
  const [type, setType] = useState('exam');
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState(2);
  const [status, setStatus] = useState({ loading: false, msg: '', err: false });
  const [generated, setGenerated] = useState(null);
  const [progress, setProgress] = useState({ done: 0, total: 0 });
  const difficultyLevels = ['Normal', 'Hard', 'Expert'];

  useEffect(() => {
    if (!status.loading && !generated && !genFromSelection) { setStartPage(currentPage); setEndPage(currentPage); }
  }, [currentPage]);

  const handleGenerate = async () => {
    setStatus({ loading: true, msg: 'Indexing context...', err: false });
    setGenerated(null); setProgress({ done: 0, total: 0 });
    try {
      let text = genFromSelection || '';
      if (!genFromSelection) {
        const pdfData = await getPdfData(activeDoc.id);
        const pagesText = pdfData?.pagesText || {};
        for (let i = Number(startPage); i <= Number(endPage); i++) {
          if (pagesText[i]) text += `[Page ${i}]\n${pagesText[i]}\n\n`;
        }
      }
      if (!text.trim() || text.length < 20) throw new Error('Not enough readable text found.');
      
      const diffPrompt = `Difficulty Level: ${difficultyLevels[difficulty - 1]}. Make output highly professional.`;
      let resultData = null;

      if (type === 'flashcards' || type === 'exam') {
        const CHUNK_SIZE = 10;
        const numChunks = Math.ceil(count / CHUNK_SIZE);
        setProgress({ done: 0, total: numChunks });
        const tasks = Array.from({ length: numChunks }, (_, i) => {
          const countForChunk = (i === numChunks - 1 && count % CHUNK_SIZE !== 0) ? count % CHUNK_SIZE : CHUNK_SIZE;
          const p = `${diffPrompt}\nCreate exactly ${countForChunk} items from this text ONLY.\n\nTEXT:\n${text}`;
          const formatPrompt = type === 'flashcards'
            ? '\n\nFormat as JSON: { "items": [ {"q": "Question", "a": "Answer"} ] }'
            : '\n\nFormat as JSON: { "title": "Generated Exam", "items": [ { "q": "Question", "options": ["A","B","C","D","E"], "correct": 0, "explanation": "Explanation" } ] }';
          return () => callAI(p + formatPrompt, true, settings.strictMode, settings.apiKey, 8000);
        });
        
        let allItems = [];
        const results = await runParallel(tasks, 5, (done, total) => {
          setProgress({ done, total });
          setStatus({ loading: true, msg: `Generating ${type}... ${done}/${total}`, err: false });
        });
        
        for (const res of results) {
          if (res.status === 'fulfilled') {
            try {
              const parsed = parseJsonSafe(res.value);
              const items = parsed.items || parsed.questions || [];
              allItems = [...allItems, ...items];
            } catch (e) { console.warn('Chunk parse failed', e); }
          }
        }
        
        if (allItems.length === 0) throw new Error('AI failed to extract valid items.');
        resultData = { type, title: 'Generated Assessment', data: allItems.slice(0, count), pages: genFromSelection ? 'Selection' : `${startPage}-${endPage}` };
      } else {
        setStatus({ loading: true, msg: 'Processing summary generation...', err: false });
        const p = `${diffPrompt}\nPerform the following task based ONLY on this medical text.\nTASK: ${type}\nRespond in Markdown.\n\nTEXT:\n${text}`;
        const raw = await callAI(p, false, settings.strictMode, settings.apiKey, 8000);
        const titles = { clinical: 'Clinical Case', differential: 'Differential Diagnosis', treatment: 'Treatment Plan', labs: 'Lab Interpretation', eli5: 'Simplified Explanation', summary: 'Summary', mnemonics: 'Mnemonics' };
        resultData = { type: 'summary', data: raw, pages: genFromSelection ? 'Selection' : `${startPage}-${endPage}`, customTitle: titles[type] || type };
      }
      setGenerated(resultData);
      setStatus({ loading: false, msg: 'Complete!', err: false });
      addToast('Generation complete!', 'success');
    } catch (e) {
      setStatus({ loading: false, msg: e.message || 'Failed.', err: true });
      addToast(e.message || 'Generation failed', 'error');
    } finally { setGenFromSelection(''); }
  };

  const saveItem = () => {
    if (!generated) return;
    if (generated.type === 'flashcards') {
      const cards = generated.data.map(c => ({ id: Date.now() + Math.random(), q: c.q, a: c.a, level: 0, nextReview: Date.now(), repetitions: 0, ef: 2.5, interval: 1, lastReview: Date.now() }));
      setFlashcards(p => [...p, { id: Date.now().toString(), docId: activeDoc.id, sourcePages: generated.pages, title: `Flashcards (Pgs ${generated.pages})`, cards, createdAt: new Date().toISOString() }]);
      addToast('Flashcards saved!', 'success');
    } else if (generated.type === 'exam') {
      setExams(p => [...p, { id: Date.now().toString(), docId: activeDoc.id, sourcePages: generated.pages, title: generated.title || 'Exam', questions: generated.data, createdAt: new Date().toISOString() }]);
      addToast('Exam saved!', 'success');
    } else {
      setNotes(p => [...p, { id: Date.now().toString(), docId: activeDoc.id, title: `${generated.customTitle || 'Summary'} Pgs ${generated.pages}`, content: generated.data, createdAt: new Date().toISOString() }]);
      addToast('Note saved!', 'success');
    }
    setGenerated(null); setStatus({ loading: false, msg: '', err: false }); switchToReview();
  };

  return (
    <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
      {!generated ? (
        <>
          {genFromSelection && (
            <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/30 rounded-lg p-3 flex items-center gap-2">
              <Sparkles size={16} className="text-amber-500 shrink-0"/>
              <span className="text-xs font-medium text-amber-800 dark:text-amber-400 truncate flex-1">Selected text ({genFromSelection.length} chars)</span>
              <button onClick={() => setGenFromSelection('')} className="text-amber-500 hover:text-red-500"><X size={14}/></button>
            </div>
          )}
          
          {!genFromSelection && (
            <div className="flex items-center gap-2">
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">From Page</label>
                <input type="number" min={1} max={activeDoc.totalPages} value={startPage} onChange={e => setStartPage(Number(e.target.value))} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent-color)]"/>
              </div>
              <div className="flex-1">
                <label className="text-xs text-gray-500 mb-1 block">To Page</label>
                <input type="number" min={1} max={activeDoc.totalPages} value={endPage} onChange={e => setEndPage(Number(e.target.value))} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[var(--accent-color)]"/>
              </div>
            </div>
          )}
          
          <div>
            <label className="text-xs text-gray-500 mb-2 block">Extract Mode</label>
            <div className="grid grid-cols-3 gap-2">
              <ToolBtn id="flashcards" active={type} set={setType} icon={Layers} label="Cards"/>
              <ToolBtn id="exam" active={type} set={setType} icon={CheckSquare} label="Exam"/>
              <ToolBtn id="summary" active={type} set={setType} icon={BookA} label="Summary"/>
              <ToolBtn id="clinical" active={type} set={setType} icon={Stethoscope} label="Case"/>
              <ToolBtn id="labs" active={type} set={setType} icon={Thermometer} label="Labs"/>
              <ToolBtn id="eli5" active={type} set={setType} icon={Baby} label="Simplify"/>
            </div>
          </div>
          
          {(type === 'flashcards' || type === 'exam') && (
            <div>
              <label className="text-xs text-gray-500 flex justify-between mb-2"><span>Count</span><span>{count}</span></label>
              <input type="range" min="5" max="50" value={count} onChange={e => setCount(parseInt(e.target.value))} className="w-full"/>
            </div>
          )}
          
          <div>
            <label className="text-xs text-gray-500 flex justify-between mb-2"><span>Difficulty</span><span>{difficultyLevels[difficulty - 1]}</span></label>
            <input type="range" min="1" max="3" value={difficulty} onChange={e => setDifficulty(parseInt(e.target.value))} className="w-full"/>
          </div>

          {status.loading && progress.total > 0 && (
            <div className="bg-gray-100 dark:bg-zinc-800 rounded-lg p-3">
              <div className="w-full bg-gray-200 dark:bg-zinc-700 rounded-full h-1.5 mb-1">
                <div className="bg-[var(--accent-color)] h-1.5 rounded-full transition-all" style={{ width: `${progress.total ? (progress.done / progress.total) * 100 : 0}%` }}/>
              </div>
              <p className="text-[10px] text-gray-500 text-center">{status.msg}</p>
            </div>
          )}

          <button onClick={handleGenerate} disabled={status.loading} className="w-full mt-2 py-3 bg-[var(--accent-color)] text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2 disabled:opacity-50">
            {status.loading ? <Loader2 size={16} className="animate-spin"/> : <Zap size={16}/>}
            {status.loading ? 'Generating...' : 'Generate'}
          </button>
          
          {status.msg && status.err && (
            <div className="p-3 bg-red-50 text-red-600 text-xs rounded-lg flex items-start gap-2 border border-red-200"><AlertCircle size={14} className="shrink-0 mt-0.5"/> {status.msg}</div>
          )}
        </>
      ) : (
        <div className="flex flex-col h-full bg-white dark:bg-zinc-900 border border-emerald-200 dark:border-emerald-800/50 rounded-xl overflow-hidden shadow-sm">
          <div className="bg-emerald-50 dark:bg-emerald-900/20 border-b border-emerald-100 dark:border-emerald-800/30 p-3 flex justify-between items-center">
            <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400">Ready ({generated.data?.length || 1})</span>
            <div className="flex gap-2">
              <button onClick={() => setGenerated(null)} className="px-3 py-1.5 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 rounded text-xs">Discard</button>
              <button onClick={saveItem} className="px-3 py-1.5 bg-emerald-600 text-white rounded text-xs font-medium">Save</button>
            </div>
          </div>
          <div className="overflow-y-auto p-4 space-y-4">
            {generated.type === 'flashcards' && generated.data.map((item, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-2"><span className="text-gray-400 mr-2 text-xs font-bold">Q</span>{item.q}</p>
                <p className="text-sm text-gray-600 dark:text-zinc-400"><span className="text-gray-400 mr-2 text-xs font-bold">A</span>{item.a}</p>
              </div>
            ))}
            {generated.type === 'exam' && generated.data.map((item, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 p-4 rounded-lg">
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-3"><span className="text-gray-400 mr-1">{idx + 1}.</span>{item.q}</p>
                <div className="space-y-1.5 mb-3">
                  {item.options.map((opt, oIdx) => (
                    <div key={oIdx} className={`text-xs p-2 rounded-md border ${oIdx === item.correct ? 'bg-emerald-100/50 border-emerald-300 text-emerald-800' : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400'}`}>
                      <span className="text-gray-400 mr-2">{String.fromCharCode(65 + oIdx)}.</span>{opt}
                    </div>
                  ))}
                </div>
                <div className="p-3 bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-md">
                  <span className="text-[10px] font-bold text-gray-500 uppercase block mb-1">Explanation</span>
                  <p className="text-xs text-gray-600 dark:text-zinc-400">{item.explanation}</p>
                </div>
              </div>
            ))}
            {generated.type !== 'flashcards' && generated.type !== 'exam' && (
              <div className="text-sm text-gray-700 dark:text-zinc-300 whitespace-pre-wrap">{generated.data}</div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function ToolBtn({ id, active, set, icon: Icon, label }) {
  const isA = active === id;
  return (
    <button onClick={() => set(id)} className={`py-2 flex flex-col items-center justify-center gap-1 rounded-lg text-xs font-medium border transition-colors ${isA ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white' : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-600 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}>
      <Icon size={16} className={isA ? 'text-white' : 'text-gray-400'}/> {label}
    </button>
  );
}

// ─── PANEL CHAT ───────────────────────────────────────────────────────────────
function PanelChat({ activeDoc, settings, currentPage }) {
  const [messages, setMessages] = useState([{ role: 'assistant', content: `Locked on Pg ${currentPage}. Ask me anything.` }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [contextMode, setContextMode] = useState('page');
  const endRef = useRef(null);

  useEffect(() => { setMessages([{ role: 'assistant', content: `Locked on Pg ${currentPage}. Ask me anything.` }]); }, [currentPage]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const handleChat = async () => {
    if (!input.trim() || loading) return;
    const msg = input; setInput(''); setMessages(p => [...p, { role: 'user', content: msg }]); setLoading(true);
    try {
      const pdfData = await getPdfData(activeDoc.id);
      let text = contextMode === 'page' ? pdfData?.pagesText?.[currentPage] || '' : Object.entries(pdfData?.pagesText || {}).map(([p, t]) => `[Page ${p}] ${t}`).join('\n').substring(0, 80000);
      const res = await callAI(`CONTEXT:\n${text}\n\nUSER QUESTION:\n${msg}`, false, false, settings.apiKey);
      setMessages(p => [...p, { role: 'assistant', content: res }]);
    } catch (e) {
      setMessages(p => [...p, { role: 'assistant', content: `⚠️ ${e.message}` }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="p-3 border-b border-gray-200 dark:border-zinc-800 shrink-0">
        <div className="flex bg-gray-100 dark:bg-zinc-800 rounded-lg p-1">
          <button onClick={() => setContextMode('page')} className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${contextMode === 'page' ? 'bg-white dark:bg-zinc-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Page {currentPage}</button>
          <button onClick={() => setContextMode('document')} className={`flex-1 py-1 text-xs font-medium rounded-md transition-colors ${contextMode === 'document' ? 'bg-white dark:bg-zinc-700 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700 dark:hover:text-gray-300'}`}>Full Doc</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-gray-200 dark:bg-zinc-700' : 'bg-[var(--accent-color)] text-white'}`}>
              {m.role === 'user' ? <UserCircle2 size={12}/> : <Bot size={12}/>}
            </div>
            <div className={`p-3 max-w-[85%] text-xs rounded-xl ${m.role === 'user' ? 'bg-gray-100 dark:bg-zinc-800 text-gray-900 dark:text-white rounded-tr-sm' : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-800 dark:text-zinc-200 rounded-tl-sm'}`}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-6 h-6 rounded-full bg-[var(--accent-color)] text-white flex items-center justify-center"><Bot size={12}/></div>
            <div className="p-3 bg-white border border-gray-200 rounded-xl rounded-tl-sm flex items-center"><Loader2 size={12} className="animate-spin text-gray-400"/></div>
          </div>
        )}
        <div ref={endRef}/>
      </div>
      <div className="p-3 border-t border-gray-200 dark:border-zinc-800 shrink-0">
        <div className="relative flex items-center">
          <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleChat()} placeholder="Ask something..." disabled={loading} className="w-full bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg py-2 pl-3 pr-10 text-sm outline-none focus:border-[var(--accent-color)]"/>
          <button onClick={handleChat} disabled={loading || !input.trim()} className="absolute right-2 text-[var(--accent-color)] disabled:text-gray-400"><Send size={16}/></button>
        </div>
      </div>
    </div>
  );
}

// ─── PANEL REVIEW ─────────────────────────────────────────────────────────────
function PanelReview({ activeDocId, flashcards, setFlashcards, exams, setExams, notes, setNotes, addToast }) {
  const [activeItem, setActiveItem] = useState(null);
  const [activeTab, setActiveTab] = useState('exams');
  
  const docCardSets = flashcards.filter(f => f.docId === activeDocId);
  const docExams = exams.filter(e => e.docId === activeDocId);
  const docNotes = notes.filter(n => n.docId === activeDocId);

  if (activeItem?.type === 'exam') return <InPanelExam exam={activeItem.data} onBack={() => setActiveItem(null)} onScoreUpdate={(id, score) => setExams(prev => prev.map(e => e.id === id ? { ...e, lastScore: score } : e))} addToast={addToast}/>;
  if (activeItem?.type === 'note') return <InPanelNote note={activeItem.data} onBack={() => setActiveItem(null)}/>;
  if (activeItem?.type === 'flashcards') return <InPanelFlashcards title={activeItem.data.title} initialCards={activeItem.data.cards} onBack={() => setActiveItem(null)} setFlashcards={setFlashcards} addToast={addToast}/>;

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      <div className="flex p-2 border-b border-gray-200 dark:border-zinc-800 shrink-0 bg-gray-50 dark:bg-zinc-950">
        {[['exams', 'Exams', docExams.length], ['flashcards', 'Cards', docCardSets.length], ['notes', 'Notes', docNotes.length]].map(([tab, label, count]) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-1.5 text-xs font-medium rounded-md flex justify-center items-center gap-1 ${activeTab === tab ? 'bg-white dark:bg-zinc-800 shadow-sm text-gray-900 dark:text-white' : 'text-gray-500 hover:text-gray-700'}`}>
            {label} <span className="bg-gray-200 dark:bg-zinc-700 text-gray-600 dark:text-zinc-300 text-[10px] px-1.5 rounded">{count}</span>
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {activeTab === 'exams' && (
          docExams.length === 0 ? <p className="text-center text-sm text-gray-500 mt-10">No exams generated yet.</p> :
          docExams.map(e => (
            <div key={e.id} className="border border-gray-200 dark:border-zinc-800 rounded-lg p-4 bg-white dark:bg-zinc-900">
              <p className="font-semibold text-sm mb-1 line-clamp-1">{e.title}</p>
              <p className="text-xs text-gray-500 mb-3">{e.questions.length} Qs • {e.lastScore !== undefined ? `Last: ${e.lastScore}%` : 'Not taken'}</p>
              <div className="flex gap-2">
                <button onClick={() => setActiveItem({ type: 'exam', data: e })} className="flex-1 py-1.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded text-xs font-medium">Take</button>
                <button onClick={() => setExams(exams.filter(ex => ex.id !== e.id))} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash size={14}/></button>
              </div>
            </div>
          ))
        )}
        {activeTab === 'flashcards' && (
          docCardSets.length === 0 ? <p className="text-center text-sm text-gray-500 mt-10">No flashcards yet.</p> :
          docCardSets.map(set => (
            <div key={set.id} className="border border-gray-200 dark:border-zinc-800 rounded-lg p-4 bg-white dark:bg-zinc-900">
              <p className="font-semibold text-sm mb-1 line-clamp-1">{set.title}</p>
              <p className="text-xs text-gray-500 mb-3">{set.cards?.length || 0} Cards</p>
              <div className="flex gap-2">
                <button onClick={() => setActiveItem({ type: 'flashcards', data: set })} className="flex-1 py-1.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded text-xs font-medium">Study</button>
                <button onClick={() => setFlashcards(flashcards.filter(f => f.id !== set.id))} className="p-1.5 text-red-500 hover:bg-red-50 rounded"><Trash size={14}/></button>
              </div>
            </div>
          ))
        )}
        {activeTab === 'notes' && (
          docNotes.length === 0 ? <p className="text-center text-sm text-gray-500 mt-10">No notes yet.</p> :
          docNotes.map(n => (
            <div key={n.id} onClick={() => setActiveItem({ type: 'note', data: n })} className="border border-gray-200 dark:border-zinc-800 rounded-lg p-4 bg-white dark:bg-zinc-900 cursor-pointer hover:border-[var(--accent-color)] transition-colors group relative">
              <p className="font-semibold text-sm mb-2 pr-6 line-clamp-1">{n.title}</p>
              <p className="text-xs text-gray-500 line-clamp-2">{n.content}</p>
              <button onClick={(e) => { e.stopPropagation(); setNotes(notes.filter(no => no.id !== n.id)); }} className="absolute top-4 right-4 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100"><Trash size={14}/></button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

// ─── IN-PANEL EXAM ─────────────────────────────────────────────────────────────
function InPanelExam({ exam, onBack, onScoreUpdate, addToast }) {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [examComplete, setExamComplete] = useState(false);

  const handleSelect = (idx) => {
    if (showFeedback) return;
    setSelectedAnswer(idx); setShowFeedback(true);
    if (idx === exam.questions[currentQIndex].correct) setScore(prev => prev + 1);
  };

  const nextQuestion = () => {
    setSelectedAnswer(null); setShowFeedback(false);
    if (currentQIndex < exam.questions.length - 1) setCurrentQIndex(currentQIndex + 1);
    else {
      const finalScore = Math.round((score / exam.questions.length) * 100);
      setExamComplete(true);
      if (onScoreUpdate) onScoreUpdate(exam.id, finalScore);
      addToast?.(`Exam finished! Score: ${finalScore}%`, finalScore >= 70 ? 'success' : 'info');
    }
  };

  const q = exam.questions[currentQIndex];

  if (examComplete) {
    const finalScore = Math.round((score / exam.questions.length) * 100);
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gray-50 dark:bg-zinc-950">
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-4 bg-white dark:bg-zinc-900 shadow-sm">
          <span className={`text-2xl font-bold ${finalScore >= 70 ? 'text-emerald-500' : 'text-red-500'}`}>{finalScore}%</span>
        </div>
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-1">Exam Complete</h2>
        <p className="text-sm text-gray-500 mb-6">{score} out of {exam.questions.length} correct</p>
        <div className="flex gap-2 w-full max-w-[200px]">
          <button onClick={onBack} className="flex-1 py-2 bg-gray-200 dark:bg-zinc-800 text-sm font-medium rounded-lg">Exit</button>
          <button onClick={() => { setCurrentQIndex(0); setScore(0); setSelectedAnswer(null); setShowFeedback(false); setExamComplete(false); }} className="flex-1 py-2 bg-[var(--accent-color)] text-white text-sm font-medium rounded-lg">Retry</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-zinc-950 overflow-hidden">
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 p-3 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="text-gray-500 text-sm font-medium flex items-center gap-1"><ChevronLeft size={16}/> Exit</button>
        <span className="text-xs font-medium text-gray-500">Q {currentQIndex + 1} / {exam.questions.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-4">
        {q.vignette && <div className="p-4 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-lg text-sm text-gray-700 dark:text-zinc-300 whitespace-pre-wrap">{q.vignette}</div>}
        <h2 className="text-sm font-semibold text-gray-900 dark:text-white">{q.q}</h2>
        <div className="space-y-2">
          {q.options.map((opt, idx) => (
            <button key={idx} onClick={() => handleSelect(idx)} disabled={showFeedback} className={`w-full text-left p-3 rounded-lg border text-sm transition-colors ${selectedAnswer === idx ? (idx === q.correct ? 'border-emerald-500 bg-emerald-50' : 'border-red-500 bg-red-50') : showFeedback && idx === q.correct ? 'border-emerald-500 bg-emerald-50' : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:bg-gray-50 dark:hover:bg-zinc-800'}`}>
              <span className="text-gray-400 mr-2">{String.fromCharCode(65 + idx)}.</span>{opt}
            </button>
          ))}
        </div>
        {showFeedback && (
          <div className="p-4 bg-gray-100 dark:bg-zinc-800 rounded-lg mt-2">
            <span className="text-xs font-bold text-gray-500 uppercase block mb-1">Explanation</span>
            <p className="text-sm text-gray-700 dark:text-zinc-300">{q.explanation}</p>
          </div>
        )}
      </div>
      <div className="p-4 bg-white dark:bg-zinc-900 border-t border-gray-200 dark:border-zinc-800 shrink-0">
        <button onClick={nextQuestion} disabled={!showFeedback} className="w-full py-2.5 bg-[var(--accent-color)] text-white disabled:opacity-50 rounded-lg text-sm font-medium">
          {currentQIndex < exam.questions.length - 1 ? 'Next Question' : 'Finish Exam'}
        </button>
      </div>
    </div>
  );
}

// ─── IN-PANEL FLASHCARDS ──────────────────────────────────────────────────────
function InPanelFlashcards({ title, initialCards, onBack, setFlashcards, addToast }) {
  const [cards, setCards] = useState(initialCards || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [sessionStats, setSessionStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });

  if (!cards || cards.length === 0) return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-gray-50 dark:bg-zinc-950">
      <CheckCircle2 size={48} className="text-emerald-500 mb-4"/>
      <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-6">Review Complete</h2>
      <button onClick={onBack} className="px-6 py-2 bg-[var(--accent-color)] text-white rounded-lg text-sm font-medium">Back</button>
    </div>
  );

  const currentCard = cards[currentIndex];

  const handleRate = (quality) => {
    const ratingKey = quality === 0 ? 'again' : quality === 3 ? 'hard' : quality === 4 ? 'good' : 'easy';
    setSessionStats(prev => ({ ...prev, [ratingKey]: prev[ratingKey] + 1 }));
    let newRep = currentCard.repetitions || 0, newEf = currentCard.ef || 2.5, newInterval = currentCard.interval || 1;
    if (quality < 3) { newRep = 0; newInterval = 1; }
    else { newEf = Math.max(1.3, newEf + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))); newRep++; newInterval = newRep === 1 ? 1 : newRep === 2 ? 6 : Math.round(newInterval * newEf); }
    const newCard = { ...currentCard, repetitions: newRep, ef: newEf, interval: newInterval, lastReview: Date.now(), nextReview: Date.now() + newInterval * 86400000 };
    setCards(prev => prev.map(c => c.id === newCard.id ? newCard : c));
    setFlashcards(gs => gs.map(set => ({ ...set, cards: set.cards ? set.cards.map(c => c.id === newCard.id ? newCard : c) : set.cards })));
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) setCurrentIndex(currentIndex + 1);
    else setCards([]);
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-zinc-950 overflow-hidden">
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 p-3 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="text-gray-500 text-sm font-medium flex items-center gap-1"><ChevronLeft size={16}/> Exit</button>
        <span className="text-xs font-medium text-gray-500">{currentIndex + 1} / {initialCards?.length || cards.length}</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-4">
        <div onClick={() => !isFlipped && setIsFlipped(true)} className="w-full max-w-sm min-h-[250px] bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl p-6 shadow-sm flex flex-col items-center justify-center text-center cursor-pointer relative">
          {!isFlipped ? (
            <>
              <span className="absolute top-4 left-4 text-[10px] font-bold text-gray-400 uppercase tracking-wider">Question</span>
              <p className="text-lg font-medium text-gray-900 dark:text-white mt-4">{currentCard.q}</p>
              <p className="absolute bottom-4 text-xs text-gray-400">Tap to reveal</p>
            </>
          ) : (
            <>
              <span className="absolute top-4 left-4 text-[10px] font-bold text-[var(--accent-color)] uppercase tracking-wider">Answer</span>
              <p className="text-base text-gray-800 dark:text-gray-200 mt-4 overflow-y-auto max-h-[300px] custom-scrollbar px-2">{currentCard.a}</p>
            </>
          )}
        </div>
        <div className={`w-full max-w-sm mt-6 grid grid-cols-4 gap-2 transition-opacity ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button onClick={() => handleRate(0)} className="py-2 bg-red-100 text-red-700 rounded-lg text-xs font-semibold">Again</button>
          <button onClick={() => handleRate(3)} className="py-2 bg-orange-100 text-orange-700 rounded-lg text-xs font-semibold">Hard</button>
          <button onClick={() => handleRate(4)} className="py-2 bg-emerald-100 text-emerald-700 rounded-lg text-xs font-semibold">Good</button>
          <button onClick={() => handleRate(5)} className="py-2 bg-blue-100 text-blue-700 rounded-lg text-xs font-semibold">Easy</button>
        </div>
      </div>
    </div>
  );
}

// ─── IN-PANEL NOTE ────────────────────────────────────────────────────────────
function InPanelNote({ note, onBack }) {
  const copyToClipboard = () => navigator.clipboard?.writeText(note.content);
  return (
    <div className="flex-1 flex flex-col bg-white dark:bg-zinc-900">
      <div className="border-b border-gray-200 dark:border-zinc-800 p-3 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="text-gray-500 text-sm font-medium flex items-center gap-1"><ChevronLeft size={16}/> Back</button>
        <button onClick={copyToClipboard} className="text-gray-500 hover:text-gray-900 p-1.5 rounded"><Clipboard size={16}/></button>
      </div>
      <div className="flex-1 overflow-y-auto p-5">
        <h2 className="text-lg font-bold text-gray-900 dark:text-white mb-4">{note.title}</h2>
        <div className="text-sm text-gray-700 dark:text-zinc-300 whitespace-pre-wrap">{note.content}</div>
      </div>
    </div>
  );
}