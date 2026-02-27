import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen, Layers, CheckSquare, Settings,
  ChevronLeft, ChevronRight, Upload, MessageSquare,
  CheckCircle2, XCircle, BrainCircuit,
  Library, Trash2, Loader2, List,
  Send, ShieldAlert, LayoutDashboard,
  GraduationCap, Save, X, BookA, Crosshair,
  PanelRightClose, PanelRightOpen, KeyRound, AlertCircle,
  FileUp, Target, Info, Trash, Sparkles, Activity, Stethoscope, Lightbulb, Baby, Play,
  Database, Search, FileText, BarChart2, Globe, Bot, Code, Palette, Type, Download, Mic,
  Moon, Sun, HelpCircle, Printer
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

const callAI = async (prompt, expectJson, strictMode, apiKey, maxTokens = 1000) => {
  if (!apiKey?.trim()) throw new Error("OpenAI API Key is missing. Please add it in Settings.");
  const sysPrompt = strictMode
    ? "You are a highly strict, elite medical AI data extractor. You MUST use ONLY the text provided in the prompt. Do not hallucinate. Do not use outside knowledge. If the answer is not in the text, say 'Information not found in the selected pages.'"
    : "You are an elite medical AI tutor and diagnostic assistant.";
  const response = await fetch(`https://api.openai.com/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey.trim()}`,
    },
    body: JSON.stringify({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: "system", content: sysPrompt + (expectJson ? " Respond in strictly valid JSON format." : "") },
        { role: "user", content: prompt }
      ],
      response_format: expectJson ? { type: "json_object" } : { type: "text" },
      max_tokens: maxTokens,
      stream: true,
    }),
  });
  if (!response.ok) {
    const errData = await response.json().catch(() => ({}));
    throw new Error(`${errData.error?.message || response.statusText || 'API Error'}`);
  }
  const reader = response.body.getReader();
  const decoder = new TextDecoder();
  let fullContent = '';
  let buffer = '';
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split('\n');
    buffer = lines.pop();
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed === 'data: [DONE]') continue;
      if (trimmed.startsWith('data: ')) {
        const jsonStr = trimmed.slice(6);
        try {
          const chunk = JSON.parse(jsonStr);
          const delta = chunk.choices?.[0]?.delta?.content;
          if (delta) fullContent += delta;
        } catch (e) {
          console.warn('Failed to parse chunk:', trimmed, e);
        }
      }
    }
  }
  if (buffer.trim().startsWith('data: ')) {
    const jsonStr = buffer.trim().slice(6);
    try {
      const chunk = JSON.parse(jsonStr);
      const delta = chunk.choices?.[0]?.delta?.content;
      if (delta) fullContent += delta;
    } catch {}
  }
  return fullContent.trim();
};

export default function App() {
  const [documents, setDocuments] = useState([]);
  const [openDocs, setOpenDocs] = useState([]);
  const [activeDocId, setActiveDocId] = useState(null);
  const [docPages, setDocPages] = useState({});
  const [flashcards, setFlashcards] = useState([]);
  const [exams, setExams] = useState([]);
  const [notes, setNotes] = useState([]);
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

  useEffect(() => {
    try {
      const savedDocs = localStorage.getItem('drMariam_docs');
      const savedCards = localStorage.getItem('drMariam_flashcards');
      const savedExams = localStorage.getItem('drMariam_exams');
      const savedNotes = localStorage.getItem('drMariam_notes');
      const savedSettings = localStorage.getItem('drMariam_settings');
      const savedOpen = localStorage.getItem('drMariam_openDocs');
      const savedPages = localStorage.getItem('drMariam_docPages');
      if (savedDocs) setDocuments(JSON.parse(savedDocs) || []);
      if (savedCards) setFlashcards(JSON.parse(savedCards) || []);
      if (savedExams) setExams(JSON.parse(savedExams) || []);
      if (savedNotes) setNotes(JSON.parse(savedNotes) || []);
      if (savedSettings) setUserSettings(JSON.parse(savedSettings) || { apiKey: '', strictMode: true, theme: 'system', fontSize: 'medium', accentColor: 'indigo' });
      if (savedOpen) setOpenDocs(JSON.parse(savedOpen) || []);
      if (savedPages) setDocPages(JSON.parse(savedPages) || {});
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
      localStorage.setItem('drMariam_openDocs', JSON.stringify(openDocs));
      localStorage.setItem('drMariam_docPages', JSON.stringify(docPages));
    } catch (e) {
      console.warn("Storage write error", e);
    }
  }, [documents, flashcards, exams, notes, userSettings, openDocs, docPages]);

  useEffect(() => {
    const updateTheme = () => {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      const isDark = userSettings.theme === 'dark' || (userSettings.theme === 'system' && prefersDark);
      document.documentElement.classList.toggle('dark', isDark);
    };
    updateTheme();
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    media.addEventListener('change', updateTheme);
    return () => media.removeEventListener('change', updateTheme);
  }, [userSettings.theme]);

  useEffect(() => {
    document.documentElement.classList.remove('font-small', 'font-medium', 'font-large');
    document.documentElement.classList.add(`font-${userSettings.fontSize}`);
  }, [userSettings.fontSize]);

  useEffect(() => {
    document.documentElement.style.setProperty('--accent-color', getAccentColor(userSettings.accentColor));
    document.documentElement.style.setProperty('--accent-color-rgb', getAccentRgb(userSettings.accentColor));
  }, [userSettings.accentColor]);

  const getAccentColor = (color) => {
    switch (color) {
      case 'indigo': return '#6366f1';
      case 'purple': return '#a855f7';
      case 'blue': return '#3b82f6';
      default: return '#6366f1';
    }
  };

  const getAccentRgb = (color) => {
    switch (color) {
      case 'indigo': return '99, 102, 241';
      case 'purple': return '168, 85, 247';
      case 'blue': return '59, 130, 246';
      default: return '99, 102, 241';
    }
  };

  useEffect(() => {
    const updateOnline = () => setOnline(navigator.onLine);
    window.addEventListener('online', updateOnline);
    window.addEventListener('offline', updateOnline);
    return () => {
      window.removeEventListener('online', updateOnline);
      window.removeEventListener('offline', updateOnline);
    };
  }, []);

  useEffect(() => {
    const handleKey = (e) => {
      if (e.key === '?' && !e.shiftKey && e.target.tagName !== 'INPUT' && e.target.tagName !== 'TEXTAREA') {
        setShowShortcuts(true);
      }
    };
    document.addEventListener('keydown', handleKey);
    return () => document.removeEventListener('keydown', handleKey);
  }, []);

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
      setOpenDocs(prev => [...prev, id]);
      setActiveDocId(id);
      setDocPages(prev => ({...prev, [id]: 1}));
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

  const closeDoc = (id) => {
    setOpenDocs(prev => prev.filter(d => d !== id));
    if (activeDocId === id) {
      const newActive = openDocs.filter(d => d !== id)[0] || null;
      setActiveDocId(newActive);
      if (!newActive) setCurrentView('library');
    }
  };

  const deleteDocument = async (id, e) => {
    if (e) e.stopPropagation();
    await deletePdfData(id);
    setDocuments(prev => prev.filter(d => d.id !== id));
    setFlashcards(prev => prev.filter(f => f.docId !== id));
    setExams(prev => prev.filter(ex => ex.id !== id));
    setNotes(prev => prev.filter(n => n.docId !== id));
    closeDoc(id);
  };

  const activeDoc = documents.find(d => d.id === activeDocId);

  const filteredDocuments = searchQuery ? documents.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase()) || Object.values(d.pagesText).some(t => t.toLowerCase().includes(searchQuery.toLowerCase()))) : documents;

  return (
    <div className={`flex h-screen text-zinc-800 dark:text-zinc-200 font-sans overflow-hidden text-base font-medium ${`font-${userSettings.fontSize}`} bg-white dark:bg-[#0a0a0c]`} style={{'--accent-color': getAccentColor(userSettings.accentColor)}}>
      <nav className="w-20 bg-gray-50 dark:bg-[#0a0a0c] border-r border-gray-200 dark:border-zinc-800/30 flex flex-col items-center py-6 z-20 shrink-0 shadow-2xl dark:shadow-black/50">
        <div className="w-12 h-12 rounded-full bg-[var(--accent-color)] flex items-center justify-center shadow-xl shadow-[var(--accent-color)]/40 mb-12 cursor-pointer transition-transform hover:scale-105" onClick={() => { setActiveDocId(null); setCurrentView('library'); }}>
          <BrainCircuit className="text-white w-6 h-6" />
        </div>
        <div className="flex-1 flex flex-col gap-6 w-full px-2">
          <SidebarBtn icon={Library} label="Library" active={currentView === 'library' && !activeDocId} onClick={() => { setActiveDocId(null); setCurrentView('library'); }} />
          <SidebarBtn icon={Layers} label="Flashcards" active={currentView === 'flashcards' && !activeDocId} onClick={() => { setActiveDocId(null); setCurrentView('flashcards'); }} />
          <SidebarBtn icon={GraduationCap} label="Exams" active={currentView === 'exams' && !activeDocId} onClick={() => { setActiveDocId(null); setCurrentView('exams'); }} />
          <SidebarBtn icon={BookA} label="Notes" active={currentView === 'notes' && !activeDocId} onClick={() => { setActiveDocId(null); setCurrentView('notes'); }} />
          <SidebarBtn icon={LayoutDashboard} label="Dashboard" active={currentView === 'dashboard' && !activeDocId} onClick={() => { setActiveDocId(null); setCurrentView('dashboard'); }} />
          {activeDocId && (
            <>
              <div className="w-8 h-px bg-gray-200 dark:bg-zinc-800 mx-auto my-1" />
              <SidebarBtn icon={BookOpen} label="Reader" active={activeDocId !== null} onClick={() => setCurrentView('reader')} highlight />
            </>
          )}
        </div>
        <SidebarBtn icon={Settings} label="Settings" active={currentView === 'settings'} onClick={() => { setActiveDocId(null); setCurrentView('settings'); }} />
        {!online && <div className="absolute bottom-4 bg-red-500/20 text-red-400 px-2 py-1 rounded text-xs">Offline</div>}
      </nav>
      <main className="flex-1 flex flex-col relative bg-gray-50 dark:bg-[#0a0a0c] min-w-0">
        {isUploading && (
          <div className="absolute top-0 left-0 w-full h-1.5 bg-gray-200 dark:bg-zinc-800 z-50">
            <div className="h-full bg-[var(--accent-color)] transition-all duration-300 shadow-[0_0_15px_var(--accent-color)]" style={{ width: `${uploadProgress}%` }}></div>
          </div>
        )}
        {!activeDocId && currentView === 'library' && (
          <LibraryView documents={filteredDocuments} onUpload={handleFileUpload} onOpen={(id) => { setOpenDocs(prev => prev.includes(id) ? prev : [...prev, id]); setActiveDocId(id); setCurrentView('reader'); }} isUploading={isUploading} deleteDocument={deleteDocument} flashcards={flashcards} exams={exams} notes={notes} setView={setCurrentView} searchQuery={searchQuery} setSearchQuery={setSearchQuery} />
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
        {!activeDocId && currentView === 'dashboard' && (
          <DashboardView documents={documents} flashcards={flashcards} exams={exams} notes={notes} />
        )}
        {!activeDocId && currentView === 'settings' && (
          <div className="flex-1 flex items-center justify-center p-8">
            <div className="w-full max-w-lg"><PanelSettings settings={userSettings} setSettings={setUserSettings} /></div>
          </div>
        )}
        {activeDocId && (
          <PdfWorkspace activeDoc={activeDoc} setDocuments={setDocuments} closeDoc={() => closeDoc(activeDocId)} rightPanelOpen={rightPanelOpen} setRightPanelOpen={setRightPanelOpen} currentPage={docPages[activeDocId] || 1} setCurrentPage={(p) => setDocPages(prev => ({...prev, [activeDocId]: p}))} openDocs={openDocs} setActiveDocId={setActiveDocId} closeTab={closeDoc} setShowMenu={setShowMenu} setMenuPos={setMenuPos} setSelectedText={setSelectedText} setGenFromSelection={setGenFromSelection} setRightPanelTab={setRightPanelTab} setType={(t) => {}} />
        )}
        {activeDocId && !rightPanelOpen && (
          <button onClick={() => setRightPanelOpen(true)} className="fixed bottom-8 right-8 p-4 bg-[var(--accent-color)] rounded-full text-white shadow-2xl hover:scale-105 transition-transform z-30">
            <Sparkles size={24} />
          </button>
        )}
      </main>
      {rightPanelOpen && activeDocId && (
        <aside className="w-[550px] bg-gray-50 dark:bg-[#0a0a0c] border-l border-gray-200 dark:border-zinc-800/30 flex flex-col shrink-0 z-20 shadow-[-20px_0_40px_rgba(0,0,0,0.7)] relative transition-all duration-300">
          <div className="bg-[var(--accent-color)] px-4 py-2 flex items-center gap-2 shrink-0 border-b border-[var(--accent-color)]/50 shadow-md">
            <Target size={16} className="text-white"/>
            <span className="text-xs font-bold text-white uppercase tracking-widest">Target: Page {docPages[activeDocId]}</span>
          </div>
          <div className="h-16 flex p-2 bg-gray-50 dark:bg-[#0a0a0c] border-b border-gray-200 dark:border-zinc-800/30 shrink-0 gap-1 items-center">
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
                <h2 className="text-xl font-bold text-gray-800 dark:text-white mb-2">OpenAI Key Required</h2>
                <p className="text-sm text-gray-500 dark:text-zinc-400 mb-8 leading-relaxed">You must connect your OpenAI API key to unlock the elite AI extraction and generation tools.</p>
                <button onClick={() => setRightPanelTab('settings')} className="px-6 py-3 bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/90 transition-colors text-white rounded-xl text-sm font-bold shadow-lg shadow-[var(--accent-color)]/25">Connect API Key</button>
              </div>
            ) : rightPanelTab === 'generate' ? (
              <PanelGenerate activeDoc={activeDoc} settings={userSettings} setFlashcards={setFlashcards} setExams={setExams} setNotes={setNotes} switchToReview={() => setRightPanelTab('review')} genFromSelection={genFromSelection} setGenFromSelection={setGenFromSelection} currentPage={docPages[activeDocId]} />
            ) : rightPanelTab === 'chat' ? (
              <PanelChat activeDoc={activeDoc} settings={userSettings} currentPage={docPages[activeDocId]} />
            ) : rightPanelTab === 'review' ? (
              <PanelReview activeDocId={activeDocId} flashcards={flashcards} setFlashcards={setFlashcards} exams={exams} setExams={setExams} notes={notes} setNotes={setNotes} />
            ) : null}
          </div>
        </aside>
      )}
      {showShortcuts && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-zinc-900 p-8 rounded-2xl max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><HelpCircle /> Keyboard Shortcuts</h2>
            <ul className="space-y-2 text-sm">
              <li className="flex justify-between"><span>Arrow Left / Right</span><span>Change Page</span></li>
              <li className="flex justify-between"><span>?</span><span>Show Help</span></li>
              <li className="flex justify-between"><span>Ctrl + U</span><span>Upload PDF</span></li>
              <li className="flex justify-between"><span>Esc</span><span>Close Panel / Modal</span></li>
            </ul>
            <button onClick={() => setShowShortcuts(false)} className="mt-6 w-full py-2 bg-[var(--accent-color)] text-white rounded-xl">Close</button>
          </div>
        </div>
      )}
      {showMenu && (
        <div className="fixed inset-0 z-50" onClick={() => setShowMenu(false)}>
          <div className="absolute bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl shadow-2xl p-2" style={{left: menuPos.x, top: menuPos.y}}>
            <button onClick={() => { setShowMenu(false); setGenFromSelection(selectedText); setRightPanelOpen(true); setRightPanelTab('generate'); }} className="flex items-center gap-2 px-4 py-2 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg w-full text-left text-sm">
              <Sparkles size={16} /> Generate from Selection
            </button>
          </div>
        </div>
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
          ? highlight ? 'bg-[var(--accent-color)] text-white shadow-xl shadow-[var(--accent-color)]/40' : 'bg-gray-200 dark:bg-zinc-800 text-gray-800 dark:text-white shadow-lg'
          : 'text-gray-500 dark:text-zinc-500 hover:bg-gray-200 dark:hover:bg-zinc-800/80 hover:text-gray-800 dark:hover:text-zinc-200'
      }`}
    >
      <Icon size={24} />
      <span className="absolute left-16 bg-gray-200 dark:bg-zinc-800 text-gray-800 dark:text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-all border border-gray-300 dark:border-zinc-700 shadow-xl translate-x-[-10px] group-hover:translate-x-0">
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
        active ? 'bg-gray-200 dark:bg-zinc-800/80 text-[var(--accent-color)] shadow-inner border border-gray-300 dark:border-zinc-700/50' : 'text-gray-500 dark:text-zinc-500 hover:text-gray-300 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-900'
      }`}
    >
      <Icon size={16} /> {label}
    </button>
  );
}

// --- GLOBAL VIEWS ---

function LibraryView({ documents, onUpload, onOpen, isUploading, deleteDocument, flashcards, exams, notes, setView, searchQuery, setSearchQuery }) {
  return (
    <div className="flex-1 overflow-auto p-10 lg:p-16 custom-scrollbar bg-gray-50 dark:bg-[#0a0a0c]">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div>
            <h1 className="text-5xl font-black text-gray-800 dark:text-white tracking-tighter mb-3 flex items-center gap-4">
              Intelligence <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] to-purple-500">Nexus</span>
            </h1>
            <p className="text-gray-500 dark:text-zinc-400 text-base max-w-xl leading-relaxed">Your secure, local medical knowledge base. Upload materials and let the elite AI extract exams, notes, and cards.</p>
          </div>
          <label className={`cursor-pointer bg-white dark:bg-white text-zinc-950 dark:text-zinc-950 hover:bg-gray-100 dark:hover:bg-zinc-200 px-8 py-4 rounded-xl font-black text-sm flex items-center gap-3 transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
            {isUploading ? <Loader2 className="animate-spin" size={20} /> : <Upload size={20} />}
            {isUploading ? "PROCESSING PDF..." : "IMPORT SECURE PDF"}
            <input type="file" accept="application/pdf" className="hidden" onChange={onUpload} disabled={isUploading} />
          </label>
        </div>
        <div className="mb-8">
          <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search documents..." className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-xl px-4 py-3 text-sm outline-none focus:border-[var(--accent-color)]" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div onClick={() => setView('notes')} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800/80 transition-all bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800/50 p-6 rounded-3xl flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0"><BookA size={28}/></div>
            <div><p className="text-3xl font-black text-gray-800 dark:text-white">{notes.length}</p><p className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mt-1">Generated Notes</p></div>
          </div>
          <div onClick={() => setView('flashcards')} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800/80 transition-all bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800/50 p-6 rounded-3xl flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0"><Layers size={28}/></div>
            <div><p className="text-3xl font-black text-gray-800 dark:text-white">{flashcards.length}</p><p className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mt-1">Active Flashcards</p></div>
          </div>
          <div onClick={() => setView('exams')} className="cursor-pointer hover:bg-gray-100 dark:hover:bg-zinc-800/80 transition-all bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800/50 p-6 rounded-3xl flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0"><GraduationCap size={28}/></div>
            <div><p className="text-3xl font-black text-gray-800 dark:text-white">{exams.length}</p><p className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mt-1">Strict Exams</p></div>
          </div>
        </div>
        {documents.length === 0 ? (
          <div className="border-2 border-dashed border-gray-200 dark:border-zinc-800/80 rounded-[3rem] bg-white dark:bg-zinc-900/20 p-24 text-center">
            <div className="w-32 h-32 bg-gray-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-8 shadow-inner">
              <FileUp size={48} className="text-gray-400 dark:text-zinc-600" />
            </div>
            <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">No Documents Found</h2>
            <p className="text-gray-500 dark:text-zinc-500 text-base max-w-md mx-auto leading-relaxed">Import a textbook, research paper, or clinical guide to begin your enhanced study session.</p>
          </div>
        ) : (
          <div>
            <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6 flex items-center gap-2"><Library size={20} className="text-[var(--accent-color)]"/> Your Library</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {documents.map(doc => {
                const docCards = flashcards.filter(f => f.docId === doc.id).length;
                const docExams = exams.filter(e => e.docId === doc.id).length;
                return (
                  <div key={doc.id} onClick={() => onOpen(doc.id)} className="bg-white dark:bg-zinc-900/80 rounded-3xl p-6 border border-gray-200 dark:border-zinc-800 hover:border-[var(--accent-color)]/50 hover:shadow-[0_10px_40px_rgba(var(--accent-color-rgb),0.1)] cursor-pointer transition-all flex flex-col h-64 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--accent-color)]/5 rounded-bl-full -z-10 group-hover:bg-[var(--accent-color)]/10 transition-colors" />
                    <div className="flex items-start justify-between mb-6 z-10">
                      <div className="w-14 h-14 rounded-2xl bg-gray-100 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 flex items-center justify-center text-gray-400 dark:text-zinc-400 group-hover:bg-[var(--accent-color)] group-hover:text-white group-hover:border-[var(--accent-color)] transition-all shadow-sm">
                        <BookOpen size={24} />
                      </div>
                      <button onClick={(e) => deleteDocument(doc.id, e)} className="p-2.5 bg-gray-100 dark:bg-zinc-950/50 text-gray-500 dark:text-zinc-500 hover:text-red-400 hover:bg-red-500/20 rounded-xl transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm">
                        <Trash2 size={18} />
                      </button>
                    </div>
                    <h3 className="font-bold text-gray-800 dark:text-white text-lg leading-snug line-clamp-2 flex-1 z-10">{doc.name}</h3>
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800/80 z-10">
                      <div className="flex justify-between items-center mb-3">
                        <div className="flex gap-2">
                          <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-950 px-2 py-1 rounded-md">{docCards} Cards</span>
                          <span className="text-[10px] font-bold text-gray-500 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-950 px-2 py-1 rounded-md">{docExams} Exams</span>
                        </div>
                        <span className="text-[11px] font-black text-[var(--accent-color)] bg-[var(--accent-color)]/10 px-2.5 py-1 rounded-md">PG {doc.progress}/{doc.totalPages}</span>
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

function FlashcardsGlobalView({ flashcards, setFlashcards, setView }) {
  const [studying, setStudying] = useState(false);
  const exportAnki = () => {
    const csvContent = 'Front,Back\n' + flashcards.map(f => `"${f.q.replace(/"/g, '""')}","${f.a.replace(/"/g, '""')}"`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dr-mariam-flashcards.csv';
    link.click();
    URL.revokeObjectURL(url);
  };
  if (studying) {
    return <InPanelFlashcards cards={flashcards} onBack={() => setStudying(false)} setFlashcards={setFlashcards} />;
  }
  if (flashcards.length === 0) return (
    <div className="flex-1 flex flex-col items-center justify-center p-10 bg-gray-50 dark:bg-[#0a0a0c] text-center">
      <Layers size={64} className="text-gray-200 dark:text-zinc-800 mb-6" />
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No Flashcards</h2>
      <p className="text-gray-500 dark:text-zinc-500 max-w-md">Open a document and use the AI Generator to extract targeted flashcards.</p>
      <button onClick={() => setView('library')} className="mt-6 px-6 py-3 bg-[var(--accent-color)] text-white rounded-xl font-bold">Go to Library</button>
    </div>
  );
  return (
    <div className="flex-1 overflow-auto p-10 lg:p-16 custom-scrollbar bg-gray-50 dark:bg-[#0a0a0c]">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-black text-gray-800 dark:text-white tracking-tighter flex items-center gap-4"><Layers className="text-emerald-500"/> Global Flashcard Database</h1>
          <div className="flex gap-4">
            <button onClick={exportAnki} className="px-6 py-3 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2">Export to Anki <Download size={18} /></button>
            <button onClick={() => setStudying(true)} className="px-6 py-3 bg-[var(--accent-color)] text-white rounded-xl font-bold flex items-center gap-2">Study All <Play size={18} /></button>
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {flashcards.map(c => (
            <div key={c.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-3xl relative group shadow-sm hover:border-[var(--accent-color)]/50 transition-all">
              <span className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-color)] mb-2 block">Pgs {c.sourcePages}</span>
              <p className="text-sm text-gray-800 dark:text-white font-bold mb-3 leading-relaxed"><span className="text-gray-400 dark:text-zinc-600 mr-2 text-xs uppercase tracking-widest">Q</span>{c.q}</p>
              <p className="text-sm text-[var(--accent-color)] leading-relaxed bg-[var(--accent-color)]/10 p-3 rounded-xl border border-[var(--accent-color)]/10"><span className="text-[var(--accent-color)]/50 mr-2 text-xs uppercase tracking-widest">A</span>{c.a}</p>
              <button onClick={() => setFlashcards(flashcards.filter(f => f.id !== c.id))} className="absolute top-6 right-6 p-2.5 bg-gray-100 dark:bg-zinc-950 text-gray-500 dark:text-zinc-600 hover:text-red-400 hover:bg-red-500/20 rounded-xl transition-all opacity-0 group-hover:opacity-100 backdrop-blur-sm"><Trash2 size={16}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function ExamsGlobalView({ exams, setExams, setView }) {
  const [selectedExam, setSelectedExam] = useState(null);
  const exportExamPdf = async (exam) => {
    try {
      await loadJsPDF();
      const { jsPDF } = window.jspdf;
      const pdf = new jsPDF();
      pdf.setFontSize(16);
      pdf.text(exam.title, 10, 10);
      let y = 20;
      exam.questions.forEach((q, i) => {
        pdf.setFontSize(12);
        pdf.text(`${i + 1}. ${q.q}`, 10, y);
        y += 8;
        q.options.forEach((opt, oi) => {
          pdf.text(`${String.fromCharCode(65 + oi)}. ${opt}`, 15, y);
          y += 6;
        });
        y += 10;
        if (y > 280) {
          pdf.addPage();
          y = 10;
        }
      });
      pdf.save(`${exam.title}.pdf`);
    } catch (e) {
      console.error('Failed to export PDF', e);
    }
  };
  if (selectedExam) {
    return (
      <div className="flex-1 flex flex-col bg-gray-50 dark:bg-[#0a0a0c]">
        <div className="h-16 flex items-center justify-between px-6 bg-gray-100 dark:bg-[#121214] border-b border-gray-200 dark:border-zinc-800 shrink-0">
          <button
            onClick={() => setSelectedExam(null)}
            className="flex items-center gap-2 text-emerald-400 hover:text-emerald-300 text-sm font-bold uppercase tracking-widest"
          >
            <ChevronLeft size={18} /> Back to List
          </button>
          <span className="text-sm text-gray-500 dark:text-zinc-400">
            {selectedExam.title} • {selectedExam.questions.length} Questions
          </span>
        </div>
        <InPanelExam
          exam={selectedExam}
          onBack={() => setSelectedExam(null)}
        />
      </div>
    );
  }
  if (exams.length === 0) return (
    <div className="flex-1 flex flex-col items-center justify-center p-10 bg-gray-50 dark:bg-[#0a0a0c] text-center">
      <GraduationCap size={64} className="text-gray-200 dark:text-zinc-800 mb-6" />
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No Exams Generated</h2>
      <p className="text-gray-500 dark:text-zinc-500 max-w-md">Open a document and use the AI to generate a strict test on specific pages.</p>
      <button onClick={() => setView('library')} className="mt-6 px-6 py-3 bg-[var(--accent-color)] text-white rounded-xl font-bold">Go to Library</button>
    </div>
  );
  return (
    <div className="flex-1 overflow-auto p-10 lg:p-16 custom-scrollbar bg-gray-50 dark:bg-[#0a0a0c]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-gray-800 dark:text-white tracking-tighter mb-8 flex items-center gap-4"><GraduationCap className="text-emerald-500"/> Global Exam Database</h1>
        <div className="space-y-6">
          {exams.map(e => (
            <div key={e.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-3xl flex justify-between items-center group hover:border-emerald-500/50 transition-all">
              <div>
                <p className="text-lg text-gray-800 dark:text-white font-black mb-2">{e.title}</p>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-lg border border-emerald-500/20">{e.questions.length} Questions</span>
                  <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500">Source: Pages {e.sourcePages}</span>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <button onClick={() => exportExamPdf(e)} className="p-3 bg-blue-600 hover:bg-blue-500 text-white rounded-xl transition-all flex items-center gap-2 shadow-md"><Printer size={18} /> Export PDF</button>
                <button onClick={() => setSelectedExam(e)} className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl transition-all flex items-center gap-2 shadow-md"><Play size={18} /> Take Exam</button>
                <button onClick={() => setExams(exams.filter(ex => ex.id !== e.id))} className="p-3 bg-gray-100 dark:bg-zinc-950 text-gray-600 dark:text-zinc-600 hover:text-red-400 rounded-xl transition-all"><Trash2 size={18}/></button>
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
    <div className="flex-1 flex flex-col items-center justify-center p-10 bg-gray-50 dark:bg-[#0a0a0c] text-center">
      <BookA size={64} className="text-gray-200 dark:text-zinc-800 mb-6" />
      <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-2">No Notes Found</h2>
      <p className="text-gray-500 dark:text-zinc-500 max-w-md">Open a document and use the AI to generate clinical cases, mnemonics, or summaries.</p>
      <button onClick={() => setView('library')} className="mt-6 px-6 py-3 bg-[var(--accent-color)] text-white rounded-xl font-bold">Go to Library</button>
    </div>
  );
  return (
    <div className="flex-1 overflow-auto p-10 lg:p-16 custom-scrollbar bg-gray-50 dark:bg-[#0a0a0c]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-black text-gray-800 dark:text-white tracking-tighter mb-8 flex items-center gap-4"><BookA className="text-blue-500"/> Global Notes Database</h1>
        <div className="space-y-6">
          {notes.map(n => (
            <div key={n.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-8 rounded-3xl relative group hover:border-blue-500/50 transition-all shadow-md">
              <h3 className="text-xl text-gray-800 dark:text-white font-black mb-4 pr-12">{n.title}</h3>
              <div className="text-sm text-gray-600 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed prose prose-invert max-w-none">{n.content}</div>
              <button onClick={() => setNotes(notes.filter(no => no.id !== n.id))} className="absolute top-8 right-8 p-3 bg-gray-100 dark:bg-zinc-950 text-gray-600 dark:text-zinc-600 hover:text-red-400 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-sm"><Trash2 size={18}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardView({ documents, flashcards, exams, notes }) {
  return (
    <div className="flex-1 overflow-auto p-10 lg:p-16 custom-scrollbar bg-gray-50 dark:bg-[#0a0a0c]">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-4xl font-black text-gray-800 dark:text-white tracking-tighter mb-8 flex items-center gap-4"><LayoutDashboard className="text-[var(--accent-color)]"/> Personal Progress Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-3xl">
            <p className="text-3xl font-black text-gray-800 dark:text-white">{flashcards.length}</p>
            <p className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mt-1">Flashcards Created</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-3xl">
            <p className="text-3xl font-black text-gray-800 dark:text-white">{exams.length}</p>
            <p className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mt-1">Exams Generated</p>
          </div>
          <div className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-3xl">
            <p className="text-3xl font-black text-gray-800 dark:text-white">{notes.length}</p>
            <p className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mt-1">Notes Saved</p>
          </div>
        </div>
        <h3 className="text-lg font-bold text-gray-800 dark:text-white mb-6">Document Progress</h3>
        <div className="space-y-4">
          {documents.map(doc => (
            <div key={doc.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-6 rounded-3xl">
              <p className="text-sm font-bold text-gray-800 dark:text-white mb-2">{doc.name}</p>
              <div className="h-2 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-[var(--accent-color)] transition-width duration-300" style={{width: `${(doc.progress / doc.totalPages * 100)}%`}} />
              </div>
              <p className="text-xs text-gray-500 dark:text-zinc-500 mt-2">{doc.progress} / {doc.totalPages} pages</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

// --- WORKSPACE & SIDE-BY-SIDE TOOLS ---

function PdfWorkspace({ activeDoc, setDocuments, closeDoc, rightPanelOpen, setRightPanelOpen, currentPage, setCurrentPage, openDocs, setActiveDocId, closeTab, setShowMenu, setMenuPos, setSelectedText, setGenFromSelection, setRightPanelTab, setType }) {
  const [pdf, setPdf] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const textLayerRef = useRef(null);
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
        const scale = Math.min((containerWidth / tempViewport.width) * 0.95, (containerHeight / tempViewport.height) * 0.95);
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
        // Text layer
        const textLayer = textLayerRef.current;
        if (textLayer) {
          textLayer.innerHTML = '';
          textLayer.style.width = `${viewport.width}px`;
          textLayer.style.height = `${viewport.height}px`;
          const textContent = await page.getTextContent();
          window.pdfjsLib.renderTextLayer({
            textContentSource: textContent,
            container: textLayer,
            viewport,
            textDivs: []
          }).promise;
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

  const handleContextMenu = (e) => {
    const sel = window.getSelection().toString().trim();
    if (sel) {
      e.preventDefault();
      setSelectedText(sel);
      setMenuPos({x: e.pageX, y: e.pageY});
      setShowMenu(true);
    }
  };

  return (
    <div className="flex-1 flex flex-col h-full bg-gray-100 dark:bg-[#050505] relative" onContextMenu={handleContextMenu}>
      <div className="h-16 flex items-center justify-between px-6 bg-white dark:bg-[#0a0a0c] border-b border-gray-200 dark:border-zinc-800/30 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-4 overflow-hidden">
          <button onClick={closeDoc} className="flex items-center gap-2 text-gray-500 dark:text-zinc-500 hover:text-gray-800 dark:hover:text-white transition-colors text-xs font-black uppercase tracking-widest bg-gray-100 dark:bg-zinc-900 px-4 py-2 rounded-xl">
            <ChevronLeft size={16} /> Exit
          </button>
          <div className="w-px h-6 bg-gray-200 dark:bg-zinc-800"></div>
          <span className="text-sm font-bold text-gray-800 dark:text-zinc-200 truncate max-w-[200px] md:max-w-md" title={activeDoc.name}>{activeDoc.name}</span>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center bg-gray-100 dark:bg-zinc-900 rounded-xl border border-gray-200 dark:border-zinc-800 overflow-hidden shadow-inner h-11">
            <button onClick={() => setCurrentPage(p => Math.max(1, p - 1))} className="px-5 h-full text-gray-400 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800 hover:text-gray-800 dark:hover:text-white transition-colors flex items-center"><ChevronLeft size={20} /></button>
            <div className="px-4 h-full flex items-center justify-center border-x border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-950">
              <span className="text-sm font-mono text-gray-800 dark:text-white font-black tracking-widest">PG {currentPage} <span className="text-gray-400 dark:text-zinc-600 mx-1">/</span> {activeDoc.totalPages}</span>
            </div>
            <button onClick={() => setCurrentPage(p => Math.min(activeDoc.totalPages, p + 1))} className="px-5 h-full text-gray-400 dark:text-zinc-400 hover:bg-gray-200 dark:hover:bg-zinc-800 hover:text-gray-800 dark:hover:text-white transition-colors flex items-center"><ChevronRight size={20} /></button>
          </div>
          <button onClick={() => setRightPanelOpen(!rightPanelOpen)} className={`p-2.5 rounded-xl border transition-all shadow-md ${rightPanelOpen ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white' : 'bg-gray-100 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-400 dark:text-zinc-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-200 dark:hover:bg-zinc-800'}`}>
            {rightPanelOpen ? <PanelRightClose size={20} /> : <PanelRightOpen size={20} />}
          </button>
        </div>
      </div>
      {openDocs.length > 1 && (
        <div className="flex gap-2 px-6 py-2 bg-white dark:bg-[#0a0a0c] border-b border-gray-200 dark:border-zinc-800/30 overflow-x-auto">
          {openDocs.map(id => {
            const doc = documents.find(d => d.id === id);
            return (
              <div key={id} className={`flex items-center gap-2 px-4 py-2 rounded-t-xl cursor-pointer transition-all ${activeDocId === id ? 'bg-gray-50 dark:bg-[#121214] border border-gray-200 dark:border-zinc-800 border-b-0' : 'text-gray-500 dark:text-zinc-500 hover:text-gray-800 dark:hover:text-white'}`} onClick={() => setActiveDocId(id)}>
                <span className="text-sm truncate max-w-[150px]">{doc.name}</span>
                <button onClick={(e) => { e.stopPropagation(); closeTab(id); }} className="text-red-500"><X size={16} /></button>
              </div>
            );
          })}
        </div>
      )}
      <div ref={containerRef} className="flex-1 overflow-hidden bg-gray-100 dark:bg-[#121214] flex justify-center items-center relative shadow-[inset_0_0_80px_rgba(0,0,0,0.8)]">
        {isLoading ? (
          <div className="flex flex-col items-center gap-6 text-gray-500 dark:text-zinc-500 m-auto">
            <Loader2 className="animate-spin text-[var(--accent-color)]" size={40}/>
            <span className="text-xs font-black tracking-widest uppercase">Rendering Secure Viewer...</span>
          </div>
        ) : pdf ? (
          <>
            <canvas ref={canvasRef} className="shadow-[0_0_50px_rgba(0,0,0,1)]" />
            <div ref={textLayerRef} className="absolute top-0 left-0 select-text pointer-events-auto" style={{color: 'transparent', userSelect: 'text'}} />
          </>
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
    <div className="p-8 h-full overflow-y-auto custom-scrollbar flex flex-col gap-8 bg-gray-50 dark:bg-[#0a0a0c]">
      <div className="bg-[var(--accent-color)]/20 border border-[var(--accent-color)]/30 p-6 rounded-2xl shadow-lg">
        <h3 className="text-base font-black text-[var(--accent-color)] flex items-center gap-2 mb-3"><KeyRound size={20}/> OpenAI API Key</h3>
        <p className="text-sm text-gray-600 dark:text-[var(--accent-color)]/70 leading-relaxed mb-6">Enter your OpenAI key (sk-...) to power the AI extraction engine. Keys are saved securely in your browser's local storage and never sent to our servers.</p>
        <input
          type="password"
          value={settings.apiKey}
          onChange={(e) => setSettings({...settings, apiKey: e.target.value})}
          placeholder="sk-proj-..."
          className="w-full bg-white dark:bg-[#050505] border border-[var(--accent-color)]/50 rounded-xl px-5 py-4 text-sm text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] font-mono shadow-inner mb-4"
        />
        <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-xs text-[var(--accent-color)] font-bold uppercase tracking-widest hover:text-[var(--accent-color)]/80 transition-colors flex items-center gap-1">Get API Key <ChevronRight size={14}/></a>
      </div>
      <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 p-6 rounded-2xl">
        <label className="flex items-start gap-4 cursor-pointer">
          <div className="mt-1 relative flex items-center justify-center">
            <input type="checkbox" checked={settings.strictMode} onChange={(e) => setSettings({...settings, strictMode: e.target.checked})} className="peer appearance-none w-5 h-5 border-2 border-gray-300 dark:border-zinc-600 rounded bg-white dark:bg-zinc-950 checked:bg-[var(--accent-color)] checked:border-[var(--accent-color)] transition-all" />
            <CheckSquare size={14} className="text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100" />
          </div>
          <div>
            <span className="text-base font-bold text-gray-800 dark:text-white block">Strict Document Grounding</span>
            <span className="text-sm text-gray-500 dark:text-zinc-500 mt-2 block leading-relaxed">Forces the AI to exclusively use the text found in the active PDF pages. Essential for medical study to guarantee zero hallucinations.</span>
          </div>
        </label>
      </div>
      <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 p-6 rounded-2xl">
        <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-3"><Moon size={20}/> Theme</h3>
        <div className="flex gap-4">
          <button onClick={() => setSettings({...settings, theme: 'system'})} className={`flex-1 py-2 rounded-xl ${settings.theme === 'system' ? 'bg-[var(--accent-color)] text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-white'}`}>System</button>
          <button onClick={() => setSettings({...settings, theme: 'dark'})} className={`flex-1 py-2 rounded-xl ${settings.theme === 'dark' ? 'bg-[var(--accent-color)] text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-white'}`}>Dark</button>
          <button onClick={() => setSettings({...settings, theme: 'light'})} className={`flex-1 py-2 rounded-xl ${settings.theme === 'light' ? 'bg-[var(--accent-color)] text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-white'}`}>Light</button>
        </div>
      </div>
      <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 p-6 rounded-2xl">
        <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-3"><Type size={20}/> Font Size</h3>
        <div className="flex gap-4">
          <button onClick={() => setSettings({...settings, fontSize: 'small'})} className={`flex-1 py-2 rounded-xl ${settings.fontSize === 'small' ? 'bg-[var(--accent-color)] text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-white'}`}>Small</button>
          <button onClick={() => setSettings({...settings, fontSize: 'medium'})} className={`flex-1 py-2 rounded-xl ${settings.fontSize === 'medium' ? 'bg-[var(--accent-color)] text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-white'}`}>Medium</button>
          <button onClick={() => setSettings({...settings, fontSize: 'large'})} className={`flex-1 py-2 rounded-xl ${settings.fontSize === 'large' ? 'bg-[var(--accent-color)] text-white' : 'bg-gray-100 dark:bg-zinc-800 text-gray-800 dark:text-white'}`}>Large</button>
        </div>
      </div>
      <div className="bg-white dark:bg-zinc-900/50 border border-gray-200 dark:border-zinc-800 p-6 rounded-2xl">
        <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2 mb-3"><Palette size={20}/> Accent Color</h3>
        <div className="flex gap-4">
          <button onClick={() => setSettings({...settings, accentColor: 'indigo'})} className="w-10 h-10 rounded-full bg-indigo-500" />
          <button onClick={() => setSettings({...settings, accentColor: 'purple'})} className="w-10 h-10 rounded-full bg-purple-500" />
          <button onClick={() => setSettings({...settings, accentColor: 'blue'})} className="w-10 h-10 rounded-full bg-blue-500" />
        </div>
      </div>
    </div>
  );
}

function PanelGenerate({ activeDoc, settings, setFlashcards, setExams, setNotes, switchToReview, genFromSelection, setGenFromSelection, currentPage }) {
  const [startPage, setStartPage] = useState(currentPage);
  const [endPage, setEndPage] = useState(currentPage);
  const [type, setType] = useState('flashcards');
  const [count, setCount] = useState(30);
  const [difficulty, setDifficulty] = useState(2);
  const [status, setStatus] = useState({ loading: false, msg: '', err: false });
  const [generated, setGenerated] = useState(null);
  useEffect(() => {
    if (!status.loading && !generated && !genFromSelection) {
      setStartPage(currentPage);
      setEndPage(currentPage);
    }
  }, [currentPage, status.loading, generated, genFromSelection]);

  const difficultyLevels = ['Hard', 'Expert', 'Insane'];

  const chunkText = (text, maxLength = 8000) => {
    const chunks = [];
    for (let i = 0; i < text.length; i += maxLength) {
      chunks.push(text.substring(i, i + maxLength));
    }
    return chunks;
  };

  const handleGenerate = async () => {
    setStatus({ loading: true, msg: 'Reading text from pages...', err: false });
    setGenerated(null);
    try {
      let text = genFromSelection || "";
      if (!genFromSelection) {
        for (let i = Number(startPage); i <= Number(endPage); i++) if (activeDoc.pagesText[i]) text += activeDoc.pagesText[i] + "\n";
      }
      if (!text.trim()) throw new Error("No readable text found on these pages.");
      setStatus({ loading: true, msg: 'Elite AI processing via OpenAI...', err: false });
      const diffPrompt = `Make it ${difficultyLevels[difficulty - 1]} level: very very hard, long, detailed, and advanced, requiring deep analysis, clinical reasoning, multi-step thinking.`;
      const maxTokens = type === 'exam' ? 800 : 500;
      const chunks = chunkText(text);
      const results = await Promise.all(chunks.map(async (chunk, index) => {
        let p = diffPrompt + "\n";
        if (type === 'flashcards') {
          p += `Create exactly ${Math.ceil(count / chunks.length)} highly accurate study flashcards from this text ONLY. Respond in JSON format: { "items": [ {"q": "Clear Question", "a": "Precise Answer"} ] }\nTEXT:\n${chunk}`;
          return JSON.parse(await callAI(p, true, settings.strictMode, settings.apiKey, maxTokens)).items;
        } else if (type === 'exam') {
          p += `Create extremely difficult, advanced-level ${Math.ceil(count / chunks.length)}-question medical/academic exam from this text ONLY. Respond in JSON format: { "title": "Exam Title Part ${index + 1}", "items": [ { "q": "Question", "options": ["A","B","C","D"], "correct": 0, "explanation": "Detailed explanation using text" } ] }\nTEXT:\n${chunk}`;
          return JSON.parse(await callAI(p, true, settings.strictMode, settings.apiKey, maxTokens)).items;
        } else if (type === 'summary') {
          p += `Write a comprehensive, structured summary of this text ONLY. Use markdown headings and bullet points.\nTEXT:\n${chunk}`;
          return await callAI(p, false, settings.strictMode, settings.apiKey, maxTokens);
        } else if (type === 'clinical') {
          p += `Based ONLY on the medical concepts in this text, create a realistic Clinical Case Study scenario. Include patient presentation, symptoms, and ask a question at the end, followed by the answer. Respond in Markdown.\nTEXT:\n${chunk}`;
          return await callAI(p, false, settings.strictMode, settings.apiKey, maxTokens);
        } else if (type === 'eli5') {
          p += `Explain the core concepts of this text extremely simply, as if explaining to a beginner or a 5-year-old. Use analogies. Respond in Markdown.\nTEXT:\n${chunk}`;
          return await callAI(p, false, settings.strictMode, settings.apiKey, maxTokens);
        } else if (type === 'mnemonics') {
          p += `Create extremely memorable, clever mnemonics for the key lists, drugs, or concepts in this text. Respond in Markdown.\nTEXT:\n${chunk}`;
          return await callAI(p, false, settings.strictMode, settings.apiKey, maxTokens);
        } else if (type === 'quiz') {
          p += `Create ${count} interactive quiz questions from this text ONLY, with multiple choices and explanations. JSON: { "items": [ { "q": "", "options": [], "correct": 0, "explanation": "" } ] }\nTEXT:\n${chunk}`;
          return JSON.parse(await callAI(p, true, settings.strictMode, settings.apiKey, maxTokens)).items;
        } else if (type === 'mindmap') {
          p += `Generate a mindmap structure in JSON from this text ONLY: { "nodes": [ { "id": "", "label": "", "parent": "" } ] }\nTEXT:\n${chunk}`;
          return JSON.parse(await callAI(p, true, settings.strictMode, settings.apiKey, maxTokens));
        } else if (type === 'translation') {
          p += `Translate this text to English, keeping medical terms intact. Respond in Markdown.\nTEXT:\n${chunk}`;
          return await callAI(p, false, settings.strictMode, settings.apiKey, maxTokens);
        } else if (type === 'diagram') {
          p += `Describe a diagram or flowchart for key concepts in this text in ASCII art or Markdown. \nTEXT:\n${chunk}`;
          return await callAI(p, false, settings.strictMode, settings.apiKey, maxTokens);
        } else if (type === 'research') {
          p += `Summarize research implications from this text ONLY. Use bullet points.\nTEXT:\n${chunk}`;
          return await callAI(p, false, settings.strictMode, settings.apiKey, maxTokens);
        } else if (type === 'comparison') {
          p += `Compare and contrast key concepts in this text ONLY. Respond in table Markdown.\nTEXT:\n${chunk}`;
          return await callAI(p, false, settings.strictMode, settings.apiKey, maxTokens);
        } else if (type === 'simulation') {
          p += `Create a step-by-step simulation scenario based on this text ONLY. Respond in numbered list.\nTEXT:\n${chunk}`;
          return await callAI(p, false, settings.strictMode, settings.apiKey, maxTokens);
        }
        return [];
      }));
      // Combine results from chunks
      if (type === 'flashcards' || type === 'quiz' || type === 'exam') {
        setGenerated({ type, data: results.flat(), pages: genFromSelection ? 'Selection' : `${startPage}-${endPage}` });
      } else if (type === 'mindmap') {
        setGenerated({ type, data: results.flat(), pages: genFromSelection ? 'Selection' : `${startPage}-${endPage}` });
      } else {
        setGenerated({ type, data: results.join('\n'), pages: genFromSelection ? 'Selection' : `${startPage}-${endPage}` });
      }
      setStatus({ loading: false, msg: 'Generation Complete.', err: false });
    } catch (e) {
      setStatus({ loading: false, msg: e.message || "Failed.", err: true });
    } finally {
      setGenFromSelection('');
    }
  };

  const saveItem = () => {
    if (!generated) return;
    if (generated.type === 'flashcards') {
      const cards = generated.data.map(c => ({ id: Date.now()+Math.random(), docId: activeDoc.id, sourcePages: generated.pages, q: c.q, a: c.a, level: 0, nextReview: Date.now(), repetitions: 0, ef: 2.5, interval: 1, lastReview: Date.now() }));
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
    <div className="h-full flex flex-col bg-gray-50 dark:bg-[#0a0a0c] p-6">
      {!generated ? (
        <div className="bg-white dark:bg-zinc-900/80 border border-gray-200 dark:border-zinc-800/50 p-6 rounded-3xl flex-shrink-0 shadow-2xl dark:shadow-black/30">
          {!genFromSelection && (
            <div className="flex items-center justify-between mb-8">
              <div className="w-full mr-4 relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500 mb-2 block">Start Pg</label>
                <input type="number" min={1} max={activeDoc.totalPages} value={startPage} onChange={e=>setStartPage(Number(e.target.value))} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-base text-center text-gray-800 dark:text-white font-mono font-bold outline-none focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)] transition-all shadow-inner" />
              </div>
              <div className="mt-6 text-gray-400 dark:text-zinc-600 font-bold">TO</div>
              <div className="w-full ml-4 relative">
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500 mb-2 block">End Pg</label>
                <input type="number" min={1} max={activeDoc.totalPages} value={endPage} onChange={e=>setEndPage(Number(e.target.value))} className="w-full bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-xl px-4 py-3 text-base text-center text-gray-800 dark:text-white font-mono font-bold outline-none focus:border-[var(--accent-color)] focus:ring-1 focus:ring-[var(--accent-color)] transition-all shadow-inner" />
              </div>
            </div>
          )}
          <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500 mb-3 block">Extraction Tool</label>
          <div className="grid grid-cols-3 gap-3 mb-8">
            <ToolBtn id="flashcards" active={type} set={setType} icon={Layers} label="Cards" />
            <ToolBtn id="exam" active={type} set={setType} icon={CheckSquare} label="Hard Exam" />
            <ToolBtn id="summary" active={type} set={setType} icon={BookA} label="Summary" />
            <ToolBtn id="clinical" active={type} set={setType} icon={Stethoscope} label="Clinical Case" />
            <ToolBtn id="mnemonics" active={type} set={setType} icon={Lightbulb} label="Mnemonics" />
            <ToolBtn id="quiz" active={type} set={setType} icon={GraduationCap} label="Quiz" />
            <ToolBtn id="mindmap" active={type} set={setType} icon={BarChart2} label="Mindmap" />
            <ToolBtn id="diagram" active={type} set={setType} icon={Code} label="Diagram" />
            <ToolBtn id="research" active={type} set={setType} icon={Search} label="Research" />
            <ToolBtn id="comparison" active={type} set={setType} icon={Database} label="Compare" />
            <ToolBtn id="simulation" active={type} set={setType} icon={Bot} label="Simulation" />
            <ToolBtn id="translation" active={type} set={setType} icon={Globe} label="Translate" />
            <ToolBtn id="eli5" active={type} set={setType} icon={Baby} label="ELI5" />
          </div>
          {(type === 'flashcards' || type === 'exam' || type === 'quiz') && (
            <div className="mb-8 bg-white dark:bg-zinc-950 p-4 rounded-xl border border-gray-200 dark:border-zinc-800">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500 mb-3 flex justify-between"><span>Quantity</span> <span className="text-[var(--accent-color)] text-sm">{count} Items</span></label>
              <input type="range" min="5" max="100" value={count} onChange={e=>setCount(parseInt(e.target.value))} className="w-full accent-[var(--accent-color)] h-2 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer" />
            </div>
          )}
          <div className="mb-8 bg-white dark:bg-zinc-950 p-4 rounded-xl border border-gray-200 dark:border-zinc-800">
            <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500 mb-3 flex justify-between"><span>Difficulty</span> <span className="text-[var(--accent-color)] text-sm">{difficultyLevels[difficulty - 1]}</span></label>
            <input type="range" min="1" max="3" value={difficulty} onChange={e=>setDifficulty(parseInt(e.target.value))} className="w-full accent-[var(--accent-color)] h-2 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer" />
          </div>
          <button onClick={handleGenerate} disabled={status.loading} className="w-full py-4 bg-white dark:bg-white hover:bg-gray-100 dark:hover:bg-zinc-200 text-zinc-950 dark:text-zinc-950 rounded-xl text-sm font-black uppercase tracking-widest transition-all shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_40px_rgba(255,255,255,0.25)] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-3">
            {status.loading ? <Loader2 size={20} className="animate-spin" /> : <BrainCircuit size={20} />}
            {status.loading ? "Running AI Engine..." : "Execute Extraction"}
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-zinc-900 border border-emerald-500/40 rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-300 shadow-2xl shadow-emerald-900/20">
          <div className="bg-emerald-500/10 border-b border-emerald-500/30 p-4 flex justify-between items-center shrink-0">
            <span className="text-xs font-black uppercase tracking-widest text-emerald-400 flex items-center gap-2"><CheckCircle2 size={18}/> Review Output</span>
            <div className="flex gap-3">
              <button onClick={()=>setGenerated(null)} className="px-4 py-2 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-300 rounded-xl text-[10px] font-bold uppercase tracking-widest transition-colors">Discard</button>
              <button onClick={saveItem} className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg shadow-emerald-900/50 transition-colors"><Save size={16}/> Save to DB</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-5 space-y-4">
            {generated.type === 'flashcards' && generated.data.map((item, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 p-5 rounded-2xl relative group pr-12 shadow-sm">
                <p className="text-sm text-gray-800 dark:text-white font-bold mb-3 leading-relaxed"><span className="text-gray-400 dark:text-zinc-600 mr-2 text-xs uppercase tracking-widest">Q</span>{item.q}</p>
                <p className="text-sm text-[var(--accent-color)] leading-relaxed"><span className="text-[var(--accent-color)]/50 mr-2 text-xs uppercase tracking-widest">A</span>{item.a}</p>
                <button onClick={()=>removeItem(idx)} className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-zinc-900 text-gray-500 dark:text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
              </div>
            ))}
            {generated.type === 'exam' && generated.data.map((item, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 p-5 rounded-2xl relative group pr-12 shadow-sm">
                <p className="text-sm text-gray-800 dark:text-white font-bold mb-4 leading-relaxed">{idx+1}. {item.q}</p>
                <div className="space-y-2">
                  {item.options.map((opt, oIdx) => (
                    <div key={oIdx} className={`text-xs p-3 rounded-xl border bg-gray-100 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400`}>{opt}</div>
                  ))}
                </div>
                <button onClick={()=>removeItem(idx)} className="absolute top-4 right-4 p-2 bg-gray-100 dark:bg-zinc-900 text-gray-500 dark:text-zinc-500 hover:text-red-400 hover:bg-red-400/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16}/></button>
              </div>
            ))}
            {generated.type !== 'flashcards' && generated.type !== 'exam' && (
              <div className="bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 p-6 rounded-2xl relative group shadow-sm">
                <div className="text-sm text-gray-600 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed prose prose-invert prose-p:text-gray-600 dark:prose-p:text-zinc-300 prose-headings:text-gray-800 dark:prose-headings:text-white max-w-none">{generated.data}</div>
              </div>
            )}
          </div>
        </div>
      )}
      {status.msg && !generated && (
        <div className={`mt-6 p-5 rounded-2xl text-sm font-bold flex items-start gap-4 border ${status.err ? 'bg-red-500/10 text-red-400 border-red-500/20' : 'bg-[var(--accent-color)]/10 text-[var(--accent-color)] border-[var(--accent-color)]/20 shadow-lg shadow-[var(--accent-color)]/20'}`}>
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
    <button onClick={() => set(id)} className={`py-3 px-2 flex flex-col items-center justify-center gap-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${isA ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white shadow-lg shadow-[var(--accent-color)]/30' : 'bg-gray-50 dark:bg-zinc-950 border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-500 hover:text-gray-300 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}>
      <Icon size={20} className={isA ? "text-white" : "text-gray-400 dark:text-zinc-600"}/> {label}
    </button>
  );
}

function PanelChat({ activeDoc, settings, currentPage }) {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [recognizing, setRecognizing] = useState(false);
  const endRef = useRef(null);
  const recognition = useRef(null);
  useEffect(() => {
    setMessages([{ role: 'assistant', content: `I am locked onto **Page ${currentPage}**. What do you need explained?` }]);
  }, [currentPage]);
  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);
  useEffect(() => {
    if ('webkitSpeechRecognition' in window) {
      recognition.current = new window.webkitSpeechRecognition();
      recognition.current.continuous = false;
      recognition.current.interimResults = false;
      recognition.current.onresult = (e) => setInput(prev => prev + e.results[0][0].transcript);
      recognition.current.onend = () => setRecognizing(false);
    }
  }, []);
  const toggleRecognition = () => {
    if (recognizing) {
      recognition.current.stop();
    } else {
      recognition.current.start();
    }
    setRecognizing(!recognizing);
  };
  const handleChat = async () => {
    if (!input.trim() || loading) return;
    const msg = input; setInput("");
    setMessages(p => [...p, { role: 'user', content: msg }]);
    setLoading(true);
    
    try {
      const text = activeDoc.pagesText[currentPage] || "No readable text found on this page.";
      const prompt = `DOCUMENT CONTEXT FROM PAGE ${currentPage}:\n${text}\n\nSTUDENT QUESTION:\n${msg}`;
      
      const res = await callAI(prompt, false, settings.strictMode, settings.apiKey);
      setMessages(p => [...p, { role: 'assistant', content: res }]);
    } catch (e) {
      setMessages(p => [...p, { role: 'assistant', content: `⚠️ ${e.message}` }]);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="h-full flex flex-col bg-gray-50 dark:bg-[#0a0a0c]">
      <div className="bg-[var(--accent-color)] px-5 py-3 flex items-center gap-3 shadow-md shrink-0">
         <Target size={16} className="text-white" />
         <span className="text-[10px] font-black text-white uppercase tracking-widest">Locked: Page {currentPage}</span>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 space-y-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${m.role === 'user' ? 'bg-[var(--accent-color)]' : 'bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700'}`}>
              {m.role === 'user' ? <List size={18} className="text-white" /> : <BrainCircuit size={18} className="text-[var(--accent-color)]" />}
            </div>
            <div className={`p-5 max-w-[85%] text-sm leading-relaxed shadow-inner ${m.role === 'user' ? 'bg-[var(--accent-color)] text-white rounded-3xl rounded-tr-sm' : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl rounded-tl-sm text-gray-600 dark:text-zinc-300 whitespace-pre-wrap'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-4">
             <div className="w-10 h-10 rounded-2xl bg-gray-100 dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center justify-center shrink-0 shadow-lg"><Loader2 size={18} className="text-[var(--accent-color)] animate-spin" /></div>
             <div className="p-5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl rounded-tl-sm flex items-center gap-2"><span className="w-2.5 h-2.5 bg-gray-300 dark:bg-zinc-600 rounded-full animate-bounce"></span><span className="w-2.5 h-2.5 bg-gray-300 dark:bg-zinc-600 rounded-full animate-bounce" style={{animationDelay:'0.15s'}}></span><span className="w-2.5 h-2.5 bg-gray-300 dark:bg-zinc-600 rounded-full animate-bounce" style={{animationDelay:'0.3s'}}></span></div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="p-5 bg-gray-100 dark:bg-zinc-950 border-t border-gray-200 dark:border-zinc-800 shrink-0">
        <div className="relative flex items-end bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-2xl focus-within:border-[var(--accent-color)] focus-within:ring-1 focus-within:ring-[var(--accent-color)] transition-all shadow-inner p-1">
          <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault(); handleChat();}}} placeholder={`Ask about page ${currentPage}...`} disabled={loading} className="w-full bg-transparent p-4 pr-16 text-sm text-gray-800 dark:text-white outline-none resize-none max-h-40 custom-scrollbar" style={{minHeight:'56px'}} />
          <button onClick={toggleRecognition} className="absolute right-20 bottom-3 p-3 text-[var(--accent-color)]">{recognizing ? <Mic size={18} fill="currentColor" /> : <Mic size={18} />}</button>
          <button onClick={handleChat} disabled={loading||!input.trim()} className="absolute right-3 bottom-3 p-3 bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/90 disabled:bg-gray-200 dark:disabled:bg-zinc-800 disabled:text-gray-400 dark:disabled:text-zinc-600 rounded-xl text-white transition-all shadow-lg disabled:shadow-none"><Send size={18}/></button>
        </div>
      </div>
    </div>
  );
}

function PanelReview({ activeDocId, flashcards, setFlashcards, exams, setExams, notes, setNotes }) {
  const [activeItem, setActiveItem] = useState(null);
  const docCards = flashcards.filter(f => f.docId === activeDocId);
  const docExams = exams.filter(e => e.docId === activeDocId);
  const docNotes = notes.filter(n => n.docId === activeDocId);
  if (activeItem?.type === 'exam') return <InPanelExam exam={activeItem.data} onBack={() => setActiveItem(null)} />;
  if (activeItem?.type === 'note') return <InPanelNote note={activeItem.data} onBack={() => setActiveItem(null)} />;
  if (activeItem?.type === 'flashcards') return <InPanelFlashcards cards={docCards} onBack={() => setActiveItem(null)} setFlashcards={setFlashcards} />;
  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-6 bg-gray-50 dark:bg-[#0a0a0c] space-y-12">
      <div>
        <h3 className="text-[10px] font-black uppercase tracking-widest text-emerald-400 mb-5 flex items-center gap-2 bg-emerald-500/10 w-fit px-3 py-1.5 rounded-lg border border-emerald-500/20"><GraduationCap size={16}/> Generated Exams ({docExams.length})</h3>
        {docExams.length === 0 ? <p className="text-sm text-gray-400 dark:text-zinc-600 italic bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 text-center">No exams created for this document yet.</p> : (
          <div className="space-y-4">
            {docExams.map(e => (
              <div key={e.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-5 rounded-2xl group shadow-md transition-all hover:border-emerald-500/30">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <p className="text-sm text-gray-800 dark:text-white font-bold mb-1">{e.title}</p>
                    <span className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-950 px-2 py-1 rounded-lg border border-gray-200 dark:border-zinc-800">{e.questions.length} Questions • Pgs {e.sourcePages}</span>
                  </div>
                  <button onClick={() => setExams(exams.filter(ex => ex.id !== e.id))} className="p-2 bg-gray-100 dark:bg-zinc-950 text-gray-600 dark:text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl transition-all shadow-sm"><Trash size={16}/></button>
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
           <h3 className="text-[10px] font-black uppercase tracking-widest text-[var(--accent-color)] flex items-center gap-2 bg-[var(--accent-color)]/10 w-fit px-3 py-1.5 rounded-lg border border-[var(--accent-color)]/20"><Layers size={16}/> Saved Flashcards ({docCards.length})</h3>
           {docCards.length > 0 && <button onClick={() => setActiveItem({ type: 'flashcards' })} className="text-[10px] bg-[var(--accent-color)] text-white px-3 py-1.5 rounded-lg font-bold uppercase tracking-widest flex items-center gap-1 shadow-md hover:bg-[var(--accent-color)]/90 transition-colors"><Play size={12} fill="currentColor"/> Study</button>}
        </div>
        {docCards.length === 0 ? <p className="text-sm text-gray-400 dark:text-zinc-600 italic bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 text-center">No flashcards extracted for this document.</p> : (
          <div className="space-y-4">
            {docCards.slice(0, 5).map(c => (
              <div key={c.id} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-5 rounded-2xl relative group pr-12 shadow-md hover:border-[var(--accent-color)]/30 transition-all">
                <p className="text-xs text-gray-800 dark:text-white font-bold line-clamp-2 leading-relaxed"><span className="text-gray-400 dark:text-zinc-600 mr-2 text-[10px] uppercase">Q</span>{c.q}</p>
                <button onClick={() => setFlashcards(flashcards.filter(f => f.id !== c.id))} className="absolute top-1/2 -translate-y-1/2 right-4 p-2 bg-gray-100 dark:bg-zinc-950 text-gray-600 dark:text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-sm"><Trash size={16}/></button>
              </div>
            ))}
            {docCards.length > 5 && <div className="text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500 text-center pt-4 bg-white dark:bg-zinc-900/30 rounded-xl py-3 border border-dashed border-gray-200 dark:border-zinc-800">+{docCards.length - 5} more inside Study Mode</div>}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-[10px] font-black uppercase tracking-widest text-blue-400 mb-5 flex items-center gap-2 bg-blue-500/10 w-fit px-3 py-1.5 rounded-lg border border-blue-500/20"><BookA size={16}/> Saved Notes ({docNotes.length})</h3>
        {docNotes.length === 0 ? <p className="text-sm text-gray-400 dark:text-zinc-600 italic bg-white dark:bg-zinc-900/50 p-6 rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 text-center">No notes or summaries generated.</p> : (
          <div className="space-y-4">
            {docNotes.map(n => (
              <div key={n.id} onClick={() => setActiveItem({ type: 'note', data: n })} className="bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 p-5 rounded-2xl group relative shadow-md hover:border-blue-500/30 transition-all cursor-pointer">
                <div className="pr-12">
                   <p className="text-sm text-gray-800 dark:text-white font-bold mb-2">{n.title}</p>
                   <p className="text-xs text-gray-500 dark:text-zinc-400 line-clamp-3 leading-relaxed bg-gray-100 dark:bg-zinc-950 p-3 rounded-xl border border-gray-200 dark:border-zinc-800">{n.content}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setNotes(notes.filter(no => no.id !== n.id)); }} className="absolute top-5 right-4 p-2 bg-gray-100 dark:bg-zinc-950 text-gray-600 dark:text-zinc-600 hover:text-red-400 hover:bg-red-500/10 rounded-xl opacity-0 group-hover:opacity-100 transition-all shadow-sm"><Trash size={16}/></button>
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
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#0a0a0c]">
      <div className="bg-emerald-600/10 border-b border-emerald-500/20 p-4 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="text-emerald-400 hover:text-emerald-300 text-xs font-bold uppercase tracking-widest flex items-center gap-1"><ChevronLeft size={14}/> Back</button>
        <span className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Pages {exam.sourcePages}</span>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
        <>
          <div className="mb-6 flex justify-between items-center border-b border-gray-200 dark:border-zinc-800 pb-4">
            <span className="text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">Question {currentQIndex + 1} of {exam.questions.length}</span>
          </div>
          <h2 className="text-lg text-gray-800 dark:text-white font-bold mb-6 leading-relaxed">{q.q}</h2>
          <div className="space-y-3 mb-8">
            {q.options.map((opt, idx) => (
              <button
                key={idx} onClick={() => handleSelect(idx)}
                disabled={showFeedback}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-4 ${
                  selectedAnswer === idx ? (idx === q.correct ? 'border-emerald-500 bg-emerald-500/10 text-emerald-100 shadow-inner' : 'border-red-500 bg-red-500/10 text-red-100 shadow-inner') : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 hover:border-gray-300 dark:hover:border-zinc-600'
                }`}
              >
                <div className={`w-5 h-5 rounded-full border mt-0.5 flex items-center justify-center shrink-0 ${selectedAnswer === idx ? 'border-emerald-500' : 'border-gray-300 dark:border-zinc-600'}`}>
                  {selectedAnswer === idx && <div className="w-2.5 h-2.5 bg-emerald-500 rounded-full" />}
                </div>
                <span className="text-sm leading-relaxed">{opt}</span>
              </button>
            ))}
          </div>
          {showFeedback && (
            <div className="mt-4 p-3 bg-[var(--accent-color)]/5 border border-[var(--accent-color)]/10 rounded-xl text-xs text-[var(--accent-color)]/80"><span className="font-bold text-[var(--accent-color)] mr-2 uppercase tracking-widest text-[10px]">Explanation:</span>{q.explanation}</div>
          )}
          <div className="flex justify-between items-center">
                      <button onClick={prevQuestion} disabled={currentQIndex === 0} className="px-4 py-2 text-gray-500 dark:text-zinc-500 hover:text-gray-800 dark:hover:text-white disabled:opacity-30 text-xs font-bold uppercase tracking-widest transition-colors">Previous</button>
            <button onClick={nextQuestion} disabled={!showFeedback} className="px-6 py-3 bg-white dark:bg-white hover:bg-gray-100 dark:hover:bg-zinc-200 disabled:bg-gray-200 dark:disabled:bg-zinc-800 disabled:text-gray-400 dark:disabled:text-zinc-600 text-zinc-950 dark:text-zinc-950 disabled:shadow-none rounded-xl text-xs font-black shadow-lg uppercase tracking-widest transition-all flex items-center gap-2">Next <ChevronRight size={14}/></button>
          </div>
        </>
      </div>
    </div>
  );
}

function InPanelFlashcards({ cards, onBack, setFlashcards }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  if (cards.length === 0) return <div className="p-6 text-center text-gray-500 dark:text-zinc-500">No cards left.</div>;
  const currentCard = cards[currentIndex];
  const handleRate = (quality) => {
    let newRep = currentCard.repetitions || 0;
    let newEf = currentCard.ef || 2.5;
    let newInterval = currentCard.interval || 1;
    if (quality < 3) {
      newRep = 0;
      newInterval = 1;
    } else {
      newEf = newEf + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
      if (newEf < 1.3) newEf = 1.3;
      newRep += 1;
      if (newRep === 1) newInterval = 1;
      else if (newRep === 2) newInterval = 6;
      else newInterval = Math.round(newInterval * newEf);
    }
    const nextReview = Date.now() + newInterval * 86400000; // days to ms
    const newCard = {...currentCard, repetitions: newRep, ef: newEf, interval: newInterval, lastReview: Date.now(), nextReview };
    setFlashcards(prev => prev.map(c => c.id === newCard.id ? newCard : c));
    setIsFlipped(false);
    if (currentIndex < cards.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      onBack();
      alert('Study session complete!');
    }
  };
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#0a0a0c]">
      <div className="bg-[var(--accent-color)]/10 border-b border-[var(--accent-color)]/20 p-4 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="text-[var(--accent-color)] hover:text-[var(--accent-color)]/80 text-xs font-bold uppercase tracking-widest flex items-center gap-1"><ChevronLeft size={14}/> Back</button>
        <span className="text-[10px] text-[var(--accent-color)] font-black uppercase tracking-widest">Card {currentIndex+1} / {cards.length}</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <div onClick={() => !isFlipped && setIsFlipped(true)} className="w-full h-80 perspective-1000 cursor-pointer">
          <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-x-180' : ''}`}>
            {/* FRONT */}
            <div className="absolute inset-0 backface-hidden bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-xl">
              <span className="absolute top-5 left-5 text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-600">Question</span>
              <h2 className="text-lg font-bold text-gray-800 dark:text-white leading-relaxed">{currentCard.q}</h2>
              <div className="absolute bottom-5 text-[10px] font-bold uppercase tracking-widest text-[var(--accent-color)]/50 animate-pulse">Click to reveal</div>
            </div>
            {/* BACK */}
            <div className="absolute inset-0 backface-hidden bg-[var(--accent-color)]/90 border border-[var(--accent-color)]/30 rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl rotate-x-180 overflow-y-auto custom-scrollbar">
              <span className="absolute top-5 left-5 text-[10px] font-black uppercase tracking-widest text-white/80">Answer</span>
              <p className="text-base font-bold text-white leading-relaxed">{currentCard.a}</p>
            </div>
          </div>
        </div>
        <div className={`w-full flex gap-3 mt-8 transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button onClick={() => handleRate(0)} className="flex-1 py-4 bg-red-500/10 border border-red-500/20 hover:border-red-500/50 rounded-2xl text-red-400 text-xs font-black uppercase tracking-widest transition-all">Again</button>
          <button onClick={() => handleRate(3)} className="flex-1 py-4 bg-yellow-500/10 border border-yellow-500/20 hover:border-yellow-500/50 rounded-2xl text-yellow-400 text-xs font-black uppercase tracking-widest transition-all">Hard</button>
          <button onClick={() => handleRate(4)} className="flex-1 py-4 bg-emerald-500/10 border border-emerald-500/20 hover:border-emerald-500/50 rounded-2xl text-emerald-400 text-xs font-black uppercase tracking-widest transition-all">Good</button>
          <button onClick={() => handleRate(5)} className="flex-1 py-4 bg-blue-500/10 border border-blue-500/20 hover:border-blue-500/50 rounded-2xl text-blue-400 text-xs font-black uppercase tracking-widest transition-all">Easy</button>
        </div>
      </div>
      <style>{`.perspective-1000 { perspective: 1000px; } .transform-style-3d { transform-style: preserve-3d; } .backface-hidden { backface-visibility: hidden; } .rotate-x-180 { transform: rotateX(180deg); }`}</style>
    </div>
  );
}

function InPanelNote({ note, onBack }) {
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#0a0a0c]">
      <div className="bg-blue-600/10 border-b border-blue-500/20 p-4 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="text-blue-400 hover:text-blue-300 text-xs font-bold uppercase tracking-widest flex items-center gap-1"><ChevronLeft size={14}/> Back</button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6">
         <h2 className="text-xl font-black text-gray-800 dark:text-white mb-6 leading-snug">{note.title}</h2>
         <div className="prose prose-invert prose-sm max-w-none prose-p:text-gray-600 dark:prose-p:text-zinc-300 prose-headings:text-gray-800 dark:prose-headings:text-white prose-strong:text-[var(--accent-color)] whitespace-pre-wrap leading-relaxed">
            {note.content}
         </div>
      </div>
    </div>
  );
}