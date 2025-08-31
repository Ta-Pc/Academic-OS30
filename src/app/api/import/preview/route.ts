import { NextRequest, NextResponse } from 'next/server';
import { parseCsv, toDate, toNumber, normalizeStatus, normalizeType } from '@/lib/csv';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
  const { importType, raw, mapping } = await req.json();
  const { rows } = parseCsv(raw);
  type CsvRow = Record<string, string | undefined>;
  const out: Array<Record<string, unknown>> = [];
  const errors: Array<{ row: CsvRow; reason: string }> = [];
  const duplicates: Array<{ row: CsvRow; reason: string; duplicateKey: string }> = [];

    const missingSet = new Set<string>();
    const seenKeys = new Set<string>(); // Track duplicates within CSV
    const existingKeys = new Map<string, boolean>(); // Track existing records in DB
  for (const r of rows as CsvRow[]) {
      if (importType === 'modules') {
        const code = r[mapping['code']]?.trim();
        const title = r[mapping['title']]?.trim();
        const creditHours = toNumber(r[mapping['creditHours']]);
        const status = r[mapping['status']]?.trim();
        const targetMark = toNumber(r[mapping['targetMark']]);
        const department = r[mapping['department']]?.trim();
        const faculty = r[mapping['faculty']]?.trim();
        const prerequisites = r[mapping['prerequisites']]?.trim();
        const description = r[mapping['description']]?.trim();
        if (!code || !title || creditHours == null) {
          errors.push({ row: r, reason: 'code, title, credits required' });
          continue;
        }
        
        // Check for duplicates within CSV
        const moduleKey = code.toLowerCase().trim();
        if (seenKeys.has(moduleKey)) {
          duplicates.push({ row: r, reason: `Duplicate module code '${code}' found in CSV`, duplicateKey: moduleKey });
          continue;
        }
        seenKeys.add(moduleKey);
        
        // Check for existing records in database
        if (!existingKeys.has(moduleKey)) {
          // Prisma's StringFilter type in this project does not include 'mode'.
          // Fall back to a simple equals check (case-sensitive) and rely on CSV normalization earlier.
          const existing = await prisma.module.findFirst({ where: { code: { equals: code } } });
          existingKeys.set(moduleKey, !!existing);
        }
        if (existingKeys.get(moduleKey)) {
          duplicates.push({ row: r, reason: `Module '${code}' already exists in database`, duplicateKey: moduleKey });
          continue;
        }
        
        out.push({ code, title, creditHours, status, targetMark, department, faculty, prerequisites, description });
      } else {
        const moduleCode = r[mapping['moduleCode']]?.trim();
        const title = r[mapping['title']]?.trim();
        const weight = toNumber(r[mapping['weight']]);
        const dueDate = toDate(r[mapping['dueDate']]);
        const status = normalizeStatus(r[mapping['status']]);
        const type = normalizeType(r[mapping['type']]);
        // score is a percentage
        const score = toNumber(r[mapping['score']]);
        const description = r[mapping['description']]?.trim();
        const effortEstimateMinutes = toNumber(r[mapping['effortEstimateMinutes']]);
        const component = r[mapping['component']]?.trim() || null;
        if (!moduleCode || !title || weight == null) {
          errors.push({ row: r, reason: 'moduleCode, title, weight required' });
          continue;
        }
        
        // Check for duplicates within CSV
        const assignmentKey = `${moduleCode.toLowerCase().trim()}-${title.toLowerCase().trim()}`;
        if (seenKeys.has(assignmentKey)) {
          duplicates.push({ row: r, reason: `Duplicate assignment '${title}' for module '${moduleCode}' found in CSV`, duplicateKey: assignmentKey });
          continue;
        }
        seenKeys.add(assignmentKey);
        
        // Check for existing assignments in database
        if (!existingKeys.has(assignmentKey)) {
          const existing = await prisma.assignment.findFirst({ 
            where: { 
              AND: [
                { module: { code: { equals: moduleCode } } },
                { title: { equals: title } }
              ]
            } 
          });
          existingKeys.set(assignmentKey, !!existing);
        }
        if (existingKeys.get(assignmentKey)) {
          duplicates.push({ row: r, reason: `Assignment '${title}' for module '${moduleCode}' already exists in database`, duplicateKey: assignmentKey });
          continue;
        }
        
        // Track missing modules for helper creation
        const mod = moduleCode ? await prisma.module.findFirst({ where: { code: moduleCode } }) : null;
        if (!mod) missingSet.add(moduleCode);
        out.push({ moduleCode, title, weight, dueDate: dueDate?.toISOString() ?? null, status, type, score, description, effortEstimateMinutes, component });
      }
    }

    return NextResponse.json({ preview: { valid: out, errors, duplicates, missingModules: Array.from(missingSet) } });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message || 'preview failed' }, { status: 400 });
  }
}

