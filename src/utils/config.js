/**
 * MARIAM PRO  Application Configuration
 * Centralised constants for the entire app.
 */

export const CONFIG = {
  DB_NAME: 'MariamProDB_v70',
  DB_VERSION: 10,
  CHUNK: 3000,
  RETRY_ATTEMPTS: 2,
  PDF_CDN: 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174',
  JSPDF_CDN: 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
  MAX_FILE_SIZE: 100 * 1024 * 1024, // 100 MB
  MAX_CHAT_HISTORY: 50,
  TYPING_SPEED: 12,
  CONCURRENT_BATCH: 10,
};

/** Dynamically load a script from CDN, returning the global it exposes. */
export const loadScript = async (src, globalName) => {
  if (window[globalName]) return window[globalName];
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = src;
    s.onload = () => resolve(window[globalName]);
    s.onerror = () => reject(new Error(`Failed to load ${src}`));
    document.head.appendChild(s);
  });
};
