import { PrismaClient } from '@prisma/client';
import { writeFileSync, mkdirSync } from 'fs';
import { join } from 'path';

// BIT (DSM) curriculum seed script
// Idempotent: uses upsert / find + create pattern; safe to run multiple times.
// Assumptions:
//  - Degree title: 'BSc Information Technology (Data Science)'
//  - Two semesters per academic year.
//  - Current academic year spans Jan 15 – Nov 30 (approx) of current year.
//  - Year modules span both semesters.
//  - Elective group 'DSM' applied to elective (non-core) modules flagged accordingly.

const prisma = new PrismaClient();

interface CurriculumModuleDef {
  code: string;
  title: string;
  credits: number;
  core: boolean;
  electiveGroup?: string;
  span: 'SEMESTER' | 'YEAR' | 'QUARTER';
  year: number; // academic year of study (1..3)
  term?: 1 | 2; // for SEMESTER span modules
  prerequisites?: string[]; // list of module codes
}

// Minimal representative subset for brevity; extend as needed.
const curriculum: CurriculumModuleDef[] = [
  // Year 1
  { code: 'COS132', title: 'Imperative Programming', credits: 16, core: true, span: 'SEMESTER', year: 1, term: 1 },
  { code: 'COS151', title: 'Intro to Computer Science', credits: 8, core: true, span: 'SEMESTER', year: 1, term: 1 },
  { code: 'WTW114', title: 'Calculus 1', credits: 16, core: true, span: 'SEMESTER', year: 1, term: 1 },
  { code: 'WTW124', title: 'Mathematics 124', credits: 16, core: true, span: 'SEMESTER', year: 1, term: 2, prerequisites: ['WTW114'] },
  { code: 'COS212', title: 'Data Structures & Algorithms', credits: 16, core: true, span: 'SEMESTER', year: 1, term: 2, prerequisites: ['COS132'] },
  { code: 'INF114', title: 'Informatics Foundations', credits: 6, core: true, span: 'SEMESTER', year: 1, term: 2 },
  { code: 'STK110', title: 'Statistics 110', credits: 12, core: true, span: 'SEMESTER', year: 1, term: 1 },
  { code: 'STK120', title: 'Statistics 120', credits: 12, core: true, span: 'SEMESTER', year: 1, term: 2, prerequisites: ['STK110'] },
  // Year 2
  { code: 'COS226', title: 'Computer Organisation', credits: 16, core: true, span: 'SEMESTER', year: 2, term: 1, prerequisites: ['COS212'] },
  { code: 'COS284', title: 'Database Systems', credits: 16, core: true, span: 'SEMESTER', year: 2, term: 2, prerequisites: ['COS212'] },
  { code: 'WTW211', title: 'Linear Algebra', credits: 12, core: true, span: 'SEMESTER', year: 2, term: 1 },
  { code: 'WTW218', title: 'Calculus 2', credits: 12, core: true, span: 'SEMESTER', year: 2, term: 2, prerequisites: ['WTW114'] },
  { code: 'COS256', title: 'Operating Systems', credits: 16, core: true, span: 'SEMESTER', year: 2, term: 2, prerequisites: ['COS226'] },
  { code: 'STK210', title: 'Statistical Methods', credits: 20, core: true, span: 'SEMESTER', year: 2, term: 1, prerequisites: ['STK120'] },
  { code: 'STK220', title: 'Statistical Inference', credits: 20, core: true, span: 'SEMESTER', year: 2, term: 2, prerequisites: ['STK210'] },
  // Year 3 (include some electives)
  { code: 'COS314', title: 'Software Engineering', credits: 18, core: true, span: 'SEMESTER', year: 3, term: 1 },
  { code: 'COS344', title: 'Computer Graphics', credits: 18, core: false, electiveGroup: 'DSM', span: 'SEMESTER', year: 3, term: 2, prerequisites: ['COS212'] },
  { code: 'STK310', title: 'Regression Analysis', credits: 20, core: true, span: 'SEMESTER', year: 3, term: 1, prerequisites: ['STK220'] },
  { code: 'STK320', title: 'Multivariate Analysis', credits: 20, core: true, span: 'SEMESTER', year: 3, term: 2, prerequisites: ['STK310'] },
  { code: 'COS330', title: 'Artificial Intelligence', credits: 18, core: false, electiveGroup: 'DSM', span: 'SEMESTER', year: 3, term: 1, prerequisites: ['COS212'] },
  { code: 'COS333', title: 'Programming Languages', credits: 18, core: false, electiveGroup: 'DSM', span: 'SEMESTER', year: 3, term: 2, prerequisites: ['COS212'] },
];

async function ensureSeedUser() {
  return prisma.user.upsert({
    where: { id: 'seed-user-1' },
    update: {},
    create: { id: 'seed-user-1', email: 'seed@local', name: 'Seed User' },
  });
}

async function ensureDegree() {
  const title = 'BSc Information Technology (Data Science)';
  let degree = await prisma.degree.findFirst({ where: { title } });
  if (!degree) {
    degree = await prisma.degree.create({ data: { title } });
  }
  return degree;
}

async function ensureAcademicYear(userId: string) {
  const now = new Date();
  const year = now.getFullYear();
  const startDate = new Date(year, 0, 15); // Jan 15
  const endDate = new Date(year, 10, 30); // Nov 30
  const title = `${year} Academic Year`;
  let ay = await prisma.academicYear.findFirst({ where: { title, ownerId: userId } });
  if (!ay) {
    ay = await prisma.academicYear.create({ data: { title, startDate, endDate, ownerId: userId } });
  }
  return ay;
}

async function ensureTerms(degreeId: string, academicYearId: string, ownerId: string) {
  const ay = await prisma.academicYear.findUnique({ where: { id: academicYearId } });
  if (!ay) throw new Error('AcademicYear missing');
  const mid = new Date(ay.startDate.getFullYear(), 5, 30); // June 30 split
  const sem1Start = ay.startDate;
  const sem1End = mid;
  const sem2Start = new Date(mid.getFullYear(), 6, 1);
  const sem2End = ay.endDate;

  const existing = await prisma.term.findMany({ where: { academicYearId } });
  const needed: { title: string; startDate: Date; endDate: Date; order: number }[] = [
    { title: `${ay.title} - Semester 1`, startDate: sem1Start, endDate: sem1End, order: 1 },
    { title: `${ay.title} - Semester 2`, startDate: sem2Start, endDate: sem2End, order: 2 },
  ];

  const terms: Record<number, { id: string; startDate: Date; endDate: Date }> = {};
  for (const def of needed) {
  let t = existing.find((e: any) => e.title === def.title);
    if (!t) {
      t = await prisma.term.create({
        data: {
          title: def.title,
          startDate: def.startDate,
          endDate: def.endDate,
          degreeId,
          academicYearId,
          ownerId,
          type: 'SEMESTER',
        },
      });
    }
    terms[def.order] = { id: t.id, startDate: t.startDate, endDate: t.endDate };
  }
  return terms;
}

async function seedModules(userId: string, degreeId: string, terms: Record<number, { id: string; startDate: Date; endDate: Date }>) {
  const created: any[] = [];
  for (const m of curriculum) {
    // Determine date range
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    let termId: string | undefined;
    if (m.span === 'SEMESTER') {
      const term = terms[m.term!];
      startDate = term.startDate;
      endDate = term.endDate;
      termId = term.id;
    } else if (m.span === 'YEAR') {
      const t1 = terms[1];
      const t2 = terms[2];
      startDate = t1.startDate;
      endDate = t2.endDate;
      // choose first term to attach for referential grouping
      termId = t1.id;
    } else {
      // QUARTER not yet defined; skip mapping
    }

    const existing = await prisma.module.findFirst({ where: { code: m.code, ownerId: userId } });
    if (existing) {
      // Optionally update metadata if changed
      await prisma.module.update({
        where: { id: existing.id },
        data: {
          title: m.title,
          creditHours: m.credits,
          prerequisites: m.prerequisites?.join(', ') || null,
          electiveGroup: m.electiveGroup,
          isCore: m.core,
          span: m.span as any,
          startDate,
          endDate,
          termId,
        },
      });
      continue;
    }

    const mod = await prisma.module.create({
      data: {
        code: m.code,
        title: m.title,
        creditHours: m.credits,
        ownerId: userId,
        termId,
        prerequisites: m.prerequisites?.join(', ') || undefined,
        electiveGroup: m.electiveGroup,
        isCore: m.core,
  span: m.span as any,
        startDate,
        endDate,
      },
    });
    created.push(mod);
  }
  return created;
}

async function main() {
  const user = await ensureSeedUser();
  const degree = await ensureDegree();
  // attach user to degree if not yet
  if (user.degreeId !== degree.id) {
    await prisma.user.update({ where: { id: user.id }, data: { degreeId: degree.id } });
  }

  const ay = await ensureAcademicYear(user.id);
  const terms = await ensureTerms(degree.id, ay.id, user.id);
  const created = await seedModules(user.id, degree.id, terms);

  const sample = { createdModules: created.map(m => ({ code: m.code, title: m.title, startDate: m.startDate, endDate: m.endDate, span: m.span })) };
  const outDir = join(process.cwd(), 'tmp');
  try { mkdirSync(outDir, { recursive: true }); } catch {}
  const outFile = join(outDir, 'seed-sample.json');
  writeFileSync(outFile, JSON.stringify(sample, null, 2));
  console.log(JSON.stringify(sample, null, 2));
}

main().then(() => prisma.$disconnect()).catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
