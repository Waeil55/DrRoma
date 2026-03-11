const fs = require('fs');
const f1 = fs.readFileSync('law_5e904d3.js', 'utf8');

const s1Match = f1.match(/"id":\s*"(.*?)"/g);
console.log(s1Match.slice(0, 5));
console.log('...');
console.log(s1Match.slice(300, 305));
