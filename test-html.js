import fs from 'fs';
import path from 'path';

// read the generated css from dist to see if there's any compile error
const cssDir = './dist/assets';
const files = fs.readdirSync(cssDir);
const cssFile = files.find(f => f.endsWith('.css'));
const css = fs.readFileSync(path.join(cssDir, cssFile), 'utf8');

console.log("Has row-reverse:", css.includes('row-reverse'));
console.log("Has lpm-left background:", css.includes('--luna-orange-500'));
