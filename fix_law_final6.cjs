const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'lawData.js');
let content = fs.readFileSync(filePath, 'utf8');

// Convert to commonjs
let cjsCode = content.replace(/export const /g, 'exports.');
fs.writeFileSync('temp_law_cjs.js', cjsCode, 'utf8');

const { lawFlashcards, lawExams, lawCases } = require('./temp_law_cjs');

let count = 0;
const fixedCards = lawFlashcards[0].cards.map(card => {
    const ans = card.a || '';
    let firstSentence = ans.split(/\.\s/)[0].trim().replace(/\n/g, ' ');
    let shortQ = firstSentence.length > 100 ? firstSentence.substring(0, 97) + '...' : firstSentence;
    count++;
    return {
        ...card,
        q: "Explain: " + shortQ
    };
});

lawFlashcards[0].cards = fixedCards;

// Now rebuild the ES module content
const newContent = `
export const lawFlashcards = ${JSON.stringify(lawFlashcards, null, 2).split('\\n').join('\\\\n')};

export const lawExams = ${JSON.stringify(lawExams, null, 2).split('\\n').join('\\\\n')};

export const lawCases = ${JSON.stringify(lawCases, null, 2).split('\\n').join('\\\\n')};
`;

fs.writeFileSync(filePath, newContent.trim() + '\n', 'utf8');
console.log(`Rewrote ${count} law flashcards inline.`);

fs.unlinkSync('temp_law_cjs.js');
