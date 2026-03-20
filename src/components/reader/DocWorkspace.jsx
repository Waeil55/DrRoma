/**
 * MARIAM PRO  DocWorkspace
 * PDF canvas + text/image viewer with tab bar, page nav, zoom controls.
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ChevronLeft, ChevronRight, ZoomIn, ZoomOut, Maximize, X, Loader2,
  FileText, Table, Image as ImageIcon, FileCode, FileUp
} from 'lucide-react';
import { FILE_ICON_CONFIG } from '../../utils/fileCategory';
import { getFile } from '../../services/db/fileOps';

const NAV_H = 72;

const ICON_MAP = { FileText, Table, Image: ImageIcon, FileCode, FileUp };

function resolveIcon(cat) {
  const cfg = FILE_ICON_CONFIG[cat] || FILE_ICON_CONFIG.unknown;
  return { ...cfg, Icon: ICON_MAP[cfg.icon] || FileUp };
}

async function loadPdfJs() {
  if (window.pdfjsLib) return window.pdfjsLib;
  await new Promise((res, rej) => {
    const s = document.createElement('script');
    s.src = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js';
    s.onload = res; s.onerror = rej; document.head.appendChild(s);
  });
  window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js';
  return window.pdfjsLib;
}

export default function DocWorkspace({ activeDoc, setDocs, currentPage, setCurrentPage, openDocs, closeTab, setActiveId, docs, onBack }) {
  const [pdf, setPdf] = useState(null);
  const [loading, setLoading] = useState(true);
  const [scale, setScale] = useState(1);
  const [dims, setDims] = useState({ w: 0, h: 0 });
  const [pageText, setPageText] = useState('');
  const [imageData, setImageData] = useState(null);
  const canvasRef = useRef(null); const containerRef = useRef(null);
  const textRef = useRef(null); const renderRef = useRef(null); const pdfRef = useRef(null);
  const renderGenRef = useRef(0);
  const cat = activeDoc?.fileCategory || 'pdf';
  const isPdf = cat === 'pdf';

  useEffect(() => {
    if (!activeDoc?.id) return;
    let mounted = true; setLoading(true); setPdf(null); setPageText(''); setImageData(null);
    if (pdfRef.current) { try { pdfRef.current.destroy(); } catch { } pdfRef.current = null; }
    (async () => {
      try {
        const data = await getFile(activeDoc.id); if (!data || !mounted) return;
        if (isPdf) {
          const pdfjs = await loadPdfJs();
          const loaded = await pdfjs.getDocument({ data: (data.buffer || data).slice(0) }).promise;
          if (mounted) { pdfRef.current = loaded; setPdf(loaded); }
          else { try { loaded.destroy(); } catch { } }
        } else if (cat === 'image') {
          if (mounted && data.imageBase64) setImageData(`data:${data.imageType || 'image/jpeg'};base64,${data.imageBase64}`);
        } else {
          if (mounted && data.pagesText) setPageText(data.pagesText[currentPage] || '');
        }
      } catch (e) { console.error(e); }
      finally { if (mounted) setLoading(false); }
    })();
    return () => { mounted = false; };
  }, [activeDoc?.id, cat]);

  useEffect(() => {
    if (!isPdf || !pdf) return;
    let mounted = true;
    const gen = ++renderGenRef.current;
    (async () => {
      try {
        const page = await pdf.getPage(currentPage);
        const cont = containerRef.current; if (!cont || !mounted) return;
        const tmp = page.getViewport({ scale: 1 });
        const base = cont.clientWidth / tmp.width;
        const final = Math.min(Math.max(base * scale, .5), 5);
        const vp = page.getViewport({ scale: final });
        if (mounted && gen === renderGenRef.current) setDims({ w: vp.width, h: vp.height });
        const canvas = canvasRef.current;
        if (canvas && gen === renderGenRef.current) {
          const pr = window.devicePixelRatio || 1;
          canvas.width = Math.floor(vp.width * pr); canvas.height = Math.floor(vp.height * pr);
          canvas.style.width = `${vp.width}px`; canvas.style.height = `${vp.height}px`;
          if (renderRef.current) renderRef.current.cancel();
          renderRef.current = page.render({ canvasContext: canvas.getContext('2d'), viewport: vp, transform: [pr, 0, 0, pr, 0, 0] });
          await renderRef.current.promise;
        }
        const tl = textRef.current;
        if (tl && mounted && gen === renderGenRef.current) {
          tl.innerHTML = ''; tl.style.setProperty('--scale-factor', vp.scale);
          const tc = await page.getTextContent();
          window.pdfjsLib?.renderTextLayer({ textContentSource: tc, container: tl, viewport: vp, textDivs: [] });
        }
      } catch (e) { if (e?.name !== 'RenderingCancelledException') console.warn(e?.message); }
    })();
    return () => { mounted = false; if (renderRef.current) renderRef.current.cancel(); };
  }, [currentPage, pdf, scale, isPdf]);

  useEffect(() => {
    if (isPdf || cat === 'image' || !activeDoc) return;
    (async () => {
      try { const data = await getFile(activeDoc.id); if (data?.pagesText) setPageText(data.pagesText[currentPage] || ''); }
      catch { }
    })();
  }, [currentPage, isPdf, cat, activeDoc]);

  const nav = useCallback(dir => {
    if (!activeDoc) return;
    const next = Math.max(1, Math.min(activeDoc.totalPages, currentPage + dir));
    if (next !== currentPage) { setCurrentPage(next); setDocs(p => p.map(d => d.id === activeDoc.id ? { ...d, progress: next } : d)); containerRef.current?.scrollTo({ top: 0, behavior: 'smooth' }); }
  }, [currentPage, activeDoc, setCurrentPage, setDocs]);

  useEffect(() => {
    const kd = e => { if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return; if (e.key === 'ArrowLeft') nav(-1); if (e.key === 'ArrowRight') nav(1); };
    document.addEventListener('keydown', kd); return () => document.removeEventListener('keydown', kd);
  }, [nav]);

  if (!activeDoc) return null;
  const cfg = resolveIcon(cat);

  return (
    <div className="flex-1 flex flex-col h-full min-h-0">
      <div className="h-12 glass flex items-center gap-2 px-3 shrink-0 border-t-0 border-x-0">
        <button onClick={onBack} className="w-8 h-8 glass rounded-xl flex items-center justify-center hover:bg-[var(--accent)]/10 shrink-0"><ChevronLeft size={16} /></button>
        <div className={`w-5 h-5 rounded-md bg-gradient-to-br ${cfg.from} ${cfg.to} flex items-center justify-center shrink-0`}>
          <cfg.Icon size={11} className="text-white" />
        </div>
        <span className="font-bold text-xs truncate flex-1 min-w-0">{activeDoc.name}</span>
        {isPdf && (
          <div className="flex items-center gap-1 shrink-0">
            <button onClick={() => setScale(s => Math.max(s - .2, .5))} className="w-7 h-7 glass rounded-lg flex items-center justify-center opacity-60 hover:opacity-100"><ZoomOut size={16} /></button>
            <button onClick={() => setScale(1)} className="w-7 h-7 glass rounded-lg flex items-center justify-center opacity-60 hover:opacity-100"><Maximize size={16} /></button>
            <button onClick={() => setScale(s => Math.min(s + .2, 4))} className="w-7 h-7 glass rounded-lg flex items-center justify-center opacity-60 hover:opacity-100"><ZoomIn size={16} /></button>
          </div>
        )}
      </div>

      {openDocs.length > 1 && (
        <div className="flex gap-1.5 px-3 py-1.5 border-b border-[color:var(--border2,var(--border))] overflow-x-auto custom-scrollbar shrink-0 bg-[var(--surface,var(--card))]">
          {openDocs.map(id => {
            const doc = docs.find(d => d.id === id); if (!doc) return null;
            const dc = resolveIcon(doc.fileCategory || 'pdf');
            return (
              <div key={id} onClick={() => setActiveId(id)}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg cursor-pointer text-xs font-bold shrink-0 transition-colors
                  ${id === activeDoc.id ? 'bg-[var(--accent)] text-white' : 'glass hover:bg-[var(--accent)]/8'}`}>
                <dc.Icon size={10} />
                <span className="truncate max-w-[80px]">{doc.name}</span>
                <button onClick={e => { e.stopPropagation(); closeTab(id); }} className="opacity-60 hover:opacity-100 ml-0.5"><X size={10} /></button>
              </div>
            );
          })}
        </div>
      )}

      <div ref={containerRef} className="flex-1 overflow-auto custom-scrollbar min-h-0 bg-zinc-200 dark:bg-zinc-900">
        {loading ? (
          <div className="flex items-center justify-center h-full gap-3 text-[var(--accent)]">
            <Loader2 size={28} className="animate-spin" /><span className="text-xs font-bold opacity-50">Loading</span>
          </div>
        ) : isPdf && pdf ? (
          <div className="p-2 pb-20 lg:pb-4 flex justify-center">
            <div className="relative bg-white shadow-2xl" style={{ width: dims.w ? `${dims.w}px` : '100%', height: dims.h ? `${dims.h}px` : 'auto' }}>
              <canvas ref={canvasRef} />
              <div ref={textRef} style={{ position: 'absolute', inset: 0, overflow: 'hidden', opacity: 1, lineHeight: 1, userSelect: 'text' }} />
            </div>
          </div>
        ) : cat === 'image' && imageData ? (
          <div className="flex items-center justify-center p-4 pb-20 lg:pb-4 min-h-full">
            <img src={imageData} alt={activeDoc.name} className="max-w-full max-h-[80vh] object-contain rounded-2xl shadow-2xl" />
          </div>
        ) : (
          <div className="p-6 pb-20 lg:pb-6 w-full">
            <div className="bg-[var(--surface,var(--card))] rounded-2xl p-6 shadow-sm border border-[color:var(--border2,var(--border))] min-h-[60vh]">
              <pre className="text-sm leading-relaxed whitespace-pre-wrap font-mono text-[var(--text)] opacity-90 break-words">{pageText || '(No content on this page)'}</pre>
            </div>
          </div>
        )}
      </div>

      <div className="h-14 glass flex items-center justify-center gap-3 shrink-0 border-t border-[color:var(--border2,var(--border))] border-x-0 border-b-0
        fixed bottom-[72px] left-0 right-0 z-[200] lg:relative lg:bottom-auto lg:z-auto"
        style={{ bottom: `calc(${NAV_H}px + env(safe-area-inset-bottom))` }}>
        <button onClick={() => nav(-1)} disabled={currentPage <= 1} className="w-10 h-10 glass rounded-xl flex items-center justify-center disabled:opacity-30 active:scale-95"><ChevronLeft size={18} /></button>
        <div className="px-4 py-2 glass rounded-xl font-mono text-sm font-bold border border-[color:var(--border2,var(--border))] min-w-[90px] text-center">
          <span className="text-[var(--accent)]">{currentPage}</span> / {activeDoc.totalPages}
        </div>
        <button onClick={() => nav(1)} disabled={currentPage >= activeDoc.totalPages}
          className="w-10 h-10 btn-accent rounded-xl flex items-center justify-center disabled:opacity-40 active:scale-95 shadow-md"><ChevronRight size={18} /></button>
      </div>
      <div className="h-14 lg:hidden shrink-0" />
    </div>
  );
}
