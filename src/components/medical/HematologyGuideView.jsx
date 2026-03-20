import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const HEME_SECTIONS = [
  { id: 'anemia', title: 'Anemia Classification', icon: '',
    items: [
      { term: 'Microcytic (MCV <80)', def: 'TICS: Thalassemia, Iron deficiency, Chronic disease (some), Sideroblastic. Iron deficiency is the most common cause of anemia worldwide.', detail: 'Iron deficiency: ↓ ferritin (<30 is diagnostic, <15 definitive), ↓ serum iron, ↑ TIBC, ↓ transferrin saturation (<20%). Retic count low. Causes: blood loss (GI > menstrual), malabsorption (celiac, gastrectomy), increased demand (pregnancy).', pearl: 'Iron studies interpretation: Iron deficiency: ↓ferritin, ↓iron, ↑TIBC, ↓TSAT. Anemia of chronic disease: ↑ferritin, ↓iron, ↓TIBC, ↓TSAT. Combined: ↓-normal ferritin (<100 in inflammation), ↓iron, ↓TIBC, ↓TSAT. TIBC = transferrin capacity: "hungry for iron" in iron deficiency (↑TIBC), "not hungry" in ACD (↓TIBC). Ferritin is an acute phase reactant — can be falsely normal/elevated in inflammation.' },
      { term: 'Normocytic (MCV 80-100)', def: 'Reticulocyte count is the KEY branch point. High retic = appropriate response (hemolysis, acute blood loss). Low retic = underproduction (ACD, aplastic anemia, CKD, myelodysplastic).', detail: 'Hemolysis workup: ↑ reticulocytes, ↑ LDH, ↑ indirect bilirubin, ↓ haptoglobin, ↑ bilirubin. Peripheral smear critical. Intravascular: ↑ free Hgb, hemoglobinuria. Extravascular: splenomegaly. Coombs test: (+) = autoimmune → warm (IgG, spleen) vs cold (IgM, complement, liver).', pearl: 'Hemolysis smear findings: Schistocytes (fragments) → TTP/HUS, DIC, MAHA, mechanical valve. Spherocytes → hereditary spherocytosis, autoimmune hemolytic anemia. Target cells → thalassemia, liver disease, hemoglobin C. Bite cells → G6PD deficiency. Sickle cells → sickle cell. Spur cells (acanthocytes) → liver disease, abetalipoproteinemia.' },
      { term: 'Macrocytic (MCV >100)', def: 'Megaloblastic: B12 or folate deficiency (hypersegmented neutrophils, macro-ovalocytes). Non-megaloblastic: liver disease, hypothyroidism, MDS, reticulocytosis, alcohol, medications.', detail: 'B12 deficiency: neurologic symptoms (subacute combined degeneration — posterior columns + lateral corticospinal tracts → loss of vibration/proprioception + upper motor neuron signs). Causes: pernicious anemia (anti-IF antibodies), gastrectomy, ileal disease/resection (terminal ileum absorbs B12), metformin, N₂O abuse.', pearl: 'Check BOTH B12 and folate. If B12 borderline-low: check methylmalonic acid (MMA — elevated in B12 deficiency only) and homocysteine (elevated in both B12 and folate deficiency). CRITICAL: if both B12 and folate deficient, must replace B12 FIRST — giving folate alone can worsen B12 neurologic damage by diverting limited B12 away from neurologic pathways.' },
    ]},
  { id: 'coag', title: 'Coagulation Disorders', icon: '',
    items: [
      { term: 'Coagulation Cascade Basics', def: 'PT/INR: extrinsic pathway (factor VII) → monitors warfarin. aPTT: intrinsic pathway (VIII, IX, XI, XII) → monitors heparin. Both converge at common pathway (X, V, II, fibrinogen).', detail: 'Mixing study: aPTT prolonged → mix patient plasma 1:1 with normal plasma. If corrects: factor deficiency. If doesn\'t correct: inhibitor (lupus anticoagulant or factor-specific inhibitor like anti-factor VIII).', pearl: 'Factor VII has the shortest half-life (6h) → PT elevates first in warfarin therapy and liver failure. DIC: ↑PT, ↑aPTT, ↓fibrinogen, ↑D-dimer, ↓platelets, schistocytes. Treatment: treat underlying cause + replace (cryo for fibrinogen <100, platelets if <50 + bleeding, FFP if PT/aPTT elevated + bleeding).' },
      { term: 'Thrombocytopenias', def: 'Decreased production (marrow failure, MDS, chemo), increased destruction (ITP, TTP, HUS, HIT, DIC), sequestration (splenomegaly), dilutional (massive transfusion).', detail: 'ITP: isolated thrombocytopenia, no other cause found. Anti-platelet antibodies (anti-GPIIb/IIIa). Treatment: observation if plt >30K + no bleeding. Steroids first-line, IVIG for urgent situations, rituximab, TPO agonists (eltrombopag, romiplostim), splenectomy.', pearl: 'TTP pentad: thrombocytopenia, MAHA (schistocytes), renal dysfunction, neurologic symptoms, fever. ADAMTS13 <10% is diagnostic. Treatment: urgent plasma exchange (plasmapheresis) + steroids + caplacizumab. Do NOT transfuse platelets (fuel the fire → more thrombosis). HUS: similar but renal predominant, STEC (Shiga toxin E. coli O157:H7) — supportive care, avoid antibiotics.' },
      { term: 'Heparin-Induced Thrombocytopenia (HIT)', def: 'Type II HIT: immune-mediated (IgG against PF4-heparin complex). Platelet drop >50% from baseline, typically day 5-10 of heparin exposure. THROMBOTIC, not bleeding disorder.', detail: '4T score: Timing, Thrombocytopenia magnitude, Thrombosis, other causes. If high/intermediate probability → send anti-PF4/heparin antibody (ELISA) + serotonin release assay (SRA, confirmatory). STOP ALL HEPARIN (including flushes, coated catheters).', pearl: 'HIT is a PROTHROMBOTIC state — despite low platelets, these patients CLOT (not bleed). DVT, PE, stroke, limb ischemia. Treatment: stop ALL heparin + start alternative anticoagulant immediately: argatroban (hepatic metabolism, good for renal failure) or bivalirudin (short half-life). Do NOT give warfarin until platelets >150K (risk of warfarin-induced skin necrosis/venous limb gangrene). Do NOT transfuse platelets.' },
    ]},
  { id: 'anticoag', title: 'Anticoagulation Management', icon: '',
    items: [
      { term: 'Warfarin', def: 'Vitamin K antagonist. Inhibits factors II, VII, IX, X, protein C, protein S. Monitor with PT/INR. Target INR 2-3 (most indications), 2.5-3.5 (mechanical mitral valve).', detail: 'Drug interactions: CYP2C9 inhibitors ↑ warfarin effect (fluconazole, amiodarone, metronidazole, TMP-SMX). CYP2C9 inducers ↓ warfarin effect (rifampin, carbamazepine, phenytoin). Vitamin K-rich foods (leafy greens): ↓ warfarin effect. CONSISTENCY is key.', pearl: 'Warfarin reversal: INR elevated, no bleeding → hold warfarin ± oral vitamin K (1-2.5 mg). Serious bleeding: IV vitamin K 10 mg + 4-factor PCC (Kcentra) for immediate reversal. FFP if PCC unavailable (slower, volume overload). Protein C has shorter half-life than most clotting factors → initial warfarin therapy can be PROTHROMBOTIC (bridge with heparin for 5 days, until INR therapeutic × 2 days).' },
      { term: 'DOACs (Direct Oral Anticoagulants)', def: 'Xa inhibitors: rivaroxaban, apixaban, edoxaban. Thrombin inhibitor: dabigatran. No routine monitoring needed.', detail: 'Advantages over warfarin: predictable pharmacokinetics, fewer drug interactions, no monitoring, rapid onset (2-4h). Limitations: renal clearance (dose adjust/avoid in severe CKD), no reliable routine monitoring, cost. Dabigatran: GI side effects, requires acid for absorption (avoid PPIs).', pearl: 'Reversal agents: Dabigatran → idarucizumab (Praxbind, specific reversal). Xa inhibitors → andexanet alfa (Andexxa) or 4-factor PCC. Dabigatran is dialyzable (unlike Xa inhibitors). For AF: DOACs preferred over warfarin in most patients (RE-LY, ROCKET-AF, ARISTOTLE, ENGAGE-TIMI). Exception: mechanical valve or moderate-severe mitral stenosis → warfarin only.' },
      { term: 'Heparin (UFH & LMWH)', def: 'UFH: IV or SQ, monitor aPTT (target 1.5-2.5× control). Short half-life (60-90 min), protamine reversal. LMWH (enoxaparin): SQ, predictable, monitor anti-Xa in obesity/renal failure.', detail: 'UFH advantages: short half-life (useful perioperatively), fully reversible with protamine, not renally cleared. LMWH advantages: SQ dosing, predictable levels, outpatient use, lower HIT risk. Protamine reversal: 1 mg per 100 units UFH (given in last 2-3h). For LMWH: protamine reverses ~60%.', pearl: 'Heparin dosing for PE: 80 U/kg bolus → 18 U/kg/hr. Check aPTT Q6h, adjust. Enoxaparin: 1 mg/kg SQ Q12h (treatment), 40 mg SQ daily (prophylaxis). Adjust for CrCl <30: enoxaparin 1 mg/kg Q24h (treatment), 30 mg daily (prophylaxis). In morbid obesity (>150 kg): use actual body weight for dosing, monitor anti-Xa levels.' },
    ]},
  { id: 'sickle', title: 'Sickle Cell Disease', icon: '',
    items: [
      { term: 'Vaso-Occlusive Crisis', def: 'Most common reason for ED visit/hospitalization. Severe bone/joint pain (often back, long bones, chest). Triggered by cold, dehydration, infection, stress, hypoxia.', detail: 'Management: aggressive IV fluids, opioid analgesia (PCA preferred, avoid meperidine — seizures), NSAIDs as adjunct, incentive spirometry (prevent ACS), supplemental O₂ only if hypoxic.', pearl: 'Do NOT undertreat pain in sickle cell patients. These patients develop tolerance and need higher opioid doses — this is NOT drug-seeking behavior. Hydroxyurea is disease-modifying: ↑ HbF, ↓ crises, ↓ ACS, ↓ mortality. Indications: ≥3 crises/year, recurrent ACS, symptomatic anemia.' },
      { term: 'Acute Chest Syndrome', def: 'New pulmonary infiltrate + ONE of: chest pain, fever >38.5°C, respiratory symptoms, hypoxia. Most common cause of death in SCD adults.', detail: 'Causes: atelectasis/hypoventilation (rib infarction), infection (Chlamydia, Mycoplasma, S. pneumoniae), fat embolism (from bone marrow necrosis), pulmonary infarction.', pearl: 'Treatment: antibiotics (cephalosporin + macrolide to cover atypicals), exchange transfusion (target HbS <30%), incentive spirometry Q2h, supplemental O₂, bronchodilators. Simple transfusion if Hgb <10 — exchange transfusion if Hgb already near baseline (avoid hyperviscosity by not pushing Hgb >10-11).' },
      { term: 'Chronic Complications', def: 'Stroke (most common in children — screen with transcranial Doppler annually age 2-16), avascular necrosis (femoral head), splenic sequestration/autosplenism, retinopathy, leg ulcers, priapism.', detail: 'Functional asplenia by age 5 (repeated infarction) → susceptible to encapsulated organisms (pneumococcus, H. flu, N. meningitidis). All SCD patients need: pneumococcal vaccine, Hib vaccine, meningococcal vaccine, annual flu vaccine, daily penicillin prophylaxis (age 5 → some stop, others continue lifelong).', pearl: 'Curative options: allogeneic stem cell transplant (matched sibling — disease-free survival ~90% in children), gene therapy (approved: lovotibeglogene autotemcel, exagamglogene autotemcel/CRISPR-Cas9). Transfusion therapy (chronic): exchange transfusion program for stroke prevention, recurrent ACS. Iron overload from chronic transfusion → chelation (deferasirox).' },
    ]},
];

export default function HematologyGuideView() {
  const [activeId, setActiveId] = useState(null);
  const active = HEME_SECTIONS.find(s => s.id === activeId);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2"> Hematology Guide</h2>
        <p className="text-xs opacity-40 mt-0.5">Anemias, coagulation & sickle cell disease</p>
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
                  <div className="glass rounded-xl p-3 mt-2 flex items-start gap-2 text-xs" style={{ background: '#ef444408', border: '1px solid #ef444420', color: '#ef4444' }}>
                    <span></span><span className="leading-relaxed">{item.pearl}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {HEME_SECTIONS.map(s => (
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
