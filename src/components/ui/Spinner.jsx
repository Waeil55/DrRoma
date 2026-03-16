import React from 'react';

/**
 * MARIAM PRO — Spinner Component
 */
export default function Spinner({ size = 24, color = 'var(--accent)', className = '' }) {
  return (
    <div
      className={className}
      style={{
        width: size, height: size,
        border: `2.5px solid transparent`,
        borderTopColor: color,
        borderRadius: '50%',
        animation: 'spin 0.8s linear infinite',
      }}
      role="status"
      aria-label="Loading"
    />
  );
}
