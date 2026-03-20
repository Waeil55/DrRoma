import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const OPHTHO_SECTIONS = [
  { id: 'redeye', title: 'Red Eye Differential', icon: '',
    items: [
      { term: 'Conjunctivitis', def: 'Inflammation of conjunctiva. Diffuse injection, no vision loss, no pain (just irritation). Normal pupil, normal pressure.', detail: 'Viral (most common): watery discharge, preauricular lymphadenopathy, bilateral. Bacterial: mucopurulent discharge, unilateral  bilateral. Allergic: bilateral, itching (hallmark), watery, chemosis.', pearl: 'Viral conjunctivitis: HIGHLY contagious (adenovirus). Self-limited 7-14 days. Supportive care (cool compresses, artificial tears). Allergic: mast cell stabilizers (olopatadine), avoid rubbing. Bacterial: topical antibiotic (erythromycin, fluoroquinolone). Gonococcal: hyperacute, profuse purulent  ophthalmology emergency (corneal perforation risk). Systemic + topical abx.' },
      { term: 'Acute Angle-Closure Glaucoma', def: 'EMERGENCY. Sudden  IOP (>40 mmHg). Severe eye pain, headache, N/V, halos around lights. Fixed mid-dilated pupil. Hazy cornea.', detail: 'Risk factors: hyperopia (farsighted), elderly, Asian descent, shallow anterior chamber. Triggered by: dim lighting, mydriatic drugs (anticholinergics, sympathomimetics).', pearl: 'Treatment: emergent IOP lowering. Timolol (-blocker) + pilocarpine (miotic) + apraclonidine (-agonist) + acetazolamide IV + mannitol IV if refractory. Definitive: laser peripheral iridotomy. Do NOT dilate the eye! Pilocarpine may not work initially (sphincter ischemia).' },
      { term: 'Anterior Uveitis (Iritis)', def: 'Ciliary flush (limbal injection), photophobia, deep aching pain, consensual photophobia (light in other eye causes pain). Cells and flare in anterior chamber.', detail: 'Associations: HLA-B27 (ankylosing spondylitis, reactive arthritis, IBD), sarcoidosis, herpes, syphilis, TB, juvenile idiopathic arthritis. Often recurrent.', pearl: 'Diagnose by slit lamp: cells (WBCs floating in anterior chamber) and flare (protein leakage). Treatment: topical steroids (prednisolone acetate) + cycloplegic (cyclopentolate  prevents synechiae and  pain). NEVER prescribe topical steroids without slit lamp  can worsen herpes keratitis.' },
      { term: 'Corneal Abrasion/Ulcer', def: 'Abrasion: epithelial defect, pain, tearing, foreign body sensation. Stains with fluorescein. Ulcer: infective, white infiltrate on cornea.', detail: 'Abrasion: topical antibiotic, NO patching (doesn\'t improve healing). Contact lens wearer with ulcer: ALWAYS cover Pseudomonas (fluoroquinolone drops Q1h). Refer urgently if ulcer suspected.', pearl: 'Contact lens corneal ulcer: Pseudomonas aeruginosa until proven otherwise. Can perforate in 24h. NEVER patch a contact lens-related corneal ulcer (worsens infection). Referral to ophthalmology SAME DAY.' },
    ]},
  { id: 'vision', title: 'Acute Vision Loss', icon: '',
    items: [
      { term: 'Central Retinal Artery Occlusion (CRAO)', def: 'PAINLESS sudden monocular vision loss. Cherry-red spot on fundoscopy (fovea visible through thin retina over choroid). Pale, edematous retina.', detail: 'Embolic source most common (carotid, cardiac). Relative afferent pupillary defect (RAPD) present. Only 90-120 minutes to save vision.', pearl: 'OCULAR STROKE  same workup as cerebral stroke: carotid imaging, echocardiography, rhythm monitoring. Only 90 min for retinal survival (similar to "time is brain"). Emergent ophthalmology consult. Ocular massage, anterior chamber paracentesis. tPA within 4.5h (investigational). Long-term: secondary prevention for atherosclerosis.' },
      { term: 'Central Retinal Vein Occlusion (CRVO)', def: 'PAINLESS. "Blood and thunder" fundus: widespread retinal hemorrhages, cotton-wool spots, disc edema, dilated veins.', detail: 'Risk factors: HTN, DM, glaucoma, hyperviscosity syndromes. Less acute than CRAO. Vision loss from macular edema. Complications: neovascularization  neovascular glaucoma (if ischemic type).', pearl: 'BRVO (branch) vs CRVO (central): BRVO = pie-shaped hemorrhages in one section. CRVO = all quadrants ("blood and thunder"). Treatment: anti-VEGF injections (ranibizumab, aflibercept) for macular edema. Ischemic CRVO: monitor closely for neovascularization.' },
      { term: 'Retinal Detachment', def: 'Flashes + floaters + "curtain coming down" over visual field. PAINLESS. Emergency.', detail: 'Types: rhegmatogenous (most common  retinal tear), tractional (diabetic, sickle cell), exudative (tumors, inflammation). Risk factors: myopia, prior cataract surgery, trauma, FHx.', pearl: 'Retinal detachment is an EMERGENCY. If macula ON (central vision preserved)  urgent (within 24h) surgery. If macula OFF  less urgent but still within days. Call ophthalmology immediately. Surgical options: pneumatic retinopexy, scleral buckle, vitrectomy.' },
      { term: 'Temporal (Giant Cell) Arteritis', def: 'Age >50. New headache, jaw claudication, scalp tenderness, polymyalgia rheumatica. ESR usually >50 (often >100). Risk: blindness (AION).', detail: 'Anterior ischemic optic neuropathy (AION): sudden painless vision loss from ciliary artery inflammation. Risk of bilateral blindness if untreated. Temporal artery biopsy: gold standard (skip lesions  must get 2 cm).', pearl: 'DO NOT WAIT for biopsy to start steroids. Treat with high-dose prednisone (60-80 mg/day) or IV methylprednisolone (if visual symptoms) IMMEDIATELY. Biopsy remains positive for 1-2 weeks after starting steroids. CRP may be more sensitive than ESR. Tocilizumab is steroid-sparing agent (GiACTA trial).' },
    ]},
  { id: 'emergencies', title: 'Ocular Emergencies', icon: '',
    items: [
      { term: 'Chemical Burns', def: 'ALKALI worse than acid (penetrates deeper  liquefactive necrosis). Begin irrigation IMMEDIATELY. Do not wait for anything.', detail: 'Irrigation: normal saline or water for minimum 30 minutes continuously (2L). Check pH every 15 min  continue until pH 7.0-7.4 neutral. Alkali injuries: NaOH (lye), ammonia, lime (cement). Acid injuries: battery acid, pool chemicals.', pearl: 'Chemical burn is THE #1 ocular emergency. IRRIGATE FIRST  before any examination, visual acuity check, or anything else. Alkali penetrates rapidly (within seconds). Morgan lens for continuous irrigation. Refer to ophthalmology after stabilization.' },
      { term: 'Orbital Cellulitis', def: 'BEHIND the orbital septum. Proptosis, restricted/painful eye movements,  vision, fever. Most from ethmoid sinusitis. Can be vision- and life-threatening.', detail: 'CT orbits with contrast (or MRI): identify abscess, assess sinuses. Treatment: IV broad-spectrum antibiotics (vancomycin + Unasyn or ceftriaxone + metronidazole). Surgical drainage if abscess or no improvement in 48h.', pearl: 'Preseptal (periorbital) vs orbital cellulitis: Key differences  orbital: proptosis, ophthalmoplegia, vision (preseptal has NONE of these). Preseptal: lid swelling only, no proptosis/ophthalmoplegia, normal vision. Preseptal can be treated outpatient (oral abx). Orbital = ADMISSION + IV abx.' },
      { term: 'Hyphema', def: 'Blood in anterior chamber. Layering RBCs visible. Usually from trauma. Risk of rebleeding (day 3-5) and  IOP.', detail: 'Management: shield eye (no patch  need to monitor), head of bed 30-45°, cycloplegic (atropine), topical steroid. Bed rest. Rebleed risk: 20% at 3-5 days.', pearl: 'AVOID aspirin/NSAIDs (rebleed risk). Sickle cell patients: high risk for IOP and optic nerve damage  avoid carbonic anhydrase inhibitors (acetazolamide) and check sickle prep/Hgb electrophoresis. IOP >24 mmHg in sickle cell  emergent ophthalmology.' },
    ]},
];

function OphthalmologyGuideView() {
  const [activeId, setActiveId] = useState(null);
  const active = OPHTHO_SECTIONS.find(s => s.id === activeId);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2"> Ophthalmology Guide</h2>
        <p className="text-xs opacity-40 mt-0.5">Red eye, vision loss & ocular emergencies</p>
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
                <h3 className="font-black text-lg" style={{ color: 'var(--accent)' }}>{item.term}</h3>
                <p className="text-sm opacity-80 leading-relaxed">{item.def}</p>
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
            {OPHTHO_SECTIONS.map(s => (
              <button key={s.id} onClick={() => setActiveId(s.id)}
                className="glass rounded-2xl p-5 text-left transition-all card-hover"
                style={{ border: '1px solid var(--border)' }}>
                <div className="text-3xl mb-2">{s.icon}</div>
                <h3 className="font-black">{s.title}</h3>
                <p className="text-xs opacity-40 mt-1">{s.items.length} conditions</p>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default OphthalmologyGuideView;
