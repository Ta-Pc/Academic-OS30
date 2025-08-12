import { PrismaClient } from '@prisma/client';
import { startOfWeek, endOfWeek, addDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  // Get the current week range
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  
  console.log(`Adding tasks for week: ${weekStart.toISOString()} to ${weekEnd.toISOString()}`);

  // Get existing modules
  const modules = await prisma.module.findMany({
    where: { status: 'ACTIVE' },
    take: 3, // Just use first 3 modules
  });

  if (modules.length === 0) {
    console.log('No modules found. Run seed first.');
    return;
  }

  console.log(`Found ${modules.length} modules: ${modules.map(m => m.code).join(', ')}`);

  // Clear existing tactical tasks to avoid duplicates
  await prisma.tacticalTask.deleteMany({
    where: {
      dueDate: { gte: weekStart, lte: weekEnd }
    }
  });

  // Add tasks for this week
  const tasksToAdd = [
    // Monday tasks
    { title: 'Read Chapter 3: Database Design', type: 'READ' as const, status: 'PENDING' as const, dueDate: addDays(weekStart, 0), moduleId: modules[0].id },
    { title: 'Review previous assignment feedback', type: 'REVIEW' as const, status: 'PENDING' as const, dueDate: addDays(weekStart, 0), moduleId: modules[1].id },
    
    // Tuesday tasks
    { title: 'Complete Practice Set 2', type: 'PRACTICE' as const, status: 'PENDING' as const, dueDate: addDays(weekStart, 1), moduleId: modules[0].id },
    { title: 'Study for upcoming quiz', type: 'STUDY' as const, status: 'PENDING' as const, dueDate: addDays(weekStart, 1), moduleId: modules[1].id },
    
    // Wednesday tasks
    { title: 'Submit Lab Report 1', type: 'ADMIN' as const, status: 'PENDING' as const, dueDate: addDays(weekStart, 2), moduleId: modules[2]?.id || modules[0].id },
    { title: 'Read Chapter 4: Normalization', type: 'READ' as const, status: 'COMPLETED' as const, dueDate: addDays(weekStart, 2), moduleId: modules[0].id },
    
    // Thursday tasks
    { title: 'Practice SQL queries', type: 'PRACTICE' as const, status: 'IN_PROGRESS' as const, dueDate: addDays(weekStart, 3), moduleId: modules[1].id },
    { title: 'Review lecture notes', type: 'REVIEW' as const, status: 'PENDING' as const, dueDate: addDays(weekStart, 3), moduleId: modules[2]?.id || modules[0].id },
    
    // Friday tasks
    { title: 'Prepare for module test', type: 'STUDY' as const, status: 'PENDING' as const, dueDate: addDays(weekStart, 4), moduleId: modules[0].id },
    { title: 'Update assignment tracker', type: 'ADMIN' as const, status: 'COMPLETED' as const, dueDate: addDays(weekStart, 4), moduleId: modules[1].id },
  ];

  await prisma.tacticalTask.createMany({
    data: tasksToAdd,
  });

  console.log(`Added ${tasksToAdd.length} tactical tasks for the current week`);
  
  // Also add some assignments for this week
  const assignmentsToAdd = [
    { title: 'Weekly Quiz 1', dueDate: addDays(weekStart, 2), score: null, weight: 5, status: 'PENDING' as const, type: 'QUIZ' as const, moduleId: modules[0].id },
    { title: 'Lab Assignment 2', dueDate: addDays(weekStart, 5), score: null, weight: 10, status: 'PENDING' as const, type: 'OTHER' as const, moduleId: modules[1].id }
  ];

  await prisma.assignment.createMany({
    data: assignmentsToAdd,
  });

  console.log(`Added ${assignmentsToAdd.length} assignments for the current week`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
    console.log('Done!');
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
