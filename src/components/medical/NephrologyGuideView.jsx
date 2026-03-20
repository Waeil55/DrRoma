import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const NEPHRO_SECTIONS = [
  { id: 'aki', title: 'Acute Kidney Injury', icon: '',
    items: [
      { term: 'KDIGO AKI Staging', def: 'Stage 1: Cr  1.5-1.9 baseline OR  0.3 mg/dL in 48h. UOP <0.5 mL/kg/h for 6-12h.\nStage 2: Cr  2.0-2.9 baseline. UOP <0.5 mL/kg/h for 12h.\nStage 3: Cr  3 baseline OR Cr 4.0 mg/dL OR RRT initiation. UOP <0.3 mL/kg/h 24h or anuria 12h.', detail: 'AKI develops over hours-days. Contrast with CKD (months-years). Look for: small kidneys on US (CKD), anemia + bone disease (CKD), broad waxy casts (CKD).', pearl: 'FENa helps distinguish pre-renal (<1%) from intrinsic renal (>2%). BUT: FENa unreliable with diuretics  use FEUrea instead (<35% = pre-renal). FENa also unreliable in contrast nephropathy, myoglobinuria, early obstruction.' },
      { term: 'Pre-Renal AKI', def: 'Decreased renal perfusion. BUN/Cr ratio >20:1. FENa <1%. Urine Na <20. Concentrated urine (osmolality >500). Bland sediment.', detail: 'Causes: hypovolemia (hemorrhage, dehydration, burns), decreased cardiac output (CHF, cardiogenic shock), renal vasoconstriction (NSAIDs, ACEi/ARB, hepatorenal syndrome), systemic vasodilation (sepsis, cirrhosis).', pearl: 'Hepatorenal syndrome (HRS): AKI in advanced cirrhosis without other cause. Type 1: rapid (Cr doubles in <2 weeks, often triggered by SBP). Type 2: gradual (refractory ascites). Treatment: midodrine + octreotide + albumin (bridge to transplant). Terlipressin if available.' },
      { term: 'Intrinsic Renal AKI', def: 'Damage to tubules, interstitium, glomeruli, or vasculature. FENa >2%. Urine Na >40. Isosthenuric (osm ~300).', detail: 'ATN (most common): muddy brown granular casts, renal epithelial cell casts. Ischemic (prolonged pre-renal) or nephrotoxic (aminoglycosides, contrast, myoglobin, cisplatin). AIN: WBC casts, eosinophiluria (drug-induced: NSAIDs, beta-lactams, PPIs, sulfonamides). GN: RBC casts, dysmorphic RBCs, proteinuria.', pearl: 'ATN recovery: typically 1-3 weeks. Hallmark is muddy brown granular casts. Contrast-induced AKI: Cr rises 24-48h after contrast, peaks 3-5 days, usually resolves in 7-10 days. Prevention: IV hydration (NS or isotonic bicarb). NAC benefit unclear. Hold metformin (lactic acidosis risk if AKI develops).' },
      { term: 'Post-Renal AKI (Obstructive)', def: 'Obstruction of urinary outflow. Must be bilateral (or unilateral with single kidney). Hydronephrosis on ultrasound.', detail: 'Causes: BPH (most common in elderly men), nephrolithiasis, malignancy (cervical, prostate, bladder), retroperitoneal fibrosis, neurogenic bladder. Bladder scan or Foley catheter  immediate improvement suggests obstruction.', pearl: 'Post-obstructive diuresis: massive polyuria after relief of bilateral obstruction. Can lose liters of fluid  hypovolemia. Monitor and replace 50-75% of urine output with NS. Watch for hyponatremia, hypokalemia. Usually self-limited (24-48h).' },
    ]},
  { id: 'ckd', title: 'Chronic Kidney Disease', icon: '',
    items: [
      { term: 'CKD Staging', def: 'Stage 1: GFR 90 (kidney damage with normal GFR). Stage 2: GFR 60-89. Stage 3a: 45-59. Stage 3b: 30-44. Stage 4: 15-29. Stage 5: <15 (or dialysis).', detail: 'Most common causes: diabetes (40%), hypertension (25%), glomerulonephritis, polycystic kidney disease. Diagnosis: GFR <60 OR kidney damage (proteinuria, hematuria, structural abnormality) for >3 months. Refer to nephrology at Stage 4 (GFR <30).', pearl: 'CKD-EPI equation preferred over MDRD (more accurate at higher GFR). Cystatin C-based GFR: better for extremes (muscle wasting, bodybuilders, amputees). ACR (albumin-creatinine ratio) for proteinuria: A1 <30, A2 30-300 (microalbuminuria), A3 >300.' },
      { term: 'CKD Complications Management', def: 'Anemia, mineral bone disease, hyperkalemia, metabolic acidosis, volume overload, uremic symptoms.', detail: 'Anemia: EPO (erythropoietin) when Hgb <10 g/dL (target 10-11.5, NOT >13). Iron supplementation first (ferritin >100, TSAT >20%). MBD: phosphate binders (calcium carbonate/acetate, sevelamer, lanthanum), calcitriol, vitamin D. Hyperkalemia: dietary restriction, kayexalate, patiromer, sodium zirconium cyclosilicate.', pearl: 'Blood pressure target in CKD with proteinuria: <130/80. ACEi/ARB first-line (reduce proteinuria, slow CKD progression). SGLT2 inhibitors (empagliflozin, dapagliflozin): proven renal protection in CKD (DAPA-CKD, EMPA-KIDNEY trials)  add for GFR 20 with albuminuria. Finerenone (non-steroidal MRA): additional renal/CV benefit in diabetic CKD.' },
      { term: 'Dialysis Indications', def: 'AEIOU: Acidosis (refractory), Electrolytes (hyperkalemia refractory), Ingestion (toxic alcohols, lithium, salicylates), Overload (volume, refractory), Uremia (pericarditis, encephalopathy, bleeding).', detail: 'Modalities: Hemodialysis (3/week, 4h sessions via AV fistula/graft/catheter), Peritoneal dialysis (daily exchanges at home), CRRT (continuous, for hemodynamically unstable ICU patients). AV fistula is preferred vascular access (lowest infection rate, best longevity)  plan 6 months ahead.', pearl: 'Dialysis disequilibrium syndrome: cerebral edema during/after first hemodialysis session (rapid solute clearance  osmotic gradient  water shifts into brain). Prevent: slow initial dialysis, smaller surface area dialyzer, mannitol. Symptoms: headache, nausea, confusion, seizures.' },
    ]},
  { id: 'gn', title: 'Glomerulonephritis', icon: '',
    items: [
      { term: 'Nephrotic Syndrome', def: 'Proteinuria >3.5 g/day, hypoalbuminemia (<3 g/dL), peripheral edema, hyperlipidemia, lipiduria (maltese crosses, oval fat bodies).', detail: 'Causes by age  Children: minimal change disease (most common). Adults: membranous nephropathy (most common primary), FSGS (most common in Black patients), diabetic nephropathy. Complications: thromboembolism (loss of antithrombin III), infection (loss of immunoglobulins), AKI.', pearl: 'Minimal change: foot process effacement on EM, normal light microscopy, responds to steroids. Membranous: "spike and dome" on EM, PLA2R antibodies (70-80% primary). FSGS: most common cause of nephrotic syndrome in Black adults. Diabetic nephropathy: Kimmelstiel-Wilson nodules, start ACEi/ARB early.' },
      { term: 'Nephritic Syndrome', def: 'Hematuria (RBC casts, dysmorphic RBCs), mild proteinuria (<3.5 g), HTN, oliguria, azotemia.', detail: 'IgA nephropathy (Berger): most common GN worldwide. Episodic gross hematuria 1-2 days after URI (synpharyngitic). IgA deposits in mesangium. Post-streptococcal GN: 2-4 weeks after pharyngitis/impetigo. "Lumpy-bumpy" IF pattern, subepithelial humps. Complement  (C3 low). Children: excellent prognosis.', pearl: 'Low complement GN: post-streptococcal (C3), membranoproliferative (C3, C4), lupus nephritis (C3, C4), cryoglobulinemia. Normal complement GN: IgA nephropathy, Goodpasture (anti-GBM linear IF), ANCA vasculitis (pauci-immune, no immune deposits on IF).' },
      { term: 'Rapidly Progressive GN (RPGN)', def: 'Rapid loss of renal function over days-weeks. Crescent formation on biopsy. Nephritic sediment. Medical emergency  biopsy and treat immediately.', detail: 'Type I (anti-GBM): Goodpasture syndrome (lungs + kidneys), linear IgG on IF. Type II (immune complex): lupus, IgA, post-infectious. Granular IF. Type III (pauci-immune): ANCA-associated (GPA, MPA, EGPA). No/minimal IF deposits.', pearl: 'RPGN treatment must NOT wait for biopsy results: empiric pulse methylprednisolone 500-1000 mg IV  3 days + cyclophosphamide or rituximab. Plasmapheresis for anti-GBM disease and severe ANCA vasculitis with pulmonary hemorrhage. Delay = permanent kidney loss.' },
    ]},
  { id: 'stones', title: 'Nephrolithiasis', icon: '',
    items: [
      { term: 'Calcium Oxalate (75-80%)', def: 'Most common stone type. Envelope-shaped crystals. Radiopaque on X-ray. Birefringent under polarized light.', detail: 'Risk factors: hypercalciuria (most common), hyperoxaluria, hypocitraturia, low fluid intake. Causes of hyperoxaluria: high oxalate diet (spinach, rhubarb, nuts, chocolate), fat malabsorption (Crohn\'s, gastric bypass  enteric hyperoxaluria).', pearl: 'Prevention: fluids (>2.5L/day, goal UOP >2L/day), thiazide diuretics ( urinary Ca), potassium citrate (inhibitor of stone formation), dietary Na restriction. Paradox: dietary calcium restriction INCREASES stone risk (less GI calcium to bind oxalate  more oxalate absorbed).' },
      { term: 'Uric Acid (5-10%)', def: 'ONLY radiolucent stone (invisible on X-ray, visible on CT). Associated with gout, tumor lysis, chronic diarrhea. Form in acidic urine (pH <5.5).', detail: 'Rhomboid or rosette crystals. Treatment/prevention: alkalinize urine (potassium citrate, target pH 6.5-7.0), allopurinol (if hyperuricemia), fluids.', pearl: 'Uric acid stones are the only common stone that can be DISSOLVED with medical therapy (urine alkalinization to pH 6.5-7.0). No need for surgery if patient can alkalinize urine. CT without contrast is gold standard for all stones (can detect radiolucent uric acid stones).' },
      { term: 'Struvite (Magnesium Ammonium Phosphate)', def: 'Staghorn calculi (fill renal pelvis). Occur ONLY with urease-producing bacteria (Proteus, Klebsiella, Pseudomonas). Alkaline urine.', detail: 'Coffin-lid shaped crystals. Always infected  antibiotics alone won\'t resolve. Need urologic intervention: percutaneous nephrolithotomy (PCNL) for large stones. Acetohydroxamic acid (urease inhibitor) for prevention.', pearl: 'Struvite stones = infection stones. If you see a staghorn calculus, suspect chronic UTI with urease-producing organism. Must remove the entire stone + treat infection  residual stone fragments = nidus for recurrence. Proteus mirabilis is the classic urease producer.' },
      { term: 'Cystine', def: 'Rare, autosomal recessive (cystinuria). Hexagonal crystals (pathognomonic). Faintly radiopaque. Positive sodium cyanide-nitroprusside test.', detail: 'Defective reabsorption of dibasic amino acids (cystine, ornithine, lysine, arginine  "COLA"). Treat: aggressive hydration (>3L/day), urine alkalinization (pH >7.0), tiopronin or D-penicillamine (bind cystine  soluble compounds).', pearl: 'Cystine stones in children/young adults: think cystinuria. Hexagonal crystals on UA are PATHOGNOMONIC. Need very high urine pH (>7.0) and very high fluid intake (>3L/day). Tiopronin preferred over D-penicillamine (fewer side effects).' },
    ]},
];

function NephrologyGuideView() {
  const [activeId, setActiveId] = useState(null);
  const active = NEPHRO_SECTIONS.find(s => s.id === activeId);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2"> Nephrology Guide</h2>
        <p className="text-xs opacity-40 mt-0.5">AKI, CKD, glomerulonephritis & nephrolithiasis</p>
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
                  <div className="glass rounded-xl p-3 mt-2 flex items-start gap-2 text-xs" style={{ background: '#6366f108', border: '1px solid #6366f120', color: '#6366f1' }}>
                    <span></span><span className="leading-relaxed">{item.pearl}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {NEPHRO_SECTIONS.map(s => (
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

export default NephrologyGuideView;
