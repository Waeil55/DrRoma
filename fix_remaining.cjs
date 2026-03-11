// Fix remaining drug cards and all law cards
const fs = require('fs');
const path = require('path');

// ── Drug: remaining unmapped cards ──────────────────────────────────
// Using drug_fc_N IDs to directly target the remaining 15 unfixed cards.
const DRUG_ID_TO_NAME = {
  // Bisoprolol/HCTZ - "N/A" brand
  'drug_fc_23': 'Bisoprolol/Hydrochlorothiazide',
  // Chlorthalidone - "N/A" brand  
  'drug_fc_35': 'Chlorthalidone',
  // Docusate sodium - check
  'drug_fc_56': 'Docusate sodium (Colace)',
  // Ferrous sulfate
  'drug_fc_71': 'Ferrous sulfate',
  // Folic acid
  'drug_fc_78': 'Folic acid',
  // Hydralazine
  'drug_fc_84': 'Hydralazine',
  // Hydrochlorothiazide
  'drug_fc_85': 'Hydrochlorothiazide',
  // Lovastatin - Brand: Mevacor (handled), but if N/A
  'drug_fc_117': 'Lovastatin',
  // Labetalol
  'drug_fc_100': 'Labetalol',
  // Penicillin VK - Brand: N/A
  'drug_fc_149': 'Penicillin VK',
  // Terazosin - Brand N/A
  'drug_fc_176': 'Terazosin',
  // Triamcinolone topical - Brand N/A
  'drug_fc_186': 'Triamcinolone topical',
  // Tramadol (leftover)
  'drug_fc_183': 'Tramadol',
  // Trazodone
  'drug_fc_184': 'Trazodone',
  // Prednisolone (Orapred)
  'drug_fc_155': 'Prednisolone',
};

let drugContent = fs.readFileSync(path.join(__dirname, 'src', 'drugData.js'), 'utf8');
let drugFixed = 0;
for (const [id, name] of Object.entries(DRUG_ID_TO_NAME)) {
  // Replace "q": "Question N" in the specific card block by id
  const regex = new RegExp(`("id":\\s*"${id}",[\\s\\S]*?"q":\\s*)"Question \\d+"`, 'g');
  const newContent = drugContent.replace(regex, `$1"${name}"`);
  if (newContent !== drugContent) {
    drugFixed++;
    drugContent = newContent;
  }
}
fs.writeFileSync(path.join(__dirname, 'src', 'drugData.js'), drugContent, 'utf8');
console.log(`Drug: fixed ${drugFixed} additional cards`);

// Check remaining
const remaining = [...drugContent.matchAll(/"q":\s*"Question \d+"/g)];
console.log(`Drug: ${remaining.length} cards still have placeholder questions`);

// ── Law: fix ALL 352 law flashcard questions ──────────────────────────
// lawData.js cards have a detailed answer about pharmacy law topics.
// We generate questions from the topic keyword in each answer.
let lawContent = fs.readFileSync(path.join(__dirname, 'src', 'lawData.js'), 'utf8');

// Extract all card ids and their answers, then generate meaningful questions
const cardRegex = /"id":\s*"(law_fc_\d+)"[\s\S]*?"q":\s*"Question \d+"[\s\S]*?"a":\s*"([^"]+(?:"[^"]*"[^"]*?)*)"/g;
let lawMatch;
const lawFixes = [];
while ((lawMatch = cardRegex.exec(lawContent)) !== null) {
  const id = lawMatch[1];
  const rawAnswer = lawMatch[2].replace(/\\n/g, '\n');
  // Try to generate a meaningful question from the first sentence of the answer
  const firstSentence = rawAnswer.split(/\.\s/)[0].trim();
  const shortQ = firstSentence.length > 80 
    ? firstSentence.substring(0, 77) + '...'
    : firstSentence;
  // Clean up for use as question - make it interrogative
  lawFixes.push({ id, shortQ });
}

let lawFixed = 0;
for (const { id, shortQ } of lawFixes) {
  // Escape special chars for use in JSON string
  const escaped = shortQ.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  const regex = new RegExp(`("id":\\s*"${id}",[\\s\\S]*?"q":\\s*)"Question \\d+"`, 'g');
  const newContent = lawContent.replace(regex, `$1"${escaped}"`);
  if (newContent !== lawContent) {
    lawFixed++;
    lawContent = newContent;
  }
}
fs.writeFileSync(path.join(__dirname, 'src', 'lawData.js'), lawContent, 'utf8');
console.log(`Law: fixed ${lawFixed} of ${lawFixes.length} cards`);
