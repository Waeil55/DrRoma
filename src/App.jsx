import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  BookOpen, Layers, CheckSquare, Settings, ChevronLeft, ChevronRight, MessageSquare,
  CheckCircle2, Library, Trash2, Loader2, Send, GraduationCap, Save, X, BookA,
  AlertCircle, FileUp, Target, Trash, Sparkles, Activity, Stethoscope, Lightbulb,
  Baby, Play, Pill, Thermometer, Zap, Database, Search, Palette, Type,
  Moon, Sun, UserCircle2, ZoomIn, ZoomOut, Maximize, PlusCircle,
  CloudSun, MoonStar, FileSearch, MessageCircleQuestion, FastForward,
  FlaskConical, Info, Clipboard, KeyRound, Globe, ChevronDown, ChevronUp
} from 'lucide-react';

const MARIAM_IMG = "https://raw.githubusercontent.com/Waeil55/DrMariam/main/M.jpeg";

// ─── INDEXED DB ───────────────────────────────────────────────────────────────
const DB_NAME = 'MariamProDB_v26';
const openDB = () => new Promise((resolve, reject) => {
  const req = indexedDB.open(DB_NAME, 5);
  req.onupgradeneeded = e => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains('pdfs')) db.createObjectStore('pdfs');
    if (!db.objectStoreNames.contains('appState')) db.createObjectStore('appState');
  };
  req.onsuccess = () => resolve(req.result);
  req.onerror = () => reject(req.error);
});
const dbOp = async (store, mode, op) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, mode);
    const s = tx.objectStore(store);
    const r = op(s);
    if (r && r.onsuccess !== undefined) { r.onsuccess = () => resolve(r.result); r.onerror = () => reject(r.error); }
    else { tx.oncomplete = () => resolve(); tx.onerror = () => reject(tx.error); }
  });
};
const savePdf = (id, d) => dbOp('pdfs', 'readwrite', s => { s.put(d, id); });
const getPdf  = id => dbOp('pdfs', 'readonly', s => s.get(id));
const delPdf  = id => dbOp('pdfs', 'readwrite', s => { s.delete(id); });
const saveState = (k, v) => dbOp('appState', 'readwrite', s => { s.put(v, k); });
const getState  = k => dbOp('appState', 'readonly', s => s.get(k));

const loadPdfJs = async () => {
  if (window.pdfjsLib) return window.pdfjsLib;
  return new Promise((resolve, reject) => {
    const sc = document.createElement('script');
    sc.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.min.js';
    sc.onload = () => { window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js'; resolve(window.pdfjsLib); };
    sc.onerror = reject;
    document.body.appendChild(sc);
  });
};

// ─── UNIVERSAL AI ENGINE ──────────────────────────────────────────────────────
// Supports: Anthropic (Claude), OpenAI, Google Gemini, and any OpenAI-compatible
// endpoint (GLM, DeepSeek, Groq, Mistral, local Ollama, etc.)
const callAI = async (prompt, expectJson, strictMode, settings = {}, maxTokens = 4000) => {
  const { provider = 'anthropic', apiKey = '', baseUrl = '', model = '' } = settings;

  const sysParts = strictMode
    ? 'SUPER STRICT: You are an elite medical AI. Use ONLY the provided text. NO outside knowledge. Every answer MUST cite [Page X].'
    : 'You are an elite medical AI. Vast clinical knowledge. Prioritize document context. Be smart, detailed, and helpful.';
  const jsonSuffix = expectJson ? '\n\nCRITICAL: Respond ONLY with valid JSON. No markdown fences, no preamble.' : '';
  const finalPrompt = prompt + jsonSuffix;

  // ── Anthropic / Claude ─────────────────────────────────────────────────────
  if (provider === 'anthropic') {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...(apiKey ? { 'x-api-key': apiKey } : {}) },
      body: JSON.stringify({
        model: model || 'claude-sonnet-4-20250514',
        max_tokens: Math.min(maxTokens, 8000),
        system: sysParts,
        messages: [{ role: 'user', content: finalPrompt }]
      })
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error?.message || res.statusText); }
    const d = await res.json();
    return d.content[0].text.trim();
  }

  // ── Google Gemini ──────────────────────────────────────────────────────────
  if (provider === 'gemini') {
    if (!apiKey) throw new Error('Gemini API key is required. Add it in Settings.');
    const mdl = model || 'gemini-2.0-flash';
    const url = `https://generativelanguage.googleapis.com/v1beta/models/${mdl}:generateContent?key=${apiKey}`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: sysParts }] },
        contents: [{ role: 'user', parts: [{ text: finalPrompt }] }],
        generationConfig: { maxOutputTokens: Math.min(maxTokens, 8192), temperature: strictMode ? 0 : 0.7 }
      })
    });
    if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error?.message || res.statusText); }
    const d = await res.json();
    return d.candidates[0].content.parts[0].text.trim();
  }

  // ── OpenAI + any compatible (GLM, DeepSeek, Groq, Ollama …) ───────────────
  if (!apiKey) throw new Error('API key is required. Add it in Settings.');
  const base = (baseUrl || 'https://api.openai.com').replace(/\/$/, '');
  const res = await fetch(`${base}/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
    body: JSON.stringify({
      model: model || 'gpt-4o-mini',
      messages: [{ role: 'system', content: sysParts }, { role: 'user', content: finalPrompt }],
      max_tokens: Math.min(maxTokens, 8000),
      temperature: strictMode ? 0 : 0.7,
      ...(expectJson && provider === 'openai' ? { response_format: { type: 'json_object' } } : {})
    })
  });
  if (!res.ok) { const e = await res.json().catch(() => ({})); throw new Error(e.error?.message || res.statusText); }
  const d = await res.json();
  return d.choices[0].message.content.trim();
};

const parseJsonSafe = text => {
  let c = text.replace(/```json/gi,'').replace(/```/g,'').trim();
  const f = c.indexOf('{'), l = c.lastIndexOf('}');
  if (f !== -1 && l !== -1) c = c.substring(f, l + 1);
  return JSON.parse(c);
};

const runParallel = async (tasks, concurrency = 2, onProgress) => {
  const results = [];
  for (let i = 0; i < tasks.length; i += concurrency) {
    const batch = tasks.slice(i, i + concurrency);
    const br = await Promise.allSettled(batch.map(fn => fn()));
    results.push(...br);
    if (onProgress) onProgress(Math.min(i + concurrency, tasks.length), tasks.length);
    if (i + concurrency < tasks.length) await new Promise(r => setTimeout(r, 400));
  }
  return results;
};

// ─── TOAST ────────────────────────────────────────────────────────────────────
function useToast() {
  const [toasts, setToasts] = useState([]);
  const addToast = useCallback((msg, type = 'success', dur = 3500) => {
    const id = Date.now();
    setToasts(p => [...p, { id, msg, type }]);
    setTimeout(() => setToasts(p => p.filter(t => t.id !== id)), dur);
  }, []);
  return { toasts, addToast };
}
function ToastContainer({ toasts }) {
  return (
    <div className="fixed top-24 right-4 z-[9999] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`px-5 py-4 rounded-2xl text-sm font-bold shadow-2xl glass border flex items-center gap-3 animate-slide-in pointer-events-auto
          ${t.type==='success'?'bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border-emerald-400/30':
            t.type==='error'?'bg-red-500/20 text-red-700 dark:text-red-300 border-red-400/30':'bg-[var(--card)] text-[var(--text)] border-[var(--border)]'}`}>
          {t.type==='success'?<CheckCircle2 size={18}/>:t.type==='error'?<AlertCircle size={18}/>:<Info size={18}/>} {t.msg}
        </div>
      ))}
    </div>
  );
}

// ─── PROGRESS OVERLAY ─────────────────────────────────────────────────────────
function ProgressOverlay({ task, onCancel, onView }) {
  if (!task) return null;
  return (
    <div className="fixed bottom-28 right-4 md:right-8 z-[9998] glass bg-[var(--card)] rounded-3xl p-5 shadow-2xl border-2 border-[var(--accent)] flex flex-col gap-3 w-[calc(100%-32px)] md:w-[340px] animate-slide-in">
      <div className="flex justify-between items-center">
        <span className="text-xs font-black uppercase tracking-widest text-[var(--accent)] flex items-center gap-2">
          {task.isFinished ? <CheckCircle2 size={16}/> : <FastForward size={16} className="animate-pulse"/>}
          {task.title || 'AI Engine'}
        </span>
        <button onClick={onCancel} className="opacity-50 hover:opacity-100 hover:text-red-500 p-1 rounded-lg"><X size={15}/></button>
      </div>
      <p className="text-xs font-bold opacity-80 leading-snug">{task.msg}</p>
      {!task.isFinished && (
        <div className="w-full bg-black/10 dark:bg-white/10 rounded-full h-2.5 overflow-hidden">
          <div className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent-soft)] h-full rounded-full transition-all duration-500"
               style={{ width: `${task.total ? (task.done / task.total) * 100 : 15}%` }}/>
        </div>
      )}
      {task.isFinished && (
        <button onClick={onView} className="w-full py-3 mt-1 bg-[var(--accent)]/10 text-[var(--accent)] hover:bg-[var(--accent)]/20 rounded-xl text-[10px] font-black uppercase tracking-widest border border-[var(--accent)]/20">
          View Results
        </button>
      )}
    </div>
  );
}

// ─── LAB TABLE ────────────────────────────────────────────────────────────────
function LabResultRow({ test, result, range, units, flag }) {
  const isL = flag==='L', isH = flag==='H';
  return (
    <tr className="border-b border-gray-100 dark:border-zinc-800/60 hover:bg-gray-50/50 dark:hover:bg-zinc-800/30">
      <td className="py-3 px-4 text-xs font-bold text-gray-700 dark:text-zinc-300">{test}</td>
      <td className="py-3 px-4 text-xs text-center">
        <span className={`font-black inline-flex items-center gap-1 ${isL?'text-blue-600':isH?'text-red-600':'text-gray-900 dark:text-white'}`}>
          {result}
          {flag && <span className={`text-[9px] font-black px-1.5 py-0.5 rounded ${isL?'bg-blue-100 text-blue-700':'bg-red-100 text-red-700'}`}>{flag}</span>}
        </span>
      </td>
      <td className="py-3 px-4 text-xs text-center text-gray-500 font-mono">{range}</td>
      <td className="py-3 px-4 text-[10px] text-center text-gray-400 font-mono uppercase">{units}</td>
    </tr>
  );
}
function LabTable({ rows }) {
  if (!rows?.length) return null;
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-800 bg-white dark:bg-[#121214] shadow-sm mb-5">
      <table className="w-full border-collapse">
        <thead><tr className="bg-gray-50 dark:bg-zinc-900/80 border-b border-gray-200 dark:border-zinc-800">
          {['Test','Result','Range','Units'].map(h=>(
            <th key={h} className="py-2 px-4 text-[9px] font-black uppercase tracking-widest text-gray-400">{h}</th>
          ))}
        </tr></thead>
        <tbody>{rows.map((r,i)=><LabResultRow key={i} {...r}/>)}</tbody>
      </table>
    </div>
  );
}

// ─── MINI TUTOR CHAT ──────────────────────────────────────────────────────────
function MiniTutorChat({ contextObj, settings, onClose }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const handleSend = async () => {
    if (!input.trim() || loading) return;
    const newMsgs = [...messages, { role: 'user', content: input }];
    setMessages(newMsgs); setInput(''); setLoading(true);
    try {
      const res = await callAI(
        `You are an elite medical tutor. CONTEXT:\n${JSON.stringify(contextObj,null,2)}\n\nSTUDENT: ${input}\n\nAnswer brilliantly and concisely.`,
        false, false, settings, 2000
      );
      setMessages([...newMsgs, { role: 'assistant', content: res }]);
    } catch (e) {
      setMessages([...newMsgs, { role: 'assistant', content: `⚠️ ${e.message}` }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full bg-white dark:bg-[#0f111a]">
      <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800 shrink-0">
        <span className="text-xs font-black uppercase tracking-widest text-[var(--accent-color)] flex items-center gap-2">
          <img src={MARIAM_IMG} className="w-8 h-8 rounded-lg object-cover" alt="Tutor"/> AI Tutor
        </span>
        <button onClick={onClose} className="hover:text-red-500 p-2 glass rounded-lg"><X size={16}/></button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center opacity-50 mt-8">
            <img src={MARIAM_IMG} className="w-16 h-16 rounded-2xl object-cover mx-auto mb-3 grayscale" alt="Tutor"/>
            <p className="text-xs font-bold">Ask me anything about this question.</p>
          </div>
        )}
        {messages.map((m,i) => (
          <div key={i} className={`flex gap-2 ${m.role==='user'?'flex-row-reverse':''}`}>
            <div className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 ${m.role==='user'?'bg-[var(--accent-color)] text-white':'bg-gray-100 dark:bg-zinc-800'}`}>
              {m.role==='user'?<UserCircle2 size={14}/>:<img src={MARIAM_IMG} className="w-full h-full rounded-xl object-cover" alt="AI"/>}
            </div>
            <div className={`p-3 text-xs leading-relaxed max-w-[86%] ${m.role==='user'?'bg-[var(--accent-color)] text-white rounded-2xl rounded-tr-sm':'bg-gray-100 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl rounded-tl-sm whitespace-pre-wrap'}`}>{m.content}</div>
          </div>
        ))}
        {loading && <Loader2 size={16} className="animate-spin text-[var(--accent-color)] mx-auto"/>}
        <div ref={endRef}/>
      </div>
      <div className="p-3 shrink-0 border-t border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900">
        <div className="relative">
          <input value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>e.key==='Enter'&&handleSend()}
            placeholder="Ask your tutor…" disabled={loading}
            className="w-full bg-white dark:bg-black border border-gray-300 dark:border-zinc-700 rounded-xl py-3 pl-4 pr-11 text-xs outline-none focus:border-[var(--accent-color)]"/>
          <button onClick={handleSend} disabled={loading||!input.trim()}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-[var(--accent-color)] text-white p-2 rounded-lg disabled:opacity-40">
            <Send size={13}/>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── MAIN APP ─────────────────────────────────────────────────────────────────
const DEFAULT_SETTINGS = {
  provider: 'anthropic', apiKey: '', baseUrl: '', model: '',
  strictMode: true, theme: 'pure-white', fontSize: 'medium', accentColor: 'indigo'
};

export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [documents, setDocuments]   = useState([]);
  const [openDocs,  setOpenDocs]    = useState([]);
  const [activeDocId, setActiveDocId] = useState(null);
  const [docPages,  setDocPages]    = useState({});
  const [flashcards, setFlashcards] = useState([]);
  const [exams,  setExams]  = useState([]);
  const [cases,  setCases]  = useState([]);
  const [notes,  setNotes]  = useState([]);
  const [chatSessions, setChatSessions] = useState([]);
  const [userSettings, setUserSettings] = useState(DEFAULT_SETTINGS);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentView, setCurrentView] = useState('library');
  const [rightPanelTab, setRightPanelTab] = useState('generate');
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [aiWidth, setAiWidth] = useState(440);
  const [isResizing, setIsResizing] = useState(false);
  const [bgTask, setBgTask] = useState(null);
  const { toasts, addToast } = useToast();

  // viewport
  useEffect(() => {
    let m = document.querySelector('meta[name="viewport"]');
    if (!m) { m = document.createElement('meta'); m.name = 'viewport'; document.head.appendChild(m); }
    m.content = 'width=device-width,initial-scale=1.0,maximum-scale=1.0,user-scalable=no,viewport-fit=cover';
  }, []);

  // load
  useEffect(() => {
    (async () => {
      try {
        const [d,fc,ex,ca,no,ch,st,od,dp] = await Promise.all([
          getState('docs'),getState('flashcards'),getState('exams'),getState('cases'),
          getState('notes'),getState('chats'),getState('settings'),getState('openDocs'),getState('docPages')
        ]);
        if(d)  setDocuments(d);
        if(fc) setFlashcards(fc);
        if(ex) setExams(ex);
        if(ca) setCases(ca);
        if(no) setNotes(no);
        if(ch) setChatSessions(ch);
        if(st) setUserSettings(p=>({...DEFAULT_SETTINGS,...p,...st}));
        if(od) setOpenDocs(od);
        if(dp) setDocPages(dp);
      } catch(e){console.warn(e);} finally { setIsLoaded(true); }
    })();
  }, []);

  // persist
  useEffect(() => {
    if (!isLoaded) return;
    const t = setTimeout(async () => {
      try {
        const slim = documents.map(d=>{const c={...d};delete c.pagesText;return c;});
        await Promise.all([
          saveState('docs',slim),saveState('flashcards',flashcards),saveState('exams',exams),
          saveState('cases',cases),saveState('notes',notes),saveState('chats',chatSessions),
          saveState('settings',userSettings),saveState('openDocs',openDocs),saveState('docPages',docPages)
        ]);
      } catch(e){console.warn(e);}
    }, 1000);
    return () => clearTimeout(t);
  }, [documents,flashcards,exams,cases,notes,chatSessions,userSettings,openDocs,docPages,isLoaded]);

  // theme / font / accent
  const fontSizeMap = {small:'14px',medium:'16px',large:'18px',xl:'20px',xxl:'22px'};
  useEffect(() => {
    const root = document.documentElement;
    root.classList.remove('light','dark','pure-white','oled');
    let th = userSettings.theme;
    if (th==='system') th = window.matchMedia?.('(prefers-color-scheme:dark)').matches ? 'dark' : 'pure-white';
    root.classList.add(th);
    root.style.setProperty('color-scheme',(th==='dark'||th==='oled')?'dark':'light');
    root.style.fontSize = fontSizeMap[userSettings.fontSize]||'16px';
    const clrs = {
      indigo:{hex:'#6366f1',rgb:'99,102,241',soft:'#4f46e5'},
      purple:{hex:'#a855f7',rgb:'168,85,247',soft:'#9333ea'},
      blue:  {hex:'#3b82f6',rgb:'59,130,246',soft:'#2563eb'},
      emerald:{hex:'#10b981',rgb:'16,185,129',soft:'#059669'},
      rose:  {hex:'#f43f5e',rgb:'244,63,94',soft:'#e11d48'}
    };
    const c = clrs[userSettings.accentColor]||clrs.indigo;
    root.style.setProperty('--accent',c.hex);
    root.style.setProperty('--accent-rgb',c.rgb);
    root.style.setProperty('--accent-soft',c.soft);
    root.style.setProperty('--accent-color',c.hex);
  }, [userSettings.theme,userSettings.fontSize,userSettings.accentColor]);

  // panel resize
  useEffect(() => {
    const move = e => {
      if (!isResizing) return;
      const x = e.touches?.[0]?.clientX ?? e.clientX;
      if (x) setAiWidth(Math.max(300,Math.min(window.innerWidth-x,window.innerWidth-260)));
    };
    const up = () => { if(isResizing) setIsResizing(false); };
    if (isResizing) {
      document.addEventListener('mousemove',move); document.addEventListener('mouseup',up);
      document.addEventListener('touchmove',move,{passive:false}); document.addEventListener('touchend',up);
      document.body.style.userSelect='none';
    } else { document.body.style.userSelect=''; }
    return () => {
      document.removeEventListener('mousemove',move); document.removeEventListener('mouseup',up);
      document.removeEventListener('touchmove',move); document.removeEventListener('touchend',up);
      document.body.style.userSelect='';
    };
  },[isResizing]);

  // ── UPLOAD ─────────────────────────────────────────────────────────────────
  const handleFileUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    if (event.target) event.target.value = '';   // reset immediately so re-upload works
    setIsUploading(true); setUploadProgress(5);
    try {
      const pdfjs = await loadPdfJs();
      const newDocs=[], newOpenIds=[], newPageMap={};
      let lastId = null;
      for (let fi=0; fi<files.length; fi++) {
        const file = files[fi];
        if (file.type !== 'application/pdf') { addToast(`"${file.name}" is not a PDF — skipped.`,'info'); continue; }
        let ab;
        try { ab = await file.arrayBuffer(); } catch(e){ addToast(`Cannot read "${file.name}".`,'error'); continue; }
        let pdf;
        try { pdf = await pdfjs.getDocument({data:ab.slice(0)}).promise; }
        catch(e){ addToast(`Cannot parse "${file.name}" as PDF.`,'error'); continue; }
        const tot = pdf.numPages, pagesText = {};
        for (let i=1; i<=tot; i++) {
          try { const pg=await pdf.getPage(i); const tc=await pg.getTextContent(); pagesText[i]=tc.items.map(s=>s.str).join(' '); pg.cleanup(); }
          catch(e){ pagesText[i]=''; }
          if(i%10===0) await new Promise(r=>setTimeout(r,5));
          setUploadProgress(Math.round((fi/files.length*100)+((i/tot)*(100/files.length))));
        }
        try { await pdf.destroy(); } catch(e){}
        const id = `${Date.now()}-${Math.random().toString(36).substr(2,6)}`;
        await savePdf(id,{buffer:ab,pagesText});
        newDocs.push({id,name:file.name,totalPages:tot,progress:1,addedAt:new Date().toISOString()});
        newOpenIds.push(id); newPageMap[id]=1; lastId=id;
        addToast(`"${file.name}" imported!`,'success');
      }
      if (newDocs.length) {
        setDocuments(p=>[...p,...newDocs]);
        setOpenDocs(p=>[...new Set([...p,...newOpenIds])]);
        setDocPages(p=>({...p,...newPageMap}));
        if (lastId) setTimeout(()=>{ setActiveDocId(lastId); setCurrentView('reader'); setRightPanelOpen(true); },60);
      }
    } catch(e){ addToast(`Upload failed: ${e.message}`,'error'); }
    finally { setIsUploading(false); setUploadProgress(0); }
  };

  const closeDoc = useCallback((id)=>{
    setOpenDocs(p=>p.filter(d=>d!==id));
    setActiveDocId(prev=>{
      if (prev!==id) return prev;
      const next = openDocs.filter(d=>d!==id)[0]||null;
      if (!next) setCurrentView('library');
      return next;
    });
  },[openDocs]);

  const deleteDocument = async (id,e) => {
    if(e) e.stopPropagation();
    try { await delPdf(id); } catch(e){}
    setDocuments(p=>p.filter(d=>d.id!==id));
    setFlashcards(p=>p.filter(f=>f.docId!==id));
    setExams(p=>p.filter(ex=>ex.docId!==id));
    setCases(p=>p.filter(c=>c.docId!==id));
    setNotes(p=>p.filter(n=>n.docId!==id));
    closeDoc(id); addToast('Document deleted','info');
  };

  const activeDoc = useMemo(()=>documents.find(d=>d.id===activeDocId)||null,[documents,activeDocId]);
  const filteredDocs = searchQuery ? documents.filter(d=>d.name.toLowerCase().includes(searchQuery.toLowerCase())) : documents;

  // ── BACKGROUND GENERATION ──────────────────────────────────────────────────
  const startBgGen = async (taskType, docId, startPage, endPage, params) => {
    if (bgTask) { addToast('A generation is already running.','info'); return; }
    setBgTask({title:`AI ${taskType.toUpperCase()}`,msg:'Initializing…',done:0,total:1,isFinished:false,result:null});
    try {
      const pdfData = await getPdf(docId);
      const pagesText = pdfData?.pagesText||{};
      let textContext='';
      for (let i=Number(startPage);i<=Number(endPage);i++) {
        if(pagesText[i]) textContext+=`\n--- [SOURCE: PAGE ${i}] ---\n${pagesText[i]}\n`;
      }
      if (!textContext.trim()||textContext.length<50) throw new Error('Insufficient text in selected page range.');
      const sysInstr=`STRICT:\n1. Use ONLY provided text.\n2. Every item must cite the exact page.\n3. Difficulty: ${params.difficultyLevel||'Expert'}.`;
      const count=params.count||5;
      const perBatch = taskType==='cases'?1:taskType==='flashcards'?7:4;
      const numBatches = Math.ceil(count/perBatch);
      setBgTask(p=>({...p,total:numBatches,msg:`Preparing ${numBatches} AI request(s)…`}));

      const tasks = Array.from({length:numBatches},(_,i)=>{
        const bc=(i===numBatches-1&&count%perBatch!==0)?count%perBatch:perBatch;
        let sp='';
        if (taskType==='cases') {
          sp=`Generate ${bc} complex USMLE-style clinical case(s) from the text.\nRequirements:\n- Long patient vignette (HPI, Exam, ROS)\n- Minimum 12 lab rows across panels (CBC, BMP, LFTs, etc.)\n- flag "H" or "L" for any abnormal result\nFormat as JSON:\n{"cases":[{"title":"…","vignette":"…","diagnosis":"…","labPanels":[{"panelName":"…","rows":[{"test":"…","result":"…","flag":"H","range":"…","units":"…"}]}],"examQuestion":{"q":"…","options":["A","B","C","D"],"correct":0,"explanation":"…","evidence":"…","sourcePage":${startPage}}}]}`;
        } else if (taskType==='flashcards') {
          sp=`Generate ${bc} expert medical flashcards.\nJSON: {"items":[{"q":"…","a":"…","evidence":"…","sourcePage":0}]}`;
        } else if (taskType==='exam') {
          sp=`Generate ${bc} high-yield exam questions.\nJSON: {"items":[{"q":"…","options":["A","B","C","D"],"correct":0,"explanation":"…","evidence":"…","sourcePage":0}]}`;
        } else {
          sp=`Task: ${taskType}. Respond in Markdown.`;
        }
        return ()=>callAI(`${sysInstr}\n\nTEXT:\n${textContext}\n\n${sp}`,
          ['cases','flashcards','exam'].includes(taskType), userSettings.strictMode, userSettings, 6000);
      });

      let all=[];
      const exResults = await runParallel(tasks,2,(done,total)=>{
        setBgTask(p=>({...p,done,msg:`Batch ${done}/${total} complete…`}));
      });
      if (['cases','flashcards','exam'].includes(taskType)) {
        for(const r of exResults) {
          if(r.status==='fulfilled') {
            try { const p=parseJsonSafe(r.value); all=[...all,...(p.cases||p.items||p.questions||[])]; }
            catch(e){ console.warn('Parse fail:',e.message); }
          }
        }
        if (!all.length) throw new Error('AI returned no data. Try fewer pages or lower count.');
        setBgTask(p=>({...p,isFinished:true,result:{type:taskType,title:'Generated Content',data:all.slice(0,count),pages:`${startPage}-${endPage}`},msg:`Done! ${all.length} item(s) generated.`}));
      } else {
        const raw=exResults[0]?.value||'No content generated.';
        const titles={clinical:'Clinical Summary',differential:'Differential Dx',treatment:'Treatment Plan',labs:'Lab Interpretation',eli5:'ELI5 Simplification',summary:'Summary',mnemonics:'Mnemonics'};
        setBgTask(p=>({...p,isFinished:true,result:{type:taskType,data:raw,pages:`${startPage}-${endPage}`,customTitle:titles[taskType]||taskType},msg:'Complete!'}));
      }
      addToast('Generation complete!','success');
    } catch(e) {
      console.error(e); setBgTask(null); addToast(e.message,'error');
    }
  };

  const handleViewBgTask = ()=>{ if(!bgTask?.result) return; setCurrentView('reader'); setRightPanelOpen(true); setRightPanelTab('generate'); };

  if (!isLoaded) return (
    <div className="h-[100dvh] w-screen flex flex-col items-center justify-center bg-[var(--bg)] gap-5">
      <style>{`:root{--bg:#ffffff;--text:#0f172a;--card:#f8fafc;--border:#e2e8f0;--accent:#6366f1;--accent-soft:#4f46e5;--accent-color:#6366f1;}`}</style>
      <Loader2 className="animate-spin text-[var(--accent)]" size={56}/>
      <p className="font-black text-[var(--text)] uppercase tracking-[0.3em] text-xs opacity-40">Loading MARIAM…</p>
    </div>
  );

  const setPage = (updater) => setDocPages(p=>({...p,[activeDocId]:typeof updater==='function'?updater(p[activeDocId]||1):updater}));

  return (
    <div className="h-[100dvh] w-screen flex flex-col overflow-hidden bg-[var(--bg)] text-[var(--text)]">
      <style>{`
        .pure-white{--bg:#ffffff;--text:#0f172a;--card:#f8fafc;--border:#e2e8f0;}
        .light{--bg:#f5f7ff;--text:#1e293b;--card:#ffffff;--border:#e2e8f0;}
        .dark{--bg:#0f111a;--text:#e2e8f0;--card:#161a27;--border:#27273c;}
        .oled{--bg:#000000;--text:#f1f5f9;--card:#0a0a0a;--border:#1e1e1e;}
        body{margin:0;padding:0;background:var(--bg);overflow:hidden;font-family:'Inter',system-ui;}
        .title-font{font-family:'Space Grotesk',sans-serif;}
        .glass{background:var(--card);border:1px solid var(--border);box-shadow:0 4px 20px rgba(0,0,0,.03);}
        .btn-accent{background:linear-gradient(135deg,var(--accent),var(--accent-soft));color:white;border:none;}
        .btn-accent:hover{transform:translateY(-2px);box-shadow:0 10px 20px rgba(var(--accent-rgb),.3);}
        .card-hover{transition:.3s ease;}.card-hover:hover{transform:translateY(-4px);box-shadow:0 15px 35px rgba(0,0,0,.08);border-color:rgba(var(--accent-rgb),.4);}
        .custom-scrollbar::-webkit-scrollbar{width:5px;height:5px;}.custom-scrollbar::-webkit-scrollbar-thumb{background:rgba(128,128,128,.2);border-radius:10px;}
        .pdf-text-layer{position:absolute;inset:0;overflow:hidden;opacity:1;line-height:1;}
        .pdf-text-layer span{position:absolute;color:transparent;transform-origin:0% 0%;white-space:pre;cursor:text;}
        canvas{width:100%!important;height:auto!important;display:block;}
        @keyframes slide-in{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:none}}
        .animate-slide-in{animation:slide-in .25s ease-out forwards;}
        /* bottom-nav sits above everything on mobile */
        .bottom-nav{background:var(--card);border:1px solid var(--border);box-shadow:0 -5px 30px rgba(0,0,0,.12);border-radius:2rem;}
      `}</style>

      <ToastContainer toasts={toasts}/>
      <ProgressOverlay task={bgTask} onCancel={()=>setBgTask(null)} onView={handleViewBgTask}/>

      {/* ── HEADER ── */}
      <div className="h-16 md:h-20 glass flex items-center justify-between px-4 md:px-8 z-40 shrink-0 rounded-none border-t-0 border-l-0 border-r-0">
        <div className="flex items-center gap-2 md:gap-3">
          <img src={MARIAM_IMG} className="w-8 h-8 md:w-10 md:h-10 rounded-xl object-cover border border-[var(--border)]" alt="Logo"/>
          <span className="title-font text-2xl md:text-3xl font-black tracking-tighter text-[var(--accent)]">MARIAM</span>
          <span className="text-[10px] font-black bg-[var(--accent)] text-white px-2.5 py-0.5 rounded-full">PRO</span>
        </div>
        <div className="hidden md:block flex-1 max-w-xl px-8">
          <div className="relative">
            <input value={searchQuery} onChange={e=>setSearchQuery(e.target.value)} placeholder="Search documents…"
              className="w-full bg-black/5 dark:bg-white/5 border border-transparent focus:border-[var(--accent)]/50 rounded-full py-2.5 pl-11 pr-5 text-sm outline-none text-[var(--text)]"/>
            <Search className="absolute left-4 top-2.5 opacity-40" size={18}/>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={()=>setCurrentView('settings')} className="w-9 h-9 flex items-center justify-center rounded-xl glass hover:bg-black/5 dark:hover:bg-white/10 opacity-70 hover:opacity-100"><Settings size={18}/></button>
          <div onClick={()=>{ setRightPanelOpen(!rightPanelOpen); if(currentView!=='reader'&&activeDocId) setCurrentView('reader'); }}
               className="hidden md:flex items-center gap-2 bg-[var(--accent)]/10 px-4 py-2 rounded-full cursor-pointer hover:bg-[var(--accent)]/20 border border-[var(--accent)]/20 text-[var(--accent)]">
            <Sparkles size={16}/><span className="font-bold text-xs uppercase tracking-widest">AI Studio</span>
          </div>
        </div>
      </div>

      {/* ── BODY ── */}
      <div className="flex flex-1 min-h-0 overflow-hidden relative">
        {isUploading && (
          <div className="absolute top-0 left-0 w-full h-1.5 bg-[var(--border)] z-50 overflow-hidden">
            <div className="h-full bg-gradient-to-r from-[var(--accent)] to-[var(--accent-soft)] transition-all duration-300" style={{width:`${uploadProgress}%`}}/>
          </div>
        )}

        {/* SIDEBAR desktop */}
        <div className="hidden lg:flex w-[90px] flex-col items-center py-8 glass shrink-0 rounded-none border-t-0 border-b-0 border-l-0 z-30">
          <div onClick={()=>setCurrentView('library')} className="w-14 h-14 rounded-3xl overflow-hidden border border-[var(--border)] cursor-pointer mb-8 hover:scale-105 transition-transform shadow-md">
            <img src={MARIAM_IMG} className="w-full h-full object-cover" alt="Mariam"/>
          </div>
          <div className="flex flex-col gap-5 w-full px-2">
            {[
              {icon:Library,label:'Library',view:'library'},
              {icon:BookOpen,label:'Reader',view:'reader',disabled:!activeDocId},
              {icon:Layers,label:'Cards',view:'flashcards'},
              {icon:GraduationCap,label:'Exams',view:'exams'},
              {icon:Activity,label:'Cases',view:'cases'},
              {icon:MessageSquare,label:'Chat',view:'chat'},
            ].map(({icon:Icon,label,view,disabled})=>(
              <button key={view} onClick={()=>{ if(!disabled) { if(view==='reader'&&activeDocId) setCurrentView('reader'); else if(view!=='reader') setCurrentView(view); }}}
                disabled={disabled}
                className={`flex flex-col items-center gap-1.5 text-[9px] font-black uppercase tracking-widest py-2.5 rounded-2xl transition-all ${disabled?'opacity-25 cursor-not-allowed':''}`}>
                <div className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${currentView===view?'bg-[var(--accent)] text-white shadow-lg scale-110':'text-[var(--text)] opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/10'}`}>
                  <Icon size={20} strokeWidth={currentView===view?2.5:2}/>
                </div>
                <span className={currentView===view?'text-[var(--accent)]':'text-[var(--text)] opacity-60'}>{label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* MAIN VIEWS */}
        <main className="flex-1 flex flex-col relative min-w-0 min-h-0 overflow-hidden">
          {/* Library */}
          <div className={`flex-1 flex flex-col min-h-0 overflow-hidden ${currentView==='library'?'flex':'hidden'}`}>
            <LibraryView documents={filteredDocs} onUpload={handleFileUpload} isUploading={isUploading}
              onOpen={id=>{ setOpenDocs(p=>p.includes(id)?p:[...p,id]); setActiveDocId(id); setCurrentView('reader'); }}
              deleteDocument={deleteDocument} flashcards={flashcards} exams={exams} cases={cases}/>
          </div>
          {/* Flashcards */}
          <div className={`flex-1 flex flex-col min-h-0 overflow-hidden ${currentView==='flashcards'?'flex':'hidden'}`}>
            <FlashcardsGlobalView flashcards={flashcards} setFlashcards={setFlashcards} addToast={addToast}
              setCurrentPage={p=>setDocPages(prev=>({...prev,[activeDocId]:p}))} setRightPanelOpen={setRightPanelOpen}
              setCurrentView={setCurrentView} settings={userSettings}/>
          </div>
          {/* Exams */}
          <div className={`flex-1 flex flex-col min-h-0 overflow-hidden ${currentView==='exams'?'flex':'hidden'}`}>
            <ExamsGlobalView exams={exams} setExams={setExams} addToast={addToast}
              setCurrentPage={p=>setDocPages(prev=>({...prev,[activeDocId]:p}))} setRightPanelOpen={setRightPanelOpen}
              setCurrentView={setCurrentView} settings={userSettings}/>
          </div>
          {/* Cases */}
          <div className={`flex-1 flex flex-col min-h-0 overflow-hidden ${currentView==='cases'?'flex':'hidden'}`}>
            <CasesGlobalView cases={cases} setCases={setCases} addToast={addToast}
              setCurrentPage={p=>setDocPages(prev=>({...prev,[activeDocId]:p}))} setRightPanelOpen={setRightPanelOpen}
              setCurrentView={setCurrentView} settings={userSettings}/>
          </div>
          {/* Chat */}
          <div className={`flex-1 flex flex-col min-h-0 overflow-hidden ${currentView==='chat'?'flex':'hidden'}`}>
            <ChatGlobalView settings={userSettings} chatSessions={chatSessions} setChatSessions={setChatSessions} addToast={addToast}/>
          </div>
          {/* Settings */}
          <div className={`flex-1 flex flex-col min-h-0 overflow-hidden ${currentView==='settings'?'flex':'hidden'}`}>
            <PanelSettings settings={userSettings} setSettings={setUserSettings}/>
          </div>
          {/* Reader */}
          <div className={`flex-1 flex flex-col min-h-0 overflow-hidden ${currentView==='reader'&&activeDocId&&activeDoc?'flex':'hidden'}`}>
            {activeDocId && activeDoc && (
              <PdfWorkspace activeDoc={activeDoc} setDocuments={setDocuments}
                closeDoc={()=>setCurrentView('library')}
                rightPanelOpen={rightPanelOpen} setRightPanelOpen={setRightPanelOpen}
                currentPage={docPages[activeDocId]||1} setCurrentPage={setPage}
                openDocs={openDocs} setActiveDocId={setActiveDocId}
                closeTab={id=>setOpenDocs(p=>p.filter(d=>d!==id))}
                documents={documents} isResizing={isResizing}/>
            )}
          </div>
        </main>

        {/* DRAG RESIZER */}
        {activeDocId && activeDoc && currentView==='reader' && rightPanelOpen && (
          <div className="hidden md:flex w-2.5 cursor-col-resize hover:bg-[var(--accent)]/50 items-center justify-center shrink-0 z-[120] touch-none transition-colors"
            style={{backgroundColor:isResizing?'rgba(var(--accent-rgb),.5)':''}}
            onMouseDown={e=>{e.preventDefault();setIsResizing(true);}}
            onTouchStart={()=>setIsResizing(true)}>
            <div className="w-1 h-16 bg-[var(--text)] opacity-20 rounded-full pointer-events-none"/>
          </div>
        )}

        {/* AI STUDIO PANEL */}
        <aside style={{width:window.innerWidth>768?`${aiWidth}px`:'100%',
          display:(activeDocId&&activeDoc&&currentView==='reader'&&rightPanelOpen)?'flex':'none'}}
          className="glass shrink-0 flex-col z-[100] absolute inset-0 md:relative animate-slide-in rounded-none border-t-0 border-b-0 border-r-0">
          <div className="h-16 md:h-20 flex items-center justify-between px-5 bg-[var(--accent)] text-white shrink-0">
            <span className="font-black title-font text-xl flex items-center gap-3"><Sparkles size={22}/> AI Studio</span>
            <button onClick={()=>setRightPanelOpen(false)} className="p-2 rounded-xl hover:bg-white/20"><X size={22}/></button>
          </div>
          <div className="flex gap-1.5 p-2.5 bg-black/5 dark:bg-white/5 shrink-0 border-b border-[var(--border)]">
            {[['generate','Extract',Zap],['chat','Chat',MessageSquare],['review','Vault',Database]].map(([id,label,Icon])=>(
              <button key={id} onClick={()=>setRightPanelTab(id)}
                className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all
                  ${rightPanelTab===id?'bg-[var(--card)] text-[var(--accent)] border border-[var(--border)]':'text-[var(--text)] opacity-50 hover:opacity-100 border border-transparent'}`}>
                <Icon size={14}/><span className="hidden sm:inline">{label}</span>
              </button>
            ))}
          </div>
          <div className="flex-1 flex flex-col min-h-0" style={{pointerEvents:isResizing?'none':'auto'}}>
            {activeDoc && (<>
              <div className={`flex-1 flex flex-col min-h-0 ${rightPanelTab==='generate'?'flex':'hidden'}`}>
                <PanelGenerate activeDoc={activeDoc} bgTask={bgTask} onStartGenerate={startBgGen}
                  onClearTask={()=>setBgTask(null)} setFlashcards={setFlashcards} setExams={setExams}
                  setCases={setCases} setNotes={setNotes} switchToReview={()=>setRightPanelTab('review')}
                  currentPage={docPages[activeDocId]||1} addToast={addToast} settings={userSettings}/>
              </div>
              <div className={`flex-1 flex flex-col min-h-0 ${rightPanelTab==='chat'?'flex':'hidden'}`}>
                <PanelChat activeDoc={activeDoc} settings={userSettings} currentPage={docPages[activeDocId]||1}/>
              </div>
              <div className={`flex-1 flex flex-col min-h-0 ${rightPanelTab==='review'?'flex':'hidden'}`}>
                <PanelReview activeDocId={activeDocId} flashcards={flashcards} setFlashcards={setFlashcards}
                  exams={exams} setExams={setExams} cases={cases} setCases={setCases}
                  notes={notes} setNotes={setNotes} addToast={addToast}
                  setCurrentPage={p=>setDocPages(prev=>({...prev,[activeDocId]:p}))}
                  setRightPanelOpen={setRightPanelOpen} setCurrentView={setCurrentView} settings={userSettings}/>
              </div>
            </>)}
          </div>
        </aside>
      </div>

      {/* ── MOBILE BOTTOM NAV ── */}
      <div className="lg:hidden fixed bottom-3 left-2 right-2 p-2 bottom-nav flex justify-around items-center z-[1000]"
           style={{paddingBottom:`calc(8px + env(safe-area-inset-bottom))`}}>
        {[
          {icon:Library,label:'Library',view:'library'},
          {icon:BookOpen,label:'Reader',view:'reader',disabled:!activeDocId},
          {icon:Layers,label:'Cards',view:'flashcards'},
          {icon:Activity,label:'Cases',view:'cases'},
          {icon:GraduationCap,label:'Exams',view:'exams'},
          {icon:MessageSquare,label:'Chat',view:'chat'},
        ].map(({icon:Icon,label,view,disabled})=>(
          <button key={view} disabled={disabled}
            onClick={()=>{ if(!disabled){ if(view==='reader'&&activeDocId) setCurrentView('reader'); else if(view!=='reader') setCurrentView(view); }}}
            className={`flex flex-col items-center gap-1 p-2 rounded-2xl min-w-[52px] transition-all
              ${currentView===view?'text-[var(--accent)] bg-[var(--accent)]/10':'text-[var(--text)] opacity-55'}
              ${disabled?'opacity-25':''}`}>
            <Icon size={20} strokeWidth={currentView===view?2.5:2}/>
            <span className="text-[9px] font-bold">{label}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── SHARED SMALL COMPONENTS ──────────────────────────────────────────────────
function EmptyState({ icon:Icon, text }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-6 glass rounded-[3rem] border-dashed border-2 border-[var(--border)] m-2">
      <Icon size={48} className="opacity-25 mb-5"/><p className="text-sm opacity-55 font-bold max-w-[220px] leading-relaxed">{text}</p>
    </div>
  );
}
function ToolBtn({ id, active, set, icon:Icon, label }) {
  return (
    <button onClick={()=>set(id)} className={`py-3.5 flex flex-col items-center justify-center gap-2 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all
      ${active===id?'bg-[var(--accent)] text-white shadow-lg scale-105 border-transparent':'glass opacity-55 hover:opacity-100 border border-[var(--border)]'}`}>
      <Icon size={18}/>{label}
    </button>
  );
}

// ─── LIBRARY VIEW ─────────────────────────────────────────────────────────────
function LibraryView({ documents, onUpload, onOpen, isUploading, deleteDocument, flashcards, exams, cases }) {
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="max-w-screen-2xl mx-auto p-6 md:p-12 pb-[120px] lg:pb-32">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-8 mb-12">
          <div>
            <h1 className="title-font text-5xl md:text-6xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-[var(--accent)] to-[var(--accent-soft)]">Intelligence Nexus</h1>
            <p className="text-base md:text-lg opacity-50 mt-3 font-medium">Premium medical AI · Universal API</p>
          </div>
          <label className={`cursor-pointer btn-accent flex items-center gap-3 text-sm font-black uppercase tracking-widest shadow-2xl px-7 py-4 rounded-2xl ${isUploading?'opacity-50 pointer-events-none':''}`}>
            {isUploading?<Loader2 className="animate-spin" size={22}/>:<FileUp size={22}/>}
            {isUploading?'IMPORTING…':'IMPORT PDF'}
            <input type="file" accept="application/pdf" multiple className="hidden" onChange={onUpload} disabled={isUploading}/>
          </label>
        </div>
        {documents.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {documents.map(doc => {
              const nCards = flashcards.filter(f=>f.docId===doc.id).reduce((s,set)=>s+(set.cards?.length||0),0);
              const nExams = exams.filter(e=>e.docId===doc.id).length;
              const nCases = cases.filter(c=>c.docId===doc.id).length;
              return (
                <div key={doc.id} onClick={()=>onOpen(doc.id)} className="card-hover glass rounded-[2rem] overflow-hidden cursor-pointer flex flex-col relative group">
                  <button onClick={e=>deleteDocument(doc.id,e)} className="absolute top-3 right-3 z-20 w-10 h-10 bg-black/50 hover:bg-red-500 backdrop-blur-md rounded-xl text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={17}/></button>
                  <div className="h-40 bg-gradient-to-br from-[var(--accent)] to-[var(--accent-soft)] flex items-center justify-center">
                    <BookOpen size={56} className="text-white opacity-35 group-hover:scale-110 transition-transform duration-500"/>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="font-bold text-sm md:text-base leading-snug line-clamp-2 mb-4 flex-1">{doc.name}</h3>
                    <div className="flex gap-1.5 flex-wrap text-[10px] font-bold">
                      <span className="px-2.5 py-1 bg-black/5 dark:bg-white/5 rounded-lg">{nCards} Cards</span>
                      <span className="px-2.5 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-lg">{nExams} Exams</span>
                      <span className="px-2.5 py-1 bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded-lg">{nCases} Cases</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="glass border-dashed border-2 rounded-[3rem] p-20 text-center flex flex-col items-center">
            <FileUp size={56} className="opacity-30 mb-5"/>
            <h2 className="title-font text-3xl font-black mb-3">No Documents Yet</h2>
            <p className="opacity-50 max-w-xs leading-relaxed text-sm">Import a PDF to start extracting knowledge with AI.</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── SETTINGS VIEW ────────────────────────────────────────────────────────────
const PROVIDER_PRESETS = {
  anthropic: { label:'Claude (Anthropic)', note:'Works built-in — no key required in Claude artifacts.', needsKey:false, defaultModel:'claude-sonnet-4-20250514', baseUrl:'https://api.anthropic.com' },
  openai:    { label:'OpenAI (GPT)',        note:'Requires an OpenAI API key.',                          needsKey:true,  defaultModel:'gpt-4o-mini',              baseUrl:'https://api.openai.com' },
  gemini:    { label:'Google Gemini',       note:'Requires a Google AI Studio API key.',                 needsKey:true,  defaultModel:'gemini-2.0-flash',          baseUrl:'' },
  deepseek:  { label:'DeepSeek',            note:'Requires a DeepSeek API key. Very cost-effective.',    needsKey:true,  defaultModel:'deepseek-chat',             baseUrl:'https://api.deepseek.com' },
  glm:       { label:'GLM / Zhipu AI',      note:'Requires a Zhipu API key.',                           needsKey:true,  defaultModel:'glm-4-flash',               baseUrl:'https://open.bigmodel.cn/api/paas' },
  groq:      { label:'Groq (Ultra-fast)',   note:'Requires a Groq API key. Extremely fast inference.',   needsKey:true,  defaultModel:'llama-3.3-70b-versatile',   baseUrl:'https://api.groq.com/openai' },
  ollama:    { label:'Ollama (Local)',       note:'Runs models locally. No key needed.',                 needsKey:false, defaultModel:'llama3',                    baseUrl:'http://localhost:11434/v1' },
  compatible:{ label:'Custom / Compatible', note:'Any OpenAI-compatible API. Set your own Base URL.',   needsKey:true,  defaultModel:'',                          baseUrl:'' },
};

function PanelSettings({ settings, setSettings }) {
  const preset = PROVIDER_PRESETS[settings.provider] || PROVIDER_PRESETS.anthropic;
  const themes  = [{id:'pure-white',label:'Pure White',icon:Sun},{id:'light',label:'Soft Light',icon:CloudSun},{id:'dark',label:'Deep Dark',icon:Moon},{id:'oled',label:'OLED Black',icon:MoonStar}];
  const accents = [{id:'indigo',hex:'#6366f1'},{id:'purple',hex:'#a855f7'},{id:'blue',hex:'#3b82f6'},{id:'emerald',hex:'#10b981'},{id:'rose',hex:'#f43f5e'}];
  const fontSizes=[{id:'small',px:12},{id:'medium',px:14},{id:'large',px:16},{id:'xl',px:18},{id:'xxl',px:20}];

  const handleProviderChange = (p) => {
    const pr = PROVIDER_PRESETS[p];
    setSettings(s=>({...s, provider:p, baseUrl:pr.baseUrl, model:pr.defaultModel}));
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="max-w-3xl mx-auto p-6 md:p-12 space-y-7 pb-[120px] lg:pb-32">
        <h1 className="title-font text-4xl font-black flex items-center gap-4"><Settings size={36} className="opacity-40"/> Settings</h1>

        {/* AI Provider */}
        <div className="glass rounded-[2rem] p-7 card-hover">
          <h3 className="font-black mb-5 flex items-center gap-3 text-base"><Globe className="text-[var(--accent)]" size={20}/> AI Provider</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2.5 mb-5">
            {Object.entries(PROVIDER_PRESETS).map(([id,{label}])=>(
              <button key={id} onClick={()=>handleProviderChange(id)}
                className={`py-3 px-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border
                  ${settings.provider===id?'bg-[var(--accent)] text-white border-transparent shadow-lg scale-105':'glass opacity-60 hover:opacity-100 border-[var(--border)]'}`}>
                {label.split(' ')[0]}<br/><span className="opacity-70 normal-case font-bold text-[9px]">{label.split(' ').slice(1).join(' ')}</span>
              </button>
            ))}
          </div>
          <div className={`flex items-start gap-3 px-4 py-3 rounded-xl mb-5 border ${preset.needsKey?'bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800':'bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800'}`}>
            {preset.needsKey?<AlertCircle size={16} className="text-amber-500 mt-0.5 shrink-0"/>:<CheckCircle2 size={16} className="text-emerald-500 mt-0.5 shrink-0"/>}
            <p className={`text-xs font-bold ${preset.needsKey?'text-amber-700 dark:text-amber-300':'text-emerald-700 dark:text-emerald-300'}`}>{preset.note}</p>
          </div>

          {preset.needsKey && (
            <div className="mb-4">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-55 mb-2 block flex items-center gap-2"><KeyRound size={12}/> API Key</label>
              <input type="password" placeholder="Paste your API key here…" value={settings.apiKey||''}
                onChange={e=>setSettings(s=>({...s,apiKey:e.target.value}))}
                className="w-full bg-black/5 dark:bg-white/5 rounded-2xl p-4 font-mono text-sm focus:border-[var(--accent)] outline-none border border-[var(--border)] text-[var(--text)]"/>
            </div>
          )}

          {(settings.provider==='compatible'||settings.provider==='ollama') && (
            <div className="mb-4">
              <label className="text-[10px] font-black uppercase tracking-widest opacity-55 mb-2 block">Base URL</label>
              <input type="text" placeholder="https://your-api-endpoint.com" value={settings.baseUrl||''}
                onChange={e=>setSettings(s=>({...s,baseUrl:e.target.value}))}
                className="w-full bg-black/5 dark:bg-white/5 rounded-2xl p-4 font-mono text-sm focus:border-[var(--accent)] outline-none border border-[var(--border)] text-[var(--text)]"/>
            </div>
          )}

          <div>
            <label className="text-[10px] font-black uppercase tracking-widest opacity-55 mb-2 block">Model Name</label>
            <input type="text" placeholder={preset.defaultModel||'e.g. gpt-4o'} value={settings.model||''}
              onChange={e=>setSettings(s=>({...s,model:e.target.value}))}
              className="w-full bg-black/5 dark:bg-white/5 rounded-2xl p-4 font-mono text-sm focus:border-[var(--accent)] outline-none border border-[var(--border)] text-[var(--text)]"/>
            <p className="text-[10px] opacity-40 mt-2 font-medium">Leave blank to use default: <code>{preset.defaultModel}</code></p>
          </div>
        </div>

        {/* Theme */}
        <div className="glass rounded-[2rem] p-7 card-hover">
          <h3 className="font-black mb-5 flex items-center gap-3 text-base"><Palette className="text-[var(--accent)]" size={20}/> Theme</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
            {themes.map(t=>(
              <button key={t.id} onClick={()=>setSettings({...settings,theme:t.id})}
                className={`py-5 px-2 rounded-2xl font-black text-xs uppercase tracking-widest flex flex-col items-center gap-3 border transition-all
                  ${settings.theme===t.id?'bg-[var(--accent)] text-white border-transparent shadow-xl scale-105':'glass opacity-60 hover:opacity-100 border-[var(--border)]'}`}>
                <t.icon size={24}/>{t.label}
              </button>
            ))}
          </div>
          <div className="flex gap-3 flex-wrap">
            {accents.map(a=>(
              <button key={a.id} onClick={()=>setSettings({...settings,accentColor:a.id})}
                className={`w-10 h-10 rounded-xl transition-all ${settings.accentColor===a.id?'scale-125 ring-2 ring-offset-2 ring-current shadow-xl':''}`}
                style={{backgroundColor:a.hex}}/>
            ))}
          </div>
        </div>

        {/* Font */}
        <div className="glass rounded-[2rem] p-7 card-hover">
          <h3 className="font-black mb-5 flex items-center gap-3 text-base"><Type className="text-emerald-500" size={20}/> Font Size</h3>
          <div className="flex gap-2 p-2 bg-black/5 dark:bg-white/5 rounded-2xl border border-[var(--border)]">
            {fontSizes.map(f=>(
              <button key={f.id} onClick={()=>setSettings({...settings,fontSize:f.id})}
                className={`flex-1 py-3.5 rounded-xl font-black transition-all ${settings.fontSize===f.id?'glass text-emerald-500 shadow-md':'opacity-50 hover:opacity-100'}`}
                style={{fontSize:`${f.px}px`}}>Aa</button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── PDF WORKSPACE ────────────────────────────────────────────────────────────
// FIX: pb-24 lg:pb-0 pushes content above the mobile bottom nav (which is ~72px tall + 12px margin)
// FIX: PDF bottom controls get z-[1001] so they sit above the mobile nav overlay
function PdfWorkspace({ activeDoc, setDocuments, closeDoc, rightPanelOpen, setRightPanelOpen, currentPage, setCurrentPage, openDocs, setActiveDocId, closeTab, isResizing, documents }) {
  const [pdf,     setPdf]     = useState(null);
  const [loading, setLoading] = useState(true);
  const [dims,    setDims]    = useState({w:0,h:0});
  const [scale,   setScale]   = useState(1.2);
  const [localPage, setLocalPage] = useState(currentPage);
  const canvasRef   = useRef(null);
  const containerRef = useRef(null);
  const textRef     = useRef(null);
  const renderRef   = useRef(null);
  const pdfRef      = useRef(null);

  useEffect(()=>{ setLocalPage(currentPage); },[currentPage]);

  useEffect(()=>{
    if (!activeDoc?.id) return;
    let mounted=true; setLoading(true); setPdf(null);
    if (pdfRef.current) { try{pdfRef.current.destroy();}catch(e){} pdfRef.current=null; }
    (async()=>{
      try {
        const data = await getPdf(activeDoc.id);
        if (!data||!mounted) return;
        const pdfjs = await loadPdfJs();
        const buf = data.buffer||data;
        const loaded = await pdfjs.getDocument({data:buf.slice(0)}).promise;
        if (mounted) { pdfRef.current=loaded; setPdf(loaded); }
        else { try{loaded.destroy();}catch(e){} }
      } catch(e){console.error(e);}
      finally { if(mounted) setLoading(false); }
    })();
    return ()=>{ mounted=false; };
  },[activeDoc?.id]);

  useEffect(()=>{
    if (!pdf) return;
    let mounted=true;
    (async()=>{
      try {
        const page = await pdf.getPage(localPage);
        const cont = containerRef.current; if(!cont||!mounted) return;
        const tmp = page.getViewport({scale:1});
        const base = cont.clientWidth/tmp.width;
        const final = Math.min(Math.max(base*scale,.5),5);
        const vp = page.getViewport({scale:final});
        if(mounted) setDims({w:vp.width,h:vp.height});
        const canvas=canvasRef.current;
        if (canvas) {
          const pr=window.devicePixelRatio||1;
          canvas.width=Math.floor(vp.width*pr); canvas.height=Math.floor(vp.height*pr);
          if(renderRef.current) renderRef.current.cancel();
          renderRef.current=page.render({canvasContext:canvas.getContext('2d'),viewport:vp,transform:[pr,0,0,pr,0,0]});
          await renderRef.current.promise;
        }
        const tl=textRef.current;
        if(tl&&mounted){ tl.innerHTML=''; tl.style.setProperty('--scale-factor',vp.scale); const tc=await page.getTextContent(); window.pdfjsLib.renderTextLayer({textContentSource:tc,container:tl,viewport:vp,textDivs:[]}); }
      } catch(e){ if(e.name!=='RenderingCancelledException') console.warn(e.message); }
    })();
    return ()=>{ mounted=false; if(renderRef.current) renderRef.current.cancel(); };
  },[localPage,pdf,rightPanelOpen,scale,isResizing]);

  const nav = useCallback((dir)=>{
    if(!activeDoc) return;
    const next=Math.max(1,Math.min(activeDoc.totalPages,localPage+dir));
    if(next!==localPage){ setLocalPage(next); setCurrentPage(next); setDocuments(p=>p.map(d=>d.id===activeDoc.id?{...d,progress:next}:d)); containerRef.current?.scrollTo({top:0,behavior:'smooth'}); }
  },[localPage,activeDoc,setCurrentPage,setDocuments]);

  useEffect(()=>{
    const kd=e=>{ if(['INPUT','TEXTAREA'].includes(e.target.tagName)) return; if(e.key==='ArrowLeft') nav(-1); if(e.key==='ArrowRight') nav(1); };
    document.addEventListener('keydown',kd); return()=>document.removeEventListener('keydown',kd);
  },[nav]);

  if (!activeDoc) return null;

  return (
    // pb-24 lg:pb-0 → on mobile, shifts content up so bottom nav doesn't cover PDF controls
    <div className="flex-1 flex flex-col h-full bg-black/5 dark:bg-black/20 relative min-h-0 pb-24 lg:pb-0">

      {/* top bar */}
      <div className="h-14 md:h-16 flex items-center justify-between px-3 md:px-5 glass shrink-0 z-10 border-b border-[var(--border)] rounded-none">
        <div className="flex items-center gap-2 md:gap-4">
          <button onClick={closeDoc} className="w-8 h-8 glass rounded-full flex items-center justify-center hover:bg-black/10"><ChevronLeft size={18}/></button>
          <span className="font-bold text-xs md:text-sm truncate max-w-[130px] md:max-w-sm">{activeDoc.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="hidden md:flex items-center gap-0.5 glass p-1 rounded-full">
            <button onClick={()=>setScale(s=>Math.max(s-.25,.5))} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/10 opacity-60 hover:opacity-100"><ZoomOut size={14}/></button>
            <button onClick={()=>setScale(1.2)} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/10 opacity-60 hover:opacity-100"><Maximize size={14}/></button>
            <button onClick={()=>setScale(s=>Math.min(s+.25,4))} className="w-7 h-7 flex items-center justify-center rounded-full hover:bg-black/10 opacity-60 hover:opacity-100"><ZoomIn size={14}/></button>
          </div>
          <button onClick={()=>setRightPanelOpen(!rightPanelOpen)}
            className={`px-3 py-1.5 rounded-full text-[10px] md:text-xs font-black uppercase tracking-widest transition-all
              ${rightPanelOpen?'bg-[var(--accent)] text-white':'glass text-[var(--accent)] hover:bg-[var(--accent)]/10'}`}>
            {rightPanelOpen?'Close AI':'AI Studio'}
          </button>
        </div>
      </div>

      {/* tabs */}
      {openDocs.length>1 && (
        <div className="flex gap-1.5 px-3 py-2 glass border-b border-[var(--border)] overflow-x-auto custom-scrollbar shrink-0 z-10 rounded-none">
          {openDocs.map(id=>{
            const doc=documents.find(d=>d.id===id); if(!doc) return null;
            return (
              <div key={id} onClick={()=>setActiveDocId(id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg cursor-pointer font-bold text-[10px] uppercase tracking-widest transition-colors shrink-0
                  ${id===activeDoc.id?'bg-[var(--accent)] text-white':'glass hover:bg-black/10 border border-[var(--border)]'}`}>
                <span className="truncate max-w-[90px]">{doc.name}</span>
                <button onClick={e=>{e.stopPropagation();closeTab(id);}} className="p-0.5 rounded hover:bg-black/20"><X size={11}/></button>
              </div>
            );
          })}
        </div>
      )}

      {/* scrollable pdf area */}
      <div ref={containerRef} className="flex-1 overflow-auto custom-scrollbar relative min-h-0">
        {loading ? (
          <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4 text-[var(--accent)]">
            <Loader2 className="animate-spin" size={32}/><span className="text-xs font-black tracking-widest uppercase opacity-60">Rendering…</span>
          </div>
        ) : pdf ? (
          <div className="relative shadow-2xl bg-white shrink-0 mx-auto" style={{width:dims.w?`${dims.w}px`:'100%',height:dims.h?`${dims.h}px`:'auto'}}>
            <canvas ref={canvasRef} className="block"/>
            <div ref={textRef} className="pdf-text-layer"/>
          </div>
        ) : (
          <div className="m-auto text-red-500 text-sm flex items-center gap-2 bg-red-500/10 p-5 rounded-2xl border border-red-500/20 font-bold w-fit mt-10">
            <AlertCircle size={16}/> Failed to load PDF.
          </div>
        )}
      </div>

      {/* ── PAGE CONTROLS (z-[1001] so they appear above mobile nav overlay) ── */}
      <div className="h-16 glass flex items-center justify-center gap-4 shrink-0 z-[1001] border-t border-[var(--border)] rounded-none
                      absolute bottom-0 left-0 right-0 lg:relative lg:bottom-auto">
        <button onClick={()=>nav(-1)} disabled={localPage<=1}
          className="w-11 h-11 glass rounded-2xl flex items-center justify-center hover:bg-black/10 disabled:opacity-30 transition-colors shadow-sm active:scale-95">
          <ChevronLeft size={20}/>
        </button>
        <div className="px-5 py-2.5 glass rounded-2xl font-mono font-bold text-sm border border-[var(--border)] shadow-sm">
          PG <span className="text-[var(--accent)]">{localPage}</span> / {activeDoc.totalPages}
        </div>
        <button onClick={()=>nav(1)} disabled={localPage>=activeDoc.totalPages}
          className="w-11 h-11 btn-accent rounded-2xl flex items-center justify-center shadow-lg disabled:opacity-50 active:scale-95">
          <ChevronRight size={20}/>
        </button>
      </div>
    </div>
  );
}

// ─── PANEL GENERATE ───────────────────────────────────────────────────────────
// FIX: all hooks declared BEFORE any conditional return (React rules of hooks)
function PanelGenerate({ activeDoc, bgTask, onStartGenerate, onClearTask, setFlashcards, setExams, setCases, setNotes, switchToReview, currentPage, addToast, settings }) {
  const [startPage, setStartPage] = useState(1);
  const [endPage,   setEndPage]   = useState(1);
  const [type,      setType]      = useState('cases');
  const [count,     setCount]     = useState(5);
  const [difficulty,setDifficulty]= useState(2);
  const levels = ['Hard','Expert','Insane'];

  // ← hooks MUST come before the early return
  useEffect(()=>{
    if (!bgTask && activeDoc) { setStartPage(currentPage); setEndPage(currentPage); }
  },[currentPage, bgTask, activeDoc]);

  if (!activeDoc) return <div className="flex-1 flex items-center justify-center opacity-40 text-sm font-bold">No document open.</div>;

  const go = () => onStartGenerate(type, activeDoc.id, startPage, endPage, {count, difficultyLevel:levels[difficulty-1]});

  const save = () => {
    if (!bgTask?.result) return;
    const g = bgTask.result;
    if (g.type==='flashcards') {
      const cards = g.data.map(c=>({id:Date.now()+Math.random(),q:c.q,a:c.a,evidence:c.evidence,sourcePage:c.sourcePage,level:0,nextReview:Date.now(),repetitions:0,ef:2.5,interval:1,lastReview:Date.now()}));
      setFlashcards(p=>[...p,{id:Date.now().toString(),docId:activeDoc.id,sourcePages:g.pages,title:`Flashcards (Pgs ${g.pages})`,cards,createdAt:new Date().toISOString()}]);
      addToast(`${cards.length} flashcards saved!`,'success');
    } else if (g.type==='cases') {
      setCases(p=>[...p,{id:Date.now().toString(),docId:activeDoc.id,sourcePages:g.pages,title:'Patient Case Block',questions:g.data,createdAt:new Date().toISOString()}]);
      addToast(`${g.data.length} cases saved!`,'success');
    } else if (g.type==='exam') {
      setExams(p=>[...p,{id:Date.now().toString(),docId:activeDoc.id,sourcePages:g.pages,title:`Exam (Pgs ${g.pages})`,questions:g.data,createdAt:new Date().toISOString()}]);
      addToast(`${g.data.length} questions saved!`,'success');
    } else {
      setNotes(p=>[...p,{id:Date.now().toString(),docId:activeDoc.id,title:`${g.customTitle||'Note'} · Pgs ${g.pages}`,content:g.data,createdAt:new Date().toISOString()}]);
      addToast('Note saved!','success');
    }
    onClearTask(); switchToReview();
  };

  if (bgTask?.isFinished) return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="glass border-b border-[var(--border)] p-4 flex justify-between items-center shrink-0">
        <span className="text-xs font-black uppercase tracking-widest text-emerald-500 flex items-center gap-2"><CheckCircle2 size={18}/> {bgTask.result?.data?.length||1} items ready</span>
        <div className="flex gap-2">
          <button onClick={onClearTask} className="px-4 py-2 glass opacity-60 hover:opacity-100 rounded-xl text-[10px] font-black uppercase">Discard</button>
          <button onClick={save} className="px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black uppercase flex items-center gap-2 shadow-md"><Save size={14}/> Save</button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 pb-[110px] lg:pb-5 space-y-5">
        {bgTask.result?.type==='flashcards' && bgTask.result.data.map((item,i)=>(
          <div key={i} className="glass p-5 rounded-[2rem]">
            <p className="font-bold mb-4 text-sm"><span className="opacity-40 mr-2 text-xs">Q</span>{item.q}</p>
            <div className="bg-[var(--accent)]/10 border border-[var(--accent)]/20 p-4 rounded-xl mb-3"><p className="text-sm text-[var(--accent)]"><span className="opacity-40 mr-2 text-xs">A</span>{item.a}</p></div>
            {item.evidence&&<p className="text-xs opacity-50 italic bg-black/5 p-3 rounded-xl">"{item.evidence}" — Pg {item.sourcePage||'?'}</p>}
          </div>
        ))}
        {(bgTask.result?.type==='exam'||bgTask.result?.type==='cases') && bgTask.result.data.map((item,i)=>(
          <div key={i} className="glass p-5 rounded-[2rem]">
            {item.vignette&&<p className="text-xs opacity-75 mb-3 bg-black/5 p-3 rounded-xl leading-relaxed">{item.vignette}</p>}
            <p className="font-bold text-sm mb-4">{i+1}. {item.q||item.examQuestion?.q}</p>
            <div className="space-y-2 mb-4">
              {(item.options||item.examQuestion?.options||[]).map((o,oi)=>{
                const ci=item.correct!==undefined?item.correct:item.examQuestion?.correct;
                return <div key={oi} className={`text-xs p-3 rounded-xl border ${oi===ci?'border-emerald-500 bg-emerald-500/10 text-emerald-600 font-bold':'border-[var(--border)] bg-black/5'}`}><span className="font-mono opacity-40 mr-2">{String.fromCharCode(65+oi)}.</span>{o}</div>;
              })}
            </div>
            <div className="p-4 bg-[var(--accent)]/10 rounded-xl border border-[var(--accent)]/20"><p className="text-xs leading-relaxed">{item.explanation||item.examQuestion?.explanation}</p></div>
          </div>
        ))}
        {!['flashcards','exam','cases'].includes(bgTask.result?.type) && (
          <div className="glass p-6 rounded-[2rem] text-sm whitespace-pre-wrap leading-loose">{bgTask.result?.data}</div>
        )}
      </div>
    </div>
  );

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-5 pb-[110px] lg:pb-5">
      <div className="glass rounded-[2rem] p-5 mb-5">
        <h2 className="font-black mb-4 flex items-center gap-2 text-sm"><Target size={18} className="text-[var(--accent)]"/> Select Pages</h2>
        <div className="flex items-center gap-3 mb-6">
          {[['From',startPage,setStartPage],['To',endPage,setEndPage]].map(([l,v,s])=>(
            <div key={l} className="flex-1">
              <label className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-1.5 block">{l} Page</label>
              <input type="number" min={1} max={activeDoc.totalPages} value={v} onChange={e=>s(Number(e.target.value))}
                className="w-full bg-white dark:bg-black rounded-xl px-3 py-2.5 text-center font-mono font-bold outline-none focus:border-[var(--accent)] border border-[var(--border)] text-[var(--text)] text-sm"/>
            </div>
          ))}
        </div>

        <h2 className="font-black mb-3 flex items-center gap-2 text-sm"><Zap size={18} className="text-amber-500"/> Tool</h2>
        <div className="grid grid-cols-3 gap-2 mb-6">
          <ToolBtn id="flashcards" active={type} set={setType} icon={Layers}      label="Cards"/>
          <ToolBtn id="exam"       active={type} set={setType} icon={CheckSquare}  label="Exam"/>
          <ToolBtn id="summary"    active={type} set={setType} icon={BookA}        label="Summary"/>
          <ToolBtn id="cases"      active={type} set={setType} icon={Activity}     label="Cases"/>
          <ToolBtn id="clinical"   active={type} set={setType} icon={Stethoscope}  label="Clinical"/>
          <ToolBtn id="treatment"  active={type} set={setType} icon={Pill}         label="Treat"/>
          <ToolBtn id="labs"       active={type} set={setType} icon={Thermometer}  label="Labs"/>
          <ToolBtn id="mnemonics"  active={type} set={setType} icon={Lightbulb}    label="Memory"/>
          <ToolBtn id="eli5"       active={type} set={setType} icon={Baby}         label="ELI5"/>
        </div>

        {['flashcards','exam','cases'].includes(type) && (
          <div className="mb-5 bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-[var(--border)]">
            <label className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-4 flex justify-between"><span>Quantity</span><span className="text-[var(--accent)]">{count} items</span></label>
            <input type="range" min="1" max="25" value={count} onChange={e=>setCount(+e.target.value)} className="w-full accent-[var(--accent)]"/>
            <p className="text-[9px] opacity-35 mt-1.5">Keep ≤8 for faster results</p>
          </div>
        )}

        <div className="mb-5 bg-black/5 dark:bg-white/5 p-4 rounded-2xl border border-[var(--border)]">
          <label className="text-[9px] font-black uppercase tracking-widest opacity-50 mb-4 flex justify-between"><span>Difficulty</span><span className="text-[var(--accent)]">{levels[difficulty-1]}</span></label>
          <input type="range" min="1" max="3" value={difficulty} onChange={e=>setDifficulty(+e.target.value)} className="w-full accent-[var(--accent)]"/>
        </div>

        <button onClick={go} disabled={!!bgTask}
          className="w-full py-4 btn-accent rounded-2xl text-sm font-black uppercase tracking-widest disabled:opacity-50 flex items-center justify-center gap-3 hover:-translate-y-1 active:scale-95 transition-all shadow-xl">
          {bgTask?<Loader2 size={20} className="animate-spin"/>:<Zap size={20} fill="currentColor"/>}
          {bgTask?'Running AI…':'Execute Extraction'}
        </button>
      </div>
    </div>
  );
}

// ─── PANEL CHAT ───────────────────────────────────────────────────────────────
// FIX: all hooks BEFORE conditional return
function PanelChat({ activeDoc, settings, currentPage }) {
  const [messages, setMessages] = useState([{role:'assistant',content:'Ready. Ask anything about this document.'}]);
  const [input,    setInput]    = useState('');
  const [loading,  setLoading]  = useState(false);
  const [mode,     setMode]     = useState('page');
  const endRef = useRef(null);

  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}); },[messages,loading]);

  // Only update the context hint message when page changes, not on initial mount causing duplicates
  const prevPageRef = useRef(currentPage);
  useEffect(()=>{
    if (prevPageRef.current !== currentPage) {
      prevPageRef.current = currentPage;
      if (activeDoc) setMessages(p=>[...p,{role:'assistant',content:`*(Now focused on Page ${currentPage})*`}]);
    }
  },[currentPage, activeDoc]);

  if (!activeDoc) return <div className="flex-1 flex items-center justify-center opacity-40 text-sm font-bold">No document open.</div>;

  const handleChat = async () => {
    if (!input.trim()||loading) return;
    const msg=input; setInput(''); setMessages(p=>[...p,{role:'user',content:msg}]); setLoading(true);
    try {
      const pdfData = await getPdf(activeDoc.id);
      const text = mode==='page'
        ? (pdfData?.pagesText?.[currentPage]||'No text on this page.')
        : Object.entries(pdfData?.pagesText||{}).map(([p,t])=>`[Page ${p}]\n${t}`).join('\n\n').substring(0,60000);
      const hist = messages.filter(m=>!m.content.startsWith('*(')).slice(-6).map(m=>`${m.role==='user'?'USER':'ASSISTANT'}: ${m.content}`).join('\n');
      const res = await callAI(`DOCUMENT:\n${text}\n\nHISTORY:\n${hist}\n\nQUESTION:\n${msg}`, false, false, settings, 3000);
      setMessages(p=>[...p,{role:'assistant',content:res}]);
    } catch(e) { setMessages(p=>[...p,{role:'assistant',content:`⚠️ ${e.message}`}]); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="shrink-0 p-3 pb-2 border-b border-[var(--border)]">
        <div className="flex items-center gap-1.5 bg-black/5 dark:bg-white/5 p-1.5 rounded-xl">
          <button onClick={()=>setMode('page')}
            className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors ${mode==='page'?'bg-[var(--accent)] text-white shadow-md':'opacity-55 hover:opacity-100'}`}>
            Page {currentPage}
          </button>
          <button onClick={()=>setMode('document')}
            className={`flex-1 py-2.5 text-[10px] font-black uppercase tracking-widest rounded-lg transition-colors ${mode==='document'?'bg-[var(--accent)] text-white shadow-md':'opacity-55 hover:opacity-100'}`}>
            Full Doc
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4 min-h-0">
        {messages.map((m,i)=>(
          <div key={i} className={`flex gap-3 ${m.role==='user'?'flex-row-reverse':''}`}>
            <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${m.role==='user'?'bg-[var(--accent)] text-white':'glass overflow-hidden'}`}>
              {m.role==='user'?<UserCircle2 size={17}/>:<img src={MARIAM_IMG} className="w-full h-full object-cover" alt="AI"/>}
            </div>
            <div className={`p-4 text-xs leading-relaxed max-w-[84%] ${m.role==='user'?'bg-[var(--accent)] text-white rounded-2xl rounded-tr-sm':'glass rounded-2xl rounded-tl-sm whitespace-pre-wrap'}`}>{m.content}</div>
          </div>
        ))}
        {loading && <div className="flex gap-3"><div className="w-9 h-9 rounded-xl glass overflow-hidden"><img src={MARIAM_IMG} className="w-full h-full object-cover opacity-50" alt="AI"/></div><div className="p-4 glass rounded-2xl flex gap-1.5 items-center">{[0,1,2].map(i=><span key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:`${i*.15}s`}}/>)}</div></div>}
        <div ref={endRef}/>
      </div>

      <div className="shrink-0 p-3 pb-[110px] lg:pb-3 border-t border-[var(--border)] bg-[var(--bg)] relative">
        <div className="relative flex items-end bg-black/5 dark:bg-white/5 rounded-2xl border border-[var(--border)] p-2">
          <textarea value={input} onChange={e=>setInput(e.target.value)}
            onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleChat();} }}
            placeholder={`Ask about ${mode==='page'?`page ${currentPage}`:'the document'}…`} disabled={loading}
            className="w-full bg-transparent p-3 pr-12 text-xs outline-none resize-none max-h-28 custom-scrollbar text-[var(--text)]"
            style={{minHeight:'48px'}}/>
          <button onClick={handleChat} disabled={loading||!input.trim()}
            className="absolute right-3 bottom-3 p-3 bg-[var(--accent)] disabled:opacity-40 rounded-xl text-white shadow-lg hover:scale-105 active:scale-95">
            <Send size={16}/>
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── PANEL REVIEW ─────────────────────────────────────────────────────────────
function PanelReview({ activeDocId, flashcards, setFlashcards, exams, setExams, cases, setCases, notes, setNotes, addToast, setCurrentPage, setRightPanelOpen, setCurrentView, settings }) {
  const [item, setItem] = useState(null);
  const [tab,  setTab]  = useState('cases');
  const dCards = flashcards.filter(f=>f.docId===activeDocId);
  const dExams = exams.filter(e=>e.docId===activeDocId);
  const dCases = cases.filter(c=>c.docId===activeDocId);
  const dNotes = notes.filter(n=>n.docId===activeDocId);

  if (item?.type==='exam'||item?.type==='case') return <div className="flex-1 flex flex-col min-h-0"><InPanelExam exam={item.data} onBack={()=>setItem(null)} onScoreUpdate={(id,sc)=>{ if(item.type==='case') setCases(p=>p.map(c=>c.id===id?{...c,lastScore:sc}:c)); else setExams(p=>p.map(e=>e.id===id?{...e,lastScore:sc}:e)); }} addToast={addToast} setCurrentPage={setCurrentPage} setRightPanelOpen={setRightPanelOpen} setCurrentView={setCurrentView} settings={settings}/></div>;
  if (item?.type==='note') return <div className="flex-1 flex flex-col min-h-0"><InPanelNote note={item.data} onBack={()=>setItem(null)}/></div>;
  if (item?.type==='flashcards') return <div className="flex-1 flex flex-col min-h-0"><InPanelFlashcards title={item.data.title} initialCards={item.data.cards} onBack={()=>setItem(null)} setFlashcards={setFlashcards} addToast={addToast} setCurrentPage={setCurrentPage} setRightPanelOpen={setRightPanelOpen} setCurrentView={setCurrentView} settings={settings}/></div>;

  const TABS = [['cases','Cases',dCases.length],['exams','Exams',dExams.length],['flashcards','Cards',dCards.length],['notes','Notes',dNotes.length]];

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0">
      <div className="flex gap-1.5 p-3 glass border-b border-[var(--border)] shrink-0 rounded-none">
        {TABS.map(([id,label,cnt])=>(
          <button key={id} onClick={()=>setTab(id)} className={`flex-1 py-2.5 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all flex flex-col items-center gap-0.5
            ${tab===id?'bg-[var(--card)] text-[var(--accent)] shadow border border-[var(--border)]':'opacity-50 hover:opacity-100 border border-transparent'}`}>
            {label}<span className={`text-[8px] px-1.5 py-0.5 rounded-full font-black ${tab===id?'bg-[var(--accent)] text-white':'bg-black/10 dark:bg-white/10'}`}>{cnt}</span>
          </button>
        ))}
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 pb-[110px] lg:pb-4 space-y-3 min-h-0">

        {tab==='cases' && (dCases.length===0?<EmptyState icon={Activity} text="No cases for this document."/>:dCases.map(c=>(
          <div key={c.id} className="glass rounded-2xl p-5 card-hover border border-[var(--border)]">
            <div className="flex justify-between items-start mb-4">
              <div><p className="font-bold text-sm mb-2 leading-snug">{c.title}</p><div className="flex gap-2 flex-wrap"><span className="text-[9px] font-black text-blue-500 bg-blue-500/10 px-2 py-1 rounded-lg">{c.questions.length} Cases</span>{c.lastScore!==undefined&&<span className={`text-[9px] font-black px-2 py-1 rounded-lg ${c.lastScore>=70?'text-emerald-500 bg-emerald-500/10':'text-red-500 bg-red-500/10'}`}>{c.lastScore}%</span>}</div></div>
              <button onClick={()=>setCases(cases.filter(x=>x.id!==c.id))} className="p-2 opacity-40 hover:text-red-500 rounded-xl glass"><Trash size={15}/></button>
            </div>
            <button onClick={()=>setItem({type:'case',data:c})} className="w-full py-3 bg-blue-500/10 hover:bg-blue-500/20 text-blue-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"><Play size={14} fill="currentColor"/> Solve</button>
          </div>
        )))}

        {tab==='exams' && (dExams.length===0?<EmptyState icon={GraduationCap} text="No exams for this document."/>:dExams.map(e=>(
          <div key={e.id} className="glass rounded-2xl p-5 card-hover border border-[var(--border)]">
            <div className="flex justify-between items-start mb-4">
              <div><p className="font-bold text-sm mb-2 leading-snug">{e.title}</p><div className="flex gap-2 flex-wrap"><span className="text-[9px] font-black text-emerald-500 bg-emerald-500/10 px-2 py-1 rounded-lg">{e.questions.length} Qs</span>{e.lastScore!==undefined&&<span className={`text-[9px] font-black px-2 py-1 rounded-lg ${e.lastScore>=70?'text-emerald-500 bg-emerald-500/10':'text-red-500 bg-red-500/10'}`}>{e.lastScore}%</span>}</div></div>
              <button onClick={()=>setExams(exams.filter(x=>x.id!==e.id))} className="p-2 opacity-40 hover:text-red-500 rounded-xl glass"><Trash size={15}/></button>
            </div>
            <button onClick={()=>setItem({type:'exam',data:e})} className="w-full py-3 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"><Play size={14} fill="currentColor"/> Take Exam</button>
          </div>
        )))}

        {tab==='flashcards' && (dCards.length===0?<EmptyState icon={Layers} text="No flashcards for this document."/>:dCards.map(set=>{
          const due=(set.cards||[]).filter(c=>c.nextReview<=Date.now()).length;
          return (
            <div key={set.id} className="glass rounded-2xl p-5 card-hover border border-[var(--border)]">
              <div className="flex justify-between items-start mb-4">
                <div><p className="font-bold text-sm mb-2 leading-snug">{set.title}</p><div className="flex gap-2 flex-wrap"><span className="text-[9px] font-black text-[var(--accent)] bg-[var(--accent)]/10 px-2 py-1 rounded-lg">{set.cards?.length||0} Cards</span>{due>0&&<span className="text-[9px] font-black text-red-500 bg-red-500/10 px-2 py-1 rounded-lg animate-pulse">{due} due</span>}</div></div>
                <button onClick={()=>setFlashcards(flashcards.filter(f=>f.id!==set.id))} className="p-2 opacity-40 hover:text-red-500 rounded-xl glass"><Trash size={15}/></button>
              </div>
              <button onClick={()=>setItem({type:'flashcards',data:set})} className="w-full py-3 bg-[var(--accent)]/10 hover:bg-[var(--accent)]/20 text-[var(--accent)] rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2"><Play size={14} fill="currentColor"/> Study</button>
            </div>
          );
        }))}

        {tab==='notes' && (dNotes.length===0?<EmptyState icon={BookA} text="No notes for this document."/>:dNotes.map(n=>(
          <div key={n.id} onClick={()=>setItem({type:'note',data:n})} className="glass p-5 rounded-2xl relative group card-hover cursor-pointer border border-[var(--border)] hover:border-[var(--accent)]/50">
            <p className="font-bold text-sm mb-3 pr-10 leading-snug">{n.title}</p>
            <p className="text-xs opacity-50 line-clamp-3 bg-black/5 dark:bg-white/5 p-3 rounded-xl">{n.content}</p>
            <button onClick={e=>{e.stopPropagation();setNotes(notes.filter(x=>x.id!==n.id));}} className="absolute top-5 right-5 p-2 opacity-0 group-hover:opacity-100 hover:text-red-500 rounded-xl glass"><Trash size={15}/></button>
          </div>
        )))}
      </div>
    </div>
  );
}

// ─── GLOBAL VIEWS ─────────────────────────────────────────────────────────────
function FlashcardsGlobalView({ flashcards, setFlashcards, addToast, setCurrentPage, setRightPanelOpen, setCurrentView, settings }) {
  const [studying, setStudying] = useState(null);
  if (studying) return <div className="flex-1 flex flex-col min-h-0"><InPanelFlashcards title={studying.title} initialCards={studying.cards} onBack={()=>setStudying(null)} setFlashcards={setFlashcards} addToast={addToast} setCurrentPage={setCurrentPage} setRightPanelOpen={setRightPanelOpen} setCurrentView={setCurrentView} settings={settings}/></div>;
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="max-w-screen-xl mx-auto p-6 md:p-12 pb-[120px] lg:pb-32">
        <h1 className="title-font text-4xl font-black text-emerald-500 mb-10 flex items-center gap-4"><Layers size={36}/> Card Vault</h1>
        {flashcards.length===0?<EmptyState icon={Layers} text="No flashcards yet. Open a PDF → AI Studio → Extract Cards."/>:(
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {flashcards.map(set=>(
              <div key={set.id} className="glass rounded-[2rem] p-6 flex flex-col card-hover">
                <h3 className="font-bold mb-4 line-clamp-2">{set.title}</h3>
                <span className="px-3 py-1 bg-[var(--accent)]/10 text-[var(--accent)] rounded-xl text-[10px] font-bold w-fit mb-6">{set.cards?.length||0} Cards</span>
                <div className="mt-auto flex gap-3"><button onClick={()=>setStudying(set)} className="flex-1 py-4 btn-accent rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg">Study</button><button onClick={()=>setFlashcards(flashcards.filter(f=>f.id!==set.id))} className="p-4 glass hover:text-red-500 hover:bg-red-500/10 rounded-2xl transition-colors"><Trash2 size={18}/></button></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ExamsGlobalView({ exams, setExams, addToast, setCurrentPage, setRightPanelOpen, setCurrentView, settings }) {
  const [sel, setSel] = useState(null);
  if (sel) return <div className="flex-1 flex flex-col min-h-0"><InPanelExam exam={sel} onBack={()=>setSel(null)} onScoreUpdate={(id,sc)=>setExams(p=>p.map(e=>e.id===id?{...e,lastScore:sc}:e))} addToast={addToast} setCurrentPage={setCurrentPage} setRightPanelOpen={setRightPanelOpen} setCurrentView={setCurrentView} settings={settings}/></div>;
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="max-w-screen-xl mx-auto p-6 md:p-12 pb-[120px] lg:pb-32">
        <h1 className="title-font text-4xl font-black text-rose-500 mb-10 flex items-center gap-4"><GraduationCap size={36}/> Exams</h1>
        {exams.length===0?<EmptyState icon={GraduationCap} text="No exams yet."/>:(
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {exams.map(e=>(
              <div key={e.id} className="glass rounded-[2rem] p-6 flex flex-col card-hover">
                <h3 className="font-bold mb-4 line-clamp-2">{e.title}</h3>
                <div className="flex gap-2 mb-6 flex-wrap text-[10px] font-bold"><span className="px-3 py-1 bg-rose-500/10 text-rose-600 rounded-xl">{e.questions.length} Qs</span>{e.lastScore!==undefined&&<span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-xl">{e.lastScore}%</span>}</div>
                <div className="mt-auto flex gap-3"><button onClick={()=>setSel(e)} className="flex-1 py-4 bg-gradient-to-r from-rose-400 to-rose-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg">Take Exam</button><button onClick={()=>setExams(exams.filter(ex=>ex.id!==e.id))} className="p-4 glass hover:text-red-500 hover:bg-red-500/10 rounded-2xl"><Trash2 size={18}/></button></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function CasesGlobalView({ cases, setCases, addToast, setCurrentPage, setRightPanelOpen, setCurrentView, settings }) {
  const [sel, setSel] = useState(null);
  if (sel) return <div className="flex-1 flex flex-col min-h-0"><InPanelExam exam={sel} onBack={()=>setSel(null)} onScoreUpdate={(id,sc)=>setCases(p=>p.map(c=>c.id===id?{...c,lastScore:sc}:c))} addToast={addToast} setCurrentPage={setCurrentPage} setRightPanelOpen={setRightPanelOpen} setCurrentView={setCurrentView} settings={settings}/></div>;
  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar">
      <div className="max-w-screen-xl mx-auto p-6 md:p-12 pb-[120px] lg:pb-32">
        <h1 className="title-font text-4xl font-black text-blue-500 mb-10 flex items-center gap-4"><Activity size={36}/> Patient Cases</h1>
        {cases.length===0?<EmptyState icon={Activity} text="No cases yet."/>:(
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {cases.map(c=>(
              <div key={c.id} className="glass rounded-[2rem] p-6 flex flex-col card-hover">
                <h3 className="font-bold mb-4 line-clamp-2">{c.title}</h3>
                <div className="flex gap-2 mb-6 flex-wrap text-[10px] font-bold"><span className="px-3 py-1 bg-blue-500/10 text-blue-600 rounded-xl">{c.questions?.length||0} Cases</span>{c.lastScore!==undefined&&<span className="px-3 py-1 bg-emerald-500/10 text-emerald-600 rounded-xl">{c.lastScore}%</span>}</div>
                <div className="mt-auto flex gap-3"><button onClick={()=>setSel(c)} className="flex-1 py-4 bg-gradient-to-r from-blue-400 to-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg">Solve Cases</button><button onClick={()=>setCases(cases.filter(x=>x.id!==c.id))} className="p-4 glass hover:text-red-500 hover:bg-red-500/10 rounded-2xl"><Trash2 size={18}/></button></div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ChatGlobalView({ settings, chatSessions, setChatSessions, addToast }) {
  const [sid, setSid] = useState(null);
  const [input, setInput] = useState(''); const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  const active = chatSessions.find(s=>s.id===sid)||null;
  useEffect(()=>{ endRef.current?.scrollIntoView({behavior:'smooth'}); },[active?.messages,loading]);

  const send = async () => {
    if (!input.trim()||loading) return;
    const id=sid||Date.now().toString(), msg=input; setInput('');
    let msgs = !sid?[]:(chatSessions.find(s=>s.id===id)?.messages||[]);
    msgs=[...msgs,{role:'user',content:msg}];
    const title=!sid?msg.substring(0,40)+'…':chatSessions.find(s=>s.id===id)?.title;
    setChatSessions(p=>p.find(s=>s.id===id)?p.map(s=>s.id===id?{...s,messages:msgs}:s):[{id,title,messages:msgs,createdAt:new Date().toISOString()},...p]);
    if(!sid) setSid(id); setLoading(true);
    try { const r=await callAI(msg,false,false,settings,4000); setChatSessions(p=>p.map(s=>s.id===id?{...s,messages:[...s.messages,{role:'assistant',content:r}]}:s)); }
    catch(e){ setChatSessions(p=>p.map(s=>s.id===id?{...s,messages:[...s.messages,{role:'assistant',content:`⚠️ ${e.message}`}]}:s)); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex-1 flex w-full h-full min-h-0">
      <div className="hidden md:flex w-64 flex-col glass shrink-0 rounded-none border-y-0 border-l-0">
        <div className="p-3 border-b border-[var(--border)]"><button onClick={()=>setSid(null)} className="w-full flex items-center justify-center gap-2 bg-[var(--accent)] text-white py-3 rounded-xl font-bold text-sm"><PlusCircle size={16}/> New Chat</button></div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {chatSessions.length===0&&<div className="text-center p-4 text-[9px] font-bold opacity-40 uppercase tracking-widest mt-4">No History</div>}
          {chatSessions.map(s=>(
            <div key={s.id} className="relative group mb-1">
              <button onClick={()=>setSid(s.id)} className={`w-full text-left p-3 rounded-xl text-xs transition-colors ${sid===s.id?'bg-[var(--accent)]/10 text-[var(--accent)] font-bold':'opacity-60 hover:opacity-100 hover:bg-black/5 dark:hover:bg-white/5'}`}><div className="truncate pr-6">{s.title}</div></button>
              <button onClick={()=>setChatSessions(p=>p.filter(x=>x.id!==s.id))} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 hover:text-red-500 opacity-0 group-hover:opacity-100 rounded-lg"><Trash size={12}/></button>
            </div>
          ))}
        </div>
      </div>
      <div className="flex-1 flex flex-col min-h-0">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 flex flex-col">
          {!active?(
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-60">
              <div className="w-16 h-16 rounded-2xl bg-[var(--accent)]/10 flex items-center justify-center mb-5"><Sparkles size={32} className="text-[var(--accent)]"/></div>
              <h2 className="text-xl font-black mb-2">Medical AI Chat</h2>
              <p className="max-w-xs text-sm">Ask any clinical or general medical question.</p>
            </div>
          ):(
            <div className="max-w-3xl mx-auto w-full space-y-5 pb-4">
              {active.messages.map((m,i)=>(
                <div key={i} className={`flex gap-4 ${m.role==='user'?'flex-row-reverse':''}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${m.role==='user'?'bg-[var(--accent)]':'glass overflow-hidden border border-[var(--border)]'}`}>
                    {m.role==='user'?<UserCircle2 size={18} className="text-white"/>:<img src={MARIAM_IMG} className="w-full h-full object-cover" alt="AI"/>}
                  </div>
                  <div className={`p-4 text-sm leading-relaxed max-w-[85%] ${m.role==='user'?'bg-[var(--accent)] text-white rounded-2xl rounded-tr-sm':'glass rounded-2xl rounded-tl-sm w-full whitespace-pre-wrap'}`}>{m.content}</div>
                </div>
              ))}
              {loading&&<div className="flex gap-4"><div className="w-10 h-10 rounded-2xl glass overflow-hidden"><img src={MARIAM_IMG} className="w-full h-full object-cover opacity-40" alt="AI"/></div><div className="p-4 glass rounded-2xl flex gap-1.5 items-center">{[0,1,2].map(i=><span key={i} className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay:`${i*.15}s`}}/>)}</div></div>}
              <div ref={endRef}/>
            </div>
          )}
        </div>
        <div className="shrink-0 p-4 pb-[110px] lg:pb-4 border-t border-[var(--border)]">
          <div className="max-w-3xl mx-auto glass rounded-2xl p-2 relative">
            <textarea value={input} onChange={e=>setInput(e.target.value)}
              onKeyDown={e=>{ if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();send();} }}
              placeholder="Ask anything…" disabled={loading}
              className="w-full bg-transparent p-3 pr-14 text-sm outline-none resize-none max-h-36 custom-scrollbar text-[var(--text)]"
              style={{minHeight:'56px'}}/>
            <button onClick={send} disabled={loading||!input.trim()} className="absolute right-3 bottom-3 p-3 bg-[var(--accent)] disabled:opacity-40 rounded-xl text-white"><Send size={17}/></button>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── IN-PANEL EXAM ────────────────────────────────────────────────────────────
function InPanelExam({ exam, onBack, onScoreUpdate, addToast, setCurrentPage, setRightPanelOpen, setCurrentView, settings }) {
  const [qi,  setQi]  = useState(0);
  const [sel, setSel] = useState(null);
  const [fb,  setFb]  = useState(false);
  const [score, setScore] = useState(0);
  const [done, setDone]   = useState(false);
  const [tutor, setTutor] = useState(false);
  const [tw,   setTw]    = useState(340);
  const [rz,   setRz]    = useState(false);

  const qObj = exam.questions[qi];
  const q    = qObj?.examQuestion ? qObj.examQuestion : qObj;
  const pct  = Math.round((qi/exam.questions.length)*100);

  useEffect(()=>{
    const mv=e=>{ if(!rz) return; const x=e.touches?.[0]?.clientX??e.clientX; if(x) setTw(Math.max(260,Math.min(window.innerWidth-x,window.innerWidth-100))); };
    const up=()=>{ if(rz) setRz(false); };
    if(rz){ document.addEventListener('mousemove',mv); document.addEventListener('mouseup',up); document.body.style.userSelect='none'; }
    else { document.body.style.userSelect=''; }
    return()=>{ document.removeEventListener('mousemove',mv); document.removeEventListener('mouseup',up); document.body.style.userSelect=''; };
  },[rz]);

  const pick=(i)=>{ if(fb) return; setSel(i); setFb(true); if(i===q.correct) setScore(s=>s+1); };
  const next=()=>{
    setSel(null); setFb(false); setTutor(false);
    if(qi<exam.questions.length-1){ setQi(qi+1); }
    else { const fs=Math.round((score+(sel===q.correct?0:0))/exam.questions.length*100); setDone(true); onScoreUpdate?.(exam.id,Math.round(score/exam.questions.length*100)); }
  };
  const jump=(pg)=>{ if(pg&&setCurrentView){ setCurrentView('reader'); setCurrentPage(+pg); setRightPanelOpen(false); setTimeout(()=>setRightPanelOpen(true),500); } };

  if (done) {
    const fs=Math.round((score/exam.questions.length)*100);
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center overflow-y-auto">
        <div className={`w-40 h-40 rounded-full flex items-center justify-center mb-8 glass shadow-2xl ${fs>=70?'bg-emerald-500/20 border border-emerald-500/30':'bg-red-500/20 border border-red-500/30'}`}>
          <span className={`text-5xl font-black title-font ${fs>=70?'text-emerald-500':'text-red-500'}`}>{fs}%</span>
        </div>
        <h2 className="title-font text-3xl font-black mb-3">Complete!</h2>
        <p className="text-lg opacity-55 mb-2">{score}/{exam.questions.length} correct</p>
        <p className={`font-bold mb-10 ${fs>=70?'text-emerald-500':'text-red-500'}`}>{fs>=90?'Outstanding!':fs>=70?'Well done!':'Keep studying!'}</p>
        <div className="flex gap-3">
          <button onClick={onBack} className="px-7 py-3.5 glass opacity-70 hover:opacity-100 rounded-full font-black text-xs uppercase tracking-widest">Back</button>
          <button onClick={()=>{setQi(0);setScore(0);setSel(null);setFb(false);setDone(false);}} className="px-7 py-3.5 btn-accent rounded-full font-black text-xs uppercase tracking-widest">Retry</button>
        </div>
      </div>
    );
  }
  if (!q) return null;

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-[#0a0a0c]">
      <div className="bg-white dark:bg-zinc-900 border-b border-gray-200 dark:border-zinc-800 px-4 py-3 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="text-xs font-black uppercase tracking-widest opacity-60 hover:opacity-100 flex items-center gap-1.5"><ChevronLeft size={15}/> Exit</button>
        <div className="flex items-center gap-3">
          <div className="hidden md:block w-28 bg-gray-200 dark:bg-zinc-800 rounded-full h-1.5"><div className="bg-[var(--accent-color)] h-full rounded-full" style={{width:`${pct}%`}}/></div>
          <span className="text-[10px] font-black bg-gray-100 dark:bg-zinc-800 px-3 py-1.5 rounded-lg">{qi+1}/{exam.questions.length}</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex relative">
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-8 pb-[120px] lg:pb-8">
          {qObj?.vignette && (
            <div className="mb-6">
              <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-2">Patient Vignette</span>
              <div className="text-sm text-gray-800 dark:text-zinc-200 leading-relaxed bg-white dark:bg-[#121214] p-5 rounded-2xl border border-gray-200 dark:border-zinc-800 whitespace-pre-wrap">{qObj.vignette}</div>
            </div>
          )}
          {qObj?.labPanels?.length>0 && (
            <div className="mb-6 lg:hidden">
              <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 mb-3 flex items-center gap-2"><FlaskConical size={16}/> Lab Results</h3>
              {qObj.labPanels.map((lp,pi)=>(
                <div key={pi} className="mb-2"><h4 className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">{lp.panelName}</h4><LabTable rows={lp.rows}/></div>
              ))}
            </div>
          )}

          <h2 className="text-base md:text-lg font-bold mb-5 leading-relaxed text-gray-900 dark:text-white">{q.q}</h2>

          <div className="space-y-2.5 mb-6">
            {(q.options||[]).map((opt,i)=>{
              const isSel=sel===i, isCorr=i===q.correct;
              const cls = isSel?(isCorr?'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200':'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-200'):(fb&&isCorr?'border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-200':'border-gray-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300');
              return (
                <button key={i} onClick={()=>pick(i)} disabled={fb} className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-center gap-3 text-sm ${cls}`}>
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${(isSel||(fb&&isCorr))?(isCorr?'border-emerald-500':'border-red-500'):'border-gray-300 dark:border-zinc-600'}`}>
                    {(isSel||(fb&&isCorr))&&<div className={`w-2.5 h-2.5 rounded-full ${isCorr?'bg-emerald-500':'bg-red-500'}`}/>}
                  </div>
                  {opt}
                </button>
              );
            })}
          </div>

          {fb && (
            <div className="animate-slide-in">
              <div className="p-5 bg-[var(--accent-color)]/5 border border-[var(--accent-color)]/20 rounded-2xl mb-4">
                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent-color)] block mb-2">Explanation</span>
                <p className="text-sm leading-relaxed">{q.explanation}</p>
                {q.evidence&&(
                  <div className="mt-4 pt-4 border-t border-[var(--accent-color)]/20">
                    <p className="text-xs italic opacity-60 border-l-4 border-gray-300 pl-2.5 mb-3">"{q.evidence}"</p>
                    {q.sourcePage&&<button onClick={()=>jump(q.sourcePage)} className="px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5 hover:scale-105 transition-transform"><FileSearch size={12}/> Pg {q.sourcePage}</button>}
                  </div>
                )}
              </div>
              {!tutor&&<button onClick={()=>setTutor(true)} className="mb-6 w-full py-3.5 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-blue-200 dark:border-blue-800/50"><MessageCircleQuestion size={16}/> Ask AI Tutor</button>}
            </div>
          )}

          <div className="flex justify-between items-center pt-6 border-t border-gray-200 dark:border-zinc-800">
            <button onClick={()=>{if(qi>0){setQi(qi-1);setSel(null);setFb(false);setTutor(false);}}} disabled={qi===0} className="px-4 py-2.5 text-gray-500 bg-gray-100 dark:bg-zinc-800 rounded-xl disabled:opacity-30 text-[10px] font-bold uppercase flex items-center gap-1.5"><ChevronLeft size={14}/> Prev</button>
            <button onClick={next} disabled={!fb} className="px-6 py-3 bg-[var(--accent-color)] text-white disabled:bg-gray-200 dark:disabled:bg-zinc-800 disabled:text-gray-400 rounded-xl text-[10px] font-black shadow-lg uppercase flex items-center gap-2 transition-all hover:-translate-y-0.5 disabled:hover:translate-y-0">
              {qi<exam.questions.length-1?'Next':'Finish'}<ChevronRight size={15}/>
            </button>
          </div>
        </div>

        {/* Lab panel (desktop) */}
        {qObj?.labPanels?.length>0&&!tutor&&(
          <div className="hidden lg:block w-[45%] border-l border-gray-200 dark:border-zinc-800 overflow-y-auto custom-scrollbar p-6">
            <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 mb-4 flex items-center gap-2"><FlaskConical size={16}/> Lab Results</h3>
            {qObj.labPanels.map((lp,pi)=>(<div key={pi} className="mb-3"><h4 className="text-[9px] font-black uppercase tracking-widest text-gray-400 mb-2">{lp.panelName}</h4><LabTable rows={lp.rows}/></div>))}
          </div>
        )}

        {tutor&&(<><div className="hidden md:flex w-2.5 cursor-col-resize hover:bg-[var(--accent)]/40 items-center justify-center shrink-0 z-[120]" onMouseDown={e=>{e.preventDefault();setRz(true);}}><div className="w-1 h-10 bg-gray-400 rounded-full pointer-events-none"/></div>
        <aside style={{width:window.innerWidth<768?'100%':tw}} className="absolute md:relative right-0 top-0 bottom-0 z-[110] shadow-2xl border-l border-gray-200 dark:border-zinc-800"><MiniTutorChat contextObj={qObj} settings={settings} onClose={()=>setTutor(false)}/></aside></>)}
      </div>
    </div>
  );
}

// ─── IN-PANEL FLASHCARDS ──────────────────────────────────────────────────────
function InPanelFlashcards({ title, initialCards, onBack, setFlashcards, addToast, setCurrentPage, setRightPanelOpen, setCurrentView, settings }) {
  const [cards, setCards] = useState(initialCards||[]);
  const [ci, setCi] = useState(0);
  const [flip, setFlip] = useState(false);
  const [stats, setStats] = useState({again:0,hard:0,good:0,easy:0});
  const [tutor, setTutor] = useState(false);
  const [tw, setTw] = useState(340); const [rz, setRz] = useState(false);

  useEffect(()=>{
    const mv=e=>{ if(!rz) return; const x=e.touches?.[0]?.clientX??e.clientX; if(x) setTw(Math.max(260,Math.min(window.innerWidth-x,window.innerWidth-100))); };
    const up=()=>{if(rz) setRz(false);};
    if(rz){ document.addEventListener('mousemove',mv); document.addEventListener('mouseup',up); document.body.style.userSelect='none'; }
    else { document.body.style.userSelect=''; }
    return()=>{ document.removeEventListener('mousemove',mv); document.removeEventListener('mouseup',up); document.body.style.userSelect=''; };
  },[rz]);

  if (!cards?.length) return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 text-center overflow-y-auto">
      <div className="w-36 h-36 rounded-full glass bg-emerald-500/20 flex items-center justify-center mb-7 border border-emerald-500/30"><CheckCircle2 size={68} className="text-emerald-500"/></div>
      <h2 className="title-font text-3xl font-black mb-3">Mastery Complete!</h2>
      <div className="grid grid-cols-4 gap-3 my-8 w-full max-w-md">{Object.entries(stats).map(([k,v])=>(<div key={k} className="glass rounded-2xl p-4 text-center"><p className="text-2xl font-black title-font">{v}</p><p className="text-[9px] font-bold uppercase tracking-widest opacity-50 mt-1">{k}</p></div>))}</div>
      <button onClick={onBack} className="px-10 py-4 btn-accent rounded-full font-black text-xs uppercase tracking-widest shadow-xl">Back</button>
    </div>
  );

  const card = cards[ci];
  const rate=(q)=>{
    const rk=q===0?'again':q===3?'hard':q===4?'good':'easy'; setStats(p=>({...p,[rk]:p[rk]+1}));
    let nr=card.repetitions||0,ne=card.ef||2.5,ni=card.interval||1;
    if(q<3){nr=0;ni=1;}else{ne=Math.max(1.3,ne+(0.1-(5-q)*(0.08+(5-q)*0.02)));nr++;ni=nr===1?1:nr===2?6:Math.round(ni*ne);}
    const nc={...card,repetitions:nr,ef:ne,interval:ni,lastReview:Date.now(),nextReview:Date.now()+ni*86400000};
    setCards(p=>p.map(c=>c.id===nc.id?nc:c));
    setFlashcards(gs=>gs.map(set=>({...set,cards:set.cards?set.cards.map(c=>c.id===nc.id?nc:c):set.cards})));
    setFlip(false); setTutor(false);
    if(ci<cards.length-1) setCi(ci+1); else setCards([]);
  };
  const jump=(pg)=>{ if(pg&&setCurrentView){setCurrentView('reader');setCurrentPage(+pg);setRightPanelOpen(false);setTimeout(()=>setRightPanelOpen(true),500);} };
  const pct=Math.round((ci/(initialCards?.length||1))*100);

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-[#0a0a0c]">
      <div className="bg-[var(--accent-color)]/10 border-b border-[var(--accent-color)]/20 px-4 py-3 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="text-[var(--accent-color)] text-xs font-black uppercase tracking-widest flex items-center gap-1.5"><ChevronLeft size={15}/> Exit</button>
        <div className="flex items-center gap-3">
          <div className="hidden md:block w-36 bg-gray-200 dark:bg-zinc-800 rounded-full h-1.5"><div className="bg-[var(--accent-color)] h-full rounded-full" style={{width:`${pct}%`}}/></div>
          <span className="text-[10px] font-black bg-[var(--accent-color)]/10 text-[var(--accent-color)] px-3 py-1.5 rounded-lg">{ci+1}/{initialCards?.length||cards.length}</span>
        </div>
      </div>

      <div className="flex-1 overflow-hidden flex relative">
        <div className="flex-1 overflow-y-auto custom-scrollbar flex flex-col items-center justify-start pt-10 p-5 pb-[120px] lg:pb-8">
          {/* Card */}
          <div onClick={()=>!flip&&setFlip(true)} className={`w-full max-w-2xl cursor-pointer mb-7 shrink-0 ${flip?'min-h-[420px]':'h-72'}`} style={{perspective:'1000px'}}>
            <div className={`relative w-full h-full transition-transform duration-600 ${flip?'[transform:rotateX(180deg)]':''}`} style={{transformStyle:'preserve-3d'}}>
              {/* front */}
              <div className="absolute inset-0 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[2.5rem] p-8 flex flex-col items-center justify-center text-center shadow-xl" style={{backfaceVisibility:'hidden'}}>
                <span className="absolute top-5 left-5 text-[9px] font-black uppercase tracking-widest text-gray-400 bg-gray-100 dark:bg-zinc-800 px-2.5 py-1 rounded-lg">Question</span>
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 dark:text-white leading-relaxed">{card.q}</h2>
                <div className="absolute bottom-5 text-[9px] font-black uppercase tracking-widest text-[var(--accent-color)] animate-pulse bg-[var(--accent-color)]/10 px-4 py-1.5 rounded-full">Tap to reveal</div>
              </div>
              {/* back */}
              <div onClick={e=>e.stopPropagation()} className="absolute inset-0 bg-white dark:bg-zinc-900 border-2 border-[var(--accent-color)]/50 rounded-[2.5rem] p-7 flex flex-col shadow-2xl overflow-y-auto custom-scrollbar" style={{backfaceVisibility:'hidden',transform:'rotateX(180deg)'}}>
                <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent-color)] bg-[var(--accent-color)]/10 px-2.5 py-1 rounded-lg self-start mb-4">Answer</span>
                <p className="text-lg md:text-xl font-bold text-gray-900 dark:text-white leading-relaxed mb-5">{card.a}</p>
                {card.evidence&&(
                  <div className="mt-2 pt-4 border-t border-gray-200 dark:border-zinc-800 mb-4">
                    <p className="text-xs italic text-gray-500 border-l-4 border-gray-300 pl-2.5 mb-3">"{card.evidence}"</p>
                    {card.sourcePage&&<button onClick={()=>jump(card.sourcePage)} className="px-3 py-1.5 bg-gray-900 dark:bg-white text-white dark:text-zinc-900 rounded-lg text-[9px] font-black uppercase flex items-center gap-1.5 hover:scale-105 transition-transform w-fit"><FileSearch size={12}/> Pg {card.sourcePage}</button>}
                  </div>
                )}
                {!tutor&&<button onClick={()=>setTutor(true)} className="mt-auto w-full py-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-xl text-[9px] font-black uppercase tracking-widest flex items-center justify-center gap-2 border border-blue-200 dark:border-blue-800/50"><MessageCircleQuestion size={14}/> Ask AI Tutor</button>}
              </div>
            </div>
          </div>

          {/* SR buttons */}
          <div className={`w-full max-w-2xl grid grid-cols-2 md:grid-cols-4 gap-3 transition-all ${flip?'opacity-100':'opacity-0 pointer-events-none'}`}>
            {[{l:'Again',q:0,c:'text-red-600 bg-red-50 hover:bg-red-500 hover:text-white border-red-200'},{l:'Hard',q:3,c:'text-amber-600 bg-amber-50 hover:bg-amber-500 hover:text-white border-amber-200'},{l:'Good',q:4,c:'text-emerald-600 bg-emerald-50 hover:bg-emerald-500 hover:text-white border-emerald-200'},{l:'Easy',q:5,c:'text-blue-600 bg-blue-50 hover:bg-blue-500 hover:text-white border-blue-200'}].map(({l,q,c})=>(
              <button key={l} onClick={()=>rate(q)} className={`py-4 rounded-2xl text-xs font-black uppercase tracking-widest border-2 transition-all hover:-translate-y-1 shadow-sm ${c}`}>{l}</button>
            ))}
          </div>
        </div>

        {tutor&&(<>
          <div className="hidden md:flex w-2.5 cursor-col-resize hover:bg-[var(--accent)]/40 items-center justify-center shrink-0 z-[120]" onMouseDown={e=>{e.preventDefault();setRz(true);}}><div className="w-1 h-10 bg-gray-400 rounded-full pointer-events-none"/></div>
          <aside style={{width:window.innerWidth<768?'100%':tw}} className="absolute md:relative right-0 top-0 bottom-0 z-[110] shadow-2xl border-l border-gray-200 dark:border-zinc-800"><MiniTutorChat contextObj={card} settings={settings} onClose={()=>setTutor(false)}/></aside>
        </>)}
      </div>
    </div>
  );
}

function InPanelNote({ note, onBack }) {
  return (
    <div className="flex-1 flex flex-col min-h-0">
      <div className="glass bg-blue-500/10 border-b border-blue-500/20 px-5 py-4 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="text-blue-600 text-xs font-black uppercase tracking-widest flex items-center gap-2"><ChevronLeft size={15}/> Back</button>
        <button onClick={()=>navigator.clipboard?.writeText(note.content)} className="text-blue-600 p-2 glass rounded-xl"><Clipboard size={18}/></button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 pb-[100px] md:pb-10 max-w-4xl mx-auto w-full">
        <h2 className="title-font text-3xl font-black mb-8">{note.title}</h2>
        <div className="text-sm leading-loose whitespace-pre-wrap glass p-8 rounded-[2rem] border border-[var(--border)]">{note.content}</div>
      </div>
    </div>
  );
}