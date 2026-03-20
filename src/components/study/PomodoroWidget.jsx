import React, { useState, useEffect } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';

export default function PomodoroWidget({ onComplete }) {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useState('work');
  const DURATIONS = { work: 25 * 60, short: 5 * 60, long: 15 * 60 };
  const [secs, setSecs] = useState(DURATIONS.work);
  const [running, setRunning] = useState(false);
  const [sessions, setSessions] = useState(0);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setSecs(s => {
        if (s <= 1) {
          clearInterval(id);
          setRunning(false);
          const nextMode = mode === 'work' ? (sessions + 1) % 4 === 0 ? 'long' : 'short' : 'work';
          if (mode === 'work') setSessions(n => n + 1);
          setMode(nextMode);
          setSecs(DURATIONS[nextMode]);
          onComplete?.();
          try { new Notification('MARIAM Timer', { body: mode === 'work' ? ' Break time!' : ' Back to work!', icon: '/M.jpeg' }); } catch {}
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [running, mode, sessions]);

  const fmt = s => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const pct = (1 - secs / DURATIONS[mode]) * 100;
  const r = 18, circ = 2 * Math.PI * r;

  return (
    <div className="relative">
      <button onClick={() => setOpen(p => !p)} className="w-9 h-9 glass rounded-xl flex items-center justify-center relative" title="Pomodoro Timer">
        <svg width={22} height={22} viewBox="0 0 44 44" className="-rotate-90">
          <circle cx={22} cy={22} r={r} fill="none" strokeWidth={4} stroke="var(--border)" />
          <circle cx={22} cy={22} r={r} fill="none" strokeWidth={4} stroke="var(--accent)"
            strokeDasharray={circ} strokeDashoffset={circ - (circ * pct / 100)} strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset .5s linear' }} />
        </svg>
        {running && <span className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full animate-pulse" style={{ background: 'var(--success)' }} />}
      </button>
      {open && (
        <div className="absolute top-12 right-0 z-[9999] glass rounded-2xl shadow-2xl p-4 w-52 animate-scale-in" style={{ border: '1px solid var(--border)' }}>
          <div className="flex gap-1.5 mb-3">
            {Object.keys(DURATIONS).map(m => (
              <button key={m} onClick={() => { setMode(m); setSecs(DURATIONS[m]); setRunning(false); }}
                className="flex-1 text-xs font-black py-1 rounded-lg transition-all"
                style={mode === m ? { background: 'var(--accent)', color: '#fff' } : { opacity: .5 }}>
                {m === 'work' ? '25m' : m === 'short' ? '5m' : '15m'}
              </button>
            ))}
          </div>
          <div className="text-center mb-3">
            <div className="text-3xl font-black tabular-nums" style={{ color: 'var(--accent)', fontFamily: 'JetBrains Mono,monospace' }}>{fmt(secs)}</div>
            <div className="text-xs opacity-40 mt-1 capitalize font-bold">{mode === 'work' ? 'Focus' : mode === 'short' ? 'Short Break' : 'Long Break'} · {sessions} sessions</div>
          </div>
          <div className="progress-bar mb-3"><div className="progress-fill" style={{ width: `${pct}%` }} /></div>
          <div className="flex gap-2">
            <button onClick={() => setRunning(p => !p)} className="btn-accent flex-1 py-2 rounded-xl text-xs font-black">
              {running ? <><Pause size={12} className="inline mr-1" />Pause</> : <><Play size={12} className="inline mr-1" />Start</>}
            </button>
            <button onClick={() => { setSecs(DURATIONS[mode]); setRunning(false); }} className="w-8 h-8 glass rounded-xl flex items-center justify-center opacity-60 hover:opacity-100">
              <RotateCcw size={13} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
