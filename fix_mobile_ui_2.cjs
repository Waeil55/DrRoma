const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// Clean up previous botched replacements
// Remove ALL of my previous {* Inline AI Tutor Trigger *} blocks
content = content.replace(/[ \t]*\{\/\* Inline AI Tutor Trigger \*\/\}\n[ \t]*<div className="lg:hidden mt-[24]">\n[ \t]*<button onClick=\{.*?\} className="w-full glass py-3\.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm text-\[var\(--accent\)\] border border-\[var\(--accent\)\]\/30 hover:bg-\[var\(--accent\)\]\/10 transition-colors">\n[ \t]*<MessageSquare size=\{18\} \/> Ask AI Tutor\n[ \t]*<\/button>\n[ \t]*<\/div>\n/g, "");

// Furthermore, there may be dangling </div> that got duplicated from my previous replace.
// Let's rely on standard split points for injection.

// Helper to inject Ask AI Tutor button
function injectBtn(triggerFn, marginTop = 'mt-4') {
    return `\n            {/* Inline AI Tutor Trigger */}
            <div className="lg:hidden ${marginTop} flex-shrink-0">
              <button onClick={() => ${triggerFn}(true)} className="w-full glass py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-[var(--accent)] border border-[var(--accent)]/30 hover:bg-[var(--accent)]/10 transition-colors">
                <MessageSquare size={18} /> Ask AI Tutor
              </button>
            </div>\n`;
}

// 1. FlashcardsView target
// The target is right before:
// {/* Drag handle */}
//           <div onMouseDown={startFcTutorDrag}
let pattern1 = /([ \t]*)<\/div>\s*\{\/\* Drag handle \*\/\}\s*<div onMouseDown=\{startFcTutorDrag\}/;
content = content.replace(pattern1, (match, spaces) => {
    return injectBtn('setMobileTutorOpen', 'mt-2') + spaces + '</div>\n          {/* Drag handle */}\n          <div onMouseDown={startFcTutorDrag}';
});

// 2. ExamsView target
// Target is right before:
// {/* Drag handle */}
//           <div onMouseDown={startExamTutorDrag}
let pattern2 = /([ \t]*)<\/div>\s*\{\/\* Drag handle \*\/\}\s*<div onMouseDown=\{startExamTutorDrag\}/;
content = content.replace(pattern2, (match, spaces) => {
    return injectBtn('setExamMobileOpen', 'mt-4') + spaces + '</div>\n          {/* Drag handle */}\n          <div onMouseDown={startExamTutorDrag}';
});

// 3. CasesView target
// Target is right before:
// {/* ═══ DRAG HANDLE: lab ↔ tutor ═══ */}
//           <div onMouseDown={startTutorDrag}
let pattern3 = /([ \t]*)<\/div>\s*\{\/\* ═══ DRAG HANDLE: lab ↔ tutor ═══ \*\/\}\s*<div onMouseDown=\{startTutorDrag\}/;
content = content.replace(pattern3, (match, spaces) => {
    return injectBtn('setCasesMobileTutorOpen', 'mt-4') + spaces + '</div>\n\n          {/* ═══ DRAG HANDLE: lab ↔ tutor ═══ */}\n          <div onMouseDown={startTutorDrag}';
});

fs.writeFileSync(filePath, content, 'utf8');
console.log('Fixed AI Tutor buttons placements.');
