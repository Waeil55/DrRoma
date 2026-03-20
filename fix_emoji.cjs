// fix_emoji.cjs — Remove all emoji (mojibake and actual Unicode) from App.jsx
// and any remaining emoji in component files
'use strict';
const fs = require('fs');
const path = require('path');
const root = 'c:\\Users\\waeil\\Desktop\\Coding\\App7\\dr-mariam';

function fixFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const orig = content;
  let n = 0;

  // ── 1. Clear icon fields containing non-ASCII (emoji mojibake / actual emoji) ──
  content = content.replace(/icon:\s*'([^']*)'/g, (match, val) => {
    if (/[^\x00-\x7F]/.test(val)) { n++; return "icon: ''"; }
    return match;
  });

  // ── 2. Remove emoji-only standalone spans (pearl icons like <span>💎</span>) ──
  // Only removes if span content has no ASCII letters/digits and doesn't contain
  // intentional UI unicode like arrows → or box-drawing
  content = content.replace(/<span>([^<]{1,12})<\/span>/g, (match, inner) => {
    if (
      /[^\x00-\x7F]/.test(inner) &&        // has non-ASCII
      !/[a-zA-Z0-9]/.test(inner) &&         // no ASCII text
      !/[\u2190-\u21FF\u2500-\u259F]/.test(inner) // no arrows / box / block
    ) { n++; return '<span></span>'; }
    return match;
  });

  // ── 3. Remove leading emoji from h2 headings (medical guide section headers) ──
  // Matches: >EMOJI_CHARS<space> at the start of a heading text node
  content = content.replace(/(>\s*)([^\x00-\x7F\s][^\x00-\x7F]*)\s+(?=[A-Z])/g,
    (match, gt, emoji) => {
      // Only strip if the non-ASCII prefix is ≤8 chars (one or two emoji)
      if (emoji.length <= 8) { n++; return gt; }
      return match;
    }
  );

  // ── 4. Remove actual BMP emoji stored as proper Unicode ──
  // ⏰⏱⏲⏳ (U+23F0-U+23FF), ⭐ (U+2B50), misc symbols (U+2600-U+27BF)
  // NOT removed: → (U+2192), box drawing (U+2500-U+257F), block (U+2580-U+259F)
  content = content.replace(/[\u23F0-\u23FF\u2B50\u2600-\u27BF]/g, () => { n++; return ''; });

  // ── 5. Remove 4-byte emoji mojibake ──
  // All F0 9F ... emoji when misread as Windows-1252 start with ð (U+00F0) + Ÿ (U+0178)
  // This combination NEVER appears in English medical text naturally
  content = content.replace(/\u00F0\u0178[\s\S]{2}/g, () => { n++; return ''; });

  // ── 6. Remove 3-byte emoji mojibake with C1 control signature ──
  // E2 9D XX → U+00E2 + U+009D + any_char  (❤ ▸ ✿ range, always emoji)
  // E2 8F XX → U+00E2 + U+008F + any_char  (⏰ ⏱ ⏳ stored as mojibake)
  content = content.replace(/\u00E2[\u0081\u008D\u008F\u0090\u009D][\s\S]/g, () => { n++; return ''; });

  if (content !== orig) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`  Fixed ${n} occurrences in: ${path.relative(root, filePath)}`);
    return true;
  }
  return false;
}

// Process App.jsx (main monolith with medical data)
console.log('Cleaning App.jsx...');
fixFile(path.join(root, 'src', 'App.jsx'));

// Also scan all component/hook/service files for any remaining emoji
console.log('\nScanning component files...');
let totalFiles = 0;
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { walk(full); continue; }
    if (!/\.(jsx?|css)$/.test(entry.name)) continue;
    if (fixFile(full)) totalFiles++;
  }
}
walk(path.join(root, 'src'));
console.log(`\nDone. ${totalFiles} file(s) modified.`);
