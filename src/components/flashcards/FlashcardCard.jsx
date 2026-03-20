/**
 * MARIAM PRO — FlashcardCard Component
 * 3D flip card with RAF physics driver, dynamic shadow, and swipe gesture support.
 */
import React, { useRef, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';

function easeInOutCubic(p) {
  return p < 0.5 ? 4 * p * p * p : 1 - Math.pow(-2 * p + 2, 3) / 2;
}

export default function FlashcardCard({ card, flipped, setFlipped, swipeHandlers, swipeStyle, swipeHint }) {
  const cardRef = useRef(null);
  const rafRef = useRef(null);

  const handleFlip = useCallback(() => {
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    let progress = 0;
    const el = cardRef.current;
    if (!el) { setFlipped(f => !f); return; }

    const animate = () => {
      progress += 0.04;
      if (progress >= 1) {
        progress = 1;
        el.style.setProperty('--flip-progress', '0');
        el.style.transform = flipped ? 'rotateX(0deg)' : 'rotateX(180deg)';
        setFlipped(f => !f);
        rafRef.current = null;
        return;
      }
      const ease = easeInOutCubic(progress);
      el.style.setProperty('--flip-progress', String(ease));
      const angle = flipped ? 180 * (1 - ease) : 180 * ease;
      el.style.transform = `rotateX(${angle}deg)`;
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
  }, [flipped, setFlipped]);

  return (
    <div className="relative select-none" style={{ touchAction: 'none', userSelect: 'none' }}
      onPointerDown={swipeHandlers.onPointerDown}
      onPointerMove={swipeHandlers.onPointerMove}
      onPointerUp={swipeHandlers.onPointerUp}>
      {/* Swipe hint overlays */}
      {swipeHint === 'right' && (
        <div className="absolute inset-0 rounded-3xl z-10 flex items-center justify-start pl-8 pointer-events-none"
          style={{ background: 'rgba(16,185,129,0.15)', border: '2px solid #10b981', borderRadius: '1.5rem' }}>
          <span className="text-2xl font-black" style={{ color: '#10b981' }}> Easy</span>
        </div>
      )}
      {swipeHint === 'left' && (
        <div className="absolute inset-0 rounded-3xl z-10 flex items-center justify-end pr-8 pointer-events-none"
          style={{ background: 'rgba(239,68,68,0.15)', border: '2px solid #ef4444', borderRadius: '1.5rem' }}>
          <span className="text-2xl font-black" style={{ color: '#ef4444' }}> Again</span>
        </div>
      )}
      <div style={{ perspective: '1200px', ...swipeStyle }} className="cursor-grab active:cursor-grabbing" onClick={handleFlip}>
        <div ref={cardRef} style={{
          '--flip-progress': '0',
          display: 'grid',
          width: '100%',
          minHeight: 220,
          transformStyle: 'preserve-3d',
          transition: rafRef.current ? 'none' : 'transform 0.55s cubic-bezier(0.45,0.05,0.55,0.95)',
          transform: flipped ? 'rotateX(180deg)' : 'rotateX(0deg)',
          filter: `drop-shadow(0 calc(var(--flip-progress, 0) * 40px + 8px) calc(var(--flip-progress, 0) * 60px + 16px) rgba(0,0,0,calc(var(--flip-progress, 0) * 0.35 + 0.12)))`,
        }}>
          {/* FRONT — Question */}
          <div style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', gridArea: '1 / 1' }}
            className="glass rounded-3xl p-8 flex flex-col justify-between border border-[color:var(--border2,var(--border))] hover:border-[var(--accent)]/40 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border glass opacity-50">Question</span>
              {card.sourcePage && <span className="text-xs font-mono opacity-30">p.{card.sourcePage}</span>}
            </div>
            <p className="text-base font-semibold leading-relaxed flex-1">{card.q}</p>
            <p className="text-xs opacity-25 text-center mt-6 flex items-center justify-center gap-2">
              <RefreshCw size={11} />Tap/swipe to flip
              <span className="opacity-60">· → Easy · ← Again · ↑ Good</span>
            </p>
          </div>
          {/* BACK — Answer */}
          <div style={{ backfaceVisibility: 'hidden', WebkitBackfaceVisibility: 'hidden', gridArea: '1 / 1', transform: 'rotateX(180deg)' }}
            className="glass rounded-3xl p-8 flex flex-col justify-between border border-[var(--accent)]/30 bg-[var(--accent)]/4 transition-colors">
            <div className="flex items-start justify-between mb-4">
              <span className="text-xs font-black uppercase tracking-widest px-3 py-1 rounded-full border border-[var(--accent)]/40 text-[var(--accent)] bg-[var(--accent)]/10">Answer</span>
              {card.sourcePage && <span className="text-xs font-mono opacity-30">p.{card.sourcePage}</span>}
            </div>
            <p className="text-base font-semibold leading-relaxed flex-1 text-[var(--accent)]" style={{ whiteSpace: 'pre-line' }}>{card.a}</p>
            {card.evidence && <p className="text-xs opacity-40 mt-4 italic border-t border-[color:var(--border2,var(--border))] pt-3">"{card.evidence}"</p>}
          </div>
        </div>
      </div>
    </div>
  );
}
