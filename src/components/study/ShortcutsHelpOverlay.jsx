import React from 'react';
import { X } from 'lucide-react';

export default function ShortcutsHelpOverlay({ onClose }) {
  const shortcuts = [
    { key: 'Ctrl+K', label: 'Open global search', group: 'Navigation' },
    { key: 'Ctrl+1', label: 'Go to Library', group: 'Navigation' },
    { key: 'Ctrl+3', label: 'Go to Flashcards', group: 'Navigation' },
    { key: 'Ctrl+4', label: 'Go to Exams', group: 'Navigation' },
    { key: 'Ctrl+5', label: 'Go to Cases', group: 'Navigation' },
    { key: 'Ctrl+6', label: 'Go to AI Chat', group: 'Navigation' },
    { key: '?', label: 'Show this help', group: 'General' },
    { key: 'Esc', label: 'Close modal / search', group: 'General' },
    { key: 'Space', label: 'Flip flashcard', group: 'Study' },
    { key: '1', label: 'Rate card: Again', group: 'Study' },
    { key: '2', label: 'Rate card: Hard', group: 'Study' },
    { key: '3', label: 'Rate card: Good', group: 'Study' },
    { key: '4', label: 'Rate card: Easy', group: 'Study' },
  ];

  const groups = [...new Set(shortcuts.map(s => s.group))];

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center px-4" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }} onClick={onClose}>
      <div className="glass rounded-3xl p-6 max-w-md w-full animate-scale-in" style={{ border: '1px solid var(--border)' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-black text-xl flex items-center gap-2">Keyboard Shortcuts</h2>
          <button onClick={onClose} className="w-8 h-8 glass rounded-xl flex items-center justify-center opacity-50"><X size={14} /></button>
        </div>
        {groups.map(group => (
          <div key={group} className="mb-4">
            <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-2">{group}</h3>
            <div className="space-y-1.5">
              {shortcuts.filter(s => s.group === group).map(s => (
                <div key={s.key} className="flex items-center justify-between px-3 py-2 rounded-xl" style={{ background: 'var(--surface,var(--card))' }}>
                  <span className="text-sm">{s.label}</span>
                  <kbd className="text-xs font-black px-2 py-1 rounded-lg glass border border-[var(--border)] ml-2 shrink-0">{s.key}</kbd>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
