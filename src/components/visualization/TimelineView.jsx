/**
 * MARIAM PRO — TimelineView
 * Vertical timeline with gradient connector.
 */
import React from 'react';

export default function TimelineView({ events = [] }) {
  if (!events.length) return <div className="flex items-center justify-center h-32 opacity-40 text-sm font-bold">No timeline data</div>;
  return (
    <div className="relative pl-8 space-y-4">
      <div className="absolute left-3 top-0 bottom-0 w-0.5 bg-gradient-to-b from-[var(--accent)] via-[var(--accent)]/40 to-transparent" />
      {events.map((ev, i) => (
        <div key={i} className="relative">
          <div className="absolute -left-5 w-4 h-4 rounded-full bg-[var(--accent)] border-2 border-[var(--bg)] flex items-center justify-center text-xs text-white font-black">{i + 1}</div>
          <div className="glass rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-black text-[var(--accent)] uppercase tracking-widest">{ev.date || ev.time || ev.year || ''}</span>
              {ev.page && <span className="text-xs opacity-40 font-mono">p.{ev.page}</span>}
            </div>
            <p className="text-xs font-bold leading-relaxed">{ev.event || ev.title || ev.description || ev}</p>
            {ev.significance && <p className="text-xs opacity-60 mt-1 italic">{ev.significance}</p>}
          </div>
        </div>
      ))}
    </div>
  );
}
