import React, { useState, useRef } from 'react';
import { X, RotateCcw } from 'lucide-react';

export default function FlashcardTinderMode({ set, onClose, onUpdate }) {
  const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [swipeDir, setSwipeDir] = useState(null); // 'left'|'right'|null
  const [results, setResults] = useState({ know: 0, dontKnow: 0 });
  const [done, setDone] = useState(false);
  const [history, setHistory] = useState([]);
  const cardRef = useRef(null);
  const dragRef = useRef({ x: 0, startX: 0, dragging: false });
  const [dragX, setDragX] = useState(0);

  const cards = set?.cards || [];
  const curr = cards[idx];

  const advance = (knew) => {
    const grade = knew ? 3 : 1;
    const now = Date.now();
    onUpdate && onUpdate(set.id, curr.id, { lastReview: now, lastRating: grade });
    setResults(p => ({ ...p, [knew ? 'know' : 'dontKnow']: p[knew ? 'know' : 'dontKnow'] + 1 }));
    setHistory(h => [...h, { card: curr, knew }]);
    setSwipeDir(knew ? 'right' : 'left');
    setTimeout(() => {
      setSwipeDir(null); setDragX(0); setFlipped(false);
      if (idx + 1 >= cards.length) setDone(true);
      else setIdx(i => i + 1);
    }, 350);
  };

  const onPointerDown = (e) => {
    dragRef.current = { dragging: true, startX: e.clientX ?? e.touches?.[0]?.clientX ?? 0, x: 0 };
    const onMove = (ev) => {
      if (!dragRef.current.dragging) return;
      const cx = ev.clientX ?? ev.touches?.[0]?.clientX ?? 0;
      dragRef.current.x = cx - dragRef.current.startX;
      setDragX(dragRef.current.x);
    };
    const onUp = () => {
      dragRef.current.dragging = false;
      const dx = dragRef.current.x;
      if (Math.abs(dx) > 80) advance(dx > 0);
      else setDragX(0);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
      window.removeEventListener('touchmove', onMove);
      window.removeEventListener('touchend', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    window.addEventListener('touchmove', onMove, { passive: false });
    window.addEventListener('touchend', onUp);
  };

  const rotation = (swipeDir ? (swipeDir === 'right' ? 25 : -25) : Math.min(20, Math.max(-20, dragX / 8)));
  const swipeOpacity = Math.min(1, Math.abs(dragX) / 80);
  const isRight = dragX > 20 || swipeDir === 'right';
  const isLeft = dragX < -20 || swipeDir === 'left';

  const pct = cards.length > 0 ? Math.round((idx / cards.length) * 100) : 0;

  if (done) return (
    <div className="fixed inset-0 z-[9900] flex flex-col items-center justify-center gap-6 p-6"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(20px)' }}>
      <div className="text-6xl"></div>
      <div className="text-center">
        <h2 className="text-3xl font-black">Done!</h2>
        <p className="opacity-50 mt-2">{set.title}  {cards.length} cards</p>
      </div>
      <div className="flex gap-8">
        <div className="text-center">
          <div className="text-3xl font-black" style={{ color: '#10b981' }}> {results.know}</div>
          <div className="text-xs opacity-40 mt-1">Know it</div>
        </div>
        <div className="text-center">
          <div className="text-3xl font-black" style={{ color: '#ef4444' }}> {results.dontKnow}</div>
          <div className="text-xs opacity-40 mt-1">Review</div>
        </div>
      </div>
      <div className="glass rounded-2xl p-4 text-center" style={{ border: '1px solid var(--border)' }}>
        <p className="text-sm font-black" style={{ color: 'var(--accent)' }}>{Math.round((results.know / Math.max(1, cards.length)) * 100)}% mastery</p>
      </div>
      <button onClick={onClose} className="btn-accent px-10 py-3 rounded-2xl font-black">Back to Deck</button>
    </div>
  );

  if (!curr) return null;

  return (
    <div className="fixed inset-0 z-[9900] flex flex-col" style={{ background: 'rgba(0,0,0,0.88)', backdropFilter: 'blur(12px)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-6 pt-safe pt-6 pb-4 shrink-0">
        <button onClick={onClose} className="w-10 h-10 glass rounded-2xl flex items-center justify-center"><X size={18} /></button>
        <div className="text-center">
          <p className="text-xs font-black opacity-40 uppercase tracking-widest">{set.title}</p>
          <p className="text-sm font-black">{idx + 1} / {cards.length}</p>
        </div>
        <div className="text-right">
          <div className="text-xs font-black" style={{ color: '#10b981' }}> {results.know}</div>
          <div className="text-xs font-black" style={{ color: '#ef4444' }}> {results.dontKnow}</div>
        </div>
      </div>

      {/* Progress */}
      <div className="px-6 shrink-0 mb-4">
        <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
          <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
        </div>
      </div>

      {/* Card */}
      <div className="flex-1 flex items-center justify-center px-4 relative select-none">
        {/* Swipe indicator labels */}
        <div className="absolute top-1/2 left-8 -translate-y-1/2 px-5 py-3 rounded-2xl font-black text-lg transition-all pointer-events-none"
          style={{ opacity: isLeft ? swipeOpacity : 0, background: '#ef444420', color: '#ef4444', border: '2px solid #ef4444', rotate: '-15deg' }}>
          REVIEW
        </div>
        <div className="absolute top-1/2 right-8 -translate-y-1/2 px-5 py-3 rounded-2xl font-black text-lg transition-all pointer-events-none"
          style={{ opacity: isRight ? swipeOpacity : 0, background: '#10b98120', color: '#10b981', border: '2px solid #10b981', rotate: '15deg' }}>
          KNOW IT
        </div>

        <div ref={cardRef}
          onMouseDown={onPointerDown} onTouchStart={onPointerDown}
          onClick={() => !dragX && setFlipped(p => !p)}
          className="w-full max-w-sm cursor-grab active:cursor-grabbing"
          style={{
            transform: `translateX(${swipeDir ? (swipeDir === 'right' ? 300 : -300) : dragX}px) rotate(${rotation}deg)`,
            transition: swipeDir ? 'transform 0.35s ease' : dragX === 0 ? 'transform 0.2s ease' : 'none',
            willChange: 'transform',
          }}>
          <div className="glass rounded-3xl p-8 min-h-[280px] flex flex-col items-center justify-center text-center"
            style={{ border: '1px solid var(--border)', background: flipped ? 'var(--accent)/10' : 'var(--card,var(--surface))' }}>
            <div className="text-xs font-black uppercase tracking-widest opacity-30 mb-6">{flipped ? ' Answer' : ' Question'}</div>
            <p className="text-lg font-bold leading-relaxed mb-6">{flipped ? (curr.a || curr.back) : (curr.q || curr.front)}</p>
            {!flipped && <p className="text-xs opacity-30">Tap to reveal</p>}
          </div>
        </div>
      </div>

      {/* Action buttons */}
      <div className="px-8 pb-safe pb-8 pt-4 shrink-0 flex gap-6 justify-center">
        <button onClick={() => advance(false)}
          className="w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{ background: '#ef444420', border: '2px solid #ef4444', color: '#ef4444', fontSize: 24 }}></button>
        <button onClick={() => setFlipped(p => !p)}
          className="w-16 h-16 rounded-full flex items-center justify-center glass"
          style={{ border: '1px solid var(--border)' }}>
          <RotateCcw size={20} />
        </button>
        <button onClick={() => advance(true)}
          className="w-16 h-16 rounded-full flex items-center justify-center transition-all active:scale-90"
          style={{ background: '#10b98120', border: '2px solid #10b981', color: '#10b981', fontSize: 24 }}></button>
      </div>
    </div>
  );
}
