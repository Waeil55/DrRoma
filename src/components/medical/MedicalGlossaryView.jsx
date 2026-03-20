import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const MEDICAL_GLOSSARY = [
  { term: 'Bradycardia', cat: 'Cardiology', def: 'Heart rate < 60 bpm at rest. Can be physiological (athletes) or pathological (heart block, hypothyroidism).' },
  { term: 'Tachycardia', cat: 'Cardiology', def: 'Heart rate > 100 bpm. Classified as narrow (SVT, sinus) or wide complex (VT, SVT with aberrancy).' },
  { term: 'Hypoxemia', cat: 'Pulmonology', def: 'Low blood oxygen: PaO < 80 mmHg or SpO < 95%. Causes: V/Q mismatch, shunt, hypoventilation, diffusion impairment.' },
  { term: 'Atelectasis', cat: 'Pulmonology', def: 'Lung collapse or incomplete inflation. Post-op complication. Signs: decreased breath sounds, dullness, deviation of trachea toward side.' },
  { term: 'Oliguria', cat: 'Nephrology', def: 'Urine output < 400 mL/day or < 0.5 mL/kg/hr. Pre-renal (dehydration), renal (ATN), or post-renal (obstruction).' },
  { term: 'Anuria', cat: 'Nephrology', def: 'Urine output < 100 mL/day. Emergency. Consider complete obstruction, bilateral renal artery occlusion, or severe ATN.' },
  { term: 'Asterixis', cat: 'Neurology', def: '"Flapping tremor"  liver flap. Seen in hepatic encephalopathy, uraemia. Patient extends hands; involuntary flap as wrists dorsiflex.' },
  { term: 'Clonus', cat: 'Neurology', def: 'Rhythmic, oscillating contractions in response to sustained stretch. Indicates upper motor neuron lesion. Commonly at ankle.' },
  { term: 'Hematemesis', cat: 'Gastroenterology', def: 'Vomiting blood. Indicates upper GI bleed (above Treitz). Red = active arterial bleeding; coffee-ground = old blood.' },
  { term: 'Melena', cat: 'Gastroenterology', def: 'Black, tarry, foul-smelling stool from upper GI blood ( digested 200 mL) exposed to gut bacteria and acid.' },
  { term: 'Jaundice', cat: 'Gastroenterology', def: 'Yellow discoloration when bilirubin > 2.5 mg/dL. Pre-hepatic (haemolysis), hepatic (hepatitis, cirrhosis), post-hepatic (obstruction).' },
  { term: 'Orthopnea', cat: 'Cardiology', def: 'Dyspnoea when supine; relieved by sitting up. Caused by increased venous return in left heart failure. Graded in pillows.' },
  { term: 'Paroxysmal Nocturnal Dyspnoea', cat: 'Cardiology', def: 'PND: sudden breathlessness at night 1-2 hours after sleep. Left heart failure  interstitial oedema reabsorbs supine.' },
  { term: 'Crepitations', cat: 'Pulmonology', def: 'Crackling sounds on auscultation. Fine = pulmonary fibrosis/early pulmonary oedema; coarse = secretions (infection, bronchiectasis).' },
  { term: 'Bronchophony', cat: 'Pulmonology', def: 'Increased transmission of voice sounds (99) over consolidated lung. Companion sign: whispering pectoriloquy, aegophony.' },
  { term: "Murphy's Sign", cat: 'Gastroenterology', def: 'Inspiratory arrest on deep palpation of RUQ. + in acute cholecystitis. Absent in chronic, empyema of GB, or gangrenous wall.' },
  { term: "McBurney's Point", cat: 'Surgery', def: "1/3 from ASIS to umbilicus  maximal tenderness in acute appendicitis. Rovsing's sign (LLQ pressure  RLQ pain) also +ve." },
  { term: "Kernig's Sign", cat: 'Neurology', def: 'Meningism: cannot fully extend knee when hip is 90° flexed (due to irritated meningeal nerve roots). + in meningitis. Sensitivity ~57%.' },
  { term: "Brudzinski's Sign", cat: 'Neurology', def: 'Meningism: passive neck flexion causes involuntary hip/knee flexion. Sensitivity ~57% for bacterial meningitis.' },
  { term: 'Orthostatic Hypotension', cat: 'Cardiology', def: 'Fall in SBP  20 mmHg or DBP  10 mmHg within 3 minutes of standing. Causes: dehydration, autonomic failure, medications.' },
  { term: 'Pulsus Paradoxus', cat: 'Cardiology', def: 'Exaggerated drop (>10 mmHg) in SBP during inspiration. Cardiac tamponade, severe asthma, COPD, PE.' },
  { term: 'Cyanosis', cat: 'General', def: 'Central (low SpO, low PaO) vs Peripheral (local vasoconstriction). Detectable when deoxy-Hb > 5 g/dL in capillaries.' },
  { term: "Trousseau's Sign", cat: 'Endocrine', def: "Hypocalcaemia: carpal spasm within 3 min of inflating BP cuff above systolic. More sensitive than Chvostek's sign (90% vs 29%)." },
  { term: "Chvostek's Sign", cat: 'Endocrine', def: 'Facial twitching on tapping the facial nerve anterior to the tragus. Hypocalcaemia. Low specificity  present in 10% normals.' },
  { term: "Homan's Sign", cat: 'Hematology', def: 'Calf pain on dorsiflexion of foot. Historically DVT, but sensitivity 25-50%, specificity 39-89%  largely abandoned.' },
  { term: "Virchow's Triad", cat: 'Hematology', def: 'Venous thrombosis risk factors: stasis (immobility, cardiac failure), endothelial injury, hypercoagulability.' },
  { term: "Pemberton's Sign", cat: 'Endocrine', def: 'Raising both arms above head  facial plethora, cyanosis, distended neck veins due to retrosternal goitre compressing SVC.' },
  { term: "Cullen's Sign", cat: 'Gastroenterology', def: 'Periumbilical ecchymosis = retroperitoneal haemorrhage tracking along falciform ligament. Seen in severe pancreatitis, ruptured ectopic.' },
  { term: "Grey Turner's Sign", cat: 'Gastroenterology', def: 'Flank ecchymosis from retroperitoneal haemorrhage. Seen in severe pancreatitis or abdominal trauma. Late sign (1-3 days).' },
  { term: 'Spider Naevi', cat: 'Gastroenterology', def: 'Central arteriole with radiating vessels that blanch on pressure. >5 in distribution of SVC  chronic liver disease / cirrhosis.' },
];

const categories = ['All', ...new Set(MEDICAL_GLOSSARY.map(g => g.cat))];

export default function MedicalGlossaryView() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [expanded, setExpanded] = useState(null);

  const filtered = MEDICAL_GLOSSARY.filter(g => {
    if (category !== 'All' && g.cat !== category) return false;
    if (search) {
      const q = search.toLowerCase();
      return g.term.toLowerCase().includes(q) || g.def.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div style={{ padding: '1.5rem', maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, margin: 0 }}> Medical Glossary</h2>
        <p style={{ color: '#888', margin: '0.25rem 0 0', fontSize: '0.9rem' }}>
          {filtered.length} term{filtered.length !== 1 ? 's' : ''}
        </p>
      </div>

      {/* Search */}
      <input
        type="text"
        placeholder="Search terms or definitions..."
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

      {/* Term cards */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
        {filtered.map((g, i) => {
          const isOpen = expanded === i;
          return (
            <div
              key={g.term}
              style={{
                background: 'rgba(255,255,255,0.04)', borderRadius: 14,
                border: '1px solid rgba(255,255,255,0.08)', overflow: 'hidden',
                transition: 'all 0.2s',
              }}
            >
              <button
                onClick={() => setExpanded(isOpen ? null : i)}
                style={{
                  width: '100%', display: 'flex', alignItems: 'center', gap: '0.75rem',
                  padding: '0.85rem 1rem', background: 'none', border: 'none',
                  cursor: 'pointer', color: 'inherit', textAlign: 'left',
                }}
              >
                <span style={{ fontWeight: 600, flex: 1, fontSize: '0.95rem' }}>{g.term}</span>
                <span style={{
                  padding: '0.2rem 0.6rem', borderRadius: 12, fontSize: '0.72rem', fontWeight: 600,
                  background: 'rgba(99,102,241,0.15)', color: 'var(--accent, #6366f1)',
                }}>
                  {g.cat}
                </span>
                <ChevronDown size={16} style={{
                  transition: 'transform 0.2s',
                  transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                  opacity: 0.5,
                }} />
              </button>
              {isOpen && (
                <div style={{
                  padding: '0 1rem 1rem', fontSize: '0.9rem', lineHeight: 1.6,
                  color: '#ccc', borderTop: '1px solid rgba(255,255,255,0.06)',
                  paddingTop: '0.75rem',
                }}>
                  {g.def}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && (
          <p style={{ textAlign: 'center', color: '#666', padding: '2rem' }}>No terms found.</p>
        )}
      </div>
    </div>
  );
}
