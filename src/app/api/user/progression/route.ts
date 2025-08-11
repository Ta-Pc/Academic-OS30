import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all active modules 
    const modules = await prisma.module.findMany({
      where: { status: 'ACTIVE' },
      include: { 
        assignments: { where: { status: 'GRADED' } },
        term: true
      }
    });

    if (modules.length === 0) {
      return NextResponse.json({
        currentYear: null,
        creditsPassedThisYear: 0,
        creditsRequiredThisYear: 0,
        requiredCreditsForYear: 0,
        progressPercent: 0,
        modules: []
      });
    }

    // Calculate progression metrics
    const totalCredits = modules.reduce((sum, m) => sum + m.creditHours, 0);
    const passedCredits = modules
      .filter(m => {
        // Consider module passed if average grade >= 50%
        const gradedAssignments = m.assignments.filter(a => a.score != null);
        if (gradedAssignments.length === 0) return false;
        const avgGrade = gradedAssignments.reduce((sum, a) => {
          const score = a.score || 0;
          const maxScore = a.maxScore || 100;
          return sum + (score / maxScore) * 100;
        }, 0) / gradedAssignments.length;
        return avgGrade >= 50;
      })
      .reduce((sum, m) => sum + m.creditHours, 0);

    const progressPercent = totalCredits > 0 ? (passedCredits / totalCredits) * 100 : 0;

    return NextResponse.json({
      currentYear: new Date().getFullYear(),
      creditsPassedThisYear: passedCredits,
      creditsRequiredThisYear: totalCredits,
      requiredCreditsForYear: totalCredits,
      progressPercent,
      modules: modules.map(m => ({
        id: m.id,
        code: m.code,
        title: m.title,
        creditHours: m.creditHours,
        status: m.status,
        passed: m.assignments.length > 0 // Simplified logic
      }))
    });
  } catch (error) {
    console.error('Progression API error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch progression data' },
      { status: 500 }
    );
  }
}
