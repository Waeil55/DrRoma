import React, { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const CALCULATORS = [
  {
    id: 'gfr', title: 'eGFR (CKD-EPI)', category: 'Nephrology', icon: '🩺',
    desc: 'Estimated Glomerular Filtration Rate using CKD-EPI 2021 formula',
    fields: [
      { key: 'creatinine', label: 'Serum Creatinine', unit: 'mg/dL', type: 'number', min: 0.1, step: 0.1, placeholder: '1.0' },
      { key: 'age', label: 'Age', unit: 'years', type: 'number', min: 18, max: 120, placeholder: '45' },
      { key: 'sex', label: 'Biological Sex', unit: '', type: 'select', options: ['Male', 'Female'] },
    ],
    calc: (v) => {
      const cr = parseFloat(v.creatinine); const age = parseFloat(v.age);
      if (!cr || !age) return null;
      const isFemale = v.sex === 'Female';
      const kappa = isFemale ? 0.7 : 0.9; const alpha = isFemale ? -0.241 : -0.302;
      const ratio = cr / kappa;
      const gfr = 142 * Math.pow(Math.min(ratio, 1), alpha) * Math.pow(Math.max(ratio, 1), -1.200) * Math.pow(0.9938, age) * (isFemale ? 1.012 : 1);
      const r = Math.round(gfr);
      const stage = r >= 90 ? 'G1 — Normal' : r >= 60 ? 'G2 — Mildly Decreased' : r >= 45 ? 'G3a — Mild-Moderate' : r >= 30 ? 'G3b — Moderate-Severe' : r >= 15 ? 'G4 — Severely Decreased' : 'G5 — Kidney Failure';
      const color = r >= 60 ? '#10b981' : r >= 45 ? '#f59e0b' : r >= 30 ? '#f97316' : '#ef4444';
      return { value: `${r} mL/min/1.73m²`, stage, color, detail: `CKD Stage: ${stage}` };
    },
  },
  {
    id: 'bmi', title: 'BMI', category: 'General', icon: '⚖️',
    desc: 'Body Mass Index with classification',
    fields: [
      { key: 'weight', label: 'Weight', unit: 'kg', type: 'number', min: 1, step: 0.1, placeholder: '70' },
      { key: 'height', label: 'Height', unit: 'cm', type: 'number', min: 50, step: 1, placeholder: '170' },
    ],
    calc: (v) => {
      const w = parseFloat(v.weight); const h = parseFloat(v.height) / 100;
      if (!w || !h) return null;
      const bmi = w / (h * h); const r = bmi.toFixed(1);
      const cls = bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal weight' : bmi < 30 ? 'Overweight' : bmi < 35 ? 'Obese Class I' : bmi < 40 ? 'Obese Class II' : 'Obese Class III';
      const color = bmi < 18.5 ? '#06b6d4' : bmi < 25 ? '#10b981' : bmi < 30 ? '#f59e0b' : '#ef4444';
      return { value: `${r} kg/m²`, stage: cls, color, detail: `Classification: ${cls}` };
    },
  },
  {
    id: 'chadsvasc', title: 'CHA₂DS₂-VASc', category: 'Cardiology', icon: '❤️',
    desc: 'Stroke risk in non-valvular atrial fibrillation',
    fields: [
      { key: 'chf', label: 'Congestive Heart Failure', unit: '', type: 'select', options: ['No (0)', 'Yes (+1)'] },
      { key: 'htn', label: 'Hypertension', unit: '', type: 'select', options: ['No (0)', 'Yes (+1)'] },
      { key: 'age75', label: 'Age ≥ 75', unit: '', type: 'select', options: ['No (0)', 'Yes (+2)'] },
      { key: 'dm', label: 'Diabetes Mellitus', unit: '', type: 'select', options: ['No (0)', 'Yes (+1)'] },
      { key: 'stroke', label: 'Stroke / TIA history', unit: '', type: 'select', options: ['No (0)', 'Yes (+2)'] },
      { key: 'vasc', label: 'Vascular disease', unit: '', type: 'select', options: ['No (0)', 'Yes (+1)'] },
      { key: 'age65', label: 'Age 65-74', unit: '', type: 'select', options: ['No (0)', 'Yes (+1)'] },
      { key: 'female', label: 'Female sex', unit: '', type: 'select', options: ['No (0)', 'Yes (+1)'] },
    ],
    calc: (v) => {
      const pts = { chf: 1, htn: 1, age75: 2, dm: 1, stroke: 2, vasc: 1, age65: 1, female: 1 };
      const score = Object.entries(pts).reduce((s, [k, p]) => s + (v[k]?.startsWith('Yes') ? p : 0), 0);
      const risk = score === 0 ? '0% (Low)' : score === 1 ? '1.3%' : score === 2 ? '2.2%' : score === 3 ? '3.2%' : score === 4 ? '4.0%' : score === 5 ? '6.7%' : score === 6 ? '9.8%' : score === 7 ? '9.6%' : '6.7%+';
      const color = score <= 1 ? '#10b981' : score <= 3 ? '#f59e0b' : '#ef4444';
      const rec = score >= 2 ? 'Anticoagulation recommended' : score === 1 ? 'Consider anticoagulation' : 'No anticoagulation indicated';
      return { value: `Score: ${score}`, stage: rec, color, detail: `Stroke risk: ${risk}/year — ${rec}` };
    },
  },
  {
    id: 'wells_dvt', title: 'Wells DVT Score', category: 'Hematology', icon: '🦵',
    desc: 'Pre-test probability for deep vein thrombosis',
    fields: [
      { key: 'cancer', label: 'Active cancer', unit: '', type: 'select', options: ['No (0)', 'Yes (+1)'] },
      { key: 'paralysis', label: 'Paralysis / plaster', unit: '', type: 'select', options: ['No (0)', 'Yes (+1)'] },
      { key: 'bedridden', label: 'Bedridden > 3 days', unit: '', type: 'select', options: ['No (0)', 'Yes (+1)'] },
      { key: 'tenderness', label: 'Localized tenderness along vein', unit: '', type: 'select', options: ['No (0)', 'Yes (+1)'] },
      { key: 'entire_leg', label: 'Entire leg swollen', unit: '', type: 'select', options: ['No (0)', 'Yes (+1)'] },
      { key: 'calf', label: 'Calf swelling > 3 cm', unit: '', type: 'select', options: ['No (0)', 'Yes (+1)'] },
      { key: 'pitting', label: 'Pitting edema', unit: '', type: 'select', options: ['No (0)', 'Yes (+1)'] },
      { key: 'collateral', label: 'Collateral superficial veins', unit: '', type: 'select', options: ['No (0)', 'Yes (+1)'] },
      { key: 'alt_dx', label: 'Alternative diagnosis as likely', unit: '', type: 'select', options: ['No (0)', 'Yes (−2)'] },
    ],
    calc: (v) => {
      let score = Object.entries(v).filter(([k]) => k !== 'alt_dx').reduce((s, [, val]) => s + (val?.startsWith('Yes') ? 1 : 0), 0);
      if (v.alt_dx?.startsWith('Yes')) score -= 2;
      const prob = score <= 0 ? 'Low (3%)' : score <= 2 ? 'Moderate (17%)' : 'High (75%)';
      const color = score <= 0 ? '#10b981' : score <= 2 ? '#f59e0b' : '#ef4444';
      const action = score <= 0 ? 'D-dimer → if negative, no US needed' : 'Compression ultrasonography recommended';
      return { value: `Score: ${score}`, stage: prob, color, detail: `DVT probability: ${prob} — ${action}` };
    },
  },
  {
    id: 'sofa', title: 'SOFA Score', category: 'Critical Care', icon: '🏥',
    desc: 'Sequential Organ Failure Assessment — sepsis severity',
    fields: [
      { key: 'pf', label: 'PaO₂/FiO₂ ratio', unit: '', type: 'select', options: ['≥400 (0)', '300–399 (+1)', '200–299 (+2)', '100–199 (+3)', '<100 (+4)'] },
      { key: 'plt', label: 'Platelets', unit: 'x10³/μL', type: 'select', options: ['≥150 (0)', '100–149 (+1)', '50–99 (+2)', '20–49 (+3)', '<20 (+4)'] },
      { key: 'bili', label: 'Bilirubin', unit: 'mg/dL', type: 'select', options: ['<1.2 (0)', '1.2–1.9 (+1)', '2.0–5.9 (+2)', '6.0–11.9 (+3)', '≥12 (+4)'] },
      { key: 'map', label: 'MAP / vasopressors', unit: '', type: 'select', options: ['MAP ≥70 (0)', 'MAP <70 (+1)', 'DA ≤5 or Dobu (+2)', 'DA >5 or Epi/NE ≤0.1 (+3)', 'DA >15 or Epi/NE >0.1 (+4)'] },
      { key: 'gcs', label: 'Glasgow Coma Scale', unit: '', type: 'select', options: ['15 (0)', '13–14 (+1)', '10–12 (+2)', '6–9 (+3)', '<6 (+4)'] },
      { key: 'cr', label: 'Creatinine / urine output', unit: '', type: 'select', options: ['<1.2 (0)', '1.2–1.9 (+1)', '2.0–3.4 (+2)', '3.5–4.9 (+3)', '>5.0 (+4)'] },
    ],
    calc: (v) => {
      const score = Object.values(v).reduce((s, val) => { const m = val?.match(/\+(\d)/); return s + (m ? parseInt(m[1]) : 0); }, 0);
      const mort = score < 7 ? '<10%' : score < 10 ? '15–20%' : score < 13 ? '40–50%' : '>80%';
      const color = score < 7 ? '#10b981' : score < 10 ? '#f59e0b' : score < 13 ? '#f97316' : '#ef4444';
      return { value: `Score: ${score}/24`, stage: `Mortality ~${mort}`, color, detail: `Predicted mortality: ${mort}` };
    },
  },
  {
    id: 'glasgow', title: 'Glasgow Coma Scale', category: 'Neurology', icon: '🧠',
    desc: 'Neurological status — eye, verbal, motor',
    fields: [
      { key: 'eye', label: 'Eye Opening', unit: '', type: 'select', options: ['Spontaneous (4)', 'To voice (3)', 'To pain (2)', 'None (1)'] },
      { key: 'verbal', label: 'Verbal Response', unit: '', type: 'select', options: ['Oriented (5)', 'Confused (4)', 'Inappropriate words (3)', 'Sounds (2)', 'None (1)'] },
      { key: 'motor', label: 'Motor Response', unit: '', type: 'select', options: ['Obeys commands (6)', 'Localizes pain (5)', 'Withdraws (4)', 'Flexion (3)', 'Extension (2)', 'None (1)'] },
    ],
    calc: (v) => {
      const score = Object.values(v).reduce((s, val) => { const m = val?.match(/\((\d)\)/); return s + (m ? parseInt(m[1]) : 0); }, 0);
      const cls = score >= 14 ? 'Mild (14-15)' : score >= 9 ? 'Moderate (9-13)' : 'Severe (≤8)';
      const color = score >= 14 ? '#10b981' : score >= 9 ? '#f59e0b' : '#ef4444';
      return { value: `${score}/15`, stage: cls, color, detail: `GCS ${score}: ${cls} — ${score <= 8 ? 'Consider intubation' : score <= 13 ? 'Close monitoring' : 'Normal consciousness'}` };
    },
  },
  {
    id: 'meld', title: 'MELD Score', category: 'Gastroenterology', icon: '🫀',
    desc: 'Model for End-Stage Liver Disease — liver transplant priority',
    fields: [
      { key: 'bili', label: 'Bilirubin', unit: 'mg/dL', type: 'number', min: 0.1, step: 0.1, placeholder: '1.0' },
      { key: 'cr', label: 'Creatinine', unit: 'mg/dL', type: 'number', min: 0.1, step: 0.1, placeholder: '1.0' },
      { key: 'inr', label: 'INR', unit: '', type: 'number', min: 0.5, step: 0.1, placeholder: '1.0' },
      { key: 'sodium', label: 'Serum Sodium', unit: 'mEq/L', type: 'number', min: 100, max: 150, step: 1, placeholder: '140' },
    ],
    calc: (v) => {
      let bili = Math.max(1, parseFloat(v.bili)); let cr = Math.min(4, Math.max(1, parseFloat(v.cr)));
      let inr = Math.max(1, parseFloat(v.inr)); const na = Math.min(137, Math.max(125, parseFloat(v.sodium)));
      if (!bili || !cr || !inr || !na) return null;
      const meld = 3.78 * Math.log(bili) + 11.2 * Math.log(inr) + 9.57 * Math.log(cr) + 6.43;
      const meldNa = Math.round(meld - na - (0.025 * Math.round(meld) * (140 - na)) + 140);
      const mort = meldNa < 10 ? '4%' : meldNa < 20 ? '27%' : meldNa < 30 ? '76%' : '>90%';
      const color = meldNa < 10 ? '#10b981' : meldNa < 20 ? '#f59e0b' : meldNa < 30 ? '#f97316' : '#ef4444';
      return { value: `MELD-Na: ${meldNa}`, stage: `3-month mortality: ${mort}`, color, detail: `MELD: ${Math.round(meld)} — MELD-Na: ${meldNa} — Transplant priority score` };
    },
  },
  {
    id: 'apgar', title: 'APGAR Score', category: 'Pediatrics', icon: '👶',
    desc: 'Newborn health assessment at 1 and 5 minutes',
    fields: [
      { key: 'activity', label: 'Muscle Tone (Activity)', unit: '', type: 'select', options: ['Limp (0)', 'Some flexion (1)', 'Active motion (2)'] },
      { key: 'pulse', label: 'Pulse', unit: '', type: 'select', options: ['Absent (0)', '<100/min (1)', '≥100/min (2)'] },
      { key: 'grimace', label: 'Grimace (Reflex)', unit: '', type: 'select', options: ['No response (0)', 'Grimace (1)', 'Cry / cough (2)'] },
      { key: 'appearance', label: 'Appearance (Color)', unit: '', type: 'select', options: ['Blue all over (0)', 'Blue extremities (1)', 'Pink all over (2)'] },
      { key: 'respiration', label: 'Respiration', unit: '', type: 'select', options: ['Absent (0)', 'Weak/irregular (1)', 'Strong cry (2)'] },
    ],
    calc: (v) => {
      const score = Object.values(v).reduce((s, val) => { const m = val?.match(/\((\d)\)/); return s + (m ? parseInt(m[1]) : 0); }, 0);
      const cls = score >= 7 ? 'Normal (7-10)' : score >= 4 ? 'Moderate concern (4-6)' : 'Requires resuscitation (0-3)';
      const color = score >= 7 ? '#10b981' : score >= 4 ? '#f59e0b' : '#ef4444';
      return { value: `${score}/10`, stage: cls, color, detail: `APGAR ${score}: ${cls}` };
    },
  },
];

export default function MedicalCalculatorView() {
  const [activeCalc, setActiveCalc] = useState(null);
  const [inputs, setInputs] = useState({});
  const [result, setResult] = useState(null);
  const [history, setHistory] = useState([]);
  const [category, setCategory] = useState('All');
  const categories = ['All', ...new Set(CALCULATORS.map(c => c.category))];
  const filtered = category === 'All' ? CALCULATORS : CALCULATORS.filter(c => c.category === category);

  const open = (calc) => { setActiveCalc(calc); setInputs({}); setResult(null); };
  const compute = () => {
    if (!activeCalc) return;
    const defaults = {};
    activeCalc.fields.forEach(f => { if (f.type === 'select') defaults[f.key] = f.options[0]; });
    const vals = { ...defaults, ...inputs };
    const r = activeCalc.calc(vals);
    setResult(r);
    if (r) {
      const entry = { calcId: activeCalc.id, calcTitle: activeCalc.title, ...r, ts: Date.now() };
      setHistory(h => [entry, ...h.slice(0, 19)]);
    }
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl mb-3 flex items-center gap-2">🩺 Medical Calculators</h2>
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(c => (
            <button key={c} onClick={() => { setCategory(c); setActiveCalc(null); }}
              className="px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all"
              style={c === category ? { background: 'var(--accent)', color: '#fff' } : { background: 'var(--surface,var(--card))', opacity: .65 }}>
              {c}
            </button>
          ))}
        </div>
      </div>

      {activeCalc ? (
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={() => { setActiveCalc(null); setResult(null); }} className="glass w-9 h-9 rounded-xl flex items-center justify-center"><ChevronLeft size={16} /></button>
            <div>
              <h2 className="font-black">{activeCalc.icon} {activeCalc.title}</h2>
              <p className="text-xs opacity-40">{activeCalc.desc}</p>
            </div>
          </div>

          <div className="glass rounded-2xl p-5 space-y-4" style={{ border: '1px solid var(--border)' }}>
            {activeCalc.fields.map(f => (
              <div key={f.key}>
                <label className="text-sm font-bold mb-1.5 flex items-center justify-between">
                  <span>{f.label}</span>
                  {f.unit && <span className="text-xs opacity-40">{f.unit}</span>}
                </label>
                {f.type === 'select' ? (
                  <select value={inputs[f.key] ?? f.options[0]}
                    onChange={e => setInputs(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none"
                    style={{ background: 'var(--surface,var(--card))', border: '1px solid var(--border)' }}>
                    {f.options.map(o => <option key={o} value={o}>{o}</option>)}
                  </select>
                ) : (
                  <input type="number" min={f.min} max={f.max} step={f.step}
                    placeholder={f.placeholder}
                    value={inputs[f.key] ?? ''}
                    onChange={e => setInputs(p => ({ ...p, [f.key]: e.target.value }))}
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none"
                    style={{ background: 'var(--surface,var(--card))', border: '1px solid var(--border)' }} />
                )}
              </div>
            ))}
            <button onClick={compute} className="btn-accent w-full py-3 rounded-xl font-black mt-2">Calculate</button>
          </div>

          {result && (
            <div className="glass rounded-2xl p-6 text-center animate-scale-in" style={{ border: `2px solid ${result.color}40`, background: result.color + '08' }}>
              <div className="text-3xl font-black mb-2" style={{ color: result.color }}>{result.value}</div>
              <div className="font-black text-lg mb-3" style={{ color: result.color }}>{result.stage}</div>
              <p className="text-sm opacity-60 leading-relaxed">{result.detail}</p>
            </div>
          )}

          {history.filter(h => h.calcId === activeCalc.id).length > 0 && (
            <div className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
              <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-3">Previous Results</h3>
              <div className="space-y-2">
                {history.filter(h => h.calcId === activeCalc.id).slice(0, 5).map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-sm px-3 py-2 rounded-xl" style={{ background: 'var(--surface,var(--card))' }}>
                    <span className="font-bold" style={{ color: h.color }}>{h.value}</span>
                    <span className="text-xs opacity-40">{new Date(h.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.map(calc => (
              <button key={calc.id} onClick={() => open(calc)}
                className="glass rounded-2xl p-5 text-left transition-all card-hover flex items-start gap-4"
                style={{ border: '1px solid var(--border)' }}>
                <div className="text-3xl">{calc.icon}</div>
                <div className="flex-1 min-w-0">
                  <div className="font-black">{calc.title}</div>
                  <div className="text-xs opacity-40 mt-0.5 mb-2">{calc.category}</div>
                  <p className="text-xs opacity-60 line-clamp-2 leading-relaxed">{calc.desc}</p>
                </div>
              </button>
            ))}
          </div>
          {history.length > 0 && (
            <div className="glass rounded-2xl p-4 mt-4" style={{ border: '1px solid var(--border)' }}>
              <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-3">Recent Calculations</h3>
              <div className="space-y-2">
                {history.slice(0, 5).map((h, i) => (
                  <div key={i} className="flex items-center justify-between text-sm px-3 py-2 rounded-xl" style={{ background: 'var(--surface,var(--card))' }}>
                    <span className="font-bold opacity-70">{h.calcTitle}</span>
                    <span className="font-black" style={{ color: h.color }}>{h.value}</span>
                    <span className="text-xs opacity-30">{new Date(h.ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
