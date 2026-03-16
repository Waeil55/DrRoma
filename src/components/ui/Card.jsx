import React from 'react';

/**
 * MARIAM PRO — Card Component
 * Theme-aware card with hover effects.
 */
export default function Card({ children, className = '', onClick, padding = true, ...rest }) {
  return (
    <div
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onClick={onClick}
      onKeyDown={onClick ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(e); } } : undefined}
      className={`rounded-2xl border border-[var(--border)] bg-[var(--surface)] ${padding ? 'p-4' : ''} ${onClick ? 'cursor-pointer hover:border-[var(--accent)] transition-colors' : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}
