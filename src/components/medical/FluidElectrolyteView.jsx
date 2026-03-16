import { useState } from 'react';

export default function FluidElectrolyteView() {
  const [tab, setTab] = useState('maintenance');
  const [weight, setWeight] = useState('');
  const [sodium, setSodium] = useState('');
  const [potassium, setPotassium] = useState('');
  const [serumNa, setSerumNa] = useState('');
  const [targetNa, setTargetNa] = useState('');
  const [tbw, setTbw] = useState('');
  const [sex, setSex] = useState('male');

  const w = parseFloat(weight) || 0;
  const maintenance = w <= 10 ? w * 100 : w <= 20 ? 1000 + (w - 10) * 50 : 1500 + (w - 20) * 20;
  const maintenanceRate = (maintenance / 24).toFixed(1);
  const naVal = parseFloat(sodium) || parseFloat(serumNa) || 0;
  const targetNaVal = parseFloat(targetNa) || 140;
  const tbwVal = parseFloat(tbw) || (w * (sex === 'male' ? 0.6 : 0.5));
  const freeWaterDeficit = naVal > 0 ? (((naVal / 140) - 1) * tbwVal).toFixed(1) : null;
  const naDeficit3Pct = (targetNaVal - naVal) > 0 ? ((targetNaVal - naVal) * tbwVal).toFixed(0) : null;
  const kVal = parseFloat(potassium) || 0;

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2">💧 Fluids & Electrolytes</h2>
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {[['maintenance', '💉 Maintenance'], ['sodium', '🧂 Sodium'], ['potassium', '⚡ Potassium'], ['deficit', '📐 Deficit Calculator']].map(([id, label]) => (
            <button key={id} onClick={() => setTab(id)}
              className="px-3 py-1.5 rounded-xl text-xs font-black shrink-0 whitespace-nowrap transition-all"
              style={tab === id ? { background: 'var(--accent)', color: '#fff' } : { opacity: .5 }}>
              {label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {tab === 'maintenance' && (
          <>
            <div className="glass rounded-2xl p-5 space-y-4" style={{ border: '1px solid var(--border)' }}>
              <h3 className="font-black text-sm">Maintenance IV Fluids (Holliday-Segar)</h3>
              <div>
                <label className="text-xs font-black opacity-40 block mb-1">Weight (kg)</label>
                <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="Enter weight…"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none" style={{ border: '1px solid var(--border)' }} />
              </div>
              <div className="grid grid-cols-3 gap-1.5">
                {[10, 20, 30, 40, 50, 60, 70, 80, 100].map(wt => (
                  <button key={wt} onClick={() => setWeight(String(wt))}
                    className="py-1.5 rounded-lg text-xs font-black transition-all"
                    style={String(wt) === weight ? { background: 'var(--accent)', color: '#fff' } : { opacity: .4, border: '1px solid var(--border)' }}>
                    {wt} kg
                  </button>
                ))}
              </div>
            </div>
            {w > 0 && (
              <div className="glass rounded-2xl p-6 text-center animate-scale-in" style={{ border: '1px solid var(--accent)/30' }}>
                <div className="text-3xl font-black mb-1" style={{ color: 'var(--accent)' }}>{maintenance.toFixed(0)} mL/day</div>
                <div className="text-lg font-bold opacity-60">{maintenanceRate} mL/hr</div>
                <div className="mt-4 grid grid-cols-3 gap-2">
                  <div className="glass rounded-xl p-3" style={{ border: '1px solid var(--border)' }}>
                    <div className="text-xs font-black opacity-40">First 10 kg</div>
                    <div className="text-sm font-black">{Math.min(w, 10) * 100} mL</div>
                    <div className="text-xs opacity-30">100 mL/kg</div>
                  </div>
                  <div className="glass rounded-xl p-3" style={{ border: '1px solid var(--border)' }}>
                    <div className="text-xs font-black opacity-40">Next 10 kg</div>
                    <div className="text-sm font-black">{Math.min(Math.max(w - 10, 0), 10) * 50} mL</div>
                    <div className="text-xs opacity-30">50 mL/kg</div>
                  </div>
                  <div className="glass rounded-xl p-3" style={{ border: '1px solid var(--border)' }}>
                    <div className="text-xs font-black opacity-40">Each add'l kg</div>
                    <div className="text-sm font-black">{Math.max(w - 20, 0) * 20} mL</div>
                    <div className="text-xs opacity-30">20 mL/kg</div>
                  </div>
                </div>
                <div className="mt-4 glass rounded-xl p-3 text-left" style={{ border: '1px solid var(--border)' }}>
                  <h4 className="text-xs font-black opacity-40 mb-2">Daily Electrolyte Requirements</h4>
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div><div className="text-sm font-black" style={{ color: '#3b82f6' }}>{(maintenance * 3 / 100).toFixed(0)} mEq</div><div className="text-xs opacity-40">Na⁺ (3 mEq/100mL)</div></div>
                    <div><div className="text-sm font-black" style={{ color: '#8b5cf6' }}>{(maintenance * 2 / 100).toFixed(0)} mEq</div><div className="text-xs opacity-40">K⁺ (2 mEq/100mL)</div></div>
                    <div><div className="text-sm font-black" style={{ color: '#10b981' }}>{(maintenance * 5 / 100).toFixed(0)} g</div><div className="text-xs opacity-40">Dextrose (5g/100mL)</div></div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {tab === 'sodium' && (
          <>
            <div className="glass rounded-2xl p-5 space-y-4" style={{ border: '1px solid var(--border)' }}>
              <h3 className="font-black text-sm">Sodium Disorders</h3>
              <p className="text-xs opacity-50 leading-relaxed">
                <strong>Hyponatremia</strong> (Na⁺ &lt;135 mEq/L): Most common electrolyte disorder.
                Approach: Assess volume status (hypo/eu/hyper-volemic). Check serum osmolality. Check urine Na⁺ and osmolality.
              </p>
              <div className="space-y-3">
                <div className="glass rounded-xl p-4" style={{ background: '#ef444408', border: '1px solid #ef444420' }}>
                  <h4 className="text-xs font-black" style={{ color: '#ef4444' }}>⚠️ Severe Hyponatremia (Na⁺ &lt;120, symptomatic)</h4>
                  <p className="text-xs opacity-70 mt-1 leading-relaxed">Give 3% saline 100-150 mL bolus over 10-20 min. Raise Na⁺ by 4-6 mEq in first 6 hours. Max correction: 8-10 mEq/24h. Overcorrection → osmotic demyelination syndrome (ODS).</p>
                </div>
                <div className="glass rounded-xl p-4" style={{ background: '#f59e0b08', border: '1px solid #f59e0b20' }}>
                  <h4 className="text-xs font-black" style={{ color: '#f59e0b' }}>Hypernatremia (Na⁺ &gt;145)</h4>
                  <p className="text-xs opacity-70 mt-1 leading-relaxed">Usually from free water loss (dehydration). Replace free water deficit slowly. Correct no faster than 10-12 mEq/24h (risk of cerebral edema).</p>
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
              <h4 className="text-xs font-black opacity-40 mb-2">Causes by Volume Status (Hyponatremia)</h4>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
                <div className="glass rounded-xl p-3" style={{ border: '1px solid var(--border)' }}>
                  <div className="font-black mb-1">Hypovolemic</div>
                  <div className="opacity-60 space-y-0.5"><p>• Diuretics (thiazides)</p><p>• Vomiting/diarrhea</p><p>• Adrenal insufficiency</p><p>• Cerebral salt wasting</p></div>
                </div>
                <div className="glass rounded-xl p-3" style={{ border: '1px solid var(--border)' }}>
                  <div className="font-black mb-1">Euvolemic</div>
                  <div className="opacity-60 space-y-0.5"><p>• SIADH (#1 cause)</p><p>• Hypothyroidism</p><p>• Psychogenic polydipsia</p><p>• Beer potomania</p></div>
                </div>
                <div className="glass rounded-xl p-3" style={{ border: '1px solid var(--border)' }}>
                  <div className="font-black mb-1">Hypervolemic</div>
                  <div className="opacity-60 space-y-0.5"><p>• Heart failure</p><p>• Cirrhosis</p><p>• Nephrotic syndrome</p></div>
                </div>
              </div>
            </div>
          </>
        )}

        {tab === 'potassium' && (
          <>
            <div className="glass rounded-2xl p-5 space-y-4" style={{ border: '1px solid var(--border)' }}>
              <h3 className="font-black text-sm">Potassium Disorders</h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="glass rounded-xl p-4" style={{ background: '#ef444408', border: '1px solid #ef444420' }}>
                  <h4 className="text-xs font-black" style={{ color: '#ef4444' }}>Hyperkalemia (K⁺ &gt;5.5)</h4>
                  <div className="text-xs opacity-70 mt-2 space-y-1 leading-relaxed">
                    <p><strong>ECG changes (progressive):</strong></p>
                    <p>1. Peaked T waves (earliest)</p>
                    <p>2. Prolonged PR interval</p>
                    <p>3. Loss of P waves</p>
                    <p>4. Widened QRS</p>
                    <p>5. Sine wave → VF/asystole</p>
                    <p className="mt-2"><strong>Treatment (C BIG K):</strong></p>
                    <p>C — Calcium gluconate (stabilize membrane)</p>
                    <p>B — Bicarb (shift K⁺ intracellular)</p>
                    <p>I — Insulin + glucose (shift K⁺)</p>
                    <p>G — Give albuterol (salbutamol nebulizer)</p>
                    <p>K — Kayexalate / Patiromer (remove K⁺)</p>
                    <p>+ Loop diuretic (furosemide) or Dialysis</p>
                  </div>
                </div>
                <div className="glass rounded-xl p-4" style={{ background: '#3b82f608', border: '1px solid #3b82f620' }}>
                  <h4 className="text-xs font-black" style={{ color: '#3b82f6' }}>Hypokalemia (K⁺ &lt;3.5)</h4>
                  <div className="text-xs opacity-70 mt-2 space-y-1 leading-relaxed">
                    <p><strong>ECG changes:</strong></p>
                    <p>1. T wave flattening</p>
                    <p>2. ST depression</p>
                    <p>3. U waves</p>
                    <p>4. Prolonged QT</p>
                    <p className="mt-2"><strong>Causes:</strong></p>
                    <p>• Diuretics (loop, thiazide)</p>
                    <p>• Vomiting / NG suction</p>
                    <p>• Diarrhea</p>
                    <p>• Insulin / β₂-agonists (shift)</p>
                    <p>• Renal tubular acidosis</p>
                    <p className="mt-2"><strong>Replacement:</strong></p>
                    <p>Oral preferred if able. IV: max 20 mEq/hr peripheral, 40 mEq/hr central.</p>
                    <p>⚠️ Check Mg²⁺ — hypokalemia refractory to correction if Mg²⁺ is also low.</p>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {tab === 'deficit' && (
          <>
            <div className="glass rounded-2xl p-5 space-y-4" style={{ border: '1px solid var(--border)' }}>
              <h3 className="font-black text-sm">Free Water Deficit & Sodium Correction</h3>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-black opacity-40 block mb-1">Weight (kg)</label>
                  <input type="number" value={weight} onChange={e => setWeight(e.target.value)}
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none" style={{ border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label className="text-xs font-black opacity-40 block mb-1">Sex</label>
                  <select value={sex} onChange={e => setSex(e.target.value)}
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none" style={{ border: '1px solid var(--border)' }}>
                    <option value="male">Male (TBW = 0.6 × wt)</option>
                    <option value="female">Female (TBW = 0.5 × wt)</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-black opacity-40 block mb-1">Current Na⁺ (mEq/L)</label>
                  <input type="number" value={serumNa} onChange={e => setSerumNa(e.target.value)}
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none" style={{ border: '1px solid var(--border)' }} />
                </div>
                <div>
                  <label className="text-xs font-black opacity-40 block mb-1">Target Na⁺ (mEq/L)</label>
                  <input type="number" value={targetNa} onChange={e => setTargetNa(e.target.value)} placeholder="140"
                    className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none" style={{ border: '1px solid var(--border)' }} />
                </div>
              </div>
            </div>
            {w > 0 && parseFloat(serumNa) > 0 && (
              <div className="glass rounded-2xl p-6 animate-scale-in space-y-4" style={{ border: '1px solid var(--accent)/30' }}>
                <div className="text-center">
                  <div className="text-xs font-black opacity-40 mb-1">Total Body Water</div>
                  <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>{tbwVal.toFixed(1)} L</div>
                </div>
                {parseFloat(serumNa) > 142 && freeWaterDeficit && (
                  <div className="glass rounded-xl p-4 text-center" style={{ background: '#ef444408', border: '1px solid #ef444420' }}>
                    <div className="text-xs font-black opacity-40 mb-1">Free Water Deficit</div>
                    <div className="text-2xl font-black" style={{ color: '#ef4444' }}>{freeWaterDeficit} L</div>
                    <p className="text-xs opacity-50 mt-1">TBW × ((Na⁺/140) – 1)</p>
                    <p className="text-xs opacity-40 mt-2">⚠️ Replace slowly — max correction 10-12 mEq/24h</p>
                  </div>
                )}
                {parseFloat(serumNa) < 135 && naDeficit3Pct && (
                  <div className="glass rounded-xl p-4 text-center" style={{ background: '#3b82f608', border: '1px solid #3b82f620' }}>
                    <div className="text-xs font-black opacity-40 mb-1">Na⁺ Deficit (mEq)</div>
                    <div className="text-2xl font-black" style={{ color: '#3b82f6' }}>{naDeficit3Pct} mEq</div>
                    <p className="text-xs opacity-50 mt-1">(Target Na – Current Na) × TBW</p>
                    <p className="text-xs opacity-40 mt-2">⚠️ Max correction 8-10 mEq/24h to avoid ODS</p>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
