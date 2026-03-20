import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const CARDIO_SECTIONS = [
  { id: 'acs', title: 'Acute Coronary Syndrome', icon: '',
    items: [
      { term: 'STEMI', def: 'Complete coronary occlusion  transmural ischemia. ST elevation 1 mm in 2 contiguous leads (2 mm in V1-V3 in men). New LBBB with suspicious symptoms. Door-to-balloon <90 min (PCI) or door-to-needle <30 min (fibrinolysis if PCI not available within 120 min).', detail: 'Localization: Anterior (LAD): V1-V4. Inferior (RCA): II, III, aVF  check right-sided leads (V4R) for RV infarct. Lateral (LCx): I, aVL, V5-V6. Posterior: ST depression V1-V3 + tall R waves (get V7-V9 for ST elevation).', pearl: 'STEMI management: Aspirin 325 mg chewed + P2Y12 inhibitor (ticagrelor or prasugrel for PCI, clopidogrel if fibrinolysis). Anticoagulation (heparin). PCI: drug-eluting stent preferred. Post-STEMI: DAPT (ASA + P2Y12  12 months), high-intensity statin, beta-blocker, ACEi/ARB, eplerenone (if EF 40% or HF/DM). RV infarct: volume-dependent  give fluids, AVOID nitroglycerin and diuretics (preload-dependent).' },
      { term: 'NSTEMI / UA', def: 'NSTEMI: elevated troponin with ischemic symptoms  ST depression/T-wave inversion. UA: ischemic symptoms without troponin rise. Both = partial occlusion / demand ischemia. Risk-stratify with TIMI or GRACE score.', detail: 'Management: anti-ischemic therapy (beta-blocker, NTG), antiplatelet (ASA + P2Y12), anticoagulation. Early invasive strategy (<24h catheterization) for high-risk features:  troponin, ST changes, GRACE >140, hemodynamic instability, recurrent symptoms. Otherwise ischemia-guided approach acceptable.', pearl: 'Type 2 MI: supply-demand mismatch (tachycardia, sepsis, hypotension, anemia, respiratory failure)  troponin elevated but not from plaque rupture. Treat underlying cause, NOT with antiplatelet/anticoagulation as primary therapy. High-sensitivity troponin decision pathways: 0/1h or 0/3h algorithms  rapid rule-in/rule-out using serial troponin measurements (ESC guidelines).' },
    ]},
  { id: 'arrhythmia', title: 'Arrhythmias', icon: '',
    items: [
      { term: 'Atrial Fibrillation', def: 'Irregularly irregular. No P waves, fibrillatory baseline. Most common sustained arrhythmia. Risk factors: age, HTN, HF, valvular disease, obesity, OSA, alcohol, hyperthyroidism, post-cardiac surgery.', detail: 'Management: (1) Rate vs rhythm control. Rate control preferred for most: beta-blocker (metoprolol) or CCB (diltiazem). Digoxin add-on for HF. Target HR <110 (RACE II). (2) Rhythm control: cardioversion (electrical or pharmacologic with amiodarone, flecainide, ibutilide), catheter ablation (PVI  pulmonary vein isolation) for symptomatic/refractory.', pearl: 'Anticoagulation: CHADS-VASc 2 men / 3 women  DOAC (apixaban, rivaroxaban, edoxaban, dabigatran). Score 1 men / 2 women  consider. 0  no anticoagulation. Pre-cardioversion: if AF >48h or unknown duration  either 3 weeks anticoagulation OR TEE to exclude LA thrombus, then cardiovert + continue anticoagulation 4 weeks post. EAST-AFNET 4 trial: early rhythm control in those diagnosed within 1 year  reduced CV events.' },
      { term: 'Ventricular Arrhythmias', def: 'VTach: 3 consecutive ventricular complexes 100 bpm. Sustained (>30s or hemodynamic instability). Monomorphic (one morphology  often structural heart disease/scar). Polymorphic: changing QRS morphology.', detail: 'Stable monomorphic VT: amiodarone IV or synchronized cardioversion. Unstable VT or VFib: immediate defibrillation + ACLS. Torsades de Pointes (TdP): polymorphic VT with QT prolongation. Treatment: IV magnesium 2g, overdrive pacing, isoproterenol. STOP offending drug. QT-prolonging drugs: antiarrhythmics (sotalol, dofetilide, amiodarone), antibiotics (macrolides, fluoroquinolones), antipsychotics, methadone.', pearl: 'ICD (Implantable Cardioverter-Defibrillator) indications: (1) Secondary prevention: survived cardiac arrest or sustained VT with hemodynamic compromise. (2) Primary prevention: EF 35% despite 3 months optimal medical therapy (NYHA II-III, ischemic  SCD-HeFT, MADIT-II), or EF 30% ischemic (MADIT). Must be >40 days post-MI and >90 days post-revascularization. Wearable defibrillator (LifeVest): bridge when ICD timing criteria not yet met.' },
      { term: 'Bradyarrhythmias & Heart Block', def: 'Sinus bradycardia: rate <60 bpm. 1st-degree AV block: PR >200 ms (benign). 2nd-degree Type I (Wenckebach): progressive PR prolongation  dropped beat (usually benign). 2nd-degree Type II (Mobitz II): sudden dropped beat without PR prolongation (infra-nodal, more serious). 3rd-degree (complete): AV dissociation.', detail: 'Pacemaker indications: symptomatic sinus node dysfunction (SSS), Mobitz Type II, 3rd-degree AV block, alternating bundle branch block, symptomatic chronotropic incompetence. Temporary pacing: atropine first (for symptomatic bradycardia), transcutaneous pacing if atropine fails, transvenous pacing for sustained.', pearl: 'High-degree AV block post-inferior STEMI: usually transient (AV node supplied by RCA), observe with temporary pacer for 5-7 days before permanent pacemaker. Post-anterior STEMI: more ominous (infra-nodal, both bundle branches at risk), earlier permanent pacer consideration. Drug causes: beta-blockers, CCBs, digoxin, amiodarone  often reversible by stopping the drug.' },
    ]},
  { id: 'hf', title: 'Heart Failure', icon: '',
    items: [
      { term: 'HFrEF (EF 40%)', def: 'Neurohormonal activation (RAAS, sympathetic). Four pillars of GDMT (Guideline-Directed Medical Therapy): ACEi/ARB/ARNI + beta-blocker + MRA + SGLT2i. Start simultaneously or in rapid sequence.', detail: 'ACEi/ARB/ARNI: sacubitril-valsartan (Entresto) preferred over ACEi/ARB (PARADIGM-HF: 20%  mortality). Beta-blocker: carvedilol, metoprolol succinate, bisoprolol (only these 3 have mortality benefit). MRA: spironolactone or eplerenone (RALES, EMPHASIS-HF  monitor K, Cr). SGLT2i: dapagliflozin or empagliflozin (DAPA-HF, EMPEROR-Reduced  benefit regardless of diabetes status).', pearl: 'Titrate GDMT to target doses (most of the mortality benefit is at target dose): Entresto 97/103 mg BID, carvedilol 25 mg BID (50 mg BID if >85 kg), metoprolol succinate 200 mg daily, spironolactone 25-50 mg daily, dapa/empa 10 mg daily. Additional therapies: hydralazine + nitrate (A-HeFT  especially Black patients), ivabradine (HR >70 on max beta-blocker), CRT (EF 35% + LBBB 150 ms), ICD (EF 35% for primary prevention). Diuretics for congestion (improve symptoms, not mortality).' },
      { term: 'HFpEF (EF 50%)', def: 'Diastolic dysfunction with preserved ejection fraction. >50% of HF. Associated with age, HTN, obesity, diabetes, AF, female sex. HFPEF score or HFA-PEFF algorithm for diagnosis.', detail: 'Diagnosis: symptoms of HF + EF 50% + evidence of diastolic dysfunction (elevated filling pressures:  E/e\',  LA volume,  TR velocity on echo) + elevated BNP/NT-proBNP. If inconclusive: exercise hemodynamics (invasive if needed).', pearl: 'Treatment: SGLT2 inhibitors (EMPEROR-Preserved, DELIVER trials  first drugs to show benefit in HFpEF!). Diuretics for congestion. Treat comorbidities aggressively: HTN, AF (rhythm control), obesity (weight loss), diabetes, coronary disease. Manage volume status closely. Finerenone (non-steroidal MRA): FINEARTS-HF trial showed benefit across the EF spectrum. GLP-1 agonists: promising for HFpEF with obesity (STEP-HFpEF with semaglutide  improved symptoms and exercise capacity).' },
    ]},
  { id: 'valve', title: 'Valvular Heart Disease', icon: '',
    items: [
      { term: 'Aortic Stenosis', def: 'Triad: syncope, angina, heart failure (once HF develops, 2-year survival ~50% without intervention). Crescendo-decrescendo systolic murmur at RUSB, radiates to carotids. Pulsus parvus et tardus.', detail: 'Severity: severe = valve area <1.0 cm, mean gradient >40 mmHg, peak velocity >4 m/s. Low-flow low-gradient (EF <50%): dobutamine stress echo to differentiate true-severe from pseudo-severe. Paradoxical low-flow low-gradient (normal EF): small hypertrophied LV, often elderly female with HTN.', pearl: 'Treatment: AVR (surgical or TAVR) for symptomatic severe or asymptomatic severe with EF <50%, progressive decline in exercise tolerance, or very severe (peak velocity >5 m/s). TAVR: preferred for high/prohibitive surgical risk, increasingly used in intermediate risk (PARTNER trials, evolving for low risk). No medical therapy delays progression. AVOID vigorous exercise/vasodilators in severe AS (fixed obstruction  can\'t augment cardiac output  syncope/death).' },
      { term: 'Mitral Regurgitation', def: 'Primary (organic): MVP, rheumatic, endocarditis, radiation. Holosystolic murmur at apex, radiates to axilla. Acute severe: flash pulmonary edema (papillary muscle rupture post-MI, chordae rupture). Secondary (functional): LV dilation pulls leaflets apart (HFrEF).', detail: 'Assessment: echo (regurgitant volume, EROA, vena contracta). Severe: EROA 0.4 cm (primary), 0.2 cm (secondary), regurgitant volume 60 mL. Watch for LA dilation, pulmonary hypertension, AF  thresholds for intervention.', pearl: 'Primary (degenerative) MR: surgical repair preferred over replacement (better outcomes, lower mortality). Refer to experienced center (>95% repair rate). Indications: symptomatic severe, or asymptomatic with EF 60%, LVESD 40 mm, new AF, PHTN >50 mmHg. Secondary (functional) MR: optimize GDMT for HF first. MitraClip (TEER  transcatheter edge-to-edge repair) if remains severe despite optimal medical therapy (COAPT trial: significant mortality benefit if correctly selected).' },
      { term: 'Endocarditis', def: 'Modified Duke criteria. Major: 2 positive blood cultures for typical organism (viridans strep, S. bovis, HACEK, S. aureus, enterococci), positive echo (vegetation, abscess, new dehiscence). Minor: predisposing condition, fever, vascular phenomena (septic emboli, Janeway lesions), immunologic phenomena (Osler nodes, Roth spots, glomerulonephritis), single positive BC.', detail: 'Native valve: S. aureus (#1 in acute, IV drug users  tricuspid), viridans streptococci (subacute). Prosthetic valve early (<60 days): S. aureus, CoNS. Late: same as native. Empiric Rx: vancomycin + gentamicin (native). Vancomycin + gentamicin + rifampin (prosthetic).', pearl: 'Surgical indications: HF from valvular dysfunction, uncontrolled infection despite antibiotics, large vegetation >10 mm with embolic events or mobile, abscess/fistula, prosthetic valve dehiscence, fungal endocarditis. S. bovis bacteremia/endocarditis  colonoscopy (association with colon cancer). IVDU tricuspid endocarditis: can often be managed medically; surgery reserved for persistent sepsis, large vegetations, right HF.' },
    ]},
];

export default function CardiologyGuideView() {
  const [activeId, setActiveId] = useState(null);
  const active = CARDIO_SECTIONS.find(s => s.id === activeId);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2"> Cardiology Guide</h2>
        <p className="text-xs opacity-40 mt-0.5">ACS, arrhythmias, heart failure & valvular disease</p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {active ? (
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveId(null)} className="glass w-9 h-9 rounded-xl flex items-center justify-center"><ChevronLeft size={16} /></button>
              <h2 className="font-black">{active.icon} {active.title}</h2>
            </div>
            {active.items.map((item, i) => (
              <div key={i} className="glass rounded-2xl p-5 space-y-2" style={{ border: '1px solid var(--border)' }}>
                <h3 className="font-black" style={{ color: 'var(--accent)' }}>{item.term}</h3>
                <p className="text-sm opacity-80 leading-relaxed whitespace-pre-line">{item.def}</p>
                {item.detail && <p className="text-xs opacity-50 leading-relaxed">{item.detail}</p>}
                {item.pearl && (
                  <div className="glass rounded-xl p-3 mt-2 flex items-start gap-2 text-xs" style={{ background: '#dc262608', border: '1px solid #dc262620', color: '#dc2626' }}>
                    <span></span><span className="leading-relaxed">{item.pearl}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {CARDIO_SECTIONS.map(s => (
              <button key={s.id} onClick={() => setActiveId(s.id)}
                className="glass rounded-2xl p-5 text-left transition-all card-hover"
                style={{ border: '1px solid var(--border)' }}>
                <div className="text-3xl mb-2">{s.icon}</div>
                <h3 className="font-black">{s.title}</h3>
                <p className="text-xs opacity-40 mt-1">{s.items.length} topics</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
