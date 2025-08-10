import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export interface ProgressionResponse {
  currentYear: number;
  creditsPassedThisYear: number;
  requiredCreditsForYear: number;
  percentPassed: number;
  electiveGroups: Array<{
    id: string;
    name: string;
    requiredCredits: number;
    completedCredits: number;
  }>;
  warnings: string[];
}

export async function GET() {
  try {
    // Get the first user (using same pattern as other APIs)
    const userId = (await prisma.user.findFirst({ select: { id: true } }))?.id;
    if (!userId) {
      return NextResponse.json({ 
        error: 'No user found' 
      }, { status: 404 });
    }

    // Get user's modules with their completion status
    const modules = await prisma.module.findMany({
      where: { ownerId: userId },
      include: {
        assignments: {
          where: { status: 'GRADED' },
          select: { score: true, maxScore: true, weight: true }
        }
      }
    });

    // Calculate year based on module codes (simplified logic)
    const currentYear = getCurrentAcademicYear(modules);
    
    // Get modules for current year and calculate progress
    const currentYearModules = modules.filter(module => {
      const year = getModuleYear(module.code);
      return year === currentYear;
    });

    const { creditsPassedThisYear, requiredCreditsForYear } = calculateYearProgress(currentYearModules);
    const percentPassed = requiredCreditsForYear > 0 ? (creditsPassedThisYear / requiredCreditsForYear) * 100 : 0;

    // Calculate elective group progress
    const electiveGroups = calculateElectiveGroupProgress(modules);

    // Generate warnings
    const warnings = generateWarnings(modules, currentYear, percentPassed, electiveGroups);

    const response: ProgressionResponse = {
      currentYear,
      creditsPassedThisYear,
      requiredCreditsForYear,
      percentPassed: Math.round(percentPassed * 100) / 100,
      electiveGroups,
      warnings
    };

    return NextResponse.json(response);
  } catch (e: unknown) {
    const msg = e instanceof Error ? e.message : 'Failed to get progression data';
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}

interface ModuleWithAssignments {
  id: string;
  code: string;
  title: string;
  creditHours: number;
  electiveGroup: string | null;
  isCore: boolean;
  assignments: Array<{
    score: number | null;
    maxScore: number | null;
    weight: number;
    status?: string;
    dueDate?: Date | null;
  }>;
}

function getCurrentAcademicYear(modules: ModuleWithAssignments[]): number {
  // Determine current year based on enrolled modules
  const years = modules.map(m => getModuleYear(m.code)).filter(y => y > 0);
  return years.length > 0 ? Math.max(...years) : 1;
}

function getModuleYear(moduleCode: string): number {
  // Extract year from module code (e.g., STK110 = year 1, STK210 = year 2)
  const match = moduleCode.match(/\d+/);
  if (!match) return 0;
  
  const number = parseInt(match[0]);
  if (number >= 100 && number < 200) return 1;
  if (number >= 200 && number < 300) return 2;
  if (number >= 300 && number < 400) return 3;
  return 1; // Default to year 1
}

function calculateYearProgress(yearModules: ModuleWithAssignments[]): { creditsPassedThisYear: number; requiredCreditsForYear: number } {
  let creditsPassedThisYear = 0;
  let requiredCreditsForYear = 0;

  for (const module of yearModules) {
    requiredCreditsForYear += module.creditHours;
    
    // Calculate if module is passed (>= 50% average)
    if (module.assignments.length > 0) {
      const totalWeight = module.assignments.reduce((sum: number, a) => sum + a.weight, 0);
      const weightedScore = module.assignments.reduce((sum: number, a) => {
        if (a.score !== null && a.maxScore && a.maxScore > 0) {
          return sum + (a.score / a.maxScore) * a.weight;
        }
        return sum;
      }, 0);
      
      const average = totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0;
      
      if (average >= 50) {
        creditsPassedThisYear += module.creditHours;
      }
    }
  }

  return { creditsPassedThisYear, requiredCreditsForYear };
}

function calculateElectiveGroupProgress(modules: ModuleWithAssignments[]): Array<{
  id: string;
  name: string;
  requiredCredits: number;
  completedCredits: number;
}> {
  const electiveGroups = new Map<string, { requiredCredits: number; completedCredits: number }>();
  
  // DSM elective group requirements (from seed data)
  const DSM_REQUIRED_CREDITS = 36;
  
  for (const module of modules) {
    if (module.electiveGroup) {
      if (!electiveGroups.has(module.electiveGroup)) {
        electiveGroups.set(module.electiveGroup, {
          requiredCredits: module.electiveGroup === 'DSM' ? DSM_REQUIRED_CREDITS : 24,
          completedCredits: 0
        });
      }
      
      // Check if module is completed (>= 50% average)
      if (module.assignments.length > 0) {
        const totalWeight = module.assignments.reduce((sum: number, a) => sum + a.weight, 0);
        const weightedScore = module.assignments.reduce((sum: number, a) => {
          if (a.score !== null && a.maxScore && a.maxScore > 0) {
            return sum + (a.score / a.maxScore) * a.weight;
          }
          return sum;
        }, 0);
        
        const average = totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0;
        
        if (average >= 50) {
          const group = electiveGroups.get(module.electiveGroup)!;
          group.completedCredits += module.creditHours;
        }
      }
    }
  }
  
  return Array.from(electiveGroups.entries()).map(([groupName, data]) => ({
    id: groupName,
    name: groupName === 'DSM' ? 'Data Science & Machine Learning' : groupName,
    requiredCredits: data.requiredCredits,
    completedCredits: data.completedCredits
  }));
}

function generateWarnings(
  modules: ModuleWithAssignments[], 
  currentYear: number, 
  percentPassed: number, 
  electiveGroups: Array<{ id: string; name: string; requiredCredits: number; completedCredits: number }>
): string[] {
  const warnings: string[] = [];
  
  // Year progress warning
  if (percentPassed < 50) {
    warnings.push(`Year ${currentYear} progress is concerning: only ${percentPassed.toFixed(1)}% of credits passed`);
  }
  
  // At-risk modules warning
  const atRiskModules = modules.filter(module => {
    if (module.assignments.length === 0) return false;
    
    const totalWeight = module.assignments.reduce((sum: number, a) => sum + a.weight, 0);
    const weightedScore = module.assignments.reduce((sum: number, a) => {
      if (a.score !== null && a.maxScore && a.maxScore > 0) {
        return sum + (a.score / a.maxScore) * a.weight;
      }
      return sum;
    }, 0);
    
    const average = totalWeight > 0 ? (weightedScore / totalWeight) * 100 : 0;
    return average < 50 && average > 0; // Has grades but failing
  });
  
  if (atRiskModules.length > 0) {
    warnings.push(`${atRiskModules.length} modules are at risk: ${atRiskModules.map(m => m.code).join(', ')}`);
  }
  
  // Elective group warnings
  electiveGroups.forEach(group => {
    const progressPercent = (group.completedCredits / group.requiredCredits) * 100;
    if (progressPercent < 25 && currentYear >= 2) {
      warnings.push(`${group.name} electives behind schedule: ${group.completedCredits}/${group.requiredCredits} credits`);
    }
  });
  
  // Overdue assignments warning
  const now = new Date();
  const overdueCount = modules.reduce((count, module) => {
    return count + module.assignments.filter((a) => 
      a.status === 'PENDING' && a.dueDate && new Date(a.dueDate) < now
    ).length;
  }, 0);
  
  if (overdueCount > 0) {
    warnings.push(`${overdueCount} overdue assignments require immediate attention`);
  }
  
  return warnings;
}
