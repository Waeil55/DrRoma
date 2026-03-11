const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src', 'lawData.js');
let content = fs.readFileSync(filePath, 'utf8');

const regex = /("id":\s*"(law_fc_\d+)",\s*"q":\s*)"[^"]*",(\s*"a":\s*"([^"]+(?:"[^"]*"[^"]*?)*)")/g;

let count = 0;
const newContent = content.replace(regex, (match, prefix, id, suffix, rawAns) => {
    const ans = rawAns.replace(/\\n/g, '\n');
    let firstSentence = ans.split(/\.\s/)[0].trim().replace(/\n/g, ' ');
    let shortQ = firstSentence.length > 100 ? firstSentence.substring(0, 97) + '...' : firstSentence;
    count++;
    // Don't modify if it's already a good question (but the script corrupted them all, so we override all)
    return `${prefix}"Explain: ${shortQ.replace(/"/g, '\\"')}",${suffix}`;
});

fs.writeFileSync(filePath, newContent, 'utf8');
console.log(`Rewrote ${count} law flashcards inline.`);
