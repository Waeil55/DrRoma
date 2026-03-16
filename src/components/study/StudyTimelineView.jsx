import React, { useState, useMemo } from 'react';
import { Layers, CheckSquare, FileText, List, History, ChevronDown } from 'lucide-react';

export default function StudyTimelineView({ flashcards, exams, docs, cases }) {
  const [filter, setFilter] = useState('all');
  const [expandedId, setExpandedId] = useState(null);

  const events = useMemo(() => {
    const list = [];
    flashcards.forEach(set => (set.cards || []).filter(c => c.lastReview).forEach(c => {
      list.push({ id: `c_${c.id || Math.random()}`, type: 'card', ts: c.lastReview, icon: Layers, color: '#8b5cf6',
        title: (c.q || c.front || '').slice(0, 60), sub: set.title, detail: c.a || c.back, rating: c.lastRating });
    }));
    exams.forEach(ex => {
      if (ex.lastScore !== undefined) list.push({ id: `e_${ex.id}`, type: 'exam', ts: ex.lastAttempt || Date.now() - 86400000,
        icon: CheckSquare, color: '#3b82f6', title: ex.title, sub: `Score: ${ex.lastScore}%`,
        detail: `${ex.questions?.length || 0} questions | ${ex.title}`, rating: ex.lastScore >= 80 ? 3 : ex.lastScore >= 60 ? 2 : 1 });
    });
    docs.forEach(d => list.push({ id: `d_${d.id}`, type: 'doc', ts: d.addedAt || d.uploadedAt || 0,
      icon: FileText, color: '#6366f1', title: d.name, sub: `${d.totalPages} pages`, detail: `Uploaded ${d.totalPages}-page document` }));
    return list.filter(e => filter === 'all' || e.type === filter).sort((a, b) => b.ts - a.ts).slice(0, 100);
  }, [flashcards, exams, docs, filter]);

  const grouped = useMemo(() => {
    const groups = {};
    events.forEach(ev => {
      const d = new Date(ev.ts);
      const key = d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
      if (!groups[key]) groups[key] = [];
      groups[key].push(ev);
    });
    return groups;
  }, [events]);

  const FILTERS = [
    { id: 'all', label: 'All', icon: List },
    { id: 'card', label: 'Cards', icon: Layers },
    { id: 'exam', label: 'Exams', icon: CheckSquare },
    { id: 'doc', label: 'Docs', icon: FileText },
  ];

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-lg mb-3">Study Timeline</h2>
        <div className="flex gap-2">
          {FILTERS.map(({ id, label, icon: Icon }) => (
            <button key={id} onClick={() => setFilter(id)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-black transition-all"
              style={filter === id ? { background: 'var(--accent)', color: '#fff' } : { background: 'var(--surface)', opacity: .6 }}>
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4">
        {Object.keys(grouped).length === 0 ? (
          <div className="empty-state py-16">
            <div className="empty-icon"><History size={40} /></div>
            <p className="font-black text-lg mt-4">No activity yet</p>
            <p className="text-sm opacity-40 mt-1">Start studying to see your timeline</p>
          </div>
        ) : Object.entries(grouped).map(([date, dayEvents]) => (
          <div key={date} className="mb-6">
            <div className="flex items-center gap-3 mb-3">
              <div className="text-xs font-black uppercase tracking-widest opacity-40">{date}</div>
              <div className="flex-1 h-px" style={{ background: 'var(--border)' }} />
              <span className="text-xs opacity-30">{dayEvents.length} events</span>
            </div>
            <div className="space-y-2 ml-4 relative">
              <div className="absolute left-0 top-0 bottom-0 w-px" style={{ background: 'var(--border)', left: -16 }} />
              {dayEvents.map(ev => {
                const Icon = ev.icon;
                const isExpanded = expandedId === ev.id;
                return (
                  <div key={ev.id} className="relative">
                    <div className="absolute w-2.5 h-2.5 rounded-full border-2 border-[var(--bg)]"
                      style={{ background: ev.color, left: -20, top: 10 }} />
                    <button onClick={() => setExpandedId(isExpanded ? null : ev.id)}
                      className="w-full glass rounded-xl p-3.5 text-left transition-all card-hover"
                      style={{ border: `1px solid ${isExpanded ? ev.color + '40' : 'var(--border)'}` }}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0" style={{ background: ev.color + '20' }}>
                          <Icon size={14} style={{ color: ev.color }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold truncate">{ev.title}</p>
                          <p className="text-xs opacity-40">{ev.sub}</p>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-xs opacity-30">{new Date(ev.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <ChevronDown size={12} className="opacity-40" style={{ transform: isExpanded ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} />
                        </div>
                      </div>
                      {isExpanded && ev.detail && (
                        <div className="mt-3 pt-3 text-xs opacity-60 leading-relaxed" style={{ borderTop: '1px solid var(--border)' }}>
                          {ev.detail}
                          {ev.rating !== undefined && (
                            <div className="flex gap-2 mt-2">
                              <span className="px-2 py-1 rounded-lg font-black" style={{ background: ev.rating >= 3 ? 'var(--success)/15' : 'var(--warning)/15', color: ev.rating >= 3 ? 'var(--success)' : 'var(--warning)', fontSize: 10 }}>
                                Rating: {['Again', 'Hard', 'Good', 'Easy'][Math.min(3, ev.rating)] || ev.rating + '%'}
                              </span>
                            </div>
                          )}
                        </div>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
