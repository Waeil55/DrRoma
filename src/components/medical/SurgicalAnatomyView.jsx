import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const SURG_ANATOMY = [
  { id: 'abd', title: 'Abdominal Surgery', icon: '',
    items: [
      { term: 'Calot\'s Triangle (Hepatocystic)', def: 'Bounded by: cystic duct, common hepatic duct, inferior liver edge. Contains: cystic artery (from R. hepatic).', detail: 'Critical View of Safety (CVS): gold standard for identifying structures during laparoscopic cholecystectomy. Must clearly identify 2 structures (cystic duct + cystic artery) entering the gallbladder. Failure to achieve CVS  consider subtotal cholecystectomy or open conversion.', pearl: 'Bile duct injury rate ~0.5%. Most common mechanism: misidentification of CBD as cystic duct. Always obtain CVS before clipping anything. If anatomy unclear  "bail out" strategies save lives.' },
      { term: 'Hesselbach\'s Triangle', def: 'Bounded by: inguinal ligament (inferior), inferior epigastric vessels (lateral), lateral border of rectus abdominis (medial). Direct inguinal hernia passes through this triangle.', detail: 'Direct hernias: through Hesselbach\'s, medial to inferior epigastric vessels. Indirect hernias: through deep inguinal ring, lateral to inferior epigastric vessels. Indirect follows the cord through inguinal canal.', pearl: 'Mnemonic: "MDs don\'t LIe"  Medial = Direct, Lateral = Indirect. Most common hernia in BOTH sexes: indirect. Strangulation risk highest: femoral > indirect > direct.' },
      { term: 'Layers of Abdominal Wall', def: 'From superficial to deep: Skin  Camper\'s fascia  Scarpa\'s fascia  External oblique  Internal oblique  Transversus abdominis  Transversalis fascia  Preperitoneal fat  Parietal peritoneum', detail: 'McBurney\'s point: 1/3 from ASIS to umbilicus (appendix base). Arcuate line: where posterior rectus sheath ends (below umbilicus). Below arcuate: all aponeuroses pass anterior to rectus muscle.', pearl: 'Appendectomy uses muscle-splitting technique through oblique muscles (McBurney or Lanz incision). Pfannenstiel: transverse, cosmetic, avoids nerve damage  used for C-section, pelvic surgery.' },
      { term: 'Retroperitoneal Structures', def: '"SAD PUCKER"  Suprarenal glands, Aorta/IVC, Duodenum (2nd-4th parts), Pancreas (except tail), Ureters, Colon (ascending + descending), Kidneys, Esophagus (abdominal), Rectum', detail: 'Surgical significance: retroperitoneal hematoma can be large and occult. Zone I (midline): almost always explore. Zone II (flank/kidney): explore if penetrating, observe if blunt (unless expanding). Zone III (pelvis): avoid exploration (pelvic fracture bleeding  angiography).', pearl: 'Duodenal injury can be missed  retroperitoneal perforation doesn\'t cause classic peritonitis. Look for retroperitoneal air on CT. High index of suspicion with seatbelt injuries.' },
    ]},
  { id: 'neck', title: 'Neck Surgery', icon: '',
    items: [
      { term: 'Zones of the Neck (Trauma)', def: 'Zone I: clavicle to cricoid. Zone II: cricoid to angle of mandible. Zone III: angle of mandible to skull base.', detail: 'Zone II penetrating injury  traditionally "explore all" (most accessible). Zone I and III  CTA/angiography first (difficult surgical access). Modern approach: CTA for all zones, selective exploration.', pearl: 'Zone I injuries more lethal (great vessels, thoracic inlet). Zone III most difficult to access (may need mandible subluxation, risk to CN VII, XII). Zone II most forgiving surgically.' },
      { term: 'Thyroidectomy  Recurrent Laryngeal Nerve', def: 'RLN runs in tracheoesophageal groove. Right RLN loops around right subclavian. Left RLN loops around aortic arch. Motor to ALL laryngeal muscles EXCEPT cricothyroid (external branch of SLN).', detail: 'Injury  hoarseness (unilateral), airway obstruction (bilateral). Superior laryngeal nerve external branch: injury  loss of high-pitched voice. Identify and preserve during thyroidectomy.', pearl: 'Non-recurrent laryngeal nerve (0.6% right side): associated with aberrant right subclavian artery (arteria lusoria). Takes a direct path to larynx instead of looping. Extremely rare on left side.' },
      { term: 'Parathyroid Glands', def: '4 glands (2 superior fixed position, 2 inferior variable). Supplied by inferior thyroid artery. Preserve blood supply during thyroidectomy.', detail: 'Accidental removal  hypocalcemia. Post-thyroidectomy hypocalcemia: check calcium Q6h. Symptoms: perioral numbness, Chvostek sign, Trousseau sign, QTc prolongation. Severe: IV calcium gluconate 10%.', pearl: 'Hungry bone syndrome after parathyroidectomy for hyperPTH: massive calcium uptake by bones after PTH normalizes. Can cause severe hypocalcemia. Monitor closely 24-72h post-op.' },
    ]},
  { id: 'vascular', title: 'Vascular Anatomy', icon: '',
    items: [
      { term: 'Aortic Branches', def: 'Celiac trunk (T12): left gastric, splenic, common hepatic. SMA (L1): jejunum, ileum, cecum, ascending/transverse colon. IMA (L3): descending colon, sigmoid, upper rectum.', detail: 'Marginal artery of Drummond: connects SMA and IMA along colon. Arc of Riolan: direct SMA-IMA connection. Watershed areas: splenic flexure (Griffiths\'), rectosigmoid (Sudeck\'s).', pearl: 'During AAA repair: reimplant IMA if back-bleeding poor (indicates poor collateral flow). Sigmoid ischemia (bloody diarrhea post-AAA)  colonoscopy within 24h. Splenic flexure most vulnerable to ischemia in low-flow states.' },
      { term: 'Femoral Triangle', def: 'Bounded by: inguinal ligament (superior), sartorius (lateral), adductor longus (medial). Floor: iliopsoas + pectineus. Contains (lateral to medial): Nerve, Artery, Vein, Lymphatics (NAVEL).', detail: 'Femoral sheath contains (medial to lateral): femoral canal (lymphatics), femoral vein, femoral artery. Femoral nerve is OUTSIDE the sheath. Femoral hernia: through femoral canal, medial to femoral vein.', pearl: 'Femoral hernia incarceration: more common in women (wider pelvis). High strangulation risk due to rigid boundaries (lacunar ligament). Emergency repair needed. McVay (Cooper ligament) repair closes femoral canal.' },
      { term: 'Carotid Surgery', def: 'Carotid endarterectomy (CEA) for symptomatic 50% stenosis or asymptomatic 60-70% stenosis. Bifurcation at C3-4 (thyroid cartilage level).', detail: 'Nerves at risk: hypoglossal (XII  tongue deviation toward injury), vagus (X  vocal cord paralysis), marginal mandibular branch of VII (smile asymmetry), glossopharyngeal (IX  dysphagia). Landmark: Identify hypoglossal nerve crossing ICA/ECA.', pearl: 'Shunt placement during CEA if stump pressure <25 mmHg or EEG changes (cerebral ischemia). Post-op: hyperperfusion syndrome if severe pre-op stenosis  headache, HTN, seizures, hemorrhagic stroke. Strict BP control post-op.' },
    ]},
];

function SurgicalAnatomyView() {
  const [activeId, setActiveId] = useState(null);
  const active = SURG_ANATOMY.find(s => s.id === activeId);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2"> Surgical Anatomy</h2>
        <p className="text-xs opacity-40 mt-0.5">Key anatomical relationships for surgery</p>
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
                  <div className="glass rounded-xl p-3 mt-2 flex items-start gap-2 text-xs" style={{ background: '#ef444408', border: '1px solid #ef444420', color: '#ef4444' }}>
                    <span></span><span className="leading-relaxed">{item.pearl}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {SURG_ANATOMY.map(s => (
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

export default SurgicalAnatomyView;
