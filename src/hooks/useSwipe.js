/**
 * MARIAM PRO  useSwipe Hook
 * Tinder-style pointer swipe with real-time transform feedback,
 * animated card exit (fly-off), and directional box-shadow glows.
 */
import { useState, useCallback, useRef, useEffect } from 'react';

export function useSwipe({ onSwipeLeft, onSwipeRight, onSwipeUp, onTap, threshold = 80 } = {}) {
  const startRef = useRef(null);
  const elRef = useRef(null);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [exiting, setExiting] = useState(null); // 'left' | 'right' | 'up' | null
  const exitTimerRef = useRef(null);

  useEffect(() => () => { if (exitTimerRef.current) clearTimeout(exitTimerRef.current); }, []);

  const onPointerDown = useCallback(e => {
    if (exiting) return;
    startRef.current = { x: e.clientX, y: e.clientY };
    elRef.current = e.currentTarget;
    e.currentTarget.setPointerCapture(e.pointerId);
  }, [exiting]);

  const onPointerMove = useCallback(e => {
    if (!startRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    // Only intercept if horizontal movement dominates (or strong vertical)
    if (Math.abs(dx) > 10 || Math.abs(dy) > 10) {
      setOffset({ x: dx, y: dy });
    }
  }, []);

  const onPointerUp = useCallback(e => {
    if (!startRef.current) return;
    const dx = e.clientX - startRef.current.x;
    const dy = e.clientY - startRef.current.y;
    startRef.current = null;

    if (Math.abs(dy) > threshold && dy < 0 && Math.abs(dy) > Math.abs(dx)) {
      setExiting('up');
      exitTimerRef.current = setTimeout(() => { setExiting(null); setOffset({ x: 0, y: 0 }); onSwipeUp?.(); }, 350);
    } else if (dx > threshold && Math.abs(dx) > Math.abs(dy)) {
      setExiting('right');
      exitTimerRef.current = setTimeout(() => { setExiting(null); setOffset({ x: 0, y: 0 }); onSwipeRight?.(); }, 350);
    } else if (dx < -threshold && Math.abs(dx) > Math.abs(dy)) {
      setExiting('left');
      exitTimerRef.current = setTimeout(() => { setExiting(null); setOffset({ x: 0, y: 0 }); onSwipeLeft?.(); }, 350);
    } else if (Math.abs(dx) < 10 && Math.abs(dy) < 10) {
      setOffset({ x: 0, y: 0 });
      onTap?.();
    } else {
      setOffset({ x: 0, y: 0 });
    }
  }, [onSwipeLeft, onSwipeRight, onSwipeUp, onTap, threshold]);

  // Intensity 01 based on distance to threshold
  const intensity = Math.min(1, Math.abs(offset.x) / threshold);

  // Animated card exit fly-off or live drag feedback
  const swipeStyle = exiting === 'right'
    ? { transform: 'translateX(150vw) rotate(30deg)', transition: 'transform 0.35s cubic-bezier(.34,1.4,.64,1)' }
    : exiting === 'left'
    ? { transform: 'translateX(-150vw) rotate(-30deg)', transition: 'transform 0.35s cubic-bezier(.34,1.4,.64,1)' }
    : exiting === 'up'
    ? { transform: 'translateY(-120vh) scale(0.8)', transition: 'transform 0.35s cubic-bezier(.34,1.4,.64,1)' }
    : offset.x !== 0 || offset.y !== 0
    ? {
        transform: `translateX(${offset.x}px) translateY(${-Math.abs(offset.x) * 0.04}px) rotate(${offset.x * 0.08}deg)`,
        transition: 'none',
        boxShadow: offset.x > 0
          ? `0 0 ${24 * intensity}px rgba(16,185,129,${0.4 * intensity})`
          : `0 0 ${24 * intensity}px rgba(239,68,68,${0.4 * intensity})`,
      }
    : { transition: 'transform 0.4s cubic-bezier(.34,1.3,.64,1), box-shadow 0.3s ease' };

  const swipeHint = offset.x > 40 ? 'right' : offset.x < -40 ? 'left' : offset.y < -40 ? 'up' : null;

  return { onPointerDown, onPointerMove, onPointerUp, swipeStyle, swipeHint, exiting };
}
