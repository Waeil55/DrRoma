// Add mobile AI Tutor to flashcard, exam study screens using line-based insertion
const fs = require('fs');
const path = require('path');
const f = path.join(__dirname, 'src', 'App.jsx');
const lines = fs.readFileSync(f, 'utf8').split('\n');

// Helper: insert lines after a line containing a pattern
function insertAfter(pattern, newLines, startFrom = 0) {
  const idx = lines.findIndex((l, i) => i >= startFrom && l.includes(pattern));
  if (idx === -1) { console.log('NOT FOUND:', pattern); return idx; }
  lines.splice(idx + 1, 0, ...newLines);
  console.log('Inserted after line', idx + 1, ':', pattern.substring(0, 60));
  return idx;
}

// ── 1. Add mobileTutorOpen state to FlashcardsView ─────────────────────────
// Find the filterDocId state line in FlashcardsView (first occurrence)
const fcStateIdx = lines.findIndex((l, i) => i > 2800 && i < 2900 && l.includes("filterDocId, setFilterDocId] = useState('all')"));
if (fcStateIdx !== -1) {
  lines.splice(fcStateIdx + 1, 0, "  const [mobileTutorOpen, setMobileTutorOpen] = useState(false);");
  console.log('FC mobileTutorOpen state added at line', fcStateIdx + 1);
}

// ── 2. Find closing </div> of the flashcard study screen (the 2-panel row + outer div) ─
// Looking for the specific pattern: the </div> right before the "return (" of the list screen
const fcStudyEndIdx = lines.findIndex((l, i) =>
  i > 2980 && i < 3080 &&
  l.trim() === '</div>' &&
  lines[i + 1]?.trim() === ')' &&
  lines[i + 2]?.trim() === '}' &&
  lines[i + 3]?.trim() === ''
);

if (fcStudyEndIdx !== -1) {
  const mobileDelay = [
    '',
    "        {/* MOBILE: floating Tutor FAB */}",
    "        <button onClick={() => setMobileTutorOpen(true)}",
    "          className=\"lg:hidden fixed bottom-24 right-4 z-40 w-14 h-14 rounded-2xl btn-accent shadow-2xl flex items-center justify-center\"",
    "          title=\"AI Tutor\"><MessageSquare size={22} /></button>",
    '',
    "        {/* MOBILE: Tutor bottom-sheet */}",
    "        {mobileTutorOpen && (",
    "          <div className=\"lg:hidden fixed inset-0 z-50 flex flex-col justify-end\" style={{background:'rgba(0,0,0,0.55)'}}",
    "            onClick={e => e.target===e.currentTarget && setMobileTutorOpen(false)}>",
    "            <div className=\"glass rounded-t-3xl flex flex-col\" style={{height:'72vh',boxShadow:'0 -8px 40px rgba(0,0,0,.3)'}}>",
    "              <div className=\"flex items-center justify-between px-5 py-3 border-b border-[color:var(--border2,var(--border))]\">",
    "                <span className=\"font-black text-sm flex items-center gap-2\"><MessageSquare size={16} className=\"text-[var(--accent)]\" />AI Tutor</span>",
    "                <button onClick={() => setMobileTutorOpen(false)} className=\"w-8 h-8 glass rounded-xl flex items-center justify-center\"><X size={16} /></button>",
    "              </div>",
    "              <div className=\"flex-1 min-h-0 overflow-hidden\">",
    "                <AiTutorPanel settings={settings} context={tutorCtx} onClose={() => setMobileTutorOpen(false)} alwaysOpen={true} width={window.innerWidth} />",
    "              </div>",
    "            </div>",
    "          </div>",
    "        )}",
  ];
  lines.splice(fcStudyEndIdx, 0, ...mobileDelay);
  console.log('FC mobile tutor inserted before line', fcStudyEndIdx);
} else {
  console.log('FC study end NOT found, trying fallback...');
  // Fallback: find after the drag handle hidden div closing
  const idx2 = lines.findIndex((l, i) => i > 2970 && i < 3070 && l.includes('lg:flex flex-col border-l') && l.includes('AiTutorPanel'));
  console.log('Fallback idx2:', idx2);
}

// ── 3. Add mobileTutorOpen to ExamsView ─────────────────────────────────────
const exStateIdx = lines.findIndex((l, i) =>
  i > 3100 && i < 3200 &&
  l.includes("sortMode, setSortMode] = useState('newest')")
);
if (exStateIdx !== -1) {
  lines.splice(exStateIdx + 1, 0, "  const [examMobileOpen, setExamMobileOpen] = useState(false);");
  console.log('Exam state added at', exStateIdx + 1);
}

// ── 4. Add mobile tutor FAB + sheet in exam study view ──────────────────────
// Find the exam AI tutor panel line (hidden lg:flex)
const exTutorLine = lines.findIndex((l, i) =>
  i > 3200 && i < 3450 &&
  l.includes('hidden lg:flex flex-col') &&
  l.includes('AiTutorPanel')
);
if (exTutorLine !== -1) {
  const examMobile = [
    "          {/* MOBILE: floating Tutor FAB */}",
    "          <button onClick={() => setExamMobileOpen(true)}",
    "            className=\"lg:hidden fixed bottom-24 right-4 z-40 w-14 h-14 rounded-2xl btn-accent shadow-2xl flex items-center justify-center\"",
    "            title=\"AI Tutor\"><MessageSquare size={22} /></button>",
    "          {examMobileOpen && (() => {",
    "            const eq = selEx?.questions?.[qi];",
    "            const ec = `Exam: ${selEx?.title}\\nQ${qi+1}: ${eq?.q}\\nOptions: ${eq?.options?.join(' | ')}\\nCorrect: ${eq?.options?.[eq?.correct]}`;",
    "            return (",
    "              <div className=\"lg:hidden fixed inset-0 z-50 flex flex-col justify-end\" style={{background:'rgba(0,0,0,0.55)'}}",
    "                onClick={e => e.target===e.currentTarget && setExamMobileOpen(false)}>",
    "                <div className=\"glass rounded-t-3xl flex flex-col\" style={{height:'72vh',boxShadow:'0 -8px 40px rgba(0,0,0,.3)'}}>",
    "                  <div className=\"flex items-center justify-between px-5 py-3 border-b border-[color:var(--border2,var(--border))]\">",
    "                    <span className=\"font-black text-sm flex items-center gap-2\"><MessageSquare size={16} className=\"text-[var(--accent)]\" />AI Tutor</span>",
    "                    <button onClick={() => setExamMobileOpen(false)} className=\"w-8 h-8 glass rounded-xl flex items-center justify-center\"><X size={16} /></button>",
    "                  </div>",
    "                  <div className=\"flex-1 min-h-0 overflow-hidden\">",
    "                    <AiTutorPanel settings={settings} context={ec} onClose={() => setExamMobileOpen(false)} alwaysOpen={true} width={window.innerWidth} />",
    "                  </div>",
    "                </div>",
    "              </div>",
    "            );",
    "          })()}",
  ];
  lines.splice(exTutorLine, 0, ...examMobile);
  console.log('Exam mobile tutor inserted before line', exTutorLine);
} else {
  console.log('Exam tutor panel line NOT found');
}

fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('Done. Total lines:', lines.length);
