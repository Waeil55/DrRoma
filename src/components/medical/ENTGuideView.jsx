import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const ENT_SECTIONS = [
  { id: 'ear', title: 'Ear Disorders', icon: '👂',
    items: [
      { term: 'Otitis Media', def: 'Acute OM (AOM): middle ear infection. MC in children 6-24 months. S. pneumoniae, non-typeable H. influenzae, M. catarrhalis. Bulging, erythematous, immobile TM.', detail: 'Treatment: amoxicillin 80-90 mg/kg/day first-line. If treatment failure at 48-72h: amoxicillin-clavulanate. PCN allergy: cefdinir, ceftriaxone IM. Tympanostomy tubes: ≥3 episodes in 6 months or ≥4 in 12 months with effusion; chronic OME >3 months with bilateral hearing loss.', pearl: 'Observation option (delayed antibiotics): age ≥2 years with unilateral AOM and mild symptoms — can observe 48-72h with follow-up. Reduces unnecessary antibiotic use. Otitis media with effusion (OME): NOT infection — serous fluid in middle ear, typically follows AOM. Do NOT treat with antibiotics. Watch 3 months, then hearing test → tubes if bilateral hearing loss. Complications of AOM: TM perforation, mastoiditis (post-auricular swelling, tenderness, protrusion of auricle — CT temporal bones, IV antibiotics ± myringotomy ± mastoidectomy), cholesteatoma (chronic), intracranial (rare): meningitis, brain abscess, lateral sinus thrombosis.' },
      { term: 'Hearing Loss', def: 'Conductive: outer/middle ear (cerumen impaction, OE, OM, otosclerosis, TM perforation, cholesteatoma). Weber lateralizes TO affected ear. Rinne: bone > air (BC > AC). Sensorineural: inner ear/CN VIII (presbycusis, noise-induced, Meniere\'s, acoustic neuroma, ototoxic drugs). Weber lateralizes AWAY from affected ear. Rinne: air > bone (AC > BC, but both diminished).', detail: 'Sudden sensorineural hearing loss (SSNHL): ≥30 dB loss over ≤3 days at ≥3 contiguous frequencies. ENT emergency. Treatment: oral or intratympanic steroids within 2 weeks (earlier = better). MRI to rule out acoustic neuroma (vestibular schwannoma). Ototoxic drugs: aminoglycosides (irreversible), cisplatin, loop diuretics, aspirin (reversible tinnitus).', pearl: 'Otosclerosis: abnormal bone remodeling of stapes → conductive hearing loss, typically young women, bilateral. Schwartze sign (pink blush on promontory). Audiogram: Carhart notch at 2 kHz on bone conduction. Treatment: hearing aids or stapedectomy. Cholesteatoma: squamous epithelium in middle ear eroding ossicles/bone. White pearly mass behind TM. Chronic foul-smelling otorrhea unresponsive to antibiotics. CT temporal bones. Surgery (tympanomastoidectomy) — can erode into lateral semicircular canal (vertigo), facial nerve (facial weakness), tegmen tympani (intracranial complications).' },
      { term: 'Vertigo', def: 'BPPV: most common. Brief episodes triggered by head position changes. Diagnosis: Dix-Hallpike maneuver (upbeat torsional nystagmus with fatigability). Treatment: Epley maneuver (canalith repositioning — 80% cure rate in one session). Meniere\'s disease: episodic vertigo (20 min-12h), fluctuating low-frequency SNHL, tinnitus, aural fullness.', detail: 'Meniere\'s: endolymphatic hydrops. Treatment: low-sodium diet (<2g/day), diuretics (HCTZ/triamterene), betahistine. Acute attacks: vestibular suppressants (meclizine, diazepam). Refractory: intratympanic dexamethasone or gentamicin (chemical labyrinthectomy), endolymphatic sac decompression. Vestibular neuritis: sudden severe vertigo lasting days, horizontal nystagmus (away from affected ear), no hearing loss. Usually post-viral (HSV-1). Treatment: vestibular suppressants short-term + vestibular rehabilitation (PT).', pearl: 'HINTS exam (for acute vestigo): Head Impulse, Nystagmus, Test of Skew. Central pattern (stroke): NORMAL head impulse test (no corrective saccade), direction-changing nystagmus, skew deviation. Peripheral pattern: abnormal HIT (corrective saccade), unidirectional nystagmus (fast phase away from lesion), no skew. HINTS is MORE sensitive than early MRI for posterior circulation stroke in acute vestibular syndrome. If central pattern → emergent MRI/MRA + neurology consult.' },
    ]},
  { id: 'nose', title: 'Nose & Sinus', icon: '👃',
    items: [
      { term: 'Sinusitis', def: 'Acute rhinosinusitis (ARS): <4 weeks. Viral (common cold) >> bacterial. Bacterial if: symptoms >10 days without improvement, OR severe onset (fever ≥39°C + purulent discharge ≥3 days), OR "double-sickening" (initial improvement then worsening at day 5-6).', detail: 'MC bacterial pathogens: S. pneumoniae, H. influenzae, M. catarrhalis. First-line: amoxicillin-clavulanate (not plain amoxicillin anymore — ARS guidelines). PCN allergy: doxycycline or respiratory fluoroquinolone. Duration: 5-7 days (adults), 10-14 days (children). Adjuncts: nasal saline irrigation, intranasal steroids.', pearl: 'Do NOT prescribe antibiotics for viral URI or acute viral rhinosinusitis (vast majority of cases). Complications of bacterial sinusitis: orbital (preseptal cellulitis → orbital cellulitis → subperiosteal abscess → orbital abscess → cavernous sinus thrombosis). Chandler classification. CT orbits + sinuses. IV antibiotics + surgical drainage for orbital complications. Intracranial: frontal bone osteomyelitis (Pott puffy tumor — frontal sinusitis in adolescents), epidural/subdural abscess, meningitis, brain abscess.' },
      { term: 'Epistaxis', def: 'Anterior (90%): Kiesselbach\'s plexus (Little\'s area) — visible, easy to treat with direct pressure × 15 min + topical oxymetazoline. Silver nitrate cautery if visible bleeding point. Anterior packing (Merocel, Rapid Rhino) if persists.', detail: 'Posterior (10%): sphenopalatine artery. More severe, harder to control. Posterior packing (Foley catheter balloon or posterior nasal pack) → admit for monitoring (vagal response, airway compromise). May need endoscopic sphenopalatine artery ligation or embolization.', pearl: 'Hereditary Hemorrhagic Telangiectasia (HHT/Osler-Weber-Rendu): autosomal dominant. Telangiectasias on lips/tongue/fingertips, recurrent epistaxis, AVM\'s (pulmonary → paradoxical embolism/stroke, hepatic, cerebral). Screen: CT chest for pulmonary AVMs. Curaçao criteria for diagnosis. Juvenile nasopharyngeal angiofibroma: benign but locally aggressive vascular tumor in ADOLESCENT MALES. Unilateral nasal obstruction + recurrent epistaxis. Do NOT biopsy (hemorrhage risk). CT/MRI + embolization before surgical excision.' },
    ]},
  { id: 'throat', title: 'Throat & Airway', icon: '🗣️',
    items: [
      { term: 'Pharyngitis & Tonsillitis', def: 'Viral (majority — rhinovirus, adenovirus, EBV). GAS (Group A Strep): Centor criteria (fever, tonsillar exudates, tender anterior cervical lymphadenopathy, absence of cough). Modified: age 3-14 → +1 point, >45 → -1 point. Score ≥3 → rapid strep test ± throat culture.', detail: 'GAS treatment: penicillin V 500 mg BID × 10 days (or amoxicillin 50 mg/kg once daily × 10 days). IM benzathine penicillin 1.2 MU single dose. PCN allergy: azithromycin, cephalosporins (if not anaphylactic). Purpose: prevent rheumatic fever (within 9 days of symptoms), reduce symptom duration, decrease transmission.', pearl: 'Peritonsillar abscess (PTA): MC deep neck space infection. Unilateral tonsillar swelling with uvular deviation, "hot potato" voice, trismus, drooling. Treatment: needle aspiration ± incision and drainage + antibiotics (amoxicillin-clavulanate or clindamycin). EBV/Mono: if amoxicillin given → diffuse maculopapular rash (not true allergy, but avoid ampicillin/amoxicillin during acute mono). Spleen precaution: no contact sports × 3-4 weeks (splenic rupture risk). Atypical lymphocytes on smear, positive heterophile (Monospot) or EBV serologies.' },
      { term: 'Airway Emergencies', def: 'Epiglottitis: H. influenzae type b (historically pediatric, now more adults due to Hib vaccine). Sudden severe sore throat, dysphagia, drooling, tripod position, muffled voice. Thumb sign on lateral X-ray. Do NOT examine throat (can precipitate complete obstruction in children).', detail: 'Epiglottitis treatment: secure airway FIRST (controlled intubation in OR if pediatric, fiber-optic in adults), then IV antibiotics (ceftriaxone + vancomycin). Croup (laryngotracheobronchitis): primarily parainfluenza virus, age 6 months-3 years. Barking (seal-like) cough, inspiratory stridor, steeple sign on AP X-ray. Treatment: single dose dexamethasone 0.6 mg/kg (even mild croup), nebulized epinephrine for moderate-severe (observe ≥2h for rebound).', pearl: 'Retropharyngeal abscess: children <5 years (retropharyngeal lymph nodes degenerate by age 5). Fever, neck stiffness, dysphagia, drooling. Lateral neck X-ray: retropharyngeal space widening >7 mm at C2 (must be in extension during inspiration). CT neck with contrast for confirm. Risk: rupture → aspiration, mediastinitis (descends along prevertebral fascia). Treatment: IV antibiotics (ampicillin-sulbactam or clindamycin) ± surgical drainage if abscess >2 cm or not improving. Ludwig\'s angina: submandibular space infection (dental origin). Bilateral submandibular swelling, "woody" induration, elevated tongue, airway compromise. Priority: secure airway → IV antibiotics → surgical drainage.' },
    ]},
  { id: 'neck', title: 'Neck Masses', icon: '🔍',
    items: [
      { term: 'Pediatric Neck Masses', def: 'Congenital: thyroglossal duct cyst (midline, moves with swallowing AND tongue protrusion — remnant of thyroid descent from foramen cecum), branchial cleft cyst (lateral, anterior to SCM — 2nd cleft most common), dermoid cyst, cystic hygroma (lymphatic malformation — posterior triangle, transilluminates, associated with Turner syndrome).', detail: 'Thyroglossal duct cyst: risk of ectopic thyroid tissue (confirm normal thyroid position with US before surgery). Sistrunk procedure: excise cyst + central portion of hyoid bone + tract to foramen cecum (prevents recurrence). Branchial cleft cyst: may present as recurrent abscess. Excision is definitive. Reactive lymphadenopathy: most common pediatric neck mass. Self-limited if <2 cm, mobile, non-tender. If >6 weeks → workup (CBC, ESR, CRP, PPD, imaging).', pearl: 'Concerning features in pediatric neck mass: supraclavicular location (think malignancy), firm/fixed, >2 cm, rapidly enlarging, persistent >6 weeks, systemic symptoms (weight loss, night sweats, fevers — B symptoms). DDx: lymphoma (Hodgkin\'s — painless, may have alcohol-induced pain; Non-Hodgkin\'s), neuroblastoma (catecholamines, Horner syndrome), rhabdomyosarcoma. Workup: US → FNA (or excisional biopsy for lymphoma — need architecture) → CT/PET.' },
      { term: 'Adult Neck Masses', def: 'Rule of 80s: 80% neoplastic, 80% of neoplastic are malignant, 80% of malignant are metastatic (SCC of head & neck). Primary sites: oral cavity, oropharynx (HPV-related — increasing incidence, better prognosis), larynx, hypopharynx, nasopharynx.', detail: 'Workup: HPE (history, physical, endoscopy). FNA (fine-needle aspiration) of mass. CT neck with contrast. PET-CT for staging. Panendoscopy (triple endoscopy: laryngoscopy, esophagoscopy, bronchoscopy) to evaluate for synchronous primary. HPV testing (p16 IHC) for oropharyngeal SCC — HPV-positive has significantly better prognosis.', pearl: 'Parathyroid/thyroid masses are separate entity (see Endocrinology). Parotid tumors: 80% benign, most common is pleomorphic adenoma. Warthin\'s tumor: 2nd most common, bilateral (10%), smokers, often in older men. Mucoepidermoid carcinoma: most common malignant parotid tumor. Facial nerve palsy in parotid mass = MALIGNANT until proven otherwise. FNA for all parotid masses. Superficial parotidectomy with facial nerve preservation for benign. Nasopharyngeal carcinoma: EBV-associated (especially in Southeast Asian/Southern Chinese populations). Unilateral serous otitis media in adult → nasopharyngoscopy to rule out NPC (Eustachian tube obstruction).' },
    ]},
];

export default function ENTGuideView() {
  const [activeId, setActiveId] = useState(null);
  const active = ENT_SECTIONS.find(s => s.id === activeId);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2">👂 ENT Guide</h2>
        <p className="text-xs opacity-40 mt-0.5">Ear, nose, throat & airway emergencies</p>
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
                  <div className="glass rounded-xl p-3 mt-2 flex items-start gap-2 text-xs" style={{ background: '#a855f708', border: '1px solid #a855f720', color: '#a855f7' }}>
                    <span>💎</span><span className="leading-relaxed">{item.pearl}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {ENT_SECTIONS.map(s => (
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
