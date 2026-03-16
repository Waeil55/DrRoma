/**
 * MARIAM PRO — useMediaQuery Hook
 * Reactive CSS media query matching.
 * Extracted from App.jsx.
 */
import { useState, useEffect } from 'react';

export function useMediaQuery(query) {
  const [matches, setMatches] = useState(() => {
    try { return window.matchMedia(query).matches; } catch { return false; }
  });

  useEffect(() => {
    let mq;
    try { mq = window.matchMedia(query); } catch { return; }
    const handler = e => setMatches(e.matches);
    mq.addEventListener('change', handler);
    setMatches(mq.matches); // sync on mount in case initial state was wrong
    return () => mq.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/** Convenience: true when viewport is desktop-width */
export function useIsDesktop() {
  return useMediaQuery('(min-width: 1024px)');
}

/** Convenience: true when user prefers reduced motion */
export function useReducedMotion() {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}
