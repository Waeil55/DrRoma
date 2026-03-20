import React, { useState, useRef } from 'react';
import { Loader2, Sparkles, ChevronLeft, Send, AlertCircle } from 'lucide-react';
import callAIStreaming from '../../services/ai/callAIStreaming';

const STARTER_CASES = [
  { id: 'chest_pain', title: 'Chest Pain in ER', specialty: 'Cardiology', difficulty: 'Hard',
    presentation: '58M with crushing chest pain radiating to left arm, diaphoresis, 3/10→9/10 pain over 2 hours. PMH: HTN, DM2, smoker.',
    vitals: { BP: '165/95', HR: '102', RR: '22', Temp: '37.1', SpO2: '96%', Weight: '88 kg' },
    correctDx: 'STEMI', keyFindings: ['ST elevation V1-V4', 'Troponin elevated', 'Hyperlipidemia history'],
    aiContext: 'Patient is a 58-year-old male with STEMI. He is anxious and sweating. Respond as this patient to medical student questions. ECG shows ST elevation V1–V4.' },
  { id: 'sob', title: 'Shortness of Breath', specialty: 'Pulmonology', difficulty: 'Medium',
    presentation: '34F with sudden onset SOB, pleuritic chest pain, 4 days after long-haul flight. No fever.',
    vitals: { BP: '118/78', HR: '118', RR: '28', Temp: '37.4', SpO2: '92%', Weight: '62 kg' },
    correctDx: 'Pulmonary Embolism', keyFindings: ['Tachycardia', 'Low SpO2', 'Recent travel', 'D-dimer elevated'],
    aiContext: 'Patient is a 34-year-old female with suspected PE after long flight. She is anxious, short of breath. Respond as this patient.' },
  { id: 'abd_pain', title: 'Acute Abdominal Pain', specialty: 'Surgery', difficulty: 'Medium',
    presentation: '22M with migrating abdominal pain starting periumbilical, now RLQ. Nausea, anorexia, low-grade fever 12h.',
    vitals: { BP: '125/80', HR: '96', RR: '18', Temp: '38.2', SpO2: '99%', Weight: '74 kg' },
    correctDx: 'Acute Appendicitis', keyFindings: ['McBurney positive', 'Rovsing sign', 'Elevated WBC', 'RLQ tenderness'],
    aiContext: 'Patient is a 22-year-old male with acute appendicitis. He is in pain and somewhat anxious. Respond as this patient.' },
  { id: 'confusion', title: 'Acute Confusion', specialty: 'Neurology', difficulty: 'Hard',
    presentation: '72M brought by family for acute confusion, 6h onset. Known DM, HTN. Last seen normal at dinner.',
    vitals: { BP: '88/60', HR: '44', RR: '16', Temp: '36.8', SpO2: '97%', Weight: '80 kg' },
    correctDx: 'Complete Heart Block', keyFindings: ['Bradycardia', 'Hypotension', 'ECG: PR interval >0.2s', 'Syncope'],
    aiContext: 'Patient is a confused 72-year-old with complete heart block. He is confused and answers slowly. His family is present.' },
  { id: 'fever_rash', title: 'Fever with Rash', specialty: 'Infectious Disease', difficulty: 'Hard',
    presentation: '24F with fever 39.8°C, severe headache, neck stiffness, non-blanching petechial rash on trunk. Ill for 12h.',
    vitals: { BP: '95/60', HR: '124', RR: '24', Temp: '39.8', SpO2: '97%', Weight: '58 kg' },
    correctDx: 'Meningococcal Meningitis', keyFindings: ['Kernig sign', 'Non-blanching rash', 'CSF: turbid + bacteria', 'Leukocytosis'],
    aiContext: 'Patient is a severely ill 24-year-old with meningococcal meningitis. She has neck stiffness and is confused but can answer briefly.' },
];

export default function ClinicalSimulatorView({ settings, addToast, cases }) {
  const [phase, setPhase] = useState('select'); // select | briefing | hx | exam | orders | diagnosis | feedback
  const [selectedCase, setSelectedCase] = useState(null);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [hxData, setHxData] = useState([]);
  const [examData, setExamData] = useState([]);
  const [ordersData, setOrdersData] = useState([]);
  const [userDx, setUserDx] = useState('');
  const [score, setScore] = useState(null);
  const [vitals, setVitals] = useState(null);
  const scrollRef = useRef(null);

  const allCases = [...STARTER_CASES, ...cases.filter(c => c.simulatorReady).slice(0, 5)];

  const startCase = (c) => {
    setSelectedCase(c);
    setMessages([{ role: 'system-intro', text: `Case loaded. The patient is ready. Begin your history taking.` }]);
    setVitals(c.vitals);
    setPhase('hx');
    setHxData([]); setExamData([]); setOrdersData([]); setUserDx(''); setScore(null);
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;
    if (!settings.apiKey) { addToast('Set an API key in Settings', 'warn'); return; }
    const userMsg = { role: 'user', text: input.trim() };
    setMessages(p => [...p, userMsg, { role: 'loading', text: '' }]);
    setInput('');
    setLoading(true);
    try {
      let reply = '';
      await callAIStreaming(
        `${selectedCase.aiContext}\n\nConversation so far:\n${messages.filter(m => m.role !== 'system-intro' && m.role !== 'loading').map(m => `${m.role === 'user' ? 'Student' : 'Patient'}: ${m.text}`).join('\n')}\n\nStudent: ${userMsg.text}\n\nRespond briefly as the patient (2-3 sentences max). Stay in character.`,
        chunk => { reply += chunk; },
        settings, 200
      );
      setMessages(p => [...p.filter(m => m.role !== 'loading'), { role: 'patient', text: reply }]);
      setHxData(h => [...h, { q: userMsg.text, a: reply }]);
    } catch (e) { setMessages(p => [...p.filter(m => m.role !== 'loading'), { role: 'error', text: 'Connection failed.' }]); }
    setLoading(false);
    setTimeout(() => scrollRef.current?.scrollTo({ top: 99999, behavior: 'smooth' }), 100);
  };

  const submitDiagnosis = async () => {
    if (!userDx.trim()) return;
    if (!settings.apiKey) { addToast('Set an API key in Settings', 'warn'); return; }
    setLoading(true);
    try {
      let feedback = '';
      await callAIStreaming(
        `Medical education feedback. Student diagnosis: "${userDx}". Correct diagnosis: "${selectedCase.correctDx}". Key findings: ${selectedCase.keyFindings.join(', ')}.
        
Give feedback as JSON: { "score": 0-100, "correct": true/false, "nearMiss": true/false, "feedback": "2-sentence evaluation", "keyPoints": ["3-5 teaching points"], "differentials": ["top 3 differentials"] }`,
        chunk => { feedback += chunk; },
        settings, 500
      );
      const m = feedback.match(/\{[\s\S]+\}/);
      if (m) {
        const parsed = JSON.parse(m[0]);
        setScore(parsed);
        setPhase('feedback');
      }
    } catch (e) { addToast('Feedback failed', 'error'); }
    setLoading(false);
  };

  if (phase === 'select') return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2"> Clinical Simulator</h2>
        <p className="text-xs opacity-40 mt-0.5">Interactive patient encounters with AI</p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4">
        <div className="space-y-3">
          {allCases.map(c => (
            <button key={c.id} onClick={() => startCase(c)}
              className="w-full glass rounded-2xl p-5 text-left transition-all card-hover"
              style={{ border: '1px solid var(--border)' }}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-black">{c.title}</h3>
                <span className="px-2.5 py-1 rounded-lg text-xs font-black shrink-0"
                  style={{ background: c.difficulty === 'Hard' ? 'var(--danger)/15' : c.difficulty === 'Medium' ? 'var(--warning)/15' : 'var(--success)/15', color: c.difficulty === 'Hard' ? 'var(--danger)' : c.difficulty === 'Medium' ? 'var(--warning)' : 'var(--success)' }}>
                  {c.difficulty}
                </span>
              </div>
              <p className="text-xs opacity-50 mb-2">{c.specialty}</p>
              <p className="text-xs opacity-60 leading-relaxed line-clamp-2">{c.presentation}</p>
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  if (phase === 'feedback') return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setPhase('select')} className="glass w-9 h-9 rounded-xl flex items-center justify-center"><ChevronLeft size={16} /></button>
        <h2 className="font-black text-lg">{selectedCase.title} — Feedback</h2>
      </div>
      <div className="glass rounded-3xl p-6 text-center" style={{ border: `2px solid ${score?.score >= 80 ? '#10b981' : score?.score >= 50 ? '#f59e0b' : '#ef4444'}40` }}>
        <div className="text-5xl font-black mb-2" style={{ color: score?.score >= 80 ? '#10b981' : score?.score >= 50 ? '#f59e0b' : '#ef4444' }}>{score?.score}%</div>
        <div className="text-lg font-black mb-4">{score?.correct ? ' Correct Diagnosis!' : score?.nearMiss ? ' Close — Near Miss' : ' Incorrect'}</div>
        <div className="text-sm font-black mb-1">Correct: <span style={{ color: '#10b981' }}>{selectedCase.correctDx}</span></div>
        <div className="text-sm mb-4 opacity-60">Your answer: {userDx}</div>
        <p className="text-sm opacity-70 leading-relaxed">{score?.feedback}</p>
      </div>
      {score?.keyPoints?.length > 0 && (
        <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
          <h3 className="font-black text-sm mb-3">Key Teaching Points</h3>
          {score.keyPoints.map((p, i) => <div key={i} className="flex gap-3 text-sm py-1.5"><span style={{ color: 'var(--accent)' }}>•</span><span className="opacity-70">{p}</span></div>)}
        </div>
      )}
      {score?.differentials?.length > 0 && (
        <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
          <h3 className="font-black text-sm mb-3">Differential Diagnoses</h3>
          {score.differentials.map((d, i) => <div key={i} className="flex gap-3 text-sm py-1 opacity-60"><span className="font-black text-xs w-4">{i + 1}.</span>{d}</div>)}
        </div>
      )}
      <button onClick={() => setPhase('select')} className="btn-accent w-full py-3 rounded-2xl font-black">Try Another Case</button>
    </div>
  );

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      {/* Case header */}
      <div className="px-4 py-3 shrink-0 flex items-center gap-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <button onClick={() => setPhase('select')} className="glass w-9 h-9 rounded-xl flex items-center justify-center shrink-0"><ChevronLeft size={16} /></button>
        <div className="flex-1 min-w-0">
          <h3 className="font-black truncate">{selectedCase.title}</h3>
          <p className="text-xs opacity-40 truncate">{selectedCase.presentation.slice(0, 60)}…</p>
        </div>
      </div>

      {/* Vitals banner */}
      {vitals && (
        <div className="px-4 py-2 shrink-0 flex gap-3 overflow-x-auto" style={{ background: 'var(--accent)/05', borderBottom: '1px solid var(--border)' }}>
          {Object.entries(vitals).map(([k, v]) => (
            <div key={k} className="flex flex-col items-center shrink-0 px-2">
              <span className="text-xs font-black" style={{ color: (k === 'SpO2' && parseInt(v) < 95) || (k === 'HR' && parseInt(v) > 110) || (k === 'Temp' && parseFloat(v) > 38.3) ? '#f59e0b' : 'var(--accent)' }}>{v}</span>
              <span className="text-xs opacity-30">{k}</span>
            </div>
          ))}
        </div>
      )}

      {/* Phase tabs */}
      <div className="flex shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        {[['hx', ' History'], ['exam', ' Exam'], ['orders', ' Orders'], ['dx', ' Diagnosis']].map(([id, lbl]) => (
          <button key={id} onClick={() => setPhase(id)}
            className="flex-1 py-2 text-xs font-black transition-all"
            style={phase === id ? { borderBottom: '2px solid var(--accent)', color: 'var(--accent)' } : { opacity: 0.45 }}>
            {lbl}
          </button>
        ))}
      </div>

      {phase === 'dx' ? (
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
            <h3 className="font-black mb-3">Your Diagnosis</h3>
            <p className="text-xs opacity-50 mb-3">Based on your history, exam findings, and orders, what is the most likely diagnosis?</p>
            <input value={userDx} onChange={e => setUserDx(e.target.value)}
              placeholder="e.g. Acute Appendicitis, STEMI, Pulmonary Embolism…"
              className="w-full glass-input rounded-xl px-4 py-3 text-sm outline-none mb-4"
              style={{ border: '1px solid var(--border)' }} />
            <div className="glass rounded-xl p-3 mb-4" style={{ border: '1px solid var(--border)' }}>
              <p className="text-xs font-black opacity-40 mb-2">History gathered: {hxData.length} exchanges</p>
              <p className="text-xs opacity-40">Physical exam: {examData.length} findings</p>
              <p className="text-xs opacity-40">Orders placed: {ordersData.length}</p>
            </div>
            <button onClick={submitDiagnosis} disabled={!userDx.trim() || loading}
              className="btn-accent w-full py-3 rounded-xl font-black flex items-center justify-center gap-2">
              {loading ? <Loader2 size={16} className="animate-spin" /> : ''} Submit Diagnosis
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 min-h-0 flex flex-col">
          <div ref={scrollRef} className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-3">
            {messages.map((msg, i) => (
              <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                {msg.role !== 'user' && <div className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 text-sm" style={{ background: msg.role === 'system-intro' ? 'var(--border)' : 'var(--accent)/15' }}>{msg.role === 'patient' ? '' : msg.role === 'loading' ? '' : ''}</div>}
                <div className="glass rounded-2xl px-4 py-3 text-sm max-w-[80%]" style={{ border: '1px solid var(--border)', background: msg.role === 'user' ? 'var(--accent)/10' : 'transparent' }}>
                  {msg.role === 'loading' ? <Loader2 size={14} className="animate-spin" /> : <p className="leading-relaxed">{msg.text}</p>}
                </div>
              </div>
            ))}
          </div>
          <div className="px-4 pb-4 pt-2 shrink-0">
            <div className="flex gap-2">
              <input value={input} onChange={e => setInput(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !e.shiftKey && sendMessage()}
                placeholder={phase === 'hx' ? 'Ask the patient about symptoms, history…' : phase === 'exam' ? 'Describe your exam approach…' : 'Place an order (CBC, ECG, CT…)'}
                className="flex-1 glass-input rounded-2xl px-4 py-3 text-sm outline-none"
                style={{ border: '1px solid var(--border)' }} />
              <button onClick={sendMessage} disabled={loading || !input.trim()} className="btn-accent w-12 h-12 rounded-2xl flex items-center justify-center shrink-0">
                {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
              </button>
            </div>
            {phase === 'hx' && <div className="flex gap-2 mt-2 overflow-x-auto">
              {['Chief complaint?', 'Pain characteristics?', 'Associated symptoms?', 'Medical history?', 'Medications?', 'Family history?'].map(q => (
                <button key={q} onClick={() => setInput(q)}
                  className="glass px-3 py-1.5 rounded-xl text-xs font-bold shrink-0" style={{ border: '1px solid var(--border)' }}>{q}</button>
              ))}
            </div>}
          </div>
        </div>
      )}
    </div>
  );
}
