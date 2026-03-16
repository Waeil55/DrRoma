import React from 'react';

export default class AppErrorBoundary extends React.Component {
  state = { hasError: false, error: null };
  static getDerivedStateFromError(error) { return { hasError: true, error }; }
  render() {
    if (this.state.hasError) return (
      <div style={{ padding: 40, textAlign: 'center', fontFamily: 'system-ui' }}>
        <h2>MARIAM PRO encountered an error</h2>
        <pre style={{ background: '#fee', padding: 16, borderRadius: 8, fontSize: 12, textAlign: 'left', overflowX: 'auto' }}>
          {this.state.error?.message}
        </pre>
        <button
          onClick={() => window.location.reload()}
          style={{ marginTop: 20, padding: '10px 20px', borderRadius: 8, background: 'var(--accent, #6366f1)', color: 'white', border: 'none', cursor: 'pointer' }}
        >
          Reload App
        </button>
      </div>
    );
    return this.props.children;
  }
}
