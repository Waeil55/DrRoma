import React from 'react';

/**
 * MARIAM PRO  AppShell Layout
 * Fixed header, body with safe-area management, bottom nav slot.
 */
export default function AppShell({ header, children, bottomNav, className = '' }) {
  return (
    <div className={`relative w-full h-full flex flex-col overflow-hidden ${className}`}
      style={{ background: 'var(--bg)' }}>
      {/* Top glass fill for notch/Dynamic Island */}
      <div className="design-top-glass" />
      {/* Header */}
      {header && (
        <header style={{
          position: 'fixed', top: 0, left: 0, right: 0,
          zIndex: 'var(--z-header, 180)',
          paddingTop: 'var(--sat)',
          height: 'calc(var(--sat) + var(--header-h))',
          display: 'flex', alignItems: 'center',
          background: 'var(--nav-bg, rgba(0,0,0,0.92))',
          backdropFilter: 'blur(20px) saturate(1.8)',
          borderBottom: '1px solid var(--border)',
        }}>
          {header}
        </header>
      )}
      {/* Main content area */}
      <main style={{
        position: 'absolute',
        top: 'var(--content-top)',
        bottom: 'var(--content-bottom)',
        left: 0, right: 0,
        overflow: 'auto',
        WebkitOverflowScrolling: 'touch',
      }}>
        {children}
      </main>
      {/* Bottom nav */}
      {bottomNav}
    </div>
  );
}
