import React from 'react';

/**
 * MARIAM PRO — Button Component
 * Theme-aware button with variants.
 */
export default function Button({ children, onClick, variant = 'primary', size = 'md', disabled = false, className = '', icon: Icon, ariaLabel, ...rest }) {
  const base = 'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-1';
  const sizes = {
    sm: 'px-3 py-1.5 text-xs rounded-lg gap-1.5',
    md: 'px-4 py-2 text-sm rounded-xl gap-2',
    lg: 'px-6 py-3 text-base rounded-2xl gap-2.5',
  };
  const variants = {
    primary: 'bg-[var(--accent)] text-white hover:brightness-110 active:scale-[0.97]',
    secondary: 'bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] hover:bg-[var(--border)]',
    ghost: 'bg-transparent text-[var(--text2)] hover:bg-[var(--surface)]',
    danger: 'bg-red-500/15 text-red-500 hover:bg-red-500/25',
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`${base} ${sizes[size] || sizes.md} ${variants[variant] || variants.primary} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'} ${className}`}
      aria-label={ariaLabel}
      {...rest}
    >
      {Icon && <Icon size={size === 'sm' ? 14 : size === 'lg' ? 20 : 16} />}
      {children}
    </button>
  );
}
