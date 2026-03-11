const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'drugData.js');
let content = fs.readFileSync(filePath, 'utf8');

// Extract flashcards json
const fcMatch = content.match(/export const drugFlashcards = (\[\{[\s\S]*?\}\]);/);
if (!fcMatch) {
    console.error("Could not find drugFlashcards array");
    process.exit(1);
}

// Evaluate it safely since it's just an array of objects
let drugFlashcards;
try {
    drugFlashcards = eval(fcMatch[1]);
} catch (e) {
    console.error("Failed to eval drugFlashcards", e);
    process.exit(1);
}

const cards = drugFlashcards[0].cards;

const exams = [];
cards.forEach((card, i) => {
    const matchIndication = card.a.match(/Indication:\s*([^\n]+)/i);
    const matchClass = card.a.match(/Class:\s*([^\n]+)/i);

    let qText = `What is the primary indication and class for ${card.q}?`;
    if (matchIndication && matchClass) {
        qText = `Which medication is indicated for ${matchIndication[1].trim().toLowerCase()} and is classified as a(n) ${matchClass[1].trim().toLowerCase()}?`;
    }

    const correctName = card.q;

    // Pick 3 random distractors
    const distractors = [];
    while (distractors.length < 3) {
        const rx = cards[Math.floor(Math.random() * cards.length)];
        if (rx.q !== correctName && !distractors.includes(rx.q)) {
            distractors.push(rx.q);
        }
    }

    const options = [correctName, ...distractors];
    // Shuffle options
    for (let j = options.length - 1; j > 0; j--) {
        const k = Math.floor(Math.random() * (j + 1));
        [options[j], options[k]] = [options[k], options[j]];
    }

    const correctIdx = options.indexOf(correctName);

    exams.push({
        id: `drug_ex_${i}`,
        q: qText,
        options: options,
        correct: correctIdx
    });
});

const newDrugExams = `export const drugExams = [{
  id: "builtin_exam_drug",
  title: "Drug Counseling Exam",
  icon: "CheckSquare",
  color: "#f59e0b",
  isBuiltIn: true,
  isBuiltin: true,
  questions: ${JSON.stringify(exams, null, 2).split('\\n').join('\\\\n')}
}];`;

// Replace the existing drugExams block
const newContent = content.replace(/export const drugExams = \[\{[\s\S]*?\}\];/, newDrugExams);

fs.writeFileSync(filePath, newContent, 'utf8');
console.log(`Rewrote drugExams with ${exams.length} questions.`);
