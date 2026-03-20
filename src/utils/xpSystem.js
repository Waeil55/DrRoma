/**
 * MARIAM PRO — XP & Levels System (Prompt2.md Part E §6)
 * Centralised XP logic shared by FlashcardsView, ExamsView, DashboardView, AchievementsView.
 * Uses localStorage so XP persists without requiring IndexedDB access.
 */

export const XP_TABLE = {
  card_studied: 5,    card_mastered: 25,
  exam_correct: 10,   exam_completed: 50,
  case_solved: 75,    daily_goal: 100,
  streak_day: 20,     streak_7: 200,
  streak_30: 500,     streak_100: 2000,
  file_uploaded: 30,  achievement_unlocked: 150,
};

export const LEVELS = [
  { n: 1,  title: 'Pre-Med',         xp: 0 },
  { n: 5,  title: 'Medical Student', xp: 1000 },
  { n: 10, title: 'Clinical Intern', xp: 5000 },
  { n: 15, title: 'Junior Resident', xp: 15000 },
  { n: 20, title: 'Senior Resident', xp: 40000 },
  { n: 25, title: 'Fellow',          xp: 100000 },
  { n: 30, title: 'Attending',       xp: 250000 },
  { n: 35, title: 'Chief of Staff',  xp: 500000 },
  { n: 40, title: 'Professor',       xp: 1000000 },
];

export const VARIABLE_REWARD_INSIGHTS = [
  ' Students who review mechanisms (not just names) score 23% higher on pharma questions.',
  ' You\'re in the top 12% of students who studied today.',
  ' The forgetting curve says 70% forgotten in 24h — FSRS just scheduled the perfect review.',
  ' Spaced repetition is proven to outperform cramming by 200%.',
  ' Each card you review strengthens the neural pathway for long-term retention.',
  ' Average passing USMLE student studied 847 hours of flashcards. Keep going!',
];

/** Returns the current LEVELS entry for the given XP amount. */
export const getXPLevel = (xp) => [...LEVELS].reverse().find(l => xp >= l.xp) || LEVELS[0];

/** Returns XP to next named level, or 0 if at max. */
export const getXPToNext = (xp) => {
  const cur = getXPLevel(xp);
  const idx = LEVELS.indexOf(cur);
  return idx < LEVELS.length - 1 ? LEVELS[idx + 1].xp - xp : 0;
};

/** Returns progress percentage within current level band (0-100). */
export const getLevelPct = (xp) => {
  const cur = getXPLevel(xp);
  const idx = LEVELS.indexOf(cur);
  if (idx >= LEVELS.length - 1) return 100;
  const next = LEVELS[idx + 1];
  const band = next.xp - cur.xp;
  return Math.round(((xp - cur.xp) / band) * 100);
};

/** Read total XP from localStorage. */
export const getTotalXP = () => {
  try { return parseInt(localStorage.getItem('mariam_total_xp') || '0', 10); } catch { return 0; }
};

/**
 * Award XP and persist to localStorage.
 * @param {number} amount
 * @returns {number} new total XP
 */
export const awardXP = (amount) => {
  try {
    const prev = getTotalXP();
    const next = prev + amount;
    localStorage.setItem('mariam_total_xp', String(next));
    return next;
  } catch { return amount; }
};

/**
 * Increment card-rated counter and return whether an insight should show.
 * @returns {string|null} insight string if 40% chance on 10th multiple, else null
 */
export const checkVariableReward = () => {
  try {
    const count = parseInt(localStorage.getItem('mariam_cards_rated') || '0', 10) + 1;
    localStorage.setItem('mariam_cards_rated', String(count));
    if (count % 10 === 0 && Math.random() < 0.4) {
      return VARIABLE_REWARD_INSIGHTS[Math.floor(Math.random() * VARIABLE_REWARD_INSIGHTS.length)];
    }
  } catch {}
  return null;
};
