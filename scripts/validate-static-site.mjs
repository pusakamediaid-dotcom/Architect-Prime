import { readFileSync, existsSync } from 'node:fs';

const requiredFiles = [
  'learning-site/index.html',
  'learning-site/main.js',
  'learning-site/styles.css',
  'learning-site/robots.txt',
  'learning-site/sitemap.xml',
  'learning-site/privacy.html',
  'learning-site/help.html',
  'learning-site/site.webmanifest',
  'learning-site/favicon.ico',
  'vercel.json',
];

for (const file of requiredFiles) {
  if (!existsSync(file)) {
    throw new Error(`Missing required static file: ${file}`);
  }
}

const html = readFileSync('learning-site/index.html', 'utf8');
const js = readFileSync('learning-site/main.js', 'utf8');
const css = readFileSync('learning-site/styles.css', 'utf8');

for (const text of ['Pusaka Student Hub', 'Tugas', 'Jadwal', 'Nilai', 'Checklist', 'Template']) {
  if (!html.includes(text)) throw new Error(`index.html missing text: ${text}`);
}

for (const key of [
  'pusakaStudentHub.tasks',
  'pusakaStudentHub.schedules',
  'pusakaStudentHub.grades',
  'pusakaStudentHub.checklists',
  'pusakaStudentHub.goals',
  'pusakaStudentHub.notes',
]) {
  if (!js.includes(key)) throw new Error(`main.js missing localStorage key: ${key}`);
}

if (!js.includes('Export Data JSON') && !html.includes('Export Data JSON')) {
  throw new Error('Export Data JSON UI missing');
}

if (!css.includes('.bottom-nav')) {
  throw new Error('Mobile bottom navigation CSS missing');
}

console.log('Static site validation PASS');
