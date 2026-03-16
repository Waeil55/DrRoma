/**
 * MARIAM PRO — StudyPodcastPanel Component
 * AI-generated audio summaries with multi-voice dialogue, chapter markers,
 * speed controls, and Media Session API integration.
 */
import React, { useState, useRef, useEffect, useCallback } from 'react';
import {
  Mic, Zap, Loader2, Play, Square, Trash2, Volume2,
  SkipBack, SkipForward, List
} from 'lucide-react';

const SPEEDS = [0.5, 0.75, 1, 1.25, 1.5, 2];

export default function StudyPodcastPanel({ flashcards, settings, addToast, callAIStreaming }) {
  const [scripts, setScripts] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [playing, setPlaying] = useState(null);
  const [speed, setSpeed] = useState(1.0);
  const [voice, setVoice] = useState(null);
  const [voice2, setVoice2] = useState(null); // Student voice for dialogue
  const [voices, setVoices] = useState([]);
  const [dialogueMode, setDialogueMode] = useState(false);
  const uttRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [selectedSet, setSelectedSet] = useState(null);
  const [showChapters, setShowChapters] = useState(null); // scriptId
  const speakingRef = useRef(false);
  const chapterIndexRef = useRef(0);

  useEffect(() => {
    const load = () => {
      const vs = window.speechSynthesis?.getVoices() || [];
      setVoices(vs);
      const enVoices = vs.filter(v => v.lang.startsWith('en'));
      setVoice(enVoices.find(v => /neural|premium|enhanced/i.test(v.name)) || enVoices[0] || vs[0] || null);
      // Pick a different voice for Student
      const second = enVoices.find(v => v !== (enVoices[0] || vs[0]) && v.lang.startsWith('en'));
      setVoice2(second || enVoices[1] || null);
    };
    load();
    window.speechSynthesis?.addEventListener('voiceschanged', load);
    return () => window.speechSynthesis?.removeEventListener('voiceschanged', load);
  }, []);

  // Parse chapters from script (split by ## or numbered sections)
  const getChapters = useCallback((script) => {
    const lines = script.split('\n');
    const chapters = [];
    let current = { title: 'Introduction', text: '' };
    for (const line of lines) {
      const heading = line.match(/^##?\s+(.+)/);
      if (heading) {
        if (current.text.trim()) chapters.push(current);
        current = { title: heading[1], text: '' };
      } else {
        current.text += line + '\n';
      }
    }
    if (current.text.trim()) chapters.push(current);
    return chapters.length > 1 ? chapters : [{ title: 'Full Episode', text: script }];
  }, []);

  const generateScript = async (set) => {
    if (!set) return;
    setGenerating(true);
    try {
      const topCards = (set.cards || []).slice(0, 15);
      const content = topCards.map((c, i) => `${i + 1}. ${c.q} — ${c.a}`).join('\n');
      const prompt = dialogueMode
        ? `You are writing a medical study podcast dialogue between a HOST (Dr. Mariam) and a STUDENT. Create a 3-4 minute conversational script summarizing these flashcards. Format: use "## Topic Name" for chapter headings. Use "HOST:" and "STUDENT:" prefixes for each speaker. Make it engaging and educational.\n\nFlashcard set: "${set.title}"\nCards:\n${content}\n\nWrite ONLY the dialogue script.`
        : `You are a medical study podcast host. Create an engaging 2-3 minute spoken audio script summarizing these flashcards. Use "## Topic Name" for chapter headings. Make it conversational, memorable, and educational. Use "you" to address the listener.\n\nFlashcard set: "${set.title}"\nCards:\n${content}\n\nWrite ONLY the spoken script.`;
      let script = '';
      await callAIStreaming(prompt, chunk => { script += chunk; }, settings, 1200);
      const chapters = getChapters(script.trim());
      const newScript = { id: Date.now(), setId: set.id, title: set.title, script: script.trim(), chapters, dialogue: dialogueMode, createdAt: Date.now() };
      setScripts(p => [newScript, ...p]);
      addToast('Podcast script ready!', 'success');
    } catch (e) { addToast('Generation failed: ' + e.message, 'error'); }
    setGenerating(false);
  };

  // Multi-voice speak function
  const speakDialogue = async (script) => {
    if (!window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    speakingRef.current = true;
    setPlaying(script.id);

    const lines = script.script.split('\n').filter(l => l.trim());
    let charsDone = 0;
    const totalChars = script.script.length;

    for (const line of lines) {
      if (!speakingRef.current) break;
      const isHost = line.startsWith('HOST:');
      const isStudent = line.startsWith('STUDENT:');
      const text = isHost ? line.replace('HOST:', '').trim() : isStudent ? line.replace('STUDENT:', '').trim() : line.trim();
      if (!text) continue;

      const utt = new SpeechSynthesisUtterance(text);
      if (isStudent && voice2) { utt.voice = voice2; utt.pitch = 1.15; utt.rate = speed * 0.95; }
      else if (voice) { utt.voice = voice; utt.pitch = 1.0; utt.rate = speed; }
      else { utt.rate = speed; }

      await new Promise(resolve => {
        utt.onend = resolve;
        utt.onerror = resolve;
        utt.onboundary = e => setProgress(((charsDone + e.charIndex) / totalChars) * 100);
        window.speechSynthesis.speak(utt);
      });
      charsDone += text.length;
    }
    speakingRef.current = false;
    setPlaying(null);
    setProgress(0);
  };

  const speak = (script) => {
    if (!window.speechSynthesis) { addToast('Speech not supported in this browser', 'error'); return; }
    // Register Media Session
    if ('mediaSession' in navigator) {
      navigator.mediaSession.metadata = new MediaMetadata({
        title: script.title + ' — Study Podcast',
        artist: 'MARIAM PRO',
        album: 'Study Podcasts',
      });
      navigator.mediaSession.setActionHandler('play', () => speak(script));
      navigator.mediaSession.setActionHandler('pause', () => stop());
    }
    if (script.dialogue) { speakDialogue(script); return; }
    window.speechSynthesis.cancel();
    const utt = new SpeechSynthesisUtterance(script.script);
    if (voice) utt.voice = voice;
    utt.rate = speed;
    utt.pitch = 1.0;
    utt.onstart = () => setPlaying(script.id);
    utt.onend = () => { setPlaying(null); setProgress(0); };
    utt.onerror = () => { setPlaying(null); setProgress(0); };
    utt.onboundary = e => {
      if (script.script.length > 0) setProgress((e.charIndex / script.script.length) * 100);
    };
    window.speechSynthesis.speak(utt);
    uttRef.current = utt;
  };

  const stop = () => { speakingRef.current = false; window.speechSynthesis?.cancel(); setPlaying(null); setProgress(0); };

  return (
    <div className="flex-1 min-h-0 flex flex-col p-4 gap-4">
      {/* Generator */}
      <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl btn-accent flex items-center justify-center shrink-0">
            <Mic size={18} />
          </div>
          <div>
            <h2 className="font-black">AI Study Podcasts</h2>
            <p className="text-xs opacity-40">Generate audio summaries from your flashcard decks</p>
          </div>
        </div>
        <div className="flex gap-2 mb-3">
          <select value={selectedSet?.id || ''} onChange={e => setSelectedSet(flashcards.find(s => s.id === e.target.value) || null)}
            className="glass-input flex-1 rounded-xl px-3 py-2 text-sm outline-none">
            <option value="">Choose a deck…</option>
            {flashcards.map(s => <option key={s.id} value={s.id}>{s.title}</option>)}
          </select>
          <button onClick={() => generateScript(selectedSet)} disabled={!selectedSet || generating}
            className="btn-accent px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2 shrink-0">
            {generating ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
            {generating ? 'Writing…' : 'Generate'}
          </button>
        </div>
        {/* Dialogue mode toggle */}
        <div className="flex items-center gap-3 mb-3">
          <button onClick={() => setDialogueMode(!dialogueMode)}
            className={`px-3 py-1.5 rounded-lg text-xs font-black border transition-all ${dialogueMode ? 'bg-[var(--accent)] text-white border-transparent' : 'glass border-[color:var(--border2,var(--border))] opacity-60'}`}>
            {dialogueMode ? '🎭 Dialogue Mode' : '🎙️ Solo Mode'}
          </button>
          {dialogueMode && <span className="text-xs opacity-40">Host + Student conversation</span>}
        </div>
        <div className="flex gap-2 flex-wrap">
          <select value={voice?.name || ''} onChange={e => setVoice(voices.find(v => v.name === e.target.value))}
            className="glass-input flex-1 rounded-xl px-3 py-2 text-xs outline-none min-w-[120px]"
            aria-label="Host voice">
            {voices.filter(v => v.lang.startsWith('en')).slice(0, 20).map(v => (
              <option key={v.name} value={v.name}>{v.name}</option>
            ))}
          </select>
          {/* Speed buttons */}
          <div className="flex items-center glass rounded-xl overflow-hidden">
            {SPEEDS.map(s => (
              <button key={s} onClick={() => setSpeed(s)}
                className={`px-2.5 py-2 text-xs font-black transition-all ${speed === s ? 'bg-[var(--accent)] text-white' : 'opacity-50 hover:opacity-80'}`}>
                {s}×
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Scripts list */}
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-3">
        {scripts.map(script => (
          <div key={script.id} className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-start justify-between gap-3 mb-3">
              <div>
                <h3 className="font-black text-sm">{script.title}</h3>
                <p className="text-xs opacity-40">{new Date(script.createdAt).toLocaleDateString()} · ~{Math.ceil(script.script.split(' ').length / 130)} min</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {playing === script.id ? (
                  <button onClick={stop} className="btn-accent px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5" style={{ background: 'var(--danger)' }}>
                    <Square size={12} /> Stop
                  </button>
                ) : (
                  <button onClick={() => speak(script)} className="btn-accent px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5">
                    <Play size={12} /> Play
                  </button>
                )}
                <button onClick={() => setScripts(p => p.filter(s => s.id !== script.id))}
                  className="w-8 h-8 glass rounded-xl flex items-center justify-center hover:bg-[var(--danger-bg)]"
                  style={{ color: 'var(--danger)' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            {playing === script.id && (
              <div className="progress-bar mb-2"><div className="progress-fill" style={{ width: `${progress}%`, transition: 'width .3s linear' }} /></div>
            )}
            {/* Chapter markers */}
            {script.chapters && script.chapters.length > 1 && (
              <div className="mb-2">
                <button onClick={() => setShowChapters(showChapters === script.id ? null : script.id)}
                  className="flex items-center gap-1 text-xs opacity-50 hover:opacity-80 font-black transition-opacity" aria-label="Show chapters">
                  <List size={12} /> {script.chapters.length} chapters
                </button>
                {showChapters === script.id && (
                  <div className="mt-2 space-y-1">
                    {script.chapters.map((ch, ci) => (
                      <button key={ci} className="block w-full text-left text-xs px-2 py-1.5 rounded-lg hover:bg-[var(--accent)]/10 transition-colors opacity-70 hover:opacity-100">
                        <span className="font-black" style={{ color: 'var(--accent)' }}>{ci + 1}.</span> {ch.title}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
            <p className="text-xs opacity-50 line-clamp-3 leading-relaxed">{script.script}</p>
          </div>
        ))}
        {scripts.length === 0 && !generating && (
          <div className="empty-state py-12">
            <div className="empty-icon"><Volume2 size={36} /></div>
            <p className="font-black mt-4">No podcasts yet</p>
            <p className="text-xs opacity-40 mt-1">Select a deck and click Generate</p>
          </div>
        )}
      </div>
    </div>
  );
}
