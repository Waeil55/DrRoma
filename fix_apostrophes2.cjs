const fs = require('fs');

function fixApostrophes(filePath) {
  let src = fs.readFileSync(filePath, 'utf8');
  let fixes = 0;
  
  // Regex: find single-quoted strings that span one line and contain an apostrophe NOT preceded by backslash
  // This replaces the whole string value, escaping internal apostrophes
  src = src.replace(/(?<![\\])'((?:[^'\\]|\\.)*)'/g, (match, content) => {
    // Check if there's an unescaped apostrophe in content
    // An apostrophe in content that is NOT escaped
    if (/'/.test(content)) {
      // There's still an unescaped apostrophe - this means the regex stopped at wrong quote
      // Shouldn't happen but handle: escape all remaining apostrophes
      const fixed = content.replace(/'/g, "\\'");
      fixes++;
      return "'" + fixed + "'";
    }
    return match;
  });
  
  fs.writeFileSync(filePath, src, 'utf8');
  console.log(`${filePath}: ${fixes} fixes applied`);
}

// Actually, let's use a different approach - just replace contractions
function fixContractions(filePath) {
  let src = fs.readFileSync(filePath, 'utf8');
  let fixes = 0;
  
  // Find all single-quoted strings that are multi-word (contain spaces) and have unescaped apostrophes
  // We process the file looking for: ': '...' or similar patterns
  // Replace 's, 't, 're, 've, 'll, 'd, 'm contractions with escaped versions
  
  // Replace patterns like: 'text with it's or I'm etc in single-quoted contexts
  // We'll do it by converting the file line by line
  const lines = src.split('\n');
  const result = [];
  
  for (const line of lines) {
    // Check if this line has a value string (starts with space+property: '...)
    // Look for patterns like: 'word word' where there might be an apostrophe issue
    // Simple approach: find all single-quoted string literals and escape apostrophes in them
    
    // Process the line character by character
    let newLine = '';
    let i = 0;
    
    while (i < line.length) {
      if (line[i] === "'" && (i === 0 || line[i-1] !== '\\')) {
        // Start of single-quoted string
        let j = i + 1;
        let stringContent = '';
        let terminated = false;
        
        while (j < line.length) {
          if (line[j] === '\\') {
            stringContent += line[j] + (j+1 < line.length ? line[j+1] : '');
            j += 2;
            continue;
          }
          if (line[j] === "'") {
            terminated = true;
            j++;
            break;
          }
          stringContent += line[j];
          j++;
        }
        
        if (terminated && stringContent.includes("'")) {
          // This string had an unescaped apostrophe - shouldn't be possible with our logic
          // unless the regex approach is wrong
          const fixed = stringContent.replace(/'/g, "\\'");
          newLine += "'" + fixed + "'";
          fixes++;
        } else {
          newLine += line.slice(i, j);
        }
        i = j;
      } else {
        newLine += line[i];
        i++;
      }
    }
    
    result.push(newLine);
  }
  
  fs.writeFileSync(filePath, result.join('\n'), 'utf8');
  console.log(`${filePath}: ${fixes} fixes`);
}

fixContractions('src/counselingDatabase.js');
fixContractions('src/symptomsDatabase.js');
