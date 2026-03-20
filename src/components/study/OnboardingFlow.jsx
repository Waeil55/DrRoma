import React, { useState } from 'react';
import { FileUp, Sparkles, Brain, Eye, EyeOff } from 'lucide-react';

export default function OnboardingFlow({ onComplete, settings, setSettings }) {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [apiKey, setApiKey] = useState('');
  const [showKey, setShowKey] = useState(false);

  const STEPS = [
    { title: 'Welcome to MARIAM PRO', subtitle: 'Your AI-powered medical study companion', emoji: '‍' },
    { title: "What's your name?", subtitle: 'Personalize your experience', emoji: '' },
    { title: 'Connect Your AI', subtitle: 'Add an API key to unlock AI features', emoji: '' },
    { title: 'How it works', subtitle: 'Upload → Generate → Study', emoji: '' },
    { title: "You're all set!", subtitle: 'Start your learning journey', emoji: '' },
  ];

  const s = STEPS[step];

  const next = () => {
    if (step === 1 && name.trim()) setSettings(p => ({ ...p, name: name.trim() }));
    if (step === 2 && apiKey.trim()) setSettings(p => ({ ...p, apiKey: apiKey.trim() }));
    if (step < STEPS.length - 1) setStep(s => s + 1);
    else onComplete();
  };

  return (
    <div className="fixed inset-0 z-[9990] flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(24px)' }}>
      <div className="glass rounded-3xl p-8 max-w-md w-full mx-4 flex flex-col items-center gap-6 animate-scale-in" style={{ border: '1px solid var(--border)' }}>
        <div className="flex gap-2">
          {STEPS.map((_, i) => (
            <div key={i} className="rounded-full transition-all" style={{
              width: i === step ? 24 : 8, height: 8,
              background: i <= step ? 'var(--accent)' : 'var(--border)'
            }} />
          ))}
        </div>

        <div className="text-6xl">{s.emoji}</div>

        <div className="text-center">
          <h2 className="text-2xl font-black">{s.title}</h2>
          <p className="text-sm opacity-50 mt-2">{s.subtitle}</p>
        </div>

        {step === 1 && (
          <input value={name} onChange={e => setName(e.target.value)}
            placeholder="Enter your name…"
            className="w-full glass-input rounded-xl px-4 py-3 text-center font-bold text-lg outline-none"
            style={{ border: '1px solid var(--border)' }}
            onKeyDown={e => e.key === 'Enter' && next()}
            autoFocus />
        )}

        {step === 2 && (
          <div className="w-full space-y-3">
            <div className="relative">
              <input value={apiKey} onChange={e => setApiKey(e.target.value)}
                type={showKey ? 'text' : 'password'}
                placeholder="sk-… or Bearer …"
                className="w-full glass-input rounded-xl px-4 py-3 pr-12 text-sm outline-none"
                style={{ border: '1px solid var(--border)' }} />
              <button onClick={() => setShowKey(p => !p)} className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50">
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
            <p className="text-xs opacity-40 text-center">Your key stays on this device only. Never shared.</p>
          </div>
        )}

        {step === 3 && (
          <div className="w-full space-y-3">
            {[
              { n: '1', icon: FileUp, t: 'Upload', d: 'PDF, Word, Excel, Images — drag & drop' },
              { n: '2', icon: Sparkles, t: 'Generate', d: 'AI creates flashcards, exams & cases' },
              { n: '3', icon: Brain, t: 'Study', d: 'Learn with FSRS spaced repetition' },
            ].map(({ n, icon: Icon, t, d }) => (
              <div key={n} className="flex items-center gap-4 glass rounded-xl p-4" style={{ border: '1px solid var(--border)' }}>
                <div className="w-10 h-10 rounded-xl btn-accent flex items-center justify-center shrink-0 font-black">{n}</div>
                <div>
                  <p className="font-black text-sm">{t}</p>
                  <p className="text-xs opacity-50">{d}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {step === 4 && (
          <div className="grid grid-cols-2 gap-3 w-full">
            {[[' Docs', 'PDF & Word support'], [' Cards', 'FSRS spaced repetition'], [' Exams', 'AI-generated tests'], [' Voice', 'AI voice tutor']].map(([title, desc]) => (
              <div key={title} className="glass rounded-2xl p-4 text-center" style={{ border: '1px solid var(--border)' }}>
                <p className="font-black text-sm">{title}</p>
                <p className="text-xs opacity-40 mt-1">{desc}</p>
              </div>
            ))}
          </div>
        )}

        <div className="flex gap-3 w-full">
          {step > 0 && <button onClick={() => setStep(s => s - 1)} className="flex-1 glass py-3 rounded-2xl font-black" style={{ border: '1px solid var(--border)' }}>Back</button>}
          <button onClick={next} className="flex-1 btn-accent py-3 rounded-2xl font-black">
            {step === STEPS.length - 1 ? "Let's Go! " : 'Continue →'}
          </button>
        </div>

        <button onClick={onComplete} className="text-xs opacity-30 hover:opacity-60">Skip setup</button>
      </div>
    </div>
  );
}
