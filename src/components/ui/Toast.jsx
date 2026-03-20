import React, { useState, useEffect, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { X, CheckCircle2, AlertCircle, Info } from 'lucide-react';

/**
 * MARIAM PRO  Toast Component
 * Auto-dismissing notification toasts.
 */
const ICONS = {
  success: CheckCircle2,
  error: AlertCircle,
  info: Info,
  warning: AlertCircle,
};

const COLORS = {
  success: { bg: 'rgba(16,185,129,0.15)', border: 'rgba(16,185,129,0.3)', text: '#10b981' },
  error:   { bg: 'rgba(244,63,94,0.15)',   border: 'rgba(244,63,94,0.3)',  text: '#f43f5e' },
  info:    { bg: 'rgba(14,165,233,0.15)',  border: 'rgba(14,165,233,0.3)', text: '#0ea5e9' },
  warning: { bg: 'rgba(245,158,11,0.15)',  border: 'rgba(245,158,11,0.3)', text: '#f59e0b' },
};

function ToastItem({ toast, onRemove }) {
  const { type = 'info', message } = toast;
  const Icon = ICONS[type] || ICONS.info;
  const color = COLORS[type] || COLORS.info;

  useEffect(() => {
    const t = setTimeout(() => onRemove(toast.id), toast.duration || 4000);
    return () => clearTimeout(t);
  }, [toast.id, toast.duration, onRemove]);

  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 10,
        padding: '10px 16px', borderRadius: 14,
        background: color.bg, border: `1px solid ${color.border}`,
        boxShadow: '0 8px 24px rgba(0,0,0,0.15)',
        animation: 'slide-up 0.3s ease both',
        maxWidth: 380, width: '100%',
      }}
      role="alert"
    >
      <Icon size={18} style={{ color: color.text, flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: '0.88em', color: 'var(--text)', fontWeight: 500 }}>{message}</span>
      <button onClick={() => onRemove(toast.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text3)', padding: 2 }} aria-label="Dismiss">
        <X size={14} />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, removeToast }) {
  if (!toasts.length) return null;
  return createPortal(
    <div
      style={{
        position: 'fixed',
        top: 'calc(env(safe-area-inset-top, 44px) + 12px)',
        right: 16, left: 16,
        zIndex: 'var(--z-toast, 150)',
        display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8,
        pointerEvents: 'none',
      }}
    >
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: 'auto' }}>
          <ToastItem toast={t} onRemove={removeToast} />
        </div>
      ))}
    </div>,
    document.body
  );
}

/**
 * Toast hook  returns { toasts, addToast, removeToast }
 */
export function useToast() {
  const [toasts, setToasts] = useState([]);

  const addToast = useCallback((message, type = 'info', duration = 4000) => {
    setToasts(prev => [...prev, { id: Date.now() + Math.random(), message, type, duration }]);
  }, []);

  const removeToast = useCallback((id) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

export default ToastItem;
