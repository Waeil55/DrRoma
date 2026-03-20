import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const ABXS_SECTIONS = [
  { id: 'principles', title: 'Stewardship Principles', icon: '',
    items: [
      { term: 'The 5 D\'s of Antimicrobial Stewardship', def: 'Drug, Dose, Duration, De-escalation, Documentation.', detail: 'Right Drug: narrow-spectrum when possible, culture-guided. Right Dose: weight-based, renal/hepatic adjustment, therapeutic drug monitoring. Right Duration: shortest effective course. De-escalation: broadest → narrowest based on culture data. Documentation: clear indication, planned duration, reassessment date.', pearl: '"Start smart, then focus." Broad-spectrum empirically → narrow once cultures return. Document antibiotic indication, planned duration, and review date in the chart. Automatic stop orders for empiric therapy (48-72h reassessment).' },
      { term: 'Spectrum Matching', def: 'Match antibiotic spectrum to the likely pathogen. Avoid unnecessary broad-spectrum coverage.', detail: 'Community-acquired infections: often don\'t need MRSA/Pseudomonas coverage. Hospital-acquired: broader spectrum justified initially. IV-to-PO switch: when clinically improving + functioning GI tract (usually 48-72h).', pearl: 'Common de-escalation examples: Vancomycin → nafcillin (MSSA), Pip-Tazo → ampicillin (Enterococcus), Meropenem → ceftriaxone (susceptible GNR). NEVER continue vancomycin if cultures show MSSA.' },
      { term: 'Antibiotic Timeout', def: 'Structured reassessment at 48-72 hours. Cultures available? Clinical response? Can narrow/stop?', detail: 'Questions to ask: (1) Is there an infection? (2) Is this the right drug? (3) Can I narrow spectrum? (4) Can I switch IV→PO? (5) What is the optimal duration? (6) Can I stop antibiotics?', pearl: 'Procalcitonin can guide antibiotic duration in respiratory infections and sepsis. PCT <0.25 ng/mL or ↓80% from peak → consider stopping antibiotics. Reduces antibiotic exposure without increasing mortality.' },
    ]},
  { id: 'duration', title: 'Recommended Durations', icon: '',
    items: [
      { term: 'Community-Acquired Pneumonia', def: '5 days (minimum). IDSA/ATS 2019 guidelines.', detail: 'Criteria to stop: afebrile ≥48h, no more than 1 sign of instability (HR, RR, BP, O₂, mental status). Longer if: slow response, complications (empyema, abscess), immunocompromised.', pearl: '5 days is sufficient for most CAP — 7-day courses offer no benefit if clinically stable. SHORTER IS BETTER (reduces resistance, C. diff, side effects).' },
      { term: 'Urinary Tract Infection', def: 'Uncomplicated cystitis: 3 days (TMP-SMX) or 5 days (nitrofurantoin). Pyelonephritis: 5-7 days (fluoroquinolone) or 10-14 days (others).', detail: 'Asymptomatic bacteriuria: treat ONLY in pregnancy and pre-urologic procedure. Do NOT treat in elderly, catheterized patients, or diabetics without symptoms.', pearl: 'Most common stewardship error: treating asymptomatic bacteriuria. Positive urine culture WITHOUT symptoms does NOT require antibiotics (exceptions: pregnant, pre-urologic surgery). Pyuria alone is NOT an indication to treat.' },
      { term: 'Skin & Soft Tissue Infection', def: 'Cellulitis: 5 days (can extend if not improved). Abscess: I&D ± antibiotics (small: I&D alone sufficient).', detail: 'Uncomplicated cellulitis: cephalexin or dicloxacillin (NOT MRSA). Purulent (abscess): I&D is primary therapy. Add TMP-SMX or doxycycline for MRSA coverage if needed.', pearl: 'Small abscesses (<2 cm): I&D ALONE is curative — antibiotics add minimal benefit (JAMA 2017 showed some benefit for TMP-SMX after I&D for abscesses). Marking borders of cellulitis helps track response.' },
      { term: 'Bacteremia', def: 'Duration depends on source. Uncomplicated: 7-14 days from first negative culture. S. aureus: minimum 14 days (usually 4-6 weeks).', detail: 'S. aureus bacteremia ALWAYS requires: (1) repeat blood cultures Q48h until negative, (2) echocardiography (TEE preferred), (3) ID consultation, (4) minimum 14 days from first negative culture. "Complicated" SAB: metastatic infection, prosthetic material, endocarditis → 4-6 weeks.', pearl: 'ID consult for S. aureus bacteremia reduces mortality by ~50% (multiple studies). Always consult. Never dismiss a single positive blood culture with S. aureus — it is NEVER a contaminant.' },
    ]},
  { id: 'resistance', title: 'Antimicrobial Resistance', icon: '',
    items: [
      { term: 'MRSA', def: 'Methicillin-Resistant Staphylococcus aureus. mecA gene → altered PBP2a → resistant to ALL beta-lactams (including cephalosporins and carbapenems).', detail: 'Treatment: Vancomycin (trough 15-20 mcg/mL for serious infections), linezolid (oral bioavailability excellent), daptomycin (NOT for pneumonia — inactivated by surfactant), TMP-SMX/doxycycline (for mild SSTI).', pearl: 'Daptomycin: do NOT use for pneumonia (inactivated by pulmonary surfactant). Check CK weekly (rhabdomyolysis risk). Avoid statins during daptomycin therapy. Linezolid: serotonin syndrome with SSRIs, thrombocytopenia after 2 weeks — monitor CBC.' },
      { term: 'ESBL (Extended-Spectrum Beta-Lactamase)', def: 'Enzymes that hydrolyze extended-spectrum cephalosporins (3rd/4th gen) and aztreonam. Most common in E. coli and Klebsiella.', detail: 'Carbapenem is treatment of choice for serious ESBL infections. Alternatives for uncomplicated UTI: nitrofurantoin, TMP-SMX, fosfomycin (if susceptible). Pip-tazo may be acceptable for non-critical ESBL UTI (MERINO trial showed inferiority for bacteremia).', pearl: 'MERINO trial (2018): pip-tazo was INFERIOR to meropenem for ESBL bacteremia (30-day mortality). For serious ESBL infections: use carbapenems. For uncomplicated UTI: check susceptibility — nitrofurantoin often works.' },
      { term: 'CRE (Carbapenem-Resistant Enterobacteriaceae)', def: 'Resistant to carbapenems. Mortality 40-50%. Mechanisms: KPC (most common in US), NDM, OXA-48.', detail: 'Treatment options: ceftazidime-avibactam (KPC), meropenem-vaborbactam, imipenem-relebactam, cefiderocol, polymyxins (last resort — nephro/neurotoxic). Combination therapy recommended for serious infections.', pearl: 'CRE is a CDC "urgent threat." Contact precautions mandatory. ceftazidime-avibactam works for KPC but NOT for MOST metallo-beta-lactamases (NDM, VIM). For NDM: ceftazidime-avibactam + aztreonam combination, or cefiderocol.' },
      { term: 'VRE (Vancomycin-Resistant Enterococcus)', def: 'E. faecium (most VRE) resistant to vancomycin via vanA (high-level) or vanB (variable) genes.', detail: 'Treatment: linezolid (first-line for most), daptomycin (higher doses 8-12 mg/kg for VRE), quinupristin-dalfopristin (only for E. faecium, not faecalis).', pearl: 'VRE colonization is common — don\'t treat colonization, only infections. E. faecalis is intrinsically resistant to quinupristin-dalfopristin. Daptomycin for VRE needs HIGHER doses (8-12 mg/kg) than for MRSA (6 mg/kg).' },
    ]},
];

function AntibioticStewardshipView() {
  const [activeId, setActiveId] = useState(null);
  const active = ABXS_SECTIONS.find(s => s.id === activeId);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2"> Antibiotic Stewardship</h2>
        <p className="text-xs opacity-40 mt-0.5">De-escalation, duration & resistance patterns</p>
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
                <p className="text-sm opacity-80 leading-relaxed">{item.def}</p>
                {item.detail && <p className="text-xs opacity-50 leading-relaxed">{item.detail}</p>}
                {item.pearl && (
                  <div className="glass rounded-xl p-3 mt-2 flex items-start gap-2 text-xs" style={{ background: '#10b98108', border: '1px solid #10b98120', color: '#10b981' }}>
                    <span></span><span className="leading-relaxed">{item.pearl}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ABXS_SECTIONS.map(s => (
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

export default AntibioticStewardshipView;
