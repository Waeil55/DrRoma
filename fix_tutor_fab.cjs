const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const tutorFabCode = (stateVar, setterFunc, ctxStr) => `
      {/* GLOBAL DESKTOP & MOBILE AI TUTOR */}
      {createPortal(
        <>
          <button onClick={() => ${setterFunc}(true)}
            className="fixed w-14 h-14 rounded-[22px] btn-accent shadow-2xl flex items-center justify-center transition-transform hover:scale-105 active:scale-90"
            style={{ bottom: 'calc(90px + env(safe-area-inset-bottom))', right: 24, zIndex: 9000 }} title="AI Tutor">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z"></path></svg>
          </button>
          
          {${stateVar} && (
            <div className="fixed inset-0 z-[99999] flex flex-col justify-end lg:justify-start lg:flex-row backdrop-blur-sm" style={{ background: 'rgba(0,0,0,0.55)' }} onClick={e => e.target === e.currentTarget && ${setterFunc}(false)}>
              {/* Mobile bottom sheet */}
              <div className="flex lg:hidden glass rounded-t-[32px] flex-col overflow-hidden w-full" style={{ height: '85%', boxShadow: '0 -10px 50px rgba(0,0,0,0.4)', animation: 'slide-up 0.3s ease-out forwards' }} onClick={e => e.stopPropagation()}>
                <AiTutorPanel settings={settings} context="${ctxStr}" onClose={() => ${setterFunc}(false)} width={window.innerWidth} />
              </div>
              {/* Desktop side panel */}
              <div className="hidden lg:flex bg-[var(--surface,var(--card))] border-l border-[var(--border)] flex-col overflow-hidden" style={{ width: 400, boxShadow: '-10px 0 50px rgba(0,0,0,0.4)', animation: 'slide-in 0.3s ease-out forwards' }} onClick={e => e.stopPropagation()}>
                <AiTutorPanel settings={settings} context="${ctxStr}" onClose={() => ${setterFunc}(false)} width={400} alwaysOpen={true} />
              </div>
            </div>
          )}
        </>, document.body
      )}
`;

// FlashcardsView injection
content = content.replace(/(\s*)(<\/div>\s*<\/div>\s*);\s*\n\}\s*\n\/\*\s*?[=]+[ \n]*EXAMS VIEW/i, (match, prefix, divs) => {
    return prefix + tutorFabCode('mobileTutorOpen', 'setMobileTutorOpen', 'Flashcards Overview') + prefix + divs + ';\n}\n/* ═══════════════════════════════════════════════════════════════════\n   EXAMS VIEW';
});

// ExamsView injection (search for CASES VIEW as anchor)
content = content.replace(/(\s*)(<\/div>\s*<\/div>\s*);\s*\n\}\s*\n\/\*\s*?[=]+[ \n]*CASES VIEW/i, (match, prefix, divs) => {
    return prefix + tutorFabCode('examMobileOpen', 'setExamMobileOpen', 'Exams Overview') + prefix + divs + ';\n}\n/* ═══════════════════════════════════════════════════════════════════\n   CASES VIEW';
});

// CasesView injection (search for CHAT VIEW as anchor)
content = content.replace(/(\s*)(<\/div>\s*<\/div>\s*);\s*\n\}\s*\n\/\*\s*?[=]+[ \n]*CHAT VIEW/i, (match, prefix, divs) => {
    return prefix + tutorFabCode('casesMobileTutorOpen', 'setCasesMobileTutorOpen', 'Cases Overview') + prefix + divs + ';\n}\n/* ═══════════════════════════════════════════════════════════════════\n   CHAT VIEW';
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Injected global AI Tutor FABs to Flashcards, Exams, and Cases views.');
