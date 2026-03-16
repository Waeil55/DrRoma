/**
 * MARIAM PRO — FSRS scheduling facade
 * Wraps the FSRS-5 engine into the FSRS object expected by views.
 */
import { scheduleCard as fsrs5Schedule, DEFAULT_W as FSRS5_W } from '../services/analytics/fsrsEngine';

const W = [0.4072, 1.1829, 3.1262, 15.4722, 7.2102, 0.5316, 1.0651, 0.0589, 1.5330, 0.1544, 1.0070, 1.9813, 0.0953, 0.2975, 2.2042, 0.2407, 2.9466, 0.5034, 0.6567];
const DECAY = -0.5;
const FACTOR = 19 / 81;
const R_TARGET = 0.9;

const initStability = (g) => Math.max(0.1, [W[0], W[1], W[2], W[3]][Math.min(g, 3)]);
const initDifficulty = (g) => Math.min(10, Math.max(1, W[4] - Math.exp(W[5] * (g - 1)) + 1));

const retrievability = (t, s) => Math.pow(1 + FACTOR * t / s, DECAY);

export const FSRS = {
  W, DECAY, FACTOR, R_TARGET, initStability, initDifficulty, retrievability,

  nextInterval(s, r = null) {
    const targetR = r ?? R_TARGET;
    const i = (s / FACTOR) * (Math.pow(targetR, 1 / DECAY) - 1);
    return Math.max(1, Math.round(i));
  },

  /** grade: 0=Again, 1=Hard, 2=Good, 3=Easy */
  schedule(card, grade) {
    const fsrsGrade = Math.min(4, Math.max(1, grade + 1));
    const fsrsCard = {
      stability: card.stability || 0,
      difficulty: card.difficulty || 5,
      due: card.nextReview ? new Date(card.nextReview) : new Date(),
      reps: card.reps || 0,
      lapses: card.lapses || 0,
      state: card.stability ? (card.lapses > 0 ? 'relearning' : 'review') : 'new',
      lastReview: card.lastReview ? new Date(card.lastReview) : null,
    };
    const result = fsrs5Schedule(fsrsCard, fsrsGrade, { W: FSRS5_W });
    return {
      ...card,
      stability: result.stability,
      difficulty: result.difficulty,
      lastReview: result.lastReview ? result.lastReview.getTime() : Date.now(),
      nextReview: result.due ? result.due.getTime() : Date.now() + 86400000,
      interval: result.interval || 1,
      retrievability: retrievability(0, result.stability),
      reps: result.reps,
      lapses: result.lapses,
    };
  },

  predictedScore(cards) {
    if (!cards?.length) return 0;
    const now = Date.now();
    const scores = cards.map(c => {
      if (!c.stability) return 0;
      const days = Math.max(0, (now - (c.lastReview || now)) / 86400000);
      return retrievability(days, c.stability) * 100;
    });
    return Math.round(scores.reduce((a, b) => a + b, 0) / scores.length);
  },

  masteryLevel(card) {
    if (!card.stability) return 'new';
    if (card.stability >= 30) return 'mastered';
    if (card.stability >= 10) return 'learning';
    if (card.lapses > 2) return 'struggling';
    return 'reviewing';
  },
};

export default FSRS;
