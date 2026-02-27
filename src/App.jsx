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
  X, Plus, Edit3, SlidersHorizontal, BookA, Crosshair
} from 'lucide-react';

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

export default function App() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [documents, setDocuments] = useState([]);
  const [activeDoc, setActiveDoc] = useState(null);
  
  const [flashcards, setFlashcards] = useState([]);
  const [exams, setExams] = useState([]);
  const [notes, setNotes] = useState([]);
  
  const [userSettings, setUserSettings] = useState({
    apiKey: '',
    strictMode: true // Forces AI to ONLY use document context
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
    <div className="flex h-screen bg-[#020617] text-slate-100 font-sans overflow-hidden selection:bg-indigo-500/30">
      <nav className="w-20 md:w-64 bg-[#0f172a] border-r border-slate-800/50 flex flex-col transition-all duration-300 z-20 shadow-xl">
        <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-slate-800/50 shrink-0 bg-[#0f172a]">
          <div className="relative flex items-center justify-center w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-violet-600 shadow-lg shadow-indigo-500/30 shrink-0">
            <BrainCircuit className="text-white w-5 h-5" />
          </div>
          <span className="hidden md:block ml-3 font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Mariam Pro
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-1 px-3 custom-scrollbar">
          <NavButton icon={LayoutDashboard} label="Dashboard" isActive={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
          <NavButton icon={Library} label="Library" isActive={currentView === 'library'} onClick={() => setCurrentView('library')} />
          
          <div className="my-3 border-t border-slate-800/50 mx-2"></div>
          <div className="hidden md:block px-3 py-2 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Knowledge Base</div>
          
          <NavButton icon={Layers} label="Flashcards" isActive={currentView === 'flashcards'} onClick={() => setCurrentView('flashcards')} badge={flashcards.length} />
          <NavButton icon={GraduationCap} label="Exams" isActive={currentView === 'exams'} onClick={() => setCurrentView('exams')} badge={exams.length} />
          <NavButton icon={BookA} label="Summaries & Notes" isActive={currentView === 'notes'} onClick={() => setCurrentView('notes')} badge={notes.length} />
          
          {activeDoc && (
            <div className="mt-2 p-2 rounded-xl bg-indigo-950/30 border border-indigo-500/20">
              <NavButton icon={BookOpen} label="Active Reader" isActive={currentView === 'reader'} onClick={() => setCurrentView('reader')} highlight />
            </div>
          )}
        </div>

        <div className="p-4 border-t border-slate-800/50 shrink-0">
          <NavButton icon={Settings} label="Preferences" isActive={currentView === 'settings'} onClick={() => setCurrentView('settings')} />
        </div>
      </nav>

      <main className="flex-1 flex flex-col overflow-hidden relative bg-[#020617]">
        {isUploading && (
          <div className="absolute top-0 left-0 w-full h-1 bg-slate-800 z-50">
            <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-300 shadow-[0_0_10px_rgba(99,102,241,0.5)]" style={{ width: `${uploadProgress}%` }}></div>
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
          ? 'bg-indigo-500/15 text-indigo-400 font-medium' 
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

// --- DASHBOARD VIEW ---
function DashboardView({ documents, flashcards, exams, setView }) {
  return (
    <div className="flex-1 overflow-auto p-8 custom-scrollbar">
      <div className="max-w-6xl mx-auto space-y-8 mt-4">
        <div>
          <h1 className="text-4xl font-bold text-white tracking-tight">Intelligence Hub</h1>
          <p className="text-slate-400 mt-2 text-sm">Your highly-focused academic repository.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          <StatCard icon={FileText} label="Active Documents" value={documents.length} color="blue" onClick={() => setView('library')} />
          <StatCard icon={Layers} label="Spaced Repetition Cards" value={flashcards.length} color="indigo" onClick={() => setView('flashcards')} />
          <StatCard icon={Target} label="Strict Assessments" value={exams.length} color="violet" onClick={() => setView('exams')} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-[#0f172a] border border-slate-800/80 rounded-2xl p-6 shadow-lg shadow-black/20">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-sm font-bold tracking-widest uppercase text-slate-300 flex items-center gap-2"><Clock size={16} className="text-indigo-500"/> Recent Materials</h2>
              <button onClick={() => setView('library')} className="text-xs font-medium text-indigo-400 hover:text-indigo-300">View All</button>
            </div>
            {documents.length === 0 ? (
              <p className="text-slate-500 text-sm py-8 text-center italic">Repository is empty.</p>
            ) : (
              <div className="space-y-2">
                {documents.slice(-4).reverse().map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3.5 rounded-xl bg-[#1e293b]/50 border border-slate-700/30 hover:bg-[#1e293b] transition-colors cursor-pointer" onClick={() => setView('library')}>
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-400 shrink-0"><FileText size={14} /></div>
                      <span className="text-sm font-medium truncate text-slate-200">{doc.name}</span>
                    </div>
                    <span className="text-xs font-mono text-slate-500 shrink-0">Pg {doc.progress}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-gradient-to-br from-indigo-950/40 to-[#0f172a] border border-indigo-500/20 rounded-2xl p-6 shadow-lg shadow-indigo-900/10 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-5 pointer-events-none">
              <BrainCircuit size={120} />
            </div>
            <div className="flex items-center justify-between mb-6 relative z-10">
              <h2 className="text-sm font-bold tracking-widest uppercase text-indigo-300 flex items-center gap-2"><ShieldAlert size={16}/> Strict Mode Active</h2>
            </div>
            <div className="space-y-4 relative z-10">
              <p className="text-sm text-slate-300 leading-relaxed">
                Your AI assistant is currently locked to <strong className="text-white">Strict Extraction Mode</strong>. All generated flashcards, exams, and summaries are strictly bound to the data within your uploaded documents. External data hallucination is disabled.
              </p>
              <button onClick={() => setView('library')} className="mt-4 text-sm font-medium bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-2.5 rounded-lg transition-colors shadow-lg shadow-indigo-500/25 flex items-center gap-2">
                <BookOpen size={16} /> Open Reader to Extract Data
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, onClick }) {
  const colorMap = {
    blue: 'from-blue-500/10 to-transparent border-blue-500/20 text-blue-400',
    indigo: 'from-indigo-500/10 to-transparent border-indigo-500/20 text-indigo-400',
    violet: 'from-violet-500/10 to-transparent border-violet-500/20 text-violet-400',
  };
  return (
    <div onClick={onClick} className={`p-6 rounded-2xl border bg-gradient-to-br ${colorMap[color]} hover:opacity-80 cursor-pointer transition-all group backdrop-blur-sm`}>
      <div className="flex justify-between items-start">
        <div className={`p-3 rounded-xl bg-slate-900/50 border border-slate-800 backdrop-blur-md`}>
          <Icon size={20} className="group-hover:scale-110 transition-transform" />
        </div>
        <span className="text-4xl font-black text-white tracking-tighter">{value}</span>
      </div>
      <p className="text-sm mt-5 font-semibold tracking-wide text-slate-400 uppercase">{label}</p>
    </div>
  );
}

// --- SETTINGS VIEW ---
function SettingsView({ settings, setSettings }) {
  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setSettings(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  return (
    <div className="flex-1 overflow-auto p-8 custom-scrollbar flex justify-center bg-[#020617]">
      <div className="max-w-2xl w-full space-y-8 mt-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Settings className="text-slate-400" /> Preferences
          </h1>
          <p className="text-slate-400 mt-2 text-sm">Configure system strictness and API limits.</p>
        </div>

        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 bg-[#1e293b]/30">
            <h2 className="text-sm font-bold tracking-widest uppercase flex items-center gap-2 text-slate-300">
              <ShieldAlert size={16} className="text-indigo-400"/> AI Grounding rules
            </h2>
          </div>
          
          <div className="p-6 space-y-6">
            <label className="flex items-start gap-4 p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/5 cursor-pointer hover:bg-indigo-500/10 transition-colors">
              <div className="mt-1">
                <input 
                  type="checkbox" 
                  name="strictMode"
                  checked={settings.strictMode}
                  onChange={handleChange}
                  className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-700"
                />
              </div>
              <div>
                <span className="block font-semibold text-indigo-100 text-sm">Strict Document Grounding (Highly Recommended)</span>
                <span className="block text-xs text-slate-400 mt-1 leading-relaxed">
                  When enabled, the AI is strictly forbidden from using external knowledge. It will only generate flashcards, exams, and summaries based EXACTLY on the text provided in your selected pages. If the answer isn't in the text, the AI will fail gracefully rather than hallucinate.
                </span>
              </div>
            </label>

            <div className="space-y-2 pt-4 border-t border-slate-800">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Key size={14} /> Custom Gemini API Key <span className="text-[10px] text-slate-500 font-normal uppercase tracking-widest">(Optional)</span>
              </label>
              <input 
                type="password" 
                name="apiKey"
                value={settings.apiKey}
                onChange={handleChange}
                placeholder="Leave blank to use platform default key"
                className="w-full bg-[#020617] border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <p className="text-[10px] text-slate-500">Stored locally. Used to bypass shared rate limits for heavy document processing.</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- LIBRARY VIEW ---
function LibraryView({ documents, onUpload, onOpen, isUploading }) {
  const [search, setSearch] = useState("");
  const filteredDocs = documents.filter(d => d.name.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="max-w-6xl mx-auto w-full p-8 flex-1 overflow-auto custom-scrollbar">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 mt-4">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Repository</h1>
          <p className="text-slate-400 mt-2 text-sm">Upload standard PDFs. Text is extracted locally for secure AI processing.</p>
        </div>
        
        <label className={`cursor-pointer bg-white text-slate-900 hover:bg-slate-200 px-5 py-2.5 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-white/10 ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}>
          {isUploading ? <Loader2 className="animate-spin text-slate-900" size={16} /> : <Upload size={16} />}
          {isUploading ? "Extracting Data..." : "Upload Document"}
          <input type="file" accept="application/pdf" className="hidden" onChange={onUpload} disabled={isUploading} />
        </label>
      </div>

      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={18} />
        <input 
          type="text" 
          value={search}
          onChange={e => setSearch(e.target.value)}
          placeholder="Filter documents..." 
          className="w-full bg-[#0f172a] border border-slate-800 rounded-xl pl-12 pr-4 py-3.5 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-inner"
        />
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-32 border border-dashed border-slate-800 rounded-2xl bg-[#0f172a]/50">
          <FileUp size={48} className="mx-auto text-slate-700 mb-6" />
          <h2 className="text-lg font-bold text-slate-300 mb-2">No Documents Found</h2>
          <p className="text-slate-500 text-sm max-w-sm mx-auto">
            Upload your first textbook, paper, or notes document to begin generating strict study materials.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filteredDocs.map(doc => (
            <div 
              key={doc.id} 
              onClick={() => onOpen(doc)} 
              className="group cursor-pointer bg-[#0f172a] rounded-2xl p-5 border border-slate-800 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all flex flex-col h-48"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-400 transition-all">
                  <BookOpen size={18} />
                </div>
                <div className="px-2 py-1 bg-[#020617] text-[9px] rounded font-bold tracking-widest text-slate-400 border border-slate-800 uppercase">
                  {doc.totalPages} PGs
                </div>
              </div>
              <h3 className="font-semibold text-slate-200 text-sm leading-snug line-clamp-2 flex-1" title={doc.name}>{doc.name}</h3>
              
              <div className="mt-4">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Progress</span>
                  <span className="text-[10px] font-mono text-indigo-400">{Math.round((doc.progress / doc.totalPages) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-800/50 rounded-full h-1 overflow-hidden">
                  <div 
                    className="bg-indigo-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${Math.min(100, (doc.progress / doc.totalPages) * 100)}%` }}
                  ></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// --- CORE STUDY ENVIRONMENT WITH PRO GENERATOR ---
function StudyEnvironment({ activeDoc, updateDocProgress, closeDoc, userSettings, setFlashcards, setExams, setNotes }) {
  const [currentPage, setCurrentPage] = useState(activeDoc.progress || 1);
  const [scale, setScale] = useState(1.0);
  const [pdfUrl, setPdfUrl] = useState(null);
  
  // Pro Generator Modal State
  const [generatorOpen, setGeneratorOpen] = useState(false);
  const [genConfig, setGenConfig] = useState({
    type: 'flashcards', // flashcards, exam, summary
    startPage: currentPage,
    endPage: currentPage,
    count: 5,
    focusTopic: ''
  });
  const [genStatus, setGenStatus] = useState({ loading: false, message: '', error: false });

  // Update genConfig when page changes if modal is closed
  useEffect(() => {
    if(!generatorOpen) {
      setGenConfig(prev => ({ ...prev, startPage: currentPage, endPage: currentPage }));
    }
  }, [currentPage, generatorOpen]);

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

  // Extracts text for a specific page range
  const getTextForRange = (start, end) => {
    let combined = "";
    const s = Math.max(1, start);
    const e = Math.min(activeDoc.totalPages, end);
    for (let i = s; i <= e; i++) {
      if (activeDoc.pagesText[i] && activeDoc.pagesText[i].trim().length > 0) {
        combined += `--- PAGE ${i} ---\n${activeDoc.pagesText[i]}\n\n`;
      }
    }
    return combined;
  };

  const callStrictLLM = async (promptText, expectJson = false) => {
    const apiKey = userSettings.apiKey || ""; 
    
    // THE STRICTEST POSSIBLE SYSTEM PROMPT
    const strictInstruction = `You are a highly advanced, ultra-strict data extraction and study generation engine.
CRITICAL MANDATES:
1. You MUST derive EVERY single fact, answer, question, and summary EXCLUSIVELY from the provided document text.
2. NEVER use external knowledge. NEVER hallucinate information.
3. If a user's focus topic or request cannot be fulfilled using ONLY the provided text, you must output an error or adapt ONLY to what is available in the text.
4. Accuracy to the source text is your highest priority.`;

    const jsonInstruction = expectJson ? " YOU MUST RESPOND ONLY IN VALID JSON FORMAT. NO MARKDOWN BACKTICKS. NO EXTRA TEXT." : "";

    let retries = 3;
    while (retries > 0) {
      try {
        const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{ parts: [{ text: promptText }] }],
            systemInstruction: { parts: [{ text: strictInstruction + jsonInstruction }] },
            generationConfig: expectJson ? { responseMimeType: "application/json" } : {}
          })
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
        
        if (expectJson && !data.generationConfig?.responseMimeType) {
           text = text.replace(/```json/g, '').replace(/```/g, '').trim();
        }
        return text;
      } catch (error) {
        retries--;
        if (retries === 0) throw new Error("Failed to communicate with AI endpoint.");
        await new Promise(r => setTimeout(r, 1500));
      }
    }
  };

  const handleGenerate = async () => {
    setGenStatus({ loading: true, message: 'Extracting secure text layer...', error: false });
    
    try {
      const { startPage, endPage, count, focusTopic, type } = genConfig;
      
      if (startPage > endPage) throw new Error("Start page must be before or equal to End page.");
      if (endPage > activeDoc.totalPages) throw new Error(`Document only has ${activeDoc.totalPages} pages.`);

      const sourceText = getTextForRange(startPage, endPage);
      if (!sourceText.trim()) throw new Error("No readable text found in the selected page range. The PDF might be scanned images without OCR.");

      setGenStatus({ loading: true, message: `Analyzing ${endPage - startPage + 1} page(s) strictly...`, error: false });

      const topicConstraint = focusTopic ? `\n\nUSER CONSTRAINT: Focus specifically on information related to: "${focusTopic}". If this topic is NOT present in the text, extract general key points instead.` : "";
      
      let finalPrompt = "";

      if (type === 'flashcards') {
        finalPrompt = `Based EXCLUSIVELY on the text below, generate exactly ${count} study flashcards. 
        Format strictly as JSON: { "cards": [ {"q": "Question here based ONLY on text", "a": "Answer here based ONLY on text"} ] }
        ${topicConstraint}
        
        SOURCE TEXT:
        ${sourceText}`;
        
        const res = await callStrictLLM(finalPrompt, true);
        const parsed = JSON.parse(res);
        if (!parsed.cards || !Array.isArray(parsed.cards)) throw new Error("AI returned malformed JSON.");
        
        const newCards = parsed.cards.map(c => ({
          id: Date.now().toString() + Math.random().toString(),
          docId: activeDoc.id,
          sourcePages: `${startPage}-${endPage}`,
          q: c.q,
          a: c.a,
          level: 0,
          nextReview: Date.now()
        }));
        setFlashcards(prev => [...prev, ...newCards]);
        setGenStatus({ loading: false, message: `Success! Added ${newCards.length} strict flashcards to Library.`, error: false });
      } 
      
      else if (type === 'exam') {
        finalPrompt = `Based EXCLUSIVELY on the text below, generate a ${count}-question multiple-choice exam. 
        Format strictly as JSON: { "title": "Exam Title", "questions": [ { "q": "Question strictly from text", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "Explanation strictly from text" } ] } where 'correct' is the index (0-3).
        ${topicConstraint}
        
        SOURCE TEXT:
        ${sourceText}`;
        
        const res = await callStrictLLM(finalPrompt, true);
        const parsed = JSON.parse(res);
        if (!parsed.questions || !Array.isArray(parsed.questions)) throw new Error("AI returned malformed JSON.");
        
        const newExam = {
          id: Date.now().toString(),
          docId: activeDoc.id,
          sourcePages: `${startPage}-${endPage}`,
          title: parsed.title || `Strict Exam: Pages ${startPage}-${endPage}`,
          questions: parsed.questions,
          createdAt: new Date().toISOString()
        };
        setExams(prev => [...prev, newExam]);
        setGenStatus({ loading: false, message: `Success! Created exam "${newExam.title}" with ${newExam.questions.length} questions.`, error: false });
      }

      else if (type === 'summary') {
        finalPrompt = `Write a comprehensive, highly accurate summary of the text below. 
        CRITICAL: Do NOT include any information that is not explicitly stated in the text.
        Format beautifully using markdown headings, bullet points, and bold text for key terms.
        ${topicConstraint}
        
        SOURCE TEXT:
        ${sourceText}`;
        
        setGenStatus({ loading: true, message: 'Generating comprehensive summary...', error: false });
        const res = await callStrictLLM(finalPrompt, false);
        
        const newNote = {
          id: Date.now().toString(),
          docId: activeDoc.id,
          title: `Summary: Pages ${startPage}-${endPage} ${focusTopic ? `(${focusTopic})` : ''}`,
          content: res,
          createdAt: new Date().toISOString()
        };
        setNotes(prev => [...prev, newNote]);
        setGenStatus({ loading: false, message: `Success! Summary saved to your Notes.`, error: false });
      }

      // Auto close modal on success after delay
      setTimeout(() => {
        setGeneratorOpen(false);
        setGenStatus({ loading: false, message: '', error: false });
      }, 2500);

    } catch (error) {
      console.error(error);
      setGenStatus({ loading: false, message: error.message || "An error occurred during strict generation.", error: true });
    }
  };

  return (
    <div className="flex w-full h-full overflow-hidden bg-[#020617] relative">
      
      {/* LEFT PANE: PDF Viewer (Expanded to full width initially, overlay tools) */}
      <div className="flex-1 flex flex-col bg-[#0B1120] relative z-10">
        <div className="h-14 flex items-center justify-between px-4 bg-[#0f172a] border-b border-slate-800 shrink-0 shadow-sm z-20">
          <div className="flex items-center gap-3">
            <button onClick={closeDoc} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all flex items-center">
              <ChevronLeft size={20} />
            </button>
            <div className="h-5 w-px bg-slate-800"></div>
            <div className="flex items-center gap-2">
              <h2 className="font-medium text-slate-200 truncate max-w-[200px] sm:max-w-md text-sm" title={activeDoc.name}>
                {activeDoc.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button 
              onClick={() => setGeneratorOpen(true)}
              className="hidden md:flex items-center gap-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-indigo-500/20"
            >
              <Sparkles size={14} /> Strict Data Extractor
            </button>

            <div className="h-5 w-px bg-slate-800 hidden md:block"></div>

            <div className="flex items-center bg-[#020617] rounded-lg border border-slate-800">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-l-lg disabled:opacity-30">
                <ChevronLeft size={16} />
              </button>
              <span className="text-[11px] font-bold px-3 text-slate-300 font-mono w-20 text-center flex justify-center gap-1 uppercase tracking-widest">
                <span>{currentPage}</span> <span className="text-slate-600">/</span> <span>{activeDoc.totalPages}</span>
              </span>
              <button onClick={() => setCurrentPage(p => Math.min(activeDoc.totalPages, p + 1))} disabled={currentPage >= activeDoc.totalPages} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-r-lg disabled:opacity-30">
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="hidden lg:flex items-center bg-[#020617] rounded-lg border border-slate-800">
              <button onClick={() => setScale(s => Math.max(0.5, s - 0.25))} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-l-lg">
                <ZoomOut size={16} />
              </button>
              <span className="text-[10px] font-bold px-2 text-slate-400 w-12 text-center">{Math.round(scale * 100)}%</span>
              <button onClick={() => setScale(s => Math.min(3, s + 0.25))} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-r-lg">
                <ZoomIn size={16} />
              </button>
            </div>
          </div>
        </div>

        <div className="flex-1 overflow-auto bg-[#050811] flex justify-center py-8 relative custom-scrollbar">
          {!activeDoc.data && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-50 backdrop-blur-sm">
              <div className="bg-[#0f172a] p-8 rounded-2xl flex flex-col items-center gap-4 max-w-sm text-center border border-slate-800 shadow-2xl">
                <ShieldAlert className="w-12 h-12 text-yellow-500" />
                <div>
                  <h3 className="text-lg font-bold text-white">Visual Data Cleared</h3>
                  <p className="text-sm text-slate-400 mt-2">PDF visual layer is cleared to save memory. Re-upload to view visually. AI text context remains fully intact.</p>
                </div>
                <button onClick={closeDoc} className="mt-4 w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg font-medium">Return to Library</button>
              </div>
            </div>
          )}
          
          <button 
            onClick={() => setGeneratorOpen(true)}
            className="md:hidden absolute bottom-6 right-6 z-50 p-4 bg-indigo-600 text-white rounded-full shadow-lg shadow-indigo-500/30"
          >
            <Sparkles size={24} />
          </button>

          {pdfUrl && activeDoc.data && (
            <div 
              className="relative shadow-[0_0_40px_rgba(0,0,0,0.5)] transition-transform duration-200 w-full max-w-4xl px-4 flex flex-col items-center" 
              style={{ transformOrigin: 'top center', transform: `scale(${scale})`, height: `${1000 * scale}px` }}
            >
              <iframe
                src={`${pdfUrl}#page=${currentPage}&view=FitH&toolbar=0&navpanes=0`}
                className="w-full h-full border border-slate-800 bg-white rounded-sm"
                title="PDF Document"
              />
            </div>
          )}
        </div>
      </div>

      {/* GENERATOR MODAL OVERLAY */}
      {generatorOpen && (
        <div className="absolute inset-0 z-50 bg-[#020617]/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0f172a] border border-slate-800 w-full max-w-2xl rounded-2xl shadow-2xl flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            
            {/* Modal Header */}
            <div className="px-6 py-4 border-b border-slate-800 flex justify-between items-center bg-[#1e293b]/30">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
                  <Crosshair size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-widest uppercase">Strict Data Extractor</h2>
                  <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-0.5">Zero Hallucination Guarantee</p>
                </div>
              </div>
              <button onClick={() => !genStatus.loading && setGeneratorOpen(false)} disabled={genStatus.loading} className="text-slate-500 hover:text-white transition-colors disabled:opacity-50">
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-8">
              
              {/* Type Selection */}
              <div>
                <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">Extraction Type</label>
                <div className="grid grid-cols-3 gap-3">
                  <GenTypeBtn icon={Layers} label="Flashcards" active={genConfig.type === 'flashcards'} onClick={() => setGenConfig({...genConfig, type: 'flashcards'})} disabled={genStatus.loading} />
                  <GenTypeBtn icon={CheckSquare} label="Strict Exam" active={genConfig.type === 'exam'} onClick={() => setGenConfig({...genConfig, type: 'exam'})} disabled={genStatus.loading} />
                  <GenTypeBtn icon={BookA} label="Full Summary" active={genConfig.type === 'summary'} onClick={() => setGenConfig({...genConfig, type: 'summary'})} disabled={genStatus.loading} />
                </div>
              </div>

              {/* Scope Selection */}
              <div className="bg-[#020617] p-5 rounded-xl border border-slate-800/80">
                <label className="text-[10px] font-bold text-indigo-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                  <SlidersHorizontal size={12} /> Target Scope (Page Range)
                </label>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <label className="text-[10px] text-slate-500 block mb-1.5 uppercase">Start Page</label>
                    <input 
                      type="number" 
                      min={1} max={activeDoc.totalPages}
                      value={genConfig.startPage}
                      onChange={(e) => setGenConfig({...genConfig, startPage: parseInt(e.target.value) || 1})}
                      disabled={genStatus.loading}
                      className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-center disabled:opacity-50"
                    />
                  </div>
                  <div className="text-slate-600 mt-5 font-bold">TO</div>
                  <div className="flex-1">
                    <label className="text-[10px] text-slate-500 block mb-1.5 uppercase">End Page</label>
                    <input 
                      type="number" 
                      min={1} max={activeDoc.totalPages}
                      value={genConfig.endPage}
                      onChange={(e) => setGenConfig({...genConfig, endPage: parseInt(e.target.value) || 1})}
                      disabled={genStatus.loading}
                      className="w-full bg-[#0f172a] border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 font-mono text-center disabled:opacity-50"
                    />
                  </div>
                </div>
                {genConfig.endPage - genConfig.startPage > 20 && (
                  <p className="text-[10px] text-yellow-500 mt-3 flex items-center gap-1"><AlertTriangle size={10} /> Extracting large page ranges may take up to 30 seconds.</p>
                )}
              </div>

              {/* Configuration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {genConfig.type !== 'summary' && (
                  <div>
                    <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">Quantity</label>
                    <div className="flex items-center gap-3">
                      <input 
                        type="range" 
                        min="1" max="20" 
                        value={genConfig.count}
                        onChange={(e) => setGenConfig({...genConfig, count: parseInt(e.target.value)})}
                        disabled={genStatus.loading}
                        className="flex-1 accent-indigo-500"
                      />
                      <span className="text-sm font-mono text-white bg-[#020617] px-3 py-1.5 rounded border border-slate-800">{genConfig.count}</span>
                    </div>
                  </div>
                )}
                <div className={genConfig.type === 'summary' ? 'md:col-span-2' : ''}>
                  <label className="text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 block">Specific Focus (Optional)</label>
                  <input 
                    type="text" 
                    placeholder="e.g., 'Drug interactions', 'Pathology'"
                    value={genConfig.focusTopic}
                    onChange={(e) => setGenConfig({...genConfig, focusTopic: e.target.value})}
                    disabled={genStatus.loading}
                    className="w-full bg-[#020617] border border-slate-800 rounded-lg px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-500 disabled:opacity-50"
                  />
                </div>
              </div>

              {/* Status Output */}
              {genStatus.message && (
                <div className={`p-4 rounded-xl text-sm font-medium flex items-center gap-3 ${
                  genStatus.error ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 
                  genStatus.loading ? 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20' :
                  'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                }`}>
                  {genStatus.loading ? <Loader2 size={16} className="animate-spin" /> : 
                   genStatus.error ? <XCircle size={16} /> : <CheckCircle2 size={16} />}
                  {genStatus.message}
                </div>
              )}

            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 border-t border-slate-800 bg-[#1e293b]/30 flex justify-end gap-3">
              <button 
                onClick={() => setGeneratorOpen(false)}
                disabled={genStatus.loading}
                className="px-5 py-2.5 rounded-lg text-sm font-bold text-slate-400 hover:text-white transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button 
                onClick={handleGenerate}
                disabled={genStatus.loading || genConfig.startPage > genConfig.endPage}
                className="px-6 py-2.5 rounded-lg text-sm font-bold bg-white text-slate-900 hover:bg-slate-200 transition-colors shadow-lg shadow-white/10 disabled:opacity-50 flex items-center gap-2"
              >
                {genStatus.loading ? "Extracting Data..." : "Generate Output"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function GenTypeBtn({ icon: Icon, label, active, onClick, disabled }) {
  return (
    <button 
      onClick={onClick} disabled={disabled}
      className={`flex flex-col items-center justify-center gap-2 p-4 rounded-xl border transition-all ${
        active 
          ? 'bg-indigo-500/20 border-indigo-500 text-indigo-300' 
          : 'bg-[#020617] border-slate-800 text-slate-500 hover:border-slate-600 disabled:opacity-50'
      }`}
    >
      <Icon size={20} className={active ? 'text-indigo-400' : ''} />
      <span className="text-xs font-bold uppercase tracking-wider">{label}</span>
    </button>
  );
}

// --- FLASHCARDS VIEW ---
function FlashcardsView({ flashcards, setFlashcards }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const activeCards = flashcards.filter(c => c.nextReview <= Date.now());

  const handleRate = (quality) => {
    const card = activeCards[currentIndex];
    const newLevel = quality === 0 ? 0 : card.level + 1;
    const delayHours = quality === 0 ? 1 : Math.pow(2, newLevel) * 24; 
    const nextReview = Date.now() + (delayHours * 60 * 60 * 1000);

    const updatedCards = flashcards.map(c => 
      c.id === card.id ? { ...c, level: newLevel, nextReview } : c
    );
    setFlashcards(updatedCards);
    setIsFlipped(false);
  };

  const deleteCard = (id) => {
    setFlashcards(flashcards.filter(c => c.id !== id));
    setIsFlipped(false);
  };

  if (flashcards.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#020617]">
        <Layers size={48} className="text-slate-800 mb-6" />
        <h2 className="text-xl font-bold text-slate-300 mb-2">No Flashcards Yet</h2>
        <p className="text-slate-500 text-sm max-w-sm">Use the Strict Data Extractor inside the Document Reader to securely generate flashcards from specific pages.</p>
      </div>
    );
  }

  if (activeCards.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-[#020617]">
        <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={32} className="text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">Review Complete</h2>
        <p className="text-slate-400 text-sm max-w-sm">No flashcards are due for spaced repetition review right now.</p>
        <div className="mt-8 text-xs font-mono text-slate-600 border border-slate-800/80 bg-[#0f172a] rounded-lg p-3 inline-block">
          TOTAL CARDS IN DB: {flashcards.length}
        </div>
      </div>
    );
  }

  const currentCard = activeCards[currentIndex];

  return (
    <div className="flex-1 overflow-auto p-4 md:p-8 bg-[#020617] flex flex-col custom-scrollbar">
      <div className="max-w-3xl mx-auto w-full mb-8 flex items-center justify-between mt-4">
        <div>
          <h1 className="text-2xl font-bold text-white">Spaced Repetition</h1>
          <p className="text-indigo-400 text-sm mt-1 font-medium">{activeCards.length} cards queued for today.</p>
        </div>
        <button onClick={() => deleteCard(currentCard.id)} className="p-2 text-slate-600 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors border border-transparent hover:border-red-400/20" title="Delete Card">
          <Trash2 size={18} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center max-w-3xl mx-auto w-full relative">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-4 px-3 py-1 bg-slate-800 text-slate-300 text-[10px] font-bold tracking-widest uppercase rounded border border-slate-700 z-10">
          Source: Pages {currentCard.sourcePages}
        </div>
        
        <div 
          onClick={() => !isFlipped && setIsFlipped(true)}
          className={`w-full max-w-2xl min-h-[400px] perspective-1000 cursor-pointer mb-8`}
        >
          <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-x-180' : ''}`}>
            
            {/* Front */}
            <div className="absolute inset-0 backface-hidden bg-[#0f172a] border border-slate-800 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-xl">
              <span className="absolute top-6 left-6 text-[10px] font-bold uppercase tracking-widest text-slate-500">Q.</span>
              <h2 className="text-2xl font-medium text-slate-200 leading-relaxed">{currentCard.q}</h2>
              <div className="absolute bottom-6 text-indigo-500/50 text-[11px] font-bold uppercase tracking-widest animate-pulse">
                Click to reveal answer
              </div>
            </div>

            {/* Back */}
            <div className="absolute inset-0 backface-hidden bg-gradient-to-b from-indigo-900 to-indigo-950 border border-indigo-500/30 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-2xl rotate-x-180 overflow-y-auto custom-scrollbar">
              <span className="absolute top-6 left-6 text-[10px] font-bold uppercase tracking-widest text-indigo-400">A.</span>
              <p className="text-xl font-medium text-indigo-50 leading-relaxed">{currentCard.a}</p>
            </div>
            
          </div>
        </div>

        {/* Rating Controls */}
        <div className={`w-full max-w-2xl flex justify-center gap-4 transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button onClick={() => handleRate(0)} className="flex-1 py-4 bg-[#0f172a] hover:bg-red-500/10 text-slate-400 hover:text-red-400 border border-slate-800 hover:border-red-500/30 rounded-2xl font-bold transition-all flex flex-col items-center group">
            <span className="uppercase tracking-wider text-sm">Again</span>
            <span className="text-[10px] font-mono mt-1 opacity-50 group-hover:opacity-100">&lt; 10m</span>
          </button>
          <button onClick={() => handleRate(1)} className="flex-1 py-4 bg-[#0f172a] hover:bg-orange-500/10 text-slate-400 hover:text-orange-400 border border-slate-800 hover:border-orange-500/30 rounded-2xl font-bold transition-all flex flex-col items-center group">
            <span className="uppercase tracking-wider text-sm">Hard</span>
            <span className="text-[10px] font-mono mt-1 opacity-50 group-hover:opacity-100">2d</span>
          </button>
          <button onClick={() => handleRate(2)} className="flex-1 py-4 bg-[#0f172a] hover:bg-emerald-500/10 text-slate-400 hover:text-emerald-400 border border-slate-800 hover:border-emerald-500/30 rounded-2xl font-bold transition-all flex flex-col items-center group">
            <span className="uppercase tracking-wider text-sm">Good</span>
            <span className="text-[10px] font-mono mt-1 opacity-50 group-hover:opacity-100">4d</span>
          </button>
        </div>
      </div>
      
      <style>{`
        .perspective-1000 { perspective: 1000px; }
        .transform-style-3d { transform-style: preserve-3d; }
        .backface-hidden { backface-visibility: hidden; }
        .rotate-x-180 { transform: rotateX(180deg); }
      `}</style>
    </div>
  );
}

// --- EXAMS & QUIZZES VIEW ---
function ExamsView({ exams, setExams, setView }) {
  const [activeExamId, setActiveExamId] = useState(null);

  const deleteExam = (id, e) => {
    e.stopPropagation();
    setExams(exams.filter(ex => ex.id !== id));
  };

  if (activeExamId) {
    const exam = exams.find(e => e.id === activeExamId);
    return <QuizTaker exam={exam} onBack={() => setActiveExamId(null)} />;
  }

  return (
    <div className="flex-1 overflow-auto p-8 custom-scrollbar bg-[#020617]">
      <div className="max-w-6xl mx-auto mt-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Assessments</h1>
            <p className="text-slate-400 mt-2 text-sm">Strictly generated multiple-choice exams.</p>
          </div>
        </div>

        {exams.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-slate-800 rounded-2xl bg-[#0f172a]/50">
            <CheckSquare size={48} className="mx-auto text-slate-800 mb-6" />
            <h2 className="text-lg font-bold text-slate-300 mb-2">No Exams Found</h2>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Open a document and use the Strict Data Extractor to generate tests for specific page ranges.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map(exam => (
              <div 
                key={exam.id} 
                onClick={() => setActiveExamId(exam.id)}
                className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 cursor-pointer hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/10 transition-all group flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="w-10 h-10 bg-slate-900 border border-slate-700 rounded-xl text-slate-400 group-hover:bg-indigo-500 group-hover:text-white group-hover:border-indigo-400 transition-all flex items-center justify-center">
                    <GraduationCap size={18} />
                  </div>
                  <button onClick={(e) => deleteExam(exam.id, e)} className="text-slate-700 hover:text-red-400 transition-colors p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
                <h3 className="text-sm font-bold text-slate-200 mb-2 leading-snug">{exam.title}</h3>
                <div className="mt-auto pt-4 flex justify-between items-center border-t border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-slate-500">Source PGs</span>
                    <span className="text-[10px] font-mono text-slate-300 bg-slate-800 px-1.5 py-0.5 rounded">{exam.sourcePages}</span>
                  </div>
                  <span className="text-xs font-bold text-indigo-400 flex items-center gap-1 group-hover:translate-x-1 transition-transform uppercase tracking-wider">Start <ChevronRight size={14} /></span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function QuizTaker({ exam, onBack }) {
  const [currentQIndex, setCurrentQIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({});
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSelect = (idx) => {
    if (isSubmitted) return;
    setSelectedAnswers(prev => ({ ...prev, [currentQIndex]: idx }));
  };

  const calculateScore = () => {
    let score = 0;
    exam.questions.forEach((q, i) => {
      if (selectedAnswers[i] === q.correct) score++;
    });
    return score;
  };

  const isCurrentAnswered = selectedAnswers[currentQIndex] !== undefined;
  const q = exam.questions[currentQIndex];

  return (
    <div className="flex-1 overflow-auto bg-[#020617] flex justify-center py-8 px-4 custom-scrollbar">
      <div className="max-w-3xl w-full flex flex-col">
        <button onClick={onBack} className="self-start mb-6 text-slate-500 hover:text-slate-300 text-sm font-bold uppercase tracking-widest flex items-center gap-2 transition-colors">
          <ChevronLeft size={16} /> Exit Exam
        </button>

        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-8 shadow-2xl relative overflow-hidden flex-1 flex flex-col">
          {!isSubmitted ? (
            <>
              <div className="flex justify-between items-center mb-8 pb-4 border-b border-slate-800/50">
                <span className="text-[10px] font-bold tracking-widest uppercase text-indigo-400">Question {currentQIndex + 1} of {exam.questions.length}</span>
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500">Source PGs: {exam.sourcePages}</span>
              </div>

              <h2 className="text-xl text-slate-200 font-medium mb-8 leading-relaxed">
                {q.q}
              </h2>

              <div className="space-y-3 mb-10 flex-1">
                {q.options.map((opt, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    className={`w-full text-left p-4 rounded-xl border transition-all flex items-center gap-4 ${
                      selectedAnswers[currentQIndex] === idx 
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-100' 
                        : 'border-slate-800 bg-[#020617] text-slate-400 hover:border-slate-600 hover:bg-slate-900'
                    }`}
                  >
                    <div className={`w-5 h-5 rounded-full border flex items-center justify-center shrink-0 ${selectedAnswers[currentQIndex] === idx ? 'border-indigo-500' : 'border-slate-600'}`}>
                      {selectedAnswers[currentQIndex] === idx && <div className="w-2.5 h-2.5 bg-indigo-500 rounded-full" />}
                    </div>
                    <span className="text-sm">{opt}</span>
                  </button>
                ))}
              </div>

              <div className="flex justify-between items-center pt-6 border-t border-slate-800/50">
                <button 
                  onClick={() => setCurrentQIndex(i => Math.max(0, i - 1))}
                  disabled={currentQIndex === 0}
                  className="px-5 py-2.5 rounded-lg text-sm font-bold uppercase tracking-wider text-slate-500 disabled:opacity-30 hover:text-slate-300 transition-colors"
                >
                  Prev
                </button>
                
                {currentQIndex === exam.questions.length - 1 ? (
                  <button 
                    onClick={() => setIsSubmitted(true)}
                    disabled={Object.keys(selectedAnswers).length < exam.questions.length}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-600 text-white rounded-lg text-sm font-bold shadow-lg shadow-indigo-500/20 transition-all uppercase tracking-wider"
                  >
                    Submit
                  </button>
                ) : (
                  <button 
                    onClick={() => setCurrentQIndex(i => Math.min(exam.questions.length - 1, i + 1))}
                    disabled={!isCurrentAnswered}
                    className="px-6 py-2.5 bg-white hover:bg-slate-200 disabled:bg-slate-800 disabled:text-slate-600 text-slate-900 disabled:shadow-none rounded-lg text-sm font-bold shadow-lg shadow-white/10 transition-all flex items-center gap-2 uppercase tracking-wider"
                  >
                    Next <ChevronRight size={16} />
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center py-6">
              <div className="text-center mb-10">
                <span className="text-[10px] font-bold tracking-widest uppercase text-slate-500 block mb-2">Final Score</span>
                <span className="text-6xl font-black text-white">{calculateScore()}</span>
                <span className="text-3xl text-slate-600 font-light mx-2">/</span>
                <span className="text-3xl font-bold text-slate-400">{exam.questions.length}</span>
              </div>

              <div className="w-full space-y-4">
                {exam.questions.map((q, idx) => {
                  const isCorrect = selectedAnswers[idx] === q.correct;
                  return (
                    <div key={idx} className="bg-[#020617] border border-slate-800 rounded-xl p-5">
                      <div className="flex items-start gap-4">
                        <div className={`mt-0.5 p-1 rounded ${isCorrect ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                          {isCorrect ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                        </div>
                        <div className="flex-1">
                          <h3 className="text-slate-300 text-sm font-medium mb-3">{q.q}</h3>
                          <div className="space-y-1.5 text-xs">
                            <p className="flex items-start gap-2">
                              <span className="font-bold uppercase tracking-widest text-slate-600 w-16 shrink-0 mt-0.5">You:</span> 
                              <span className={isCorrect ? 'text-emerald-400' : 'text-red-400'}>{q.options[selectedAnswers[idx]]}</span>
                            </p>
                            {!isCorrect && (
                              <p className="flex items-start gap-2">
                                <span className="font-bold uppercase tracking-widest text-slate-600 w-16 shrink-0 mt-0.5">Correct:</span> 
                                <span className="text-emerald-400">{q.options[q.correct]}</span>
                              </p>
                            )}
                          </div>
                          <div className="mt-4 p-3 bg-indigo-950/30 border border-indigo-500/10 rounded-lg">
                            <p className="text-[11px] text-indigo-300/80 leading-relaxed"><span className="font-bold uppercase tracking-widest text-indigo-400 mr-2">Explanation:</span> {q.explanation}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button onClick={onBack} className="mt-8 px-8 py-3 bg-[#1e293b] hover:bg-slate-700 text-white rounded-lg text-sm font-bold transition-all uppercase tracking-widest">
                Return
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

// --- SUMMARIES & NOTES VIEW ---
function NotesView({ notes, setNotes, setView }) {
  const deleteNote = (id) => {
    setNotes(notes.filter(n => n.id !== id));
  };

  return (
    <div className="flex-1 overflow-auto p-8 custom-scrollbar bg-[#020617]">
      <div className="max-w-6xl mx-auto mt-4">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight">Summaries & Notes</h1>
            <p className="text-slate-400 mt-2 text-sm">Review your generated document summaries.</p>
          </div>
        </div>

        {notes.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-slate-800 rounded-2xl bg-[#0f172a]/50">
            <BookA size={48} className="mx-auto text-slate-800 mb-6" />
            <h2 className="text-lg font-bold text-slate-300 mb-2">No Summaries Found</h2>
            <p className="text-slate-500 text-sm max-w-sm mx-auto">
              Open a document and use the Strict Data Extractor to generate comprehensive summaries for specific page ranges.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-6">
            {notes.map(note => (
              <div key={note.id} className="bg-[#0f172a] border border-slate-800 rounded-2xl p-6 shadow-lg">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-lg font-bold text-white">{note.title}</h3>
                  <button onClick={() => deleteNote(note.id)} className="text-slate-600 hover:text-red-400 transition-colors p-1">
                    <Trash2 size={16} />
                  </button>
                </div>
                <div className="prose prose-invert prose-sm max-w-none prose-p:text-slate-300 prose-headings:text-indigo-300 prose-strong:text-white">
                   <div dangerouslySetInnerHTML={{ __html: note.content.replace(/\n/g, '<br/>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/##(.*)/g, '<h3 class="text-indigo-400 font-bold mt-4 mb-2">$1</h3>') }} />
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}