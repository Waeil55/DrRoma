/**
 * MARIAM PRO  VoiceTutorModal Component
 * Full-screen voice tutor with always-on recognition, ProsodyEngine TTS,
 * bottom toolbar, and session summary on close.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Mic, Brain, Volume2, X, Keyboard, Settings as SettingsIcon, Hand } from 'lucide-react';

const MARIAM_IMG = 'https://raw.githubusercontent.com/Waeil55/DrMariam/main/M.jpeg';

export default function VoiceTutorModal({ settings, onClose, callAIStreaming }) {
  const [phase, setPhase] = useState('idle'); // idle | listening | thinking | speaking
  const [transcript, setTranscript] = useState('');
  const [interimTranscript, setInterimTranscript] = useState('');
  const [response, setResponse] = useState('');
  const [history, setHistory] = useState([]);
  const [showTextInput, setShowTextInput] = useState(false);
  const [textDraft, setTextDraft] = useState('');
  const [topicsCovered, setTopicsCovered] = useState([]);
  const [showSummary, setShowSummary] = useState(false);
  const recognRef = useRef(null);
  const transcriptRef = useRef('');
  const isListeningRef = useRef(false);
  const queryCountRef = useRef(0);

  const FILLERS = ["Hmm, let me think about that...", "That's a great question...", "Let's see...", "Good point, so...", "Right, okay..."];

  // Start always-on recognition
  const startListening = useCallback(() => {
    const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SR) { setShowTextInput(true); return; }
    try {
      const r = new SR();
      r.continuous = true; r.interimResults = true; r.lang = 'en-US';
      r.onstart = () => { isListeningRef.current = true; setPhase('listening'); };
      r.onspeechstart = () => {
        // Interrupt TTS immediately when user speaks
        window.speechSynthesis?.cancel();
        if (phase === 'speaking') setPhase('listening');
      };
      r.onresult = e => {
        let interim = '', final = '';
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) final += e.results[i][0].transcript;
          else interim += e.results[i][0].transcript;
        }
        if (interim) setInterimTranscript(interim);
        if (final) {
          setTranscript(final);
          transcriptRef.current = final;
          setInterimTranscript('');
          handleQuery(final);
        }
      };
      r.onerror = e => {
        if (e.error !== 'aborted' && e.error !== 'no-speech' && isListeningRef.current) {
          setTimeout(() => startListening(), 500);
        }
      };
      r.onend = () => {
        if (isListeningRef.current) {
          try { r.start(); } catch {}
        }
      };
      r.start();
      recognRef.current = r;
    } catch { setShowTextInput(true); }
  }, []);

  useEffect(() => {
    startListening();
    return () => {
      isListeningRef.current = false;
      recognRef.current?.abort();
      window.speechSynthesis?.cancel();
    };
  }, []);

  const handleQuery = async (text) => {
    if (!text.trim()) return;
    setPhase('thinking');
    setHistory(h => [...h, { role: 'user', text }]);
    setTranscript('');
    transcriptRef.current = '';
    queryCountRef.current += 1;

    // Track topics
    const words = text.toLowerCase().split(/\s+/);
    const keywords = words.filter(w => w.length > 4).slice(0, 3);
    if (keywords.length) setTopicsCovered(prev => [...new Set([...prev, ...keywords])]);

    try {
      // Add context about current study
      const contextPrefix = settings?.currentDoc ? `[Context: Student is studying "${settings.currentDoc}"] ` : '';
      let out = '';
      await callAIStreaming(contextPrefix + text, chunk => { out += chunk; setResponse(o => o + chunk); }, settings, 400);
      setResponse(out);
      setHistory(h => [...h, { role: 'assistant', text: out }]);
      setPhase('speaking');

      if (window.speechSynthesis) {
        // Use filler every 4th response
        const useFiller = queryCountRef.current % 4 === 0;
        if (useFiller) {
          const filler = FILLERS[Math.floor(Math.random() * FILLERS.length)];
          const fu = new SpeechSynthesisUtterance(filler);
          fu.rate = 0.88; fu.pitch = 1.04;
          window.speechSynthesis.speak(fu);
          await new Promise(r => { fu.onend = r; fu.onerror = r; });
        }

        const utt = new SpeechSynthesisUtterance(out);
        utt.rate = 1.0; utt.pitch = 1.02;
        const voices = window.speechSynthesis.getVoices();
        const best = voices.find(v => /neural|premium|enhanced/i.test(v.name) && v.lang.startsWith('en'))
          || voices.find(v => /samantha|karen|moira/i.test(v.name))
          || voices.find(v => v.lang.startsWith('en'));
        if (best) utt.voice = best;
        utt.onend = () => setPhase('listening');
        utt.onerror = () => setPhase('listening');
        window.speechSynthesis.speak(utt);
      } else setPhase('listening');
    } catch (e) { setResponse('Error: ' + e.message); setPhase('listening'); }
  };

  const interrupt = () => {
    window.speechSynthesis?.cancel();
    setPhase('listening');
  };

  const handleTextSubmit = () => {
    if (!textDraft.trim()) return;
    handleQuery(textDraft.trim());
    setTextDraft('');
    setShowTextInput(false);
  };

  const handleClose = () => {
    if (history.length > 2) {
      setShowSummary(true);
    } else {
      isListeningRef.current = false;
      recognRef.current?.abort();
      window.speechSynthesis?.cancel();
      onClose();
    }
  };

  const confirmClose = () => {
    isListeningRef.current = false;
    recognRef.current?.abort();
    window.speechSynthesis?.cancel();
    onClose();
  };

  const PHASE_CONFIG = {
    idle: { label: 'Starting', color: 'var(--accent)', icon: Mic },
    listening: { label: 'Listening', color: 'var(--danger)', icon: Mic },
    thinking: { label: 'Thinking', color: 'var(--warning)', icon: Brain },
    speaking: { label: 'Speaking (tap to interrupt)', color: 'var(--success)', icon: Volume2 },
  };
  const pc = PHASE_CONFIG[phase];
  const PhaseIcon = pc.icon;

  // Session summary
  if (showSummary) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center px-4"
        style={{ background: 'rgba(0,0,0,.9)', backdropFilter: 'blur(24px)', zIndex: 'var(--z-modal, 110)' }}>
        <div className="glass rounded-3xl p-8 max-w-sm w-full flex flex-col gap-4 animate-scale-in" style={{ border: '1px solid var(--border)' }}>
          <h2 className="font-black text-xl text-center">Session Summary</h2>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest opacity-50 mb-2">Topics Covered</h3>
            <div className="flex flex-wrap gap-1.5">
              {topicsCovered.length > 0 ? topicsCovered.slice(0, 10).map((t, i) => (
                <span key={i} className="px-2 py-1 text-xs rounded-lg glass" style={{ border: '1px solid var(--border)' }}>{t}</span>
              )) : <span className="text-xs opacity-40">General discussion</span>}
            </div>
          </div>
          <div>
            <h3 className="text-xs font-black uppercase tracking-widest opacity-50 mb-2">Key Exchanges</h3>
            <p className="text-xs opacity-60">{history.filter(h => h.role === 'user').length} questions asked · {history.filter(h => h.role === 'assistant').length} answers received</p>
          </div>
          <button onClick={confirmClose} className="btn-accent py-3 rounded-2xl font-black text-sm mt-2">Done</button>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 flex flex-col"
      style={{ background: 'rgba(0,0,0,.9)', backdropFilter: 'blur(24px)', zIndex: 'var(--z-modal, 110)' }}>
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 shrink-0">
        <div className="flex items-center gap-3">
          <img src={MARIAM_IMG} alt="MARIAM" className="w-10 h-10 rounded-xl object-cover"
            style={{ boxShadow: phase === 'speaking' ? `0 0 16px ${pc.color}60` : phase === 'listening' ? `0 0 12px ${pc.color}40` : 'none' }} />
          <div>
            <h2 className="font-black text-base text-white">Voice Tutor</h2>
            <p className="text-xs" style={{ color: pc.color }}>{pc.label}</p>
          </div>
        </div>
        <button onClick={handleClose} aria-label="End session"
          className="w-9 h-9 rounded-xl flex items-center justify-center bg-white/10 hover:bg-white/20">
          <X size={16} className="text-white" />
        </button>
      </div>

      {/* Scrollable AI response area */}
      <div className="flex-1 min-h-0 overflow-y-auto px-5 py-4 space-y-3 custom-scrollbar">
        {history.length === 0 && (
          <div className="text-center py-12 opacity-40">
            <p className="text-white text-sm">Hey! Ready to study?</p>
            <p className="text-xs mt-1 text-white/60">What topic should we tackle first?</p>
          </div>
        )}
        {history.map((h, i) => (
          <div key={i} className={`flex ${h.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] px-4 py-3 rounded-2xl text-sm ${h.role === 'user' ? 'text-white' : 'text-white/90'}`}
              style={{
                background: h.role === 'user' ? 'var(--accent)' : 'rgba(255,255,255,0.08)',
                borderRadius: h.role === 'user' ? '20px 20px 4px 20px' : '20px 20px 20px 4px'
              }}>
              {h.text}
            </div>
          </div>
        ))}
        {phase === 'thinking' && (
          <div className="flex justify-start">
            <div className="px-4 py-3 rounded-2xl text-sm text-white/50" style={{ background: 'rgba(255,255,255,0.05)' }}>
              <span className="animate-pulse">Thinking</span>
            </div>
          </div>
        )}
      </div>

      {/* Waveform/visualizer */}
      <div className="flex items-center justify-center gap-1 h-12 shrink-0 px-5">
        {[...Array(16)].map((_, i) => (
          <div key={i} className="rounded-full transition-all" style={{
            width: 3, background: pc.color,
            height: phase === 'listening' ? `${8 + Math.sin(Date.now() / 200 + i) * 14}px` :
                   phase === 'speaking' ? `${6 + Math.sin(Date.now() / 300 + i) * 12}px` : '4px',
            animation: phase !== 'idle' ? `pulse .${3 + (i % 5)}s ease infinite alternate` : 'none',
            opacity: 0.5 + i * 0.02
          }} />
        ))}
      </div>

      {/* Transcript display */}
      {(transcript || interimTranscript) && (
        <div className="px-5 py-2 text-center shrink-0">
          {interimTranscript && <p className="text-xs text-white/40">{interimTranscript}</p>}
          {transcript && <p className="text-sm text-white/80 font-medium">{transcript}</p>}
        </div>
      )}

      {/* Text input fallback */}
      {showTextInput && (
        <div className="px-5 py-3 shrink-0 flex gap-2">
          <input type="text" value={textDraft} onChange={e => setTextDraft(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleTextSubmit()}
            placeholder="Type your message"
            className="flex-1 bg-white/10 rounded-xl px-4 py-3 text-sm text-white outline-none placeholder-white/30 border border-white/10 focus:border-white/30" />
          <button onClick={handleTextSubmit} className="btn-accent px-4 py-3 rounded-xl font-black text-sm">Send</button>
        </div>
      )}

      {/* Bottom toolbar  4 buttons */}
      <div className="shrink-0 flex items-center justify-around px-4 py-3" style={{ paddingBottom: 'calc(env(safe-area-inset-bottom, 0px) + 12px)', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
        <button onClick={interrupt} aria-label="Hold to override"
          className="flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
          <Hand size={20} className="text-white" />
          <span className="text-[10px] text-white/60 font-medium">Override</span>
        </button>
        <button onClick={() => setShowTextInput(v => !v)} aria-label="Type instead"
          className="flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
          <Keyboard size={20} className="text-white" />
          <span className="text-[10px] text-white/60 font-medium">Type</span>
        </button>
        <button aria-label="Voice settings"
          className="flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
          <SettingsIcon size={20} className="text-white" />
          <span className="text-[10px] text-white/60 font-medium">Settings</span>
        </button>
        <button onClick={handleClose} aria-label="End session"
          className="flex flex-col items-center gap-1 opacity-70 hover:opacity-100 transition-opacity">
          <X size={20} className="text-white" />
          <span className="text-[10px] text-white/60 font-medium">End</span>
        </button>
      </div>
    </div>
  );
}
