import React, { useState, useEffect, useRef } from 'react';
import { Focus, Play, Pause, RotateCcw, Brain } from 'lucide-react';

export default function EnhancedDeepFocusMode({ active, onExit, flashcards, exams }) {
  const [pomPhase, setPomPhase] = useState('work');
  const [pomSecs, setPomSecs] = useState(25 * 60);
  const [pomRunning, setPomRunning] = useState(false);
  const [cycles, setCycles] = useState(0);
  const [notes, setNotes] = useState('');
  const [ambientMode, setAmbientMode] = useState('none');
  const [sessionGoal, setSessionGoal] = useState('');

  const POM_PHASES = {
    work: { label: ' Focus', mins: 25, color: 'var(--accent)' },
    shortBreak: { label: ' Break', mins: 5, color: 'var(--success)' },
    longBreak: { label: ' Long Break', mins: 15, color: '#06b6d4' },
  };

  useEffect(() => {
    if (!pomRunning) return;
    const t = setInterval(() => {
      setPomSecs(s => {
        if (s <= 1) {
          if (pomPhase === 'work') {
            const newCycles = cycles + 1;
            setCycles(newCycles);
            const nextPhase = newCycles % 4 === 0 ? 'longBreak' : 'shortBreak';
            setPomPhase(nextPhase);
            setPomSecs(POM_PHASES[nextPhase].mins * 60);
            if ('Notification' in window && Notification.permission === 'granted')
              new Notification(' Pomodoro complete!', { body: 'Time for a break.' });
          } else {
            setPomPhase('work');
            setPomSecs(25 * 60);
            if ('Notification' in window && Notification.permission === 'granted')
              new Notification(' Break over!', { body: 'Back to focus.' });
          }
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [pomRunning, pomPhase, cycles]);

  const fmt = (s) => `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`;
  const totalSecs = POM_PHASES[pomPhase].mins * 60;
  const pct = 1 - pomSecs / totalSecs;
  const r = 70;
  const circ = 2 * Math.PI * r;

  const due = flashcards.reduce((s, f) => s + (f.cards?.filter(c => !c.nextReview || c.nextReview <= Date.now()).length || 0), 0);

  if (!active) return null;

  return (
    <div className="fixed inset-0 z-[9700] flex flex-col" style={{ background: 'var(--bg)', backdropFilter: 'blur(4px)' }}>
      {ambientMode === 'rain' && (
        <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(to bottom, rgba(30,58,138,0.3), rgba(17,24,39,0.6))' }} />
      )}

      <div className="flex items-center justify-between px-6 py-4 shrink-0" style={{ borderBottom: '1px solid var(--border2,var(--border))' }}>
        <div className="flex items-center gap-3">
          <Focus size={20} style={{ color: 'var(--accent)' }} />
          <div>
            <h2 className="font-black text-lg">Deep Focus Mode</h2>
            {sessionGoal && <p className="text-xs opacity-50">Goal: {sessionGoal}</p>}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex gap-1">
            {[['none', ''], ['rain', ''], ['white', ''], ['focus', '']].map(([m, emoji]) => (
              <button key={m} onClick={() => setAmbientMode(m)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-sm transition-all"
                style={{ background: ambientMode === m ? 'var(--accent)/20' : 'transparent', border: ambientMode === m ? '1px solid var(--accent)/40' : '1px solid transparent' }}>
                {emoji}
              </button>
            ))}
          </div>
          <button onClick={onExit} className="glass px-4 py-2 rounded-xl text-sm font-black" style={{ border: '1px solid var(--border)', color: 'var(--danger)' }}>Exit Focus</button>
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto flex flex-col items-center justify-center gap-8 p-6">
        <div className="flex flex-col items-center gap-4">
          <div className="relative flex items-center justify-center" style={{ width: 180, height: 180 }}>
            <svg width={180} height={180} viewBox="0 0 180 180" style={{ transform: 'rotate(-90deg)', position: 'absolute' }}>
              <circle cx={90} cy={90} r={r} fill="none" stroke="var(--border)" strokeWidth={8} />
              <circle cx={90} cy={90} r={r} fill="none" stroke={POM_PHASES[pomPhase].color} strokeWidth={8}
                strokeDasharray={`${pct * circ} ${circ}`} strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.5s linear', filter: `drop-shadow(0 0 8px ${POM_PHASES[pomPhase].color})` }} />
            </svg>
            <div className="text-center z-10">
              <div className="text-xs font-black opacity-50 mb-1">{POM_PHASES[pomPhase].label}</div>
              <div className="text-4xl font-black font-mono" style={{ color: POM_PHASES[pomPhase].color }}>{fmt(pomSecs)}</div>
              <div className="text-xs opacity-30 mt-1">Cycle {cycles + 1}</div>
            </div>
          </div>

          <div className="flex gap-2">
            {Object.entries(POM_PHASES).map(([id, { label, color }]) => (
              <button key={id} onClick={() => { setPomPhase(id); setPomSecs(POM_PHASES[id].mins * 60); setPomRunning(false); }}
                className="px-3 py-1.5 rounded-xl text-xs font-black transition-all"
                style={pomPhase === id ? { background: color, color: '#fff' } : { opacity: .5 }}>
                {label}
              </button>
            ))}
          </div>

          <div className="flex gap-3">
            <button onClick={() => setPomRunning(p => !p)}
              className="w-14 h-14 rounded-full flex items-center justify-center transition-all"
              style={{ background: POM_PHASES[pomPhase].color, boxShadow: `0 0 20px ${POM_PHASES[pomPhase].color}50` }}>
              {pomRunning ? <Pause size={20} color="#fff" /> : <Play size={20} color="#fff" />}
            </button>
            <button onClick={() => { setPomSecs(POM_PHASES[pomPhase].mins * 60); setPomRunning(false); }}
              className="w-14 h-14 glass rounded-full flex items-center justify-center" style={{ border: '1px solid var(--border)' }}>
              <RotateCcw size={18} />
            </button>
          </div>
        </div>

        <div className="w-full max-w-md space-y-4">
          <div className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
            <p className="text-xs font-black opacity-40 mb-2 uppercase tracking-widest">Session Goal</p>
            <input value={sessionGoal} onChange={e => setSessionGoal(e.target.value)}
              placeholder="What do you want to accomplish today?"
              className="w-full bg-transparent text-sm outline-none font-medium"
              style={{ color: 'var(--text)' }} />
          </div>

          {due > 0 && (
            <div className="glass rounded-2xl p-4 flex items-center gap-3" style={{ border: '1px solid var(--accent)/30' }}>
              <Brain size={16} style={{ color: 'var(--accent)' }} />
              <div>
                <p className="text-sm font-black">{due} cards due for review</p>
                <p className="text-xs opacity-40">Review them during your focus session</p>
              </div>
            </div>
          )}

          <div className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
            <p className="text-xs font-black opacity-40 mb-2 uppercase tracking-widest">Focus Notes</p>
            <textarea value={notes} onChange={e => setNotes(e.target.value)}
              placeholder="Jot down insights, questions, key concepts…"
              className="w-full bg-transparent text-sm outline-none resize-none leading-relaxed"
              style={{ minHeight: 80, color: 'var(--text)' }} />
          </div>
        </div>
      </div>
    </div>
  );
}
