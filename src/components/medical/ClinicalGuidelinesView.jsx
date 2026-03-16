import { useState } from 'react';
import { ChevronDown, ChevronLeft } from 'lucide-react';

const CLINICAL_GUIDELINES = [
  { id: 'htn', title: 'Hypertension Management', cat: 'Cardiology', year: '2024',
    summary: 'Target BP <130/80 for most adults with hypertension. First-line: ACEi/ARB, CCB, or thiazide.',
    steps: [
      { step: 'Confirm diagnosis', detail: 'ABPM or HBPM. ≥2 readings on ≥2 occasions. Screen for secondary causes if <30 yo, resistant, or sudden onset.' },
      { step: 'Lifestyle modifications', detail: 'DASH diet, Na <1.5g/day, exercise 150 min/week, weight loss (5-10 kg), limit alcohol, quit smoking.' },
      { step: 'Start monotherapy', detail: 'ACEi/ARB, CCB, or thiazide-like diuretic. Choice based on comorbidities: DM/CKD → ACEi/ARB; Black patients → CCB or thiazide.' },
      { step: 'If not at target in 1 month', detail: 'Add second agent from different class. ACEi/ARB + CCB preferred combination.' },
      { step: 'Triple therapy', detail: 'ACEi/ARB + CCB + thiazide. If still uncontrolled → resistant HTN workup: check adherence, screen for secondary causes.' },
      { step: 'Resistant HTN', detail: 'Add spironolactone (4th line). Check renal artery stenosis, pheo, Conn syndrome, OSA.' },
    ],
    keyPoints: ['Never combine ACEi + ARB', 'Avoid ACEi/ARB in pregnancy (teratogenic)', 'Check Cr/K+ 1-2 weeks after starting ACEi/ARB', 'Urgency (>180/120 + no organ damage) → oral meds, reduce over 24-48h', 'Emergency (>180/120 + organ damage) → IV meds, ICU, reduce MAP 25% in first hour'] },
  { id: 'dm2', title: 'Type 2 Diabetes Management', cat: 'Endocrinology', year: '2024',
    summary: 'Metformin remains first-line. GLP-1 RA or SGLT2i for those with ASCVD, HF, or CKD.',
    steps: [
      { step: 'Lifestyle + Metformin', detail: 'Start metformin at diagnosis. Titrate to 2000 mg/day. HbA1c target <7% (individualize 6.5-8%).' },
      { step: 'Assess comorbidities', detail: 'ASCVD or high risk → add GLP-1 RA (semaglutide, liraglutide). HF or CKD → add SGLT2i (empagliflozin, dapagliflozin).' },
      { step: 'If HbA1c still above target', detail: 'Add second/third agent: GLP-1 RA, SGLT2i, DPP-4i, TZD, or sulfonylurea. Avoid SU + insulin (hypo risk).' },
      { step: 'Insulin initiation', detail: 'When HbA1c >10%, FPG >300, or symptoms. Start basal insulin (glargine/degludec). Titrate by 2 units q3 days to FBG 80-130.' },
      { step: 'Basal-bolus if needed', detail: 'Add prandial rapid-acting insulin. Correction factor = 1800/TDD. Carb ratio = 500/TDD.' },
    ],
    keyPoints: ['SGLT2i: canagliflozin, empagliflozin → CV + renal benefits, ↓ HF hospitalization', 'GLP-1 RA: weight loss + CV benefit (semaglutide)', 'Metformin: hold if eGFR <30, caution 30-45', 'Screen for complications: retinopathy, neuropathy, nephropathy annually', 'Statin for all >40 yo with DM'] },
  { id: 'asthma', title: 'Asthma Stepwise Management', cat: 'Pulmonology', year: '2024',
    summary: 'GINA 2024: As-needed ICS-formoterol preferred track. Step up treatment based on symptom control.',
    steps: [
      { step: 'Step 1: Mild intermittent', detail: 'PRN low-dose ICS-formoterol (preferred) OR PRN SABA (alternative, less preferred).' },
      { step: 'Step 2: Mild persistent', detail: 'Low-dose ICS-formoterol PRN (maintenance and reliever). OR daily low-dose ICS + PRN SABA.' },
      { step: 'Step 3: Moderate', detail: 'Low-dose ICS-formoterol maintenance and reliever (MART). OR medium-dose ICS + PRN SABA.' },
      { step: 'Step 4: Moderate-severe', detail: 'Medium-dose ICS-formoterol MART. Consider adding LAMA (tiotropium) if uncontrolled.' },
      { step: 'Step 5: Severe', detail: 'High-dose ICS-LABA + LAMA. Refer for phenotyping: add biologic (omalizumab, mepolizumab, dupilumab) based on phenotype. Low-dose OCS last resort.' },
    ],
    keyPoints: ['SABA-only treatment no longer recommended as sole therapy', 'ICS-formoterol PRN is new paradigm (GINA Track 1)', 'Assess inhaler technique before stepping up', 'All patients need written action plan', 'Step down after 3 months of good control'] },
  { id: 'acs', title: 'Acute Coronary Syndrome', cat: 'Cardiology', year: '2024',
    summary: 'STEMI → emergent PCI within 90 min (or fibrinolysis within 30 min if PCI unavailable). NSTEMI → risk stratify with GRACE score.',
    steps: [
      { step: 'Initial management (MONA-B)', detail: 'Morphine (if pain persists), O₂ (if SpO₂ <90%), Nitroglycerin SL (unless RV infarct/hypotension), Aspirin 325 mg, Beta-blocker (if no contraindication).' },
      { step: 'STEMI: Reperfusion', detail: 'PCI (preferred) within 90 min door-to-balloon. If no cath lab → fibrinolysis (tPA/tenecteplase) within 30 min of arrival.' },
      { step: 'NSTEMI: Risk stratify', detail: 'GRACE score. High risk → early invasive (cath within 24h). Moderate → cath within 72h. Low risk → conservative.' },
      { step: 'Antiplatelet therapy', detail: 'DAPT: Aspirin + P2Y12 inhibitor (ticagrelor preferred, or clopidogrel). Load: ticagrelor 180 mg, clopidogrel 600 mg.' },
      { step: 'Anticoagulation', detail: 'UFH (during PCI) or enoxaparin (if conservative). Fondaparinux for NSTEMI if conservative strategy.' },
      { step: 'Secondary prevention', detail: 'DAPT 12 months, high-intensity statin, ACEi/ARB, beta-blocker. Cardiac rehab. Smoking cessation.' },
    ],
    keyPoints: ['ECG within 10 minutes of arrival', 'Troponin at 0h and 3h (or 0/1h with hs-troponin)', 'RV infarct: avoid nitrates and diuretics → give fluids', 'Complete revascularization preferred over culprit-only', 'Killip class for prognostication'] },
  { id: 'sepsis', title: 'Sepsis & Septic Shock (Hour-1 Bundle)', cat: 'Critical Care', year: '2024',
    summary: 'Surviving Sepsis Campaign: 1-hour bundle for early aggressive management. qSOFA + SOFA for identification.',
    steps: [
      { step: 'Identify sepsis', detail: 'Suspected infection + SOFA ≥2 above baseline. qSOFA (RR ≥22, SBP ≤100, altered mentation) for screening outside ICU.' },
      { step: 'Measure lactate', detail: 'If lactate >2 mmol/L → resuscitate aggressively. Re-measure in 2-4h. Aim for lactate clearance ≥20%.' },
      { step: 'Blood cultures before antibiotics', detail: 'At least 2 sets (aerobic + anaerobic) from different sites. Do NOT delay antibiotics for cultures.' },
      { step: 'Broad-spectrum antibiotics within 1 hour', detail: 'Empiric coverage based on source. De-escalate based on cultures at 48-72h. Duration typically 7-10 days.' },
      { step: 'Fluid resuscitation', detail: '30 mL/kg crystalloid (balanced preferred) within 3 hours. Reassess fluid responsiveness (passive leg raise, pulse pressure variation).' },
      { step: 'Vasopressors if MAP <65', detail: 'Norepinephrine first-line (target MAP ≥65). Add vasopressin if NE >0.25-0.5 mcg/kg/min. Stress-dose hydrocortisone if refractory shock.' },
    ],
    keyPoints: ['Every hour delay in antibiotics increases mortality 7.6%', 'Balanced crystalloids (LR/Plasmalyte) preferred over NS', 'Avoid albumin routinely — no mortality benefit vs crystalloid', 'Procalcitonin can guide antibiotic duration', 'Source control (drain abscess, remove infected devices) is critical'] },
  { id: 'cad_prevention', title: 'Cardiovascular Prevention', cat: 'Cardiology', year: '2024',
    summary: 'ACC/AHA: Use ASCVD risk calculator. Statin therapy based on 10-year risk plus risk enhancers.',
    steps: [
      { step: 'Risk assessment', detail: 'Pooled Cohort Equation for 10-year ASCVD risk (40-79 yo). Low <5%, borderline 5-7.5%, intermediate 7.5-20%, high >20%.' },
      { step: 'Risk enhancers', detail: 'Family history premature ASCVD, LDL ≥160, metabolic syndrome, CKD, inflammatory conditions, South Asian ancestry, preeclampsia, early menopause.' },
      { step: 'Statin intensity', detail: 'High-intensity: ASCVD history, LDL ≥190, DM + high risk. Moderate: DM + no enhancers, risk 7.5-20%. Low risk: lifestyle optimization.' },
      { step: 'Additional therapies', detail: 'If LDL still >70 on max statin (ASCVD patients): add ezetimibe. If still not at goal: PCSK9 inhibitor (evolocumab/alirocumab).' },
      { step: 'CAC scoring', detail: 'Coronary artery calcium score for intermediate risk (7.5-20%). CAC 0 = favorable risk → defer statin. CAC ≥100 or ≥75th percentile → initiate statin.' },
    ],
    keyPoints: ['Aspirin for secondary prevention only (USPSTF 2022 — no longer routine for primary)', 'Icosapent ethyl (EPA) for triglycerides ≥150 + ASCVD or diabetes + ≥2 risk factors', 'BP target <130/80 for CV risk reduction', 'HbA1c <7% for DM; SGLT2i/GLP-1 RA prioritized if ASCVD'] },
];

export default function ClinicalGuidelinesView() {
  const [search, setSearch] = useState('');
  const [activeId, setActiveId] = useState(null);
  const active = CLINICAL_GUIDELINES.find(g => g.id === activeId);
  const filtered = CLINICAL_GUIDELINES.filter(g => !search || (g.title + g.cat + g.summary).toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2">📋 Clinical Guidelines</h2>
        <p className="text-xs opacity-40 mt-0.5">Evidence-based management protocols</p>
        {!active && (
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search guidelines…"
            className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none mt-3"
            style={{ background: 'var(--surface,var(--card))', border: '1px solid var(--border)' }} />
        )}
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {active ? (
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveId(null)} className="glass w-9 h-9 rounded-xl flex items-center justify-center"><ChevronLeft size={16} /></button>
              <div>
                <h2 className="font-black">{active.title}</h2>
                <p className="text-xs opacity-40">{active.cat} · Updated {active.year}</p>
              </div>
            </div>
            <div className="glass rounded-2xl p-4" style={{ border: '1px solid var(--accent)/20', background: 'var(--accent)/05' }}>
              <p className="text-sm font-bold leading-relaxed">{active.summary}</p>
            </div>

            {/* Stepwise algorithm */}
            <div className="space-y-0">
              {active.steps.map((s, i) => (
                <div key={i} className="flex gap-4">
                  <div className="flex flex-col items-center shrink-0">
                    <div className="w-8 h-8 rounded-xl flex items-center justify-center text-xs font-black"
                      style={{ background: 'var(--accent)', color: '#fff' }}>{i + 1}</div>
                    {i < active.steps.length - 1 && <div className="w-0.5 flex-1 my-1" style={{ background: 'var(--accent)/30' }} />}
                  </div>
                  <div className="flex-1 pb-4">
                    <h3 className="font-black text-sm">{s.step}</h3>
                    <p className="text-xs opacity-60 leading-relaxed mt-1">{s.detail}</p>
                  </div>
                </div>
              ))}
            </div>

            {/* Key points */}
            <div className="glass rounded-2xl p-5" style={{ border: '1px solid #f59e0b20', background: '#f59e0b05' }}>
              <h3 className="font-black text-sm flex items-center gap-2 mb-3" style={{ color: '#f59e0b' }}>💡 Key Points</h3>
              <div className="space-y-2">
                {active.keyPoints.map((kp, i) => (
                  <div key={i} className="flex gap-2 text-xs">
                    <span style={{ color: '#f59e0b' }}>▸</span>
                    <span className="opacity-70 leading-relaxed">{kp}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          filtered.map(g => (
            <button key={g.id} onClick={() => setActiveId(g.id)}
              className="w-full glass rounded-2xl p-5 text-left transition-all card-hover"
              style={{ border: '1px solid var(--border)' }}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-black">{g.title}</h3>
                <span className="px-2 py-0.5 rounded-lg text-xs font-black shrink-0" style={{ background: 'var(--accent)/10', color: 'var(--accent)' }}>{g.cat}</span>
              </div>
              <p className="text-xs opacity-60 leading-relaxed line-clamp-2">{g.summary}</p>
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs opacity-30">{g.steps.length} steps</span>
                <span className="text-xs opacity-30">·</span>
                <span className="text-xs opacity-30">{g.year}</span>
              </div>
            </button>
          ))
        )}
        {!active && filtered.length === 0 && <div className="empty-state py-12"><p className="font-black mt-4">No guidelines found</p></div>}
      </div>
    </div>
  );
}
