/**
 * MARIAM PRO  NotificationService
 * Wraps the Web Notifications API and schedules study reminders.
 * All 6 notification types supported.
 */

export const NOTIFICATION_TYPES = {
  STUDY_REMINDER:  'study_reminder',
  REVIEW_DUE:      'review_due',
  STREAK_ALERT:    'streak_alert',
  ACHIEVEMENT:     'achievement',
  EXAM_COUNTDOWN:  'exam_countdown',
  DAILY_GOAL:      'daily_goal',
};

const ICONS = {
  study_reminder: '',
  review_due:     '',
  streak_alert:   '',
  achievement:    '',
  exam_countdown: '',
  daily_goal:     '',
};

class NotificationService {
  constructor() {
    this._permitted  = false;
    this._timers     = {};  // type  setTimeout id
    this._swReg      = null;
    this._checkPermission();
  }

  _checkPermission() {
    if (!('Notification' in window)) return;
    this._permitted = Notification.permission === 'granted';
  }

  /** Request permission  call from a user gesture. */
  async requestPermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') {
      this._permitted = true;
      return true;
    }
    if (Notification.permission === 'denied') return false;

    const result = await Notification.requestPermission();
    this._permitted = result === 'granted';
    return this._permitted;
  }

  get isPermitted() { return this._permitted; }

  /**
   * Show a notification immediately.
   * @param {string} type   - NOTIFICATION_TYPES value
   * @param {object} params - { title, body, tag, data, actions }
   */
  async show(type, params = {}) {
    if (!this._permitted) return;

    const icon = ICONS[type] || '';
    const title = params.title || this._defaultTitle(type);
    const body  = params.body  || '';

    const options = {
      body,
      tag:     params.tag  || type,
      icon:    params.icon || undefined,
      badge:   params.badge|| undefined,
      data:    params.data || {},
      silent:  false,
      vibrate: [150, 75, 150],
    };

    if (this._swReg?.showNotification) {
      // Prefer service-worker notification (works when tab is hidden)
      await this._swReg.showNotification(`${icon} ${title}`, options);
    } else {
      const n = new Notification(`${icon} ${title}`, options);
      if (params.onClick) {
        n.onclick = params.onClick;
      }
    }
  }

  _defaultTitle(type) {
    const titles = {
      study_reminder: 'Time to Study!',
      review_due:     'Cards Due for Review',
      streak_alert:   "Don't Break Your Streak!",
      achievement:    'Achievement Unlocked',
      exam_countdown: 'Exam Countdown',
      daily_goal:     'Daily Goal Pending',
    };
    return titles[type] || 'Mariam Pro';
  }

  /**
   * Schedule a one-time notification.
   * @param {string} type
   * @param {number} delayMs
   * @param {object} params
   */
  schedule(type, delayMs, params = {}) {
    this._cancel(type);
    this._timers[type] = setTimeout(() => {
      this.show(type, params);
      delete this._timers[type];
    }, delayMs);
  }

  /** Schedule daily study reminder at a fixed local time. */
  scheduleDailyReminder(hour = 19, minute = 0, params = {}) {
    const now    = new Date();
    const target = new Date();
    target.setHours(hour, minute, 0, 0);
    if (target <= now) target.setDate(target.getDate() + 1);

    const delay = target - now;
    this.schedule(NOTIFICATION_TYPES.STUDY_REMINDER, delay, {
      title: 'Daily Study Reminder',
      body:  params.body || 'You have flashcards due. Keep your streak going! ',
      ...params,
    });
  }

  /** Cancel a scheduled notification by type. */
  _cancel(type) {
    if (this._timers[type]) {
      clearTimeout(this._timers[type]);
      delete this._timers[type];
    }
  }

  cancelAll() {
    Object.keys(this._timers).forEach(t => this._cancel(t));
  }

  /** Register a service worker registration for background notifications. */
  setServiceWorker(reg) {
    this._swReg = reg;
  }

  /** Helper: ms until a given HH:MM time today (rolls to tomorrow if past). */
  _msUntil(timeStr) {
    const [h, m] = timeStr.split(':').map(Number);
    const target = new Date();
    target.setHours(h, m, 0, 0);
    if (target <= new Date()) target.setDate(target.getDate() + 1);
    return target - Date.now();
  }

  /** Schedule FSRS reminders for all decks with due cards. */
  scheduleFSRSReminders(allDecks = []) {
    for (const deck of allDecks) {
      const dueCards = (deck.cards || []).filter(c => c.nextReview && c.nextReview <= Date.now() + 86400000);
      if (dueCards.length > 0) {
        const delay = this._msUntil('09:00');
        this.schedule(`review_${deck.id}`, delay, {
          title: ` ${dueCards.length} cards due  ${deck.title || 'Flashcards'}`,
          body: 'Keep your streak alive! Review now to maximize retention.',
          data: { view: 'flashcards', deckId: deck.id },
        });
      }
    }
  }

  /** Schedule exam reminders: 24h before + 1h before. */
  scheduleExamReminder(examTitle, examDate) {
    const now = Date.now();
    const dayBefore = examDate - 86400000;
    const hourBefore = examDate - 3600000;

    if (dayBefore > now) {
      this.schedule(`exam_24h_${examTitle}`, dayBefore - now, {
        title: ` Exam tomorrow: ${examTitle}`,
        body: 'Get a good night\'s sleep and review your weak spots.',
        data: { view: 'exams' },
      });
    }
    if (hourBefore > now) {
      this.schedule(`exam_1h_${examTitle}`, hourBefore - now, {
        title: ` Exam in 1 hour: ${examTitle}`,
        body: 'Last-minute review: focus on high-yield topics.',
        data: { view: 'exams' },
      });
    }
  }

  /** Schedule a streak-at-risk alert at 9PM. */
  scheduleStreakAlert(streakDays) {
    const now = new Date();
    if (now.getHours() >= 21) return; // too late
    const delay = this._msUntil('21:00');
    this.schedule(NOTIFICATION_TYPES.STREAK_ALERT, delay, {
      title: ` ${streakDays}-day streak at risk!`,
      body: 'Study for just 5 minutes to keep your streak alive.',
      data: { view: 'flashcards', requireInteraction: true },
    });
  }
}

//  Singleton export 
let _instance = null;

export function getNotificationService() {
  if (!_instance && typeof window !== 'undefined') {
    _instance = new NotificationService();
  }
  return _instance;
}

export { NOTIFICATION_TYPES, ICONS };
export default NotificationService;
