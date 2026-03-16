/**
 * MARIAM PRO — Export to PDF utility
 * Dynamically loads jsPDF from CDN and generates styled PDFs.
 */
import { loadScript } from './config';

const JSPDF_CDN = 'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js';
const loadJsPDF = () => loadScript(JSPDF_CDN, 'jspdf');

/**
 * Exports flashcards/exam/cases data to a styled PDF.
 * @param {string} type - 'flashcards' | 'exam' | 'cases'
 * @param {Array} data - The items to export
 * @param {string} title - Title for the PDF
 * @param {Function} addToast - Toast notification callback
 */
export const exportToPDF = async (type, data, title, addToast) => {
  try {
    const lib = await loadJsPDF();
    const jsPDF = lib.jspdf?.jsPDF || lib.jsPDF || window.jspdf?.jsPDF;
    if (!jsPDF) throw new Error('jsPDF failed to load.');
    const doc = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const pageW = 210, pageH = 297, margin = 15, colW = pageW - margin * 2;
    let y = margin;

    const checkPage = (needed = 12) => { if (y + needed > pageH - margin) { doc.addPage(); y = margin; } };
    const drawLine = () => { doc.setDrawColor(200, 200, 200); doc.line(margin, y, pageW - margin, y); y += 4; };

    doc.setFillColor(99, 102, 241); doc.rect(0, 0, pageW, 18, 'F');
    doc.setTextColor(255, 255, 255); doc.setFontSize(14); doc.setFont('helvetica', 'bold');
    doc.text('MARIAM PRO', margin, 11);
    doc.setFontSize(9); doc.setFont('helvetica', 'normal');
    doc.text(`${type.toUpperCase()} · ${title}`, margin + 40, 11);
    doc.text(`Generated ${new Date().toLocaleDateString()}`, pageW - margin - 35, 11);
    y = 24;
    doc.setTextColor(30, 30, 30);

    if (type === 'flashcards') {
      data.forEach((card, i) => {
        checkPage(28);
        doc.setFillColor(248, 250, 252); doc.roundedRect(margin, y, colW, 24, 2, 2, 'F');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9); doc.setTextColor(99, 102, 241);
        doc.text(`Q${i + 1}`, margin + 3, y + 6);
        doc.setTextColor(30, 30, 30); doc.setFont('helvetica', 'normal'); doc.setFontSize(9);
        const qLines = doc.splitTextToSize(card.q || '', colW - 12);
        doc.text(qLines, margin + 10, y + 6);
        const qH = Math.min(qLines.length * 4.5, 14);
        doc.setFillColor(238, 240, 255); doc.roundedRect(margin + 2, y + qH + 2, colW - 4, 10, 1, 1, 'F');
        doc.setTextColor(79, 70, 229); doc.setFontSize(8.5);
        const aLines = doc.splitTextToSize(card.a || '', colW - 10);
        doc.text(aLines.slice(0, 2), margin + 5, y + qH + 7);
        y += 28; doc.setTextColor(30, 30, 30);
      });
    } else if (type === 'exam') {
      data.forEach((q, i) => {
        const opts = q.options || [];
        const needed = 22 + opts.length * 7 + (q.explanation ? 12 : 0);
        checkPage(needed);
        doc.setFont('helvetica', 'bold'); doc.setFontSize(9.5); doc.setTextColor(30, 30, 30);
        const qLines = doc.splitTextToSize(`Q${i + 1}. ${q.q || q.question || ''}`, colW);
        doc.text(qLines, margin, y); y += qLines.length * 5 + 3;
        opts.forEach((opt, oi) => {
          const isCorrect = oi === q.correct;
          if (isCorrect) { doc.setFillColor(220, 252, 231); doc.roundedRect(margin, y - 3.5, colW, 6.5, 1, 1, 'F'); }
          doc.setFont('helvetica', isCorrect ? 'bold' : 'normal');
          doc.setFontSize(8.5);
          doc.setTextColor(isCorrect ? 22 : 80, isCorrect ? 163 : 80, isCorrect ? 74 : 80);
          doc.text(`${String.fromCharCode(65 + oi)}. ${opt}`, margin + 3, y);
          if (isCorrect) { doc.setTextColor(22, 163, 74); doc.text('✓', pageW - margin - 5, y); }
          y += 6.5;
        });
        if (q.explanation) {
          checkPage(12);
          doc.setFillColor(254, 252, 232); doc.roundedRect(margin, y, colW, 10, 1, 1, 'F');
          doc.setFont('helvetica', 'italic'); doc.setFontSize(7.5); doc.setTextColor(120, 100, 20);
          const expLines = doc.splitTextToSize(q.explanation, colW - 6);
          doc.text(expLines.slice(0, 2), margin + 3, y + 4); y += 12;
        }
        drawLine(); y += 2;
        doc.setTextColor(30, 30, 30);
      });
    } else if (type === 'cases') {
      data.forEach((cas, i) => {
        checkPage(40);
        const q = cas.examQuestion || cas;
        doc.setFillColor(240, 249, 255); doc.roundedRect(margin, y, colW, 8, 2, 2, 'F');
        doc.setFont('helvetica', 'bold'); doc.setFontSize(10); doc.setTextColor(14, 116, 144);
        doc.text(`Case ${i + 1}: ${cas.title || 'Clinical Case'}`, margin + 3, y + 5.5); y += 11;
        doc.setFont('helvetica', 'normal'); doc.setFontSize(8.5); doc.setTextColor(30, 30, 30);
        const vigLines = doc.splitTextToSize(cas.vignette || '', colW);
        doc.text(vigLines.slice(0, 6), margin, y); y += Math.min(vigLines.length, 6) * 4.5 + 5;
        if (cas.diagnosis) {
          doc.setFont('helvetica', 'bold'); doc.setFontSize(8.5); doc.setTextColor(16, 185, 129);
          doc.text(`Dx: ${cas.diagnosis}`, margin, y); y += 6;
        }
        const opts = q.options || [];
        opts.forEach((opt, oi) => {
          const isCorrect = oi === q.correct;
          doc.setFont('helvetica', isCorrect ? 'bold' : 'normal'); doc.setFontSize(8.5);
          doc.setTextColor(isCorrect ? 22 : 80, isCorrect ? 163 : 80, isCorrect ? 74 : 80);
          doc.text(`${String.fromCharCode(65 + oi)}. ${opt}`, margin + 3, y); y += 6;
        });
        drawLine(); y += 3; doc.setTextColor(30, 30, 30);
      });
    }

    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i); doc.setFontSize(7); doc.setTextColor(160, 160, 160);
      doc.text(`MARIAM PRO · ${title}`, margin, pageH - 6);
      doc.text(`Page ${i} of ${totalPages}`, pageW - margin - 18, pageH - 6);
    }

    doc.save(`${title.replace(/[^a-zA-Z0-9]/g, '_')}_${type}.pdf`);
    if (addToast) addToast('PDF exported! 📄', 'success');
  } catch (e) {
    console.error('PDF export error:', e);
    if (addToast) addToast(`PDF export failed: ${e.message}`, 'error');
  }
};

/**
 * Exports text content as a downloadable file.
 * @param {string} content - Text content
 * @param {string} filename - Download filename
 * @param {string} mimeType - MIME type (default: text/plain)
 */
export const exportAsFile = (content, filename, mimeType = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
};
