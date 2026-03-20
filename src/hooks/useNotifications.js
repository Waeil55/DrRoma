/**
 * MARIAM PRO  useNotifications Hook
 * Wraps NotificationService for React components.
 */
import { useCallback, useEffect } from 'react';
import { NotificationService } from '../services/notifications/notificationService.js';
import { useNotificationStore } from '../store/useNotificationStore.js';

let _svc = null;
function getSvc() { if (!_svc) _svc = new NotificationService(); return _svc; }

export function useNotifications() {
  const { notifications, unreadCount, addNotification, markRead, markAllRead, clearAll } = useNotificationStore();

  useEffect(() => {
    // Request permission on mount (best-effort)
    if ('Notification' in window && Notification.permission === 'default') {
      Notification.requestPermission().catch(() => {});
    }
  }, []);

  const show = useCallback((title, body, opts = {}) => {
    const svc = getSvc();
    svc.show(title, body, opts);
    addNotification({ title, body, type: opts.type || 'info', timestamp: Date.now() });
  }, [addNotification]);

  const schedule = useCallback((title, body, delayMs, opts = {}) => {
    const svc = getSvc();
    svc.schedule(title, body, delayMs, opts);
  }, []);

  return { notifications, unreadCount, show, schedule, markRead, markAllRead, clearAll };
}
