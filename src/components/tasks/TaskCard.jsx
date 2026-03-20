/**
 * MARIAM PRO  TaskCard Component
 * Individual task card with toggle, edit, delete.
 */
import React from 'react';
import { Edit2, Trash2 } from 'lucide-react';

const TASK_PRIORITIES = { low: 'Low', medium: 'Medium', high: 'High', urgent: 'Urgent' };
const PRIORITY_COLORS = { low: 'var(--success)', medium: 'var(--accent)', high: '#f59e0b', urgent: 'var(--danger)' };

export { TASK_PRIORITIES, PRIORITY_COLORS };

export default function TaskCard({ task, onToggle, onDelete, onEdit }) {
  const isPast = task.dueDate && new Date(task.dueDate) < new Date() && !task.done;
  return (
    <div className={`glass rounded-2xl px-4 py-3 flex items-start gap-3 transition-all${task.done ? ' opacity-50' : ''}`}
      style={{ background: 'var(--card)' }}>
      <button onClick={() => onToggle(task.id)}
        className="mt-0.5 w-5 h-5 rounded-full border-2 shrink-0 transition-colors"
        style={{
          borderColor: task.done ? 'var(--success)' : PRIORITY_COLORS[task.priority] || 'var(--accent)',
          background: task.done ? 'var(--success)' : 'transparent',
        }}>
        {task.done && <span className="block w-full h-full flex items-center justify-center text-white text-xs"></span>}
      </button>
      <div className="flex-1 min-w-0">
        <p className={`text-sm font-semibold${task.done ? ' line-through' : ''}`} style={{ color: 'var(--fg)' }}>
          {task.title}
        </p>
        {task.notes && <p className="text-xs opacity-50 mt-0.5 truncate">{task.notes}</p>}
        <div className="flex gap-2 mt-1 flex-wrap">
          {task.priority && (
            <span className="text-xs font-bold px-2 py-0.5 rounded-full"
              style={{ background: `${PRIORITY_COLORS[task.priority]}22`, color: PRIORITY_COLORS[task.priority] }}>
              {TASK_PRIORITIES[task.priority]}
            </span>
          )}
          {task.dueDate && (
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium${isPast ? ' font-bold' : ''}`}
              style={{ background: isPast ? 'var(--danger-bg)' : 'var(--card-2, #2a2a3e)', color: isPast ? 'var(--danger)' : 'var(--fg)' }}>
              {new Date(task.dueDate).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>
      <div className="flex gap-1 shrink-0">
        <button onClick={() => onEdit(task)} className="p-1.5 rounded-lg opacity-40 hover:opacity-80 transition-opacity">
          <Edit2 size={13} />
        </button>
        <button onClick={() => onDelete(task.id)} className="p-1.5 rounded-lg opacity-40 hover:opacity-80 transition-opacity text-red-400">
          <Trash2 size={13} />
        </button>
      </div>
    </div>
  );
}
