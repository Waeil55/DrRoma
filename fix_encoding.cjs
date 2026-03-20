/**
 * fix_encoding.cjs — Comprehensive Mojibake + non-ASCII cleanup
 *
 * Scans every .jsx, .js, .css file under src/ and:
 *  1. Strips the UTF-8 BOM if present.
 *  2. Replaces known Mojibake sequences (double-encoded UTF-8) with clean ASCII.
 *  3. Strips all remaining non-ASCII characters (> U+007F) that are not explicitly
 *     escaped in the source (like \\u00B7), because they cause garbled rendering.
 *
 * Safe to run multiple times (idempotent after first run).
 */

const fs   = require('fs');
const path = require('path');

// ─── Mojibake table: garbled string → clean ASCII replacement ────────────────
// These are UTF-8 multi-byte sequences mis-stored as Latin-1 then re-encoded.
// Order matters: longer / more-specific patterns go first.
const MOJIBAKE = [
  // Box-drawing runs  â•═ â"€─  etc.  (appear in comment dividers, not rendered)
  [/[\u00E2][\u0095][\u0090\u91\x92\x93\x94\x95\x96\x97\x98\x99\x9A\x9B\x9C\x9D\x9E\x9F]*/g, '-'],
  [/[\u00E2][\u0094][\x80-\xBF]/g, '-'],

  // Smart double-quotes  "  "
  [/\u00E2\u0080\u009C/g, '"'],
  [/\u00E2\u0080\u009D/g, '"'],
  // Smart single-quotes / apostrophes  '  '
  [/\u00E2\u0080\u0099/g, "'"],
  [/\u00E2\u0080\u0098/g, "'"],
  // Em-dash & en-dash   —  –
  [/\u00E2\u0080\u0094/g, '-'],
  [/\u00E2\u0080\u0093/g, '-'],
  // Ellipsis  …
  [/\u00E2\u0080\u00A6/g, '...'],
  // Bullet  •
  [/\u00E2\u0080\u00A2/g, ''],
  // Right arrow  →  common in descriptions
  [/\u00E2\u0086\u0092/g, '->'],
  // Other arrows  ←  ↑  ↓
  [/\u00E2\u0086[\u0090\u0091\u0093]/g, ''],
  // Medical symbol  ⚕
  [/\u00E2\u009A\u0095/g, ''],
  // Check / cross marks  ✓ ✗ ✔ ✕
  [/\u00E2\u009C[\u0093\u0094\u0095\u0097]/g, ''],
  // Non-breaking space Â + space
  [/\u00C2\u00A0/g, ' '],
  // Middle dot  ·
  [/\u00C2\u00B7/g, '\u00B7'],
  // Degree  °
  [/\u00C2\u00B0/g, '\u00B0'],
  // Catch-all: any remaining â€ prefix (was em/en/quote related)
  [/\u00E2\u0080[\x80-\xFF]/g, ''],
  // Catch-all for any leftover â sequences
  [/\u00E2[\x80-\xFF][\x80-\xFF]/g, ''],
  [/\u00E2[\x80-\xFF]/g, ''],
  [/\u00C2[\x80-\xFF]/g, ''],
  [/\u00C3[\x80-\xFF]/g, ''],
];

// Characters we ALLOW to stay (proper Unicode intentionally written):
//   · U+00B7  middle dot
//   ° U+00B0  degree sign
// Everything else in U+0080-U+FFFF range gets stripped in the final pass.
const ALLOWED_NON_ASCII = /[\u00B7\u00B0]/g;

function cleanFile(content) {
  // 0. Strip BOM
  if (content.charCodeAt(0) === 0xFEFF) content = content.slice(1);

  // 1. Mojibake replacements
  for (const [pat, rep] of MOJIBAKE) {
    content = content.replace(pat, rep);
  }

  // 2. Strip ALL remaining non-ASCII (except U+00B7 and U+00B0 which we wrote intentionally)
  //    We do this by replacing any char > U+007F that ISN'T in our allowed set.
  content = content.replace(/[^\x00-\x7F]/g, (ch) => {
    const cp = ch.codePointAt(0);
    if (cp === 0x00B7 || cp === 0x00B0) return ch; // keep intentional unicode
    return '';  // strip everything else
  });

  return content;
}

function getAllFiles(dir, exts) {
  let out = [];
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    if (fs.statSync(full).isDirectory()) out = out.concat(getAllFiles(full, exts));
    else if (exts.some(e => full.endsWith(e))) out.push(full);
  }
  return out;
}

const srcDir = path.join(__dirname, 'src');
const files  = getAllFiles(srcDir, ['.jsx', '.js', '.css']);

let filesFixed = 0, charsFixed = 0;

for (const filePath of files) {
  const original = fs.readFileSync(filePath, 'utf8');
  const before   = (original.match(/[^\x00-\x7F]/g) || []).length;
  const fixed    = cleanFile(original);
  const after    = (fixed.match(/[^\x00-\x7F]/g) || []).length;

  if (fixed !== original) {
    fs.writeFileSync(filePath, fixed, 'utf8');
    console.log(`  Fixed ${before - after} chars: ${path.relative(__dirname, filePath)}`);
    filesFixed++;
    charsFixed += (before - after);
  }
}

console.log(`\nDone: ${charsFixed} garbled characters removed from ${filesFixed} files.`);