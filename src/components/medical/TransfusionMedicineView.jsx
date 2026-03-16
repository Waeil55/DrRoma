import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const TRANSFUSION_DATA = [
  { id: 'products', title: 'Blood Products', icon: '🩸',
    items: [
      { term: 'Packed Red Blood Cells (pRBCs)', def: 'Volume: ~300 mL. Hematocrit: 55-80%. Shelf life: 42 days (4°C). One unit ↑ Hgb ~1 g/dL.', detail: 'Indications: Hgb <7 g/dL (restrictive, most patients), Hgb <8 g/dL (cardiac disease, hip fracture), active hemorrhage. Leukoreduced by default in most centers (reduces febrile reactions, CMV transmission, HLA alloimmunization).', pearl: 'Restrictive (Hgb <7) is as safe as liberal (Hgb <10) in most patients — TRICC trial. Exception: active ACS → transfuse Hgb <8. Massive transfusion: 1:1:1 ratio (pRBC:FFP:platelets).' },
      { term: 'Fresh Frozen Plasma (FFP)', def: 'Volume: ~250 mL. Contains ALL coagulation factors. Shelf life: 1 year frozen, 24h after thaw.', detail: 'Indications: INR >1.5-2 with active bleeding, massive transfusion, TTP (therapeutic plasma exchange), DIC with bleeding, warfarin reversal (when PCC unavailable). Dose: 10-15 mL/kg.', pearl: 'FFP must be ABO compatible (contains anti-A, anti-B antibodies). AB plasma is the universal donor plasma (no antibodies). Thawing takes ~30 min — plan ahead for emergencies.' },
      { term: 'Platelets', def: 'Apheresis (single donor): ~300 mL. Random donor: ~50 mL (pool 4-6 units). Shelf life: 5 days at room temp.', detail: 'Indications: <10K (prophylactic), <20K (fever/infection), <50K (active bleeding/invasive procedure), <100K (neurosurgery/ophthalmic). 1 apheresis unit ↑ plt ~30-60K.', pearl: 'Platelets stored at ROOM TEMPERATURE (20-24°C) with agitation — NOT refrigerated (cold causes activation/clearance). Must use within 5 days (bacterial growth risk). ABO-compatible preferred but not required.' },
      { term: 'Cryoprecipitate', def: 'Volume: ~15 mL per unit. Rich in: fibrinogen (150-250 mg/unit), Factor VIII, Factor XIII, vWF, fibronectin.', detail: 'Indications: fibrinogen <100-150 mg/dL with bleeding, DIC, massive transfusion (fibrinogen depletion), uremic bleeding. Dose: pool of 10 units (adults).', pearl: 'Primary use today: fibrinogen replacement. Not for hemophilia A or vWD (use factor concentrates instead). 10-unit pool raises fibrinogen ~60-100 mg/dL.' },
    ]},
  { id: 'reactions', title: 'Transfusion Reactions', icon: '⚠️',
    items: [
      { term: 'Acute Hemolytic (ABO Incompatibility)', def: 'MOST DANGEROUS. Minutes to hours. Fever, flank/back pain, hemoglobinuria (dark urine), DIC, shock, renal failure.', detail: 'Usually ABO mismatch (clerical error). Type II hypersensitivity (preformed IgM antibodies → complement activation → intravascular hemolysis).', pearl: 'Management: STOP transfusion immediately. Normal saline (maintain UOP >1 mL/kg/hr). Send blood bank sample (re-crossmatch). Check for DIC (fibrinogen, D-dimer, PT/PTT). Prevention: check identifiers at bedside!' },
      { term: 'Febrile Non-Hemolytic (FNHTR)', def: 'MOST COMMON reaction. Temperature ↑ ≥1°C. Chills, rigors. Usually during or within 1-6h.', detail: 'Cause: recipient antibodies against donor WBC antigens (cytokines released from WBCs in stored blood). More common with platelet transfusion.', pearl: 'Management: slow/stop transfusion, acetaminophen, rule out hemolytic reaction (direct Coombs, haptoglobin, LDH). Prevention: leukoreduction (already standard). Can resume if confirmed FNHTR.' },
      { term: 'Transfusion-Related Acute Lung Injury (TRALI)', def: 'Leading cause of transfusion-related death. Acute respiratory distress within 6h. Non-cardiogenic pulmonary edema.', detail: 'Bilateral pulmonary infiltrates, hypoxia, NO evidence of volume overload (BNP normal, no JVD). Cause: donor anti-HLA/anti-granulocyte antibodies → neutrophil activation in pulmonary vasculature.', pearl: 'Management: stop transfusion, supportive care (O₂, intubation if needed). NO diuretics (not volume overload). Resolves in 48-72h with supportive care. Report to blood bank — implicated donors should not donate again.' },
      { term: 'TACO (Transfusion-Assoc. Circulatory Overload)', def: 'Volume overload. Dyspnea, HTN, JVD, pulmonary edema. Elevated BNP. Distinguished from TRALI by volume status.', detail: 'Risk factors: elderly, cardiac disease, renal failure, rapid transfusion. More common than TRALI.', pearl: 'Prevention: transfuse slowly (1 unit over 2-4h), furosemide between units in at-risk patients. TACO vs TRALI: BNP elevated in TACO (not TRALI), response to diuretics (TACO yes, TRALI no), volume overload signs (TACO yes, TRALI no).' },
      { term: 'Allergic / Anaphylactic', def: 'Urticaria (mild), anaphylaxis (severe — IgA deficiency). Mild: hives, pruritus. Severe: bronchospasm, hypotension, angioedema.', detail: 'Mild allergic: stop, antihistamine (diphenhydramine), can resume if symptoms resolve. Anaphylaxis: stop, epinephrine, IV fluids, steroids. IgA-deficient patients: use IgA-deficient donor blood or washed products.', pearl: 'IgA deficiency (1:500 prevalence) → anti-IgA antibodies → anaphylaxis with transfusion. These patients need washed blood products (removes plasma proteins including IgA).' },
    ]},
  { id: 'compat', title: 'Blood Type Compatibility', icon: '🔬',
    items: [
      { term: 'ABO System', def: 'Type A: A antigens, anti-B antibodies. Type B: B antigens, anti-A antibodies. Type AB: both antigens, no antibodies. Type O: no antigens, both antibodies.', detail: 'Universal RBC donor: Type O (no ABO antigens). Universal plasma donor: Type AB (no ABO antibodies). Forward typing: patient RBCs + known antibodies. Reverse typing: patient serum + known RBCs.', pearl: 'In emergency (no time for crossmatch): give O-negative RBCs (universal donor). For plasma: give AB (universal). Switch to type-specific ASAP. O-neg supply is limited — use judiciously.' },
      { term: 'Rh System', def: 'Rh(D) positive or negative. Rh(D) negative patients can develop anti-D after exposure → hemolytic reaction on re-exposure.', detail: 'Rh-negative women of childbearing age: ALWAYS give Rh-negative blood. RhoGAM (anti-D immunoglobulin) at 28 weeks and within 72h of delivery (if baby Rh+). Prevents anti-D formation.', pearl: 'Rh mismatch is NOT immediately dangerous (unlike ABO). Problem is alloimmunization → future hemolytic reactions. Critical in pregnancy: maternal anti-D → Hemolytic Disease of Newborn (HDN). Kleihauer-Betke test quantifies fetal-maternal hemorrhage.' },
      { term: 'Crossmatch & Type & Screen', def: 'Type & Screen: determine ABO/Rh + antibody screen. Crossmatch: test patient serum against donor cells for compatibility.', detail: 'Electronic crossmatch: computer verifies compatibility (if antibody screen negative). Serologic crossmatch: actual mixing test (if antibody screen positive or special situations). Antibody screen: indirect Coombs test (patient serum + known RBCs + anti-human globulin).', pearl: 'Direct Coombs (DAT): detects antibodies already ON patient\'s RBCs (autoimmune hemolytic anemia, HDN, transfusion reaction). Indirect Coombs (IAT): detects antibodies IN patient\'s serum (pretransfusion, prenatal screening).' },
    ]},
];

function TransfusionMedicineView() {
  const [activeId, setActiveId] = useState(null);
  const active = TRANSFUSION_DATA.find(s => s.id === activeId);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2">🩸 Transfusion Medicine</h2>
        <p className="text-xs opacity-40 mt-0.5">Blood products, reactions & compatibility</p>
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
                    <span>💎</span><span className="leading-relaxed">{item.pearl}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {TRANSFUSION_DATA.map(s => (
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

export default TransfusionMedicineView;
