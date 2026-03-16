/**
 * MARIAM PRO — App State Operations (IndexedDB 'appState' store)
 */
import { dbOp } from './dbOp.js';

export const saveState = (key, val) => dbOp('appState', 'readwrite', s => { s.put(val, key); });
export const getState  = key         => dbOp('appState', 'readonly',  s => s.get(key));
