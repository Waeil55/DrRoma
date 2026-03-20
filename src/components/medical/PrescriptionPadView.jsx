import { useState } from 'react';
import { Plus, Copy, PenLine, Trash2, Clipboard } from 'lucide-react';

const ROUTES = ['PO', 'IV', 'IM', 'SC', 'SL', 'PR', 'Topical', 'Inhaled', 'Nasal', 'Ophthalmic', 'Otic'];
const FREQS = ['OD', 'BID', 'TID', 'QID', 'Q4H', 'Q6H', 'Q8H', 'Q12H', 'PRN', 'STAT', 'QHS', 'QAM', 'QWeekly'];
const TEMPLATES = [
  { drug: 'Amoxicillin', dose: '500 mg', route: 'PO', freq: 'TID', duration: '7 days', instructions: 'Take with or without food', refills: '0' },
  { drug: 'Omeprazole', dose: '20 mg', route: 'PO', freq: 'OD', duration: '14 days', instructions: 'Take 30 min before breakfast', refills: '1' },
  { drug: 'Metformin', dose: '500 mg', route: 'PO', freq: 'BID', duration: '30 days', instructions: 'Take with meals', refills: '3' },
  { drug: 'Lisinopril', dose: '10 mg', route: 'PO', freq: 'OD', duration: '30 days', instructions: 'Monitor BP regularly', refills: '3' },
  { drug: 'Salbutamol MDI', dose: '100 mcg/puff, 2 puffs', route: 'Inhaled', freq: 'PRN', duration: '30 days', instructions: 'Use with spacer, max 8 puffs/day', refills: '2' },
  { drug: 'Ibuprofen', dose: '400 mg', route: 'PO', freq: 'TID', duration: '5 days', instructions: 'Take with food. Avoid if GI issues.', refills: '0' },
];

export default function PrescriptionPadView({ addToast }) {
  const [rxList, setRxList] = useState(() => { try { return JSON.parse(localStorage.getItem('mariam_rx_pad') || '[]'); } catch { return []; } });
  const [editing, setEditing] = useState(null);
  const [form, setForm] = useState({ drug: '', dose: '', route: 'PO', freq: 'OD', duration: '', instructions: '', refills: '0' });

  const save = () => {
    if (!form.drug.trim() || !form.dose.trim()) { addToast('Drug name and dose required', 'warn'); return; }
    const rx = { ...form, id: editing === 'new' ? Date.now() : rxList[editing]?.id || Date.now(), savedAt: Date.now() };
    let updated;
    if (editing === 'new') updated = [rx, ...rxList];
    else { updated = [...rxList]; updated[editing] = rx; }
    setRxList(updated);
    localStorage.setItem('mariam_rx_pad', JSON.stringify(updated));
    setEditing(null);
    addToast('Prescription saved ', 'success');
  };

  const deleteRx = (idx) => {
    const updated = rxList.filter((_, i) => i !== idx);
    setRxList(updated);
    localStorage.setItem('mariam_rx_pad', JSON.stringify(updated));
  };

  const copyRx = (rx) => {
    const text = `Rx: ${rx.drug}\nDose: ${rx.dose}\nRoute: ${rx.route}\nFrequency: ${rx.freq}\nDuration: ${rx.duration}\nInstructions: ${rx.instructions}\nRefills: ${rx.refills}`;
    navigator.clipboard?.writeText(text);
    addToast('Copied to clipboard ', 'success');
  };

  return (
    <div className="flex-1 min-h-0 flex flex-col">
      <div className="px-4 py-3 shrink-0 flex items-center justify-between" style={{ borderBottom: '1px solid var(--border)' }}>
        <div>
          <h2 className="font-black text-xl flex items-center gap-2"> Prescription Pad</h2>
          <p className="text-xs opacity-40 mt-0.5">{rxList.length} saved prescriptions</p>
        </div>
        <button onClick={() => { setEditing('new'); setForm({ drug: '', dose: '', route: 'PO', freq: 'OD', duration: '', instructions: '', refills: '0' }); }}
          className="btn-accent px-4 py-2 rounded-xl text-xs font-black flex items-center gap-1.5">
          <Plus size={14} /> New Rx
        </button>
      </div>
      <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar p-4 space-y-4">
        {editing !== null && (
          <div className="glass rounded-2xl p-5 space-y-3 animate-fade-in-up" style={{ border: '1px solid var(--accent)/30' }}>
            <h3 className="font-black text-sm">{editing === 'new' ? 'New Prescription' : 'Edit Prescription'}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="col-span-full">
                <label className="text-xs font-black opacity-40 uppercase tracking-widest block mb-1">Drug Name *</label>
                <input value={form.drug} onChange={e => setForm(p => ({ ...p, drug: e.target.value }))} placeholder="e.g. Amoxicillin"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none" style={{ border: '1px solid var(--border)' }} />
              </div>
              <div>
                <label className="text-xs font-black opacity-40 uppercase tracking-widest block mb-1">Dose *</label>
                <input value={form.dose} onChange={e => setForm(p => ({ ...p, dose: e.target.value }))} placeholder="e.g. 500 mg"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none" style={{ border: '1px solid var(--border)' }} />
              </div>
              <div>
                <label className="text-xs font-black opacity-40 uppercase tracking-widest block mb-1">Route</label>
                <select value={form.route} onChange={e => setForm(p => ({ ...p, route: e.target.value }))}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none" style={{ background: 'var(--surface,var(--card))', border: '1px solid var(--border)' }}>
                  {ROUTES.map(r => <option key={r}>{r}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-black opacity-40 uppercase tracking-widest block mb-1">Frequency</label>
                <select value={form.freq} onChange={e => setForm(p => ({ ...p, freq: e.target.value }))}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none" style={{ background: 'var(--surface,var(--card))', border: '1px solid var(--border)' }}>
                  {FREQS.map(f => <option key={f}>{f}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs font-black opacity-40 uppercase tracking-widest block mb-1">Duration</label>
                <input value={form.duration} onChange={e => setForm(p => ({ ...p, duration: e.target.value }))} placeholder="e.g. 7 days"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none" style={{ border: '1px solid var(--border)' }} />
              </div>
              <div>
                <label className="text-xs font-black opacity-40 uppercase tracking-widest block mb-1">Refills</label>
                <input type="number" min="0" max="12" value={form.refills} onChange={e => setForm(p => ({ ...p, refills: e.target.value }))}
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none" style={{ border: '1px solid var(--border)' }} />
              </div>
              <div className="col-span-full">
                <label className="text-xs font-black opacity-40 uppercase tracking-widest block mb-1">Instructions</label>
                <input value={form.instructions} onChange={e => setForm(p => ({ ...p, instructions: e.target.value }))} placeholder="e.g. Take with food"
                  className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none" style={{ border: '1px solid var(--border)' }} />
              </div>
            </div>
            <div className="flex gap-2">
              <button onClick={save} className="btn-accent flex-1 py-2.5 rounded-xl font-black text-sm">Save</button>
              <button onClick={() => setEditing(null)} className="glass flex-1 py-2.5 rounded-xl font-black text-sm" style={{ border: '1px solid var(--border)' }}>Cancel</button>
            </div>
            {editing === 'new' && (
              <div>
                <p className="text-xs font-black opacity-40 mb-2">Quick Templates:</p>
                <div className="flex flex-wrap gap-2">
                  {TEMPLATES.map(t => (
                    <button key={t.drug} onClick={() => setForm(t)}
                      className="glass px-3 py-1.5 rounded-xl text-xs transition-all hover:opacity-80"
                      style={{ border: '1px solid var(--border)' }}>
                       {t.drug}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {rxList.length === 0 && editing === null ? (
          <div className="empty-state py-16">
            <div className="empty-icon"><Clipboard size={36} /></div>
            <p className="font-black text-lg mt-4">No prescriptions yet</p>
            <p className="text-xs opacity-40 mt-1">Tap "New Rx" to write your first prescription</p>
          </div>
        ) : rxList.map((rx, i) => (
          <div key={rx.id || i} className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
            <div className="flex items-start justify-between gap-3 mb-2">
              <div>
                <h3 className="font-black text-base">Rx: {rx.drug}</h3>
                <p className="text-sm font-bold opacity-70 mt-0.5">{rx.dose} — {rx.route} — {rx.freq}</p>
              </div>
              <div className="flex gap-1.5 shrink-0">
                <button onClick={() => copyRx(rx)} className="w-7 h-7 glass rounded-lg flex items-center justify-center opacity-40 hover:opacity-80"><Copy size={12} /></button>
                <button onClick={() => { setEditing(i); setForm(rx); }} className="w-7 h-7 glass rounded-lg flex items-center justify-center opacity-40 hover:opacity-80"><PenLine size={12} /></button>
                <button onClick={() => deleteRx(i)} className="w-7 h-7 glass rounded-lg flex items-center justify-center opacity-40 hover:opacity-80" style={{ color: 'var(--danger)' }}><Trash2 size={12} /></button>
              </div>
            </div>
            <div className="grid grid-cols-3 gap-2 mt-3">
              {rx.duration && <div className="px-3 py-1.5 rounded-xl text-xs" style={{ background: 'var(--surface,var(--card))' }}><span className="opacity-40">Duration: </span><span className="font-bold">{rx.duration}</span></div>}
              {rx.refills && rx.refills !== '0' && <div className="px-3 py-1.5 rounded-xl text-xs" style={{ background: 'var(--surface,var(--card))' }}><span className="opacity-40">Refills: </span><span className="font-bold">{rx.refills}</span></div>}
              {rx.instructions && <div className="col-span-full px-3 py-1.5 rounded-xl text-xs" style={{ background: 'var(--surface,var(--card))' }}><span className="opacity-40">Sig: </span><span className="font-bold">{rx.instructions}</span></div>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
