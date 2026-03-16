import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const EM_SECTIONS = [
  { id: 'trauma', title: 'Trauma', icon: '🚑',
    items: [
      { term: 'Primary Survey (ABCDE)', def: 'A — Airway with C-spine protection: jaw thrust (not chin lift if cervical injury), intubate if unable to maintain airway. B — Breathing: inspect, auscultate, percuss. Tension pneumothorax: absent breath sounds + tracheal deviation + hemodynamic instability → needle decompression 2nd ICS MCL → chest tube. C — Circulation: control hemorrhage (direct pressure, tourniquet for extremity). 2 large-bore IVs, 1L crystalloid, then blood (1:1:1 pRBC:FFP:platelets per MTP). D — Disability: GCS, pupils. E — Exposure: undress, log-roll, prevent hypothermia.', detail: 'Lethal trauma triad (vicious cycle): hypothermia + acidosis + coagulopathy → damage control surgery (stop bleeding, contamination → ICU resuscitation → definitive repair later). FAST exam: free fluid in Morrison\'s pouch (hepatorenal), splenorenal, pelvis (pouch of Douglas), pericardial. Positive FAST + hemodynamic instability → OR.', pearl: 'Massive transfusion protocol (MTP): trigger if anticipating ≥10 units pRBC in 24h or ≥4 in 1h. Ratio 1:1:1 (pRBC:FFP:platelets — PROPPR trial). TXA (tranexamic acid) 1g IV within 3h of injury (CRASH-2 trial — ↓ mortality). Calcium replacement (citrate in blood products chelates Ca²⁺). Do NOT delay OR for imaging in hemodynamically unstable trauma. ABC assessment + finger thoracostomy > formal chest tube in arrest. Resuscitative thoracotomy: penetrating thoracic trauma with witnessed arrest or recent loss of vitals (survival ~10-15% penetrating, <2% blunt).' },
      { term: 'Traumatic Brain Injury', def: 'Mild (GCS 13-15, concussion), Moderate (GCS 9-12), Severe (GCS ≤8 — intubate for airway protection). Epidural hematoma: "talk and die" — lucid interval, biconvex/lens-shaped, MMA (temporal bone fracture). Subdural: crescent-shaped, bridging veins, elderly/anticoagulated/alcoholics. Subarachnoid: trauma #1 cause.', detail: 'ICP management: head of bed 30°, sedation/analgesia, hyperosmolar therapy (mannitol 1g/kg or hypertonic saline 23.4% 30 mL), mild hyperventilation target PaCO₂ 35 mmHg (temporary measure), EVD for monitoring/CSF drainage. Target CPP >60 mmHg (CPP = MAP - ICP). Herniation signs: ipsilateral blown pupil (CN III compression), contralateral hemiparesis, Cushing triad (HTN + bradycardia + irregular respirations → late sign).', pearl: 'Surgical evacuation: epidural >15 mm thickness or midline shift >5 mm, acute subdural >10 mm or midline shift >5 mm or GCS ↓≥2 points. Decompressive craniectomy: refractory ICP elevation (DECRA, RESCUEicp trials — improves survival but may increase severe disability). Concussion: gradual return-to-play protocol (no same-day return). Post-concussion syndrome: headache, cognitive difficulty, mood changes — symptoms usually resolve in weeks-months. Second impact syndrome: rare but catastrophic brain swelling from repeat concussion before first has healed.' },
    ]},
  { id: 'resus', title: 'Cardiac Arrest & Resuscitation', icon: '⚡',
    items: [
      { term: 'ACLS Algorithms', def: 'Shockable rhythms (VFib/pVT): CPR → defibrillation (biphasic 200J) → CPR 2 min → rhythm check → repeat. Epinephrine 1 mg Q3-5 min. Amiodarone 300 mg first dose, 150 mg second. Non-shockable (PEA/asystole): CPR → epinephrine 1mg Q3-5 min → reassess Q2 min. Treat reversible causes (H\'s and T\'s).', detail: 'H\'s: Hypovolemia, Hypoxia, Hydrogen ion (acidosis), Hypo/Hyperkalemia, Hypothermia. T\'s: Tension pneumothorax, Tamponade (cardiac), Toxins, Thrombosis (coronary — STEMI, pulmonary — PE). High-quality CPR: rate 100-120/min, depth 2-2.4 inches, full recoil, minimize interruptions (<10 sec for rhythm check).', pearl: 'Post-cardiac arrest care: targeted temperature management (TTM) 32-36°C for 24h (TTM2 trial: target normothermia 37.5°C with aggressive fever prevention may be equivalent). Early PCI if STEMI or suspected cardiac etiology. Neuroprognostication: wait ≥72h after normothermia. Poor prognostic signs: bilateral absent pupillary and corneal reflexes, status myoclonus, absent N20 on SSEP, highly malignant EEG, diffusion restriction on MRI. No single test is 100% — use multimodal assessment. ECMO-CPR (E-CPR): extracorporeal CPR for refractory arrest — emerging evidence (INCEPTION trial) in selected centers.' },
      { term: 'Pediatric Resuscitation', def: 'Compression rate 100-120/min. Depth: 1/3 AP diameter (infants: 1.5 inches, children: 2 inches). Infant: 2-thumb encircling technique or 2-finger (single rescuer). Shockable: 2 J/kg → 4 J/kg → 4 J/kg (max 10 J/kg or adult dose). Epinephrine: 0.01 mg/kg (0.1 mL/kg of 1:10,000) IV/IO.', detail: 'Newborn resuscitation (NRP): dry, stimulate, position. CPAP/PPV if persistent apnea or HR <100 after initial steps. Intubate if PPV ineffective. Chest compressions if HR <60 despite adequate ventilation. Epinephrine if HR <60 despite compressions + ventilation. Room air for term infants (21% FiO₂), adjust per oximeter.', pearl: 'Key pediatric differences: respiratory failure is #1 cause of pediatric cardiac arrest (NOT cardiac). Always check for respiratory causes first. Broselow tape for weight-based dosing. IO access (intraosseous — proximal tibia) if IV cannot be obtained in 90 seconds. Medication errors are the most common preventable adverse event in pediatric resuscitation — weight-based dosing is CRITICAL. Cuffed ETT for all ages (historically avoided in children <8).' },
    ]},
  { id: 'toxic', title: 'Toxidromes & Poisoning', icon: '☠️',
    items: [
      { term: 'Major Toxidromes', def: 'Anticholinergic: "Hot as a hare, blind as a bat, dry as a bone, red as a beet, mad as a hatter." Tachycardia, dry skin, mydriasis, urinary retention, altered mental status, hyperthermia. Agents: diphenhydramine, TCAs, atropine, jimson weed.', detail: 'Cholinergic (DUMBBELSS): Diarrhea, Urination, Miosis, Bronchospasm/Bradycardia, Emesis, Lacrimation, Salivation, Sweating. Agents: organophosphates, carbamates, nerve agents. Treatment: atropine (large doses titrated to dry secretions) + pralidoxime (2-PAM). Sympathomimetic: tachycardia, HTN, hyperthermia, mydriasis, diaphoresis, agitation. Agents: cocaine, amphetamines, MDMA. Treat with benzos, cooling. Opioid: miosis, bradypnea, CNS depression. Naloxone 0.04-2 mg (titrate to respiratory effort, not consciousness).', pearl: 'Serotonin syndrome vs NMS: Both have altered mental status and hyperthermia. Serotonin syndrome: CLONUS (key distinguishing feature), hyperreflexia, diarrhea, mydriasis, rapid onset (hours). Caused by serotonergic drugs (SSRIs, MAOIs, tramadol, linezolid, triptans). Treatment: cyproheptadine + benzos + cooling. NMS: lead-pipe RIGIDITY (no clonus), slow onset (days-weeks), caused by dopamine antagonists (antipsychotics, metoclopramide, droperidol). Treatment: stop offending agent, dantrolene, bromocriptine, cooling.' },
      { term: 'Common Overdoses', def: 'Acetaminophen: #1 cause of acute liver failure in US. Rumack-Matthew nomogram (4-24h post-ingestion). N-acetylcysteine (NAC) is 100% protective if given within 8h. Dose: 150 mg/kg IV over 1h → 50 mg/kg over 4h → 100 mg/kg over 16h (21h IV protocol). Aspirin: respiratory alkalosis + anion gap metabolic acidosis. Ring ears. Treat: NaHCO₃ for urinary alkalinization → dialysis if level >100, AKI, pulmonary edema, seizures, AMS.', detail: 'TCA overdose: "3 C\'s" — Convulsions, Cardiac (wide QRS → sodium channel blockade, treat with NaHCO₃), Coma. QRS >100 ms → NaHCO₃, >160 ms → high risk VT/VF. Digoxin: bradycardia, hyperkalemia, bidirectional VT, visual changes (yellow halos). Treat with Digifab (digoxin-specific antibodies). Beta-blocker/CCB overdose: bradycardia, hypotension. Glucagon for beta-blocker. High-dose insulin (HIE) for CCB (1 U/kg bolus → 1-10 U/kg/hr + dextrose to maintain glucose). IV lipid emulsion for lipophilic drug toxicity (local anesthetic systemic toxicity, CCB).', pearl: 'Toxic alcohols: methanol (formic acid → blindness, basal ganglia necrosis) and ethylene glycol (oxalic acid → renal failure, calcium oxalate crystals in urine). Both: osmolar gap → anion gap metabolic acidosis (gap transitions as parent compound metabolized). Treatment: fomepizole (inhibits alcohol dehydrogenase — preferred) or ethanol drip + hemodialysis if severe (level >50, renal failure, visual symptoms, severe acidosis). Isopropyl alcohol: only ↑ osmolar gap (NO anion gap), ketones without acidosis.' },
    ]},
  { id: 'enviro', title: 'Environmental Emergencies', icon: '🌡️',
    items: [
      { term: 'Heat Illness', def: 'Heat exhaustion: core temp <40°C (104°F), sweating present, fatigue, headache, nausea. Treat: rest, cooling, rehydrate. Heat stroke: core temp >40°C + CNS dysfunction (confusion, seizures, coma). DRY and HOT skin in classic (elderly); may still be sweating in exertional (athletes, military).', detail: 'Treatment of heat stroke: RAPID COOLING is the priority (target <39°C within 30 min). Cold water immersion is gold standard. Evaporative cooling (mist + fan) if immersion not available. Ice packs to groin, axillae, neck. Cold IV fluids. Monitor for rhabdomyolysis (CK, K⁺, myoglobinuria → aggressive IV hydration), DIC, hepatic failure, AKI.', pearl: 'Exertional heat stroke in young athlete: ice water immersion → "cool first, transport second" (start cooling at the event/field before transport). Survival approaches 100% if cooled within 30 minutes. Malignant hyperthermia: genetic susceptibility + triggering agent (succinylcholine, volatile anesthetics) → massive uncontrolled muscle contraction, hyperthermia, rhabdomyolysis, hyperkalemia. Treatment: stop trigger + dantrolene 2.5 mg/kg IV + active cooling + treat hyperkalemia. NOT a toxidrome — it\'s a pharmacogenetic reaction.' },
      { term: 'Hypothermia & Submersion', def: 'Mild (32-35°C): shivering, confusion. Moderate (28-32°C): loss of shivering, bradycardia, arrhythmias, decreased consciousness. Severe (<28°C): VFib risk, coma, fixed dilated pupils (NOT a sign of death — "not dead until warm and dead").', detail: 'Rewarming: Mild → passive (warm environment, blankets). Moderate → active external (forced warm air — Bair Hugger, warm IV fluids 40°C). Severe → active internal (warm peritoneal lavage, warm pleural lavage, ECMO/bypass for cardiac arrest or instability).', pearl: 'Hypothermic cardiac arrest: CPR may be modified (intermittent chest compressions if rescuers unable to provide continuous CPR in remote setting). Defibrillation: may not be effective below 30°C — try once, then focus on rewarming to >30°C before repeating. Withhold vasopressors until >30°C (ineffective). ECMO is the gold standard for rewarming in severe hypothermic cardiac arrest (survival with good neurologic outcome ~50% in appropriate candidates). Cold water submersion in children: hypothermia may be neuroprotective — aggressive resuscitation, don\'t stop until warm (~32°C) and still no ROSC.' },
    ]},
];

export default function EmergencyMedicineGuideView() {
  const [activeId, setActiveId] = useState(null);
  const active = EM_SECTIONS.find(s => s.id === activeId);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2">🚑 Emergency Medicine Guide</h2>
        <p className="text-xs opacity-40 mt-0.5">Trauma, resuscitation, toxidromes & environmental</p>
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
                    <span>💎</span><span className="leading-relaxed">{item.pearl}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {EM_SECTIONS.map(s => (
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
