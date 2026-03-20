/**
 * MARIAM PRO  Chat Input Component
 * Text input with voice and send buttons.
 */
import React, { useRef, useState, useCallback } from 'react';
import { Mic, Send, Loader2, Paperclip } from 'lucide-react';

export default function ChatInput({ onSend, loading, projectColor }) {
  const [input, setInput] = useState('');
  const [inputRows, setInputRows] = useState(1);
  const [listening, setListening] = useState(false);
  const inputRef = useRef(null);
  const recogRef = useRef(null);

  const toggleVoice = useCallback(() => {
    if (listening) { recogRef.current?.stop(); setListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Voice not supported in this browser.'); return; }
    const r = new SR();
    r.continuous = false;
    r.interimResults = true;
    r.onresult = e => { setInput(Array.from(e.results).map(r => r[0].transcript).join('')); };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.start();
    recogRef.current = r;
    setListening(true);
  }, [listening]);

  const handleSend = useCallback(() => {
    if (!input.trim() || loading) return;
    onSend(input.trim());
    setInput('');
    setInputRows(1);
  }, [input, loading, onSend]);

  return (
    <div className="shrink-0 px-4 md:px-6 py-4 md:pb-6"
      style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(255,255,255,0.02)' }}>
      <div className="max-w-3xl mx-auto">
        <div className="relative flex items-end p-2 rounded-3xl transition-all"
          style={{ background: 'rgba(26,27,54,0.7)', border: '1px solid rgba(255,255,255,0.1)', boxShadow: '0 8px 32px rgba(0,0,0,.3)', backdropFilter: 'blur(20px)' }}>
          <button className="shrink-0 p-2.5 rounded-full transition-colors opacity-50 hover:opacity-100" style={{ color: 'var(--text)' }}>
            <Paperclip size={19} />
          </button>
          <textarea ref={inputRef} value={input}
            onChange={e => { setInput(e.target.value); setInputRows(Math.min(8, e.target.value.split('\n').length)); }}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
            placeholder="Message MARIAM" disabled={loading} rows={inputRows}
            className="flex-1 max-h-48 bg-transparent px-2 py-2.5 text-sm outline-none resize-none custom-scrollbar leading-relaxed"
            style={{ color: 'var(--text)', minHeight: 44 }} />
          <div className="shrink-0 flex items-center gap-1 p-1">
            <button onClick={toggleVoice}
              className="p-2 rounded-full transition-all"
              style={listening ? { background: 'var(--danger)', color: '#fff' } : { opacity: .5, color: 'var(--text)' }}
              title={listening ? 'Stop' : 'Voice'}>
              <Mic size={18} />
            </button>
            <button onClick={handleSend}
              disabled={!input.trim() || loading}
              className="p-2.5 rounded-full transition-all shadow-lg disabled:opacity-40"
              style={{ background: 'linear-gradient(135deg,var(--accent),var(--accent2,var(--accent)))', color: '#fff' }}>
              {loading ? <Loader2 size={18} className="animate-spin" /> : <Send size={17} style={{ marginLeft: 1 }} />}
            </button>
          </div>
        </div>
        <p className="text-xs text-center opacity-20 font-medium mt-2">MARIAM can make mistakes. Verify important medical information.</p>
      </div>
    </div>
  );
}
