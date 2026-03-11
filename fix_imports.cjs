const fs = require('fs');
const path = require('path');
const f = path.join(__dirname, 'src', 'App.jsx');
let c = fs.readFileSync(f, 'utf8');

// Add Layout import
const old1 = '  MoreVertical, CheckCheck, CircleDot, Flame, Heart, Leaf,';
const new1 = '  MoreVertical, CheckCheck, CircleDot, Flame, Heart, Leaf,\n  Layout, LayoutGrid, BotMessageSquare,';
c = c.replace(old1, new1);
console.log('Layout added:', c.includes('Layout, LayoutGrid'));

fs.writeFileSync(f, c, 'utf8');
console.log('Done');
