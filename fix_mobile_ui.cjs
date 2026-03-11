const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'App.jsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Fix Mobile Bottom Nav Bar to sit at the very bottom
content = content.replace(
    /padding:\s*'0 12px calc\(8px \+ env\(safe-area-inset-bottom\)\) 12px'/,
    "padding: '0 0 calc(env(safe-area-inset-bottom)) 0'"
).replace(
    /maxWidth:\s*540,\s*padding:\s*'6px',\s*borderRadius:\s*999,/g,
    "maxWidth: '100%', padding: '8px 6px', borderRadius: '16px 16px 0 0',"
).replace(
    /boxShadow:\s*'0 8px 32px rgba\(0,0,0,0\.15\), 0 2px 8px rgba\(37, 99, 235, 0\.2\)'/g,
    "borderBottom: 'none', boxShadow: '0 -4px 24px rgba(0,0,0,0.1)'"
);

// 2. Add inline "Ask AI Tutor" buttons into the active study pages

// FlashcardsView: Add below "Show Answer" / Rating buttons
const fcTriggerBtn = `
            {/* Inline AI Tutor Trigger */}
            <div className="lg:hidden mt-2">
              <button onClick={() => setMobileTutorOpen(true)} className="w-full glass py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm text-[var(--accent)] border border-[var(--accent)]/30 hover:bg-[var(--accent)]/10 transition-colors">
                <MessageSquare size={18} /> Ask AI Tutor
              </button>
            </div>
          </div>
          {/* Drag handle */}`;
content = content.replace(/<\/div>\s*\{\/\* Drag handle \*\/\}/, fcTriggerBtn);

// ExamsView: Add below options
const exTriggerBtn = `
            </div>
            
            {/* Inline AI Tutor Trigger */}
            <div className="lg:hidden mt-4">
              <button onClick={() => setExamMobileOpen(true)} className="w-full glass py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm text-[var(--accent)] border border-[var(--accent)]/30 hover:bg-[var(--accent)]/10 transition-colors">
                <MessageSquare size={18} /> Ask AI Tutor
              </button>
            </div>
          </div>
          {/* Drag handle */}`;
content = content.replace(/<\/div>\s*\{\/\* Drag handle \*\/\}/, exTriggerBtn);

// CasesView: Add below explanation
const casesTriggerBtn = `
            {/* Inline AI Tutor Trigger */}
            <div className="lg:hidden mt-4">
              <button onClick={() => setCasesMobileTutorOpen(true)} className="w-full glass py-3.5 rounded-2xl flex items-center justify-center gap-2 font-bold text-sm text-[var(--accent)] border border-[var(--accent)]/30 hover:bg-[var(--accent)]/10 transition-colors">
                <MessageSquare size={18} /> Ask AI Tutor
              </button>
            </div>
          </div>
          {/* RIGHT: AI Tutor */}`;
// Need to find the exact Cases panel end
content = content.replace(/<\/div>\s*\{\/\* RIGHT: AI Tutor \*\/\}/, casesTriggerBtn);

// 3. Remove the floating AI Tutor FABs but KEEP the modal panels

content = content.replace(/\{\/\* GLOBAL DESKTOP & MOBILE AI TUTOR \*\/\}\s*\{createPortal\([\s\S]*?className="fixed w-14 h-14[^>]*>[\s\S]*?<\/button>\s*\{/g, "{/* AI TUTOR MODALS */}\n      {createPortal(\n        <>\n          {");

fs.writeFileSync(filePath, content, 'utf8');
console.log('Mobile UI and inline AI Tutor buttons updated successfully.');
