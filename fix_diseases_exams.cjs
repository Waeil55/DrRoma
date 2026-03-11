// Rebuild Medical Sciences exams to cover ALL 134 flashcards
// Each exam question comes directly from a flashcard (q → exam q, a → correct option)
// 3 wrong options = real answers from other flashcards (plausible distractors)

const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'Diseases.js');
let content = fs.readFileSync(filePath, 'utf8');

// Extract all flashcards from the file
const cardRegex = /"id":\s*"diseases_fc_(\d+)"[\s\S]*?"q":\s*"([^"]+)"[\s\S]*?"a":\s*"([^"]+)"/g;
const cards = [];
let m;
while ((m = cardRegex.exec(content)) !== null) {
  cards.push({ idx: parseInt(m[1]), q: m[2], a: m[3] });
}
cards.sort((a, b) => a.idx - b.idx);
console.log(`Found ${cards.length} flashcards`);

// Build exam questions from ALL flashcards
const examQuestions = cards.map((card, i) => {
  // Pick 3 different cards for wrong options
  const pool = cards.filter((_, j) => j !== i);
  const w1idx = (i * 7 + 1) % pool.length;
  let w2idx = (i * 11 + 5) % pool.length;
  let w3idx = (i * 13 + 9) % pool.length;
  if (w2idx === w1idx) w2idx = (w2idx + 1) % pool.length;
  if (w3idx === w1idx || w3idx === w2idx) w3idx = (w3idx + 2) % pool.length;

  const opts = [
    JSON.stringify(card.a),
    JSON.stringify(pool[w1idx].a),
    JSON.stringify(pool[w2idx].a),
    JSON.stringify(pool[w3idx].a),
  ];

  return `  {
    "id": "diseases_ex_${i}",
    "q": ${JSON.stringify(card.q)},
    "options": [
      ${opts.join(',\n      ')}
    ],
    "correct": 0
  }`;
});

const examBlock = `
export const diseasesExams = [{
  id: "builtin_exam_diseases",
  title: "Medical Sciences Exam",
  icon: "CheckSquare",
  color: "#06b6d4",
  isBuiltIn: true,
  isBuiltin: true,
  questions: [
${examQuestions.join(',\n')}
]
}];`;

// Replace existing diseasesExams block (handles both empty array and populated block)
const newContent = content
  .replace(/\nexport const diseasesExams[\s\S]*?^\}\];/m, examBlock)
  .replace(/export const diseasesExams = \[\];/, examBlock);

fs.writeFileSync(filePath, newContent, 'utf8');
console.log(`Written ${examQuestions.length} Medical Sciences exam questions (one per flashcard)`);
