import React, { useState } from 'react';
import { ChevronDown, Trash2 } from 'lucide-react';

const BUILTIN_MNEMONICS = [
  {
    title: 'MUDPILES', topic: 'Anion Gap Metabolic Acidosis', category: 'Nephrology',
    letters: [
      ['M', 'Methanol'], ['U', 'Uremia'], ['D', 'Diabetic ketoacidosis'],
      ['P', 'Propylene glycol / Paraldehyde'], ['I', 'Isoniazid / Iron'],
      ['L', 'Lactic acidosis'], ['E', 'Ethylene glycol'], ['S', 'Salicylates'],
    ],
  },
  {
    title: 'AEIOU-TIPS', topic: 'Altered Mental Status', category: 'Emergency',
    letters: [
      ['A', 'Alcohol / Acidosis'], ['E', 'Encephalopathy / Electrolytes / Endocrine'],
      ['I', 'Insulin (hypoglycemia)'], ['O', 'Opiates / Overdose / Oxygen (hypoxia)'],
      ['U', 'Uremia'], ['T', 'Trauma / Temperature'], ['I', 'Infection (meningitis, sepsis)'],
      ['P', 'Psychiatric / Poisoning'], ['S', 'Stroke / Seizure / Shock'],
    ],
  },
  {
    title: 'SOCRATES', topic: 'Pain History Taking', category: 'Clinical Skills',
    letters: [
      ['S', 'Site  Where is the pain?'], ['O', 'Onset  When did it start? Sudden or gradual?'],
      ['C', 'Character  Sharp, dull, burning, colicky?'], ['R', 'Radiation  Does it go anywhere?'],
      ['A', 'Associated symptoms  Nausea, vomiting, fever?'], ['T', 'Timing  Constant, intermittent, duration?'],
      ['E', 'Exacerbating / Relieving factors'], ['S', 'Severity  Pain scale 0-10'],
    ],
  },
  {
    title: 'DANISH', topic: 'Causes of Pancreatitis', category: 'Gastroenterology',
    letters: [
      ['D', 'Drugs (azathioprine, valproate, thiazides, steroids)'],
      ['A', 'Alcohol (most common in chronic)'],
      ['N', 'Neoplasm / ERCP'],
      ['I', 'Infection (mumps, CMV, HIV) / Idiopathic'],
      ['S', 'Stones / Gallstones (most common in acute)'],
      ['H', 'Hyperlipidemia / Hypercalcemia / Hypothermia'],
    ],
  },
  {
    title: '4 T\'s (HIT)', topic: 'HIT Probability Score', category: 'Hematology',
    letters: [
      ['T', 'Thrombocytopenia  Degree of platelet fall'],
      ['T', 'Timing  Onset of platelet drop (5-10 days typical)'],
      ['T', 'Thrombosis  New thrombosis or skin necrosis'],
      ['T', 'oTher causes  Other causes of thrombocytopenia excluded?'],
    ],
  },
  {
    title: 'CHAMPS', topic: 'Multiple Sclerosis Red Flags', category: 'Neurology',
    letters: [
      ['C', 'Cerebellar signs (ataxia, intention tremor)'],
      ['H', "Heat sensitivity (Uhthoff's phenomenon)"],
      ['A', 'Ascending weakness / spasticity'],
      ['M', 'MRI white matter lesions (Dawson fingers)'],
      ['P', 'Pain (trigeminal neuralgia, Lhermitte sign)'],
      ['S', 'Sensory changes / optic neuritis / internuclear ophthalmoplegia'],
    ],
  },
  {
    title: 'VINDICATE', topic: 'Differential Diagnosis Framework', category: 'Clinical Skills',
    letters: [
      ['V', 'Vascular'], ['I', 'Infectious / Inflammatory'],
      ['N', 'Neoplastic'], ['D', 'Degenerative / Deficiency'],
      ['I', 'Iatrogenic / Intoxication'], ['C', 'Congenital'],
      ['A', 'Autoimmune / Allergic'], ['T', 'Traumatic'],
      ['E', 'Endocrine / Metabolic'],
    ],
  },
  {
    title: 'CAGE', topic: 'Alcohol Screening', category: 'Psychiatry',
    letters: [
      ['C', 'Cut down  Have you ever felt you should cut down?'],
      ['A', 'Annoyed  Have people annoyed you by criticizing your drinking?'],
      ['G', 'Guilty  Have you ever felt guilty about drinking?'],
      ['E', 'Eye-opener  Have you ever had a drink first thing in the morning?'],
    ],
  },
  {
    title: 'SIGECAPS', topic: 'Major Depressive Disorder', category: 'Psychiatry',
    letters: [
      ['S', 'Sleep disturbance (insomnia or hypersomnia)'],
      ['I', 'Interest loss (anhedonia)'],
      ['G', 'Guilt (excessive or inappropriate)'],
      ['E', 'Energy loss / fatigue'],
      ['C', 'Concentration difficulty'],
      ['A', 'Appetite change (increase or decrease)'],
      ['P', 'Psychomotor agitation or retardation'],
      ['S', 'Suicidal ideation'],
    ],
  },
  {
    title: 'DIGFAST', topic: 'Mania Criteria', category: 'Psychiatry',
    letters: [
      ['D', 'Distractibility'],
      ['I', 'Indiscretion (risky behavior, spending sprees)'],
      ['G', 'Grandiosity'],
      ['F', 'Flight of ideas / racing thoughts'],
      ['A', 'Activity increase (goal-directed or psychomotor agitation)'],
      ['S', 'Sleep deficit (decreased need for sleep)'],
      ['T', 'Talkativeness / pressured speech'],
    ],
  },
  {
    title: '5 P\'s', topic: 'Acute Limb Ischemia', category: 'Vascular Surgery',
    letters: [
      ['P', 'Pain (sudden onset, severe)'],
      ['P', 'Pallor (white/mottled limb)'],
      ['P', 'Pulselessness (absent distal pulses)'],
      ['P', 'Paraesthesia (tingling  numbness)'],
      ['P', 'Paralysis (late sign  indicates severe ischemia)'],
    ],
  },
  {
    title: 'CURB-65', topic: 'Pneumonia Severity', category: 'Pulmonology',
    letters: [
      ['C', 'Confusion (new mental confusion, AMT  8)'],
      ['U', 'Urea > 7 mmol/L (BUN > 19 mg/dL)'],
      ['R', 'Respiratory rate  30/min'],
      ['B', 'Blood pressure: SBP < 90 or DBP  60 mmHg'],
      ['65', 'Age  65 years'],
    ],
  },
];

export default function MedicalMnemonicsView({ addToast }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [expanded, setExpanded] = useState(null);
  const [customs, setCustoms] = useState(() => {
    try { return JSON.parse(localStorage.getItem('mariam_custom_mnemonics')) || []; }
    catch { return []; }
  });
  const [adding, setAdding] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTopic, setNewTopic] = useState('');
  const [newLetters, setNewLetters] = useState('');

  const allMnemonics = [...BUILTIN_MNEMONICS, ...customs.map(c => ({ ...c, isCustom: true }))];

  const categories = ['All', ...new Set(allMnemonics.map(m => m.category))];

  const filtered = allMnemonics.filter(m => {
    if (category !== 'All' && m.category !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      return m.title.toLowerCase().includes(q) || m.topic.toLowerCase().includes(q);
    }
    return true;
  });

  const addCustom = () => {
    if (!newTitle.trim() || !newLetters.trim()) {
      addToast?.('Title and letters are required');
      return;
    }
    const letters = newLetters.trim().split('\n').map(line => {
      const sep = line.match(/[-:]/);
      if (sep) {
        const idx = line.indexOf(sep[0]);
        return [line.slice(0, idx).trim(), line.slice(idx + 1).trim()];
      }
      return [line.trim(), ''];
    }).filter(l => l[0]);

    const custom = {
      title: newTitle.trim(),
      topic: newTopic.trim() || 'Custom',
      category: 'Custom',
      letters,
    };
    const updated = [...customs, custom];
    setCustoms(updated);
    localStorage.setItem('mariam_custom_mnemonics', JSON.stringify(updated));
    setNewTitle('');
    setNewTopic('');
    setNewLetters('');
    setAdding(false);
    addToast?.('Mnemonic added');
  };

  const deleteCustom = (idx) => {
    const builtinCount = BUILTIN_MNEMONICS.length;
    const customIdx = idx - builtinCount;
    const updated = customs.filter((_, i) => i !== customIdx);
    setCustoms(updated);
    localStorage.setItem('mariam_custom_mnemonics', JSON.stringify(updated));
    setExpanded(null);
    addToast?.('Mnemonic deleted');
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}> Mnemonics</h2>
          <p style={{ color: '#888', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
            {filtered.length} mnemonic{filtered.length !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={() => setAdding(!adding)}
          style={{
            padding: '0.5rem 1rem', borderRadius: 12, border: 'none', cursor: 'pointer',
            background: adding ? 'rgba(239,68,68,0.15)' : 'var(--accent, #6366f1)',
            color: adding ? '#ef4444' : '#fff', fontWeight: 600, fontSize: '0.85rem',
          }}
        >
          {adding ? 'Cancel' : '+ Add'}
        </button>
      </div>

      {/* Add form */}
      {adding && (
        <div style={{
          background: 'rgba(255,255,255,0.04)', borderRadius: 16,
          border: '1px solid rgba(255,255,255,0.08)', padding: '1.25rem', marginBottom: '1.5rem',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '0.75rem' }}>
            <input
              placeholder="Title (e.g. MUDPILES)"
              value={newTitle}
              onChange={e => setNewTitle(e.target.value)}
              style={{
                padding: '0.65rem 0.85rem', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
                color: 'inherit', fontSize: '0.9rem', outline: 'none',
              }}
            />
            <input
              placeholder="Topic (e.g. Metabolic Acidosis)"
              value={newTopic}
              onChange={e => setNewTopic(e.target.value)}
              style={{
                padding: '0.65rem 0.85rem', borderRadius: 10,
                border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
                color: 'inherit', fontSize: '0.9rem', outline: 'none',
              }}
            />
          </div>
          <textarea
            placeholder={"One letter per line, e.g.:\nM - Methanol\nU - Uremia\nD - DKA"}
            value={newLetters}
            onChange={e => setNewLetters(e.target.value)}
            rows={6}
            style={{
              width: '100%', padding: '0.65rem 0.85rem', borderRadius: 10,
              border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
              color: 'inherit', fontSize: '0.88rem', outline: 'none', resize: 'vertical',
              fontFamily: 'inherit', lineHeight: 1.6, boxSizing: 'border-box',
            }}
          />
          <button
            onClick={addCustom}
            style={{
              marginTop: '0.75rem', padding: '0.6rem 1.5rem', borderRadius: 10,
              border: 'none', cursor: 'pointer', background: 'var(--accent, #6366f1)',
              color: '#fff', fontWeight: 600, fontSize: '0.9rem',
            }}
          >
            Save Mnemonic
          </button>
        </div>
      )}

      {/* Search */}
      <input
        type="text"
        placeholder="Search mnemonics..."
        value={search}
        onChange={e => setSearch(e.target.value)}
        style={{
          width: '100%', padding: '0.75rem 1rem', borderRadius: 12,
          border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(255,255,255,0.05)',
          color: 'inherit', fontSize: '0.95rem', marginBottom: '1rem', boxSizing: 'border-box',
          outline: 'none',
        }}
      />

      {/* Category pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {categories.map(c => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            style={{
              padding: '0.35rem 0.85rem', borderRadius: 20, border: 'none', cursor: 'pointer',
              fontSize: '0.82rem', fontWeight: 600,
              background: category === c ? 'var(--accent, #6366f1)' : 'rgba(255,255,255,0.08)',
              color: category === c ? '#fff' : '#aaa',
              transition: 'all 0.2s',
            }}
          >
            {c}
          </button>
        ))}
      </div>

      {/* Mnemonic cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {filtered.map((m, i) => {
          const globalIdx = allMnemonics.indexOf(m);
          const isOpen = expanded === globalIdx;
          const avatar = m.title.slice(0, 2).toUpperCase();
          return (
            <div
              key={`${m.title}-${i}`}
              style={{
                background: 'rgba(255,255,255,0.04)', borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden',
                transition: 'all 0.2s',
              }}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : globalIdx)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.85rem 1rem', background: 'none', border: 'none',
                  cursor: 'pointer', color: 'inherit', textAlign: 'left',
                }}
              >
                <span style={{
                  width: 36, height: 36, borderRadius: 10, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: 'rgba(99,102,241,0.15)', color: 'var(--accent, #6366f1)',
                  fontWeight: 800, fontSize: '0.82rem', flexShrink: 0,
                }}>
                  {avatar}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>{m.title}</div>
                  <div style={{ fontSize: '0.78rem', color: '#888', marginTop: '0.1rem' }}>{m.topic}</div>
                </div>
                <span style={{
                  padding: '0.2rem 0.6rem', borderRadius: 12, fontSize: '0.72rem', fontWeight: 600,
                  background: m.isCustom ? 'rgba(16,185,129,0.15)' : 'rgba(99,102,241,0.15)',
                  color: m.isCustom ? '#10b981' : 'var(--accent, #6366f1)',
                }}>
                  {m.category}
                </span>
                <ChevronDown size={16} style={{
                  transition: 'transform 0.2s',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  opacity: 0.5,
                }} />
              </button>
              {isOpen && (
                <div style={{
                  padding: '0 1rem 1rem', borderTop: '1px solid rgba(255,255,255,0.06)',
                  paddingTop: '0.75rem',
                }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                    {m.letters.map(([letter, meaning], j) => (
                      <div key={j} style={{
                        display: 'flex', alignItems: 'center', gap: '0.75rem',
                        padding: '0.5rem 0.75rem', borderRadius: 10,
                        background: 'rgba(255,255,255,0.03)',
                      }}>
                        <span style={{
                          width: 30, height: 30, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: 'rgba(99,102,241,0.2)', color: 'var(--accent, #6366f1)',
                          fontWeight: 800, fontSize: '0.9rem', flexShrink: 0,
                        }}>
                          {letter}
                        </span>
                        <span style={{ fontSize: '0.88rem', color: '#ccc' }}>{meaning}</span>
                      </div>
                    ))}
                  </div>
                  {m.isCustom && (
                    <button
                      onClick={() => deleteCustom(globalIdx)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: '0.4rem',
                        marginTop: '0.75rem', padding: '0.4rem 0.8rem', borderRadius: 10,
                        border: '1px solid rgba(239,68,68,0.3)', background: 'rgba(239,68,68,0.08)',
                        color: '#ef4444', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600,
                      }}
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>No mnemonics found.</p>
        )}
      </div>
    </div>
  );
}
