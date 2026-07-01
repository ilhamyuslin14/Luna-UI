import fs from 'fs';
const html = fs.readFileSync('index.html', 'utf8');
console.log(html.includes('landing-page-masuk_001.css'));
