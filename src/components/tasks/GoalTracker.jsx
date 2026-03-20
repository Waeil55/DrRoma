import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Target, Plus, Trash2, Check, Sparkles } from 'lucide-react';

const DEFAULT_GOALS = [
  { id: 'cards', label: 'Review flashcards', target: 20, unit: 'cards', icon: '' },
  { id: 'chapters', label: 'Read chapters', target: 1, unit: 'chapters', icon: '' },
];

export default function GoalTracker({ dailyProgress = {}, onGoalsChange, goals: savedGoals }) {
  const [goals, setGoals] = useState(() => savedGoals?.length ? savedGoals : DEFAULT_GOALS);
  const [showAdd, setShowAdd] = useState(false);
  const [newLabel, setNewLabel] = useState('');
  const [newTarget, setNewTarget] = useState(10);
  const [newUnit, setNewUnit] = useState('items');
  const confettiRef = useRef(null);
  const [showConfetti, setShowConfetti] = useState(false);

  useEffect(() => {
    if (savedGoals?.length) setGoals(savedGoals);
  }, [savedGoals]);

  const progressMap = useMemo(() => {
    const map = {};
    goals.forEach(g => {
      const val = dailyProgress[g.id] || 0;
      map[g.id] = { current: val, pct: Math.min(100, (val / g.target) * 100) };
    });
    return map;
  }, [goals, dailyProgress]);

  const allComplete = useMemo(() =>
    goals.length > 0 && goals.every(g => (progressMap[g.id]?.pct || 0) >= 100),
    [goals, progressMap]
  );

  useEffect(() => {
    if (allComplete) {
      setShowConfetti(true);
      const t = setTimeout(() => setShowConfetti(false), 2500);
      return () => clearTimeout(t);
    }
  }, [allComplete]);

  const addGoal = useCallback(() => {
    if (!newLabel.trim()) return;
    const updated = [...goals, {
      id: `custom_${Date.now()}`,
      label: newLabel.trim(),
      target: Math.max(1, newTarget),
      unit: newUnit || 'items',
      icon: '',
    }];
    setGoals(updated);
    onGoalsChange?.(updated);
    setNewLabel('');
    setNewTarget(10);
    setNewUnit('items');
    setShowAdd(false);
  }, [goals, newLabel, newTarget, newUnit, onGoalsChange]);

  const removeGoal = useCallback((id) => {
    const updated = goals.filter(g => g.id !== id);
    setGoals(updated);
    onGoalsChange?.(updated);
  }, [goals, onGoalsChange]);

  return (
    <div className="glass rounded-2xl p-4 relative overflow-hidden">
      {showConfetti && (
        <div ref={confettiRef} className="goal-confetti-burst" aria-hidden="true">
          {Array.from({ length: 24 }, (_, i) => (
            <span key={i} className="confetti-particle" style={{
              '--angle': `${(i / 24) * 360}deg`,
              '--distance': `${60 + Math.random() * 60}px`,
              '--color': ['var(--accent)', '#f59e0b', '#10b981', '#8b5cf6', '#ef4444', '#06b6d4'][i % 6],
              animationDelay: `${Math.random() * 0.3}s`,
            }} />
          ))}
        </div>
      )}

      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Target size={18} style={{ color: 'var(--accent)' }} />
          <h3 className="font-bold text-sm">Daily Goals</h3>
          {allComplete && <Sparkles size={14} style={{ color: '#f59e0b' }} />}
        </div>
        <button onClick={() => setShowAdd(!showAdd)} className="glass w-7 h-7 rounded-lg flex items-center justify-center hover:opacity-80 transition-opacity" aria-label="Add goal">
          <Plus size={14} />
        </button>
      </div>

      <div className="space-y-3">
        {goals.map(g => {
          const p = progressMap[g.id] || { current: 0, pct: 0 };
          const done = p.pct >= 100;
          return (
            <div key={g.id} className="flex items-center gap-3">
              <div style={{ position: 'relative', width: 40, height: 40, flexShrink: 0 }}>
                <svg width={40} height={40} style={{ transform: 'rotate(-90deg)' }}>
                  <circle cx={20} cy={20} r={16} fill="none" stroke="var(--border)" strokeWidth={3} />
                  <circle cx={20} cy={20} r={16} fill="none"
                    stroke={done ? '#10b981' : 'var(--accent)'}
                    strokeWidth={3} strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 16}
                    strokeDashoffset={2 * Math.PI * 16 * (1 - p.pct / 100)}
                    style={{ transition: 'stroke-dashoffset 0.6s ease' }}
                  />
                </svg>
                <span className="absolute inset-0 flex items-center justify-center text-xs">
                  {done ? <Check size={14} style={{ color: '#10b981' }} /> : g.icon}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold truncate">{g.label}</div>
                <div className="text-xs opacity-50">{p.current}/{g.target} {g.unit}</div>
              </div>
              {!DEFAULT_GOALS.find(d => d.id === g.id) && (
                <button onClick={() => removeGoal(g.id)} className="opacity-30 hover:opacity-80 transition-opacity" aria-label={`Remove ${g.label} goal`}>
                  <Trash2 size={14} />
                </button>
              )}
            </div>
          );
        })}
      </div>

      {showAdd && (
        <div className="mt-3 pt-3 border-t" style={{ borderColor: 'var(--border)' }}>
          <div className="space-y-2">
            <input value={newLabel} onChange={e => setNewLabel(e.target.value)} placeholder="Goal name..." className="w-full glass rounded-lg px-3 py-2 text-sm outline-none" style={{ background: 'var(--surface)', color: 'var(--text)' }} />
            <div className="flex gap-2">
              <input type="number" value={newTarget} onChange={e => setNewTarget(Number(e.target.value))} min={1} className="w-20 glass rounded-lg px-3 py-2 text-sm outline-none" style={{ background: 'var(--surface)', color: 'var(--text)' }} />
              <input value={newUnit} onChange={e => setNewUnit(e.target.value)} placeholder="unit" className="flex-1 glass rounded-lg px-3 py-2 text-sm outline-none" style={{ background: 'var(--surface)', color: 'var(--text)' }} />
              <button onClick={addGoal} className="px-4 py-2 rounded-lg text-sm font-bold text-white" style={{ background: 'var(--accent)' }} aria-label="Save goal">
                Add
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
