// Inject mobile tutor into flashcard study view at exact line positions
const fs = require('fs');
const path = require('path');
const f = path.join(__dirname, 'src', 'App.jsx');
const raw = fs.readFileSync(f, 'utf8');
// Split preserving \r\n
const lines = raw.split(/\r?\n/);

// Current line 3008 = "        </div>"  (closing the flex row)
// Line 3009 = "      </div>"  (closing the outer flex-col)
// We want to insert the mobile FAB + sheet BEFORE line 3009 (0-indexed: 3008)
const targetLine = 3008; // 0-indexed = line 3009 content

const mobileFC = [
  '',
  '        {/* MOBILE: floating Tutor button */}',
  '        <button onClick={() => setMobileTutorOpen(true)}',
  '          className="lg:hidden fixed z-40 w-14 h-14 rounded-2xl btn-accent shadow-2xl flex items-center justify-center"',
  '          style={{bottom: `calc(${88}px + env(safe-area-inset-bottom, 0px))`, right: 16}}',
  '          title="AI Tutor"><MessageSquare size={22} /></button>',
  '',
  '        {mobileTutorOpen && (',
  '          <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end" style={{background:\'rgba(0,0,0,0.55)\'}}',
  '            onClick={e => e.target===e.currentTarget && setMobileTutorOpen(false)}>',
  '            <div className="glass rounded-t-3xl flex flex-col" style={{height:\'72vh\',boxShadow:\'0 -8px 40px rgba(0,0,0,.3)\'}}>',
  '              <div className="flex items-center justify-between px-5 py-3 border-b border-[color:var(--border2,var(--border))]">',
  '                <span className="font-black text-sm flex items-center gap-2"><MessageSquare size={16} className="text-[var(--accent)]" />AI Tutor</span>',
  '                <button onClick={() => setMobileTutorOpen(false)} className="w-8 h-8 glass rounded-xl flex items-center justify-center"><X size={16} /></button>',
  '              </div>',
  '              <div className="flex-1 min-h-0 overflow-hidden">',
  '                <AiTutorPanel settings={settings} context={tutorCtx} onClose={() => setMobileTutorOpen(false)} alwaysOpen={true} width={window.innerWidth} />',
  '              </div>',
  '            </div>',
  '          </div>',
  '        )}',
];

// Verify the target line is correct
console.log('Target line (3008):', lines[3007]);
console.log('Next line (3009):', lines[3008]);

lines.splice(3008, 0, ...mobileFC);

// Also find examMobileOpen usage area to add the exam mobile tutor FAB
// Look for exam study return - find the hidden lg:flex AiTutorPanel in exam view
const examTutorIdx = lines.findIndex((l, i) => i > 3200 && i < 3500 && l.includes('hidden lg:flex flex-col border-l') && lines[i+1]?.includes('AiTutorPanel'));
console.log('Exam tutor panel at line:', examTutorIdx);

if (examTutorIdx !== -1) {
  const examMobile = [
    '          {/* MOBILE: floating Tutor button */}',
    '          <button onClick={() => setExamMobileOpen(true)}',
    '            className="lg:hidden fixed z-40 w-14 h-14 rounded-2xl btn-accent shadow-2xl flex items-center justify-center"',
    '            style={{bottom: `calc(${88}px + env(safe-area-inset-bottom, 0px))`, right: 16}}',
    '            title="AI Tutor"><MessageSquare size={22} /></button>',
    '          {examMobileOpen && (() => {',
    '            const eq = selEx?.questions?.[qi];',
    '            const ec = `Exam: ${selEx?.title}\\nQ${qi+1}: ${eq?.q}\\nOptions: ${eq?.options?.join(\' | \')}\\nCorrect: ${eq?.options?.[eq?.correct]}`;',
    '            return (',
    '              <div className="lg:hidden fixed inset-0 z-50 flex flex-col justify-end" style={{background:\'rgba(0,0,0,0.55)\'}}',
    '                onClick={e => e.target===e.currentTarget && setExamMobileOpen(false)}>',
    '                <div className="glass rounded-t-3xl flex flex-col" style={{height:\'72vh\',boxShadow:\'0 -8px 40px rgba(0,0,0,.3)\'}}>',
    '                  <div className="flex items-center justify-between px-5 py-3 border-b border-[color:var(--border2,var(--border))]">',
    '                    <span className="font-black text-sm flex items-center gap-2"><MessageSquare size={16} className="text-[var(--accent)]" />AI Tutor</span>',
    '                    <button onClick={() => setExamMobileOpen(false)} className="w-8 h-8 glass rounded-xl flex items-center justify-center"><X size={16} /></button>',
    '                  </div>',
    '                  <div className="flex-1 min-h-0 overflow-hidden">',
    '                    <AiTutorPanel settings={settings} context={ec} onClose={() => setExamMobileOpen(false)} alwaysOpen={true} width={window.innerWidth} />',
    '                  </div>',
    '                </div>',
    '              </div>',
    '            );',
    '          })()}',
  ];
  lines.splice(examTutorIdx, 0, ...examMobile);
  console.log('Exam mobile tutor inserted');
}

fs.writeFileSync(f, lines.join('\n'), 'utf8');
console.log('Done, total lines:', lines.length);
