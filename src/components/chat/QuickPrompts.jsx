/**
 * MARIAM PRO — Quick Prompts / Starters
 * Conversation starter cards shown before first message.
 */
import React from 'react';

const MARIAM_IMG = 'https://i.ibb.co/gbL3pSCw/mariam.png';

const STARTERS = [
  { icon: '🧬', text: 'Explain a complex topic' },
  { icon: '📋', text: 'Create a study plan' },
  { icon: '❓', text: 'Quiz me on key concepts' },
  { icon: '🔍', text: 'Compare and contrast' },
  { icon: '📝', text: 'Summarize main points' },
  { icon: '💡', text: 'Give me clinical pearls' },
];

export default function QuickPrompts({ onSelect }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-full p-6 gap-8">
      <div className="text-center space-y-3">
        <div className="relative inline-block">
          <img src={MARIAM_IMG} className="w-24 h-24 rounded-3xl object-cover shadow-2xl border-4 border-[color:var(--border2,var(--border))]" alt="MARIAM AI" />
          <div className="absolute -bottom-1.5 -right-1.5 w-7 h-7 rounded-full border-2 border-[var(--bg)] flex items-center justify-center" style={{ background: 'var(--success)' }}>
            <div className="w-2.5 h-2.5 bg-white rounded-full" />
          </div>
        </div>
        <h1 className="text-3xl font-black">What can I help you study?</h1>
        <p className="text-base opacity-50 max-w-md">Your AI study assistant — medicine, sciences, and beyond</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 w-full max-w-2xl">
        {STARTERS.map(s => (
          <button key={s.text} onClick={() => onSelect(s.text)}
            className="glass rounded-2xl p-4 text-left hover:border-[var(--accent)]/40 hover:bg-[var(--accent)]/5 transition-all border border-[color:var(--border2,var(--border))] group">
            <div className="text-2xl mb-2">{s.icon}</div>
            <p className="text-sm font-bold group-hover:text-[var(--accent)] transition-colors">{s.text}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
