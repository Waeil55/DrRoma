import React, { useState, useMemo } from 'react';
import { Bookmark, FileText, PenLine, Trash2 } from 'lucide-react';

export default function DocumentAnnotationsView({ docs, notes, setNotes, addToast, setView, setActiveId }) {
  const [search, setSearch] = useState('');
  const [filterDoc, setFilterDoc] = useState('all');
  const [editId, setEditId] = useState(null);
  const [editText, setEditText] = useState('');

  const annotations = useMemo(() => {
    return notes
      .filter(n => n.isAnnotation || n.docId)
      .filter(n => filterDoc === 'all' || n.docId === filterDoc)
      .filter(n => !search || (n.content + n.title + (n.highlight || '')).toLowerCase().includes(search.toLowerCase()))
      .sort((a, b) => (b.updatedAt || 0) - (a.updatedAt || 0));
  }, [notes, filterDoc, search]);

  const docColors = ['#8b5cf6', '#3b82f6', '#06b6d4', '#10b981', '#f59e0b', '#f97316', '#ef4444'];

  const updateAnnotation = (id) => {
    setNotes(p => p.map(n => n.id === id ? { ...n, content: editText, updatedAt: Date.now() } : n));
    setEditId(null);
    addToast('Annotation updated ', 'success');
  };

  const deleteAnnotation = (id) => {
    setNotes(p => p.filter(n => n.id !== id));
    addToast('Annotation deleted', 'info');
  };

  const openDoc = (docId, pageNum) => {
    setActiveId(docId);
    setView('reader');
  };

  const docNames = ['all', ...new Set(annotations.map(a => a.docId).filter(Boolean))];

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0 space-y-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center justify-between">
          <h2 className="font-black text-xl flex items-center gap-2"> Annotations</h2>
          <span className="text-xs opacity-40">{annotations.length} total</span>
        </div>
        <input value={search} onChange={e => setSearch(e.target.value)}
          placeholder="Search annotations…"
          className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none"
          style={{ background: 'var(--surface,var(--card))', border: '1px solid var(--border)' }} />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {docNames.map((id, i) => {
            const doc = id === 'all' ? null : docs.find(d => d.id === id);
            return (
              <button key={id} onClick={() => setFilterDoc(id)}
                className="px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all truncate max-w-[120px]"
                style={id === filterDoc ? { background: docColors[(i - 1) % docColors.length] || 'var(--accent)', color: '#fff' } : { background: 'var(--surface,var(--card))', opacity: .6 }}>
                {id === 'all' ? 'All Docs' : (doc?.name?.slice(0, 20) || 'Unknown')}
              </button>
            );
          })}
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {annotations.length === 0 ? (
          <div className="empty-state py-16">
            <div className="empty-icon"><Bookmark size={36} /></div>
            <p className="font-black text-lg mt-4">No annotations yet</p>
            <p className="text-xs opacity-40 mt-1">Highlight text in documents to create annotations</p>
          </div>
        ) : annotations.map((ann, i) => {
          const doc = docs.find(d => d.id === ann.docId);
          const color = docColors[docs.indexOf(doc) % docColors.length] || 'var(--accent)';
          const isEditing = editId === ann.id;
          return (
            <div key={ann.id} className="glass rounded-2xl p-4" style={{ border: `1px solid ${color}30` }}>
              {ann.highlight && (
                <div className="rounded-xl px-4 py-2.5 mb-3 text-sm italic leading-relaxed"
                  style={{ background: color + '10', borderLeft: `3px solid ${color}` }}>
                  "{ann.highlight}"
                </div>
              )}
              {isEditing ? (
                <div className="space-y-2">
                  <textarea value={editText} onChange={e => setEditText(e.target.value)} rows={3}
                    className="w-full glass-input rounded-xl px-3 py-2.5 text-sm outline-none resize-none"
                    style={{ border: '1px solid var(--border)' }} />
                  <div className="flex gap-2">
                    <button onClick={() => updateAnnotation(ann.id)} className="btn-accent px-4 py-1.5 rounded-xl text-xs font-black">Save</button>
                    <button onClick={() => setEditId(null)} className="glass px-4 py-1.5 rounded-xl text-xs font-black" style={{ border: '1px solid var(--border)' }}>Cancel</button>
                  </div>
                </div>
              ) : (
                <p className="text-sm opacity-70 leading-relaxed">{ann.content}</p>
              )}
              <div className="flex items-center justify-between mt-3">
                <div className="flex items-center gap-2">
                  {doc && <button onClick={() => openDoc(doc.id, ann.page)} className="text-xs font-black flex items-center gap-1.5 hover:opacity-80" style={{ color }}>
                    <FileText size={10} /> {doc.name?.slice(0, 20)} {ann.page ? `p.${ann.page}` : ''}
                  </button>}
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="text-xs opacity-30">{new Date(ann.updatedAt || ann.createdAt).toLocaleDateString()}</span>
                  <button onClick={() => { setEditId(ann.id); setEditText(ann.content); }}
                    className="w-6 h-6 glass rounded-lg flex items-center justify-center opacity-40 hover:opacity-80">
                    <PenLine size={10} />
                  </button>
                  <button onClick={() => deleteAnnotation(ann.id)}
                    className="w-6 h-6 glass rounded-lg flex items-center justify-center opacity-40 hover:opacity-80" style={{ color: 'var(--danger)' }}>
                    <Trash2 size={10} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
