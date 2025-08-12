import { PrismaClient } from '@prisma/client';
import { startOfWeek, endOfWeek, addDays } from 'date-fns';

const prisma = new PrismaClient();

async function main() {
  // Get the seed user
  const user = await prisma.user.findFirst({ where: { id: 'seed-user-1' } });
  if (!user) {
    console.log('No seed-user-1 found');
    return;
  }

  // Check if seed-user-1 has modules, if not transfer from another user
  let modules = await prisma.module.findMany({ where: { ownerId: user.id } });
  if (modules.length === 0) {
    // Find another user with modules
    const otherUser = await prisma.user.findFirst({
      where: { 
        id: { not: 'seed-user-1' }
      }
    });
    
    const otherUserModules = await prisma.module.findMany({
      where: { ownerId: otherUser?.id }
    });
    
    if (otherUser && otherUserModules.length > 0) {
      console.log(`Transferring ${otherUserModules.length} modules from ${otherUser.id} to seed-user-1`);
      
      // Transfer modules to seed-user-1
      await prisma.module.updateMany({
        where: { ownerId: otherUser.id },
        data: { ownerId: 'seed-user-1' },
      });
      
      // Transfer study logs too
      await prisma.studyLog.updateMany({
        where: { userId: otherUser.id },
        data: { userId: 'seed-user-1' },
      });
      
      // Refresh modules list
      modules = await prisma.module.findMany({ where: { ownerId: user.id } });
    }
  }

  if (modules.length === 0) {
    console.log('Still no modules found after transfer attempt');
    return;
  }

  // Get current week range
  const now = new Date();
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  
  console.log(`Current week: ${weekStart.toISOString()} to ${weekEnd.toISOString()}`);

  // Update all modules to have proper date ranges that include the current week
  for (const module of modules) {
    await prisma.module.update({
      where: { id: module.id },
      data: {
        startDate: new Date('2025-08-01'),  // Start of August
        endDate: new Date('2025-12-31'),    // End of year
      },
    });
  }

  // Find a couple of modules to add current week assignments and tasks to
  const activeModules = modules.slice(0, 3);

  // Add assignments due this week
  const thisWeekAssignments = [
    {
      title: 'Current Week Assignment 1',
      dueDate: addDays(weekStart, 2), // Wednesday
      maxScore: 100,
      weight: 15,
      status: 'PENDING' as const,
      type: 'OTHER' as const,
      moduleId: activeModules[0].id,
    },
    {
      title: 'Current Week Quiz',
      dueDate: addDays(weekStart, 4), // Friday
      maxScore: 50,
      weight: 10,
      status: 'PENDING' as const,
      type: 'QUIZ' as const,
      moduleId: activeModules[1] ? activeModules[1].id : activeModules[0].id,
    },
  ];

  // Add tactical tasks due this week
  const thisWeekTasks = [
    {
      title: 'Read current chapter',
      type: 'READ' as const,
      status: 'PENDING' as const,
      dueDate: addDays(weekStart, 1), // Tuesday
      moduleId: activeModules[0].id,
      source: 'Textbook Chapter 5',
    },
    {
      title: 'Complete practice problems',
      type: 'PRACTICE' as const,
      status: 'PENDING' as const,
      dueDate: addDays(weekStart, 3), // Thursday
      moduleId: activeModules[1] ? activeModules[1].id : activeModules[0].id,
      source: 'Problem Set 3',
    },
    {
      title: 'Study for upcoming quiz',
      type: 'STUDY' as const,
      status: 'PENDING' as const,
      dueDate: addDays(weekStart, 4), // Friday (same day as quiz)
      moduleId: activeModules[1] ? activeModules[1].id : activeModules[0].id,
    },
  ];

  // Insert the assignments and tasks
  await prisma.assignment.createMany({
    data: thisWeekAssignments,
  });

  await prisma.tacticalTask.createMany({
    data: thisWeekTasks,
  });

  console.log(`Added ${thisWeekAssignments.length} assignments and ${thisWeekTasks.length} tasks for current week`);
  console.log('Updated module date ranges');
  console.log(`Total modules for seed-user-1: ${modules.length}`);
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
