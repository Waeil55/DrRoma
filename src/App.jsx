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
  X, Plus, Edit3
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
  // Global States
  const [currentView, setCurrentView] = useState('dashboard'); // dashboard, library, reader, flashcards, exams, settings
  const [documents, setDocuments] = useState([]);
  const [activeDoc, setActiveDoc] = useState(null);
  
  // App Data States
  const [flashcards, setFlashcards] = useState([]);
  const [exams, setExams] = useState([]);
  const [userSettings, setUserSettings] = useState({
    aiProvider: 'gemini', // 'gemini' or 'openai'
    apiKey: '',
    customPrompt: 'You are Dr. Mariam, an expert AI medical tutor and clinical diagnostic assistant.',
    studyGoal: 'USMLE Step 1'
  });

  // Upload States
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  // Load saved data on mount
  useEffect(() => {
    const savedDocs = localStorage.getItem('drMariam_docs');
    const savedCards = localStorage.getItem('drMariam_flashcards');
    const savedExams = localStorage.getItem('drMariam_exams');
    const savedSettings = localStorage.getItem('drMariam_settings');
    
    if (savedDocs) setDocuments(JSON.parse(savedDocs));
    if (savedCards) setFlashcards(JSON.parse(savedCards));
    if (savedExams) setExams(JSON.parse(savedExams));
    if (savedSettings) setUserSettings(JSON.parse(savedSettings));
  }, []);

  // Save data on change
  useEffect(() => {
    // Only save metadata, not raw array buffers to avoid exceeding localStorage quota
    const docsMeta = documents.map(d => ({...d, data: null}));
    localStorage.setItem('drMariam_docs', JSON.stringify(docsMeta));
    localStorage.setItem('drMariam_flashcards', JSON.stringify(flashcards));
    localStorage.setItem('drMariam_exams', JSON.stringify(exams));
    localStorage.setItem('drMariam_settings', JSON.stringify(userSettings));
  }, [documents, flashcards, exams, userSettings]);

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
      console.error("Error processing PDF:", error);
      alert("Failed to process PDF.");
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

  // Main Layout Wrapper
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100 font-sans overflow-hidden selection:bg-indigo-500/30">
      {/* Sidebar Navigation */}
      <nav className="w-20 md:w-64 bg-slate-900 border-r border-slate-800 flex flex-col transition-all duration-300 z-20">
        <div className="h-16 flex items-center justify-center md:justify-start md:px-6 border-b border-slate-800 shrink-0">
          <BrainCircuit className="text-indigo-500 w-8 h-8 shrink-0" />
          <span className="hidden md:block ml-3 font-bold text-lg tracking-tight bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
            Dr. Mariam Pro
          </span>
        </div>
        
        <div className="flex-1 overflow-y-auto py-6 flex flex-col gap-2 px-3">
          <NavButton icon={LayoutDashboard} label="Dashboard" isActive={currentView === 'dashboard'} onClick={() => setCurrentView('dashboard')} />
          <NavButton icon={Library} label="Library" isActive={currentView === 'library'} onClick={() => setCurrentView('library')} />
          
          <div className="my-2 border-t border-slate-800/50 mx-2"></div>
          <div className="hidden md:block px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Study Tools</div>
          
          <NavButton icon={Layers} label="Flashcards" isActive={currentView === 'flashcards'} onClick={() => setCurrentView('flashcards')} badge={flashcards.length} />
          <NavButton icon={GraduationCap} label="Exams & Quizzes" isActive={currentView === 'exams'} onClick={() => setCurrentView('exams')} badge={exams.length} />
          {activeDoc && (
            <NavButton icon={BookOpen} label="Active Reader" isActive={currentView === 'reader'} onClick={() => setCurrentView('reader')} highlight />
          )}
        </div>

        <div className="p-4 border-t border-slate-800 shrink-0">
          <NavButton icon={Settings} label="Settings & API" isActive={currentView === 'settings'} onClick={() => setCurrentView('settings')} />
        </div>
      </nav>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col overflow-hidden relative">
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
          />
        )}
        {currentView === 'flashcards' && <FlashcardsView flashcards={flashcards} setFlashcards={setFlashcards} />}
        {currentView === 'exams' && <ExamsView exams={exams} setExams={setExams} setView={setCurrentView} />}
        {currentView === 'settings' && <SettingsView settings={userSettings} setSettings={setUserSettings} />}
      </main>
    </div>
  );
}

function NavButton({ icon: Icon, label, isActive, onClick, badge, highlight }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-3 rounded-xl transition-all group relative ${
        isActive 
          ? 'bg-indigo-600/10 text-indigo-400' 
          : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
      } ${highlight ? 'border border-indigo-500/30 bg-indigo-900/20' : ''}`}
    >
      <Icon size={20} className={isActive ? 'text-indigo-500' : 'group-hover:text-slate-300'} />
      <span className="hidden md:block font-medium text-sm">{label}</span>
      {badge > 0 && (
        <span className="hidden md:flex absolute right-2 bg-indigo-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full items-center justify-center">
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
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">Welcome back, Doctor.</h1>
          <p className="text-slate-400 mt-2">Here is your study overview and recent activity.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <StatCard icon={Library} label="Documents" value={documents.length} color="blue" onClick={() => setView('library')} />
          <StatCard icon={Layers} label="Flashcards" value={flashcards.length} color="indigo" onClick={() => setView('flashcards')} />
          <StatCard icon={GraduationCap} label="Exams Created" value={exams.length} color="purple" onClick={() => setView('exams')} />
          <StatCard icon={Activity} label="Study Sessions" value={documents.reduce((acc, doc) => acc + (doc.progress > 1 ? 1 : 0), 0)} color="emerald" onClick={() => {}} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2"><Clock size={18} className="text-indigo-400"/> Recent Documents</h2>
              <button onClick={() => setView('library')} className="text-sm text-indigo-400 hover:text-indigo-300">View All</button>
            </div>
            {documents.length === 0 ? (
              <p className="text-slate-500 text-sm text-center py-8">No documents uploaded yet.</p>
            ) : (
              <div className="space-y-3">
                {documents.slice(-4).reverse().map(doc => (
                  <div key={doc.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-800/50 border border-slate-700/50 hover:bg-slate-800 transition-colors">
                    <div className="flex items-center gap-3 overflow-hidden">
                      <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg shrink-0"><FileText size={16} /></div>
                      <span className="text-sm font-medium truncate text-slate-200">{doc.name}</span>
                    </div>
                    <span className="text-xs text-slate-500 shrink-0">Pg {doc.progress}/{doc.totalPages}</span>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold flex items-center gap-2"><Target size={18} className="text-emerald-400"/> AI Study Recommendations</h2>
            </div>
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex gap-4">
                <BrainCircuit className="text-indigo-400 shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="text-sm font-semibold text-indigo-100 mb-1">Review Cardiovascular Pathophysiology</h3>
                  <p className="text-xs text-indigo-300/80 leading-relaxed">Based on your recent reading, generating a 10-question quiz on this topic would solidify your understanding.</p>
                  <button onClick={() => setView('library')} className="mt-3 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-colors">Go to Library</button>
                </div>
              </div>
              <div className="p-4 rounded-xl bg-slate-800/50 border border-slate-700 flex gap-4">
                <Layers className="text-emerald-400 shrink-0 mt-1" size={24} />
                <div>
                  <h3 className="text-sm font-semibold text-slate-200 mb-1">Spaced Repetition Due</h3>
                  <p className="text-xs text-slate-400 leading-relaxed">You have {Math.min(flashcards.length, 15)} flashcards ready for review today.</p>
                  <button onClick={() => setView('flashcards')} className="mt-3 text-xs bg-slate-700 hover:bg-slate-600 text-white px-3 py-1.5 rounded-lg transition-colors">Start Review</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon: Icon, label, value, color, onClick }) {
  const colorMap = {
    blue: 'bg-blue-500/10 text-blue-500 border-blue-500/20',
    indigo: 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
    purple: 'bg-purple-500/10 text-purple-500 border-purple-500/20',
    emerald: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
  };
  return (
    <div onClick={onClick} className={`p-6 rounded-2xl border bg-slate-900 hover:bg-slate-800 cursor-pointer transition-all ${colorMap[color]} group`}>
      <div className="flex justify-between items-start">
        <Icon size={24} className="opacity-80 group-hover:scale-110 transition-transform" />
        <span className="text-3xl font-bold text-white">{value}</span>
      </div>
      <p className="text-sm mt-4 font-medium opacity-80">{label}</p>
    </div>
  );
}

// --- SETTINGS VIEW ---
function SettingsView({ settings, setSettings }) {
  const handleChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({ ...prev, [name]: value }));
  };

  return (
    <div className="flex-1 overflow-auto p-8 custom-scrollbar flex justify-center">
      <div className="max-w-3xl w-full space-y-8">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
            <Settings className="text-slate-400" /> Configurations
          </h1>
          <p className="text-slate-400 mt-2">Manage your AI integrations and application preferences.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-xl">
          <div className="p-6 border-b border-slate-800 bg-slate-900/50">
            <h2 className="text-lg font-semibold flex items-center gap-2 text-indigo-400">
              <BrainCircuit size={20} /> AI Model Integration
            </h2>
          </div>
          
          <div className="p-6 space-y-6">
            <div className="space-y-3">
              <label className="text-sm font-medium text-slate-300">Select Provider</label>
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => setSettings(prev => ({...prev, aiProvider: 'gemini'}))}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${settings.aiProvider === 'gemini' ? 'border-indigo-500 bg-indigo-500/10 text-indigo-300' : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'}`}
                >
                  <Sparkles size={24} />
                  <span className="font-semibold">Google Gemini</span>
                  <span className="text-[10px] text-center opacity-70">Native Support (Recommended)</span>
                </button>
                <button 
                  onClick={() => setSettings(prev => ({...prev, aiProvider: 'openai'}))}
                  className={`p-4 rounded-xl border-2 flex flex-col items-center gap-2 transition-all ${settings.aiProvider === 'openai' ? 'border-emerald-500 bg-emerald-500/10 text-emerald-300' : 'border-slate-700 bg-slate-800 text-slate-400 hover:border-slate-600'}`}
                >
                  <MessageSquare size={24} />
                  <span className="font-semibold">OpenAI ChatGPT</span>
                  <span className="text-[10px] text-center opacity-70">Requires your own API Key</span>
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300 flex items-center gap-2">
                <Key size={16} /> API Key <span className="text-xs text-slate-500 font-normal">(Optional for default Gemini)</span>
              </label>
              <input 
                type="password" 
                name="apiKey"
                value={settings.apiKey}
                onChange={handleChange}
                placeholder={settings.aiProvider === 'openai' ? "sk-..." : "Enter Gemini API Key (or leave blank for platform default)"}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
              <p className="text-[11px] text-slate-500">Keys are stored locally in your browser and never sent to our servers.</p>
            </div>

            <div className="space-y-2 pt-4 border-t border-slate-800">
              <label className="text-sm font-medium text-slate-300">AI System Prompt / Persona</label>
              <textarea 
                name="customPrompt"
                value={settings.customPrompt}
                onChange={handleChange}
                rows={4}
                className="w-full bg-slate-950 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 resize-none custom-scrollbar"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// --- LIBRARY VIEW ---
function LibraryView({ documents, onUpload, onOpen, isUploading }) {
  return (
    <div className="max-w-6xl mx-auto w-full p-8 flex-1 overflow-auto custom-scrollbar">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h1 className="text-3xl font-bold text-white">Document Library</h1>
          <p className="text-slate-400 mt-2">Manage your textbooks, papers, and notes.</p>
        </div>
        
        <label className={`cursor-pointer bg-indigo-600 hover:bg-indigo-500 text-white px-5 py-3 rounded-xl font-medium flex items-center gap-2 transition-all shadow-lg shadow-indigo-500/20 ${isUploading ? 'opacity-70 pointer-events-none' : ''}`}>
          {isUploading ? <Loader2 className="animate-spin" size={18} /> : <Upload size={18} />}
          {isUploading ? "Processing..." : "Upload Material"}
          <input type="file" accept="application/pdf" className="hidden" onChange={onUpload} disabled={isUploading} />
        </label>
      </div>

      {/* Search Bar */}
      <div className="relative mb-8">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500" size={20} />
        <input 
          type="text" 
          placeholder="Search your library..." 
          className="w-full bg-slate-900 border border-slate-800 rounded-2xl pl-12 pr-4 py-4 text-white focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all shadow-sm"
        />
      </div>

      {documents.length === 0 ? (
        <div className="text-center py-32 border-2 border-dashed border-slate-800 rounded-3xl bg-slate-900/50">
          <FileUp size={64} className="mx-auto text-slate-700 mb-6" />
          <h2 className="text-xl font-semibold text-white mb-2">Library is Empty</h2>
          <p className="text-slate-500 max-w-sm mx-auto">
            Upload PDFs to start your AI-powered study sessions. We extract text automatically.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {documents.map(doc => (
            <div 
              key={doc.id} 
              onClick={() => onOpen(doc)} 
              className="group cursor-pointer bg-slate-900 rounded-2xl p-5 border border-slate-800 hover:border-indigo-500/50 hover:bg-slate-800/80 transition-all hover:-translate-y-1 shadow-md relative overflow-hidden flex flex-col h-56"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-3 bg-blue-500/10 rounded-xl text-blue-400 group-hover:bg-blue-500 group-hover:text-white transition-colors">
                  <BookOpen size={24} />
                </div>
                <div className="px-2.5 py-1 bg-slate-800 text-[10px] rounded-full font-semibold text-slate-300 border border-slate-700">
                  {doc.totalPages} PGs
                </div>
              </div>
              <h3 className="font-semibold text-white text-base leading-snug line-clamp-3 flex-1" title={doc.name}>{doc.name}</h3>
              
              <div className="mt-4 pt-4 border-t border-slate-800/50">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-[10px] text-slate-500 font-medium uppercase tracking-wider">Progress</span>
                  <span className="text-[10px] text-indigo-400 font-bold">{Math.round((doc.progress / doc.totalPages) * 100)}%</span>
                </div>
                <div className="w-full bg-slate-800 rounded-full h-1.5">
                  <div 
                    className="bg-indigo-500 h-1.5 rounded-full transition-all duration-500" 
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

// --- STUDY ENVIRONMENT (MASSIVE PDF + AI SUITE) ---
function StudyEnvironment({ activeDoc, updateDocProgress, closeDoc, userSettings, setFlashcards, setExams }) {
  const [currentPage, setCurrentPage] = useState(activeDoc.progress || 1);
  const [scale, setScale] = useState(1.0);
  const [pdfUrl, setPdfUrl] = useState(null);
  
  // Right Pane Tabs: 'chat', 'tools', 'notes'
  const [rightTab, setRightTab] = useState('chat');

  // Chat State
  const [messages, setMessages] = useState([
    { role: 'assistant', content: "I'm analyzing this document. I'm ready to answer questions, explain concepts, or generate study materials." }
  ]);
  const [chatInput, setChatInput] = useState("");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [aiActionText, setAiActionText] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isAiLoading]);

  // Load PDF Blob
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

  const currentPageText = activeDoc.pagesText[currentPage] || "Extracting text or no text available on this page.";

  // --- UNIVERSAL AI CALLER ---
  const callLLM = async (promptText, expectJson = false) => {
    const isGemini = userSettings.aiProvider === 'gemini';
    const apiKey = userSettings.apiKey || ""; // Fallback to environment default if empty
    const systemInstruction = userSettings.customPrompt + (expectJson ? " YOU MUST RESPOND ONLY IN VALID JSON FORMAT. NO MARKDOWN BACKTICKS, NO EXTRA TEXT." : "");
    
    if (isGemini) {
      let retries = 3;
      while (retries > 0) {
        try {
          const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{ parts: [{ text: promptText }] }],
              systemInstruction: { parts: [{ text: systemInstruction }] }
            })
          });
          if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
          const data = await response.json();
          let text = data.candidates?.[0]?.content?.parts?.[0]?.text || "";
          
          if (expectJson) {
            text = text.replace(/```json/g, '').replace(/```/g, '').trim();
          }
          return text;
        } catch (error) {
          retries--;
          if (retries === 0) return expectJson ? "{}" : "Error connecting to AI service.";
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    } else {
      // Stub for OpenAI if user selected it (requires their key)
      if (!apiKey) return "OpenAI selected but no API key provided in Settings.";
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${apiKey}` },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              { role: "system", content: systemInstruction },
              { role: "user", content: promptText }
            ],
            response_format: expectJson ? { type: "json_object" } : { type: "text" }
          })
        });
        const data = await response.json();
        return data.choices[0].message.content;
      } catch(e) {
        return expectJson ? "{}" : "Error connecting to OpenAI.";
      }
    }
  };

  const handleChatSubmit = async () => {
    if (!chatInput.trim() || isAiLoading) return;
    const userMessage = chatInput;
    setChatInput("");
    setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
    setIsAiLoading(true);
    setAiActionText("Thinking...");

    const prompt = `Context from current page (${currentPage}):\n"${currentPageText}"\n\nStudent asks: ${userMessage}`;
    const response = await callLLM(prompt);
    
    setMessages(prev => [...prev, { role: 'assistant', content: response }]);
    setIsAiLoading(false);
  };

  const executeTool = async (toolId) => {
    if (isAiLoading) return;
    setIsAiLoading(true);
    setRightTab('chat');
    
    try {
      if (toolId === 'summarize') {
        setAiActionText("Summarizing...");
        setMessages(prev => [...prev, { role: 'user', content: "Summarize this page." }]);
        const res = await callLLM(`Summarize the key medical concepts concisely from this text:\n\n${currentPageText}`);
        setMessages(prev => [...prev, { role: 'assistant', content: res }]);
      } 
      else if (toolId === 'simplify') {
        setAiActionText("Simplifying...");
        setMessages(prev => [...prev, { role: 'user', content: "Explain this simply." }]);
        const res = await callLLM(`Explain this text simply, as if to a first-year medical student:\n\n${currentPageText}`);
        setMessages(prev => [...prev, { role: 'assistant', content: res }]);
      }
      else if (toolId === 'generate_flashcards') {
        setAiActionText("Generating Flashcards...");
        setMessages(prev => [...prev, { role: 'user', content: "Generate flashcards from this page." }]);
        const prompt = `Create exactly 5 concise study flashcards based on this text. Return strictly valid JSON format like this: { "cards": [ {"q": "Question here", "a": "Answer here"} ] }\n\nText:\n${currentPageText}`;
        const res = await callLLM(prompt, true);
        try {
          const parsed = JSON.parse(res);
          if (parsed.cards && Array.isArray(parsed.cards)) {
            const newCards = parsed.cards.map(c => ({
              id: Date.now().toString() + Math.random().toString(),
              docId: activeDoc.id,
              page: currentPage,
              q: c.q,
              a: c.a,
              level: 0,
              nextReview: Date.now()
            }));
            setFlashcards(prev => [...prev, ...newCards]);
            setMessages(prev => [...prev, { role: 'assistant', content: `Successfully generated and saved ${newCards.length} flashcards to your Library! You can review them in the Flashcards tab.` }]);
          } else throw new Error("Invalid JSON structure");
        } catch(e) {
          setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I failed to format the flashcards properly. Please try again." }]);
        }
      }
      else if (toolId === 'generate_exam') {
        setAiActionText("Creating Exam...");
        setMessages(prev => [...prev, { role: 'user', content: "Create a multiple choice quiz from this page." }]);
        const prompt = `Create a 3-question multiple-choice clinical or factual exam based on this text. Return strictly valid JSON format like this: { "title": "Topic Name Quiz", "questions": [ { "q": "Question text", "options": ["A", "B", "C", "D"], "correct": 0, "explanation": "Why A is correct" } ] } where 'correct' is the index (0-3) of the right option.\n\nText:\n${currentPageText}`;
        const res = await callLLM(prompt, true);
        try {
          const parsed = JSON.parse(res);
          if (parsed.questions && Array.isArray(parsed.questions)) {
            const newExam = {
              id: Date.now().toString(),
              docId: activeDoc.id,
              page: currentPage,
              title: parsed.title || `Quiz on Page ${currentPage}`,
              questions: parsed.questions,
              createdAt: new Date().toISOString()
            };
            setExams(prev => [...prev, newExam]);
            setMessages(prev => [...prev, { role: 'assistant', content: `Successfully created exam: "${newExam.title}" with ${newExam.questions.length} questions. You can take it in the Exams tab!` }]);
          } else throw new Error("Invalid JSON structure");
        } catch(e) {
          setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I failed to format the exam properly. Please try again." }]);
        }
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'assistant', content: "An error occurred during tool execution." }]);
    } finally {
      setIsAiLoading(false);
    }
  };

  return (
    <div className="flex w-full h-full overflow-hidden bg-slate-950">
      
      {/* LEFT PANE: PDF Viewer */}
      <div className="flex-1 flex flex-col border-r border-slate-800 bg-[#0B1120] relative z-10">
        {/* Viewer Toolbar */}
        <div className="h-14 flex items-center justify-between px-4 bg-slate-900 border-b border-slate-800 shrink-0 shadow-sm z-20">
          <div className="flex items-center gap-3">
            <button onClick={closeDoc} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all flex items-center">
              <ChevronLeft size={20} />
            </button>
            <div className="h-5 w-px bg-slate-700"></div>
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-blue-400 hidden sm:block" />
              <h2 className="font-medium text-slate-200 truncate max-w-[150px] sm:max-w-xs md:max-w-md text-sm" title={activeDoc.name}>
                {activeDoc.name}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center bg-slate-950 rounded-lg border border-slate-800 shadow-inner">
              <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} disabled={currentPage <= 1} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-l-lg disabled:opacity-30">
                <ChevronLeft size={16} />
              </button>
              <span className="text-xs font-semibold px-3 text-slate-300 font-mono w-20 text-center flex justify-center gap-1">
                <span>{currentPage}</span> <span className="text-slate-600">/</span> <span>{activeDoc.totalPages}</span>
              </span>
              <button onClick={() => setCurrentPage(p => Math.min(activeDoc.totalPages, p + 1))} disabled={currentPage >= activeDoc.totalPages} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-r-lg disabled:opacity-30">
                <ChevronRight size={16} />
              </button>
            </div>

            <div className="hidden lg:flex items-center bg-slate-950 rounded-lg border border-slate-800 shadow-inner">
              <button onClick={() => setScale(s => Math.max(0.5, s - 0.25))} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-l-lg">
                <ZoomOut size={16} />
              </button>
              <span className="text-[11px] font-bold px-2 text-slate-400 w-12 text-center">{Math.round(scale * 100)}%</span>
              <button onClick={() => setScale(s => Math.min(3, s + 0.25))} className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-r-lg">
                <ZoomIn size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* PDF Visual Layer */}
        <div className="flex-1 overflow-auto bg-[#0A0F1C] flex justify-center py-8 relative custom-scrollbar">
          {!activeDoc.data && (
            <div className="absolute inset-0 flex items-center justify-center bg-slate-900/80 z-50 backdrop-blur-sm">
              <div className="bg-slate-800 p-6 rounded-2xl flex flex-col items-center gap-4 max-w-sm text-center border border-slate-700 shadow-2xl">
                <ShieldAlert className="w-12 h-12 text-yellow-500" />
                <div>
                  <h3 className="text-lg font-bold text-white">Data Unloaded</h3>
                  <p className="text-sm text-slate-400 mt-2">The raw PDF data was cleared from memory to save space. Please re-upload the document from the library to view it visually. AI text context is still preserved.</p>
                </div>
                <button onClick={closeDoc} className="mt-2 w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-medium">Return to Library</button>
              </div>
            </div>
          )}
          {pdfUrl && activeDoc.data && (
            <div 
              className="relative shadow-2xl transition-transform duration-200 w-full max-w-4xl px-4 flex flex-col items-center" 
              style={{ transformOrigin: 'top center', transform: `scale(${scale})`, height: `${1000 * scale}px` }}
            >
              <iframe
                src={`${pdfUrl}#page=${currentPage}&view=FitH&toolbar=0&navpanes=0`}
                className="w-full h-full border border-slate-800 bg-white rounded-xl shadow-2xl"
                title="PDF Document"
              />
            </div>
          )}
        </div>
      </div>

      {/* RIGHT PANE: AI Suite */}
      <div className="w-full md:w-[45%] lg:w-[420px] xl:w-[480px] h-full flex flex-col bg-slate-900 border-l border-slate-800 shrink-0 z-20 shadow-[-10px_0_30px_rgba(0,0,0,0.5)]">
        
        {/* Top Tabs */}
        <div className="h-14 flex items-center px-2 border-b border-slate-800 bg-slate-950 shrink-0 gap-1">
          <TabBtn icon={MessageSquare} label="AI Chat" active={rightTab==='chat'} onClick={()=>setRightTab('chat')} />
          <TabBtn icon={Layers} label="Study Tools" active={rightTab==='tools'} onClick={()=>setRightTab('tools')} />
          <TabBtn icon={Edit3} label="Notes" active={rightTab==='notes'} onClick={()=>setRightTab('notes')} />
        </div>

        {/* Tab Contents */}
        <div className="flex-1 overflow-hidden relative">
          
          {/* CHAT TAB */}
          {rightTab === 'chat' && (
            <div className="absolute inset-0 flex flex-col bg-slate-900">
              <div className="bg-slate-950/50 border-b border-slate-800 p-3 shrink-0 flex items-center gap-3">
                <BookMarked size={16} className="text-indigo-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-xs text-slate-400 font-medium truncate">Reading Context: Page {currentPage}</p>
                </div>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 space-y-5 custom-scrollbar">
                {messages.map((msg, idx) => (
                  <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm ${msg.role === 'user' ? 'bg-indigo-600' : 'bg-slate-800 border border-slate-700'}`}>
                      {msg.role === 'user' ? <List size={14} className="text-white" /> : <BrainCircuit size={14} className="text-indigo-400" />}
                    </div>
                    <div className={`p-3.5 max-w-[85%] text-[13px] leading-relaxed shadow-sm ${
                      msg.role === 'user' 
                        ? 'bg-indigo-600 text-white rounded-2xl rounded-tr-sm' 
                        : 'bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm text-slate-200'
                    }`}>
                      <div className="whitespace-pre-wrap">{msg.content}</div>
                    </div>
                  </div>
                ))}
                
                {isAiLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center shrink-0">
                      <Loader2 size={14} className="text-indigo-400 animate-spin" />
                    </div>
                    <div className="bg-slate-800 border border-slate-700 rounded-2xl rounded-tl-sm p-3.5 flex items-center gap-3 max-w-[85%]">
                      <span className="text-xs text-slate-400 font-medium">{aiActionText}</span>
                      <div className="flex gap-1">
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce"></span>
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.15s' }}></span>
                        <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0.3s' }}></span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={chatEndRef} />
              </div>

              <div className="p-3 bg-slate-950 border-t border-slate-800 shrink-0">
                <div className="relative flex items-end bg-slate-900 border border-slate-700 rounded-xl overflow-hidden focus-within:border-indigo-500 focus-within:ring-1 focus-within:ring-indigo-500 transition-all shadow-inner">
                  <textarea 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleChatSubmit();
                      }
                    }}
                    placeholder="Ask about page content..." 
                    disabled={isAiLoading}
                    rows={1}
                    className="w-full bg-transparent pl-4 pr-12 py-3.5 text-sm text-white focus:outline-none resize-none max-h-32 custom-scrollbar disabled:opacity-50"
                    style={{ minHeight: '48px' }}
                  />
                  <button 
                    onClick={handleChatSubmit}
                    disabled={isAiLoading || !chatInput.trim()}
                    className="absolute right-2 bottom-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-transparent disabled:text-slate-600 rounded-lg text-white transition-colors"
                  >
                    <Send size={16} className="ml-0.5" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TOOLS TAB */}
          {rightTab === 'tools' && (
            <div className="absolute inset-0 overflow-y-auto p-5 custom-scrollbar bg-slate-900">
              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Content Generation</h3>
              <div className="grid grid-cols-2 gap-3 mb-8">
                <ToolCard icon={FileText} label="Summarize Page" desc="Get a concise overview" onClick={() => executeTool('summarize')} disabled={isAiLoading} />
                <ToolCard icon={Lightbulb} label="Explain Simply" desc="EL5 style breakdown" onClick={() => executeTool('simplify')} disabled={isAiLoading} color="yellow" />
                <ToolCard icon={Layers} label="Gen Flashcards" desc="Create 5 cards instantly" onClick={() => executeTool('generate_flashcards')} disabled={isAiLoading} color="emerald" />
                <ToolCard icon={CheckSquare} label="Gen Mini-Exam" desc="Create 3 Q multiple choice" onClick={() => executeTool('generate_exam')} disabled={isAiLoading} color="purple" />
              </div>

              <h3 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-4">Deep Dive Assistants</h3>
              <div className="space-y-3">
                <ActionRow icon={Stethoscope} label="Clinical Scenario" desc="Simulate a patient case based on this text" onClick={() => {}} disabled={true} comingSoon />
                <ActionRow icon={PieChart} label="Data Extraction" desc="Pull statistics and doses into a table" onClick={() => {}} disabled={true} comingSoon />
              </div>
            </div>
          )}

          {/* NOTES TAB */}
          {rightTab === 'notes' && (
            <div className="absolute inset-0 flex flex-col bg-slate-900 p-4">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-sm font-semibold text-slate-300">Personal Notes (Pg {currentPage})</h3>
                <button className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors">
                  <Save size={12} /> Save Note
                </button>
              </div>
              <textarea 
                placeholder="Jot down important points, mnemonics, or thoughts..."
                className="flex-1 w-full bg-slate-950 border border-slate-800 rounded-xl p-4 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 resize-none custom-scrollbar shadow-inner"
              ></textarea>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}

function TabBtn({ icon: Icon, label, active, onClick }) {
  return (
    <button 
      onClick={onClick}
      className={`flex-1 flex items-center justify-center gap-2 py-2.5 rounded-t-lg text-sm font-medium transition-colors border-b-2 ${
        active 
          ? 'bg-slate-900 text-indigo-400 border-indigo-500' 
          : 'text-slate-500 hover:text-slate-300 hover:bg-slate-900/50 border-transparent'
      }`}
    >
      <Icon size={16} /> <span className="hidden sm:inline">{label}</span>
    </button>
  );
}

function ToolCard({ icon: Icon, label, desc, onClick, disabled, color = 'indigo' }) {
  const colorMap = {
    indigo: 'text-indigo-400 bg-indigo-500/10 border-indigo-500/20 hover:border-indigo-500/50',
    yellow: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20 hover:border-yellow-500/50',
    emerald: 'text-emerald-400 bg-emerald-500/10 border-emerald-500/20 hover:border-emerald-500/50',
    purple: 'text-purple-400 bg-purple-500/10 border-purple-500/20 hover:border-purple-500/50',
  };
  return (
    <button 
      onClick={onClick} disabled={disabled}
      className={`p-4 rounded-xl border flex flex-col items-start gap-2 transition-all text-left disabled:opacity-50 disabled:pointer-events-none ${colorMap[color]}`}
    >
      <Icon size={20} className="mb-1" />
      <span className="font-semibold text-slate-200 text-sm">{label}</span>
      <span className="text-[10px] text-slate-400 leading-tight">{desc}</span>
    </button>
  );
}

function ActionRow({ icon: Icon, label, desc, onClick, disabled, comingSoon }) {
  return (
    <button 
      onClick={onClick} disabled={disabled}
      className="w-full p-4 rounded-xl bg-slate-950 border border-slate-800 hover:border-slate-600 flex items-center gap-4 transition-all text-left disabled:opacity-60 disabled:pointer-events-none"
    >
      <div className="p-2 bg-slate-800 rounded-lg text-slate-400 shrink-0"><Icon size={18} /></div>
      <div className="flex-1">
        <h4 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
          {label} {comingSoon && <span className="text-[9px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-400 uppercase tracking-widest">Soon</span>}
        </h4>
        <p className="text-xs text-slate-500 mt-0.5">{desc}</p>
      </div>
    </button>
  );
}


// --- FLASHCARDS VIEW ---
function FlashcardsView({ flashcards, setFlashcards }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);

  const activeCards = flashcards.filter(c => c.nextReview <= Date.now());

  const handleRate = (quality) => {
    // Quality: 0 (Again), 1 (Hard), 2 (Good), 3 (Easy)
    const card = activeCards[currentIndex];
    const newLevel = quality === 0 ? 0 : card.level + 1;
    // Simple spaced rep math: Level * days * ms
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
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950">
        <Layers size={64} className="text-slate-700 mb-6" />
        <h2 className="text-2xl font-bold text-white mb-2">No Flashcards Yet</h2>
        <p className="text-slate-500 max-w-md">Use the AI tools inside the Document Reader to automatically generate flashcards from your study materials.</p>
      </div>
    );
  }

  if (activeCards.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-950">
        <div className="w-24 h-24 bg-emerald-500/20 rounded-full flex items-center justify-center mb-6">
          <CheckCircle2 size={40} className="text-emerald-500" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-2">You're all caught up!</h2>
        <p className="text-slate-500 max-w-md">No flashcards are due for review right now. Take a break or study new material.</p>
        <div className="mt-8 text-sm text-slate-600 border border-slate-800 rounded-xl p-4 inline-block">
          Total Cards: {flashcards.length}
        </div>
      </div>
    );
  }

  const currentCard = activeCards[currentIndex];

  return (
    <div className="flex-1 overflow-auto p-4 md:p-8 bg-slate-950 flex flex-col">
      <div className="max-w-3xl mx-auto w-full mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Spaced Repetition Review</h1>
          <p className="text-slate-400 text-sm mt-1">{activeCards.length} cards due today.</p>
        </div>
        <button onClick={() => deleteCard(currentCard.id)} className="p-2 text-slate-500 hover:text-red-400 hover:bg-red-400/10 rounded-lg transition-colors" title="Delete Card">
          <Trash2 size={20} />
        </button>
      </div>

      <div className="flex-1 flex flex-col items-center max-w-3xl mx-auto w-full">
        {/* Flashcard Area */}
        <div 
          onClick={() => !isFlipped && setIsFlipped(true)}
          className={`w-full max-w-2xl min-h-[400px] perspective-1000 cursor-pointer mb-8`}
        >
          <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-x-180' : ''}`}>
            
            {/* Front */}
            <div className="absolute inset-0 backface-hidden bg-slate-900 border-2 border-slate-800 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-2xl">
              <span className="absolute top-6 left-6 text-xs font-bold uppercase tracking-widest text-indigo-500">Question</span>
              <h2 className="text-2xl md:text-3xl font-semibold text-slate-200 leading-relaxed">{currentCard.q}</h2>
              <div className="absolute bottom-6 text-slate-500 text-sm flex items-center gap-2 animate-pulse">
                Click to reveal answer
              </div>
            </div>

            {/* Back */}
            <div className="absolute inset-0 backface-hidden bg-indigo-600 border-2 border-indigo-500 rounded-3xl p-10 flex flex-col items-center justify-center text-center shadow-2xl rotate-x-180 overflow-y-auto custom-scrollbar">
              <span className="absolute top-6 left-6 text-xs font-bold uppercase tracking-widest text-indigo-300">Answer</span>
              <p className="text-xl md:text-2xl font-medium text-white leading-relaxed">{currentCard.a}</p>
            </div>
            
          </div>
        </div>

        {/* Rating Controls */}
        <div className={`w-full max-w-2xl flex justify-center gap-4 transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button onClick={() => handleRate(0)} className="flex-1 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/30 rounded-2xl font-bold transition-all flex flex-col items-center">
            <span>Again</span>
            <span className="text-xs font-normal opacity-70">&lt; 10m</span>
          </button>
          <button onClick={() => handleRate(1)} className="flex-1 py-4 bg-orange-500/10 hover:bg-orange-500/20 text-orange-500 border border-orange-500/30 rounded-2xl font-bold transition-all flex flex-col items-center">
            <span>Hard</span>
            <span className="text-xs font-normal opacity-70">2d</span>
          </button>
          <button onClick={() => handleRate(2)} className="flex-1 py-4 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-500 border border-emerald-500/30 rounded-2xl font-bold transition-all flex flex-col items-center">
            <span>Good</span>
            <span className="text-xs font-normal opacity-70">4d</span>
          </button>
        </div>
      </div>
      
      {/* CSS specific for 3D flip */}
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
    <div className="flex-1 overflow-auto p-8 custom-scrollbar bg-slate-950">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-end mb-10">
          <div>
            <h1 className="text-3xl font-bold text-white">Exams & Quizzes</h1>
            <p className="text-slate-400 mt-2">Test your knowledge with AI-generated assessments.</p>
          </div>
          <button onClick={() => setView('library')} className="text-sm bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg font-medium shadow-md shadow-indigo-500/20 flex items-center gap-2">
            <Plus size={16} /> New Exam
          </button>
        </div>

        {exams.length === 0 ? (
          <div className="text-center py-24 border border-dashed border-slate-800 rounded-3xl bg-slate-900/30">
            <CheckSquare size={64} className="mx-auto text-slate-700 mb-6" />
            <h2 className="text-xl font-semibold text-white mb-2">No Exams Generated</h2>
            <p className="text-slate-500 max-w-sm mx-auto">
              Open a document in the library and use the AI Tools panel to generate a custom quiz based on your reading.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {exams.map(exam => (
              <div 
                key={exam.id} 
                onClick={() => setActiveExamId(exam.id)}
                className="bg-slate-900 border border-slate-800 rounded-2xl p-6 cursor-pointer hover:border-indigo-500 hover:bg-slate-800/80 transition-all group flex flex-col"
              >
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-purple-500/10 rounded-xl text-purple-400 group-hover:bg-purple-500 group-hover:text-white transition-colors">
                    <GraduationCap size={24} />
                  </div>
                  <button onClick={(e) => deleteExam(exam.id, e)} className="text-slate-600 hover:text-red-400 transition-colors">
                    <Trash2 size={16} />
                  </button>
                </div>
                <h3 className="text-lg font-bold text-slate-200 mb-2">{exam.title}</h3>
                <div className="mt-auto pt-4 flex justify-between items-center text-sm border-t border-slate-800/50">
                  <span className="text-slate-500">{exam.questions.length} Questions</span>
                  <span className="text-indigo-400 font-medium flex items-center gap-1 group-hover:translate-x-1 transition-transform">Take Quiz <ChevronRight size={14} /></span>
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
    <div className="flex-1 overflow-auto bg-slate-950 flex justify-center py-8 px-4 custom-scrollbar">
      <div className="max-w-3xl w-full flex flex-col">
        <button onClick={onBack} className="self-start mb-6 text-slate-400 hover:text-white flex items-center gap-2">
          <ChevronLeft size={20} /> Back to Exams
        </button>

        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 shadow-2xl relative overflow-hidden flex-1 flex flex-col">
          
          {!isSubmitted ? (
            <>
              {/* Progress Header */}
              <div className="flex justify-between items-center mb-8">
                <span className="text-sm font-bold tracking-widest uppercase text-indigo-500">Question {currentQIndex + 1} of {exam.questions.length}</span>
                <span className="text-xs bg-slate-800 text-slate-300 px-3 py-1 rounded-full font-medium">{exam.title}</span>
              </div>

              {/* Question */}
              <h2 className="text-2xl text-slate-100 font-semibold mb-8 leading-relaxed">
                {q.q}
              </h2>

              {/* Options */}
              <div className="space-y-3 mb-10 flex-1">
                {q.options.map((opt, idx) => (
                  <button 
                    key={idx}
                    onClick={() => handleSelect(idx)}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all flex items-center gap-4 ${
                      selectedAnswers[currentQIndex] === idx 
                        ? 'border-indigo-500 bg-indigo-500/10 text-indigo-100' 
                        : 'border-slate-800 bg-slate-950 text-slate-300 hover:border-slate-600'
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 ${selectedAnswers[currentQIndex] === idx ? 'border-indigo-500' : 'border-slate-600'}`}>
                      {selectedAnswers[currentQIndex] === idx && <div className="w-3 h-3 bg-indigo-500 rounded-full" />}
                    </div>
                    <span className="text-base">{opt}</span>
                  </button>
                ))}
              </div>

              {/* Controls */}
              <div className="flex justify-between items-center pt-6 border-t border-slate-800">
                <button 
                  onClick={() => setCurrentQIndex(i => Math.max(0, i - 1))}
                  disabled={currentQIndex === 0}
                  className="px-5 py-2.5 rounded-xl font-medium text-slate-400 disabled:opacity-30 hover:bg-slate-800"
                >
                  Previous
                </button>
                
                {currentQIndex === exam.questions.length - 1 ? (
                  <button 
                    onClick={() => setIsSubmitted(true)}
                    disabled={Object.keys(selectedAnswers).length < exam.questions.length}
                    className="px-8 py-3 bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold shadow-lg shadow-emerald-500/20 transition-all"
                  >
                    Submit Exam
                  </button>
                ) : (
                  <button 
                    onClick={() => setCurrentQIndex(i => Math.min(exam.questions.length - 1, i + 1))}
                    disabled={!isCurrentAnswered}
                    className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-xl font-bold shadow-lg shadow-indigo-500/20 transition-all flex items-center gap-2"
                  >
                    Next <ChevronRight size={18} />
                  </button>
                )}
              </div>
            </>
          ) : (
            // Results View
            <div className="flex flex-col items-center py-10">
              <div className="w-32 h-32 rounded-full border-8 border-slate-800 flex items-center justify-center mb-8 relative">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="60" cy="60" r="56" fill="none" stroke="currentColor" strokeWidth="8" className="text-emerald-500" strokeDasharray={`${(calculateScore() / exam.questions.length) * 351} 351`} />
                </svg>
                <div className="text-center">
                  <span className="text-3xl font-bold text-white">{calculateScore()}</span>
                  <span className="text-slate-500 text-sm block border-t border-slate-700 mt-1 pt-1">out of {exam.questions.length}</span>
                </div>
              </div>

              <h2 className="text-2xl font-bold text-white mb-2">Exam Completed!</h2>
              <p className="text-slate-400 mb-10">Here is the review of your answers.</p>

              <div className="w-full space-y-6">
                {exam.questions.map((q, idx) => {
                  const isCorrect = selectedAnswers[idx] === q.correct;
                  return (
                    <div key={idx} className="bg-slate-950 border border-slate-800 rounded-2xl p-6">
                      <div className="flex items-start gap-4 mb-4">
                        <div className={`mt-1 p-1 rounded-full ${isCorrect ? 'bg-emerald-500/20 text-emerald-500' : 'bg-red-500/20 text-red-500'}`}>
                          {isCorrect ? <CheckCircle2 size={20} /> : <XCircle size={20} />}
                        </div>
                        <div>
                          <h3 className="text-slate-200 font-medium mb-3">{q.q}</h3>
                          <div className="space-y-2 text-sm">
                            <p className="flex items-center gap-2 text-slate-400">
                              <span className="font-semibold text-slate-500 w-16">You chose:</span> 
                              <span className={isCorrect ? 'text-emerald-400' : 'text-red-400'}>{q.options[selectedAnswers[idx]]}</span>
                            </p>
                            {!isCorrect && (
                              <p className="flex items-center gap-2 text-slate-400">
                                <span className="font-semibold text-slate-500 w-16">Correct:</span> 
                                <span className="text-emerald-400">{q.options[q.correct]}</span>
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 p-4 bg-indigo-500/10 border border-indigo-500/20 rounded-xl">
                        <p className="text-sm text-indigo-200"><span className="font-bold text-indigo-400 mr-2">Explanation:</span> {q.explanation}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              <button onClick={onBack} className="mt-10 px-8 py-3 bg-slate-800 hover:bg-slate-700 text-white rounded-xl font-bold transition-all">
                Return to Exams
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}