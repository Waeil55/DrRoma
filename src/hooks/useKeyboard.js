/**
 * MARIAM PRO  useKeyboard Hook
 * Global keyboard shortcut handler.
 */
import { useEffect, useRef } from 'react';

/**
 * @param {Object} shortcuts - Map of shortcut key to handler
 *   e.g. { 'ctrl+k': () => openSearch(), 'Escape': () => close() }
 * @param {boolean} active - Whether shortcuts are active (default: true)
 */
export function useKeyboard(shortcuts, active = true) {
  const shortcutsRef = useRef(shortcuts);
  shortcutsRef.current = shortcuts;

  useEffect(() => {
    if (!active) return;

    const handler = (e) => {
      const map = shortcutsRef.current;
      if (!map) return;

      // Build key string: "ctrl+shift+k"
      const parts = [];
      if (e.ctrlKey || e.metaKey) parts.push('ctrl');
      if (e.altKey) parts.push('alt');
      if (e.shiftKey) parts.push('shift');
      parts.push(e.key.toLowerCase());
      const combo = parts.join('+');

      // Also check plain key (e.g. 'Escape')
      const fn = map[combo] || map[e.key];
      if (fn) {
        e.preventDefault();
        e.stopPropagation();
        fn(e);
      }
    };

    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [active]);
}
