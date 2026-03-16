import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const TOXICOLOGY_DATA = [
  { toxin: 'Acetaminophen (Paracetamol)', mechanism: 'NAPQI (toxic metabolite) depletes glutathione → hepatic necrosis',
    presentation: 'Phase 1 (0-24h): asymptomatic or nausea/vomiting. Phase 2 (24-72h): ↑ AST/ALT, RUQ pain. Phase 3 (72-96h): fulminant hepatic failure, coagulopathy, renal failure, encephalopathy. Phase 4 (4-14 days): recovery or death.',
    antidote: 'N-Acetylcysteine (NAC) — replenishes glutathione',
    dosing: 'IV: 150 mg/kg over 1h, then 50 mg/kg over 4h, then 100 mg/kg over 16h. Oral: 140 mg/kg load, then 70 mg/kg Q4h × 17 doses.',
    keyPoints: ['Toxic dose: >150 mg/kg or >7.5g (adult single ingestion)', 'Rumack-Matthew nomogram: plot 4h level (>150 mcg/mL at 4h = treat)', 'NAC most effective within 8h but give even if late', 'King\'s College Criteria for transplant: pH <7.30, or (INR >6.5 + Cr >3.4 + grade III/IV HE)'] },
  { toxin: 'Opioids', mechanism: 'Mu-receptor agonist → respiratory depression, CNS depression',
    presentation: 'Classic triad: respiratory depression + miosis (pinpoint pupils) + altered consciousness. Hypotension, hypothermia, ↓ bowel sounds.',
    antidote: 'Naloxone (Narcan) — competitive mu-receptor antagonist',
    dosing: 'IV/IM/IN: Start 0.04-0.4 mg, repeat Q2-3 min up to 10 mg. Higher doses for synthetic opioids (fentanyl). Infusion: 2/3 of reversal dose per hour.',
    keyPoints: ['Start LOW dose in opioid-dependent patients (precipitate withdrawal)', 'Naloxone duration (30-90 min) shorter than most opioids → MUST observe for re-narcotization', 'Fentanyl may require higher/repeated naloxone doses', 'Intubate if not responding to naloxone', '⚠️ Acute withdrawal is not life-threatening but is very uncomfortable'] },
  { toxin: 'Benzodiazepines', mechanism: 'GABA-A receptor positive allosteric modulator → CNS depression',
    presentation: 'Sedation, slurred speech, ataxia, respiratory depression (especially combined with opioids/alcohol). Paradoxical agitation in elderly.',
    antidote: 'Flumazenil — competitive GABA-A antagonist',
    dosing: '0.2 mg IV over 30 sec, then 0.3 mg, then 0.5 mg at 1-min intervals. Max 3-5 mg.',
    keyPoints: ['⚠️ AVOID flumazenil in chronic BZD users → precipitates SEIZURES', 'Avoid in mixed ingestions (especially tricyclics)', 'BZD overdose alone rarely fatal — mainly fatal when combined with opioids/alcohol', 'Supportive care + airway management is usually sufficient'] },
  { toxin: 'Organophosphates (Nerve Agents)', mechanism: 'Irreversible inhibition of acetylcholinesterase → excess acetylcholine (muscarinic + nicotinic)',
    presentation: 'SLUDGE/BBB: Salivation, Lacrimation, Urination, Defecation, GI cramps, Emesis + Bronchospasm, Bradycardia, miosis (small pupils). KILLER Bs: Bradycardia, Bronchospasm, Bronchorrhea.',
    antidote: 'Atropine (muscarinic) + Pralidoxime/2-PAM (regenerates AChE)',
    dosing: 'Atropine: 2-4 mg IV, double dose Q5 min until secretions dry (may need large doses 20-100+ mg). Pralidoxime: 1-2g IV over 15-30 min, repeat in 1h.',
    keyPoints: ['Atropine endpoint: drying of secretions (not heart rate)', 'Pralidoxime must be given early before "aging" of AChE-OP bond', 'Decontaminate: remove clothing, copious water irrigation', 'Protect yourself! Don PPE before treating patient', 'Intermediate syndrome: weakness 24-96h after exposure (respiratory failure)'] },
  { toxin: 'Carbon Monoxide (CO)', mechanism: 'Binds hemoglobin 200× affinity of O₂ → carboxyhemoglobin (COHb) → tissue hypoxia. Also binds cytochrome oxidase.',
    presentation: 'Headache (#1 symptom), nausea, confusion, cherry-red skin (late/rare). Severe: seizures, coma, cardiac ischemia. Delayed neuropsychiatric syndrome (2-40 days later).',
    antidote: '100% O₂ (displaces CO from Hb)',
    dosing: '100% O₂ via NRB mask until COHb <5%. Half-life of COHb: room air 4-6h, 100% O₂ ~60-90 min, hyperbaric O₂ ~20-30 min.',
    keyPoints: ['Pulse oximetry is UNRELIABLE (reads COHb as OxyHb)', 'Must get co-oximetry on ABG for accurate COHb level', 'COHb >25% (or >15% + pregnant/symptoms): consider hyperbaric O₂', 'Consider in multiple patients from same location (house fire, heater), headache in winter'] },
  { toxin: 'Digoxin', mechanism: 'Inhibits Na⁺/K⁺ ATPase → ↑ intracellular Ca²⁺ → enhanced contractility + ↑ vagal tone',
    presentation: 'GI: nausea, vomiting, anorexia. Visual: yellow vision (xanthopsia), halos. Cardiac: almost ANY arrhythmia, classically atrial tachycardia with block, bidirectional VT. Hyperkalemia (acute toxicity).',
    antidote: 'Digoxin-specific antibody fragments (Digibind/DigiFab)',
    dosing: 'Acute ingestion: # vials = (dose ingested mg × 0.8) / 0.5. Chronic toxicity: empiric 5-10 vials.',
    keyPoints: ['Digoxin toxicity potentiated by: hypokalemia, hypomagnesemia, hypercalcemia, renal failure', 'Do NOT give calcium for hyperkalemia in dig toxicity ("stone heart")', 'Bidirectional VT is pathognomonic for dig toxicity', 'Cardioversion is dangerous — use lowest energy possible', 'Therapeutic level 0.5-2.0 ng/mL but toxicity can occur at "therapeutic" levels'] },
  { toxin: 'Tricyclic Antidepressants (TCAs)', mechanism: 'Block Na⁺ channels (cardiac), muscarinic receptors (anticholinergic), H₁ receptors, α₁ receptors, serotonin/NE reuptake',
    presentation: 'Anticholinergic toxidrome: dry, red, hot, blind, mad (mydriasis, tachycardia, urinary retention, ileus). Cardiac: prolonged QRS (>100 ms), QTc prolongation, arrhythmias. Seizures. Hypotension.',
    antidote: 'Sodium bicarbonate (for QRS widening / arrhythmias)',
    dosing: 'NaHCO₃: 1-2 mEq/kg IV bolus, repeat until QRS narrows (<100 ms). Then infusion of 150 mEq NaHCO₃ in 1L D5W at 1.5-2× maintenance.',
    keyPoints: ['QRS >100 ms = risk of seizures. QRS >160 ms = risk of arrhythmias', 'Sodium bicarb: ↑ serum pH + ↑ Na⁺ → overcomes Na⁺ channel blockade', 'DO NOT give flumazenil (seizure risk)', 'Lethal dose can be as low as 10-20 mg/kg', 'Always get ECG immediately — QRS width is the key prognostic marker'] },
  { toxin: 'Methanol / Ethylene Glycol', mechanism: 'Methanol → formic acid (optic nerve damage), Ethylene glycol → oxalic acid (renal failure, Ca²⁺ oxalate crystals)',
    presentation: 'Methanol: visual disturbance ("snowstorm" → blindness), AG metabolic acidosis ± osmol gap. Ethylene glycol: CNS depression → cardiopulmonary → renal failure (12-72h), AG metabolic acidosis, calcium oxalate crystals in urine.',
    antidote: 'Fomepizole (4-MP) — inhibits alcohol dehydrogenase (blocks toxic metabolite formation). Ethanol (alternative).',
    dosing: 'Fomepizole: 15 mg/kg loading, then 10 mg/kg Q12h × 4, then 15 mg/kg Q12h. Ethanol: target serum level 100-150 mg/dL.',
    keyPoints: ['Osmol gap = measured Osm – calculated Osm (elevated early, before metabolites form)', 'Late: osmol gap normalizes as AG rises (metabolites accumulate)', 'Hemodialysis if: pH <7.15, visual changes, renal failure, serum level >50 mg/dL', 'Fomepizole preferred over ethanol (fewer side effects, easier dosing)', 'Wood lamp: ethylene glycol → urine may fluoresce (antifreeze additive)'] },
];

export default function ToxicologyView() {
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState(null);
  const filtered = TOXICOLOGY_DATA.filter(t => !search || (t.toxin + ' ' + t.antidote + ' ' + t.presentation).toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0 space-y-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2">☠️ Toxicology & Antidotes</h2>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search poisons / antidotes…"
          className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none"
          style={{ background: 'var(--surface,var(--card))', border: '1px solid var(--border)' }} />
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {filtered.map(t => {
          const isOpen = expanded === t.toxin;
          return (
            <div key={t.toxin} className="glass rounded-2xl overflow-hidden" style={{ border: `1px solid ${isOpen ? '#ef444440' : 'var(--border)'}` }}>
              <button onClick={() => setExpanded(e => e === t.toxin ? null : t.toxin)}
                className="w-full p-4 text-left flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0" style={{ background: '#ef444410' }}>☠️</div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-sm">{t.toxin}</h3>
                  <p className="text-xs opacity-40 mt-0.5">Antidote: {t.antidote}</p>
                </div>
                <ChevronDown size={14} className="opacity-40 shrink-0 transition-transform" style={{ transform: isOpen ? 'rotate(180deg)' : 'none' }} />
              </button>
              {isOpen && (
                <div className="px-4 pb-5 space-y-4 animate-fade-in-up">
                  <div className="glass rounded-xl p-3" style={{ background: '#ef444408', border: '1px solid #ef444420' }}>
                    <h4 className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: '#ef4444' }}>Mechanism</h4>
                    <p className="text-xs opacity-70 leading-relaxed">{t.mechanism}</p>
                  </div>
                  <div>
                    <h4 className="text-xs font-black uppercase tracking-widest opacity-40 mb-1">Presentation</h4>
                    <p className="text-xs opacity-70 leading-relaxed">{t.presentation}</p>
                  </div>
                  <div className="glass rounded-xl p-3" style={{ background: '#10b98108', border: '1px solid #10b98120' }}>
                    <h4 className="text-xs font-black uppercase tracking-widest mb-1" style={{ color: '#10b981' }}>💉 Antidote: {t.antidote}</h4>
                    <p className="text-xs opacity-70 leading-relaxed">{t.dosing}</p>
                  </div>
                  <div className="glass rounded-xl p-3" style={{ background: '#f59e0b08', border: '1px solid #f59e0b20' }}>
                    <h4 className="text-xs font-black mb-2" style={{ color: '#f59e0b' }}>💎 Key Points</h4>
                    {t.keyPoints.map((kp, i) => (
                      <div key={i} className="flex gap-2 text-xs py-0.5">
                        <span style={{ color: '#f59e0b' }}>▸</span>
                        <span className="opacity-70 leading-relaxed">{kp}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <div className="empty-state py-12"><p className="font-black mt-4">No toxins found</p></div>}
      </div>
    </div>
  );
}
