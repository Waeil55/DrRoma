/**
 * MARIAM PRO  DocChatOverlay
 * Floating chat overlay for asking AI about the current document.
 * Appears as a slide-up panel inside the document workspace.
 */
import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send } from 'lucide-react';

export default function DocChatOverlay({ docName, pageText, onAsk, visible, onClose }) {
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || loading) return;
    setInput('');
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const reply = await onAsk?.(text, pageText, docName);
      setMessages(prev => [...prev, { role: 'assistant', content: reply || 'No response.' }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Failed to get a response. Try again.' }]);
    } finally {
      setLoading(false);
    }
  };

  if (!visible) return null;

  return (
    <div className="absolute inset-x-0 bottom-0 flex flex-col" style={{
      height: '50%', minHeight: 200, maxHeight: '60vh',
      background: 'var(--surface)', borderTop: '1px solid var(--border)',
      borderRadius: '16px 16px 0 0', zIndex: 'var(--z-modal)',
    }}>
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <div className="flex items-center gap-2">
          <MessageSquare size={16} style={{ color: 'var(--accent)' }} />
          <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Ask about this document</span>
        </div>
        <button onClick={onClose} className="touch-target" aria-label="Close chat overlay">
          <X size={18} style={{ color: 'var(--text2)' }} />
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto px-4 py-2 space-y-3">
        {messages.map((m, i) => (
          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className="max-w-[85%] rounded-2xl px-3 py-2 text-sm" style={{
              background: m.role === 'user' ? 'var(--accent)' : 'var(--bg)',
              color: m.role === 'user' ? '#fff' : 'var(--text)',
            }}>
              {m.content}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex justify-start">
            <div className="rounded-2xl px-3 py-2 text-sm animate-pulse" style={{ background: 'var(--bg)', color: 'var(--text2)' }}>
              Thinking...
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-2 px-4 py-3" style={{ borderTop: '1px solid var(--border)' }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Ask a question..."
          className="flex-1 rounded-xl px-3 py-2 text-sm outline-none"
          style={{ background: 'var(--bg)', color: 'var(--text)', border: '1px solid var(--border)' }}
        />
        <button onClick={handleSend} disabled={loading || !input.trim()} className="touch-target"
          style={{ color: input.trim() ? 'var(--accent)' : 'var(--text3)' }} aria-label="Send message">
          <Send size={20} />
        </button>
      </div>
    </div>
  );
}
