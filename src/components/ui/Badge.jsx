import React from 'react';

/**
 * MARIAM PRO  Badge Component
 */
export default function Badge({ children, variant = 'default', size = 'sm', className = '' }) {
  const variants = {
    default: { bg: 'rgba(var(--acc-rgb,99,102,241),0.15)', color: 'var(--accent)' },
    success: { bg: 'rgba(16,185,129,0.15)', color: '#10b981' },
    warning: { bg: 'rgba(245,158,11,0.15)', color: '#f59e0b' },
    danger:  { bg: 'rgba(244,63,94,0.15)',  color: '#f43f5e' },
    neutral: { bg: 'var(--surface)', color: 'var(--text2)' },
  };
  const v = variants[variant] || variants.default;
  const sizes = {
    xs: { padding: '1px 6px', fontSize: '0.65em' },
    sm: { padding: '2px 8px', fontSize: '0.75em' },
    md: { padding: '3px 10px', fontSize: '0.82em' },
  };
  const s = sizes[size] || sizes.sm;

  return (
    <span
      className={className}
      style={{
        display: 'inline-flex', alignItems: 'center',
        ...s, borderRadius: 999,
        background: v.bg, color: v.color,
        fontWeight: 600, lineHeight: 1.4,
        whiteSpace: 'nowrap',
      }}
    >
      {children}
    </span>
  );
}
