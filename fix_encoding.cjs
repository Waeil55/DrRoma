const fs = require('fs');

function fixMojibake(text) {
  return text.replace(/[\xC2-\xFF][\x80-\xBF]+/g, function(match) {
    try {
      var bytes = Buffer.from(match.split('').map(function(c) { return c.charCodeAt(0); }));
      var decoded = bytes.toString('utf8');
      if (decoded.indexOf('\uFFFD') === -1 && decoded.length < match.length) {
        return decoded;
      }
      return match;
    } catch (e) {
      return match;
    }
  });
}

var targets = [
  'src/App.jsx',
  'src/components/chat/ChatPanel.jsx',
  'src/components/dashboard/DashboardView.jsx',
  'src/components/study/AchievementsView.jsx',
  'src/components/study/CalendarView.jsx',
  'src/utils/xpSystem.js',
  'src/components/exams/ExamsView.jsx',
  'src/components/flashcards/FlashcardsView.jsx',
  'src/components/tutor/TutorView.jsx',
  'src/components/library/LibraryView.jsx',
];

var totalFiles = 0;
targets.forEach(function(file) {
  if (!fs.existsSync(file)) return;
  var original = fs.readFileSync(file, 'utf8');
  var fixed = fixMojibake(original);
  if (fixed !== original) {
    fs.writeFileSync(file, fixed, 'utf8');
    console.log('Fixed: ' + file);
    totalFiles++;
  } else {
    console.log('Clean: ' + file);
  }
});
console.log('\nDone. ' + totalFiles + ' files updated.');