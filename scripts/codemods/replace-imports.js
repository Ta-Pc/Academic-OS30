#!/usr/bin/env node
/*
  Simple codemod: replace imports from local presentational components to new UI library.
  Idempotent: will skip if already using packages/ui or @ui alias.
*/
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '../..');

function walk(dir, acc = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, acc);
    else if (/\.(tsx|ts|jsx|js)$/.test(entry.name)) acc.push(full);
  }
  return acc;
}

const mapping = new Map([
  // key: regex to match old import path, value: new named export from packages/ui
  [/^@\/components\/ModuleCard$/, '{ ModuleCardView }'],
  [/^\.\.\/components\/ModuleCard$/, '{ ModuleCardView }'],
  [/^\.\.\/\.\.\/components\/ModuleCard$/, '{ ModuleCardView }'],
]);

function transformFile(fp) {
  let src = fs.readFileSync(fp, 'utf-8');
  let changed = false;
  if (src.includes("from 'packages/ui'") || src.includes("from '@ui'")) return null;
  for (const [re, named] of mapping.entries()) {
    src = src.replace(/import\s+([^;]+)\s+from\s+['\"]([^'\"]+)['\"];?/g, (m, imports, mod) => {
      if (re.test(mod)) {
        changed = true;
        return `import ${named} from 'packages/ui';`;
      }
      return m;
    });
  }
  if (changed) return src;
  return null;
}

function main() {
  const files = walk(path.join(root, 'src'));
  const changedFiles = [];
  const dry = process.argv.includes('--dry-run');
  for (const f of files) {
    const next = transformFile(f);
    if (next != null) {
      if (!dry) fs.writeFileSync(f, next);
      changedFiles.push(path.relative(root, f));
    }
  }
  const outDir = path.join(root, 'tmp');
  fs.mkdirSync(outDir, { recursive: true });
  const logPath = path.join(outDir, 'codemod-replace-imports.json');
  fs.writeFileSync(logPath, JSON.stringify({ changedFiles }, null, 2));
  console.log(`Updated ${changedFiles.length} files`);
  console.log('Log at', logPath);
}

if (require.main === module) main();


