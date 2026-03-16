/**
 * MARIAM PRO — PdfRenderer
 * Canvas-based PDF page renderer with proper cleanup to prevent memory leaks.
 * Uses PDF.js loaded via CDN (window.pdfjsLib).
 */
import React, { useRef, useEffect, memo } from 'react';

function PdfRenderer({ pdfDoc, pageNumber, scale = 1.5 }) {
  const canvasRef = useRef(null);
  const renderTaskRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !pdfDoc) return;

    let cancelled = false;

    // Cancel any in-progress render
    if (renderTaskRef.current) {
      renderTaskRef.current.cancel();
      renderTaskRef.current = null;
    }

    (async () => {
      try {
        const page = await pdfDoc.getPage(pageNumber);
        if (cancelled) return;

        const viewport = page.getViewport({ scale });
        canvas.width = viewport.width;
        canvas.height = viewport.height;

        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        const task = page.render({ canvasContext: ctx, viewport });
        renderTaskRef.current = task;

        await task.promise;
        if (!cancelled) page.cleanup();
      } catch (err) {
        if (err?.name === 'RenderingCancelledException') return;
        console.error('[PdfRenderer]', err);
      }
    })();

    return () => {
      cancelled = true;
      if (renderTaskRef.current) {
        renderTaskRef.current.cancel();
        renderTaskRef.current = null;
      }
      const ctx = canvas.getContext('2d');
      ctx?.clearRect(0, 0, canvas.width, canvas.height);
    };
  }, [pdfDoc, pageNumber, scale]);

  return (
    <canvas
      ref={canvasRef}
      style={{ width: '100%', height: 'auto', display: 'block' }}
    />
  );
}

export default memo(PdfRenderer);
