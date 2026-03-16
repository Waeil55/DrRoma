import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const WOUND_SECTIONS = [
  { id: 'classification', title: 'Wound Classification', icon: '🩹',
    items: [
      { term: 'Clean (Class I)', def: 'Elective, no inflammation, no entry into respiratory/GI/GU tracts. Infection rate: <2%.', detail: 'Examples: thyroidectomy, hernia repair (without mesh), breast biopsy.', pearl: 'Prophylactic antibiotics generally NOT needed for clean wounds (exceptions: implant/prosthesis placement).' },
      { term: 'Clean-Contaminated (Class II)', def: 'Controlled entry into hollow viscus. Infection rate: 3-11%.', detail: 'Examples: cholecystectomy, elective colon surgery (with prep), hysterectomy, bronchoscopy with biopsy.', pearl: 'Single dose of prophylactic antibiotics within 60 min of incision. Cefazolin for most. Add metronidazole for colorectal.' },
      { term: 'Contaminated (Class III)', def: 'Open/fresh traumatic wound, major break in sterile technique, GI spillage. Infection rate: 10-17%.', detail: 'Examples: penetrating trauma <4h old, rectal surgery with gross spillage, open appendectomy for gangrenous appendicitis.', pearl: 'Prophylactic antibiotics indicated. Consider delayed primary closure if significant contamination.' },
      { term: 'Dirty/Infected (Class IV)', def: 'Old traumatic wound, existing infection, perforated viscus. Infection rate: >27%.', detail: 'Examples: traumatic wound >4h old, abscess drainage, perforated diverticulitis, devitalized tissue.', pearl: 'Therapeutic (not prophylactic) antibiotics. Debridement essential. Leave wound open (healing by secondary intention or delayed primary closure).' },
    ]},
  { id: 'pressure', title: 'Pressure Injuries (Ulcers)', icon: '🛏️',
    items: [
      { term: 'Stage 1', def: 'Non-blanchable erythema of intact skin. Skin may be warmer, cooler, firmer, softer than adjacent area.', detail: 'Management: relieve pressure (reposition Q2h), moisture barrier cream, optimize nutrition, pressure-redistribution mattress.', pearl: 'May be harder to detect in darker skin tones — look for color changes, temperature, edema, induration.' },
      { term: 'Stage 2', def: 'Partial-thickness loss with exposed dermis (pink/red wound bed). May present as intact/ruptured blister.', detail: 'Management: Moist wound healing — hydrocolloid for clean wounds, foam dressings for moderate exudate. Avoid betadine.', pearl: 'Should NOT have slough or eschar present. If present → at least Stage 3 or unstageable.' },
      { term: 'Stage 3', def: 'Full-thickness skin loss. Subcutaneous fat may be visible. Undermining and tunneling may occur.', detail: 'Management: sharpen debridement of necrotic tissue, negative pressure wound therapy (wound VAC), collagen dressings. Nutrition optimization (31-35 kcal/kg, 1.25-1.5 g protein/kg).', pearl: 'Bone, tendon, muscle NOT exposed (if visible → Stage 4). Depth varies by anatomical location — can be shallow on nose but deep on sacrum.' },
      { term: 'Stage 4', def: 'Full-thickness tissue loss with exposed bone, tendon, or muscle. Undermining/tunneling often present.', detail: 'Management: surgical debridement, often needs flap/graft closure. Rule out osteomyelitis (MRI, bone biopsy). Wound VAC as bridge.', pearl: 'Osteomyelitis risk high. Probe-to-bone test (+LR 6.4 for osteomyelitis). MRI is imaging of choice. Tx: 6 weeks antibiotics ± surgical debridement.' },
      { term: 'Unstageable', def: 'Cannot determine depth because wound bed is obscured by slough (yellow) or eschar (black). Full-thickness assumed.', detail: 'Stable eschar on heels should NOT be removed — it acts as a natural biological cover (unless infected).', pearl: 'Must debride to stage accurately. Exception: stable heel eschar — leave dry and intact unless infected (wet, draining, fluctuant, foul-smelling).' },
    ]},
  { id: 'dressings', title: 'Wound Dressings Guide', icon: '🩹',
    items: [
      { term: 'Hydrocolloid (DuoDERM)', def: 'Occlusive, absorbs light-moderate exudate, autolytic debridement. For Stage 2, clean wounds.', detail: 'Change Q3-7 days. Creates moist environment. Waterproof outer layer. Not for infected wounds, heavy exudate, or deep cavities.', pearl: 'May cause a "melted" appearance when removed — this is normal gel, not infection.' },
      { term: 'Foam (Mepilex)', def: 'Highly absorbent, good for moderate-heavy exudate. Non-adherent, thermal insulation.', detail: 'Change daily or when saturated. Good for Stage 2-3, peri-wound protection. Can use as secondary dressing.', pearl: 'Excellent choice under negative pressure wound therapy (wound VAC). Silicone-faced foams reduce pain at dressing change.' },
      { term: 'Alginate (Kaltostat)', def: 'Derived from seaweed. Highly absorbent for heavy exudate. Has hemostatic properties.', detail: 'Forms gel when absorbs fluid. Change daily-Q3 days. Good for Stage 3-4, cavity wounds, heavily draining wounds.', pearl: 'Do NOT use on dry wounds — will dessicate the wound bed. Must have a secondary dressing over top.' },
      { term: 'Hydrogel', def: 'Adds moisture to dry wounds. Good for autolytic debridement. Cooling/soothing.', detail: 'For dry wounds, partial-thickness, necrotic wounds. Change daily-Q3 days. Available as gel or impregnated gauze.', pearl: 'Good for painful wounds (cooling effect). Ideal for dry eschar to facilitate autolytic debridement.' },
      { term: 'Negative Pressure (VAC)', def: 'Negative pressure wound therapy. Applies sub-atmospheric pressure to promote healing.', detail: 'Indications: Stage 3-4, chronic wounds, surgical wound dehiscence, flap/graft support. Contraindications: untreated osteomyelitis, malignancy in wound, necrotic tissue with eschar, exposed vessels.', pearl: 'Typical setting: -75 to -125 mmHg continuous. Changes dressing Q48-72h. Promotes granulation tissue, reduces edema, removes exudate.' },
    ]},
];

function WoundCareGuideView() {
  const [activeId, setActiveId] = useState(null);
  const active = WOUND_SECTIONS.find(s => s.id === activeId);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2">🩹 Wound Care Guide</h2>
        <p className="text-xs opacity-40 mt-0.5">Classification, staging & dressings</p>
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
                  <div className="glass rounded-xl p-3 mt-2 flex items-start gap-2 text-xs" style={{ background: '#f59e0b08', border: '1px solid #f59e0b20', color: '#f59e0b' }}>
                    <span>💎</span><span className="leading-relaxed">{item.pearl}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {WOUND_SECTIONS.map(s => (
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

export default WoundCareGuideView;
