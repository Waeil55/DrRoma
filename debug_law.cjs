const fs = require('fs');
const f1 = fs.readFileSync('law_5e904d3.js', 'utf8');
const f2 = fs.readFileSync('law_a4563a20a.js', 'utf8');

const s1Match = f1.match(/"id":\s*"law_fc_/g);
const s2Match = f2.match(/"id":\s*"law_fc_/g);

console.log('5e904d3.js count:', s1Match ? s1Match.length : 0);
console.log('a4563a20a.js count:', s2Match ? s2Match.length : 0);
