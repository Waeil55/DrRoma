import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const DERM_CONDITIONS = [
  { id: 'papulosquam', title: 'Papulosquamous Diseases', icon: '',
    items: [
      { term: 'Psoriasis', def: 'Chronic autoimmune. Well-demarcated, salmon-pink plaques with silvery scale. Auspitz sign (pinpoint bleeding), Koebner phenomenon (trauma  new lesions).', detail: 'Types: plaque (most common, 80%), guttate (post-strep, droplet-shaped), inverse (flexural, no scale), pustular (sterile pustules, can be life-threatening), erythrodermic (>90% BSA, medical emergency). Nail changes: pitting, oil drop sign, onycholysis.', pearl: 'Comorbidities: psoriatic arthritis (30%), metabolic syndrome, CV disease. Screen for HTN, diabetes, hyperlipidemia. Treatment ladder: topicals (steroids, vitamin D analogs)  phototherapy (NB-UVB)  systemic (MTX, cyclosporine)  biologics (TNF-, IL-17, IL-23).' },
      { term: 'Lichen Planus', def: '5 Ps: Pruritic, Purple, Polygonal, Planar, Papules. Wickham striae (white lines on surface). Koebner positive.', detail: 'Distribution: wrists, ankles, oral mucosa (white lacy pattern). Mucous membrane involvement common  check oral mucosa. Associated with hepatitis C. Nail dystrophy: dorsal pterygium (pathognomonic).', pearl: 'Oral lichen planus: malignant potential (~1% transform to SCC). Regular follow-up needed. If erosive/ulcerative type  biopsy to rule out dysplasia. Treatment: topical steroids, tacrolimus for oral.' },
      { term: 'Pityriasis Rosea', def: 'Self-limited. Herald patch (large oval, collarette scale)  1-2 weeks later  "Christmas tree" pattern on trunk. HHV-6/7 associated.', detail: 'Distribution follows skin lines (Langer\'s lines). Lasts 6-8 weeks. Papules are oval with trailing scale (collarette). Important DDx: secondary syphilis (check RPR!), tinea corporis.', pearl: 'ALWAYS rule out secondary syphilis if classic presentation: check RPR/VDRL. Secondary syphilis involves palms and soles (pityriasis rosea typically doesn\'t). If atypical or palms/soles involved  syphilis until proven otherwise.' },
    ]},
  { id: 'vesicobullous', title: 'Vesiculobullous Diseases', icon: '',
    items: [
      { term: 'Pemphigus Vulgaris', def: 'Autoimmune IgG against desmoglein 3 (mucosal)  desmoglein 1 (skin). Flaccid blisters, Nikolsky sign positive. Intraepidermal (suprabasal) cleavage.', detail: 'Oral erosions in 50-70% (often first sign). Blisters rupture easily  painful erosions that don\'t heal. Histology: "tombstoning" (basal layer attached, upper layers separated). DIF: IgG in "fishnet" intercellular pattern.', pearl: 'Pemphigus vulgaris is POTENTIALLY FATAL without treatment (mortality was >75% before steroids). Treatment: systemic steroids + steroid-sparing agent (rituximab now first-line per RITUX 3 trial). Nikolsky sign: lateral pressure  blister extension.' },
      { term: 'Bullous Pemphigoid', def: 'Autoimmune IgG against BP180/BP230 (hemidesmosomes). TENSE blisters on erythematous base. Nikolsky NEGATIVE. Subepidermal cleavage.', detail: 'Elderly patients (>60). Tense blisters that don\'t rupture easily. Urticarial prodrome. Oral involvement rare (<20%). DIF: linear IgG + C3 at DEJ (basement membrane zone).', pearl: 'Pemphigus (PemphiguS = Superficial = flaccid = bad prognosis). Pemphigoid (PemphigoiD = Deep = tense = better prognosis). BP typically milder and doesn\'t necessarily need systemic immunosuppression (superpotent topical steroids like clobetasol can be sufficient).' },
      { term: 'Dermatitis Herpetiformis', def: 'Intensely pruritic, grouped vesicles on extensor surfaces (elbows, knees, buttocks). Pathognomonic for celiac disease.', detail: 'Nearly all patients (>90%) have celiac disease on biopsy (even if asymptomatic). DIF: granular IgA at dermal papillae. Neutrophilic microabscesses at papillary tips.', pearl: 'Treatment: dapsone provides rapid relief (24-48h). Must check G6PD before starting (hemolytic anemia risk). Long-term: gluten-free diet (treats both skin and gut disease, may allow dapsone discontinuation). All patients should be on gluten-free diet regardless.' },
    ]},
  { id: 'infections', title: 'Skin Infections', icon: '',
    items: [
      { term: 'Tinea (Dermatophytosis)', def: 'Superficial fungal infection. "Ring worm"  annular, scaly border with central clearing. KOH prep: septate hyphae.', detail: 'Types by location: capitis (scalp  requires systemic therapy), corporis (body), cruris (groin), pedis (feet), unguium (nails = onychomycosis). Kerion: boggy tender mass on scalp (inflammatory tinea capitis)  NOT an abscess, don\'t I&D.', pearl: 'Tinea vs eczema: KOH prep is essential. Topical steroids WORSEN tinea ("tinea incognito"  partially treated by steroids  atypical presentation). If "eczema" fails to improve with steroids  KOH prep. Tinea capitis: griseofulvin (8 weeks) or terbinafine (4 weeks).' },
      { term: 'Herpes Zoster (Shingles)', def: 'VZV reactivation. Painful, grouped vesicles on erythematous base in DERMATOMAL distribution. Does NOT cross midline.', detail: 'Prodrome: pain/burning/tingling 1-5 days before rash. Hutchinson sign: vesicles on tip of nose  V1 (nasociliary)  ophthalmic zoster (get ophthalmology consult). Treatment: valacyclovir 1g TID  7d (within 72h of rash).', pearl: 'Shingrix vaccine: 2 doses, >90% effective. Recommended 50 years (even if prior Zostavax or prior shingles). Post-herpetic neuralgia (PHN): pain persisting >90 days. Treatment: gabapentin, pregabalin, duloxetine, lidocaine patch, capsaicin.' },
      { term: 'Molluscum Contagiosum', def: 'Poxvirus. Dome-shaped, umbilicated (central dell) papules. Self-limited in immunocompetent (6-12 months). Widespread in HIV.', detail: 'Spread by direct contact/fomites. In children: face, trunk, extremities. In adults: often sexually transmitted  genital/perigenital. Histology: Henderson-Patterson bodies (intracytoplasmic inclusions).', pearl: 'In HIV: extensive molluscum (especially face, >100 lesions)  check CD4 count. Improves with ART. DDx for umbilicated papules in HIV: cryptococcosis, histoplasmosis, penicilliosis (all can mimic molluscum  biopsy if atypical).' },
    ]},
  { id: 'cancer', title: 'Skin Cancer', icon: '',
    items: [
      { term: 'Basal Cell Carcinoma (BCC)', def: 'MOST COMMON cancer in humans. Pearly, translucent papule/nodule with telangiectasias and rolled borders. Rarely metastasizes.', detail: 'Types: nodular (most common), superficial (trunk), morpheaform/sclerosing (scar-like, aggressive). Risk factors: UV exposure, fair skin, arsenic, radiation, Gorlin syndrome (PTCH1 mutation  multiple BCCs).', pearl: 'BCC grows locally destructive but almost never metastasizes (<0.1%). Treatment: Mohs micrographic surgery (cosmetically sensitive areas, recurrent), excision, electrodesiccation/curettage (superficial), topical imiquimod (superficial BCC). Hedgehog pathway inhibitors (vismodegib) for inoperable/metastatic.' },
      { term: 'Squamous Cell Carcinoma (SCC)', def: 'Firm, erythematous, keratotic papule/nodule. Can arise from actinic keratosis. CAN metastasize (especially immunosuppressed).', detail: 'Risk factors: UV exposure, immunosuppression (transplant patients  #1 cancer post-transplant), chronic wounds/scars (Marjolin ulcer), HPV, arsenic. Actinic keratosis: "pre-SCC" (evolves in ~10%).', pearl: 'High-risk features: size >2cm, depth >4mm, perineural invasion, poorly differentiated, ear/lip location, immunosuppressed. These need wider margins  Mohs  adjuvant radiation. SCC metastasizes to regional lymph nodes first.' },
      { term: 'Melanoma', def: 'ABCDEs: Asymmetry, Border irregularity, Color variation, Diameter >6mm, Evolution. MOST DEADLY skin cancer.', detail: 'Types: superficial spreading (most common, 70%), nodular (worst prognosis, rapidly growing), lentigo maligna (sun-damaged skin, elderly), acral lentiginous (palms/soles/nails  most common in dark-skinned patients, Bob Marley).', pearl: 'Breslow depth is the MOST IMPORTANT prognostic factor: <1mm: excellent prognosis. 1-2mm: SLNB recommended. >4mm: poor prognosis, 50% 5-year survival. Sentinel lymph node biopsy if Breslow 0.8mm or ulcerated. Immunotherapy (anti-PD-1, ipilimumab) revolutionized metastatic melanoma treatment.' },
    ]},
];

function DermatologyAtlasView() {
  const [activeId, setActiveId] = useState(null);
  const active = DERM_CONDITIONS.find(s => s.id === activeId);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2"> Dermatology Atlas</h2>
        <p className="text-xs opacity-40 mt-0.5">Skin conditions, morphology & management</p>
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
                  <div className="glass rounded-xl p-3 mt-2 flex items-start gap-2 text-xs" style={{ background: '#f59e0b08', border: '1px solid #f59e0b20', color: '#f59e0b' }}>
                    <span></span><span className="leading-relaxed">{item.pearl}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {DERM_CONDITIONS.map(s => (
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

export default DermatologyAtlasView;
