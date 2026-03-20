import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const ECG_RHYTHMS = [
  { name: 'Normal Sinus Rhythm', cat: 'Normal', rate: '60-100', regularity: 'Regular',
    pWave: 'Upright in I, II, aVF; inverted in aVR', prInterval: '120-200 ms', qrsDuration: '<120 ms',
    description: 'Normal P before every QRS, normal intervals. SA node pacemaker at 60-100 bpm.',
    criteria: ['P waves present before every QRS', 'P-wave axis: upright in II, inverted in aVR', 'PR interval 0.12-0.20 sec', 'QRS < 0.12 sec', 'Rate 60-100 bpm'] },
  { name: 'Sinus Bradycardia', cat: 'Bradycardia', rate: '<60', regularity: 'Regular',
    pWave: 'Normal sinus P waves', prInterval: 'Normal', qrsDuration: 'Normal',
    description: 'Normal sinus rhythm at rate <60 bpm. Often physiologic in athletes or during sleep.',
    criteria: ['Rate <60 bpm', 'Normal P waves before each QRS', 'Normal PR interval', 'Consider: athletes, medications (beta-blockers, CCB), hypothyroidism, ↑ ICP'] },
  { name: 'Sinus Tachycardia', cat: 'Tachycardia', rate: '100-150', regularity: 'Regular',
    pWave: 'Normal but may be buried in preceding T wave at high rates', prInterval: 'Normal', qrsDuration: 'Normal',
    description: 'Sinus rhythm at rate >100. Always look for underlying cause (pain, anxiety, hypovolemia, sepsis, PE, thyrotoxicosis).',
    criteria: ['Rate 100-150 bpm (rarely >150 in sinus tach at rest)', 'P waves present (may be hard to see at high rates)', 'Gradual onset and offset', 'Treat the cause, not the rhythm'] },
  { name: 'Atrial Fibrillation', cat: 'Arrhythmia', rate: 'Variable', regularity: 'Irregularly irregular',
    pWave: 'Absent — fibrillatory baseline (f waves)', prInterval: 'None', qrsDuration: 'Usually normal (<120 ms)',
    description: 'Most common sustained arrhythmia. Chaotic atrial activity, no organized P waves. Irregular R-R intervals.',
    criteria: ['Irregularly irregular R-R intervals', 'No P waves — chaotic fibrillatory baseline', 'Variable ventricular rate (usually 80-160 if untreated)', 'Check CHA₂DS₂-VASc for stroke risk → anticoagulation', 'Rate control: beta-blocker or CCB (diltiazem)'] },
  { name: 'Atrial Flutter', cat: 'Arrhythmia', rate: '~150 (2:1 block)', regularity: 'Regular (usually)',
    pWave: 'Sawtooth flutter waves (best in II, III, aVF, V1)', prInterval: 'Flutter interval ~300/min', qrsDuration: 'Normal',
    description: 'Macro-reentrant circuit in right atrium at ~300 bpm. Usually 2:1 conduction → ventricular rate ~150.',
    criteria: ['Sawtooth pattern (flutter waves) at ~300/min', 'Regular ventricular rate ~150 (2:1), ~100 (3:1), ~75 (4:1)', 'If rate exactly 150 → think flutter with 2:1 block', 'Treatment: rate control, cardioversion, ablation (very effective)'] },
  { name: 'Ventricular Tachycardia', cat: 'Emergency', rate: '100-250', regularity: 'Usually regular',
    pWave: 'AV dissociation (P waves march through independently)', prInterval: 'None (dissociated)', qrsDuration: '>120 ms (wide QRS)',
    description: 'Life-threatening arrhythmia from ventricular focus. Wide complex tachycardia. Treat as VT until proven otherwise.',
    criteria: ['Wide QRS >120 ms + rate >100', 'AV dissociation (most specific sign)', 'Fusion / capture beats (pathognomonic)', 'Positive/negative concordance in V1-V6', 'Northwest axis', 'Treatment: stable → amiodarone; unstable → synchronized cardioversion; pulseless → defibrillation'] },
  { name: 'Ventricular Fibrillation', cat: 'Emergency', rate: 'Chaotic', regularity: 'Chaotic',
    pWave: 'None', prInterval: 'None', qrsDuration: 'None — chaotic waveform',
    description: 'Cardiac arrest rhythm. No organized electrical activity. No cardiac output. Requires immediate defibrillation.',
    criteria: ['Chaotic, irregular waveform with no discernible P, QRS, or T', 'No pulse → immediately defibrillate (shock first)', 'CPR 2 min → rhythm check → shock if shockable', 'Epinephrine 1 mg q3-5 min', 'Amiodarone 300 mg after 3rd shock'] },
  { name: '1st Degree AV Block', cat: 'Block', rate: 'Variable', regularity: 'Regular',
    pWave: 'Normal P before each QRS', prInterval: '>200 ms (>5 small boxes)', qrsDuration: 'Normal',
    description: 'Prolonged PR interval >200 ms. Every P wave is conducted. Usually benign and requires no treatment.',
    criteria: ['PR interval >200 ms', 'Every P wave followed by QRS (1:1 conduction)', 'Usually benign (aging, athletes, medications)', 'No treatment needed unless symptomatic'] },
  { name: '2nd Degree AV Block - Mobitz I (Wenckebach)', cat: 'Block', rate: 'Variable', regularity: 'Irregular',
    pWave: 'More P waves than QRS', prInterval: 'Progressively prolonging until dropped QRS', qrsDuration: 'Usually normal',
    description: 'Progressive PR prolongation until a beat is dropped. Block is at AV node level. Usually benign.',
    criteria: ['PR interval gets longer and longer then drops a QRS', 'Group beating pattern', 'R-R interval shortens before the dropped beat', 'Block at AV node → usually benign', 'Associated with inferior MI, medications'] },
  { name: '3rd Degree (Complete) Heart Block', cat: 'Block', rate: '<45 (escape)', regularity: 'Regular (both atria and vent independently)',
    pWave: 'P waves present but dissociated from QRS', prInterval: 'Variable (no AV conduction)', qrsDuration: 'May be wide (ventricular escape) or narrow (junctional escape)',
    description: 'Complete AV dissociation — no atrial impulses reach the ventricles. Relies on escape rhythm. Requires pacing.',
    criteria: ['P waves and QRS complexes at independent rates', 'No relationship between P and QRS (AV dissociation)', 'Narrow escape = junctional (40-60 bpm)', 'Wide escape = ventricular (20-40 bpm)', 'Treatment: temporary pacing → permanent pacemaker', 'Atropine may work for junctional escape, NOT ventricular'] },
  { name: 'STEMI (ST Elevation MI)', cat: 'Emergency', rate: 'Variable', regularity: 'Variable',
    pWave: 'Normal (unless concurrent arrhythmia)', prInterval: 'Normal', qrsDuration: 'May develop Q waves',
    description: 'Acute myocardial infarction with ST elevation indicating transmural ischemia. Emergent reperfusion needed.',
    criteria: ['ST elevation ≥1 mm in ≥2 contiguous limb leads', 'ST elevation ≥2 mm in ≥2 contiguous precordial leads', 'Anterior: V1-V4 (LAD territory)', 'Inferior: II, III, aVF (RCA territory)', 'Lateral: I, aVL, V5-V6 (LCx territory)', 'Reciprocal ST depression opposite territory', 'EMERGENT PCI within 90 min or fibrinolysis within 30 min'] },
];

const catColor = cat => ({ Normal: '#10b981', Bradycardia: '#3b82f6', Tachycardia: '#f59e0b', Arrhythmia: '#8b5cf6', Emergency: '#ef4444', Block: '#6b7280' }[cat] || 'var(--accent)');

export default function ECGInterpreterView() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('All');
  const [expanded, setExpanded] = useState(null);
  const categories = ['All', ...new Set(ECG_RHYTHMS.map(e => e.cat))];
  const filtered = ECG_RHYTHMS
    .filter(e => category === 'All' || e.cat === category)
    .filter(e => !search || (e.name + ' ' + e.description).toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0 space-y-3" style={{ borderBottom: '1px solid var(--border)' }}>
        <h2 className="font-black text-xl flex items-center gap-2"> ECG Interpreter</h2>
        <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search rhythms…"
          className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none" style={{ background: 'var(--surface,var(--card))', border: '1px solid var(--border)' }} />
        <div className="flex gap-2 overflow-x-auto pb-1">
          {categories.map(c => (
            <button key={c} onClick={() => setCategory(c)}
              className="px-3 py-1.5 rounded-xl text-xs font-black shrink-0 transition-all"
              style={c === category ? { background: catColor(c), color: '#fff' } : { opacity: .5 }}>
              {c}
            </button>
          ))}
        </div>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-3">
        {filtered.map(ecg => {
          const isOpen = expanded === ecg.name;
          return (
            <div key={ecg.name} className="glass rounded-2xl overflow-hidden transition-all"
              style={{ border: `1px solid ${isOpen ? catColor(ecg.cat) + '40' : 'var(--border)'}` }}>
              <button onClick={() => setExpanded(e => e === ecg.name ? null : ecg.name)}
                className="w-full p-4 text-left flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                  style={{ background: catColor(ecg.cat) + '15' }}></div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-black text-sm">{ecg.name}</h3>
                  <p className="text-xs opacity-40 mt-0.5">{ecg.cat} · Rate: {ecg.rate} · {ecg.regularity}</p>
                </div>
                <span className="px-2 py-0.5 rounded-lg text-xs font-black shrink-0" style={{ background: catColor(ecg.cat) + '15', color: catColor(ecg.cat) }}>{ecg.cat}</span>
              </button>
              {isOpen && (
                <div className="px-4 pb-5 space-y-4 animate-fade-in-up">
                  <p className="text-sm opacity-70 leading-relaxed">{ecg.description}</p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[['Rate', ecg.rate], ['Rhythm', ecg.regularity], ['PR Interval', ecg.prInterval], ['QRS', ecg.qrsDuration]].map(([label, val]) => (
                      <div key={label} className="glass rounded-xl p-2.5 text-center" style={{ border: '1px solid var(--border)' }}>
                        <div className="text-xs font-black opacity-40">{label}</div>
                        <div className="text-xs font-bold mt-0.5">{val}</div>
                      </div>
                    ))}
                  </div>

                  <div>
                    <h4 className="text-xs font-black opacity-40 mb-2">P Wave</h4>
                    <p className="text-xs opacity-60">{ecg.pWave}</p>
                  </div>

                  <div className="glass rounded-xl p-4" style={{ background: catColor(ecg.cat) + '08', border: `1px solid ${catColor(ecg.cat)}20` }}>
                    <h4 className="text-xs font-black mb-2" style={{ color: catColor(ecg.cat) }}>Diagnostic Criteria & Management</h4>
                    <div className="space-y-1.5">
                      {ecg.criteria.map((c, i) => (
                        <div key={i} className="flex gap-2 text-xs">
                          <span style={{ color: catColor(ecg.cat) }}>▸</span>
                          <span className="opacity-70 leading-relaxed">{c}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
        {filtered.length === 0 && <div className="empty-state py-12"><p className="font-black mt-4">No rhythms found</p></div>}
      </div>
    </div>
  );
}
