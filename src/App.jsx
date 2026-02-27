import React, { useState, useEffect, useRef } from 'react';
import { 
  BookOpen, Layers, CheckSquare, Clock, Settings, 
  ChevronLeft, ChevronRight, Upload, MessageSquare, 
  RefreshCw, CheckCircle2, XCircle, BrainCircuit,
  Library, Trash2, FileText, Search, Play, FileUp,
  Download, Sparkles, BookMarked, PieChart, AlertTriangle,
  ZoomIn, ZoomOut, Maximize, Minimize, Loader2, List,
  Send, Lightbulb, ShieldAlert, Key, LayoutDashboard,
  GraduationCap, Stethoscope, Activity, Target, Save,
  X, Plus, Edit3, SlidersHorizontal, BookA, Crosshair,
  PanelRightClose, PanelRightOpen, Trash
} from 'lucide-react';

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

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [documents, setDocuments] = useState([]);
  const [activeDoc, setActiveDoc] = useState(null);
  
  const [flashcards, setFlashcards] = useState([]);
  const [exams, setExams] = useState([]);
  const [notes, setNotes] = useState([]);
  
  const [userSettings, setUserSettings] = useState({
    apiKey: '',
    strictMode: true 
  });

  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

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

  useEffect(() => {
    const docsMeta = documents.map(d => ({...d, data: null}));
    localStorage.setItem('drMariam_docs', JSON.stringify(docsMeta));
    localStorage.setItem('drMariam_flashcards', JSON.stringify(flashcards));
    localStorage.setItem('drMariam_exams', JSON.stringify(exams));
    localStorage.setItem('drMariam_notes', JSON.stringify(notes));
    localStorage.setItem('drMariam_settings', JSON.stringify(userSettings));
  }, [documents, flashcards, exams, notes, userSettings]);

  const handleFileUpload = async (event) => {
    const file = event.target.files[0];
    if (!file || file.type !== 'application/pdf') return;

    setIsUploading(true);
    setCurrentView('library');
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

      const newDoc = {
        id: Date.now().toString(),
        name: file.name,
        data: arrayBuffer,
        totalPages,
        pagesText,
        progress: 1,
        addedAt: new Date().toISOString()
      };

      setDocuments(prev => [...prev, newDoc]);
      setUploadProgress(100);
      setActiveDoc(newDoc);
      setCurrentView('reader');
    } catch (error) {
      console.error(error);
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  const updateDocProgress = (docId, pageNum) => {
    setDocuments(prev => prev.map(doc => 
      doc.id === docId ? { ...doc, progress: pageNum } : doc
    ));
  };

  return (
    <div className="flex h-screen bg-[#020617] text-slate-200 font-sans overflow-hidden selection:bg-indigo-500/30">
      <nav className="w-16 md:w-64 bg-[#090e1a] border-r border-slate-800/80 flex flex-col transition-all duration-300 z-20">
        <div className="h-14 flex items-center justify-center md:justify-start md:px-5 border-b border-slate-800/80 shrink-0">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-indigo-600 shadow-lg shadow-indigo-600/20 shrink-0">
            <BrainCircuit className="text-white w-5 h-5" />
          </div>
          <span className="hidden md:block ml-3 font-bold text-base tracking-tight text-white">
            Mariam Pro
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-4 flex flex-col gap-1 px-2 custom-scrollbar">
          <NavButton icon={LayoutDashboard} label="Dashboard" isActive={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
          <NavButton icon={Library} label="Library" isActive={currentView === 'library'} onClick={() => setCurrentView('library')} />
          
          <div className="my-2 mx-2 border-t border-slate-800/50"></div>
          <div className="hidden md:block px-3 py-1.5 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Study Assets</div>
          
          <NavButton icon={Layers} label="Flashcards" isActive={currentView === 'flashcards'} onClick={() => setCurrentView('flashcards')} badge={flashcards.length} />
          <NavButton icon={GraduationCap} label="Exams" isActive={currentView === 'exams'} onClick={() => setCurrentView('exams')} badge={exams.length} />
          <NavButton icon={BookA} label="Summaries" isActive={currentView === 'notes'} onClick={() => setCurrentView('notes')} badge={notes.length} />
          
          {activeDoc && (
            <div className="mt-2 p-1.5 rounded-lg bg-indigo-950/20 border border-indigo-500/20">
              <NavButton icon={BookOpen} label="Reader" isActive={currentView === 'reader'} onClick={() => setCurrentView('reader')} highlight />
            </div>
          )}
        </div>

        <div className="p-3 border-t border-slate-800/80 shrink-0">
          <NavButton icon={Settings} label="Settings" isActive={currentView === 'settings'} onClick={() => setCurrentView('settings')} />
        </div>
      </nav>

      <main className="flex-1 flex flex-col overflow-hidden relative bg-[#020617]">
        {isUploading && (
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-800 z-50">
            <div className="h-full bg-indigo-500 transition-all duration-300" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        )}

        {currentView === 'dashboard' && <DashboardView documents={documents} flashcards={flashcards} exams={exams} setView={setCurrentView} />}
        {currentView === 'library' && <LibraryView documents={documents} onUpload={handleFileUpload} onOpen={(doc) => { setActiveDoc(doc); setCurrentView('reader'); }} isUploading={isUploading} />}
        {currentView === 'reader' && activeDoc && (
          <StudyEnvironment 
            activeDoc={activeDoc} 
            updateDocProgress={updateDocProgress} 
            closeDoc={() => setCurrentView('library')}
            userSettings={userSettings}
            setFlashcards={setFlashcards}
            setExams={setExams}
            setNotes={setNotes}
            openSettings={() => setCurrentView('settings')}
          />
        )}
        {currentView === 'flashcards' && <FlashcardsView flashcards={flashcards} setFlashcards={setFlashcards} />}
        {currentView === 'exams' && <ExamsView exams={exams} setExams={setExams} setView={setCurrentView} />}
        {currentView === 'notes' && <NotesView notes={notes} setNotes={setNotes} setView={setCurrentView} />}
        {currentView === 'settings' && <SettingsView settings={userSettings} setSettings={setUserSettings} />}
      </main>
    </div>
  );
}

function NavButton({ icon: Icon, label, isActive, onClick, badge, highlight }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all group relative ${
        isActive 
          ? 'bg-indigo-500/10 text-indigo-400 font-medium' 
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
      } ${highlight ? 'text-indigo-300' : ''}`}
    >
      <Icon size={18} className={isActive ? 'text-indigo-400' : 'text-slate-500 group-hover:text-slate-300'} />
      <span className="hidden md:block text-sm tracking-wide">{label}</span>
      {badge > 0 && (
        <span className="hidden md:flex absolute right-2 bg-slate-800 text-slate-300 text-[9px] font-bold px-1.5 py-0.5 rounded flex items-center justify-center border border-slate-700">
          {badge}
        </span>
      )}
    </button>
  );
}

// --- STUDY ENVIRONMENT (Integrated Split Pane) ---
function StudyEnvironment({ activeDoc, updateDocProgress, closeDoc, userSettings, setFlashcards, setExams, setNotes, openSettings }) {
  const [currentPage, setCurrentPage] = useState(activeDoc.progress || 1);
  const [scale, setScale] = useState(1.0);
  const [pdfUrl, setPdfUrl] = useState(null);
  
  const [rightPanelOpen, setRightPanelOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('generator'); // chat, generator
  
  const [genConfig, setGenConfig] = useState({ type: 'flashcards', startPage: currentPage, endPage: currentPage, count: 5 });
  const [genStatus, setGenStatus] = useState({ loading: false, message: '', error: false });
  const [generatedItems, setGeneratedItems] = useState(null); // Holds unsaved items for review

  const chatEndRef = useRef(null);
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "I am actively reading your current page. How can I help?" }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [chatLoading, setChatLoading] = useState(false);

  useEffect(() => {
    setGenConfig(prev => ({ ...prev, startPage: currentPage, endPage: currentPage }));
  }, [currentPage]);

  useEffect(() => {
    if (activeDoc?.data) {
      const blob = new Blob([activeDoc.data], { type: 'application/pdf' });
      const url = URL.createObjectURL(blob);
      setPdfUrl(url);
      return () => URL.revokeObjectURL(url);
    }
  }, [activeDoc]);

  useEffect(() => {
    updateDocProgress(activeDoc.id, currentPage);
  }, [currentPage, activeDoc.id]);

  const getTextForRange = (start, end) => {
    let combined = "";
    const s = Math.max(1, start);
    const e = Math.min(activeDoc.totalPages, end);
    for (let i = s; i <= e; i++) {
      if (activeDoc.pagesText[i]) combined += `${activeDoc.pagesText[i]}\n`;
    }
    return combined;
  };

  const callLLM = async (promptText, expectJson = false) => {
    const apiKey = userSettings.apiKey?.trim();
    if (!apiKey) {
      throw new Error("API_KEY_MISSING");
    }

    const sysInstruction = userSettings.strictMode 
      ? "You are a strict data extraction AI. You MUST derive all answers, questions, and summaries EXCLUSIVELY from the provided document text. Do not use outside knowledge. Do not hallucinate."
      : "You are an AI tutor helping a student understand a document.";

    const jsonInstruction = expectJson ? " Respond ONLY in valid JSON. No markdown backticks." : "";

    try {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: promptText }] }],
          systemInstruction: { parts: [{ text: sysInstruction + jsonInstruction }] },
          generationConfig: expectJson ? { responseMimeType: "application/json" } : {}
        })
      });
      
      if (!response.ok) throw new Error(`HTTP ${response.status}`);
      const data = await response.json();
      let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      if (expectJson && !data.generationConfig?.responseMimeType) {
         text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      }
      return text;
    } catch (error) {
      if (error.message === 'API_KEY_MISSING') throw error;
      throw new Error("Failed to communicate with AI endpoint. Check your API key or network.");
    }
  };

  const handleChat = async () => {
    if (!chatInput.trim() || chatLoading) return;
    const msg = chatInput;
    setChatInput("");
    setMessages(prev => [...prev, { role: 'user', content: msg }]);
    setChatLoading(true);

    try {
      const context = getTextForRange(currentPage, currentPage);
      const prompt = `DOCUMENT CONTEXT (Page ${currentPage}):\n${context}\n\nSTUDENT QUESTION:\n${msg}`;
      const res = await callLLM(prompt, false);
      setMessages(prev => [...prev, { role: 'assistant', content: res }]);
    } catch (err) {
      if (err.message === 'API_KEY_MISSING') {
         setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ API Key is missing. Please add your Gemini API Key in Settings to use AI features." }]);
      } else {
         setMessages(prev => [...prev, { role: 'assistant', content: "⚠️ Error connecting to AI. Check network or API key." }]);
      }
    } finally {
      setChatLoading(false);
      chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleGenerate = async () => {
    if (!userSettings.apiKey?.trim()) {
      setGenStatus({ loading: false, message: "⚠️ API Key missing. Go to Settings.", error: true });
      return;
    }

    setGenStatus({ loading: true, message: 'Reading document text...', error: false });
    setGeneratedItems(null);
    
    try {
      const { startPage, endPage, count, type } = genConfig;
      if (startPage > endPage) throw new Error("Start page must be <= End page.");
      
      const sourceText = getTextForRange(startPage, endPage);
      if (!sourceText.trim()) throw new Error("No readable text found on these pages.");

      setGenStatus({ loading: true, message: 'AI is generating content...', error: false });

      if (type === 'flashcards') {
        const prompt = `Based EXCLUSIVELY on this text, generate ${count} study flashcards. Format strictly as JSON: { "items": [ {"q": "Question", "a": "Answer"} ] }\n\nTEXT:\n${sourceText}`;
        const res = await callStrictLLMWithRetry(prompt, true);
        setGeneratedItems({ type: 'flashcards', data: res.items, pages: `${startPage}-${endPage}` });
        setGenStatus({ loading: false, message: 'Review generated cards below.', error: false });
      } 
      else if (type === 'exam') {
        const prompt = `Based EXCLUSIVELY on this text, generate a ${count}-question multiple-choice exam. Format strictly as JSON: { "title": "Exam Title", "items": [ { "q": "Question", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "Why" } ] } where correct is index 0-3.\n\nTEXT:\n${sourceText}`;
        const res = await callStrictLLMWithRetry(prompt, true);
        setGeneratedItems({ type: 'exam', title: res.title, data: res.items, pages: `${startPage}-${endPage}` });
        setGenStatus({ loading: false, message: 'Review generated exam below.', error: false });
      }
      else if (type === 'summary') {
        const prompt = `Write a detailed, structured summary of this text using Markdown. Do not include outside knowledge.\n\nTEXT:\n${sourceText}`;
        const res = await callLLM(prompt, false);
        setGeneratedItems({ type: 'summary', data: res, pages: `${startPage}-${endPage}` });
        setGenStatus({ loading: false, message: 'Review generated summary below.', error: false });
      }
    } catch (error) {
      setGenStatus({ loading: false, message: error.message, error: true });
    }
  };

  const callStrictLLMWithRetry = async (prompt, expectJson) => {
    const raw = await callLLM(prompt, expectJson);
    try {
      return JSON.parse(raw);
    } catch (e) {
      throw new Error("AI returned invalid data format. Please try again.");
    }
  };

  const saveGeneratedItem = () => {
    if (!generatedItems) return;
    if (generatedItems.type === 'flashcards') {
      const newCards = generatedItems.data.map(c => ({
        id: Date.now().toString() + Math.random().toString(),
        docId: activeDoc.id, sourcePages: generatedItems.pages,
        q: c.q, a: c.a, level: 0, nextReview: Date.now()
      }));
      setFlashcards(prev => [...prev, ...newCards]);
    } else if (generatedItems.type === 'exam') {
      setExams(prev => [...prev, {
        id: Date.now().toString(), docId: activeDoc.id, sourcePages: generatedItems.pages,
        title: generatedItems.title || "AI Exam", questions: generatedItems.data, createdAt: new Date().toISOString()
      }]);
    } else if (generatedItems.type === 'summary') {
      setNotes(prev => [...prev, {
        id: Date.now().toString(), docId: activeDoc.id, 
        title: `Summary Pgs ${generatedItems.pages}`, content: generatedItems.data, createdAt: new Date().toISOString()
      }]);
    }
    setGeneratedItems(null);
    setGenStatus({ loading: false, message: 'Successfully saved to Library!', error: false });
  };

  const removeGeneratedItem = (index) => {
    if(!generatedItems) return;
    if(generatedItems.type === 'summary') {
       setGeneratedItems(null); // delete whole summary
    } else {
       const newData = [...generatedItems.data];
       newData.splice(index, 1);
       if(newData.length === 0) setGeneratedItems(null);
       else setGeneratedItems({...generatedItems, data: newData});
    }
  };

  return (
    <div className="flex w-full h-full overflow-hidden bg-[#020617]">
      {/* LEFT: PDF READER */}
      <div className={`flex flex-col h-full bg-[#0B1120] relative z-10 transition-all duration-300 ${rightPanelOpen ? 'w-full md:w-[60%] lg:w-[65%]' : 'w-full'}`}>
        <div className="h-14 flex items-center justify-between px-3 bg-[#0f172a] border-b border-slate-800 shrink-0">
          <div className="flex items-center gap-2 overflow-hidden">
            <button onClick={closeDoc} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg shrink-0">
              <ChevronLeft size={20} />
            </button>
            <span className="text-xs font-medium text-slate-300 truncate">{activeDoc.name}</span>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="flex items-center bg-[#020617] rounded border border-slate-800">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="px-2 py-1 text-slate-400 hover:text-white"><ChevronLeft size={16} /></button>
              <span className="text-[10px] font-mono px-2 text-slate-300">{currentPage} / {activeDoc.totalPages}</span>
              <button onClick={() => setCurrentPage(p => Math.min(activeDoc.totalPages, p + 1))} className="px-2 py-1 text-slate-400 hover:text-white"><ChevronRight size={16} /></button>
            </div>
            <button onClick={() => setRightPanelOpen(!rightPanelOpen)} className="p-1.5 ml-2 text-indigo-400 bg-indigo-500/10 rounded border border-indigo-500/20 hover:bg-indigo-500/20">
              {rightPanelOpen ? <PanelRightClose size={18} /> : <PanelRightOpen size={18} />}
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-[#050811] flex justify-center py-4 relative custom-scrollbar">
          {pdfUrl && activeDoc.data ? (
            <div className="relative shadow-2xl transition-transform duration-200 w-full max-w-4xl px-4 flex flex-col items-center" style={{ transformOrigin: 'top center', transform: `scale(${scale})`, height: `${1000 * scale}px` }}>
              <iframe src={`${pdfUrl}#page=${currentPage}&view=FitH&toolbar=0&navpanes=0`} className="w-full h-full border border-slate-800 bg-white rounded" title="PDF Document" />
            </div>
          ) : (
             <div className="m-auto text-slate-500 text-sm">Visual data cleared. AI context intact.</div>
          )}
        </div>
      </div>

      {/* RIGHT: AI STUDIO (Persistent split pane) */}
      {rightPanelOpen && (
        <div className="hidden md:flex flex-col w-[40%] lg:w-[35%] h-full bg-[#090e1a] border-l border-slate-800 shrink-0 z-20">
          <div className="h-14 flex p-1.5 bg-[#0f172a] border-b border-slate-800 shrink-0 gap-1">
            <button onClick={() => setActiveTab('generator')} className={`flex-1 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'generator' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>Generate</button>
            <button onClick={() => setActiveTab('chat')} className={`flex-1 rounded-md text-xs font-bold uppercase tracking-wider transition-colors ${activeTab === 'chat' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800'}`}>Chat</button>
          </div>

          <div className="flex-1 overflow-hidden relative">
            
            {/* GENERATOR TAB */}
            {activeTab === 'generator' && (
              <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-4 flex flex-col">
                <div className="bg-[#0f172a] p-4 rounded-xl border border-slate-800 mb-4">
                  <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Target Pages</h3>
                  <div className="flex items-center gap-3">
                    <input type="number" min={1} max={activeDoc.totalPages} value={genConfig.startPage} onChange={(e) => setGenConfig({...genConfig, startPage: parseInt(e.target.value)||1})} className="w-full bg-[#020617] border border-slate-700 rounded px-2 py-1.5 text-xs text-center font-mono text-white focus:border-indigo-500 outline-none" />
                    <span className="text-slate-600 font-bold text-xs">TO</span>
                    <input type="number" min={1} max={activeDoc.totalPages} value={genConfig.endPage} onChange={(e) => setGenConfig({...genConfig, endPage: parseInt(e.target.value)||1})} className="w-full bg-[#020617] border border-slate-700 rounded px-2 py-1.5 text-xs text-center font-mono text-white focus:border-indigo-500 outline-none" />
                  </div>
                  <div className="mt-4 pt-4 border-t border-slate-800">
                    <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3">Output Type</h3>
                    <div className="grid grid-cols-3 gap-2">
                      <button onClick={()=>setGenConfig({...genConfig, type: 'flashcards'})} className={`py-2 px-1 rounded border text-[10px] font-bold uppercase ${genConfig.type==='flashcards'?'bg-indigo-500/20 border-indigo-500 text-indigo-300':'bg-[#020617] border-slate-700 text-slate-400'}`}>Cards</button>
                      <button onClick={()=>setGenConfig({...genConfig, type: 'exam'})} className={`py-2 px-1 rounded border text-[10px] font-bold uppercase ${genConfig.type==='exam'?'bg-indigo-500/20 border-indigo-500 text-indigo-300':'bg-[#020617] border-slate-700 text-slate-400'}`}>Exam</button>
                      <button onClick={()=>setGenConfig({...genConfig, type: 'summary'})} className={`py-2 px-1 rounded border text-[10px] font-bold uppercase ${genConfig.type==='summary'?'bg-indigo-500/20 border-indigo-500 text-indigo-300':'bg-[#020617] border-slate-700 text-slate-400'}`}>Summary</button>
                    </div>
                  </div>
                  {genConfig.type !== 'summary' && (
                    <div className="mt-4">
                      <h3 className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2">Count ({genConfig.count})</h3>
                      <input type="range" min="1" max="15" value={genConfig.count} onChange={(e) => setGenConfig({...genConfig, count: parseInt(e.target.value)})} className="w-full accent-indigo-500" />
                    </div>
                  )}
                  <button onClick={handleGenerate} disabled={genStatus.loading || !userSettings.apiKey} className="w-full mt-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded font-bold text-xs uppercase tracking-widest transition-all">
                    {genStatus.loading ? "Extracting..." : "Generate Content"}
                  </button>
                </div>

                {/* Status / Output Area */}
                {genStatus.message && (
                  <div className={`p-3 rounded-lg text-xs font-medium mb-4 flex items-center gap-2 ${genStatus.error ? 'bg-red-500/10 text-red-400 border border-red-500/20' : genStatus.loading ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                    {genStatus.loading && <Loader2 size={14} className="animate-spin" />}
                    {genStatus.message}
                    {genStatus.error && genStatus.message.includes('API Key') && (
                       <button onClick={openSettings} className="ml-auto underline">Fix Settings</button>
                    )}
                  </div>
                )}

                {/* Generated Results Preview */}
                {generatedItems && (
                  <div className="flex-1 flex flex-col bg-[#0f172a] rounded-xl border border-emerald-500/30 overflow-hidden">
                    <div className="bg-emerald-500/10 p-2 border-b border-emerald-500/20 flex justify-between items-center shrink-0">
                      <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest px-2">Preview Mode</span>
                      <div className="flex gap-2">
                        <button onClick={()=>setGeneratedItems(null)} className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs">Discard</button>
                        <button onClick={saveGeneratedItem} className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded text-xs font-bold flex items-center gap-1"><Save size={12}/> Save</button>
                      </div>
                    </div>
                    <div className="p-3 overflow-y-auto custom-scrollbar flex-1 space-y-3">
                      {generatedItems.type === 'flashcards' && generatedItems.data.map((item, idx) => (
                        <div key={idx} className="bg-[#020617] border border-slate-800 p-3 rounded group relative pr-8">
                          <p className="text-xs text-slate-300 font-bold mb-1">Q: {item.q}</p>
                          <p className="text-xs text-indigo-300">A: {item.a}</p>
                          <button onClick={()=>removeGeneratedItem(idx)} className="absolute top-2 right-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash size={14}/></button>
                        </div>
                      ))}
                      {generatedItems.type === 'exam' && generatedItems.data.map((item, idx) => (
                        <div key={idx} className="bg-[#020617] border border-slate-800 p-3 rounded group relative pr-8">
                          <p className="text-xs text-slate-300 font-bold mb-2">{idx+1}. {item.q}</p>
                          <div className="space-y-1">
                            {item.options.map((opt, oIdx) => (
                              <div key={oIdx} className={`text-[10px] p-1.5 rounded ${oIdx === item.correct ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-800 text-slate-400'}`}>{opt}</div>
                            ))}
                          </div>
                          <button onClick={()=>removeGeneratedItem(idx)} className="absolute top-2 right-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash size={14}/></button>
                        </div>
                      ))}
                      {generatedItems.type === 'summary' && (
                         <div className="bg-[#020617] border border-slate-800 p-3 rounded text-xs text-slate-300 whitespace-pre-wrap relative group pr-8">
                            {generatedItems.data}
                            <button onClick={()=>removeGeneratedItem(0)} className="absolute top-2 right-2 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash size={14}/></button>
                         </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* CHAT TAB */}
            {activeTab === 'chat' && (
              <div className="absolute inset-0 flex flex-col bg-[#090e1a]">
                <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                      <div className={`w-6 h-6 rounded flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-slate-800 border border-slate-700'}`}>
                        {msg.role === 'user' ? <List size={12} className="text-white" /> : <BrainCircuit size={12} className="text-indigo-400" />}
                      </div>
                      <div className={`p-3 max-w-[85%] text-xs leading-relaxed ${msg.role === 'user' ? 'bg-indigo-600 text-white rounded-xl rounded-tr-sm' : 'bg-[#0f172a] border border-slate-800 rounded-xl rounded-tl-sm text-slate-200'}`}>
                        <div className="whitespace-pre-wrap">{msg.content}</div>
                      </div>
                    </div>
                  ))}
                  {chatLoading && (
                    <div className="flex gap-3">
                      <div className="w-6 h-6 rounded bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0"><Loader2 size={12} className="text-indigo-400 animate-spin" /></div>
                      <div className="p-3 bg-[#0f172a] border border-slate-800 rounded-xl rounded-tl-sm"><span className="flex gap-1"><span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce"></span><span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{animationDelay:'0.1s'}}></span><span className="w-1.5 h-1.5 bg-slate-500 rounded-full animate-bounce" style={{animationDelay:'0.2s'}}></span></span></div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>
                <div className="p-3 bg-[#0f172a] border-t border-slate-800 shrink-0">
                  <div className="relative flex items-end bg-[#020617] border border-slate-700 rounded-lg overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500">
                    <textarea value={chatInput} onChange={e => setChatInput(e.target.value)} onKeyDown={e => {if(e.key==='Enter' && !e.shiftKey) { e.preventDefault(); handleChat(); }}} placeholder="Ask about this page..." disabled={chatLoading} className="w-full bg-transparent p-3 pr-10 text-xs text-white focus:outline-none resize-none max-h-24 custom-scrollbar" style={{ minHeight: '44px' }} />
                    <button onClick={handleChat} disabled={chatLoading || !chatInput.trim()} className="absolute right-1 bottom-1 p-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-transparent disabled:text-slate-600 rounded text-white transition-colors"><Send size={14} /></button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


// --- DASHBOARD, LIBRARY, FLASHCARDS, EXAMS, NOTES, SETTINGS VIEWS ---
// (These remain functionally similar but with cleaner UI to match the dark theme)

function DashboardView({ documents, flashcards, exams, setView }) {
  return (
    <div className="flex-1 overflow-auto p-8 custom-scrollbar">
      <div className="max-w-5xl mx-auto space-y-8 mt-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Intelligence Hub</h1>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <StatCard icon={FileText} label="Active Documents" value={documents.length} color="blue" onClick={() => setView('library')} />
          <StatCard icon={Layers} label="Flashcards" value={flashcards.length} color="indigo" onClick={() => setView('flashcards')} />
          <StatCard icon={Target} label="Exams Created" value={exams.length} color="violet" onClick={() => setView('exams')} />
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, onClick }) {
  const colorMap = { blue: 'text-blue-400 bg-blue-500/10 border-blue-500/20', indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20', violet: 'text-violet-400 bg-violet-500/10 border-violet-500/20' };
  return (
    <div onClick={onClick} className={`p-6 rounded-xl border ${colorMap[color]} hover:opacity-80 cursor-pointer transition-all group`}>
      <Icon size={24} className="mb-4 group-hover:scale-110 transition-transform" />
      <span className="block text-4xl font-black text-white">{value}</span>
      <span className="block text-xs mt-2 font-bold uppercase tracking-widest">{label}</span>
    </div>
  );
}

function LibraryView({ documents, onUpload, onOpen, isUploading }) {
  return (
    <div className="max-w-5xl mx-auto w-full p-8 flex-1 overflow-auto custom-scrollbar">
      <div className="flex justify-between items-center mb-10 mt-4">
        <h1 className="text-3xl font-bold text-white">Repository</h1>
        <label className={`cursor-pointer bg-indigo-600 hover:bg-indigo-500 px-5 py-2.5 rounded-lg font-bold text-sm text-white flex items-center gap-2 transition-all ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
          {isUploading ? <Loader2 className="animate-spin" size={16} /> : <Upload size={16} />} Upload PDF
          <input type="file" accept="application/pdf" className="hidden" onChange={onUpload} disabled={isUploading} />
        </label>
      </div>
      {documents.length === 0 ? (
        <div className="text-center py-20 border border-dashed border-slate-800 rounded-xl bg-[#0f172a]/50"><FileUp size={40} className="mx-auto text-slate-700 mb-4" /><p className="text-slate-500 text-sm">Upload a PDF to start analyzing.</p></div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {documents.map(doc => (
            <div key={doc.id} onClick={() => onOpen(doc)} className="bg-[#0f172a] rounded-xl p-4 border border-slate-800 hover:border-indigo-500/50 cursor-pointer transition-colors flex flex-col h-40">
              <BookOpen size={20} className="text-slate-500 mb-3" />
              <h3 className="font-semibold text-slate-200 text-sm line-clamp-2 flex-1">{doc.name}</h3>
              <div className="mt-2 text-[10px] font-mono text-slate-500 uppercase">Pg {doc.progress} / {doc.totalPages}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FlashcardsView({ flashcards, setFlashcards }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const activeCards = flashcards.filter(c => c.nextReview <= Date.now());

  const handleRate = (quality) => {
    const card = activeCards[currentIndex];
    const newLevel = quality === 0 ? 0 : card.level + 1;
    const nextReview = Date.now() + ((quality === 0 ? 1 : Math.pow(2, newLevel) * 24) * 60 * 60 * 1000);
    setFlashcards(flashcards.map(c => c.id === card.id ? { ...c, level: newLevel, nextReview } : c));
    setIsFlipped(false);
  };

  const deleteCard = (id) => {
    setFlashcards(flashcards.filter(c => c.id !== id));
    setIsFlipped(false);
  };

  if (activeCards.length === 0) return <div className="p-8 text-center text-slate-500 mt-20"><CheckCircle2 size={40} className="mx-auto mb-4 text-emerald-500 opacity-50"/>No cards due. Database has {flashcards.length} total.</div>;
  const card = activeCards[currentIndex];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-8 bg-[#020617]">
      <div className="w-full max-w-xl mb-4 flex justify-between items-center text-xs text-slate-500 font-bold uppercase tracking-widest">
        <span>Due: {activeCards.length}</span>
        <button onClick={()=>deleteCard(card.id)} className="text-red-400 hover:text-red-300">Delete Card</button>
      </div>
      <div onClick={() => !isFlipped && setIsFlipped(true)} className="w-full max-w-xl min-h-[300px] perspective-1000 cursor-pointer">
        <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-x-180' : ''}`}>
          <div className="absolute inset-0 backface-hidden bg-[#0f172a] border border-slate-800 rounded-2xl p-8 flex items-center justify-center text-center shadow-xl"><h2 className="text-xl text-white">{card.q}</h2></div>
          <div className="absolute inset-0 backface-hidden bg-indigo-900 border border-indigo-500/50 rounded-2xl p-8 flex items-center justify-center text-center shadow-xl rotate-x-180 overflow-auto"><p className="text-lg text-indigo-100">{card.a}</p></div>
        </div>
      </div>
      <div className={`w-full max-w-xl flex gap-3 mt-6 transition-opacity ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <button onClick={() => handleRate(0)} className="flex-1 py-3 bg-slate-900 border border-slate-800 rounded-lg text-red-400 text-sm font-bold uppercase hover:bg-slate-800">Again</button>
        <button onClick={() => handleRate(1)} className="flex-1 py-3 bg-slate-900 border border-slate-800 rounded-lg text-orange-400 text-sm font-bold uppercase hover:bg-slate-800">Hard</button>
        <button onClick={() => handleRate(2)} className="flex-1 py-3 bg-slate-900 border border-slate-800 rounded-lg text-emerald-400 text-sm font-bold uppercase hover:bg-slate-800">Good</button>
      </div>
      <style>{`.perspective-1000 { perspective: 1000px; } .transform-style-3d { transform-style: preserve-3d; } .backface-hidden { backface-visibility: hidden; } .rotate-x-180 { transform: rotateX(180deg); }`}</style>
    </div>
  );
}

function ExamsView({ exams, setExams, setView }) {
  if (exams.length === 0) return <div className="p-8 text-center text-slate-500 mt-20">No exams generated yet.</div>;
  return (
    <div className="p-8 max-w-5xl mx-auto w-full">
      <h1 className="text-2xl font-bold text-white mb-8">Exams</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {exams.map(exam => (
          <div key={exam.id} className="bg-[#0f172a] p-5 rounded-xl border border-slate-800 flex justify-between items-center">
            <div><h3 className="font-bold text-white text-sm">{exam.title}</h3><p className="text-xs text-slate-500 mt-1">{exam.questions.length} Questions</p></div>
            <button onClick={() => setExams(exams.filter(e => e.id !== exam.id))} className="text-slate-600 hover:text-red-400"><Trash size={16}/></button>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotesView({ notes, setNotes }) {
  if (notes.length === 0) return <div className="p-8 text-center text-slate-500 mt-20">No summaries generated yet.</div>;
  return (
    <div className="p-8 max-w-5xl mx-auto w-full overflow-auto">
      <h1 className="text-2xl font-bold text-white mb-8">Summaries</h1>
      <div className="space-y-6">
        {notes.map(note => (
          <div key={note.id} className="bg-[#0f172a] p-6 rounded-xl border border-slate-800 relative group">
            <button onClick={() => setNotes(notes.filter(n => n.id !== note.id))} className="absolute top-4 right-4 text-slate-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><Trash size={16}/></button>
            <h3 className="font-bold text-indigo-400 mb-4">{note.title}</h3>
            <div className="text-sm text-slate-300 whitespace-pre-wrap leading-relaxed">{note.content}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsView({ settings, setSettings }) {
  return (
    <div className="p-8 max-w-2xl mx-auto w-full mt-10">
      <h1 className="text-2xl font-bold text-white mb-8">System Preferences</h1>
      <div className="bg-[#0f172a] p-6 rounded-xl border border-slate-800 space-y-6">
        <div>
          <label className="text-xs font-bold uppercase tracking-widest text-slate-500 mb-2 block">Gemini API Key (Required)</label>
          <input type="password" value={settings.apiKey} onChange={(e) => setSettings({...settings, apiKey: e.target.value})} placeholder="Paste your Gemini API key here" className="w-full bg-[#020617] border border-slate-700 rounded-lg px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500" />
          <p className="text-[10px] text-red-400 mt-2">Required for local VS Code environments. Keys are stored safely in local storage.</p>
        </div>
        <div className="pt-4 border-t border-slate-800 flex items-start gap-3">
          <input type="checkbox" checked={settings.strictMode} onChange={(e) => setSettings({...settings, strictMode: e.target.checked})} className="mt-1" />
          <div>
            <span className="text-sm font-bold text-white block">Strict Mode</span>
            <span className="text-xs text-slate-500">Forces AI to only use data explicitly found in your selected PDF pages. Prevents hallucinations.</span>
          </div>
        </div>
      </div>
    </div>
  );
}