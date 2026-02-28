import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  BookOpen, Layers, CheckSquare, Settings, 
  ChevronLeft, ChevronRight, Upload, MessageSquare, 
  CheckCircle2, XCircle, BrainCircuit,
  Library, Trash2, Loader2, List,
  Send, ShieldAlert, LayoutDashboard,
  GraduationCap, Save, X, BookA, Crosshair,
  PanelRightClose, PanelRightOpen, KeyRound, AlertCircle,
  FileUp, Target, Info, Trash, Sparkles, Activity, Stethoscope, Lightbulb, Baby, Play, Bookmark, History,
  Dna, Microscope, Pill, Thermometer, ClipboardList, Zap, Database, Search, FileText, BarChart2, Globe, Bot, Code, Palette, Type, Download, Mic,
  Moon, Sun, HelpCircle, Printer, Menu
} from 'lucide-react';

const DB_NAME = 'MariamProDB_v6';
const STORE_NAME = 'pdfs';

const openDB = () => new Promise((resolve, reject) => {
  const request = indexedDB.open(DB_NAME, 1);
  request.onupgradeneeded = (e) => {
    e.target.result.createObjectStore(STORE_NAME);
  };
  request.onsuccess = () => resolve(request.result);
  request.onerror = () => reject(request.error);
});

const savePdfData = async (id, data) => {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(STORE_NAME, 'readwrite');
    tx.objectStore(STORE_NAME).put(data, id);
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

const callAI = async (prompt, expectJson, strictMode, apiKey, maxTokens = 16384) => {
  if (!apiKey?.trim()) throw new Error("OpenAI API Key is missing. Please add it in Settings.");
  const sysPrompt = strictMode
    ? "You are a highly strict, elite medical AI data extractor. You MUST use ONLY the text provided in the prompt. Do not hallucinate. NO OUTSIDE KNOWLEDGE. If the requested information is not in the text, clearly state 'Information not found in the selected pages.' or return an empty array."
    : "You are an elite medical AI tutor and diagnostic assistant. Provide extremely detailed, advanced-level clinical insights.";
  
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
  const [rightPanelOpen, setRightPanelOpen] = useState(false);
  const [online, setOnline] = useState(navigator.onLine);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [menuPos, setMenuPos] = useState({x:0, y:0});
  const [selectedText, setSelectedText] = useState('');
  const [genFromSelection, setGenFromSelection] = useState('');

  // Force strict resets via JS to bypass GitHub Mobile / Vite defaults
  useEffect(() => {
    let meta = document.querySelector('meta[name="viewport"]');
    if (!meta) {
      meta = document.createElement('meta');
      meta.name = "viewport";
      document.head.appendChild(meta);
    }
    meta.content = "width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no";
    
    const rootEl = document.getElementById('root');
    if (rootEl) {
      rootEl.style.setProperty('max-width', 'none', 'important');
      rootEl.style.setProperty('margin', '0', 'important');
      rootEl.style.setProperty('padding', '0', 'important');
      rootEl.style.setProperty('width', '100vw', 'important');
      rootEl.style.setProperty('height', '100dvh', 'important');
      rootEl.style.setProperty('text-align', 'left', 'important');
    }
    document.body.style.setProperty('margin', '0', 'important');
    document.body.style.setProperty('padding', '0', 'important');
    document.documentElement.style.setProperty('margin', '0', 'important');
    document.documentElement.style.setProperty('padding', '0', 'important');
  }, []);

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
      if (savedCards) {
        const parsedCards = JSON.parse(savedCards) || [];
        if (parsedCards.length > 0 && !parsedCards[0].cards) {
          const migrated = [];
          const docIds = [...new Set(parsedCards.map(c => c.docId))];
          docIds.forEach(docId => {
            const docCards = parsedCards.filter(c => c.docId === docId);
            migrated.push({
               id: 'migrated-' + docId,
               docId: docId,
               sourcePages: 'Various',
               title: 'Legacy Flashcards',
               cards: docCards,
               createdAt: new Date().toISOString()
            });
          });
          setFlashcards(migrated);
        } else {
          setFlashcards(parsedCards);
        }
      }
      
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
      const docsToSave = documents.map(d => {
        const copy = { ...d };
        delete copy.pagesText;
        return copy;
      });
      localStorage.setItem('drMariam_docs', JSON.stringify(docsToSave));
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

  const prefersDark = typeof window !== 'undefined' && window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  const isDark = userSettings.theme === 'dark' || (userSettings.theme === 'system' && prefersDark);
  
  const fontSizeMap = {
    small: '14px',
    medium: '16px',
    large: '18px'
  };

  useEffect(() => {
    const root = document.documentElement;
    if (isDark) {
      root.classList.add('dark');
      root.style.setProperty('color-scheme', 'dark');
    } else {
      root.classList.remove('dark');
      root.style.setProperty('color-scheme', 'light');
    }
  }, [isDark]);

  useEffect(() => {
    document.documentElement.style.fontSize = fontSizeMap[userSettings.fontSize] || '16px';
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
        progress: 1,
        addedAt: new Date().toISOString()
      };
      await savePdfData(id, { buffer: arrayBuffer, pagesText });
      setDocuments(prev => [...prev, newDoc]);
      setOpenDocs(prev => [...prev, id]);
      setActiveDocId(id);
      setDocPages(prev => ({...prev, [id]: 1}));
      setCurrentView('reader');
      setRightPanelTab('generate');
      setRightPanelOpen(false); 
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
    setExams(prev => prev.filter(ex => ex.docId !== id));
    setNotes(prev => prev.filter(n => n.docId !== id));
    closeDoc(id);
  };

  const activeDoc = documents.find(d => d.id === activeDocId);

  const filteredDocuments = searchQuery ? documents.filter(d => d.name.toLowerCase().includes(searchQuery.toLowerCase())) : documents;

  return (
    <>
      <style>{`
        :root {
          --bg-root: ${isDark ? '#050505' : '#f9fafb'};
          --bg-panel: ${isDark ? '#0a0a0c' : '#ffffff'};
          --bg-surface: ${isDark ? '#121214' : '#f3f4f6'};
          --text-main: ${isDark ? '#e4e4e7' : '#1f2937'};
        }
        body { background-color: var(--bg-root); color: var(--text-main); transition: background-color 0.3s, color 0.3s; }
        html, body, #root { margin: 0 !important; padding: 0 !important; max-width: none !important; width: 100vw !important; height: 100dvh !important; overflow: hidden !important; text-align: left !important; }
      `}</style>
      <div className={`flex flex-col-reverse md:flex-row h-[100dvh] w-screen font-sans overflow-hidden ${isDark ? 'dark bg-[#0a0a0c] text-zinc-200' : 'bg-gray-50 text-gray-800'}`}>

        
        <nav className="w-full md:w-24 h-16 md:h-full bg-white dark:bg-[#0a0a0c] border-t md:border-t-0 md:border-r border-gray-200 dark:border-zinc-800/50 flex flex-row md:flex-col items-center justify-around md:justify-start py-0 md:py-6 z-50 shrink-0 shadow-[0_-10px_30px_rgba(0,0,0,0.05)] dark:shadow-[0_-10px_30px_rgba(0,0,0,0.5)] md:shadow-2xl transition-all">
          <div className="hidden md:flex w-14 h-14 rounded-full bg-[var(--accent-color)] items-center justify-center shadow-xl shadow-[var(--accent-color)]/40 mb-10 cursor-pointer transition-transform hover:scale-105" onClick={() => { setActiveDocId(null); setCurrentView('library'); }}>
            <BrainCircuit className="text-white w-7 h-7" />
          </div>
          
          <div className="flex-1 flex flex-row md:flex-col gap-2 md:gap-6 w-full px-2 items-center justify-around md:justify-start overflow-x-auto md:overflow-y-auto custom-scrollbar">
            <SidebarBtn icon={Library} label="Library" active={currentView === 'library' && !activeDocId} onClick={() => { setActiveDocId(null); setCurrentView('library'); }} />
            <SidebarBtn icon={Layers} label="Cards" active={currentView === 'flashcards' && !activeDocId} onClick={() => { setActiveDocId(null); setCurrentView('flashcards'); }} />
            <SidebarBtn icon={GraduationCap} label="Exams" active={currentView === 'exams' && !activeDocId} onClick={() => { setActiveDocId(null); setCurrentView('exams'); }} />
            <SidebarBtn icon={BookA} label="Notes" active={currentView === 'notes' && !activeDocId} onClick={() => { setActiveDocId(null); setCurrentView('notes'); }} />
            <SidebarBtn icon={LayoutDashboard} label="Hub" active={currentView === 'dashboard' && !activeDocId} onClick={() => { setActiveDocId(null); setCurrentView('dashboard'); }} className="hidden md:flex" />
            
            {activeDocId && (
              <>
                <div className="hidden md:block w-10 h-px bg-gray-300 dark:bg-zinc-800 mx-auto my-1" />
                <SidebarBtn icon={BookOpen} label="Reader" active={activeDocId !== null} onClick={() => setCurrentView('reader')} highlight />
              </>
            )}
            <div className="md:hidden w-px h-8 bg-gray-300 dark:bg-zinc-800 mx-1" />
            <SidebarBtn icon={Settings} label="Settings" active={currentView === 'settings'} onClick={() => { setActiveDocId(null); setCurrentView('settings'); }} className="md:hidden" />
          </div>
          
          <div className="hidden md:block mt-4 pt-4 border-t border-gray-200 dark:border-zinc-800/30 w-full px-2">
             <SidebarBtn icon={Settings} label="Settings" active={currentView === 'settings'} onClick={() => { setActiveDocId(null); setCurrentView('settings'); }} />
          </div>
          {!online && <div className="absolute bottom-2 md:bottom-auto md:top-2 bg-red-500/20 text-red-500 font-bold px-2 py-1 rounded text-[10px] uppercase">Offline</div>}
        </nav>

        <main className="flex-1 flex flex-col relative bg-gray-50 dark:bg-[#0a0a0c] min-w-0 h-[calc(100vh-4rem)] md:h-screen">
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
            <div className="flex-1 overflow-y-auto p-4 md:p-10 lg:p-16 custom-scrollbar bg-gray-50 dark:bg-[#0a0a0c]">
              <div className="max-w-3xl mx-auto pb-20">
                 <h1 className="text-3xl md:text-4xl font-black text-gray-800 dark:text-white tracking-tighter mb-8 flex items-center gap-4"><Settings className="text-[var(--accent-color)]"/> System Settings</h1>
                 <PanelSettings settings={userSettings} setSettings={setUserSettings} />
              </div>
            </div>
          )}

          {activeDocId && (
            <PdfWorkspace 
              activeDoc={activeDoc} 
              setDocuments={setDocuments} 
              closeDoc={() => closeDoc(activeDocId)} 
              rightPanelOpen={rightPanelOpen} 
              setRightPanelOpen={setRightPanelOpen} 
              currentPage={docPages[activeDocId] || 1} 
              setCurrentPage={(updater) => {
                setDocPages(prev => {
                  const oldVal = prev[activeDocId] || 1;
                  const newVal = typeof updater === 'function' ? updater(oldVal) : updater;
                  return {...prev, [activeDocId]: newVal};
                });
              }} 
              openDocs={openDocs} 
              setActiveDocId={setActiveDocId} 
              closeTab={closeDoc} 
              setShowMenu={setShowMenu} 
              setMenuPos={setMenuPos} 
              setSelectedText={setSelectedText} 
              setGenFromSelection={setGenFromSelection} 
              setRightPanelTab={setRightPanelTab} 
            />
          )}
        </main>

        {activeDocId && (
          <aside className={`${rightPanelOpen ? 'translate-y-0' : 'translate-y-full md:translate-y-0 md:hidden'} fixed inset-0 bottom-16 md:bottom-0 md:relative md:flex w-full md:w-[450px] lg:w-[500px] xl:w-[600px] bg-white/95 dark:bg-[#0a0a0c]/95 backdrop-blur-xl border-t md:border-t-0 md:border-l border-gray-200 dark:border-zinc-800/50 flex flex-col shrink-0 z-40 md:z-20 shadow-[-20px_0_40px_rgba(0,0,0,0.1)] dark:shadow-[-20px_0_40px_rgba(0,0,0,0.8)] transition-transform duration-300 ease-in-out`}>
            <div className="bg-[var(--accent-color)] px-5 py-3 flex items-center justify-between shrink-0 shadow-md">
              <div className="flex items-center gap-3">
                <Target size={18} className="text-white"/>
                <span className="text-xs font-bold text-white uppercase tracking-widest">Target: Page {docPages[activeDocId] || 1}</span>
              </div>
              <button onClick={() => setRightPanelOpen(false)} className="md:hidden text-white/80 hover:text-white p-1 rounded-lg"><X size={20} /></button>
            </div>
            <div className="h-16 flex p-2 bg-gray-50/50 dark:bg-[#0a0a0c]/50 border-b border-gray-200 dark:border-zinc-800/30 shrink-0 gap-1 items-center">
              <PanelTab active={rightPanelTab === 'generate'} onClick={() => setRightPanelTab('generate')} label="AI Studio" icon={Sparkles} />
              <PanelTab active={rightPanelTab === 'chat'} onClick={() => setRightPanelTab('chat')} label="Chat" icon={MessageSquare} />
              <PanelTab active={rightPanelTab === 'review'} onClick={() => setRightPanelTab('review')} label="Vault" icon={Layers} />
              <PanelTab active={rightPanelTab === 'settings'} onClick={() => setRightPanelTab('settings')} label="Key" icon={KeyRound} />
            </div>
            <div className="flex-1 overflow-y-auto custom-scrollbar relative">
              {rightPanelTab === 'settings' ? (
                <PanelSettings settings={userSettings} setSettings={setUserSettings} />
              ) : !userSettings.apiKey?.trim() ? (
                <div className="p-8 text-center mt-20">
                  <div className="w-24 h-24 bg-red-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
                    <AlertCircle className="w-12 h-12 text-red-500" />
                  </div>
                  <h2 className="text-2xl font-bold text-gray-800 dark:text-white mb-3">OpenAI Key Required</h2>
                  <p className="text-sm text-gray-500 dark:text-zinc-400 mb-8 leading-relaxed">You must connect your OpenAI API key to unlock the elite AI extraction and generation tools.</p>
                  <button onClick={() => setRightPanelTab('settings')} className="px-8 py-4 bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/90 transition-colors text-white rounded-xl text-sm font-bold shadow-lg shadow-[var(--accent-color)]/25">Connect API Key</button>
                </div>
              ) : rightPanelTab === 'generate' ? (
                <PanelGenerate activeDoc={activeDoc} settings={userSettings} setFlashcards={setFlashcards} setExams={setExams} setNotes={setNotes} switchToReview={() => setRightPanelTab('review')} genFromSelection={genFromSelection} setGenFromSelection={setGenFromSelection} currentPage={docPages[activeDocId] || 1} />
              ) : rightPanelTab === 'chat' ? (
                <PanelChat activeDoc={activeDoc} settings={userSettings} currentPage={docPages[activeDocId] || 1} />
              ) : rightPanelTab === 'review' ? (
                <PanelReview activeDocId={activeDocId} flashcards={flashcards} setFlashcards={setFlashcards} exams={exams} setExams={setExams} notes={notes} setNotes={setNotes} />
              ) : null}
            </div>
          </aside>
        )}

        {showShortcuts && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 backdrop-blur-sm" onClick={() => setShowShortcuts(false)}>
            <div className="bg-white dark:bg-zinc-900 p-10 rounded-3xl max-w-md w-full shadow-2xl m-4" onClick={e=>e.stopPropagation()}>
              <h2 className="text-2xl font-bold mb-6 flex items-center gap-3 text-gray-800 dark:text-white"><HelpCircle className="text-[var(--accent-color)]"/> Keyboard Shortcuts</h2>
              <ul className="space-y-4 text-sm text-gray-600 dark:text-zinc-300">
                <li className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-2"><span>Arrow Left / Right</span><kbd className="bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded font-mono text-xs font-bold">Change Page</kbd></li>
                <li className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-2"><span>Show Help</span><kbd className="bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded font-mono text-xs font-bold">?</kbd></li>
                <li className="flex justify-between items-center border-b border-gray-100 dark:border-zinc-800 pb-2"><span>Close Modal</span><kbd className="bg-gray-100 dark:bg-zinc-800 px-2 py-1 rounded font-mono text-xs font-bold">Esc</kbd></li>
              </ul>
              <button onClick={() => setShowShortcuts(false)} className="mt-8 w-full py-4 bg-[var(--accent-color)] text-white font-bold tracking-widest uppercase text-xs rounded-xl shadow-lg">Dismiss</button>
            </div>
          </div>
        )}
        {showMenu && (
          <div className="fixed inset-0 z-50" onClick={() => setShowMenu(false)}>
            <div className="absolute bg-white/95 dark:bg-zinc-900/95 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 rounded-xl shadow-2xl p-2 min-w-[200px]" style={{left: menuPos.x, top: menuPos.y}}>
              <button onClick={() => { setShowMenu(false); setGenFromSelection(selectedText); setRightPanelOpen(true); setRightPanelTab('generate'); }} className="flex items-center gap-3 px-4 py-3 hover:bg-gray-100 dark:hover:bg-zinc-800 rounded-lg w-full text-left text-sm font-bold text-[var(--accent-color)] transition-colors">
                <Sparkles size={18} /> Generate from Text
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}

function SidebarBtn({ icon: Icon, label, active, onClick, highlight, className = '' }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center gap-1 transition-all group w-16 md:w-full ${className}`}
    >
      <div className={`w-10 h-10 md:w-14 md:h-14 rounded-xl md:rounded-[1.25rem] flex items-center justify-center transition-all ${
        active
          ? highlight ? 'bg-[var(--accent-color)] text-white shadow-xl shadow-[var(--accent-color)]/40 scale-105' : 'bg-gray-200 dark:bg-zinc-800 text-gray-800 dark:text-white shadow-lg md:scale-105'
          : 'bg-transparent text-gray-500 dark:text-zinc-500 hover:bg-gray-200 dark:hover:bg-zinc-800/80 hover:text-gray-800 dark:hover:text-zinc-200'
      }`}>
        <Icon size={20} className="md:w-6 md:h-6" />
      </div>
      <span className={`text-[8px] md:text-[9px] font-bold uppercase tracking-widest transition-all text-center leading-none ${active ? (highlight ? 'text-[var(--accent-color)]' : 'text-gray-800 dark:text-white') : 'text-gray-400 dark:text-zinc-600 group-hover:text-gray-600 dark:group-hover:text-zinc-400'}`}>
        {label}
      </span>
    </button>
  );
}

function PanelTab({ active, onClick, label, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex flex-col items-center justify-center gap-1.5 h-full rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-all ${
        active ? 'bg-white dark:bg-zinc-800/90 text-[var(--accent-color)] shadow-sm border border-gray-200 dark:border-zinc-700' : 'text-gray-500 dark:text-zinc-500 hover:text-gray-800 dark:hover:text-zinc-300 hover:bg-gray-100/50 dark:hover:bg-zinc-900/50'
      }`}
    >
      <Icon size={16} /> {label}
    </button>
  );
}

function LibraryView({ documents, onUpload, onOpen, isUploading, deleteDocument, flashcards, exams, notes, setView, searchQuery, setSearchQuery }) {
  const totalCardsCount = flashcards.reduce((sum, set) => sum + (set.cards ? set.cards.length : 0), 0);

  return (
    <div className="flex-1 overflow-auto p-6 md:p-10 lg:p-16 custom-scrollbar bg-transparent pb-24 md:pb-16">
      <div className="max-w-7xl mx-auto w-full">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end mb-10 md:mb-16 gap-8">
          <div>
            <h1 className="text-3xl md:text-5xl font-black text-gray-800 dark:text-white tracking-tighter mb-4 flex items-center gap-3 md:gap-4">
              Intelligence <span className="text-transparent bg-clip-text bg-gradient-to-r from-[var(--accent-color)] to-purple-500">Nexus</span>
            </h1>
            <p className="text-gray-500 dark:text-zinc-400 text-sm md:text-lg max-w-2xl leading-relaxed">Your secure, local medical knowledge base. Upload materials and let the elite AI extract exams, notes, and cards seamlessly.</p>
          </div>
          <label className={`cursor-pointer w-full lg:w-auto justify-center bg-white dark:bg-zinc-100 text-zinc-950 hover:bg-gray-100 dark:hover:bg-zinc-200 px-6 md:px-8 py-4 md:py-5 rounded-2xl font-black text-xs md:text-sm uppercase tracking-widest flex items-center gap-3 md:gap-4 transition-all shadow-xl hover:shadow-2xl hover:-translate-y-1 ${isUploading ? 'opacity-50 pointer-events-none' : ''}`}>
            {isUploading ? <Loader2 className="animate-spin" size={24} /> : <Upload size={24} />}
            {isUploading ? "PROCESSING SECURE PDF..." : "IMPORT LOCAL PDF"}
            <input type="file" accept="application/pdf" className="hidden" onChange={onUpload} disabled={isUploading} />
          </label>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-10 md:mb-16">
          <div onClick={() => setView('notes')} className="cursor-pointer hover:-translate-y-1 transition-all bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-gray-200 dark:border-zinc-800/60 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] flex items-center gap-4 md:gap-6 shadow-lg hover:shadow-xl">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-blue-500/10 text-blue-500 flex items-center justify-center shrink-0"><BookA size={24} className="md:w-8 md:h-8"/></div>
            <div><p className="text-2xl md:text-4xl font-black text-gray-800 dark:text-white">{notes.length}</p><p className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mt-1 md:mt-2">Generated Notes</p></div>
          </div>
          <div onClick={() => setView('flashcards')} className="cursor-pointer hover:-translate-y-1 transition-all bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-gray-200 dark:border-zinc-800/60 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] flex items-center gap-4 md:gap-6 shadow-lg hover:shadow-xl">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center shrink-0"><Layers size={24} className="md:w-8 md:h-8"/></div>
            <div><p className="text-2xl md:text-4xl font-black text-gray-800 dark:text-white">{totalCardsCount}</p><p className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mt-1 md:mt-2">Active Flashcards</p></div>
          </div>
          <div onClick={() => setView('exams')} className="cursor-pointer hover:-translate-y-1 transition-all bg-white/80 dark:bg-zinc-900/60 backdrop-blur-md border border-gray-200 dark:border-zinc-800/60 p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] flex items-center gap-4 md:gap-6 shadow-lg hover:shadow-xl">
            <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-purple-500/10 text-purple-500 flex items-center justify-center shrink-0"><GraduationCap size={24} className="md:w-8 md:h-8"/></div>
            <div><p className="text-2xl md:text-4xl font-black text-gray-800 dark:text-white">{exams.length}</p><p className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest mt-1 md:mt-2">Strict Exams</p></div>
          </div>
        </div>

        {documents.length > 0 && (
          <div className="mb-10 relative">
            <Search className="absolute left-6 top-1/2 -translate-y-1/2 text-gray-400 dark:text-zinc-500" size={20}/>
            <input type="text" value={searchQuery} onChange={e => setSearchQuery(e.target.value)} placeholder="Search inside your secure documents..." className="w-full bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl pl-16 pr-6 py-4 md:py-5 text-sm md:text-base font-bold text-gray-800 dark:text-white outline-none focus:border-[var(--accent-color)] shadow-sm transition-colors" />
          </div>
        )}

        {documents.length === 0 ? (
          <div className="border-2 border-dashed border-gray-300 dark:border-zinc-800/80 rounded-[2rem] md:rounded-[3rem] bg-white/50 dark:bg-zinc-900/20 backdrop-blur-sm p-12 md:p-32 text-center shadow-inner">
            <div className="w-24 h-24 md:w-40 md:h-40 bg-gray-100 dark:bg-zinc-900 rounded-full flex items-center justify-center mx-auto mb-6 md:mb-10 shadow-lg">
              <FileUp size={48} className="md:w-16 md:h-16 text-gray-400 dark:text-zinc-600" />
            </div>
            <h2 className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white mb-3 md:mb-4">Repository Empty</h2>
            <p className="text-gray-500 dark:text-zinc-400 text-sm md:text-lg max-w-xl mx-auto leading-relaxed">Your library is securely encrypted locally. Import a textbook, research paper, or clinical guide to begin.</p>
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
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-2xl bg-gray-100 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 flex items-center justify-center text-gray-400 dark:text-zinc-500 group-hover:bg-[var(--accent-color)] group-hover:text-white group-hover:border-[var(--accent-color)] transition-all shadow-md">
                        <BookOpen size={24} className="md:w-7 md:h-7"/>
                      </div>
                      <button onClick={(e) => deleteDocument(doc.id, e)} className="p-2 md:p-3 bg-gray-100 dark:bg-zinc-950/50 text-gray-500 dark:text-zinc-500 hover:text-red-500 hover:bg-red-500/20 rounded-xl transition-all opacity-100 md:opacity-0 group-hover:opacity-100 backdrop-blur-sm">
                        <Trash2 size={20} className="md:w-5 md:h-5"/>
                      </button>
                    </div>
                    <h3 className="font-black text-gray-800 dark:text-white text-base md:text-xl leading-snug line-clamp-2 flex-1 z-10">{doc.name}</h3>
                    <div className="mt-4 pt-4 md:pt-6 border-t border-gray-200 dark:border-zinc-800/80 z-10">
                      <div className="flex justify-between items-center mb-2 md:mb-4">
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

function FlashcardsGlobalView({ flashcards, setFlashcards, setView }) {
  const [studyingSet, setStudyingSet] = useState(null);
  
  const exportAnki = () => {
    const allCards = flashcards.flatMap(set => set.cards || []);
    if(allCards.length === 0) return;
    const csvContent = 'Front,Back\n' + allCards.map(f => `"${f.q.replace(/"/g, '""')}","${f.a.replace(/"/g, '""')}"`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = 'dr-mariam-flashcards.csv';
    link.click();
    URL.revokeObjectURL(url);
  };

  if (studyingSet) {
    return (
      <div className="flex-1 overflow-hidden h-full">
        <InPanelFlashcards title={studyingSet.title} initialCards={studyingSet.cards} onBack={() => setStudyingSet(null)} setFlashcards={setFlashcards} />
      </div>
    );
  }

  if (flashcards.length === 0) return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 bg-transparent text-center h-full">
      <Layers size={80} className="text-gray-300 dark:text-zinc-800 mb-6 md:mb-8" />
      <h2 className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white mb-2 md:mb-4">No Flashcards Created</h2>
      <p className="text-sm md:text-lg text-gray-500 dark:text-zinc-400 max-w-md">Open a document and use the AI Generator to extract high-yield flashcard sets.</p>
      <button onClick={() => setView('library')} className="mt-6 md:mt-8 px-6 md:px-8 py-3 md:py-4 bg-[var(--accent-color)] text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all">Go to Library</button>
    </div>
  );

  return (
    <div className="flex-1 overflow-auto p-6 md:p-10 lg:p-16 custom-scrollbar bg-transparent pb-24 md:pb-16">
      <div className="max-w-5xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 md:mb-12 gap-4 md:gap-6">
          <h1 className="text-3xl md:text-4xl font-black text-gray-800 dark:text-white tracking-tighter flex items-center gap-3 md:gap-4"><Layers className="text-emerald-500" size={32} md:size={40}/> Global Flashcard Vault</h1>
          <div className="flex flex-wrap gap-3 md:gap-4 w-full md:w-auto">
            <button onClick={exportAnki} className="flex-1 md:flex-none justify-center px-4 md:px-6 py-3 md:py-4 bg-blue-600 text-white rounded-xl font-bold flex items-center gap-2 md:gap-3 shadow-lg hover:-translate-y-1 transition-all uppercase tracking-widest text-[10px] md:text-xs"><Download size={16} md:size={18} /> Export Anki</button>
            <button onClick={() => setStudyingSet({ id: 'all', title: 'All Flashcards Master Set', cards: flashcards.flatMap(s => s.cards || []) })} className="flex-1 md:flex-none justify-center px-5 md:px-8 py-3 md:py-4 bg-[var(--accent-color)] text-white rounded-xl font-black flex items-center gap-2 md:gap-3 shadow-lg shadow-[var(--accent-color)]/30 hover:scale-105 transition-transform uppercase tracking-widest text-[10px] md:text-xs"><Play size={16} md:size={18} fill="currentColor" /> Study Everything</button>
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
          {flashcards.map(set => (
            <div key={set.id} className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 p-6 md:p-8 rounded-2xl md:rounded-3xl relative group shadow-lg hover:shadow-xl hover:border-[var(--accent-color)]/50 transition-all flex flex-col h-full">
              <div className="flex-1 mb-4 md:mb-0">
                <p className="text-lg md:text-2xl text-gray-800 dark:text-white font-black mb-3 md:mb-4 pr-12 leading-snug">{set.title}</p>
                <div className="flex flex-wrap items-center gap-2 md:gap-3 mb-6 md:mb-8">
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[var(--accent-color)] bg-[var(--accent-color)]/10 px-2 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg border border-[var(--accent-color)]/20">{set.cards ? set.cards.length : 0} Cards</span>
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-950 px-2 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg border border-gray-200 dark:border-zinc-800">Source: Pages {set.sourcePages}</span>
                </div>
              </div>
              <div className="flex gap-3 md:gap-4 mt-auto">
                <button onClick={() => setStudyingSet(set)} className="flex-1 py-3 md:py-4 bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/90 text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-md"><Play size={14} md:size={16} fill="currentColor" /> Study Set</button>
                <button onClick={() => setFlashcards(flashcards.filter(f => f.id !== set.id))} className="p-3 md:p-4 bg-gray-100 dark:bg-zinc-950 text-gray-600 dark:text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-xl md:rounded-2xl transition-all"><Trash2 size={18} md:size={20}/></button>
              </div>
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
        const splitTitle = pdf.splitTextToSize(`${i + 1}. ${q.q}`, 180);
        pdf.text(splitTitle, 10, y);
        y += (splitTitle.length * 6) + 4;
        q.options.forEach((opt, oi) => {
          const splitOpt = pdf.splitTextToSize(`${String.fromCharCode(65 + oi)}. ${opt}`, 170);
          pdf.text(splitOpt, 15, y);
          y += (splitOpt.length * 6) + 2;
        });
        y += 10;
        if (y > 270) {
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
      <div className="flex-1 flex flex-col bg-transparent pb-16 md:pb-0 h-full overflow-hidden">
        <div className="h-16 md:h-20 flex items-center justify-between px-6 md:px-10 bg-white/90 dark:bg-[#121214]/90 backdrop-blur-xl border-b border-gray-200 dark:border-zinc-800 shrink-0 shadow-md z-10">
          <button
            onClick={() => setSelectedExam(null)}
            className="flex items-center gap-2 md:gap-3 text-emerald-600 dark:text-emerald-400 hover:text-emerald-700 dark:hover:text-emerald-300 text-xs md:text-sm font-black uppercase tracking-widest transition-colors bg-emerald-500/10 px-4 md:px-5 py-2 md:py-3 rounded-xl border border-emerald-500/20"
          >
            <ChevronLeft size={18} md:size={20} /> <span className="hidden sm:inline">Exit Examination</span>
          </button>
          <span className="text-xs md:text-sm font-bold text-gray-800 dark:text-white uppercase tracking-widest truncate max-w-[150px] md:max-w-none">
            {selectedExam.title} <span className="hidden sm:inline mx-3 text-gray-300 dark:text-zinc-700">|</span> <span className="text-emerald-500 ml-2 sm:ml-0">{selectedExam.questions.length} Items</span>
          </span>
        </div>
        <div className="flex-1 overflow-hidden relative">
          <InPanelExam
            exam={selectedExam}
            onBack={() => setSelectedExam(null)}
          />
        </div>
      </div>
    );
  }
  if (exams.length === 0) return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 bg-transparent text-center h-full">
      <GraduationCap size={64} md:size={80} className="text-gray-300 dark:text-zinc-800 mb-4 md:mb-8" />
      <h2 className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white mb-2 md:mb-4">No Exams Generated</h2>
      <p className="text-sm md:text-lg text-gray-500 dark:text-zinc-400 max-w-md">Open a document and use the AI to generate a strict, board-level test on specific pages.</p>
      <button onClick={() => setView('library')} className="mt-6 md:mt-8 px-6 md:px-8 py-3 md:py-4 bg-[var(--accent-color)] text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all">Go to Library</button>
    </div>
  );
  return (
    <div className="flex-1 overflow-auto p-6 md:p-10 lg:p-16 custom-scrollbar bg-transparent pb-24 md:pb-16">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-gray-800 dark:text-white tracking-tighter mb-8 md:mb-12 flex items-center gap-3 md:gap-4"><GraduationCap className="text-emerald-500" size={32} md:size={40}/> Global Examination Vault</h1>
        <div className="space-y-4 md:space-y-6">
          {exams.map(e => (
            <div key={e.id} className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 p-6 md:p-8 rounded-2xl md:rounded-[2rem] flex flex-col sm:flex-row justify-between sm:items-center group hover:border-emerald-500/50 transition-all shadow-lg hover:shadow-xl gap-4 md:gap-6">
              <div className="flex-1 w-full">
                <p className="text-lg md:text-2xl text-gray-800 dark:text-white font-black mb-2 md:mb-3">{e.title}</p>
                <div className="flex flex-wrap items-center gap-2 md:gap-3">
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg border border-emerald-500/20">{e.questions.length} Questions</span>
                  <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-950 px-2 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg border border-gray-200 dark:border-zinc-800">Source: Pgs {e.sourcePages}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2 md:gap-3 w-full sm:w-auto">
                <button onClick={() => exportExamPdf(e)} className="flex-1 sm:flex-none px-4 md:px-5 py-3 md:py-4 bg-blue-600 hover:bg-blue-500 text-white rounded-xl md:rounded-2xl font-bold text-[10px] md:text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-md"><Printer size={16} md:size={18} /> <span className="sm:hidden lg:inline">Export PDF</span></button>
                <button onClick={() => setSelectedExam(e)} className="flex-1 sm:flex-none px-5 md:px-8 py-3 md:py-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 hover:scale-105"><Play size={16} md:size={18} fill="currentColor"/> Take Exam</button>
                <button onClick={() => setExams(exams.filter(ex => ex.id !== e.id))} className="p-3 md:p-4 bg-gray-100 dark:bg-zinc-950 text-gray-500 dark:text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl md:rounded-2xl transition-all shadow-sm"><Trash2 size={18} md:size={20}/></button>
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
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-10 bg-transparent text-center h-full">
      <BookA size={64} md:size={80} className="text-gray-300 dark:text-zinc-800 mb-4 md:mb-8" />
      <h2 className="text-2xl md:text-3xl font-black text-gray-800 dark:text-white mb-2 md:mb-4">No Notes Found</h2>
      <p className="text-sm md:text-lg text-gray-500 dark:text-zinc-400 max-w-md">Open a document and use the AI to generate clinical cases, mnemonics, or summaries.</p>
      <button onClick={() => setView('library')} className="mt-6 md:mt-8 px-6 md:px-8 py-3 md:py-4 bg-[var(--accent-color)] text-white rounded-xl md:rounded-2xl font-black uppercase tracking-widest shadow-xl hover:-translate-y-1 transition-all">Go to Library</button>
    </div>
  );
  return (
    <div className="flex-1 overflow-auto p-6 md:p-10 lg:p-16 custom-scrollbar bg-transparent pb-24 md:pb-16">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-gray-800 dark:text-white tracking-tighter mb-8 md:mb-12 flex items-center gap-3 md:gap-4"><BookA className="text-blue-500" size={32} md:size={40}/> Global Clinical Notes</h1>
        <div className="space-y-6 md:space-y-8">
          {notes.map(n => (
            <div key={n.id} className="bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 p-6 md:p-10 rounded-2xl md:rounded-[2.5rem] relative group hover:border-blue-500/50 transition-all shadow-md md:shadow-xl">
              <h3 className="text-xl md:text-2xl text-gray-800 dark:text-white font-black mb-4 md:mb-6 pr-12 md:pr-16">{n.title}</h3>
              <div className="text-sm md:text-base text-gray-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed prose prose-sm md:prose-invert max-w-none prose-headings:text-gray-900 dark:prose-headings:text-white prose-strong:text-[var(--accent-color)]">{n.content}</div>
              <button onClick={() => setNotes(notes.filter(no => no.id !== n.id))} className="absolute top-6 right-6 md:top-10 md:right-10 p-2 md:p-3 bg-gray-100 dark:bg-zinc-950 text-gray-500 dark:text-zinc-600 hover:text-red-500 hover:bg-red-500/10 rounded-xl opacity-100 md:opacity-0 group-hover:opacity-100 transition-all shadow-sm md:shadow-md"><Trash2 size={18} md:size={20}/></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function DashboardView({ documents, flashcards, exams, notes }) {
  const totalCardsCount = flashcards.reduce((sum, set) => sum + (set.cards ? set.cards.length : 0), 0);

  return (
    <div className="flex-1 overflow-auto p-6 md:p-10 lg:p-16 custom-scrollbar bg-transparent pb-24 md:pb-16">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl md:text-4xl font-black text-gray-800 dark:text-white tracking-tighter mb-6 md:mb-8 flex items-center gap-3 md:gap-4"><LayoutDashboard className="text-[var(--accent-color)]" size={32} md:size={32}/> Progress Dashboard</h1>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 md:gap-6 mb-10 md:mb-16">
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-gray-200 dark:border-zinc-800 p-5 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm">
            <p className="text-3xl md:text-4xl font-black text-[var(--accent-color)] mb-1 md:mb-2">{totalCardsCount}</p>
            <p className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest">Flashcards Created</p>
          </div>
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-gray-200 dark:border-zinc-800 p-5 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm">
            <p className="text-3xl md:text-4xl font-black text-purple-500 mb-1 md:mb-2">{exams.length}</p>
            <p className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest">Exams Generated</p>
          </div>
          <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-gray-200 dark:border-zinc-800 p-5 md:p-8 rounded-2xl md:rounded-[2rem] shadow-sm">
            <p className="text-3xl md:text-4xl font-black text-blue-500 mb-1 md:mb-2">{notes.length}</p>
            <p className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-zinc-400 uppercase tracking-widest">Notes Saved</p>
          </div>
        </div>
        <h3 className="text-base md:text-xl font-bold text-gray-800 dark:text-white mb-4 md:mb-6">Document Progress</h3>
        <div className="space-y-3 md:space-y-4">
          {documents.map(doc => (
            <div key={doc.id} className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-md border border-gray-200 dark:border-zinc-800 p-4 md:p-6 rounded-xl md:rounded-[1.5rem] shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-3 md:gap-4">
              <p className="text-xs md:text-sm font-bold text-gray-800 dark:text-white flex-1 truncate">{doc.name}</p>
              <div className="flex-1 w-full">
                <div className="h-1.5 md:h-2 bg-gray-200 dark:bg-zinc-800 rounded-full overflow-hidden w-full">
                  <div className="h-full bg-[var(--accent-color)] transition-all duration-300" style={{width: `${(doc.progress / doc.totalPages * 100)}%`}} />
                </div>
              </div>
              <p className="text-[10px] md:text-xs text-gray-500 dark:text-zinc-400 font-mono sm:w-24 sm:text-right">{doc.progress} / {doc.totalPages} PGs</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function PdfWorkspace({ activeDoc, setDocuments, closeDoc, rightPanelOpen, setRightPanelOpen, currentPage, setCurrentPage, openDocs, setActiveDocId, closeTab, setShowMenu, setMenuPos, setSelectedText, setGenFromSelection, setRightPanelTab }) {
  const [pdf, setPdf] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const textLayerRef = useRef(null);
  
  const [localPage, setLocalPage] = useState(currentPage);

  useEffect(() => { setLocalPage(currentPage); }, [currentPage]);

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
      } catch (e) {
        console.error("Failed to load PDF from DB", e);
      } finally {
        if (isMounted) setIsLoading(false);
      }
    };
    loadPdf();
    return () => { isMounted = false; };
  }, [activeDoc.id]);

  useEffect(() => {
    if (!pdf) return;
    let renderTask = null;
    let isMounted = true;

    const renderPage = async () => {
      try {
        const page = await pdf.getPage(localPage);
        const container = containerRef.current;
        if (!container || !isMounted) return;
        
        const containerWidth = container.clientWidth;
        if (!containerWidth) return;

        const padding = window.innerWidth < 768 ? 16 : 40; 
        const tempViewport = page.getViewport({ scale: 1 });
        const scale = (containerWidth - padding) / tempViewport.width;
        const finalScale = Math.min(Math.max(scale, 0.5), 3.0); 
        const viewport = page.getViewport({ scale: finalScale });
        
        const canvas = canvasRef.current;
        if (canvas) {
          canvas.height = viewport.height;
          canvas.width = viewport.width;
          canvas.style.width = `${viewport.width}px`;
          canvas.style.height = `${viewport.height}px`;

          const renderContext = { canvasContext: canvas.getContext('2d'), viewport };
          renderTask = page.render(renderContext);
          await renderTask.promise;
        }

        const textLayer = textLayerRef.current;
        if (textLayer && isMounted) {
          textLayer.innerHTML = '';
          textLayer.style.width = `${viewport.width}px`;
          textLayer.style.height = `${viewport.height}px`;
          textLayer.style.setProperty('--scale-factor', viewport.scale);
          const textContent = await page.getTextContent();
          window.pdfjsLib.renderTextLayer({
            textContentSource: textContent,
            container: textLayer,
            viewport,
            textDivs: []
          });
        }
      } catch (e) {
        if (e.name !== 'RenderingCancelledException') {
          console.error("Failed to render page", e);
        }
      }
    };

    renderPage();
    return () => { 
      isMounted = false; 
      if (renderTask) renderTask.cancel(); 
    };
  }, [localPage, pdf, rightPanelOpen]);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'ArrowLeft') {
        handleNav(-1);
      } else if (e.key === 'ArrowRight') {
        handleNav(1);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [activeDoc.totalPages, localPage]);

  const handleNav = (dir) => {
    const next = Math.max(1, Math.min(activeDoc.totalPages, localPage + dir));
    if (next !== localPage) {
      setLocalPage(next);
      setCurrentPage(next); 
      setDocuments(prev => prev.map(doc => doc.id === activeDoc.id ? { ...doc, progress: next } : doc));
      if (containerRef.current) {
        containerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  };

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
      <div className="h-14 md:h-16 flex items-center justify-between px-4 md:px-6 bg-white/95 dark:bg-[#0a0a0c]/95 backdrop-blur-xl border-b border-gray-200 dark:border-zinc-800/30 shrink-0 shadow-sm z-10">
        <div className="flex items-center gap-2 md:gap-4 overflow-hidden">
          <button onClick={closeDoc} className="flex items-center gap-1 md:gap-2 text-gray-500 dark:text-zinc-500 hover:text-gray-900 dark:hover:text-white transition-colors text-[10px] md:text-xs font-black uppercase tracking-widest bg-gray-100 dark:bg-zinc-900 px-3 py-1.5 md:px-4 md:py-2 rounded-xl">
            <ChevronLeft size={16} /> <span className="hidden sm:inline">Exit</span>
          </button>
          <div className="w-px h-6 bg-gray-300 dark:bg-zinc-800"></div>
          <span className="text-xs md:text-sm font-bold text-gray-800 dark:text-zinc-200 truncate max-w-[150px] md:max-w-md" title={activeDoc.name}>{activeDoc.name}</span>
        </div>
        <div className="flex items-center gap-3 md:gap-4">
          <button onClick={() => setRightPanelOpen(!rightPanelOpen)} className={`p-2 md:p-2.5 rounded-xl border transition-all shadow-sm ${rightPanelOpen ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white' : 'bg-gray-100 dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-400 hover:text-gray-900 dark:hover:text-white'}`}>
            {rightPanelOpen ? <PanelRightClose size={18} className="md:w-5 md:h-5" /> : <PanelRightOpen size={18} className="md:w-5 md:h-5" />}
          </button>
        </div>
      </div>

      {openDocs.length > 1 && (
        <div className="flex gap-2 px-4 md:px-6 py-2 bg-white/95 dark:bg-[#0a0a0c]/95 backdrop-blur-xl border-b border-gray-200 dark:border-zinc-800/30 overflow-x-auto custom-scrollbar">
          {openDocs.map(id => {
            const doc = documents.find(d => d.id === id);
            if (!doc) return null;
            return (
              <div key={id} className={`flex items-center gap-2 md:gap-3 px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl cursor-pointer transition-all font-bold text-[9px] md:text-xs uppercase tracking-widest ${activeDocId === id ? 'bg-[var(--accent-color)] text-white shadow-md' : 'bg-gray-100 dark:bg-zinc-900 text-gray-500 dark:text-zinc-500 hover:bg-gray-200 dark:hover:bg-zinc-800'}`} onClick={() => setActiveDocId(id)}>
                <span className="truncate max-w-[80px] md:max-w-[150px]">{doc.name}</span>
                <button onClick={(e) => { e.stopPropagation(); closeTab(id); }} className={`p-1 rounded-md transition-colors ${activeDocId === id ? 'hover:bg-white/20' : 'hover:bg-gray-300 dark:hover:bg-zinc-700 hover:text-red-500'}`}><X size={12} /></button>
              </div>
            );
          })}
        </div>
      )}

      <div ref={containerRef} className="flex-1 overflow-y-auto overflow-x-hidden bg-gray-200 dark:bg-[#121214] flex flex-col relative shadow-[inset_0_0_50px_rgba(0,0,0,0.05)] dark:shadow-[inset_0_0_80px_rgba(0,0,0,0.8)] p-2 md:p-5 custom-scrollbar items-center justify-start pb-32 md:pb-24">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center h-full gap-4 md:gap-6 text-gray-500 dark:text-zinc-500">
            <Loader2 className="animate-spin text-[var(--accent-color)]" size={32} />
            <span className="text-[10px] md:text-xs font-black tracking-[0.2em] uppercase">Rendering Viewer...</span>
          </div>
        ) : pdf ? (
          <div className="relative shadow-xl dark:shadow-[0_20px_60px_rgba(0,0,0,0.8)] bg-white mx-auto transition-all duration-300 rounded-md overflow-hidden mb-20" style={{ width: canvasRef.current?.width ? `${canvasRef.current.width}px` : 'auto', height: canvasRef.current?.height ? `${canvasRef.current.height}px` : 'auto' }}>
            <canvas ref={canvasRef} className="block w-full h-auto" />
            <div ref={textLayerRef} className="absolute top-0 left-0 right-0 bottom-0 select-text text-transparent overflow-hidden" style={{color: 'transparent'}} />
          </div>
        ) : (
          <div className="m-auto text-red-500 text-xs md:text-sm flex items-center gap-2 bg-red-50 dark:bg-red-500/10 p-4 md:p-6 rounded-2xl border border-red-200 dark:border-red-500/20 font-bold shadow-sm">
            <AlertCircle size={16} /> Failed to load PDF layer.
          </div>
        )}
      </div>

      <div className="absolute bottom-6 md:bottom-8 left-1/2 -translate-x-1/2 flex items-center gap-2 md:gap-4 bg-white/90 dark:bg-zinc-900/90 backdrop-blur-xl border border-gray-200 dark:border-zinc-700 p-1.5 md:p-2 rounded-full shadow-2xl z-30">
        <button onClick={() => handleNav(-1)} className="p-3 md:p-4 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-800 dark:text-white rounded-full transition-colors active:scale-95"><ChevronLeft size={20} className="md:w-6 md:h-6"/></button>
        <span className="px-4 md:px-6 font-bold text-gray-800 dark:text-white font-mono tracking-widest text-xs md:text-sm whitespace-nowrap">PG <span className="text-[var(--accent-color)]">{localPage}</span> / {activeDoc.totalPages}</span>
        <button onClick={() => handleNav(1)} className="p-3 md:p-4 bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/90 text-white rounded-full transition-colors active:scale-95 shadow-md shadow-[var(--accent-color)]/30"><ChevronRight size={20} className="md:w-6 md:h-6"/></button>
      </div>
    </div>
  );
}

function PanelSettings({ settings, setSettings }) {
  return (
    <div className="flex flex-col gap-6 md:gap-8 w-full max-w-2xl mx-auto pb-10">
      <div className="bg-[var(--accent-color)]/5 dark:bg-[var(--accent-color)]/10 border border-[var(--accent-color)]/20 dark:border-[var(--accent-color)]/30 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-lg">
        <h3 className="text-base md:text-lg font-black text-[var(--accent-color)] flex items-center gap-2 md:gap-3 mb-3 md:mb-4"><KeyRound size={20} className="md:w-6 md:h-6"/> OpenAI API Key</h3>
        <p className="text-xs md:text-sm text-gray-600 dark:text-zinc-400 leading-relaxed mb-4 md:mb-6">Enter your OpenAI key (sk-...) to power the AI extraction engine. Keys are saved securely in your browser's local storage and never sent to our servers.</p>
        <input
          type="password"
          value={settings.apiKey}
          onChange={(e) => setSettings({...settings, apiKey: e.target.value})}
          placeholder="sk-proj-..."
          className="w-full bg-white dark:bg-[#050505] border border-gray-200 dark:border-[var(--accent-color)]/50 rounded-xl md:rounded-2xl px-4 md:px-6 py-3 md:py-4 text-sm md:text-base text-gray-800 dark:text-white focus:outline-none focus:ring-2 focus:ring-[var(--accent-color)] font-mono shadow-inner mb-4 transition-all"
        />
        <a href="https://platform.openai.com/api-keys" target="_blank" rel="noreferrer" className="text-[10px] md:text-xs text-[var(--accent-color)] font-bold uppercase tracking-widest hover:text-[var(--accent-color)]/80 transition-colors flex items-center gap-1">Get API Key <ChevronRight size={12} className="md:w-3.5 md:h-3.5"/></a>
      </div>
      
      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm">
        <label className="flex items-start gap-4 md:gap-5 cursor-pointer">
          <div className="mt-1 relative flex items-center justify-center">
            <input type="checkbox" checked={settings.strictMode} onChange={(e) => setSettings({...settings, strictMode: e.target.checked})} className="peer appearance-none w-5 h-5 md:w-6 md:h-6 border-2 border-gray-300 dark:border-zinc-600 rounded-md bg-gray-50 dark:bg-zinc-950 checked:bg-[var(--accent-color)] checked:border-[var(--accent-color)] transition-all" />
            <CheckSquare size={14} className="text-white absolute pointer-events-none opacity-0 peer-checked:opacity-100 md:w-4 md:h-4" />
          </div>
          <div>
            <span className="text-sm md:text-lg font-bold text-gray-800 dark:text-white block">Strict Document Grounding</span>
            <span className="text-xs md:text-sm text-gray-500 dark:text-zinc-400 mt-1 md:mt-2 block leading-relaxed">Forces the AI to exclusively use the text found in the active PDF pages. Essential for medical study to guarantee zero hallucinations.</span>
          </div>
        </label>
      </div>

      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm">
        <h3 className="text-sm md:text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 md:gap-3 mb-4 md:mb-6"><Moon size={20} className="text-gray-400 dark:text-zinc-500 md:w-6 md:h-6"/> Interface Theme</h3>
        <div className="flex gap-2 md:gap-4">
          <button onClick={() => setSettings({...settings, theme: 'system'})} className={`flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold uppercase tracking-widest text-[10px] md:text-xs transition-all ${settings.theme === 'system' ? 'bg-[var(--accent-color)] text-white shadow-md' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'}`}>System</button>
          <button onClick={() => setSettings({...settings, theme: 'dark'})} className={`flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold uppercase tracking-widest text-[10px] md:text-xs transition-all ${settings.theme === 'dark' ? 'bg-[var(--accent-color)] text-white shadow-md' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'}`}>Dark</button>
          <button onClick={() => setSettings({...settings, theme: 'light'})} className={`flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold uppercase tracking-widest text-[10px] md:text-xs transition-all ${settings.theme === 'light' ? 'bg-[var(--accent-color)] text-white shadow-md' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'}`}>Light</button>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm">
        <h3 className="text-sm md:text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 md:gap-3 mb-4 md:mb-6"><Type size={20} className="text-gray-400 dark:text-zinc-500 md:w-6 md:h-6"/> Typography Scale</h3>
        <div className="flex gap-2 md:gap-4">
          <button onClick={() => setSettings({...settings, fontSize: 'small'})} className={`flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold uppercase tracking-widest text-[10px] md:text-xs transition-all ${settings.fontSize === 'small' ? 'bg-[var(--accent-color)] text-white shadow-md' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'}`}>Small</button>
          <button onClick={() => setSettings({...settings, fontSize: 'medium'})} className={`flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold uppercase tracking-widest text-[10px] md:text-xs transition-all ${settings.fontSize === 'medium' ? 'bg-[var(--accent-color)] text-white shadow-md' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'}`}>Medium</button>
          <button onClick={() => setSettings({...settings, fontSize: 'large'})} className={`flex-1 py-3 md:py-4 rounded-xl md:rounded-2xl font-bold uppercase tracking-widest text-[10px] md:text-xs transition-all ${settings.fontSize === 'large' ? 'bg-[var(--accent-color)] text-white shadow-md' : 'bg-gray-100 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-200 dark:hover:bg-zinc-700'}`}>Large</button>
        </div>
      </div>

      <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm">
        <h3 className="text-sm md:text-lg font-bold text-gray-800 dark:text-white flex items-center gap-2 md:gap-3 mb-4 md:mb-6"><Palette size={20} className="text-gray-400 dark:text-zinc-500 md:w-6 md:h-6"/> Brand Accent</h3>
        <div className="flex gap-6 md:gap-8 items-center justify-center md:justify-start">
          <button onClick={() => setSettings({...settings, accentColor: 'indigo'})} className={`w-12 h-12 md:w-16 md:h-16 rounded-full bg-indigo-500 hover:scale-110 transition-transform ${settings.accentColor === 'indigo' ? 'ring-4 ring-offset-4 ring-indigo-500 dark:ring-offset-zinc-900 shadow-xl' : ''}`} />
          <button onClick={() => setSettings({...settings, accentColor: 'purple'})} className={`w-12 h-12 md:w-16 md:h-16 rounded-full bg-purple-500 hover:scale-110 transition-transform ${settings.accentColor === 'purple' ? 'ring-4 ring-offset-4 ring-purple-500 dark:ring-offset-zinc-900 shadow-xl' : ''}`} />
          <button onClick={() => setSettings({...settings, accentColor: 'blue'})} className={`w-12 h-12 md:w-16 md:h-16 rounded-full bg-blue-500 hover:scale-110 transition-transform ${settings.accentColor === 'blue' ? 'ring-4 ring-offset-4 ring-blue-500 dark:ring-offset-zinc-900 shadow-xl' : ''}`} />
        </div>
      </div>
    </div>
  );
}

function PanelGenerate({ activeDoc, settings, setFlashcards, setExams, setNotes, switchToReview, genFromSelection, setGenFromSelection, currentPage }) {
  const [startPage, setStartPage] = useState(currentPage);
  const [endPage, setEndPage] = useState(currentPage);
  const [type, setType] = useState('exam');
  const [count, setCount] = useState(10);
  const [difficulty, setDifficulty] = useState(3);
  const [status, setStatus] = useState({ loading: false, msg: '', err: false });
  const [generated, setGenerated] = useState(null);
  
  useEffect(() => {
    if (!status.loading && !generated && !genFromSelection) {
      setStartPage(currentPage);
      setEndPage(currentPage);
    }
  }, [currentPage, status.loading, generated, genFromSelection]);

  const difficultyLevels = ['Hard', 'Expert', 'Insane'];

  const handleGenerate = async () => {
    setStatus({ loading: true, msg: 'Indexing medical context...', err: false });
    setGenerated(null);
    try {
      let text = genFromSelection || "";
      if (!genFromSelection) {
        const pdfData = await getPdfData(activeDoc.id);
        const pagesText = pdfData?.pagesText || activeDoc.pagesText || {};
        for (let i = Number(startPage); i <= Number(endPage); i++) {
          if (pagesText[i]) text += `[Page ${i}]\n${pagesText[i]}\n\n`;
        }
      }
      
      if (!text.trim() || text.length < 20) throw new Error("Not enough readable text found on these pages. Ensure the PDF contains actual text, not just scanned images.");
      
      setStatus({ loading: true, msg: 'Ultra-Fast processing via AI...', err: false });
      
      const diffPrompt = `Difficulty Level: ${difficultyLevels[difficulty - 1]}. Make the output incredibly advanced, detailed, extremely long, and at a professional medical specialty level. Questions/Vignettes MUST be massive and multi-step.`;
      
      const chunkSize = 15000; 
      const textChunks = [];
      for (let i = 0; i < text.length; i += chunkSize) {
        textChunks.push(text.slice(i, i + chunkSize));
      }

      let resultData = null;

      if (type === 'flashcards' || type === 'exam' || type === 'quiz') {
        const itemsPerChunk = Math.ceil(count / textChunks.length);
        
        const promises = textChunks.map(async (chunk) => {
          let p = `${diffPrompt}\nCreate exactly ${itemsPerChunk} highly accurate items from this text ONLY.\n\nTEXT:\n${chunk}`;
          if (type === 'flashcards') {
            p += `\n\nFormat as JSON strictly like this: { "items": [ {"q": "Clear Question", "a": "Precise Answer"} ] }`;
          } else {
            p += `\n\nFormat as JSON strictly like this: { "title": "Generated Exam", "items": [ { "q": "Question", "options": ["A","B","C","D","E"], "correct": 0, "explanation": "Detailed explanation" } ] }`;
          }
          
          try {
            const raw = await callAI(p, true, settings.strictMode, settings.apiKey, 4000);
            let cleaned = raw.replace(/```json/gi, '').replace(/```/g, '').trim();
            const firstBrace = cleaned.indexOf('{');
            const lastBrace = cleaned.lastIndexOf('}');
            if (firstBrace !== -1 && lastBrace !== -1) {
               cleaned = cleaned.substring(firstBrace, lastBrace + 1);
            }
            if (!cleaned.endsWith('}')) {
               if (cleaned.includes('"items": [')) cleaned += ']}';
               else cleaned += '}';
            }
            const parsed = JSON.parse(cleaned);
            return parsed.items || parsed.questions || parsed.data || [];
          } catch (e) {
            console.error("Chunk parsing failed safely, recovering...", e);
            return [];
          }
        });

        const allResults = await Promise.allSettled(promises);
        let combinedItems = [];
        allResults.forEach(res => {
          if (res.status === 'fulfilled' && Array.isArray(res.value)) {
            combinedItems.push(...res.value);
          }
        });
        
        combinedItems = combinedItems.slice(0, count);
        if (combinedItems.length === 0) throw new Error("AI failed to extract any valid items from this text. The text might be irrelevant or too short.");

        resultData = { type: type === 'quiz' ? 'exam' : type, title: "Generated Assessment", data: combinedItems, pages: genFromSelection ? 'Selection' : `${startPage}-${endPage}` };
      } else {
        const p = `${diffPrompt}\nPerform the following task based ONLY on the medical concepts in this text.\nTASK: ${type}\nRespond in Markdown.\n\nTEXT:\n${text}`;
        const raw = await callAI(p, false, settings.strictMode, settings.apiKey, 4000);
        
        let customTitle = type.charAt(0).toUpperCase() + type.slice(1);
        if (type === 'clinical') customTitle = 'Clinical Case';
        if (type === 'differential') customTitle = 'Differential Diagnosis';
        if (type === 'treatment') customTitle = 'Treatment Plan';
        if (type === 'labs') customTitle = 'Lab Interpretation';
        if (type === 'eli5') customTitle = 'Simplified Explanation';

        resultData = { type: 'summary', data: raw, pages: genFromSelection ? 'Selection' : `${startPage}-${endPage}`, customTitle };
      }

      setGenerated(resultData);
      setStatus({ loading: false, msg: 'Generation Complete.', err: false });
    } catch (e) {
      console.error(e);
      setStatus({ loading: false, msg: e.message || "Generation Failed.", err: true });
    } finally {
      setGenFromSelection('');
    }
  };

  const saveItem = () => {
    if (!generated) return;
    if (generated.type === 'flashcards') {
      const cards = generated.data.map(c => ({ id: Date.now()+Math.random(), q: c.q, a: c.a, level: 0, nextReview: Date.now(), repetitions: 0, ef: 2.5, interval: 1, lastReview: Date.now() }));
      const newSet = { id: Date.now().toString(), docId: activeDoc.id, sourcePages: generated.pages, title: `Flashcards (Pgs ${generated.pages})`, cards: cards, createdAt: new Date().toISOString() };
      setFlashcards(p => [...p, newSet]);
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
    <div className="h-full flex flex-col p-4 md:p-6 overflow-y-auto custom-scrollbar pb-24 md:pb-6">
      {!generated ? (
        <div className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-200 dark:border-zinc-800/50 p-5 md:p-8 rounded-[1.5rem] md:rounded-[2rem] flex-shrink-0 shadow-lg dark:shadow-black/50">
          {!genFromSelection && (
            <div className="flex items-center justify-between mb-6 md:mb-8 gap-3 md:gap-4">
              <div className="w-full relative">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500 mb-2 block ml-1">Start Pg</label>
                <input type="number" min={1} max={activeDoc.totalPages} value={startPage} onChange={e=>setStartPage(Number(e.target.value))} className="w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-xl md:rounded-2xl px-3 md:px-5 py-3 md:py-4 text-sm md:text-lg text-center text-gray-800 dark:text-white font-mono font-bold outline-none focus:border-[var(--accent-color)] focus:ring-2 focus:ring-[var(--accent-color)]/50 transition-all shadow-inner" />
              </div>
              <div className="mt-5 md:mt-6 text-gray-400 dark:text-zinc-600 font-bold text-[10px] md:text-xs uppercase tracking-widest">TO</div>
              <div className="w-full relative">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500 mb-2 block ml-1">End Pg</label>
                <input type="number" min={1} max={activeDoc.totalPages} value={endPage} onChange={e=>setEndPage(Number(e.target.value))} className="w-full bg-white dark:bg-zinc-950 border border-gray-200 dark:border-zinc-700 rounded-xl md:rounded-2xl px-3 md:px-5 py-3 md:py-4 text-sm md:text-lg text-center text-gray-800 dark:text-white font-mono font-bold outline-none focus:border-[var(--accent-color)] focus:ring-2 focus:ring-[var(--accent-color)]/50 transition-all shadow-inner" />
              </div>
            </div>
          )}
          <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500 mb-3 block ml-1">Extraction Engine</label>
          <div className="grid grid-cols-3 gap-2 md:gap-3 mb-6 md:mb-8">
            <ToolBtn id="flashcards" active={type} set={setType} icon={Layers} label="Cards" />
            <ToolBtn id="exam" active={type} set={setType} icon={CheckSquare} label="Exam" />
            <ToolBtn id="summary" active={type} set={setType} icon={BookA} label="Summary" />
            <ToolBtn id="clinical" active={type} set={setType} icon={Stethoscope} label="Case" />
            <ToolBtn id="differential" active={type} set={setType} icon={Activity} label="Diff" />
            <ToolBtn id="treatment" active={type} set={setType} icon={Pill} label="Treat" />
            <ToolBtn id="labs" active={type} set={setType} icon={Thermometer} label="Labs" />
            <ToolBtn id="mnemonics" active={type} set={setType} icon={Lightbulb} label="Mnemonics" />
            <ToolBtn id="eli5" active={type} set={setType} icon={Baby} label="Simplify" />
          </div>
          {(type === 'flashcards' || type === 'exam' || type === 'quiz') && (
            <div className="mb-5 md:mb-6 bg-white dark:bg-zinc-950 p-4 md:p-5 rounded-xl md:rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
              <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500 mb-3 md:mb-4 flex justify-between items-center">
                <span>Quantity</span> 
                <span className="text-[var(--accent-color)] text-xs md:text-sm bg-[var(--accent-color)]/10 px-2 md:px-3 py-1 rounded-lg">{count} Items</span>
              </label>
              <input type="range" min="5" max="100" value={count} onChange={e=>setCount(parseInt(e.target.value))} className="w-full accent-[var(--accent-color)] h-1.5 md:h-2 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer" />
            </div>
          )}
          <div className="mb-6 md:mb-8 bg-white dark:bg-zinc-950 p-4 md:p-5 rounded-xl md:rounded-2xl border border-gray-200 dark:border-zinc-800 shadow-sm">
            <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500 mb-3 md:mb-4 flex justify-between items-center">
              <span>Difficulty Level</span> 
              <span className="text-[var(--accent-color)] text-xs md:text-sm bg-[var(--accent-color)]/10 px-2 md:px-3 py-1 rounded-lg">{difficultyLevels[difficulty - 1]}</span>
            </label>
            <input type="range" min="1" max="3" value={difficulty} onChange={e=>setDifficulty(parseInt(e.target.value))} className="w-full accent-[var(--accent-color)] h-1.5 md:h-2 bg-gray-200 dark:bg-zinc-800 rounded-lg appearance-none cursor-pointer" />
          </div>
          <button onClick={handleGenerate} disabled={status.loading} className="w-full py-4 md:py-5 bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/90 text-white rounded-xl md:rounded-2xl text-xs md:text-sm font-black uppercase tracking-widest transition-all shadow-[0_10px_30px_rgba(var(--accent-color-rgb),0.3)] hover:shadow-[0_15px_40px_rgba(var(--accent-color-rgb),0.5)] disabled:opacity-50 disabled:shadow-none flex items-center justify-center gap-2 md:gap-3 active:scale-[0.98]">
            {status.loading ? <Loader2 size={20} className="animate-spin md:w-6 md:h-6" /> : <BrainCircuit size={20} className="md:w-6 md:h-6" />}
            {status.loading ? "Running AI Engine..." : "Execute Extraction"}
          </button>
        </div>
      ) : (
        <div className="flex-1 flex flex-col min-h-0 bg-white dark:bg-zinc-900 border border-emerald-500/30 dark:border-emerald-500/40 rounded-[1.5rem] md:rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 shadow-xl dark:shadow-2xl shadow-emerald-900/10 dark:shadow-emerald-900/20">
          <div className="bg-emerald-500/10 border-b border-emerald-500/20 dark:border-emerald-500/30 p-4 md:p-5 flex justify-between items-center shrink-0">
            <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-400 flex items-center gap-2"><CheckCircle2 size={16} className="md:w-[18px] md:h-[18px]"/> Output Ready</span>
            <div className="flex gap-2 md:gap-3">
              <button onClick={()=>setGenerated(null)} className="px-3 md:px-5 py-2 md:py-2.5 bg-gray-100 dark:bg-zinc-800 hover:bg-gray-200 dark:hover:bg-zinc-700 text-gray-600 dark:text-zinc-300 rounded-lg md:rounded-xl text-[9px] md:text-[10px] font-bold uppercase tracking-widest transition-colors">Discard</button>
              <button onClick={saveItem} className="px-4 md:px-6 py-2 md:py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg md:rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest flex items-center gap-1.5 md:gap-2 shadow-lg shadow-emerald-900/50 transition-colors"><Save size={14} className="md:w-4 md:h-4"/> Save to DB</button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 space-y-4 md:space-y-6">
            {generated.type === 'flashcards' && generated.data.map((item, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 p-4 md:p-6 rounded-xl md:rounded-2xl relative group pr-12 md:pr-16 shadow-sm hover:border-[var(--accent-color)]/30 transition-all">
                <p className="text-xs md:text-sm text-gray-800 dark:text-white font-bold mb-3 md:mb-4 leading-relaxed"><span className="text-gray-400 dark:text-zinc-600 mr-2 md:mr-3 text-[9px] md:text-xs uppercase tracking-widest">Q</span>{item.q}</p>
                <div className="bg-[var(--accent-color)]/5 border border-[var(--accent-color)]/10 p-3 md:p-4 rounded-lg md:rounded-xl">
                  <p className="text-xs md:text-sm text-[var(--accent-color)] leading-relaxed font-medium"><span className="text-[var(--accent-color)]/50 mr-2 md:mr-3 text-[9px] md:text-xs uppercase tracking-widest">A</span>{item.a}</p>
                </div>
                <button onClick={()=>removeItem(idx)} className="absolute top-4 md:top-6 right-4 md:right-6 p-1.5 md:p-2 bg-gray-200 dark:bg-zinc-900 text-gray-500 dark:text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-md md:rounded-xl opacity-100 md:opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={14} className="md:w-[18px] md:h-[18px]"/></button>
              </div>
            ))}
            {generated.type === 'exam' && generated.data.map((item, idx) => (
              <div key={idx} className="bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 p-5 md:p-8 rounded-xl md:rounded-2xl relative group shadow-sm hover:border-[var(--accent-color)]/30 transition-all">
                <div className="flex justify-between items-start mb-4 md:mb-6 gap-4 md:gap-6">
                   <p className="text-sm md:text-base text-gray-800 dark:text-white font-bold leading-relaxed flex-1"><span className="text-gray-400 dark:text-zinc-500 mr-2">{idx+1}.</span> {item.q}</p>
                   <button onClick={()=>removeItem(idx)} className="p-2 md:p-2.5 bg-gray-200 dark:bg-zinc-900 text-gray-500 dark:text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg md:rounded-xl opacity-100 md:opacity-0 group-hover:opacity-100 transition-all shrink-0"><Trash2 size={16} className="md:w-[18px] md:h-[18px]"/></button>
                </div>
                <div className="space-y-2 md:space-y-3">
                  {item.options.map((opt, oIdx) => (
                    <div key={oIdx} className={`text-xs md:text-sm p-3 md:p-4 rounded-lg md:rounded-xl border ${oIdx === item.correct ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-700 dark:text-emerald-400 font-bold' : 'bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-400'}`}>
                      <span className="font-mono text-gray-400 dark:text-zinc-500 mr-2 md:mr-3">{String.fromCharCode(65 + oIdx)}.</span> {opt}
                    </div>
                  ))}
                </div>
                <div className="mt-4 md:mt-6 p-4 md:p-5 bg-[var(--accent-color)]/5 border border-[var(--accent-color)]/10 rounded-xl">
                  <span className="font-black text-[var(--accent-color)] mr-2 uppercase tracking-widest text-[9px] md:text-[10px] block mb-2 md:mb-3">Explanation</span>
                  <p className="text-xs md:text-sm text-gray-700 dark:text-zinc-300 leading-relaxed font-medium">{item.explanation}</p>
                </div>
              </div>
            ))}
            {generated.type !== 'flashcards' && generated.type !== 'exam' && (
              <div className="bg-gray-50 dark:bg-zinc-950 border border-gray-200 dark:border-zinc-800 p-6 md:p-8 rounded-2xl relative group shadow-sm">
                <div className="text-sm md:text-base text-gray-700 dark:text-zinc-300 whitespace-pre-wrap leading-relaxed prose prose-invert prose-sm md:prose-base prose-p:text-gray-700 dark:prose-p:text-zinc-300 prose-headings:text-gray-900 dark:prose-headings:text-white max-w-none">{generated.data}</div>
              </div>
            )}
          </div>
        </div>
      )}
      {status.msg && !generated && (
        <div className={`mt-4 md:mt-6 p-4 md:p-5 rounded-2xl text-xs md:text-sm font-bold flex items-center gap-3 md:gap-4 border ${status.err ? 'bg-red-500/10 text-red-600 dark:text-red-400 border-red-500/20' : 'bg-[var(--accent-color)]/10 text-[var(--accent-color)] border-[var(--accent-color)]/20 shadow-sm dark:shadow-lg shadow-[var(--accent-color)]/10 dark:shadow-[var(--accent-color)]/20'}`}>
          {status.loading ? <Loader2 size={20} className="animate-spin shrink-0 text-[var(--accent-color)] md:w-6 md:h-6" /> : <AlertCircle size={20} className="shrink-0 text-red-500 md:w-6 md:h-6" />}
          <span className="leading-relaxed">{status.msg}</span>
        </div>
      )}
    </div>
  );
}

function ToolBtn({ id, active, set, icon: Icon, label }) {
  const isA = active === id;
  return (
    <button onClick={() => set(id)} className={`py-3 md:py-4 px-1 md:px-2 flex flex-col items-center justify-center gap-2 md:gap-3 rounded-xl md:rounded-2xl text-[8px] md:text-[10px] font-black uppercase tracking-widest border transition-all ${isA ? 'bg-[var(--accent-color)] border-[var(--accent-color)] text-white shadow-md md:shadow-lg shadow-[var(--accent-color)]/30 scale-105' : 'bg-gray-50 dark:bg-zinc-950 border-gray-200 dark:border-zinc-800 text-gray-500 dark:text-zinc-500 hover:text-gray-800 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800'}`}>
      <Icon size={18} className={`md:w-6 md:h-6 ${isA ? "text-white" : "text-gray-400 dark:text-zinc-600"}`}/> {label}
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
      const pdfData = await getPdfData(activeDoc.id);
      const text = pdfData?.pagesText?.[currentPage] || activeDoc.pagesText?.[currentPage] || "No readable text found on this page.";
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
    <div className="h-full flex flex-col p-4 md:p-6 overflow-y-auto custom-scrollbar pb-24 md:pb-6">
      <div className="bg-[var(--accent-color)]/10 px-4 md:px-5 py-2.5 md:py-3 flex items-center gap-2 md:gap-3 shadow-sm shrink-0 rounded-xl md:rounded-2xl mb-4 md:mb-6 border border-[var(--accent-color)]/20">
         <Target size={14} className="text-[var(--accent-color)] md:w-4 md:h-4" />
         <span className="text-[9px] md:text-[10px] font-black text-[var(--accent-color)] uppercase tracking-widest">Locked: Page {currentPage}</span>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar space-y-4 md:space-y-6 mb-4 md:mb-6">
        {messages.map((m, i) => (
          <div key={i} className={`flex gap-3 md:gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl flex items-center justify-center shrink-0 shadow-sm md:shadow-lg ${m.role === 'user' ? 'bg-[var(--accent-color)]' : 'bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700'}`}>
              {m.role === 'user' ? <List size={14} className="text-white md:w-[18px] md:h-[18px]" /> : <BrainCircuit size={14} className="text-[var(--accent-color)] md:w-[18px] md:h-[18px]" />}
            </div>
            <div className={`p-4 md:p-5 max-w-[85%] text-xs md:text-sm leading-relaxed shadow-sm md:shadow-inner ${m.role === 'user' ? 'bg-[var(--accent-color)] text-white rounded-2xl md:rounded-3xl rounded-tr-sm' : 'bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl md:rounded-3xl rounded-tl-sm text-gray-600 dark:text-zinc-300 whitespace-pre-wrap'}`}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-3 md:gap-4">
             <div className="w-8 h-8 md:w-10 md:h-10 rounded-xl md:rounded-2xl bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 flex items-center justify-center shrink-0 shadow-sm md:shadow-lg"><Loader2 size={14} className="text-[var(--accent-color)] animate-spin md:w-[18px] md:h-[18px]" /></div>
             <div className="p-4 md:p-5 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl md:rounded-3xl rounded-tl-sm flex items-center gap-1.5 md:gap-2"><span className="w-2 h-2 md:w-2.5 md:h-2.5 bg-gray-300 dark:bg-zinc-600 rounded-full animate-bounce"></span><span className="w-2 h-2 md:w-2.5 md:h-2.5 bg-gray-300 dark:bg-zinc-600 rounded-full animate-bounce" style={{animationDelay:'0.15s'}}></span><span className="w-2 h-2 md:w-2.5 md:h-2.5 bg-gray-300 dark:bg-zinc-600 rounded-full animate-bounce" style={{animationDelay:'0.3s'}}></span></div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      <div className="shrink-0">
        <div className="relative flex items-end bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-700 rounded-xl md:rounded-2xl focus-within:border-[var(--accent-color)] focus-within:ring-1 md:focus-within:ring-2 focus-within:ring-[var(--accent-color)]/50 transition-all shadow-sm md:shadow-inner p-1">
          <textarea value={input} onChange={e=>setInput(e.target.value)} onKeyDown={e=>{if(e.key==='Enter'&&!e.shiftKey){e.preventDefault(); handleChat();}}} placeholder={`Ask about page ${currentPage}...`} disabled={loading} className="w-full bg-transparent p-3 md:p-4 pr-14 md:pr-16 text-xs md:text-sm text-gray-800 dark:text-white outline-none resize-none max-h-32 md:max-h-40 custom-scrollbar" style={{minHeight:'48px'}} />
          <button onClick={toggleRecognition} className={`absolute right-12 md:right-16 bottom-2 md:bottom-3 p-2 md:p-3 transition-colors ${recognizing ? 'text-red-500 animate-pulse' : 'text-[var(--accent-color)]'}`}><Mic size={16} fill={recognizing ? 'currentColor' : 'none'} className="md:w-5 md:h-5" /></button>
          <button onClick={handleChat} disabled={loading||!input.trim()} className="absolute right-2 bottom-2 md:bottom-2 p-2.5 md:p-3 bg-[var(--accent-color)] hover:bg-[var(--accent-color)]/90 disabled:bg-gray-200 dark:disabled:bg-zinc-800 disabled:text-gray-400 dark:disabled:text-zinc-600 rounded-lg md:rounded-xl text-white transition-all shadow-md disabled:shadow-none"><Send size={14} className="md:w-[18px] md:h-[18px]"/></button>
        </div>
      </div>
    </div>
  );
}

function PanelReview({ activeDocId, flashcards, setFlashcards, exams, setExams, notes, setNotes }) {
  const [activeItem, setActiveItem] = useState(null);
  
  const docCardSets = flashcards.filter(f => f.docId === activeDocId);
  const docExams = exams.filter(e => e.docId === activeDocId);
  const docNotes = notes.filter(n => n.docId === activeDocId);
  
  if (activeItem?.type === 'exam') return <InPanelExam exam={activeItem.data} onBack={() => setActiveItem(null)} />;
  if (activeItem?.type === 'note') return <InPanelNote note={activeItem.data} onBack={() => setActiveItem(null)} />;
  if (activeItem?.type === 'flashcards') return <InPanelFlashcards title={activeItem.data.title} initialCards={activeItem.data.cards} onBack={() => setActiveItem(null)} setFlashcards={setFlashcards} />;
  
  return (
    <div className="h-full overflow-y-auto custom-scrollbar p-4 md:p-6 bg-transparent space-y-8 md:space-y-12 pb-24 md:pb-6">
      <div>
        <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-emerald-600 dark:text-emerald-500 mb-4 md:mb-5 flex items-center gap-2 bg-emerald-500/10 w-fit px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl border border-emerald-500/20"><GraduationCap size={14} className="md:w-[18px] md:h-[18px]"/> Generated Exams ({docExams.length})</h3>
        {docExams.length === 0 ? <p className="text-xs md:text-sm text-gray-400 dark:text-zinc-600 italic bg-white dark:bg-zinc-900/50 p-4 md:p-6 rounded-xl md:rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 text-center">No exams created for this document yet.</p> : (
          <div className="space-y-3 md:space-y-4">
            {docExams.map(e => (
              <div key={e.id} className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 p-4 md:p-6 rounded-2xl md:rounded-3xl group shadow-sm transition-all hover:border-emerald-500/30">
                <div className="flex justify-between items-start mb-4 md:mb-5">
                  <div>
                    <p className="text-sm md:text-base text-gray-800 dark:text-white font-bold mb-1 md:mb-2">{e.title}</p>
                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-950 px-2 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg border border-gray-200 dark:border-zinc-800">{e.questions.length} Questions • Pgs {e.sourcePages}</span>
                  </div>
                  <button onClick={() => setExams(exams.filter(ex => ex.id !== e.id))} className="p-2 md:p-3 bg-gray-100 dark:bg-zinc-950 text-gray-500 dark:text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg md:rounded-xl transition-all shadow-sm"><Trash size={14} className="md:w-4 md:h-4"/></button>
                </div>
                <button onClick={() => setActiveItem({ type: 'exam', data: e })} className="w-full py-2.5 md:py-3 bg-emerald-600/10 hover:bg-emerald-600/20 text-emerald-600 dark:text-emerald-400 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest border border-emerald-500/20 transition-all flex items-center justify-center gap-2">
                  <Play size={12} fill="currentColor" className="md:w-4 md:h-4"/> Take Exam Side-by-Side
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <div className="flex justify-between items-center mb-4 md:mb-5">
           <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-[var(--accent-color)] flex items-center gap-2 bg-[var(--accent-color)]/10 w-fit px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl border border-[var(--accent-color)]/20"><Layers size={14} className="md:w-[18px] md:h-[18px]"/> Saved Flashcard Sets ({docCardSets.length})</h3>
           {docCardSets.length > 0 && <button onClick={() => setActiveItem({ type: 'flashcards', data: { title: 'All Doc Cards', cards: docCardSets.flatMap(s => s.cards) } })} className="text-[8px] md:text-[10px] bg-[var(--accent-color)] text-white px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl font-bold uppercase tracking-widest flex items-center gap-1 md:gap-2 shadow-md hover:bg-[var(--accent-color)]/90 transition-colors"><Play size={10} fill="currentColor" className="md:w-3.5 md:h-3.5"/> Study All</button>}
        </div>
        {docCardSets.length === 0 ? <p className="text-xs md:text-sm text-gray-400 dark:text-zinc-600 italic bg-white dark:bg-zinc-900/50 p-4 md:p-6 rounded-xl md:rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 text-center">No flashcards extracted for this document.</p> : (
          <div className="space-y-3 md:space-y-4">
            {docCardSets.map(set => (
              <div key={set.id} className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 p-4 md:p-6 rounded-2xl md:rounded-3xl group shadow-sm transition-all hover:border-[var(--accent-color)]/30">
                <div className="flex justify-between items-start mb-4 md:mb-5">
                  <div>
                    <p className="text-sm md:text-base text-gray-800 dark:text-white font-bold mb-1 md:mb-2">{set.title}</p>
                    <span className="text-[8px] md:text-[10px] font-black uppercase tracking-widest text-gray-500 dark:text-zinc-500 bg-gray-100 dark:bg-zinc-950 px-2 md:px-3 py-1 md:py-1.5 rounded-md md:rounded-lg border border-gray-200 dark:border-zinc-800">{set.cards?.length || 0} Cards • Pgs {set.sourcePages}</span>
                  </div>
                  <button onClick={() => setFlashcards(flashcards.filter(f => f.id !== set.id))} className="p-2 md:p-3 bg-gray-100 dark:bg-zinc-950 text-gray-500 dark:text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg md:rounded-xl transition-all shadow-sm"><Trash size={14} className="md:w-4 md:h-4"/></button>
                </div>
                <button onClick={() => setActiveItem({ type: 'flashcards', data: set })} className="w-full py-2.5 md:py-3 bg-[var(--accent-color)]/10 hover:bg-[var(--accent-color)]/20 text-[var(--accent-color)] rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold uppercase tracking-widest border border-[var(--accent-color)]/20 transition-all flex items-center justify-center gap-2">
                  <Play size={12} fill="currentColor" className="md:w-4 md:h-4" /> Study Set
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
      <div>
        <h3 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-blue-600 dark:text-blue-500 mb-4 md:mb-5 flex items-center gap-2 bg-blue-500/10 w-fit px-3 md:px-4 py-1.5 md:py-2 rounded-lg md:rounded-xl border border-blue-500/20"><BookA size={14} className="md:w-[18px] md:h-[18px]"/> Saved Notes ({docNotes.length})</h3>
        {docNotes.length === 0 ? <p className="text-xs md:text-sm text-gray-400 dark:text-zinc-600 italic bg-white dark:bg-zinc-900/50 p-4 md:p-6 rounded-xl md:rounded-2xl border border-dashed border-gray-200 dark:border-zinc-800 text-center">No notes or summaries generated.</p> : (
          <div className="space-y-3 md:space-y-4">
            {docNotes.map(n => (
              <div key={n.id} onClick={() => setActiveItem({ type: 'note', data: n })} className="bg-white/80 dark:bg-zinc-900/80 backdrop-blur-xl border border-gray-200 dark:border-zinc-800 p-4 md:p-6 rounded-2xl md:rounded-3xl group relative shadow-sm hover:border-blue-500/30 transition-all cursor-pointer">
                <div className="pr-10 md:pr-14">
                   <p className="text-sm md:text-base text-gray-800 dark:text-white font-bold mb-2 md:mb-3">{n.title}</p>
                   <p className="text-xs md:text-sm text-gray-500 dark:text-zinc-400 line-clamp-3 leading-relaxed bg-gray-100 dark:bg-zinc-950 p-3 md:p-4 rounded-xl md:rounded-2xl border border-gray-200 dark:border-zinc-800">{n.content}</p>
                </div>
                <button onClick={(e) => { e.stopPropagation(); setNotes(notes.filter(no => no.id !== n.id)); }} className="absolute top-4 md:top-6 right-4 md:right-6 p-2 md:p-3 bg-gray-100 dark:bg-zinc-950 text-gray-500 dark:text-zinc-500 hover:text-red-500 hover:bg-red-500/10 rounded-lg md:rounded-xl opacity-100 md:opacity-0 group-hover:opacity-100 transition-all shadow-sm"><Trash size={14} className="md:w-4 md:h-4"/></button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

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
      <div className="bg-emerald-600/10 border-b border-emerald-500/20 p-3 md:p-4 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="text-emerald-600 dark:text-emerald-400 hover:text-emerald-500 text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center gap-1 md:gap-2"><ChevronLeft size={14}/> Exit Exam</button>
        <span className="text-[8px] md:text-[10px] text-emerald-600 dark:text-emerald-500 font-black uppercase tracking-widest bg-emerald-500/10 px-2 md:px-3 py-1 rounded-md md:rounded-lg">Pages {exam.sourcePages}</span>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-5 md:p-8 pb-24 md:pb-8">
        <>
          <div className="mb-6 md:mb-8 flex justify-between items-center border-b border-gray-200 dark:border-zinc-800 pb-3 md:pb-4">
            <span className="text-[10px] md:text-xs font-bold text-gray-500 dark:text-zinc-500 uppercase tracking-widest">Question {currentQIndex + 1} of {exam.questions.length}</span>
          </div>
          <h2 className="text-lg md:text-xl text-gray-800 dark:text-white font-bold mb-6 md:mb-8 leading-relaxed">{q.q}</h2>
          <div className="space-y-3 md:space-y-4 mb-6 md:mb-8">
            {q.options.map((opt, idx) => (
              <button
                key={idx} onClick={() => handleSelect(idx)}
                disabled={showFeedback}
                className={`w-full text-left p-4 md:p-5 rounded-xl md:rounded-2xl border-2 transition-all flex items-start gap-3 md:gap-4 ${
                  selectedAnswer === idx ? (idx === q.correct ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-100 shadow-inner' : 'border-red-500 bg-red-500/10 text-red-700 dark:text-red-100 shadow-inner') : showFeedback && idx === q.correct ? 'border-emerald-500 bg-emerald-500/10 text-emerald-700 dark:text-emerald-100 shadow-inner' : 'border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 hover:border-gray-300 dark:hover:border-zinc-600'
                }`}
              >
                <div className={`w-5 h-5 md:w-6 md:h-6 rounded-full border-2 mt-0.5 flex items-center justify-center shrink-0 ${selectedAnswer === idx || (showFeedback && idx === q.correct) ? (idx === q.correct ? 'border-emerald-500' : 'border-red-500') : 'border-gray-300 dark:border-zinc-600'}`}>
                  {(selectedAnswer === idx || (showFeedback && idx === q.correct)) && <div className={`w-2.5 h-2.5 md:w-3 md:h-3 rounded-full ${idx === q.correct ? 'bg-emerald-500' : 'bg-red-500'}`} />}
                </div>
                <span className="text-sm md:text-base leading-relaxed">{opt}</span>
              </button>
            ))}
          </div>
          {showFeedback && (
            <div className="mt-4 md:mt-6 p-4 md:p-6 mb-6 md:mb-8 bg-[var(--accent-color)]/5 border border-[var(--accent-color)]/20 rounded-xl md:rounded-2xl text-xs md:text-sm text-gray-800 dark:text-[var(--accent-color)]/90 leading-relaxed shadow-sm"><span className="font-black text-[var(--accent-color)] mr-2 uppercase tracking-widest text-[10px] md:text-xs block mb-2 md:mb-3">Explanation:</span>{q.explanation}</div>
          )}
          <div className="flex justify-between items-center mt-6 md:mt-10">
            <button onClick={prevQuestion} disabled={currentQIndex === 0} className="px-4 md:px-5 py-2 md:py-3 text-gray-500 dark:text-zinc-500 hover:bg-gray-200 dark:hover:bg-zinc-800 rounded-lg md:rounded-xl disabled:opacity-30 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-colors">Previous</button>
            <button onClick={nextQuestion} disabled={!showFeedback} className="px-6 md:px-8 py-3 md:py-4 bg-gray-800 dark:bg-white hover:bg-gray-700 dark:hover:bg-zinc-200 disabled:bg-gray-200 dark:disabled:bg-zinc-800 disabled:text-gray-400 dark:disabled:text-zinc-600 text-white dark:text-zinc-950 disabled:shadow-none rounded-lg md:rounded-xl text-xs md:text-sm font-black shadow-lg uppercase tracking-widest transition-all flex items-center gap-2 md:gap-3">Next <ChevronRight size={16} className="md:w-[18px] md:h-[18px]"/></button>
          </div>
        </>
      </div>
    </div>
  );
}

function InPanelFlashcards({ title, initialCards, onBack, setFlashcards }) {
  const [cards, setCards] = useState(initialCards || []);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  
  if (!cards || cards.length === 0) return <div className="p-6 text-center text-gray-500 dark:text-zinc-500">No cards left.</div>;
  
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
    const nextReview = Date.now() + newInterval * 86400000;
    const newCard = {...currentCard, repetitions: newRep, ef: newEf, interval: newInterval, lastReview: Date.now(), nextReview };
    
    setCards(prev => prev.map(c => c.id === newCard.id ? newCard : c));
    
    setFlashcards(globalSets => globalSets.map(set => ({
      ...set,
      cards: set.cards ? set.cards.map(c => c.id === newCard.id ? newCard : c) : set.cards
    })));

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
      <div className="bg-[var(--accent-color)]/10 border-b border-[var(--accent-color)]/20 p-3 md:p-5 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="text-[var(--accent-color)] hover:text-[var(--accent-color)]/80 text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center gap-1 md:gap-2"><ChevronLeft size={14}/> Exit Study</button>
        <span className="text-[8px] md:text-[10px] text-[var(--accent-color)] font-black uppercase tracking-widest bg-[var(--accent-color)]/10 px-2 md:px-3 py-1 rounded-md md:rounded-lg">Card {currentIndex+1} / {cards.length}</span>
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-4 md:p-8 pb-24 md:pb-8">
        <div onClick={() => !isFlipped && setIsFlipped(true)} className="w-full h-[60vh] md:h-96 perspective-1000 cursor-pointer">
          <div className={`relative w-full h-full transition-transform duration-500 transform-style-3d ${isFlipped ? 'rotate-x-180' : ''}`}>
            {/* FRONT */}
            <div className="absolute inset-0 backface-hidden bg-white dark:bg-zinc-900 border border-gray-200 dark:border-zinc-800 rounded-2xl md:rounded-3xl p-6 md:p-10 flex flex-col items-center justify-center text-center shadow-xl">
              <span className="absolute top-4 md:top-6 left-4 md:left-6 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-gray-400 dark:text-zinc-600">Question</span>
              <h2 className="text-lg md:text-2xl font-bold text-gray-800 dark:text-white leading-relaxed">{currentCard.q}</h2>
              <div className="absolute bottom-4 md:bottom-6 text-[9px] md:text-[10px] font-bold uppercase tracking-widest text-[var(--accent-color)]/50 animate-pulse">Click card to reveal answer</div>
            </div>
            {/* BACK */}
            <div className="absolute inset-0 backface-hidden bg-[var(--accent-color)] border border-[var(--accent-color)]/50 rounded-2xl md:rounded-3xl p-6 md:p-10 flex flex-col items-center justify-center text-center shadow-2xl rotate-x-180 overflow-y-auto custom-scrollbar">
              <span className="absolute top-4 md:top-6 left-4 md:left-6 text-[9px] md:text-[10px] font-black uppercase tracking-widest text-white/80">Answer</span>
              <p className="text-base md:text-xl font-bold text-white leading-relaxed">{currentCard.a}</p>
            </div>
          </div>
        </div>
        <div className={`w-full flex flex-wrap md:flex-nowrap gap-2 md:gap-4 mt-8 md:mt-12 transition-opacity duration-300 ${isFlipped ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
          <button onClick={() => handleRate(0)} className="flex-1 min-w-[45%] md:min-w-0 py-3 md:py-5 bg-red-500/10 border border-red-500/20 hover:bg-red-500 hover:text-white rounded-xl md:rounded-2xl text-red-600 dark:text-red-400 text-xs md:text-sm font-black uppercase tracking-widest transition-all shadow-sm">Again</button>
          <button onClick={() => handleRate(3)} className="flex-1 min-w-[45%] md:min-w-0 py-3 md:py-5 bg-yellow-500/10 border border-yellow-500/20 hover:bg-yellow-500 hover:text-white rounded-xl md:rounded-2xl text-yellow-600 dark:text-yellow-400 text-xs md:text-sm font-black uppercase tracking-widest transition-all shadow-sm">Hard</button>
          <button onClick={() => handleRate(4)} className="flex-1 min-w-[45%] md:min-w-0 py-3 md:py-5 bg-emerald-500/10 border border-emerald-500/20 hover:bg-emerald-500 hover:text-white rounded-xl md:rounded-2xl text-emerald-600 dark:text-emerald-400 text-xs md:text-sm font-black uppercase tracking-widest transition-all shadow-sm">Good</button>
          <button onClick={() => handleRate(5)} className="flex-1 min-w-[45%] md:min-w-0 py-3 md:py-5 bg-blue-500/10 border border-blue-500/20 hover:bg-blue-500 hover:text-white rounded-xl md:rounded-2xl text-blue-600 dark:text-blue-400 text-xs md:text-sm font-black uppercase tracking-widest transition-all shadow-sm">Easy</button>
        </div>
      </div>
      <style>{`.perspective-1000 { perspective: 1000px; } .transform-style-3d { transform-style: preserve-3d; } .backface-hidden { backface-visibility: hidden; } .rotate-x-180 { transform: rotateX(180deg); }`}</style>
    </div>
  );
}

function InPanelNote({ note, onBack }) {
  return (
    <div className="flex flex-col h-full bg-gray-50 dark:bg-[#0a0a0c]">
      <div className="bg-blue-600/10 border-b border-blue-500/20 p-4 md:p-5 flex items-center justify-between shrink-0">
        <button onClick={onBack} className="text-blue-600 dark:text-blue-400 hover:text-blue-500 text-[10px] md:text-xs font-bold uppercase tracking-widest flex items-center gap-1 md:gap-2"><ChevronLeft size={14}/> Back to Notes</button>
      </div>
      <div className="flex-1 overflow-y-auto custom-scrollbar p-6 md:p-10 pb-24 md:pb-10">
         <h2 className="text-xl md:text-3xl font-black text-gray-800 dark:text-white mb-6 md:mb-8 leading-snug">{note.title}</h2>
         <div className="prose prose-invert prose-sm md:prose-lg max-w-none prose-p:text-gray-600 dark:prose-p:text-zinc-300 prose-headings:text-gray-800 dark:prose-headings:text-white prose-strong:text-[var(--accent-color)] whitespace-pre-wrap leading-relaxed">
            {note.content}
         </div>
      </div>
    </div>
  );
}


