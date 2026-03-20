import React, { useState, useMemo, useRef } from 'react';
import { X, GripVertical } from 'lucide-react';

export default function QuickReviewWidget({ flashcards, setFlashcards, onClose }) {
  const FSRS = window.__MARIAM_FSRS__ || { schedule: (c) => c };

  const dueCards = useMemo(() => {
    const pairs = [];
    flashcards.forEach(set => set.cards?.filter(c => !c.nextReview || c.nextReview <= Date.now()).forEach(c => pairs.push({ card: c, setId: set.id })));
    return pairs;
  }, [flashcards]);

  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [done, setDone] = useState(false);
  const [pos, setPos] = useState({ x: null, y: null });
  const dragRef = useRef({ dragging: false, startX: 0, startY: 0, ox: 0, oy: 0 });
  const widgetRef = useRef(null);

  const rate = (grade) => {
    const { card, setId } = dueCards[idx] || {};
    if (!card) return;
    const updated = FSRS.schedule(card, grade);
    setFlashcards(p => p.map(s => s.id === setId ? { ...s, cards: s.cards.map(c => c.id === card.id ? { ...c, ...updated } : c) } : s));
    if (idx + 1 >= dueCards.length) setDone(true);
    else { setIdx(i => i + 1); setFlipped(false); }
  };

  const startDrag = (e) => {
    e.preventDefault();
    const rect = widgetRef.current?.getBoundingClientRect();
    if (!rect) return;
    const clientX = e.clientX ?? e.touches?.[0]?.clientX ?? 0;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY ?? 0;
    dragRef.current = { dragging: true, startX: clientX, startY: clientY, ox: rect.left, oy: rect.top };
    const onMove = (ev) => {
      const cx = ev.clientX ?? ev.touches?.[0]?.clientX ?? clientX;
      const cy = ev.clientY ?? ev.touches?.[0]?.clientY ?? clientY;
      setPos({ x: dragRef.current.ox + (cx - dragRef.current.startX), y: dragRef.current.oy + (cy - dragRef.current.startY) });
    };
    const onUp = () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); window.removeEventListener('touchmove', onMove); window.removeEventListener('touchend', onUp); };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  };

  if (dueCards.length === 0 || done) return (
    <div className="fixed z-[9800] bottom-28 right-4 glass rounded-2xl p-4 shadow-2xl animate-scale-in" style={{ border: '1px solid var(--border)', minWidth: 200 }}>
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-black">{done ? ' All done!' : ' No cards due!'}</span>
        <button onClick={onClose}><X size={14} /></button>
      </div>
      <p className="text-xs opacity-40">Come back later for more reviews</p>
    </div>
  );

  const curr = dueCards[idx];
  const style = pos.x !== null ? { position: 'fixed', left: pos.x, top: pos.y, bottom: 'auto', right: 'auto', zIndex: 9800 }
    : { position: 'fixed', bottom: 112, right: 16, zIndex: 9800 };

  return (
    <div ref={widgetRef} className="glass rounded-2xl shadow-2xl animate-scale-in"
      style={{ ...style, width: 280, border: '1px solid var(--accent)/40' }}>
      <div className="flex items-center justify-between px-4 py-2.5 cursor-grab active:cursor-grabbing"
        style={{ borderBottom: '1px solid var(--border)', background: 'var(--accent)/05' }}
        onMouseDown={startDrag} onTouchStart={startDrag}>
        <div className="flex items-center gap-2">
          <GripVertical size={12} className="opacity-40" />
          <span className="text-xs font-black opacity-60">Quick Review</span>
          <span className="badge badge-warn text-xs">{idx + 1}/{dueCards.length}</span>
        </div>
        <button onClick={onClose} className="opacity-40 hover:opacity-80"><X size={13} /></button>
      </div>
      <div className="p-4 cursor-pointer" onClick={() => setFlipped(p => !p)}>
        <div className="text-xs font-black uppercase tracking-widest opacity-30 mb-2">{flipped ? 'Answer' : 'Question'}</div>
        <p className="text-sm font-medium leading-relaxed line-clamp-4">{flipped ? (curr.card.a || curr.card.back) : (curr.card.q || curr.card.front)}</p>
        {!flipped && <p className="text-xs opacity-30 mt-2">Tap to reveal</p>}
      </div>
      {flipped && (
        <div className="grid grid-cols-4 gap-1 px-3 pb-3">
          {[['Again', 0, 'var(--danger)'], ['Hard', 1, 'var(--warning)'], ['Good', 2, 'var(--success)'], ['Easy', 3, '#3b82f6']].map(([lbl, g, col]) => (
            <button key={g} onClick={() => rate(g)}
              className="py-1.5 rounded-lg text-xs font-black transition-all hover:scale-105"
              style={{ background: col + '20', color: col }}>
              {lbl}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
