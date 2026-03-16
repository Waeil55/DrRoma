/**
 * MARIAM PRO — Study Analytics Service
 * Tracks daily study activity and computes insights.
 */
import { dbOp } from '../db/dbOp.js';

/**
 * Record a study activity for today.
 * @param {'flashcard'|'exam'|'case'|'chat'|'document'} type
 * @param {number} [count=1]
 */
export async function trackStudyActivity(type, count = 1) {
  const today = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  let record;
  try {
    record = await dbOp('analytics', 'readonly', s => s.get(today));
  } catch { record = null; }

  const data = record || { date: today, flashcards: 0, exams: 0, cases: 0, chat: 0, documents: 0, totalMinutes: 0 };
  if (type === 'flashcard') data.flashcards += count;
  else if (type === 'exam')  data.exams += count;
  else if (type === 'case')  data.cases += count;
  else if (type === 'chat')  data.chat += count;
  else if (type === 'document') data.documents += count;

  await dbOp('analytics', 'readwrite', s => { s.put(data); });
  return data;
}

/**
 * Get study analytics for a date range.
 * @param {number} days - number of past days to retrieve
 * @returns {Promise<object[]>}
 */
export async function getStudyHistory(days = 30) {
  const records = [];
  const now = new Date();
  for (let i = 0; i < days; i++) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const key = d.toISOString().slice(0, 10);
    try {
      const record = await dbOp('analytics', 'readonly', s => s.get(key));
      if (record) records.push(record);
      else records.push({ date: key, flashcards: 0, exams: 0, cases: 0, chat: 0, documents: 0, totalMinutes: 0 });
    } catch {
      records.push({ date: key, flashcards: 0, exams: 0, cases: 0, chat: 0, documents: 0, totalMinutes: 0 });
    }
  }
  return records;
}

/**
 * Compute current streak (consecutive days with any activity).
 * @returns {Promise<{current: number, longest: number}>}
 */
export async function computeStreak() {
  const history = await getStudyHistory(365);
  let current = 0;
  let longest = 0;
  let streak = 0;

  for (const day of history) {
    const hasActivity = (day.flashcards + day.exams + day.cases + day.chat + day.documents) > 0;
    if (hasActivity) {
      streak++;
      if (streak > longest) longest = streak;
    } else {
      if (current === 0) current = streak;
      streak = 0;
    }
  }
  if (current === 0) current = streak;
  if (streak > longest) longest = streak;

  return { current, longest };
}
