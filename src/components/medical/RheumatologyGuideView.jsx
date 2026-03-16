import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const RHEUM_SECTIONS = [
  { id: 'ra', title: 'Rheumatoid Arthritis & OA', icon: '🦴',
    items: [
      { term: 'Rheumatoid Arthritis', def: 'Chronic, symmetric, inflammatory polyarthritis. MCP + PIP joints (spares DIP). Morning stiffness >1 hour. Pannus formation erodes cartilage/bone.', detail: 'Labs: RF (70-80% sensitive, not specific), anti-CCP (more specific, 95%). Elevated ESR/CRP. X-ray: juxta-articular osteopenia, joint space narrowing, erosions. Extra-articular: rheumatoid nodules (30%), interstitial lung disease, Felty syndrome (RA + splenomegaly + neutropenia), atlantoaxial subluxation.', pearl: 'Treatment: "treat to target" (remission or low disease activity). Start DMARD early (within 3 months of diagnosis). Methotrexate is cornerstone (7.5-25 mg/weekly + folic acid). Add biologics if inadequate response: TNF-α inhibitors (adalimumab, etanercept), IL-6 inhibitors (tocilizumab), JAK inhibitors (tofacitinib), rituximab, abatacept. Check for latent TB before biologics!' },
      { term: 'Osteoarthritis', def: 'Degenerative. DIP (Heberden\'s), PIP (Bouchard\'s), 1st CMC, knees, hips, spine. Pain WORSENS with activity, IMPROVES with rest. Stiffness <30 min.', detail: 'X-ray: joint space narrowing, osteophytes, subchondral sclerosis, subchondral cysts. NO systemic features (normal labs). Risk factors: age, obesity, prior joint injury, repetitive use.', pearl: 'OA treatment ladder: (1) Weight loss + exercise (MOST effective, single best intervention). (2) Topical NSAIDs (diclofenac gel). (3) Oral NSAIDs (lowest dose, shortest duration). (4) Intra-articular steroids (temporary, max 3-4×/year). (5) Duloxetine (for pain modulation). (6) Joint replacement (when conservative fails, functionally limiting). Avoid: opioids (minimal benefit, high risk), hyaluronic acid injections (evidence is weak).' },
    ]},
  { id: 'lupus', title: 'Systemic Lupus Erythematosus', icon: '🦋',
    items: [
      { term: 'SLE Diagnosis', def: 'Young women (F:M = 9:1). Multisystem autoimmune disease. ANA positive (98% sensitive but NOT specific). Anti-dsDNA (specific, correlates with disease activity/nephritis). Anti-Smith (most specific).', detail: 'SLICC criteria (≥4 of 11 or biopsy-proven lupus nephritis + ANA/anti-dsDNA): malar rash, discoid rash, photosensitivity, oral ulcers, arthritis (non-erosive), serositis (pleuritis/pericarditis), renal (proteinuria/casts), neurologic (seizure/psychosis), hematologic (hemolytic anemia, leukopenia, thrombocytopenia), immunologic (anti-dsDNA, anti-Sm, antiphospholipid), ANA.', pearl: 'Drug-induced lupus: hydralazine, procainamide, isoniazid, minocycline, TNF-α inhibitors. Anti-histone antibodies (95% positive). Usually NO renal or CNS involvement. Resolves after stopping drug. Neonatal lupus: anti-Ro/SSA antibodies cross placenta → congenital heart block (permanent), transient rash, cytopenias.' },
      { term: 'Lupus Nephritis', def: 'Occurs in ~50% of SLE. Class III/IV (proliferative) most severe. Presents with proteinuria, hematuria, hypertension, elevated creatinine.', detail: 'ISN/RPS classification: Class I (minimal mesangial), II (mesangial proliferative), III (focal proliferative), IV (diffuse proliferative — worst prognosis, most common requiring treatment), V (membranous), VI (sclerotic). Biopsy is gold standard.', pearl: 'Class III/IV treatment: induction with mycophenolate mofetil (MMF) or IV cyclophosphamide + steroids. Maintenance: MMF or azathioprine. Voclosporin (calcineurin inhibitor) added to MMF: AURORA trial showed improved renal response. Belimumab: anti-BLyS, shown to reduce lupus flares (BLISS trials). Hydroxychloroquine: ALL SLE patients should be on it (reduces flares, renal damage, mortality, thrombosis). Annual eye exam for HCQ retinal toxicity.' },
    ]},
  { id: 'vasculitis', title: 'Vasculitis', icon: '🔥',
    items: [
      { term: 'Large Vessel Vasculitis', def: 'Giant Cell Arteritis (GCA): age >50, temporal headache, jaw claudication, vision loss (AION), PMR overlap. ESR >50, ↑CRP. Temporal artery biopsy (skip lesions). Takayasu arteritis: young women, aortic arch + branches, limb claudication, absent pulses.', detail: 'GCA treatment: high-dose prednisone 60-80 mg/day (or IV methylprednisolone if visual symptoms). Do NOT wait for biopsy. Tocilizumab as steroid-sparing agent (GiACTA trial). Takayasu: steroids ± methotrexate. Anti-TNF for refractory.', pearl: 'GCA and PMR frequently coexist (40-60%). PMR alone: prednisone 15-20 mg/day. If PMR + GCA symptoms → treat as GCA (60 mg). PMR that requires >20 mg prednisone or doesn\'t respond → reconsider diagnosis (malignancy, RA, myositis).' },
      { term: 'Medium Vessel Vasculitis', def: 'Polyarteritis Nodosa (PAN): systemic (NOT pulmonary), associated with Hep B. Livedo reticularis, mononeuritis multiplex, renal (aneurysms, NOT GN), skin nodules, abdominal pain. Kawasaki: children, fever ≥5 days, "CRASH" (Conjunctivitis, Rash, Adenopathy cervical, Strawberry tongue, Hand/foot changes). Risk: coronary artery aneurysms.', detail: 'PAN: angiography shows microaneurysms (string of pearls). Biopsy: fibrinoid necrosis, NO granulomas. ANCA negative. Hep B associated → treat Hep B. Kawasaki treatment: IVIG (within 10 days) + high-dose aspirin (only pediatric indication for aspirin). Echocardiography at diagnosis, 2 weeks, and 6-8 weeks.', pearl: 'PAN spares the lungs (unlike ANCA vasculitis). If lung involvement → think ANCA vasculitis, not PAN. Kawasaki: incomplete presentation common in infants — have low threshold for echo if prolonged fever + some criteria met. Coronary aneurysm risk highest if IVIG delayed past day 10.' },
      { term: 'Small Vessel (ANCA) Vasculitis', def: 'GPA (Wegener\'s): c-ANCA/anti-PR3. Upper airway (sinusitis, saddle nose), lower airway (pulmonary nodules/hemorrhage), renal (RPGN). MPA: p-ANCA/anti-MPO. Pulmonary-renal syndrome (no upper airway). EGPA (Churg-Strauss): p-ANCA, asthma, eosinophilia, neuropathy.', detail: 'Treatment: induction with rituximab (RAVE trial: non-inferior to cyclophosphamide, preferred for relapsing disease) OR cyclophosphamide + steroids. Maintenance: rituximab Q6 months or azathioprine. Avacopan (C5a receptor inhibitor): steroid-sparing in ANCA vasculitis (ADVOCATE trial).', pearl: 'ANCA vasculitis involves kidneys as pauci-immune crescentic GN (minimal/no immune deposits on IF — unlike lupus nephritis or anti-GBM disease). Lung-kidney syndrome DDx: ANCA vasculitis, anti-GBM (Goodpasture), SLE. Plasma exchange: add for severe renal disease (Cr >5.7) or diffuse alveolar hemorrhage.' },
    ]},
  { id: 'crystal', title: 'Crystal Arthropathies', icon: '💎',
    items: [
      { term: 'Gout', def: 'Monosodium urate crystals. Needle-shaped, NEGATIVELY birefringent (yellow parallel to polarizer). Acute: 1st MTP (podagra) classic, but any joint. Tophi in chronic disease.', detail: 'Risk factors: male, obesity, alcohol (beer > liquor > wine), purine-rich diet, thiazides, loop diuretics, cyclosporine, CKD. Trigger: sudden uric acid change (starting/stopping ULT, surgery, dehydration, binge drinking).', pearl: 'Acute gout: NSAIDs (indomethacin) OR colchicine (within 36h of onset: 1.2 mg → 0.6 mg 1h later) OR steroids (if NSAIDs/colchicine contraindicated). Anakinra (IL-1 blocker) for refractory. Do NOT start or stop allopurinol during acute flare! ULT (urate-lowering therapy): allopurinol (start low 100 mg, titrate to target uric acid <6 mg/dL) or febuxostat. Start ULT with anti-inflammatory prophylaxis (colchicine 0.6 mg daily × 3-6 months).' },
      { term: 'Pseudogout (CPPD)', def: 'Calcium pyrophosphate crystals. Rhomboid-shaped, WEAKLY POSITIVELY birefringent (blue parallel to polarizer). Knee is most common joint. Chondrocalcinosis on X-ray.', detail: 'Associated with the "5 H\'s": Hyperparathyroidism, Hemochromatosis, Hypomagnesemia, Hypothyroidism, Hypophosphatasia. Age >65 is biggest risk factor. Can mimic gout, RA, OA, or septic arthritis.', pearl: 'Crystal gout vs pseudogout mnemonic: "Negatively birefringent Needles = gout (Negative = yellow = gout = Needles)." "Positively birefringent = Pseudogout = blue Parallel." Joint aspiration is gold standard for BOTH — always aspirate to rule out septic arthritis. Cell count >50K WBCs = septic until proven otherwise (even in known crystal disease).' },
    ]},
];

export default function RheumatologyGuideView() {
  const [activeId, setActiveId] = useState(null);
  const active = RHEUM_SECTIONS.find(s => s.id === activeId);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2">🦴 Rheumatology Guide</h2>
        <p className="text-xs opacity-40 mt-0.5">Autoimmune diseases, vasculitis & crystal arthropathies</p>
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
                  <div className="glass rounded-xl p-3 mt-2 flex items-start gap-2 text-xs" style={{ background: '#8b5cf608', border: '1px solid #8b5cf620', color: '#8b5cf6' }}>
                    <span>💎</span><span className="leading-relaxed">{item.pearl}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {RHEUM_SECTIONS.map(s => (
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
