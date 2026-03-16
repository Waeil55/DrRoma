import React, { useRef, useEffect, useState } from 'react';
import { createPortal } from 'react-dom';

/**
 * MARIAM PRO — BottomSheet Component
 * Mobile drag-to-dismiss sheet with spring physics.
 */
export default function BottomSheet({ isOpen, onClose, title, children, height = '60vh' }) {
  const sheetRef = useRef(null);
  const startYRef = useRef(0);
  const [dragY, setDragY] = useState(0);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setVisible(true);
      setDragY(0);
    } else {
      const t = setTimeout(() => setVisible(false), 400);
      return () => clearTimeout(t);
    }
  }, [isOpen]);

  const onTouchStart = (e) => {
    startYRef.current = e.touches[0].clientY;
  };

  const onTouchMove = (e) => {
    const dy = Math.max(0, e.touches[0].clientY - startYRef.current);
    setDragY(dy);
  };

  const onTouchEnd = () => {
    if (dragY > 120) {
      onClose();
    }
    setDragY(0);
  };

  if (!visible) return null;

  return createPortal(
    <div
      style={{
        position: 'fixed', inset: 0,
        zIndex: 'var(--z-bottom-sheet, 120)',
        pointerEvents: isOpen ? 'auto' : 'none',
      }}
    >
      {/* Backdrop */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0,
          background: 'rgba(0,0,0,0.5)',
          backdropFilter: 'blur(4px)',
          opacity: isOpen ? 1 : 0,
          transition: 'opacity 300ms',
        }}
      />
      {/* Sheet */}
      <div
        ref={sheetRef}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          height,
          borderRadius: '24px 24px 0 0',
          background: 'var(--surface)',
          border: '1px solid var(--border)',
          paddingBottom: 'env(safe-area-inset-bottom)',
          transform: isOpen
            ? `translateY(${dragY}px)`
            : 'translateY(100%)',
          transition: dragY > 0 ? 'none' : 'transform 0.4s cubic-bezier(0.34, 1.3, 0.64, 1)',
          overflow: 'auto',
        }}
        role="dialog"
        aria-modal="true"
        aria-label={title}
      >
        {/* Drag handle */}
        <div style={{ display: 'flex', justifyContent: 'center', padding: '12px 0 8px' }}>
          <div style={{
            width: 40, height: 4, borderRadius: 2,
            background: 'var(--border2, var(--border))',
          }} />
        </div>
        {title && (
          <div style={{ padding: '0 20px 12px', fontWeight: 700, fontSize: 'var(--text-lg)', color: 'var(--text)' }}>
            {title}
          </div>
        )}
        <div style={{ padding: '0 20px 20px', overflow: 'auto', flex: 1 }}>
          {children}
        </div>
      </div>
    </div>,
    document.body
  );
}
