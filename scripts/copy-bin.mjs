import fs from 'fs';
import path from 'path';

const src = path.resolve('bin', 'x402.js');
const destDir = path.resolve('dist', 'bin');
const dest = path.join(destDir, 'x402.js');

fs.mkdirSync(destDir, { recursive: true });
const content = fs.readFileSync(src, 'utf8');
fs.writeFileSync(dest, content);
console.log('Copied bin/x402.js to dist/bin/x402.js');