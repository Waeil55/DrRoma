const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'lawData.js');
let content = fs.readFileSync(filePath, 'utf8');

// The answers were never corrupted, only the 'q' fields. 
// We will parse the lawFlashcards array, and for each card, generate a question from the answer.

// Extract the flashcards array using regex
const fcMatch = content.match(/export const lawFlashcards = (\[\{[\s\S]*?\}\]);\n\nexport const/);
if (!fcMatch) {
    console.error("Could not find lawFlashcards array");
    process.exit(1);
}

let lawFlashcards;
try {
    lawFlashcards = eval(fcMatch[1]);
} catch (e) {
    console.error("Failed to eval", e);
    process.exit(1);
}

const cards = lawFlashcards[0].cards;

const fixedCards = cards.map((card, idx) => {
    // Generate question from answer
    const rawAnswer = card.a.replace(/\\n/g, '\n');
    const firstSentence = rawAnswer.split(/\.\s/)[0].trim();
    const shortQ = firstSentence.length > 80
        ? firstSentence.substring(0, 77) + '...'
        : firstSentence;

    return {
        ...card,
        q: "Explain: " + shortQ
    };
});

lawFlashcards[0].cards = fixedCards;

const newStr = `export const lawFlashcards = ${JSON.stringify(lawFlashcards, null, 2).split('\\n').join('\\\\n')};`;

content = content.replace(/export const lawFlashcards = \[\{[\s\S]*?\}\];/, newStr);
fs.writeFileSync(filePath, content, 'utf8');
console.log(`Rewrote ${fixedCards.length} law flashcards.`);
