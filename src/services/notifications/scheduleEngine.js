/**
 * MARIAM PRO  Schedule Engine
 * FSRS-driven review scheduling + exam/task/streak notification triggers.
 * Wired to the NotificationService and FSRS engine.
 */
import { NotificationService, NOTIFICATION_TYPES } from './notificationService.js';
import { getDueCards } from '../analytics/fsrsEngine.js';

const notifier = new NotificationService();

/** Milliseconds until a given "HH:MM" time today (or tomorrow if already passed). */
function _msUntil(timeStr) {
  const [h, m] = timeStr.split(':').map(Number);
  const target = new Date();
  target.setHours(h, m, 0, 0);
  if (target <= new Date()) target.setDate(target.getDate() + 1);
  return target - Date.now();
}

/**
 * Schedule FSRS review reminders for all decks with due cards.
 * Fires at 9:00 AM.
 * @param {Array<{id:string, title:string, cards:object[]}>} allDecks
 */
export function scheduleFSRSReminders(allDecks) {
  for (const deck of allDecks) {
    const due = getDueCards(deck.cards || []);
    if (due.length > 0) {
      notifier.schedule(NOTIFICATION_TYPES.REVIEW_DUE, _msUntil('09:00'), {
        title: ` ${due.length} cards due  ${deck.title}`,
        body: 'Keep your streak alive! Review now to maximize retention.',
        data: { view: 'flashcards', deckId: deck.id },
      });
    }
  }
}

/**
 * Schedule exam countdown reminders (24h and 1h before).
 * @param {string} examTitle
 * @param {Date|number} examDate
 */
export function scheduleExamReminder(examTitle, examDate) {
  const examMs = typeof examDate === 'number' ? examDate : examDate.getTime();
  const now = Date.now();
  const dayBefore = examMs - 86400000 - now;
  const hourBefore = examMs - 3600000 - now;

  if (dayBefore > 0) {
    notifier.schedule(NOTIFICATION_TYPES.EXAM_COUNTDOWN, dayBefore, {
      title: ` Exam tomorrow: ${examTitle}`,
      body: 'Get a good night\'s sleep! You\'ve prepared well.',
    });
  }
  if (hourBefore > 0) {
    notifier.schedule(NOTIFICATION_TYPES.EXAM_COUNTDOWN, hourBefore, {
      title: ` Exam in 1 hour: ${examTitle}`,
      body: 'Last-minute review? You\'ve got this!',
    });
  }
}

/**
 * Schedule streak-at-risk alert at 9:00 PM.
 * @param {number} streakDays
 */
export function scheduleStreakAlert(streakDays) {
  const now = new Date();
  if (now.getHours() >= 21) return; // already past 9PM
  notifier.schedule(NOTIFICATION_TYPES.STREAK_ALERT, _msUntil('21:00'), {
    title: ` ${streakDays}-day streak at risk!`,
    body: 'Study for just 5 minutes to keep your streak alive.',
    data: { view: 'flashcards', requireInteraction: true },
  });
}

/**
 * Schedule all 6 notification types based on current app state.
 * @param {object} state - { decks, streakDays, dailyGoalMet, exams }
 */
export function scheduleAllNotifications(state = {}) {
  const { decks = [], streakDays = 0, dailyGoalMet = false, exams = [] } = state;

  // Type 1: Cards Due Today
  scheduleFSRSReminders(decks);

  // Type 2: Streak at Risk
  if (streakDays > 0) {
    scheduleStreakAlert(streakDays);
  }

  // Type 3: Exam Reminders
  for (const exam of exams) {
    if (exam.date) scheduleExamReminder(exam.title, exam.date);
  }

  // Type 4: Task Due Soon  handled per-task in TaskStore

  // Type 5: Weekly Report  schedule for Sunday
  const now = new Date();
  if (now.getDay() === 0) {
    notifier.schedule('weekly_report', _msUntil('10:00'), {
      title: ' Weekly Study Report',
      body: 'Check out your progress this week!',
      data: { view: 'analytics' },
    });
  }

  // Type 6: Daily Study Goal
  if (!dailyGoalMet) {
    notifier.schedule(NOTIFICATION_TYPES.DAILY_GOAL, _msUntil('20:00'), {
      title: ' Daily Study Goal',
      body: 'You haven\'t met your daily goal yet. A few minutes can make a difference!',
      data: { view: 'flashcards' },
    });
  }
}

export { notifier };
