/**
 * MARIAM PRO  ChatPanel Component
 * The doc-chat panel used inside DocWorkspace (page/document context).
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { UserCircle2, Mic, MicOff, Send } from 'lucide-react';
import { renderAIContent } from '../../utils/markdown.js';

const MARIAM_IMG = 'https://i.ibb.co/gbL3pSCw/mariam.png';

export default function ChatPanel({ callAI, callAIStreaming, settings, pagesText, currentPage, totalPages }) {
  const [msgs, setMsgs] = useState([{ role: 'assistant', content: "Hi! I'm your MARIAM AI assistant. Ask me anything about this document  I'll explain, quiz you, or dive deep into any topic." }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [mode, setMode] = useState('page');
  const [listening, setListening] = useState(false);
  const endRef = useRef(null);
  const scrollContainerRef = useRef(null);
  const recogRef = useRef(null);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, loading]);

  const toggleVoice = useCallback(() => {
    if (listening) { recogRef.current?.stop(); setListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) return;
    const r = new SR();
    r.continuous = false; r.interimResults = true;
    r.onresult = e => { setInput(Array.from(e.results).map(r => r[0].transcript).join('')); };
    r.onend = () => setListening(false);
    r.onerror = () => setListening(false);
    r.start(); recogRef.current = r; setListening(true);
  }, [listening]);

  const send = useCallback(async () => {
    if (!input.trim() || loading) return;
    const msg = input.trim();
    setInput('');
    const context = mode === 'page'
      ? `[Page ${currentPage} of ${totalPages}]\n${pagesText?.[currentPage] || '(no text)'}`
      : Object.entries(pagesText || {}).map(([p, t]) => `[Page ${p}]\n${t}`).join('\n\n');
    const newMsgs = [...msgs, { role: 'user', content: msg }, { role: 'assistant', content: '' }];
    setMsgs(newMsgs);
    setLoading(true);
    try {
      const hist = newMsgs.slice(-8, -1).map(m => `${m.role === 'user' ? 'USER' : 'MARIAM'}: ${m.content}`).join('\n');
      const prompt = `You are Mariam AI, an expert medical study assistant. Answer based on this document context:\n\n${context}\n\nConversation:\n${hist}\n\nUSER: ${msg}\n\nMARIAM:`;
      if (typeof callAIStreaming === 'function') {
        await callAIStreaming(prompt, chunk => {
          setMsgs(p => [...p.slice(0, -1), { role: 'assistant', content: chunk }]);
        }, settings, 4000);
      } else {
        const reply = await callAI(prompt, false, false, settings, 4000);
        setMsgs(p => [...p.slice(0, -1), { role: 'assistant', content: reply }]);
      }
    } catch (e) {
      setMsgs(p => [...p.slice(0, -1), { role: 'assistant', content: `Error: ${e.message}` }]);
    } finally { setLoading(false); }
  }, [input, loading, msgs, mode, currentPage, totalPages, pagesText, callAI, callAIStreaming, settings]);

  return (
    <div className="flex flex-col h-full">
      {/* Mode tabs */}
      <div className="flex shrink-0 border-b border-[color:var(--border2,var(--border))] bg-[var(--surface,var(--card))]">
        {['page', 'document'].map(m => (
          <button key={m} onClick={() => setMode(m)}
            className={`flex-1 py-2.5 text-xs font-black uppercase tracking-widest transition-colors border-b-2
              ${mode === m ? 'border-[var(--accent)] text-[var(--accent)]' : 'border-transparent opacity-50 hover:opacity-80'}`}>
            {m === 'page' ? `Page ${currentPage}` : 'Full Doc'}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-3" ref={scrollContainerRef}>
        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-2.5 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-[var(--accent)]' : 'overflow-hidden glass'}`}>
              {m.role === 'user' ? <UserCircle2 size={16} className="text-white" /> : <img src={MARIAM_IMG} className="w-full h-full object-cover" alt="AI" />}
            </div>
            <div className={`px-3.5 py-2.5 text-xs leading-relaxed max-w-[84%] rounded-2xl
              ${m.role === 'user' ? 'bg-[var(--accent)] text-white rounded-tr-sm' : 'glass rounded-tl-sm'}`}>
              {m.content ? renderAIContent(m.content) : <span className="opacity-30"></span>}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 border-t border-[color:var(--border2,var(--border))] bg-[var(--surface,var(--card))]"
        style={{ padding: '12px 12px calc(12px + env(safe-area-inset-bottom)) 12px' }}>
        <div className="flex gap-2 items-end glass rounded-2xl p-2 border border-[color:var(--border2,var(--border))] focus-within:border-[var(--accent)]/50">
          <textarea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask about this document" disabled={loading} rows={1}
            className="flex-1 bg-[var(--bg)] border border-[color:var(--border2,var(--border))] rounded-xl px-3 py-2 text-xs outline-none resize-none focus:border-[var(--accent)] text-[var(--text)] min-h-[36px] max-h-24" />
          <button onClick={toggleVoice}
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all glass"
            style={listening ? { background: 'var(--danger)', color: '#fff', border: 'none' } : { color: 'var(--accent)' }}
            title={listening ? 'Stop voice' : 'Voice input'}>
            {listening ? <MicOff size={18} /> : <Mic size={18} />}
          </button>
          <button onClick={send} disabled={loading || !input.trim()}
            className="w-9 h-9 bg-[var(--accent)] disabled:opacity-40 rounded-xl text-white flex items-center justify-center shrink-0">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
