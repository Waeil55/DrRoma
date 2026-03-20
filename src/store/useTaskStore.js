/**
 * MARIAM PRO  Task Store
 * Full task management with all fields from the data model.
 */
import { createStore } from './createStore.js';

export const useTaskStore = createStore({
  tasks: [],
  filter: 'all', // 'all' | 'overdue' | 'today' | 'upcoming' | 'done'

  addTask: (task) => {
    const s = useTaskStore.getState();
    useTaskStore.setState({
      tasks: [...s.tasks, {
        id: crypto.randomUUID?.() || `task_${Date.now()}_${Math.random().toString(36).slice(2)}`,
        title: task.title || 'Untitled Task',
        description: task.description || '',
        type: task.type || 'personal',
        priority: task.priority || 'medium',
        status: 'pending',
        dueDate: task.dueDate || null,
        dueTime: task.dueTime || null,
        linkedDocId: task.linkedDocId || null,
        linkedFlashcardSetId: task.linkedFlashcardSetId || null,
        fsrsReviewDate: task.fsrsReviewDate || null,
        reminderMinutesBefore: task.reminderMinutesBefore || 30,
        recurrence: task.recurrence || 'none',
        recurrenceRule: task.recurrenceRule || null,
        completedAt: null,
        createdAt: Date.now(),
        tags: task.tags || [],
      }],
    });
  },

  updateTask: (id, partial) => {
    const s = useTaskStore.getState();
    useTaskStore.setState({
      tasks: s.tasks.map(t => t.id === id ? { ...t, ...partial } : t),
    });
  },

  completeTask: (id) => {
    const s = useTaskStore.getState();
    useTaskStore.setState({
      tasks: s.tasks.map(t => t.id === id ? { ...t, status: 'done', completedAt: Date.now() } : t),
    });
  },

  deleteTask: (id) => {
    const s = useTaskStore.getState();
    useTaskStore.setState({
      tasks: s.tasks.filter(t => t.id !== id),
    });
  },

  reorderTasks: (tasks) => useTaskStore.setState({ tasks }),
  setFilter: (filter) => useTaskStore.setState({ filter }),
});

/**
 * Parse natural language task input.
 * Handles: "Study drugs tomorrow at 9am", "Review cards in 3 days", etc.
 */
export function parseNLPTask(input) {
  const result = { title: input, dueDate: null, dueTime: null, type: 'personal' };

  // Detect task type
  if (/\bstudy\b/i.test(input)) result.type = 'study';
  else if (/\breview\b/i.test(input)) result.type = 'review';
  else if (/\bexam\b/i.test(input)) result.type = 'exam';

  // Detect relative dates
  const now = new Date();
  if (/\btomorrow\b/i.test(input)) {
    const d = new Date(now);
    d.setDate(d.getDate() + 1);
    result.dueDate = d.getTime();
    result.title = result.title.replace(/\btomorrow\b/i, '').trim();
  } else if (/\bnext\s+monday\b/i.test(input)) {
    const d = new Date(now);
    d.setDate(d.getDate() + ((8 - d.getDay()) % 7 || 7));
    result.dueDate = d.getTime();
    result.title = result.title.replace(/\bnext\s+monday\b/i, '').trim();
  } else if (/\bin\s+(\d+)\s+days?\b/i.test(input)) {
    const m = input.match(/\bin\s+(\d+)\s+days?\b/i);
    const d = new Date(now);
    d.setDate(d.getDate() + parseInt(m[1]));
    result.dueDate = d.getTime();
    result.title = result.title.replace(/\bin\s+\d+\s+days?\b/i, '').trim();
  } else if (/\btonight\b/i.test(input)) {
    const d = new Date(now);
    d.setHours(21, 0, 0, 0);
    result.dueDate = d.getTime();
    result.dueTime = '21:00';
    result.title = result.title.replace(/\btonight\b/i, '').trim();
  }

  // Detect time
  const timeMatch = input.match(/\bat\s+(\d{1,2})(?::(\d{2}))?\s*(am|pm)\b/i);
  if (timeMatch) {
    let h = parseInt(timeMatch[1]);
    const min = parseInt(timeMatch[2] || '0');
    if (timeMatch[3].toLowerCase() === 'pm' && h < 12) h += 12;
    if (timeMatch[3].toLowerCase() === 'am' && h === 12) h = 0;
    result.dueTime = `${String(h).padStart(2, '0')}:${String(min).padStart(2, '0')}`;
    result.title = result.title.replace(/\bat\s+\d{1,2}(?::\d{2})?\s*(?:am|pm)\b/i, '').trim();
  }

  // Clean up title
  result.title = result.title.replace(/\s+/g, ' ').trim() || input;

  return result;
}
