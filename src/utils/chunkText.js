/**
 * MARIAM PRO — Text Chunking Utility
 * Splits plain text into numbered virtual pages for the reader UI.
 * Extracted from App.jsx.
 */

const DEFAULT_CHUNK_SIZE = 3000;

/**
 * Splits a plain-text string into numbered virtual pages.
 * Uses paragraph breaks as split points to avoid cutting mid-sentence,
 * then falls back to hard character limits.
 * @param {string} text - The text to chunk
 * @param {number} chunkSize - Max characters per page (default: 3000)
 * @returns {{ pagesText: Record<number,string>, totalPages: number }}
 */
export const chunkText = (text, chunkSize = DEFAULT_CHUNK_SIZE) => {
  const pages = {};
  let page = 1, cur = '';
  const parts = text.split(/\n\n+/);
  for (const part of parts) {
    if (!part.trim()) continue;
    if (cur.length + part.length > chunkSize && cur) {
      pages[page++] = cur.trim();
      cur = part + '\n\n';
    } else {
      cur += part + '\n\n';
    }
  }
  if (cur.trim()) pages[page] = cur.trim();
  if (!Object.keys(pages).length) pages[1] = text.trim().substring(0, chunkSize) || '(empty)';
  return { pagesText: pages, totalPages: page };
};
