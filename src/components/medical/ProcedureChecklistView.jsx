import { useState } from 'react';
import { ChevronLeft, CheckCircle2 } from 'lucide-react';

const PROCEDURE_CHECKLISTS = [
  { id: 'central_line', title: 'Central Venous Catheter (IJ)', cat: 'Critical Care', difficulty: 'Advanced', time: '30-45 min',
    equipment: ['CVC kit (triple lumen)', 'Ultrasound + sterile probe cover', 'Sterile gown, gloves, drapes', 'Chlorhexidine prep', 'Lidocaine 1%', 'Sterile saline flush  3', 'Suture material (silk 2-0)', 'Sterile dressing (tegaderm)'],
    steps: [
      { text: 'Obtain informed consent', critical: false },
      { text: 'Position: Trendelenburg, head turned contralateral', critical: false },
      { text: 'Full sterile barrier precautions (cap, mask, gown, gloves, full drape)', critical: true },
      { text: 'Identify IJ vein with ultrasound (lateral to carotid artery)', critical: true },
      { text: 'Prep skin with chlorhexidine (2 min scrub, dry 30 sec)', critical: true },
      { text: 'Anesthetize skin with lidocaine', critical: false },
      { text: 'Insert needle under real-time US guidance at 45° angle', critical: true },
      { text: 'Aspirate dark venous blood (confirm venous, not arterial)', critical: true },
      { text: 'Thread guidewire through needle (should pass easily)', critical: true },
      { text: 'Confirm wire on US in vein (long-axis view)', critical: true },
      { text: 'Nick skin with scalpel, dilate tract', critical: false },
      { text: 'Thread catheter over wire to appropriate depth (12-15 cm right IJ)', critical: false },
      { text: 'REMOVE GUIDEWIRE', critical: true },
      { text: 'Aspirate and flush all ports', critical: true },
      { text: 'Secure with suture and apply sterile dressing', critical: false },
      { text: 'Confirm placement with CXR (tip at cavo-atrial junction)', critical: true },
    ],
    pearls: ['ALWAYS confirm wire removed before leaving bedside', 'CXR mandatory to rule out pneumothorax', 'Never force the wire  if resistance, reposition', 'Right IJ preferred (straight path to SVC)'] },
  { id: 'lumbar_puncture', title: 'Lumbar Puncture', cat: 'Neurology', difficulty: 'Intermediate', time: '20-30 min',
    equipment: ['LP kit (spinal needle 20-22G, manometer)', 'Sterile drapes, gown, gloves', 'Chlorhexidine prep', 'Lidocaine 1%', 'Collection tubes  4', 'Sterile dressing'],
    steps: [
      { text: 'Check: CT head if indicated (papilledema, focal neuro signs, immunocompromised)', critical: true },
      { text: 'Check platelet count and coagulation (INR <1.5, Plt >50k)', critical: true },
      { text: 'Position: lateral decubitus (fetal position) or sitting', critical: false },
      { text: 'Identify L3-L4 or L4-L5 interspace (iliac crest line = L4)', critical: false },
      { text: 'Full sterile prep and drape', critical: true },
      { text: 'Anesthetize skin and deeper tissues with lidocaine', critical: false },
      { text: 'Insert spinal needle bevel up (midline, angled slightly cephalad)', critical: false },
      { text: 'Advance through ligamentum flavum  feel "pop" into subarachnoid space', critical: false },
      { text: 'Remove stylet, observe CSF flow', critical: false },
      { text: 'Measure opening pressure with manometer (normal 6-20 cmHO)', critical: true },
      { text: 'Collect 1-2 mL in each of 4 tubes (cell count, glucose/protein, micro, cytology/special)', critical: false },
      { text: 'Replace stylet, remove needle, apply dressing', critical: false },
      { text: 'Patient supine  1 hour (reduces post-LP headache)', critical: false },
    ],
    pearls: ['Tube 1: cell count + protein. Tube 4: cell count (compare for traumatic tap vs SAH)', 'Post-LP headache: positional, improved lying flat. Blood patch if persistent', 'Send CSF glucose WITH serum glucose (ratio is key)', 'Xanthochromia (yellow CSF) = subarachnoid hemorrhage >6h old'] },
  { id: 'intubation', title: 'Endotracheal Intubation (RSI)', cat: 'Emergency', difficulty: 'Advanced', time: '10-15 min',
    equipment: ['Laryngoscope (Mac 3-4 or video laryngoscope)', 'ETT (7.0-7.5 women, 8.0-8.5 men)', 'BVM + O source', 'Suction (Yankauer)', 'Stylet', 'Induction agent: Ketamine 1-2mg/kg or Propofol 1-2mg/kg', 'Paralytic: Succinylcholine 1.5mg/kg or Rocuronium 1.2mg/kg', 'Bougie', 'End-tidal CO detector', 'Syringe for cuff (10 mL)'],
    steps: [
      { text: 'Assess airway: LEMON (Look, Evaluate 3-3-2, Mallampati, Obstruction, Neck mobility)', critical: true },
      { text: 'Pre-oxygenate: 100% O  3 min (or 8 vital capacity breaths)', critical: true },
      { text: 'Position: sniffing position (ear to sternal notch alignment)', critical: false },
      { text: 'Prepare backup plan: bougie, supraglottic airway (LMA), surgical cricothyrotomy kit', critical: true },
      { text: 'Push induction agent (Ketamine if hypotensive, Propofol if stable)', critical: false },
      { text: 'Push paralytic (Succinylcholine or Rocuronium)', critical: false },
      { text: 'Wait 45-60 seconds for full paralysis', critical: false },
      { text: 'Laryngoscopy: insert blade, lift epiglottis (Mac) identify vocal cords', critical: false },
      { text: 'Pass ETT through cords  stop when cuff is 2 cm past cords', critical: true },
      { text: 'Inflate cuff, remove stylet', critical: false },
      { text: 'Confirm placement: EtCO (GOLD STANDARD), bilateral breath sounds, no epigastric sounds, chest rise', critical: true },
      { text: 'Secure tube and note depth at teeth (21-23 cm for adult)', critical: false },
      { text: 'Obtain CXR for tube position (tip 2-4 cm above carina)', critical: false },
      { text: 'Start ventilator settings (TV 6-8 mL/kg IBW, RR 14-16, FiO 100%  titrate)', critical: false },
    ],
    pearls: ['END-TIDAL CO is the ONLY reliable confirmation', 'Rocuronium preferred if succinylcholine contraindicated (hyperkalemia, burns, denervation)', 'BURP maneuver (backward, upward, rightward pressure) improves view', 'If can\'t intubate, can\'t oxygenate  surgical airway (cricothyrotomy)'] },
  { id: 'paracentesis', title: 'Paracentesis', cat: 'Gastroenterology', difficulty: 'Intermediate', time: '15-20 min',
    equipment: ['Paracentesis kit or 18G needle + syringe', 'Sterile drapes, gloves', 'Chlorhexidine', 'Lidocaine 1%', 'Specimen tubes', 'Vacuum bottles (if therapeutic, 4-6L)', 'Albumin (if removing >5L: give 6-8g per L removed)'],
    steps: [
      { text: 'Confirm ascites clinically or with bedside US', critical: false },
      { text: 'Position: supine, slightly left lateral decubitus', critical: false },
      { text: 'Identify insertion point: LLQ (2 finger-breadths medial + cephalad to ASIS)', critical: true },
      { text: 'Verify no bowel/vessels at site with US', critical: true },
      { text: 'Sterile prep and drape', critical: true },
      { text: 'Anesthetize with lidocaine (skin through peritoneum)', critical: false },
      { text: 'Insert needle using Z-track technique (pull skin 2 cm caudally before puncturing)', critical: false },
      { text: 'Advance until fluid returns', critical: false },
      { text: 'Collect diagnostic samples: cell count, albumin, protein, cultures (inoculate blood culture bottles at bedside)', critical: true },
      { text: 'If therapeutic: connect to vacuum bottles and drain slowly', critical: false },
      { text: 'Remove needle, apply dressing', critical: false },
      { text: 'If >5L removed: give IV albumin 6-8g per liter removed', critical: true },
    ],
    pearls: ['SAAG 1.1 = portal hypertension. PMN 250 = spontaneous bacterial peritonitis (SBP)', 'No need to correct INR/platelets before paracentesis in cirrhosis', 'Z-track prevents post-procedure ascites leak', 'Always check cell count  even if fluid looks clear (SBP can be clear)'] },
];

export default function ProcedureChecklistView() {
  const [activeId, setActiveId] = useState(null);
  const [checked, setChecked] = useState({});
  const active = PROCEDURE_CHECKLISTS.find(p => p.id === activeId);

  const toggle = (idx) => {
    const key = `${activeId}_${idx}`;
    setChecked(p => ({ ...p, [key]: !p[key] }));
  };

  const progress = active ? active.steps.filter((_, i) => checked[`${activeId}_${i}`]).length : 0;
  const total = active ? active.steps.length : 0;

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2"> Procedure Checklists</h2>
        <p className="text-xs opacity-40 mt-0.5">Step-by-step clinical procedures</p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {active ? (
          <div className="space-y-4 animate-fade-in-up">
            <div className="flex items-center gap-3">
              <button onClick={() => { setActiveId(null); }} className="glass w-9 h-9 rounded-xl flex items-center justify-center"><ChevronLeft size={16} /></button>
              <div className="flex-1">
                <h2 className="font-black">{active.title}</h2>
                <p className="text-xs opacity-40">{active.cat} · {active.difficulty} · ~{active.time}</p>
              </div>
              <div className="text-right">
                <span className="text-sm font-black" style={{ color: progress === total ? '#10b981' : 'var(--accent)' }}>{progress}/{total}</span>
              </div>
            </div>

            {/* Progress bar */}
            <div className="h-2 rounded-full overflow-hidden" style={{ background: 'var(--border)' }}>
              <div className="h-full rounded-full transition-all" style={{ width: `${total > 0 ? (progress / total) * 100 : 0}%`, background: progress === total ? '#10b981' : 'var(--accent)' }} />
            </div>

            {/* Equipment */}
            <div className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
              <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-3"> Equipment</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                {active.equipment.map((eq, i) => (
                  <div key={i} className="flex items-center gap-2 text-xs py-1">
                    <span style={{ color: 'var(--accent)' }}></span>
                    <span className="opacity-70">{eq}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Steps */}
            <div className="space-y-2">
              {active.steps.map((s, i) => {
                const isDone = checked[`${activeId}_${i}`];
                return (
                  <button key={i} onClick={() => toggle(i)}
                    className="w-full flex items-start gap-3 glass rounded-2xl p-4 text-left transition-all"
                    style={{ border: `1px solid ${s.critical ? '#f59e0b30' : 'var(--border)'}`, opacity: isDone ? .5 : 1 }}>
                    <div className="w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5 transition-all"
                      style={isDone ? { background: '#10b981', color: '#fff' } : { background: 'var(--surface,var(--card))', border: '2px solid var(--border)' }}>
                      {isDone && <CheckCircle2 size={14} />}
                    </div>
                    <div className="flex-1">
                      <span className={`text-sm ${isDone ? 'line-through opacity-50' : 'font-bold'}`}>{s.text}</span>
                      {s.critical && !isDone && <span className="ml-2 text-xs px-1.5 py-0.5 rounded" style={{ background: '#f59e0b15', color: '#f59e0b' }}>CRITICAL</span>}
                    </div>
                    <span className="text-xs opacity-20 shrink-0 pt-1">{i + 1}</span>
                  </button>
                );
              })}
            </div>

            {/* Pearls */}
            {active.pearls?.length > 0 && (
              <div className="glass rounded-2xl p-5" style={{ border: '1px solid #f59e0b20', background: '#f59e0b05' }}>
                <h3 className="font-black text-sm flex items-center gap-2 mb-3" style={{ color: '#f59e0b' }}> Clinical Pearls</h3>
                {active.pearls.map((p, i) => <div key={i} className="flex gap-2 text-xs py-1"><span style={{ color: '#f59e0b' }}></span><span className="opacity-70 leading-relaxed">{p}</span></div>)}
              </div>
            )}
          </div>
        ) : (
          PROCEDURE_CHECKLISTS.map(p => (
            <button key={p.id} onClick={() => setActiveId(p.id)}
              className="w-full glass rounded-2xl p-5 text-left transition-all card-hover"
              style={{ border: '1px solid var(--border)' }}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <h3 className="font-black">{p.title}</h3>
                <span className="px-2.5 py-1 rounded-lg text-xs font-black shrink-0"
                  style={{ background: p.difficulty === 'Advanced' ? '#ef444415' : '#f59e0b15', color: p.difficulty === 'Advanced' ? '#ef4444' : '#f59e0b' }}>
                  {p.difficulty}
                </span>
              </div>
              <p className="text-xs opacity-50">{p.cat} · {p.steps.length} steps · ~{p.time}</p>
            </button>
          ))
        )}
      </div>
    </div>
  );
}
