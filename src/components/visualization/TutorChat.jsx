/**
 * MARIAM PRO — TutorChat
 * Streaming AI tutor chat with voice input — used inside document reader & study views.
 */
import React, { useState, useRef, useEffect } from 'react';
import { Brain, UserCircle2, Mic, MicOff, Send } from 'lucide-react';
import { callAIStreaming } from '../../services/ai/callAIStreaming';
import { renderAIContent } from '../../utils/markdown';

const MARIAM_IMG = 'https://raw.githubusercontent.com/Waeil55/DrMariam/main/M.jpeg';

export default function TutorChat({ context, settings, contextLabel = '' }) {
  const [msgs, setMsgs] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [listening, setListening] = useState(false);
  const endRef = useRef(null); const prevCtx = useRef(null);
  const recogRef = useRef(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const key = JSON.stringify(context);
    if (prevCtx.current !== key) {
      prevCtx.current = key;
      if (context) setMsgs([{ role: 'assistant', content: `Ready! Ask me anything about ${contextLabel || 'this content'}.` }]);
    }
  }, [context, contextLabel]);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, loading]);

  const toggleVoice = () => {
    if (listening) { recogRef.current?.stop(); setListening(false); return; }
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { alert('Voice input not supported in this browser.'); return; }
    const r = new SR(); r.continuous = false; r.interimResults = true;
    r.onresult = e => { const t = Array.from(e.results).map(r => r[0].transcript).join(''); setInput(t); };
    r.onend = () => setListening(false); r.onerror = () => setListening(false);
    r.start(); recogRef.current = r; setListening(true);
  };

  const send = async () => {
    if (!input.trim() || loading) return;
    const msg = input; setInput('');
    const newMsgs = [...msgs, { role: 'user', content: msg }];
    setMsgs([...newMsgs, { role: 'assistant', content: '' }]); setLoading(true);
    try {
      const hist = newMsgs.slice(-20).map(m => `${m.role === 'user' ? 'STUDENT' : 'TUTOR'}: ${m.content}`).join('\n');
      const prompt = `Expert tutor. Document context:\n${JSON.stringify(context, null, 2)}\n\nConversation:\n${hist}\n\nStudent: ${msg}\n\nAnswer concisely but completely.`;
      await callAIStreaming(prompt, chunk => { setMsgs(p => [...p.slice(0, -1), { role: 'assistant', content: chunk }]); }, settings, 3000);
    } catch (e) { setMsgs(p => [...p.slice(0, -1), { role: 'assistant', content: `⚠️ ${e.message}` }]); }
    finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full bg-[var(--bg)]">
      <div className="flex items-center gap-2 px-3 py-2 border-b border-[color:var(--border2,var(--border))] bg-[var(--surface,var(--card))] shrink-0">
        <img src={MARIAM_IMG} className="w-7 h-7 rounded-lg object-cover" alt="AI" />
        <span className="text-xs font-black uppercase tracking-widest text-[var(--accent)]">AI Tutor</span>
        {loading && <div className="ml-auto flex gap-1">{[0, 1, 2].map(i => <div key={i} className="w-1.5 h-1.5 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}</div>}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 space-y-3" ref={scrollContainerRef}>
        {msgs.length === 0 && <div className="flex flex-col items-center justify-center h-full opacity-40 text-center"><Brain size={32} className="mb-2" /><p className="text-xs font-bold">Ask me anything</p></div>}
        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${m.role === 'user' ? 'bg-[var(--accent)]' : 'overflow-hidden'}`}>
              {m.role === 'user' ? <UserCircle2 size={16} className="text-white" /> : <img src={MARIAM_IMG} className="w-full h-full object-cover" alt="AI" />}
            </div>
            <div className={`px-3 py-2 text-xs leading-relaxed max-w-[85%] rounded-2xl
              ${m.role === 'user' ? 'bg-[var(--accent)] text-white rounded-tr-sm' : 'bg-[var(--surface,var(--card))] border border-[color:var(--border2,var(--border))] rounded-tl-sm'}`}>
              {m.content ? renderAIContent(m.content) : <span className="opacity-40">thinking…</span>}
            </div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="shrink-0 p-2 border-t border-[color:var(--border2,var(--border))] bg-[var(--surface,var(--card))]">
        <div className="flex gap-2 items-end">
          <textarea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask tutor…" disabled={loading} rows={1}
            className="flex-1 bg-[var(--bg)] border border-[color:var(--border2,var(--border))] rounded-xl px-3 py-2 text-xs outline-none resize-none focus:border-[var(--accent)] text-[var(--text)] min-h-[36px] max-h-24" />
          <button onClick={toggleVoice}
            className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all"
            style={listening ? { background: 'var(--danger)', color: '#fff', animation: 'glow-ring 1s ease infinite' } : { color: 'var(--accent)' }}
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
