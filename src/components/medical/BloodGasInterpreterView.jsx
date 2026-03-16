import { useState } from 'react';

export default function BloodGasInterpreterView() {
  const [values, setValues] = useState({ ph: '', pco2: '', hco3: '', pao2: '', fio2: '' });
  const [result, setResult] = useState(null);

  const interpret = () => {
    const ph = parseFloat(values.ph);
    const pco2 = parseFloat(values.pco2);
    const hco3 = parseFloat(values.hco3);
    const pao2 = parseFloat(values.pao2);
    const fio2 = parseFloat(values.fio2) || 21;
    if (isNaN(ph) || isNaN(pco2) || isNaN(hco3)) { setResult(null); return; }

    const findings = [];
    let primary = '';
    let compensation = '';

    // Step 1: Acidemia or Alkalemia
    if (ph < 7.35) findings.push({ label: 'pH Status', value: 'Acidemia', color: '#ef4444' });
    else if (ph > 7.45) findings.push({ label: 'pH Status', value: 'Alkalemia', color: '#3b82f6' });
    else findings.push({ label: 'pH Status', value: 'Normal range', color: '#10b981' });

    // Step 2: Primary disorder
    if (ph < 7.35) {
      if (pco2 > 45) { primary = 'Respiratory Acidosis'; }
      if (hco3 < 22) { primary = primary ? 'Mixed Respiratory + Metabolic Acidosis' : 'Metabolic Acidosis'; }
      if (!primary) primary = 'Acidemia (borderline values)';
    } else if (ph > 7.45) {
      if (pco2 < 35) { primary = 'Respiratory Alkalosis'; }
      if (hco3 > 26) { primary = primary ? 'Mixed Respiratory + Metabolic Alkalosis' : 'Metabolic Alkalosis'; }
      if (!primary) primary = 'Alkalemia (borderline values)';
    } else {
      if (pco2 > 45 && hco3 > 26) primary = 'Compensated Respiratory Acidosis';
      else if (pco2 < 35 && hco3 < 22) primary = 'Compensated Respiratory Alkalosis';
      else if (pco2 > 45 && hco3 < 22) primary = 'Mixed Metabolic Acidosis + Respiratory Acidosis';
      else primary = 'Normal acid-base status';
    }
    findings.push({ label: 'Primary Disorder', value: primary, color: 'var(--accent)' });

    // Step 3: Compensation
    if (primary.includes('Metabolic Acidosis') && !primary.includes('Mixed')) {
      const expectedPco2 = (1.5 * hco3 + 8);
      const comp = Math.abs(pco2 - expectedPco2) < 2 ? 'Appropriate compensation (Winter\'s formula)' :
        pco2 > expectedPco2 + 2 ? 'Inadequate compensation (concurrent respiratory acidosis)' :
        'Over-compensation (concurrent respiratory alkalosis)';
      compensation = comp;
      findings.push({ label: 'Expected pCO₂ (Winter\'s)', value: `${(expectedPco2 - 2).toFixed(0)}-${(expectedPco2 + 2).toFixed(0)} mmHg (actual: ${pco2})`, color: '#8b5cf6' });
    }
    if (primary.includes('Metabolic Acidosis')) {
      const ag = 140 - 101 - hco3; // simplified (using standard Na=140, Cl=101)
      findings.push({ label: 'Anion Gap (estimated)', value: `~${ag.toFixed(0)} mEq/L (normal 8-12)`, color: ag > 12 ? '#f59e0b' : '#10b981' });
      if (ag > 12) {
        findings.push({ label: 'AG Acidosis Causes (MUDPILES)', value: 'Methanol, Uremia, DKA, Propylene glycol, INH/Iron, Lactic acidosis, Ethylene glycol, Salicylates', color: '#f59e0b' });
        const deltaGap = ag - 12;
        const correctedHCO3 = hco3 + deltaGap;
        findings.push({ label: 'Delta-Delta (Corrected HCO₃)', value: `${correctedHCO3.toFixed(1)} mEq/L — ${correctedHCO3 > 26 ? 'concurrent metabolic alkalosis' : correctedHCO3 < 22 ? 'concurrent non-AG metabolic acidosis' : 'pure AG metabolic acidosis'}`, color: '#8b5cf6' });
      } else {
        findings.push({ label: 'Non-AG Acidosis Causes (HARDUPS)', value: 'Hyperalimentation, Acetazolamide, RTA, Diarrhea, Ureteral diversion, Pancreatic fistula, Saline (dilutional)', color: '#f59e0b' });
      }
    }
    if (compensation) findings.push({ label: 'Compensation', value: compensation, color: '#10b981' });

    // Step 4: Oxygenation
    if (!isNaN(pao2)) {
      const aaGradient = ((fio2 / 100) * (760 - 47) - (pco2 / 0.8)) - pao2;
      const expectedAa = (0.4 * (ph > 0 ? 25 : 25)) + 4; // simplified age-based ~25 yrs
      const pfRatio = pao2 / (fio2 / 100);
      findings.push({ label: 'A-a Gradient', value: `${aaGradient.toFixed(0)} mmHg`, color: aaGradient > 15 ? '#ef4444' : '#10b981' });
      findings.push({ label: 'P/F Ratio', value: `${pfRatio.toFixed(0)} ${pfRatio < 100 ? '(Severe ARDS)' : pfRatio < 200 ? '(Moderate ARDS)' : pfRatio < 300 ? '(Mild ARDS)' : '(Normal >300)'}`, color: pfRatio < 200 ? '#ef4444' : pfRatio < 300 ? '#f59e0b' : '#10b981' });
    }

    setResult(findings);
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2">🩸 ABG Interpreter</h2>
        <p className="text-xs opacity-40 mt-0.5">Systematic arterial blood gas analysis</p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-4">
        <div className="glass rounded-2xl p-5 space-y-4" style={{ border: '1px solid var(--border)' }}>
          <h3 className="font-black text-sm">Enter ABG Values</h3>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {[
              { key: 'ph', label: 'pH', placeholder: '7.35-7.45', unit: '' },
              { key: 'pco2', label: 'pCO₂', placeholder: '35-45', unit: 'mmHg' },
              { key: 'hco3', label: 'HCO₃⁻', placeholder: '22-26', unit: 'mEq/L' },
              { key: 'pao2', label: 'PaO₂', placeholder: '80-100', unit: 'mmHg' },
              { key: 'fio2', label: 'FiO₂', placeholder: '21', unit: '%' },
            ].map(f => (
              <div key={f.key}>
                <label className="text-xs font-black opacity-40 block mb-1">{f.label} {f.unit && <span className="opacity-50">({f.unit})</span>}</label>
                <input type="number" step="any" value={values[f.key]}
                  onChange={e => setValues(p => ({ ...p, [f.key]: e.target.value }))}
                  placeholder={f.placeholder}
                  className="w-full glass-input rounded-xl px-3 py-2.5 text-sm outline-none"
                  style={{ border: '1px solid var(--border)' }} />
              </div>
            ))}
          </div>
          <div className="flex gap-2 flex-wrap">
            <span className="text-xs font-black opacity-30">Quick presets:</span>
            {[
              { label: 'DKA', vals: { ph: '7.22', pco2: '22', hco3: '10', pao2: '98', fio2: '21' } },
              { label: 'COPD', vals: { ph: '7.34', pco2: '58', hco3: '32', pao2: '62', fio2: '28' } },
              { label: 'PE', vals: { ph: '7.48', pco2: '28', hco3: '22', pao2: '65', fio2: '21' } },
              { label: 'Normal', vals: { ph: '7.40', pco2: '40', hco3: '24', pao2: '95', fio2: '21' } },
              { label: 'Metabolic Alkalosis', vals: { ph: '7.50', pco2: '48', hco3: '36', pao2: '90', fio2: '21' } },
            ].map(p => (
              <button key={p.label} onClick={() => setValues(p.vals)}
                className="glass px-2.5 py-1 rounded-lg text-xs transition-all hover:opacity-80"
                style={{ border: '1px solid var(--border)' }}>
                {p.label}
              </button>
            ))}
          </div>
          <button onClick={interpret} className="btn-accent w-full py-3 rounded-xl font-black">Interpret ABG</button>
        </div>

        {result && (
          <div className="space-y-3 animate-fade-in-up">
            {result.map((f, i) => (
              <div key={i} className="glass rounded-2xl p-4" style={{ border: `1px solid ${f.color}30` }}>
                <div className="text-xs font-black uppercase tracking-widest opacity-40 mb-1">{f.label}</div>
                <div className="text-sm font-bold leading-relaxed" style={{ color: f.color }}>{f.value}</div>
              </div>
            ))}
          </div>
        )}

        <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
          <h3 className="font-black text-sm mb-3">📋 ABG Interpretation Steps</h3>
          {[
            'Step 1: Look at pH → Acidemia (<7.35) or Alkalemia (>7.45)?',
            'Step 2: Identify primary disorder → pCO₂ (respiratory) or HCO₃⁻ (metabolic)?',
            'Step 3: Check compensation → Appropriate? (Winter\'s formula for metabolic acidosis)',
            'Step 4: If metabolic acidosis → Calculate anion gap (Na⁺ – Cl⁻ – HCO₃⁻)',
            'Step 5: If AG elevated → Delta-delta (corrected HCO₃⁻) to check for hidden disorder',
            'Step 6: Assess oxygenation → A-a gradient, P/F ratio',
          ].map((step, i) => (
            <div key={i} className="flex items-start gap-3 py-1.5 text-xs">
              <span className="w-5 h-5 rounded flex items-center justify-center shrink-0 font-black" style={{ background: 'var(--accent)/15', color: 'var(--accent)', fontSize: 10 }}>{i + 1}</span>
              <span className="opacity-70 leading-relaxed">{step}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
