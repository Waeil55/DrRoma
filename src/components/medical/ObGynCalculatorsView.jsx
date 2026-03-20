import { useState } from 'react';

function ObGynCalculatorsView() {
  const [tab, setTab] = useState('edd');
  const [lmp, setLmp] = useState('');
  const [bishopScores, setBishopScores] = useState({ dilation: 0, effacement: 0, station: 0, consistency: 0, position: 0 });
  const [apgarScores, setApgarScores] = useState({ appearance: 0, pulse: 0, grimace: 0, activity: 0, respiration: 0 });

  const edd = lmp ? (() => {
    const d = new Date(lmp);
    d.setMonth(d.getMonth() + 9);
    d.setDate(d.getDate() + 7);
    return d.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  })() : '';

  const gestAge = lmp ? (() => {
    const now = new Date();
    const start = new Date(lmp);
    const diff = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    return { weeks: Math.floor(diff / 7), days: diff % 7, total: diff };
  })() : null;

  const bishopTotal = Object.values(bishopScores).reduce((a, b) => a + b, 0);

  const bishopCriteria = [
    { key: 'dilation', label: 'Dilation (cm)', options: [{ v: 0, l: 'Closed' }, { v: 1, l: '1-2 cm' }, { v: 2, l: '3-4 cm' }, { v: 3, l: '5 cm' }] },
    { key: 'effacement', label: 'Effacement (%)', options: [{ v: 0, l: '0-30%' }, { v: 1, l: '40-50%' }, { v: 2, l: '60-70%' }, { v: 3, l: '80%' }] },
    { key: 'station', label: 'Station', options: [{ v: 0, l: '-3' }, { v: 1, l: '-2' }, { v: 2, l: '-1,0' }, { v: 3, l: '+1,+2' }] },
    { key: 'consistency', label: 'Consistency', options: [{ v: 0, l: 'Firm' }, { v: 1, l: 'Medium' }, { v: 2, l: 'Soft' }] },
    { key: 'position', label: 'Position', options: [{ v: 0, l: 'Posterior' }, { v: 1, l: 'Mid' }, { v: 2, l: 'Anterior' }] },
  ];

  const apgarCriteria = [
    { key: 'appearance', label: 'Appearance (Color)', options: [{ v: 0, l: 'Blue/pale all over' }, { v: 1, l: 'Body pink, extremities blue' }, { v: 2, l: 'Completely pink' }] },
    { key: 'pulse', label: 'Pulse (Heart Rate)', options: [{ v: 0, l: 'Absent' }, { v: 1, l: '<100 bpm' }, { v: 2, l: '100 bpm' }] },
    { key: 'grimace', label: 'Grimace (Reflex)', options: [{ v: 0, l: 'No response' }, { v: 1, l: 'Grimace' }, { v: 2, l: 'Cry/active withdrawal' }] },
    { key: 'activity', label: 'Activity (Muscle Tone)', options: [{ v: 0, l: 'Limp' }, { v: 1, l: 'Some flexion' }, { v: 2, l: 'Active motion' }] },
    { key: 'respiration', label: 'Respiration', options: [{ v: 0, l: 'Absent' }, { v: 1, l: 'Slow/irregular' }, { v: 2, l: 'Good cry' }] },
  ];
  const apgarTotal = Object.values(apgarScores).reduce((a, b) => a + b, 0);

  const tabs = [{ id: 'edd', label: 'EDD / GA' }, { id: 'bishop', label: 'Bishop Score' }, { id: 'apgar', label: 'APGAR' }];

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2"> OB/GYN Calculators</h2>
        <div className="flex gap-1 mt-3">
          {tabs.map(t => (
            <button key={t.id} onClick={() => setTab(t.id)}
              className={`px-3 py-1.5 rounded-lg text-xs font-black transition-all ${tab === t.id ? 'text-white' : 'opacity-50'}`}
              style={tab === t.id ? { background: 'var(--accent)' } : {}}>
              {t.label}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {tab === 'edd' && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
              <h3 className="font-black text-sm mb-3">Last Menstrual Period (LMP)</h3>
              <input type="date" value={lmp} onChange={e => setLmp(e.target.value)}
                className="w-full glass-input rounded-xl px-4 py-3 text-sm outline-none"
                style={{ border: '1px solid var(--border)' }} />
            </div>
            {edd && (
              <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--accent)/30' }}>
                <h3 className="font-black text-sm mb-3" style={{ color: 'var(--accent)' }}> Estimated Due Date (Naegele's Rule)</h3>
                <div className="text-xl font-black" style={{ color: 'var(--accent)' }}>{edd}</div>
                <div className="text-xs opacity-40 mt-1">LMP + 9 months + 7 days</div>
              </div>
            )}
            {gestAge && (
              <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
                <h3 className="font-black text-sm mb-2">Current Gestational Age</h3>
                <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>{gestAge.weeks}w {gestAge.days}d</div>
                <div className="text-xs opacity-40 mt-1">({gestAge.total} days from LMP)</div>
                <div className="mt-3 text-xs space-y-1 opacity-60">
                  <div>Trimester: {gestAge.weeks < 13 ? '1st (weeks 1-12)' : gestAge.weeks < 28 ? '2nd (weeks 13-27)' : '3rd (weeks 28-40)'}</div>
                  <div>Viability: {gestAge.weeks >= 24 ? ' Past viability threshold (24 weeks)' : ' Pre-viable (<24 weeks)'}</div>
                  <div>Term: {gestAge.weeks >= 37 ? ' Term (37 weeks)' : gestAge.weeks >= 34 ? 'Late preterm (34-36w)' : 'Preterm (<34 weeks)'}</div>
                </div>
              </div>
            )}
          </div>
        )}

        {tab === 'bishop' && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
              <h3 className="font-black text-sm mb-3">Bishop Score  Cervical Favorability</h3>
              {bishopCriteria.map(c => (
                <div key={c.key} className="mb-3">
                  <label className="text-xs font-black opacity-40 block mb-1.5">{c.label}</label>
                  <div className="flex flex-wrap gap-1.5">
                    {c.options.map(o => (
                      <button key={o.v} onClick={() => setBishopScores(p => ({ ...p, [c.key]: o.v }))}
                        className="px-3 py-1.5 rounded-lg text-xs font-black transition-all"
                        style={bishopScores[c.key] === o.v ? { background: 'var(--accent)', color: '#fff' } : { border: '1px solid var(--border)' }}>
                        {o.l} ({o.v})
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="glass rounded-2xl p-5" style={{ border: `2px solid ${bishopTotal >= 8 ? '#10b981' : bishopTotal >= 6 ? '#f59e0b' : '#ef4444'}40` }}>
              <div className="text-center">
                <div className="text-4xl font-black" style={{ color: bishopTotal >= 8 ? '#10b981' : bishopTotal >= 6 ? '#f59e0b' : '#ef4444' }}>{bishopTotal}/13</div>
                <div className="text-sm font-black mt-1" style={{ color: bishopTotal >= 8 ? '#10b981' : bishopTotal >= 6 ? '#f59e0b' : '#ef4444' }}>
                  {bishopTotal >= 8 ? 'Favorable cervix  induction likely successful' : bishopTotal >= 6 ? 'Moderately favorable  consider ripening' : 'Unfavorable cervix  cervical ripening recommended'}
                </div>
                <div className="text-xs opacity-40 mt-2">Score 8: favorable, high success of vaginal delivery. Score &lt;6: consider cervical ripening (misoprostol, dinoprostone, or Foley balloon).</div>
              </div>
            </div>
          </div>
        )}

        {tab === 'apgar' && (
          <div className="space-y-4 animate-fade-in-up">
            <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--border)' }}>
              <h3 className="font-black text-sm mb-3">APGAR Score  Neonatal Assessment</h3>
              {apgarCriteria.map(c => (
                <div key={c.key} className="mb-3">
                  <label className="text-xs font-black opacity-40 block mb-1.5">{c.label}</label>
                  <div className="flex flex-wrap gap-1.5">
                    {c.options.map(o => (
                      <button key={o.v} onClick={() => setApgarScores(p => ({ ...p, [c.key]: o.v }))}
                        className="px-3 py-1.5 rounded-lg text-xs font-black transition-all"
                        style={apgarScores[c.key] === o.v ? { background: 'var(--accent)', color: '#fff' } : { border: '1px solid var(--border)' }}>
                        {o.l} ({o.v})
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
            <div className="glass rounded-2xl p-5" style={{ border: `2px solid ${apgarTotal >= 7 ? '#10b981' : apgarTotal >= 4 ? '#f59e0b' : '#ef4444'}40` }}>
              <div className="text-center">
                <div className="text-4xl font-black" style={{ color: apgarTotal >= 7 ? '#10b981' : apgarTotal >= 4 ? '#f59e0b' : '#ef4444' }}>{apgarTotal}/10</div>
                <div className="text-sm font-black mt-1" style={{ color: apgarTotal >= 7 ? '#10b981' : apgarTotal >= 4 ? '#f59e0b' : '#ef4444' }}>
                  {apgarTotal >= 7 ? 'Normal  reassuring' : apgarTotal >= 4 ? 'Moderately depressed  needs intervention' : 'Severely depressed  aggressive resuscitation'}
                </div>
                <div className="text-xs opacity-40 mt-2">Assessed at 1 min and 5 min of life. 1-min: need for resuscitation. 5-min: response to resuscitation. 7-10: normal. 4-6: needs intervention. 0-3: needs aggressive resuscitation.</div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default ObGynCalculatorsView;
