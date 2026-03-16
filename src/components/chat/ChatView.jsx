/**
 * MARIAM PRO — ChatView orchestrator
 * Sidebar with sessions (grouped by date, pinned, projects), streaming chat,
 * voice input, starter prompts, context menu, session management, project CRUD.
 */
import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import {
  MessageSquare, Plus, X, Search, FolderOpen, Pin, Copy, Trash2,
  MoreVertical, History, Brain, UserCircle2, Mic, Send, Paperclip, Loader2
} from 'lucide-react';
import { callAIStreaming } from '../../services/ai/callAIStreaming';
import { renderAIContent } from '../../utils/markdown';

const MARIAM_IMG = 'https://i.ibb.co/kgMwrZG/mariam.png';

const STARTERS = [
  { icon: '🧬', text: 'Explain a complex topic' },
  { icon: '📋', text: 'Create a study plan' },
  { icon: '❓', text: 'Quiz me on key concepts' },
  { icon: '🔍', text: 'Compare and contrast' },
  { icon: '📝', text: 'Summarize main points' },
  { icon: '💡', text: 'Give me clinical pearls' },
];

export default function ChatView({ settings, sessions, setSessions }) {
  const [selSess, setSelSess] = useState(null);
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(() => window.innerWidth >= 1024);
  const [sessSearch, setSessSearch] = useState('');
  const [pinnedIds, setPinnedIds] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [projects, setProjects] = useState([]);
  const [selProject, setSelProject] = useState(null);
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [sidebarTab, setSidebarTab] = useState('chats');
  const [inputRows, setInputRows] = useState(1);
  const [hasStarted, setHasStarted] = useState(false);
  const endRef = useRef(null);
  const recogRef = useRef(null);
  const inputRef = useRef(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, loading]);

  const toggleVoice = () => {
    if (listening) { recogRef.current?.stop(); setListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Voice not supported in this browser.'); return; }
    const r = new SR(); r.continuous = false; r.interimResults = true;
    r.onresult = e => { setInput(Array.from(e.results).map(r => r[0].transcript).join('')); };
    r.onend = () => setListening(false); r.onerror = () => setListening(false);
    r.start(); recogRef.current = r; setListening(true);
  };

  const newSession = () => {
    setSelSess(null); setMsgs([]); setHasStarted(false);
    inputRef.current?.focus();
  };

  const saveSession = useCallback((ms, id) => {
    if (!ms.filter(m => m.role === 'user').length) return;
    const sessId = id || selSess || Date.now().toString();
    const title = ms.find(m => m.role === 'user')?.content?.slice(0, 50) || 'New Chat';
    const sess = { id: sessId, title, messages: ms, updatedAt: new Date().toISOString(), msgCount: ms.filter(m => m.role === 'user').length, projectId: selProject || null };
    setSessions(p => { const ex = p.findIndex(s => s.id === sessId); return ex >= 0 ? [...p.slice(0, ex), sess, ...p.slice(ex + 1)] : [sess, ...p]; });
    setSelSess(sessId);
  }, [selSess, setSessions, selProject]);

  const loadSession = sess => {
    setSelSess(sess.id); setMsgs(sess.messages || []); setHasStarted(true);
    if (window.innerWidth < 1024) setSidebarOpen(false);
  };

  const deleteSession = id => {
    setSessions(p => p.filter(s => s.id !== id));
    setPinnedIds(p => p.filter(x => x !== id));
    if (selSess === id) { setSelSess(null); setMsgs([]); }
    setContextMenu(null);
  };

  const copySession = id => {
    const sess = sessions.find(s => s.id === id);
    if (!sess) return;
    const text = sess.messages.map(m => `${m.role === 'user' ? 'You' : 'MARIAM'}: ${m.content}`).join('\n\n');
    navigator.clipboard?.writeText(text);
    setContextMenu(null);
  };

  const createProject = () => {
    if (!newProjectName.trim()) return;
    const p = { id: Date.now().toString(), name: newProjectName.trim(), color: ['#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 6)], createdAt: new Date().toISOString() };
    setProjects(prev => [...prev, p]);
    setNewProjectName(''); setShowNewProject(false);
  };

  const send = async (overrideMsg) => {
    const msg = overrideMsg || input;
    if (!msg.trim() || loading) return;
    setInput(''); setInputRows(1); setHasStarted(true);
    const sessId = selSess || Date.now().toString();
    if (!selSess) setSelSess(sessId);
    const newMsgs = [...msgs, { role: 'user', content: msg, timestamp: Date.now() }, { role: 'assistant', content: '', timestamp: Date.now() }];
    setMsgs(newMsgs); setLoading(true);
    try {
      const hist = newMsgs.slice(-12, -1).map(m => `${m.role === 'user' ? 'USER' : 'MARIAM'}: ${m.content}`).join('\n');
      const projCtx = selProject ? `\n\nProject context: ${projects.find(p => p.id === selProject)?.name || ''}` : '';
      const sysPrompt = `You are Mariam AI, the intelligence engine for a premium, visually-driven medical web application.${projCtx}

STRICT FORMATTING RULES:
1. NO MARKDOWN TABLES (no pipe | syntax). NEVER use standard markdown table syntax.
2. NO ASCII ART or text-based arrows like -->.
3. For ALL tabular comparisons, stages, or structured data: use <ui-table> with <ui-row>, <ui-col-header>, <ui-col>.
4. For ALL step-by-step processes, pathways, algorithms, or flowcharts: use <ui-flowchart direction="vertical"> with <ui-node id="N" shape="rectangle" color="blue|purple|green|red|orange|cyan"> and <ui-edge from="N" to="M" label="..."/>.
5. For clinical pearls, warnings, or key takeaways: use <ui-callout type="warning|info|success|danger">.
6. Use **bold** for key terms, bullet/numbered lists for non-structured content, ## for section headers.
7. Be thorough, organized, and clinically precise. Always state drug brand name first then generic in parentheses.

EXAMPLE TABLE:
<ui-table>
<ui-row><ui-col-header>Stage</ui-col-header><ui-col-header>Key Feature</ui-col-header></ui-row>
<ui-row><ui-col>Stage 1</ui-col><ui-col>Description here</ui-col></ui-row>
</ui-table>

EXAMPLE FLOWCHART:
<ui-flowchart direction="vertical">
<ui-node id="1" shape="rectangle" color="blue">Step One</ui-node>
<ui-edge from="1" to="2" label="leads to"/>
<ui-node id="2" shape="rectangle" color="green">Step Two</ui-node>
</ui-flowchart>

EXAMPLE CALLOUT:
<ui-callout type="warning">Monitor liver enzymes closely during this phase.</ui-callout>`;
      const prompt = `${sysPrompt}\n\nConversation:\n${hist}\n\nUSER: ${msg}\n\nMARIAM:`;
      await callAIStreaming(prompt, chunk => { setMsgs(p => [...p.slice(0, -1), { role: 'assistant', content: chunk, timestamp: Date.now() }]); }, settings, 6000);
      const finalMsgs = [...newMsgs.slice(0, -1), { ...newMsgs[newMsgs.length - 1] }];
      setTimeout(() => saveSession(finalMsgs, sessId), 300);
    } catch (e) { setMsgs(p => [...p.slice(0, -1), { role: 'assistant', content: `⚠️ ${e.message}` }]); }
    finally { setLoading(false); }
  };

  const filteredSessions = useMemo(() => {
    let s = [...sessions];
    if (sidebarTab === 'projects' && selProject) s = s.filter(x => x.projectId === selProject);
    const q = sessSearch.toLowerCase();
    if (q) s = s.filter(x => x.title.toLowerCase().includes(q) || x.messages?.some(m => m.content?.toLowerCase().includes(q)));
    return s;
  }, [sessions, sessSearch, sidebarTab, selProject]);

  const pinned = filteredSessions.filter(s => pinnedIds.includes(s.id));
  const unpinned = filteredSessions.filter(s => !pinnedIds.includes(s.id)).sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  const groupByDate = (items) => {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today); yesterday.setDate(yesterday.getDate() - 1);
    const week = new Date(today); week.setDate(week.getDate() - 7);
    const groups = { Today: [], Yesterday: [], 'Last 7 Days': [], 'Older': [] };
    items.forEach(s => {
      const d = new Date(s.updatedAt);
      if (d >= today) groups.Today.push(s);
      else if (d >= yesterday) groups.Yesterday.push(s);
      else if (d >= week) groups['Last 7 Days'].push(s);
      else groups.Older.push(s);
    });
    return groups;
  };
  const grouped = groupByDate(unpinned);

  const SessionItem = ({ s }) => (
    <button className={`w-full flex items-start gap-2.5 px-3 py-2 rounded-xl text-left transition-all group relative ${selSess === s.id ? 'bg-[var(--accent)]/10 border border-[var(--accent)]/20' : 'hover:bg-[var(--accent)]/6 border border-transparent'}`}
      onClick={() => loadSession(s)}>
      {s.projectId && <div className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ backgroundColor: projects.find(p => p.id === s.projectId)?.color || '#6366f1' }} />}
      <div className="flex-1 min-w-0">
        <p className={`text-sm truncate font-medium ${selSess === s.id ? 'text-[var(--accent)] font-bold' : ''}`}>{s.title}</p>
        <p className="text-xs opacity-40 mt-0.5">{new Date(s.updatedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</p>
      </div>
      <button className="opacity-0 group-hover:opacity-60 hover:!opacity-100 shrink-0 p-1 rounded-lg hover:bg-[var(--accent)]/10"
        onClick={e => { e.stopPropagation(); setContextMenu({ id: s.id, x: e.clientX, y: e.clientY }); }}>
        <MoreVertical size={14} />
      </button>
    </button>
  );

  const curSessData = sessions.find(s => s.id === selSess);

  return (
    <div className="flex-1 min-h-0 px-4 pb-4 overflow-hidden" onClick={() => contextMenu && setContextMenu(null)}>
    <div className="h-full flex rounded-[2rem] overflow-hidden animate-fade-in-up"
      style={{ background: 'rgba(255,255,255,0.03)', backdropFilter: 'saturate(150%) blur(60px)', WebkitBackdropFilter: 'saturate(150%) blur(60px)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 20px 40px rgba(0,0,0,0.3)' }}>

      {/* Context menu */}
      {contextMenu && (
        <div className="fixed z-[9999] glass rounded-xl shadow-2xl border border-[color:var(--border2,var(--border))] py-1 min-w-[180px]"
          style={{ left: Math.min(contextMenu.x, window.innerWidth - 200), top: Math.min(contextMenu.y, window.innerHeight - 140) }}>
          <button onClick={() => { setPinnedIds(p => p.includes(contextMenu.id) ? p.filter(x => x !== contextMenu.id) : [...p, contextMenu.id]); setContextMenu(null); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-[var(--accent)]/10 transition-colors">
            <Pin size={15} />{pinnedIds.includes(contextMenu.id) ? 'Unpin' : 'Pin to top'}
          </button>
          <button onClick={() => copySession(contextMenu.id)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-[var(--accent)]/10 transition-colors">
            <Copy size={15} />Copy transcript
          </button>
          <div className="my-1 border-t border-[color:var(--border2,var(--border))]" />
          <button onClick={() => deleteSession(contextMenu.id)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-[var(--danger-bg)] transition-colors" style={{ color: 'var(--danger)' }}>
            <Trash2 size={15} />Delete chat
          </button>
        </div>
      )}

      {/* ── SIDEBAR ── */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/40 z-[40] backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />
      )}
      <div className={`flex flex-col transition-all duration-300 shrink-0 z-[41]
        ${sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'}
        lg:relative absolute inset-y-0 left-0`}
        style={{ borderRight: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}>

        <div className="flex items-center justify-between px-4 py-3 border-b border-[color:var(--border2,var(--border))] shrink-0">
          <span className="text-base font-black">MARIAM Chat</span>
          <div className="flex items-center gap-1">
            <button onClick={newSession} className="w-8 h-8 btn-accent rounded-xl flex items-center justify-center shadow-sm" title="New chat"><Plus size={18} /></button>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden w-8 h-8 glass rounded-xl flex items-center justify-center opacity-60"><X size={18} /></button>
          </div>
        </div>

        <div className="px-3 py-2 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
            <input value={sessSearch} onChange={e => setSessSearch(e.target.value)} placeholder="Search conversations…" className="w-full glass-input rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none" />
          </div>
        </div>

        <div className="flex border-b border-[color:var(--border2,var(--border))] shrink-0 px-3 gap-1">
          {[['chats', 'Chats', MessageSquare], ['projects', 'Projects', FolderOpen]].map(([id, lbl, Icon]) => (
            <button key={id} onClick={() => setSidebarTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-black uppercase tracking-widest border-b-2 transition-colors -mb-px
                ${sidebarTab === id ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent opacity-50 hover:opacity-80'}`}>
              <Icon size={14} />{lbl}
            </button>
          ))}
        </div>

        {sidebarTab === 'chats' && (
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar py-2">
            {pinned.length > 0 && (
              <div className="mb-2">
                <p className="text-xs font-black uppercase tracking-widest opacity-30 px-4 py-1.5 flex items-center gap-1.5"><Pin size={10} />Pinned</p>
                {pinned.map(s => <SessionItem key={s.id} s={s} />)}
                <div className="mx-3 my-2 border-t border-[color:var(--border2,var(--border))]" />
              </div>
            )}
            {Object.entries(grouped).map(([grp, items]) => items.length > 0 && (
              <div key={grp} className="mb-3">
                <p className="text-xs font-black uppercase tracking-widest opacity-30 px-4 py-1.5">{grp}</p>
                {items.map(s => <SessionItem key={s.id} s={s} />)}
              </div>
            ))}
            {!sessions.length && (
              <div className="text-center py-16 px-4 opacity-30">
                <MessageSquare size={32} className="mx-auto mb-3" />
                <p className="text-sm font-bold">No chats yet</p>
                <p className="text-xs mt-1">Start a conversation below</p>
              </div>
            )}
          </div>
        )}

        {sidebarTab === 'projects' && (
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar py-2">
            <button onClick={() => setShowNewProject(true)} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-[var(--accent)] hover:bg-[var(--accent)]/5 transition-colors"><Plus size={16} />New Project</button>
            {showNewProject && (
              <div className="mx-3 mb-3 p-3 glass rounded-xl border border-[color:var(--border2,var(--border))] space-y-2">
                <input value={newProjectName} onChange={e => setNewProjectName(e.target.value)} onKeyDown={e => e.key === 'Enter' && createProject()} placeholder="Project name…" autoFocus className="w-full text-sm bg-transparent outline-none border-b border-[color:var(--border2,var(--border))] pb-1 text-[var(--text)]" />
                <div className="flex gap-2">
                  <button onClick={createProject} className="flex-1 py-1.5 btn-accent rounded-lg text-xs font-black">Create</button>
                  <button onClick={() => setShowNewProject(false)} className="flex-1 py-1.5 glass rounded-lg text-xs font-black opacity-60">Cancel</button>
                </div>
              </div>
            )}
            {projects.length === 0 && !showNewProject && (
              <div className="text-center py-12 px-4 opacity-30">
                <FolderOpen size={32} className="mx-auto mb-3" />
                <p className="text-sm font-bold">No projects yet</p>
                <p className="text-xs mt-1">Organize chats into projects</p>
              </div>
            )}
            {[{ id: null, name: 'All Chats', color: '#6366f1' }, ...projects].map(p => (
              <button key={p.id || 'all'} onClick={() => { setSelProject(p.id); setSidebarTab(p.id ? 'projects' : 'chats'); }}
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all mx-0 ${selProject === p.id ? 'bg-[var(--accent)]/10' : 'hover:bg-[var(--accent)]/6'}`}>
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{p.name}</p>
                  <p className="text-xs opacity-40">{sessions.filter(s => s.projectId === p.id).length} chats</p>
                </div>
                {p.id && (
                  <button onClick={e => { e.stopPropagation(); setProjects(prev => prev.filter(x => x.id !== p.id)); }}
                    className="opacity-0 group-hover:opacity-60 hover:!opacity-100 w-6 h-6 rounded-lg hover:bg-[var(--danger-bg)] flex items-center justify-center">
                    <Trash2 size={12} style={{ color: 'var(--danger)' }} />
                  </button>
                )}
              </button>
            ))}
            {selProject && (
              <div className="border-t border-[color:var(--border2,var(--border))] mt-2 pt-2">
                <p className="text-xs font-black uppercase tracking-widest opacity-30 px-4 py-1.5">Chats in project</p>
                {filteredSessions.map(s => <SessionItem key={s.id} s={s} />)}
                {filteredSessions.length === 0 && <p className="text-xs opacity-30 text-center py-4">No chats in this project</p>}
              </div>
            )}
          </div>
        )}

        <div className="shrink-0 p-3 border-t border-[color:var(--border2,var(--border))]">
          <div className="flex items-center gap-2 px-2 py-2 text-xs opacity-40">
            <Brain size={14} />
            <span className="font-bold">{sessions.length} conversations · {sessions.reduce((a, s) => a + (s.msgCount || 0), 0)} messages</span>
          </div>
        </div>
      </div>

      {/* ── MAIN CHAT AREA ── */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0 relative">
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[color:var(--border2,var(--border))] bg-[var(--surface,var(--card))]/80 backdrop-blur-sm shrink-0">
          <button onClick={() => setSidebarOpen(o => !o)} className="w-9 h-9 glass rounded-xl flex items-center justify-center opacity-60 hover:opacity-100 shrink-0 transition-all"><History size={18} /></button>
          <div className="flex-1 min-w-0">
            {curSessData?.projectId && (
              <div className="flex items-center gap-1.5 mb-0.5">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: projects.find(p => p.id === curSessData.projectId)?.color || '#6366f1' }} />
                <span className="text-xs opacity-50 font-bold">{projects.find(p => p.id === curSessData.projectId)?.name || 'Project'}</span>
              </div>
            )}
            <p className="text-sm font-black truncate">{curSessData?.title || 'New Conversation'}</p>
          </div>
          <div className="flex items-center gap-1">
            {msgs.length > 0 && (
              <button onClick={() => { const t = msgs.map(m => `${m.role === 'user' ? 'You' : 'MARIAM'}: ${m.content}`).join('\n\n'); navigator.clipboard?.writeText(t); }}
                className="w-9 h-9 glass rounded-xl flex items-center justify-center opacity-60 hover:opacity-100 transition-all" title="Copy transcript"><Copy size={18} /></button>
            )}
            {msgs.length > 0 && (
              <button onClick={newSession} className="flex items-center gap-2 px-3 py-2 glass rounded-xl text-sm font-black opacity-60 hover:opacity-100 transition-all"><Plus size={16} />New</button>
            )}
          </div>
        </div>

        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar" ref={scrollContainerRef}>
          {!hasStarted ? (
            <div className="flex flex-col items-center justify-center min-h-full p-6 gap-8">
              <div className="text-center space-y-3">
                <div className="relative inline-block">
                  <img src={MARIAM_IMG} className="w-24 h-24 rounded-3xl object-cover shadow-2xl border-4 border-[color:var(--border2,var(--border))]" alt="MARIAM AI" />
                  <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full border-2 border-[var(--bg)] flex items-center justify-center" style={{ background: 'var(--success)' }}>
                    <div className="w-2.5 h-2.5 bg-white rounded-full" />
                  </div>
                </div>
                <h1 className="text-3xl font-black">What can I help you study?</h1>
                <p className="text-base opacity-50 max-w-md">Your AI study assistant — medicine, sciences, and beyond</p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-2xl">
                {STARTERS.map(s => (
                  <button key={s.text} onClick={() => send(s.text)}
                    className="glass rounded-2xl p-4 text-left hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5 transition-all border border-[color:var(--border2,var(--border))] group">
                    <div className="text-2xl mb-2">{s.icon}</div>
                    <p className="text-sm font-bold group-hover:text-[var(--accent)] transition-colors">{s.text}</p>
                  </button>
                ))}
              </div>
              {selProject && (
                <div className="glass rounded-2xl px-4 py-3 flex items-center gap-3 border border-[var(--accent)]/20">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: projects.find(p => p.id === selProject)?.color }} />
                  <span className="text-sm font-bold">Project: {projects.find(p => p.id === selProject)?.name}</span>
                  <button onClick={() => setSelProject(null)} className="ml-auto text-xs opacity-50 hover:opacity-100"><X size={14} /></button>
                </div>
              )}
            </div>
          ) : (
            <div className="max-w-3xl mx-auto py-6 px-4 space-y-6">
              {msgs.map((m, i) => (
                <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''} group`}>
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-1 ${m.role === 'user' ? 'bg-[var(--accent)]' : 'overflow-hidden border border-[color:var(--border2,var(--border))]'}`}>
                    {m.role === 'user' ? <UserCircle2 size={20} className="text-white" /> : <img src={MARIAM_IMG} className="w-full h-full object-cover" alt="AI" />}
                  </div>
                  <div className={`flex-1 max-w-[85%] flex flex-col gap-1.5 ${m.role === 'user' ? 'items-end' : ''}`}>
                    <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed ${m.role === 'user' ? 'bg-[var(--accent)] text-white rounded-tr-sm max-w-[80%]' : 'rounded-tl-sm'}`}>
                      {m.role === 'assistant' ? (
                        <div className="prose-custom">{m.content ? renderAIContent(m.content) : <span className="opacity-30 animate-pulse">▊</span>}</div>
                      ) : (
                        <p className="whitespace-pre-wrap">{m.content}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-2 px-1">
                      <button onClick={() => navigator.clipboard?.writeText(m.content)}
                        className="opacity-0 group-hover:opacity-40 hover:!opacity-80 text-xs font-bold flex items-center gap-1 transition-opacity"><Copy size={12} />Copy</button>
                    </div>
                  </div>
                </div>
              ))}
              {loading && (
                <div className="flex gap-4">
                  <div className="w-9 h-9 rounded-xl overflow-hidden border border-[color:var(--border2,var(--border))] shrink-0 mt-1"><img src={MARIAM_IMG} className="w-full h-full object-cover" alt="AI" /></div>
                  <div className="glass rounded-2xl rounded-tl-sm px-4 py-3.5 flex items-center gap-1.5">
                    {[0, 1, 2].map(i => <div key={i} className="w-2.5 h-2.5 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
                  </div>
                </div>
              )}
              <div ref={endRef} />
            </div>
          )}
        </div>

        <div className="shrink-0 px-4 md:px-6 py-4 md:pb-6" style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
          <div className="max-w-3xl mx-auto">
            {selProject && (
              <div className="flex items-center gap-2 mb-2 px-1">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: projects.find(p => p.id === selProject)?.color }} />
                <span className="text-xs font-bold opacity-60">{projects.find(p => p.id === selProject)?.name}</span>
                <button onClick={() => setSelProject(null)} className="opacity-40 hover:opacity-80 ml-1"><X size={12} /></button>
              </div>
            )}
            <div className="relative flex items-end p-2 rounded-3xl transition-all"
              style={{ background: 'rgba(26,27,54,0.7)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,.3)', backdropFilter: 'blur(20px)' }}>
              <button className="shrink-0 p-2.5 rounded-full transition-colors opacity-50 hover:opacity-100" style={{ color: 'var(--text)' }}><Paperclip size={19} /></button>
              <textarea ref={inputRef} value={input}
                onChange={e => { setInput(e.target.value); setInputRows(Math.min(8, e.target.value.split('\n').length)); }}
                onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
                placeholder="Message MARIAM…" disabled={loading} rows={inputRows}
                className="flex-1 max-h-48 bg-transparent px-2 py-2.5 text-sm outline-none resize-none custom-scrollbar leading-relaxed"
                style={{ color: 'var(--text)', minHeight: 44 }} />
              <div className="shrink-0 flex items-center gap-1 p-1">
                <button onClick={toggleVoice}
                  className="p-2 rounded-full transition-all"
                  style={listening ? { background: 'var(--danger)', color: '#fff' } : { opacity: .5, color: 'var(--text)' }}
                  title={listening ? 'Stop' : 'Voice'}>
                  <Mic size={18} />
                </button>
                <button onClick={() => send()} disabled={!input.trim() || loading}
                  className="p-2.5 rounded-full transition-all shadow-lg disabled:opacity-40"
                  style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent2,var(--accent)))', color: '#fff' }}>
                  {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={17} style={{ marginLeft: 1 }} />}
                </button>
              </div>
            </div>
            <p className="text-xs text-center opacity-20 font-medium mt-2">MARIAM can make mistakes. Verify important medical information.</p>
          </div>
        </div>
      </div>
    </div>
    </div>
  );
}
