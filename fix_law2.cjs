// Auto-generate questions for remaining law cards from answer content
const fs = require('fs');
const path = require('path');

let lawContent = fs.readFileSync(path.join(__dirname, 'src', 'lawData.js'), 'utf8');

// Find all cards that still have "Question N" text
const qRegex = /"id":\s*"(law_fc_(\d+))"[\s\S]*?"q":\s*"Question \d+"[\s\S]*?"a":\s*"([^"]+)"/g;
let match;
let fixed = 0;

while ((match = qRegex.exec(lawContent)) !== null) {
  const fullId = match[1];
  const answer = match[3].replace(/\\n/g, '\n').trim();
  
  // Generate a meaningful question from the answer
  // For short answers, use the answer as-is (it reads like a definition)
  // For longer answers, take the first meaningful phrase
  let question;
  const lines = answer.split('\n').filter(l => l.trim());
  const firstLine = lines[0].trim();
  
  if (firstLine.length <= 80) {
    // Short enough to use as a question cue - wrap as "What is: X?"
    question = `Identify: ${firstLine}`;
  } else {
    // Truncate to 77 chars
    question = firstLine.substring(0, 77) + '...';
  }
  
  // Escape for JSON
  const escaped = question.replace(/\\/g, '\\\\').replace(/"/g, '\\"');
  
  // Replace the q field for this specific card
  const cardRegex = new RegExp(
    `("id":\\s*"${fullId}"[\\s\\S]*?"q":\\s*)"Question \\d+"`,
    'g'
  );
  const newContent = lawContent.replace(cardRegex, `$1"${escaped}"`);
  if (newContent !== lawContent) {
    fixed++;
    lawContent = newContent;
    // Reset regex index since content changed
    qRegex.lastIndex = 0;
  }
}

fs.writeFileSync(path.join(__dirname, 'src', 'lawData.js'), lawContent, 'utf8');

const remaining = [...lawContent.matchAll(/"q":\s*"Question \d+"/g)].length;
console.log(`Fixed: ${fixed} cards. Remaining with placeholder: ${remaining}`);
