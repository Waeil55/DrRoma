/**
 * MARIAM PRO — AiTutorPanel Component
 * Draggable AI tutor side panel for Flashcards, Exams, Cases.
 */
import React, { useState, useRef, useEffect } from 'react';
import { GraduationCap, Send, X } from 'lucide-react';
import { renderAIContent } from '../../utils/markdown';
import { callAIStreaming } from '../../services/ai/callAIStreaming';

const QUICK_PROMPTS = [
  'Explain this in detail',
  'Why is this the correct answer?',
  'What are common mistakes here?',
  'Give me a mnemonic',
  'What else should I know?',
  'Create a practice question',
];

export default function AiTutorPanel({ settings, context, onClose, width, onDragStart, alwaysOpen = false }) {
  const [msgs, setMsgs] = useState([{
    role: 'assistant',
    content: "Hi! I'm your AI Tutor \nAsk me anything about this question, the diagnosis, the explanation, or related concepts. I'm here to help you learn!"
  }]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [showQuicks, setShowQuicks] = useState(true);
  const endRef = useRef(null);
  const scrollContainerRef = useRef(null);

  useEffect(() => {
    const el = scrollContainerRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, loading]);

  const send = async (override) => {
    const msg = override || input;
    if (!msg.trim() || loading) return;
    setInput(''); setShowQuicks(false);
    const newMsgs = [...msgs, { role: 'user', content: msg }, { role: 'assistant', content: '' }];
    setMsgs(newMsgs); setLoading(true);
    try {
      const hist = newMsgs.slice(-8, -1).map(m => `${m.role === 'user' ? 'STUDENT' : 'TUTOR'}: ${m.content}`).join('\n');
      const prompt = `You are an expert medical/academic AI tutor. The student is currently studying the following content:\n\nCONTEXT:\n${context || 'General study session'}\n\nConversation so far:\n${hist}\n\nSTUDENT: ${msg}\n\nTUTOR: Provide a clear, educational explanation. Use bullet points, bold key terms, and be thorough but concise.\n\nCRITICAL MEDICINE RULE: Whenever you discuss any medication or drug, ALWAYS start with the brand name first, followed by the generic name in parentheses. Format: "BrandName (generic name)". Example: "Tylenol (acetaminophen)", "Lipitor (atorvastatin)", "Lasix (furosemide)". Apply this to every single drug mentioned anywhere in your response.`;
      await callAIStreaming(prompt, chunk => {
        setMsgs(p => [...p.slice(0, -1), { role: 'assistant', content: chunk }]);
      }, settings, 4000);
    } catch (e) {
      setMsgs(p => [...p.slice(0, -1), { role: 'assistant', content: ` ${e.message}` }]);
    } finally { setLoading(false); }
  };

  return (
    <div className="flex flex-col h-full min-h-0 bg-[var(--surface,var(--card))] border-l border-[color:var(--border2,var(--border))]"
      style={{ width: width || 360 }}>
      {/* Header */}
      <div ref={onDragStart?.ref}
        className="bg-gradient-to-r from-[var(--accent)] to-[var(--accent2,var(--accent))] text-white flex items-center justify-between px-4 py-3 shrink-0 cursor-grab select-none touch-none"
        onMouseDown={onDragStart}>
        <div>
          <span className="font-black flex items-center gap-2 text-base"><GraduationCap size={20} /> AI Tutor</span>
          <p className="text-xs opacity-70 mt-0.5">Ask about anything you're studying</p>
        </div>
        {!alwaysOpen && onClose && (
          <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center transition-colors hover:bg-[var(--accent)]/20">
            <X size={18} />
          </button>
        )}
      </div>
      {/* Messages */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-3 space-y-3" ref={scrollContainerRef}>
        {msgs.map((m, i) => (
          <div key={i} className={`flex gap-2 ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
            <div className={`w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-xs font-black ${m.role === 'user' ? 'bg-[var(--accent)] text-white' : 'bg-gradient-to-br from-[var(--accent)] to-[var(--accent2,var(--accent))] text-white'}`}>
              {m.role === 'user' ? 'You' : 'AI'}
            </div>
            <div className={`px-3 py-2.5 text-sm leading-relaxed rounded-2xl max-w-[85%]
              ${m.role === 'user' ? 'bg-[var(--accent)] text-white rounded-tr-sm' : 'glass border border-[color:var(--border2,var(--border))] rounded-tl-sm'}`}>
              {m.content ? renderAIContent(m.content) : <span className="opacity-30 animate-pulse">▊</span>}
            </div>
          </div>
        ))}
        {loading && (
          <div className="flex gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent2,var(--accent))] text-white flex items-center justify-center text-xs font-black shrink-0">AI</div>
            <div className="glass rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-1.5 border border-[color:var(--border2,var(--border))]">
              {[0, 1, 2].map(i => <div key={i} className="w-2 h-2 bg-[var(--accent)] rounded-full animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />)}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>
      {/* Quick prompts */}
      {showQuicks && (
        <div className="px-3 py-2 flex gap-1.5 flex-wrap shrink-0 border-t border-[color:var(--border2,var(--border))]">
          {QUICK_PROMPTS.map(q => (
            <button key={q} onClick={() => send(q)}
              className="px-2.5 py-1.5 glass rounded-xl text-xs font-bold opacity-60 hover:opacity-100 hover:border-[var(--accent)]/40 transition-all border border-[color:var(--border2,var(--border))] leading-tight text-left">
              {q}
            </button>
          ))}
        </div>
      )}
      {/* Input */}
      <div className="shrink-0 p-3 border-t border-[color:var(--border2,var(--border))] bg-[var(--surface,var(--card))]">
        <div className="flex gap-2 items-end glass rounded-2xl p-2 border border-[color:var(--border2,var(--border))] focus-within:border-[var(--accent)]/50">
          <textarea value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            placeholder="Ask your tutor anything…" disabled={loading} rows={1}
            className="flex-1 bg-transparent p-1.5 text-sm outline-none resize-none max-h-32 custom-scrollbar text-[var(--text)] min-h-[36px]" />
          <button onClick={() => send()} disabled={loading || !input.trim()}
            className="w-9 h-9 bg-[var(--accent)] disabled:opacity-40 rounded-xl text-white flex items-center justify-center shrink-0 shadow-lg">
            <Send size={18} />
          </button>
        </div>
      </div>
    </div>
  );
}
