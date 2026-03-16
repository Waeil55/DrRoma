/**
 * MARIAM PRO — Background Tasks
 * Module-level task registry that survives React lifecycle and page navigation.
 * Uses window.__MARIAM_BG__ so ongoing fetch chains are never killed.
 */
import { useState, useEffect } from 'react';
import { callAI } from '../services/ai/callAI';
import { getFile } from '../services/db/fileOps';
import { parseJson, runParallel } from './formatters';

/* ── Registry ── */
if (!window.__MARIAM_BG__) window.__MARIAM_BG__ = { tasks: {}, listeners: new Set() };
const BG = window.__MARIAM_BG__;
const bgEmit = () => BG.listeners.forEach(fn => fn({ ...BG.tasks }));

export const bgStart  = (id, meta)   => { BG.tasks[id] = { ...meta, startedAt: Date.now(), status: 'running' }; bgEmit(); };
export const bgUpdate = (id, patch)  => { if (BG.tasks[id]) { BG.tasks[id] = { ...BG.tasks[id], ...patch }; bgEmit(); } };
export const bgFinish = (id, result) => { if (BG.tasks[id]) { BG.tasks[id] = { ...BG.tasks[id], status: 'done', result, finishedAt: Date.now() }; bgEmit(); } };
export const bgFail   = (id, err)    => { if (BG.tasks[id]) { BG.tasks[id] = { ...BG.tasks[id], status: 'error', error: err }; bgEmit(); } };
export const bgClear  = (id)         => { delete BG.tasks[id]; bgEmit(); };

/** React hook — returns live snapshot of all BG tasks */
export function useBgTasks() {
  const [tasks, setTasks] = useState({ ...BG.tasks });
  useEffect(() => {
    const fn = t => setTasks({ ...t });
    BG.listeners.add(fn);
    return () => BG.listeners.delete(fn);
  }, []);
  return tasks;
}

const MEDICINE_RULE = `\n\nMEDICINE RULE — MANDATORY: For every medication/drug mentioned in any question, answer, explanation, or vignette, ALWAYS write the brand name first followed by generic name in parentheses. Format: "BrandName (generic)" e.g. "Lasix (furosemide)", "Tylenol (acetaminophen)", "Glucophage (metformin)". Apply this rule to EVERY drug in EVERY item.`;

function makePrompt(taskType, docName, startPage, endPage, fullText, difficultyLevel, bc) {
  const base = `DOCUMENT: "${docName}" | Pages ${startPage}-${endPage}\n\nDOCUMENT CONTENT (generate ONLY from this):\n${fullText}\n\nDIFFICULTY: ${difficultyLevel}${MEDICINE_RULE}\n\n`;
  if (taskType === 'flashcards') return `${base}YOU MUST generate EXACTLY ${bc} flashcards — no more, no fewer. Count carefully before responding. Use ONLY topics from the document above. Each question must be a complete, multi-sentence clinical/academic question. Answers must be comprehensive (3-5 sentences). RETURN JSON ONLY — the "items" array MUST contain EXACTLY ${bc} objects: {"items":[{"q":"detailed question","a":"comprehensive answer","evidence":"exact quote","sourcePage":1}]}`;
  if (taskType === 'exam') return `${base}YOU MUST generate EXACTLY ${bc} MCQ questions — no more, no fewer. Count carefully before responding. Use ONLY content from the document. Each stem must be 2-4 sentences. All 4 options must be plausible. Explanation must be 3-5 sentences. RETURN JSON ONLY — the "items" array MUST contain EXACTLY ${bc} objects: {"items":[{"q":"detailed question stem","options":["A. option","B. option","C. option","D. option"],"correct":0,"explanation":"thorough explanation","evidence":"exact quote","sourcePage":1}]}`;
  if (taskType === 'cases') return `${base}YOU MUST generate EXACTLY ${bc} clinical cases — no more, no fewer. Count carefully. Use ONLY document content. Each case needs: vignette (8-12 sentences with demographics/HPI/PMH/meds/vitals/exam), 3 lab panels (12+ total rows), examQuestion with 5 options (A-E). RETURN JSON ONLY — the "items" array MUST contain EXACTLY ${bc} objects: {"items":[{"vignette":"8-12 sentence case","title":"title","diagnosis":"diagnosis","labPanels":[{"panelName":"COMPLETE BLOOD COUNT","rows":[{"test":"WBC","result":"value","flag":"H","range":"4.5-11.0","units":"K/uL"},{"test":"Hgb","result":"value","flag":"","range":"12-16","units":"g/dL"},{"test":"Hct","result":"value","flag":"","range":"36-46","units":"%"},{"test":"Platelets","result":"value","flag":"","range":"150-400","units":"K/uL"},{"test":"MCV","result":"value","flag":"","range":"80-100","units":"fL"}]},{"panelName":"BASIC METABOLIC PANEL","rows":[{"test":"Sodium","result":"value","flag":"","range":"135-145","units":"mEq/L"},{"test":"Potassium","result":"value","flag":"","range":"3.5-5.0","units":"mEq/L"},{"test":"Creatinine","result":"value","flag":"","range":"0.6-1.2","units":"mg/dL"},{"test":"BUN","result":"value","flag":"","range":"7-20","units":"mg/dL"},{"test":"Glucose","result":"value","flag":"","range":"70-100","units":"mg/dL"}]},{"panelName":"DISEASE-SPECIFIC PANEL","rows":[{"test":"test1","result":"value","flag":"H","range":"ref","units":"u"},{"test":"test2","result":"value","flag":"L","range":"ref","units":"u"},{"test":"test3","result":"value","flag":"","range":"ref","units":"u"},{"test":"test4","result":"value","flag":"","range":"ref","units":"u"}]}],"examQuestion":{"q":"2-3 sentence question","options":["A) opt","B) opt","C) opt","D) opt","E) opt"],"correct":0,"explanation":"4-6 sentence explanation"}}]}`;
  return `${base}Analyze this content comprehensively using only the document provided.`;
}

/**
 * Run a generation task fully in the background.
 * Stores progress in the BG registry so it persists regardless of view.
 */
export const runBgGeneration = async ({ taskId, docId, docName, taskType, startPage, endPage, count, difficultyLevel, settings, onSave }) => {
  const batchSize = 40;
  const isBatch = count > batchSize && ['flashcards', 'exam', 'cases'].includes(taskType);
  const numBatches = isBatch ? Math.ceil(count / batchSize) : 1;

  bgStart(taskId, { type: taskType, docName, msg: 'Loading document…', done: 0, total: numBatches });

  try {
    const fileData = await getFile(docId);
    if (!fileData) throw new Error('Document not found in storage.');

    const pageRange = Array.from({ length: endPage - startPage + 1 }, (_, i) => startPage + i);
    const textChunks = pageRange.map(p => (fileData.pagesText?.[p] || '')).filter(Boolean);
    const fullText = textChunks.join('\n\n').substring(0, 80000);

    if (!fullText.trim()) throw new Error('No text could be extracted from the selected page range.');

    bgUpdate(taskId, { msg: 'Generating…', done: 0, total: numBatches });

    const isJson = ['flashcards', 'exam', 'cases'].includes(taskType);
    const tasks = Array.from({ length: numBatches }, (_, i) => {
      const bc = i === numBatches - 1 ? (count % batchSize === 0 ? batchSize : count % batchSize) : batchSize;
      return () => callAI(makePrompt(taskType, docName, startPage, endPage, fullText, difficultyLevel, bc), isJson, false, settings, 8000);
    });

    let all = [];
    const results = await runParallel(tasks, 50, (done, total) => {
      bgUpdate(taskId, { done, total, msg: `${done}/${total} batches complete…` });
    });

    for (const r of results) {
      if (r.status === 'fulfilled') {
        try {
          const p = parseJson(r.value);
          all = [...all, ...(p.items || p.cases || p.questions || p.flashcards || [])];
        } catch (e) { console.warn('BG parse err:', e.message); }
      }
    }
    if (!all.length) throw new Error('AI returned no parseable data. Try again with a different page range.');

    const finalData = all.slice(0, count);
    bgFinish(taskId, { type: taskType, data: finalData, pages: `${startPage}-${endPage}`, docName, count: finalData.length });
    if (onSave) onSave(finalData, taskId);
  } catch (e) {
    bgFail(taskId, e.message || String(e));
  }
};
