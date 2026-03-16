/**
 * MARIAM PRO — Chat Sidebar
 * Session list with search, pinning, projects, and context menus.
 */
import React, { useState, useMemo } from 'react';
import { Plus, X, Search, Pin, Copy, Trash2, MoreVertical, MessageSquare, FolderOpen, Brain } from 'lucide-react';

export default function ChatSidebar({
  sessions, selSess, onNewSession, onLoadSession, onDeleteSession,
  sidebarOpen, setSidebarOpen, projects, setProjects
}) {
  const [sessSearch, setSessSearch] = useState('');
  const [pinnedIds, setPinnedIds] = useState([]);
  const [contextMenu, setContextMenu] = useState(null);
  const [selProject, setSelProject] = useState(null);
  const [sidebarTab, setSidebarTab] = useState('chats');
  const [showNewProject, setShowNewProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const createProject = () => {
    if (!newProjectName.trim()) return;
    const p = { id: Date.now().toString(), name: newProjectName.trim(), color: ['#6366f1', '#8b5cf6', '#3b82f6', '#10b981', '#f59e0b', '#ef4444'][Math.floor(Math.random() * 6)], createdAt: new Date().toISOString() };
    setProjects(prev => [...prev, p]);
    setNewProjectName('');
    setShowNewProject(false);
  };

  const copySession = (id) => {
    const sess = sessions.find(s => s.id === id);
    if (!sess) return;
    const text = sess.messages.map(m => `${m.role === 'user' ? 'You' : 'MARIAM'}: ${m.content}`).join('\n\n');
    navigator.clipboard?.writeText(text);
    setContextMenu(null);
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
    const groups = { Today: [], Yesterday: [], 'Last 7 Days': [], Older: [] };
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
      onClick={() => { onLoadSession(s); if (window.innerWidth < 1024) setSidebarOpen(false); }}>
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

  return (
    <>
      {/* Context menu */}
      {contextMenu && (
        <div className="fixed z-[9999] glass rounded-xl shadow-2xl border border-[color:var(--border2,var(--border))] py-1 min-w-[180px]"
          style={{ left: Math.min(contextMenu.x, window.innerWidth - 200), top: Math.min(contextMenu.y, window.innerHeight - 140) }}
          onClick={e => e.stopPropagation()}>
          <button onClick={() => { setPinnedIds(p => p.includes(contextMenu.id) ? p.filter(x => x !== contextMenu.id) : [...p, contextMenu.id]); setContextMenu(null); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-[var(--accent)]/10 transition-colors">
            <Pin size={15} />{pinnedIds.includes(contextMenu.id) ? 'Unpin' : 'Pin to top'}
          </button>
          <button onClick={() => copySession(contextMenu.id)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-[var(--accent)]/10 transition-colors">
            <Copy size={15} />Copy transcript
          </button>
          <div className="my-1 border-t border-[color:var(--border2,var(--border))]" />
          <button onClick={() => { onDeleteSession(contextMenu.id); setContextMenu(null); }}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-sm font-medium hover:bg-[var(--danger-bg)] transition-colors" style={{ color: 'var(--danger)' }}>
            <Trash2 size={15} />Delete chat
          </button>
        </div>
      )}

      {/* Mobile overlay */}
      {sidebarOpen && <div className="lg:hidden fixed inset-0 bg-black/40 z-[40] backdrop-blur-sm" onClick={() => setSidebarOpen(false)} />}

      <div className={`flex flex-col transition-all duration-300 shrink-0 z-[41]
        ${sidebarOpen ? 'w-72' : 'w-0 overflow-hidden'}
        lg:relative absolute inset-y-0 left-0`}
        style={{ borderRight: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.02)', backdropFilter: 'blur(40px)', WebkitBackdropFilter: 'blur(40px)' }}
        onClick={() => contextMenu && setContextMenu(null)}>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[color:var(--border2,var(--border))] shrink-0">
          <span className="text-base font-black">MARIAM Chat</span>
          <div className="flex items-center gap-1">
            <button onClick={onNewSession} className="w-8 h-8 btn-accent rounded-xl flex items-center justify-center shadow-sm" title="New chat"><Plus size={18} /></button>
            <button onClick={() => setSidebarOpen(false)} className="lg:hidden w-8 h-8 glass rounded-xl flex items-center justify-center opacity-60"><X size={18} /></button>
          </div>
        </div>

        {/* Search */}
        <div className="px-3 py-2 shrink-0">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 opacity-40" />
            <input value={sessSearch} onChange={e => setSessSearch(e.target.value)} placeholder="Search conversations…"
              className="w-full glass-input rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none" />
          </div>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-[color:var(--border2,var(--border))] shrink-0 px-3 gap-1">
          {[['chats', 'Chats', MessageSquare], ['projects', 'Projects', FolderOpen]].map(([id, lbl, Icon]) => (
            <button key={id} onClick={() => setSidebarTab(id)}
              className={`flex items-center gap-1.5 px-3 py-2.5 text-xs font-black uppercase tracking-widest border-b-2 transition-colors -mb-px
                ${sidebarTab === id ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent opacity-50 hover:opacity-80'}`}>
              <Icon size={14} />{lbl}
            </button>
          ))}
        </div>

        {/* Chats list */}
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

        {/* Projects tab */}
        {sidebarTab === 'projects' && (
          <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar py-2">
            <button onClick={() => setShowNewProject(true)}
              className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm font-bold text-[var(--accent)] hover:bg-[var(--accent)]/5 transition-colors">
              <Plus size={16} />New Project
            </button>
            {showNewProject && (
              <div className="mx-3 mb-3 p-3 glass rounded-xl border border-[color:var(--border2,var(--border))] space-y-2">
                <input value={newProjectName} onChange={e => setNewProjectName(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && createProject()}
                  placeholder="Project name…" autoFocus
                  className="w-full text-sm bg-transparent outline-none border-b border-[color:var(--border2,var(--border))] pb-1 text-[var(--text)]" />
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
                className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-all ${selProject === p.id ? 'bg-[var(--accent)]/10' : 'hover:bg-[var(--accent)]/6'}`}>
                <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: p.color }} />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold truncate">{p.name}</p>
                  <p className="text-xs opacity-40">{sessions.filter(s => s.projectId === p.id).length} chats</p>
                </div>
              </button>
            ))}
          </div>
        )}

        {/* Footer */}
        <div className="shrink-0 p-3 border-t border-[color:var(--border2,var(--border))]">
          <div className="flex items-center gap-2 px-2 py-2 text-xs opacity-40">
            <Brain size={14} />
            <span className="font-bold">{sessions.length} conversations · {sessions.reduce((a, s) => a + (s.msgCount || 0), 0)} messages</span>
          </div>
        </div>
      </div>
    </>
  );
}
