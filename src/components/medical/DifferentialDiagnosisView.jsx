import React, { useState } from 'react';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import callAIStreaming from '../../services/ai/callAIStreaming';

const PROB_COLORS = { high: '#ef4444', medium: '#f59e0b', low: '#10b981' };

const QUICK_SYMPTOMS = [
  'Chest pain', 'SOB', 'Fever', 'Headache', 'Abdominal pain',
  'Nausea', 'Dizziness', 'Cough', 'Fatigue', 'Palpitations',
];

export default function DifferentialDiagnosisView({ settings, addToast }) {
  const [symptoms, setSymptoms] = useState([]);
  const [currentSymptom, setCurrentSymptom] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('Male');
  const [loading, setLoading] = useState(false);
  const [ddx, setDdx] = useState(null);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mariam_ddx_history')) || []; }
    catch { return []; }
  });

  const addSymptom = () => {
    const s = currentSymptom.trim();
    if (s && !symptoms.includes(s)) {
      setSymptoms(prev => [...prev, s]);
    }
    setCurrentSymptom('');
  };

  const removeSymptom = (s) => setSymptoms(prev => prev.filter(x => x !== s));

  const generateDDx = async () => {
    if (symptoms.length === 0) { addToast?.('Add at least one symptom'); return; }
    const apiKey = settings?.apiKey;
    if (!apiKey) { addToast?.('Set your API key in Settings'); return; }

    setLoading(true);
    setDdx(null);

    const prompt = `You are a medical differential diagnosis AI assistant. Given the following patient presentation, generate a comprehensive differential diagnosis.

Patient: ${age ? age + ' year old' : 'Adult'} ${sex}
Symptoms: ${symptoms.join(', ')}

Respond in strict JSON format:
{
  "differentials": [
    {
      "diagnosis": "Name",
      "probability": "high|medium|low",
      "reasoning": "Why this diagnosis fits",
      "workup": ["Test 1", "Test 2"],
      "redFlags": ["Flag 1"]
    }
  ],
  "emergencyConsiderations": "Any emergent conditions to rule out",
  "suggestedWorkup": ["Ordered investigation 1", "Ordered investigation 2"]
}

Provide 6-10 differentials ranked by probability. Be thorough and clinically accurate.`;

    try {
      let full = '';
      await callAIStreaming({
        apiKey,
        model: settings?.model || 'gpt-4o-mini',
        systemPrompt: 'You are a clinical reasoning AI. Always respond in valid JSON only.',
        userMessage: prompt,
        onChunk: (chunk) => { full += chunk; },
      });

      const jsonMatch = full.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        const parsed = JSON.parse(jsonMatch[0]);
        setDdx(parsed);
        const entry = { symptoms: [...symptoms], age, sex, ddx: parsed, date: new Date().toISOString() };
        const newHistory = [entry, ...history].slice(0, 10);
        setHistory(newHistory);
        localStorage.setItem('mariam_ddx_history', JSON.stringify(newHistory));
      } else {
        addToast?.('Failed to parse AI response');
      }
    } catch (err) {
      addToast?.('AI error: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}> Differential Diagnosis</h2>
        <p style={{ color: '#888', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
          AI-powered clinical reasoning tool
        </p>
      </div>

      {/* Input section */}
      <div style={{
        background: 'rgba(255,255,255,0.04)', borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem', marginBottom: '1.5rem',
      }}>
        {/* Age / Sex row */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
          <input
            type="number"
            placeholder="Age (optional)"
            value={age}
            onChange={e => setAge(e.target.value)}
            style={{
              padding: '0.65rem 0.85rem', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
              color: 'inherit', fontSize: '0.9rem', outline: 'none',
            }}
          />
          <select
            value={sex}
            onChange={e => setSex(e.target.value)}
            style={{
              padding: '0.65rem 0.85rem', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
              color: 'inherit', fontSize: '0.9rem', outline: 'none',
            }}
          >
            <option value="Male">Male</option>
            <option value="Female">Female</option>
          </select>
        </div>

        {/* Symptom input */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <input
            type="text"
            placeholder="Add a symptom..."
            value={currentSymptom}
            onChange={e => setCurrentSymptom(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSymptom(); } }}
            style={{
              flex: 1, padding: '0.65rem 0.85rem', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
              color: 'inherit', fontSize: '0.9rem', outline: 'none',
            }}
          />
          <button
            onClick={addSymptom}
            style={{
              padding: '0.65rem 1rem', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'var(--accent, #6366f1)', color: '#fff', fontWeight: 600, fontSize: '0.9rem',
            }}
          >
            Add
          </button>
        </div>

        {/* Symptom chips */}
        {symptoms.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
            {symptoms.map(s => (
              <span key={s} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.3rem 0.7rem', borderRadius: 20, fontSize: '0.82rem', fontWeight: 600,
                background: 'rgba(99,102,241,0.15)', color: 'var(--accent, #6366f1)',
              }}>
                {s}
                <span onClick={() => removeSymptom(s)} style={{ cursor: 'pointer', opacity: 0.7, lineHeight: 1 }}>×</span>
              </span>
            ))}
          </div>
        )}

        {/* Quick add */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
          {QUICK_SYMPTOMS.map(s => (
            <button
              key={s}
              onClick={() => { if (!symptoms.includes(s)) setSymptoms(prev => [...prev, s]); }}
              style={{
                padding: '0.25rem 0.6rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)',
                background: symptoms.includes(s) ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                color: symptoms.includes(s) ? 'var(--accent, #6366f1)' : '#888',
                cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500, transition: 'all 0.2s',
              }}
            >
              {s}
            </button>
          ))}
        </div>

        {/* Generate */}
        <button
          onClick={generateDDx}
          disabled={loading || symptoms.length === 0}
          style={{
            width: '100%', padding: '0.75rem', borderRadius: 12, border: 'none', cursor: loading ? 'wait' : 'pointer',
            background: loading ? 'rgba(99,102,241,0.3)' : 'var(--accent, #6366f1)',
            color: '#fff', fontWeight: 700, fontSize: '0.95rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            opacity: symptoms.length === 0 ? 0.5 : 1,
          }}
        >
          {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={18} />}
          {loading ? 'Generating DDx...' : 'Generate Differential Diagnosis'}
        </button>
      </div>

      {/* Results */}
      {ddx && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Emergency considerations */}
          {ddx.emergencyConsiderations && (
            <div style={{
              padding: '1rem', borderRadius: 14,
              border: '2px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <AlertCircle size={18} style={{ color: '#ef4444' }} />
                <span style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.95rem' }}>Emergency Considerations</span>
              </div>
              <p style={{ margin: 0, color: '#ddd', fontSize: '0.9rem', lineHeight: 1.6 }}>
                {ddx.emergencyConsiderations}
              </p>
            </div>
          )}

          {/* Differentials */}
          {ddx.differentials?.map((d, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.04)', borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.08)', padding: '1rem',
                borderLeft: `4px solid ${PROB_COLORS[d.probability] || '#888'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                <span style={{
                  width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(255,255,255,0.08)', fontSize: '0.82rem', fontWeight: 700,
                }}>
                  {i + 1}
                </span>
                <span style={{ fontWeight: 700, flex: 1, fontSize: '1rem' }}>{d.diagnosis}</span>
                <span style={{
                  padding: '0.2rem 0.6rem', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700,
                  background: `${PROB_COLORS[d.probability]}20`,
                  color: PROB_COLORS[d.probability] || '#888',
                  textTransform: 'capitalize',
                }}>
                  {d.probability}
                </span>
              </div>
              <p style={{ margin: '0 0 0.6rem', color: '#bbb', fontSize: '0.88rem', lineHeight: 1.5 }}>
                {d.reasoning}
              </p>
              {/* Workup chips */}
              {d.workup?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.5rem' }}>
                  {d.workup.map((w, j) => (
                    <span key={j} style={{
                      padding: '0.2rem 0.55rem', borderRadius: 10, fontSize: '0.75rem', fontWeight: 500,
                      background: 'rgba(99,102,241,0.1)', color: 'var(--accent, #6366f1)',
                    }}>
                      {w}
                    </span>
                  ))}
                </div>
              )}
              {/* Red flag chips */}
              {d.redFlags?.length > 0 && (
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                  {d.redFlags.map((f, j) => (
                    <span key={j} style={{
                      padding: '0.2rem 0.55rem', borderRadius: 10, fontSize: '0.75rem', fontWeight: 500,
                      background: 'rgba(239,68,68,0.1)', color: '#ef4444',
                    }}>
                       {f}
                    </span>
                  ))}
                </div>
              )}
            </div>
          ))}

          {/* Suggested workup */}
          {ddx.suggestedWorkup?.length > 0 && (
            <div style={{
              background: 'rgba(255,255,255,0.04)', borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.08)', padding: '1rem',
            }}>
              <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 700 }}>Suggested Workup</h3>
              <ol style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.8 }}>
                {ddx.suggestedWorkup.map((w, i) => (
                  <li key={i} style={{ fontSize: '0.9rem', color: '#ccc' }}>{w}</li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* History (shown when no DDx result) */}
      {!ddx && history.length > 0 && (
        <div>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.75rem', color: '#aaa' }}>Recent Queries</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
            {history.map((h, i) => (
              <button
                key={i}
                onClick={() => {
                  setSymptoms(h.symptoms);
                  setAge(h.age || '');
                  setSex(h.sex || 'Male');
                  setDdx(h.ddx);
                }}
                style={{
                  width: '100%', textAlign: 'left', padding: '0.75rem 1rem', borderRadius: 12,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  cursor: 'pointer', color: 'inherit',
                }}
              >
                <div style={{ fontWeight: 600, fontSize: '0.9rem', marginBottom: '0.2rem' }}>
                  {h.symptoms.join(', ')}
                </div>
                <div style={{ fontSize: '0.78rem', color: '#666' }}>
                  {h.age ? `${h.age}yo ` : ''}{h.sex} — {new Date(h.date).toLocaleDateString()}
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
