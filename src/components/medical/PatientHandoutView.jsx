import { useState } from 'react';
import { Loader2, Sparkles, Copy, Save } from 'lucide-react';
import callAIStreaming from '../../services/ai/callAIStreaming';

export default function PatientHandoutView({ settings, addToast }) {
  const [condition, setCondition] = useState('');
  const [language, setLanguage] = useState('English');
  const [readingLevel, setReadingLevel] = useState('6th grade');
  const [loading, setLoading] = useState(false);
  const [handout, setHandout] = useState('');
  const [saved, setSaved] = useState(() => { try { return JSON.parse(localStorage.getItem('mariam_handouts') || '[]'); } catch { return []; } });

  const generate = async () => {
    if (!condition.trim()) { addToast('Enter a condition', 'warn'); return; }
    if (!settings.apiKey) { addToast('Set an API key in Settings', 'warn'); return; }
    setLoading(true); setHandout('');
    try {
      await callAIStreaming(
        `Create a patient education handout in ${language} at a ${readingLevel} reading level for: "${condition}".

Include these sections with headers (use ## for headers):
## What is ${condition}?
## Causes
## Symptoms to Watch For
## Treatment Options
## When to Seek Emergency Care
## Lifestyle Tips
## Questions to Ask Your Doctor

Keep language simple, compassionate, and clear. Use bullet points. About 400-500 words.`,
        chunk => { setHandout(p => p + chunk); },
        settings, 800
      );
    } catch (e) { addToast('Generation failed', 'error'); }
    setLoading(false);
  };

  const saveHandout = () => {
    if (!handout) return;
    const entry = { condition, language, handout, ts: Date.now() };
    const updated = [entry, ...saved.slice(0, 19)];
    setSaved(updated);
    localStorage.setItem('mariam_handouts', JSON.stringify(updated));
    addToast('Handout saved ', 'success');
  };

  const copyHandout = () => {
    navigator.clipboard?.writeText(handout);
    addToast('Copied ', 'success');
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2"> Patient Handouts</h2>
        <p className="text-xs opacity-40 mt-0.5">AI-generated patient education materials</p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-4">
        <div className="glass rounded-2xl p-5 space-y-4" style={{ border: '1px solid var(--border)' }}>
          <div>
            <label className="text-xs font-black opacity-40 uppercase tracking-widest block mb-2">Condition / Topic</label>
            <input value={condition} onChange={e => setCondition(e.target.value)} placeholder="e.g. Type 2 Diabetes, Hypertension, Asthma"
              className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ background: 'var(--surface,var(--card))', border: '1px solid var(--border)' }} />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs font-black opacity-40 uppercase tracking-widest block mb-2">Language</label>
              <select value={language} onChange={e => setLanguage(e.target.value)}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{ background: 'var(--surface,var(--card))', border: '1px solid var(--border)' }}>
                {['English', 'Arabic', 'Spanish', 'French', 'German', 'Chinese', 'Hindi', 'Portuguese', 'Korean', 'Japanese', 'Turkish', 'Russian'].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs font-black opacity-40 uppercase tracking-widest block mb-2">Reading Level</label>
              <select value={readingLevel} onChange={e => setReadingLevel(e.target.value)}
                className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none"
                style={{ background: 'var(--surface,var(--card))', border: '1px solid var(--border)' }}>
                {['4th grade', '6th grade', '8th grade', 'High school', 'College'].map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {['Type 2 Diabetes', 'Hypertension', 'Asthma', 'GERD', 'Heart Failure', 'COPD', 'Migraine', 'Osteoarthritis'].map(c => (
              <button key={c} onClick={() => setCondition(c)}
                className="glass px-2.5 py-1 rounded-lg text-xs transition-all hover:opacity-80"
                style={{ border: '1px solid var(--border)', opacity: condition === c ? 1 : .5 }}>
                {c}
              </button>
            ))}
          </div>
          <button onClick={generate} disabled={loading || !condition.trim()}
            className="btn-accent w-full py-3 rounded-xl font-black flex items-center justify-center gap-2">
            {loading ? <><Loader2 size={16} className="animate-spin" /> Generating</> : <><Sparkles size={16} /> Generate Handout</>}
          </button>
        </div>

        {handout && (
          <div className="glass rounded-2xl p-5 animate-fade-in-up" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-black text-sm"> {condition}</h3>
              <div className="flex gap-2">
                <button onClick={copyHandout} className="glass px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1"
                  style={{ border: '1px solid var(--border)' }}><Copy size={11} /> Copy</button>
                <button onClick={saveHandout} className="glass px-3 py-1.5 rounded-xl text-xs font-black flex items-center gap-1"
                  style={{ color: 'var(--accent)', border: '1px solid var(--accent)/30' }}><Save size={11} /> Save</button>
              </div>
            </div>
            <div className="prose prose-sm max-w-none text-sm opacity-80 leading-relaxed whitespace-pre-wrap">{handout}</div>
          </div>
        )}

        {saved.length > 0 && !handout && (
          <div className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
            <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-3">Saved Handouts</h3>
            {saved.slice(0, 5).map((h, i) => (
              <button key={i} onClick={() => { setCondition(h.condition); setHandout(h.handout); }}
                className="w-full flex items-center justify-between py-2 text-left hover:opacity-80 transition-all">
                <div>
                  <span className="text-sm font-bold">{h.condition}</span>
                  <span className="text-xs opacity-30 ml-2">({h.language})</span>
                </div>
                <span className="text-xs opacity-30">{new Date(h.ts).toLocaleDateString()}</span>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
