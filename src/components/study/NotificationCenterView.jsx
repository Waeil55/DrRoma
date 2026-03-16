import React, { useState } from 'react';
import { Bell, Plus, Trash2, AlertCircle } from 'lucide-react';

export default function NotificationCenterView({ flashcards, exams, addToast }) {
  const [notifs, setNotifs] = useState(() => JSON.parse(localStorage.getItem('mariam_notifs') || '[]'));
  const [showNew, setShowNew] = useState(false);
  const [draft, setDraft] = useState({ title: '', type: 'review', time: '09:00', days: [] });

  const save = () => {
    const n = { ...draft, id: Date.now().toString(), createdAt: Date.now(), enabled: true };
    const updated = [n, ...notifs];
    setNotifs(updated);
    localStorage.setItem('mariam_notifs', JSON.stringify(updated));
    setShowNew(false);
    addToast('Reminder set ✓', 'success');
    if ('Notification' in window && Notification.permission === 'default') Notification.requestPermission();
  };

  const toggle = (id) => {
    const updated = notifs.map(n => n.id === id ? { ...n, enabled: !n.enabled } : n);
    setNotifs(updated);
    localStorage.setItem('mariam_notifs', JSON.stringify(updated));
  };

  const remove = (id) => {
    const updated = notifs.filter(n => n.id !== id);
    setNotifs(updated);
    localStorage.setItem('mariam_notifs', JSON.stringify(updated));
  };

  const dueCards = flashcards.reduce((s, f) => s + (f.cards?.filter(c => !c.nextReview || c.nextReview <= Date.now()).length || 0), 0);
  const DAYS_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar scroll-content p-4 space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-black flex items-center gap-2"><Bell size={20} style={{ color: 'var(--accent)' }} /> Reminders</h1>
        <button onClick={() => setShowNew(true)} className="btn-accent px-4 py-2 rounded-xl text-sm font-black flex items-center gap-2">
          <Plus size={14} /> New
        </button>
      </div>

      {'Notification' in window && Notification.permission === 'denied' && (
        <div className="glass rounded-2xl p-4 flex items-center gap-3" style={{ border: '1px solid var(--danger)/30', background: 'var(--danger)/05' }}>
          <AlertCircle size={16} style={{ color: 'var(--danger)', flexShrink: 0 }} />
          <p className="text-sm opacity-70">Notifications are blocked. Enable them in browser settings.</p>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <div className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
          <div className="text-2xl font-black" style={{ color: dueCards > 0 ? 'var(--warning)' : 'var(--success)' }}>{dueCards}</div>
          <div className="text-xs opacity-40 font-bold mt-1">Cards due now</div>
        </div>
        <div className="glass rounded-2xl p-4" style={{ border: '1px solid var(--border)' }}>
          <div className="text-2xl font-black" style={{ color: 'var(--accent)' }}>{notifs.filter(n => n.enabled).length}</div>
          <div className="text-xs opacity-40 font-bold mt-1">Active reminders</div>
        </div>
      </div>

      {showNew && (
        <div className="glass rounded-2xl p-5" style={{ border: '1px solid var(--accent)/40' }}>
          <h2 className="font-black mb-4 text-sm">New Reminder</h2>
          <div className="space-y-3">
            <input value={draft.title} onChange={e => setDraft(p => ({ ...p, title: e.target.value }))}
              placeholder="Reminder title…"
              className="w-full glass-input rounded-xl px-4 py-2.5 text-sm outline-none"
              style={{ border: '1px solid var(--border)' }} />
            <div className="flex gap-3">
              <select value={draft.type} onChange={e => setDraft(p => ({ ...p, type: e.target.value }))}
                className="flex-1 glass-input rounded-xl px-3 py-2.5 text-sm outline-none">
                <option value="review">FSRS Review</option>
                <option value="exam">Exam Practice</option>
                <option value="study">Study Session</option>
                <option value="custom">Custom</option>
              </select>
              <input type="time" value={draft.time} onChange={e => setDraft(p => ({ ...p, time: e.target.value }))}
                className="glass-input rounded-xl px-3 py-2.5 text-sm outline-none" />
            </div>
            <div className="flex gap-2 flex-wrap">
              {DAYS_SHORT.map((d, i) => (
                <button key={i} onClick={() => setDraft(p => ({ ...p, days: p.days.includes(i) ? p.days.filter(x => x !== i) : [...p.days, i] }))}
                  className="px-3 py-1.5 rounded-lg text-xs font-black transition-all"
                  style={draft.days.includes(i) ? { background: 'var(--accent)', color: '#fff' } : { background: 'var(--surface)', opacity: .6 }}>
                  {d}
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button onClick={() => setShowNew(false)} className="flex-1 glass py-2.5 rounded-xl font-black text-sm" style={{ border: '1px solid var(--border)' }}>Cancel</button>
              <button onClick={save} disabled={!draft.title.trim()} className="flex-1 btn-accent py-2.5 rounded-xl font-black text-sm">Save</button>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-2">
        {notifs.length === 0 ? (
          <div className="empty-state py-12">
            <div className="empty-icon"><Bell size={36} /></div>
            <p className="font-black mt-4">No reminders yet</p>
            <p className="text-xs opacity-40 mt-1">Set daily study reminders to stay consistent</p>
          </div>
        ) : notifs.map(n => (
          <div key={n.id} className="glass rounded-2xl p-4 flex items-center gap-3"
            style={{ border: '1px solid var(--border)', opacity: n.enabled ? 1 : 0.5 }}>
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
              style={{ background: n.enabled ? 'var(--accent)/15' : 'var(--border)', color: n.enabled ? 'var(--accent)' : 'var(--text3)' }}>
              <Bell size={16} />
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-black text-sm truncate">{n.title}</p>
              <p className="text-xs opacity-40">{n.time} · {n.days.length > 0 ? n.days.map(d => DAYS_SHORT[d]).join(', ') : 'One-time'} · {n.type}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button onClick={() => toggle(n.id)}
                className="w-12 h-6 rounded-full transition-all relative"
                style={{ background: n.enabled ? 'var(--accent)' : 'var(--border)' }}>
                <div className="absolute top-1 w-4 h-4 rounded-full bg-white transition-all shadow"
                  style={{ left: n.enabled ? 28 : 4 }} />
              </button>
              <button onClick={() => remove(n.id)} className="w-7 h-7 glass rounded-lg flex items-center justify-center opacity-50 hover:opacity-80" style={{ color: 'var(--danger)' }}>
                <Trash2 size={12} />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
