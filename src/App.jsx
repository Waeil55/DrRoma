import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Layers, CheckSquare, Settings,
  ChevronLeft, ChevronRight, Upload, MessageSquare,
  CheckCircle2, XCircle, BrainCircuit,
  Library, Trash2, Loader2, List,
  Send, ShieldAlert, LayoutDashboard,
  GraduationCap, Save, X, BookA, Crosshair,
  PanelRightClose, PanelRightOpen, KeyRound, AlertCircle,
  FileUp, Target, Info, Trash, Sparkles, Activity, Stethoscope, Lightbulb, Baby, Play
} from 'lucide-react';
const DB_NAME = 'MariamProDB_v2';
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
  if (!apiKey?.trim()) throw new Error("OpenAI API Key is missing. Please add it in Settings.");
 
  const sysPrompt = strictMode
    ? "You are a highly strict, elite medical AI data extractor. You MUST use ONLY the text provided in the prompt. Do not hallucinate. Do not use outside knowledge. If the answer is not in the text, say 'Information not found in the selected pages.'"
    : "You are an elite medical AI tutor and diagnostic assistant.";
  const res = await fetch(`https://api.openai.com/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: "system", content: sysPrompt + (expectJson ? " You must respond in strictly valid JSON format." : "") },
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
 
  const [userSettings, setUserSettings] = useState({ apiKey: '', strictMode: true });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [currentView, setCurrentView] = useState('library');
  const [rightPanelTab, setRightPanelTab] = useState('generate');
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  useEffect(() => {
    try {
      const savedDocs = localStorage.getItem('drMariam_docs');
      const savedCards = localStorage.getItem('drMariam_flashcards');
      const savedExams = localStorage.getItem('drMariam_exams');
      const savedNotes = localStorage.getItem('drMariam_notes');
      const savedSettings = localStorage.getItem('drMariam_settings');
     
      if (savedDocs) setDocuments(JSON.parse(savedDocs) || []);
      if (savedCards) setFlashcards(JSON.parse(savedCards) || []);
      if (savedExams) setExams(JSON.parse(savedExams) || []);
      if (savedNotes) setNotes(JSON.parse(savedNotes) || []);
      if (savedSettings) setUserSettings(JSON.parse(savedSettings) || { apiKey: '', strictMode: true });
    } catch (e) {
      console.warn("Storage read error", e);
    }
  }, []);
  useEffect(() => {
    try {
      localStorage.setItem('drMariam_docs', JSON.stringify(documents));
      localStorage.setItem('drMariam_flashcards', JSON.stringify(flashcards));
      localStorage.setItem('drMariam_exams', JSON.stringify(exams));
      localStorage.setItem('drMariam_notes', JSON.stringify(notes));
      localStorage.setItem('drMariam_settings', JSON.stringify(userSettings));
    } catch (e) {
      console.warn("Storage write error", e);
    }
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
      setCurrentView('reader');
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
    <div className="flex h-screen bg-[#09090b] text-zinc-300 font-sans overflow-hidden">
     
      <nav className="w-20 bg-[#09090b] border-r border-zinc-800/50 flex flex-col items-center py-6 z-20 shrink-0 shadow-2xl">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-900/50 mb-10 cursor-pointer" onClick={() => { setActiveDocId(null); setCurrentView('library'); }}>
          <BrainCircuit className="text-white w-7 h-7" />
        </div>
       
        <div className="flex-1 flex flex-col gap-6 w-full px-2">
          <SidebarBtn icon={Library} label="Library" active={currentView === 'library' && !activeDocId} onClick={() => { setActiveDocId(null); setCurrentView('library'); }} />
          <SidebarBtn icon={Layers} label="Flashcards" active={currentView === 'flashcards' && !activeDocId} onClick={() => { setActiveDocId(null); setCurrentView('flashcards'); }} />
          <SidebarBtn icon={GraduationCap} label="Exams" active={currentView === 'exams' && !activeDocId} onClick={() => { setActiveDocId(null); setCurrentView('exams'); }} />
          <SidebarBtn icon={BookA} label="Notes" active={currentView === 'notes' && !activeDocId} onClick={() => { setActiveDocId(null); setCurrentView('notes'); }} />
          {activeDocId && (
            <>
              <div className="w-8 h-px bg-zinc-800 mx-auto my-1" />
              <SidebarBtn icon={BookOpen} label="Reader" active={activeDocId !== null} onClick={() => setCurrentView('reader')} highlight />
            </>
          )}
        </div>
        <SidebarBtn icon={Settings} label="API Key" active={currentView === 'settings'} onClick={() => { setActiveDocId(null); setCurrentView('settings'); }} />
      </nav>
      <main className="flex-1 flex flex-col relative bg-[#09090b] min-w-0">
        {isUploading && (
          <div className="absolute top-0 left-0 w-full h-1.5 bg-zinc-800 z-50">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 transition-all duration-300 shadow-[0_0_15px_rgba(99,102,241,1)]" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        )}
        {!activeDocId && currentView === 'library' && (
          <LibraryView documents={documents} onUpload={handleFileUpload} onOpen={setActiveDocId} isUploading={isUploading} deleteDocument={deleteDocument} flashcards={flashcards} exams={exams} notes={notes} setView={setCurrentView} />
        )}
        {!activeDocId && currentView === 'flashcards' && (
          <FlashcardsGlobalView flashcards={flashcards} setFlashcards={setFlashcards} setView={setCurrentView} />
        )}
        {!activeDocId && currentView === 'exams' && (
          <ExamsGlobalView exams={exams} setExams={setExams} setView={setCurrentView} />
        )}
        {!activeDocId && currentView === 'notes' && (
          <NotesGlobalView notes={notes} setNotes={setNotes} setView={setCurrentView} />
        )}
        {!activeDocId && currentView === 'settings' && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-lg"><PanelSettings settings={userSettings} setSettings={setUserSettings} /></div>
          </div>
        )}
        {activeDocId && (
          <PdfWorkspace activeDoc={activeDoc} setDocuments={setDocuments} closeDoc={() => setActiveDocId(null)} rightPanelOpen={rightPanelOpen} setRightPanelOpen={setRightPanelOpen} />
        )}
      </main>
      {rightPanelOpen && activeDocId && (
        <aside className="w-[550px] bg-[#09090b] border-l border-zinc-800/80 flex flex-col shrink-0 z-20 shadow-[-20px_0_40px_rgba(0,0,0,0.7)] relative transition-all duration-300">
          <div className="bg-indigo-600 px-4 py-2 flex items-center gap-2 shrink-0 border-b border-indigo-700">
             <Target size={16} className="text-white"/>
             <span className="text-xs font-bold text-white uppercase tracking-widest">Target: Page {activeDoc.progress}</span>
          </div>
          <div className="h-16 flex p-2 bg-[#09090b] border-b border-zinc-800/80 shrink-0 gap-1 items-center">
            <PanelTab active={rightPanelTab === 'generate'} onClick={() => setRightPanelTab('generate')} label="AI Tools" icon={Sparkles} />
            <PanelTab active={rightPanelTab === 'chat'} onClick={() => setRightPanelTab('chat')} label="Chat" icon={MessageSquare} />
            <PanelTab active={rightPanelTab === 'review'} onClick={() => setRightPanelTab('review')} label="My Data" icon={Layers} />
            <PanelTab active={rightPanelTab === 'settings'} onClick={() => setRightPanelTab('settings')} label="Key" icon={KeyRound} />
          </div>
         
          <div className="flex-1 overflow-hidden relative">
            {rightPanelTab === 'settings' ? (
              <PanelSettings settings={userSettings} setSettings={setUserSettings} />
            ) : !userSettings.apiKey?.trim() ? (
              <div className="p-8 text-center mt-20">
                <div className="w-20 h-20 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                  <AlertCircle className="w-10 h-10 text-red-500" />
                </div>
                <h2 className="text-xl font-bold text-white mb-2">OpenAI Key Required</h2>
                <p className="text-sm text-zinc-400 mb-8 leading-relaxed">You must connect your OpenAI API key to unlock the elite AI extraction and generation tools.</p>
                <button onClick={() => setRightPanelTab('settings')} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 transition-colors text-white rounded-xl text-sm font-bold shadow-lg shadow-indigo-500/25">Connect API Key</button>
              </div>
            ) : rightPanelTab === 'generate' ? (
              <PanelGenerate activeDoc={activeDoc} settings={userSettings} setFlashcards={setFlashcards} setExams={setExams} setNotes={setNotes} switchToReview={() => setRightPanelTab('review')} />
            ) : rightPanelTab === 'chat' ? (
              <PanelChat activeDoc={activeDoc} settings={userSettings} />
            ) : rightPanelTab === 'review' ? (
              <PanelReview activeDocId={activeDoc.id} flashcards={flashcards} setFlashcards={setFlashcards} exams={exams} setExams={setExams} notes={notes} setNotes={setNotes} />
            ) : null}
          </div>
        </aside>
      )}
    </div>
  );
}
function SidebarBtn({ icon: Icon, label, active, onClick, highlight }) {
  return (
    <button
      onClick={onClick}
      title={label}
      className={`w-14 h-14 mx-auto rounded-2xl flex items-center justify-center transition-all group relative ${
        active
          ? highlight ? 'bg-indigo-600 text-white shadow-xl shadow-indigo-900/40' : 'bg-zinc-800 text-white shadow-lg'
          : 'text-zinc-500 hover:bg-zinc-800/80 hover:text-zinc-200'
      }`}
    >
      <Icon size={24} />
      <span className="absolute left-16 bg-zinc-800 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all border border-zinc-700 shadow-xl translate-x-[-10px] group-hover:translate-x-0">
        {label}
      </span>
    </button>
  );
}
function PanelTab({ active, onClick, label, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center gap-1.5 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-all h-full ${
        active ? 'bg-zinc-800/80 text-indigo-400 shadow-inner border border-zinc-700/50' : 'text-zinc-500 hover:text-zinc-300 hover:bg-zinc-900'
      }`}
    >
      <Icon size={16} /> {label}
    </button>
  );
}
// --- GLOBAL VIEWS ---
function LibraryView({ documents, onUpload, onOpen, isUploading, deleteDocument, flashcards, exams, notes, setView }) {
  return (
    <div className="flex-1 overflow-auto p-10 lg:p-16 custom-scrollbar bg-[#09090b]">
      <div className="max-w-7xl mx-auto w-full">
       
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div>
            <h1 className="text-5xl font-black text-white tracking-tighter mb-3 flex items-center gap-4">
              Intelligence <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500">Nexus</span>
            </h1>
            <p className="text-zinc-400 text-base max-w-xl leading-relaxed">Your secure, local medical knowledge base. Upload materials and let the elite AI extract exams, notes, and cards.</p>
          </div>
          <label className={`cursor-pointer bg-white text-zinc-950 hover:bg-zinc-200 px-8 py-4 rounded-xl font-black text-sm flex items-center gap-3 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
            {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
            {isUploading ? "PROCESSING PDF..." : "IMPORT SECURE PDF"}
            <input type="file" accept="application/pdf" className="hidden" onChange={onUpload} disabled={isUploading} />
          </label>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
           <div onClick={() => setView('notes')} className="cursor-pointer hover:bg-zinc-800/80 transition-all bg-zinc-900/50 border border-zinc-800/50 p-6 rounded-3xl flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0"><BookA size={28}/></div>
              <div><p className="text-3xl font-black text-white">{notes.length}</p><p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Generated Notes</p></div>
           </div>
           <div onClick={() => setView('flashcards')} className="cursor-pointer hover:bg-zinc-800/80 transition-all bg-zinc-900/50 border border-zinc-800/50 p-6 rounded-3xl flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0"><Layers size={28}/></div>
              <div><p className="text-3xl font-black text-white">{flashcards.length}</p><p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Active Flashcards</p></div>
           </div>
           <div onClick={() => setView('exams')} className="cursor-pointer hover:bg-zinc-800/80 transition-all bg-zinc-900/50 border border-zinc-800/50 p-6 rounded-3xl flex items-center gap-6">
              <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0"><GraduationCap size={28}/></div>
              <div><p className="text-3xl font-black text-white">{exams.length}</p><p className="text-xs font-bold text-zinc-500 uppercase tracking-widest mt-1">Strict Exams</p></div>
           </div>
        </div>
       
        {documents.length === 0 ? (
          <div className="border-2 border-dashed border-zinc-800/80 rounded-[3rem] bg-zinc-900/20 p-24 text-center">
            <div className="w-32 h-32 bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
               <FileUp size={48} className="text-zinc-600" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-3">No Documents Found</h2>
            <p className="text-zinc-500 text-base max-w-md mx-auto leading-relaxed">Import a textbook, research paper, or clinical guide to begin your enhanced study session.</p>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2"><Library size={20} className="text-indigo-500"/> Your Library</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {documents.map(doc => {
                const docCards = flashcards.filter(f => f.docId === doc.id).length;
                const docExams = exams.filter(e => e.docId === doc.id).length;
               
                return (
                <div key={doc.id} onClick={() => onOpen(doc.id)} className="bg-zinc-900/80 rounded-3xl p-6 border border-zinc-800 hover:border-indigo-500/50 hover:shadow-[0_10px_40px_rgba(99,102,241,0.1)] cursor-pointer transition-all flex flex-col h-64 group relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-bl-full -z-10 group-hover:bg-indigo-500/10 transition-colors" />
                  <div className="flex items-start justify-between mb-6 z-10">
                    <div className="w-14 h-14 rounded-2xl bg-zinc-950 border border-zinc-800 flex items-center justify-center text-zinc-400 group-hover:bg-indigo-600 group-hover:text-white group-hover:border-indigo-500 transition-all shadow-sm">
                      <BookOpen size={24} />
                    </div>
                    <button onClick={(e) => deleteDocument(doc.id, e)} className="p-2.5 bg-zinc-950/50 text-zinc-500 hover:text-red-400 hover:bg-red-500/20 rounded-xl transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm">
                      <Trash2 size={18} />
                    </button>
                  </div>
                  <h3 className="font-bold text-white text-lg leading-snug line-clamp-2 flex-1 z-10">{doc.name}</h3>
                  <div className="mt-4 pt-4 border-t border-zinc-800/80 z-10">
                    <div className="flex justify-between items-center mb-3">
                      <div className="flex gap-2">
                        <span className="text-[10px] font-bold text-zinc-500 bg-zinc-950 px-2 py-1 rounded-md">{docCards} Cards</span>
                        <span className="text-[10px] font-bold text-zinc-500 bg-zinc-950 px-2 py-1 rounded-md">{docExams} Exams</span>
                      </div>
                      <span className="text-[11px] font-black text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-md">PG {doc.progress}/{doc.totalPages}</span>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
function FlashcardsGlobalView({ flashcards, setFlashcards, setView }) {
  const [studying, setStudying] = useState(false);
  if (studying) {
    return <InPanelFlashcards cards={flashcards} onBack={() => setStudying(false)} setFlashcards={setFlashcards} />;
  }
  if (flashcards.length === 0) return (
    <div className="flex-1 flex flex-col items-center justify-center p-10 bg-[#09090b] text-center">
      <Layers size={64} className="text-zinc-800 mb-6" />
      <h2 className="text-2xl font-bold text-white mb-2">No Flashcards</h2>
      <p className="text-zinc-500 max-w-md">Open a document and use the AI Generator to extract targeted flashcards.</p>
      <button onClick={() => setView('library')} className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold">Go to Library</button>
    </div>
  );
  return (
    <div className="flex-1 overflow-auto p-10 lg:p-16 custom-scrollbar bg-[#09090b]">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-black text-white tracking-tighter flex items-center gap-4"><Layers className="text-indigo-500"/> Global Flashcard Database</h1>
          <button onClick={() => setStudying(true)} className="px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold flex items-center gap-2">Study All <Play size={18} /></button>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {flashcards.map(c => (
            <div key={c.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl relative group shadow-sm hover:border-indigo-500/50 transition-all">
              <span className="text-[10px] font-black uppercase tracking-widest text-indigo-400 mb-2 block">Pgs {c.sourcePages}</span>
              <p className="text-sm text-white font-bold mb-3 leading-relaxed"><span className="text-zinc-600 mr-2 text-xs uppercase tracking-widest">Q</span>{c.q}</p>
              <p className="text-sm text-indigo-300 leading-relaxed bg-indigo-950/30 p-3 rounded-xl border border-indigo-500/10"><span className="text-indigo-900 mr-2 text-xs uppercase tracking-widest">A</span>{c.a}</p>
              <button onClick={() => setFlashcards(flashcards.filter(f => f.id !== c.id))} className="absolute top-6 right-6 p-2 bg-zinc-950 text-zinc-600 hover:text-red-400 rounded-xl opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function ExamsGlobalView({ exams, setExams, setView }) {
  const [selectedExam, setSelectedExam] = useState(null);
  if (selectedExam) {
    return (
      <div className="flex-1 flex flex-col bg-[#09090b]">
        {/* Header with Back button */}
        <div className="h-16 flex items-center justify-between px-6 bg-[#121214] border-b border-zinc-800 shrink-0">
          <button 
            onClick={() => setSelectedExam(null)}
            className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm font-bold uppercase tracking-widest"
          >
            <ChevronLeft size={18} /> Back to List
          </button>
          <span className="text-sm text-zinc-400">
            {selectedExam.title} • {selectedExam.questions.length} Questions
          </span>
        </div>

        {/* Render the actual exam */}
        <InPanelExam 
          exam={selectedExam} 
          onBack={() => setSelectedExam(null)} 
        />
      </div>
    );
  }
  if (exams.length === 0) return (
    <div className="flex-1 flex flex-col items-center justify-center p-10 bg-[#09090b] text-center">
      <GraduationCap size={64} className="text-zinc-800 mb-6" />
      <h2 className="text-2xl font-bold text-white mb-2">No Exams Generated</h2>
      <p className="text-zinc-500 max-w-md">Open a document and use the AI to generate a strict test on specific pages.</p>
      <button onClick={() => setView('library')} className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold">Go to Library</button>
    </div>
  );
  return (
    <div className="flex-1 overflow-auto p-10 lg:p-16 custom-scrollbar bg-[#09090b]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-white tracking-tighter mb-8 flex items-center gap-4"><GraduationCap className="text-emerald-500"/> Global Exam Database</h1>
        <div className="space-y-6">
          {exams.map(e => (
            <div key={e.id} className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex justify-between items-center group hover:border-emerald-500/50 transition-all">
              <div>
                <p className="text-lg text-white font-black mb-2">{e.title}</p>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">{e.questions.length} Questions</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500">Source: Pages {e.sourcePages}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => setSelectedExam(e)} className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all flex items-center gap-2 shadow-md"><Play size={18} /> Take Exam</button>
                <button onClick={() => setExams(exams.filter(ex => ex.id !== e.id))} className="p-3 bg-zinc-950 text-zinc-600 hover:text-red-400 rounded-xl transition-all"><Trash2 size={18}/></button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
function NotesGlobalView({ notes, setNotes, setView }) {
  if (notes.length === 0) return (
    <div className="flex-1 flex flex-col items-center justify-center p-10 bg-[#09090b] text-center">
      <BookA size={64} className="text-zinc-800 mb-6" />
      <h2 className="text-2xl font-bold text-white mb-2">No Notes Found</h2>
      <p className="text-zinc-500 max-w-md">Open a document and use the AI to generate clinical cases, mnemonics, or summaries.</p>
      <button onClick={() => setView('library')} className="mt-6 px-6 py-3 bg-indigo-600 text-white rounded-xl font-bold">Go to Library</button>
    </div>
  );
  return (
    <div className="flex-1 overflow-auto p-10 lg:p-16 custom-scrollbar bg-[#09090b]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-white tracking-tighter mb-8 flex items-center gap-4"><BookA className="text-blue-500"/> Global Notes Database</h1>
        <div className="space-y-6">
          {notes.map(n => (
            <div key={n.id} className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl relative group hover:border-blue-500/50 transition-all shadow-md">
              <h3 className="text-xl text-white font-black mb-4 pr-12">{n.title}</h3>
              <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed prose prose-invert max-w-none">{n.content}</div>
              <button onClick={() => setNotes(notes.filter(no => no.id !== n.id))} className="absolute top-8 right-8 p-3 bg-zinc-950 text-zinc-600 hover:text-red-400 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-sm"><Trash2 size={18}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
// --- WORKSPACE & SIDE-BY-SIDE TOOLS ---
function PdfWorkspace({ activeDoc, setDocuments, closeDoc, rightPanelOpen, setRightPanelOpen }) {
  const [currentPage, setCurrentPage] = useState(activeDoc.progress || 1);
  const [pdf, setPdf] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const loadPdf = async () => {
      setIsLoading(true);
      try {
        const buffer = await getPdfData(activeDoc.id);
        if (buffer) {
          const pdfjsLib = await loadPdfJs();
          const loadedPdf = await pdfjsLib.getDocument({ data: buffer }).promise;
          setPdf(loadedPdf);
        }
      } catch (e) {
        console.error("Failed to load PDF from DB", e);
      } finally {
        setIsLoading(false);
      }
    };
    loadPdf();
  }, [activeDoc.id]);

  useEffect(() => {
    if (!pdf) return;
    const renderPage = async () => {
      try {
        const page = await pdf.getPage(currentPage);
        const container = containerRef.current;
        if (!container) return;
        const containerWidth = container.clientWidth;
        const containerHeight = container.clientHeight;
        const tempViewport = page.getViewport({ scale: 1 });
        let scale = Math.min((containerWidth / tempViewport.width) * 0.95, (containerHeight / tempViewport.height) * 0.95);
        const viewport = page.getViewport({ scale });
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          const renderContext = {
            canvasContext: canvas.getContext('2d'),
            viewport,
          };
          await page.render(renderContext).promise;
        }
      } catch (e) {
        console.error("Failed to render page", e);
      }
    };
    renderPage();
  }, [currentPage, pdf]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        setCurrentPage(p => Math.max(1, p - 1));
      } else if (e.key === 'ArrowRight') {
        setCurrentPage(p => Math.min(activeDoc.totalPages, p + 1));
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeDoc.totalPages]);

  useEffect(() => {
    setDocuments(prev => prev.map(doc => doc.id === activeDoc.id ? { ...doc, progress: currentPage } : doc));
  }, [currentPage, activeDoc.id, setDocuments]);

  return (
    <div className="flex-1 flex flex-col h-full bg-[#050505] relative">
      <div className="h-16 flex items-center justify-between px-6 bg-[#09090b] border-b border-zinc-800/80 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4 overflow-hidden">
          <button onClick={closeDoc} className="flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-black uppercase tracking-widest bg-zinc-900 px-4 py-2 rounded-xl">
            <ChevronLeft size={16} /> Exit
          </button>
          <div className="w-px h-6 bg-zinc-800"></div>
          <span className="text-sm font-bold text-zinc-200 truncate max-w-[200px] md:max-w-md" title={activeDoc.name}>{activeDoc.name}</span>
        </div>
        <div className="flex items-center gap-4">
         
          <div className="flex items-center bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden shadow-inner h-11">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="px-5 h-full text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors flex items-center"><ChevronLeft size={20} /></button>
            <div className="px-4 h-full flex items-center justify-center border-x border-zinc-800 bg-zinc-950">
               <span className="text-sm font-mono text-white font-black tracking-widest">PG {currentPage} <span className="text-zinc-600 mx-1">/</span> {activeDoc.totalPages}</span>
            </div>
            <button onClick={() => setCurrentPage(p => Math.min(activeDoc.totalPages, p + 1))} className="px-5 h-full text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors flex items-center"><ChevronRight size={20} /></button>
          </div>
          <button onClick={() => setRightPanelOpen(!rightPanelOpen)} className={`p-2.5 rounded-xl border transition-all shadow-md ${rightPanelOpen ? 'bg-indigo-600 border-indigo-500 text-white' : 'bg-zinc-900 border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
            {rightPanelOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
          </button>
        </div>
      </div>
     
      <div ref={containerRef} className="flex-1 overflow-hidden bg-[#121214] flex justify-center items-center relative shadow-[inset_0_0_80px_rgba(0,0,0,0.8)]">
        {isLoading ? (
          <div className="flex flex-col items-center gap-6 text-zinc-500 m-auto">
            <Loader2 className="animate-spin text-indigo-500" size={40}/>
            <span className="text-xs font-black tracking-widest uppercase">Rendering Secure Viewer...</span>
          </div>
        ) : pdf ? (
          <canvas ref={canvasRef} className="shadow-[0_0_50px_rgba(0,0,0,1)]" />
        ) : (
          <div className="m-auto text-red-400 text-sm flex items-center gap-2 bg-red-500/10 p-4 rounded-xl border border-red-500/20">
            <AlertCircle size={16}/> Failed to load PDF visual layer. AI text context is still intact.
          </div>
        )}
      </div>
    </div>
  );
}
function PanelSettings({ settings, setSettings }) {
  return (
    <div className="p-8 h-full overflow-y-auto custom-scrollbar flex flex-col gap-8 bg-[#09090b]">
      <div className="bg-gradient-to-br from-indigo-900/20 to-purple-900/10 border border-indigo-500/30 p-6 rounded-2xl shadow-lg">
        <h3 className="text-base font-black text-indigo-400 flex items-center gap-2 mb-3"><KeyRound size={20}/> OpenAI API Key</h3>
        <p className="text-sm text-indigo-200/70 leading-relaxed mb-6">Enter your OpenAI key (sk-...) to power the AI extraction engine. Keys are saved securely in your browser's local storage and never sent to our servers.</p>
        <input
          type="password"
          value={settings.apiKey}
          onChange={(e) => setSettings({...settings, apiKey: e.target.value})}
          placeholder="sk-proj-..."
          className="w-full bg-[#050505] border border-indigo-500/50 rounded-xl px-5 py-4 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-mono shadow-inner mb-4"
        />
        <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-xs text-indigo-400 font-bold uppercase tracking-widest hover:text-indigo-300 transition-colors flex items-center gap-1">Get API Key <ChevronRight size={14}/></a>
      </div>
      <div className="bg-zinc-900/50 border border-zinc-800 p-6 rounded-2xl">
        <label className="flex items-start gap-4 cursor-pointer">
          <div className="mt-1 relative flex items-center justify-center">
             <input type="checkbox" checked={settings.strictMode} onChange={(e) => setSettings({...settings, strictMode: e.target.checked})} className="peer appearance-none w-5 h-5 border-2 border-zinc-600 rounded bg-zinc-950 checked:bg-indigo-600 checked:border-indigo-600 transition-all" />
             <CheckSquare size={14} className="text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100" />
          </div>
          <div>
            <span className="text-base font-bold text-white block">Strict Document Grounding</span>
            <span className="text-sm text-zinc-500 mt-2 block leading-relaxed">Forces the AI to exclusively use the text found in the active PDF pages. Essential for medical study to guarantee zero hallucinations.</span>
          </div>
        </label>
      </div>
    </div>
  );
}
function PanelGenerate({ activeDoc, settings, setFlashcards, setExams, setNotes, switchToReview }) {
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
  const handleGenerate = async () => {
    setStatus({ loading: true, msg: 'Reading text from pages...', err: false });
    setGenerated(null);
    try {
      let text = "";
      for (let i = Number(startPage); i <= Number(endPage); i++) if (activeDoc.pagesText[i]) text += activeDoc.pagesText[i] + "\n";
      if (!text.trim()) throw new Error("No readable text found on these pages.");
      setStatus({ loading: true, msg: 'Elite AI processing via OpenAI...', err: false });
      if (type === 'flashcards') {
        const p = `Create exactly ${count} highly accurate study flashcards from this text ONLY. Respond in JSON format: { "items": [ {"q": "Clear Question", "a": "Precise Answer"} ] }\n\nTEXT:\n${text}`;
        const raw = await callAI(p, true, settings.strictMode, settings.apiKey);
        setGenerated({ type, data: JSON.parse(raw).items, pages: `${startPage}-${endPage}` });
      } else if (type === 'exam') {
        const p = `Create a very very hard and long ${count}-question medical/academic exam from this text ONLY. Respond in JSON format: { "title": "Exam Title", "items": [ { "q": "Question", "options": ["A","B","C","D"], "correct": 0, "explanation": "Detailed explanation using text" } ] }\n\nTEXT:\n${text}`;
        const raw = await callAI(p, true, settings.strictMode, settings.apiKey);
        const parsed = JSON.parse(raw);
        setGenerated({ type, title: parsed.title, data: parsed.items, pages: `${startPage}-${endPage}` });
      } else if (type === 'summary') {
        const p = `Write a comprehensive, structured summary of this text ONLY. Use markdown headings and bullet points.\n\nTEXT:\n${text}`;
        const raw = await callAI(p, false, settings.strictMode, settings.apiKey);
        setGenerated({ type, data: raw, pages: `${startPage}-${endPage}` });
      } else if (type === 'clinical') {
        const p = `Based ONLY on the medical concepts in this text, create a realistic Clinical Case Study scenario. Include patient presentation, symptoms, and ask a question at the end, followed by the answer. Respond in Markdown.\n\nTEXT:\n${text}`;
        const raw = await callAI(p, false, settings.strictMode, settings.apiKey);
        setGenerated({ type: 'summary', data: raw, pages: `${startPage}-${endPage}`, customTitle: 'Clinical Case' });
      } else if (type === 'eli5') {
        const p = `Explain the core concepts of this text extremely simply, as if explaining to a beginner or a 5-year-old. Use analogies. Respond in Markdown.\n\nTEXT:\n${text}`;
        const raw = await callAI(p, false, settings.strictMode, settings.apiKey);
        setGenerated({ type: 'summary', data: raw, pages: `${startPage}-${endPage}`, customTitle: 'Simplified Explanation' });
      } else if (type === 'mnemonics') {
        const p = `Create extremely memorable, clever mnemonics for the key lists, drugs, or concepts in this text. Respond in Markdown.\n\nTEXT:\n${text}`;
        const raw = await callAI(p, false, settings.strictMode, settings.apiKey);
        setGenerated({ type: 'summary', data: raw, pages: `${startPage}-${endPage}`, customTitle: 'Mnemonics' });
      }
      setStatus({ loading: false, msg: 'Generation Complete.', err: false });
    } catch (e) {
      setStatus({ loading: false, msg: e.message || "Failed.", err: true });
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
      setNotes(p => [...p, { id: Date.now().toString(), docId: activeDoc.id, title: `${generated.customTitle || 'Summary'} Pgs ${generated.pages}`, content: generated.data }]);
    }
    setGenerated(null);
    setStatus({ loading: false, msg: '', err: false });
    switchToReview();
  };
  const removeItem = (idx) => {
    if (generated.type === 'summary') setGenerated(null);
    else {
      const d = [...generated.data]; d.splice(idx, 1);
      if (d.length === 0) setGenerated(null); else setGenerated({...generated, data: d});
    }
  };
  return (
    <div className="h-full flex flex-col bg-[#09090b] p-6">
     
      {!generated ? (
        <div className="bg-zinc-900 border border-zinc-800 p-6 rounded-3xl flex-shrink-0 shadow-2xl">
          <div className="flex items-center justify-between mb-8">
            <div className="w-full mr-4 relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">Start Pg</label>
              <input type="number" min={1} max={activeDoc.totalPages} value={startPage} onChange={e=>setStartPage(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-base text-center text-white font-mono font-bold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner" />
            </div>
            <div className="mt-6 text-zinc-600 font-bold">TO</div>
            <div className="w-full ml-4 relative">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2 block">End Pg</label>
              <input type="number" min={1} max={activeDoc.totalPages} value={endPage} onChange={e=>setEndPage(Number(e.target.value))} className="w-full bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-base text-center text-white font-mono font-bold outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner" />
            </div>
          </div>
         
          <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 block">Extraction Tool</label>
          <div className="grid grid-cols-2 gap-3 mb-8">
            <ToolBtn id="flashcards" active={type} set={setType} icon={Layers} label="Cards" />
            <ToolBtn id="exam" active={type} set={setType} icon={CheckSquare} label="Exam" />
            <ToolBtn id="summary" active={type} set={setType} icon={BookA} label="Summary" />
            <ToolBtn id="eli5" active={type} set={setType} icon={Baby} label="Simplify" />
            <ToolBtn id="clinical" active={type} set={setType} icon={Stethoscope} label="Clinical Case" />
            <ToolBtn id="mnemonics" active={type} set={setType} icon={Lightbulb} label="Mnemonics" />
          </div>
          {(type === 'flashcards' || type === 'exam') && (
            <div className="mb-8 bg-zinc-950 p-4 rounded-xl border border-zinc-800">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-3 flex justify-between"><span>Quantity</span> <span className="text-indigo-400 text-sm">{count} Items</span></label>
              <input type="range" min="1" max="100" value={count} onChange={e=>setCount(parseInt(e.target.value))} className="w-full accent-indigo-500 h-2 bg-zinc-800 rounded-lg appearance-none cursor-pointer" />
            </div>
          )}
          <button onClick={handleGenerate} disabled={status.loading} className="w-full py-4 bg-white hover:bg-zinc-200 text-zinc-950 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-3">
            {status.loading ? <Loader2 size={20} className="animate-spin" /> : <BrainCircuit size={20} />}
            {status.loading ? "Running AI Engine..." : "Execute Extraction"}
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 bg-zinc-900 border border-emerald-500/40 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 shadow-2xl shadow-emerald-900/20">
          <div className="bg-emerald-500/10 border-b border-emerald-500/30 p-4 flex justify-between items-center shrink-0">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2"><CheckCircle2 size={18}/> Review Output</span>
            <div className="flex gap-3">
              <button onClick={()=>setGenerated(null)} className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-zinc-300 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors">Discard</button>
              <button onClick={saveItem} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-900/50 transition-colors"><Save size={16}/> Save to DB</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
            {generated.type === 'flashcards' && generated.data.map((item, idx) => (
              <div key={idx} className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl relative group pr-12 shadow-sm">
                <p className="text-sm text-white font-bold mb-3 leading-relaxed"><span className="text-zinc-600 mr-2 text-xs uppercase tracking-widest">Q</span>{item.q}</p>
                <p className="text-sm text-indigo-300 leading-relaxed"><span className="text-indigo-900 mr-2 text-xs uppercase tracking-widest">A</span>{item.a}</p>
                <button onClick={()=>removeItem(idx)} className="absolute top-4 right-4 p-2 bg-zinc-900 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
              </div>
            ))}
            {generated.type === 'exam' && generated.data.map((item, idx) => (
              <div key={idx} className="bg-zinc-950 border border-zinc-800 p-5 rounded-2xl relative group pr-12 shadow-sm">
                <p className="text-sm text-white font-bold mb-4 leading-relaxed">{idx+1}. {item.q}</p>
                <div className="space-y-2">
                  {item.options.map((opt, oIdx) => (
                    <div key={oIdx} className={`text-xs p-3 rounded-xl border bg-zinc-900 border-zinc-800 text-zinc-400`}>{opt}</div>
                  ))}
                </div>
                <button onClick={()=>removeItem(idx)} className="absolute top-4 right-4 p-2 bg-zinc-900 text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
              </div>
            ))}
            {generated.type === 'summary' && (
              <div className="bg-zinc-950 border border-zinc-800 p-6 rounded-2xl relative group shadow-sm">
                <div className="text-sm text-zinc-300 whitespace-pre-wrap leading-relaxed prose prose-invert prose-p:text-zinc-300 prose-headings:text-white max-w-none">{generated.data}</div>
              </div>
            )}
          </div>
        </div>
      )}
      {status.msg && !generated && (
        <div className={`mt-6 p-5 rounded-2xl text-sm font-bold flex items-start gap-4 border ${status.err ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20 shadow-lg shadow-indigo-900/20'}`}>
          {status.loading ? <Loader2 size={20} className="animate-spin shrink-0 mt-0.5" /> : <AlertCircle size={20} className="shrink-0 mt-0.5" />}
          <span className="leading-relaxed">{status.msg}</span>
        </div>
      )}
    </div>
  );
}
function ToolBtn({ id, active, set, icon: Icon, label }) {
  const isA = active === id;
  return (
    <button onClick={() => set(id)} className={`py-3 px-2 flex flex-col items-center justify-center gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${isA ? 'bg-indigo-600 border-indigo-500 text-white shadow-lg shadow-indigo-600/30' : 'bg-zinc-950 border-zinc-800 text-zinc-500 hover:text-zinc-300 hover:bg-zinc-800'}`}>
      <Icon size={20} className={isA ? "text-white" : "text-zinc-600"}/> {label}
    </button>
  );
}
function PanelChat({ activeDoc, settings }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const endRef = useRef(null);
  useEffect(() => {
    setMessages([{ role: 'assistant', content: `I am locked onto **Page ${activeDoc.progress}**. What do you need explained?` }]);
  }, [activeDoc.progress]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);
  const handleChat = async () => {
    if (!input.trim() || loading) return;
    const msg = input; setInput("");
    setMessages(p => [...p, { role: 'user', content: msg }]);
    setLoading(true);
   
    try {
      const text = activeDoc.pagesText[activeDoc.progress] || "No readable text found on this page.";
      const prompt = `DOCUMENT CONTEXT FROM PAGE ${activeDoc.progress}:\n${text}\n\nSTUDENT QUESTION:\n${msg}`;
     
      const res = await callAI(prompt, false, settings.strictMode, settings.apiKey);
      setMessages(p => [...p, { role: 'assistant', content: res }]);
    } catch (e) {
      setMessages(p => [...p, { role: 'assistant', content: `⚠️ ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="h-full flex flex-col bg-[#09090b]">
      <div className="bg-indigo-600 px-5 py-3 flex items-center gap-3 shadow-md shrink-0">
         <Target size={16} className="text-white" />
         <span className="text-[10px] font-black text-white uppercase tracking-widest">Locked: Page {activeDoc.progress}</span>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${m.role === 'user' ? 'bg-indigo-600' : 'bg-zinc-800 border border-zinc-700'}`}>
              {m.role === 'user' ? <List size={18} className="text-white" /> : <BrainCircuit size={18} className="text-indigo-400" />}
            </div>
            <div className={`p-5 max-w-[85%] text-sm leading-relaxed shadow-md ${m.role === 'user' ? 'bg-indigo-600 text-white rounded-3xl rounded-tr-sm' : 'bg-zinc-900 border border-zinc-800 rounded-3xl rounded-tl-sm text-zinc-300 whitespace-pre-wrap'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4">
             <div className="w-10 h-10 rounded-2xl bg-zinc-800 border border-zinc-700 flex items-center justify-center shrink-0 shadow-lg"><Loader2 size={18} className="text-indigo-400 animate-spin" /></div>
             <div className="p-5 bg-zinc-900 border border-zinc-800 rounded-3xl rounded-tl-sm flex items-center gap-2"><span className="w-2.5 h-2.5 bg-zinc-600 rounded-full animate-bounce"></span><span className="w-2.5 h-2.5 bg-zinc-600 rounded-full animate-bounce" style={{animationDelay:'0.15s'}}></span><span className="w-2.5 h-2.5 bg-zinc-600 rounded-full animate-bounce" style={{animationDelay:'0.3s'}}></span></div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="p-5 bg-zinc-950 border-t border-zinc-800 shrink-0">
        <div className="relative flex items-end bg-zinc-900 border border-zinc-700 rounded-2xl focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all shadow-inner p-1">
          <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault(); handleChat();}}} placeholder={`Ask about page ${activeDoc.progress}...`} disabled={loading} className="w-full bg-transparent p-4 pr-16 text-sm text-white outline-none resize-none max-h-40 custom-scrollbar" style={{minHeight:'56px'}} />
          <button onClick={handleChat} disabled={loading||!input.trim()} className="absolute right-3 bottom-3 p-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-zinc-800 disabled:text-zinc-600 rounded-xl text-white transition-all shadow-lg disabled:shadow-none"><Send size={18}/></button>
        </div>
      </div>
    </div>
  );
}
function PanelReview({ activeDocId, flashcards, setFlashcards, exams, setExams, notes, setNotes }) {
  const [activeItem, setActiveItem] = useState(null); // { type: 'exam'|'note'|'flashcards', data: any }
 
  const docCards = flashcards.filter(f => f.docId === activeDocId);
  const docExams = exams.filter(e => e.docId === activeDocId);
  const docNotes = notes.filter(n => n.docId === activeDocId);
  if (activeItem?.type === 'exam') return <InPanelExam exam={activeItem.data} onBack={() => setActiveItem(null)} />;
  if (activeItem?.type === 'note') return <InPanelNote note={activeItem.data} onBack={() => setActiveItem(null)} />;
  if (activeItem?.type === 'flashcards') return <InPanelFlashcards cards={docCards} onBack={() => setActiveItem(null)} setFlashcards={setFlashcards} />;
  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6 bg-[#09090b] space-y-12">
     
      <div>
        <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-5 flex items-center gap-2 bg-emerald-500/10 w-fit px-3 py-1.5 rounded-lg border border-emerald-500/20"><GraduationCap size={16}/> Generated Exams ({docExams.length})</h3>
        {docExams.length === 0 ? <p className="text-sm text-zinc-600 italic bg-zinc-900/50 p-6 rounded-2xl border border-dashed border-zinc-800 text-center">No exams created for this document yet.</p> : (
          <div className="space-y-4">
            {docExams.map(e => (
              <div key={e.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl group shadow-md transition-all hover:border-emerald-500/30">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-white font-bold mb-1">{e.title}</p>
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-500 bg-zinc-950 px-2 py-1 rounded-lg border border-zinc-800">{e.questions.length} Questions • Pgs {e.sourcePages}</span>
                  </div>
                  <button onClick={() => setExams(exams.filter(ex => ex.id !== e.id))} className="p-2 bg-zinc-950 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all shadow-sm"><Trash size={16}/></button>
                </div>
                <button onClick={() => setActiveItem({ type: 'exam', data: e })} className="w-full py-2 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-400 rounded-xl text-xs font-bold uppercase tracking-widest border border-emerald-500/20 transition-all flex items-center justify-center gap-2">
                  <Play size={14} fill="currentColor" /> Take Exam Side-by-Side
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <div className="flex justify-between items-center mb-5">
           <h3 className="text-[10px] font-black uppercase tracking-widest text-indigo-400 flex items-center gap-2 bg-indigo-500/10 w-fit px-3 py-1.5 rounded-lg border border-indigo-500/20"><Layers size={16}/> Saved Flashcards ({docCards.length})</h3>
           {docCards.length > 0 && <button onClick={() => setActiveItem({ type: 'flashcards' })} className="text-[10px] bg-indigo-600 text-white px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest flex items-center gap-1 shadow-md hover:bg-indigo-500 transition-colors"><Play size={12} fill="currentColor"/> Study</button>}
        </div>
        {docCards.length === 0 ? <p className="text-sm text-zinc-600 italic bg-zinc-900/50 p-6 rounded-2xl border border-dashed border-zinc-800 text-center">No flashcards extracted for this document.</p> : (
          <div className="space-y-4">
            {docCards.slice(0, 5).map(c => (
              <div key={c.id} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl relative group pr-12 shadow-md hover:border-indigo-500/30 transition-all">
                <p className="text-xs text-white font-bold line-clamp-2 leading-relaxed"><span className="text-zinc-600 mr-2 text-[10px] uppercase">Q</span>{c.q}</p>
                <button onClick={() => setFlashcards(flashcards.filter(f => f.id !== c.id))} className="absolute top-1/2 -translate-y-1/2 right-4 p-2 bg-zinc-950 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-sm"><Trash size={16}/></button>
              </div>
            ))}
            {docCards.length > 5 && <div className="text-[10px] font-black uppercase tracking-widest text-zinc-500 text-center pt-4 bg-zinc-900/30 rounded-xl py-3 border border-dashed border-zinc-800">+{docCards.length - 5} more inside Study Mode</div>}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-5 flex items-center gap-2 bg-blue-500/10 w-fit px-3 py-1.5 rounded-lg border border-blue-500/20"><BookA size={16}/> Saved Notes ({docNotes.length})</h3>
        {docNotes.length === 0 ? <p className="text-sm text-zinc-600 italic bg-zinc-900/50 p-6 rounded-2xl border border-dashed border-zinc-800 text-center">No notes or summaries generated.</p> : (
          <div className="space-y-4">
            {docNotes.map(n => (
              <div key={n.id} onClick={() => setActiveItem({ type: 'note', data: n })} className="bg-zinc-900 border border-zinc-800 p-5 rounded-2xl group relative shadow-md hover:border-blue-500/30 transition-all cursor-pointer">
                <div className="pr-12">
                   <p className="text-sm text-white font-bold mb-2">{n.title}</p>
                   <p className="text-xs text-zinc-400 line-clamp-3 leading-relaxed bg-zinc-950 p-3 rounded-xl border border-zinc-800">{n.content}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setNotes(notes.filter(no => no.id !== n.id)); }} className="absolute top-5 right-4 p-2 bg-zinc-950 text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-sm"><Trash size={16}/></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
// SIDE-BY-SIDE TOOLS
function InPanelExam({ exam, onBack }) {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [showFeedback, setShowFeedback] = useState(false);
  const [score, setScore] = useState(0);

  const handleSelect = (idx) => {
    if (showFeedback) return;
    setSelectedAnswer(idx);
    setShowFeedback(true);
    if (idx === exam.questions[currentQIndex].correct) {
      setScore(prev => prev + 1);
    }
  };

  const nextQuestion = () => {
    setSelectedAnswer(null);
    setShowFeedback(false);
    if (currentQIndex < exam.questions.length - 1) {
      setCurrentQIndex(currentQIndex + 1);
    } else {
      // Exam finished, perhaps show final score
      alert(`Exam finished! Your score: ${score} / ${exam.questions.length}`);
    }
  };

  const prevQuestion = () => {
    if (currentQIndex > 0) {
      setCurrentQIndex(currentQIndex - 1);
      setSelectedAnswer(null);
      setShowFeedback(false);
    }
  };

  const q = exam.questions[currentQIndex];
  return (
    <div className="flex flex-col h-full bg-[#09090b]">
      <div className="bg-emerald-600/10 border-b border-emerald-500/20 p-4 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="text-emerald-400 hover:text-emerald-300 text-xs font-bold uppercase tracking-widest flex items-center gap-1"><ChevronLeft size={14}/> Back</button>
        <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Pages {exam.sourcePages}</span>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <>
          <div className="mb-6 flex justify-between items-center border-b border-zinc-800 pb-4">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">Question {currentQIndex + 1} of {exam.questions.length}</span>
          </div>
          <h2 className="text-lg text-white font-bold mb-6 leading-relaxed">{q.q}</h2>
          <div className="space-y-3 mb-8">
            {q.options.map((opt, idx) => (
              <button
                key={idx} onClick={() => handleSelect(idx)}
                disabled={showFeedback}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${
                  selectedAnswer === idx ? (idx === q.correct ? 'border-emerald-500 bg-emerald-500/10 text-emerald-100 shadow-inner' : 'border-red-500 bg-red-500/10 text-red-100 shadow-inner') : 'border-zinc-800 bg-zinc-900 text-zinc-300 hover:border-zinc-600'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${selectedAnswer === idx ? 'border-emerald-500' : 'border-zinc-600'}`}>
                  {selectedAnswer === idx && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                </div>
                <span className="text-sm leading-relaxed">{opt}</span>
              </button>
            ))}
          </div>
          {showFeedback && (
            <div className="mt-4 p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl text-xs text-indigo-300/80"><span className="font-bold text-indigo-400 mr-2 uppercase tracking-widest text-[10px]">Explanation:</span>{q.explanation}</div>
          )}
          <div className="flex justify-between items-center">
            <button onClick={prevQuestion} disabled={currentQIndex === 0} className="px-4 py-2 text-zinc-500 hover:text-white disabled:opacity-30 text-xs font-bold uppercase tracking-widest transition-colors">Previous</button>
            <button onClick={nextQuestion} disabled={!showFeedback} className="px-6 py-3 bg-white hover:bg-zinc-200 disabled:bg-zinc-800 disabled:text-zinc-600 text-zinc-950 disabled:shadow-none rounded-xl text-xs font-black shadow-lg uppercase tracking-widest transition-all flex items-center gap-2">Next <ChevronRight size={14}/></button>
          </div>
        </>
      </div>
    </div>
  );
}
function InPanelFlashcards({ cards, onBack, setFlashcards }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  if (cards.length === 0) return <div className="p-6 text-center text-zinc-500">No cards left.</div>;
  const currentCard = cards[currentIndex];
  const handleRate = (quality) => {
    // Basic progression logic
    const nextList = [...cards];
    if (quality === 0) {
      // put at end of list to see again soon
      nextList.push(nextList.splice(currentIndex, 1)[0]);
      setFlashcards(prev => {
         const others = prev.filter(p => p.docId !== currentCard.docId);
         return [...others, ...nextList];
      });
    } else {
      // next card
      if (currentIndex < cards.length - 1) setCurrentIndex(currentIndex + 1);
      else setCurrentIndex(0); // loop
    }
    setIsFlipped(false);
  };
  return (
    <div className="flex flex-col h-full bg-[#09090b]">
      <div className="bg-indigo-600/10 border-b border-indigo-500/20 p-4 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="text-indigo-400 hover:text-indigo-300 text-xs font-bold uppercase tracking-widest flex items-center gap-1"><ChevronLeft size={14}/> Back</button>
        <span className="text-[10px] text-indigo-500 font-black uppercase tracking-widest">Card {currentIndex+1} / {cards.length}</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div onClick={() => !isFlipped && setIsFlipped(true)} className="w-full h-80 perspective-1000 cursor-pointer">
          <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-x-180' : ''}`}>
           
            {/* FRONT */}
            <div className="absolute inset-0 backface-hidden bg-zinc-900 border border-zinc-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl">
              <span className="absolute top-5 left-5 text-[10px] font-black uppercase tracking-widest text-zinc-600">Question</span>
              <h2 className="text-lg font-bold text-white leading-relaxed">{currentCard.q}</h2>
              <div className="absolute bottom-5 text-[10px] font-bold uppercase tracking-widest text-indigo-500/50 animate-pulse">Click to reveal</div>
            </div>
            {/* BACK */}
            <div className="absolute inset-0 backface-hidden bg-indigo-900 border border-indigo-500/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl rotate-x-180 overflow-y-auto custom-scrollbar">
              <span className="absolute top-5 left-5 text-[10px] font-black uppercase tracking-widest text-indigo-400">Answer</span>
              <p className="text-base font-bold text-indigo-50 leading-relaxed">{currentCard.a}</p>
            </div>
          </div>
        </div>
        <div className={`w-full flex gap-3 mt-8 transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button onClick={() => handleRate(0)} className="flex-1 py-4 bg-zinc-900 border border-zinc-800 hover:border-red-500/50 rounded-2xl text-red-400 text-xs font-black uppercase tracking-widest transition-all">Again</button>
          <button onClick={() => handleRate(2)} className="flex-1 py-4 bg-zinc-900 border border-zinc-800 hover:border-emerald-500/50 rounded-2xl text-emerald-400 text-xs font-black uppercase tracking-widest transition-all">Got It</button>
        </div>
      </div>
      <style>{`.perspective-1000 { perspective: 1000px; } .transform-style-3d { transform-style: preserve-3d; } .backface-hidden { backface-visibility: hidden; } .rotate-x-180 { transform: rotateX(180deg); }`}</style>
    </div>
  );
}
function InPanelNote({ note, onBack }) {
  return (
    <div className="flex flex-col h-full bg-[#09090b]">
      <div className="bg-blue-600/10 border-b border-blue-500/20 p-4 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="text-blue-400 hover:text-blue-300 text-xs font-bold uppercase tracking-widest flex items-center gap-1"><ChevronLeft size={14}/> Back</button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
         <h2 className="text-xl font-black text-white mb-6 leading-snug">{note.title}</h2>
         <div className="prose prose-invert prose-sm max-w-none prose-p:text-zinc-300 prose-headings:text-white prose-strong:text-indigo-300 whitespace-pre-wrap leading-relaxed">
            {note.content}
         </div>
      </div>
    </div>
  );
}