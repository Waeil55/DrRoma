/**
 * MARIAM PRO  SwipeGestureHandler
 * Wraps a child element with Tinder-style swipe (left/right/up) using pointer events.
 */
import React, { useRef, useState, useCallback } from 'react';

const THRESHOLD = 80;

export default function SwipeGestureHandler({ onSwipeLeft, onSwipeRight, onSwipeUp, children }) {
  const startRef = useRef({ x: 0, y: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [dragging, setDragging] = useState(false);
  const [hint, setHint] = useState(null); // 'left' | 'right' | 'up' | null

  const onPointerDown = useCallback((e) => {
    startRef.current = { x: e.clientX, y: e.clientY };
    setDragging(true);
    setHint(null);
    e.currentTarget.setPointerCapture(e.pointerId);
  }, []);

  const onPointerMove = useCallback((e) => {
    if (!dragging) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    if (Math.abs(dx) > Math.abs(dy)) {
      setOffset({ x: dx, y: -Math.abs(dx) * 0.04 });
      setHint(dx > THRESHOLD * 0.6 ? 'right' : dx < -THRESHOLD * 0.6 ? 'left' : null);
    } else if (dy < -THRESHOLD * 0.6) {
      setOffset({ x: 0, y: dy });
      setHint('up');
    }
  }, [dragging]);

  const onPointerUp = useCallback(() => {
    setDragging(false);
    if (offset.x > THRESHOLD) {
      onSwipeRight?.();
    } else if (offset.x < -THRESHOLD) {
      onSwipeLeft?.();
    } else if (offset.y < -THRESHOLD) {
      onSwipeUp?.();
    }
    setOffset({ x: 0, y: 0 });
    setHint(null);
  }, [offset, onSwipeLeft, onSwipeRight, onSwipeUp]);

  const style = dragging
    ? { transform: `translateX(${offset.x}px) translateY(${offset.y}px) rotate(${offset.x * 0.08}deg)`, transition: 'none' }
    : { transform: 'translateX(0) translateY(0) rotate(0deg)', transition: 'all 0.4s cubic-bezier(0.34, 1.4, 0.64, 1)' };

  const borderColor = hint === 'right' ? '#10b981' : hint === 'left' ? '#ef4444' : hint === 'up' ? '#eab308' : 'transparent';

  return (
    <div
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      style={{ ...style, touchAction: 'none', boxShadow: hint ? `0 0 24px ${borderColor}40` : 'none', borderRadius: '1.5rem' }}
    >
      {typeof children === 'function' ? children({ hint }) : children}
    </div>
  );
}
