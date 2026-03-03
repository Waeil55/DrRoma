import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  BookOpen, Layers, CheckSquare, Settings, ChevronLeft, ChevronRight, Upload, MessageSquare,
  CheckCircle2, XCircle, BrainCircuit, Library, Trash2, Loader2, List, Send, ShieldAlert,
  GraduationCap, Save, X, BookA, Crosshair, PanelRightClose, PanelRightOpen, KeyRound, AlertCircle,
  FileUp, Target, Info, Trash, Sparkles, Activity, Stethoscope, Lightbulb, Baby, Play, Bookmark, History,
  Dna, Microscope, Pill, Thermometer, ClipboardList, Zap, Database, Search, FileText, BarChart2, Globe, Bot, Code, Palette, Type, Download, Mic,
  Moon, Sun, HelpCircle, Printer, Menu, FlaskConical, UserCircle2, TrendingUp, TrendingDown, Minus, Plus, ZoomIn, ZoomOut, Maximize,
  PlusCircle, RefreshCcw, Star, Award, Clock, Eye, EyeOff, ChevronUp, ChevronDown, Filter, SortAsc, Hash, Percent,
  AlertTriangle, CheckCheck, Clipboard, Share2, MoreVertical, Flame, Brain, Cpu, Layers3, Grid3x3, LayoutGrid, ListTodo, Presentation, Network, FastForward, CloudSun, MoonStar, FileSearch, MessageCircleQuestion
} from 'lucide-react';

// ==========================================
// 1. DATABASE & UTILITY LAYER
// ==========================================
const DB_NAME = 'MariamProDB_v22';
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
    if (req && req.onsuccess !== undefined) { req.onsuccess = () => resolve(req.result); req.onerror = () => reject(req.error); } 
    else { tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); }
  });
};

const savePdfData = (id, data) => dbOp(STORE_PDFS, 'readwrite', s => { s.put(data, id); });
const getPdfData = (id) => dbOp(STORE_PDFS, 'readonly', s => s.get(id));
const deletePdfData = (id) => dbOp(STORE_PDFS, 'readwrite', s => { s.delete(id); });
const saveAppState = (key, data) => dbOp(STORE_STATE, 'readwrite', s => { s.put(data, key); });
const getAppState = (key) => dbOp(STORE_STATE, 'readonly', s => s.get(key));

const loadPdfJs = async () => {
  if (window.pdfjsLib) return window.pdfjsLib;
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
    script.onload = () => {
      window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';
      resolve(window.pdfjsLib);
    };
    script.onerror = reject; document.body.appendChild(script);
  });
};

// ==========================================
// 2. SUPER TURBO AI ENGINE & PARALLEL PROCESSING
// ==========================================
const callAI = async (prompt, expectJson, strictMode, apiKey, maxTokens = 16384, model = 'gpt-4o-mini') => {
  if (!apiKey?.trim()) throw new Error("OpenAI API Key is missing. Please add it in Settings.");
  const sysPrompt = strictMode
    ? "SUPER STRICT RULE: You are an elite, flawless medical AI. You MUST extract information EXCLUSIVELY from the provided text. NO OUTSIDE KNOWLEDGE IS ALLOWED. EVERY answer MUST cite the exact [Page X] provided in the context."
    : "You are an elite, hyper-intelligent medical AI assistant. You possess vast clinical knowledge. When given context from a document, prioritize it heavily. Always be incredibly smart, helpful, and detailed.";
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey.trim()}` },
    body: JSON.stringify({ model, messages: [{ role: 'system', content: sysPrompt + (expectJson ? ' You MUST respond in strictly valid JSON format.' : '') }, { role: 'user', content: prompt }], response_format: expectJson ? { type: 'json_object' } : { type: 'text' }, max_tokens: maxTokens, temperature: strictMode ? 0.0 : 0.7, stream: false })
  });
  if (!response.ok) { const errData = await response.json().catch(() => ({})); throw new Error(`API Error: ${errData.error?.message || response.statusText}`); }
  const data = await response.json(); return data.choices[0].message.content.trim();
};

const parseJsonSafe = (text) => {
  let cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
  const first = cleaned.indexOf('{'), last = cleaned.lastIndexOf('}');
  if (first !== -1 && last !== -1) cleaned = cleaned.substring(first, last + 1);
  return JSON.parse(cleaned);
};

// ULTRA CONCURRENCY BATCH RUNNER
const runParallel = async (tasks, concurrency = 50, onProgress) => {
  const results = [];
  for (let i = 0; i < tasks.length; i += concurrency) {
    const batch = tasks.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(batch.map(fn => fn()));
    results.push(...batchResults);
    if (onProgress) onProgress(Math.min(i + concurrency, tasks.length), tasks.length);
  }
  return results;
};

// ==========================================
// 3. UI COMPONENTS & HOOKS
// ==========================================
function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((msg, type = 'success', duration = 3000) => {
    const id = Date.now(); setToasts(p => [...p, { id, msg, type }]); setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), duration);
  }, []);
  return { toasts, addToast };
}

function ToastContainer({ toasts }) {
  return (
    <div className="fixed top-24 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`px-5 py-4 rounded-2xl text-sm font-bold shadow-2xl glass border flex items-center gap-3 animate-slide-in pointer-events-auto ${t.type === 'success' ? 'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-400/30' : t.type === 'error' ? 'bg-red-500/20 text-red-700 dark:text-red-300 border-red-400/30' : 'bg-[var(--card)] text-[var(--text)] border-[var(--border)]'}`}>
          {t.type === 'success' ? <CheckCircle2 size={20}/> : t.type === 'error' ? <AlertCircle size={20}/> : <Info size={20}/>} {t.msg}
        </div>
      ))}
    </div>
  );
}

function GlobalProgressOverlay({ task, onCancel, onView }) {
  if (!task) return null;
  return (
    <div className="fixed bottom-24 right-4 md:right-8 z-[9999] glass bg-[var(--card)] rounded-3xl p-5 shadow-2xl border-2 border-[var(--accent)] flex flex-col gap-3 w-[calc(100%-32px)] md:w-[350px] animate-slide-in">
      <div className="flex justify-between items-center">
        <span className="text-xs font-black uppercase tracking-widest text-[var(--accent)] flex items-center gap-2">
          {task.isFinished ? <CheckCircle2 size={18}/> : <FastForward size={18} className="animate-pulse"/>} {task.title || 'Turbo Engine...'}
        </span>
        <button onClick={onCancel} className="text-[var(--text)] opacity-50 hover:opacity-100 hover:text-red-500 bg-black/5 dark:bg-white/5 p-1 rounded-lg"><X size={16}/></button>
      </div>
      <p className="text-xs text-[var(--text)] font-bold leading-snug">{task.msg}</p>
      {!task.isFinished && (
        <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-3 overflow-hidden mt-1">
          <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-soft)] h-full rounded-full transition-all duration-300" style={{ width: `${task.total ? (task.done / task.total) * 100 : 0}%` }}/>
        </div>
      )}
      {task.isFinished && (
        <button onClick={onView} className="w-full py-3 mt-2 bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 rounded-xl text-[11px] font-black uppercase tracking-widest transition-colors border border-[var(--accent)]/20">
          View Generated Intelligence
        </button>
      )}
    </div>
  );
}

// ─── LAB TABLE COMPONENTS (Screenshot Match) ──────────────────────────────────
function LabResultRow({ test, result, range, units, flag }) {
  const isLow = flag === 'L', isHigh = flag === 'H', isAbnormal = isLow || isHigh;
  return (
    <tr className="border-b border-gray-100 dark:border-zinc-800/60 hover:bg-gray-50/50 dark:hover:bg-zinc-800/30 transition-colors">
      <td className="py-3 px-4 text-xs font-bold text-gray-700 dark:text-zinc-300">{test}</td>
      <td className="py-3 px-4 text-xs text-center whitespace-nowrap">
        <span className={`font-black inline-flex items-center gap-1.5 ${isLow ? 'text-blue-600' : isHigh ? 'text-red-600' : 'text-gray-900 dark:text-white'}`}>
          {result}
          {flag && (
            <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-md leading-none ${isLow ? 'bg-blue-100 text-blue-700' : 'bg-red-100 text-red-700'}`}>{flag}</span>
          )}
        </span>
      </td>
      <td className="py-3 px-4 text-xs text-center text-gray-500 dark:text-zinc-500 font-mono tracking-tight">{range}</td>
      <td className="py-3 px-4 text-[10px] text-center text-gray-400 dark:text-zinc-600 font-mono uppercase">{units}</td>
    </tr>
  );
}

function LabTable({ rows }) {
  if (!rows || rows.length === 0) return null;
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#121214] shadow-sm mb-6">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50/80 dark:bg-zinc-900/80 border-b border-gray-200 dark:border-zinc-800">
            <th className="py-2.5 px-4 text-left text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500 w-2/5">Test</th>
            <th className="py-2.5 px-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500 w-1/5">Result</th>
            <th className="py-2.5 px-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500 w-1/5">Range</th>
            <th className="py-2.5 px-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500 w-1/5">Units</th>
          </tr>
        </thead>
        <tbody>{rows.map((row, i) => <LabResultRow key={i} {...row} />)}</tbody>
      </table>
    </div>
  );
}

// ─── MINI TUTOR CHAT (Contextual Learning) ────────────────────────────────────
function MiniTutorChat({ contextObj, settings }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading, isOpen]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const newMsgs = [...messages, { role: 'user', content: input }];
    setMessages(newMsgs); setInput(''); setLoading(true);
    try {
      const contextStr = JSON.stringify(contextObj, null, 2);
      const res = await callAI(
        `You are an elite medical tutor helping a student understand a specific question they just reviewed.
        
        CONTEXT OF CURRENT QUESTION/CASE:
        ${contextStr}
        
        STUDENT QUESTION:
        ${input}
        
        Provide a brilliant, concise, and helpful explanation based strictly on medical science and the provided context.`, 
        false, false, settings.apiKey, 2000
      );
      setMessages([...newMsgs, { role: 'assistant', content: res }]);
    } catch (e) {
      setMessages([...newMsgs, { role: 'assistant', content: `⚠️ Tutor Error: ${e.message}` }]);
    } finally { setLoading(false); }
  };

  if (!isOpen) return (
    <button onClick={() => setIsOpen(true)} className="mt-6 w-full py-4 bg-blue-50 hover:bg-blue-100 dark:bg-blue-900/20 dark:hover:bg-blue-900/40 text-blue-600 dark:text-blue-400 rounded-xl text-xs font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all border border-blue-200 dark:border-blue-800/50">
      <MessageCircleQuestion size={18}/> Ask AI Tutor About This
    </button>
  );

  return (
    <div className="mt-6 border-2 border-[var(--accent-color)]/30 bg-[var(--accent-color)]/5 rounded-2xl p-5 flex flex-col gap-4 animate-slide-in shadow-inner">
      <div className="flex items-center justify-between border-b border-[var(--accent-color)]/20 pb-3">
        <span className="text-xs font-black uppercase tracking-widest text-[var(--accent-color)] flex items-center gap-2"><Sparkles size={16}/> AI Tutor Mode</span>
        <button onClick={() => setIsOpen(false)} className="text-gray-500 hover:text-red-500 transition-colors"><X size={18}/></button>
      </div>
      <div className="max-h-64 overflow-y-auto custom-scrollbar space-y-4 pr-2">
        {messages.length === 0 && <p className="text-sm text-gray-500 dark:text-zinc-400 text-center italic py-4">Ask anything about this specific diagnosis, lab result, or explanation...</p>}
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${m.role === 'user' ? 'bg-[var(--accent-color)] text-white' : 'bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-[var(--accent-color)]'}`}>
              {m.role === 'user' ? <UserCircle2 size={16}/> : <BrainCircuit size={16}/>}
            </div>
            <div className={`p-4 text-sm leading-relaxed shadow-sm max-w-[85%] ${m.role === 'user' ? 'bg-[var(--accent-color)] text-white rounded-[1.5rem] rounded-tr-sm' : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[1.5rem] rounded-tl-sm whitespace-pre-wrap'}`}>{m.content}</div>
          </div>
        ))}
        {loading && <Loader2 size={18} className="text-[var(--accent-color)] animate-spin mx-auto my-3"/>}
        <div ref={endRef}/>
      </div>
      <div className="relative flex items-center mt-2">
        <input type="text" value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleSend()} placeholder="Ask your tutor..." disabled={loading} className="w-full bg-white dark:bg-zinc-900 border border-gray-300 dark:border-zinc-700 rounded-xl py-3 pl-4 pr-12 text-sm outline-none focus:border-[var(--accent-color)] shadow-sm"/>
        <button onClick={handleSend} disabled={loading || !input.trim()} className="absolute right-2 text-white bg-[var(--accent-color)] p-2 rounded-lg disabled:opacity-50 transition-transform active:scale-95"><Send size={14}/></button>
      </div>
    </div>
  );
}

// ==========================================
// 4. MAIN APP COMPONENT
// ==========================================
export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [openDocs, setOpenDocs] = useState([]);
  const [activeDocId, setActiveDocId] = useState(null);
  const [docPages, setDocPages] = useState({});
  const [flashcards, setFlashcards] = useState([]);
  const [exams, setExams] = useState([]);
  const [cases, setCases] = useState([]);
  const [notes, setNotes] = useState([]);
  const [chatSessions, setChatSessions] = useState([]);
  const [userSettings, setUserSettings] = useState({ apiKey: '', strictMode: true, theme: 'pure-white', fontSize: 'medium', accentColor: 'indigo' });
  
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentView, setCurrentView] = useState('library');
  const [rightPanelTab, setRightPanelTab] = useState('generate');
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const [aiWidth, setAiWidth] = useState(450);
  const [isResizing, setIsResizing] = useState(false);
  const [bgTask, setBgTask] = useState(null);
  const { toasts, addToast } = useToast();

  useEffect(() => {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = 'viewport'; document.head.appendChild(meta); }
    meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover';
  }, []);

  useEffect(() => {
    const loadData = async () => {
      try {
        const [savedDocs, savedCards, savedExams, savedCases, savedNotes, savedChats, savedSettings, savedOpen, savedPages] = await Promise.all([
          getAppState('docs'), getAppState('flashcards'), getAppState('exams'), getAppState('cases'), getAppState('notes'), getAppState('chats'), getAppState('settings'), getAppState('openDocs'), getAppState('docPages')
        ]);
        if (savedDocs) setDocuments(savedDocs); 
        if (savedCards) setFlashcards(savedCards); 
        if (savedExams) setExams(savedExams); 
        if (savedCases) setCases(savedCases); 
        if (savedNotes) setNotes(savedNotes); 
        if (savedChats) setChatSessions(savedChats); 
        if (savedSettings) setUserSettings(prev => ({ ...prev, ...savedSettings })); 
        if (savedOpen) setOpenDocs(savedOpen); 
        if (savedPages) setDocPages(savedPages);
      } catch (e) { console.warn('Storage read error', e); } finally { setIsLoaded(true); }
    };
    loadData();
  }, []);

  useEffect(() => {
    if (!isLoaded) return;
    const timer = setTimeout(async () => {
      try {
        const docsToSave = documents.map(d => { const c = { ...d }; delete c.pagesText; return c; });
        await Promise.all([
          saveAppState('docs', docsToSave), saveAppState('flashcards', flashcards), saveAppState('exams', exams), saveAppState('cases', cases), saveAppState('notes', notes), saveAppState('chats', chatSessions), saveAppState('settings', userSettings), saveAppState('openDocs', openDocs), saveAppState('docPages', docPages)
        ]);
      } catch (e) { console.warn('Storage write error', e); }
    }, 1000);
    return () => clearTimeout(timer);
  }, [documents, flashcards, exams, cases, notes, chatSessions, userSettings, openDocs, docPages, isLoaded]);

  const fontSizeMap = { small: '14px', medium: '16px', large: '18px', xl: '20px', xxl: '22px' };

  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light', 'dark', 'pure-white', 'oled');
    let activeTheme = userSettings.theme;
    if (activeTheme === 'system') {
      const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
      activeTheme = prefersDark ? 'dark' : 'pure-white';
    }
    root.classList.add(activeTheme);
    root.style.setProperty('color-scheme', (activeTheme === 'dark' || activeTheme === 'oled') ? 'dark' : 'light');
    root.style.fontSize = fontSizeMap[userSettings.fontSize] || '16px';

    const colors = { indigo: { hex: '#6366f1', rgb: '99, 102, 241', soft: '#4f46e5' }, purple: { hex: '#a855f7', rgb: '168, 85, 247', soft: '#9333ea' }, blue: { hex: '#3b82f6', rgb: '59, 130, 246', soft: '#2563eb' }, emerald: { hex: '#10b981', rgb: '16, 185, 129', soft: '#059669' }, rose: { hex: '#f43f5e', rgb: '244, 63, 94', soft: '#e11d48' } };
    const color = colors[userSettings.accentColor] || colors.indigo;
    root.style.setProperty('--accent', color.hex);
    root.style.setProperty('--accent-rgb', color.rgb);
    root.style.setProperty('--accent-soft', color.soft);
    root.style.setProperty('--accent-color', color.hex);
  }, [userSettings.theme, userSettings.fontSize, userSettings.accentColor]);

  useEffect(() => {
    const handleMove = (e) => {
      if (!isResizing) return;
      const clientX = e.touches && e.touches.length > 0 ? e.touches[0].clientX : e.clientX;
      if (clientX !== undefined) {
         const newWidth = Math.max(320, Math.min(window.innerWidth - clientX, window.innerWidth - 300));
         setAiWidth(newWidth);
      }
    };
    const handleUp = () => { if (isResizing) setIsResizing(false); };
    if (isResizing) {
      document.addEventListener('mousemove', handleMove); document.addEventListener('mouseup', handleUp);
      document.addEventListener('touchmove', handleMove, { passive: false }); document.addEventListener('touchend', handleUp);
      document.body.style.userSelect = 'none';
    } else { document.body.style.userSelect = ''; }
    return () => { 
      document.removeEventListener('mousemove', handleMove); document.removeEventListener('mouseup', handleUp);
      document.removeEventListener('touchmove', handleMove); document.removeEventListener('touchend', handleUp);
      document.body.style.userSelect = ''; 
    };
  }, [isResizing]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== 'application/pdf') return;
    setIsUploading(true); setUploadProgress(10);
    try {
      const arrayBuffer = await file.arrayBuffer(); setUploadProgress(30);
      const pdfjsLib = await loadPdfJs(); setUploadProgress(50);
      const loadingTask = pdfjsLib.getDocument({ data: arrayBuffer });
      const pdf = await loadingTask.promise;
      const totalPages = pdf.numPages; const pagesText = {};
      for (let i = 1; i <= totalPages; i++) {
        try { const page = await pdf.getPage(i); const textContent = await page.getTextContent(); pagesText[i] = textContent.items.map(s => s.str).join(' '); page.cleanup(); } catch (e) { pagesText[i] = ''; }
        setUploadProgress(50 + Math.floor((i / totalPages) * 40));
      }
      try { await loadingTask.destroy(); } catch (e) {}
      const id = Date.now().toString();
      const newDoc = { id, name: file.name, totalPages, progress: 1, addedAt: new Date().toISOString() };
      await savePdfData(id, { buffer: arrayBuffer, pagesText });
      setDocuments(prev => [...prev, newDoc]); setOpenDocs(prev => prev.includes(id) ? prev : [...prev, id]); setActiveDocId(id); setDocPages(prev => ({ ...prev, [id]: 1 })); setCurrentView('reader'); setRightPanelOpen(true);
      addToast(`"${file.name}" uploaded successfully!`, 'success');
    } catch (error) { console.error(error); addToast('Upload failed.', 'error'); } finally { setIsUploading(false); setUploadProgress(0); if (event.target) event.target.value = ''; }
  };

  const closeDoc = (id) => {
    setOpenDocs(prev => prev.filter(d => d !== id));
    if (activeDocId === id) { const newActive = openDocs.filter(d => d !== id)[0] || null; setActiveDocId(newActive); if (!newActive && currentView === 'reader') setCurrentView('library'); }
  };

  const deleteDocument = async (id, e) => {
    if (e) e.stopPropagation();
    await deletePdfData(id);
    setDocuments(prev => prev.filter(d => d.id !== id)); setFlashcards(prev => prev.filter(f => f.docId !== id)); setExams(prev => prev.filter(ex => ex.docId !== id)); setCases(prev => prev.filter(c => c.docId !== id)); setNotes(prev => prev.filter(n => n.docId !== id));
    closeDoc(id); addToast('Document deleted', 'info');
  };

  const activeDoc = documents.find(d => d.id === activeDocId);
  const filteredDocuments = searchQuery ? documents.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase())) : documents;

  // SUPER TURBO BACKGROUND GENERATOR (1000x Faster Approach)
  const startBackgroundGeneration = async (taskType, docId, startPage, endPage, params) => {
    if (bgTask) { addToast("A generation is already running in background.", "info"); return; }
    setBgTask({ title: `Super Turbo ${taskType} Generation`, msg: 'Executing Mass Parallel Neural Extraction...', done: 0, total: 100, isFinished: false, result: null });
    
    try {
      const pdfData = await getPdfData(docId);
      const pagesText = pdfData?.pagesText || {};
      let text = '';
      for (let i = Number(startPage); i <= Number(endPage); i++) { 
        if (pagesText[i]) text += `\n\n--- [PAGE ${i}] ---\n${pagesText[i]}\n\n`; 
      }
      if (!text.trim() || text.length < 20) throw new Error('Not enough readable text found on these pages.');
      
      const diffPrompt = `Difficulty Level: ${params.difficultyLevel || 'Expert'}. Make output incredibly advanced, deep, and highly detailed. YOU MUST STRICTLY CITE EXACT EVIDENCE AND THE EXACT PAGE NUMBER FROM THE TEXT FOR EVERY SINGLE ANSWER.`;
      let resultData = null;

      if (taskType === 'flashcards' || taskType === 'exam' || taskType === 'cases') {
        // TURBO CHUNKING: Generate ultra-small chunks via massive parallel requests.
        const CHUNK_SIZE = taskType === 'cases' ? 1 : (taskType === 'exam' ? 3 : 5); 
        const count = params.count || 25;
        const numChunks = Math.ceil(count / CHUNK_SIZE); 
        setBgTask(p => ({ ...p, total: numChunks, done: 0, msg: `Igniting ${numChunks} parallel API threads...` }));
        
        const tasks = Array.from({ length: numChunks }, (_, i) => {
          const countForChunk = (i === numChunks - 1 && count % CHUNK_SIZE !== 0) ? count % CHUNK_SIZE : CHUNK_SIZE;
          const p = `${diffPrompt}\n\nSTRICT INSTRUCTION: Create exactly ${countForChunk} unique items representing the most high-yield concepts from this text ONLY.\n\nTEXT SOURCE:\n${text}`;
          let formatPrompt = '';
          
          if (taskType === 'cases') {
            formatPrompt = `\n\nGenerate EXACTLY ${countForChunk} highly realistic, complex USMLE-style patient case(s) based ONLY on the provided text topics.
            
            CRITICAL REQUIREMENTS:
            1. LONG, highly comprehensive patient vignette (HPI, ROS, Physical Exam).
            2. STRICT RULE: AT LEAST 12 ROWS of laboratory results are MANDATORY for every single case. Group them into panels (e.g. CBC, CMP, LFTs). Include "flag" ("H"/"L") for abnormals. If the exact labs aren't in the text, infer appropriate expected labs for the disease discussed in the text to reach 12 rows.
            3. A high-quality multiple choice question based on the vignette.
            4. Explicit text evidence and exact source page number proving the answer.

            Format STRICTLY as JSON:
            {
              "cases": [
                {
                  "title": "Case Title",
                  "vignette": "A 35-year-old female presents...",
                  "diagnosis": "Diagnosis",
                  "labPanels": [
                    {
                      "panelName": "COMPREHENSIVE METABOLIC & CBC (MUST HAVE 12+ ROWS)",
                      "rows": [
                        {"test": "WBC", "result": "15.2", "flag": "H", "range": "4.5-11.0", "units": "K/uL"},
                        // ... [GENERATE AT LEAST 11 MORE ROWS HERE TO MEET THE 12+ REQUIREMENT] ...
                      ]
                    }
                  ],
                  "examQuestion": {
                    "q": "What is the most likely contributing factor?",
                    "options": ["A) Acute cholecystitis", "B) Opioid overdose", "C) Prescription opioid abuse", "D) Hepatitis C"],
                    "correct": 0,
                    "explanation": "Detailed explanation...",
                    "evidence": "Exact short quote from the text proving this answer.",
                    "sourcePage": integer_page_number
                  }
                }
              ]
            }`;
          } else if (taskType === 'flashcards') {
            formatPrompt = '\n\nFormat as JSON: { "items": [ {"q": "Question", "a": "Answer", "evidence": "Exact short quote from text proving this", "sourcePage": page_number_integer} ] }';
          } else if (taskType === 'exam') {
            formatPrompt = '\n\nFormat as JSON: { "title": "Generated Exam", "items": [ { "q": "Question", "options": ["A","B","C","D","E"], "correct": 0, "explanation": "Explanation", "evidence": "Exact short quote from text", "sourcePage": page_number_integer } ] }';
          }
          
          return () => callAI(p + formatPrompt, true, userSettings.strictMode, userSettings.apiKey, 8000);
        });
        
        let allItems = [];
        // MASSIVE CONCURRENCY: Set to 50 to fire all chunks practically at once
        const results = await runParallel(tasks, 50, (done, total) => { setBgTask(p => ({ ...p, done, total, msg: `Turbo Threading: ${done}/${total} batches processed...` })); });
        
        for (const res of results) { 
          if (res.status === 'fulfilled') { 
            try { 
              const parsed = parseJsonSafe(res.value); 
              const items = parsed.items || parsed.questions || parsed.cases || []; 
              allItems = [...allItems, ...items]; 
            } catch (e) { console.warn('Chunk parse failed', e); } 
          } 
        }
        if (allItems.length === 0) throw new Error('AI failed to extract valid items. Please check text or API key.');
        
        const baseTitle = taskType === 'cases' ? 'Patient Cases Block' : 'Generated Assessment';
        resultData = { type: taskType, title: baseTitle, data: allItems.slice(0, count), pages: `${startPage}-${endPage}` };
      } else {
        setBgTask(p => ({ ...p, total: 1, done: 0, msg: `Running fast neural extraction...` }));
        const p = `${diffPrompt}\nPerform the following task based ONLY on this medical text.\nTASK: ${taskType}\nRespond in Markdown.\n\nTEXT:\n${text}`;
        const raw = await callAI(p, false, userSettings.strictMode, userSettings.apiKey, 8000);
        const titles = { clinical: 'Clinical Summary', differential: 'Differential Diagnosis', treatment: 'Treatment Plan', labs: 'Lab Interpretation', eli5: 'Simplify (ELI5)', summary: 'Summary', mnemonics: 'Mnemonics', plan: 'Study Plan', mindmap: 'Mind Map', quizlet: 'Quizlet Export' };
        resultData = { type: taskType, data: raw, pages: `${startPage}-${endPage}`, customTitle: titles[taskType] || taskType };
        setBgTask(p => ({ ...p, done: 1 }));
      }
      setBgTask(p => ({ ...p, isFinished: true, result: resultData, msg: 'Ultra-Fast Generation Complete! Click below to view.' }));
      addToast('Super Turbo Generation Complete!', 'success');
    } catch (e) { setBgTask(null); addToast(e.message || 'Generation failed', 'error'); }
  };

  const handleViewBgTask = () => {
    if (!bgTask?.result) return;
    setCurrentView('reader'); setRightPanelOpen(true); setRightPanelTab('generate');
  };
  const clearTask = () => setBgTask(null);

  if (!isLoaded) return <div className="h-screen w-screen flex flex-col items-center justify-center bg-[var(--bg)] gap-6"><Loader2 className="animate-spin text-[var(--accent)]" size={64}/><p className="font-black text-[var(--text)] uppercase tracking-[0.3em] text-sm opacity-50">Booting Nexus...</p></div>;

  return (
    <div className="h-screen w-screen flex flex-col overflow-hidden bg-[var(--bg)] text-[var(--text)] selection:bg-[var(--accent)] selection:text-white">
      <style>{`
        .pure-white { --bg: #ffffff; --text: #0f172a; --card: #f8fafc; --border: #e2e8f0; }
        .light { --bg: #f5f7ff; --text: #1e293b; --card: #ffffff; --border: #e2e8f0; }
        .dark  { --bg: #0f111a; --text: #e2e8f0; --card: #161a27; --border: #27273c; }
        .oled  { --bg: #000000; --text: #f1f5f9; --card: #0a0a0a; --border: #1e1e1e; }
        body { margin: 0; padding: 0; background: var(--bg); transition: background-color 0.3s ease; overflow: hidden; font-family: 'Inter', system-ui; }
        .title-font { font-family: 'Space Grotesk', sans-serif; }
        .glass { background: var(--card); border: 1px solid var(--border); box-shadow: 0 4px 20px rgba(0,0,0,0.03); }
        .btn-accent { background: linear-gradient(135deg, var(--accent), var(--accent-soft)); color: white; border: none; }
        .btn-accent:hover { transform: translateY(-2px); box-shadow: 0 10px 20px rgba(var(--accent-rgb), 0.3); }
        .card-hover { transition: 0.3s ease; }
        .card-hover:hover { transform: translateY(-4px); box-shadow: 0 15px 35px rgba(0,0,0,0.08); border-color: rgba(var(--accent-rgb), 0.4); }
        .bottom-nav { background: var(--card); border: 1px solid var(--border); box-shadow: 0 -5px 30px rgba(0,0,0,0.1); border-radius: 2rem; z-index: 999; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; height: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.25); border-radius: 10px; }
        .pdf-text-layer { position: absolute; inset: 0; overflow: hidden; opacity: 1; line-height: 1; }
        .pdf-text-layer span { position: absolute; color: transparent; transform-origin: 0% 0%; white-space: pre; cursor: text; }
        canvas { width: 100% !important; height: auto !important; display: block; }
        @keyframes slide-in { from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); } }
        .animate-slide-in { animation: slide-in 0.3s ease-out forwards; }
      `}</style>
      
      <ToastContainer toasts={toasts}/>
      <GlobalProgressOverlay task={bgTask} onCancel={clearTask} onView={handleViewBgTask} />

      {/* TOP HEADER */}
      <div className="h-16 md:h-20 glass flex items-center justify-between px-4 md:px-8 z-40 shrink-0 rounded-none border-t-0 border-l-0 border-r-0">
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2 md:gap-3">
            <span className="title-font text-2xl md:text-3xl font-black tracking-tighter text-[var(--accent)]">MARIAM</span>
            <span className="text-[10px] md:text-xs font-black bg-[var(--accent)] text-white px-3 py-1 rounded-full shadow-md">PRO</span>
          </div>
        </div>
        <div className="hidden md:block flex-1 max-w-xl px-8">
          <div className="relative group">
            <input type="text" value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search nexus..." 
                   className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-[var(--accent)]/50 rounded-full py-3 pl-12 pr-6 text-sm outline-none transition-all focus:shadow-md text-[var(--text)]"/>
            <Search className="absolute left-4 top-3 text-[var(--text)] opacity-50 group-focus-within:text-[var(--accent)] group-focus-within:opacity-100 transition-colors" size={20}/>
          </div>
        </div>
        <div className="flex items-center gap-3 md:gap-5">
          <button onClick={() => setCurrentView('settings')} className="w-10 h-10 flex items-center justify-center rounded-xl glass hover:bg-black/5 dark:hover:bg-white/10 transition-all text-[var(--text)] opacity-70 hover:opacity-100"><Settings size={20}/></button>
          <div onClick={() => { setRightPanelOpen(!rightPanelOpen); if(currentView !== 'reader' && activeDocId) setCurrentView('reader'); }} className="hidden md:flex items-center gap-3 bg-[var(--accent)]/10 px-5 py-2.5 rounded-full cursor-pointer hover:bg-[var(--accent)]/20 transition-all border border-[var(--accent)]/20 text-[var(--accent)]">
            <Sparkles size={18}/>
            <span className="font-bold text-xs uppercase tracking-widest">AI Studio</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-soft)] flex items-center justify-center text-white font-black shadow-lg">WP</div>
        </div>
      </div>

      {/* MAIN BODY FLEX CONTAINER */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {isUploading && (
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[var(--border)] z-50 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-soft)] transition-all duration-300 shadow-[0_0_15px_var(--accent)]" style={{ width: `${uploadProgress}%` }}/>
          </div>
        )}

        {/* SIDEBAR (Desktop) */}
        <div className="hidden lg:flex w-[100px] flex-col items-center py-8 glass shrink-0 rounded-none border-t-0 border-b-0 border-l-0 z-30">
          <div onClick={() => setCurrentView('library')} className="w-16 h-16 rounded-3xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-soft)] flex items-center justify-center cursor-pointer mb-10 shadow-lg hover:scale-105 transition-transform"><BrainCircuit size={28} className="text-white"/></div>
          <div className="flex flex-col gap-6 w-full px-2">
            <SidebarBtn icon={Library} label="Library" active={currentView === 'library'} onClick={() => setCurrentView('library')}/>
            <SidebarBtn icon={BookOpen} label="Reader" active={currentView === 'reader'} onClick={() => { if(activeDocId) setCurrentView('reader'); }} disabled={!activeDocId}/>
            <SidebarBtn icon={Layers} label="Cards" active={currentView === 'flashcards'} onClick={() => setCurrentView('flashcards')}/>
            <SidebarBtn icon={GraduationCap} label="Exams" active={currentView === 'exams'} onClick={() => setCurrentView('exams')}/>
            <SidebarBtn icon={Activity} label="Cases" active={currentView === 'cases'} onClick={() => setCurrentView('cases')}/>
            <SidebarBtn icon={MessageSquare} label="Chat" active={currentView === 'chat'} onClick={() => setCurrentView('chat')}/>
          </div>
        </div>

        {/* MAIN VIEWS AREA */}
        <main className="flex-1 flex flex-col relative min-w-0 min-h-0 overflow-hidden">
          <div className={`flex-1 flex flex-col min-h-0 overflow-hidden ${currentView === 'library' ? 'flex' : 'hidden'}`}><LibraryView documents={filteredDocuments} onUpload={handleFileUpload} onOpen={(id) => { setOpenDocs(prev => prev.includes(id) ? prev : [...prev, id]); setActiveDocId(id); setCurrentView('reader'); }} isUploading={isUploading} deleteDocument={deleteDocument} flashcards={flashcards} exams={exams} cases={cases} /></div>
          <div className={`flex-1 flex flex-col min-h-0 overflow-hidden ${currentView === 'flashcards' ? 'flex' : 'hidden'}`}><FlashcardsGlobalView flashcards={flashcards} setFlashcards={setFlashcards} addToast={addToast} exams={exams} notes={notes} setCurrentPage={(p) => setDocPages(prev => ({...prev, [activeDocId]: p}))} setRightPanelOpen={setRightPanelOpen} setCurrentView={setCurrentView} settings={userSettings} /></div>
          <div className={`flex-1 flex flex-col min-h-0 overflow-hidden ${currentView === 'exams' ? 'flex' : 'hidden'}`}><ExamsGlobalView exams={exams} setExams={setExams} addToast={addToast} setCurrentPage={(p) => setDocPages(prev => ({...prev, [activeDocId]: p}))} setRightPanelOpen={setRightPanelOpen} setCurrentView={setCurrentView} settings={userSettings}/></div>
          <div className={`flex-1 flex flex-col min-h-0 overflow-hidden ${currentView === 'cases' ? 'flex' : 'hidden'}`}><CasesGlobalView cases={cases} setCases={setCases} addToast={addToast} setCurrentPage={(p) => setDocPages(prev => ({...prev, [activeDocId]: p}))} setRightPanelOpen={setRightPanelOpen} setCurrentView={setCurrentView} settings={userSettings}/></div>
          <div className={`flex-1 flex flex-col min-h-0 overflow-hidden ${currentView === 'chat' ? 'flex' : 'hidden'}`}><ChatGlobalView documents={documents} settings={userSettings} chatSessions={chatSessions} setChatSessions={setChatSessions} addToast={addToast} /></div>
          <div className={`flex-1 flex flex-col min-h-0 overflow-hidden ${currentView === 'settings' ? 'flex' : 'hidden'}`}><PanelSettings settings={userSettings} setSettings={setUserSettings} /></div>
          <div className={`flex-1 flex flex-col min-h-0 overflow-hidden ${currentView === 'reader' && activeDocId ? 'flex' : 'hidden'}`}>
            {activeDocId && <PdfWorkspace activeDoc={activeDoc} setDocuments={setDocuments} closeDoc={() => setCurrentView('library')} rightPanelOpen={rightPanelOpen} setRightPanelOpen={setRightPanelOpen} currentPage={docPages[activeDocId] || 1} setCurrentPage={(updater) => setDocPages(prev => ({ ...prev, [activeDocId]: typeof updater === 'function' ? updater(prev[activeDocId] || 1) : updater }))} openDocs={openDocs} setActiveDocId={setActiveDocId} closeTab={(id) => setOpenDocs(p => p.filter(d=>d!==id))} documents={documents} isResizing={isResizing} />}
          </div>
        </main>

        {/* DRAG RESIZER FOR TOUCH & MOUSE */}
        {activeDocId && currentView === 'reader' && rightPanelOpen && (
          <div className="flex w-6 md:w-3 hover:w-8 active:w-8 cursor-col-resize glass bg-black/5 dark:bg-white/5 hover:bg-[var(--accent)]/40 items-center justify-center shrink-0 z-[120] touch-none transition-colors"
            onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }}
            onTouchStart={() => setIsResizing(true)}
            style={{ backgroundColor: isResizing ? 'rgba(var(--accent-rgb), 0.5)' : '' }}>
            <div className="w-1.5 h-20 bg-[var(--text)] opacity-20 rounded-full pointer-events-none"/>
          </div>
        )}

        {/* AI STUDIO PANEL */}
        <aside style={{ width: typeof window !== 'undefined' && window.innerWidth > 768 ? `${aiWidth}px` : '100%', display: (activeDocId && currentView === 'reader' && rightPanelOpen) ? 'flex' : 'none' }} className="glass shrink-0 flex-col z-[100] absolute inset-0 md:relative animate-slide-in rounded-none border-t-0 border-b-0 border-r-0 shadow-[-10px_0_30px_rgba(0,0,0,0.05)]">
          <div className="h-16 md:h-20 flex items-center justify-between px-6 bg-[var(--accent)] text-white shrink-0 shadow-md">
            <span className="font-black title-font text-xl tracking-wide flex items-center gap-3"><Sparkles size={24}/> AI Studio</span>
            <button onClick={() => setRightPanelOpen(false)} className="p-2 rounded-xl hover:bg-white/20 transition-colors"><X size={24}/></button>
          </div>
          <div className="flex gap-2 p-3 bg-black/5 dark:bg-white/5 shrink-0 overflow-x-auto custom-scrollbar border-b border-[var(--border)]">
            <PanelTab active={rightPanelTab === 'generate'} onClick={() => setRightPanelTab('generate')} label="Extract" icon={Zap}/>
            <PanelTab active={rightPanelTab === 'chat'} onClick={() => setRightPanelTab('chat')} label="Chat" icon={MessageSquare}/>
            <PanelTab active={rightPanelTab === 'review'} onClick={() => setRightPanelTab('review')} label="Vault" icon={Database}/>
          </div>
          <div className="flex-1 flex flex-col relative min-h-0" style={{ pointerEvents: isResizing ? 'none' : 'auto' }}>
            <div className={`flex-1 flex flex-col min-h-0 ${rightPanelTab === 'generate' ? 'flex' : 'hidden'}`}><PanelGenerate activeDoc={activeDoc} bgTask={bgTask} onStartGenerate={startBackgroundGeneration} onClearTask={clearTask} setFlashcards={setFlashcards} setExams={setExams} setCases={setCases} setNotes={setNotes} switchToReview={() => setRightPanelTab('review')} currentPage={docPages[activeDocId] || 1} addToast={addToast} settings={userSettings}/></div>
            <div className={`flex-1 flex flex-col min-h-0 ${rightPanelTab === 'chat' ? 'flex' : 'hidden'}`}><PanelChat activeDoc={activeDoc} settings={userSettings} currentPage={docPages[activeDocId] || 1}/></div>
            <div className={`flex-1 flex flex-col min-h-0 ${rightPanelTab === 'review' ? 'flex' : 'hidden'}`}><PanelReview activeDocId={activeDocId} flashcards={flashcards} setFlashcards={setFlashcards} exams={exams} setExams={setExams} cases={cases} setCases={setCases} notes={notes} setNotes={setNotes} addToast={addToast} setCurrentPage={(p) => setDocPages(prev => ({...prev, [activeDocId]: p}))} setRightPanelOpen={setRightPanelOpen} setCurrentView={setCurrentView} settings={userSettings}/></div>
          </div>
        </aside>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="lg:hidden absolute bottom-4 left-2 right-2 p-2 bottom-nav flex justify-around items-center z-[999] pb-[env(safe-area-inset-bottom)]">
        <MobileNavBtn icon={Library} label="Library" active={currentView === 'library'} onClick={() => setCurrentView('library')}/>
        <MobileNavBtn icon={BookOpen} label="Reader" active={currentView === 'reader'} onClick={() => { if(activeDocId) setCurrentView('reader'); }} disabled={!activeDocId}/>
        <MobileNavBtn icon={Layers} label="Cards" active={currentView === 'flashcards'} onClick={() => setCurrentView('flashcards')}/>
        <MobileNavBtn icon={Activity} label="Cases" active={currentView === 'cases'} onClick={() => setCurrentView('cases')}/>
        <MobileNavBtn icon={GraduationCap} label="Exams" active={currentView === 'exams'} onClick={() => setCurrentView('exams')}/>
        <MobileNavBtn icon={MessageSquare} label="Chat" active={currentView === 'chat'} onClick={() => setCurrentView('chat')}/>
      </div>
    </div>
  );
}

// ─── SUB-COMPONENTS ────────────────────────────────────────────────────────────

function SidebarBtn({ icon: Icon, label, active, onClick, disabled }) {
  return (
    <button onClick={onClick} disabled={disabled} className={`flex flex-col items-center gap-2 text-[10px] font-bold uppercase tracking-widest transition-all w-full py-3 group ${disabled ? 'opacity-30 cursor-not-allowed' : 'cursor-pointer'}`}>
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all border border-transparent ${active ? 'bg-[var(--accent)] text-white shadow-lg scale-110' : 'text-[var(--text)] opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 group-hover:border-[var(--border)] group-hover:scale-105'}`}><Icon size={22} strokeWidth={active ? 2.5 : 2}/></div>
      <span className={active ? 'text-[var(--accent)]' : 'text-[var(--text)] opacity-70 group-hover:opacity-100'}>{label}</span>
    </button>
  );
}

function MobileNavBtn({ icon: Icon, label, active, onClick, disabled }) {
  return (
    <button onClick={disabled ? undefined : onClick} disabled={disabled} className={`flex flex-col items-center justify-center gap-1 transition-all p-2 rounded-2xl min-w-[60px] ${active ? 'text-[var(--accent)] bg-[var(--accent)]/10 shadow-sm' : 'text-[var(--text)] opacity-60 hover:opacity-100 hover:bg-black/5'} ${disabled ? 'opacity-30' : 'cursor-pointer'}`}>
      <Icon size={22} strokeWidth={active ? 2.5 : 2} className={active ? 'transform -translate-y-0.5 transition-transform' : ''}/>
      <span className="text-[9px] font-bold tracking-wide">{label}</span>
    </button>
  );
}

function PanelTab({ active, onClick, label, icon: Icon }) {
  return (
    <button onClick={onClick} className={`flex-1 flex items-center justify-center gap-2 py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm ${active ? 'bg-[var(--card)] text-[var(--accent)] border border-[var(--border)]' : 'text-[var(--text)] opacity-60 hover:opacity-100 hover:bg-[var(--card)] border border-transparent'}`}><Icon size={16}/> <span className="hidden sm:inline">{label}</span></button>
  );
}

// ─── MAIN VIEWS ───────────────────────────────────────────────────────────────

function LibraryView({ documents, onUpload, onOpen, isUploading, deleteDocument, flashcards, exams, cases }) {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-screen-2xl mx-auto p-6 md:p-12 pb-32">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
          <div><h1 className="title-font text-5xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent)] to-[var(--accent-soft)]">Intelligence Nexus</h1><p className="text-lg md:text-xl text-[var(--text)] opacity-60 mt-4 font-medium">Premium medical AI workspace</p></div>
          <label className={`cursor-pointer btn-accent flex items-center gap-3 text-sm font-black uppercase tracking-widest shadow-2xl px-8 py-4 rounded-2xl ${isUploading ? 'opacity-50' : ''}`}>
            {isUploading ? <Loader2 className="animate-spin" size={24}/> : <FileUp size={24}/>}{isUploading ? 'IMPORTING...' : 'IMPORT PDF'}
            <input type="file" accept="application/pdf" className="hidden" onChange={onUpload} disabled={isUploading}/>
          </label>
        </div>
        {documents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {documents.map(doc => {
              const docCards = flashcards.filter(f => f.docId === doc.id).reduce((sum, set) => sum + (set.cards?.length||0), 0);
              const docExamsNum = exams.filter(e => e.docId === doc.id).length;
              const docCasesNum = cases.filter(c => c.docId === doc.id).length;
              return (
                <div key={doc.id} onClick={() => onOpen(doc.id)} className="card-hover glass rounded-[2rem] overflow-hidden cursor-pointer flex flex-col relative group">
                  <button onClick={(e) => deleteDocument(doc.id, e)} className="absolute top-4 right-4 z-20 w-12 h-12 bg-black/50 hover:bg-red-500/90 backdrop-blur-md rounded-2xl text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all shadow-xl"><Trash2 size={20}/></button>
                  <div className="h-48 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-soft)] relative flex items-center justify-center"><BookOpen size={64} className="text-white opacity-40 group-hover:scale-110 transition-transform duration-500"/></div>
                  <div className="p-6 flex-1 flex flex-col"><h3 className="font-bold text-base md:text-lg leading-snug line-clamp-2 mb-4 flex-1">{doc.name}</h3><div className="flex gap-2 flex-wrap"><span className="px-3 py-1.5 bg-black/5 dark:bg-white/5 rounded-lg text-[10px] font-bold opacity-80">{docCards} Cards</span><span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg text-[10px] font-bold">{docExamsNum} Exams</span><span className="px-3 py-1.5 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg text-[10px] font-bold">{docCasesNum} Cases</span></div></div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass border-dashed border-2 rounded-[3rem] p-20 text-center flex flex-col items-center"><FileUp size={64} className="opacity-40 mb-6"/><h2 className="title-font text-3xl font-black mb-4">No Documents Found</h2><p className="opacity-60 max-w-sm leading-relaxed">Import your first PDF to begin extracting knowledge.</p></div>
        )}
      </div>
    </div>
  );
}

function FlashcardsGlobalView({ flashcards, setFlashcards, addToast, setCurrentPage, setRightPanelOpen, setCurrentView, settings }) {
  const [studyingSet, setStudyingSet] = useState(null);
  if (studyingSet) return <div className="flex-1 flex flex-col min-h-0"><InPanelFlashcards title={studyingSet.title} initialCards={studyingSet.cards} onBack={() => setStudyingSet(null)} setFlashcards={setFlashcards} addToast={addToast} setCurrentPage={setCurrentPage} setRightPanelOpen={setRightPanelOpen} setCurrentView={setCurrentView} settings={settings}/></div>;
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-screen-xl mx-auto p-6 md:p-12 pb-32">
        <h1 className="title-font text-4xl font-black text-emerald-500 mb-10 flex items-center gap-4"><Layers size={40}/> Card Vault</h1>
        {flashcards.length === 0 ? <p className="glass p-10 rounded-[2rem] text-center font-bold opacity-60">No flashcards generated yet. Go to Reader and open AI Studio to extract some.</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {flashcards.map(set => (
              <div key={set.id} className="glass rounded-[2rem] p-6 flex flex-col card-hover">
                <h3 className="font-bold text-lg mb-4 line-clamp-2">{set.title}</h3>
                <div className="flex gap-2 mb-8"><span className="px-3 py-1.5 bg-[var(--accent)]/10 text-[var(--accent)] rounded-xl text-[10px] font-bold">{set.cards?.length || 0} Cards</span></div>
                <div className="mt-auto flex gap-3"><button onClick={() => setStudyingSet(set)} className="flex-1 py-4 btn-accent rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg">Study</button><button onClick={() => setFlashcards(flashcards.filter(f => f.id !== set.id))} className="p-4 bg-black/5 dark:bg-white/5 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-colors"><Trash2 size={20}/></button></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ExamsGlobalView({ exams, setExams, addToast, setCurrentPage, setRightPanelOpen, setCurrentView, settings }) {
  const [selectedExam, setSelectedExam] = useState(null);
  if (selectedExam) return <div className="flex-1 flex flex-col min-h-0"><InPanelExam exam={selectedExam} onBack={() => setSelectedExam(null)} onScoreUpdate={(id, score) => setExams(prev => prev.map(e => e.id === id ? { ...e, lastScore: score } : e))} addToast={addToast} setCurrentPage={setCurrentPage} setRightPanelOpen={setRightPanelOpen} setCurrentView={setCurrentView} settings={settings}/></div>;
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-screen-xl mx-auto p-6 md:p-12 pb-32">
        <h1 className="title-font text-4xl font-black text-rose-500 mb-10 flex items-center gap-4"><GraduationCap size={40}/> Examination Center</h1>
        {exams.length === 0 ? <p className="glass p-10 rounded-[2rem] text-center font-bold opacity-60">No exams generated yet. Go to Reader and open AI Studio to extract some.</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map(e => (
              <div key={e.id} className="glass rounded-[2rem] p-6 flex flex-col card-hover">
                <h3 className="font-bold text-lg mb-4 line-clamp-2">{e.title}</h3>
                <div className="flex gap-2 mb-8 flex-wrap">
                  <span className="px-3 py-1.5 bg-rose-500/10 text-rose-600 rounded-xl text-[10px] font-bold">{e.questions.length} Qs</span>
                  {e.lastScore !== undefined && <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-xl text-[10px] font-bold">Score: {e.lastScore}%</span>}
                </div>
                <div className="mt-auto flex gap-3">
                  <button onClick={() => setSelectedExam(e)} className="flex-1 py-4 bg-gradient-to-r from-rose-400 to-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-transform">Take Exam</button>
                  <button onClick={() => setExams(exams.filter(ex => ex.id !== e.id))} className="p-4 bg-black/5 dark:bg-white/5 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-colors"><Trash2 size={20}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CasesGlobalView({ cases, setCases, addToast, setCurrentPage, setRightPanelOpen, setCurrentView, settings }) {
  const [selectedCaseBlock, setSelectedCaseBlock] = useState(null);
  
  if (selectedCaseBlock) return <div className="flex-1 flex flex-col min-h-0"><InPanelExam exam={selectedCaseBlock} onBack={() => setSelectedCaseBlock(null)} onScoreUpdate={(id, score) => setCases(prev => prev.map(c => c.id === id ? { ...c, lastScore: score } : c))} addToast={addToast} setCurrentPage={setCurrentPage} setRightPanelOpen={setRightPanelOpen} setCurrentView={setCurrentView} settings={settings}/></div>;
  
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-screen-xl mx-auto p-6 md:p-12 pb-32">
        <h1 className="title-font text-4xl font-black text-blue-500 mb-10 flex items-center gap-4"><Activity size={40}/> Patient Cases Vault</h1>
        {cases.length === 0 ? <p className="glass p-10 rounded-[2rem] text-center font-bold opacity-60">No patient cases generated yet. Go to Reader and open AI Studio to extract some.</p> : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cases.map(c => (
              <div key={c.id} className="glass rounded-[2rem] p-6 flex flex-col card-hover">
                <h3 className="font-bold text-lg mb-4 line-clamp-2">{c.title}</h3>
                <div className="flex gap-2 mb-8 flex-wrap">
                  <span className="px-3 py-1.5 bg-blue-500/10 text-blue-600 rounded-xl text-[10px] font-bold">{c.questions?.length || 0} Cases</span>
                  {c.lastScore !== undefined && <span className="px-3 py-1.5 bg-emerald-500/10 text-emerald-600 rounded-xl text-[10px] font-bold">Score: {c.lastScore}%</span>}
                </div>
                <div className="mt-auto flex gap-3">
                  <button onClick={() => setSelectedCaseBlock(c)} className="flex-1 py-4 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg hover:scale-105 transition-transform">Solve Cases</button>
                  <button onClick={() => setCases(cases.filter(ex => ex.id !== c.id))} className="p-4 bg-black/5 dark:bg-white/5 hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-colors"><Trash2 size={20}/></button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChatGlobalView({ documents, settings, chatSessions, setChatSessions, addToast }) {
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [input, setInput] = useState(''); const [loading, setLoading] = useState(false);
  const endRef = useRef(null); const activeSession = chatSessions.find(s => s.id === activeSessionId) || null;

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [activeSession?.messages, loading]);
  const createNewChat = () => { setActiveSessionId(null); setInput(''); };

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const sessionId = activeSessionId || Date.now().toString(); const msg = input; setInput('');
    let currentMessages = !activeSessionId ? [] : chatSessions.find(s => s.id === sessionId)?.messages || [];
    currentMessages = [...currentMessages, { role: 'user', content: msg }];
    const newTitle = !activeSessionId ? msg.substring(0, 40) + '...' : chatSessions.find(s => s.id === sessionId)?.title;
    
    setChatSessions(prev => {
      if (prev.find(s => s.id === sessionId)) return prev.map(s => s.id === sessionId ? { ...s, messages: currentMessages } : s);
      return [{ id: sessionId, title: newTitle, messages: currentMessages, createdAt: new Date().toISOString() }, ...prev];
    });
    if (!activeSessionId) setActiveSessionId(sessionId);
    setLoading(true);
    try {
      const res = await callAI(msg, false, false, settings.apiKey, 16384);
      setChatSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages: [...s.messages, { role: 'assistant', content: res }] } : s));
    } catch (e) {
      setChatSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages: [...s.messages, { role: 'assistant', content: `⚠️ Error: ${e.message}` }] } : s));
    } finally { setLoading(false); }
  };

  return (
    <div className="flex-1 flex w-full h-full min-h-0 bg-transparent">
      <div className="hidden md:flex w-72 flex-col glass shrink-0 rounded-none border-y-0 border-l-0">
        <div className="p-4 border-b border-[var(--border)]"><button onClick={createNewChat} className="w-full flex items-center justify-center gap-2 bg-[var(--accent)] text-white py-3 rounded-xl font-bold text-sm shadow-md hover:opacity-90"><PlusCircle size={18}/> New Chat</button></div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {chatSessions.length === 0 && <div className="text-center p-4 text-xs font-bold opacity-50 uppercase tracking-widest mt-4">No History</div>}
          {chatSessions.map(session => (
            <div key={session.id} className="relative group mb-1">
              <button onClick={() => setActiveSessionId(session.id)} className={`w-full text-left p-3 rounded-xl text-sm transition-colors ${activeSessionId === session.id ? 'bg-[var(--accent)]/10 text-[var(--accent)] font-bold' : 'opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'}`}><div className="truncate pr-6 text-sm">{session.title}</div></button>
              <button onClick={() => setChatSessions(prev => prev.filter(s => s.id !== session.id))} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-red-500/10"><Trash size={14}/></button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col relative min-h-0">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 flex flex-col min-h-0">
          {!activeSession ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
              <div className="w-20 h-20 rounded-3xl bg-[var(--accent)]/10 flex items-center justify-center mb-6"><Sparkles size={40} className="text-[var(--accent)]"/></div>
              <h2 className="text-2xl font-black mb-2">Global AI Chat</h2><p className="max-w-sm text-sm">Ask any general medical question, or open a specific document in the Reader to chat with its exact contents.</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto w-full space-y-6 pb-4">
              {activeSession.messages.map((m, i) => (
                <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-[var(--accent)]' : 'glass'}`}>
                    {m.role === 'user' ? <UserCircle2 size={18} className="text-white"/> : <BrainCircuit size={18} className="text-[var(--accent)]"/>}
                  </div>
                  <div className={`p-5 text-sm leading-relaxed shadow-sm max-w-[85%] ${m.role === 'user' ? 'bg-[var(--accent)] text-white rounded-[1.5rem] rounded-tr-sm' : 'glass rounded-[1.5rem] rounded-tl-sm w-full whitespace-pre-wrap'}`}>{m.content}</div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-4"><div className="w-10 h-10 rounded-2xl glass flex items-center justify-center"><Loader2 size={18} className="text-[var(--accent)] animate-spin"/></div><div className="p-5 glass rounded-[1.5rem] rounded-tl-sm flex gap-1.5 items-center">{[0, 1, 2].map(i => <span key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}/>)}</div></div>
              )}
              <div ref={endRef}/>
            </div>
          )}
        </div>
        <div className="shrink-0 p-4 md:p-6 bg-transparent pb-[100px] md:pb-6">
          <div className="max-w-3xl mx-auto glass rounded-2xl shadow-xl focus-within:border-[var(--accent)] focus-within:ring-1 focus-within:ring-[var(--accent)]/50 transition-all p-2 relative">
            <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }} placeholder="Ask anything, anytime..." disabled={loading} className="w-full bg-transparent p-4 pr-16 text-sm outline-none resize-none max-h-40 custom-scrollbar text-[var(--text)]" style={{ minHeight: '60px' }}/>
            <button onClick={handleSend} disabled={loading || !input.trim()} className="absolute right-4 bottom-4 p-3 bg-[var(--accent)] disabled:opacity-50 rounded-xl text-white transition-all hover:scale-105 active:scale-95 shadow-lg"><Send size={18}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}

function PanelSettings({ settings, setSettings }) {
  const themes = [
    { id: 'pure-white', label: 'Pure White', icon: Sun },
    { id: 'light', label: 'Soft Light', icon: CloudSun },
    { id: 'dark', label: 'Deep Dark', icon: Moon },
    { id: 'oled', label: 'OLED Black', icon: MoonStar }
  ];
  const fontSizes = [{ id: 'small', label: 'Aa' }, { id: 'medium', label: 'Aa' }, { id: 'large', label: 'Aa' }, { id: 'xl', label: 'Aa' }, { id: 'xxl', label: 'Aa' }];
  
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="w-full max-w-4xl mx-auto p-6 md:p-12 space-y-8 pb-32">
        <h1 className="title-font text-4xl font-black mb-8 flex items-center gap-4"><Settings size={40} className="opacity-50"/> System Settings</h1>
        <div className="glass rounded-[2rem] p-8 card-hover">
          <h3 className="font-bold mb-6 flex items-center gap-3 text-lg"><Palette className="text-[var(--accent)]"/> Theme Engine</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {themes.map(t => (
              <button key={t.id} onClick={() => setSettings({...settings, theme: t.id})} className={`py-6 px-2 rounded-2xl font-black text-xs uppercase tracking-widest transition-all flex flex-col items-center gap-4 border ${settings.theme === t.id ? 'bg-[var(--accent)] text-white border-transparent shadow-xl scale-105' : 'glass opacity-70 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5 border-[var(--border)]'}`}><t.icon size={28}/> {t.label}</button>
            ))}
          </div>
        </div>
        <div className="glass rounded-[2rem] p-8 card-hover">
          <h3 className="font-bold mb-6 flex items-center gap-3 text-lg"><Type className="text-emerald-500"/> Typography Scale</h3>
          <div className="flex gap-2 p-2 bg-black/5 dark:bg-white/5 rounded-[1.5rem] border border-[var(--border)]">
            {fontSizes.map((f, i) => (
               <button key={f.id} onClick={() => setSettings({...settings, fontSize: f.id})} className={`flex-1 py-4 rounded-xl font-black transition-all ${settings.fontSize === f.id ? 'glass text-emerald-500 shadow-md border-emerald-500/30' : 'opacity-60 hover:opacity-100'}`} style={{ fontSize: `${12 + (i*2)}px` }}>{f.label}</button>
            ))}
          </div>
        </div>
        <div className="glass rounded-[2rem] p-8 card-hover">
           <h3 className="font-bold mb-6 flex items-center gap-3 text-lg"><KeyRound className="text-rose-500"/> Core API Key</h3>
           <input type="password" placeholder="sk-proj-..." value={settings.apiKey} onChange={e => setSettings({...settings, apiKey: e.target.value})} className="w-full bg-black/5 dark:bg-white/5 rounded-2xl p-5 font-mono focus:border-rose-500 outline-none transition-colors border border-[var(--border)] text-[var(--text)] shadow-inner"/>
        </div>
      </div>
    </div>
  );
}

// ─── PDF WORKSPACE ────────────────────────────────────────────────────────────
function PdfWorkspace({ activeDoc, setDocuments, closeDoc, rightPanelOpen, setRightPanelOpen, currentPage, setCurrentPage, openDocs, setActiveDocId, closeTab, isResizing }) {
  const [pdf, setPdf] = useState(null); const [isLoading, setIsLoading] = useState(true); const [pageDims, setPageDims] = useState({ w: 0, h: 0 }); const [scaleMultiplier, setScaleMultiplier] = useState(1.2);
  const [localPage, setLocalPage] = useState(currentPage);
  const canvasRef = useRef(null); const containerRef = useRef(null); const textLayerRef = useRef(null); const renderTaskRef = useRef(null);

  useEffect(() => { setLocalPage(currentPage); }, [currentPage]);
  useEffect(() => {
    let isMounted = true;
    const loadPdf = async () => {
      setIsLoading(true);
      try {
        const buffer = await getPdfData(activeDoc.id);
        if (buffer && isMounted) { const pdfjsLib = await loadPdfJs(); const loadedPdf = await pdfjsLib.getDocument({ data: buffer.buffer || buffer }).promise; if (isMounted) setPdf(loadedPdf); }
      } catch (e) { console.error(e); } finally { if (isMounted) setIsLoading(false); }
    };
    loadPdf(); return () => { isMounted = false; };
  }, [activeDoc.id]);

  useEffect(() => {
    if (!pdf) return; let isMounted = true;
    const renderPage = async () => {
      try {
        const page = await pdf.getPage(localPage); const container = containerRef.current; if (!container || !isMounted) return;
        const tempViewport = page.getViewport({ scale: 1 }); const baseScale = container.clientWidth / tempViewport.width; const finalScale = Math.min(Math.max(baseScale * scaleMultiplier, 0.5), 5.0);
        const viewport = page.getViewport({ scale: finalScale }); if (isMounted) setPageDims({ w: viewport.width, h: viewport.height });
        const canvas = canvasRef.current;
        if (canvas) {
          const pixelRatio = window.devicePixelRatio || 1; canvas.width = Math.floor(viewport.width * pixelRatio); canvas.height = Math.floor(viewport.height * pixelRatio);
          const renderContext = { canvasContext: canvas.getContext('2d'), viewport, transform: [pixelRatio, 0, 0, pixelRatio, 0, 0] };
          if (renderTaskRef.current) renderTaskRef.current.cancel(); renderTaskRef.current = page.render(renderContext); await renderTaskRef.current.promise;
        }
        const textLayer = textLayerRef.current;
        if (textLayer && isMounted) { textLayer.innerHTML = ''; textLayer.style.setProperty('--scale-factor', viewport.scale); const textContent = await page.getTextContent(); window.pdfjsLib.renderTextLayer({ textContentSource: textContent, container: textLayer, viewport, textDivs: [] }); }
      } catch (e) { if (e.name !== 'RenderingCancelledException') console.error(e); }
    };
    renderPage(); return () => { isMounted = false; if (renderTaskRef.current) renderTaskRef.current.cancel(); };
  }, [localPage, pdf, rightPanelOpen, scaleMultiplier, isResizing]);

  const handleNav = useCallback((dir) => {
    const next = Math.max(1, Math.min(activeDoc.totalPages, localPage + dir));
    if (next !== localPage) { setLocalPage(next); setCurrentPage(next); setDocuments(prev => prev.map(doc => doc.id === activeDoc.id ? { ...doc, progress: next } : doc)); if (containerRef.current) containerRef.current.scrollTo({ top: 0, behavior: 'smooth' }); }
  }, [localPage, activeDoc.totalPages, activeDoc.id, setCurrentPage, setDocuments]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
      if (e.key === 'ArrowLeft') handleNav(-1);
      if (e.key === 'ArrowRight') handleNav(1);
      if (e.ctrlKey && (e.key === '=' || e.key === '+')) { e.preventDefault(); setScaleMultiplier(s => Math.min(s + 0.15, 4)); }
      if (e.ctrlKey && e.key === '-') { e.preventDefault(); setScaleMultiplier(s => Math.max(s - 0.15, 0.4)); }
    };
    document.addEventListener('keydown', handleKeyDown); return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleNav]);

  return (
    <div className="flex-1 flex flex-col h-full bg-black/5 dark:bg-black/20 relative min-h-0">
      <div className="h-14 md:h-16 flex items-center justify-between px-3 md:px-6 glass shrink-0 z-10 border-b border-[var(--border)] rounded-none">
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={closeDoc} className="w-8 h-8 md:w-10 md:h-10 glass rounded-full flex items-center justify-center hover:bg-black/10"><ChevronLeft size={20}/></button>
          <span className="font-bold text-xs md:text-sm truncate max-w-[120px] md:max-w-md">{activeDoc.name}</span>
        </div>
        <div className="flex items-center gap-2 md:gap-3">
          <div className="hidden md:flex items-center gap-1 glass p-1 rounded-full">
            <button onClick={() => setScaleMultiplier(s => Math.max(s - 0.25, 0.5))} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/10 opacity-60 hover:opacity-100"><ZoomOut size={16}/></button>
            <button onClick={() => setScaleMultiplier(1.2)} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/10 opacity-60 hover:opacity-100"><Maximize size={16}/></button>
            <button onClick={() => setScaleMultiplier(s => Math.min(s + 0.25, 4))} className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-black/10 opacity-60 hover:opacity-100"><ZoomIn size={16}/></button>
          </div>
          <button onClick={() => setRightPanelOpen(!rightPanelOpen)} className={`px-4 py-2 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all shadow-sm ${rightPanelOpen ? 'bg-[var(--accent)] text-white' : 'glass text-[var(--accent)] border-[var(--accent)]/30 hover:bg-[var(--accent)]/10'}`}>
            {rightPanelOpen ? 'Close AI' : 'AI Studio'}
          </button>
        </div>
      </div>
      {openDocs.length > 1 && (
        <div className="flex gap-2 px-3 py-2 glass border-b border-[var(--border)] overflow-x-auto custom-scrollbar shrink-0 z-10 rounded-none">
          {openDocs.map(id => {
            const doc = documents.find(d => d.id === id); if (!doc) return null;
            return (
              <div key={id} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer font-bold text-[10px] uppercase tracking-widest transition-colors ${id === activeDoc.id ? 'bg-[var(--accent)] text-white' : 'glass hover:bg-black/10 border border-[var(--border)]'}`} onClick={() => setActiveDocId(id)}>
                <span className="truncate max-w-[100px]">{doc.name}</span><button onClick={(e) => { e.stopPropagation(); closeTab(id); }} className="p-1 rounded hover:bg-black/20 opacity-70 hover:opacity-100"><X size={12}/></button>
              </div>
            );
          })}
        </div>
      )}
      <div ref={containerRef} className="flex-1 overflow-auto block relative custom-scrollbar p-0 m-0 min-h-0 pb-[100px] md:pb-0">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-[var(--accent)] min-h-[50vh]">
            <Loader2 className="animate-spin" size={36}/><span className="text-xs font-black tracking-[0.2em] uppercase opacity-70">Rendering...</span>
          </div>
        ) : pdf ? (
          <div className="relative shadow-2xl bg-white shrink-0 origin-top-left m-0 p-0 mx-auto" style={{ width: pageDims.w ? `${pageDims.w}px` : '100%', height: pageDims.h ? `${pageDims.h}px` : 'auto' }}>
            <canvas ref={canvasRef} className="block m-0 p-0"/>
            <div ref={textLayerRef} className="pdf-text-layer"/>
          </div>
        ) : (
          <div className="m-auto text-red-500 text-sm flex items-center gap-2 bg-red-500/10 p-6 rounded-2xl border border-red-500/20 font-bold min-h-[50vh] mt-10 w-fit"><AlertCircle size={18}/> Failed to load PDF.</div>
        )}
      </div>
      <div className="h-16 md:h-20 glass flex items-center justify-center gap-4 md:gap-6 shrink-0 z-20 border-t border-[var(--border)] rounded-none pb-[env(safe-area-inset-bottom)] md:pb-0">
        <button onClick={() => handleNav(-1)} disabled={localPage <= 1} className="w-10 h-10 md:w-12 md:h-12 glass rounded-2xl flex items-center justify-center hover:bg-black/10 disabled:opacity-30 transition-colors shadow-sm"><ChevronLeft size={20}/></button>
        <div className="px-4 py-2 md:px-6 md:py-3 glass rounded-2xl font-mono font-bold shadow-sm text-xs md:text-sm border border-[var(--border)]">PG <span className="text-[var(--accent)]">{localPage}</span> / {activeDoc.totalPages}</div>
        <button onClick={() => handleNav(1)} disabled={localPage >= activeDoc.totalPages} className="w-10 h-10 md:w-12 md:h-12 btn-accent rounded-2xl flex items-center justify-center shadow-lg disabled:opacity-50"><ChevronRight size={20}/></button>
      </div>
    </div>
  );
}

// ─── AI STUDIO PANELS ─────────────────────────────────────────────────────────

function PanelGenerate({ activeDoc, bgTask, onStartGenerate, onClearTask, setFlashcards, setExams, setCases, setNotes, switchToReview, currentPage, addToast, settings }) {
  const [startPage, setStartPage] = useState(currentPage); const [endPage, setEndPage] = useState(currentPage);
  const [type, setType] = useState('cases'); const [count, setCount] = useState(25); const [difficulty, setDifficulty] = useState(3);
  const difficultyLevels = ['Hard', 'Expert', 'Insane'];

  useEffect(() => { if (!bgTask) { setStartPage(currentPage); setEndPage(currentPage); } }, [currentPage, bgTask]);

  const handleGenerateClick = () => { onStartGenerate(type, activeDoc.id, startPage, endPage, { count, difficultyLevel: difficultyLevels[difficulty - 1] }); };

  const saveItem = () => {
    if (!bgTask?.result) return;
    const generated = bgTask.result;
    if (generated.type === 'flashcards') {
      const cards = generated.data.map(c => ({ id: Date.now() + Math.random(), q: c.q, a: c.a, evidence: c.evidence, sourcePage: c.sourcePage, level: 0, nextReview: Date.now(), repetitions: 0, ef: 2.5, interval: 1, lastReview: Date.now() }));
      setFlashcards(p => [...p, { id: Date.now().toString(), docId: activeDoc.id, sourcePages: generated.pages, title: `Flashcards (Pgs ${generated.pages})`, cards, createdAt: new Date().toISOString() }]);
      addToast(`${cards.length} flashcards saved!`, 'success');
    } else if (generated.type === 'cases') {
      setCases(p => [...p, { id: Date.now().toString(), docId: activeDoc.id, sourcePages: generated.pages, title: generated.title || 'Patient Cases Block', questions: generated.data, createdAt: new Date().toISOString() }]);
      addToast(`Case block with ${generated.data.length} cases saved!`, 'success');
    } else if (generated.type === 'exam') {
      setExams(p => [...p, { id: Date.now().toString(), docId: activeDoc.id, sourcePages: generated.pages, title: generated.title || 'Exam', questions: generated.data, createdAt: new Date().toISOString() }]);
      addToast(`Exam with ${generated.data.length} questions saved!`, 'success');
    } else {
      setNotes(p => [...p, { id: Date.now().toString(), docId: activeDoc.id, title: `${generated.customTitle || 'Summary'} Pgs ${generated.pages}`, content: generated.data, createdAt: new Date().toISOString() }]);
      addToast('Note saved to vault!', 'success');
    }
    onClearTask(); switchToReview();
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-transparent">
      {!bgTask?.isFinished ? (
        <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-[100px] md:pb-6">
          <div className="glass rounded-[2rem] p-6 shadow-xl mb-6">
            <h2 className="text-lg font-black mb-4 flex items-center gap-2"><Target size={20} className="text-[var(--accent)]"/> Step 1: Select Pages</h2>
            <div className="flex items-center justify-between mb-8 gap-4 bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-[var(--border)]">
              <div className="w-full">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 block">From Page</label>
                <input type="number" min={1} max={activeDoc?.totalPages || 1} value={startPage} onChange={e => setStartPage(Number(e.target.value))} className="w-full bg-white dark:bg-black rounded-xl px-4 py-3 text-center font-mono font-bold outline-none focus:border-[var(--accent)] transition-all border border-[var(--border)] text-[var(--text)] shadow-inner"/>
              </div>
              <div className="mt-5 opacity-40 font-bold text-lg uppercase tracking-widest">&rarr;</div>
              <div className="w-full">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-2 block">To Page</label>
                <input type="number" min={1} max={activeDoc?.totalPages || 1} value={endPage} onChange={e => setEndPage(Number(e.target.value))} className="w-full bg-white dark:bg-black rounded-xl px-4 py-3 text-center font-mono font-bold outline-none focus:border-[var(--accent)] transition-all border border-[var(--border)] text-[var(--text)] shadow-inner"/>
              </div>
            </div>
            
            <h2 className="text-lg font-black mb-4 flex items-center gap-2"><Zap size={20} className="text-amber-500"/> Step 2: Extraction Tool</h2>
            <div className="grid grid-cols-3 gap-3 mb-8">
              <ToolBtn id="flashcards" active={type} set={setType} icon={Layers} label="Cards"/><ToolBtn id="exam" active={type} set={setType} icon={CheckSquare} label="Exam"/><ToolBtn id="summary" active={type} set={setType} icon={BookA} label="Summary"/><ToolBtn id="cases" active={type} set={setType} icon={Activity} label="Cases"/><ToolBtn id="clinical" active={type} set={setType} icon={Stethoscope} label="Clinical"/><ToolBtn id="treatment" active={type} set={setType} icon={Pill} label="Treat"/><ToolBtn id="labs" active={type} set={setType} icon={Thermometer} label="Labs"/><ToolBtn id="mnemonics" active={type} set={setType} icon={Lightbulb} label="Memory"/><ToolBtn id="eli5" active={type} set={setType} icon={Baby} label="ELI5"/>
            </div>
            {(type === 'flashcards' || type === 'exam' || type === 'cases') && (
              <div className="mb-8 bg-black/5 dark:bg-white/5 p-6 rounded-2xl border border-[var(--border)]">
                <label className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-5 flex justify-between"><span>Quantity</span><span className="text-[var(--accent)] font-bold">{count} Items</span></label>
                <input type="range" min="5" max="200" value={count} onChange={e => setCount(parseInt(e.target.value))} className="w-full accent-[var(--accent)]"/>
              </div>
            )}
            <div className="mb-8 bg-black/5 dark:bg-white/5 p-6 rounded-2xl border border-[var(--border)]">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-5 flex justify-between"><span>Difficulty</span><span className="text-[var(--accent)] font-bold">{difficultyLevels[difficulty - 1]}</span></label>
              <input type="range" min="1" max="3" value={difficulty} onChange={e => setDifficulty(parseInt(e.target.value))} className="w-full accent-[var(--accent)]"/>
            </div>
            <button onClick={handleGenerateClick} disabled={!!bgTask} className="w-full py-5 btn-accent rounded-2xl text-sm font-black uppercase tracking-widest transition-all shadow-xl disabled:opacity-50 flex items-center justify-center gap-3 hover:-translate-y-1 active:scale-95">
              {!!bgTask ? <Loader2 size={24} className="animate-spin"/> : <Zap size={24} fill="currentColor"/>}
              {!!bgTask ? 'Running Turbo Engine...' : 'Execute Extraction'}
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0">
          <div className="glass border-b border-[var(--border)] p-5 flex justify-between items-center shrink-0">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2"><CheckCircle2 size={20}/> Ready ({bgTask.result?.data?.length || 1} items)</span>
            <div className="flex gap-3">
              <button onClick={onClearTask} className="px-4 py-2.5 glass hover:bg-red-500/20 opacity-70 hover:opacity-100 rounded-xl text-[10px] font-bold uppercase tracking-widest">Discard</button>
              <button onClick={saveItem} className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 shadow-lg"><Save size={16}/> Save</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-[100px] md:pb-6 space-y-6">
            {bgTask.result?.type === 'flashcards' && bgTask.result.data.map((item, idx) => (
              <div key={idx} className="glass p-6 rounded-[2rem]">
                <p className="text-base font-bold mb-5"><span className="opacity-50 mr-3 text-xs uppercase tracking-widest">Q</span>{item.q}</p>
                <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-5 rounded-2xl mb-4"><p className="text-base text-[var(--accent)] font-medium"><span className="opacity-50 mr-3 text-xs uppercase tracking-widest">A</span>{item.a}</p></div>
                {item.evidence && (
                  <div className="text-xs bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-[var(--border)]">
                    <span className="font-bold block mb-1">Source Evidence (Pg {item.sourcePage || '?'}):</span>
                    <p className="opacity-70 italic">"{item.evidence}"</p>
                  </div>
                )}
              </div>
            ))}
            {(bgTask.result?.type === 'exam' || bgTask.result?.type === 'cases') && bgTask.result.data.map((item, idx) => (
              <div key={idx} className="glass p-6 rounded-[2rem]">
                {item.vignette && <p className="text-sm opacity-80 mb-4 bg-black/5 dark:bg-white/5 p-4 rounded-xl">{item.vignette}</p>}
                <p className="text-base font-bold mb-6"><span className="opacity-50 mr-3">{idx + 1}.</span>{item.q || item.examQuestion?.q}</p>
                <div className="space-y-3 mb-6">
                  {(item.options || item.examQuestion?.options || []).map((opt, oIdx) => {
                     const correctIdx = item.correct !== undefined ? item.correct : item.examQuestion?.correct;
                     return (
                      <div key={oIdx} className={`text-sm p-4 rounded-xl border ${oIdx === correctIdx ? 'border-emerald-500 bg-emerald-500/10 text-emerald-600 font-bold' : 'border-[var(--border)] bg-black/5 dark:bg-white/5'}`}>
                        <span className="font-mono opacity-50 mr-3">{String.fromCharCode(65 + oIdx)}.</span>{opt}
                      </div>
                     );
                  })}
                </div>
                <div className="p-5 bg-[var(--accent)]/10 border border-[var(--accent)]/20 rounded-xl mb-4">
                  <span className="font-black text-[var(--accent)] mr-2 text-[10px] uppercase tracking-widest block mb-3">Explanation</span>
                  <p className="text-sm leading-relaxed">{item.explanation || item.examQuestion?.explanation}</p>
                </div>
                {(item.evidence || item.examQuestion?.evidence) && (
                  <div className="text-xs bg-black/5 dark:bg-white/5 p-4 rounded-xl border border-[var(--border)]">
                    <span className="font-bold block mb-1">Source Evidence (Pg {item.sourcePage || item.examQuestion?.sourcePage || '?'}):</span>
                    <p className="opacity-70 italic">"{item.evidence || item.examQuestion?.evidence}"</p>
                  </div>
                )}
              </div>
            ))}
            {bgTask.result?.type !== 'flashcards' && bgTask.result?.type !== 'exam' && bgTask.result?.type !== 'cases' && (
              <div className="glass p-8 rounded-[2rem]">
                <div className="text-base whitespace-pre-wrap leading-loose">{bgTask.result?.data}</div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PanelChat({ activeDoc, settings, currentPage }) {
  const [messages, setMessages] = useState([{ role: 'assistant', content: `Hello! I'm locked onto **Page ${currentPage}**. Ask anything about this page, or switch to Full Document mode.` }]);
  const [input, setInput] = useState(''); const [loading, setLoading] = useState(false); const [contextMode, setContextMode] = useState('page');
  const endRef = useRef(null);

  useEffect(() => { setMessages([{ role: 'assistant', content: `Locked onto **Page ${currentPage}**. Ask anything, or switch to "Full Document" mode.` }]); }, [currentPage]);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const handleChat = async () => {
    if (!input.trim() || loading) return;
    const msg = input; setInput(''); setMessages(p => [...p, { role: 'user', content: msg }]); setLoading(true);
    try {
      const pdfData = await getPdfData(activeDoc.id);
      let text = contextMode === 'page' ? (pdfData?.pagesText?.[currentPage] || 'No text found on this page.') : Object.entries(pdfData?.pagesText || {}).map(([p, t]) => `[Page ${p}] ${t}`).join('\n').substring(0, 80000);
      const res = await callAI(`CONTEXT:\n${text}\n\nUSER QUESTION:\n${msg}`, false, false, settings.apiKey);
      setMessages(p => [...p, { role: 'assistant', content: res }]);
    } catch (e) { setMessages(p => [...p, { role: 'assistant', content: `Warning: ${e.message}` }]); } finally { setLoading(false); }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-transparent relative">
      <div className="shrink-0 p-4 pb-2 border-b border-[var(--border)]">
        <div className="flex items-center gap-2 bg-black/5 dark:bg-white/5 p-1.5 rounded-xl">
          <button onClick={() => setContextMode('page')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors ${contextMode === 'page' ? 'bg-[var(--accent)] text-white shadow-md' : 'opacity-60 hover:opacity-100'}`}>Page {currentPage}</button>
          <button onClick={() => setContextMode('document')} className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors ${contextMode === 'document' ? 'bg-[var(--accent)] text-white shadow-md' : 'opacity-60 hover:opacity-100'}`}>Full Document</button>
        </div>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6 pb-4 min-h-0">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-md ${m.role === 'user' ? 'bg-gradient-to-br from-[var(--accent)] to-[var(--accent-soft)] text-white' : 'glass border border-[var(--border)]'}`}>
              {m.role === 'user' ? <UserCircle2 size={20}/> : <BrainCircuit size={20} className="text-[var(--accent)]"/>}
            </div>
            <div className={`p-5 max-w-[80%] text-sm leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-[var(--accent)] text-white rounded-[2rem] rounded-tr-sm' : 'glass rounded-[2rem] rounded-tl-sm whitespace-pre-wrap'}`}>{m.content}</div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4">
            <div className="w-12 h-12 rounded-2xl glass flex items-center justify-center shadow-md"><Loader2 size={20} className="text-[var(--accent)] animate-spin"/></div>
            <div className="p-5 glass rounded-[2rem] rounded-tl-sm flex gap-2 items-center shadow-sm">{[0, 1, 2].map(i => <span key={i} className="w-2.5 h-2.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }}/>)}</div>
          </div>
        )}
        <div ref={endRef}/>
      </div>
      
      <div className="shrink-0 p-4 pb-[100px] md:pb-4 glass border-t border-[var(--border)] z-50 rounded-none">
        <div className="relative flex items-end bg-black/5 dark:bg-white/5 rounded-[2rem] focus-within:border-[var(--accent)] focus-within:ring-2 focus-within:ring-[var(--accent)]/30 transition-all p-2 border border-[var(--border)]">
          <textarea value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleChat(); } }} placeholder={`Ask about ${contextMode === 'page' ? 'page ' + currentPage : 'the document'}...`} disabled={loading} className="w-full bg-transparent p-4 pr-16 text-sm outline-none resize-none max-h-32 custom-scrollbar text-[var(--text)]" style={{ minHeight: '56px' }}/>
          <button onClick={handleChat} disabled={loading || !input.trim()} className="absolute right-3 bottom-3 p-4 bg-[var(--accent)] disabled:opacity-50 rounded-2xl text-white transition-all shadow-xl hover:scale-105 active:scale-95"><Send size={20}/></button>
        </div>
      </div>
    </div>
  );
}

function PanelReview({ activeDocId, flashcards, setFlashcards, exams, setExams, cases, setCases, notes, setNotes, addToast, setCurrentPage, setRightPanelOpen, setCurrentView, settings }) {
  const [activeItem, setActiveItem] = useState(null); const [activeTab, setActiveTab] = useState('cases');
  const docCardSets = flashcards.filter(f => f.docId === activeDocId); const docExams = exams.filter(e => e.docId === activeDocId); const docCases = cases.filter(c => c.docId === activeDocId); const docNotes = notes.filter(n => n.docId === activeDocId);

  if (activeItem?.type === 'exam' || activeItem?.type === 'case') return <div className="flex-1 flex flex-col min-h-0"><InPanelExam exam={activeItem.data} onBack={() => setActiveItem(null)} onScoreUpdate={(id, score) => { if(activeItem.type === 'case') setCases(prev => prev.map(c => c.id === id ? { ...c, lastScore: score } : c)); else setExams(prev => prev.map(e => e.id === id ? { ...e, lastScore: score } : e)); }} addToast={addToast} setCurrentPage={setCurrentPage} setRightPanelOpen={setRightPanelOpen} setCurrentView={setCurrentView} settings={settings}/></div>;
  if (activeItem?.type === 'note') return <div className="flex-1 flex flex-col min-h-0"><InPanelNote note={activeItem.data} onBack={() => setActiveItem(null)}/></div>;
  if (activeItem?.type === 'flashcards') return <div className="flex-1 flex flex-col min-h-0"><InPanelFlashcards title={activeItem.data.title} initialCards={activeItem.data.cards} onBack={() => setActiveItem(null)} setFlashcards={setFlashcards} addToast={addToast} setCurrentPage={setCurrentPage} setRightPanelOpen={setRightPanelOpen} setCurrentView={setCurrentView} settings={settings}/></div>;

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      <div className="flex gap-2 p-4 glass border-b border-[var(--border)] shrink-0 rounded-none">
        {[['cases', 'Cases', docCases.length], ['exams', 'Exams', docExams.length], ['flashcards', 'Cards', docCardSets.length], ['notes', 'Notes', docNotes.length]].map(([tab, label, count]) => (
          <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex flex-col items-center justify-center gap-1 ${activeTab === tab ? 'bg-[var(--card)] text-[var(--accent)] shadow-md border border-[var(--border)]' : 'opacity-60 hover:bg-[var(--card)] hover:opacity-100 border border-transparent'}`}>
            {label} <span className={`text-[9px] px-2 py-0.5 rounded-full font-black ${activeTab === tab ? 'bg-[var(--accent)] text-white' : 'bg-black/10 dark:bg-white/10'}`}>{count}</span>
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-[100px] md:pb-6 space-y-4 min-h-0">
        {activeTab === 'exams' && (docExams.length === 0 ? <EmptyState icon={GraduationCap} text="No exams saved for this document."/> : docExams.map(e => (
          <div key={e.id} className="glass rounded-[2rem] p-6 group card-hover border border-[var(--border)]">
            <div className="flex justify-between items-start mb-6"><div className="flex-1"><p className="text-base font-bold mb-3 leading-snug">{e.title}</p><div className="flex gap-2 flex-wrap"><span className="text-[10px] font-black text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-xl">{e.questions.length} Qs</span>{e.lastScore !== undefined && <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl ${e.lastScore >= 70 ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'}`}>Last: {e.lastScore}%</span>}</div></div><button onClick={() => setExams(exams.filter(ex => ex.id !== e.id))} className="p-3 opacity-50 hover:text-red-500 rounded-xl glass hover:bg-red-500/10"><Trash size={18}/></button></div>
            <button onClick={() => setActiveItem({ type: 'exam', data: e })} className="w-full py-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"><Play size={16} fill="currentColor"/> Take Exam</button>
          </div>
        )))}
        {activeTab === 'cases' && (docCases.length === 0 ? <EmptyState icon={Activity} text="No cases saved for this document."/> : docCases.map(c => (
          <div key={c.id} className="glass rounded-[2rem] p-6 group card-hover border border-[var(--border)]">
            <div className="flex justify-between items-start mb-6"><div className="flex-1"><p className="text-base font-bold mb-3 leading-snug">{c.title}</p><div className="flex gap-2 flex-wrap"><span className="text-[10px] font-black text-blue-500 bg-blue-500/10 px-3 py-1.5 rounded-xl">{c.questions.length} Cases</span>{c.lastScore !== undefined && <span className={`text-[10px] font-black px-3 py-1.5 rounded-xl ${c.lastScore >= 70 ? 'text-emerald-500 bg-emerald-500/10' : 'text-red-500 bg-red-500/10'}`}>Last: {c.lastScore}%</span>}</div></div><button onClick={() => setCases(cases.filter(ex => ex.id !== c.id))} className="p-3 opacity-50 hover:text-red-500 rounded-xl glass hover:bg-red-500/10"><Trash size={18}/></button></div>
            <button onClick={() => setActiveItem({ type: 'case', data: c })} className="w-full py-4 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"><Play size={16} fill="currentColor"/> Solve Cases</button>
          </div>
        )))}
        {activeTab === 'flashcards' && (docCardSets.length === 0 ? <EmptyState icon={Layers} text="No flashcards saved for this document."/> : docCardSets.map(set => {
          const due = (set.cards || []).filter(c => c.nextReview <= Date.now()).length;
          return (
            <div key={set.id} className="glass rounded-[2rem] p-6 card-hover border border-[var(--border)]">
              <div className="flex justify-between items-start mb-6"><div className="flex-1"><p className="text-base font-bold mb-3 leading-snug">{set.title}</p><div className="flex gap-2 flex-wrap"><span className="text-[10px] font-black text-[var(--accent)] bg-[var(--accent)]/10 px-3 py-1.5 rounded-xl">{set.cards?.length || 0} Cards</span>{due > 0 && <span className="text-[10px] font-black text-red-500 bg-red-500/10 px-3 py-1.5 rounded-xl animate-pulse">{due} due</span>}</div></div><button onClick={() => setFlashcards(flashcards.filter(f => f.id !== set.id))} className="p-3 opacity-50 hover:text-red-500 rounded-xl glass hover:bg-red-500/10"><Trash size={18}/></button></div>
              <button onClick={() => setActiveItem({ type: 'flashcards', data: set })} className="w-full py-4 bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)] rounded-xl text-xs font-black uppercase tracking-widest transition-colors flex items-center justify-center gap-2"><Play size={16} fill="currentColor"/> Study</button>
            </div>
          );
        }))}
        {activeTab === 'notes' && (docNotes.length === 0 ? <EmptyState icon={BookA} text="No notes saved for this document."/> : docNotes.map(n => (
          <div key={n.id} onClick={() => setActiveItem({ type: 'note', data: n })} className="glass p-6 rounded-[2rem] relative group card-hover cursor-pointer border border-[var(--border)] hover:border-[var(--accent)]/50">
            <p className="text-base font-bold mb-4 pr-12 leading-snug">{n.title}</p>
            <p className="text-sm opacity-60 line-clamp-3 bg-black/5 dark:bg-white/5 p-5 rounded-2xl">{n.content}</p>
            <button onClick={(e) => { e.stopPropagation(); setNotes(notes.filter(no => no.id !== n.id)); }} className="absolute top-6 right-6 p-3 opacity-0 group-hover:opacity-100 hover:text-red-500 rounded-xl glass transition-all"><Trash size={18}/></button>
          </div>
        )))}
      </div>
    </div>
  );
}

// ─── IN-PANEL EXAM & CASES UI ─────────────────────────────────────────────────
function InPanelExam({ exam, onBack, onScoreUpdate, addToast, setCurrentPage, setRightPanelOpen, setCurrentView, settings }) {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);
  const [examComplete, setExamComplete] = useState(false);

  const qObj = exam.questions[currentQIndex];
  const q = qObj?.examQuestion ? qObj.examQuestion : qObj; // Handles both Cases and Standard Exams
  const hasLabs = qObj?.labPanels?.length > 0;
  const progressPct = Math.round((currentQIndex / exam.questions.length) * 100);

  const handleSelect = (idx) => {
    if (showFeedback) return;
    setSelectedAnswer(idx); setShowFeedback(true);
    if (idx === q.correct) setScore(prev => prev + 1);
  };

  const nextQuestion = () => {
    setSelectedAnswer(null); setShowFeedback(false);
    if (currentQIndex < exam.questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      const finalScore = Math.round((score / exam.questions.length) * 100);
      setExamComplete(true);
      if (onScoreUpdate) onScoreUpdate(exam.id, finalScore);
      addToast?.(`Block complete! Score: ${finalScore}%`, finalScore >= 70 ? 'success' : 'info');
    }
  };

  const handleJumpToSource = (pageNumber) => {
    if(pageNumber && setCurrentView) {
      setCurrentView('reader'); 
      setCurrentPage(parseInt(pageNumber)); 
      setRightPanelOpen(false); 
      setTimeout(()=>setRightPanelOpen(true), 500); 
    }
  };

  if (examComplete) {
    const finalScore = Math.round((score / exam.questions.length) * 100);
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-transparent overflow-y-auto">
        <div className={`w-48 h-48 rounded-full flex items-center justify-center mb-8 glass shadow-2xl ${finalScore >= 70 ? 'bg-emerald-500/20 border border-emerald-500/30' : 'bg-red-500/20 border border-red-500/30'}`}><span className={`text-6xl font-black title-font ${finalScore >= 70 ? 'text-emerald-500' : 'text-red-500'}`}>{finalScore}%</span></div>
        <h2 className="title-font text-4xl font-black mb-4">Complete!</h2><p className="text-xl opacity-60 mb-2">{score}/{exam.questions.length} correct</p><p className={`text-lg font-bold mb-12 ${finalScore >= 70 ? 'text-emerald-500' : 'text-red-500'}`}>{finalScore >= 90 ? 'Outstanding!' : finalScore >= 70 ? 'Good job!' : 'Keep studying!'}</p>
        <div className="flex gap-4"><button onClick={onBack} className="px-8 py-4 glass opacity-70 hover:opacity-100 rounded-full font-black text-xs uppercase tracking-widest transition-colors">Back to Vault</button><button onClick={() => { setCurrentQIndex(0); setScore(0); setSelectedAnswer(null); setShowFeedback(false); setExamComplete(false); }} className="px-8 py-4 btn-accent rounded-full font-black text-xs uppercase tracking-widest">Retry</button></div>
      </div>
    );
  }

  if (!q) return null;

  const labSection = hasLabs ? (
    <div className="w-full">
      <h3 className="text-sm font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-6 flex items-center gap-2"><FlaskConical size={18}/> Laboratory Results</h3>
      {qObj.labPanels.map((panel, pi) => (
        <div key={pi} className="mb-2">
          <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500 mb-3 pl-1">{panel.panelName}</h4>
          <LabTable rows={panel.rows}/>
        </div>
      ))}
    </div>
  ) : null;

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-[#0a0a0c]">
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 p-4 flex items-center justify-between shrink-0 shadow-sm z-10">
        <button onClick={onBack} className="text-gray-600 hover:text-[var(--accent-color)] text-xs font-black uppercase tracking-widest flex items-center gap-2 transition-colors"><ChevronLeft size={16}/> Exit Block</button>
        <div className="flex items-center gap-4">
          <div className="hidden md:block w-32 bg-gray-200 dark:bg-zinc-800 rounded-full h-2"><div className="bg-[var(--accent-color)] h-full rounded-full transition-all" style={{ width: `${progressPct}%` }}/></div>
          <span className="text-[10px] font-black uppercase tracking-widest bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 px-3 py-1.5 rounded-lg">{currentQIndex + 1} / {exam.questions.length}</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row relative">
        {/* LEFT COLUMN: Vignette & Question */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 pb-[120px] ${hasLabs ? 'lg:w-1/2 lg:flex-none' : ''}`}>
          
          {qObj.vignette && (
            <div className="mb-8">
              <span className="text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-500 block mb-3">Patient Vignette</span>
              <div className="text-sm md:text-base text-gray-800 dark:text-zinc-200 leading-relaxed whitespace-pre-wrap bg-white dark:bg-[#121214] p-6 md:p-8 rounded-[2rem] shadow-sm border border-gray-200 dark:border-zinc-800/50">
                {qObj.vignette}
              </div>
            </div>
          )}

          <h2 className="text-lg md:text-xl text-gray-900 dark:text-white font-bold mb-6 leading-relaxed">{q.q}</h2>
          
          <div className="space-y-3 mb-8">
            {(q.options || []).map((opt, idx) => {
              const isSelected = selectedAnswer === idx;
              const isCorrect = idx === q.correct;
              const statusClass = isSelected 
                ? (isCorrect ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200' : 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200') 
                : (showFeedback && isCorrect ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200' : 'border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 hover:border-gray-300');

              return (
                <button key={idx} onClick={() => handleSelect(idx)} disabled={showFeedback} className={`w-full text-left p-5 rounded-2xl border-2 transition-all flex items-center gap-4 ${statusClass}`}>
                  <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${(isSelected || (showFeedback && isCorrect)) ? (isCorrect ? 'border-emerald-500' : 'border-red-500') : 'border-gray-300 dark:border-zinc-600'}`}>
                    {(isSelected || (showFeedback && isCorrect)) && <div className={`w-3 h-3 rounded-full ${isCorrect ? 'bg-emerald-500' : 'bg-red-500'}`}/>}
                  </div>
                  <span className="text-sm md:text-base font-medium">{opt}</span>
                </button>
              );
            })}
          </div>

          {/* Explanation, Evidence & Tutor */}
          {showFeedback && (
            <div className="animate-slide-in">
              <div className="p-6 bg-[var(--accent-color)]/5 border border-[var(--accent-color)]/20 rounded-2xl shadow-sm mb-6">
                <span className="font-black text-[var(--accent-color)] block mb-3 text-[10px] uppercase tracking-widest">Detailed Explanation</span>
                <p className="leading-relaxed text-sm text-gray-800 dark:text-zinc-200">{q.explanation}</p>
                
                {q.evidence && (
                  <div className="mt-5 pt-5 border-t border-[var(--accent-color)]/20">
                    <span className="font-bold text-xs text-gray-500 dark:text-zinc-400 block mb-2">Source Evidence (Page {q.sourcePage || '?'}):</span>
                    <blockquote className="text-xs italic text-gray-600 dark:text-zinc-400 border-l-4 border-gray-300 dark:border-zinc-700 pl-3">"{q.evidence}"</blockquote>
                    {q.sourcePage && (
                      <button onClick={() => handleJumpToSource(q.sourcePage)} className="mt-4 px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform"><FileSearch size={14}/> View PDF Source</button>
                    )}
                  </div>
                )}
              </div>
              <MiniTutorChat contextObj={qObj} settings={settings} />
            </div>
          )}

          {/* Navigation Controls */}
          <div className="flex justify-between items-center mt-8 pt-8 border-t border-gray-200 dark:border-zinc-800">
             <button onClick={() => { if (currentQIndex > 0) { setCurrentQIndex(currentQIndex - 1); setSelectedAnswer(null); setShowFeedback(false); } }} disabled={currentQIndex === 0} className="px-5 py-3 text-gray-500 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 rounded-xl disabled:opacity-30 text-xs font-bold uppercase tracking-widest flex items-center gap-2 transition-colors"><ChevronLeft size={16}/> Previous</button>
             <button onClick={nextQuestion} disabled={!showFeedback} className="px-8 py-4 bg-[var(--accent-color)] text-white disabled:bg-gray-200 dark:disabled:bg-zinc-800 disabled:text-gray-400 rounded-xl text-xs font-black shadow-lg shadow-[var(--accent-color)]/25 uppercase tracking-widest flex items-center gap-3 transition-all hover:-translate-y-1 active:scale-95 disabled:hover:translate-y-0">
               {currentQIndex < exam.questions.length - 1 ? 'Next Question' : 'Finish Block'} <ChevronRight size={18}/>
             </button>
          </div>
        </div>

        {/* RIGHT COLUMN: Laboratory Results */}
        {hasLabs && (
          <div className="hidden lg:block w-1/2 border-l border-gray-200 dark:border-zinc-800 bg-white/50 dark:bg-[#0a0a0c]/50 overflow-y-auto custom-scrollbar p-8 pb-[120px]">
            {labSection}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── IN-PANEL FLASHCARDS (Updated with Tutor) ─────────────────────────────────
function InPanelFlashcards({ title, initialCards, onBack, setFlashcards, addToast, setCurrentPage, setRightPanelOpen, setCurrentView, settings }) {
  const [cards, setCards] = useState(initialCards || []); 
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [isFlipped, setIsFlipped] = useState(false); 
  const [sessionStats, setSessionStats] = useState({ again: 0, hard: 0, good: 0, easy: 0 });

  if (!cards || cards.length === 0) return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-transparent overflow-y-auto">
      <div className="w-40 h-40 rounded-full glass bg-emerald-500/20 flex items-center justify-center mb-8 border border-emerald-500/30 shadow-2xl"><CheckCircle2 size={80} className="text-emerald-500"/></div>
      <h2 className="title-font text-4xl font-black mb-4">Mastery Complete!</h2>
      <div className="grid grid-cols-4 gap-4 mb-12 mt-8 w-full max-w-md">
        {Object.entries(sessionStats).map(([k, v]) => (<div key={k} className="glass rounded-2xl p-5 text-center shadow-md border border-[var(--border)]"><p className="text-3xl font-black title-font">{v}</p><p className="text-[10px] font-bold uppercase tracking-widest opacity-60 mt-2">{k}</p></div>))}
      </div>
      <button onClick={onBack} className="px-10 py-5 btn-accent rounded-full font-black text-xs uppercase tracking-widest shadow-xl">Back to Vault</button>
    </div>
  );

  const currentCard = cards[currentIndex];
  const handleRate = (quality) => {
    const ratingKey = quality === 0 ? 'again' : quality === 3 ? 'hard' : quality === 4 ? 'good' : 'easy'; setSessionStats(prev => ({ ...prev, [ratingKey]: prev[ratingKey] + 1 }));
    let newRep = currentCard.repetitions || 0, newEf = currentCard.ef || 2.5, newInterval = currentCard.interval || 1;
    if (quality < 3) { newRep = 0; newInterval = 1; } else { newEf = Math.max(1.3, newEf + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))); newRep++; newInterval = newRep === 1 ? 1 : newRep === 2 ? 6 : Math.round(newInterval * newEf); }
    const newCard = { ...currentCard, repetitions: newRep, ef: newEf, interval: newInterval, lastReview: Date.now(), nextReview: Date.now() + newInterval * 86400000 };
    setCards(prev => prev.map(c => c.id === newCard.id ? newCard : c)); setFlashcards(gs => gs.map(set => ({ ...set, cards: set.cards ? set.cards.map(c => c.id === newCard.id ? newCard : c) : set.cards })));
    setIsFlipped(false); if (currentIndex < cards.length - 1) setCurrentIndex(currentIndex + 1); else setCards([]);
  };

  const handleJumpToSource = (pageNumber) => {
    if(pageNumber && setCurrentView) {
      setCurrentView('reader'); setCurrentPage(parseInt(pageNumber)); 
      setRightPanelOpen(false); setTimeout(()=>setRightPanelOpen(true), 500); 
    } 
  };

  const progressPct = Math.round((currentIndex / (initialCards?.length || 1)) * 100);

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-[#0a0a0c]">
      {/* Header */}
      <div className="bg-[var(--accent-color)]/10 border-b border-[var(--accent-color)]/20 p-4 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="text-[var(--accent-color)] text-xs font-bold uppercase tracking-widest flex items-center gap-2"><ChevronLeft size={16}/> Exit</button>
        <div className="flex items-center gap-4">
          <div className="hidden md:block w-40 bg-gray-200 dark:bg-zinc-800 rounded-full h-2"><div className="bg-[var(--accent-color)] h-full rounded-full transition-all" style={{ width: `${progressPct}%` }}/></div>
          <span className="text-[10px] font-black uppercase tracking-widest bg-[var(--accent-color)]/10 text-[var(--accent-color)] px-3 py-1.5 rounded-lg">{currentIndex + 1} / {initialCards?.length || cards.length}</span>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center justify-start pt-12 p-6 pb-[120px]">
        <div onClick={() => !isFlipped && setIsFlipped(true)} className={`w-full max-w-2xl perspective-1000 cursor-pointer mb-8 shrink-0 ${isFlipped ? 'min-h-[500px]' : 'h-80'}`}>
          <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${isFlipped ? 'rotate-x-180' : 'hover:scale-[1.02]'}`}>
            
            {/* FRONT OF CARD */}
            <div className="absolute inset-0 backface-hidden bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[3rem] p-10 flex flex-col items-center justify-center text-center shadow-xl">
              <span className="absolute top-6 left-6 text-[10px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 dark:bg-zinc-800 px-3 py-1.5 rounded-xl">Question</span>
              <h2 className="text-xl md:text-3xl font-bold text-gray-900 dark:text-white leading-relaxed">{currentCard.q}</h2>
              <div className="absolute bottom-6 text-[10px] font-bold uppercase tracking-widest text-[var(--accent-color)] animate-pulse bg-[var(--accent-color)]/10 px-4 py-2 rounded-full">Tap to reveal answer</div>
            </div>

            {/* BACK OF CARD */}
            <div onClick={e => e.stopPropagation()} className="absolute inset-0 backface-hidden bg-white dark:bg-zinc-900 border-2 border-[var(--accent-color)]/50 rounded-[3rem] p-8 flex flex-col shadow-2xl rotate-x-180 overflow-y-auto custom-scrollbar">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-color)] bg-[var(--accent-color)]/10 px-3 py-1.5 rounded-xl self-start mb-6">Answer</span>
              <p className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white leading-relaxed mb-6">{currentCard.a}</p>
              
              {currentCard.evidence && (
                <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800 w-full">
                  <p className="text-xs italic text-gray-600 dark:text-zinc-400 border-l-4 border-gray-300 dark:border-zinc-700 pl-3 mb-4">"{currentCard.evidence}"</p>
                  {currentCard.sourcePage && (
                    <button onClick={() => handleJumpToSource(currentCard.sourcePage)} className="px-4 py-2 bg-gray-900 dark:bg-white text-white dark:text-zinc-900 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center gap-2 hover:scale-105 transition-transform w-fit"><FileSearch size={14}/> View Source (Pg {currentCard.sourcePage})</button>
                  )}
                </div>
              )}
              <MiniTutorChat contextObj={currentCard} settings={settings}/>
            </div>

          </div>
        </div>

        {/* SR Controls */}
        <div className={`w-full max-w-2xl grid grid-cols-2 md:grid-cols-4 gap-4 transition-all duration-500 ${isFlipped ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8 pointer-events-none'}`}>
          {[{ label: 'Again', q: 0, cls: 'text-red-600 bg-red-50 hover:bg-red-500 hover:text-white border-red-200' }, { label: 'Hard', q: 3, cls: 'text-amber-600 bg-amber-50 hover:bg-amber-500 hover:text-white border-amber-200' }, { label: 'Good', q: 4, cls: 'text-emerald-600 bg-emerald-50 hover:bg-emerald-500 hover:text-white border-emerald-200' }, { label: 'Easy', q: 5, cls: 'text-blue-600 bg-blue-50 hover:bg-blue-500 hover:text-white border-blue-200' }].map(({ label, q, cls }) => (
            <button key={label} onClick={() => handleRate(q)} className={`py-5 rounded-2xl text-xs font-black uppercase tracking-widest border-2 transition-all hover:-translate-y-1 shadow-sm ${cls}`}>{label}</button>
          ))}
        </div>
      </div>
      <style>{`.perspective-1000{perspective:1000px}.transform-style-3d{transform-style:preserve-3d}.backface-hidden{backface-visibility:hidden}.rotate-x-180{transform:rotateX(180deg)}`}</style>
    </div>
  );
}

function InPanelNote({ note, onBack }) {
  const copyToClipboard = () => { navigator.clipboard?.writeText(note.content); };
  return (
    <div className="flex-1 flex flex-col bg-transparent min-h-0">
      <div className="glass bg-blue-500/10 border-b border-blue-500/20 p-5 flex items-center justify-between shrink-0 rounded-none">
        <button onClick={onBack} className="text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest flex items-center gap-2 px-3 py-1.5 rounded-lg hover:bg-blue-500/20 transition-colors"><ChevronLeft size={16}/> Back</button>
        <button onClick={copyToClipboard} className="text-blue-600 dark:text-blue-400 p-3 glass rounded-xl hover:bg-blue-500/20 transition-colors shadow-md"><Clipboard size={20}/></button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 pb-[100px] md:pb-10 max-w-4xl mx-auto w-full min-h-0">
        <h2 className="title-font text-4xl font-black mb-10">{note.title}</h2>
        <div className="text-lg whitespace-pre-wrap leading-loose glass bg-[var(--card)] p-10 rounded-[3rem] shadow-2xl border border-[var(--border)]">{note.content}</div>
      </div>
    </div>
  );
}

function ToolBtn({ id, active, set, icon: Icon, label }) {
  const isA = active === id;
  return (
    <button onClick={() => set(id)} className={`py-4 flex flex-col items-center justify-center gap-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${isA ? 'bg-[var(--accent)] text-white shadow-lg scale-105 border border-transparent' : 'glass opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10 border border-[var(--border)]'}`}>
      <Icon size={20}/> {label}
    </button>
  );
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 glass rounded-[3rem] border-dashed border-2 border-[var(--border)] m-2 shadow-sm">
      <Icon size={56} className="opacity-30 mb-6"/><p className="text-base opacity-60 font-bold leading-relaxed max-w-[250px]">{text}</p>
    </div>
  );
}