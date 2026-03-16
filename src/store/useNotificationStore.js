/**
 * MARIAM PRO — Notification Store
 */
import { createStore } from './createStore.js';

export const useNotificationStore = createStore({
  notifications: [],
  unreadCount: 0,
  permission: typeof Notification !== 'undefined' ? Notification.permission : 'default',

  addNotification: (notification) => {
    const s = useNotificationStore.getState();
    useNotificationStore.setState({
      notifications: [
        { id: Date.now(), read: false, timestamp: Date.now(), ...notification },
        ...s.notifications,
      ].slice(0, 100),
      unreadCount: s.unreadCount + 1,
    });
  },

  markRead: (id) => {
    const s = useNotificationStore.getState();
    useNotificationStore.setState({
      notifications: s.notifications.map(n => n.id === id ? { ...n, read: true } : n),
      unreadCount: Math.max(0, s.unreadCount - 1),
    });
  },

  markAllRead: () => {
    const s = useNotificationStore.getState();
    useNotificationStore.setState({
      notifications: s.notifications.map(n => ({ ...n, read: true })),
      unreadCount: 0,
    });
  },

  clearAll: () => useNotificationStore.setState({ notifications: [], unreadCount: 0 }),

  setPermission: (permission) => useNotificationStore.setState({ permission }),
});
