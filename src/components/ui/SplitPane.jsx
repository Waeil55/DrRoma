import React, { useRef, useCallback, useState } from 'react';

/**
 * MARIAM PRO  SplitPane Component
 * Resizable desktop split pane with draggable divider.
 */
export default function SplitPane({ left, right, defaultSplit = 55, minLeft = 30, minRight = 20, className = '' }) {
  const [split, setSplit] = useState(defaultSplit);
  const isDragging = useRef(false);
  const containerRef = useRef(null);

  const onMouseDown = useCallback((e) => {
    e.preventDefault();
    isDragging.current = true;

    const onMouseMove = (e) => {
      if (!isDragging.current || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const pct = ((e.clientX - rect.left) / rect.width) * 100;
      setSplit(Math.max(minLeft, Math.min(100 - minRight, pct)));
    };

    const onMouseUp = () => {
      isDragging.current = false;
      document.removeEventListener('mousemove', onMouseMove);
      document.removeEventListener('mouseup', onMouseUp);
    };

    document.addEventListener('mousemove', onMouseMove);
    document.addEventListener('mouseup', onMouseUp);
  }, [minLeft, minRight]);

  return (
    <div ref={containerRef} className={className} style={{ display: 'flex', width: '100%', height: '100%', overflow: 'hidden' }}>
      <div style={{ width: `${split}%`, overflow: 'auto', minHeight: 0 }}>
        {left}
      </div>
      <div
        onMouseDown={onMouseDown}
        style={{
          width: 6, cursor: 'col-resize', flexShrink: 0,
          background: 'var(--border)', position: 'relative',
          transition: 'background 0.15s',
        }}
        onMouseEnter={(e) => e.currentTarget.style.background = 'var(--accent)'}
        onMouseLeave={(e) => e.currentTarget.style.background = 'var(--border)'}
        role="separator"
        aria-label="Resize panels"
      />
      <div style={{ flex: 1, overflow: 'auto', minHeight: 0 }}>
        {right}
      </div>
    </div>
  );
}
