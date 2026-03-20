/**
 * MARIAM PRO  useDB Hook
 * Provides IndexedDB operations as React-friendly functions.
 */
import { useCallback } from 'react';
import { saveFile, getFile, delFile } from '../services/db/fileOps.js';
import { saveState, getState } from '../services/db/stateOps.js';

export function useDB() {
  const save = useCallback((id, data) => saveFile(id, data), []);
  const load = useCallback((id) => getFile(id), []);
  const remove = useCallback((id) => delFile(id), []);
  const saveAppState = useCallback((key, val) => saveState(key, val), []);
  const loadAppState = useCallback((key) => getState(key), []);

  return { saveFile: save, getFile: load, delFile: remove, saveState: saveAppState, getState: loadAppState };
}
