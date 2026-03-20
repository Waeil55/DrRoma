/**
 * MARIAM PRO  Generic IndexedDB Operation Wrapper
 * Full error handling with Safari/iOS hardening.
 */
import { openDB } from './openDB.js';

/**
 * Generic database operation wrapper.
 * Uses async/await internally; always rejects with a descriptive Error.
 */
export const dbOp = async (store, mode, op) => {
  let db;
  try {
    db = await openDB();
  } catch (err) {
    if (err.name === 'QuotaExceededError') {
      throw new Error('Storage quota exceeded. Please clear some data in Settings.');
    }
    if (err.name === 'SecurityError') {
      throw new Error('Storage is blocked (Private Browsing mode or restricted permissions).');
    }
    throw new Error(`Database failed to open: ${err.message}`);
  }

  return new Promise((resolve, reject) => {
    let tx;
    try {
      tx = db.transaction(store, mode);
    } catch (err) {
      db.close();
      if (err.name === 'InvalidStateError') {
        reject(new Error('Database connection was closed unexpectedly. Refreshing...'));
        setTimeout(() => window.location.reload(), 2000);
        return;
      }
      reject(err);
      return;
    }

    const objectStore = tx.objectStore(store);
    let result;

    try {
      const request = op(objectStore);
      if (request && typeof request.onsuccess !== 'undefined') {
        request.onsuccess = () => { result = request.result; };
        request.onerror = () => reject(new Error(`IDB request error in '${store}': ${request.error?.message}`));
      }
    } catch (err) {
      db.close();
      return reject(err);
    }

    tx.oncomplete = () => {
      db.close();
      resolve(result);
    };
    tx.onerror = () => {
      const msg = tx.error?.message || '';
      db.close();
      if (msg.includes('QuotaExceededError')) {
        reject(new Error('Storage full. Delete unused documents in the Library.'));
      } else {
        reject(new Error(`IDB transaction failed (${store}): ${msg}`));
      }
    };
    tx.onabort = () => {
      db.close();
      reject(new Error(`IDB transaction aborted (${store}). This may be a Safari private mode restriction.`));
    };
  });
};
