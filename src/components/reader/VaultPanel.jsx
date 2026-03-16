/**
 * MARIAM PRO — VaultPanel Component
 * Document vault showing flashcards, exams, cases, notes, mind maps, timelines for active doc.
 */
import React, { useState } from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

function Section({ title, count, colorClass, children, id, expanded, toggle }) {
  return (
    <div className="glass rounded-2xl overflow-hidden">
      <button onClick={() => toggle(id)}
        className="w-full flex items-center justify-between p-4 hover:bg-[var(--accent)]/5 transition-colors rounded-t-2xl">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-black uppercase tracking-widest ${colorClass}`}>{title}</span>
          <span className={`text-xs font-black px-2 py-0.5 rounded-full ${colorClass} bg-current/10`}>{count}</span>
        </div>
        {expanded[id] ? <ChevronUp size={18} className="opacity-40" /> : <ChevronDown size={18} className="opacity-40" />}
      </button>
      {expanded[id] && <div className="border-t border-[color:var(--border2,var(--border))] p-3 space-y-2">{children}</div>}
    </div>
  );
}

export default function VaultPanel({
  activeDocId, flashcards, setFlashcards, exams, setExams, cases, setCases,
  notes, setNotes, addToast, setView, mindMaps, timelines, MindMap, TimelineView
}) {
  const [expanded, setExpanded] = useState({});
  const toggle = k => setExpanded(p => ({ ...p, [k]: !p[k] }));

  const docFc = flashcards.filter(f => f.docId === activeDocId);
  const docEx = exams.filter(e => e.docId === activeDocId);
  const docCa = cases.filter(c => c.docId === activeDocId);
  const docNo = notes.filter(n => n.docId === activeDocId);
  const docMm = (mindMaps || []).filter(m => m.docId === activeDocId);
  const docTl = (timelines || []).filter(t => t.docId === activeDocId);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-3">
      <Section id="fc" title="Flashcards" count={docFc.reduce((s, f) => s + (f.cards?.length || 0), 0)}
        colorClass="text-[var(--accent)]" expanded={expanded} toggle={toggle}>
        {docFc.map(set => (
          <div key={set.id} className="flex items-center justify-between p-3 glass rounded-xl">
            <div>
              <p className="text-sm font-bold">{set.title}</p>
              <p className="text-xs opacity-40">{set.cards?.length} cards · {new Date(set.createdAt).toLocaleDateString()}</p>
            </div>
            <div className="flex gap-1.5">
              <button onClick={() => setView('flashcards')} className="text-xs font-black px-2 py-1 rounded-lg badge">Study</button>
              {!set.isBuiltin && (
                <button onClick={() => setFlashcards(p => p.filter(f => f.id !== set.id))}
                  className="text-xs font-black px-2 py-1 rounded-lg badge badge-danger">Del</button>
              )}
            </div>
          </div>
        ))}
        {!docFc.length && <p className="text-center text-xs opacity-40 py-2 font-bold">No flashcards yet</p>}
      </Section>

      <Section id="ex" title="Exams" count={docEx.reduce((s, e) => s + (e.questions?.length || 0), 0)}
        colorClass="text-[var(--accent)]" expanded={expanded} toggle={toggle}>
        {docEx.map(ex => (
          <div key={ex.id} className="flex items-center justify-between p-3 glass rounded-xl">
            <div><p className="text-xs font-bold">{ex.title}</p><p className="text-xs opacity-40">{ex.questions?.length} Qs</p></div>
            <div className="flex gap-1.5">
              <button onClick={() => setView('exams')} className="text-xs font-black px-2 py-1 rounded-lg badge badge-success">Take</button>
              {!ex.isBuiltin && (
                <button onClick={() => setExams(p => p.filter(e => e.id !== ex.id))}
                  className="text-xs font-black px-2 py-1 rounded-lg badge badge-danger">Del</button>
              )}
            </div>
          </div>
        ))}
        {!docEx.length && <p className="text-center text-xs opacity-40 py-2 font-bold">No exams yet</p>}
      </Section>

      <Section id="ca" title="Cases" count={docCa.reduce((s, c) => s + (c.questions?.length || 0), 0)}
        colorClass="text-[var(--accent)]" expanded={expanded} toggle={toggle}>
        {docCa.map(c => (
          <div key={c.id} className="flex items-center justify-between p-3 glass rounded-xl">
            <div><p className="text-xs font-bold">{c.title}</p><p className="text-xs opacity-40">{c.questions?.length} cases</p></div>
            <div className="flex gap-1.5">
              <button onClick={() => setView('cases')} className="text-xs font-black px-2 py-1 rounded-lg badge badge-info">Start</button>
              {!c.isBuiltin && (
                <button onClick={() => setCases(p => p.filter(x => x.id !== c.id))}
                  className="text-xs font-black px-2 py-1 rounded-lg badge badge-danger">Del</button>
              )}
            </div>
          </div>
        ))}
        {!docCa.length && <p className="text-center text-xs opacity-40 py-2 font-bold">No cases yet</p>}
      </Section>

      <Section id="no" title="Notes" count={docNo.length}
        colorClass="text-[var(--accent)]" expanded={expanded} toggle={toggle}>
        {docNo.map(n => (
          <div key={n.id} className="p-3 glass rounded-xl">
            <div className="flex justify-between items-start mb-2">
              <p className="text-xs font-bold">{n.title}</p>
              <button onClick={() => setNotes(p => p.filter(x => x.id !== n.id))}
                className="text-xs px-1.5 py-0.5 badge badge-danger rounded-lg font-black">Del</button>
            </div>
            <p className="text-xs opacity-60 line-clamp-3 leading-relaxed">{n.content}</p>
          </div>
        ))}
        {!docNo.length && <p className="text-center text-xs opacity-40 py-2 font-bold">No notes yet</p>}
      </Section>

      {docMm.length > 0 && MindMap && (
        <Section id="mm" title="Mind Maps" count={docMm.length}
          colorClass="text-[var(--accent)]" expanded={expanded} toggle={toggle}>
          {docMm.map((m, i) => (
            <div key={m.id} className="glass rounded-xl overflow-hidden">
              <p className="text-xs font-bold p-2 border-b border-[color:var(--border2,var(--border))] opacity-60">
                {m.data?.topic || `Map ${i + 1}`} · Pgs {m.pages}
              </p>
              <MindMap data={m.data} />
            </div>
          ))}
        </Section>
      )}

      {docTl.length > 0 && TimelineView && (
        <Section id="tl" title="Timelines" count={docTl.length}
          colorClass="text-teal-500" expanded={expanded} toggle={toggle}>
          {docTl.map((t, i) => (
            <div key={t.id} className="glass rounded-xl p-3">
              <p className="text-xs font-bold mb-3 opacity-60">Timeline · Pgs {t.pages}</p>
              <TimelineView events={t.events || []} />
            </div>
          ))}
        </Section>
      )}
    </div>
  );
}
