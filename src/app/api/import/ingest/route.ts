import { NextRequest, NextResponse } from 'next/server';
import { parseCsv, toDate, toNumber, normalizeStatus, normalizeType } from '@/lib/csv';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const { importType, raw, mapping, userId: bodyUserId } = await req.json();
    let userId = bodyUserId as string | undefined;
    if (!userId) {
      userId = (await prisma.user.findFirst({ select: { id: true } }))?.id;
    }
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });
    const { rows } = parseCsv(raw);
    const failures: Array<{ row: any; reason: string }> = [];
    let successCount = 0;

    if (importType === 'modules') {
      for (const r of rows) {
        try {
          const code = r[mapping['code']]?.trim();
          const title = r[mapping['title']]?.trim();
          const creditHours = toNumber(r[mapping['creditHours']]);
          const targetMark = toNumber(r[mapping['targetMark']]);
          const status = r[mapping['status']]?.trim();
          const department = r[mapping['department']]?.trim();
          const faculty = r[mapping['faculty']]?.trim();
          const prerequisites = r[mapping['prerequisites']]?.trim();
          const description = r[mapping['description']]?.trim();
          if (!code || !title || creditHours == null) throw new Error('code, title, credits required');
          await prisma.module.create({ data: { code, title, creditHours, targetMark: targetMark ?? null, status: (status as any) ?? undefined, department, faculty, prerequisites, owner: { connect: { id: userId } } } });
          successCount++;
        } catch (e: any) {
          failures.push({ row: r, reason: e.message || 'failed' });
        }
      }
    } else {
      for (const r of rows) {
        try {
          const moduleCode = r[mapping['moduleCode']]?.trim();
          const title = r[mapping['title']]?.trim();
          const weight = toNumber(r[mapping['weight']]);
          const dueDate = toDate(r[mapping['dueDate']]);
          const status = normalizeStatus(r[mapping['status']]);
          const type = normalizeType(r[mapping['type']]);
          // score is a percentage (0-100). Ignore maxScore entirely
          const score = toNumber(r[mapping['score']]);
          const description = r[mapping['description']]?.trim();
          const effortEstimateMinutes = toNumber(r[mapping['effortEstimateMinutes']]);
          const componentName = r[mapping['component']]?.trim();
          if (!moduleCode || !title || weight == null) throw new Error('moduleCode, title, weight required');
          const mod = await prisma.module.findFirst({ where: { code: moduleCode, ownerId: userId } });
          if (!mod) throw new Error(`Module code '${moduleCode}' not found`);
          let componentId: string | null = null;
          if (componentName) {
            const comp = await prisma.assessmentComponent.findFirst({ where: { moduleId: mod.id, name: componentName } });
            if (comp) componentId = comp.id;
          }
          await prisma.assignment.create({ data: { title, weight: weight ?? 0, dueDate: dueDate ?? undefined, status, type, score: score ?? undefined, description: description ?? undefined, moduleId: mod.id, componentId } });
          successCount++;
        } catch (e: any) {
          failures.push({ row: r, reason: e.message || 'failed' });
        }
      }
    }

    return NextResponse.json({ total: rows.length, successCount, failures });
  } catch (e: any) {
    return NextResponse.json({ error: e.message || 'ingest failed' }, { status: 400 });
  }
}

