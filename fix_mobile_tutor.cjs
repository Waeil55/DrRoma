// Add mobile AI Tutor bottom sheet to flashcard, exam, and cases study views
const fs = require('fs');
const path = require('path');

const f = path.join(__dirname, 'src', 'App.jsx');
let c = fs.readFileSync(f, 'utf8');

// ── 1. Add mobileTutor state to FlashcardsView ──────────────────────
const old1 = `  const [selSet, setSelSet] = useState(null); const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false); const [mode, setMode] = useState('browse');
  const [showModal, setShowModal] = useState(false);
  const [exporting, setExporting] = useState(null);
  const [filterDocId, setFilterDocId] = useState('all');`;
const new1 = `  const [selSet, setSelSet] = useState(null); const [idx, setIdx] = useState(0);
  const [flipped, setFlipped] = useState(false); const [mode, setMode] = useState('browse');
  const [showModal, setShowModal] = useState(false);
  const [exporting, setExporting] = useState(null);
  const [filterDocId, setFilterDocId] = useState('all');
  const [mobileTutorOpen, setMobileTutorOpen] = useState(false);`;
c = c.replace(old1, new1);
console.log('FC state added:', c.includes('mobileTutorOpen'));

// ── 2. Add mobile Tutor overlay in the flashcard study return (after the two-panel row closing div) ──
const old2 = `        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar scroll-content" style={{ touchAction: "pan-y", WebkitOverflowScrolling: "touch" }}>
      {showModal && <QuickGenerateModal`;
const new2 = `        </div>

        {/* MOBILE: floating Tutor button (lg:hidden) */}
        <button onClick={() => setMobileTutorOpen(true)}
          className="lg:hidden fixed bottom-24 right-4 z-40 w-14 h-14 rounded-2xl btn-accent shadow-2xl flex items-center justify-center"
          title="AI Tutor">
          <MessageSquare size={22} />
        </button>

        {/* MOBILE: Tutor bottom sheet */}
        {mobileTutorOpen && (
          <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.5)' }}
            onClick={e => e.target === e.currentTarget && setMobileTutorOpen(false)}>
            <div className="glass rounded-t-3xl flex flex-col" style={{ height: '72vh', boxShadow: '0 -8px 40px rgba(0,0,0,.25)' }}>
              <div className="flex items-center justify-between px-5 py-3 border-b border-[color:var(--border2,var(--border))]">
                <span className="font-black text-sm flex items-center gap-2"><MessageSquare size={16} className="text-[var(--accent)]" /> AI Tutor</span>
                <button onClick={() => setMobileTutorOpen(false)} className="w-8 h-8 glass rounded-xl flex items-center justify-center"><X size={16} /></button>
              </div>
              <div className="flex-1 min-h-0 overflow-hidden">
                <AiTutorPanel settings={settings} context={tutorCtx} onClose={() => setMobileTutorOpen(false)} alwaysOpen={true} width={window.innerWidth} />
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex-1 min-h-0 overflow-y-auto custom-scrollbar scroll-content" style={{ touchAction: "pan-y", WebkitOverflowScrolling: "touch" }}>
      {showModal && <QuickGenerateModal`;
c = c.replace(old2, new2);
console.log('FC mobile tutor added:', c.includes('MOBILE: Tutor bottom sheet'));

// ── 3. Add mobile Tutor to ExamsView (find the exam study screen return) ──
// Find the exam study screen - it has the top bar with Exit and the submit button
// We add mobileTutorOpen state to ExamsView
const old3 = `  const [selEx, setSelEx] = useState(null); const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState(null); const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null); const [answers, setAnswers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filterDocId, setFilterDocId] = useState('all');
  const [sortMode, setSortMode] = useState('newest');`;
const new3 = `  const [selEx, setSelEx] = useState(null); const [qi, setQi] = useState(0);
  const [selected, setSelected] = useState(null); const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(null); const [answers, setAnswers] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [reviewMode, setReviewMode] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [filterDocId, setFilterDocId] = useState('all');
  const [sortMode, setSortMode] = useState('newest');
  const [examMobileTutorOpen, setExamMobileTutorOpen] = useState(false);`;
c = c.replace(old3, new3);
console.log('Exam state added:', c.includes('examMobileTutorOpen'));

// ── 4. Inject mobile tutor button into exam study view (after the exam two-panel closing </div>) ──
// Find the closing of the exam study view's two-panel section
const examPanelEnd = `    </div>
    );
  }

  const handleExamExport`;
const examPanelWithMobile = `
        {/* MOBILE: floating Tutor button */}
        {selEx && (
          <button onClick={() => setExamMobileTutorOpen(true)}
            className="lg:hidden fixed bottom-24 right-4 z-40 w-14 h-14 rounded-2xl btn-accent shadow-2xl flex items-center justify-center"
            title="AI Tutor">
            <MessageSquare size={22} />
          </button>
        )}
        {/* MOBILE: Tutor bottom sheet */}
        {examMobileTutorOpen && selEx && (() => {
          const q = selEx.questions[qi];
          const examCtx = \`Exam: \${selEx.title}\\nQ\${qi+1}: \${q?.q}\\nOptions: \${q?.options?.join(' | ')}\\nCorrect: \${q?.options?.[q?.correct]}\`;
          return (
            <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end" style={{ background: 'rgba(0,0,0,0.5)' }}
              onClick={e => e.target === e.currentTarget && setExamMobileTutorOpen(false)}>
              <div className="glass rounded-t-3xl flex flex-col" style={{ height: '72vh', boxShadow: '0 -8px 40px rgba(0,0,0,.25)' }}>
                <div className="flex items-center justify-between px-5 py-3 border-b border-[color:var(--border2,var(--border))]">
                  <span className="font-black text-sm flex items-center gap-2"><MessageSquare size={16} className="text-[var(--accent)]" /> AI Tutor</span>
                  <button onClick={() => setExamMobileTutorOpen(false)} className="w-8 h-8 glass rounded-xl flex items-center justify-center"><X size={16} /></button>
                </div>
                <div className="flex-1 min-h-0 overflow-hidden">
                  <AiTutorPanel settings={settings} context={examCtx} onClose={() => setExamMobileTutorOpen(false)} alwaysOpen={true} width={window.innerWidth} />
                </div>
              </div>
            </div>
          );
        })()}
    </div>
    );
  }

  const handleExamExport`;
c = c.replace(examPanelEnd, examPanelWithMobile);
console.log('Exam mobile tutor added:', c.includes('Exam mobile tutor button'));

// Write file
fs.writeFileSync(f, c, 'utf8');
console.log('All done!');
