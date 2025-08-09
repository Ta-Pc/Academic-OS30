import fs from 'fs';
import path from 'path';

type Tokens = typeof import('../packages/ui/design-tokens.json');

const tokensPath = path.resolve(__dirname, '../packages/ui/design-tokens.json');
const outPath = path.resolve(__dirname, '../tmp/generated-tailwind-theme.json');

function main() {
  const raw = fs.readFileSync(tokensPath, 'utf-8');
  const tokens: Tokens = JSON.parse(raw);
  const theme = {
    colors: tokens.colors,
    borderRadius: tokens.radii,
    fontFamily: { sans: tokens.typography.fontFamilySans },
  };
  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, JSON.stringify(theme, null, 2));
  console.log('Wrote', outPath);
}

main();


