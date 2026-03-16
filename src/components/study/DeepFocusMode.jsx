import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, X } from 'lucide-react';

export default function DeepFocusMode({ active, onExit, children, sessionLabel = 'Study Session' }) {
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const startRef = useRef(Date.now());
  const pauseRef = useRef(0);

  useEffect(() => {
    if (!active) { setElapsed(0); setPaused(false); return; }
    startRef.current = Date.now();
    const id = setInterval(() => {
      if (!paused) setElapsed(Math.floor((Date.now() - startRef.current - pauseRef.current) / 1000));
    }, 1000);
    return () => clearInterval(id);
  }, [active, paused]);

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;

  if (!active) return null;
  return (
    <div className="fixed inset-0 z-[9999] flex flex-col" style={{ background: 'var(--bg)' }}>
      <div className="flex items-center justify-between px-6 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full animate-pulse" style={{ background: 'var(--success)' }} />
          <span className="text-xs font-black uppercase tracking-widest opacity-50">{sessionLabel}</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="font-mono text-lg font-black tabular-nums" style={{ color: 'var(--accent)' }}>{fmt(elapsed)}</span>
          <button onClick={() => setPaused(p => !p)} className="w-8 h-8 glass rounded-xl flex items-center justify-center">
            {paused ? <Play size={14} /> : <Pause size={14} />}
          </button>
          <button onClick={onExit} className="w-8 h-8 glass rounded-xl flex items-center justify-center" title="Exit Deep Focus">
            <X size={14} />
          </button>
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar">{children}</div>
    </div>
  );
}
