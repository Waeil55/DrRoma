/**
 * MARIAM PRO  IndexedDB Migration Logic
 * All version-specific migration code isolated here.
 * Imported & executed by openDB.js during onupgradeneeded.
 */

/**
 * Run all necessary migrations from oldVersion to current.
 * @param {IDBDatabase} db
 * @param {number} oldV - previous schema version
 */
export function runMigrations(db, oldV) {
  // v1: initial stores
  if (oldV < 1) {
    if (!db.objectStoreNames.contains('files'))    db.createObjectStore('files');
    if (!db.objectStoreNames.contains('appState')) db.createObjectStore('appState');
  }

  // v2-v9: ensure stores exist (safe creates)
  if (oldV >= 1 && oldV < 9) {
    if (!db.objectStoreNames.contains('files'))    db.createObjectStore('files');
    if (!db.objectStoreNames.contains('appState')) db.createObjectStore('appState');
  }

  // v10: tasks, notifications, analytics
  if (oldV < 10) {
    if (!db.objectStoreNames.contains('tasks'))         db.createObjectStore('tasks',         { keyPath: 'id' });
    if (!db.objectStoreNames.contains('notifications')) db.createObjectStore('notifications', { keyPath: 'id' });
    if (!db.objectStoreNames.contains('analytics'))     db.createObjectStore('analytics',     { keyPath: 'date' });
  }
}
