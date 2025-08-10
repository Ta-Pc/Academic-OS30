import { NextRequest, NextResponse } from 'next/server';
import { parseCsv, toDate, toNumber, normalizeStatus, normalizeType } from '@/lib/csv';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
  const { importType, raw, mapping, userId: bodyUserId } = await req.json();
  const { rows } = parseCsv(raw);
  type CsvRow = Record<string, string | undefined>;
  const out: Array<Record<string, unknown>> = [];
  const errors: Array<{ row: CsvRow; reason: string }> = [];

    const missingSet = new Set<string>();
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
        // Track missing modules for helper creation (scoped to user if provided)
        let userId = bodyUserId as string | undefined;
        if (!userId) {
          userId = (await prisma.user.findFirst({ select: { id: true } }))?.id;
        }
        const mod = moduleCode ? await prisma.module.findFirst({ where: { code: moduleCode, ...(userId ? { ownerId: userId } : {}) } }) : null;
        if (!mod) missingSet.add(moduleCode);
        out.push({ moduleCode, title, weight, dueDate: dueDate?.toISOString() ?? null, status, type, score, description, effortEstimateMinutes, component });
      }
    }

    return NextResponse.json({ preview: { valid: out, errors, missingModules: Array.from(missingSet) } });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message || 'preview failed' }, { status: 400 });
  }
}

