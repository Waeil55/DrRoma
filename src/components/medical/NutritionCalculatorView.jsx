import { useState } from 'react';

export default function NutritionCalculatorView() {
  const [tab, setTab] = useState('bmr');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');
  const [age, setAge] = useState('');
  const [sex, setSex] = useState('male');
  const [activity, setActivity] = useState(1.2);
  const [stress, setStress] = useState(1.0);
  const [tpnProtein, setTpnProtein] = useState(1.2);
  const [tpnDextrose, setTpnDextrose] = useState(60);
  const [tpnLipid, setTpnLipid] = useState(20);

  const w = parseFloat(weight) || 0;
  const h = parseFloat(height) || 0;
  const a = parseFloat(age) || 0;

  const bmr = sex === 'male' ? (10 * w + 6.25 * h - 5 * a + 5) : (10 * w + 6.25 * h - 5 * a - 161);
  const tdee = bmr * activity;
  const stressCal = bmr * stress;
  const hbBmr = sex === 'male' ? (66.5 + 13.75 * w + 5.003 * h - 6.75 * a) : (655.1 + 9.563 * w + 1.850 * h - 4.676 * a);
  const ibw = sex === 'male' ? (50 + 2.3 * ((h / 2.54) - 60)) : (45.5 + 2.3 * ((h / 2.54) - 60));
  const bmi = h > 0 ? (w / ((h / 100) ** 2)) : 0;

  const tpnProteinG = tpnProtein * w;
  const tpnProteinCal = tpnProteinG * 4;
  const tpnDextroseCal = tpnDextrose * w * 3.4 / 100 * 100;
  const tpnLipidCal = tpnLipid * w * 1.1 / 100 * 100;
  const tpnTotal = tpnProteinCal + tpnDextroseCal + tpnLipidCal;

  const tabs = [
    { id: 'bmr', label: 'BMR / TDEE' },
    { id: 'body', label: 'Body Comp' },
    { id: 'icu', label: 'ICU Nutrition' },
    { id: 'tpn', label: 'TPN Basics' },
  ];

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2"> Nutrition Calculator</h2>
        <div className="flex gap-1 mt-3 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black whitespace-nowrap transition-all ${tab === t.id ? 'text-white' : 'opacity-50'}`}
              style={tab === t.id ? { background: 'var(--accent)' } : {}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-4">
        <div className="glass rounded-2xl p-5 space-y-3" style={{ border: '1px solid var(--border)' }}>
          <h3 className="font-black text-sm">Patient Data</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div>
              <label className="text-xs font-black opacity-40 block mb-1">Weight (kg)</label>
              <input type="number" value={weight} onChange={e => setWeight(e.target.value)} placeholder="70"
                className="w-full glass-input rounded-xl px-3 py-2 text-sm outline-none" style={{ border: '1px solid var(--border)' }} />
            </div>
            <div>
              <label className="text-xs font-black opacity-40 block mb-1">Height (cm)</label>
              <input type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="170"
                className="w-full glass-input rounded-xl px-3 py-2 text-sm outline-none" style={{ border: '1px solid var(--border)' }} />
            </div>
            <div>
              <label className="text-xs font-black opacity-40 block mb-1">Age (years)</label>
              <input type="number" value={age} onChange={e => setAge(e.target.value)} placeholder="30"
                className="w-full glass-input rounded-xl px-3 py-2 text-sm outline-none" style={{ border: '1px solid var(--border)' }} />
            </div>
            <div>
              <label className="text-xs font-black opacity-40 block mb-1">Sex</label>
              <div className="flex gap-2">
                {['male', 'female'].map(s => (
                  <button key={s} onClick={() => setSex(s)} className="flex-1 py-2 rounded-xl text-xs font-black transition-all"
                    style={sex === s ? { background: 'var(--accent)', color: '#fff' } : { background: 'var(--surface,var(--card))', border: '1px solid var(--border)' }}>
                    {s === 'male' ? '' : ''} {s}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {tab === 'bmr' && w > 0 && h > 0 && a > 0 && (
          <div className="space-y-3 animate-fade-in-up">
            <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
              <h3 className="font-black text-sm mb-3">Basal Metabolic Rate</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-xl" style={{ background: 'var(--accent)/10' }}>
                  <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>{bmr.toFixed(0)}</div>
                  <div className="text-xs opacity-40 mt-1">Mifflin-St Jeor (kcal/day)</div>
                </div>
                <div className="text-center p-3 rounded-xl" style={{ background: 'var(--accent)/10' }}>
                  <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>{hbBmr.toFixed(0)}</div>
                  <div className="text-xs opacity-40 mt-1">Harris-Benedict (kcal/day)</div>
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
              <h3 className="font-black text-sm mb-2">Activity Level</h3>
              <div className="flex flex-wrap gap-1.5">
                {[
                  { v: 1.2, l: 'Sedentary' }, { v: 1.375, l: 'Light' }, { v: 1.55, l: 'Moderate' }, { v: 1.725, l: 'Active' }, { v: 1.9, l: 'Very Active' },
                ].map(a => (
                  <button key={a.v} onClick={() => setActivity(a.v)}
                    className="px-3 py-1.5 rounded-lg text-xs font-black transition-all"
                    style={activity === a.v ? { background: 'var(--accent)', color: '#fff' } : { border: '1px solid var(--border)' }}>
                    {a.l} ({a.v})
                  </button>
                ))}
              </div>
              <div className="text-center p-4 mt-3 rounded-xl" style={{ background: '#10b98110', border: '1px solid #10b98120' }}>
                <div className="text-3xl font-black" style={{ color: '#10b981' }}>{tdee.toFixed(0)}</div>
                <div className="text-xs opacity-40 mt-1">Total Daily Energy Expenditure (kcal/day)</div>
              </div>
            </div>
          </div>
        )}

        {tab === 'body' && w > 0 && h > 0 && (
          <div className="space-y-3 animate-fade-in-up">
            <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
              <h3 className="font-black text-sm mb-3">Body Composition</h3>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 rounded-xl" style={{ background: bmi < 18.5 ? '#3b82f610' : bmi < 25 ? '#10b98110' : bmi < 30 ? '#f59e0b10' : '#ef444410' }}>
                  <div className="text-2xl font-black" style={{ color: bmi < 18.5 ? '#3b82f6' : bmi < 25 ? '#10b981' : bmi < 30 ? '#f59e0b' : '#ef4444' }}>{bmi.toFixed(1)}</div>
                  <div className="text-xs opacity-40 mt-1">BMI (kg/m)</div>
                  <div className="text-xs mt-0.5" style={{ color: bmi < 18.5 ? '#3b82f6' : bmi < 25 ? '#10b981' : bmi < 30 ? '#f59e0b' : '#ef4444' }}>
                    {bmi < 18.5 ? 'Underweight' : bmi < 25 ? 'Normal' : bmi < 30 ? 'Overweight' : 'Obese'}
                  </div>
                </div>
                <div className="text-center p-3 rounded-xl" style={{ background: 'var(--accent)/10' }}>
                  <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>{ibw.toFixed(1)}</div>
                  <div className="text-xs opacity-40 mt-1">Ideal Body Weight (kg)</div>
                  <div className="text-xs opacity-30 mt-0.5">Devine formula</div>
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
              <h3 className="font-black text-sm mb-3">BMI Classification (WHO)</h3>
              {[
                { range: '<18.5', cat: 'Underweight', color: '#3b82f6' },
                { range: '18.5-24.9', cat: 'Normal', color: '#10b981' },
                { range: '25-29.9', cat: 'Overweight', color: '#f59e0b' },
                { range: '30-34.9', cat: 'Obese Class I', color: '#ef4444' },
                { range: '35-39.9', cat: 'Obese Class II', color: '#ef4444' },
                { range: '40', cat: 'Obese Class III (Morbid)', color: '#ef4444' },
              ].map(b => (
                <div key={b.range} className="flex items-center gap-3 py-1.5 text-xs">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: b.color }}></span>
                  <span className="font-bold w-20">{b.range}</span>
                  <span className="opacity-60">{b.cat}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'icu' && (
          <div className="space-y-3 animate-fade-in-up">
            <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
              <h3 className="font-black text-sm mb-2">ICU Stress Factors</h3>
              <div className="flex flex-wrap gap-1.5 mb-3">
                {[
                  { v: 1.0, l: 'Baseline' }, { v: 1.2, l: 'Post-op' }, { v: 1.35, l: 'Sepsis' },
                  { v: 1.5, l: 'Trauma' }, { v: 1.7, l: 'Burns 20-40%' }, { v: 2.0, l: 'Burns >40%' },
                ].map(s => (
                  <button key={s.v} onClick={() => setStress(s.v)}
                    className="px-3 py-1.5 rounded-lg text-xs font-black transition-all"
                    style={stress === s.v ? { background: 'var(--accent)', color: '#fff' } : { border: '1px solid var(--border)' }}>
                    {s.l} ({s.v})
                  </button>
                ))}
              </div>
              {w > 0 && h > 0 && a > 0 && (
                <div className="text-center p-4 rounded-xl" style={{ background: '#f59e0b10', border: '1px solid #f59e0b20' }}>
                  <div className="text-3xl font-black" style={{ color: '#f59e0b' }}>{stressCal.toFixed(0)}</div>
                  <div className="text-xs opacity-40 mt-1">Adjusted Caloric Need (kcal/day)</div>
                </div>
              )}
            </div>
            <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
              <h3 className="font-black text-sm mb-3"> ICU Nutrition Guidelines</h3>
              {[
                'Start enteral nutrition (EN) within 24-48h of ICU admission if hemodynamically stable',
                'Trophic feeds (10-20 mL/hr) initially, advance over 48-72h to goal',
                'Target: 25-30 kcal/kg/day (use IBW for obese patients)',
                'Protein: 1.2-2.0 g/kg/day (higher in burns, trauma, continuous RRT)',
                'Parenteral nutrition (TPN): only if EN fails or contraindicated (bowel obstruction, severe ileus, GI ischemia)',
                'Do NOT start TPN until day 7 in well-nourished patients (EDEN/PermiT trials)',
                'Monitor: glucose (target 140-180 in ICU), electrolytes (refeeding syndrome risk), triglycerides',
                'Refeeding syndrome: phosphate, Mg, K shifts into cells when refeeding after prolonged starvation  cardiac/resp failure',
              ].map((line, i) => (
                <div key={i} className="flex items-start gap-2 text-xs py-0.5">
                  <span className="shrink-0 mt-0.5" style={{ color: 'var(--accent)' }}></span>
                  <span className="opacity-70 leading-relaxed">{line}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {tab === 'tpn' && w > 0 && (
          <div className="space-y-3 animate-fade-in-up">
            <div className="glass rounded-2xl p-5 space-y-3" style={{ border: '1px solid var(--border)' }}>
              <h3 className="font-black text-sm">TPN Component Goals</h3>
              <div className="space-y-3">
                <div>
                  <label className="text-xs font-black opacity-40">Protein (g/kg/day): {tpnProtein}</label>
                  <input type="range" min="0.8" max="2.5" step="0.1" value={tpnProtein} onChange={e => setTpnProtein(parseFloat(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="text-xs font-black opacity-40">Dextrose (% conc): {tpnDextrose}%</label>
                  <input type="range" min="10" max="70" step="5" value={tpnDextrose} onChange={e => setTpnDextrose(parseInt(e.target.value))} className="w-full" />
                </div>
                <div>
                  <label className="text-xs font-black opacity-40">Lipid (% conc): {tpnLipid}%</label>
                  <input type="range" min="10" max="30" step="10" value={tpnLipid} onChange={e => setTpnLipid(parseInt(e.target.value))} className="w-full" />
                </div>
              </div>
            </div>
            <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
              <h3 className="font-black text-sm mb-3">TPN Estimated Breakdown</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between"><span className="opacity-60">Protein:</span><span className="font-black">{tpnProteinG.toFixed(0)} g  {tpnProteinCal.toFixed(0)} kcal</span></div>
                <div className="flex justify-between"><span className="opacity-60">Dextrose:</span><span className="font-black">{tpnDextroseCal.toFixed(0)} kcal</span></div>
                <div className="flex justify-between"><span className="opacity-60">Lipid:</span><span className="font-black">{tpnLipidCal.toFixed(0)} kcal</span></div>
                <div className="flex justify-between pt-2" style={{ borderTop: '1px solid var(--border)' }}>
                  <span className="font-black">Total:</span>
                  <span className="font-black" style={{ color: 'var(--accent)' }}>{tpnTotal.toFixed(0)} kcal/day</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
