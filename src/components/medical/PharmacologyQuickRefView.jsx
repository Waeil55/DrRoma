import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const PHARMA_CLASSES = [
  { cls: 'Beta Blockers', cat: 'Cardiology', moa: 'Block β₁ (and β₂) adrenergic receptors → decrease HR, contractility, renin release',
    drugs: ['Metoprolol (β₁-selective)', 'Atenolol (β₁-selective)', 'Propranolol (non-selective)', 'Carvedilol (α₁+β)','Bisoprolol (β₁-selective)','Nebivolol (β₁ + NO release)'],
    indications: ['Hypertension', 'Heart failure (carvedilol, metoprolol succinate, bisoprolol)', 'Post-MI', 'Atrial fibrillation (rate control)', 'Migraine prophylaxis (propranolol)', 'Essential tremor', 'Thyrotoxicosis (symptom relief)'],
    sideEffects: ['Bradycardia', 'Hypotension', 'Fatigue', 'Bronchospasm (non-selective)', 'Masking hypoglycemia symptoms', 'Cold extremities', 'Depression', 'Erectile dysfunction'],
    contraindications: ['Decompensated HF', 'Severe bradycardia / AV block', 'Asthma (non-selective)', 'Cocaine-induced coronary vasospasm'],
    pearls: ['Never stop abruptly → rebound tachycardia/HTN. Carvedilol & metoprolol succinate reduce HF mortality. β₁-selective safer in mild COPD.'] },
  { cls: 'ACE Inhibitors', cat: 'Cardiology', moa: 'Inhibit angiotensin-converting enzyme → ↓ Angiotensin II → vasodilation + ↓ aldosterone',
    drugs: ['Enalapril', 'Lisinopril', 'Ramipril', 'Captopril', 'Perindopril', 'Quinapril'],
    indications: ['Hypertension', 'Heart failure (↓ mortality)', 'Post-MI (↓ remodeling)', 'Diabetic nephropathy (renoprotective)', 'CKD with proteinuria'],
    sideEffects: ['Dry cough (10-15%, bradykinin accumulation)', 'Hyperkalemia', 'Angioedema (rare but serious)', 'Hypotension (first dose)', 'AKI (bilateral renal artery stenosis)', 'Teratogenic'],
    contraindications: ['Pregnancy', 'Bilateral renal artery stenosis', 'History of ACEi-angioedema', 'K+ > 5.5', 'eGFR < 20 (relative)'],
    pearls: ['Cough → switch to ARB. Check Cr + K+ 1-2 weeks after starting. Up to 30% rise in Cr acceptable = hemodynamic effect.'] },
  { cls: 'Statins', cat: 'Cardiology', moa: 'Inhibit HMG-CoA reductase → ↓ hepatic cholesterol synthesis → ↑ LDL receptor expression → ↓ LDL-C',
    drugs: ['Atorvastatin (high intensity)', 'Rosuvastatin (high intensity)', 'Simvastatin', 'Pravastatin (fewer interactions)', 'Pitavastatin'],
    indications: ['Primary prevention (10-yr ASCVD ≥ 7.5%)', 'Secondary prevention (ASCVD history)', 'Familial hypercholesterolemia', 'Diabetes 40-75 yr'],
    sideEffects: ['Myalgia (5-10%)', 'Rhabdomyolysis (rare)', 'Hepatotoxicity (↑ transaminases)', 'New-onset diabetes (slight ↑ risk)', 'GI upset'],
    contraindications: ['Active liver disease', 'Pregnancy/breastfeeding', 'Concomitant strong CYP3A4 inhibitors (simvastatin)'],
    pearls: ['Take simvastatin at night (peak cholesterol synthesis). Atorvastatin/rosuvastatin any time. LFTs baseline, then PRN. CK only if symptomatic.'] },
  { cls: 'PPIs', cat: 'Gastroenterology', moa: 'Irreversibly inhibit H⁺/K⁺ ATPase (proton pump) on parietal cells → suppress gastric acid',
    drugs: ['Omeprazole', 'Esomeprazole', 'Pantoprazole', 'Lansoprazole', 'Rabeprazole'],
    indications: ['GERD', 'Peptic ulcer disease', 'H.pylori eradication (triple therapy)', 'Zollinger-Ellison syndrome', 'NSAID gastroprophylaxis', 'Stress ulcer prophylaxis (ICU)'],
    sideEffects: ['Headache', 'C.diff infection (long-term)', 'Hypomagnesemia (chronic)', 'B12 deficiency', 'Osteoporosis / fracture risk', 'Rebound acid hypersecretion on withdrawal', 'Possible ↑ risk CKD'],
    contraindications: ['Hypersensitivity'],
    pearls: ['Take 30 min before meals. Shortest duration needed. Taper when stopping long-term. Omeprazole inhibits CYP2C19 → ↓ clopidogrel activation.'] },
  { cls: 'SSRIs', cat: 'Psychiatry', moa: 'Selectively inhibit serotonin (5-HT) reuptake at presynaptic neuron → ↑ synaptic 5-HT',
    drugs: ['Fluoxetine (long t½)', 'Sertraline', 'Citalopram', 'Escitalopram', 'Paroxetine (anticholinergic)', 'Fluvoxamine'],
    indications: ['Major Depressive Disorder (1st line)', 'Generalized Anxiety Disorder', 'OCD (higher doses)', 'PTSD', 'Social anxiety', 'Panic disorder', 'Bulimia (fluoxetine)', 'PMDD'],
    sideEffects: ['GI (nausea, diarrhea)', 'Sexual dysfunction (↓ libido, anorgasmia)', 'Weight gain (paroxetine)', 'Insomnia or drowsiness', 'Hyponatremia (SIADH, elderly)', 'Serotonin syndrome (with MAOi)', 'Withdrawal symptoms (paroxetine worst)'],
    contraindications: ['Concomitant MAOi (14-day washout)', 'QT prolongation (citalopram >40 mg)'],
    pearls: ['4-6 weeks for full effect. Fluoxetine long half-life = less withdrawal. Taper gradually (except fluoxetine). Avoid paroxetine in pregnancy (#1 teratogenic SSRI).'] },
  { cls: 'Fluoroquinolones', cat: 'Infectious Disease', moa: 'Inhibit bacterial DNA gyrase (topoisomerase II) and topoisomerase IV → prevent DNA replication',
    drugs: ['Ciprofloxacin', 'Levofloxacin (respiratory FQ)', 'Moxifloxacin (respiratory FQ)', 'Ofloxacin'],
    indications: ['UTI (cipro)', 'Community-acquired pneumonia (levo, moxi)', 'Acute bacterial sinusitis', 'Intra-abdominal infections', 'Pseudomonas (cipro, levo)'],
    sideEffects: ['Tendon rupture (Achilles)', 'QT prolongation (moxi)', 'C.diff', 'Peripheral neuropathy', 'CNS effects (seizures, confusion)', 'Aortic dissection/aneurysm', 'Photosensitivity', 'Cartilage damage (pediatric)'],
    contraindications: ['Children < 18 (relative)', 'Myasthenia gravis (can worsen)', 'History of tendinopathy with FQ', 'QT prolongation (moxi)'],
    pearls: ['FDA black box: tendinitis, neuropathy, CNS effects. Reserve for when no alternatives. Chelated by Ca²⁺/Mg²⁺/Fe²⁺ — give 2h apart.'] },
  { cls: 'Insulin', cat: 'Endocrinology', moa: 'Binds insulin receptor → GLUT4 translocation → ↑ glucose uptake, ↓ hepatic glucose output, ↓ lipolysis',
    drugs: ['Rapid: Lispro, Aspart, Glulisine (onset 15 min)', 'Short: Regular insulin (onset 30 min)', 'Intermediate: NPH (onset 2h, peak 6-8h)', 'Long: Glargine, Detemir, Degludec (no peak, ~24h)'],
    indications: ['Type 1 DM (always)', 'Type 2 DM (when oral agents insufficient)', 'DKA (regular IV)', 'Hyperkalemia (IV + dextrose)', 'Gestational diabetes'],
    sideEffects: ['Hypoglycemia (#1)', 'Weight gain', 'Lipodystrophy (injection site)', 'Injection site reactions'],
    contraindications: ['Hypoglycemia'],
    pearls: ['Basal-bolus: long-acting + rapid before meals. Correction scale based on sensitivity factor (1800/TDD for rapid). Stack insulin carefully to avoid hypos.'] },
  { cls: 'Corticosteroids', cat: 'Immunology', moa: 'Bind intracellular glucocorticoid receptors → ↓ NF-κB → ↓ inflammatory cytokines, ↓ prostaglandins. Broad immunosuppression.',
    drugs: ['Hydrocortisone (1×, short)', 'Prednisone/Prednisolone (4×, intermediate)', 'Methylprednisolone (5×)', 'Dexamethasone (25×, long-acting)', 'Budesonide (topical/inhaled)'],
    indications: ['Asthma/COPD exacerbation', 'Autoimmune diseases (SLE, RA)', 'Organ transplant', 'Adrenal insufficiency', 'Cerebral edema (dexa)', 'Allergic reactions', 'COVID-19 (dexa, moderate-severe)'],
    sideEffects: ['Cushing syndrome', 'Hyperglycemia / new-onset DM', 'Osteoporosis', 'Immunosuppression / infections', 'Adrenal suppression', 'GI ulcers', 'Cataracts/glaucoma', 'Avascular necrosis', 'Psychiatric (mania, psychosis)', 'Skin thinning / easy bruising', 'Weight gain / moon face'],
    contraindications: ['Active untreated infection (relative)', 'Live vaccines while on high-dose'],
    pearls: ['Taper if >2 weeks use (adrenal suppression). Stress dose for surgery if on chronic. Calcium + Vitamin D + bisphosphonate for chronic use.'] },
  { cls: 'Anticoagulants', cat: 'Hematology', moa: 'Various: Warfarin inhibits vitamin K epoxide reductase; Heparin activates antithrombin III; DOACs directly inhibit Xa or thrombin',
    drugs: ['Warfarin (vitamin K antagonist)', 'Unfractionated heparin (UFH)', 'Enoxaparin (LMWH)', 'Rivaroxaban (Xa inhibitor)', 'Apixaban (Xa inhibitor)', 'Dabigatran (direct thrombin inhibitor)'],
    indications: ['Atrial fibrillation (stroke prevention)', 'DVT/PE (treatment + prophylaxis)', 'Mechanical heart valves (warfarin only)', 'ACS', 'Post-orthopedic surgery'],
    sideEffects: ['Bleeding (#1)', 'Warfarin: skin necrosis (protein C↓), teratogenic', 'HIT (heparin)', 'GI bleed (DOACs, especially rivaroxaban)'],
    contraindications: ['Active major bleeding', 'Warfarin: pregnancy', 'DOACs: severe renal impairment (dabigatran Cr Cl <30)', 'Mechanical valves (DOACs contraindicated)'],
    pearls: ['Warfarin: INR 2-3 (2.5-3.5 mechanical valves). Bridge with heparin. Reversal: vitamin K + FFP/PCC. Apixaban: no dose adjustment for renal until CrCl <25.'] },
  { cls: 'Benzodiazepines', cat: 'Psychiatry', moa: 'Enhance GABA-A receptor activity → ↑ Cl⁻ conductance → neuronal hyperpolarization → CNS depression',
    drugs: ['Diazepam (long-acting)', 'Lorazepam (intermediate, IV for status epilepticus)', 'Alprazolam (short, high abuse potential)', 'Midazolam (ultra-short, procedural sedation)', 'Clonazepam (long, seizures/panic)'],
    indications: ['Anxiety disorders (short-term)', 'Insomnia (short-term)', 'Seizures / Status epilepticus (lorazepam IV)', 'Alcohol withdrawal', 'Procedural sedation', 'Muscle spasm'],
    sideEffects: ['Sedation / drowsiness', 'Respiratory depression', 'Dependence / addiction', 'Paradoxical agitation (elderly)', 'Amnesia', 'Falls (elderly)', 'Withdrawal seizures (abrupt stop)'],
    contraindications: ['Severe respiratory insufficiency', 'Sleep apnea (relative)', 'Acute narrow-angle glaucoma', 'Myasthenia gravis'],
    pearls: ['Short-term only (<4 weeks). Taper slowly to avoid withdrawal seizures. Reversal: Flumazenil (but risk of seizures in chronic users). Avoid in elderly (Beers criteria).'] },
];

export default function PharmacologyQuickRefView() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [expanded, setExpanded] = useState(null);
  const categories = ['All', ...new Set(PHARMA_CLASSES.map(p => p.cat))];
  const filtered = PHARMA_CLASSES
    .filter(p => category === 'All' || p.cat === category)
    .filter(p => !search || (p.cls + ' ' + p.drugs.join(' ') + ' ' + p.cat).toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0 space-y-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2"> Pharmacology</h2>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search drug classes…"
          className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none"
          style={{ background: 'var(--surface,var(--card))', border: '1px solid var(--border)' }} />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className="px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all"
              style={c === category ? { background: 'var(--accent)', color: '#fff' } : { background: 'var(--surface,var(--card))', opacity: .6 }}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {filtered.map(p => {
          const isOpen = expanded === p.cls;
          return (
            <div key={p.cls} className="glass rounded-2xl overflow-hidden transition-all"
              style={{ border: `1px solid ${isOpen ? 'var(--accent)/40' : 'var(--border)'}` }}>
              <button onClick={() => setExpanded(e => e === p.cls ? null : p.cls)}
                className="w-full p-4 text-left flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ background: 'var(--accent)/10' }}></div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black">{p.cls}</h3>
                  <p className="text-xs opacity-40 mt-0.5">{p.cat} · {p.drugs.length} drugs</p>
                </div>
                <ChevronDown size={14} className="opacity-40 shrink-0 transition-transform" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} />
              </button>
              {isOpen && (
                <div className="px-4 pb-5 space-y-4 animate-fade-in-up">
                  <div className="glass rounded-xl p-3" style={{ background: 'var(--accent)/05', border: '1px solid var(--accent)/20' }}>
                    <h4 className="text-xs font-black uppercase tracking-widest opacity-50 mb-1">Mechanism of Action</h4>
                    <p className="text-sm opacity-80 leading-relaxed">{p.moa}</p>
                  </div>

                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest opacity-40 mb-2">Drugs</h4>
                    <div className="flex flex-wrap gap-1.5">
                      {p.drugs.map(d => <span key={d} className="px-2.5 py-1 rounded-lg text-xs font-bold" style={{ background: 'var(--accent)/10', color: 'var(--accent)' }}>{d}</span>)}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest opacity-40 mb-2"> Indications</h4>
                      <div className="space-y-1">{p.indications.map(ind => <div key={ind} className="flex gap-2 text-xs"><span style={{ color: '#10b981' }}>•</span><span className="opacity-70">{ind}</span></div>)}</div>
                    </div>
                    <div>
                      <h4 className="text-xs font-black uppercase tracking-widest opacity-40 mb-2"> Side Effects</h4>
                      <div className="space-y-1">{p.sideEffects.map(se => <div key={se} className="flex gap-2 text-xs"><span style={{ color: '#f59e0b' }}>•</span><span className="opacity-70">{se}</span></div>)}</div>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest opacity-40 mb-2"> Contraindications</h4>
                    <div className="space-y-1">{p.contraindications.map(ci => <div key={ci} className="flex gap-2 text-xs"><span style={{ color: '#ef4444' }}>•</span><span className="opacity-70">{ci}</span></div>)}</div>
                  </div>

                  {p.pearls?.length > 0 && (
                    <div className="glass rounded-xl p-3" style={{ background: '#f59e0b08', border: '1px solid #f59e0b20' }}>
                      <h4 className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: '#f59e0b' }}> High-Yield Pearls</h4>
                      {p.pearls.map((pearl, i) => <p key={i} className="text-xs opacity-70 leading-relaxed mt-1">{pearl}</p>)}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <div className="empty-state py-12"><p className="font-black mt-4">No drug classes found</p></div>}
      </div>
    </div>
  );
}
