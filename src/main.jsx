import React, { Suspense, lazy, Component } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import './gooddesign.css';
import './styles/tokens.css';
import './styles/safeAreas.css';
import './styles/typography.css';
import './styles/animations.css';
import './styles/components.css';

// Error boundary for lazy-load failures
class LazyErrorBoundary extends Component {
  state = { error: null };
  static getDerivedStateFromError(e) { return { error: e }; }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: 24, fontFamily: 'system-ui', background: '#fff', color: '#111', overflow: 'auto', height: '100vh' }}>
          <h2 style={{ color: 'red' }}>App failed to load</h2>
          <pre style={{ background: '#fee2e2', padding: 16, borderRadius: 8, whiteSpace: 'pre-wrap', fontSize: 12 }}>
            {String(this.state.error)}
          </pre>
          <button
            onClick={() => window.location.reload()}
            style={{ marginTop: 16, padding: '10px 20px', background: '#6366f1', color: '#fff', border: 'none', borderRadius: 8, fontSize: 15 }}
          >
            Reload
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

// Lazy-load App  iOS Safari only parses React (~142KB) on first JS evaluation.
// App.jsx chunk (~1MB) is fetched AFTER the loading screen renders, preventing
// the iOS WatchDog timer from killing the process during initial parse.
const App = lazy(() => import('./App.jsx'));

const Loading = () => (
  <div style={{
    background: 'linear-gradient(135deg, #0a0a14 0%, #1a0a2e 100%)',
    color: '#fff',
    height: '100vh',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: 'system-ui, sans-serif',
    gap: 16,
  }}>
    <div style={{
      width: 56, height: 56, border: '3px solid rgba(99,102,241,0.3)',
      borderTop: '3px solid #6366f1', borderRadius: '50%',
      animation: 'spin 0.8s linear infinite',
    }} />
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    <span style={{ fontSize: 18, opacity: 0.85, letterSpacing: 0.5 }}>Loading MARIAM AI...</span>
  </div>
);

ReactDOM.createRoot(document.getElementById('root')).render(
  <LazyErrorBoundary>
    <Suspense fallback={<Loading />}>
      <App />
    </Suspense>
  </LazyErrorBoundary>,
);
