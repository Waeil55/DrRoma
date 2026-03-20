import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const ICU_PROTOCOLS = [
  { id: 'vent', title: 'Mechanical Ventilation', cat: 'Respiratory', icon: '',
    sections: [
      { heading: 'Initial Settings (Volume Control)',
        content: [
          'Tidal Volume: 6-8 mL/kg IDEAL body weight (IBW)',
          'IBW (male): 50 + 2.3 × (height in inches – 60)',
          'IBW (female): 45.5 + 2.3 × (height in inches – 60)',
          'RR: 14-18/min (adjust for pH target)',
          'FiO₂: Start 100% → wean rapidly to keep SpO₂ 92-96%',
          'PEEP: Start 5 cmH₂O, ↑ by 2 for refractory hypoxemia',
          'I:E ratio: 1:2 (default)',
        ]},
      { heading: 'ARDS Protocol (ARDSNet)',
        content: [
          'Low tidal volume ventilation: 6 mL/kg IBW (MUST)',
          'Plateau pressure target: <30 cmH₂O',
          'PEEP/FiO₂ table: Higher PEEP for severe ARDS',
          'Permissive hypercapnia acceptable (pH >7.20)',
          'Prone positioning if P/F <150 (16 hrs/day)',
          'Consider neuromuscular blockade first 48h if P/F <150',
          'Conservative fluid strategy after initial resuscitation',
          'Driving pressure = Plateau – PEEP, keep <15 cmH₂O',
        ]},
      { heading: 'Weaning / Liberation',
        content: [
          'Daily spontaneous awakening trial (SAT) + spontaneous breathing trial (SBT)',
          'SBT criteria: FiO₂ ≤40%, PEEP ≤8, SpO₂ ≥90%, hemodynamically stable, able to initiate breaths',
          'SBT methods: T-piece or PSV 5-8/PEEP 5 for 30-120 min',
          'RSBI (Rapid Shallow Breathing Index) = RR/TV: <105 predicts successful extubation',
          'Cuff leak test if prolonged intubation (>7 days) or high risk for post-extubation stridor',
          'Failure criteria: RR >35, SpO₂ <90%, HR change >20%, accessory muscle use, agitation',
        ]},
      { heading: 'Troubleshooting (DOPES)',
        content: [
          'D — Displacement (tube displaced/migration)',
          'O — Obstruction (secretions, kink, biting)',
          'P — Pneumothorax',
          'E — Equipment failure (disconnect, O₂ supply)',
          'S — Stacking (breath stacking / auto-PEEP)',
          'If desaturating: disconnect from vent → BVM with 100% O₂ → systematic assessment',
        ]},
    ]},
  { id: 'shock', title: 'Shock Management', cat: 'Hemodynamics', icon: '',
    sections: [
      { heading: 'Classification of Shock',
        content: [
          'Hypovolemic: ↓ preload (hemorrhage, dehydration) → tachycardia, ↓ CVP, cool/pale',
          'Cardiogenic: ↓ pump function (MI, valve) → ↑ CVP, ↑ PCWP, cool, pulmonary edema',
          'Distributive: ↓ SVR (sepsis, anaphylaxis, neurogenic) → warm initially, ↓ SVR, ↑ CO',
          'Obstructive: mechanical obstruction (PE, tamponade, tension PTX) → ↑ CVP, ↓ CO',
        ]},
      { heading: 'Vasopressors & Inotropes',
        content: [
          'Norepinephrine (Levophed): 1st line for septic shock. α₁ >> β₁. Start 0.1 mcg/kg/min, titrate to MAP ≥65.',
          'Vasopressin: 2nd line, add at 0.04 units/min (fixed dose). Reduces NE requirement. Use early.',
          'Epinephrine: Anaphylaxis (0.3-0.5 mg IM), cardiac arrest, refractory shock. β₁ + β₂ + α₁.',
          'Dobutamine: Inotrope for cardiogenic shock (↑ contractility). β₁ agonist. 2-20 mcg/kg/min.',
          'Phenylephrine: Pure α₁ (vasoconstriction only). For neurogenic shock or reflex tachycardia.',
          'Milrinone: PDE-3 inhibitor. Inodilator (↑ contractility + vasodilation). Right heart failure.',
          'Dopamine: Dose-dependent: <5 (renal), 5-10 (β₁ inotropic), >10 (α₁ pressor). More arrhythmias than NE.',
        ]},
      { heading: 'Fluid Resuscitation',
        content: [
          'Balanced crystalloids (Lactated Ringer, Plasmalyte) preferred over 0.9% NS',
          'Sepsis: 30 mL/kg bolus within 3 hours',
          'Hemorrhagic: massive transfusion protocol (1:1:1 pRBC:FFP:Plt)',
          'Fluid responsiveness: passive leg raise, pulse pressure variation >12%, IVC collapsibility >50%',
          'Albumin: consider in sepsis after ≥30 mL/kg crystalloid (no mortality benefit but may reduce volume)',
          'Avoid hydroxyethyl starch (HES) → renal injury',
        ]},
      { heading: 'Hemodynamic Parameters',
        content: [
          'MAP target: ≥65 mmHg (higher 75-80 if chronic HTN)',
          'CVP: 8-12 mmHg (limited value, trending more useful than absolute)',
          'ScvO₂: ≥70% (below suggests inadequate O₂ delivery)',
          'Lactate: goal clearance ≥20% in 2 hours (marker of tissue perfusion)',
          'Cardiac index: normal 2.5-4.0 L/min/m²',
          'SVR: 800-1200 dynes·sec/cm⁵ (low in distributive, high in cardiogenic)',
        ]},
    ]},
  { id: 'sedation', title: 'ICU Sedation & Analgesia', cat: 'Neurology', icon: '',
    sections: [
      { heading: 'Pain-First Approach (eCASH)',
        content: [
          'Early Comfort using Analgesia, minimal Sedation, and maximal Humane care',
          'Assess pain FIRST: BPS (Behavioral Pain Scale) or CPOT in intubated patients',
          'Target light sedation: RASS 0 to -2 (unless specific indication for deeper)',
          'Daily sedation interruption (SAT) improves outcomes',
        ]},
      { heading: 'Analgesics',
        content: [
          'Fentanyl: 25-100 mcg/hr IV infusion. Fast onset, short duration. No active metabolites.',
          'Hydromorphone: 0.5-3 mg IV Q3-4h PRN. Alternative to fentanyl.',
          'Acetaminophen: 1g Q6h scheduled (↓ opioid requirement by 30%)',
          'Ketamine: 0.1-0.5 mg/kg/hr (sub-dissociative). Opioid-sparing. Good for burns/trauma.',
          'Gabapentin/pregabalin: neuropathic pain, ↓ opioid requirement',
        ]},
      { heading: 'Sedatives',
        content: [
          'Propofol: 5-50 mcg/kg/min. Fast onset/offset. ↓ ICP. Monitor for PRIS (propofol infusion syndrome) with high doses >48h.',
          'Dexmedetomidine (Precedex): 0.2-1.5 mcg/kg/hr. α₂ agonist. Cooperative sedation (arousable). ↓ delirium. No resp depression.',
          'Midazolam: 1-5 mg/hr. BZD — prolongs MV duration, ↑ delirium. Avoid if possible.',
          'PRIS signs: metabolic acidosis, rhabdomyolysis, hyperkalemia, lipemic serum, cardiac failure',
        ]},
      { heading: 'Delirium Management',
        content: [
          'Screen with CAM-ICU or ICDSC every shift',
          'Prevention: ABCDEF bundle (Assess pain, Both SAT/SBT, Choice of sedation, Delirium screening, Early mobility, Family engagement)',
          'Non-pharmacologic first: reorient, sleep hygiene, mobilize, remove restraints, hearing aids/glasses',
          'Pharmacologic: Haloperidol (no evidence for prevention). Dexmedetomidine may ↓ delirium duration.',
          'Avoid benzodiazepines (strongest risk factor for delirium)',
          'Risk factors: age >65, dementia, severity of illness, BZD use, immobility, sleep deprivation',
        ]},
    ]},
  { id: 'codes', title: 'Cardiac Arrest / ACLS', cat: 'Emergency', icon: '',
    sections: [
      { heading: 'Shockable Rhythms (VF / pVT)',
        content: [
          'Defibrillate immediately (biphasic 120-200J)',
          'Resume CPR × 2 min → rhythm check',
          'Epinephrine 1 mg IV Q3-5 min (after 2nd shock)',
          'Amiodarone: 300 mg after 3rd shock, then 150 mg (can repeat ×1)',
          'Consider: H\'s and T\'s for reversible causes',
          'Good quality CPR: rate 100-120, depth 5-6 cm, full recoil, minimize interruptions',
        ]},
      { heading: 'Non-Shockable Rhythms (PEA / Asystole)',
        content: [
          'CPR immediately (no shock)',
          'Epinephrine 1 mg IV ASAP (then Q3-5 min)',
          'No defibrillation, no amiodarone',
          'Focus on reversible causes (H\'s and T\'s)',
          'Asystole: confirm in 2 leads, check connections',
          'PEA: organized rhythm without pulse — wide DDx',
        ]},
      { heading: 'H\'s and T\'s (Reversible Causes)',
        content: [
          'Hypovolemia → volume',
          'Hypoxia → oxygenate/ventilate',
          'Hydrogen ion (acidosis) → bicarb if severe',
          'Hypo/Hyperkalemia → correct K⁺',
          'Hypothermia → warm',
          'Tension pneumothorax → needle decompression',
          'Tamponade → pericardiocentesis',
          'Toxins → specific antidote',
          'Thrombosis (coronary) → PCI',
          'Thrombosis (pulmonary) → tPA (50 mg bolus if massive PE arrest)',
        ]},
      { heading: 'Post-Cardiac Arrest Care',
        content: [
          'Targeted temperature management (TTM): 32-36°C × 24h',
          'Avoid hyperthermia (>37.5°C) for 72h',
          'MAP ≥65 (often need vasopressors)',
          'PCI if STEMI on post-ROSC ECG',
          'Neuroprognostication: wait ≥72h. Use: pupillary reactivity, SSEP, EEG, neuroimaging, NSE',
          'Avoid premature prognostication — sedation/hypothermia confound exam',
        ]},
    ]},
];

export default function CriticalCareProtocolsView() {
  const [activeId, setActiveId] = useState(null);
  const active = ICU_PROTOCOLS.find(p => p.id === activeId);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2"> Critical Care Protocols</h2>
        <p className="text-xs opacity-40 mt-0.5">ICU management references</p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {active ? (
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveId(null)} className="glass w-9 h-9 rounded-xl flex items-center justify-center"><ChevronLeft size={16} /></button>
              <h2 className="font-black">{active.icon} {active.title}</h2>
            </div>
            {active.sections.map((sec, si) => (
              <div key={si} className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
                <h3 className="font-black text-sm flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: 'var(--accent)', color: '#fff' }}>{si + 1}</span>
                  {sec.heading}
                </h3>
                <div className="space-y-1.5">
                  {sec.content.map((line, li) => (
                    <div key={li} className="flex items-start gap-2 text-xs py-0.5">
                      <span className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }}>▸</span>
                      <span className="opacity-70 leading-relaxed">{line}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ICU_PROTOCOLS.map(p => (
              <button key={p.id} onClick={() => setActiveId(p.id)}
                className="glass rounded-2xl p-5 text-left transition-all card-hover"
                style={{ border: '1px solid var(--border)' }}>
                <div className="text-3xl mb-2">{p.icon}</div>
                <h3 className="font-black">{p.title}</h3>
                <p className="text-xs opacity-40 mt-1">{p.cat} · {p.sections.length} sections</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
