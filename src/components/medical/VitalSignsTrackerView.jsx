import { useState } from 'react';
import { Plus, Trash2, Activity } from 'lucide-react';

const FIELDS = [
  { key: 'sbp', label: 'SBP', unit: 'mmHg', placeholder: '120', warn: (v) => v > 140 || v < 90 },
  { key: 'dbp', label: 'DBP', unit: 'mmHg', placeholder: '80', warn: (v) => v > 90 || v < 60 },
  { key: 'hr', label: 'HR', unit: 'bpm', placeholder: '80', warn: (v) => v > 100 || v < 60 },
  { key: 'rr', label: 'RR', unit: '/min', placeholder: '16', warn: (v) => v > 20 || v < 12 },
  { key: 'temp', label: 'Temp', unit: '°C', placeholder: '37.0', warn: (v) => v > 38.0 || v < 36.0 },
  { key: 'spo2', label: 'SpO', unit: '%', placeholder: '98', warn: (v) => v < 95 },
  { key: 'weight', label: 'Weight', unit: 'kg', placeholder: '70', warn: () => false },
];

export default function VitalSignsTrackerView({ addToast }) {
  const [vitals, setVitals] = useState(() => { try { return JSON.parse(localStorage.getItem('mariam_vitals_log') || '[]'); } catch { return []; } });
  const [form, setForm] = useState({ sbp: '', dbp: '', hr: '', rr: '', temp: '', spo2: '', weight: '' });
  const [editing, setEditing] = useState(false);

  const save = () => {
    const entry = { ...form, ts: Date.now() };
    const hasAny = Object.values(form).some(v => v.trim());
    if (!hasAny) { addToast('Enter at least one vital sign', 'warn'); return; }
    const updated = [entry, ...vitals.slice(0, 99)];
    setVitals(updated);
    localStorage.setItem('mariam_vitals_log', JSON.stringify(updated));
    setForm({ sbp: '', dbp: '', hr: '', rr: '', temp: '', spo2: '', weight: '' });
    setEditing(false);
    addToast('Vitals logged ', 'success');
  };

  const deleteEntry = (idx) => {
    const updated = vitals.filter((_, i) => i !== idx);
    setVitals(updated);
    localStorage.setItem('mariam_vitals_log', JSON.stringify(updated));
  };

  const recentHR = vitals.slice(0, 10).reverse().map(v => parseFloat(v.hr)).filter(v => !isNaN(v));
  const recentBP = vitals.slice(0, 10).reverse().map(v => ({ s: parseFloat(v.sbp), d: parseFloat(v.dbp) })).filter(v => !isNaN(v.s));
  const maxHR = Math.max(120, ...recentHR);
  const minHR = Math.min(50, ...recentHR);

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <h2 className="font-black text-xl flex items-center gap-2"> Vitals Tracker</h2>
          <p className="text-xs opacity-40 mt-0.5"> {vitals.length} readings</p>
        </div>
        <button onClick={() => setEditing(p => !p)} className="btn-accent px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5">
          <Plus size={14} /> Log Vitals
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {editing && (
          <div className="glass rounded-2xl p-5 space-y-4 animate-fade-in-up" style={{ border: '1px solid var(--accent)/30' }}>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {FIELDS.map(f => (
                <div key={f.key}>
                  <label className="text-xs font-black opacity-40 block mb-1">{f.label} <span className="opacity-30">({f.unit})</span></label>
                  <input type="number" value={form[f.key]} onChange={e => setForm(p => ({ ...p, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="w-full glass-input rounded-xl px-3 py-2.5 text-sm outline-none"
                    style={{ border: `1px solid ${form[f.key] && f.warn(parseFloat(form[f.key])) ? '#f59e0b' : 'var(--border)'}` }} />
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={save} className="btn-accent flex-1 py-2.5 rounded-xl font-black text-sm">Save Vitals</button>
              <button onClick={() => setEditing(false)} className="glass flex-1 py-2.5 rounded-xl font-black text-sm" style={{ border: '1px solid var(--border)' }}>Cancel</button>
            </div>
          </div>
        )}

        {recentHR.length >= 2 && (
          <div className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
            <h3 className="text-xs font-black uppercase tracking-widest opacity-40 mb-3">Heart Rate Trend (last {recentHR.length})</h3>
            <svg viewBox={`0 0 ${recentHR.length * 40} 60`} className="w-full" style={{ height: 60 }}>
              {recentHR.map((v, i) => {
                const x = i * 40 + 20;
                const y = 55 - ((v - minHR) / (maxHR - minHR)) * 50;
                return <g key={i}>
                  {i > 0 && <line x1={(i - 1) * 40 + 20} y1={55 - ((recentHR[i - 1] - minHR) / (maxHR - minHR)) * 50} x2={x} y2={y} stroke="var(--accent)" strokeWidth="2" />}
                  <circle cx={x} cy={y} r="3" fill="var(--accent)" />
                  <text x={x} y={y - 8} textAnchor="middle" fill="var(--accent)" fontSize="8" fontWeight="bold">{v}</text>
                </g>;
              })}
            </svg>
          </div>
        )}

        {vitals.length === 0 && !editing ? (
          <div className="empty-state py-16">
            <div className="empty-icon"><Activity size={36} /></div>
            <p className="font-black text-lg mt-4">No vitals recorded</p>
            <p className="text-xs opacity-40 mt-1">Tap "Log Vitals" to start tracking</p>
          </div>
        ) : vitals.map((v, i) => (
          <div key={i} className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs opacity-40">{new Date(v.ts).toLocaleString()}</span>
              <button onClick={() => deleteEntry(i)} className="w-6 h-6 glass rounded-lg flex items-center justify-center opacity-30 hover:opacity-60"><Trash2 size={10} /></button>
            </div>
            <div className="flex flex-wrap gap-3">
              {[
                v.sbp && v.dbp && { label: 'BP', value: `${v.sbp}/${v.dbp}`, unit: 'mmHg', warn: parseFloat(v.sbp) > 140 || parseFloat(v.dbp) > 90 },
                v.hr && { label: 'HR', value: v.hr, unit: 'bpm', warn: parseFloat(v.hr) > 100 || parseFloat(v.hr) < 60 },
                v.rr && { label: 'RR', value: v.rr, unit: '/min', warn: parseFloat(v.rr) > 20 },
                v.temp && { label: 'Temp', value: v.temp, unit: '°C', warn: parseFloat(v.temp) > 38 },
                v.spo2 && { label: 'SpO', value: v.spo2, unit: '%', warn: parseFloat(v.spo2) < 95 },
                v.weight && { label: 'Wt', value: v.weight, unit: 'kg', warn: false },
              ].filter(Boolean).map(item => (
                <div key={item.label} className="px-3 py-2 rounded-xl text-center" style={{ background: 'var(--surface,var(--card))' }}>
                  <div className="text-sm font-black" style={{ color: item.warn ? '#f59e0b' : 'var(--accent)' }}>{item.value}</div>
                  <div className="text-xs opacity-30">{item.label}</div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
