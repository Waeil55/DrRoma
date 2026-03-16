import { useState } from 'react';
import { ChevronLeft } from 'lucide-react';

const VENT_WAVEFORMS = [
  { id: 'basics', title: 'Waveform Basics', icon: '📊',
    items: [
      { term: 'Pressure-Time Waveform', def: 'Y-axis: airway pressure (cmH₂O). X-axis: time. Shows pressure changes during one breath cycle.', detail: 'Volume Control (VC): ascending pressure curve (increases as volume delivered). Pressure Control (PC): square-wave pressure (constant pressure maintained). PEEP: baseline pressure > 0. PIP: peak inspiratory pressure.', pearl: 'PIP vs Plateau Pressure: PIP = peak airway pressure (includes resistive + elastic components). Plateau (Pplat) = pressure during inspiratory pause (elastic component only). High PIP with normal Pplat = RESISTANCE problem (bronchospasm, secretions, kinked tube). High PIP with high Pplat = COMPLIANCE problem (ARDS, pneumothorax, pulmonary edema).' },
      { term: 'Flow-Time Waveform', def: 'Y-axis: flow (L/min). X-axis: time. Positive = inspiratory flow. Negative = expiratory flow.', detail: 'VC: constant (square) or decelerating inspiratory flow. PC: decelerating inspiratory flow (reaches zero if inspiratory time adequate). Expiratory flow: should return to baseline before next breath.', pearl: 'Expiratory flow NOT returning to baseline = AUTO-PEEP (air trapping). Management: ↑ expiratory time (↓ I:E ratio, ↓ RR, ↑ flow rate). Critical in COPD/asthma patients.' },
      { term: 'Volume-Time Waveform', def: 'Y-axis: volume (mL). X-axis: time. Saw-tooth pattern: rises during inspiration, falls during expiration.', detail: 'In VC: volume delivered = set tidal volume (square top). In PC: volume varies with compliance/resistance. If expiratory volume < inspiratory volume → AIR LEAK (check cuff, circuit connections).', pearl: 'Volume not returning to zero baseline = air trapping (auto-PEEP) or air leak. Always check both inspiratory AND expiratory tidal volumes — discrepancy suggests leak.' },
    ]},
  { id: 'trouble', title: 'Troubleshooting', icon: '🔧',
    items: [
      { term: 'High Peak Pressure Alarm', def: 'PIP exceeds set limit. Causes: resistive (↑PIP, normal Pplat) vs compliance (↑PIP, ↑Pplat).', detail: 'Resistive causes: bronchospasm, secretions, kinked ETT, biting tube, small ETT. Compliance causes: pneumothorax, mainstem intubation, pulmonary edema, ARDS, abdominal distension, pleural effusion.', pearl: 'Systematic approach: (1) Assess patient (chest rise, SpO₂, auscultation). (2) Suction ETT. (3) Check circuit for kinks/water. (4) Inspiratory hold → Pplat. High PIP + normal Pplat = resistive. High PIP + high Pplat = compliance.' },
      { term: 'Auto-PEEP (Intrinsic PEEP)', def: 'Air trapped from incomplete expiration. Expiratory flow doesn\'t reach zero. Causes: COPD, asthma, high RR, short expiratory time.', detail: 'Consequences: ↑ work of breathing, hemodynamic compromise (↓ venous return), patient-vent dyssynchrony, inaccurate PEEP measurement.', pearl: 'Measurement: expiratory hold maneuver → total PEEP - set PEEP = auto-PEEP. Treatment: ↓ RR, ↓ I:E ratio, ↑ inspiratory flow, bronchodilators. External PEEP at 50-80% of auto-PEEP can help trigger ventilator (reduces trigger threshold).' },
      { term: 'Patient-Ventilator Dyssynchrony', def: 'Mismatch between patient\'s respiratory effort and ventilator delivery. Common and under-recognized.', detail: 'Types: (1) Trigger dyssynchrony: missed triggers, auto-triggering. (2) Flow dyssynchrony: inadequate flow rate (VC mode). (3) Cycle dyssynchrony: breath terminates too early/late. (4) Double-triggering: one patient effort triggers two ventilator breaths.', pearl: 'Flow starvation (in VC mode): patient pulling against insufficient flow → concave pressure waveform during inspiration. Fix: ↑ flow rate, or switch to PC mode (flow varies with demand). Sedation should NOT be first-line for dyssynchrony — fix the ventilator first.' },
      { term: 'Pressure-Volume Loops', def: 'X-axis: volume. Y-axis: pressure. Counterclockwise loop during mechanical ventilation.', detail: 'Lower Inflection Point (LIP): suggests optimal PEEP level. Upper Inflection Point (UIP): overdistension begins. Set PEEP above LIP, tidal volume below UIP. Beaking on loop = overdistension.', pearl: 'P-V loop practical pearls: (1) Increased loop width = ↑ airway resistance. (2) Loop shifted right = ↓ compliance. (3) "Figure-8" = flow dyssynchrony. (4) Beaking/flattening at top = overdistension → ↓ tidal volume.' },
    ]},
  { id: 'modes', title: 'Mode Quick Reference', icon: '⚙️',
    items: [
      { term: 'AC/VC (Assist-Control Volume)', def: 'Set: Vt, RR, FiO₂, PEEP, flow rate. Guaranteed tidal volume. Pressure varies.', detail: 'Each breath delivers set Vt. Patient can trigger additional breaths (all at set Vt). Constant flow pattern. Monitor: PIP, Pplat, auto-PEEP.', pearl: 'ARDSNet protocol uses AC/VC: Vt 6 mL/kg IBW, Pplat ≤30 cmH₂O. If Pplat >30: ↓ Vt to 5 or 4 mL/kg. Allow permissive hypercapnia (pH >7.20). PEEP/FiO₂ table-guided.' },
      { term: 'AC/PC (Assist-Control Pressure)', def: 'Set: ΔP (above PEEP), RR, FiO₂, PEEP, I-time. Guaranteed pressure. Volume varies.', detail: 'Each breath maintains set ΔP. Decelerating flow pattern. Vt varies with compliance/resistance — MUST monitor Vt closely. If compliance worsens → Vt drops.', pearl: 'PC advantage: decelerating flow is more physiologic, better distribution of ventilation. Disadvantage: Vt NOT guaranteed — if patient desaturates, check if Vt dropped (worsening compliance → need to ↑ ΔP).' },
      { term: 'PSV (Pressure Support)', def: 'Set: PS level, FiO₂, PEEP. Patient controls RR, Vt, I-time. Augments spontaneous breaths.', detail: 'Only for spontaneously breathing patients (no backup rate in pure PSV). Breath terminates when flow drops to 25% of peak. Good for weaning assessment (SBT at PS 5-8 / PEEP 5).', pearl: 'SBT (Spontaneous Breathing Trial): PS 5-8/PEEP 5 for 30-120 min. Pass criteria: RR <35, SpO₂ >90%, no distress, RSBI <105 (RR/Vt). Fail: ↑RR, ↑HR, ↓SpO₂, diaphoresis, paradoxical breathing.' },
      { term: 'APRV (Airway Pressure Release)', def: 'Essentially CPAP with intermittent releases. P-high (sustained), T-high (time at P-high, long), P-low (release pressure, usually 0), T-low (release time, very short ~0.5-0.8s).', detail: 'Maintains continuous alveolar recruitment. Brief releases for CO₂ clearance. Patient can breathe spontaneously throughout cycle. Used in ARDS as alternative to conventional strategies.', pearl: 'T-low is critical: set so expiratory flow drops to 75% of peak expiratory flow (prevents derecruitment). APRV is essentially "open lung ventilation." Controversial: not proven superior to low-Vt strategy. Requires experienced team.' },
    ]},
];

function VentilatorGraphsView() {
  const [activeId, setActiveId] = useState(null);
  const active = VENT_WAVEFORMS.find(s => s.id === activeId);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2">📊 Ventilator Waveforms</h2>
        <p className="text-xs opacity-40 mt-0.5">Waveform interpretation & troubleshooting</p>
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
                  <div className="glass rounded-xl p-3 mt-2 flex items-start gap-2 text-xs" style={{ background: '#6366f108', border: '1px solid #6366f120', color: '#6366f1' }}>
                    <span>⚡</span><span className="leading-relaxed">{item.pearl}</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {VENT_WAVEFORMS.map(s => (
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

export default VentilatorGraphsView;
