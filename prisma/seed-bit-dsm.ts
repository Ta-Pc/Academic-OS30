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
  credits: number; // maps to creditHours
  core: boolean;
  electiveGroup?: string | null;
  span: 'SEMESTER' | 'YEAR' | 'QUARTER';
  year: number; // 1..3
  term?: 1 | 2; // needed if span === SEMESTER
  prerequisites?: string[]; // module codes
  special?: 'JCP_KICKOFF'; // marker for special date handling
}

// Assumptions (can be tweaked without code changes):
const DSM_ELECTIVE_REQUIRED_CREDITS = 36; // assumption – adjust per official handbook

// Full BIT (DSM) curriculum definition (Years 1–3) – extend with any missing electives.
// Year modules INF171/271/272/370 span both semesters (span: YEAR).
// JCP202 kickoff week starts one week before Semester 1 (special: 'JCP_KICKOFF').
const curriculum: CurriculumModuleDef[] = [
  // ---------- Year 1 Core ----------
  { code: 'COS132', title: 'Imperative Programming', credits: 16, core: true, span: 'SEMESTER', year: 1, term: 1 },
  { code: 'COS151', title: 'Intro to Computer Science', credits: 8, core: true, span: 'SEMESTER', year: 1, term: 1 },
  { code: 'WTW114', title: 'Calculus 1', credits: 16, core: true, span: 'SEMESTER', year: 1, term: 1 },
  { code: 'STK110', title: 'Statistics 110', credits: 12, core: true, span: 'SEMESTER', year: 1, term: 1 },
  { code: 'WTW124', title: 'Mathematics 124', credits: 16, core: true, span: 'SEMESTER', year: 1, term: 2, prerequisites: ['WTW114'] },
  { code: 'COS212', title: 'Data Structures & Algorithms', credits: 16, core: true, span: 'SEMESTER', year: 1, term: 2, prerequisites: ['COS132'] },
  { code: 'INF114', title: 'Informatics Foundations', credits: 6, core: true, span: 'SEMESTER', year: 1, term: 2 },
  { code: 'STK120', title: 'Statistics 120', credits: 12, core: true, span: 'SEMESTER', year: 1, term: 2, prerequisites: ['STK110'] },
  // Year module (example) – adjust credits & title as per official handbook if different
  { code: 'INF171', title: 'Information Systems Analysis and Design', credits: 12, core: true, span: 'YEAR', year: 1, prerequisites: ['COS132'] },
  { code: 'JCP202', title: 'Community-Based Project', credits: 8, core: true, span: 'SEMESTER', year: 1, term: 1, special: 'JCP_KICKOFF' },

  // ---------- Year 2 Core ----------
  { code: 'COS226', title: 'Computer Organisation', credits: 16, core: true, span: 'SEMESTER', year: 2, term: 1, prerequisites: ['COS212'] },
  { code: 'WTW211', title: 'Linear Algebra', credits: 12, core: true, span: 'SEMESTER', year: 2, term: 1 },
  { code: 'STK210', title: 'Statistical Methods', credits: 20, core: true, span: 'SEMESTER', year: 2, term: 1, prerequisites: ['STK120'] },
  { code: 'COS284', title: 'Database Systems', credits: 16, core: true, span: 'SEMESTER', year: 2, term: 2, prerequisites: ['COS212'] },
  { code: 'COS256', title: 'Operating Systems', credits: 16, core: true, span: 'SEMESTER', year: 2, term: 2, prerequisites: ['COS226'] },
  { code: 'WTW218', title: 'Calculus 2', credits: 12, core: true, span: 'SEMESTER', year: 2, term: 2, prerequisites: ['WTW114'] },
  { code: 'STK220', title: 'Statistical Inference', credits: 20, core: true, span: 'SEMESTER', year: 2, term: 2, prerequisites: ['STK210'] },
  // Year modules
  { code: 'INF271', title: 'Information Systems Design & Development I', credits: 24, core: true, span: 'YEAR', year: 2, prerequisites: ['INF171'] },
  { code: 'INF272', title: 'Information Systems Design & Development II', credits: 24, core: true, span: 'YEAR', year: 2, prerequisites: ['INF271'] },

  // ---------- Year 3 Core & Electives ----------
  { code: 'COS314', title: 'Software Engineering', credits: 18, core: true, span: 'SEMESTER', year: 3, term: 1 },
  { code: 'STK310', title: 'Regression Analysis', credits: 20, core: true, span: 'SEMESTER', year: 3, term: 1, prerequisites: ['STK220'] },
  { code: 'COS330', title: 'Artificial Intelligence', credits: 18, core: false, electiveGroup: 'DSM', span: 'SEMESTER', year: 3, term: 1, prerequisites: ['COS212'] },
  { code: 'STK320', title: 'Multivariate Analysis', credits: 20, core: true, span: 'SEMESTER', year: 3, term: 2, prerequisites: ['STK310'] },
  { code: 'COS344', title: 'Computer Graphics', credits: 18, core: false, electiveGroup: 'DSM', span: 'SEMESTER', year: 3, term: 2, prerequisites: ['COS212'] },
  { code: 'COS333', title: 'Programming Languages', credits: 18, core: false, electiveGroup: 'DSM', span: 'SEMESTER', year: 3, term: 2, prerequisites: ['COS212'] },
  // Final-year project / capstone year module (example)
  { code: 'INF370', title: 'Information Systems Project', credits: 32, core: true, span: 'YEAR', year: 3, prerequisites: ['INF272'] },
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
    let t = existing.find((e) => e.title === def.title);
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

interface SeedOperationPlan {
  action: 'create' | 'update' | 'noop';
  code: string;
  changes?: Record<string, unknown>;
}

async function seedModules(
  userId: string,
  degreeId: string, // eslint-disable-line @typescript-eslint/no-unused-vars
  terms: Record<number, { id: string; startDate: Date; endDate: Date }>,
  dryRun: boolean,
  offline = false,
) {
  const created: { code: string }[] = [];
  const updated: { code: string }[] = [];
  const plans: SeedOperationPlan[] = [];

  const t1 = terms[1];
  const t2 = terms[2];

  for (const m of curriculum) {
    // Compute date range
    let startDate: Date | undefined;
    let endDate: Date | undefined;
    let termId: string | undefined;

    if (m.span === 'SEMESTER') {
      const term = terms[m.term!];
      startDate = new Date(term.startDate);
      endDate = new Date(term.endDate);
      if (m.special === 'JCP_KICKOFF') {
        // Kickoff one week earlier
        startDate = new Date(startDate.getTime() - 7 * 24 * 60 * 60 * 1000);
      }
      termId = term.id;
    } else if (m.span === 'YEAR') {
      startDate = new Date(t1.startDate);
      endDate = new Date(t2.endDate);
      termId = t1.id; // anchor to first term for reference
    } else if (m.span === 'QUARTER') {
      // Not modelled yet – default to semester 1 window (can refine later)
      startDate = new Date(t1.startDate);
      endDate = new Date(t1.endDate);
      termId = t1.id;
    }

  let existing: { id: string } | null = null;
    if (!offline) {
      existing = await prisma.module.findFirst({ where: { code: m.code, ownerId: userId } });
    }
    const baseData: { title: string; creditHours: number; prerequisites: string | null; electiveGroup: string | null; isCore: boolean; span: 'SEMESTER' | 'YEAR' | 'QUARTER'; startDate?: Date; endDate?: Date; termId?: string } = {
      title: m.title,
      creditHours: m.credits,
      prerequisites: m.prerequisites?.join(', ') || null,
      electiveGroup: m.electiveGroup ?? null,
      isCore: m.core,
      span: m.span,
      startDate,
      endDate,
      termId,
    };

    if (existing) {
      // Determine if any field changed
      const diff: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(baseData)) {
        const current = (existing as unknown as Record<string, unknown>)[k];
        const isDate = v instanceof Date;
        const changed = isDate ? (current ? new Date(current as string).getTime() !== (v as Date).getTime() : true) : current !== v;
        if (changed) diff[k] = v;
      }
      if (Object.keys(diff).length === 0) {
        plans.push({ action: 'noop', code: m.code });
      } else {
        plans.push({ action: 'update', code: m.code, changes: diff });
        if (!dryRun && !offline) {
          const mod = await prisma.module.update({ where: { id: existing.id }, data: diff });
          updated.push({ code: mod.code });
        }
      }
      continue;
    }

    plans.push({ action: 'create', code: m.code, changes: baseData });
    if (!dryRun && !offline) {
  const mod = await prisma.module.create({ data: { code: m.code, ownerId: userId, ...baseData } });
      created.push({ code: mod.code });
    }
  }
  return { created, updated, plans };
}

async function main() {
  const dryRun = process.argv.includes('--dry-run');
  let offline = false;
  let user: { id: string; degreeId?: string | null } | null = null;
  let degree: { id: string } | null = null;
  let terms: Record<number, { id: string; startDate: Date; endDate: Date }> = {} as Record<number, { id: string; startDate: Date; endDate: Date }>;
  try {
    user = await ensureSeedUser();
    degree = await ensureDegree();
    if (user.degreeId !== degree.id) {
      await prisma.user.update({ where: { id: user.id }, data: { degreeId: degree.id } });
    }
    const ay = await ensureAcademicYear(user.id);
    terms = await ensureTerms(degree.id, ay.id, user.id);
  } catch (err) {
    if (dryRun) {
      offline = true;
      // Synthesize academic year + terms for planning only
      const now = new Date();
      const year = now.getFullYear();
      const startDate = new Date(year, 0, 15);
      const mid = new Date(year, 5, 30);
      const endDate = new Date(year, 10, 30);
      terms = {
        1: { id: 'T1-OFFLINE', startDate, endDate: mid },
        2: { id: 'T2-OFFLINE', startDate: new Date(year, 6, 1), endDate },
      };
    } else {
      throw err; // non-dry-run must fail fast
    }
  }

  const { created, updated, plans } = await seedModules(user?.id || 'OFFLINE_USER', degree?.id || 'OFFLINE_DEGREE', terms, dryRun || offline, offline);

  // Report metrics
  const allCodes = new Set(curriculum.map(c => c.code));
  const electiveCreditsSeeded = curriculum.filter(m => !m.core && m.electiveGroup === 'DSM').reduce((s, m) => s + m.credits, 0);
  const missingPrereqEntries: { module: string; missing: string[] }[] = [];
  for (const m of curriculum) {
    if (m.prerequisites && m.prerequisites.length) {
      const missing = m.prerequisites.filter(p => !allCodes.has(p));
      if (missing.length) missingPrereqEntries.push({ module: m.code, missing });
    }
  }

  const report = {
    dryRun,
    offline,
    totalModulesDefined: curriculum.length,
    operationsPlanned: plans.length,
    createPlanned: plans.filter(p => p.action === 'create').length,
    updatePlanned: plans.filter(p => p.action === 'update').length,
    noop: plans.filter(p => p.action === 'noop').length,
    created: created.map(m => m.code),
    updated: updated.map(m => m.code),
    coreCount: curriculum.filter(m => m.core).length,
    electiveCount: curriculum.filter(m => !m.core).length,
    dsmElectiveRequiredCredits: DSM_ELECTIVE_REQUIRED_CREDITS,
    dsmElectiveSeededCredits: electiveCreditsSeeded,
    dsmElectiveCreditGap: DSM_ELECTIVE_REQUIRED_CREDITS - electiveCreditsSeeded,
    yearModules: curriculum.filter(m => m.span === 'YEAR').map(m => m.code),
    jcpKickoffAdjusted: curriculum.filter(m => m.special === 'JCP_KICKOFF').map(m => m.code),
    missingPrerequisites: missingPrereqEntries,
    timestamp: new Date().toISOString(),
  };

  const outDir = join(process.cwd(), 'tmp');
  try {
    mkdirSync(outDir, { recursive: true });
  } catch {
    // ignore directory creation race
  }
  const outFile = join(outDir, 'seed-curriculum-report.json');
  writeFileSync(outFile, JSON.stringify(report, null, 2));

  if (dryRun) {
    console.log('\n[DRY RUN] BIT (DSM) Curriculum Seed Plan');
    for (const p of plans) {
      if (p.action === 'noop') {
        console.log(` = ${p.code} (no changes)`);
      } else {
        console.log(` ${p.action === 'create' ? '+' : '~'} ${p.code}`);
      }
    }
  } else {
    console.log('Seeded/Updated BIT (DSM) curriculum. Report written to tmp/seed-curriculum-report.json');
  }
  console.log(JSON.stringify(report, null, 2));
}

main().then(() => prisma.$disconnect()).catch(e => { console.error(e); prisma.$disconnect(); process.exit(1); });
