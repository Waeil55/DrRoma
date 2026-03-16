/**
 * MARIAM PRO — Study Analytics (module-level)
 * Stored on window so it survives React lifecycle / view switches.
 */

if (!window.__MARIAM_ANALYTICS__) {
  window.__MARIAM_ANALYTICS__ = {
    sessions: [], streak: 0, lastStudy: null, totalCards: 0, totalExams: 0, scores: []
  };
}

export const ANALYTICS = window.__MARIAM_ANALYTICS__;

export const trackStudy = (type, score, total) => {
  const today = new Date().toDateString();
  if (ANALYTICS.lastStudy !== today) {
    ANALYTICS.streak = (ANALYTICS.lastStudy === new Date(Date.now() - 86400000).toDateString()) ? ANALYTICS.streak + 1 : 1;
    ANALYTICS.lastStudy = today;
  }
  if (type === 'flashcard') ANALYTICS.totalCards++;
  if (type === 'exam' && score !== undefined) ANALYTICS.scores.push({ date: Date.now(), score, total, pct: Math.round(score / total * 100) });
  ANALYTICS.sessions.push({ type, date: Date.now() });
  if (ANALYTICS.sessions.length > 500) ANALYTICS.sessions = ANALYTICS.sessions.slice(-500);
};
