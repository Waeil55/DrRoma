/**
 * MARIAM PRO  FSRS-5 Spaced Repetition Engine
 *
 * Full FSRS-5 algorithm with 17-weight parameter set.
 * Based on the open paper: https://github.com/open-spaced-repetition/fsrs4anki
 *
 * Grades: 1 = Again, 2 = Hard, 3 = Good, 4 = Easy
 */

/** Default 17-weight parameter set (FSRS-5 reference) */
export const DEFAULT_W = [
  0.4072, 1.1829, 3.1262, 15.4722, 7.2102,
  0.5316, 1.0651, 0.0589, 1.5330,  0.1544,
  1.0040, 1.9395, 0.1100, 0.2900,  2.2700,
  0.1500, 2.9898,
];

const DECAY    = -0.5;
const FACTOR   = 19 / 81;        // (0.9)^(1/DECAY)  1 rearranged constant
const MIN_S    = 0.1;            // minimum stability in days
const MAX_DAYS = 36500;          // 100 years hard cap

/**
 * Initialise a brand-new card.
 * @returns {{ stability: number, difficulty: number, due: Date, reps: number, lapses: number, state: string }}
 */
export function initCard() {
  return {
    stability:  MIN_S,
    difficulty: 5,
    due:        new Date(),
    reps:       0,
    lapses:     0,
    state:      'new',   // 'new' | 'learning' | 'review' | 'relearning'
    lastReview: null,
  };
}

/** Retrievability given elapsed days and stability. */
export function retrievability(elapsedDays, stability) {
  return Math.pow(1 + FACTOR * (elapsedDays / stability), DECAY);
}

/** Initial stability after first rating. */
function initStability(grade, W = DEFAULT_W) {
  return Math.max(MIN_S, W[grade - 1]);
}

/** Initial difficulty after first rating. */
function initDifficulty(grade, W = DEFAULT_W) {
  return clamp(W[4] - Math.exp(W[5] * (grade - 1)) + 1, 1, 10);
}

/** Next difficulty D' given current D and grade. */
function nextDifficulty(D, grade, W = DEFAULT_W) {
  const delta = -W[6] * (grade - 3);
  return clamp(
    D + delta * (10 - D) / 9,
    1, 10
  );
}

/** Short-term stability after a successful review. */
function nextStabilityRecall(D, S, R, grade, W = DEFAULT_W) {
  const hardPenalty  = grade === 2 ? W[15] : 1;
  const easyBonus    = grade === 4 ? W[16] : 1;
  return S * (
    Math.exp(W[8]) *
    (11 - D) *
    Math.pow(S, -W[9]) *
    (Math.exp((1 - R) * W[10]) - 1) *
    hardPenalty *
    easyBonus
  ) + S;
}

/** Short-term stability after a lapse. */
function nextStabilityForget(D, S, R, W = DEFAULT_W) {
  return W[11] *
    Math.pow(D, -W[12]) *
    (Math.pow(S + 1, W[13]) - 1) *
    Math.exp((1 - R) * W[14]);
}

/** Desired retention  interval mapping. */
function intervalFromStability(S, requestedRetention = 0.9) {
  return Math.min(
    Math.max(1, Math.round(S * (Math.pow(requestedRetention, 1 / DECAY) - 1) / FACTOR)),
    MAX_DAYS,
  );
}

function clamp(v, lo, hi) { return Math.min(hi, Math.max(lo, v)); }

/**
 * Schedule the next review after a rating.
 *
 * @param {object} card     - Card state from initCard() or previous scheduleCard()
 * @param {1|2|3|4} grade   - 1=Again, 2=Hard, 3=Good, 4=Easy
 * @param {object} [opts]   - { retention: 0.9, W: [...17 weights] }
 * @returns {object}        - Updated card state
 */
export function scheduleCard(card, grade, opts = {}) {
  const { retention = 0.9, W = DEFAULT_W } = opts;
  const now = new Date();

  const elapsedDays = card.lastReview
    ? Math.max(0, (now - new Date(card.lastReview)) / 86400000)
    : 0;

  let { stability, difficulty, reps, lapses, state } = card;

  if (state === 'new') {
    stability  = initStability(grade, W);
    difficulty = initDifficulty(grade, W);
    state      = grade === 1 ? 'learning' : 'review';
  } else {
    const R = retrievability(elapsedDays, stability);
    if (grade === 1) {
      lapses    += 1;
      stability  = Math.max(MIN_S, nextStabilityForget(difficulty, stability, R, W));
      state      = 'relearning';
    } else {
      stability  = Math.max(MIN_S, nextStabilityRecall(difficulty, stability, R, grade, W));
      difficulty = nextDifficulty(difficulty, grade, W);
      state      = 'review';
    }
  }
  reps += 1;

  const interval = state === 'review'
    ? intervalFromStability(stability, retention)
    : 1;  // learning / relearning  review same day or next day

  const due = new Date(now.getTime() + interval * 86400000);

  return { ...card, stability, difficulty, reps, lapses, state, lastReview: now, due, interval };
}

/**
 * Get all cards due now from an array of card objects.
 * @param {object[]} cards
 * @param {Date} [now]
 * @returns {object[]}
 */
export function getDueCards(cards, now = new Date()) {
  return cards.filter(c => !c.due || new Date(c.due) <= now);
}

/**
 * Calculate projected workload for the next N days.
 * @param {object[]} cards
 * @param {number}   days
 * @returns {number[]}  array of counts per day
 */
export function forecastWorkload(cards, days = 30) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const counts = Array(days).fill(0);
  for (const c of cards) {
    if (!c.due) { counts[0]++; continue; }
    const diff = Math.round((new Date(c.due) - today) / 86400000);
    if (diff >= 0 && diff < days) counts[diff]++;
  }
  return counts;
}

/**
 * Predict overall retention score across all cards.
 * Returns mean retrievability  100 (0100 scale).
 * @param {object[]} cards
 * @param {Date}     [now]
 * @returns {number}
 */
export function predictedScore(cards, now = new Date()) {
  if (!cards || cards.length === 0) return 0;
  let sum = 0;
  for (const c of cards) {
    if (!c.lastReview || !c.stability) { sum += 0; continue; }
    const t = Math.max(0, (now - new Date(c.lastReview)) / 86400000);
    sum += retrievability(t, c.stability);
  }
  return Math.round((sum / cards.length) * 100);
}

export default { DEFAULT_W, initCard, scheduleCard, getDueCards, forecastWorkload, retrievability, predictedScore };
