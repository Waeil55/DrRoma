import React from 'react';
import { Loader2 } from 'lucide-react';

/**
 * MARIAM PRO  GlobalTaskIndicator
 * Fixed-position indicator showing background task progress.
 * Never overlaps bottom navigation. Renders null when no task running.
 */
export default function GlobalTaskIndicator({ task }) {
  if (!task || task.status !== 'running') return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'calc(var(--bottom-nav-h) + var(--sab) + 12px)',
        right: 16,
        zIndex: 'var(--z-global-task, 140)',
        maxWidth: 280,
        pointerEvents: 'auto',
        padding: '12px 16px',
        borderRadius: 16,
        background: 'var(--surface)',
        border: '1px solid var(--border)',
        backdropFilter: 'blur(12px)',
        boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
        animation: 'slide-up 0.3s ease both',
      }}
      role="status"
      aria-live="polite"
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <Loader2 size={16} style={{ color: 'var(--accent)', animation: 'spin 0.8s linear infinite' }} />
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.8em', fontWeight: 600, color: 'var(--text)' }}>
            {task.label || 'Processing...'}
          </div>
          {task.progress != null && (
            <div style={{ marginTop: 4, height: 3, borderRadius: 2, background: 'var(--border)', overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 2,
                background: 'var(--accent)',
                width: `${Math.min(100, task.progress)}%`,
                transition: 'width 0.3s ease',
              }} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
