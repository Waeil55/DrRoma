/**
 * MARIAM PRO — Chat Message Component
 * Individual message bubble with copy action.
 */
import React from 'react';
import { UserCircle2, Copy } from 'lucide-react';
import { renderAIContent } from '../../utils/markdown.js';

const MARIAM_IMG = 'https://i.ibb.co/gbL3pSCw/mariam.png';

export default function ChatMessage({ message, index }) {
  const isUser = message.role === 'user';

  return (
    <div className={`flex gap-4 ${isUser ? 'flex-row-reverse' : ''} group`}>
      <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-1 ${isUser ? 'bg-[var(--accent)]' : 'overflow-hidden border border-[color:var(--border2,var(--border))]'}`}>
        {isUser ? <UserCircle2 size={20} className="text-white" /> : <img src={MARIAM_IMG} className="w-full h-full object-cover" alt="AI" />}
      </div>
      <div className={`flex-1 max-w-[85%] flex flex-col gap-1.5 ${isUser ? 'items-end' : ''}`}>
        <div className={`px-4 py-3 rounded-2xl text-sm leading-relaxed
          ${isUser ? 'bg-[var(--accent)] text-white rounded-tr-sm max-w-[80%]' : 'rounded-tl-sm'}`}>
          {!isUser ? (
            <div className="prose-custom">{message.content ? renderAIContent(message.content) : <span className="opacity-30 animate-pulse">▊</span>}</div>
          ) : (
            <p className="whitespace-pre-wrap">{message.content}</p>
          )}
        </div>
        <div className="flex items-center gap-2 px-1">
          <button onClick={() => navigator.clipboard?.writeText(message.content)}
            className="opacity-0 group-hover:opacity-40 hover:!opacity-80 text-xs font-bold flex items-center gap-1 transition-opacity">
            <Copy size={12} />Copy
          </button>
        </div>
      </div>
    </div>
  );
}
