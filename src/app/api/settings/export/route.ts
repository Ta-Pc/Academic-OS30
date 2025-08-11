import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    // Get all data for export
    const [
      modules,
      assignments,
      tacticalTasks,
      terms,
      degrees,
      users,
      studyLogs
    ] = await Promise.all([
      prisma.module.findMany({
        include: {
          assignments: true,
          tasks: true,
          components: true
        }
      }),
      prisma.assignment.findMany({
        include: {
          component: true
        }
      }),
      prisma.tacticalTask.findMany(),
      prisma.term.findMany(),
      prisma.degree.findMany(),
      prisma.user.findMany({
        select: {
          id: true,
          name: true,
          email: true,
          degreeId: true
        }
      }),
      prisma.studyLog.findMany()
    ]);

    const exportData = {
      metadata: {
        exportDate: new Date().toISOString(),
        version: '1.0',
        description: 'Academic OS Data Export'
      },
      data: {
        modules,
        assignments,
        tacticalTasks,
        terms,
        degrees,
        users,
        studyLogs
      },
      stats: {
        moduleCount: modules.length,
        assignmentCount: assignments.length,
        tacticalTaskCount: tacticalTasks.length,
        termCount: terms.length,
        degreeCount: degrees.length,
        userCount: users.length,
        studyLogCount: studyLogs.length
      }
    };

    // Set headers for file download
    const headers = new Headers();
    headers.set('Content-Type', 'application/json');
    headers.set('Content-Disposition', `attachment; filename="academic-os-export-${new Date().toISOString().split('T')[0]}.json"`);

    return new NextResponse(JSON.stringify(exportData, null, 2), {
      headers
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to export data' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    if (!body.data) {
      return NextResponse.json(
        { success: false, error: 'No data provided for import' },
        { status: 400 }
      );
    }

    const { data } = body;
    const importResults = {
      success: true,
      imported: {
        degrees: 0,
        terms: 0,
        modules: 0,
        assignments: 0,
        tacticalTasks: 0,
        users: 0
      },
      errors: [] as string[]
    };

    // Import data in order (to handle relationships)
    try {
      // Import degrees first
      if (data.degrees?.length > 0) {
        for (const degree of data.degrees) {
          try {
            await prisma.degree.upsert({
              where: { id: degree.id },
              update: {
                title: degree.title
              },
              create: {
                id: degree.id,
                title: degree.title
              }
            });
            importResults.imported.degrees++;
          } catch (error) {
            importResults.errors.push(`Failed to import degree ${degree.title}: ${error}`);
          }
        }
      }

      // Import terms
      if (data.terms?.length > 0) {
        for (const term of data.terms) {
          try {
            await prisma.term.upsert({
              where: { id: term.id },
              update: {
                title: term.title,
                startDate: new Date(term.startDate),
                endDate: new Date(term.endDate),
                type: term.type,
                degreeId: term.degreeId,
                academicYearId: term.academicYearId
              },
              create: {
                id: term.id,
                title: term.title,
                startDate: new Date(term.startDate),
                endDate: new Date(term.endDate),
                type: term.type,
                degreeId: term.degreeId,
                academicYearId: term.academicYearId
              }
            });
            importResults.imported.terms++;
          } catch (error) {
            importResults.errors.push(`Failed to import term ${term.title}: ${error}`);
          }
        }
      }

      // Import modules
      if (data.modules?.length > 0) {
        for (const module of data.modules) {
          try {
            await prisma.module.upsert({
              where: { id: module.id },
              update: {
                code: module.code,
                title: module.title,
                creditHours: module.creditHours,
                termId: module.termId,
                ownerId: module.ownerId,
                targetMark: module.targetMark,
                department: module.department,
                faculty: module.faculty,
                status: module.status
              },
              create: {
                id: module.id,
                code: module.code,
                title: module.title,
                creditHours: module.creditHours,
                termId: module.termId,
                ownerId: module.ownerId,
                targetMark: module.targetMark,
                department: module.department,
                faculty: module.faculty,
                status: module.status
              }
            });
            importResults.imported.modules++;
          } catch (error) {
            importResults.errors.push(`Failed to import module ${module.title}: ${error}`);
          }
        }
      }

      // Import assignments
      if (data.assignments?.length > 0) {
        for (const assignment of data.assignments) {
          try {
            await prisma.assignment.upsert({
              where: { id: assignment.id },
              update: {
                title: assignment.title,
                description: assignment.description,
                dueDate: assignment.dueDate ? new Date(assignment.dueDate) : null,
                maxScore: assignment.maxScore,
                score: assignment.score,
                weight: assignment.weight,
                status: assignment.status,
                type: assignment.type,
                moduleId: assignment.moduleId,
                componentId: assignment.componentId
              },
              create: {
                id: assignment.id,
                title: assignment.title,
                description: assignment.description,
                dueDate: assignment.dueDate ? new Date(assignment.dueDate) : null,
                maxScore: assignment.maxScore,
                score: assignment.score,
                weight: assignment.weight,
                status: assignment.status,
                type: assignment.type,
                moduleId: assignment.moduleId,
                componentId: assignment.componentId
              }
            });
            importResults.imported.assignments++;
          } catch (error) {
            importResults.errors.push(`Failed to import assignment ${assignment.title}: ${error}`);
          }
        }
      }

      // Import tactical tasks
      if (data.tacticalTasks?.length > 0) {
        for (const task of data.tacticalTasks) {
          try {
            await prisma.tacticalTask.upsert({
              where: { id: task.id },
              update: {
                title: task.title,
                status: task.status,
                type: task.type,
                dueDate: new Date(task.dueDate),
                moduleId: task.moduleId,
                source: task.source,
                links: task.links
              },
              create: {
                id: task.id,
                title: task.title,
                status: task.status,
                type: task.type,
                dueDate: new Date(task.dueDate),
                moduleId: task.moduleId,
                source: task.source,
                links: task.links
              }
            });
            importResults.imported.tacticalTasks++;
          } catch (error) {
            importResults.errors.push(`Failed to import tactical task ${task.title}: ${error}`);
          }
        }
      }

    } catch (error) {
      importResults.success = false;
      importResults.errors.push(`General import error: ${error}`);
    }

    return NextResponse.json(importResults);
  } catch (error) {
    console.error('Error importing data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to process import data' },
      { status: 500 }
    );
  }
}
