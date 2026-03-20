import React from 'react';

/**
 * MARIAM PRO  Typography Component
 * All font tokens + responsive scale utility.
 */
const VARIANTS = {
  h1:   { tag: 'h1', size: 'var(--text-3xl)', weight: 800, leading: 'var(--leading-tight)' },
  h2:   { tag: 'h2', size: 'var(--text-2xl)', weight: 700, leading: 'var(--leading-tight)' },
  h3:   { tag: 'h3', size: 'var(--text-xl)',  weight: 700, leading: 'var(--leading-snug)' },
  h4:   { tag: 'h4', size: 'var(--text-lg)',  weight: 600, leading: 'var(--leading-snug)' },
  body: { tag: 'p',  size: 'var(--text-base)',weight: 400, leading: 'var(--leading-normal)' },
  sm:   { tag: 'p',  size: 'var(--text-sm)',  weight: 400, leading: 'var(--leading-normal)' },
  xs:   { tag: 'span', size: 'var(--text-xs)', weight: 400, leading: 'var(--leading-normal)' },
  label:{ tag: 'span', size: 'var(--text-xs)', weight: 600, leading: '1', textTransform: 'uppercase', letterSpacing: '0.05em' },
};

export default function Typography({ variant = 'body', children, className = '', style = {}, color, weight, ...rest }) {
  const v = VARIANTS[variant] || VARIANTS.body;
  const Tag = v.tag;

  return (
    <Tag
      className={className}
      style={{
        fontSize: v.size,
        fontWeight: weight || v.weight,
        lineHeight: v.leading,
        color: color || 'var(--text)',
        textTransform: v.textTransform || 'none',
        letterSpacing: v.letterSpacing || 'normal',
        margin: 0,
        ...style,
      }}
      {...rest}
    >
      {children}
    </Tag>
  );
}
