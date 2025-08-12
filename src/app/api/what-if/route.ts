import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';
import { computeModulePrediction } from '@/utils/prediction';

const bodySchema = z.object({
  moduleId: z.string(),
  sessionOnly: z.boolean().default(true),
  changes: z.array(z.object({
    assignmentId: z.string(),
    score: z.number().min(0).max(100).nullable(), // score is percentage (0-100)
  })).default([]),
});

export async function POST(req: NextRequest) {
  try {
    const json = await req.json();
    const parsed = bodySchema.safeParse(json);
    if (!parsed.success) return NextResponse.json({ error: 'invalid body', issues: parsed.error.issues }, { status: 400 });
    const { moduleId, sessionOnly, changes } = parsed.data;

    // No user authentication needed - direct module access
    const module = await prisma.module.findUnique({
      where: { id: moduleId },
      include: { assignments: true },
    });
    if (!module) return NextResponse.json({ error: 'module not found' }, { status: 404 });

    // Create a working copy of assignments for simulation
    const simulatedAssignments = module.assignments.map(a => ({ ...a }));

    // Index for quick lookup
    const index = new Map(simulatedAssignments.map(a => [a.id, a] as const));

    for (const ch of changes) {
      const target = index.get(ch.assignmentId);
      if (!target) continue; // silently skip unknown ids
      target.score = ch.score == null ? null : ch.score;
      target.status = ch.score == null ? 'PENDING' : 'GRADED';
    }

    // Persist if commit path
    if (!sessionOnly && changes.length > 0) {
      await prisma.$transaction(async tx => {
        for (const ch of changes) {
          const found = module.assignments.find(a => a.id === ch.assignmentId);
            if (!found) continue;
          await tx.assignment.update({
            where: { id: ch.assignmentId },
            data: { score: ch.score, status: ch.score == null ? 'PENDING' : 'GRADED' },
          });
        }
      });
    }

    const prediction = computeModulePrediction(
      simulatedAssignments.map(a => ({ weight: a.weight, score: a.score, status: a.status })),
      { targetMark: module.targetMark }
    );

    // Decorate assignments with derived fields for client display
    const decorated = simulatedAssignments.map(a => {
      let gradePercent: number | null = null;
      if (a.score != null) {
        gradePercent = Number(a.score); // score is already a percentage
      }
      const contribution = (a.status === 'GRADED' && gradePercent != null)
        ? (gradePercent / 100) * (a.weight) // raw contribution before normalization
        : null;
      return {
        id: a.id,
        title: a.title,
        weight: a.weight,
        score: a.score,
        status: a.status,
        gradePercent,
        contribution,
        dueDate: a.dueDate,
      };
    });

    return NextResponse.json({
      data: {
        module: { id: module.id, code: module.code, title: module.title, targetMark: module.targetMark },
        prediction,
        assignments: decorated,
        committed: !sessionOnly,
      },
    });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'internal' }, { status: 500 });
  }
}
