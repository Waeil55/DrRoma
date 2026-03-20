import React, { useState, useEffect, useRef } from 'react';
import { Mic, Zap, Loader2, Play, Square, Trash2, Volume2 } from 'lucide-react';
import { callAIStreaming } from '../../services/ai/callAIStreaming';

export default function EnhancedStudyPodcast({ flashcards, exams, settings, addToast }) {
  const [scripts, setScripts] = useState([]);
  const [generating, setGenerating] = useState(false);
  const [playing, setPlaying] = useState(null);
  const [speed, setSpeed] = useState(1.0);
  const [voices, setVoices] = useState([]);
  const [hostVoice, setHostVoice] = useState(null);
  const [guestVoice, setGuestVoice] = useState(null);
  const [selectedSet, setSelectedSet] = useState(null);
  const [progress, setProgress] = useState(0);
  const [currentChapter, setCurrentChapter] = useState(0);
  const [useMultiVoice, setUseMultiVoice] = useState(false);
  const uttRef = useRef(null);

  useEffect(() => {
    const load = () => {
      const v = window.speechSynthesis.getVoices();
      if (v.length > 0) {
        setVoices(v);
        const enVoices = v.filter(vx => vx.lang.startsWith('en'));
        if (enVoices.length > 0) setHostVoice(enVoices[0]);
        if (enVoices.length > 1) setGuestVoice(enVoices[Math.min(1, enVoices.length - 1)]);
      }
    };
    load();
    window.speechSynthesis.onvoiceschanged = load;
  }, []);

  const generateScript = async (set) => {
    if (!set) return;
    if (!settings.apiKey) { addToast('Set API key in Settings', 'warn'); return; }
    setGenerating(true);
    try {
      let script = '';
      await callAIStreaming(
        `Create an engaging educational podcast script (HOST and STUDENT dialogue format) covering the key concepts from these flashcards. Include chapter markers with [CHAPTER: Title] syntax. Make it conversational, educational, and memorable (600-900 words).\n\nFlashcards:\n${(set.cards || []).slice(0, 20).map(c => `Q: ${c.q || c.front}\nA: ${c.a || c.back}`).join('\n\n')}`,
        chunk => { script += chunk; },
        settings, 1200
      );

      const chapters = [];
      const lines = script.split('\n');
      lines.forEach((line, i) => {
        const m = line.match(/\[CHAPTER:\s*(.+?)\]/i);
        if (m) chapters.push({ title: m[1], lineIdx: i });
      });

      setScripts(p => [{
        id: Date.now().toString(), title: set.title, script, chapters,
        createdAt: Date.now(), setId: set.id, setTitle: set.title
      }, ...p]);
      addToast('Podcast generated ', 'success');
    } catch (e) { addToast('Failed: ' + e.message, 'error'); }
    setGenerating(false);
  };

  const speakSegments = async (script) => {
    window.speechSynthesis.cancel();
    const lines = script.script.split('\n').filter(l => l.trim());
    let chIdx = 0;
    for (let i = 0; i < lines.length; i++) {
      const line = lines[i];
      if (!line.trim() || line.startsWith('[CHAPTER:')) { if (line.startsWith('[CHAPTER:')) { chIdx++; setCurrentChapter(chIdx); } continue; }
      const isHost = line.startsWith('HOST:') || !line.startsWith('STUDENT:');
      const text = line.replace(/^(HOST|STUDENT):\s*/, '');
      await new Promise(res => {
        const utt = new SpeechSynthesisUtterance(text);
        utt.rate = speed;
        const v = (useMultiVoice && !isHost) ? guestVoice : hostVoice;
        if (v) utt.voice = v;
        utt.pitch = useMultiVoice ? (isHost ? 1.0 : 0.85) : 1.0;
        utt.onend = res; utt.onerror = res;
        uttRef.current = utt;
        window.speechSynthesis.speak(utt);
      });
      setProgress(Math.round(((i + 1) / lines.length) * 100));
    }
    setPlaying(null);
  };

  const play = (script) => {
    if (playing === script.id) { window.speechSynthesis.cancel(); setPlaying(null); return; }
    setPlaying(script.id); setProgress(0); setCurrentChapter(0);
    speakSegments(script).catch(() => setPlaying(null));
  };

  const stop = () => { window.speechSynthesis.cancel(); setPlaying(null); setProgress(0); };

  return (
    <div className="flex-1 min-h-0 flex flex-col p-4 gap-4">
      <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-2xl btn-accent flex items-center justify-center shrink-0"><Mic size={18} /></div>
          <div className="flex-1">
            <h2 className="font-black">AI Study Podcasts</h2>
            <p className="text-xs opacity-40">Dialogue-based audio summaries with chapter markers</p>
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
        <div className="flex flex-wrap gap-3 items-center">
          <div className="flex items-center gap-2 glass rounded-xl px-3 py-2">
            <span className="text-xs opacity-40">Speed</span>
            <input type="range" min={0.5} max={2} step={0.25} value={speed} onChange={e => setSpeed(+e.target.value)} className="w-16" />
            <span className="text-xs font-black w-8">{speed}×</span>
          </div>
          <label className="flex items-center gap-2 glass rounded-xl px-3 py-2 cursor-pointer">
            <input type="checkbox" checked={useMultiVoice} onChange={e => setUseMultiVoice(e.target.checked)} className="w-4 h-4" />
            <span className="text-xs font-black">Multi-Voice</span>
          </label>
          {useMultiVoice && voices.filter(v => v.lang.startsWith('en')).length > 1 && (
            <select value={guestVoice?.name || ''} onChange={e => setGuestVoice(voices.find(v => v.name === e.target.value))}
              className="glass-input rounded-xl px-3 py-2 text-xs outline-none">
              {voices.filter(v => v.lang.startsWith('en')).slice(0, 15).map(v => <option key={v.name} value={v.name}>{v.name}</option>)}
            </select>
          )}
        </div>
      </div>

      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar space-y-3">
        {scripts.map(script => (
          <div key={script.id} className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <h3 className="font-black text-sm">{script.title}</h3>
                <p className="text-xs opacity-40">{new Date(script.createdAt).toLocaleDateString()} · ~{Math.ceil(script.script.split(' ').length / 130)} min · {script.chapters?.length || 0} chapters</p>
              </div>
              <div className="flex gap-2 shrink-0">
                {playing === script.id ? (
                  <button onClick={stop} className="btn-accent px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5" style={{ background: 'var(--danger)' }}>
                    <Square size={12} /> Stop
                  </button>
                ) : (
                  <button onClick={() => play(script)} className="btn-accent px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1.5">
                    <Play size={12} /> Play
                  </button>
                )}
                <button onClick={() => setScripts(p => p.filter(s => s.id !== script.id))} className="w-8 h-8 glass rounded-xl flex items-center justify-center" style={{ color: 'var(--danger)' }}>
                  <Trash2 size={13} />
                </button>
              </div>
            </div>
            {playing === script.id && (
              <>
                <div className="progress-bar mb-2"><div className="progress-fill" style={{ width: `${progress}%`, transition: 'width .3s linear' }} /></div>
                {script.chapters?.length > 0 && (
                  <p className="text-xs opacity-50">Now: {script.chapters[Math.min(currentChapter, script.chapters.length - 1)]?.title}</p>
                )}
              </>
            )}
            {script.chapters?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {script.chapters.map((ch, i) => (
                  <span key={i} className="text-xs px-2.5 py-1 rounded-lg font-bold"
                    style={{ background: i === currentChapter && playing === script.id ? 'var(--accent)/20' : 'var(--surface)', color: 'var(--text)', border: '1px solid var(--border)', opacity: i === currentChapter && playing === script.id ? 1 : 0.6 }}>
                    {i + 1}. {ch.title}
                  </span>
                ))}
              </div>
            )}
            <p className="text-xs opacity-40 line-clamp-2 mt-2">{script.script.replace(/\[CHAPTER:[^\]]+\]/g, '').slice(0, 120)}…</p>
          </div>
        ))}
        {scripts.length === 0 && !generating && (
          <div className="empty-state py-12">
            <div className="empty-icon"><Volume2 size={36} /></div>
            <p className="font-black mt-4">No podcasts yet</p>
            <p className="text-xs opacity-40 mt-1">Select a deck and generate an episode</p>
          </div>
        )}
      </div>
    </div>
  );
}
