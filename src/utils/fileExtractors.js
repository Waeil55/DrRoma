/**
 * MARIAM PRO — File Extraction Utilities
 * Universal file extraction: PDF, Word, Spreadsheet, CSV, Image, Text.
 * Extracted from App.jsx.
 */
import { chunkText } from './chunkText.js';
import { getFileCategory } from './fileCategory.js';

/* ═══════════════════════════════════════════════════════════════════
   CDN SCRIPT LOADER
═══════════════════════════════════════════════════════════════════ */
const loadScript = (src) => new Promise((resolve, reject) => {
  const s = document.createElement('script');
  s.src = src; s.onload = resolve; s.onerror = reject;
  document.body.appendChild(s);
});

const PDF_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174';

const loadPdfJs = async () => {
  if (window.pdfjsLib) return window.pdfjsLib;
  const maxRetries = 2;
  let lastErr;
  for (let attempt = 1; attempt <= maxRetries + 1; attempt++) {
    try {
      await new Promise((resolve, reject) => {
        const sc = document.createElement('script');
        sc.src = `${PDF_CDN}/pdf.min.js`;
        sc.onload = () => {
          if (!window.pdfjsLib) return reject(new Error('PDF.js loaded but pdfjsLib global not found.'));
          window.pdfjsLib.GlobalWorkerOptions.workerSrc = `${PDF_CDN}/pdf.worker.min.js`;
          resolve();
        };
        sc.onerror = () => reject(new Error(`Network error loading PDF.js`));
        document.body.appendChild(sc);
      });
      return window.pdfjsLib;
    } catch (err) {
      lastErr = err;
      if (attempt <= maxRetries) await new Promise(r => setTimeout(r, 1000 * attempt));
      if (window.pdfjsLib) return window.pdfjsLib;
    }
  }
  throw new Error(`Could not load PDF renderer. Check your internet. (${lastErr?.message})`);
};

const loadMammoth = async () => {
  if (window.mammoth) return window.mammoth;
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js');
  return window.mammoth;
};

const loadXLSX = async () => {
  if (window.XLSX) return window.XLSX;
  await loadScript('https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js');
  return window.XLSX;
};

/* ═══════════════════════════════════════════════════════════════════
   EXTRACTORS
═══════════════════════════════════════════════════════════════════ */

export const extractPdf = async (file, onProgress) => {
  const ab = await file.arrayBuffer();
  const pdfjs = await loadPdfJs();
  const pdf = await pdfjs.getDocument({ data: ab.slice(0) }).promise;
  const tot = pdf.numPages;
  const pagesText = {};
  for (let i = 1; i <= tot; i++) {
    try {
      const pg = await pdf.getPage(i);
      const tc = await pg.getTextContent();
      pagesText[i] = tc.items.map(s => s.str).join(' ');
      pg.cleanup();
    } catch { pagesText[i] = ''; }
    if (i % 5 === 0) await new Promise(r => setTimeout(r, 0));
    if (onProgress) onProgress(i / tot);
  }
  try { await pdf.destroy(); } catch { }
  return { buffer: ab, pagesText, totalPages: tot, fileCategory: 'pdf' };
};

export const extractWord = async (file) => {
  const ab = await file.arrayBuffer();
  let text = '';
  try {
    const mammoth = await loadMammoth();
    const r = await mammoth.extractRawText({ arrayBuffer: ab });
    text = r.value || '';
  } catch (e) { text = `Could not extract Word content: ${e.message}`; }
  const { pagesText, totalPages } = chunkText(text);
  return { pagesText, totalPages, rawText: text, fileCategory: 'word' };
};

export const extractSpreadsheet = async (file) => {
  const ab = await file.arrayBuffer();
  let text = '';
  try {
    const XLSX = await loadXLSX();
    const wb = XLSX.read(new Uint8Array(ab), { type: 'array' });
    const parts = wb.SheetNames.map(name => {
      const ws = wb.Sheets[name];
      const csv = XLSX.utils.sheet_to_csv(ws, { skipHidden: true });
      return `=== Sheet: ${name} ===\n${csv}`;
    });
    text = parts.join('\n\n');
  } catch (e) { text = `Spreadsheet parse error: ${e.message}`; }
  const { pagesText, totalPages } = chunkText(text);
  return { pagesText, totalPages, rawText: text, fileCategory: 'spreadsheet' };
};

export const extractCsv = async (file) => {
  const text = await file.text();
  const { pagesText, totalPages } = chunkText(text);
  return { pagesText, totalPages, rawText: text, fileCategory: 'csv' };
};

export const extractImage = async (file) => {
  return new Promise((res, rej) => {
    const reader = new FileReader();
    reader.onload = e => {
      const b64 = e.target.result.split(',')[1];
      const pagesText = { 1: `[IMAGE FILE: ${file.name}]\nSize: ${(file.size / 1024).toFixed(1)}KB\nType: ${file.type}\n\nThis is an image file. Use the AI Vision feature to analyze its content.` };
      res({ pagesText, totalPages: 1, imageBase64: b64, imageType: file.type || 'image/jpeg', fileCategory: 'image' });
    };
    reader.onerror = rej;
    reader.readAsDataURL(file);
  });
};

export const extractText = async (file) => {
  let text = '';
  try { text = await file.text(); }
  catch (e) { text = `Could not read file: ${e.message}`; }
  const { pagesText, totalPages } = chunkText(text);
  return { pagesText, totalPages, rawText: text, fileCategory: 'text' };
};

/**
 * Universal entry point: detects file type and routes to correct extractor.
 */
export const extractUniversal = async (file, onProgress) => {
  const cat = getFileCategory(file);
  switch (cat) {
    case 'pdf': return extractPdf(file, onProgress);
    case 'word': return extractWord(file);
    case 'spreadsheet': return extractSpreadsheet(file);
    case 'csv': return extractCsv(file);
    case 'image': return extractImage(file);
    default: return extractText(file);
  }
};
