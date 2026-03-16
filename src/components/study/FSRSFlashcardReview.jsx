import React, { useState } from 'react';
import { ChevronLeft, Sparkles } from 'lucide-react';

export default function FSRSFlashcardReview({ set, onUpdate, onClose }) {
  const FSRS = window.__MARIAM_FSRS__ || { schedule: (c) => c, masteryLevel: () => 'new' };
  const [cards] = useState(() => (set.cards || []).filter(c => !c.nextReview || c.nextReview <= Date.now()).sort(() => Math.random() - .5));
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [reviewed, setReviewed] = useState(0);
  const [done, setDone] = useState(false);

  const rate = (grade) => {
    const card = cards[idx]; if (!card) return;
    const updated = FSRS.schedule(card, grade);
    onUpdate({ ...set, cards: set.cards.map(c => c === card ? updated : c) });
    setReviewed(r => r + 1);
    if (idx + 1 >= cards.length) setDone(true);
    else { setIdx(i => i + 1); setFlipped(false); }
  };

  const card = cards[idx];
  const pct = cards.length ? Math.round((idx / cards.length) * 100) : 100;
  const RATINGS = [{ g: 0, label: 'Again', col: 'var(--danger)', desc: '< 1 day' },{ g: 1, label: 'Hard', col: 'var(--warning)', desc: '~1-2 days' },{ g: 2, label: 'Good', col: 'var(--success)', desc: 'Normal interval' },{ g: 3, label: 'Easy', col: '#3b82f6', desc: 'Longer interval' }];

  if (done || !card) return (
    <div className="fixed inset-0 z-[8000] flex flex-col items-center justify-center" style={{ background: 'var(--bg)' }}>
      <div className="glass rounded-3xl p-10 text-center max-w-sm w-full mx-4 animate-scale-in" style={{ border: '1px solid var(--border)' }}>
        <div className="text-5xl mb-4">🏆</div><h2 className="text-3xl font-black gradient-text mb-2">Session Done!</h2>
        <p className="text-sm opacity-50 mb-6">{reviewed} cards reviewed</p>
        <button onClick={onClose} className="btn-accent px-8 py-3 rounded-2xl font-black w-full">Continue</button>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 z-[8000] flex flex-col" style={{ background: 'var(--bg)' }}>
      <div className="flex items-center justify-between px-5 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <button onClick={onClose} className="w-8 h-8 glass rounded-xl flex items-center justify-center"><ChevronLeft size={16} /></button>
        <div className="flex-1 mx-4"><div className="progress-bar h-2"><div className="progress-fill" style={{ width: `${pct}%` }} /></div><p className="text-xs opacity-40 text-center mt-1">{idx + 1} / {cards.length} due</p></div>
        <div className="w-8" />
      </div>
      <div className="flex-1 flex flex-col items-center justify-center p-6 gap-6">
        <div className="w-full max-w-lg perspective-1000">
          <div className="glass rounded-3xl p-8 min-h-48 flex flex-col items-center justify-center cursor-pointer card-hover text-center relative" style={{ border: '1px solid var(--border)' }} onClick={() => setFlipped(true)}>
            <div className="text-xs font-black uppercase tracking-widest opacity-30 absolute top-4 left-4">{flipped ? 'Answer' : 'Question'}</div>
            {card.stability > 0 && <div className="absolute top-4 right-4"><span className="badge" style={{ background: 'var(--accent)/10', color: 'var(--accent)', fontSize: 10 }}>{FSRS.masteryLevel(card)}</span></div>}
            <p className="text-lg font-bold leading-relaxed mt-4">{flipped ? (card.a || card.back) : (card.q || card.front)}</p>
            {!flipped && <p className="text-xs opacity-30 mt-6">Tap to reveal answer</p>}
          </div>
        </div>
        {flipped ? (
          <div className="grid grid-cols-4 gap-3 w-full max-w-lg animate-slide-up">
            {RATINGS.map(({ g, label, col, desc }) => (
              <button key={g} onClick={() => rate(g)} className="glass rounded-2xl p-3 flex flex-col items-center gap-1 transition-all hover:scale-105 active:scale-95" style={{ border: `2px solid ${col}20` }}
                onMouseEnter={e => e.currentTarget.style.background = col + '18'} onMouseLeave={e => e.currentTarget.style.background = ''}>
                <span className="text-sm font-black" style={{ color: col }}>{label}</span><span className="text-xs opacity-40">{desc}</span>
              </button>
            ))}
          </div>
        ) : (<button onClick={() => setFlipped(true)} className="btn-accent px-10 py-3 rounded-2xl font-black">Show Answer</button>)}
      </div>
    </div>
  );
}
