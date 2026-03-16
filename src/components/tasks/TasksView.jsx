/**
 * MARIAM PRO — TasksView Component
 * Task manager with Overdue/Today/Upcoming/Done sections, swipe gestures, and NLP parsing.
 */
import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { Plus, Loader2, CheckCircle2, ChevronDown, ChevronRight } from 'lucide-react';
import TaskCard, { TASK_PRIORITIES } from './TaskCard';
import { getState, saveState } from '../../services/db/stateOps';
import BottomSheet from '../ui/BottomSheet';

/* ── NLP quick-parse for natural language task input ── */
function parseNaturalInput(text) {
  const result = { title: text.trim(), dueDate: '', dueTime: '', type: 'personal', priority: 'medium' };
  const now = new Date();

  // Detect relative dates
  const tmrw = /\btomorrow\b/i;
  const nextMon = /\bnext\s+monday\b/i;
  const inDays = /\bin\s+(\d+)\s+days?\b/i;
  const tonight = /\btonight\b/i;
  const thisEvening = /\bthis\s+evening\b/i;

  if (tmrw.test(text)) {
    const d = new Date(now); d.setDate(d.getDate() + 1);
    result.dueDate = d.toISOString().slice(0, 10);
    result.title = result.title.replace(tmrw, '').trim();
  } else if (nextMon.test(text)) {
    const d = new Date(now); d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7));
    result.dueDate = d.toISOString().slice(0, 10);
    result.title = result.title.replace(nextMon, '').trim();
  } else if (inDays.test(text)) {
    const m = text.match(inDays);
    const d = new Date(now); d.setDate(d.getDate() + parseInt(m[1]));
    result.dueDate = d.toISOString().slice(0, 10);
    result.title = result.title.replace(inDays, '').trim();
  } else if (tonight.test(text) || thisEvening.test(text)) {
    result.dueDate = now.toISOString().slice(0, 10);
    result.dueTime = '21:00';
    result.title = result.title.replace(tonight, '').replace(thisEvening, '').trim();
  }

  // Detect time
  const timeMatch = text.match(/\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)?\b/i);
  if (timeMatch) {
    let h = parseInt(timeMatch[1]);
    const min = timeMatch[2] || '00';
    const ampm = (timeMatch[3] || '').toLowerCase();
    if (ampm === 'pm' && h < 12) h += 12;
    if (ampm === 'am' && h === 12) h = 0;
    result.dueTime = `${String(h).padStart(2, '0')}:${min}`;
    result.title = result.title.replace(/\bat\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)?\b/i, '').trim();
    if (!result.dueDate) result.dueDate = now.toISOString().slice(0, 10);
  }

  // Detect type keywords
  if (/\bstudy\b/i.test(text)) result.type = 'study';
  else if (/\breview\b/i.test(text)) result.type = 'review';
  else if (/\bexam\b/i.test(text)) result.type = 'exam';

  return result;
}

/* ── Section grouping ── */
function groupTasks(tasks) {
  const now = new Date();
  const todayStr = now.toISOString().slice(0, 10);
  const overdue = [], today = [], upcoming = [], done = [];

  for (const t of tasks) {
    if (t.done) { done.push(t); continue; }
    if (!t.dueDate) { upcoming.push(t); continue; }
    if (t.dueDate < todayStr) overdue.push(t);
    else if (t.dueDate === todayStr) today.push(t);
    else upcoming.push(t);
  }
  return { overdue, today, upcoming, done };
}

export default function TasksView({ addToast }) {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sheet, setSheet] = useState(false);
  const [editing, setEditing] = useState(null);
  const [doneCollapsed, setDoneCollapsed] = useState(true);
  const [quickInput, setQuickInput] = useState('');
  const [undoTask, setUndoTask] = useState(null);
  const undoTimer = useRef(null);

  const [title, setTitle] = useState('');
  const [notes, setNotes] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState('medium');
  const [subject, setSubject] = useState('');

  useEffect(() => {
    (async () => {
      try {
        const saved = await getState('tasks_v1');
        if (Array.isArray(saved)) setTasks(saved);
      } catch { }
      setLoading(false);
    })();
  }, []);

  const persist = useCallback(async (next) => {
    setTasks(next);
    try { await saveState('tasks_v1', next); } catch { }
  }, []);

  const sections = useMemo(() => groupTasks(tasks), [tasks]);

  const openNew = () => {
    setEditing(null);
    setTitle(''); setNotes(''); setDueDate(''); setPriority('medium'); setSubject('');
    setSheet(true);
  };

  const openEdit = (task) => {
    setEditing(task);
    setTitle(task.title || ''); setNotes(task.notes || '');
    setDueDate(task.dueDate || ''); setPriority(task.priority || 'medium');
    setSubject(task.subject || '');
    setSheet(true);
  };

  const handleSave = () => {
    if (!title.trim()) { addToast?.('Enter a task title', 'error'); return; }
    if (editing) {
      const next = tasks.map(t => t.id === editing.id
        ? { ...t, title: title.trim(), notes, dueDate, priority, subject }
        : t);
      persist(next);
    } else {
      const newTask = {
        id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
        title: title.trim(), notes, dueDate, priority, subject,
        done: false, createdAt: new Date().toISOString(),
      };
      persist([newTask, ...tasks]);
    }
    setSheet(false);
    addToast?.(editing ? 'Task updated' : 'Task added', 'success');
  };

  const handleQuickAdd = () => {
    if (!quickInput.trim()) return;
    const parsed = parseNaturalInput(quickInput);
    const newTask = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 6),
      title: parsed.title || quickInput.trim(),
      notes: '', dueDate: parsed.dueDate, dueTime: parsed.dueTime,
      priority: parsed.priority, subject: '', type: parsed.type,
      done: false, createdAt: new Date().toISOString(),
    };
    persist([newTask, ...tasks]);
    setQuickInput('');
    addToast?.('Task added', 'success');
  };

  const handleToggle = useCallback((id) => {
    persist(tasks.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }, [tasks, persist]);

  const handleSwipeComplete = useCallback((id) => {
    persist(tasks.map(t => t.id === id ? { ...t, done: true } : t));
    addToast?.('Task completed', 'success');
  }, [tasks, persist, addToast]);

  const handleSwipeDelete = useCallback((id) => {
    const task = tasks.find(t => t.id === id);
    setUndoTask(task);
    persist(tasks.filter(t => t.id !== id));
    if (undoTimer.current) clearTimeout(undoTimer.current);
    undoTimer.current = setTimeout(() => setUndoTask(null), 5000);
  }, [tasks, persist]);

  const handleUndo = useCallback(() => {
    if (!undoTask) return;
    if (undoTimer.current) clearTimeout(undoTimer.current);
    persist([undoTask, ...tasks]);
    setUndoTask(null);
    addToast?.('Task restored', 'info');
  }, [undoTask, tasks, persist, addToast]);

  const handleDelete = useCallback((id) => {
    persist(tasks.filter(t => t.id !== id));
    addToast?.('Task deleted', 'info');
  }, [tasks, persist, addToast]);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 size={28} className="animate-spin opacity-40" />
    </div>
  );

  const renderSection = (label, items, color, showSwipe = true) => {
    if (items.length === 0) return null;
    return (
      <div className="mb-3">
        <p className="text-xs font-bold uppercase tracking-widest mb-1.5 px-1" style={{ color }}>{label} ({items.length})</p>
        <div className="flex flex-col gap-1.5">
          {items.map(t => (
            <SwipeableTaskCard key={t.id} task={t}
              onToggle={handleToggle} onDelete={showSwipe ? handleSwipeDelete : handleDelete}
              onEdit={openEdit} onSwipeRight={showSwipe ? handleSwipeComplete : undefined}
              onSwipeLeft={showSwipe ? handleSwipeDelete : undefined} />
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="flex flex-col h-full" style={{ paddingBottom: 'var(--content-bottom-clear)' }}>
      <div className="flex items-center justify-between px-4 py-3">
        <div>
          <h2 className="text-lg font-black" style={{ color: 'var(--fg)' }}>Tasks</h2>
          <p className="text-xs opacity-50">{tasks.filter(t => !t.done).length} pending · {tasks.filter(t => t.done).length} done</p>
        </div>
        <button onClick={openNew}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-bold transition-all"
          style={{ background: 'var(--accent)', color: '#fff' }}>
          <Plus size={16} /> Add Task
        </button>
      </div>

      {/* Quick-add with NLP */}
      <div className="px-4 pb-2">
        <div className="flex gap-2">
          <input className="flex-1 rounded-xl px-3 py-2.5 text-sm font-medium border focus:outline-none focus:border-[var(--accent)]"
            style={{ background: 'var(--surface)', borderColor: 'var(--border)', color: 'var(--text)' }}
            placeholder='Quick add: "Study drugs tomorrow at 9am"'
            value={quickInput} onChange={e => setQuickInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleQuickAdd()} />
          <button onClick={handleQuickAdd} className="px-3 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: 'var(--accent)', opacity: quickInput.trim() ? 1 : 0.5 }}>
            <Plus size={16} />
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 pb-4">
        {tasks.length === 0 && (
          <div className="flex flex-col items-center justify-center py-24 gap-3 opacity-40">
            <CheckCircle2 size={40} />
            <p className="text-sm font-medium">No tasks yet — add one!</p>
          </div>
        )}
        {renderSection('Overdue', sections.overdue, 'var(--danger,#ef4444)')}
        {renderSection('Today', sections.today, 'var(--accent)')}
        {renderSection('Upcoming', sections.upcoming, 'var(--text2,#888)')}

        {sections.done.length > 0 && (
          <div className="mb-3">
            <button onClick={() => setDoneCollapsed(!doneCollapsed)}
              className="flex items-center gap-1 text-xs font-bold uppercase tracking-widest mb-1.5 px-1"
              style={{ color: 'var(--success,#10b981)' }}>
              {doneCollapsed ? <ChevronRight size={12} /> : <ChevronDown size={12} />}
              Done ({sections.done.length})
            </button>
            {!doneCollapsed && (
              <div className="flex flex-col gap-1.5">
                {sections.done.map(t => (
                  <TaskCard key={t.id} task={t} onToggle={handleToggle} onDelete={handleDelete} onEdit={openEdit} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Undo toast */}
      {undoTask && (
        <div className="fixed bottom-[calc(var(--bottom-nav-h,60px)+var(--sab,0px)+16px)] left-4 right-4 z-50 glass rounded-xl px-4 py-3 flex items-center justify-between" style={{ background: 'var(--surface)' }}>
          <span className="text-sm">Task deleted</span>
          <button onClick={handleUndo} className="text-sm font-bold" style={{ color: 'var(--accent)' }}>Undo</button>
        </div>
      )}

      <BottomSheet isOpen={sheet} onClose={() => setSheet(false)} title={editing ? 'Edit Task' : 'New Task'}>
        <div className="flex flex-col gap-3 pb-4">
          <input className="w-full rounded-xl px-3 py-2.5 text-sm font-medium bg-[var(--input-bg)] border border-[var(--border)] focus:outline-none focus:border-[var(--accent)]"
            placeholder="Task title…" value={title} onChange={e => setTitle(e.target.value)} autoFocus />
          <textarea className="w-full rounded-xl px-3 py-2.5 text-sm bg-[var(--input-bg)] border border-[var(--border)] focus:outline-none focus:border-[var(--accent)] resize-none"
            placeholder="Notes (optional)…" rows={2} value={notes} onChange={e => setNotes(e.target.value)} />
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="text-xs font-bold uppercase opacity-40 block mb-1">Due Date</label>
              <input type="date" className="w-full rounded-xl px-3 py-2 text-sm bg-[var(--input-bg)] border border-[var(--border)] focus:outline-none focus:border-[var(--accent)]"
                value={dueDate} onChange={e => setDueDate(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-bold uppercase opacity-40 block mb-1">Priority</label>
              <select className="w-full rounded-xl px-3 py-2 text-sm bg-[var(--input-bg)] border border-[var(--border)] focus:outline-none focus:border-[var(--accent)]"
                value={priority} onChange={e => setPriority(e.target.value)}>
                {Object.entries(TASK_PRIORITIES).map(([k, v]) => (
                  <option key={k} value={k}>{v}</option>
                ))}
              </select>
            </div>
          </div>
          <button onClick={handleSave}
            className="w-full py-3 rounded-xl font-bold text-sm text-white transition-all"
            style={{ background: 'var(--accent)' }}>
            {editing ? 'Save Changes' : 'Add Task'}
          </button>
        </div>
      </BottomSheet>
    </div>
  );
}

/* ── Swipeable wrapper for TaskCard ── */
function SwipeableTaskCard({ task, onToggle, onDelete, onEdit, onSwipeRight, onSwipeLeft }) {
  const ref = useRef(null);
  const startX = useRef(0);
  const currentX = useRef(0);
  const swiping = useRef(false);
  const THRESHOLD = 100;

  const handlePointerDown = (e) => {
    startX.current = e.clientX;
    currentX.current = 0;
    swiping.current = true;
    if (ref.current) ref.current.style.transition = 'none';
  };

  const handlePointerMove = (e) => {
    if (!swiping.current) return;
    currentX.current = e.clientX - startX.current;
    if (ref.current) {
      ref.current.style.transform = `translateX(${currentX.current}px)`;
      ref.current.style.opacity = String(1 - Math.abs(currentX.current) / 300);
    }
  };

  const handlePointerUp = () => {
    if (!swiping.current) return;
    swiping.current = false;
    const dx = currentX.current;
    if (ref.current) ref.current.style.transition = 'all 0.3s ease';

    if (dx > THRESHOLD && onSwipeRight) {
      if (ref.current) { ref.current.style.transform = 'translateX(100vw)'; ref.current.style.opacity = '0'; }
      setTimeout(() => onSwipeRight(task.id), 300);
    } else if (dx < -THRESHOLD && onSwipeLeft) {
      if (ref.current) { ref.current.style.transform = 'translateX(-100vw)'; ref.current.style.opacity = '0'; }
      setTimeout(() => onSwipeLeft(task.id), 300);
    } else {
      if (ref.current) { ref.current.style.transform = 'translateX(0)'; ref.current.style.opacity = '1'; }
    }
  };

  return (
    <div ref={ref} style={{ touchAction: 'pan-y' }}
      onPointerDown={handlePointerDown} onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp} onPointerCancel={handlePointerUp}>
      <TaskCard task={task} onToggle={onToggle} onDelete={onDelete} onEdit={onEdit} />
    </div>
  );
}
