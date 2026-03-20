import React, { useState } from 'react';
import { Loader2, Sparkles, AlertCircle } from 'lucide-react';
import callAIStreaming from '../../services/ai/callAIStreaming';

const SEV_COLORS = { major: '#ef4444', moderate: '#f59e0b', minor: '#10b981' };
const SEV_ICONS = { major: '', moderate: '', minor: '' };

const QUICK_DRUGS = [
  'Aspirin', 'Warfarin', 'Metformin', 'Lisinopril', 'Amlodipine',
  'Omeprazole', 'Atorvastatin', 'Metoprolol', 'Furosemide', 'Amoxicillin',
];

export default function DrugInteractionCheckerView({ settings, addToast }) {
  const [drugs, setDrugs] = useState([]);
  const [currentDrug, setCurrentDrug] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const addDrug = () => {
    const d = currentDrug.trim();
    if (d && !drugs.includes(d)) {
      setDrugs(prev => [...prev, d]);
    }
    setCurrentDrug('');
  };

  const removeDrug = (d) => setDrugs(prev => prev.filter(x => x !== d));

  const checkInteractions = async () => {
    if (drugs.length < 2) { addToast?.('Add at least 2 drugs'); return; }
    const apiKey = settings?.apiKey;
    if (!apiKey) { addToast?.('Set your API key in Settings'); return; }

    setLoading(true);
    setResult(null);

    const prompt = `You are a clinical pharmacology AI. Check for drug-drug interactions among the following medications:

Drugs: ${drugs.join(', ')}

Respond in strict JSON format:
{
  "interactions": [
    {
      "drugs": ["Drug A", "Drug B"],
      "severity": "major|moderate|minor",
      "mechanism": "How the interaction occurs",
      "clinicalEffect": "Clinical significance",
      "management": "How to manage"
    }
  ],
  "contraindications": ["Any absolute contraindications"],
  "monitoring": ["Parameters to monitor"],
  "summary": "Overall summary of the drug combination safety"
}

Be thorough and clinically accurate. Include all relevant interactions.`;

    try {
      let full = '';
      await callAIStreaming({
        apiKey,
        model: settings?.model || 'gpt-4o-mini',
        systemPrompt: 'You are a clinical pharmacology AI. Always respond in valid JSON only.',
        userMessage: prompt,
        onChunk: (chunk) => { full += chunk; },
      });

      const jsonMatch = full.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        setResult(JSON.parse(jsonMatch[0]));
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
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}> Drug Interactions</h2>
        <p style={{ color: '#888', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
          AI-powered drug interaction checker
        </p>
      </div>

      {/* Input section */}
      <div style={{
        background: 'rgba(255,255,255,0.04)', borderRadius: 16,
        border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem', marginBottom: '1.5rem',
      }}>
        {/* Drug input */}
        <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
          <input
            type="text"
            placeholder="Add a drug name..."
            value={currentDrug}
            onChange={e => setCurrentDrug(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addDrug(); } }}
            style={{
              flex: 1, padding: '0.65rem 0.85rem', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
              color: 'inherit', fontSize: '0.9rem', outline: 'none',
            }}
          />
          <button
            onClick={addDrug}
            style={{
              padding: '0.65rem 1rem', borderRadius: 10, border: 'none', cursor: 'pointer',
              background: 'var(--accent, #6366f1)', color: '#fff', fontWeight: 600, fontSize: '0.9rem',
            }}
          >
            +
          </button>
        </div>

        {/* Drug chips */}
        {drugs.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '0.75rem' }}>
            {drugs.map(d => (
              <span key={d} style={{
                display: 'inline-flex', alignItems: 'center', gap: '0.35rem',
                padding: '0.3rem 0.7rem', borderRadius: 20, fontSize: '0.82rem', fontWeight: 600,
                background: 'rgba(99,102,241,0.15)', color: 'var(--accent, #6366f1)',
              }}>
                {d}
                <span onClick={() => removeDrug(d)} style={{ cursor: 'pointer', opacity: 0.7, lineHeight: 1 }}>×</span>
              </span>
            ))}
          </div>
        )}

        {/* Quick add */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '1rem' }}>
          {QUICK_DRUGS.map(d => (
            <button
              key={d}
              onClick={() => { if (!drugs.includes(d)) setDrugs(prev => [...prev, d]); }}
              style={{
                padding: '0.25rem 0.6rem', borderRadius: 14, border: '1px solid rgba(255,255,255,0.1)',
                background: drugs.includes(d) ? 'rgba(99,102,241,0.15)' : 'rgba(255,255,255,0.04)',
                color: drugs.includes(d) ? 'var(--accent, #6366f1)' : '#888',
                cursor: 'pointer', fontSize: '0.78rem', fontWeight: 500, transition: 'all 0.2s',
              }}
            >
              {d}
            </button>
          ))}
        </div>

        {/* Check button */}
        <button
          onClick={checkInteractions}
          disabled={loading || drugs.length < 2}
          style={{
            width: '100%', padding: '0.75rem', borderRadius: 12, border: 'none', cursor: loading ? 'wait' : 'pointer',
            background: loading ? 'rgba(99,102,241,0.3)' : 'var(--accent, #6366f1)',
            color: '#fff', fontWeight: 700, fontSize: '0.95rem',
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
            opacity: drugs.length < 2 ? 0.5 : 1,
          }}
        >
          {loading ? <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} /> : <Sparkles size={18} />}
          {loading ? 'Checking...' : 'Check Interactions'}
        </button>
      </div>

      {/* Results */}
      {result && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {/* Summary */}
          {result.summary && (
            <div style={{
              background: 'rgba(255,255,255,0.04)', borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.08)', padding: '1rem',
            }}>
              <h3 style={{ margin: '0 0 0.5rem', fontSize: '1rem', fontWeight: 700 }}>Summary</h3>
              <p style={{ margin: 0, color: '#ccc', fontSize: '0.9rem', lineHeight: 1.6 }}>{result.summary}</p>
            </div>
          )}

          {/* Contraindications */}
          {result.contraindications?.length > 0 && (
            <div style={{
              padding: '1rem', borderRadius: 14,
              border: '2px solid rgba(239,68,68,0.4)', background: 'rgba(239,68,68,0.06)',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <AlertCircle size={18} style={{ color: '#ef4444' }} />
                <span style={{ fontWeight: 700, color: '#ef4444', fontSize: '0.95rem' }}>Contraindications</span>
              </div>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.8 }}>
                {result.contraindications.map((c, i) => (
                  <li key={i} style={{ fontSize: '0.9rem', color: '#ddd' }}>{c}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Interaction cards */}
          {result.interactions?.map((inter, i) => (
            <div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.04)', borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.08)', padding: '1rem',
                borderLeft: `4px solid ${SEV_COLORS[inter.severity] || '#888'}`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.6rem' }}>
                <span style={{ fontSize: '1.1rem' }}>{SEV_ICONS[inter.severity] || ''}</span>
                <span style={{ fontWeight: 700, flex: 1, fontSize: '0.95rem' }}>
                  {inter.drugs?.join(' ↔ ')}
                </span>
                <span style={{
                  padding: '0.2rem 0.6rem', borderRadius: 12, fontSize: '0.75rem', fontWeight: 700,
                  background: `${SEV_COLORS[inter.severity] || '#888'}20`,
                  color: SEV_COLORS[inter.severity] || '#888',
                  textTransform: 'capitalize',
                }}>
                  {inter.severity}
                </span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', fontSize: '0.88rem', color: '#bbb', lineHeight: 1.5 }}>
                {inter.mechanism && (
                  <p style={{ margin: 0 }}><strong style={{ color: '#aaa' }}>Mechanism:</strong> {inter.mechanism}</p>
                )}
                {inter.clinicalEffect && (
                  <p style={{ margin: 0 }}><strong style={{ color: '#aaa' }}>Effect:</strong> {inter.clinicalEffect}</p>
                )}
                {inter.management && (
                  <p style={{ margin: 0 }}><strong style={{ color: '#aaa' }}>Management:</strong> {inter.management}</p>
                )}
              </div>
            </div>
          ))}

          {/* Monitoring */}
          {result.monitoring?.length > 0 && (
            <div style={{
              background: 'rgba(255,255,255,0.04)', borderRadius: 14,
              border: '1px solid rgba(255,255,255,0.08)', padding: '1rem',
            }}>
              <h3 style={{ margin: '0 0 0.75rem', fontSize: '1rem', fontWeight: 700 }}>Monitoring Parameters</h3>
              <ul style={{ margin: 0, paddingLeft: '1.25rem', lineHeight: 1.8 }}>
                {result.monitoring.map((m, i) => (
                  <li key={i} style={{ fontSize: '0.9rem', color: '#ccc' }}>{m}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      <style>{`@keyframes spin { to { transform: rotate(360deg) } }`}</style>
    </div>
  );
}
