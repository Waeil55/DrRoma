/**
 * MARIAM PRO  General Formatters
 */

/** Format bytes to human-readable string */
export const formatBytes = (bytes, decimals = 1) => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
};

/** Format seconds to mm:ss or h:mm:ss */
export const formatDuration = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = Math.floor(seconds % 60);
  if (h > 0) return `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  return `${m}:${String(s).padStart(2, '0')}`;
};

/** Format a date to a localized short string */
export const formatDate = (date, locale = 'en-US') => {
  const d = date instanceof Date ? date : new Date(date);
  return d.toLocaleDateString(locale, { month: 'short', day: 'numeric', year: 'numeric' });
};

/** Format a relative time string (e.g. "2 hours ago") */
export const formatRelativeTime = (date) => {
  const d = date instanceof Date ? date : new Date(date);
  const now = Date.now();
  const diff = now - d.getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return formatDate(d);
};

/** Truncate text with ellipsis */
export const truncate = (text, maxLen = 100) => {
  if (!text || text.length <= maxLen) return text || '';
  return text.slice(0, maxLen - 1) + '';
};

/** Capitalize first letter */
export const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

/** Percentage with 0-1 decimal */
export const formatPercent = (value, decimals = 0) => {
  return `${(value * 100).toFixed(decimals)}%`;
};

/**
 * Safely parses a JSON string that may be wrapped in markdown code fences.
 */
export const parseJson = (txt) => {
  let cleaned = txt.replace(/```json/gi, '').replace(/```/g, '').trim();
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start !== -1 && end !== -1 && end > start) cleaned = cleaned.substring(start, end + 1);
  try {
    return JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`AI response was not valid JSON. Raw text (first 200 chars): ${cleaned.substring(0, 200)}`);
  }
};

/**
 * Runs an array of async task-functions with bounded concurrency.
 * @param {Function[]} tasks - zero-arg functions returning Promises
 * @param {number} concurrency - max simultaneous requests
 * @param {Function} [onProgress] - called with (completed, total) after each batch
 */
export const runParallel = async (tasks, concurrency = 10, onProgress) => {
  const results = [];
  for (let i = 0; i < tasks.length; i += concurrency) {
    const batch = tasks.slice(i, i + concurrency);
    const batchResults = await Promise.allSettled(batch.map(fn => fn()));
    results.push(...batchResults);
    if (onProgress) onProgress(Math.min(i + concurrency, tasks.length), tasks.length);
  }
  return results;
};
