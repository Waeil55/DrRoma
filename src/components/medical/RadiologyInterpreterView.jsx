import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const RADIOLOGY_APPROACHES = [
  { id: 'cxr', title: 'Chest X-Ray (CXR)', icon: '',
    systematic: [
      { area: 'Technical Quality (RIPE)', checks: ['Rotation: spinous processes equidistant between clavicle heads', 'Inspiration: 5-6 anterior ribs visible above diaphragm', 'Penetration: vertebral bodies just visible behind heart', 'Exposure: adequate brightness/contrast'] },
      { area: 'Airway', checks: ['Trachea: midline (deviation → tension pneumothorax, mass, collapse)', 'Carina: bifurcation at T4-T5', 'Main bronchi: right wider + more vertical', 'ETT if present: tip 2-4 cm above carina'] },
      { area: 'Breathing (Lungs)', checks: ['Compare both lung fields systematically', 'Upper zones, mid zones, lower zones', 'Costophrenic angles (blunting = effusion >200 mL)', 'Consolidation (air bronchograms = pneumonia)', 'Mass/nodule (coin lesion)', 'Pneumothorax (absent lung markings peripherally)'] },
      { area: 'Cardiac', checks: ['Heart size: CTR <50% on PA (not reliable on AP)', 'Heart borders: right = RA, left = LV', 'Mediastinal width: <8 cm (widened = aortic dissection, lymphoma)', 'Aortic knuckle: calcification, unfolding'] },
      { area: 'Diaphragm', checks: ['Right hemidiaphragm slightly higher (liver)', 'Free air under diaphragm = perforation (upright film)', 'Elevated hemidiaphragm: phrenic nerve palsy, collapse, hepatomegaly'] },
      { area: 'Everything else', checks: ['Soft tissues: surgical emphysema, mastectomy', 'Bones: ribs (fractures, metastases), clavicles, spine', 'Review areas: apices, behind heart, below diaphragm, hilar regions'] },
    ],
    commonFindings: [
      { finding: 'White-out hemithorax', ddx: 'Large effusion, total collapse, pneumonia, post-pneumonectomy' },
      { finding: 'Bilateral hilar lymphadenopathy', ddx: 'Sarcoidosis, lymphoma, TB, metastases' },
      { finding: 'Ring shadow / cavity', ddx: 'Abscess, TB, Wegener (GPA), squamous cell carcinoma, Aspergilloma' },
      { finding: 'Bilateral diffuse infiltrates', ddx: 'ARDS, pulmonary edema, bilateral pneumonia, pulmonary hemorrhage' },
      { finding: 'Kerley B lines', ddx: 'Pulmonary edema (interstitial), lymphangitic carcinomatosis' },
    ]},
  { id: 'axr', title: 'Abdominal X-Ray (AXR)', icon: '',
    systematic: [
      { area: 'Technical', checks: ['Supine or erect', 'Adequate coverage: diaphragm to symphysis pubis', 'Patient ID and date'] },
      { area: 'Gas Pattern', checks: ['Small bowel: central, valvulae conniventes (cross entire lumen)', 'Large bowel: peripheral, haustra (do NOT cross entire lumen)', 'Small bowel obstruction: dilated >3 cm, multiple air-fluid levels (erect)', 'Large bowel obstruction: dilated >6 cm (>9 cm cecum = risk of perforation)'] },
      { area: 'Solid Organs', checks: ['Liver: right upper quadrant, hepatomegaly', 'Spleen: left upper quadrant, splenomegaly', 'Kidneys: psoas shadow, renal outline', 'Bladder: central pelvic density'] },
      { area: 'Calcifications', checks: ['Renal stones (90% radio-opaque)', 'Gallstones (10% radio-opaque)', 'Pancreatic calcification (chronic pancreatitis)', 'Aortic calcification (atherosclerosis, aneurysm)', 'Phleboliths (pelvic, rounded with lucent center — benign)'] },
      { area: 'Bones & Soft Tissue', checks: ['Lumbar spine: fractures, degenerative changes', 'Pelvis/hips: fractures, AVN', 'Sacroiliac joints: ankylosing spondylitis'] },
    ],
    commonFindings: [
      { finding: 'Dilated small bowel + transition point', ddx: 'Adhesions (#1), hernia, tumor, gallstone ileus' },
      { finding: 'Dilated large bowel + "coffee bean" sign', ddx: 'Sigmoid volvulus' },
      { finding: 'Pneumoperitoneum (free air)', ddx: 'Perforated viscus (peptic ulcer, diverticulitis, appendicitis) — surgical emergency' },
      { finding: 'Thumbprinting of colon', ddx: 'Ischemic colitis, C.diff, IBD' },
    ]},
];

export default function RadiologyInterpreterView() {
  const [activeId, setActiveId] = useState(null);
  const active = RADIOLOGY_APPROACHES.find(r => r.id === activeId);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2"> Radiology Guide</h2>
        <p className="text-xs opacity-40 mt-0.5">Systematic approach to reading imaging</p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {active ? (
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <button onClick={() => setActiveId(null)} className="glass w-9 h-9 rounded-xl flex items-center justify-center"><ChevronLeft size={16} /></button>
              <h2 className="font-black">{active.icon} {active.title}</h2>
            </div>

            {active.systematic.map((area, ai) => (
              <div key={ai} className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
                <h3 className="font-black text-sm flex items-center gap-2 mb-3">
                  <span className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black" style={{ background: 'var(--accent)', color: '#fff' }}>{ai + 1}</span>
                  {area.area}
                </h3>
                <div className="space-y-1.5">
                  {area.checks.map((check, ci) => (
                    <div key={ci} className="flex items-start gap-2 text-xs py-0.5">
                      <span style={{ color: 'var(--accent)' }}>▫</span>
                      <span className="opacity-70 leading-relaxed">{check}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {active.commonFindings?.length > 0 && (
              <div className="glass rounded-2xl p-5" style={{ border: '1px solid #f59e0b20', background: '#f59e0b05' }}>
                <h3 className="font-black text-sm flex items-center gap-2 mb-3" style={{ color: '#f59e0b' }}> Common Findings & DDx</h3>
                {active.commonFindings.map((f, i) => (
                  <div key={i} className="py-2" style={{ borderBottom: i < active.commonFindings.length - 1 ? '1px solid var(--border)' : 'none' }}>
                    <div className="text-xs font-black mb-1">{f.finding}</div>
                    <div className="text-xs opacity-50">DDx: {f.ddx}</div>
                  </div>
                ))}
              </div>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {RADIOLOGY_APPROACHES.map(r => (
              <button key={r.id} onClick={() => setActiveId(r.id)}
                className="glass rounded-2xl p-5 text-left transition-all card-hover"
                style={{ border: '1px solid var(--border)' }}>
                <div className="text-3xl mb-2">{r.icon}</div>
                <h3 className="font-black">{r.title}</h3>
                <p className="text-xs opacity-40 mt-1">{r.systematic.length} systematic areas · {r.commonFindings?.length || 0} key findings</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
