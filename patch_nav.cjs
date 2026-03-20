const fs = require('fs');
const f = 'src/App.jsx';
let s = fs.readFileSync(f, 'utf8');
const old1 = "['library','Home'], ['flashcards','Cards'],\r\n              ['exams','Exams'], ['cases','Cases'], ['chat','Tutor'], ['settings','Settings']";
const new1 = "['library','Home'], ['study','Study'], ['flashcards','Cards'],\r\n              ['exams','Exams'], ['cases','Cases'], ['medicines','Medicine'],\r\n              ['diseases','Diseases'], ['chat','Tutor'], ['settings','Settings']";
if (s.includes(old1)) {
  s = s.replace(old1, new1);
  s = s.replace('className="hidden md:flex mariam-tab-pills">', 'className="hidden md:flex mariam-tab-pills" style={{ overflowX: "auto", scrollbarWidth: "none" }}>');
  fs.writeFileSync(f, s, 'utf8');
  console.log('OK');
} else {
  const i = s.indexOf("'Home']");
  console.log('FAIL. Context:', JSON.stringify(s.slice(i, i+200)));
}