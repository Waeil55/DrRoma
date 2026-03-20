/**
 * MARIAM PRO  File Operations (IndexedDB 'files' store)
 */
import { dbOp } from './dbOp.js';

export const saveFile = (id, data) => dbOp('files', 'readwrite', s => { s.put(data, id); });
export const getFile  = id          => dbOp('files', 'readonly',  s => s.get(id));
export const delFile  = id          => dbOp('files', 'readwrite', s => { s.delete(id); });
