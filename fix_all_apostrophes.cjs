const fs = require('fs');

function fixFile(filePath) {
  const src = fs.readFileSync(filePath, 'utf8');
  // Convert the file to fix unescaped apostrophes in single-quoted strings
  // by switching problematic single-quoted strings to template literals
  // Strategy: find single-quoted strings that contain apostrophes and switch them to backtick strings
  
  let result = '';
  let i = 0;
  let fixes = 0;

  while (i < src.length) {
    const ch = src[i];

    if (ch === "'") {
      // Start of single-quoted string - scan ahead to find end and check for apostrophes
      let j = i + 1;
      let content = '';
      let hasUnescapedApostrophe = false;
      
      while (j < src.length) {
        if (src[j] === '\\') {
          content += src[j] + src[j+1];
          j += 2;
          continue;
        }
        if (src[j] === "'") {
          // end of string
          j++;
          break;
        }
        if (src[j] === '\n') {
          // unterminated string - just emit as-is
          hasUnescapedApostrophe = false;
          break;
        }
        // Check if this is an apostrophe in a word (letter before and after)
        if (src[j] === "'" && j > 0 && /[a-zA-Z]/.test(src[j-1]) && j+1 < src.length && /[a-zA-Z]/.test(src[j+1])) {
          hasUnescapedApostrophe = true;
        }
        content += src[j];
        j++;
      }
      
      if (hasUnescapedApostrophe) {
        // Escape apostrophes in the content
        const fixed = content.replace(/(?<!\\)'/g, "\\'");
        result += "'" + fixed + "'";
        fixes++;
      } else {
        result += src.slice(i, j);
      }
      i = j;
    } else if (ch === '"') {
      // Double-quoted string - pass through
      result += ch;
      i++;
      while (i < src.length && src[i] !== '"') {
        if (src[i] === '\\') {
          result += src[i];
          i++;
        }
        if (i < src.length) {
          result += src[i];
          i++;
        }
      }
      if (i < src.length) {
        result += src[i]; // closing quote
        i++;
      }
    } else if (ch === '`') {
      // Template literal - pass through (handle nested)
      result += ch;
      i++;
      let depth = 1;
      while (i < src.length && depth > 0) {
        if (src[i] === '\\') {
          result += src[i];
          i++;
          if (i < src.length) {
            result += src[i];
            i++;
          }
          continue;
        }
        if (src[i] === '`') depth--;
        result += src[i];
        i++;
      }
    } else {
      result += ch;
      i++;
    }
  }

  if (fixes > 0) {
    fs.writeFileSync(filePath, result, 'utf8');
    console.log(`${filePath}: fixed ${fixes} strings with unescaped apostrophes`);
  } else {
    console.log(`${filePath}: no issues`);
  }
}

fixFile('src/symptomsDatabase.js');
fixFile('src/counselingDatabase.js');
