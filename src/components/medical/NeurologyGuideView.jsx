import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const NEURO_SECTIONS = [
  { id: 'stroke', title: 'Stroke', icon: '',
    items: [
      { term: 'Ischemic Stroke', def: 'Acute focal neurologic deficit from cerebral artery occlusion. 87% of all strokes. Thrombotic (large vessel atherosclerosis, small vessel/lacunar), embolic (cardiac  AF, valvular; artery-to-artery), cryptogenic (ESUS).', detail: 'Workup: non-contrast CT (rule out hemorrhage  hemorrhagic stroke is a contraindication to thrombolytics), CTA (vessel occlusion), NIHSS score, glucose, CBC, coags, troponin, ECG. CT perfusion: core infarct vs penumbra (salvageable tissue).', pearl: 'tPA (alteplase): within 4.5h of last-known-well. Dose: 0.9 mg/kg (max 90 mg), 10% bolus + 90% over 60 min. BP must be <185/110 before tPA, <180/105 after. Contraindications: active bleeding, platelets <100K, INR >1.7, recent surgery. Mechanical thrombectomy: large vessel occlusion (ICA, M1 MCA), within 24h if favorable imaging (DAWN, DEFUSE-3 trials up to 24h if CT perfusion shows salvageable tissue).' },
      { term: 'Hemorrhagic Stroke', def: 'Intracerebral hemorrhage (ICH): hypertensive (basal ganglia, thalamus, pons, cerebellum), amyloid angiopathy (lobar, elderly), AVM, coagulopathy. Subarachnoid (SAH): sudden "worst headache of life"  ruptured aneurysm (berry aneurysm at circle of Willis).', detail: 'ICH management: reverse anticoagulation (4F-PCC for warfarin, idarucizumab for dabigatran), BP control (SBP <140 per INTERACT2/ATACH-2), monitor for ICP elevation, surgical evacuation if cerebellar hemorrhage >3 cm or deteriorating.', pearl: 'SAH: CT sensitivity ~95% <6h (decreases with time). If CT negative but clinical suspicion high  LP (xanthochromia, elevated RBCs that don\'t clear). CTA for aneurysm. Treatment: secure aneurysm (endovascular coiling preferred > surgical clipping per ISAT). Nimodipine 60 mg Q4h  21 days (prevents vasospasm). Monitor for: rebleeding, vasospasm (day 4-14), hydrocephalus, hyponatremia (SIADH or cerebral salt wasting).' },
      { term: 'TIA & Secondary Prevention', def: 'Transient neurologic deficit resolving within <24h (most <1h) with no infarction on imaging. ABCD2 score stratifies risk. High risk: same admission workup.', detail: 'Secondary prevention: antiplatelets (aspirin + clopidogrel  21 days for minor stroke/TIA per CHANCE/POINT trials, then single antiplatelet), statin (high-intensity), BP control (<130/80), diabetes control, smoking cessation, carotid endarterectomy if ipsilateral 70-99% symptomatic stenosis.', pearl: 'AF-related stroke: anticoagulation with DOAC (not dual antiplatelet)  start 4-14 days after stroke (earlier for minor, later for large). CHADS-VASc score guides decision (2 men, 3 women  anticoagulate). PFO closure: consider in cryptogenic stroke patients <60 with high-risk PFO features (large shunt, atrial septal aneurysm)  RESPECT, CLOSE trials.' },
    ]},
  { id: 'seizure', title: 'Seizures & Epilepsy', icon: '',
    items: [
      { term: 'Seizure Classification', def: 'Focal (aware vs impaired awareness, motor vs non-motor)  one hemisphere. Generalized (tonic-clonic, absence, myoclonic, atonic)  both hemispheres from onset. Focal to bilateral tonic-clonic (previously "secondary generalized").', detail: 'New-onset seizure workup: stat glucose, BMP (Na, Ca, Mg), CBC, tox screen, pregnancy test if applicable. Brain MRI (with epilepsy protocol). EEG within 24h. LP if febrile or immunocompromised.', pearl: 'Key epilepsy syndromes: Childhood absence: 3 Hz spike-and-wave, hyperventilation triggers, ethosuximide first-line. JME (Juvenile Myoclonic Epilepsy): morning myoclonic jerks + GTC, lifelong treatment, valproate first-line (avoid in women of childbearing age  teratogenic). Lennox-Gastaut: multiple seizure types, slow spike-and-wave, intellectual disability. West syndrome (infantile spasms): hypsarrhythmia, ACTH/vigabatrin.' },
      { term: 'Status Epilepticus', def: 'Continuous seizure >5 min or 2 seizures without return to baseline. MEDICAL EMERGENCY. Mortality ~20%. Convulsive > non-convulsive.', detail: 'Treatment algorithm: (0-5 min) ABCs, IV access, glucose/thiamine, labs. (5-20 min) Benzodiazepine: lorazepam 4 mg IV (repeat 1) OR midazolam 10 mg IM (RAMPART trial  IM midazolam non-inferior). (20-40 min) Second-line: fosphenytoin 20 mg PE/kg IV, or levetiracetam 60 mg/kg IV, or valproate 40 mg/kg IV (ESETT trial  all equivalent). (>40 min) Refractory: intubation + continuous infusion midazolam, propofol, or pentobarbital + continuous EEG monitoring.', pearl: 'Non-convulsive status epilepticus (NCSE): altered mental status without overt seizure activity. Diagnose with EEG. Common in ICU patients with unexplained AMS. Treat same as convulsive SE. Causes of status epilepticus: AED non-compliance (#1), alcohol withdrawal, CNS infection, metabolic (hyponatremia, hypoglycemia, hypocalcemia), structural (stroke, tumor, TBI).' },
      { term: 'Antiepileptic Drugs', def: 'First-line for focal: levetiracetam (Keppra  fewest drug interactions, no hepatotoxicity), lamotrigine, oxcarbazepine. First-line for generalized: valproate, lamotrigine, levetiracetam.', detail: 'Important side effects: Valproate  teratogenic (neural tube defects), hepatotoxic, pancreatitis, weight gain, tremor, thrombocytopenia. Carbamazepine  hyponatremia (SIADH), aplastic anemia, SJS (HLA-B*1502 in Asian descent  screen before starting), CYP inducer. Phenytoin  gingival hyperplasia, hirsutism, nystagmus, SJS, zero-order kinetics (small dose   large level ), CYP inducer.', pearl: 'Lamotrigine: titrate SLOWLY (especially with valproate  inhibits LTG metabolism  SJS risk). Requires 6-8 week titration. Women of childbearing age: lamotrigine or levetiracetam preferred (least teratogenic). Seizure-freedom 2 years  consider AED withdrawal (relapse risk ~30-50%). Stop driving during taper + 3-6 months (state-dependent laws).' },
    ]},
  { id: 'headache', title: 'Headache Syndromes', icon: '',
    items: [
      { term: 'Migraine', def: 'Unilateral, pulsating, moderate-severe, 4-72 hours. Nausea/vomiting, photophobia, phonophobia. Aura in ~25% (visual  scintillating scotoma, fortification spectra; sensory; language). F > M (3:1).', detail: 'Acute treatment: triptans (sumatriptan) first-line for moderate-severe. NSAIDs for mild-moderate. Antiemetics (metoclopramide, prochlorperazine). Avoid opioids and butalbital. Medication overuse headache: >10 days/month triptan or >15 days/month NSAID use  paradoxical worsening.', pearl: 'Preventive therapy (4 headache days/month, disabling): Beta-blockers (propranolol), TCAs (amitriptyline), anticonvulsants (topiramate, valproate), CGRP monoclonal antibodies (erenumab, fremanezumab, galcanezumab  newer, well-tolerated, monthly/quarterly SQ injection), onabotulinumtoxinA (Botox) for chronic migraine (15 days/month for 3 months). Gepants (rimegepant, ubrogepant): oral CGRP antagonists for acute treatment and/or prevention.' },
      { term: 'Tension-Type & Cluster', def: 'Tension: bilateral, pressing/tightening, mild-moderate, 30 min-7 days. No nausea, no worsening with activity. Most common headache. Cluster: severe unilateral orbital/temporal pain, 15-180 min, autonomic symptoms (tearing, rhinorrhea, ptosis, miosis). M > F. Circadian/circannual pattern.', detail: 'Cluster acute: 100% O (12-15 L/min via non-rebreather  15 min) or sumatriptan SQ. Prevention: verapamil (first-line), lithium, galcanezumab. Bridge with prednisone. DO NOT use beta-blockers for cluster (worsen).', pearl: 'Red flag headaches (SNOOPX): Systemic symptoms/Secondary risk factors, Neurologic deficits, Onset sudden (thunderclap), Older age (new >50), Pattern change, Positional (worse lying down =  ICP, worse standing = intracranial hypotension). Thunderclap DDx: SAH (#1 r/o), RCVS (reversible cerebral vasoconstriction), cervical artery dissection, CVT (cerebral venous thrombosis), pituitary apoplexy.' },
    ]},
  { id: 'neuromusc', title: 'Neuromuscular Disorders', icon: '',
    items: [
      { term: 'Myasthenia Gravis', def: 'Autoimmune  antibodies against postsynaptic nicotinic acetylcholine receptors (AChR-Ab 85%) or MuSK. Fatigable weakness  worsens with use, improves with rest. Ptosis, diplopia, bulbar symptoms (dysarthria, dysphagia), can progress to respiratory failure.', detail: 'Diagnosis: AChR antibodies (85% generalized, 50% ocular-only), if negative  anti-MuSK. Edrophonium (Tensilon) test (rarely used now). Repetitive nerve stimulation: decremental response. Single-fiber EMG: most sensitive. CT chest for thymoma (10-15%).', pearl: 'Treatment: pyridostigmine (symptomatic  AChE inhibitor). Immunosuppression: prednisone + steroid-sparing (azathioprine, mycophenolate). Thymectomy: all with thymoma + non-thymoma generalized MG (MGTX trial  benefits even without thymoma). Myasthenic crisis (respiratory failure): intubate early (don\'t wait for CO rise  diaphragm fatigue  sudden decompensation). IVIG or plasmapheresis. AVOID: aminoglycosides, fluoroquinolones, magnesium, beta-blockers, neuromuscular blockers  worsen MG.' },
      { term: 'Guillain-Barr Syndrome', def: 'Acute inflammatory demyelinating polyradiculoneuropathy (AIDP). Ascending symmetric weakness, areflexia, post-infectious (Campylobacter jejuni #1, CMV, EBV, Zika, influenza). Can progress to respiratory failure.', detail: 'Diagnosis: LP shows albuminocytologic dissociation ( protein, normal WBCs). NCS: demyelinating pattern (slowed conduction velocity, prolonged F-waves, conduction block). Subtypes: AIDP (most common in West), AMAN (axonal, C. jejuni, worse prognosis), Miller Fisher (ophthalmoplegia, ataxia, areflexia  anti-GQ1b antibodies).', pearl: 'Treatment: IVIG (0.4 g/kg/day  5 days) or plasmapheresis (equivalent efficacy, choose one  do NOT combine). Monitor respiratory function: FVC Q4-6h  intubate if FVC <20 mL/kg or declining (20-30-40 rule: FVC <20, NIF <30, >30% decline = intubate). Steroids are NOT effective and may worsen. Recovery: 80% walk independently at 6 months, but residual fatigue and weakness common. Pain is underrecognized  treat with gabapentin/pregabalin.' },
    ]},
];

export default function NeurologyGuideView() {
  const [activeId, setActiveId] = useState(null);
  const active = NEURO_SECTIONS.find(s => s.id === activeId);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2"> Neurology Guide</h2>
        <p className="text-xs opacity-40 mt-0.5">Stroke, seizures, headache & neuromuscular</p>
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
                  <div className="glass rounded-xl p-3 mt-2 flex items-start gap-2 text-xs" style={{ background: '#3b82f608', border: '1px solid #3b82f620', color: '#3b82f6' }}>
                    <span></span><span className="leading-relaxed">{item.pearl}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {NEURO_SECTIONS.map(s => (
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
