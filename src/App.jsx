import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Layers, CheckSquare, Settings,
  ChevronLeft, ChevronRight, Upload, MessageSquare,
  CheckCircle2, XCircle, BrainCircuit,
  Library, Trash2, Loader2, List,
  Send, ShieldAlert,
  GraduationCap, Save, X, BookA, Crosshair,
  PanelRightClose, PanelRightOpen, KeyRound, AlertCircle,
  FileUp, Target, Info, Trash, Sparkles, Activity, Stethoscope, Lightbulb, Baby, Play, Bookmark, History,
  Dna, Microscope, Pill, Thermometer, ClipboardList, Zap, Database, Search, FileText, BarChart2, Globe, Bot, Code, Palette, Type, Download, Mic,
  Moon, Sun, HelpCircle, Printer, Menu, FlaskConical, UserCircle2, TrendingUp, TrendingDown, Minus, Plus, ZoomIn, ZoomOut, Maximize,
  PlusCircle, RefreshCcw
} from 'lucide-react';

const DB_NAME = 'MariamProDB_v9'; // Upgraded to v9
const STORE_PDFS = 'pdfs';
const STORE_STATE = 'appState'; // New store to bypass localStorage limits

const openDB = () => new Promise((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, 2);
  request.onupgradeneeded = (e) => {
    const db = e.target.result;
    if (!db.objectStoreNames.contains(STORE_PDFS)) db.createObjectStore(STORE_PDFS);
    if (!db.objectStoreNames.contains(STORE_STATE)) db.createObjectStore(STORE_STATE);
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

const savePdfData = async (id, data) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PDFS, 'readwrite');
    tx.objectStore(STORE_PDFS).put(data, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

const getPdfData = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PDFS, 'readonly');
    const request = tx.objectStore(STORE_PDFS).get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const deletePdfData = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_PDFS, 'readwrite');
    tx.objectStore(STORE_PDFS).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

// New functions for App State persistence (replacing localStorage)
const saveAppState = async (key, data) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_STATE, 'readwrite');
    tx.objectStore(STORE_STATE).put(data, key);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

const getAppState = async (key) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_STATE, 'readonly');
    const request = tx.objectStore(STORE_STATE).get(key);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

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

const loadJsPDF = async () => {
  if (window.jspdf) return window.jspdf;
  return new Promise((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
    script.onload = () => resolve(window.jspdf);
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

const callAI = async (prompt, expectJson, strictMode, apiKey, maxTokens = 16384) => {
  if (!apiKey?.trim()) throw new Error("OpenAI API Key is missing. Please add it in Settings.");
  
  const sysPrompt = strictMode
    ? "You are a highly strict, elite medical AI data extractor. You MUST use ONLY the text provided in the prompt. Do not hallucinate. NO OUTSIDE KNOWLEDGE. If the requested information is not in the text, clearly state 'Information not found in the selected pages.' or return an empty array."
    : "You are an elite, hyper-intelligent medical AI assistant (Gemini/GPT-4 level). You possess vast clinical knowledge. When given context from a document, prioritize it heavily. HOWEVER, if the document lacks the specific answer, DO NOT just say 'information not found'. Instead, synthesize a brilliant, highly advanced answer using your internal medical knowledge, clearly delineating what is from the text versus what is from general medical science. Always be incredibly smart, helpful, and detailed.";

  const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: "system", content: sysPrompt + (expectJson ? " You MUST respond in strictly valid JSON format. No markdown wrappers." : "") },
        { role: "user", content: prompt }
      ],
      response_format: expectJson ? { type: "json_object" } : { type: "text" },
      max_tokens: maxTokens,
      temperature: strictMode ? 0.1 : 0.7,
      stream: false
    }),
  });

  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(`API Error: ${errData.error?.message || response.statusText}`);
  }

  const data = await response.json();
  return data.choices[0].message.content.trim();
};

// ─── LAB TABLE COMPONENT ─────────────────────────────────────────────────────

function LabResultRow({ test, result, range, units, flag, note }) {
  const isLow = flag === 'L';
  const isHigh = flag === 'H';
  const isAbnormal = isLow || isHigh;

  return (
    <tr className={`border-b border-gray-100 dark:border-zinc-800/60 transition-colors ${isAbnormal ? 'bg-red-50/40 dark:bg-red-950/20' : 'bg-white dark:bg-zinc-900/20'}`}>
      <td className="py-1.5 px-3 text-xs font-semibold text-gray-800 dark:text-zinc-200 leading-tight">
        {test}
        {note && <span className="block text-[9px] text-gray-400 dark:text-zinc-500 font-normal italic leading-none mt-0.5">{note}</span>}
      </td>
      <td className="py-1.5 px-3 text-xs text-center whitespace-nowrap">
        <span className={`font-bold inline-flex items-center gap-1 ${isLow ? 'text-blue-600 dark:text-blue-400' : isHigh ? 'text-red-600 dark:text-red-400' : 'text-gray-700 dark:text-zinc-300'}`}>
          {result}
          {flag && (
            <span className={`text-[8px] font-black px-1 py-0.5 rounded leading-none ${isLow ? 'bg-blue-100 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300' : 'bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300'}`}>
              {flag}
            </span>
          )}
        </span>
      </td>
      <td className="py-1.5 px-3 text-xs text-center text-gray-500 dark:text-zinc-400 font-mono tracking-tight">{range}</td>
      <td className="py-1.5 px-3 text-[10px] text-center text-gray-400 dark:text-zinc-500 font-mono">{units}</td>
    </tr>
  );
}

function LabTable({ title, rows }) {
  if (!rows || rows.length === 0) return null;
  return (
    <div className="rounded-xl overflow-hidden border border-gray-200 dark:border-zinc-800 shadow-sm mb-4">
      <table className="w-full border-collapse">
        <thead>
          <tr className="bg-gray-50 dark:bg-zinc-800/60 border-b border-gray-200 dark:border-zinc-800">
            <th className="py-1.5 px-3 text-left text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400 w-2/5">Test</th>
            <th className="py-1.5 px-3 text-center text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400 w-1/5">Result</th>
            <th className="py-1.5 px-3 text-center text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400 w-1/5">Range</th>
            <th className="py-1.5 px-3 text-center text-[9px] font-black uppercase tracking-wider text-gray-500 dark:text-zinc-400 w-1/5">Units</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, i) => (
            <LabResultRow key={i} {...row} />
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ─── PATIENT CASES PANEL (TURBO EDITION) ─────────────────────────────────────

function PanelPatientCases({ activeDoc, settings, setNotes, setExams, currentPage }) {
  const [status, setStatus] = useState({ loading: false, msg: '', err: false });
  const [cases, setCases] = useState(null);
  const [selectedCase, setSelectedCase] = useState(null);
  const [startPage, setStartPage] = useState(currentPage);
  const [endPage, setEndPage] = useState(Math.min(currentPage + 4, activeDoc?.totalPages || currentPage));
  const [caseCount, setCaseCount] = useState(5);

  useEffect(() => {
    setStartPage(currentPage);
    setEndPage(Math.min(currentPage + 4, activeDoc?.totalPages || currentPage));
  }, [currentPage, activeDoc?.totalPages]);

  const handleGenerate = async () => {
    setStatus({ loading: true, msg: 'Indexing context...', err: false });
    setCases(null);
    setSelectedCase(null);
    
    try {
      const pdfData = await getPdfData(activeDoc.id);
      const pagesText = pdfData?.pagesText || {};
      let text = '';
      for (let i = Number(startPage); i <= Number(endPage); i++) {
        if (pagesText[i]) text += `[Page ${i}]\n${pagesText[i]}\n\n`;
      }
      if (!text.trim() || text.length < 20) throw new Error("Not enough readable text found on selected pages.");

      setStatus({ loading: true, msg: `TURBO MODE ACTIVATED: Spawning ${caseCount} cases in parallel...`, err: false });

      const CHUNK_SIZE = 2; 
      const numChunks = Math.ceil(caseCount / CHUNK_SIZE);
      const taskFunctions = [];

      for (let i = 0; i < numChunks; i++) {
        const countForChunk = (i === numChunks - 1 && caseCount % CHUNK_SIZE !== 0) ? caseCount % CHUNK_SIZE : CHUNK_SIZE;
        
        const prompt = `You are an elite medical educator and attending physician. Based ONLY on the diseases, conditions, or clinical concepts described in the following text, generate EXACTLY ${countForChunk} highly realistic, advanced clinical patient cases.

For each case, you MUST provide:
1. A comprehensive, LONG patient vignette. It must read like an advanced USMLE Step 2/3 question. Include Age, Sex, Chief Complaint, extensive History of Present Illness (HPI), Past Medical History (PMH), Review of Systems (ROS), Vitals, and detailed Physical Exam (PE) findings.
2. Extensive laboratory panels. YOU MUST GENERATE EXACTLY 15 LAB ROWS PER CASE. Do not use code comments or shortcuts. Output the full real lab data.
3. A high-quality multiple choice question based on the vignette.

Use this EXACT JSON format (NO COMMENTS inside JSON, ONLY REAL DATA):
{
  "cases": [
    {
      "id": "unique_id_here",
      "title": "Case Title (Disease Name)",
      "vignette": "Detailed, long patient vignette text here...",
      "diagnosis": "Primary diagnosis",
      "keyFindings": ["finding 1", "finding 2", "finding 3"],
      "labPanels": [
        {
          "panelName": "Complete Blood Count",
          "rows": [
            { "test": "WBC", "result": "12.5", "flag": "H", "range": "4.5-11.0", "units": "K/uL" },
            { "test": "Hgb", "result": "10.2", "flag": "L", "range": "13.5-17.5", "units": "g/dL" }
          ]
        },
        {
          "panelName": "Basic Metabolic Panel",
          "rows": [
            { "test": "Sodium", "result": "138", "flag": "", "range": "135-145", "units": "mEq/L" }
          ]
        }
      ],
      "examQuestion": {
        "q": "Based on the presentation and labs, what is the most likely diagnosis?",
        "options": ["Option A", "Option B", "Option C", "Option D", "Option E"],
        "correct": 0,
        "explanation": "Detailed explanation of why this is correct and others are wrong."
      }
    }
  ]
}

CRITICAL: You MUST supply at least 15 valid JSON objects inside the "rows" arrays across the "labPanels" for EACH case. NEVER USE "// comments" IN THE JSON.

DOCUMENT TEXT:
${text}`;

        taskFunctions.push(() => callAI(prompt, true, false, settings.apiKey, 16384));
      }

      const CONCURRENCY_LIMIT = 5; 
      let allGeneratedCases = [];
      
      for (let i = 0; i < taskFunctions.length; i += CONCURRENCY_LIMIT) {
        const batch = taskFunctions.slice(i, i + CONCURRENCY_LIMIT);
        const batchResults = await Promise.allSettled(batch.map(fn => fn()));
        
        for (const res of batchResults) {
          if (res.status === 'fulfilled') {
            try {
              let cleaned = res.value.replace(/```json/gi, '').replace(/```/g, '').trim();
              const firstBrace = cleaned.indexOf('{');
              const lastBrace = cleaned.lastIndexOf('}');
              if (firstBrace !== -1 && lastBrace !== -1) cleaned = cleaned.substring(firstBrace, lastBrace + 1);
              const parsed = JSON.parse(cleaned);
              if (parsed.cases && Array.isArray(parsed.cases)) {
                allGeneratedCases = [...allGeneratedCases, ...parsed.cases];
              }
            } catch(err) { console.warn("A chunk failed to parse", err); }
          }
        }
        if (i + CONCURRENCY_LIMIT < taskFunctions.length) {
           setStatus({ loading: true, msg: `Compiling cases... (${allGeneratedCases.length} done)`, err: false });
        }
      }

      if (allGeneratedCases.length === 0) throw new Error("Failed to generate any cases. Check your API key or text selection.");
      
      allGeneratedCases = allGeneratedCases.slice(0, caseCount);
      
      setCases(allGeneratedCases);
      setStatus({ loading: false, msg: `Turbo Generated ${allGeneratedCases.length} advanced patient cases.`, err: false });
    } catch (e) {
      console.error(e);
      setStatus({ loading: false, msg: e.message || "Generation failed.", err: true });
    }
  };

  const saveAllAsNotes = () => {
    if (!cases) return;
    const newNotes = cases.map((c, i) => {
      const content = [
        `PATIENT VIGNETTE\n${c.vignette}`,
        `\nDIAGNOSIS: ${c.diagnosis}`,
        `\nKEY FINDINGS:\n${c.keyFindings.map(f => `• ${f}`).join('\n')}`,
        ...(c.labPanels || []).map(panel =>
          `\n${panel.panelName.toUpperCase()}\n` +
          panel.rows.map(r => `${r.test}: ${r.result}${r.flag ? ` (${r.flag})`: ''} | Range: ${r.range} ${r.units}`).join('\n')
        ),
        `\nQUESTION:\n${c.examQuestion?.q}\nAnswer: ${c.examQuestion?.options[c.examQuestion?.correct]}\nExplanation: ${c.examQuestion?.explanation}`
      ].join('\n');
      
      return {
        id: Date.now().toString() + i,
        docId: activeDoc.id,
        title: `Patient Case: ${c.title}`,
        content
      };
    });
    
    setNotes(prev => [...prev, ...newNotes]);
    alert(`Successfully saved ${newNotes.length} cases to your Clinical Notes Vault!`);
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
      questions: questions
    };
    
    setExams(prev => [...prev, newExam]);
    alert(`Successfully created a new Exam block with ${questions.length} case questions and lab tables!`);
  };

  if (selectedCase) {
    return (
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 pb-[100px] md:pb-6">
        <button onClick={() => setSelectedCase(null)} className="flex items-center gap-2 text-[var(--accent-color)] text-xs font-black uppercase tracking-widest mb-5 hover:gap-3 transition-all">
          <ChevronLeft size={16} /> Back to List
        </button>

        <div className="bg-gradient-to-br from-[var(--accent-color)]/10 to-purple-500/10 border border-[var(--accent-color)]/20 rounded-2xl p-5 mb-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div>
              <span className="text-[9px] font-black uppercase tracking-widest text-[var(--accent-color)] bg-[var(--accent-color)]/15 px-2.5 py-1 rounded-lg mb-2 inline-block">Primary Diagnosis</span>
              <h2 className="text-lg font-black text-gray-800 dark:text-white">{selectedCase.title}</h2>
              <p className="text-sm font-bold text-[var(--accent-color)]">{selectedCase.diagnosis}</p>
            </div>
          </div>
          <p className="text-sm text-gray-800 dark:text-zinc-200 leading-relaxed bg-white/60 dark:bg-black/30 p-5 rounded-xl whitespace-pre-wrap shadow-sm border border-white/40 dark:border-white/5">{selectedCase.vignette}</p>
        </div>

        {selectedCase.labPanels && selectedCase.labPanels.length > 0 && (
          <div className="mb-6">
             <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-3 flex items-center gap-2">
              <FlaskConical size={14} /> Laboratory Results
             </h3>
            {selectedCase.labPanels.map((panel, pi) => (
              <div key={pi} className="mb-4">
                <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 dark:text-zinc-500 mb-2 pl-1">{panel.panelName}</h4>
                <LabTable rows={panel.rows} />
              </div>
            ))}
          </div>
        )}

        <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800/30 rounded-2xl p-5 mb-4">
          <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 mb-3 flex items-center gap-2">
            <CheckSquare size={14} /> Associated Exam Question
          </h3>
          <p className="text-sm font-bold text-gray-800 dark:text-white mb-4">{selectedCase.examQuestion.q}</p>
          <div className="space-y-2 mb-4">
            {selectedCase.examQuestion.options.map((opt, i) => (
              <div key={i} className={`text-xs p-3 rounded-xl border ${i === selectedCase.examQuestion.correct ? 'bg-emerald-500/20 border-emerald-500 text-emerald-800 dark:text-emerald-300 font-bold' : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400'}`}>
                <span className="font-mono text-gray-400 mr-2">{String.fromCharCode(65+i)}.</span>{opt}
              </div>
            ))}
          </div>
          <div className="bg-white/50 dark:bg-black/20 p-3 rounded-xl border border-emerald-200/50 dark:border-emerald-800/50">
             <span className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500 block mb-1">Explanation</span>
             <p className="text-xs text-gray-700 dark:text-zinc-300 leading-relaxed">{selectedCase.examQuestion.explanation}</p>
          </div>
        </div>

      </div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 pb-[100px] md:pb-6">
      <div className="flex items-center gap-3 mb-5">
        <div className="w-10 h-10 rounded-xl bg-rose-500/15 flex items-center justify-center relative overflow-hidden">
          <Zap size={20} className="text-rose-500 relative z-10" />
          {status.loading && <div className="absolute inset-0 bg-rose-500/20 animate-pulse"></div>}
        </div>
        <div>
          <h2 className="text-base font-black text-gray-800 dark:text-white flex items-center gap-2">Turbo Case Generator</h2>
          <p className="text-[10px] text-gray-500 dark:text-zinc-400 font-medium">Generate massive case blocks instantly</p>
        </div>
      </div>

      {!cases && (
        <div className="bg-white/80 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800 rounded-2xl p-5 mb-4 shadow-sm">
          
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-800 dark:text-white mb-4 flex justify-between items-center bg-gray-50 dark:bg-zinc-950 p-3 rounded-xl border border-gray-200 dark:border-zinc-800">
            <span>Target Volume</span>
            <span className="text-rose-600 bg-rose-500/10 px-3 py-1 rounded-lg border border-rose-500/20 text-xs">{caseCount} Cases</span>
          </label>
          <input type="range" min="1" max="100" value={caseCount} onChange={e => setCaseCount(parseInt(e.target.value))} className="w-full accent-rose-500 mb-8" />

          <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500 mb-3 block">Extraction Range</label>
          <div className="flex items-center gap-3">
            <div className="flex-1">
              <label className="text-[9px] text-gray-400 dark:text-zinc-600 font-bold mb-1.5 block">From Page</label>
              <input type="number" min={1} max={activeDoc?.totalPages || 1} value={startPage} onChange={e => setStartPage(Number(e.target.value))}
                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-center text-gray-800 dark:text-white font-mono font-bold text-sm outline-none focus:border-[var(--accent-color)] transition-all" />
            </div>
            <span className="text-gray-300 dark:text-zinc-700 font-bold mt-5">→</span>
            <div className="flex-1">
              <label className="text-[9px] text-gray-400 dark:text-zinc-600 font-bold mb-1.5 block">To Page</label>
              <input type="number" min={1} max={activeDoc?.totalPages || 1} value={endPage} onChange={e => setEndPage(Number(e.target.value))}
                className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-center text-gray-800 dark:text-white font-mono font-bold text-sm outline-none focus:border-[var(--accent-color)] transition-all" />
            </div>
          </div>
        </div>
      )}

      {!cases && (
        <div className="bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/30 rounded-xl p-4 mb-4">
          <div className="flex items-start gap-2.5">
            <Info size={14} className="text-blue-500 mt-0.5 shrink-0" />
            <div>
              <p className="text-xs font-bold text-blue-700 dark:text-blue-400 mb-1">What this generates</p>
              <p className="text-xs text-blue-600 dark:text-blue-500 leading-relaxed">Based on diseases in your document, creates realistic patient vignettes with complete lab panels (CBC, BMP, and disease-specific tests) in table format with flags for abnormal values.</p>
            </div>
          </div>
        </div>
      )}

      {!cases && (
        <button onClick={handleGenerate} disabled={status.loading}
          className="w-full py-4 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all shadow-lg shadow-rose-600/25 flex items-center justify-center gap-2.5">
          {status.loading ? <Loader2 size={18} className="animate-spin" /> : <Zap size={18} fill="currentColor"/>}
          {status.loading ? "Running Parallel Extraction..." : "Ignite Turbo Generation"}
        </button>
      )}

      {status.msg && (
        <div className={`mt-4 p-4 rounded-xl text-xs font-bold flex items-center gap-3 border ${status.err ? 'bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 border-red-200 dark:border-red-800/30' : 'bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/30'}`}>
          {status.loading ? <Loader2 size={16} className="animate-spin" /> : status.err ? <AlertCircle size={16} /> : <CheckCircle2 size={16} />}
          {status.msg}
        </div>
      )}

      {cases && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xs font-black uppercase tracking-widest text-gray-600 dark:text-zinc-400 flex items-center gap-2">
              <CheckCircle2 size={14} className="text-emerald-500" /> {cases.length} Cases Ready
            </h3>
            <button onClick={() => { setCases(null); setStatus({ loading: false, msg: '', err: false }); }}
              className="text-[10px] font-bold text-gray-400 dark:text-zinc-500 hover:text-red-500 uppercase tracking-widest flex items-center gap-1">
              <X size={12} /> Clear
            </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-6 bg-gray-50 dark:bg-zinc-900/50 p-3 rounded-2xl border border-gray-200 dark:border-zinc-800">
             <button onClick={saveAllAsNotes} className="flex flex-col items-center justify-center gap-1.5 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl hover:border-blue-500 hover:text-blue-500 transition-colors group shadow-sm">
                <BookA size={18} className="text-blue-500 group-hover:scale-110 transition-transform"/>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-600 dark:text-zinc-300 group-hover:text-blue-500">Save to Notes</span>
             </button>
             <button onClick={saveAllAsExam} className="flex flex-col items-center justify-center gap-1.5 py-3 bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 rounded-xl hover:border-emerald-500 hover:text-emerald-500 transition-colors group shadow-sm">
                <GraduationCap size={18} className="text-emerald-500 group-hover:scale-110 transition-transform"/>
                <span className="text-[9px] font-black uppercase tracking-widest text-gray-600 dark:text-zinc-300 group-hover:text-emerald-500">Create Exam</span>
             </button>
          </div>

          <div className="space-y-3">
            {cases.map((c, i) => (
              <button key={c.id || i} onClick={() => setSelectedCase(c)}
                className="w-full text-left bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 hover:border-rose-400 dark:hover:border-rose-600 rounded-2xl p-4 transition-all group shadow-sm hover:shadow-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="w-6 h-6 rounded-full bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 text-[10px] font-black flex items-center justify-center shrink-0">{i + 1}</span>
                      <span className="text-[9px] font-black uppercase tracking-widest text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-lg truncate">{c.diagnosis}</span>
                    </div>
                    <h3 className="text-sm font-black text-gray-800 dark:text-white mb-1.5 truncate">{c.title}</h3>
                    <p className="text-xs text-gray-500 dark:text-zinc-500 line-clamp-2 leading-relaxed">{c.vignette}</p>
                  </div>
                  <ChevronRight size={16} className="text-gray-300 dark:text-zinc-600 group-hover:text-rose-400 group-hover:translate-x-0.5 transition-all mt-1 shrink-0" />
                </div>
                <div className="mt-3 pt-3 border-t border-gray-100 dark:border-zinc-800 flex items-center gap-2 flex-wrap">
                  <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 dark:bg-emerald-900/20 px-2 py-1 rounded-md border border-emerald-100 dark:border-emerald-800">
                    Includes Exam Q
                  </span>
                  <span className="text-[9px] font-bold text-gray-400 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded-md border border-gray-200 dark:border-zinc-700">
                    {c.labPanels?.reduce((acc, p) => acc + (p.rows?.length || 0), 0) || 0} Labs
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── MAIN APP ────────────────────────────────────────────────────────────────

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
  const [menuPos, setMenuPos] = useState({x:0, y:0});
  const [selectedText, setSelectedText] = useState('');
  const [genFromSelection, setGenFromSelection] = useState('');

  // Drag to Resize State
  const [aiWidth, setAiWidth] = useState(700); 
  const [isResizing, setIsResizing] = useState(false);

  useEffect(() => {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) { meta = document.createElement('meta'); meta.name = "viewport"; document.head.appendChild(meta); }
    meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover";
  }, []);

  // Load state from IndexedDB
  useEffect(() => {
    const loadData = async () => {
      try {
        const savedDocs = await getAppState('docs');
        const savedCards = await getAppState('flashcards');
        const savedExams = await getAppState('exams');
        const savedNotes = await getAppState('notes');
        const savedChats = await getAppState('chats');
        const savedSettings = await getAppState('settings');
        const savedOpen = await getAppState('openDocs');
        const savedPages = await getAppState('docPages');

        if (savedDocs) setDocuments(savedDocs);
        if (savedCards) setFlashcards(savedCards);
        if (savedExams) setExams(savedExams);
        if (savedNotes) setNotes(savedNotes);
        if (savedChats) setChatSessions(savedChats);
        if (savedSettings) setUserSettings(savedSettings);
        if (savedOpen) setOpenDocs(savedOpen);
        if (savedPages) setDocPages(savedPages);
      } catch (e) { 
        console.warn("Storage read error", e); 
      } finally {
        setIsLoaded(true);
      }
    };
    loadData();
  }, []);

  // Save state to IndexedDB
  useEffect(() => {
    if (!isLoaded) return;
    const saveData = async () => {
      try {
        const docsToSave = documents.map(d => { const copy = { ...d }; delete copy.pagesText; return copy; });
        await saveAppState('docs', docsToSave);
        await saveAppState('flashcards', flashcards);
        await saveAppState('exams', exams);
        await saveAppState('notes', notes);
        await saveAppState('chats', chatSessions);
        await saveAppState('settings', userSettings);
        await saveAppState('openDocs', openDocs);
        await saveAppState('docPages', docPages);
      } catch (e) { console.warn("Storage write error", e); }
    };
    saveData();
  }, [documents, flashcards, exams, notes, chatSessions, userSettings, openDocs, docPages, isLoaded]);

  const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = userSettings.theme === 'dark' || (userSettings.theme === 'system' && prefersDark);
  const fontSizeMap = { small: '14px', medium: '16px', large: '18px', xl: '20px', xxl: '24px', xxxl: '28px' };

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) { root.classList.add('dark'); root.style.setProperty('color-scheme', 'dark'); }
    else { root.classList.remove('dark'); root.style.setProperty('color-scheme', 'light'); }
  }, [isDark]);

  useEffect(() => { document.documentElement.style.fontSize = fontSizeMap[userSettings.fontSize] || '16px'; }, [userSettings.fontSize]);

  useEffect(() => {
    const colors = { indigo: { hex: '#6366f1', rgb: '99, 102, 241' }, purple: { hex: '#a855f7', rgb: '168, 85, 247' }, blue: { hex: '#3b82f6', rgb: '59, 130, 246' } };
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
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

  // Drag to Resize Logic (Fixes PC + Touch Support)
  useEffect(() => {
    const handleMove = (e) => {
      if (!isResizing) return;
      const clientX = e.touches ? e.touches[0].clientX : e.clientX;
      let newWidth = window.innerWidth - clientX;
      newWidth = Math.max(300, Math.min(newWidth, window.innerWidth - 300));
      setAiWidth(newWidth);
    };
    const handleUp = () => {
      if (isResizing) setIsResizing(false);
    };
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
        } catch (e) { pagesText[i] = ""; }
        setUploadProgress(50 + Math.floor((i / totalPages) * 40));
      }
      
      try { await loadingTask.destroy(); } catch(e) {}

      const id = Date.now().toString();
      const newDoc = { id, name: file.name, totalPages, progress: 1, addedAt: new Date().toISOString() };
      await savePdfData(id, { buffer: arrayBuffer, pagesText });
      
      setDocuments(prev => [...prev, newDoc]);
      setOpenDocs(prev => prev.includes(id) ? prev : [...prev, id]);
      setActiveDocId(id);
      setDocPages(prev => ({...prev, [id]: 1}));
      setCurrentView('reader');
      setRightPanelTab('generate');
      setRightPanelOpen(true);
    } catch (error) { 
        console.error(error); 
        alert("Upload Failed. The file might be corrupted or too large.");
    }
    finally { setIsUploading(false); setUploadProgress(0); if(event.target) event.target.value = ''; }
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
  };

  const activeDoc = documents.find(d => d.id === activeDocId);
  const filteredDocuments = searchQuery ? documents.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase())) : documents;

  if (!isLoaded) {
    return (
      <div className="flex flex-col h-screen w-screen items-center justify-center bg-gray-50 dark:bg-[#0a0a0c]">
        <Loader2 className="w-10 h-10 animate-spin text-blue-500 mb-4" />
        <span className="text-xs font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500">Loading Local Vault</span>
      </div>
    );
  }

  return (
    <>
      <style>{`
        :root { --bg-root: ${isDark ? '#050505' : '#f9fafb'}; --text-main: ${isDark ? '#e4e4e7' : '#1f2937'}; } 
        html, body, #root { 
          margin: 0 !important; 
          padding: 0 !important; 
          width: 100vw !important; 
          height: 100dvh !important;
          overflow: hidden !important; 
          background-color: var(--bg-root); 
          color: var(--text-main); 
          font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif; 
          text-align: left !important;
        } 
        * { -webkit-tap-highlight-color: transparent; box-sizing: border-box; } 
        .custom-scrollbar::-webkit-scrollbar { width: 4px; } 
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; } 
        .custom-scrollbar::-webkit-scrollbar-thumb { background: rgba(128,128,128,0.2); border-radius: 2px; } 
        .pdf-text-layer { position: absolute; inset: 0; overflow: hidden; opacity: 1; line-height: 1; } 
        .pdf-text-layer span { position: absolute; color: transparent; transform-origin: 0% 0%; white-space: pre; cursor: text; } 
        .pdf-text-layer ::selection { background: rgba(var(--accent-color-rgb), 0.3); }
        canvas { width: 100% !important; height: auto !important; display: block; }
      `}</style>
      <div className="flex flex-col md:flex-row h-full w-full overflow-hidden relative">
        
        <nav className="fixed bottom-4 left-1/2 -translate-x-1/2 w-[calc(100%-2rem)] max-w-md h-[76px] z-[100] bg-white/80 dark:bg-[#121214]/80 backdrop-blur-xl border border-gray-200/50 dark:border-zinc-800/80 rounded-[2.5rem] shadow-[0_10px_40px_rgba(0,0,0,0.1)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.7)] flex flex-row items-center justify-around px-2 md:relative md:transform-none md:left-0 md:bottom-0 md:w-24 md:h-full md:max-w-none md:z-40 md:bg-white md:dark:bg-[#0a0a0c] md:border-y-0 md:border-l-0 md:border-r md:border-gray-200/50 md:dark:border-zinc-800/50 md:rounded-none md:flex-col md:justify-start md:pt-8 md:pb-6 md:px-0 md:shadow-2xl">
          <div className="hidden md:flex w-14 h-14 rounded-[1.25rem] bg-[var(--accent-color)] items-center justify-center shadow-xl shadow-[var(--accent-color)]/40 mb-10 cursor-pointer transition-transform hover:scale-105" onClick={() => { setCurrentView('library'); }}>
            <BrainCircuit className="text-white w-7 h-7" />
          </div>
          <div className="flex-1 flex flex-row md:flex-col gap-1 md:gap-6 w-full items-center justify-around md:justify-start px-2 md:px-0">
            <SidebarBtn icon={BookOpen} label="Library" active={currentView === 'library'} onClick={() => setCurrentView('library')} />
            <SidebarBtn icon={Layers} label="Cards" active={currentView === 'flashcards'} onClick={() => setCurrentView('flashcards')} />
            <SidebarBtn icon={GraduationCap} label="Exams" active={currentView === 'exams'} onClick={() => setCurrentView('exams')} />
            <SidebarBtn icon={MessageSquare} label="Chat" active={currentView === 'chat'} onClick={() => setCurrentView('chat')} />
            {activeDocId && (
              <>
                <div className="hidden md:block w-10 h-px bg-gray-200 dark:bg-zinc-800 mx-auto my-1" />
                <SidebarBtn icon={BookOpen} label="Reader" active={currentView === 'reader'} onClick={() => setCurrentView('reader')} highlight />
              </>
            )}
            <SidebarBtn icon={Settings} label="Settings" active={currentView === 'settings'} onClick={() => setCurrentView('settings')} className="md:hidden" />
          </div>
          <div className="hidden md:block mt-auto pt-4 border-t border-gray-200 dark:border-zinc-800/30 w-full px-2">
            <SidebarBtn icon={Settings} label="Settings" active={currentView === 'settings'} onClick={() => setCurrentView('settings')} />
          </div>
          {!online && <div className="absolute -top-6 right-4 md:bottom-2 md:top-auto bg-red-500/20 text-red-500 font-bold px-2 py-1 rounded-lg text-[10px] uppercase shadow-sm">Offline</div>}
        </nav>

        <main className="flex-1 flex flex-col relative bg-gray-50 dark:bg-[#0a0a0c] min-w-0 h-full overflow-hidden">
          {isUploading && (
            <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-200 dark:bg-zinc-800 z-50">
              <div className="h-full bg-[var(--accent-color)] transition-all duration-300 shadow-[0_0_15px_var(--accent-color)]" style={{ width: `${uploadProgress}%` }}></div>
            </div>
          )}
          
          {/* Prevent invisible elements from eating clicks during resize */}
          {isResizing && <div className="absolute inset-0 z-[200] cursor-col-resize" />}

          <div className={currentView === 'library' ? "flex-1 overflow-y-auto h-full" : "hidden"}>
            <LibraryView documents={filteredDocuments} onUpload={handleFileUpload} onOpen={(id) => { setOpenDocs(prev => prev.includes(id) ? prev : [...prev, id]); setActiveDocId(id); setCurrentView('reader'); }} isUploading={isUploading} deleteDocument={deleteDocument} flashcards={flashcards} exams={exams} notes={notes} setView={setCurrentView} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
          </div>
          
          <div className={currentView === 'flashcards' ? "flex-1 overflow-y-auto h-full" : "hidden"}>
            <FlashcardsGlobalView flashcards={flashcards} setFlashcards={setFlashcards} setView={setCurrentView} />
          </div>

          <div className={currentView === 'exams' ? "flex-1 overflow-y-auto h-full" : "hidden"}>
            <ExamsGlobalView exams={exams} setExams={setExams} setView={setCurrentView} />
          </div>

          <div className={currentView === 'chat' ? "flex-1 h-full" : "hidden"}>
            <ChatGlobalView documents={documents} settings={userSettings} chatSessions={chatSessions} setChatSessions={setChatSessions} />
          </div>

          <div className={currentView === 'settings' ? "flex-1 overflow-y-auto h-full p-4 md:p-10 custom-scrollbar pb-[140px] md:pb-10" : "hidden"}>
            <div className="max-w-3xl mx-auto">
              <h1 className="text-3xl md:text-4xl font-black text-gray-800 dark:text-white tracking-tighter mb-8 flex items-center gap-4"><Settings className="text-[var(--accent-color)]"/> System Settings</h1>
              <PanelSettings settings={userSettings} setSettings={setUserSettings} />
            </div>
          </div>

          <div className={currentView === 'reader' && activeDocId ? "flex-1 flex flex-col h-full overflow-hidden" : "hidden"}>
            {activeDocId && (
              <PdfWorkspace activeDoc={activeDoc} setDocuments={setDocuments} closeDoc={() => { closeDoc(activeDocId); setCurrentView('library'); }} rightPanelOpen={rightPanelOpen} setRightPanelOpen={setRightPanelOpen} currentPage={docPages[activeDocId] || 1} setCurrentPage={(updater) => { setDocPages(prev => { const oldVal = prev[activeDocId] || 1; const newVal = typeof updater === 'function' ? updater(oldVal) : updater; return {...prev, [activeDocId]: newVal}; }); }} openDocs={openDocs} setActiveDocId={setActiveDocId} closeTab={closeDoc} setShowMenu={setShowMenu} setMenuPos={setMenuPos} setSelectedText={setSelectedText} setGenFromSelection={setGenFromSelection} setRightPanelTab={setRightPanelTab} documents={documents} settings={userSettings} setSettings={setUserSettings} isResizing={isResizing} />
            )}
          </div>
          
          {activeDocId && currentView === 'reader' && !rightPanelOpen && (
            <button onClick={() => setRightPanelOpen(true)} className="md:hidden absolute bottom-[100px] right-6 p-4 bg-[var(--accent-color)] rounded-full text-white shadow-2xl hover:scale-105 transition-transform z-30">
              <Sparkles size={24} />
            </button>
          )}
        </main>

        {/* CUSTOM SPLITTER - Added standard Touch Event Triggers */}
        {activeDocId && currentView === 'reader' && rightPanelOpen && (
          <div
            className="flex w-2 hover:w-3 cursor-col-resize bg-gray-200 dark:bg-zinc-800 hover:bg-[var(--accent-color)] dark:hover:bg-[var(--accent-color)] items-center justify-center shrink-0 z-[120]"
            onMouseDown={(e) => { e.preventDefault(); setIsResizing(true); }}
            onTouchStart={(e) => { setIsResizing(true); }}
            style={{
              transition: isResizing ? 'none' : 'background-color 0.2s, width 0.2s',
              backgroundColor: isResizing ? 'var(--accent-color)' : '',
              width: isResizing ? '8px' : ''
            }}
          >
            <div className="w-0.5 h-16 bg-gray-400 dark:bg-zinc-500 rounded-full pointer-events-none" />
          </div>
        )}

        {/* Dynamic Width AI Tools Aside */}
        {activeDocId && currentView === 'reader' && (
          <aside
            style={ typeof window !== 'undefined' && window.innerWidth > 768 && rightPanelOpen ? { width: `${aiWidth}px` } : {} }
            className={`fixed inset-0 z-[110] flex flex-col md:relative w-full bg-white/95 dark:bg-[#0a0a0c]/95 backdrop-blur-2xl border-t md:border-t-0 md:border-l border-gray-200 dark:border-zinc-800/50 shrink-0 md:z-20 shadow-[-20px_0_40px_rgba(0,0,0,0.1)] dark:shadow-[-20px_0_40px_rgba(0,0,0,0.8)] ${isResizing ? 'transition-none' : 'transition-transform duration-300'} ease-in-out ${rightPanelOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0 md:hidden'}`}
          >
            <div className="bg-[var(--accent-color)] px-5 py-4 md:py-3 flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center gap-3">
                <Target size={18} className="text-white"/>
                <span className="text-sm md:text-xs font-bold text-white uppercase tracking-widest">Target: Page {docPages[activeDocId] || 1}</span>
              </div>
              <button onClick={() => setRightPanelOpen(false)} className="md:hidden text-white/80 hover:text-white p-1 rounded-lg bg-white/10"><X size={24} /></button>
            </div>
            <div className="h-16 flex p-2 bg-gray-50/50 dark:bg-[#0a0a0c]/50 border-b border-gray-200 dark:border-zinc-800/30 shrink-0 gap-1 items-center overflow-x-auto">
              <PanelTab active={rightPanelTab === 'generate'} onClick={() => setRightPanelTab('generate')} label="AI Studio" icon={Sparkles} />
              <PanelTab active={rightPanelTab === 'cases'} onClick={() => setRightPanelTab('cases')} label="Cases" icon={Zap} highlight />
              <PanelTab active={rightPanelTab === 'chat'} onClick={() => setRightPanelTab('chat')} label="Chat" icon={MessageSquare} />
              <PanelTab active={rightPanelTab === 'review'} onClick={() => setRightPanelTab('review')} label="Vault" icon={Layers} />
              <PanelTab active={rightPanelTab === 'settings'} onClick={() => setRightPanelTab('settings')} label="Key" icon={KeyRound} />
            </div>
            
            {/* Disable pointer events during drag to prevent iframe/scroll hitching */}
            <div className="flex-1 overflow-hidden relative flex flex-col min-h-0" style={{ pointerEvents: isResizing ? 'none' : 'auto' }}>
              {rightPanelTab === 'settings' ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 pb-[100px] md:pb-6">
                  <PanelSettings settings={userSettings} setSettings={setUserSettings} />
                </div>
              ) : !userSettings.apiKey?.trim() ? (
                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 flex flex-col items-center justify-center text-center pb-[100px] md:pb-6">
                  <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6"><AlertCircle className="w-12 h-12 text-red-500" /></div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">OpenAI Key Required</h2>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 mb-8 leading-relaxed max-w-sm">You must connect your OpenAI API key to unlock the elite AI extraction and generation tools.</p>
                  <button onClick={() => setRightPanelTab('settings')} className="px-8 py-4 bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/90 transition-colors text-white rounded-xl text-sm font-bold shadow-lg shadow-[var(--accent-color)]/25">Connect API Key</button>
                </div>
              ) : rightPanelTab === 'generate' ? (
                <PanelGenerate activeDoc={activeDoc} settings={userSettings} setFlashcards={setFlashcards} setExams={setExams} setNotes={setNotes} switchToReview={() => setRightPanelTab('review')} genFromSelection={genFromSelection} setGenFromSelection={setGenFromSelection} currentPage={docPages[activeDocId] || 1} />
              ) : rightPanelTab === 'cases' ? (
                <PanelPatientCases activeDoc={activeDoc} settings={userSettings} setNotes={setNotes} setExams={setExams} currentPage={docPages[activeDocId] || 1} />
              ) : rightPanelTab === 'chat' ? (
                <PanelChat activeDoc={activeDoc} settings={userSettings} currentPage={docPages[activeDocId] || 1} />
              ) : rightPanelTab === 'review' ? (
                <PanelReview activeDocId={activeDocId} flashcards={flashcards} setFlashcards={setFlashcards} exams={exams} setExams={setExams} notes={notes} setNotes={setNotes} />
              ) : null}
            </div>
          </aside>
        )}

        {showShortcuts && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-[120] backdrop-blur-sm" onClick={() => setShowShortcuts(false)}>
            <div className="bg-white dark:bg-zinc-900 p-8 md:p-10 rounded-3xl max-w-md w-full shadow-2xl m-4" onClick={e=>e.stopPropagation()}>
              <h2 className="text-xl md:text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800 dark:text-white"><HelpCircle className="text-[var(--accent-color)]"/> Keyboard Shortcuts</h2>
              <ul className="space-y-4 text-sm text-gray-600 dark:text-zinc-300">
                <li className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-2"><span>Arrow Left / Right</span><kbd className="bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded font-mono text-xs font-bold">Change Page</kbd></li>
                <li className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-2"><span>Zoom In</span><kbd className="bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded font-mono text-xs font-bold">Ctrl +</kbd></li>
                <li className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-2"><span>Zoom Out</span><kbd className="bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded font-mono text-xs font-bold">Ctrl -</kbd></li>
                <li className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-2"><span>Show Help</span><kbd className="bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded font-mono text-xs font-bold">?</kbd></li>
                <li className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-2"><span>Close Modal</span><kbd className="bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded font-mono text-xs font-bold">Esc</kbd></li>
              </ul>
              <button onClick={() => setShowShortcuts(false)} className="mt-8 w-full py-4 bg-[var(--accent-color)] text-white font-bold tracking-widest uppercase text-xs rounded-xl shadow-lg">Dismiss</button>
            </div>
          </div>
        )}
        {showMenu && (
          <div className="fixed inset-0 z-[120]" onClick={() => setShowMenu(false)}>
            <div className="absolute bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 rounded-2xl shadow-2xl p-2 min-w-[200px]" style={{left: menuPos.x, top: menuPos.y}}>
              <button onClick={() => { setShowMenu(false); setGenFromSelection(selectedText); setRightPanelOpen(true); setRightPanelTab('generate'); }} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-xl w-full text-left text-sm font-bold text-[var(--accent-color)] transition-colors">
                <Sparkles size={18} /> Generate from Text
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

// ─── SIDEBAR BTN ─────────────────────────────────────────────────────────────
function SidebarBtn({ icon: Icon, label, active, onClick, highlight, className = '' }) {
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 transition-all group w-[72px] h-[60px] md:w-full md:h-auto md:py-3 rounded-[1.25rem] md:rounded-none ${active && !highlight ? 'bg-black/5 dark:bg-white/10 md:bg-transparent' : ''} ${className}`}>
      <div className={`flex items-center justify-center transition-all ${active ? highlight ? 'text-[var(--accent-color)] md:bg-[var(--accent-color)] md:text-white md:w-14 md:h-14 md:rounded-[1.25rem] md:shadow-xl md:shadow-[var(--accent-color)]/40 md:scale-105' : 'text-gray-900 dark:text-white md:bg-gray-200 md:dark:bg-zinc-800 md:w-14 md:h-14 md:rounded-[1.25rem] md:shadow-lg md:scale-105' : 'text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white md:bg-transparent md:w-14 md:h-14 md:rounded-[1.25rem] md:hover:bg-gray-100 md:dark:hover:bg-zinc-800/80'}`}>
        <Icon size={24} className="w-[22px] h-[22px] md:w-6 md:h-6" strokeWidth={active ? 2.5 : 2} />
      </div>
      <span className={`text-[10px] md:text-[9px] font-semibold md:font-bold md:uppercase tracking-wide md:tracking-widest transition-all text-center leading-none mt-0.5 md:mt-0 ${active ? highlight ? 'text-[var(--accent-color)]' : 'text-gray-900 dark:text-white' : 'text-gray-500 dark:text-zinc-400 group-hover:text-gray-900 dark:group-hover:text-white'}`}>{label}</span>
    </button>
  );
}

// ─── PANEL TAB ────────────────────────────────────────────────────────────────
function PanelTab({ active, onClick, label, icon: Icon, highlight }) {
  return (
    <button onClick={onClick} className={`flex-1 flex flex-col items-center justify-center gap-1 h-full rounded-xl text-[9px] font-black uppercase tracking-widest transition-all whitespace-nowrap px-1 min-w-0 ${ active ? highlight ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30' : 'bg-white dark:bg-zinc-800/90 text-[var(--accent-color)] shadow-sm border border-gray-200 dark:border-zinc-700' : highlight ? 'text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-900/20' : 'text-gray-500 dark:text-zinc-500 hover:text-gray-800 dark:hover:text-zinc-300 hover:bg-gray-100/50 dark:hover:bg-zinc-900/50' }`}>
      <Icon size={14} /> {label}
    </button>
  );
}

// ─── LIBRARY VIEW ────────────────────────────────────────────────────────────
function LibraryView({ documents, onUpload, onOpen, isUploading, deleteDocument, flashcards, exams, notes, setView, searchQuery, setSearchQuery }) {
  const totalCardsCount = flashcards.reduce((sum, set) => sum + (set.cards ? set.cards.length : 0), 0);
  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 lg:p-16 custom-scrollbar bg-transparent pb-[140px] md:pb-16">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-8 md:mb-16 gap-6">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-gray-800 dark:text-white tracking-tighter mb-2 md:mb-4 flex items-center gap-3 md:gap-4">Intelligence <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] to-purple-500">Nexus</span></h1>
            <p className="text-gray-500 dark:text-zinc-400 text-sm md:text-lg max-w-2xl leading-relaxed">Your secure, local medical knowledge base. Upload materials and let the elite AI extract exams, notes, and cards seamlessly.</p>
          </div>
          <label className={`cursor-pointer w-full lg:w-auto justify-center bg-white dark:bg-zinc-100 text-zinc-950 hover:bg-gray-100 dark:hover:bg-zinc-200 px-6 md:px-8 py-4 md:py-5 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest flex items-center gap-3 md:gap-4 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
            {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
            {isUploading ? "PROCESSING..." : "IMPORT LOCAL PDF"}
            <input type="file" accept="application/pdf" className="hidden" onChange={onUpload} disabled={isUploading} />
          </label>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-16">
          <div onClick={() => setView('chat')} className="cursor-pointer hover:-translate-y-1 transition-all bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-gray-200 dark:border-zinc-800/60 p-5 md:p-8 rounded-2xl md:rounded-[2rem] flex items-center gap-4 md:gap-6 shadow-md hover:shadow-lg">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0"><MessageSquare size={24} /></div>
            <div><p className="text-2xl md:text-4xl font-black text-gray-800 dark:text-white">Smart</p><p className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mt-1 md:mt-2">Global AI Chat</p></div>
          </div>
          <div onClick={() => setView('flashcards')} className="cursor-pointer hover:-translate-y-1 transition-all bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-gray-200 dark:border-zinc-800/60 p-5 md:p-8 rounded-2xl md:rounded-[2rem] flex items-center gap-4 md:gap-6 shadow-md hover:shadow-lg">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0"><Layers size={24} /></div>
            <div><p className="text-2xl md:text-4xl font-black text-gray-800 dark:text-white">{totalCardsCount}</p><p className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mt-1 md:mt-2">Active Flashcards</p></div>
          </div>
          <div onClick={() => setView('exams')} className="cursor-pointer hover:-translate-y-1 transition-all bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-gray-200 dark:border-zinc-800/60 p-5 md:p-8 rounded-2xl md:rounded-[2rem] flex items-center gap-4 md:gap-6 shadow-md hover:shadow-lg">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl md:rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0"><GraduationCap size={24} /></div>
            <div><p className="text-2xl md:text-4xl font-black text-gray-800 dark:text-white">{exams.length}</p><p className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mt-1 md:mt-2">Strict Exams</p></div>
          </div>
        </div>
        {documents.length > 0 && (
          <div className="mb-10 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" size={20}/>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search documents..." className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl pl-16 pr-6 py-4 md:py-5 text-sm md:text-base font-bold text-gray-800 dark:text-white outline-none focus:border-[var(--accent-color)] shadow-sm transition-colors" />
          </div>
        )}
        {documents.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-zinc-800/80 rounded-[2rem] md:rounded-[3rem] bg-white/50 dark:bg-zinc-900/20 backdrop-blur-sm p-12 md:p-32 text-center shadow-inner">
            <div className="w-24 h-24 md:w-40 md:h-40 bg-gray-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-10 shadow-lg"><FileUp size={48} className="text-gray-400 dark:text-zinc-600" /></div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white mb-3 md:mb-4">Repository Empty</h2>
            <p className="text-gray-500 dark:text-zinc-400 text-sm md:text-lg max-w-xl mx-auto leading-relaxed">Import a textbook, research paper, or clinical guide to begin.</p>
          </div>
        ) : (
          <div>
            <h3 className="text-lg md:text-xl font-black text-gray-800 dark:text-white mb-6 md:mb-8 flex items-center gap-3 uppercase tracking-widest"><Library size={24} className="text-[var(--accent-color)]"/> Local Documents</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-8">
              {documents.map(doc => {
                const docCards = flashcards.filter(f => f.docId === doc.id).reduce((sum, set) => sum + (set.cards?set.cards.length:0), 0);
                const docExams = exams.filter(e => e.docId === doc.id).length;
                return (
                  <div key={doc.id} onClick={() => onOpen(doc.id)} className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl rounded-[1.5rem] md:rounded-[2rem] p-6 md:p-8 border border-gray-200 dark:border-zinc-800 hover:border-[var(--accent-color)]/50 hover:shadow-[0_20px_60px_rgba(var(--accent-color-rgb),0.15)] cursor-pointer transition-all flex flex-col h-60 md:h-72 group relative overflow-hidden shadow-lg">
                    <div className="absolute top-0 right-0 w-32 h-32 md:w-40 md:h-40 bg-[var(--accent-color)]/5 rounded-bl-full -z-10 group-hover:bg-[var(--accent-color)]/10 transition-colors" />
                    <div className="flex items-start justify-between mb-6 md:mb-8 z-10">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gray-100 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 flex items-center justify-center text-gray-400 dark:text-zinc-500 group-hover:bg-[var(--accent-color)] group-hover:text-white group-hover:border-[var(--accent-color)] transition-all shadow-md"><BookOpen size={24} /></div>
                      <button onClick={(e) => deleteDocument(doc.id, e)} className="p-2 md:p-3 bg-gray-100 dark:bg-zinc-950/50 text-gray-500 dark:text-zinc-500 hover:text-red-500 hover:bg-red-500/20 rounded-xl transition-all opacity-100 md:opacity-0 group-hover:opacity-100 backdrop-blur-sm"><Trash2 size={18} /></button>
                    </div>
                    <h3 className="font-black text-gray-800 dark:text-white text-base md:text-xl leading-snug line-clamp-2 flex-1 z-10">{doc.name}</h3>
                    <div className="mt-4 pt-4 md:pt-6 border-t border-gray-200 dark:border-zinc-800/80 z-10">
                      <div className="flex justify-between items-center">
                        <div className="flex gap-2">
                          <span className="text-[8px] md:text-[10px] font-bold text-gray-600 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-950 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800">{docCards} Cards</span>
                          <span className="text-[8px] md:text-[10px] font-bold text-gray-600 dark:text-zinc-400 bg-gray-100 dark:bg-zinc-950 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-gray-200 dark:border-zinc-800">{docExams} Exams</span>
                        </div>
                        <span className="text-[10px] md:text-xs font-black text-[var(--accent-color)] bg-[var(--accent-color)]/10 px-2 md:px-3 py-1 md:py-1.5 rounded-lg border border-[var(--accent-color)]/20">PG {doc.progress}/{doc.totalPages}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── FLASHCARDS GLOBAL VIEW ──────────────────────────────────────────────────
function FlashcardsGlobalView({ flashcards, setFlashcards, setView }) {
  const [studyingSet, setStudyingSet] = useState(null);
  const exportAnki = () => {
    const allCards = flashcards.flatMap(set => set.cards || []);
    if(allCards.length === 0) return;
    const csvContent = 'Front,Back\n' + allCards.map(f => `"${f.q.replace(/"/g, '""')}","${f.a.replace(/"/g, '""')}"`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a'); link.href = url; link.download = 'flashcards.csv'; link.click();
    URL.revokeObjectURL(url);
  };
  if (studyingSet) return <div className="flex-1 overflow-hidden h-full"><InPanelFlashcards title={studyingSet.title} initialCards={studyingSet.cards} onBack={() => setStudyingSet(null)} setFlashcards={setFlashcards} /></div>;
  if (flashcards.length === 0) return <div className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full"><Layers size={80} className="text-gray-300 dark:text-zinc-800 mb-6" /><h2 className="text-2xl font-black text-gray-800 dark:text-white mb-2">No Flashcards</h2><button onClick={() => setView('library')} className="mt-6 px-8 py-3 bg-[var(--accent-color)] text-white rounded-xl font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all">Go to Library</button></div>;
  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar pb-[140px] md:pb-16">
      <div className="max-w-5xl mx-auto">
        <div className="flex justify-between items-center mb-8 gap-4">
          <h1 className="text-3xl font-black text-gray-800 dark:text-white flex items-center gap-3"><Layers className="text-emerald-500"/> Flashcard Vault</h1>
          <div className="flex gap-3">
            <button onClick={exportAnki} className="px-5 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 shadow-lg text-xs uppercase tracking-widest"><Download size={16}/> Export</button>
            <button onClick={() => setStudyingSet({ id:'all', title:'All Cards', cards: flashcards.flatMap(s=>s.cards||[]) })} className="px-6 py-3 bg-[var(--accent-color)] text-white rounded-xl font-black flex items-center gap-2 shadow-lg text-xs uppercase tracking-widest"><Play size={16} fill="currentColor"/> Study All</button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {flashcards.map(set => (
            <div key={set.id} className="bg-white/80 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800 p-6 rounded-3xl shadow-lg flex flex-col">
              <p className="text-xl font-black text-gray-800 dark:text-white mb-2">{set.title}</p>
              <div className="flex gap-2 mb-6"><span className="text-[10px] font-black text-[var(--accent-color)] bg-[var(--accent-color)]/10 px-3 py-1.5 rounded-lg border border-[var(--accent-color)]/20">{set.cards?.length||0} Cards</span></div>
              <div className="flex gap-3 mt-auto">
                <button onClick={() => setStudyingSet(set)} className="flex-1 py-3 bg-[var(--accent-color)] text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2"><Play size={14} fill="currentColor"/> Study</button>
                <button onClick={() => setFlashcards(flashcards.filter(f=>f.id!==set.id))} className="p-3 bg-gray-100 dark:bg-zinc-950 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl"><Trash2 size={18}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── EXAMS GLOBAL VIEW ───────────────────────────────────────────────────────
function ExamsGlobalView({ exams, setExams, setView }) {
  const [selectedExam, setSelectedExam] = useState(null);
  if (selectedExam) return <div className="flex-1 flex flex-col h-full overflow-hidden"><div className="h-16 flex items-center justify-between px-6 bg-white/90 dark:bg-[#121214]/90 border-b border-gray-200 dark:border-zinc-800 shrink-0"><button onClick={() => setSelectedExam(null)} className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-widest bg-emerald-500/10 px-4 py-2 rounded-xl border border-emerald-500/20"><ChevronLeft size={18}/> Exit</button></div><div className="flex-1 overflow-hidden relative"><InPanelExam exam={selectedExam} onBack={() => setSelectedExam(null)}/></div></div>;
  if (exams.length === 0) return <div className="flex-1 flex flex-col items-center justify-center p-6 text-center h-full"><GraduationCap size={80} className="text-gray-300 dark:text-zinc-800 mb-6"/><h2 className="text-2xl font-black text-gray-800 dark:text-white mb-2">No Exams</h2><button onClick={() => setView('library')} className="mt-6 px-8 py-3 bg-[var(--accent-color)] text-white rounded-xl font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all">Go to Library</button></div>;
  return (
    <div className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar pb-[140px] md:pb-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-black text-gray-800 dark:text-white mb-8 flex items-center gap-3"><GraduationCap className="text-emerald-500"/> Examination Vault</h1>
        <div className="space-y-4">
          {exams.map(e => (
            <div key={e.id} className="bg-white/80 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800 p-6 rounded-[2rem] flex flex-col sm:flex-row justify-between sm:items-center gap-4 shadow-sm hover:border-emerald-500/30 transition-all">
              <div><p className="text-xl font-black text-gray-800 dark:text-white mb-2">{e.title}</p><span className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20">{e.questions.length} Questions</span></div>
              <div className="flex gap-3">
                <button onClick={() => setSelectedExam(e)} className="px-6 py-3 bg-emerald-600 text-white rounded-xl font-black text-xs uppercase tracking-widest flex items-center gap-2"><Play size={16} fill="currentColor"/> Take</button>
                <button onClick={() => setExams(exams.filter(ex=>ex.id!==e.id))} className="p-3 bg-gray-100 dark:bg-zinc-950 text-gray-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl"><Trash2 size={18}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── CHAT GLOBAL VIEW (NEW GEMINI/ADVANCED CHAT PAGE) ────────────────────────
function ChatGlobalView({ documents, settings, chatSessions, setChatSessions }) {
  const [activeSessionId, setActiveSessionId] = useState(null);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [selectedDocId, setSelectedDocId] = useState("none");
  const endRef = useRef(null);

  const activeSession = chatSessions.find(s => s.id === activeSessionId) || null;

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [activeSession?.messages, loading]);

  const createNewChat = () => {
    setActiveSessionId(null);
    setInput("");
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const sessionId = activeSessionId || Date.now().toString();
    const isNew = !activeSessionId;
    const msg = input;
    setInput("");
    
    let currentMessages = isNew ? [] : chatSessions.find(s => s.id === sessionId)?.messages || [];
    currentMessages = [...currentMessages, { role: 'user', content: msg }];
    
    let docIdToUse = isNew ? (selectedDocId !== "none" ? selectedDocId : null) : chatSessions.find(s => s.id === sessionId)?.docId;
    const newTitle = isNew ? msg.substring(0, 30) + "..." : chatSessions.find(s => s.id === sessionId)?.title;

    setChatSessions(prev => {
      const exists = prev.find(s => s.id === sessionId);
      if (exists) return prev.map(s => s.id === sessionId ? { ...s, messages: currentMessages } : s);
      return [{ id: sessionId, title: newTitle, messages: currentMessages, docId: docIdToUse }, ...prev];
    });
    
    if (isNew) setActiveSessionId(sessionId);
    setLoading(true);

    try {
      let contextText = "";
      if (docIdToUse) {
        const pdfData = await getPdfData(docIdToUse);
        if (pdfData && pdfData.pagesText) {
          contextText = Object.entries(pdfData.pagesText).slice(0, 30).map(([p, t]) => `[Page ${p}] ${t}`).join('\n').substring(0, 60000);
        }
      }

      const prompt = contextText ? `DOCUMENT CONTEXT:\n${contextText}\n\nUSER QUESTION:\n${msg}` : msg;
      const res = await callAI(prompt, false, false, settings.apiKey, 16384);
      
      setChatSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages: [...s.messages, { role: 'assistant', content: res }] } : s));
    } catch (e) {
      setChatSessions(prev => prev.map(s => s.id === sessionId ? { ...s, messages: [...s.messages, { role: 'assistant', content: `⚠️ Error: ${e.message}` }] } : s));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex h-full w-full bg-white dark:bg-[#0a0a0c]">
      <div className="hidden md:flex w-72 flex-col border-r border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-[#121214]">
        <div className="p-4 border-b border-gray-200 dark:border-zinc-800">
          <button onClick={createNewChat} className="w-full flex items-center justify-center gap-2 bg-[var(--accent-color)] text-white py-3 rounded-xl font-bold text-sm shadow-md hover:bg-[var(--accent-color)]/90 transition-colors">
            <PlusCircle size={18} /> New Chat
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2">
          {chatSessions.length === 0 && <div className="text-center p-4 text-xs font-bold text-gray-400 uppercase tracking-widest mt-4">No History</div>}
          {chatSessions.map(session => (
            <div key={session.id} className="relative group mb-1">
              <button onClick={() => setActiveSessionId(session.id)} className={`w-full text-left p-3 rounded-xl text-sm transition-colors ${activeSessionId === session.id ? 'bg-[var(--accent-color)]/10 text-[var(--accent-color)] font-bold' : 'text-gray-600 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800'}`}>
                <div className="truncate pr-6">{session.title}</div>
              </button>
              <button onClick={() => setChatSessions(prev => prev.filter(s => s.id !== session.id))} className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg hover:bg-red-500/10"><Trash size={14}/></button>
            </div>
          ))}
        </div>
      </div>

      <div className="flex-1 flex flex-col h-full relative">
        <div className="h-16 border-b border-gray-200 dark:border-zinc-800 bg-white/95 dark:bg-[#0a0a0c]/95 flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-[var(--accent-color)]/10 text-[var(--accent-color)] flex items-center justify-center"><Bot size={18}/></div>
            <span className="font-bold text-gray-800 dark:text-white">Smart Global Chat</span>
          </div>
          {!activeSessionId && (
            <select value={selectedDocId} onChange={e => setSelectedDocId(e.target.value)} className="bg-gray-50 dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 text-gray-800 dark:text-zinc-300 text-xs font-bold rounded-lg px-3 py-1.5 outline-none max-w-[150px] md:max-w-xs truncate">
              <option value="none">No Document Attached</option>
              {documents.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          )}
          {activeSessionId && activeSession?.docId && (
            <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-color)] bg-[var(--accent-color)]/10 px-2 py-1 rounded-md flex items-center gap-1"><BookOpen size={12}/> Document Attached</span>
          )}
        </div>

        <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-8 pb-[100px] md:pb-[140px] flex flex-col">
          {!activeSession ? (
            <div className="flex-1 flex flex-col items-center justify-center text-center opacity-70">
              <Sparkles size={64} className="text-gray-300 dark:text-zinc-700 mb-6" />
              <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-2">How can I help you today?</h2>
              <p className="text-gray-500 max-w-sm">Attach a document above to ground the AI in specific clinical text, or chat globally for elite medical insights.</p>
            </div>
          ) : (
            <div className="max-w-3xl mx-auto w-full space-y-6">
              {activeSession.messages.map((m, i) => (
                <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-[var(--accent-color)]' : 'bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 shadow-sm'}`}>
                    {m.role === 'user' ? <UserCircle2 size={18} className="text-white"/> : <BrainCircuit size={18} className="text-[var(--accent-color)]"/>}
                  </div>
                  <div className={`p-5 text-sm leading-relaxed shadow-sm ${m.role === 'user' ? 'bg-[var(--accent-color)] text-white rounded-[1.5rem] rounded-tr-sm max-w-[80%]' : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[1.5rem] rounded-tl-sm text-gray-700 dark:text-zinc-300 w-full whitespace-pre-wrap'}`}>
                    {m.content}
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center justify-center"><Loader2 size={18} className="text-[var(--accent-color)] animate-spin"/></div>
                  <div className="p-5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-[1.5rem] rounded-tl-sm flex gap-1.5 items-center"><span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span><span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay:'0.15s'}}></span><span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay:'0.3s'}}></span></div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>

       <div className="shrink-0 w-full px-4 md:px-0 pb-[100px] md:pb-6 pt-2 bg-transparent z-20">
  <div className="max-w-3xl mx-auto bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl shadow-[0_10px_40px_rgba(0,0,0,0.05)] dark:shadow-[0_10px_40px_rgba(0,0,0,0.5)] focus-within:border-[var(--accent-color)] focus-within:ring-2 focus-within:ring-[var(--accent-color)]/20 transition-all p-2 relative">
    <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleSend();}}} placeholder="Ask anything, anytime..." disabled={loading} className="w-full bg-transparent p-4 pr-16 text-sm text-gray-800 dark:text-white outline-none resize-none max-h-40 custom-scrollbar" style={{minHeight:'60px'}}/>
    <button onClick={handleSend} disabled={loading||!input.trim()} className="absolute right-4 bottom-4 p-3 bg-[var(--accent-color)] disabled:bg-gray-200 dark:disabled:bg-zinc-800 rounded-xl text-white disabled:text-gray-400 transition-all hover:scale-105 active:scale-95"><Send size={18}/></button>
  </div>
</div>

      </div>
    </div>
  );
}

// ─── PDF WORKSPACE (PERFECT RENDERING ENGINE) ────────────────────────────────
function PdfWorkspace({ activeDoc, setDocuments, closeDoc, rightPanelOpen, setRightPanelOpen, currentPage, setCurrentPage, openDocs, setActiveDocId, closeTab, setShowMenu, setMenuPos, setSelectedText, setGenFromSelection, setRightPanelTab, documents, settings, setSettings, isResizing }) {
  const [pdf, setPdf] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [pageDims, setPageDims] = useState({ w: 0, h: 0 }); 
  const [scaleMultiplier, setScaleMultiplier] = useState(1); 
  const [resizeTrigger, setResizeTrigger] = useState(0); 

  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const textLayerRef = useRef(null);
  const renderTaskRef = useRef(null);
  const [localPage, setLocalPage] = useState(currentPage);

  useEffect(() => { setLocalPage(currentPage); }, [currentPage]);

  useEffect(() => {
    if (!isResizing) {
      setResizeTrigger(prev => prev + 1);
    }
  }, [isResizing]);
  
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
        
        const padding = 0; 
        const tempViewport = page.getViewport({ scale: 1 });
        const baseScale = (containerWidth - padding) / tempViewport.width;
        
        const finalScale = Math.min(Math.max(baseScale * scaleMultiplier, 0.5), 5.0);
        const viewport = page.getViewport({ scale: finalScale });
        
        if (isMounted) {
          setPageDims({ w: viewport.width, h: viewport.height });
        }

        const canvas = canvasRef.current;
        if (canvas) {
          const pixelRatio = window.devicePixelRatio || 1;
          
          canvas.width = Math.floor(viewport.width * pixelRatio);
          canvas.height = Math.floor(viewport.height * pixelRatio);

          const renderContext = {
            canvasContext: canvas.getContext('2d'),
            viewport: viewport,
            transform: [pixelRatio, 0, 0, pixelRatio, 0, 0]
          };

          if (renderTaskRef.current) {
             renderTaskRef.current.cancel();
          }
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
      if (e.key === 'ArrowLeft') handleNav(-1); 
      else if (e.key === 'ArrowRight') handleNav(1); 
      else if (e.ctrlKey && (e.key === '=' || e.key === '+')) {
        e.preventDefault();
        setScaleMultiplier(prev => Math.min(prev + 0.15, 4));
      } else if (e.ctrlKey && e.key === '-') {
        e.preventDefault();
        setScaleMultiplier(prev => Math.max(prev - 0.15, 0.4));
      }
    };
    
    document.addEventListener('keydown', handleKeyDown, { passive: false });
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeDoc.totalPages, localPage]);

  const handleNav = (dir) => {
    const next = Math.max(1, Math.min(activeDoc.totalPages, localPage + dir));
    if (next !== localPage) {
      setLocalPage(next); setCurrentPage(next);
      setDocuments(prev => prev.map(doc => doc.id === activeDoc.id ? {...doc, progress: next} : doc));
      if (containerRef.current) containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleContextMenu = (e) => {
    const sel = window.getSelection().toString().trim();
    if (sel) { e.preventDefault(); setSelectedText(sel); setMenuPos({x:e.pageX, y:e.pageY}); setShowMenu(true); }
  };

  const handleZoomIn = () => setScaleMultiplier(s => Math.min(s + 0.25, 3));
  const handleZoomOut = () => setScaleMultiplier(s => Math.max(s - 0.25, 0.5));
  const handleZoomReset = () => setScaleMultiplier(1);

  const fontSizes = ['small', 'medium', 'large', 'xl', 'xxl', 'xxxl'];
  const adjustFont = (dir) => {
    const currentIdx = fontSizes.indexOf(settings.fontSize || 'medium');
    const newIdx = Math.max(0, Math.min(fontSizes.length - 1, currentIdx + dir));
    setSettings({...settings, fontSize: fontSizes[newIdx]});
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-100 dark:bg-[#050505] relative" onContextMenu={handleContextMenu}>
      {/* Top Header with Zoom Engine */}
      <div className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 bg-white/95 dark:bg-[#0a0a0c]/95 backdrop-blur-xl border-b border-gray-200 dark:border-zinc-800/30 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
          <button onClick={closeDoc} className="flex items-center gap-1 md:gap-2 text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white text-xs font-black uppercase tracking-widest bg-gray-100 dark:bg-zinc-900 px-3 py-1.5 rounded-xl"><ChevronLeft size={16}/> <span className="hidden sm:inline">Back</span></button>
          <div className="w-px h-6 bg-gray-300 dark:bg-zinc-800"></div>
          <span className="text-sm font-bold text-gray-800 dark:text-zinc-200 truncate max-w-[150px] md:max-w-md">{activeDoc.name}</span>
        </div>
        
        <div className="flex items-center">
          <div className="hidden md:flex items-center gap-1 bg-gray-100 dark:bg-zinc-900 p-1 rounded-xl border border-gray-200 dark:border-zinc-800 mr-3">
            <button onClick={() => adjustFont(-1)} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1" title="Decrease Font"><Type size={14}/><Minus size={10} className="inline -mt-2"/></button>
            <button onClick={() => adjustFont(1)} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors flex items-center gap-1" title="Increase Font"><Type size={16}/><Plus size={10} className="inline -mt-2"/></button>
          </div>

          <div className="flex items-center gap-1 bg-gray-100 dark:bg-zinc-900 p-1 rounded-xl border border-gray-200 dark:border-zinc-800 mr-2 md:mr-4">
            <button onClick={handleZoomOut} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors" title="Zoom Out"><ZoomOut size={16}/></button>
            <button onClick={handleZoomReset} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors" title="Fit to Width"><Maximize size={16}/></button>
            <button onClick={handleZoomIn} className="p-2 text-gray-500 hover:text-gray-900 dark:hover:text-white rounded-lg hover:bg-gray-200 dark:hover:bg-zinc-800 transition-colors" title="Zoom In"><ZoomIn size={16}/></button>
          </div>

          <button onClick={() => setRightPanelOpen(!rightPanelOpen)} className={`p-2 md:p-2.5 rounded-xl border transition-all ${rightPanelOpen ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white' : 'bg-gray-100 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'}`}>
            {rightPanelOpen ? <PanelRightClose size={18}/> : <PanelRightOpen size={18}/>}
          </button>
        </div>
      </div>

      {/* Internal Tabs */}
      {openDocs.length > 1 && (
        <div className="flex gap-2 px-4 py-2 bg-white/95 dark:bg-[#0a0a0c]/95 border-b border-gray-200 dark:border-zinc-800/30 overflow-x-auto custom-scrollbar shrink-0">
          {openDocs.map(id => {
            const doc = documents.find(d => d.id === id);
            if (!doc) return null;
            return (
              <div key={id} className={`flex items-center gap-2 px-3 py-1.5 rounded-lg cursor-pointer font-bold text-[9px] uppercase tracking-widest ${activeDocId === id ? 'bg-[var(--accent-color)] text-white' : 'bg-gray-100 dark:bg-zinc-900 text-gray-500 hover:bg-gray-200'}`} onClick={() => setActiveDocId(id)}>
                <span className="truncate max-w-[100px]">{doc.name}</span>
                <button onClick={(e) => { e.stopPropagation(); closeTab(id); }} className="p-1 rounded hover:bg-white/20"><X size={10}/></button>
              </div>
            );
          })}
        </div>
      )}

      {/* Core Viewer Area */}
      {/* Core Viewer Area */}
<div ref={containerRef} className="flex-1 min-h-0 overflow-auto bg-gray-200 dark:bg-[#121214] block relative custom-scrollbar p-0 m-0">

        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 text-gray-500 dark:text-zinc-500 min-h-[50vh]"><Loader2 className="animate-spin text-[var(--accent-color)]" size={32}/><span className="text-xs font-black tracking-[0.2em] uppercase">Rendering Viewer...</span></div>
        ) : pdf ? (
          <div 
            className="relative shadow-xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.8)] bg-white shrink-0 origin-top-left m-0 p-0" 
            style={{ width: pageDims.w ? `${pageDims.w}px` : '100%', height: pageDims.h ? `${pageDims.h}px` : 'auto' }}
          >
            <canvas ref={canvasRef} className="block m-0 p-0" />
            <div ref={textLayerRef} className="pdf-text-layer" />
          </div>
        ) : (
          <div className="m-auto text-red-500 text-sm flex items-center gap-2 bg-red-50 dark:bg-red-500/10 p-6 rounded-2xl border border-red-200 dark:border-red-500/20 font-bold min-h-[50vh] mt-10 w-fit"><AlertCircle size={16}/> Failed to load PDF cache. Please re-import.</div>
        )}
      </div>

      {/* Static Navigation Bar Below PDF */}
      <div className="py-3 md:h-[72px] flex items-center justify-center gap-6 bg-white dark:bg-[#0a0a0c] border-t border-gray-200 dark:border-zinc-800/50 shrink-0 z-20 w-full pb-[100px] md:pb-0">
        <button onClick={() => handleNav(-1)} className="p-3 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-white rounded-[1rem] transition-colors border border-gray-200 dark:border-zinc-700 shadow-sm"><ChevronLeft size={20}/></button>
        <span className="px-4 font-bold text-gray-800 dark:text-white font-mono tracking-widest text-sm whitespace-nowrap">PG <span className="text-[var(--accent-color)]">{localPage}</span> / {activeDoc.totalPages}</span>
        <button onClick={() => handleNav(1)} className="p-3 bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/90 text-white rounded-[1rem] transition-colors shadow-md shadow-[var(--accent-color)]/30"><ChevronRight size={20}/></button>
      </div>
    </div>
  );
}

// ─── PANEL SETTINGS ──────────────────────────────────────────────────────────
function PanelSettings({ settings, setSettings }) {
  const fontSizes = ['small', 'medium', 'large', 'xl', 'xxl', 'xxxl'];
  
  const adjustFont = (dir) => {
    const currentIdx = fontSizes.indexOf(settings.fontSize || 'medium');
    const newIdx = Math.max(0, Math.min(fontSizes.length - 1, currentIdx + dir));
    setSettings({...settings, fontSize: fontSizes[newIdx]});
  };

  return (
    <div className="flex flex-col gap-6 w-full max-w-2xl mx-auto pb-10">
      
      {/* Global Font Size Control */}
      <div className="bg-white/80 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800 p-6 rounded-[2rem] shadow-sm">
        <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-3 mb-4"><Type size={20} className="text-[var(--accent-color)]"/> Global App Text Size</h3>
        <div className="flex items-center justify-between bg-gray-50 dark:bg-zinc-950 p-2 rounded-2xl border border-gray-200 dark:border-zinc-800">
          <button onClick={() => adjustFont(-1)} className="p-4 text-gray-500 hover:text-[var(--accent-color)] hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-xl transition-all shadow-sm active:scale-95"><Minus size={22} strokeWidth={3}/></button>
          <div className="flex flex-col items-center">
            <span className="font-black text-lg text-gray-800 dark:text-white uppercase tracking-widest">{settings.fontSize}</span>
          </div>
          <button onClick={() => adjustFont(1)} className="p-4 text-gray-500 hover:text-[var(--accent-color)] hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-xl transition-all shadow-sm active:scale-95"><Plus size={22} strokeWidth={3}/></button>
        </div>
      </div>

      <div className="bg-[var(--accent-color)]/5 dark:bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/20 p-6 rounded-[2rem] shadow-lg">
        <h3 className="text-lg font-black text-[var(--accent-color)] flex items-center gap-3 mb-4"><KeyRound size={20}/> OpenAI API Key</h3>
        <input type="password" value={settings.apiKey} onChange={(e) => setSettings({...settings, apiKey: e.target.value})} placeholder="sk-proj-..." className="w-full bg-white dark:bg-[#050505] border border-gray-200 dark:border-[var(--accent-color)]/50 rounded-2xl px-5 py-4 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] font-mono shadow-inner mb-4 transition-all"/>
        <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-xs text-[var(--accent-color)] font-bold uppercase tracking-widest flex items-center gap-1">Get Key <ChevronRight size={12}/></a>
      </div>
      
      <div className="bg-white/80 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800 p-6 rounded-[2rem]">
        <label className="flex items-start gap-4 cursor-pointer">
          <input type="checkbox" checked={settings.strictMode} onChange={(e) => setSettings({...settings, strictMode: e.target.checked})} className="mt-1 w-5 h-5 border-2 border-gray-300 dark:border-zinc-600 rounded accent-[var(--accent-color)]"/>
          <div><span className="text-base font-bold text-gray-800 dark:text-white block">Strict Document Grounding</span><span className="text-sm text-gray-500 dark:text-zinc-400 mt-1 block leading-relaxed">Forces AI to use only the text from the PDF. Zero hallucinations.</span></div>
        </label>
      </div>

      <div className="bg-white/80 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800 p-6 rounded-[2rem]">
        <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-3 mb-4"><Moon size={20}/> Theme</h3>
        <div className="flex gap-3">
          {['system','dark','light'].map(t => <button key={t} onClick={() => setSettings({...settings, theme: t})} className={`flex-1 py-3 rounded-2xl font-bold uppercase tracking-widest text-xs transition-all ${settings.theme===t ? 'bg-[var(--accent-color)] text-white shadow-md' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200'}`}>{t}</button>)}
        </div>
      </div>
      
      <div className="bg-white/80 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800 p-6 rounded-[2rem]">
        <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-3 mb-4"><Palette size={20}/> Accent Color</h3>
        <div className="flex gap-6 items-center">
          <button onClick={() => setSettings({...settings, accentColor: 'indigo'})} className={`w-12 h-12 rounded-full bg-indigo-500 hover:scale-110 transition-transform ${settings.accentColor==='indigo' ? 'ring-4 ring-offset-4 ring-indigo-500 dark:ring-offset-zinc-900' : ''}`}/>
          <button onClick={() => setSettings({...settings, accentColor: 'purple'})} className={`w-12 h-12 rounded-full bg-purple-500 hover:scale-110 transition-transform ${settings.accentColor==='purple' ? 'ring-4 ring-offset-4 ring-purple-500 dark:ring-offset-zinc-900' : ''}`}/>
          <button onClick={() => setSettings({...settings, accentColor: 'blue'})} className={`w-12 h-12 rounded-full bg-blue-500 hover:scale-110 transition-transform ${settings.accentColor==='blue' ? 'ring-4 ring-offset-4 ring-blue-500 dark:ring-offset-zinc-900' : ''}`}/>
        </div>
      </div>
    </div>
  );
}

// ─── PANEL GENERATE (TURBO EDITION) ──────────────────────────────────────────
function PanelGenerate({ activeDoc, settings, setFlashcards, setExams, setNotes, switchToReview, genFromSelection, setGenFromSelection, currentPage }) {
  const [startPage, setStartPage] = useState(currentPage);
  const [endPage, setEndPage] = useState(currentPage);
  const [type, setType] = useState('exam');
  const [count, setCount] = useState(25);
  const [difficulty, setDifficulty] = useState(3);
  const [status, setStatus] = useState({ loading: false, msg: '', err: false });
  const [generated, setGenerated] = useState(null);
  const difficultyLevels = ['Hard','Expert','Insane'];

  useEffect(() => { if (!status.loading && !generated && !genFromSelection) { setStartPage(currentPage); setEndPage(currentPage); } }, [currentPage]);

  const handleGenerate = async () => {
    setStatus({ loading: true, msg: 'Indexing medical context...', err: false });
    setGenerated(null);
    try {
      let text = genFromSelection || "";
      if (!genFromSelection) {
        const pdfData = await getPdfData(activeDoc.id);
        const pagesText = pdfData?.pagesText || {};
        for (let i = Number(startPage); i <= Number(endPage); i++) {
          if (pagesText[i]) text += `[Page ${i}]\n${pagesText[i]}\n\n`;
        }
      }
      if (!text.trim() || text.length < 20) throw new Error("Not enough readable text found on these pages.");
      
      const diffPrompt = `Difficulty Level: ${difficultyLevels[difficulty - 1]}. Make output incredibly advanced and detailed.`;
      let resultData = null;

      if (type === 'flashcards' || type === 'exam') {
        setStatus({ loading: true, msg: `TURBO MODE: Extracting ${count} items in parallel...`, err: false });
        
        // PARALLEL BATCHING ENGINE
        const CHUNK_SIZE = 10;
        const numChunks = Math.ceil(count / CHUNK_SIZE);
        const taskFunctions = [];
        
        for (let i = 0; i < numChunks; i++) {
          const countForChunk = (i === numChunks - 1 && count % CHUNK_SIZE !== 0) ? count % CHUNK_SIZE : CHUNK_SIZE;
          const p = `${diffPrompt}\nCreate exactly ${countForChunk} items from this text ONLY.\n\nTEXT:\n${text}`;
          const formatPrompt = type === 'flashcards' ? `\n\nFormat as JSON: { "items": [ {"q": "Question", "a": "Answer"} ] }` : `\n\nFormat as JSON: { "title": "Generated Exam", "items": [ { "q": "Question", "options": ["A","B","C","D","E"], "correct": 0, "explanation": "Explanation" } ] }`;
          taskFunctions.push(() => callAI(p + formatPrompt, true, settings.strictMode, settings.apiKey, 8000));
        }

        const CONCURRENCY_LIMIT = 5;
        let allItems = [];
        
        for (let i = 0; i < taskFunctions.length; i += CONCURRENCY_LIMIT) {
          const batch = taskFunctions.slice(i, i + CONCURRENCY_LIMIT);
          const batchResults = await Promise.allSettled(batch.map(fn => fn()));
          for (const res of batchResults) {
            if (res.status === 'fulfilled') {
              try {
                let cleaned = res.value.replace(/```json/gi,'').replace(/```/g,'').trim();
                const fb = cleaned.indexOf('{'); const lb = cleaned.lastIndexOf('}');
                if (fb !== -1 && lb !== -1) cleaned = cleaned.substring(fb, lb+1);
                const parsed = JSON.parse(cleaned);
                const items = parsed.items || parsed.questions || [];
                allItems = [...allItems, ...items];
              } catch(err) { console.warn("Chunk failed to parse", err); }
            }
          }
          if (i + CONCURRENCY_LIMIT < taskFunctions.length) {
            setStatus({ loading: true, msg: `Compiling items... (${allItems.length} done)`, err: false });
          }
        }
        
        if (allItems.length === 0) throw new Error("AI failed to extract valid items. Try selecting less complex text or checking your API key.");
        
        resultData = { type, title: "Generated Assessment", data: allItems.slice(0, count), pages: genFromSelection ? 'Selection' : `${startPage}-${endPage}` };
      } else {
        setStatus({ loading: true, msg: 'Processing single-pass generation...', err: false });
        const p = `${diffPrompt}\nPerform the following task based ONLY on this medical text.\nTASK: ${type}\nRespond in Markdown.\n\nTEXT:\n${text}`;
        const raw = await callAI(p, false, settings.strictMode, settings.apiKey, 8000);
        const titles = { clinical:'Clinical Case', differential:'Differential Diagnosis', treatment:'Treatment Plan', labs:'Lab Interpretation', eli5:'Simplified Explanation', summary:'Summary', mnemonics:'Mnemonics' };
        resultData = { type: 'summary', data: raw, pages: genFromSelection ? 'Selection' : `${startPage}-${endPage}`, customTitle: titles[type] || type };
      }
      setGenerated(resultData);
      setStatus({ loading: false, msg: 'Turbo Execution Complete.', err: false });
    } catch (e) {
      setStatus({ loading: false, msg: e.message || "Failed.", err: true });
    } finally { setGenFromSelection(''); }
  };

  const saveItem = () => {
    if (!generated) return;
    if (generated.type === 'flashcards') {
      const cards = generated.data.map(c => ({ id: Date.now()+Math.random(), q: c.q, a: c.a, level: 0, nextReview: Date.now(), repetitions: 0, ef: 2.5, interval: 1, lastReview: Date.now() }));
      setFlashcards(p => [...p, { id: Date.now().toString(), docId: activeDoc.id, sourcePages: generated.pages, title: `Flashcards (Pgs ${generated.pages})`, cards }]);
    } else if (generated.type === 'exam') {
      setExams(p => [...p, { id: Date.now().toString(), docId: activeDoc.id, sourcePages: generated.pages, title: generated.title || "Exam", questions: generated.data }]);
    } else {
      setNotes(p => [...p, { id: Date.now().toString(), docId: activeDoc.id, title: `${generated.customTitle || 'Summary'} Pgs ${generated.pages}`, content: generated.data }]);
    }
    setGenerated(null); setStatus({ loading: false, msg: '', err: false }); switchToReview();
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 pb-[100px] md:pb-6">
      {!generated ? (
        <div className="bg-white/80 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800/50 p-5 rounded-[2rem] shadow-lg">
          {!genFromSelection && (
            <div className="flex items-center justify-between mb-6 gap-3">
              <div className="w-full"><label className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2 block">Start Pg</label><input type="number" min={1} max={activeDoc.totalPages} value={startPage} onChange={e=>setStartPage(Number(e.target.value))} className="w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-center text-gray-800 dark:text-white font-mono font-bold outline-none focus:border-[var(--accent-color)] transition-all"/></div>
              <div className="mt-5 text-gray-400 font-bold text-xs uppercase tracking-widest">TO</div>
              <div className="w-full"><label className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-2 block">End Pg</label><input type="number" min={1} max={activeDoc.totalPages} value={endPage} onChange={e=>setEndPage(Number(e.target.value))} className="w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-2xl px-4 py-3 text-center text-gray-800 dark:text-white font-mono font-bold outline-none focus:border-[var(--accent-color)] transition-all"/></div>
            </div>
          )}
          <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-3 block">Extraction Engine</label>
          <div className="grid grid-cols-3 gap-2 mb-6">
            <ToolBtn id="flashcards" active={type} set={setType} icon={Layers} label="Cards"/>
            <ToolBtn id="exam" active={type} set={setType} icon={CheckSquare} label="Exam"/>
            <ToolBtn id="summary" active={type} set={setType} icon={BookA} label="Summary"/>
            <ToolBtn id="clinical" active={type} set={setType} icon={Stethoscope} label="Case"/>
            <ToolBtn id="differential" active={type} set={setType} icon={Activity} label="Diff"/>
            <ToolBtn id="treatment" active={type} set={setType} icon={Pill} label="Treat"/>
            <ToolBtn id="labs" active={type} set={setType} icon={Thermometer} label="Labs"/>
            <ToolBtn id="mnemonics" active={type} set={setType} icon={Lightbulb} label="Mnemonics"/>
            <ToolBtn id="eli5" active={type} set={setType} icon={Baby} label="Simplify"/>
          </div>
          {(type === 'flashcards' || type === 'exam') && (
            <div className="mb-4 bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800">
              <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-3 flex justify-between"><span>Quantity</span><span className="text-[var(--accent-color)]">{count} Items</span></label>
              <input type="range" min="5" max="200" value={count} onChange={e=>setCount(parseInt(e.target.value))} className="w-full accent-[var(--accent-color)]"/>
            </div>
          )}
          <div className="mb-6 bg-white dark:bg-zinc-950 p-4 rounded-2xl border border-gray-200 dark:border-zinc-800">
            <label className="text-[9px] font-black uppercase tracking-widest text-gray-500 mb-3 flex justify-between"><span>Difficulty</span><span className="text-[var(--accent-color)]">{difficultyLevels[difficulty-1]}</span></label>
            <input type="range" min="1" max="3" value={difficulty} onChange={e=>setDifficulty(parseInt(e.target.value))} className="w-full accent-[var(--accent-color)]"/>
          </div>
          <button onClick={handleGenerate} disabled={status.loading} className="w-full py-4 bg-[var(--accent-color)] text-white rounded-2xl text-xs font-black uppercase tracking-widest transition-all shadow-lg disabled:opacity-50 flex items-center justify-center gap-2">
            {status.loading ? <Loader2 size={18} className="animate-spin"/> : <Zap size={18} fill="currentColor"/>}
            {status.loading ? "Running Turbo Extraction..." : "Execute Extraction"}
          </button>
        </div>
      ) : (
        <div className="flex flex-col min-h-0 bg-white dark:bg-zinc-900 border border-emerald-500/30 rounded-3xl overflow-hidden shadow-xl">
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 p-4 flex justify-between items-center">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-2"><CheckCircle2 size={14}/> Output Ready</span>
            <div className="flex gap-2">
              <button onClick={() => setGenerated(null)} className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 rounded-lg text-xs font-bold uppercase tracking-widest">Discard</button>
              <button onClick={saveItem} className="px-5 py-2 bg-emerald-600 text-white rounded-lg text-xs font-black uppercase tracking-widest flex items-center gap-1.5"><Save size={13}/> Save</button>
            </div>
          </div>
          <div className="overflow-y-auto custom-scrollbar p-5 space-y-4">
            {generated.type === 'flashcards' && generated.data.map((item, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 p-5 rounded-2xl">
                <p className="text-sm text-gray-800 dark:text-white font-bold mb-3"><span className="text-gray-400 mr-2 text-xs">Q</span>{item.q}</p>
                <div className="bg-[var(--accent-color)]/5 border border-[var(--accent-color)]/10 p-3 rounded-xl"><p className="text-sm text-[var(--accent-color)]"><span className="opacity-50 mr-2 text-xs">A</span>{item.a}</p></div>
              </div>
            ))}
            {generated.type === 'exam' && generated.data.map((item, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 p-5 rounded-2xl">
                <p className="text-sm text-gray-800 dark:text-white font-bold mb-4"><span className="text-gray-400 mr-2">{idx+1}.</span>{item.q}</p>
                <div className="space-y-2 mb-4">
                  {item.options.map((opt, oIdx) => (
                    <div key={oIdx} className={`text-sm p-3 rounded-xl border ${oIdx===item.correct ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-400 font-bold' : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400'}`}>
                      <span className="font-mono text-gray-400 mr-2">{String.fromCharCode(65+oIdx)}.</span>{opt}
                    </div>
                  ))}
                </div>
                <div className="p-4 bg-[var(--accent-color)]/5 border border-[var(--accent-color)]/10 rounded-xl">
                  <span className="font-black text-[var(--accent-color)] mr-2 text-xs uppercase tracking-widest block mb-2">Explanation</span>
                  <p className="text-sm text-gray-700 dark:text-zinc-300">{item.explanation}</p>
                </div>
              </div>
            ))}
            {generated.type !== 'flashcards' && generated.type !== 'exam' && (
              <div className="bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 p-6 rounded-2xl">
                <div className="text-sm text-gray-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">{generated.data}</div>
              </div>
            )}
          </div>
        </div>
      )}
      {status.msg && !generated && (
        <div className={`mt-4 p-4 rounded-2xl text-xs font-bold flex items-center gap-3 border ${status.err ? 'bg-red-50 dark:bg-red-950/20 text-red-600 border-red-200' : 'bg-[var(--accent-color)]/10 text-[var(--accent-color)] border-[var(--accent-color)]/20'}`}>
          {status.loading ? <Loader2 size={16} className="animate-spin"/> : <AlertCircle size={16}/>}
          {status.msg}
        </div>
      )}
    </div>
  );
}

function ToolBtn({ id, active, set, icon: Icon, label }) {
  const isA = active === id;
  return (
    <button onClick={() => set(id)} className={`py-3 flex flex-col items-center justify-center gap-2 rounded-2xl text-[9px] font-black uppercase tracking-widest border transition-all ${isA ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white shadow-md scale-105' : 'bg-gray-50 dark:bg-zinc-950 border-gray-200 dark:border-zinc-800 text-gray-500 hover:text-gray-800 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}>
      <Icon size={18} className={isA ? "text-white" : "text-gray-400 dark:text-zinc-600"}/> {label}
    </button>
  );
}

// ─── PANEL CHAT ──────────────────────────────────────────────────────────────
function PanelChat({ activeDoc, settings, currentPage }) {
  const [messages, setMessages] = useState([{ role: 'assistant', content: `Hello! I have analyzed the document. You can ask me questions about Page ${currentPage}, or the entire document.` }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [contextMode, setContextMode] = useState('page'); 
  const endRef = useRef(null);

  useEffect(() => { 
    setMessages([{ role: 'assistant', content: `Locked onto **Page ${currentPage}**. Ask anything, or switch to "Full Document" mode.` }]); 
  }, [currentPage]);
  
  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  const handleChat = async () => {
    if (!input.trim() || loading) return;
    const msg = input; setInput(""); setMessages(p => [...p, { role: 'user', content: msg }]); setLoading(true);
    try {
      const pdfData = await getPdfData(activeDoc.id);
      let text = "";
      
      if (contextMode === 'page') {
        text = pdfData?.pagesText?.[currentPage] || "No text found.";
      } else {
        text = Object.entries(pdfData?.pagesText || {}).map(([p, t]) => `[Page ${p}] ${t}`).join('\n').substring(0, 80000); 
      }
      
      const res = await callAI(`CONTEXT:\n${text}\n\nUSER QUESTION:\n${msg}`, false, false, settings.apiKey);
      setMessages(p => [...p, { role: 'assistant', content: res }]);
    } catch (e) { setMessages(p => [...p, { role: 'assistant', content: `⚠️ ${e.message}` }]); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 pb-[100px] md:pb-6 flex flex-col">
      <div className="flex items-center gap-2 mb-4 bg-gray-50 dark:bg-zinc-900 p-1 rounded-xl border border-gray-200 dark:border-zinc-800 shrink-0">
        <button onClick={() => setContextMode('page')} className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-colors ${contextMode === 'page' ? 'bg-[var(--accent-color)] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'}`}>Page {currentPage}</button>
        <button onClick={() => setContextMode('document')} className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-lg transition-colors ${contextMode === 'document' ? 'bg-[var(--accent-color)] text-white shadow-sm' : 'text-gray-500 hover:text-gray-800 dark:hover:text-white'}`}>Full Document</button>
      </div>
      <div className="flex-1 space-y-4 mb-4">
        {messages.map((m,i) => (
          <div key={i} className={`flex gap-3 ${m.role==='user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${m.role==='user' ? 'bg-[var(--accent-color)]' : 'bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700'}`}>{m.role==='user' ? <UserCircle2 size={13} className="text-white"/> : <BrainCircuit size={13} className="text-[var(--accent-color)]"/>}</div>
            <div className={`p-4 max-w-[85%] text-xs leading-relaxed ${m.role==='user' ? 'bg-[var(--accent-color)] text-white rounded-2xl rounded-tr-sm' : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl rounded-tl-sm text-gray-600 dark:text-zinc-300 whitespace-pre-wrap'}`}>{m.content}</div>
          </div>
        ))}
        {loading && <div className="flex gap-3"><div className="w-8 h-8 rounded-xl bg-white dark:bg-zinc-800 border flex items-center justify-center"><Loader2 size={13} className="text-[var(--accent-color)] animate-spin"/></div><div className="p-4 bg-white dark:bg-zinc-900 border rounded-2xl rounded-tl-sm flex gap-1.5 items-center"><span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce"></span><span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay:'0.15s'}}></span><span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{animationDelay:'0.3s'}}></span></div></div>}
        <div ref={endRef}/>
      </div>
      <div className="shrink-0">
        <div className="relative flex items-end bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl focus-within:border-[var(--accent-color)] focus-within:ring-1 focus-within:ring-[var(--accent-color)]/50 transition-all p-1">
          <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault();handleChat();}}} placeholder={`Ask about ${contextMode==='page'?'page '+currentPage:'the document'}...`} disabled={loading} className="w-full bg-transparent p-3 pr-12 text-xs text-gray-800 dark:text-white outline-none resize-none max-h-32 custom-scrollbar" style={{minHeight:'44px'}}/>
          <button onClick={handleChat} disabled={loading||!input.trim()} className="absolute right-2 bottom-2 p-2.5 bg-[var(--accent-color)] disabled:bg-gray-200 dark:disabled:bg-zinc-800 rounded-xl text-white disabled:text-gray-400 transition-all shadow-sm"><Send size={13}/></button>
        </div>
      </div>
    </div>
  );
}

// ─── PANEL REVIEW ────────────────────────────────────────────────────────────
function PanelReview({ activeDocId, flashcards, setFlashcards, exams, setExams, notes, setNotes }) {
  const [activeItem, setActiveItem] = useState(null);
  const docCardSets = flashcards.filter(f => f.docId === activeDocId);
  const docExams = exams.filter(e => e.docId === activeDocId);
  const docNotes = notes.filter(n => n.docId === activeDocId);

  if (activeItem?.type === 'exam') return <InPanelExam exam={activeItem.data} onBack={() => setActiveItem(null)}/>;
  if (activeItem?.type === 'note') return <InPanelNote note={activeItem.data} onBack={() => setActiveItem(null)}/>;
  if (activeItem?.type === 'flashcards') return <InPanelFlashcards title={activeItem.data.title} initialCards={activeItem.data.cards} onBack={() => setActiveItem(null)} setFlashcards={setFlashcards}/>;

  return (
    <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 pb-[100px] md:pb-6 space-y-8">
      <div>
        <h3 className="text-[9px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500 mb-4 flex items-center gap-2 bg-emerald-500/10 w-fit px-3 py-1.5 rounded-xl border border-emerald-500/20"><GraduationCap size={13}/> Exams ({docExams.length})</h3>
        {docExams.length === 0 ? <p className="text-xs text-gray-400 italic bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 text-center">No exams yet.</p> : docExams.map(e => (
          <div key={e.id} className="bg-white/80 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800 p-5 rounded-2xl group shadow-sm mb-3">
            <div className="flex justify-between items-start mb-4"><div><p className="text-sm font-bold text-gray-800 dark:text-white mb-1">{e.title}</p><span className="text-[9px] font-black text-emerald-600 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">{e.questions.length} Qs</span></div><button onClick={() => setExams(exams.filter(ex=>ex.id!==e.id))} className="p-2 text-gray-400 hover:text-red-500 rounded-lg"><Trash size={13}/></button></div>
            <button onClick={() => setActiveItem({type:'exam',data:e})} className="w-full py-2.5 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 rounded-xl text-[10px] font-bold uppercase tracking-widest border border-emerald-500/20 flex items-center justify-center gap-2"><Play size={11} fill="currentColor"/> Take</button>
          </div>
        ))}
      </div>
      <div>
        <h3 className="text-[9px] font-black uppercase tracking-widest text-[var(--accent-color)] mb-4 flex items-center gap-2 bg-[var(--accent-color)]/10 w-fit px-3 py-1.5 rounded-xl border border-[var(--accent-color)]/20"><Layers size={13}/> Flashcards ({docCardSets.length})</h3>
        {docCardSets.length === 0 ? <p className="text-xs text-gray-400 italic bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 text-center">No cards yet.</p> : docCardSets.map(set => (
          <div key={set.id} className="bg-white/80 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm mb-3">
            <div className="flex justify-between items-start mb-4"><div><p className="text-sm font-bold text-gray-800 dark:text-white mb-1">{set.title}</p><span className="text-[9px] font-black text-[var(--accent-color)] bg-[var(--accent-color)]/10 px-2 py-1 rounded-lg border border-[var(--accent-color)]/20">{set.cards?.length||0} Cards</span></div><button onClick={() => setFlashcards(flashcards.filter(f=>f.id!==set.id))} className="p-2 text-gray-400 hover:text-red-500 rounded-lg"><Trash size={13}/></button></div>
            <button onClick={() => setActiveItem({type:'flashcards',data:set})} className="w-full py-2.5 bg-[var(--accent-color)]/10 hover:bg-[var(--accent-color)]/20 text-[var(--accent-color)] rounded-xl text-[10px] font-bold uppercase tracking-widest border border-[var(--accent-color)]/20 flex items-center justify-center gap-2"><Play size={11} fill="currentColor"/> Study</button>
          </div>
        ))}
      </div>
      <div>
        <h3 className="text-[9px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-500 mb-4 flex items-center gap-2 bg-blue-500/10 w-fit px-3 py-1.5 rounded-xl border border-blue-500/20"><BookA size={13}/> Notes ({docNotes.length})</h3>
        {docNotes.length === 0 ? <p className="text-xs text-gray-400 italic bg-white dark:bg-zinc-900/50 p-4 rounded-xl border border-dashed border-gray-200 dark:border-zinc-800 text-center">No notes yet.</p> : docNotes.map(n => (
          <div key={n.id} onClick={() => setActiveItem({type:'note',data:n})} className="bg-white/80 dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800 p-5 rounded-2xl relative group shadow-sm cursor-pointer hover:border-blue-500/30 mb-3">
            <p className="text-sm font-bold text-gray-800 dark:text-white mb-2 pr-10">{n.title}</p>
            <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-2 bg-gray-50 dark:bg-zinc-950 p-3 rounded-xl border border-gray-200 dark:border-zinc-800">{n.content}</p>
            <button onClick={(e) => { e.stopPropagation(); setNotes(notes.filter(no=>no.id!==n.id)); }} className="absolute top-5 right-5 p-2 text-gray-400 hover:text-red-500 rounded-lg opacity-0 group-hover:opacity-100 transition-all"><Trash size={13}/></button>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── IN-PANEL EXAM (SPLIT SCREEN TURBO EDITION) ──────────────────────────────
function InPanelExam({ exam, onBack }) {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (idx) => {
    if (showFeedback) return;
    setSelectedAnswer(idx); setShowFeedback(true);
    if (idx === exam.questions[currentQIndex].correct) setScore(prev => prev + 1);
  };

  const nextQuestion = () => {
    setSelectedAnswer(null); setShowFeedback(false);
    if (currentQIndex < exam.questions.length - 1) setCurrentQIndex(currentQIndex + 1);
    else alert(`Exam finished! Score: ${score} / ${exam.questions.length}`);
  };

  const q = exam.questions[currentQIndex];
  
  const hasLabs = q.labPanels && q.labPanels.length > 0;
  
  const labSection = hasLabs ? (
    <div className="w-full">
      <h3 className="text-xs font-black uppercase tracking-widest text-blue-600 dark:text-blue-400 mb-4 flex items-center gap-2">
        <FlaskConical size={14}/> Laboratory Results
      </h3>
      {q.labPanels.map((panel, pi) => (
        <div key={pi} className="mb-5">
           <h4 className="text-[10px] font-bold uppercase tracking-widest text-gray-500 mb-2 pl-1">{panel.panelName}</h4>
           <LabTable rows={panel.rows} />
        </div>
      ))}
    </div>
  ) : null;

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-50 dark:bg-[#0a0a0c]">
      <div className="bg-emerald-600/10 border-b border-emerald-500/20 p-3 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1"><ChevronLeft size={13}/> Exit</button>
        <span className="text-[9px] text-emerald-600 dark:text-emerald-500 font-black uppercase tracking-widest bg-emerald-500/10 px-2 py-1 rounded-lg">Score: {score}</span>
      </div>
      
      {/* Container holding the split layout */}
      <div className="flex-1 overflow-hidden flex flex-col lg:flex-row relative">
        
        {/* Left Side: Question, Vignette, Options */}
        <div className={`flex-1 overflow-y-auto custom-scrollbar p-5 pb-[100px] ${hasLabs ? 'lg:w-[55%] lg:flex-none' : ''}`}>
          <div className="mb-6 flex justify-between items-center border-b border-gray-200 dark:border-zinc-800 pb-3">
            <span className="text-xs font-bold text-gray-500 uppercase tracking-widest">Q {currentQIndex+1} / {exam.questions.length}</span>
          </div>
          
          {q.vignette && (
             <div className="text-sm text-gray-800 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap mb-6 bg-white dark:bg-[#121214] p-5 rounded-2xl shadow-sm border border-gray-200 dark:border-zinc-800">
               <span className="text-[9px] font-black uppercase tracking-widest text-gray-400 block mb-2">Patient Vignette</span>
               {q.vignette}
             </div>
          )}

          <h2 className="text-base text-gray-800 dark:text-white font-bold mb-6 leading-relaxed">
            {q.q.replace(/CASE VIGNETTE:.*QUESTION:\n/s, '') /* Safely strip if combined historically */}
          </h2>
          
          <div className="space-y-3 mb-8">
            {q.options.map((opt,idx) => (
              <button key={idx} onClick={() => handleSelect(idx)} disabled={showFeedback} className={`w-full text-left p-4 rounded-2xl border-2 transition-all flex items-start gap-3 ${selectedAnswer===idx ? (idx===q.correct ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-100' : 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-100') : showFeedback&&idx===q.correct ? 'border-emerald-500 bg-emerald-500/10' : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 hover:border-gray-300'}`}>
                <div className={`w-5 h-5 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${(selectedAnswer===idx||showFeedback&&idx===q.correct) ? (idx===q.correct ? 'border-emerald-500' : 'border-red-500') : 'border-gray-300 dark:border-zinc-600'}`}>{(selectedAnswer===idx||showFeedback&&idx===q.correct) && <div className={`w-2.5 h-2.5 rounded-full ${idx===q.correct ? 'bg-emerald-500' : 'bg-red-500'}`}/>}</div>
                <span className="text-sm">{opt}</span>
              </button>
            ))}
          </div>

          {/* Show labs here on MOBILE, hidden on Desktop */}
          {hasLabs && <div className="block lg:hidden mb-8">{labSection}</div>}

          {showFeedback && (
            <div className="p-5 bg-[var(--accent-color)]/5 border border-[var(--accent-color)]/20 rounded-2xl text-xs text-gray-700 dark:text-zinc-300 mb-6 shadow-sm">
              <span className="font-black text-[var(--accent-color)] block mb-2 text-[10px] uppercase tracking-widest">Explanation</span>
              <p className="leading-relaxed text-sm">{q.explanation}</p>
            </div>
          )}
          
          <div className="flex justify-between">
            <button onClick={() => { if(currentQIndex>0){setCurrentQIndex(currentQIndex-1);setSelectedAnswer(null);setShowFeedback(false);} }} disabled={currentQIndex===0} className="px-4 py-2 text-gray-500 rounded-xl disabled:opacity-30 text-xs font-bold uppercase tracking-widest">Previous</button>
            <button onClick={nextQuestion} disabled={!showFeedback} className="px-6 py-3 bg-gray-800 dark:bg-white text-white dark:text-zinc-950 disabled:bg-gray-200 dark:disabled:bg-zinc-800 rounded-xl text-xs font-black shadow-lg uppercase tracking-widest flex items-center gap-2">Next <ChevronRight size={14}/></button>
          </div>
        </div>

        {/* Right Side: Lab Tables (Desktop Only) */}
        {hasLabs && (
          <div className="hidden lg:block w-[45%] border-l border-gray-200 dark:border-zinc-800 bg-gray-100/50 dark:bg-[#121214] overflow-y-auto custom-scrollbar p-6 pb-[100px] shadow-inner">
            {labSection}
          </div>
        )}

      </div>
    </div>
  );
}

// ─── IN-PANEL FLASHCARDS ─────────────────────────────────────────────────────
function InPanelFlashcards({ title, initialCards, onBack, setFlashcards }) {
  const [cards, setCards] = useState(initialCards || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  if (!cards || cards.length === 0) return <div className="p-6 text-center text-gray-500">No cards left.</div>;
  
  const currentCard = cards[currentIndex];

  const handleRate = (quality) => {
    let newRep = currentCard.repetitions || 0, newEf = currentCard.ef || 2.5, newInterval = currentCard.interval || 1;
    if (quality < 3) { newRep = 0; newInterval = 1; } else { newEf = Math.max(1.3, newEf + (0.1-(5-quality)*(0.08+(5-quality)*0.02))); newRep++; newInterval = newRep===1 ? 1 : newRep===2 ? 6 : Math.round(newInterval*newEf); }
    const newCard = {...currentCard, repetitions: newRep, ef: newEf, interval: newInterval, lastReview: Date.now(), nextReview: Date.now()+newInterval*86400000};
    setCards(prev => prev.map(c => c.id===newCard.id ? newCard : c));
    setFlashcards(gs => gs.map(set => ({...set, cards: set.cards ? set.cards.map(c => c.id===newCard.id ? newCard : c) : set.cards})));
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) setCurrentIndex(currentIndex + 1);
    else { onBack(); alert('Session complete!'); }
  };

  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-[#0a0a0c]">
      <div className="bg-[var(--accent-color)]/10 border-b border-[var(--accent-color)]/20 p-3 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="text-[var(--accent-color)] text-xs font-bold uppercase tracking-widest flex items-center gap-1"><ChevronLeft size={13}/> Exit</button>
        <span className="text-[9px] text-[var(--accent-color)] font-black uppercase tracking-widest bg-[var(--accent-color)]/10 px-2 py-1 rounded-lg">{currentIndex+1}/{cards.length}</span>
      </div>
      <div className="flex-1 overflow-y-auto flex flex-col items-center justify-center p-4 pb-[100px]">
        <div onClick={() => !isFlipped && setIsFlipped(true)} className="w-full h-64 perspective-1000 cursor-pointer mb-8">
          <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-x-180' : ''}`}>
            <div className="absolute inset-0 backface-hidden bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl">
              <span className="absolute top-4 left-4 text-[9px] font-black uppercase tracking-widest text-gray-400">Question</span>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white leading-relaxed">{currentCard.q}</h2>
              <div className="absolute bottom-4 text-[9px] font-bold uppercase tracking-widest text-[var(--accent-color)]/50 animate-pulse">Tap to reveal</div>
            </div>
            <div className="absolute inset-0 backface-hidden bg-[var(--accent-color)] rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl rotate-x-180 overflow-y-auto">
              <span className="absolute top-4 left-4 text-[9px] font-black uppercase tracking-widest text-white/70">Answer</span>
              <p className="text-base font-bold text-white leading-relaxed">{currentCard.a}</p>
            </div>
          </div>
        </div>
        <div className={`w-full grid grid-cols-2 gap-3 transition-opacity ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button onClick={() => handleRate(0)} className="py-3 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-2xl text-red-600 dark:text-red-400 text-xs font-black uppercase tracking-widest transition-all">Again</button>
          <button onClick={() => handleRate(3)} className="py-3 bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500 hover:text-white rounded-2xl text-yellow-600 dark:text-yellow-400 text-xs font-black uppercase tracking-widest transition-all">Hard</button>
          <button onClick={() => handleRate(4)} className="py-3 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs font-black uppercase tracking-widest transition-all">Good</button>
          <button onClick={() => handleRate(5)} className="py-3 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500 hover:text-white rounded-2xl text-blue-600 dark:text-blue-400 text-xs font-black uppercase tracking-widest transition-all">Easy</button>
        </div>
      </div>
      <style>{`.perspective-1000{perspective:1000px}.transform-style-3d{transform-style:preserve-3d}.backface-hidden{backface-visibility:hidden}.rotate-x-180{transform:rotateX(180deg)}`}</style>
    </div>
  );
}

// ─── IN-PANEL NOTE ───────────────────────────────────────────────────────────
function InPanelNote({ note, onBack }) {
  return (
    <div className="flex-1 flex flex-col bg-gray-50 dark:bg-[#0a0a0c]">
      <div className="bg-blue-600/10 border-b border-blue-500/20 p-4 flex items-center shrink-0">
        <button onClick={onBack} className="text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-widest flex items-center gap-1"><ChevronLeft size={13}/> Back</button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 pb-[100px]">
        <h2 className="text-2xl font-black text-gray-800 dark:text-white mb-6">{note.title}</h2>
        <div className="text-sm text-gray-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed">{note.content}</div>
      </div>
    </div>
  );
}