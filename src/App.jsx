import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Layers, CheckSquare, Settings, 
  ChevronLeft, ChevronRight, Upload, MessageSquare, 
  CheckCircle2, XCircle, BrainCircuit,
  Library, Trash2, Trash, FileText, Loader2, List,
  Send, ShieldAlert, LayoutDashboard,
  GraduationCap, Save, X, Plus, BookA, Crosshair,
  PanelRightClose, PanelRightOpen, KeyRound, AlertCircle,
  FileUp, Target
} from 'lucide-react';

// --- INDEXED DB FOR PERSISTENT PDF STORAGE ---
const DB_NAME = 'MariamProDB';
const STORE_NAME = 'pdfs';

const openDB = () => new Promise((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, 1);
  request.onupgradeneeded = (e) => {
    e.target.result.createObjectStore(STORE_NAME);
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

const savePdfData = async (id, buffer) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(buffer, id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

const getPdfData = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readonly');
    const request = tx.objectStore(STORE_NAME).get(id);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
};

const deletePdfData = async (id) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
};

// --- DYNAMIC PDF.JS LOADER ---
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

// --- MAIN APP ---
export default function App() {
  const [documents, setDocuments] = useState([]);
  const [activeDocId, setActiveDocId] = useState(null);
  
  const [flashcards, setFlashcards] = useState([]);
  const [exams, setExams] = useState([]);
  const [notes, setNotes] = useState([]);
  
  const [userSettings, setUserSettings] = useState({ apiKey: '', strictMode: true });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [rightPanelTab, setRightPanelTab] = useState('generate'); // generate, chat, review, settings
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  // Load Metadata
  useEffect(() => {
    const savedDocs = localStorage.getItem('drMariam_docs');
    const savedCards = localStorage.getItem('drMariam_flashcards');
    const savedExams = localStorage.getItem('drMariam_exams');
    const savedNotes = localStorage.getItem('drMariam_notes');
    const savedSettings = localStorage.getItem('drMariam_settings');
    
    if (savedDocs) setDocuments(JSON.parse(savedDocs));
    if (savedCards) setFlashcards(JSON.parse(savedCards));
    if (savedExams) setExams(JSON.parse(savedExams));
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedSettings) setUserSettings(JSON.parse(savedSettings));
  }, []);

  // Save Metadata
  useEffect(() => {
    localStorage.setItem('drMariam_docs', JSON.stringify(documents));
    localStorage.setItem('drMariam_flashcards', JSON.stringify(flashcards));
    localStorage.setItem('drMariam_exams', JSON.stringify(exams));
    localStorage.setItem('drMariam_notes', JSON.stringify(notes));
    localStorage.setItem('drMariam_settings', JSON.stringify(userSettings));
  }, [documents, flashcards, exams, notes, userSettings]);

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
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      const pagesText = {};

      for (let i = 1; i <= totalPages; i++) {
        try {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          pagesText[i] = textContent.items.map(s => s.str).join(' ');
        } catch (e) {
          pagesText[i] = "";
        }
        setUploadProgress(50 + Math.floor((i / totalPages) * 40));
      }

      const id = Date.now().toString();
      const newDoc = {
        id,
        name: file.name,
        totalPages,
        pagesText,
        progress: 1,
        addedAt: new Date().toISOString()
      };

      await savePdfData(id, arrayBuffer);
      
      setDocuments(prev => [...prev, newDoc]);
      setActiveDocId(id);
      setRightPanelTab('generate');
      setRightPanelOpen(true);
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      event.target.value = '';
    }
  };

  const deleteDocument = async (id, e) => {
    e.stopPropagation();
    await deletePdfData(id);
    setDocuments(prev => prev.filter(d => d.id !== id));
    setFlashcards(prev => prev.filter(f => f.docId !== id));
    setExams(prev => prev.filter(ex => ex.docId !== id));
    setNotes(prev => prev.filter(n => n.docId !== id));
    if (activeDocId === id) setActiveDocId(null);
  };

  const activeDoc = documents.find(d => d.id === activeDocId);

  return (
    <div className="flex h-screen bg-zinc-950 text-zinc-300 font-sans overflow-hidden">
      
      {/* LEFT SIDEBAR (Ultra thin, IDE style) */}
      <nav className="w-16 bg-zinc-950 border-r border-zinc-800 flex flex-col items-center py-4 z-20 shrink-0">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-900/50 mb-8 cursor-pointer" onClick={() => setActiveDocId(null)}>
          <BrainCircuit className="text-white w-6 h-6" />
        </div>
        
        <div className="flex-1 flex flex-col gap-4 w-full px-2">
          <SidebarBtn icon={Library} label="Library" active={!activeDocId} onClick={() => setActiveDocId(null)} />
          {activeDocId && (
            <>
              <div className="w-8 h-px bg-zinc-800 mx-auto my-2" />
              <SidebarBtn icon={BookOpen} label="Reader" active={activeDocId !== null} onClick={() => {}} highlight />
            </>
          )}
        </div>

        <SidebarBtn icon={Settings} label="Global Settings" active={rightPanelTab === 'settings' && !activeDocId} onClick={() => { setActiveDocId(null); setRightPanelTab('settings'); }} />
      </nav>

      {/* CENTER WORKSPACE */}
      <main className="flex-1 flex flex-col relative bg-zinc-900 min-w-0">
        {isUploading && (
          <div className="absolute top-0 left-0 w-full h-1 bg-zinc-800 z-50">
            <div className="h-full bg-indigo-500 transition-all duration-300 shadow-[0_0_10px_rgba(99,102,241,0.8)]" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        )}

        {!activeDocId ? (
          <LibraryView 
            documents={documents} 
            onUpload={handleFileUpload} 
            onOpen={setActiveDocId} 
            isUploading={isUploading} 
            deleteDocument={deleteDocument}
          />
        ) : (
          <PdfWorkspace 
            activeDoc={activeDoc} 
            setDocuments={setDocuments}
            closeDoc={() => setActiveDocId(null)}
            rightPanelOpen={rightPanelOpen}
            setRightPanelOpen={setRightPanelOpen}
          />
        )}
      </main>

      {/* RIGHT PANEL (Persistent IDE Tools) */}
      {rightPanelOpen && activeDocId && (
        <aside className="w-[400px] bg-zinc-950 border-l border-zinc-800 flex flex-col shrink-0 z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
          <div className="h-12 flex p-1 bg-zinc-900/50 border-b border-zinc-800 shrink-0">
            <PanelTab active={rightPanelTab === 'generate'} onClick={() => setRightPanelTab('generate')} label="Generate" icon={Crosshair} />
            <PanelTab active={rightPanelTab === 'chat'} onClick={() => setRightPanelTab('chat')} label="Chat" icon={MessageSquare} />
            <PanelTab active={rightPanelTab === 'review'} onClick={() => setRightPanelTab('review')} label="Review" icon={Layers} />
            <PanelTab active={rightPanelTab === 'settings'} onClick={() => setRightPanelTab('settings')} label="API Key" icon={KeyRound} />
          </div>
          
          <div className="flex-1 overflow-hidden relative">
            {(!userSettings.apiKey || rightPanelTab === 'settings') ? (
              <PanelSettings settings={userSettings} setSettings={setUserSettings} />
            ) : rightPanelTab === 'generate' ? (
              <PanelGenerate 
                activeDoc={activeDoc} 
                settings={userSettings} 
                setFlashcards={setFlashcards} 
                setExams={setExams} 
                setNotes={setNotes} 
              />
            ) : rightPanelTab === 'chat' ? (
              <PanelChat activeDoc={activeDoc} settings={userSettings} />
            ) : rightPanelTab === 'review' ? (
              <PanelReview 
                activeDocId={activeDocId} 
                flashcards={flashcards} setFlashcards={setFlashcards}
                exams={exams} setExams={setExams}
                notes={notes} setNotes={setNotes}
              />
            ) : null}
          </div>
        </aside>
      )}

      {/* When no document is active, right panel only shows Settings if requested */}
      {!activeDocId && rightPanelTab === 'settings' && (
         <aside className="w-[400px] bg-zinc-950 border-l border-zinc-800 flex flex-col shrink-0 z-20">
           <div className="h-12 flex items-center px-4 border-b border-zinc-800">
             <h2 className="text-sm font-bold text-white">System Settings</h2>
             <button onClick={() => setRightPanelTab('generate')} className="ml-auto text-zinc-500 hover:text-white"><X size={16}/></button>
           </div>
           <PanelSettings settings={userSettings} setSettings={setUserSettings} />
         </aside>
      )}

    </div>
  );
}

// --- SUBCOMPONENTS ---

function SidebarBtn({ icon: Icon, label, active, onClick, highlight }) {
  return (
    <button 
      onClick={onClick}
      title={label}
      className={`w-12 h-12 mx-auto rounded-xl flex items-center justify-center transition-all group relative ${
        active 
          ? highlight ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/20' : 'bg-zinc-800 text-white' 
          : 'text-zinc-500 hover:bg-zinc-900 hover:text-zinc-300'
      }`}
    >
      <Icon size={22} />
      <span className="absolute left-14 bg-zinc-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity border border-zinc-700">
        {label}
      </span>
    </button>
  );
}

function PanelTab({ active, onClick, label, icon: Icon }) {
  return (
    <button 
      onClick={onClick} 
      className={`flex-1 flex items-center justify-center gap-2 rounded-md text-xs font-bold uppercase tracking-wider transition-all ${
        active ? 'bg-zinc-800 text-indigo-400 shadow-sm' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800/50'
      }`}
    >
      <Icon size={14} /> {label}
    </button>
  );
}

function LibraryView({ documents, onUpload, onOpen, isUploading, deleteDocument }) {
  return (
    <div className="flex-1 overflow-auto p-8 lg:p-12 custom-scrollbar">
      <div className="max-w-6xl mx-auto w-full">
        <div className="flex justify-between items-end mb-12">
          <div>
            <h1 className="text-4xl font-black text-white tracking-tight">Intelligence Library</h1>
            <p className="text-zinc-400 mt-2">Upload medical PDFs. Content is stored entirely locally on your machine.</p>
          </div>
          <label className={`cursor-pointer bg-white text-zinc-900 hover:bg-zinc-200 px-6 py-3 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-xl shadow-white/10 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
            {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />} 
            {isUploading ? "Processing..." : "Import PDF"}
            <input type="file" accept="application/pdf" className="hidden" onChange={onUpload} disabled={isUploading} />
          </label>
        </div>
        
        {documents.length === 0 ? (
          <div className="border border-dashed border-zinc-800 rounded-2xl bg-zinc-950/50 p-16 text-center">
            <FileUp size={48} className="mx-auto text-zinc-700 mb-6" />
            <h2 className="text-xl font-bold text-zinc-300 mb-2">Repository Empty</h2>
            <p className="text-zinc-500 text-sm max-w-md mx-auto">Import a textbook or research paper to begin generating highly accurate, localized study materials.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {documents.map(doc => (
              <div key={doc.id} onClick={() => onOpen(doc.id)} className="bg-zinc-950 rounded-2xl p-5 border border-zinc-800 hover:border-indigo-500/50 hover:shadow-2xl hover:shadow-indigo-500/10 cursor-pointer transition-all flex flex-col h-56 group">
                <div className="flex items-start justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all">
                    <BookOpen size={20} />
                  </div>
                  <button onClick={(e) => deleteDocument(doc.id, e)} className="p-2 text-zinc-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors opacity-0 group-hover:opacity-100">
                    <Trash2 size={16} />
                  </button>
                </div>
                <h3 className="font-bold text-zinc-200 text-base leading-snug line-clamp-2 flex-1">{doc.name}</h3>
                <div className="mt-4 pt-4 border-t border-zinc-800/50">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-500">Read Progress</span>
                    <span className="text-[10px] font-mono text-indigo-400">{Math.round((doc.progress / doc.totalPages) * 100)}%</span>
                  </div>
                  <div className="w-full bg-zinc-900 rounded-full h-1.5 overflow-hidden">
                    <div className="bg-indigo-500 h-full rounded-full transition-all duration-500" style={{ width: `${Math.min(100, (doc.progress / doc.totalPages) * 100)}%` }}></div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function PdfWorkspace({ activeDoc, setDocuments, closeDoc, rightPanelOpen, setRightPanelOpen }) {
  const [currentPage, setCurrentPage] = useState(activeDoc.progress || 1);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let url = null;
    const loadPdf = async () => {
      setIsLoading(true);
      try {
        const buffer = await getPdfData(activeDoc.id);
        if (buffer) {
          const blob = new Blob([buffer], { type: 'application/pdf' });
          url = URL.createObjectURL(blob);
          setPdfUrl(url);
        }
      } catch (e) {
        console.error("Failed to load PDF from DB", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadPdf();
    return () => { if (url) URL.revokeObjectURL(url); };
  }, [activeDoc.id]);

  useEffect(() => {
    setDocuments(prev => prev.map(doc => doc.id === activeDoc.id ? { ...doc, progress: currentPage } : doc));
  }, [currentPage, activeDoc.id, setDocuments]);

  return (
    <div className="flex-1 flex flex-col h-full bg-zinc-900 relative">
      <div className="h-14 flex items-center justify-between px-4 bg-zinc-950 border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-4 overflow-hidden">
          <button onClick={closeDoc} className="flex items-center gap-2 text-zinc-400 hover:text-white transition-colors text-sm font-bold uppercase tracking-wider">
            <ChevronLeft size={16} /> Library
          </button>
          <div className="w-px h-4 bg-zinc-800"></div>
          <span className="text-sm font-medium text-zinc-300 truncate max-w-sm" title={activeDoc.name}>{activeDoc.name}</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center bg-zinc-900 rounded-lg border border-zinc-800 overflow-hidden">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="px-3 py-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"><ChevronLeft size={16} /></button>
            <span className="text-xs font-mono px-3 text-zinc-300 font-bold">{currentPage} / {activeDoc.totalPages}</span>
            <button onClick={() => setCurrentPage(p => Math.min(activeDoc.totalPages, p + 1))} className="px-3 py-1.5 text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"><ChevronRight size={16} /></button>
          </div>
          <button onClick={() => setRightPanelOpen(!rightPanelOpen)} className={`p-1.5 rounded-lg border transition-colors ${rightPanelOpen ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-400' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white'}`}>
            {rightPanelOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
          </button>
        </div>
      </div>
      <div className="flex-1 overflow-hidden bg-zinc-800/50 flex justify-center relative">
        {isLoading ? (
          <div className="flex items-center gap-3 text-zinc-500 m-auto"><Loader2 className="animate-spin" size={24}/> Loading document locally...</div>
        ) : pdfUrl ? (
          <iframe src={`${pdfUrl}#page=${currentPage}&view=FitH&toolbar=0&navpanes=0`} className="w-full h-full border-none bg-white shadow-2xl" title="PDF Document" />
        ) : (
          <div className="m-auto text-red-400 text-sm flex items-center gap-2"><AlertCircle size={16}/> Failed to load PDF visual layer. Context is still available.</div>
        )}
      </div>
    </div>
  );
}

// --- RIGHT PANEL LOGIC ---

function PanelSettings({ settings, setSettings }) {
  return (
    <div className="p-6 h-full overflow-y-auto custom-scrollbar flex flex-col gap-6">
      <div className="bg-indigo-500/10 border border-indigo-500/20 p-4 rounded-xl">
        <h3 className="text-sm font-bold text-indigo-400 flex items-center gap-2 mb-2"><KeyRound size={16}/> Gemini API Key Required</h3>
        <p className="text-xs text-indigo-300/80 leading-relaxed mb-4">To enable local AI extraction without server limits, you must provide your own Google Gemini API key. It is stored securely in your browser's local storage.</p>
        <input 
          type="password" 
          value={settings.apiKey} 
          onChange={(e) => setSettings({...settings, apiKey: e.target.value})} 
          placeholder="AIzaSy..." 
          className="w-full bg-zinc-950 border border-indigo-500/50 rounded-lg px-3 py-2.5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono" 
        />
        <a href="https://aistudio.google.com/app/apikey" target="_blank" rel="noreferrer" className="text-[10px] text-indigo-400 mt-2 inline-block hover:underline uppercase tracking-widest font-bold">Get Free Key &rarr;</a>
      </div>

      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl">
        <label className="flex items-start gap-3 cursor-pointer">
          <input type="checkbox" checked={settings.strictMode} onChange={(e) => setSettings({...settings, strictMode: e.target.checked})} className="mt-1 accent-indigo-500" />
          <div>
            <span className="text-sm font-bold text-white block">Strict Document Grounding</span>
            <span className="text-xs text-zinc-500 mt-1 block leading-relaxed">Forces the AI to exclusively use the text found in the PDF. Prevents external hallucinations. Essential for accurate medical study.</span>
          </div>
        </label>
      </div>
    </div>
  );
}

function PanelGenerate({ activeDoc, settings, setFlashcards, setExams, setNotes }) {
  const [startPage, setStartPage] = useState(activeDoc.progress || 1);
  const [endPage, setEndPage] = useState(activeDoc.progress || 1);
  const [type, setType] = useState('flashcards');
  const [count, setCount] = useState(5);
  const [status, setStatus] = useState({ loading: false, msg: '', err: false });
  const [generated, setGenerated] = useState(null);

  useEffect(() => {
    if(!status.loading && !generated) {
      setStartPage(activeDoc.progress);
      setEndPage(activeDoc.progress);
    }
  }, [activeDoc.progress, status.loading, generated]);

  const callAI = async (prompt, expectJson) => {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${settings.apiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        systemInstruction: { parts: [{ text: settings.strictMode ? "You are a strict data extraction AI. Use ONLY the provided text. No outside knowledge." : "You are an AI tutor." }] },
        generationConfig: expectJson ? { responseMimeType: "application/json" } : {}
      })
    });
    if (!res.ok) throw new Error(`API Error: ${res.status}`);
    const data = await res.json();
    let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
    if (expectJson && !data.generationConfig?.responseMimeType) text = text.replace(/```json/g, '').replace(/```/g, '').trim();
    return text;
  };

  const handleGenerate = async () => {
    setStatus({ loading: true, msg: 'Extracting secure text layer...', err: false });
    setGenerated(null);
    try {
      let text = "";
      for (let i = startPage; i <= endPage; i++) if (activeDoc.pagesText[i]) text += activeDoc.pagesText[i] + "\n";
      if (!text.trim()) throw new Error("No readable text on these pages.");

      setStatus({ loading: true, msg: 'AI processing content...', err: false });

      if (type === 'flashcards') {
        const p = `Generate ${count} flashcards from this text ONLY. Format JSON: { "items": [ {"q": "Question", "a": "Answer"} ] }\n\nTEXT:\n${text}`;
        const raw = await callAI(p, true);
        setGenerated({ type, data: JSON.parse(raw).items, pages: `${startPage}-${endPage}` });
      } else if (type === 'exam') {
        const p = `Generate a ${count}-question exam from this text ONLY. Format JSON: { "title": "Exam", "items": [ { "q": "Question", "options": ["A","B","C","D"], "correct": 0, "explanation": "Why" } ] }\n\nTEXT:\n${text}`;
        const raw = await callAI(p, true);
        const parsed = JSON.parse(raw);
        setGenerated({ type, title: parsed.title, data: parsed.items, pages: `${startPage}-${endPage}` });
      } else {
        const p = `Write a detailed markdown summary of this text ONLY.\n\nTEXT:\n${text}`;
        const raw = await callAI(p, false);
        setGenerated({ type, data: raw, pages: `${startPage}-${endPage}` });
      }
      setStatus({ loading: false, msg: 'Generation complete.', err: false });
    } catch (e) {
      setStatus({ loading: false, msg: e.message || "Generation failed.", err: true });
    }
  };

  const saveItem = () => {
    if (!generated) return;
    if (generated.type === 'flashcards') {
      const cards = generated.data.map(c => ({ id: Date.now()+Math.random(), docId: activeDoc.id, sourcePages: generated.pages, q: c.q, a: c.a, level: 0, nextReview: Date.now() }));
      setFlashcards(p => [...p, ...cards]);
    } else if (generated.type === 'exam') {
      setExams(p => [...p, { id: Date.now().toString(), docId: activeDoc.id, sourcePages: generated.pages, title: generated.title || "Exam", questions: generated.data, createdAt: new Date().toISOString() }]);
    } else {
      setNotes(p => [...p, { id: Date.now().toString(), docId: activeDoc.id, title: `Summary Pgs ${generated.pages}`, content: generated.data }]);
    }
    setGenerated(null);
    setStatus({ loading: false, msg: 'Saved to library!', err: false });
  };

  const removeItem = (idx) => {
    if (generated.type === 'summary') setGenerated(null);
    else {
      const d = [...generated.data]; d.splice(idx, 1);
      if (d.length === 0) setGenerated(null); else setGenerated({...generated, data: d});
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950 p-4">
      <div className="bg-zinc-900 border border-zinc-800 p-4 rounded-xl flex-shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div className="w-full mr-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">Start Pg</label>
            <input type="number" min={1} max={activeDoc.totalPages} value={startPage} onChange={e=>setStartPage(parseInt(e.target.value)||1)} className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-sm text-center text-white font-mono outline-none focus:border-indigo-500" />
          </div>
          <div className="w-full">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block">End Pg</label>
            <input type="number" min={1} max={activeDoc.totalPages} value={endPage} onChange={e=>setEndPage(parseInt(e.target.value)||1)} className="w-full bg-zinc-950 border border-zinc-800 rounded px-2 py-1.5 text-sm text-center text-white font-mono outline-none focus:border-indigo-500" />
          </div>
        </div>
        
        <div className="grid grid-cols-3 gap-2 mb-4">
          {['flashcards', 'exam', 'summary'].map(t => (
            <button key={t} onClick={()=>setType(t)} className={`py-2 px-1 rounded-lg text-[10px] font-bold uppercase border transition-all ${type === t ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300'}`}>{t === 'flashcards' ? 'Cards' : t}</button>
          ))}
        </div>

        {type !== 'summary' && (
          <div className="mb-4">
            <label className="text-[10px] font-bold uppercase tracking-widest text-zinc-500 mb-1 block flex justify-between"><span>Count</span> <span>{count}</span></label>
            <input type="range" min="1" max="15" value={count} onChange={e=>setCount(parseInt(e.target.value))} className="w-full accent-indigo-500" />
          </div>
        )}

        <button onClick={handleGenerate} disabled={status.loading} className="w-full py-2.5 bg-white hover:bg-zinc-200 text-zinc-900 rounded-lg text-xs font-bold uppercase tracking-widest transition-all shadow-lg shadow-white/10 disabled:opacity-50">
          {status.loading ? "Processing..." : "Extract Data"}
        </button>
      </div>

      {status.msg && !generated && (
        <div className={`mt-4 p-3 rounded-lg text-xs font-medium flex items-center gap-2 ${status.err ? 'bg-red-500/10 text-red-400 border border-red-500/20' : status.loading ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
          {status.loading && <Loader2 size={14} className="animate-spin" />} {status.msg}
        </div>
      )}

      {generated && (
        <div className="mt-4 flex-1 flex flex-col min-h-0 bg-zinc-900 border border-emerald-500/30 rounded-xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300">
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 p-2 flex justify-between items-center shrink-0">
            <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 px-2">Preview</span>
            <div className="flex gap-2">
              <button onClick={()=>setGenerated(null)} className="px-3 py-1 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded text-xs font-bold">Discard</button>
              <button onClick={saveItem} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center gap-1 shadow-lg shadow-emerald-900/50"><Save size={14}/> Save</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-3">
            {generated.type === 'flashcards' && generated.data.map((item, idx) => (
              <div key={idx} className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg relative group pr-8">
                <p className="text-xs text-white font-bold mb-1">Q: {item.q}</p>
                <p className="text-xs text-indigo-300">A: {item.a}</p>
                <button onClick={()=>removeItem(idx)} className="absolute top-2 right-2 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
              </div>
            ))}
            {generated.type === 'exam' && generated.data.map((item, idx) => (
              <div key={idx} className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg relative group pr-8">
                <p className="text-xs text-white font-bold mb-2">{idx+1}. {item.q}</p>
                <div className="space-y-1">
                  {item.options.map((opt, oIdx) => (
                    <div key={oIdx} className={`text-[10px] p-1.5 rounded ${oIdx === item.correct ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 font-bold' : 'bg-zinc-900 text-zinc-400'}`}>{opt}</div>
                  ))}
                </div>
                <button onClick={()=>removeItem(idx)} className="absolute top-2 right-2 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
              </div>
            ))}
            {generated.type === 'summary' && (
              <div className="bg-zinc-950 border border-zinc-800 p-3 rounded-lg relative group pr-8">
                <div className="text-xs text-zinc-300 whitespace-pre-wrap">{generated.data}</div>
                <button onClick={()=>removeItem(0)} className="absolute top-2 right-2 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

function PanelChat({ activeDoc, settings }) {
  const [messages, setMessages] = useState([{ role: 'assistant', content: `I'm analyzing page ${activeDoc.progress}. Ask me anything about it.` }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);
  useEffect(() => { setMessages([{ role: 'assistant', content: `I'm analyzing page ${activeDoc.progress}. Ask me anything about it.` }]); }, [activeDoc.progress]);

  const handleChat = async () => {
    if (!input.trim() || loading) return;
    const msg = input; setInput("");
    setMessages(p => [...p, { role: 'user', content: msg }]);
    setLoading(true);
    try {
      const text = activeDoc.pagesText[activeDoc.progress] || "No text found on this page.";
      const prompt = `CONTEXT (Page ${activeDoc.progress}):\n${text}\n\nQUESTION:\n${msg}`;
      const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${settings.apiKey}`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], systemInstruction: { parts: [{ text: settings.strictMode ? "Answer ONLY using the provided context." : "You are a helpful tutor." }] }})
      });
      if (!res.ok) throw new Error("API_ERROR");
      const data = await res.json();
      setMessages(p => [...p, { role: 'assistant', content: data.candidates[0].content.parts[0].text }]);
    } catch (e) {
      setMessages(p => [...p, { role: 'assistant', content: "⚠️ Failed to get an answer. Please check your API key in Settings and ensure you have internet." }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      <div className="flex-1 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 mt-0.5 ${m.role === 'user' ? 'bg-indigo-600' : 'bg-zinc-800 border border-zinc-700'}`}>
              {m.role === 'user' ? <List size={12} className="text-white" /> : <BrainCircuit size={12} className="text-indigo-400" />}
            </div>
            <div className={`p-3 max-w-[85%] text-xs leading-relaxed ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-xl rounded-tr-sm' : 'bg-zinc-900 border border-zinc-800 rounded-xl rounded-tl-sm text-zinc-300 whitespace-pre-wrap'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3">
             <div className="w-6 h-6 rounded bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 mt-0.5"><Loader2 size={12} className="text-indigo-400 animate-spin" /></div>
             <div className="p-3 bg-zinc-900 border border-zinc-800 rounded-xl rounded-tl-sm flex gap-1"><span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{animationDelay:'0.1s'}}></span><span className="w-1.5 h-1.5 bg-zinc-600 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></span></div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="p-3 bg-zinc-950 border-t border-zinc-800 shrink-0">
        <div className="relative flex items-end bg-zinc-900 border border-zinc-800 rounded-lg focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all">
          <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault(); handleChat();}}} placeholder={`Ask about page ${activeDoc.progress}...`} disabled={loading} className="w-full bg-transparent p-3 pr-10 text-xs text-white outline-none resize-none max-h-32 custom-scrollbar" style={{minHeight:'44px'}} />
          <button onClick={handleChat} disabled={loading||!input.trim()} className="absolute right-1 bottom-1 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 rounded text-white transition-colors"><Send size={14}/></button>
        </div>
      </div>
    </div>
  );
}

function PanelReview({ activeDocId, flashcards, setFlashcards, exams, setExams, notes, setNotes }) {
  const docCards = flashcards.filter(f => f.docId === activeDocId);
  const docExams = exams.filter(e => e.docId === activeDocId);
  const docNotes = notes.filter(n => n.docId === activeDocId);

  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-4 bg-zinc-950 space-y-8">
      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-indigo-400 mb-3 flex items-center gap-2"><Layers size={14}/> Document Cards ({docCards.length})</h3>
        {docCards.length === 0 ? <p className="text-xs text-zinc-600 italic">No flashcards generated for this document.</p> : (
          <div className="space-y-2">
            {docCards.slice(0, 5).map(c => (
              <div key={c.id} className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg relative group pr-8">
                <p className="text-xs text-zinc-300 font-bold truncate">Q: {c.q}</p>
                <button onClick={() => setFlashcards(flashcards.filter(f => f.id !== c.id))} className="absolute top-1/2 -translate-y-1/2 right-2 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
              </div>
            ))}
            {docCards.length > 5 && <p className="text-xs text-zinc-500 text-center pt-2">+{docCards.length - 5} more in main Flashcards tab.</p>}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-emerald-400 mb-3 flex items-center gap-2"><GraduationCap size={14}/> Document Exams ({docExams.length})</h3>
        {docExams.length === 0 ? <p className="text-xs text-zinc-600 italic">No exams generated for this document.</p> : (
          <div className="space-y-2">
            {docExams.map(e => (
              <div key={e.id} className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg flex justify-between items-center group">
                <div><p className="text-xs text-zinc-300 font-bold">{e.title}</p><p className="text-[10px] text-zinc-500">{e.questions.length} Qs • Pgs {e.sourcePages}</p></div>
                <button onClick={() => setExams(exams.filter(ex => ex.id !== e.id))} className="text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
              </div>
            ))}
          </div>
        )}
      </div>

      <div>
        <h3 className="text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-3 flex items-center gap-2"><BookA size={14}/> Document Notes ({docNotes.length})</h3>
        {docNotes.length === 0 ? <p className="text-xs text-zinc-600 italic">No summaries generated for this document.</p> : (
          <div className="space-y-2">
            {docNotes.map(n => (
              <div key={n.id} className="bg-zinc-900 border border-zinc-800 p-2.5 rounded-lg group relative pr-8">
                <p className="text-xs text-zinc-300 font-bold">{n.title}</p>
                <p className="text-[10px] text-zinc-500 truncate mt-1">{n.content}</p>
                <button onClick={() => setNotes(notes.filter(no => no.id !== n.id))} className="absolute top-1/2 -translate-y-1/2 right-2 text-zinc-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash2 size={14}/></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}