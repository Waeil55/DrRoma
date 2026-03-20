import React from 'react';
import { RefreshCw, AlertTriangle, Mic, FileText, Sparkles } from 'lucide-react';

/**
 * ChunkErrorBoundary  Handles lazy-loaded code-split failures.
 * Shows a "Retry loading" button that re-renders the tree.
 */
export class ChunkErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  retry = () => this.setState({ hasError: false });
  render() {
    if (this.state.hasError) return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <AlertTriangle size={32} style={{ color: 'var(--warning, #f59e0b)' }} />
        <p className="text-sm font-medium opacity-70">Failed to load this view</p>
        <button onClick={this.retry}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold text-white"
          style={{ background: 'var(--accent)' }}>
          <RefreshCw size={14} /> Retry loading
        </button>
      </div>
    );
    return this.props.children;
  }
}

/**
 * PdfErrorBoundary  Wraps PDF renderer specifically.
 */
export class PdfErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return (
      <div className="flex flex-col items-center justify-center py-16 gap-3">
        <FileText size={28} style={{ color: 'var(--danger, #ef4444)', opacity: 0.6 }} />
        <p className="text-sm font-medium opacity-70 text-center px-4">
          Unable to render this PDF. Try re-uploading the file.
        </p>
      </div>
    );
    return this.props.children;
  }
}

/**
 * AiErrorBoundary  Wraps AI-generated content rendering.
 */
export class AiErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  retry = () => this.setState({ hasError: false });
  render() {
    if (this.state.hasError) return (
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <Sparkles size={24} style={{ color: 'var(--accent)', opacity: 0.6 }} />
        <p className="text-sm opacity-60">Something went wrong displaying the AI response</p>
        <button onClick={this.retry}
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-bold text-white"
          style={{ background: 'var(--accent)' }}>
          <RefreshCw size={14} /> Regenerate
        </button>
      </div>
    );
    return this.props.children;
  }
}

/**
 * VoiceErrorBoundary  Wraps all voice features.
 */
export class VoiceErrorBoundary extends React.Component {
  state = { hasError: false };
  static getDerivedStateFromError() { return { hasError: true }; }
  render() {
    if (this.state.hasError) return (
      <div className="flex flex-col items-center justify-center py-10 gap-3">
        <Mic size={24} style={{ color: 'var(--text2)', opacity: 0.5 }} />
        <p className="text-sm opacity-60 text-center px-4">
          Voice interaction is not supported in this browser.
        </p>
        <p className="text-xs opacity-40">Use text input instead.</p>
      </div>
    );
    return this.props.children;
  }
}
