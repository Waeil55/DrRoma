/**
 * MARIAM PRO  Match Game Component
 * Memory-style flashcard matching game with timer.
 */
import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';

const GAME_LIMIT = 120; // seconds

export default function MatchGame({ set, onClose }) {
  const [tiles, setTiles] = useState(() => {
    const pairs = (set.cards || []).slice(0, 8).flatMap((c, i) => [
      { id: `q${i}`, pairId: i, text: c.q || c.front, type: 'q' },
      { id: `a${i}`, pairId: i, text: c.a || c.back, type: 'a' },
    ]);
    return pairs.sort(() => Math.random() - 0.5);
  });
  const [selected, setSelected] = useState([]);
  const [matched, setMatched] = useState(new Set());
  const [wrong, setWrong] = useState(new Set());
  const [moves, setMoves] = useState(0);
  const [done, setDone] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [personalBest, setPersonalBest] = useState(null);
  const [newRecord, setNewRecord] = useState(false);

  // Timer
  useEffect(() => {
    if (done) return;
    const t = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(t);
  }, [done]);

  // Check time limit
  useEffect(() => {
    if (elapsed >= GAME_LIMIT && !done) setDone(true);
  }, [elapsed, done]);

  // Check if done
  useEffect(() => {
    if (matched.size >= tiles.length && tiles.length > 0) {
      setDone(true);
      if (personalBest === null || elapsed < personalBest) {
        setPersonalBest(elapsed);
        setNewRecord(true);
      }
    }
  }, [matched.size, tiles.length, elapsed, personalBest]);

  const handleTile = (tile) => {
    if (matched.has(tile.id) || wrong.has(tile.id)) return;
    if (selected.find(s => s.id === tile.id)) return;
    const newSel = [...selected, tile];
    if (newSel.length === 2) {
      setMoves(m => m + 1);
      if (newSel[0].pairId === newSel[1].pairId) {
        // Green glow burst  then fly-off
        setMatched(m => new Set([...m, newSel[0].id, newSel[1].id]));
        setSelected([]);
      } else {
        setWrong(new Set([newSel[0].id, newSel[1].id]));
        setTimeout(() => { setWrong(new Set()); setSelected([]); }, 800);
      }
    } else {
      setSelected(newSel);
    }
  };

  const fmt = s => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
  const timeLeft = Math.max(0, GAME_LIMIT - elapsed);
  const timerPct = timeLeft / GAME_LIMIT;
  const timerR = 22;
  const timerCirc = 2 * Math.PI * timerR;
  const timerDash = timerCirc * timerPct;
  const timerColor = timerPct > 0.4 ? 'var(--accent)' : timerPct > 0.2 ? 'var(--warning)' : 'var(--danger)';

  return (
    <div className="fixed inset-0 z-[9000] flex flex-col" style={{ background: 'var(--bg)' }}>
      <div className="flex items-center justify-between px-5 py-4 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <h2 className="font-black">Match  {set.title}</h2>
          <p className="text-xs opacity-40 mt-0.5">Tap a term, then its definition</p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative w-14 h-14 flex items-center justify-center">
            <svg width={56} height={56} viewBox="0 0 56 56" style={{ transform: 'rotate(-90deg)' }}>
              <circle cx={28} cy={28} r={timerR} fill="none" stroke="var(--border)" strokeWidth={3} />
              <circle cx={28} cy={28} r={timerR} fill="none" stroke={timerColor} strokeWidth={3}
                strokeDasharray={`${timerDash} ${timerCirc}`} strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.5s linear, stroke 0.5s ease' }} />
            </svg>
            <span className="absolute font-mono font-black text-xs" style={{ color: timerColor }}>{fmt(timeLeft)}</span>
          </div>
          <div className="flex flex-col items-end">
            <span className="text-xs opacity-40">{moves} moves</span>
            {personalBest !== null && <span className="text-xs font-black" style={{ color: 'var(--accent)' }}> {fmt(personalBest)}</span>}
          </div>
          <button onClick={onClose} className="w-9 h-9 glass rounded-xl flex items-center justify-center"><X size={16} /></button>
        </div>
      </div>

      {done ? (
        <div className="flex-1 flex flex-col items-center justify-center gap-4 p-6 animate-scale-in">
          <div className="text-6xl">{newRecord ? '' : ''}</div>
          <h2 className="text-3xl font-black gradient-text">{newRecord ? 'New Record!' : 'Complete!'}</h2>
          {newRecord && <p className="text-sm font-black" style={{ color: 'var(--accent)' }}>Personal Best: {fmt(elapsed)}</p>}
          <p className="text-sm opacity-50">{moves} moves · {fmt(elapsed)}</p>
          <div className="flex gap-3 mt-4">
            <button onClick={() => { setMatched(new Set()); setSelected([]); setWrong(new Set()); setMoves(0); setDone(false); setNewRecord(false); setElapsed(0); setTiles(t => [...t].sort(() => Math.random() - .5)); }}
              className="btn-accent px-6 py-3 rounded-2xl font-black">Play Again</button>
            <button onClick={onClose} className="glass px-6 py-3 rounded-2xl font-black" style={{ border: '1px solid var(--border)' }}>Done</button>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-3xl mx-auto">
            {tiles.map((tile, index) => {
              const isMatched = matched.has(tile.id);
              const isWrong = wrong.has(tile.id);
              const isSel = !!selected.find(s => s.id === tile.id);
              return (
                <button key={tile.id} onClick={() => !isMatched && handleTile(tile)}
                  className={`rounded-2xl p-4 text-left text-sm font-medium transition-all min-h-[80px] flex items-center animate-scale-in${isWrong ? ' animate-shake' : ''}${isMatched ? ' animate-match-flyoff' : ''}`}
                  style={{
                    background: isMatched ? 'var(--success-bg)' : isWrong ? 'var(--danger-bg)' : isSel ? 'var(--accent)' : 'var(--surface,var(--card))',
                    color: isMatched ? 'var(--success)' : isWrong ? 'var(--danger)' : isSel ? '#fff' : 'var(--text)',
                    border: `2px solid ${isMatched ? 'var(--success-border)' : isWrong ? 'var(--danger-border)' : isSel ? 'var(--accent)' : 'var(--border)'}`,
                    boxShadow: isMatched ? '0 0 20px rgba(16,185,129,0.5)' : isWrong ? '0 0 12px rgba(239,68,68,0.4)' : 'none',
                    opacity: isMatched ? .6 : 1,
                    transform: isSel ? 'scale(1.02)' : isWrong ? 'scale(.97)' : 'scale(1)',
                    pointerEvents: isMatched ? 'none' : 'auto',
                    animationDelay: `${index * 45}ms`,
                  }}>
                  <span className="line-clamp-3">{tile.text}</span>
                </button>
              );
            })}
          </div>
          <div className="mt-4 flex items-center justify-center gap-2">
            <div className="text-xs opacity-40">{matched.size / 2} / {tiles.length / 2} matched</div>
            <div className="progress-bar w-40 h-2">
              <div className="progress-fill" style={{ width: `${(matched.size / Math.max(tiles.length, 1)) * 100}%` }} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
