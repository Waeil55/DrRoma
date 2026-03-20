import React from 'react';

/**
 * MARIAM PRO  ProgressRing Component
 * Circular SVG progress indicator with mastery percentage.
 */
export default function ProgressRing({ progress = 0, size = 64, strokeWidth = 5, color = 'var(--accent)', label, className = '' }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(100, Math.max(0, progress)) / 100) * circumference;

  return (
    <div className={className} style={{ position: 'relative', width: size, height: size, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
      <svg width={size} height={size} style={{ transform: 'rotate(-90deg)' }}>
        {/* Background track */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke="var(--border)" strokeWidth={strokeWidth}
        />
        {/* Progress arc */}
        <circle
          cx={size / 2} cy={size / 2} r={radius}
          fill="none" stroke={color} strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: 'stroke-dashoffset 0.6s ease' }}
        />
      </svg>
      <div style={{
        position: 'absolute', inset: 0,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexDirection: 'column',
      }}>
        <span style={{ fontSize: size * 0.22, fontWeight: 700, color: 'var(--text)' }}>
          {Math.round(progress)}%
        </span>
        {label && <span style={{ fontSize: size * 0.14, color: 'var(--text3)', marginTop: -1 }}>{label}</span>}
      </div>
    </div>
  );
}
