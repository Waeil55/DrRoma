import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const GERI_TOOLS = [
  { id: 'falls', title: 'Falls Risk (Timed Up & Go)', icon: '🦽',
    description: 'Patient rises from chair, walks 3 meters, turns, walks back, sits down.',
    scoring: [
      { range: '<10 seconds', cat: 'Normal', color: '#10b981' },
      { range: '10-19 seconds', cat: 'Mostly independent', color: '#22c55e' },
      { range: '20-29 seconds', cat: 'Variable mobility', color: '#f59e0b' },
      { range: '≥30 seconds', cat: 'Impaired mobility — fall risk', color: '#ef4444' },
    ],
    interventions: ['Home safety evaluation (grab bars, lighting, rugs)', 'Exercise program (Tai Chi, balance training)', 'Medication review — ↓ sedatives, orthostatic-causing agents', 'Vision correction', 'Vitamin D supplementation (800-1000 IU/day)', 'Assistive devices (cane, walker)', 'Annual fall risk screening for ≥65 years'] },
  { id: 'mmse', title: 'Cognitive Screening', icon: '🧠',
    description: 'Mini-Mental State Exam (MMSE) — global cognitive function screen.',
    scoring: [
      { range: '24-30', cat: 'Normal', color: '#10b981' },
      { range: '20-23', cat: 'Mild cognitive impairment', color: '#f59e0b' },
      { range: '10-19', cat: 'Moderate dementia', color: '#f97316' },
      { range: '<10', cat: 'Severe dementia', color: '#ef4444' },
    ],
    interventions: ['MMSE components: Orientation (10), Registration (3), Attention/Calculation (5), Recall (3), Language (8), Visuospatial (1) = 30 total', 'Alternative: MoCA (Montreal Cognitive Assessment) — more sensitive for MCI, add 1 point if education ≤12 years', 'If abnormal: check reversible causes — B12, TSH, RPR, HIV, depression (pseudodementia), medications, delirium', 'Imaging: MRI preferred (hippocampal atrophy in Alzheimer). CT if MRI contraindicated.', 'Refer to neurology/geriatrics for comprehensive evaluation'] },
  { id: 'adl', title: 'Functional Assessment (ADLs/IADLs)', icon: '🏠',
    description: 'Activities of Daily Living measure functional independence.',
    scoring: [
      { range: 'ADLs (Katz Index)', cat: 'Basic self-care: Bathing, Dressing, Toileting, Transferring, Continence, Feeding', color: 'var(--accent)' },
      { range: 'IADLs (Lawton Scale)', cat: 'Complex tasks: Shopping, Cooking, Housework, Laundry, Transportation, Medications, Finances, Phone use', color: '#8b5cf6' },
    ],
    interventions: ['ADL dependence → need for personal care assistance', 'IADL decline often earliest sign of cognitive impairment', 'Katz Index: score 0 (dependent) to 6 (independent) for each of 6 ADLs', 'Lawton Scale: score 0-8 (higher = more independent) for 8 IADLs', 'Functional decline: assess for delirium, depression, pain, deconditioning', 'Occupational therapy referral for ADL optimization', 'Consider level of care needed: home with support → assisted living → skilled nursing'] },
  { id: 'delirium', title: 'Delirium (CAM)', icon: '⚡',
    description: 'Confusion Assessment Method — gold standard for delirium screening. Requires ALL of Feature 1 and 2, PLUS either 3 or 4.',
    scoring: [
      { range: 'Feature 1', cat: 'Acute onset AND fluctuating course (REQUIRED)', color: '#ef4444' },
      { range: 'Feature 2', cat: 'Inattention — difficulty focusing, maintaining, shifting attention (REQUIRED)', color: '#ef4444' },
      { range: 'Feature 3', cat: 'Disorganized thinking — rambling, illogical, incoherent', color: '#f59e0b' },
      { range: 'Feature 4', cat: 'Altered level of consciousness — hyperalert, lethargic, stuporous, comatose', color: '#f59e0b' },
    ],
    interventions: ['CAM+: Features 1 + 2 + (3 or 4) = DELIRIUM', 'Delirium workup: infection (UA, CXR, blood cultures), metabolic (BMP, LFTs, TSH), medications (anticholinergics, opioids, sedatives), urinary retention, fecal impaction, pain', 'Treat underlying cause — delirium is a SYMPTOM, not a diagnosis', 'Non-pharmacologic: reorientation, sleep hygiene, early mobilization, hearing aids/glasses, minimize tethers (catheters, restraints)', 'Pharmacologic ONLY if agitation is a safety risk: haloperidol 0.5-1 mg IV/IM (avoid in Parkinson, QTc prolongation)', 'Avoid benzodiazepines (worsen delirium) EXCEPT in alcohol/BZD withdrawal'] },
  { id: 'poly', title: 'Polypharmacy', icon: '💊',
    description: 'Using ≥5 medications. Common in elderly. Increases risk of adverse drug events, drug interactions, falls, and functional decline.',
    scoring: [
      { range: '0-4 medications', cat: 'Normal', color: '#10b981' },
      { range: '5-9 medications', cat: 'Polypharmacy', color: '#f59e0b' },
      { range: '≥10 medications', cat: 'Excessive polypharmacy', color: '#ef4444' },
    ],
    interventions: ['Beers Criteria: list of potentially inappropriate medications (PIMs) for elderly', 'STOPP/START criteria: screening tool for potentially inappropriate prescribing', 'Key PIMs to avoid: long-acting BZDs, anticholinergics (diphenhydramine, oxybutynin), NSAIDs (long-term), sliding scale insulin', 'Deprescribing: systematic reduction. Prioritize: (1) identify PIMs, (2) assess risk/benefit, (3) taper plan, (4) monitor', 'Anticholinergic burden: cumulative effect of multiple anticholinergic meds → confusion, falls, urinary retention, constipation', '"Start low, go slow" — lower starting doses, slower titration in elderly'] },
];

function GeriatricAssessmentView() {
  const [activeId, setActiveId] = useState(null);
  const active = GERI_TOOLS.find(t => t.id === activeId);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2">👴 Geriatric Assessment</h2>
        <p className="text-xs opacity-40 mt-0.5">Comprehensive assessment tools for elderly care</p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {active ? (
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveId(null)} className="glass w-9 h-9 rounded-xl flex items-center justify-center"><ChevronLeft size={16} /></button>
              <div>
                <h2 className="font-black">{active.icon} {active.title}</h2>
                <p className="text-xs opacity-40 mt-0.5 leading-relaxed">{active.description}</p>
              </div>
            </div>
            <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
              <h3 className="font-black text-sm mb-3">Scoring / Criteria</h3>
              {active.scoring.map((s, i) => (
                <div key={i} className="flex items-start gap-3 py-2">
                  <span className="w-2 h-2 rounded-full mt-1.5 shrink-0" style={{ background: s.color }}></span>
                  <div>
                    <span className="font-black text-sm" style={{ color: s.color }}>{s.range}</span>
                    <span className="text-xs opacity-60 ml-2">{s.cat}</span>
                  </div>
                </div>
              ))}
            </div>
            <div className="glass rounded-2xl p-5" style={{ border: '1px solid #10b98120', background: '#10b98105' }}>
              <h3 className="font-black text-sm mb-3" style={{ color: '#10b981' }}>💊 Management / Interventions</h3>
              {active.interventions.map((item, i) => (
                <div key={i} className="flex items-start gap-2 text-xs py-0.5">
                  <span className="shrink-0 mt-0.5" style={{ color: '#10b981' }}>▸</span>
                  <span className="opacity-70 leading-relaxed">{item}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {GERI_TOOLS.map(t => (
              <button key={t.id} onClick={() => setActiveId(t.id)}
                className="glass rounded-2xl p-5 text-left transition-all card-hover"
                style={{ border: '1px solid var(--border)' }}>
                <div className="text-3xl mb-2">{t.icon}</div>
                <h3 className="font-black">{t.title}</h3>
                <p className="text-xs opacity-40 mt-1 line-clamp-2">{t.description}</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default GeriatricAssessmentView;
