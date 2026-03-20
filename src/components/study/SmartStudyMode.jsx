import React, { useState, useMemo } from 'react';
import { Brain, Zap, Volume2, Mic, ChevronLeft } from 'lucide-react';
import FSRSFlashcardReview from './FSRSFlashcardReview';
import MatchGame from '../flashcards/MatchGame';
import StudyPodcastPanel from '../voice/StudyPodcastPanel';

export default function SmartStudyMode({ flashcards, exams, cases, settings, addToast, setFlashcards }) {
  const FSRS = window.__MARIAM_FSRS__ || { predictedScore: () => 0 };
  const [mode, setMode] = useState(null);
  const [selectedSet, setSelectedSet] = useState(null);
  const allDue = useMemo(() => { let t = 0; flashcards.forEach(s => { t += (s.cards || []).filter(c => !c.nextReview || c.nextReview <= Date.now()).length; }); return t; }, [flashcards]);

  if (mode === 'fsrs' && selectedSet) return <FSRSFlashcardReview set={selectedSet} onUpdate={updated => setFlashcards(p => p.map(s => s.id === updated.id ? updated : s))} onClose={() => { setMode(null); setSelectedSet(null); }} />;
  if (mode === 'match' && selectedSet) return <MatchGame set={selectedSet} onClose={() => { setMode(null); setSelectedSet(null); }} />;
  if (mode === 'podcast') return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="flex items-center gap-3 px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}><button onClick={() => setMode(null)} className="w-8 h-8 glass rounded-xl flex items-center justify-center"><ChevronLeft size={16} /></button><h2 className="font-black">Study Podcasts</h2></div>
      <StudyPodcastPanel flashcards={flashcards} exams={exams} settings={settings} addToast={addToast} />
    </div>
  );

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-4">
      {allDue > 0 && (
        <div className="glass rounded-3xl p-6 relative overflow-hidden" style={{ border: '1px solid var(--border)' }}>
          <div className="bg-mesh absolute inset-0 opacity-20" />
          <div className="relative z-10">
            <div className="flex items-center justify-between mb-4"><div><p className="text-xs font-black uppercase tracking-widest opacity-40">FSRS Review Queue</p><h2 className="text-3xl font-black" style={{ color: 'var(--accent)' }}>{allDue} cards due</h2></div><div className="text-5xl"></div></div>
            <div className="flex gap-3 flex-wrap">
              {flashcards.filter(s => (s.cards || []).some(c => !c.nextReview || c.nextReview <= Date.now())).slice(0, 4).map(set => {
                const due = (set.cards || []).filter(c => !c.nextReview || c.nextReview <= Date.now()).length;
                return (<button key={set.id} onClick={() => { setSelectedSet(set); setMode('fsrs'); }} className="glass rounded-2xl px-4 py-2 text-sm font-black flex items-center gap-2 transition-all hover:scale-105" style={{ border: '1px solid var(--accent)/30' }}><span style={{ color: 'var(--accent)' }}>{due}</span> {set.title?.slice(0, 20)}</button>);
              })}
            </div>
          </div>
        </div>
      )}
      <h2 className="font-black text-sm opacity-50 uppercase tracking-widest px-1">Study Modes</h2>
      <div className="grid grid-cols-2 gap-3">
        {[{ id: 'fsrs', icon: Brain, title: 'FSRS Review', desc: 'Adaptive spaced repetition', col: 'var(--accent)', badge: allDue > 0 ? `${allDue} due` : null },{ id: 'match', icon: Zap, title: 'Match Game', desc: 'Speed-match terms to definitions', col: '#8b5cf6' },{ id: 'podcast', icon: Volume2, title: 'AI Podcast', desc: 'Listen to AI-generated summaries', col: '#06b6d4' },{ id: 'voice', icon: Mic, title: 'Voice Tutor', desc: 'Real-time AI voice Q&A', col: 'var(--success)' }].map(({ id, icon: Icon, title, desc, col, badge }) => (
          <button key={id} onClick={() => { if (id === 'voice') setMode('voice'); else if (id === 'podcast') setMode('podcast'); else if (flashcards.length === 0) addToast('No flashcard decks yet', 'info'); else { setSelectedSet(flashcards[0]); setMode(id); } }}
            className="glass rounded-2xl p-5 text-left card-hover relative overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            <div className="absolute top-0 right-0 w-20 h-20 rounded-bl-3xl opacity-10" style={{ background: col }} />
            <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3 relative z-10" style={{ background: col + '20', color: col }}><Icon size={20} /></div>
            <h3 className="font-black text-sm relative z-10">{title}</h3><p className="text-xs opacity-40 mt-0.5 relative z-10">{desc}</p>
            {badge && <span className="badge badge-warn absolute top-3 right-3" style={{ fontSize: 10 }}>{badge}</span>}
          </button>
        ))}
      </div>
      {flashcards.length > 0 && (
        <div className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
          <h3 className="font-black text-xs opacity-50 uppercase tracking-widest mb-3">Your Decks</h3>
          <div className="space-y-2">
            {flashcards.map(set => { const due = (set.cards || []).filter(c => !c.nextReview || c.nextReview <= Date.now()).length; const score = FSRS.predictedScore(set.cards || []); return (
              <div key={set.id} className="flex items-center gap-3"><div className="flex-1 min-w-0"><div className="font-bold text-sm truncate">{set.title}</div><div className="flex-1 progress-bar mt-1 h-1"><div className="progress-fill" style={{ width: `${score}%`, background: score >= 80 ? 'var(--success)' : score >= 60 ? 'var(--warning)' : 'var(--danger)' }} /></div></div>
                {due > 0 && <span className="badge badge-warn text-xs">{due} due</span>}
                <div className="flex gap-1.5 shrink-0"><button onClick={() => { setSelectedSet(set); setMode('fsrs'); }} className="text-xs font-black px-2 py-1 rounded-lg" style={{ background: 'var(--accent)/10', color: 'var(--accent)' }}>Study</button><button onClick={() => { setSelectedSet(set); setMode('match'); }} className="text-xs font-black px-2 py-1 rounded-lg" style={{ background: 'rgba(139,92,246,.15)', color: '#8b5cf6' }}>Match</button></div>
              </div>); })}
          </div>
        </div>
      )}
      {flashcards.length === 0 && (<div className="empty-state py-12"><div className="empty-icon"><Brain size={40} /></div><p className="font-black text-lg mt-4">No decks to study</p><p className="text-sm opacity-40 mt-1">Generate flashcards from a document to start</p></div>)}
    </div>
  );
}
