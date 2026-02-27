import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  BookOpen, Layers, CheckSquare, Settings, 
  ChevronLeft, ChevronRight, Upload, MessageSquare, 
  CheckCircle2, XCircle, BrainCircuit,
  Library, Trash2, Loader2, List,
  Send, ShieldAlert, LayoutDashboard,
  GraduationCap, Save, X, BookA, Crosshair,
  PanelRightClose, PanelRightOpen, KeyRound, AlertCircle,
  FileUp, Target, Info, Trash, Sparkles, Activity, Stethoscope, Lightbulb, Baby, Play, Bookmark, History,
  Dna, Microscope, Pill, Thermometer, ClipboardList, Zap
} from 'lucide-react';

const DB_NAME = 'MariamProDB_v4';
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

const callAI = async (prompt, expectJson, strictMode, apiKey) => {
  if (!apiKey?.trim()) throw new Error("OpenAI API Key is missing. Add it in settings.");
  
  const sysPrompt = strictMode 
    ? "You are a world-class Medical Board Examiner. Generate questions at USMLE Step 3 and Specialty Fellowship levels. Use extremely long, complex clinical vignettes (300+ words). Focus on multi-step reasoning: (1) Diagnosis, (2) Most likely underlying mechanism, (3) Management of a secondary complication. Use sophisticated medical terminology. Strictly use provided text." 
    : "You are an elite professor of medicine and clinical diagnostic lead.";

  const res = await fetch(`https://api.openai.com/v1/chat/completions`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey.trim()}` },
    body: JSON.stringify({
      model: 'gpt-4o',
      messages: [
        { role: "system", content: sysPrompt + (expectJson ? " Respond in valid JSON format only." : "") },
        { role: "user", content: prompt }
      ],
      response_format: expectJson ? { type: "json_object" } : { type: "text" }
    })
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(`${errData.error?.message || res.statusText || 'API Error'}`);
  }

  const data = await res.json();
  return data.choices[0].message.content;
};

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [activeDocId, setActiveDocId] = useState(null);
  const [flashcards, setFlashcards] = useState([]);
  const [exams, setExams] = useState([]);
  const [notes, setNotes] = useState([]);
  const [bookmarks, setBookmarks] = useState([]);
  const [userSettings, setUserSettings] = useState({ apiKey: '', strictMode: true });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentView, setCurrentView] = useState('library');
  const [rightPanelTab, setRightPanelTab] = useState('generate');
  const [rightPanelOpen, setRightPanelOpen] = useState(true);

  useEffect(() => {
    const savedDocs = localStorage.getItem('dm_docs');
    const savedCards = localStorage.getItem('dm_cards');
    const savedExams = localStorage.getItem('dm_exams');
    const savedNotes = localStorage.getItem('dm_notes');
    const savedSettings = localStorage.getItem('dm_settings');
    const savedBookmarks = localStorage.getItem('dm_bookmarks');
    if (savedDocs) setDocuments(JSON.parse(savedDocs));
    if (savedCards) setFlashcards(JSON.parse(savedCards));
    if (savedExams) setExams(JSON.parse(savedExams));
    if (savedNotes) setNotes(JSON.parse(savedNotes));
    if (savedSettings) setUserSettings(JSON.parse(savedSettings));
    if (savedBookmarks) setBookmarks(JSON.parse(savedBookmarks));
  }, []);

  useEffect(() => {
    localStorage.setItem('dm_docs', JSON.stringify(documents));
    localStorage.setItem('dm_cards', JSON.stringify(flashcards));
    localStorage.setItem('dm_exams', JSON.stringify(exams));
    localStorage.setItem('dm_notes', JSON.stringify(notes));
    localStorage.setItem('dm_settings', JSON.stringify(userSettings));
    localStorage.setItem('dm_bookmarks', JSON.stringify(bookmarks));
  }, [documents, flashcards, exams, notes, userSettings, bookmarks]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== 'application/pdf') return;
    setIsUploading(true);
    setUploadProgress(5);
    try {
      const arrayBuffer = await file.arrayBuffer();
      const pdfjsLib = await loadPdfJs();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const totalPages = pdf.numPages;
      const pagesText = {};
      for (let i = 1; i <= totalPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();
        pagesText[i] = textContent.items.map(s => s.str).join(' ');
        setUploadProgress(5 + Math.floor((i / totalPages) * 95));
      }
      const id = Date.now().toString();
      const newDoc = { id, name: file.name, totalPages, pagesText, progress: 1, addedAt: new Date().toISOString() };
      await savePdfData(id, arrayBuffer);
      setDocuments(prev => [...prev, newDoc]);
      setActiveDocId(id);
      setCurrentView('reader');
    } catch (e) { console.error(e); } finally { setIsUploading(false); setUploadProgress(0); }
  };

  const activeDoc = useMemo(() => documents.find(d => d.id === activeDocId), [activeDocId, documents]);

  return (
    <div className="flex h-screen bg-[#050505] text-zinc-300 font-sans overflow-hidden">
      <nav className="w-20 bg-[#09090b] border-r border-zinc-800/80 flex flex-col items-center py-6 z-20 shrink-0">
        <div className="w-12 h-12 rounded-[1.25rem] bg-indigo-600 flex items-center justify-center shadow-2xl mb-12 cursor-pointer active:scale-95 transition-all" onClick={() => { setActiveDocId(null); setCurrentView('library'); }}>
          <BrainCircuit className="text-white w-7 h-7" />
        </div>
        <div className="flex-1 flex flex-col gap-8 w-full px-2">
          <SidebarBtn icon={Library} label="Knowledge" active={currentView === 'library' && !activeDocId} onClick={() => { setActiveDocId(null); setCurrentView('library'); }} />
          <SidebarBtn icon={Layers} label="Active Recall" active={currentView === 'flashcards' && !activeDocId} onClick={() => { setActiveDocId(null); setCurrentView('flashcards'); }} />
          <SidebarBtn icon={GraduationCap} label="Board Exams" active={currentView === 'exams' && !activeDocId} onClick={() => { setActiveDocId(null); setCurrentView('exams'); }} />
          <SidebarBtn icon={BookA} label="Case Notes" active={currentView === 'notes' && !activeDocId} onClick={() => { setActiveDocId(null); setCurrentView('notes'); }} />
          {activeDocId && (
            <>
              <div className="w-8 h-px bg-zinc-800 mx-auto" />
              <SidebarBtn icon={BookOpen} label="Reader" active={activeDocId !== null} onClick={() => setCurrentView('reader')} highlight />
            </>
          )}
        </div>
        <SidebarBtn icon={Settings} label="System" active={currentView === 'settings'} onClick={() => { setActiveDocId(null); setCurrentView('settings'); }} />
      </nav>

      <main className="flex-1 flex flex-col relative bg-[#050505] min-w-0">
        {isUploading && (
          <div className="absolute top-0 left-0 w-full h-1.5 bg-indigo-600 z-50 shadow-[0_0_20px_rgba(79,70,229,1)]" style={{ width: `${uploadProgress}%` }}></div>
        )}

        {!activeDocId && currentView === 'library' && (
          <LibraryView documents={documents} onUpload={handleFileUpload} onOpen={setActiveDocId} isUploading={isUploading} deleteDoc={(id, e) => { e.stopPropagation(); setDocuments(p => p.filter(d => d.id !== id)); }} flashcards={flashcards} exams={exams} notes={notes} setView={setCurrentView} />
        )}
        {!activeDocId && currentView === 'flashcards' && <FlashcardsGlobalView flashcards={flashcards} setFlashcards={setFlashcards} setView={setCurrentView} />}
        {!activeDocId && currentView === 'exams' && <ExamsGlobalView exams={exams} setExams={setExams} setView={setCurrentView} />}
        {!activeDocId && currentView === 'notes' && <NotesGlobalView notes={notes} setNotes={setNotes} setView={setCurrentView} />}
        {!activeDocId && currentView === 'settings' && <div className="flex-1 flex items-center justify-center p-10"><PanelSettings settings={userSettings} setSettings={setUserSettings} /></div>}

        {activeDocId && activeDoc && (
          <PdfWorkspace activeDoc={activeDoc} setDocuments={setDocuments} closeDoc={() => setActiveDocId(null)} rightPanelOpen={rightPanelOpen} setRightPanelOpen={setRightPanelOpen} />
        )}
      </main>

      {rightPanelOpen && activeDoc && (
        <aside className="w-[520px] bg-[#09090b] border-l border-zinc-800 flex flex-col shrink-0 z-20 shadow-[-10px_0_60px_rgba(0,0,0,0.9)]">
          <div className="h-16 flex p-2 border-b border-zinc-800 shrink-0 gap-1 items-center bg-[#070708]">
            <PanelTab active={rightPanelTab === 'generate'} onClick={() => setRightPanelTab('generate')} label="AI Studio" icon={Sparkles} />
            <PanelTab active={rightPanelTab === 'chat'} onClick={() => setRightPanelTab('chat')} label="Professor" icon={MessageSquare} />
            <PanelTab active={rightPanelTab === 'review'} onClick={() => setRightPanelTab('review')} label="Vault" icon={Layers} />
            <PanelTab active={rightPanelTab === 'settings'} onClick={() => setRightPanelTab('settings')} label="Key" icon={KeyRound} />
          </div>
          <div className="flex-1 overflow-hidden relative">
            {!userSettings.apiKey?.trim() ? <PanelSettings settings={userSettings} setSettings={setUserSettings} /> : 
            rightPanelTab === 'generate' ? <PanelGenerate activeDoc={activeDoc} settings={userSettings} setFlashcards={setFlashcards} setExams={setExams} setNotes={setNotes} switchToReview={() => setRightPanelTab('review')} /> :
            rightPanelTab === 'chat' ? <PanelChat activeDoc={activeDoc} settings={userSettings} /> :
            <PanelReview activeDocId={activeDoc.id} flashcards={flashcards} setFlashcards={setFlashcards} exams={exams} setExams={setExams} notes={notes} setNotes={setNotes} />}
          </div>
        </aside>
      )}
    </div>
  );
}

function SidebarBtn({ icon: Icon, label, active, onClick, highlight }) {
  return (
    <button onClick={onClick} className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center transition-all group relative ${active ? highlight ? 'bg-indigo-600 text-white shadow-xl' : 'bg-zinc-800 text-white' : 'text-zinc-500 hover:bg-zinc-800/50 hover:text-white'}`}>
      <Icon size={24} />
      <span className="absolute left-16 bg-zinc-800 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 rounded opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity border border-zinc-700 z-50">
        {label}
      </span>
    </button>
  );
}

function PanelTab({ active, onClick, label, icon: Icon }) {
  return (
    <button onClick={onClick} className={`flex-1 flex flex-col items-center justify-center gap-1.5 h-full rounded-xl text-[10px] font-black uppercase tracking-[0.1em] transition-all ${active ? 'bg-zinc-800/80 text-indigo-400 border border-zinc-700/50' : 'text-zinc-600 hover:text-zinc-300'}`}>
      <Icon size={18} /> {label}
    </button>
  );
}

function LibraryView({ documents, onUpload, onOpen, isUploading, deleteDoc, flashcards, exams, notes, setView }) {
  return (
    <div className="flex-1 overflow-auto p-12 custom-scrollbar">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-6xl font-black text-white mb-16 tracking-tighter">Medical <span className="text-indigo-600">Cognition</span></h1>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
           <StatCard icon={BookA} label="Case Notes" count={notes.length} color="blue" onClick={() => setView('notes')} />
           <StatCard icon={Layers} label="Flashcards" count={flashcards.length} color="emerald" onClick={() => setView('flashcards')} />
           <StatCard icon={GraduationCap} label="Board Exams" count={exams.length} color="purple" onClick={() => setView('exams')} />
        </div>

        <div className="flex justify-between items-center mb-10">
           <h2 className="text-2xl font-black text-white uppercase tracking-tighter border-l-4 border-indigo-600 pl-6">Clinical Database</h2>
           <label className="cursor-pointer bg-white text-black px-10 py-4 rounded-[1.5rem] font-black text-xs uppercase tracking-widest hover:scale-105 transition-all shadow-2xl">
             {isUploading ? "OPTIMIZING TEXT LAYERS..." : "IMPORT LOCAL PDF"}
             <input type="file" accept="application/pdf" className="hidden" onChange={onUpload} disabled={isUploading} />
          </label>
        </div>

        {documents.length === 0 ? (
          <div className="border border-zinc-800 rounded-[3rem] bg-zinc-900/10 p-24 text-center">
            <FileUp size={64} className="mx-auto text-zinc-800 mb-6" />
            <p className="text-zinc-600 font-bold uppercase tracking-widest">Repository empty. Upload professional PDF files to begin.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {documents.map(doc => (
              <div key={doc.id} onClick={() => onOpen(doc.id)} className="bg-zinc-900/60 rounded-[2.5rem] p-10 border border-zinc-800 hover:border-indigo-500/50 transition-all cursor-pointer group shadow-2xl relative">
                <div className="flex justify-between items-start mb-8">
                   <div className="w-14 h-14 bg-zinc-950 rounded-2xl flex items-center justify-center border border-zinc-800 group-hover:bg-indigo-600 transition-colors group-hover:border-indigo-500 shadow-xl">
                      <BookOpen size={28} className="text-zinc-600 group-hover:text-white" />
                   </div>
                   <button onClick={(e) => deleteDoc(doc.id, e)} className="p-3 text-zinc-700 hover:text-red-500 transition-colors"><Trash2 size={20}/></button>
                </div>
                <h3 className="font-black text-white text-xl line-clamp-2 leading-tight mb-8 h-14 uppercase tracking-tight">{doc.name}</h3>
                <div className="bg-zinc-950/80 p-4 rounded-2xl flex justify-between items-center border border-zinc-800">
                   <span className="text-[10px] font-black text-zinc-500 uppercase tracking-widest">PG {doc.progress} of {doc.totalPages}</span>
                   <div className="w-16 h-1 bg-zinc-800 rounded-full overflow-hidden">
                      <div className="h-full bg-indigo-500" style={{width:`${(doc.progress/doc.totalPages)*100}%`}} />
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

function StatCard({ icon: Icon, label, count, color, onClick }) {
  const colors = { blue: 'border-blue-500/20 text-blue-500', emerald: 'border-emerald-500/20 text-emerald-500', purple: 'border-purple-500/20 text-purple-500' };
  return (
    <div onClick={onClick} className={`bg-zinc-900 border ${colors[color]} p-8 rounded-[3rem] flex items-center gap-8 cursor-pointer hover:scale-[1.02] transition-all shadow-2xl`}>
      <div className="w-16 h-16 rounded-2xl bg-zinc-950 flex items-center justify-center shrink-0 shadow-inner"><Icon size={32}/></div>
      <div><p className="text-5xl font-black text-white tracking-tighter">{count}</p><p className="text-[11px] font-black text-zinc-500 uppercase tracking-widest mt-1">{label}</p></div>
    </div>
  );
}

function PdfWorkspace({ activeDoc, setDocuments, closeDoc, rightPanelOpen, setRightPanelOpen }) {
  const [currentPage, setCurrentPage] = useState(activeDoc.progress || 1);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const frameRef = useRef(null);

  useEffect(() => {
    let url = null;
    const load = async () => {
      setIsLoading(true);
      const buffer = await getPdfData(activeDoc.id);
      if (buffer) {
        const blob = new Blob([buffer], { type: 'application/pdf' });
        url = URL.createObjectURL(blob);
        setPdfUrl(url);
      }
      setIsLoading(false);
    };
    load();
    return () => { if(url) URL.revokeObjectURL(url); };
  }, [activeDoc.id]);

  const navigate = (dir) => {
    const next = Math.max(1, Math.min(activeDoc.totalPages, currentPage + dir));
    if (next !== currentPage) {
      setCurrentPage(next);
      setDocuments(p => p.map(d => d.id === activeDoc.id ? {...d, progress: next} : d));
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050505]">
      <div className="h-16 flex items-center justify-between px-6 bg-[#09090b] border-b border-zinc-800 shrink-0">
        <div className="flex items-center gap-5">
           <button onClick={closeDoc} className="bg-zinc-900 text-zinc-400 px-6 py-2.5 rounded-[1rem] text-[10px] font-black uppercase tracking-widest hover:text-white transition-all shadow-xl">BACK TO HUB</button>
           <div className="w-px h-6 bg-zinc-800" />
           <span className="text-sm font-black text-zinc-300 truncate max-w-sm tracking-tight">{activeDoc.name}</span>
        </div>

        <div className="flex items-center bg-[#070709] rounded-2xl border border-zinc-800 h-12 px-2 shadow-2xl overflow-hidden">
           <button onClick={() => navigate(-1)} className="p-2 text-zinc-500 hover:text-white transition-colors active:scale-90"><ChevronLeft size={28}/></button>
           <div className="px-8 flex items-center font-mono font-black text-white text-sm tracking-[0.4em] bg-zinc-900/50 rounded-xl h-9 border border-zinc-800 shadow-inner">
              <span className="text-indigo-400">PG {currentPage}</span> <span className="text-zinc-700 mx-4">|</span> {activeDoc.totalPages}
           </div>
           <button onClick={() => navigate(1)} className="p-2 text-zinc-500 hover:text-white transition-colors active:scale-90"><ChevronRight size={28}/></button>
        </div>

        <button onClick={() => setRightPanelOpen(!rightPanelOpen)} className={`p-3 rounded-2xl border-2 transition-all ${rightPanelOpen ? 'bg-indigo-600 border-indigo-400 text-white shadow-[0_0_30px_indigo]' : 'bg-zinc-900 border-zinc-800 text-zinc-600'}`}>
           <PanelRightClose size={24}/>
        </button>
      </div>

      <div className="flex-1 bg-[#121214] flex justify-center relative overflow-hidden">
        {isLoading ? (
          <div className="m-auto flex flex-col items-center gap-6 animate-pulse">
             <div className="w-16 h-16 rounded-full border-4 border-indigo-600 border-t-transparent animate-spin" />
             <p className="text-[10px] font-black text-zinc-600 uppercase tracking-[0.5em]">Optimizing local viewer...</p>
          </div>
        ) : (
          pdfUrl && (
            <iframe 
              ref={frameRef}
              key={`${activeDoc.id}-${currentPage}`} 
              src={`${pdfUrl}#page=${currentPage}&view=FitH&toolbar=0&navpanes=0&scrollbar=0`} 
              className="w-full h-full border-none shadow-2xl"
              style={{ maxWidth: '95vw' }}
            />
          )
        )}
      </div>
    </div>
  );
}

function PanelGenerate({ activeDoc, settings, setFlashcards, setExams, setNotes, switchToReview }) {
  const [pRange, setPRange] = useState({ start: activeDoc.progress, end: activeDoc.progress });
  const [mode, setMode] = useState('exam');
  const [volume, setVolume] = useState(25);
  const [loading, setLoading] = useState({ state: false, msg: '' });
  const [tempResults, setTempResults] = useState(null);

  useEffect(() => { if(!loading.state && !tempResults) setPRange({ start: activeDoc.progress, end: activeDoc.progress }); }, [activeDoc.progress]);

  const runAlgorithm = async () => {
    setLoading({ state: true, msg: 'Indexing medical context...' });
    try {
      let text = "";
      for (let i = pRange.start; i <= pRange.end; i++) if (activeDoc.pagesText[i]) text += `[PG ${i}]\n${activeDoc.pagesText[i]}\n`;
      if(!text.trim()) throw new Error("Null context - pages may be scanned images.");
      setLoading({ state: true, msg: 'OpenAI Elite Engine Analysis...' });
      if (mode === 'exam') {
        const p = `Generate a ${volume} question Medical Board Examination from text. Vignettes must be 300+ words. { "title": "Board Review", "items": [ { "q": "vignette", "options": ["A","B","C","D","E"], "correct": 0, "explanation": "text" } ] }.\n\nTEXT:\n${text}`;
        const raw = await callAI(p, true, settings.strictMode, settings.apiKey);
        const data = JSON.parse(raw);
        setTempResults({ type: 'exam', title: data.title, items: data.items, pages: `${pRange.start}-${pRange.end}` });
      } else if (mode === 'flashcards') {
        const p = `Create ${volume} high-yield flashcards. { "items": [ {"q": "Question", "a": "Answer"} ] }.\n\nTEXT:\n${text}`;
        const raw = await callAI(p, true, settings.strictMode, settings.apiKey);
        setTempResults({ type: 'flashcards', items: JSON.parse(raw).items, pages: `${pRange.start}-${pRange.end}` });
      } else if (mode === 'notes') {
        const p = `Extract physiological notes. { "content": "markdown_text" }.\n\nTEXT:\n${text}`;
        const raw = await callAI(p, true, settings.strictMode, settings.apiKey);
        setTempResults({ type: 'notes', content: JSON.parse(raw).content, pages: `${pRange.start}-${pRange.end}` });
      }
      setLoading({ state: false, msg: '' });
    } catch (e) { setLoading({ state: false, msg: e.message, err: true }); }
  };

  const save = () => {
    if (tempResults.type === 'exam') setExams(p => [...p, { id: Date.now().toString(), docId: activeDoc.id, sourcePages: tempResults.pages, title: tempResults.title, questions: tempResults.items }]);
    else if (tempResults.type === 'flashcards') setFlashcards(p => [...p, ...tempResults.items.map(i => ({id: Date.now()+Math.random(), docId: activeDoc.id, sourcePages: tempResults.pages, q: i.q, a: i.a}))]);
    else setNotes(p => [...p, { id: Date.now().toString(), docId: activeDoc.id, title: `Clinical Synthesis Pgs ${tempResults.pages}`, content: tempResults.content }]);
    setTempResults(null);
    switchToReview();
  };

  return (
    <div className="h-full flex flex-col p-8 bg-[#09090b]">
       {!tempResults ? (
         <div className="space-y-8 bg-zinc-950/50 p-10 rounded-[3rem] border border-zinc-800 shadow-2xl">
            <div className="flex gap-4">
               <div className="flex-1">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-4 ml-1">SCOPE BEGIN</label>
                  <input type="number" value={pRange.start} onChange={e=>setPRange({...pRange, start: Number(e.target.value)})} className="w-full bg-[#050505] border border-zinc-800 rounded-2xl p-4 text-white font-bold text-center outline-none focus:border-indigo-600" />
               </div>
               <div className="flex-1">
                  <label className="text-[10px] font-black text-zinc-600 uppercase tracking-widest block mb-4 ml-1">SCOPE END</label>
                  <input type="number" value={pRange.end} onChange={e=>setPRange({...pRange, end: Number(e.target.value)})} className="w-full bg-[#050505] border border-zinc-800 rounded-2xl p-4 text-white font-bold text-center outline-none focus:border-indigo-600" />
               </div>
            </div>
            <div className="grid grid-cols-3 gap-3">
               {['exam', 'flashcards', 'notes'].map(m => (
                 <button key={m} onClick={()=>setMode(m)} className={`py-4 rounded-2xl text-[10px] font-black uppercase border transition-all ${mode===m?'bg-indigo-600 border-indigo-400 text-white shadow-xl':'bg-zinc-900 border-zinc-800 text-zinc-500'}`}>{m}</button>
               ))}
            </div>
            <input type="range" min="1" max="50" value={volume} onChange={e=>setVolume(parseInt(e.target.value))} className="w-full accent-indigo-500 bg-zinc-800 h-1.5 rounded-full appearance-none cursor-pointer" />
            <button onClick={runAlgorithm} disabled={loading.state} className="w-full py-6 bg-white text-zinc-950 rounded-3xl font-black text-xs uppercase tracking-[0.3em] flex items-center justify-center gap-3 active:scale-95 transition-all shadow-2xl">
               {loading.state ? <Loader2 className="animate-spin" size={24}/> : <Zap size={24} fill="currentColor"/>} INITIALIZE AI 
            </button>
         </div>
       ) : (
         <div className="flex-1 flex flex-col bg-zinc-950 border border-emerald-500/20 rounded-[3rem] overflow-hidden shadow-2xl">
            <div className="p-8 bg-emerald-500/5 border-b border-emerald-500/20 flex justify-between items-center">
               <span className="text-[10px] font-black uppercase tracking-widest text-emerald-500">RAW EXTRACTION SUCCESSFUL</span>
               <div className="flex gap-4">
                  <button onClick={()=>setTempResults(null)} className="px-6 py-3 bg-zinc-900 text-zinc-500 rounded-2xl font-black text-[10px] uppercase">DISCARD</button>
                  <button onClick={save} className="px-6 py-3 bg-emerald-600 text-white rounded-2xl font-black text-[10px] uppercase">SAVE TO VAULT</button>
               </div>
            </div>
            <div className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
               {tempResults.type === 'exam' && tempResults.items.map((it, i) => (
                 <div key={i} className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] shadow-sm"><p className="text-sm text-white font-black leading-relaxed mb-4">ITEM {i+1}</p><p className="text-sm text-zinc-400 line-clamp-3">{it.q}</p></div>
               ))}
               {tempResults.type === 'flashcards' && tempResults.items.map((it, i) => (
                 <div key={i} className="bg-zinc-900 border border-zinc-800 p-6 rounded-[2rem]"><p className="text-xs text-white font-bold leading-relaxed">Q: {it.q}</p></div>
               ))}
               {tempResults.type === 'notes' && <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed prose prose-invert max-w-none">{tempResults.content}</div>}
            </div>
         </div>
       )}
    </div>
  );
}

function PanelChat({ activeDoc, settings }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [load, setLoad] = useState(false);
  const end = useRef(null);
  useEffect(() => { setMessages([{ role: 'assistant', content: `Monitoring **Page ${activeDoc.progress}**. State diagnostic objectives for this context.` }]); }, [activeDoc.progress]);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, load]);
  const send = async () => {
    if(!input.trim() || load) return;
    const m = input; setInput("");
    setMessages(p => [...p, { role: 'user', content: m }]);
    setLoad(true);
    try {
      const res = await callAI(`CONTEXT PG ${activeDoc.progress}:\n${activeDoc.pagesText[activeDoc.progress]}\n\nQUESTION: ${m}`, false, settings.strictMode, settings.apiKey);
      setMessages(p => [...p, { role: 'assistant', content: res }]);
    } catch(e) { setMessages(p => [...p, { role: 'assistant', content: `ERROR: ${e.message}` }]); }
    setLoad(false);
  };
  return (
    <div className="h-full flex flex-col bg-[#09090b]">
       <div className="bg-indigo-600 px-6 py-3 flex items-center gap-4 shadow-xl z-10 shrink-0"><Target size={18} className="text-white" /><span className="text-[10px] font-black uppercase tracking-[0.3em] text-white">LOCKED ON PAGE {activeDoc.progress}</span></div>
       <div className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-6 ${m.role==='user'?'flex-row-reverse':''}`}>
               <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-xl ${m.role==='user'?'bg-indigo-600':'bg-zinc-900 border border-zinc-800'}`}>{m.role==='user'?<List size={22}/>:<BrainCircuit size={22} className="text-indigo-400"/>}</div>
               <div className={`p-8 max-w-[85%] text-sm leading-relaxed shadow-2xl ${m.role==='user'?'bg-indigo-600 text-white rounded-[2.5rem] rounded-tr-sm':'bg-zinc-900 border border-zinc-800 rounded-[2.5rem] rounded-tl-sm text-zinc-300'}`}>{m.content}</div>
            </div>
          ))}
          {load && <div className="p-8 flex items-center gap-4 text-zinc-600 text-[10px] font-black uppercase tracking-[0.4em] animate-pulse"><Loader2 className="animate-spin" size={16}/> NEURAL SYNC...</div>}
          <div ref={end} />
       </div>
       <div className="p-8 border-t border-zinc-800 bg-[#070709]">
          <div className="relative flex items-end bg-zinc-950 border border-zinc-800 rounded-[2rem] p-1 shadow-inner focus-within:border-indigo-600 transition-all">
             <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault(); send();}}} className="w-full bg-transparent p-5 pr-24 text-sm text-white outline-none resize-none min-h-[80px] max-h-48 leading-relaxed font-medium" placeholder="Query clinical context..." />
             <button onClick={send} className="absolute right-4 bottom-4 p-5 bg-indigo-600 text-white rounded-3xl shadow-2xl active:scale-90 transition-all"><Send size={28}/></button>
          </div>
       </div>
    </div>
  );
}

function PanelReview({ activeDocId, flashcards, setFlashcards, exams, setExams, notes, setNotes }) {
  const [active, setActive] = useState(null);
  const docCards = flashcards.filter(f => f.docId === activeDocId);
  const docExams = exams.filter(e => e.docId === activeDocId);
  const docNotes = notes.filter(n => n.docId === activeDocId);
  if (active?.type === 'exam') return <InPanelExam exam={active.data} onBack={() => setActive(null)} />;
  if (active?.type === 'flashcards') return <InPanelFlashcards cards={docCards} onBack={() => setActive(null)} />;
  return (
    <div className="h-full overflow-y-auto p-10 bg-[#09090b] space-y-16 custom-scrollbar">
      <div>
        <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-emerald-400 mb-8 border-b border-zinc-800 pb-4">BOARD EXAMINATION VAULT</h3>
        <div className="space-y-8">
           {docExams.map(e => (
             <div key={e.id} className="bg-zinc-900 border border-zinc-800 p-10 rounded-[3rem] shadow-2xl transition-all hover:border-emerald-500/40">
                <div className="flex justify-between items-start mb-10">
                   <div>
                      <p className="text-2xl font-black text-white leading-none mb-3 tracking-tight">{e.title}</p>
                      <span className="text-[10px] font-black uppercase text-zinc-500 bg-zinc-950 px-4 py-2 rounded-xl border border-zinc-800">{e.questions.length} ITEMS • PGS {e.sourcePages}</span>
                   </div>
                   <button onClick={() => setExams(p => p.filter(ex => ex.id !== e.id))} className="p-4 bg-zinc-950 text-zinc-700 hover:text-red-500 rounded-[1.5rem] border border-zinc-800"><Trash2 size={24}/></button>
                </div>
                <button onClick={() => setActive({ type: 'exam', data: e })} className="w-full py-6 bg-emerald-600 text-white rounded-3xl font-black text-sm uppercase tracking-[0.3em] shadow-2xl flex items-center justify-center gap-4 hover:bg-emerald-500 transition-all">
                   <Play size={20} fill="currentColor" /> INITIATE BOARD REVIEW
                </button>
             </div>
           ))}
        </div>
      </div>
      <div>
        <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-4">
           <h3 className="text-[11px] font-black uppercase tracking-[0.3em] text-indigo-400">ACTIVE RECALL CARDS</h3>
           {docCards.length > 0 && <button onClick={() => setActive({ type: 'flashcards' })} className="text-[10px] bg-indigo-600 text-white px-8 py-3 rounded-2xl font-black uppercase tracking-widest shadow-xl flex items-center gap-3 hover:bg-indigo-500 transition-all active:scale-90"><Play size={16} fill="currentColor"/> STUDY</button>}
        </div>
        <div className="grid grid-cols-1 gap-6">
           {docCards.slice(0, 5).map(c => <div key={c.id} className="bg-zinc-900 border border-zinc-800 p-8 rounded-[2rem] text-sm text-zinc-400 font-bold leading-relaxed">{c.q}</div>)}
        </div>
      </div>
    </div>
  );
}

function InPanelExam({ exam, onBack }) {
  const [qIdx, setQIdx] = useState(0);
  const [feedback, setFeedback] = useState(null);
  const q = exam.questions[qIdx];
  const select = (idx) => { if(feedback) return; setFeedback({ isCorrect: idx === q.correct, selected: idx }); };
  const next = () => { setFeedback(null); if(qIdx < exam.questions.length - 1) setQIdx(qIdx + 1); else onBack(); };
  return (
    <div className="flex flex-col h-full bg-[#050505]">
       <div className="bg-emerald-600 px-10 py-8 flex justify-between items-center shadow-2xl z-10 shrink-0">
          <button onClick={onBack} className="text-white font-black text-xs uppercase tracking-[0.3em] flex items-center gap-3 active:scale-90 transition-all"><ChevronLeft size={24}/> TERMINATE EXAM</button>
          <span className="text-[11px] font-black text-white bg-black/20 px-6 py-3 rounded-full uppercase tracking-widest">CLINICAL ITEM {qIdx+1} / {exam.questions.length}</span>
       </div>
       <div className="flex-1 overflow-y-auto p-12 lg:p-16 custom-scrollbar">
          <h2 className="text-2xl text-white font-black mb-16 leading-relaxed tracking-tight">{q.q}</h2>
          <div className="space-y-6">
             {q.options.map((opt, i) => {
                const isSel = feedback?.selected === i;
                const isCor = i === q.correct;
                let cls = "border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:border-zinc-600";
                if(feedback) {
                   if(isCor) cls = "border-emerald-500 bg-emerald-500/10 text-emerald-400 font-black shadow-[0_0_50px_rgba(16,185,129,0.2)]";
                   else if(isSel) cls = "border-red-500 bg-red-500/10 text-red-400 font-black";
                   else cls = "border-zinc-900 bg-zinc-950 opacity-20";
                }
                return (
                  <button key={i} onClick={() => select(i)} className={`w-full text-left p-8 rounded-[2.5rem] border-4 transition-all flex gap-8 items-start ${cls}`}>
                     <div className={`w-10 h-10 rounded-2xl border-4 shrink-0 flex items-center justify-center mt-0.5 ${isSel||(feedback&&isCor)?'border-current':'border-zinc-800 bg-zinc-950'}`}>
                        {(isSel||(feedback&&isCor)) ? <div className="w-4 h-4 rounded bg-current" /> : <span className="text-xs font-black text-zinc-700">{String.fromCharCode(65+i)}</span>}
                     </div>
                     <span className="text-lg font-bold leading-relaxed">{opt}</span>
                  </button>
                );
             })}
          </div>
          {feedback && (
            <div className="mt-20 p-14 rounded-[4rem] border-4 shadow-2xl bg-[#09090b] border-zinc-800">
               <div className="flex items-center gap-6 mb-10">
                  {feedback.isCorrect ? <CheckCircle2 size={48} className="text-emerald-500"/> : <XCircle size={48} className="text-red-500"/>}
                  <h3 className={`text-2xl font-black uppercase tracking-[0.3em] ${feedback.isCorrect?'text-emerald-500':'text-red-500'}`}>{feedback.isCorrect?'ACCURATE':'ERROR'}</h3>
               </div>
               <div className="text-xl text-zinc-200 leading-relaxed font-medium mb-12">{q.explanation}</div>
               <button onClick={next} className="w-full py-8 bg-white text-zinc-950 rounded-[2.5rem] font-black text-lg uppercase tracking-[0.4em] shadow-2xl">ADVANCE</button>
            </div>
          )}
       </div>
    </div>
  );
}

function InPanelFlashcards({ cards, onBack }) {
  const [idx, setIdx] = useState(0);
  const [flip, setFlip] = useState(false);
  const c = cards[idx];
  return (
    <div className="flex flex-col h-full bg-[#050505]">
       <div className="bg-indigo-600 px-10 py-8 flex justify-between items-center shadow-2xl z-10 shrink-0"><button onClick={onBack} className="text-white font-black text-xs uppercase flex items-center gap-3 active:scale-90 transition-all"><ChevronLeft size={24}/> EXIT</button></div>
       <div className="flex-1 flex flex-col items-center justify-center p-16">
          <div onClick={() => setFlip(!flip)} className="w-full h-[32rem] perspective-1000 cursor-pointer group">
             <div className={`relative w-full h-full transition-transform duration-700 transform-style-3d ${flip?'rotate-y-180':''}`}>
                <div className="absolute inset-0 backface-hidden bg-zinc-900 border-4 border-zinc-800 rounded-[5rem] p-24 flex flex-col items-center justify-center text-center shadow-2xl">
                   <h2 className="text-3xl font-black text-white leading-tight mb-16">{c.q}</h2>
                </div>
                <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-indigo-900 to-indigo-950 border-4 border-indigo-500/40 rounded-[5rem] p-24 flex flex-col items-center justify-center text-center rotate-y-180 overflow-auto">
                   <p className="text-2xl font-black text-white leading-relaxed">{c.a}</p>
                </div>
             </div>
          </div>
          <div className="w-full max-w-3xl flex gap-8 mt-16">
             <button onClick={()=>setIdx(i=>Math.max(0,i-1))} className="flex-1 py-6 bg-zinc-900 text-zinc-600 rounded-[2rem] font-black text-sm uppercase">PREVIOUS</button>
             <button onClick={()=>setIdx(i=>(i+1)%cards.length)} className="flex-1 py-6 bg-white text-zinc-950 rounded-[2rem] font-black text-sm uppercase">NEXT</button>
          </div>
       </div>
       <style>{`.perspective-1000 { perspective: 1000px; } .transform-style-3d { transform-style: preserve-3d; } .backface-hidden { backface-visibility: hidden; } .rotate-y-180 { transform: rotateY(180deg); }`}</style>
    </div>
  );
}

function FlashcardsGlobalView({ flashcards, setFlashcards, setView }) {
  return (
    <div className="flex-1 overflow-auto p-16 bg-[#09090b] custom-scrollbar">
       <div className="max-w-4xl mx-auto"><h1 className="text-5xl font-black text-white mb-12 flex items-center gap-6"><Layers className="text-indigo-600" size={48}/> Active Recall Hub</h1>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">{flashcards.map(c => (<div key={c.id} className="bg-zinc-900 border border-zinc-800 p-8 rounded-[3rem] relative group shadow-2xl"><p className="text-sm text-white font-bold leading-relaxed mb-6">{c.q}</p><p className="text-xs text-indigo-400 bg-indigo-950/30 p-4 rounded-2xl border border-indigo-500/10">{c.a}</p><button onClick={()=>setFlashcards(p=>p.filter(f=>f.id!==c.id))} className="absolute top-8 right-8 text-zinc-700 hover:text-red-500"><Trash2 size={20}/></button></div>))}</div>
       </div>
    </div>
  );
}

function ExamsGlobalView({ exams, setExams, setView }) {
  return (
    <div className="flex-1 overflow-auto p-16 bg-[#09090b] custom-scrollbar">
       <div className="max-w-4xl mx-auto"><h1 className="text-5xl font-black text-white mb-12 flex items-center gap-6"><GraduationCap className="text-emerald-600" size={48}/> Board Exams</h1>
          <div className="space-y-8">{exams.map(e => (<div key={e.id} className="bg-zinc-900 border border-zinc-800 p-10 rounded-[3rem] flex justify-between items-center shadow-2xl"><div><p className="text-2xl font-black text-white mb-3">{e.title}</p><span className="text-[10px] font-black uppercase text-emerald-500 bg-emerald-500/10 px-4 py-2 rounded-xl">{e.questions.length} Items</span></div><button onClick={()=>setExams(p=>p.filter(ex=>ex.id!==e.id))} className="p-4 bg-zinc-950 text-zinc-700 hover:text-red-500 rounded-2xl shadow-xl"><Trash2 size={24}/></button></div>))}</div>
       </div>
    </div>
  );
}

function NotesGlobalView({ notes, setNotes, setView }) {
  return (
    <div className="flex-1 overflow-auto p-16 bg-[#09090b] custom-scrollbar">
       <div className="max-w-4xl mx-auto"><h1 className="text-5xl font-black text-white mb-12 flex items-center gap-6"><BookA className="text-blue-600" size={48}/> Case Synthesis</h1>
          <div className="space-y-12">{notes.map(n => (<div key={n.id} className="bg-zinc-900 border border-zinc-800 p-12 rounded-[4rem] relative shadow-2xl group"><h3 className="text-2xl font-black text-white mb-6 pr-16">{n.title}</h3><div className="text-base text-zinc-300 whitespace-pre-wrap leading-relaxed prose prose-invert max-w-none">{n.content}</div><button onClick={()=>setNotes(p=>p.filter(no=>no.id!==n.id))} className="absolute top-12 right-12 text-zinc-700 hover:text-red-500"><Trash2 size={24}/></button></div>))}</div>
       </div>
    </div>
  );
}

function PanelSettings({ settings, setSettings }) {
  return (
    <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/10 border border-indigo-500/30 p-10 rounded-[3rem] shadow-2xl w-full">
       <h3 className="text-2xl font-black text-indigo-400 mb-6 flex items-center gap-4"><KeyRound size={32}/> API PROTOCOL</h3>
       <input type="password" value={settings.apiKey} onChange={(e)=>setSettings({...settings, apiKey:e.target.value})} placeholder="sk-proj-..." className="w-full bg-[#050505] border border-indigo-500/50 rounded-2xl px-6 py-5 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono shadow-inner mb-10" />
       <div className="bg-zinc-900/50 p-8 rounded-[2rem] border border-zinc-800"><label className="flex items-start gap-6 cursor-pointer"><div className="mt-1 relative flex items-center justify-center"><input type="checkbox" checked={settings.strictMode} onChange={(e)=>setSettings({...settings, strictMode:e.target.checked})} className="peer appearance-none w-6 h-6 border-2 border-zinc-600 rounded bg-zinc-950 checked:bg-indigo-600 transition-all" /><CheckSquare size={16} className="text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100" /></div><div><span className="text-lg font-bold text-white block">STRICT MODE</span><span className="text-sm text-zinc-500 mt-2 block leading-relaxed">Mandatory for clinical accuracy. AI restricted to PDF context.</span></div></label></div>
    </div>
  );
}