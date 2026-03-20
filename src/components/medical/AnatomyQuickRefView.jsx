import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const ANATOMY_SYSTEMS = [
  { id: 'cardiac', name: 'Heart & Great Vessels', icon: '',
    structures: [
      { name: 'Right Atrium', details: 'Receives deoxygenated blood from SVC, IVC, coronary sinus. SA node (pacemaker) located here. Tricuspid valve  RV.' },
      { name: 'Right Ventricle', details: 'Pumps to pulmonary artery via pulmonic valve. Wall thinner than LV (low-pressure circuit). Moderator band = landmark.' },
      { name: 'Left Atrium', details: 'Receives oxygenated blood from 4 pulmonary veins. Mitral (bicuspid) valve  LV. Most common site of atrial myxoma.' },
      { name: 'Left Ventricle', details: 'Thickest wall. Pumps to aorta via aortic valve. Supplies systemic circulation. Apex = PMI at 5th ICS MCL.' },
      { name: 'Coronary Arteries', details: 'LAD: anterior wall, septum (widow-maker). LCx: lateral, posterior wall. RCA: inferior wall, SA node (60%), AV node (80%). Right dominance in 85%.' },
      { name: 'Cardiac Conduction', details: 'SA node  atrial depolarization  AV node (0.1s delay)  Bundle of His  Left & Right bundle branches  Purkinje fibers.' },
      { name: 'Pericardium', details: 'Fibrous (outer) + serous (visceral/epicardium + parietal). Pericardial space: 15-50 mL fluid normally. Tamponade at >150 mL rapid.' },
    ],
    clinicalCorrelations: [
      'LAD occlusion  anterior STEMI (V1-V4 ST elevation)',
      'RCA occlusion  inferior STEMI (II, III, aVF) + possible AV block',
      'Beck triad (tamponade): hypotension, JVD, muffled heart sounds',
      'Atrial fibrillation: irregular irregularly, loss of P waves, f waves',
    ]},
  { id: 'respiratory', name: 'Respiratory System', icon: '',
    structures: [
      { name: 'Trachea', details: 'C-shaped cartilage rings. Bifurcates at carina (T4-T5). Right main bronchus: wider, shorter, more vertical  foreign body aspiration.' },
      { name: 'Right Lung', details: '3 lobes (upper, middle, lower), 2 fissures (oblique, horizontal). 10 bronchopulmonary segments. Slightly larger than left.' },
      { name: 'Left Lung', details: '2 lobes (upper, lower), 1 fissure (oblique). Lingula (LUL) = equivalent of right middle lobe. Cardiac notch indentation.' },
      { name: 'Pleura', details: 'Visceral (on lung) + parietal (on chest wall). Pleural space: potential space with ~5 mL fluid. Negative pressure maintains inflation.' },
      { name: 'Diaphragm', details: 'C3-4-5 (phrenic nerve) keeps the diaphragm alive. Right hemidiaphragm slightly higher (liver). Central tendon, dome shape.' },
      { name: 'Alveoli', details: '~300 million. Type I (95% surface, gas exchange). Type II (surfactant production, replenish Type I). Respiratory membrane = 0.5 m.' },
    ],
    clinicalCorrelations: [
      'Tension pneumothorax: tracheal deviation AWAY, absent breath sounds, hypotension  needle decompression 2nd ICS MCL',
      'Right main bronchus aspiration most common (wider, more vertical)',
      'Pleural effusion: dullness to percussion, decreased breath sounds, meniscus on CXR',
      'Phrenic nerve palsy (C3-5): elevated hemidiaphragm on CXR',
    ]},
  { id: 'neuro', name: 'Central Nervous System', icon: '',
    structures: [
      { name: 'Frontal Lobe', details: 'Motor cortex (precentral gyrus), Broca area (speech production, dominant hemisphere), prefrontal cortex (personality, judgment, executive function).' },
      { name: 'Parietal Lobe', details: 'Somatosensory cortex (postcentral gyrus). Spatial awareness, proprioception. Dominant: calculation, language. Non-dominant: neglect syndrome.' },
      { name: 'Temporal Lobe', details: 'Wernicke area (speech comprehension, dominant). Hippocampus (memory formation). Auditory cortex. Seizure focus  dj vu, olfactory aura.' },
      { name: 'Occipital Lobe', details: 'Primary visual cortex. Lesion  contralateral homonymous hemianopia with macular sparing (MCA doesn\'t supply macular area, PCA does).' },
      { name: 'Brainstem', details: 'Midbrain (CN III, IV), Pons (CN V, VI, VII, VIII), Medulla (CN IX, X, XI, XII). Vital centers: respiratory, cardiovascular.' },
      { name: 'Cerebellum', details: 'Coordination, balance, fine motor. Lesion  ipsilateral ataxia. Vermis  truncal ataxia (wide-based gait). Hemisphere  limb ataxia (dysmetria).' },
      { name: 'Circle of Willis', details: 'ACA, AComm, MCA (from ICA). PCA, PComm, basilar (vertebrobasilar). Most common berry aneurysm: AComm.' },
      { name: 'CSF Pathway', details: 'Choroid plexus (lateral ventricles)  foramen of Monro  3rd ventricle  aqueduct of Sylvius  4th ventricle  foramina of Luschka/Magendie  subarachnoid space  arachnoid granulations  venous sinuses.' },
    ],
    clinicalCorrelations: [
      'MCA stroke: contralateral face/arm weakness > leg, aphasia (dominant), neglect (non-dominant)',
      'ACA stroke: contralateral leg weakness > arm/face',
      'Broca aphasia (expressive): "broken speech"  understands but can\'t produce fluent speech',
      'Wernicke aphasia (receptive): fluent but nonsensical speech, poor comprehension',
      'CN III palsy: "down and out" eye, ptosis, mydriasis  PComm aneurysm until proven otherwise',
    ]},
  { id: 'gi', name: 'GI & Hepatobiliary', icon: '',
    structures: [
      { name: 'Esophagus', details: 'Upper 1/3 skeletal muscle, lower 2/3 smooth. LES prevents reflux. Barrett esophagus: intestinal metaplasia from chronic GERD   cancer risk.' },
      { name: 'Stomach', details: 'Fundus, body, antrum, pylorus. Parietal cells: HCl + intrinsic factor (B12 absorption). Chief cells: pepsinogen. G cells: gastrin.' },
      { name: 'Duodenum', details: '4 parts. Ampulla of Vater (D2): bile + pancreatic duct entry. Duodenal ulcers: anterior = perforation, posterior = GDA bleed.' },
      { name: 'Liver', details: 'Right lobe (larger), left lobe, caudate, quadrate. Portal triad: hepatic artery, portal vein, bile duct. Dual blood supply (75% portal vein, 25% hepatic artery).' },
      { name: 'Gallbladder', details: 'Stores/concentrates bile. Cystic duct  common bile duct. Courvoisier sign: painless palpable gallbladder = pancreatic head cancer (not gallstones).' },
      { name: 'Pancreas', details: 'Head (within duodenal C-loop), body, tail (near spleen). Exocrine: digestive enzymes. Endocrine (Islets): alpha (glucagon), beta (insulin), delta (somatostatin).' },
      { name: 'Appendix', details: 'Arises from cecum, base at McBurney point. Lymphoid tissue. Appendicitis: periumbilical pain  RLQ (visceral  parietal peritoneum irritation).' },
    ],
    clinicalCorrelations: [
      'Anterior duodenal ulcer perforates  peritonitis + free air on upright CXR',
      'Posterior duodenal ulcer erodes GDA  massive GI bleed',
      'Hepatic encephalopathy: asterixis, confusion   ammonia crosses BBB',
      'Gallstone ileus: air in biliary tree (pneumobilia) + SBO  stone fistulizes through gallbladder to duodenum',
    ]},
];

export default function AnatomyQuickRefView() {
  const [activeId, setActiveId] = useState(null);
  const active = ANATOMY_SYSTEMS.find(s => s.id === activeId);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2"> Anatomy Reference</h2>
        <p className="text-xs opacity-40 mt-0.5">Body systems with clinical correlations</p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {active ? (
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveId(null)} className="glass w-9 h-9 rounded-xl flex items-center justify-center"><ChevronLeft size={16} /></button>
              <h2 className="font-black">{active.icon} {active.name}</h2>
            </div>

            {active.structures.map((s, i) => (
              <div key={i} className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
                <h3 className="font-black text-sm mb-2 flex items-center gap-2">
                  <span className="w-6 h-6 rounded-lg flex items-center justify-center text-xs font-black shrink-0" style={{ background: 'var(--accent)/15', color: 'var(--accent)' }}>{i + 1}</span>
                  {s.name}
                </h3>
                <p className="text-xs opacity-70 leading-relaxed">{s.details}</p>
              </div>
            ))}

            {active.clinicalCorrelations?.length > 0 && (
              <div className="glass rounded-2xl p-5" style={{ border: '1px solid #f59e0b20', background: '#f59e0b05' }}>
                <h3 className="font-black text-sm flex items-center gap-2 mb-3" style={{ color: '#f59e0b' }}> Clinical Correlations</h3>
                {active.clinicalCorrelations.map((cc, i) => (
                  <div key={i} className="flex gap-2 text-xs py-1.5">
                    <span style={{ color: '#f59e0b' }}></span>
                    <span className="opacity-70 leading-relaxed">{cc}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ANATOMY_SYSTEMS.map(sys => (
              <button key={sys.id} onClick={() => setActiveId(sys.id)}
                className="glass rounded-2xl p-5 text-left transition-all card-hover"
                style={{ border: '1px solid var(--border)' }}>
                <div className="text-3xl mb-3">{sys.icon}</div>
                <h3 className="font-black">{sys.name}</h3>
                <p className="text-xs opacity-40 mt-1">{sys.structures.length} structures · {sys.clinicalCorrelations?.length || 0} correlations</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
