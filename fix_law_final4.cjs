const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'lawData.js');
let content = fs.readFileSync(filePath, 'utf8');

// Find the boundaries of the 3 arrays
const parts = content.split(/export const /);
// parts[0] is empty or imports
// parts[1] is 'lawFlashcards = [{...}];\n\n'
// parts[2] is 'lawExams = [{...}];\n\n'
// parts[3] is 'lawCases = [{...}];\n\n'

let lawFlashcardsPart = parts.find(p => p.startsWith('lawFlashcards'));
if (!lawFlashcardsPart) {
    console.error("Could not find lawFlashcards");
    process.exit(1);
}

// Extract the array string
const arrStr = lawFlashcardsPart.replace(/^lawFlashcards\s*=\s*/, '').replace(/;\s*$/, '');
let lawFlashcards;
try {
    lawFlashcards = eval(arrStr);
} catch (e) {
    console.error("Eval failed", e);
    process.exit(1);
}

const cards = lawFlashcards[0].cards;
let count = 0;
const fixedCards = cards.map((card) => {
    const ans = card.a.replace(/\\n/g, '\n');
    let firstSentence = ans.split(/\.\s/)[0].trim().replace(/\n/g, ' ');
    let shortQ = firstSentence.length > 100 ? firstSentence.substring(0, 97) + '...' : firstSentence;
    count++;
    return {
        ...card,
        q: "Explain: " + shortQ
    };
});

lawFlashcards[0].cards = fixedCards;

// Serialize back
const newArrStr = JSON.stringify(lawFlashcards, null, 2).split('\\n').join('\\\\n');

content = content.replace(arrStr, newArrStr);

fs.writeFileSync(filePath, content, 'utf8');
console.log(`Rewrote ${count} law flashcards inline.`);
