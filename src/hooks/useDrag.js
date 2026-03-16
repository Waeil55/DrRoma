/**
 * MARIAM PRO — useDrag Hook
 * Generic drag handler with non-passive touchstart support.
 * Extracted from App.jsx.
 */
import { useRef, useCallback } from 'react';

export function useDrag(onDrag) {
  const dragging = useRef(false);
  const live = useRef(onDrag);
  live.current = onDrag;

  const start = useCallback(e => {
    if (e.cancelable) e.preventDefault();
    dragging.current = true;
    document.body.style.userSelect = 'none';
    document.body.style.webkitUserSelect = 'none';

    const move = ev => {
      if (!dragging.current) return;
      const x = ev.touches?.[0]?.clientX ?? ev.clientX;
      const y = ev.touches?.[0]?.clientY ?? ev.clientY;
      if (x !== undefined) live.current(x, y);
    };

    const up = () => {
      dragging.current = false;
      document.body.style.userSelect = '';
      document.body.style.webkitUserSelect = '';
      document.removeEventListener('mousemove', move);
      document.removeEventListener('mouseup', up);
      document.removeEventListener('touchmove', move);
      document.removeEventListener('touchend', up);
      document.removeEventListener('touchcancel', up);
    };

    document.addEventListener('mousemove', move, { passive: false });
    document.addEventListener('mouseup', up);
    document.addEventListener('touchmove', move, { passive: false });
    document.addEventListener('touchend', up);
    document.addEventListener('touchcancel', up);
  }, []);

  // Attach non-passive native touchstart listener
  const nativeTouchRef = useCallback(el => {
    if (!el || el._dragBound) return;
    el._dragBound = true;
    el.addEventListener('touchstart', start, { passive: false });
  }, [start]);

  start.ref = nativeTouchRef;
  return start;
}
