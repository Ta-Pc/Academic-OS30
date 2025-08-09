#!/usr/bin/env node
/*
  Replace hardcoded color classnames with tokenized variants if needed.
  This is a conservative pass that logs occurrences for manual review.
*/
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (/\.(tsx|ts|css)$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

const patterns = [
  /text-(red|green|yellow|blue)-(500|600|700)/g,
  /bg-(red|green|yellow|blue)-(500|600|700)/g,
];

function scanFile(fp) {
  const src = fs.readFileSync(fp, 'utf-8');
  const matches = [];
  patterns.forEach((re) => {
    let m;
    while ((m = re.exec(src))) {
      matches.push({ index: m.index, match: m[0] });
    }
  });
  return matches;
}

function main() {
  const files = walk(path.join(root, 'src'));
  const report = [];
  for (const f of files) {
    const ms = scanFile(f);
    if (ms.length) report.push({ file: path.relative(root, f), matches: ms });
  }
  const outDir = path.join(root, 'tmp');
  fs.mkdirSync(outDir, { recursive: true });
  const logPath = path.join(outDir, 'codemod-replace-tokens-report.json');
  fs.writeFileSync(logPath, JSON.stringify({ report }, null, 2));
  console.log('Token scan complete. Report at', logPath);
}

if (require.main === module) main();


