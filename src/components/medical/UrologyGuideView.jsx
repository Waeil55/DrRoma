import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const URO_SECTIONS = [
  { id: 'bph', title: 'BPH & Prostate', icon: '',
    items: [
      { term: 'Benign Prostatic Hyperplasia', def: 'Prevalence increases with age (50% at 50, 90% at 80). LUTS: frequency, urgency, nocturia, weak stream, hesitancy, incomplete emptying, post-void dribbling. IPSS (International Prostate Symptom Score) for severity.', detail: 'Diagnosis: DRE (smooth, enlarged, firm, non-tender), UA (rule out UTI), PSA (discuss), PVR (post-void residual — ≥200-300 mL is significant). Uroflowmetry, pressure-flow studies for equivocal cases.', pearl: 'Treatment: Mild (IPSS <8): watchful waiting, lifestyle (reduce fluids before bed, limit caffeine/alcohol). Moderate-severe: Alpha-blockers (tamsulosin, alfuzosin) — rapid symptom relief (days to weeks). 5α-reductase inhibitors (finasteride, dutasteride) — reduce prostate volume over months, prevent progression. Combination therapy (MTOPS, CombAT trials). PDE5 inhibitor (tadalafil 5 mg daily — for BPH + ED). Surgical: TURP (gold standard), HoLEP (laser enucleation — comparable, less bleeding), UroLift (prostatic urethral lift — preserves ejaculatory function), water vapor therapy (Rezūm), aquablation (robotic waterjet).' },
      { term: 'Prostate Cancer', def: 'Most common cancer in men (excluding skin). Risk factors: age, family history, African American race, BRCA2 mutation. Most are adenocarcinoma, arise from peripheral zone (palpable on DRE).', detail: 'Screening: controversial. PSA screening — shared decision-making. USPSTF: offer PSA screening to men 55-69 (Grade C). Do NOT screen >70 or <55 (without risk factors). PSA >4 ng/mL (or >3 in high risk) → biopsy. PSA velocity >0.75/year, PSA density, free PSA% help distinguish benign vs malignant.', pearl: 'Gleason score/Grade Group: GG1 (Gleason ≤6, very low risk), GG2 (3+4=7, favorable intermediate), GG3 (4+3=7, unfavorable intermediate), GG4 (Gleason 8, high), GG5 (9-10, very high). Low-risk (GG1, T1-T2a, PSA <10): active surveillance (repeat PSA, MRI, biopsy — avoid overtreatment of indolent disease). Intermediate/high risk: radical prostatectomy or radiation + ADT (androgen deprivation therapy). Metastatic: ADT (LHRH agonist/antagonist) + novel agent (abiraterone, enzalutamide, darolutamide, docetaxel — upfront intensification per LATITUDE, STAMPEDE, ENZAMET, ARASENS trials). PSMA-PET: highly sensitive for metastatic disease staging.' },
    ]},
  { id: 'stones', title: 'Urolithiasis', icon: '',
    items: [
      { term: 'Renal Colic', def: 'Colicky flank pain radiating to groin (ureteral stone), acute onset, patient cannot get comfortable (writhing — unlike peritonitis where still). Hematuria (90%). Nausea/vomiting.', detail: 'Non-contrast CT abdomen/pelvis: gold standard (>95% sensitivity). US first-line in pregnancy and pediatrics. Types: calcium oxalate (80% — radiopaque), calcium phosphate, uric acid (radiolucent on X-ray, visible on CT), struvite (staghorn, infection-related — Proteus, Klebsiella), cystine (genetic — hexagonal crystals).', pearl: 'Management: <5 mm: 90% pass spontaneously. Medical expulsive therapy: tamsulosin (alpha-blocker — relaxes ureteral smooth muscle) + NSAIDs (ketorolac) for pain. IV fluids do NOT speed passage (but treat dehydration). 5-10 mm: 50% pass spontaneously, may need intervention. >10 mm: unlikely to pass → urology. Renal: SWL (shock wave lithotripsy) or PCNL (percutaneous nephrolithotomy) for stones >2 cm. Ureteral: ureteroscopy with laser lithotripsy. Emergent urology: infected obstructing stone (UTI + obstruction) → emergent decompression (ureteral stent or percutaneous nephrostomy) + IV antibiotics. This is a urologic emergency (urosepsis).' },
      { term: 'Stone Prevention', def: 'High fluid intake (≥2.5L urine output/day) is the single most effective prevention. 24h urine collection for metabolic evaluation after first stone in high-risk patients or recurrent stones.', detail: 'Calcium oxalate: increase fluids, low sodium diet (reduces urinary calcium), normal calcium intake (LOW dietary calcium INCREASES stone risk by increasing oxalate absorption), citrate supplementation (potassium citrate — inhibits crystallization). Thiazide diuretics (reduce urinary calcium). Uric acid: alkalinize urine to pH 6.5-7 (potassium citrate), allopurinol if hyperuricosuric. Uric acid stones can be DISSOLVED by urinary alkalinization.', pearl: 'Struvite stones: Proteus, Klebsiella (urease-producing organisms) → alkaline urine → magnesium ammonium phosphate crystals. "Coffin lid" crystals. Often form staghorn calculi. Definitive treatment: complete stone removal (PCNL ± SWL) + treat underlying UTI. If stone fragments remain, infection recurs. Cystine stones: cystinuria (AR). Hexagonal crystals. Dissolve with D-penicillamine or tiopronin + alkalinization + high fluid intake. Positive nitroprusside test. Dietary protein restriction helps reduce cystine excretion.' },
    ]},
  { id: 'hematuria', title: 'Hematuria', icon: '',
    items: [
      { term: 'Microscopic Hematuria Workup', def: '≥3 RBCs/HPF on two of three samples (or single with risk factors). AUA guidelines (2020): risk-stratify into low, intermediate, high risk. Low risk: repeat UA in 6 months. Intermediate: cystoscopy + renal US. High risk: cystoscopy + CT urogram.', detail: 'Causes: UTI (most common), kidney stones, BPH, glomerular disease, malignancy (bladder > kidney > ureteral). Risk factors for malignancy: age >40 (especially >60), male sex, smoking history, gross hematuria, prior pelvic radiation, cyclophosphamide exposure.', pearl: 'Glomerular hematuria: dysmorphic RBCs, RBC casts, proteinuria. Suggests nephrologic workup (IgA nephropathy most common glomerular cause of hematuria). Non-glomerular (urologic) hematuria: normal RBC morphology, no casts, no significant proteinuria → cystoscopy + imaging. NEVER attribute hematuria solely to anticoagulation or aspirin without workup — patients on anticoagulants who have hematuria have the same rate of underlying malignancy as those not on anticoagulants. Gross hematuria: always requires cystoscopy + CT urogram regardless of age.' },
    ]},
  { id: 'scrotal', title: 'Scrotal Emergencies', icon: '',
    items: [
      { term: 'Testicular Torsion', def: 'SURGICAL EMERGENCY. Bell-clapper deformity (horizontal lie) predisposes. Sudden severe unilateral scrotal pain, nausea/vomiting. Affected testis is high-riding, transverse lie, absent cremasteric reflex. Peak: neonates and age 12-18.', detail: 'Diagnosis: CLINICAL — do NOT delay for imaging if clinical suspicion is high. Doppler US if diagnosis uncertain: decreased/absent blood flow. Manual detorsion: "open the book" (medial to lateral — left testicle clockwise, right counterclockwise when viewed from patient\'s perspective). Temporary measure → still needs surgical exploration.', pearl: 'Surgical window: <6h → 90% salvage rate. 6-12h → 50%. >24h → <10% (orchidectomy). Always fix the contralateral testis (bilateral orchiopexy) — bell-clapper deformity is often bilateral. DDx: torsion of appendix testis ("blue dot sign" — torted appendage visible through scrotal skin), epididymitis (more gradual onset, positive Prehn sign — pain relief with elevation, but Prehn sign is unreliable and should NOT be used to exclude torsion). In adolescent male with acute scrotum — TREAT AS TORSION UNTIL PROVEN OTHERWISE.' },
      { term: 'Epididymitis & Fournier\'s Gangrene', def: 'Epididymitis: <35 years — STI (Chlamydia, Gonorrhea): ceftriaxone + doxycycline. >35 years — UTI organisms (E. coli): fluoroquinolone or TMP-SMX. Gradual onset, tender epididymis, may have fever/pyuria.', detail: 'Fournier\'s gangrene: necrotizing fasciitis of perineum/genitalia. SURGICAL EMERGENCY. Risk factors: diabetes (#1), immunocompromised, obesity, alcoholism, perineal trauma/surgery. Polymicrobial (aerobic + anaerobic). Rapid spread, crepitus, disproportionate pain, sepsis.', pearl: 'Fournier\'s gangrene: LRINEC score (Laboratory Risk Indicator for Necrotizing Fasciitis) >6 = suspicious, >8 = high risk. Treatment: broad-spectrum antibiotics (vancomycin + piperacillin-tazobactam + clindamycin) + URGENT surgical debridement (return to OR Q24-48h for re-debridement until clean margins). Mortality: 20-40% even with treatment. Delay in surgery is the primary determinant of mortality. Varicocele: "bag of worms" — left side predominates (left gonadal vein drains into left renal vein at 90°). Varicocele that doesn\'t decompress when supine → think IVC/renal vein obstruction (renal cell carcinoma — get CT abdomen).' },
    ]},
];

export default function UrologyGuideView() {
  const [activeId, setActiveId] = useState(null);
  const active = URO_SECTIONS.find(s => s.id === activeId);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2"> Urology Guide</h2>
        <p className="text-xs opacity-40 mt-0.5">BPH, stones, hematuria & scrotal emergencies</p>
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
                  <div className="glass rounded-xl p-3 mt-2 flex items-start gap-2 text-xs" style={{ background: '#0ea5e908', border: '1px solid #0ea5e920', color: '#0ea5e9' }}>
                    <span></span><span className="leading-relaxed">{item.pearl}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {URO_SECTIONS.map(s => (
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
