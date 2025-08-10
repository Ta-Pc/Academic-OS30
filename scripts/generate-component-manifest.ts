import path from 'path';
import fs from 'fs';
import { Project, Node } from 'ts-morph';

type ComponentRecord = {
  componentName: string;
  filePath: string;
  defaultExportName: string | null;
  propsType: string | null;
  usedByPages: string[];
  usedByComponents: string[];
  cssFiles: string[];
  storyExists: boolean;
  visualVariants?: string[];
  manualMigrationRequired?: boolean;
  reason?: string;
};

function isComponentFile(fp: string) {
  // Only scan presentational/component-like files under src/components and app subtrees (exclude route/page boilerplate)
  if (!/\.(tsx)$/.test(fp)) return false;
  if (fp.includes('/api/') || fp.includes('/server/') || fp.includes('/stories/')) return false;
  if (fp.endsWith('/page.tsx') || fp.endsWith('/layout.tsx')) return false;
  return true;
}

function listFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    if (entry.name.startsWith('.')) continue;
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...listFiles(full));
    else out.push(full.replace(/\\/g, '/'));
  }
  return out;
}

function detectPropsType(source: import('ts-morph').SourceFile): string | null {
  const exports = source.getExportedDeclarations();
  for (const [name, decls] of exports) {
    for (const d of decls) {
      if (Node.isFunctionDeclaration(d) || Node.isVariableDeclaration(d)) {
        const typeParams = (d as any).getTypeParameters?.();
        const params = (d as any).getParameters?.();
      if (params && params.length > 0) {
          const p = params[0];
          const t = p.getType().getText();
          if (t && t !== 'any') return t;
        }
      }
    }
  }
  const def = source.getDefaultExportSymbol();
  if (def) {
    const d = def.getDeclarations()?.[0];
    if (d && (Node.isFunctionDeclaration(d) || Node.isVariableDeclaration(d))) {
      const params = (d as any).getParameters?.();
      if (params && params.length > 0) {
        const t = params[0].getType().getText();
        if (t && t !== 'any') return t;
      }
    }
  }
  return null;
}

function main() {
  const repoRoot = path.resolve(__dirname, '..');
  const srcDir = path.resolve(repoRoot, 'src');
  const files = listFiles(srcDir).filter(isComponentFile);
  if (files.length === 0) {
    console.warn('No component files found to scan.');
  }

  const project = new Project({ tsConfigFilePath: path.resolve(repoRoot, 'tsconfig.json'), skipAddingFilesFromTsConfig: true });
  files.forEach((f) => project.addSourceFileAtPath(f));

  const records: ComponentRecord[] = [];

  for (const filePath of files) {
    const source = project.getSourceFile(filePath);
    if (!source) continue;
    const rel = path.relative(repoRoot, filePath).replace(/\\/g, '/');
    const isPage = rel.includes('/app/') && rel.endsWith('/page.tsx');
    if (isPage) continue;

    const defSym = source.getDefaultExportSymbol();
    const defaultExport = defSym ? (defSym.getName ? defSym.getName() : defSym.getEscapedName?.()) ?? null : null;
    const componentName: string = defaultExport || path.basename(filePath, path.extname(filePath));
    let propsType: string | null = null;
    if (!/^[A-Z]/.test(componentName)) {
      // non-PascalCase: still attempt to detect props type for completeness
      propsType = detectPropsType(source);
      records.push({
        componentName,
        filePath: rel,
        defaultExportName: defaultExport,
        propsType,
        usedByPages: [],
        usedByComponents: [],
        cssFiles: [],
        storyExists: false,
        visualVariants: [],
        manualMigrationRequired: true,
        reason: 'Non-PascalCase export or not a typical component file',
      });
      continue;
    } else {
      propsType = detectPropsType(source);
    }

    // naive usage scan
    const usedByPages = new Set<string>();
    const usedByComponents = new Set<string>();
    for (const f of files) {
      if (f === filePath) continue;
      const sf = project.getSourceFile(f);
      if (!sf) continue;
      const imports = sf.getImportDeclarations();
      for (const imp of imports) {
        const spec = imp.getModuleSpecifierValue();
        let resolved = '';
        try {
          resolved = imp.getModuleSpecifierSourceFile()?.getFilePath() ?? '';
        } catch {}
        if (resolved && resolved.replace(/\\/g, '/') === filePath) {
          const relf = path.relative(repoRoot, f).replace(/\\/g, '/');
          if (relf.includes('/app/') && relf.endsWith('.tsx')) usedByPages.add(relf);
          else usedByComponents.add(relf);
        }
      }
    }

    const cssFiles: string[] = [];
  const storyDir1 = path.resolve(repoRoot, 'src/stories');
  const storyDir2 = path.resolve(repoRoot, 'packages/ui/stories');
  const base = path.basename(filePath, '.tsx').toLowerCase();
    const storyExists = [storyDir1, storyDir2].some((d) => fs.existsSync(d) && fs.readdirSync(d).some((s) => s.toLowerCase().includes(base)));

    const rec: ComponentRecord = {
      componentName: String(componentName),
      filePath: rel,
      defaultExportName: defaultExport,
      propsType: propsType,
      usedByPages: Array.from(usedByPages),
      usedByComponents: Array.from(usedByComponents),
      cssFiles,
      storyExists,
      visualVariants: [],
    };
    records.push(rec);
  }

  const outDir = path.resolve(repoRoot, 'tmp');
  fs.mkdirSync(outDir, { recursive: true });
  const manifestPath = path.join(outDir, 'component-manifest.json');
  fs.writeFileSync(manifestPath, JSON.stringify(records, null, 2));

  // CSV
  const csvHeaders = ['componentName','filePath','defaultExportName','propsType','usedByPages','usedByComponents','storyExists'];
  const csv = [csvHeaders.join(',')].concat(
    records.map(r => [
      r.componentName,
      r.filePath,
      r.defaultExportName ?? '',
      JSON.stringify(r.propsType ?? ''),
      JSON.stringify(r.usedByPages),
      JSON.stringify(r.usedByComponents),
      String(r.storyExists)
    ].join(','))
  ).join('\n');
  fs.writeFileSync(path.join(outDir, 'component-inventory.csv'), csv);

  console.log(`Wrote ${manifestPath} with ${records.length} components`);
}

main();


