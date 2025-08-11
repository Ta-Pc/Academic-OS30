import { NextRequest, NextResponse } from 'next/server';
import { parseCsv, toDate, toNumber, normalizeStatus, normalizeType } from '@/lib/csv';
import { prisma } from '@/lib/prisma';
import { $Enums, type Prisma } from '@prisma/client';

export async function POST(req: NextRequest) {
  try {
  const { importType, raw, mapping, termId } = await req.json();
  const { rows } = parseCsv(raw);
  type CsvRow = Record<string, string | undefined>;
  const failures: Array<{ row: CsvRow; reason: string }> = [];
    let successCount = 0;
    const processed: string[] = [];

    if (importType === 'modules') {
  for (const r of rows as CsvRow[]) {
        try {
          const code = r[mapping['code']]?.trim();
          const title = r[mapping['title']]?.trim();
          const creditHours = toNumber(r[mapping['creditHours']]);
          const targetMark = toNumber(r[mapping['targetMark']]);
          const status = r[mapping['status']]?.trim();
          const department = r[mapping['department']]?.trim();
          const faculty = r[mapping['faculty']]?.trim();
          const prerequisites = r[mapping['prerequisites']]?.trim();
          // description ignored for module import
          if (!code || !title || creditHours == null) {
            throw new Error(`validation failed: code='${code}', title='${title}', creditHours='${creditHours}' (parsed from '${r[mapping['creditHours']]}')`);
          }
          const rawStatus: $Enums.ModuleStatus | undefined = status && ['ACTIVE','PLANNED','ARCHIVED'].includes(status as string)
            ? (status as $Enums.ModuleStatus)
            : undefined;
          let startDate: Date | undefined = undefined;
          let endDate: Date | undefined = undefined;
          if (termId) {
            const term = await prisma.term.findUnique({ where: { id: termId } });
            if (term) { startDate = term.startDate; endDate = term.endDate; }
          }
          const existing = await prisma.module.findFirst({ where: { code } });
          if (existing) {
            const updateData: Prisma.ModuleUpdateInput = {
              title,
              creditHours,
              targetMark: targetMark ?? null,
              status: rawStatus,
              department,
              faculty,
              prerequisites,
              startDate: startDate ?? existing.startDate,
              endDate: endDate ?? existing.endDate
            };

            // Add term relation if termId provided
            if (termId) {
              updateData.term = { connect: { id: termId } };
            } else if (existing.termId) {
              updateData.term = { connect: { id: existing.termId } };
            }

            await prisma.module.update({
              where: { id: existing.id },
              data: updateData
            });
          } else {
            const moduleData: any = {
              code,
              title,
              creditHours,
              targetMark: targetMark ?? null,
              status: rawStatus,
              department,
              faculty,
              prerequisites,
              // user ownership removed
              startDate,
              endDate
            };

            // Add term relation if termId provided
            if (termId) {
              moduleData.term = { connect: { id: termId } };
            }

            await prisma.module.create({
              data: moduleData
            });
          }
          processed.push(code);
          successCount++;
        } catch (e) {
          failures.push({ row: r, reason: (e as Error).message || 'failed' });
        }
      }
    } else {
      for (const r of rows as CsvRow[]) {
        try {
          const moduleCode = r[mapping['moduleCode']]?.trim();
          const title = r[mapping['title']]?.trim();
          const weight = toNumber(r[mapping['weight']]);
          const dueDate = toDate(r[mapping['dueDate']]);
          const status = normalizeStatus(r[mapping['status']]);
          const type = normalizeType(r[mapping['type']]);
          // score is a percentage (0-100). Ignore maxScore entirely
          const score = toNumber(r[mapping['score']]);
          const description = r[mapping['description']]?.trim(); // used in assignment create
          // effortEstimateMinutes currently unused in data model
          const componentName = r[mapping['component']]?.trim();
          if (!moduleCode || !title || weight == null) throw new Error('moduleCode, title, weight required');
          const mod = await prisma.module.findFirst({ where: { code: moduleCode } });
          if (!mod) throw new Error(`Module code '${moduleCode}' not found`);
          let componentId: string | null = null;
          if (componentName) {
            const comp = await prisma.assessmentComponent.findFirst({ where: { moduleId: mod.id, name: componentName } });
            if (comp) componentId = comp.id;
          }
          await prisma.assignment.create({ data: { title, weight: weight ?? 0, dueDate: dueDate ?? undefined, status, type, score: score ?? undefined, description: description ?? undefined, moduleId: mod.id, componentId } });
          processed.push(moduleCode);
          successCount++;
        } catch (e) {
          failures.push({ row: r, reason: (e as Error).message || 'failed' });
        }
      }
    }

  return NextResponse.json({ total: rows.length, successCount, failures, processed_codes: processed, mapping_received: mapping, importType, termId });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message || 'ingest failed' }, { status: 400 });
  }
}

