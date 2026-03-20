import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const ID_SYNDROMES = [
  { id: 'cap', title: 'Community-Acquired Pneumonia (CAP)', cat: 'Respiratory',
    organisms: ['S. pneumoniae (#1)', 'H. influenzae', 'M. pneumoniae', 'Chlamydophila', 'Legionella', 'Respiratory viruses (influenza, RSV, SARS-CoV-2)'],
    empiricTx: [
      { setting: 'Outpatient (no comorbidities)', regimen: 'Amoxicillin 1g TID  5 days', alt: 'Doxycycline 100 mg BID  5 days' },
      { setting: 'Outpatient (comorbidities)', regimen: 'Amoxicillin-clavulanate + macrolide (azithromycin) OR respiratory fluoroquinolone (levofloxacin)', alt: '' },
      { setting: 'Inpatient (non-ICU)', regimen: 'Ceftriaxone 1g IV daily + azithromycin 500 mg IV daily', alt: 'Respiratory FQ monotherapy' },
      { setting: 'Inpatient (ICU)', regimen: 'Ceftriaxone + azithromycin (or FQ)', alt: 'If Pseudomonas risk: Piperacillin-tazobactam + FQ' },
    ],
    keyPoints: ['CURB-65 for severity: Confusion, Urea >7, RR 30, BP <90/60, age 65', 'Score 0-1: outpatient. 2: consider admission. 3+: ICU consideration', 'Duration: 5 days minimum, continue until afebrile  48h + clinically stable', 'Blood cultures + sputum culture for all inpatients'] },
  { id: 'uti', title: 'Urinary Tract Infection', cat: 'Genitourinary',
    organisms: ['E. coli (80%)', 'Klebsiella', 'Proteus', 'Enterococcus', 'S. saprophyticus (young women)'],
    empiricTx: [
      { setting: 'Uncomplicated cystitis', regimen: 'Nitrofurantoin 100 mg BID  5 days (1st line)', alt: 'TMP-SMX DS BID  3 days (if local resistance <20%)' },
      { setting: 'Uncomplicated cystitis (alt)', regimen: 'Fosfomycin 3g single dose', alt: 'Avoid fluoroquinolones for uncomplicated cystitis' },
      { setting: 'Pyelonephritis (outpatient)', regimen: 'Ciprofloxacin 500 mg BID  7 days', alt: 'TMP-SMX DS BID  14 days (if susceptible)' },
      { setting: 'Pyelonephritis (inpatient)', regimen: 'Ceftriaxone 1g IV daily', alt: 'Ciprofloxacin IV  PO. Piperacillin-tazobactam if ESBL risk' },
      { setting: 'Catheter-associated (CAUTI)', regimen: 'Remove/replace catheter + culture-guided therapy  7 days', alt: 'Empiric: ceftriaxone or FQ until sensitivities available' },
    ],
    keyPoints: ['Do NOT treat asymptomatic bacteriuria (except pregnancy, pre-urologic procedure)', 'Nitrofurantoin: NOT for pyelonephritis (poor tissue penetration)', 'Recurrent UTI (3/year): consider prophylaxis, evaluate anatomy', 'In pregnancy: screen and treat ASB. Nitrofurantoin or cephalexin (avoid TMP-SMX in 1st trimester, FQ contraindicated)'] },
  { id: 'cellulitis', title: 'Skin & Soft Tissue Infections', cat: 'Dermatology',
    organisms: ['Cellulitis: Group A Strep (GAS), S. aureus', 'Abscess: S. aureus (including MRSA)', 'Necrotizing fasciitis: polymicrobial or GAS'],
    empiricTx: [
      { setting: 'Simple cellulitis (no purulence)', regimen: 'Cephalexin 500 mg QID  5-7 days', alt: 'Dicloxacillin 500 mg QID, or clindamycin if penicillin allergy' },
      { setting: 'Cellulitis + purulence (MRSA risk)', regimen: 'TMP-SMX DS BID + cephalexin', alt: 'Doxycycline 100 mg BID + cephalexin' },
      { setting: 'Abscess', regimen: 'I&D is primary treatment. Add antibiotics if: >2 cm, immunocompromised, systemic signs', alt: 'TMP-SMX or doxycycline if antibiotics needed' },
      { setting: 'Severe / IV therapy', regimen: 'Vancomycin (MRSA) + piperacillin-tazobactam (polymicrobial)', alt: 'Linezolid is alternative to vancomycin' },
      { setting: 'Necrotizing fasciitis', regimen: 'SURGICAL EMERGENCY  immediate debridement. Vanc + pip-tazo + clindamycin (toxin suppression)', alt: '' },
    ],
    keyPoints: ['Draw skin margins with pen to track progression', 'Necrotizing fasciitis: pain out of proportion, crepitus, rapid progression, dusky skin, hemodynamic instability  OR immediately', 'LRINEC score: 6 = high suspicion for necrotizing fasciitis', 'Diabetic foot infections: polymicrobial, ensure adequate debridement, assess vascular supply'] },
  { id: 'meningitis', title: 'Bacterial Meningitis', cat: 'Neurology',
    organisms: ['Neonates: GBS, E. coli, Listeria', 'Children: S. pneumoniae, N. meningitidis', 'Adults: S. pneumoniae (#1), N. meningitidis', 'Elderly / immunocompromised: + Listeria', 'Post-neurosurgery: S. aureus, gram-negatives'],
    empiricTx: [
      { setting: 'Adults (empiric)', regimen: 'Vancomycin + ceftriaxone 2g IV Q12h + dexamethasone 0.15 mg/kg Q6h  4 days', alt: 'Add ampicillin 2g Q4h if age >50, immunocompromised, or alcoholic (Listeria coverage)' },
      { setting: 'Neonates (<1 month)', regimen: 'Ampicillin + cefotaxime (or gentamicin)', alt: '' },
      { setting: 'Children', regimen: 'Vancomycin + ceftriaxone + dexamethasone (before or with first antibiotic dose)', alt: '' },
      { setting: 'Post-neurosurgical', regimen: 'Vancomycin + cefepime (or meropenem)', alt: '' },
    ],
    keyPoints: ['Dexamethasone MUST be given BEFORE or WITH first antibiotic dose ( mortality for S. pneumoniae)', 'CT before LP if: immunocompromised, new seizure, papilledema, focal neuro deficit, altered consciousness', 'DO NOT delay antibiotics for CT or LP', 'CSF:  WBC (neutrophils),  protein,  glucose,  opening pressure', 'N. meningitidis: chemoprophylaxis for close contacts (rifampin, ciprofloxacin, or ceftriaxone)'] },
  { id: 'endocarditis', title: 'Infective Endocarditis', cat: 'Cardiology',
    organisms: ['Native valve: S. aureus (#1 acute), Viridans strep (#1 subacute)', 'Prosthetic valve (early <1yr): S. aureus, CoNS', 'Prosthetic valve (late >1yr): same as native', 'IVDU: S. aureus (right-sided, tricuspid)', 'Culture-negative: HACEK organisms, Coxiella, Bartonella'],
    empiricTx: [
      { setting: 'Native valve (empiric)', regimen: 'Vancomycin + ceftriaxone (pending cultures)', alt: '' },
      { setting: 'MSSA native valve', regimen: 'Nafcillin/oxacillin 2g IV Q4h  6 weeks', alt: 'Cefazolin 2g Q8h if mild penicillin allergy' },
      { setting: 'MRSA', regimen: 'Vancomycin 15-20 mg/kg IV Q8-12h  6 weeks (target trough 15-20)', alt: 'Daptomycin 6-10 mg/kg/day (NOT for left-sided if lung involvement  inactivated by surfactant)' },
      { setting: 'Viridans streptococci', regimen: 'Penicillin G or ceftriaxone  4 weeks (gentamicin first 2 weeks for synergy)', alt: '' },
      { setting: 'Prosthetic valve', regimen: 'Vancomycin + gentamicin + rifampin  6+ weeks', alt: '' },
    ],
    keyPoints: ['Modified Duke Criteria: 2 major, or 1 major + 3 minor, or 5 minor = definite IE', 'Major: 2 positive blood cultures with typical organism, positive echo (vegetation, abscess)', 'Minor: predisposition, fever, vascular phenomena (Janeway), immunologic (Osler nodes, Roth spots), positive cultures not meeting major', 'Always get 3 sets of blood cultures (different sites/times) BEFORE antibiotics', 'Surgery indications: HF, uncontrolled infection, embolic prevention (large vegetation >10 mm)'] },
];

export default function InfectiousDiseaseGuideView() {
  const [activeId, setActiveId] = useState(null);
  const [search, setSearch] = useState('');
  const active = ID_SYNDROMES.find(s => s.id === activeId);
  const filtered = ID_SYNDROMES.filter(s => !search || (s.title + ' ' + s.cat + ' ' + s.organisms.join(' ')).toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2"> Infectious Disease Guide</h2>
        {!active && (
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search infections"
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
                <p className="text-xs opacity-40">{active.cat}</p>
              </div>
            </div>

            <div className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
              <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-2">Common Organisms</h3>
              <div className="flex flex-wrap gap-1.5">
                {active.organisms.map(o => <span key={o} className="px-2.5 py-1 rounded-lg text-xs" style={{ background: 'var(--accent)/10', color: 'var(--accent)' }}>{o}</span>)}
              </div>
            </div>

            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-widest opacity-40">Empiric Treatment</h3>
              {active.empiricTx.map((tx, i) => (
                <div key={i} className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
                  <div className="text-xs font-black mb-2" style={{ color: 'var(--accent)' }}>{tx.setting}</div>
                  <div className="flex items-start gap-2 text-xs mb-1">
                    <span style={{ color: '#10b981' }}>Rx:</span>
                    <span className="opacity-80 font-bold">{tx.regimen}</span>
                  </div>
                  {tx.alt && (
                    <div className="flex items-start gap-2 text-xs">
                      <span className="opacity-30">Alt:</span>
                      <span className="opacity-50">{tx.alt}</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div className="glass rounded-2xl p-5" style={{ border: '1px solid #f59e0b20', background: '#f59e0b05' }}>
              <h3 className="font-black text-sm flex items-center gap-2 mb-3" style={{ color: '#f59e0b' }}> Key Points</h3>
              {active.keyPoints.map((kp, i) => (
                <div key={i} className="flex gap-2 text-xs py-1">
                  <span style={{ color: '#f59e0b' }}></span>
                  <span className="opacity-70 leading-relaxed">{kp}</span>
                </div>
              ))}
            </div>
          </div>
        ) : (
          filtered.map(s => (
            <button key={s.id} onClick={() => setActiveId(s.id)}
              className="w-full glass rounded-2xl p-5 text-left transition-all card-hover"
              style={{ border: '1px solid var(--border)' }}>
              <div className="flex items-start justify-between gap-3 mb-1">
                <h3 className="font-black">{s.title}</h3>
                <span className="px-2 py-0.5 rounded-lg text-xs font-black shrink-0" style={{ background: 'var(--accent)/10', color: 'var(--accent)' }}>{s.cat}</span>
              </div>
              <p className="text-xs opacity-40 mt-1">{s.organisms.slice(0, 3).join(', ')} </p>
              <p className="text-xs opacity-30 mt-1">{s.empiricTx.length} treatment settings</p>
            </button>
          ))
        )}
        {!active && filtered.length === 0 && <div className="empty-state py-12"><p className="font-black mt-4">No infections found</p></div>}
      </div>
    </div>
  );
}
