import React, { useState, useMemo } from 'react';
import { Plus, PenLine, Download, Trash2, Sparkles, Loader2, ChevronLeft, X } from 'lucide-react';
import { callAIStreaming } from '../../services/ai/callAIStreaming';

export default function NotesView({ notes, setNotes, docs, settings, addToast }) {
  const [search, setSearch] = useState('');
  const [activeTag, setActiveTag] = useState(null);
  const [editingId, setEditingId] = useState(null);
  const [draft, setDraft] = useState({ title: '', content: '', tags: [] });
  const [tagInput, setTagInput] = useState('');
  const [aiExpanding, setAiExpanding] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const allTags = useMemo(() => {
    const s = new Set();
    notes.forEach(n => (n.tags || []).forEach(t => s.add(t)));
    return [...s];
  }, [notes]);

  const filtered = useMemo(() => {
    let list = notes;
    if (search) list = list.filter(n => (n.title + n.content + (n.tags || []).join('')).toLowerCase().includes(search.toLowerCase()));
    if (activeTag) list = list.filter(n => (n.tags || []).includes(activeTag));
    return list.sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }, [notes, search, activeTag]);

  const openNew = () => { setDraft({ title: '', content: '', tags: [] }); setEditingId('__new__'); setShowNew(true); };

  const saveNote = () => {
    if (!draft.title.trim() && !draft.content.trim()) { addToast('Cannot save empty note', 'warn'); return; }
    if (editingId === '__new__') {
      const n = { id: Date.now().toString(), title: draft.title || 'Untitled', content: draft.content, tags: draft.tags, createdAt: Date.now(), updatedAt: Date.now() };
      setNotes(p => [n, ...p]);
      addToast('Note saved ✓', 'success');
    } else {
      setNotes(p => p.map(n => n.id === editingId ? { ...n, ...draft, updatedAt: Date.now() } : n));
      addToast('Note updated ✓', 'success');
    }
    setEditingId(null); setShowNew(false);
  };

  const deleteNote = (id) => {
    setNotes(p => p.filter(n => n.id !== id));
    if (editingId === id) { setEditingId(null); setShowNew(false); }
    addToast('Note deleted', 'info');
  };

  const aiExpand = async () => {
    if (!draft.content.trim()) { addToast('Write some content first', 'warn'); return; }
    if (!settings.apiKey) { addToast('Set an API key in Settings', 'warn'); return; }
    setAiExpanding(true);
    try {
      await callAIStreaming(
        `Expand and enrich this medical study note. Add clinical pearls, mnemonics, and key concepts. Keep it as a well-organized note.\n\nNote:\n${draft.content}`,
        chunk => { setDraft(p => ({ ...p, content: p.content + chunk })); },
        settings, 800
      );
    } catch (e) { addToast('AI expansion failed: ' + e.message, 'error'); }
    setAiExpanding(false);
  };

  const exportNote = (note) => {
    const text = `# ${note.title}\n\nTags: ${(note.tags || []).join(', ')}\n\n${note.content}`;
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = `${note.title.replace(/\s+/g, '-')}.md`; a.click();
    URL.revokeObjectURL(url);
    addToast('Note exported ✓', 'success');
  };

  const addTag = () => {
    const t = tagInput.trim().toLowerCase();
    if (t && !draft.tags.includes(t)) setDraft(p => ({ ...p, tags: [...p.tags, t] }));
    setTagInput('');
  };

  if (editingId) return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => { setEditingId(null); setShowNew(false); }} className="w-8 h-8 glass rounded-xl flex items-center justify-center"><ChevronLeft size={16} /></button>
        <h2 className="font-black flex-1">{editingId === '__new__' ? 'New Note' : 'Edit Note'}</h2>
        <button onClick={aiExpand} disabled={aiExpanding}
          className="glass px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5 shrink-0"
          style={{ color: 'var(--accent)', border: '1px solid var(--accent)/30' }}>
          {aiExpanding ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} AI Expand
        </button>
        <button onClick={saveNote} className="btn-accent px-4 py-1.5 rounded-xl text-xs font-black shrink-0">Save</button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
        <input value={draft.title} onChange={e => setDraft(p => ({ ...p, title: e.target.value }))}
          placeholder="Note title…"
          className="w-full glass-input rounded-xl px-4 py-3 font-black text-lg outline-none"
          style={{ background: 'var(--surface,var(--card))', border: '1px solid var(--border)' }} />
        <textarea value={draft.content} onChange={e => setDraft(p => ({ ...p, content: e.target.value }))}
          placeholder="Write your notes here… Use markdown for formatting."
          className="w-full glass-input rounded-xl px-4 py-3 text-sm outline-none resize-none leading-relaxed"
          style={{ minHeight: 280, background: 'var(--surface,var(--card))', border: '1px solid var(--border)', fontFamily: 'inherit' }} />
        <div className="glass rounded-xl p-3" style={{ border: '1px solid var(--border)' }}>
          <div className="flex flex-wrap gap-2 mb-2">
            {draft.tags.map(t => (
              <span key={t} className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-black"
                style={{ background: 'var(--accent)/15', color: 'var(--accent)' }}>
                #{t}
                <button onClick={() => setDraft(p => ({ ...p, tags: p.tags.filter(x => x !== t) }))}><X size={10} /></button>
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            <input value={tagInput} onChange={e => setTagInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' || e.key === ',') { e.preventDefault(); addTag(); } }}
              placeholder="Add tag (enter to add)…" className="flex-1 glass-input rounded-lg px-3 py-1.5 text-xs outline-none" />
            <button onClick={addTag} className="glass px-3 py-1.5 rounded-lg text-xs font-black" style={{ color: 'var(--accent)' }}>+ Add</button>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0 space-y-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <h2 className="font-black text-lg flex-1">📓 Notes</h2>
          <button onClick={openNew} className="btn-accent px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2">
            <Plus size={14} /> New Note
          </button>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search notes…"
          className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none"
          style={{ background: 'var(--surface,var(--card))', border: '1px solid var(--border)' }} />
        {allTags.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-1">
            <button onClick={() => setActiveTag(null)} className="px-3 py-1.5 rounded-lg text-xs font-black shrink-0 transition-all"
              style={!activeTag ? { background: 'var(--accent)', color: '#fff' } : { background: 'var(--surface)', opacity: .6 }}>All</button>
            {allTags.map(t => (
              <button key={t} onClick={() => setActiveTag(t === activeTag ? null : t)}
                className="px-3 py-1.5 rounded-lg text-xs font-black shrink-0 transition-all"
                style={t === activeTag ? { background: 'var(--accent)', color: '#fff' } : { background: 'var(--surface)', color: 'var(--text)', opacity: .6 }}>#{t}</button>
            ))}
          </div>
        )}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {filtered.length === 0 ? (
          <div className="empty-state py-16">
            <div className="empty-icon"><PenLine size={40} /></div>
            <p className="font-black text-lg mt-4">No notes yet</p>
            <p className="text-sm opacity-40 mt-1">Start taking notes from your documents</p>
            <button onClick={openNew} className="btn-accent px-6 py-3 rounded-2xl font-black mt-4">Create First Note</button>
          </div>
        ) : filtered.map(note => (
          <div key={note.id} className="glass rounded-2xl p-4 transition-all card-hover" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <h3 className="font-black flex-1 truncate">{note.title}</h3>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => exportNote(note)} className="w-7 h-7 glass rounded-lg flex items-center justify-center opacity-50 hover:opacity-80" title="Export"><Download size={12} /></button>
                <button onClick={() => { setDraft({ title: note.title, content: note.content, tags: note.tags || [] }); setEditingId(note.id); }}
                  className="w-7 h-7 glass rounded-lg flex items-center justify-center opacity-50 hover:opacity-80" title="Edit"><PenLine size={12} /></button>
                <button onClick={() => deleteNote(note.id)} className="w-7 h-7 glass rounded-lg flex items-center justify-center opacity-50 hover:opacity-80" style={{ color: 'var(--danger)' }} title="Delete"><Trash2 size={12} /></button>
              </div>
            </div>
            <p className="text-xs opacity-50 line-clamp-3 leading-relaxed">{note.content}</p>
            <div className="flex items-center justify-between mt-3">
              <div className="flex gap-1.5 flex-wrap">
                {(note.tags || []).map(t => (
                  <span key={t} className="px-2 py-0.5 rounded-lg text-xs font-bold" style={{ background: 'var(--accent)/10', color: 'var(--accent)' }}>#{t}</span>
                ))}
              </div>
              <span className="text-xs opacity-30">{new Date(note.updatedAt || note.createdAt || 0).toLocaleDateString()}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
