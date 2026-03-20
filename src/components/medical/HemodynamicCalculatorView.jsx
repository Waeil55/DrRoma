import { useState } from 'react';

function HemodynamicCalculatorView() {
  const [vals, setVals] = useState({ sbp: '', dbp: '', hr: '', cvp: '', co: '', svp: '', map_pa: '', pcwp: '', bsa: '' });
  const set = (k, v) => setVals(p => ({ ...p, [k]: v }));
  const n = k => parseFloat(vals[k]) || 0;

  const map = n('sbp') && n('dbp') ? ((n('sbp') + 2 * n('dbp')) / 3).toFixed(1) : '';
  const pp = n('sbp') && n('dbp') ? (n('sbp') - n('dbp')).toFixed(0) : '';
  const svr = n('co') && n('cvp') ? (((parseFloat(map) - n('cvp')) / n('co')) * 80).toFixed(0) : '';
  const pvr = n('co') && n('map_pa') && n('pcwp') ? (((n('map_pa') - n('pcwp')) / n('co')) * 80).toFixed(0) : '';
  const ci = n('co') && n('bsa') ? (n('co') / n('bsa')).toFixed(1) : '';
  const sv = n('co') && n('hr') ? ((n('co') * 1000) / n('hr')).toFixed(0) : '';
  const shock = n('hr') && n('sbp') ? (n('hr') / n('sbp')).toFixed(2) : '';

  const results = [
    { label: 'MAP', value: map, unit: 'mmHg', normal: '70-105', color: map && parseFloat(map) >= 65 ? '#10b981' : '#ef4444' },
    { label: 'Pulse Pressure', value: pp, unit: 'mmHg', normal: '30-40', color: '#6366f1' },
    { label: 'SVR', value: svr, unit: 'dyne·s/cm', normal: '800-1200', color: svr && parseInt(svr) >= 800 && parseInt(svr) <= 1200 ? '#10b981' : svr ? '#ef4444' : '' },
    { label: 'PVR', value: pvr, unit: 'dyne·s/cm', normal: '100-250', color: '#8b5cf6' },
    { label: 'Cardiac Index', value: ci, unit: 'L/min/m', normal: '2.5-4.0', color: ci && parseFloat(ci) >= 2.5 ? '#10b981' : ci ? '#ef4444' : '' },
    { label: 'Stroke Volume', value: sv, unit: 'mL', normal: '60-100', color: '#f59e0b' },
    { label: 'Shock Index', value: shock, unit: 'HR/SBP', normal: '<0.7', color: shock && parseFloat(shock) < 0.7 ? '#10b981' : shock ? '#ef4444' : '' },
  ];

  const inputs = [
    { k: 'sbp', label: 'SBP (mmHg)', ph: '120' }, { k: 'dbp', label: 'DBP (mmHg)', ph: '80' },
    { k: 'hr', label: 'Heart Rate', ph: '75' }, { k: 'cvp', label: 'CVP (mmHg)', ph: '8' },
    { k: 'co', label: 'CO (L/min)', ph: '5.0' }, { k: 'map_pa', label: 'Mean PAP (mmHg)', ph: '15' },
    { k: 'pcwp', label: 'PCWP (mmHg)', ph: '12' }, { k: 'bsa', label: 'BSA (m)', ph: '1.73' },
  ];

  const shockProfiles = [
    { type: 'Cardiogenic', co: '', svr: '', pcwp: '', cvp: '', color: '#ef4444', example: 'MI, CHF, tamponade' },
    { type: 'Hypovolemic', co: '', svr: '', pcwp: '', cvp: '', color: '#f59e0b', example: 'Hemorrhage, dehydration' },
    { type: 'Distributive (Septic)', co: '', svr: '', pcwp: '', cvp: '', color: '#10b981', example: 'Sepsis, anaphylaxis, neurogenic' },
    { type: 'Obstructive', co: '', svr: '', pcwp: 'Variable', cvp: '', color: '#8b5cf6', example: 'PE, tension PTX, tamponade' },
  ];

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2">Hemodynamic Calculator</h2>
        <p className="text-xs opacity-40 mt-0.5">MAP, SVR, PVR, cardiac index & shock profiles</p>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-4">
        <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
          <h3 className="font-black text-sm mb-3">Input Parameters</h3>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {inputs.map(inp => (
              <div key={inp.k}>
                <label className="text-[10px] font-black opacity-40 block mb-1">{inp.label}</label>
                <input type="number" value={vals[inp.k]} onChange={e => set(inp.k, e.target.value)}
                  placeholder={inp.ph}
                  className="w-full glass-input rounded-lg px-3 py-2 text-sm outline-none"
                  style={{ border: '1px solid var(--border)' }} />
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {results.filter(r => r.value).map(r => (
            <div key={r.label} className="glass rounded-2xl p-4 text-center" style={{ border: `1px solid ${r.color}30` }}>
              <div className="text-2xl font-black" style={{ color: r.color }}>{r.value}</div>
              <div className="text-xs font-black opacity-60">{r.label}</div>
              <div className="text-[10px] opacity-40">{r.unit}  Normal: {r.normal}</div>
            </div>
          ))}
        </div>

        <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
          <h3 className="font-black text-sm mb-3">Shock Hemodynamic Profiles</h3>
          <div className="space-y-2">
            {shockProfiles.map((s, i) => (
              <div key={i} className="glass rounded-xl p-3" style={{ border: `1px solid ${s.color}30` }}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-black text-sm" style={{ color: s.color }}>{s.type}</span>
                  <span className="text-[10px] opacity-40">{s.example}</span>
                </div>
                <div className="flex gap-3 text-xs">
                  <span>CO: <b style={{ color: s.color }}>{s.co}</b></span>
                  <span>SVR: <b style={{ color: s.color }}>{s.svr}</b></span>
                  <span>PCWP: <b style={{ color: s.color }}>{s.pcwp}</b></span>
                  <span>CVP: <b style={{ color: s.color }}>{s.cvp}</b></span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="glass rounded-2xl p-5" style={{ border: '1px solid #f59e0b20', background: '#f59e0b05' }}>
          <h3 className="font-black text-sm mb-2" style={{ color: '#f59e0b' }}> Formulas</h3>
          {[
            'MAP = (SBP + 2DBP) / 3',
            'SVR = [(MAP - CVP) / CO]  80    (normal 800-1200)',
            'PVR = [(mPAP - PCWP) / CO]  80  (normal 100-250)',
            'CI = CO / BSA                     (normal 2.5-4.0)',
            'SV = (CO  1000) / HR             (normal 60-100 mL)',
            'Shock Index = HR / SBP            (normal <0.7, >1.0 = significant shock)',
          ].map((f, i) => (
            <div key={i} className="text-xs opacity-60 font-mono py-0.5">{f}</div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default HemodynamicCalculatorView;
