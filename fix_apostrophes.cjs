const fs = require('fs');
let src = fs.readFileSync('src/symptomsDatabase.js', 'utf8');

// Fix unescaped apostrophes inside single-quoted JS strings
// Process character by character
let result = '';
let i = 0;
let inString = false;
let stringChar = '';
let fixes = 0;

while (i < src.length) {
  const ch = src[i];

  if (!inString) {
    if (ch === "'" || ch === '"' || ch === '`') {
      inString = true;
      stringChar = ch;
      result += ch;
    } else {
      result += ch;
    }
  } else {
    if (ch === '\\') {
      // escaped char - pass both through unchanged
      result += ch;
      i++;
      if (i < src.length) result += src[i];
    } else if (ch === stringChar) {
      inString = false;
      stringChar = '';
      result += ch;
    } else if (ch === "'" && stringChar === "'") {
      // unescaped apostrophe inside single-quoted string - escape it
      result += "\\'";
      fixes++;
    } else {
      result += ch;
    }
  }
  i++;
}

fs.writeFileSync('src/symptomsDatabase.js', result, 'utf8');
console.log('Fixed', fixes, 'unescaped apostrophes in symptomsDatabase.js');
