import React from 'react';

/**
 * MARIAM PRO  BottomNav (Mobile Pill Navigation)
 * 4-tab core navigation: Home, Study, Tutor, More
 */
export default function BottomNav({ items, activeView, onNavigate, isKeyboardOpen }) {
  if (isKeyboardOpen) return null;

  return (
    <nav
      style={{
        position: 'fixed', bottom: 0, left: 0, right: 0,
        zIndex: 'var(--z-bottom-nav, 160)',
        height: 'calc(var(--bottom-nav-h) + var(--sab))',
        paddingBottom: 'var(--sab)',
        display: 'flex', alignItems: 'center', justifyContent: 'space-around',
        background: 'var(--nav-bg, rgba(0,0,0,0.92))',
        backdropFilter: 'blur(20px) saturate(1.8)',
        borderTop: '1px solid var(--border)',
      }}
      aria-label="Main navigation"
    >
      {items.map(item => {
        const Icon = item.icon;
        const isActive = item.v === activeView || (item.v === '__more__' && false);
        return (
          <button
            key={item.v}
            onClick={() => onNavigate(item.v)}
            disabled={item.dis}
            aria-label={item.label}
            aria-current={isActive ? 'page' : undefined}
            style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: 2, padding: '6px 12px',
              background: 'none', border: 'none', cursor: 'pointer',
              color: isActive ? 'var(--accent)' : 'var(--text3)',
              opacity: item.dis ? 0.3 : 1,
              transition: 'color 0.2s',
            }}
          >
            <Icon size={22} strokeWidth={isActive ? 2.5 : 1.8} />
            <span style={{ fontSize: '0.65em', fontWeight: isActive ? 700 : 500 }}>{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}
