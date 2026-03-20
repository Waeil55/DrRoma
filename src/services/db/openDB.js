/**
 * MARIAM PRO  IndexedDB Open + Migration
 * Centralised database opener with versioned migration strategy.
 */

const DB_NAME    = 'MariamProDB_v70';
const DB_VERSION = 10;

const logError = (context, err) => {
  console.error(`[MariamPro][${context}]`, err?.message || err);
};

/**
 * Opens (or upgrades) the IndexedDB database.
 * onupgradeneeded handles ALL schema migrations in version order.
 */
export const openDB = () => new Promise((resolve, reject) => {
  if (!window.indexedDB) {
    return reject(new Error('IndexedDB is not supported in this browser.'));
  }
  const request = indexedDB.open(DB_NAME, DB_VERSION);

  request.onupgradeneeded = event => {
    const db = event.target.result;
    const oldV = event.oldVersion;

    if (oldV < 1) {
      if (!db.objectStoreNames.contains('files'))    db.createObjectStore('files');
      if (!db.objectStoreNames.contains('appState')) db.createObjectStore('appState');
    }
    if (oldV >= 1 && oldV < 9) {
      if (!db.objectStoreNames.contains('files'))    db.createObjectStore('files');
      if (!db.objectStoreNames.contains('appState')) db.createObjectStore('appState');
    }
    // v10: new stores for tasks, notifications, analytics
    if (oldV < 10) {
      if (!db.objectStoreNames.contains('tasks'))         db.createObjectStore('tasks',         { keyPath: 'id' });
      if (!db.objectStoreNames.contains('notifications')) db.createObjectStore('notifications', { keyPath: 'id' });
      if (!db.objectStoreNames.contains('analytics'))     db.createObjectStore('analytics',     { keyPath: 'date' });
    }
  };

  request.onsuccess = () => resolve(request.result);
  request.onerror = () => {
    const err = request.error;
    if (err?.name === 'QuotaExceededError') {
      reject(new Error('Storage quota exceeded. Please clear some data in Settings.'));
    } else if (err?.name === 'SecurityError') {
      reject(new Error('Storage is blocked (Private Browsing mode or restricted permissions).'));
    } else {
      const msg = `Failed to open IndexedDB: ${err?.message || 'unknown error'}`;
      logError('openDB', msg);
      reject(new Error(msg));
    }
  };
  request.onblocked = () => {
    logError('openDB', 'Database upgrade blocked  close other tabs running this app.');
  };
});

export { DB_NAME, DB_VERSION };
