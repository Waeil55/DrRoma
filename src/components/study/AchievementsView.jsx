import React, { useState, useEffect, useMemo } from 'react';
import { X } from 'lucide-react';
import { getTotalXP, getXPLevel, getLevelPct, getXPToNext, LEVELS } from '../../utils/xpSystem';

const ACHIEVEMENT_DEFS = [
  //  Study milestone badges 
  { id: 'first_upload',   icon: '', label: 'First Upload',       desc: 'Upload your first document',            color: '#6366f1', check: (d) => d.length >= 1 },
  { id: 'five_docs',      icon: '', label: 'Library Builder',     desc: 'Upload 5 documents',                    color: '#06b6d4', check: (d) => d.length >= 5 },
  { id: 'ten_docs',       icon: '', label: 'Digital Library',    desc: 'Upload 10 documents',                   color: '#0891b2', check: (d) => d.length >= 10 },
  //  Flashcard milestones 
  { id: 'first_card',     icon: '', label: 'Flashcard Pioneer',   desc: 'Create your first flashcard deck',      color: '#8b5cf6', check: (d, fc) => fc.filter(f => !f.isBuiltin).length >= 1 },
  { id: '10_cards',       icon: '', label: '10 Cards Studied',    desc: 'Study 10 flashcards',                   color: '#6366f1', check: (d, fc) => fc.reduce((s, f) => s + (f.cards?.filter(c => c.lastReview).length || 0), 0) >= 10 },
  { id: '50_cards',       icon: '', label: '50 Cards Mastered',   desc: 'Study 50 flashcards',                   color: '#f59e0b', check: (d, fc) => fc.reduce((s, f) => s + (f.cards?.filter(c => c.lastReview).length || 0), 0) >= 50 },
  { id: '100_cards',      icon: '', label: 'Century Club',        desc: 'Study 100 flashcards',                  color: '#f97316', check: (d, fc) => fc.reduce((s, f) => s + (f.cards?.filter(c => c.lastReview).length || 0), 0) >= 100 },
  { id: '500_cards',      icon: '', label: 'Knowledge Seeker',    desc: 'Study 500 flashcards',                  color: '#10b981', check: (d, fc) => fc.reduce((s, f) => s + (f.cards?.filter(c => c.lastReview).length || 0), 0) >= 500 },
  { id: '1000_cards',     icon: '', label: 'Card Master',         desc: 'Study 1,000 flashcards',               color: '#f43f5e', check: (d, fc) => fc.reduce((s, f) => s + (f.cards?.filter(c => c.lastReview).length || 0), 0) >= 1000 },
  //  Exam badges 
  { id: 'first_exam',     icon: '', label: 'First Exam',          desc: 'Complete your first exam',              color: '#3b82f6', check: (d, fc, ex) => ex.some(e => e.lastScore !== undefined) },
  { id: 'five_exams',     icon: '', label: 'Test Taker',          desc: 'Complete 5 exams',                      color: '#2563eb', check: (d, fc, ex) => ex.filter(e => e.lastScore !== undefined).length >= 5 },
  { id: 'perfect_exam',   icon: '', label: 'Perfect Score',       desc: 'Score 100% on any exam',               color: '#10b981', check: (d, fc, ex) => ex.some(e => e.lastScore === 100) },
  { id: 'high_score',     icon: '', label: 'Sharp Shooter',       desc: 'Score 90%+ on any exam',               color: '#3b82f6', check: (d, fc, ex) => ex.some(e => typeof e.lastScore === 'number' && e.lastScore >= 90) },
  //  Clinical cases 
  { id: 'first_case',     icon: '', label: 'Clinical Debut',      desc: 'Complete your first clinical case',     color: '#06b6d4', check: (d, fc, ex, cs) => cs.some(c => c.lastAttempt) },
  { id: 'ten_cases',      icon: '', label: 'Case Expert',         desc: 'Complete 10 clinical cases',            color: '#0891b2', check: (d, fc, ex, cs) => cs.filter(c => c.lastAttempt).length >= 10 },
  //  Streak badges 
  { id: 'streak_3',       icon: '', label: 'On Fire',             desc: '3-day study streak',                    color: '#f97316', check: () => { try { const d = JSON.parse(localStorage.getItem('mariam_streak_data') || '{}'); let s=0; const dt=new Date(); for(let i=0;i<10;i++){if(d[dt.toISOString().slice(0,10)])s++;else if(i>0)break;dt.setDate(dt.getDate()-1);} return s>=3; } catch{return false;} } },
  { id: 'streak_7',       icon: '', label: 'Week Warrior',        desc: '7-day study streak',                    color: '#f59e0b', check: () => { try { const d = JSON.parse(localStorage.getItem('mariam_streak_data') || '{}'); let s=0; const dt=new Date(); for(let i=0;i<14;i++){if(d[dt.toISOString().slice(0,10)])s++;else if(i>0)break;dt.setDate(dt.getDate()-1);} return s>=7; } catch{return false;} } },
  { id: 'streak_30',      icon: '', label: 'Monthly Master',      desc: '30-day study streak',                   color: '#06b6d4', check: () => { try { const d = JSON.parse(localStorage.getItem('mariam_streak_data') || '{}'); let s=0; const dt=new Date(); for(let i=0;i<35;i++){if(d[dt.toISOString().slice(0,10)])s++;else if(i>0)break;dt.setDate(dt.getDate()-1);} return s>=30; } catch{return false;} } },
  //  XP level badges 
  { id: 'med_student',    icon: '', label: 'Medical Student',     desc: 'Reach Medical Student level (1,000 XP)', color: '#8b5cf6', check: () => getTotalXP() >= 1000 },
  { id: 'fellow',         icon: '', label: 'Fellow',              desc: 'Reach Fellow level (100,000 XP)',        color: '#6366f1', check: () => getTotalXP() >= 100000 },
  //  Chat / notes 
  { id: 'first_chat',     icon: '', label: 'First Conversation',  desc: 'Have your first AI chat session',        color: '#f43f5e', check: (d, fc, ex, cs, nt, ch) => ch.length >= 1 },
  { id: 'note_taker',     icon: '', label: 'Note Taker',         desc: 'Create 5 notes',                        color: '#f59e0b', check: (d, fc, ex, cs, nt) => nt.length >= 5 },
  //  Special 
  { id: 'early_adopter',  icon: '', label: 'Early Adopter',        desc: 'First time using MARIAM PRO',           color: '#f43f5e', check: () => true },
  { id: 'night_owl',      icon: '', label: 'Night Owl',            desc: 'Study after midnight',                  color: '#7c3aed', check: () => { try { return !!localStorage.getItem('mariam_night_owl'); } catch{return false;} } },
];

export default function AchievementsView({ docs, flashcards, exams, cases, notes, chatSessions }) {
  const [showUnlock, setShowUnlock] = useState(null);
  const [prevUnlocked, setPrevUnlocked] = useState(() => new Set(JSON.parse(localStorage.getItem('mariam_achievements') || '[]')));
  const unlocked = useMemo(() => { const set = new Set(); ACHIEVEMENT_DEFS.forEach(a => { try { if (a.check(docs, flashcards, exams, cases, notes, chatSessions)) set.add(a.id); } catch {} }); return set; }, [docs, flashcards, exams, cases, notes, chatSessions]);

  useEffect(() => {
    // Check for late-night studying (for Night Owl badge)
    if (new Date().getHours() >= 0 && new Date().getHours() < 5) {
      try { localStorage.setItem('mariam_night_owl', '1'); } catch {}
    }
    const newly = [...unlocked].filter(id => !prevUnlocked.has(id));
    if (newly.length > 0) { const def = ACHIEVEMENT_DEFS.find(a => a.id === newly[0]); if (def) setShowUnlock(def); localStorage.setItem('mariam_achievements', JSON.stringify([...unlocked])); setPrevUnlocked(new Set(unlocked)); }
  }, [unlocked]);

  const pct = Math.round((unlocked.size / ACHIEVEMENT_DEFS.length) * 100);
  const totalXP = getTotalXP();
  const curLevel = getXPLevel(totalXP);
  const levelPct = getLevelPct(totalXP);
  const xpToNext = getXPToNext(totalXP);
  const nextLevel = LEVELS.find(l => l.xp > curLevel.xp);

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar scroll-content p-4 space-y-4">
      {showUnlock && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(12px)' }} onClick={() => setShowUnlock(null)}>
          <div className="glass rounded-3xl p-10 flex flex-col items-center gap-4 animate-scale-in max-w-sm mx-4" style={{ border: `2px solid ${showUnlock.color}40` }}>
            <div className="text-7xl">{showUnlock.icon}</div><div className="text-center"><div className="text-xs font-black uppercase tracking-widest opacity-40 mb-1">Achievement Unlocked!</div><h2 className="text-2xl font-black" style={{ color: showUnlock.color }}>{showUnlock.label}</h2><p className="text-sm opacity-60 mt-2">{showUnlock.desc}</p></div>
            <button onClick={() => setShowUnlock(null)} className="btn-accent px-8 py-3 rounded-2xl font-black">Awesome!</button>
          </div>
        </div>
      )}

      {/* XP Level Card */}
      <div className="glass rounded-3xl p-6 relative overflow-hidden" style={{ border: '1px solid var(--accent)28' }}>
        <div className="bg-mesh absolute inset-0 opacity-10" />
        <div className="relative z-10 flex items-center gap-5">
          <div className="text-5xl"></div>
          <div className="flex-1">
            <div className="flex items-baseline gap-3">
              <h2 className="text-2xl font-black" style={{ color: 'var(--accent)' }}>Level {curLevel.n}</h2>
              <span className="text-base font-bold opacity-70">{curLevel.title}</span>
            </div>
            <p className="text-sm opacity-50 mt-0.5">{totalXP.toLocaleString()} XP total</p>
            <div className="mt-2">
              <div className="h-2.5 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${levelPct}%`, background: 'var(--accent)' }} />
              </div>
              <p className="text-xs opacity-40 mt-1">
                {nextLevel ? `${xpToNext.toLocaleString()} XP to Level ${nextLevel.n} (${nextLevel.title})` : ' Max Level Reached'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Achievements header */}
      <div className="glass rounded-3xl p-6 relative overflow-hidden" style={{ border: '1px solid var(--border)' }}>
        <div className="bg-mesh absolute inset-0 opacity-20" />
        <div className="relative z-10 flex items-center gap-6"><div className="text-5xl"></div><div className="flex-1"><h2 className="text-2xl font-black">Achievements</h2><p className="text-sm opacity-50 mt-1">{unlocked.size} / {ACHIEVEMENT_DEFS.length} unlocked</p><div className="progress-bar mt-3 h-2"><div className="progress-fill" style={{ width: `${pct}%`, transition: 'width 1s ease' }} /></div></div><div className="text-3xl font-black" style={{ color: 'var(--accent)' }}>{pct}%</div></div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {ACHIEVEMENT_DEFS.map(a => { const isU = unlocked.has(a.id); return (
          <div key={a.id} className="glass rounded-2xl p-4 flex flex-col items-center gap-2 text-center transition-all" style={{ border: `1px solid ${isU ? a.color + '40' : 'var(--border)'}`, background: isU ? a.color + '08' : 'transparent', opacity: isU ? 1 : 0.5 }}>
            <div className="text-3xl">{isU ? a.icon : ''}</div><div className="text-xs font-black" style={{ color: isU ? a.color : 'var(--text3)' }}>{a.label}</div><div className="text-xs opacity-40 leading-tight">{a.desc}</div>{isU && <div className="text-xs font-black mt-1" style={{ color: a.color }}> Unlocked</div>}
          </div>); })}
      </div>
    </div>
  );
}
