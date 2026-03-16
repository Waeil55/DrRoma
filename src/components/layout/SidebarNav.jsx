import React from 'react';

/**
 * MARIAM PRO — SidebarNav (Desktop)
 * Desktop-only sidebar navigation.
 */
export default function SidebarNav({ items, moreItems, activeView, onNavigate, compact = false }) {
  return (
    <aside style={{
      width: compact ? 72 : 240,
      height: '100%',
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
      overflow: 'auto',
      flexShrink: 0,
      transition: 'width 0.25s ease',
    }}>
      {/* Logo area */}
      <div style={{ padding: compact ? '16px 8px' : '20px 16px', borderBottom: '1px solid var(--border)' }}>
        <span style={{ fontWeight: 800, fontSize: compact ? '0.9em' : '1.1em', color: 'var(--accent)' }}>
          {compact ? 'M' : 'MARIAM PRO'}
        </span>
      </div>

      {/* Primary items */}
      <div style={{ padding: '8px', flex: 1 }}>
        {items.map(item => {
          const Icon = item.icon;
          const isActive = item.v === activeView;
          return (
            <button
              key={item.v}
              onClick={() => onNavigate(item.v)}
              aria-label={item.label}
              aria-current={isActive ? 'page' : undefined}
              style={{
                display: 'flex', alignItems: 'center', gap: 12,
                width: '100%', padding: compact ? '10px 0' : '10px 12px',
                justifyContent: compact ? 'center' : 'flex-start',
                background: isActive ? 'rgba(var(--acc-rgb,99,102,241),0.12)' : 'transparent',
                border: 'none', borderRadius: 10, cursor: 'pointer',
                color: isActive ? 'var(--accent)' : 'var(--text2)',
                fontWeight: isActive ? 600 : 400, fontSize: '0.88em',
                transition: 'all 0.15s',
                marginBottom: 2,
              }}
            >
              <Icon size={20} />
              {!compact && <span>{item.label}</span>}
            </button>
          );
        })}

        {/* Divider */}
        <div style={{ height: 1, background: 'var(--border)', margin: '8px 0' }} />

        {/* More items (scrollable) */}
        <div style={{ overflow: 'auto', maxHeight: 'calc(100vh - 300px)' }}>
          {moreItems?.map(item => {
            const Icon = item.icon;
            const isActive = item.v === activeView;
            return (
              <button
                key={item.v}
                onClick={() => onNavigate(item.v)}
                aria-label={item.label}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  width: '100%', padding: compact ? '8px 0' : '8px 12px',
                  justifyContent: compact ? 'center' : 'flex-start',
                  background: isActive ? 'rgba(var(--acc-rgb,99,102,241),0.08)' : 'transparent',
                  border: 'none', borderRadius: 8, cursor: 'pointer',
                  color: isActive ? 'var(--accent)' : 'var(--text3)',
                  fontWeight: isActive ? 600 : 400, fontSize: '0.8em',
                  transition: 'all 0.15s',
                  marginBottom: 1,
                }}
              >
                <Icon size={16} />
                {!compact && <span>{item.label}</span>}
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
