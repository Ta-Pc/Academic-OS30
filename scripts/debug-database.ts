import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('=== DEBUG DATABASE STATE ===');
  
  // Check users
  const users = await prisma.user.findMany();
  console.log(`\nUsers (${users.length}):`);
  users.forEach(u => console.log(`  - ${u.id}: ${u.name} (${u.email})`));
  
  // Check modules
  const modules = await prisma.module.findMany();
  console.log(`\nModules (${modules.length}):`);
  modules.forEach(m => console.log(`  - ${m.id}: ${m.code} (${m.title}) - owner: ${m.ownerId}`));
  
  // Check tactical tasks
  const tasks = await prisma.tacticalTask.findMany({
    include: { module: true }
  });
  console.log(`\nTactical Tasks (${tasks.length}):`);
  tasks.forEach(t => console.log(`  - ${t.id}: ${t.title} (${t.type}, ${t.status}) - due: ${t.dueDate} - module: ${t.module?.code} - moduleOwnerId: ${t.module?.ownerId}`));
  
  // Check assignments 
  const assignments = await prisma.assignment.findMany({
    include: { module: true }
  });
  console.log(`\nAssignments (${assignments.length}):`);
  assignments.forEach(a => console.log(`  - ${a.id}: ${a.title} - due: ${a.dueDate} - module: ${a.module?.code} - moduleOwnerId: ${a.module?.ownerId}`));

  // Check current week range
  const now = new Date();
  const { startOfWeek, endOfWeek } = await import('date-fns');
  const weekStart = startOfWeek(now, { weekStartsOn: 1 });
  const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
  console.log(`\nCurrent week range: ${weekStart.toISOString()} to ${weekEnd.toISOString()}`);
  
  // Check tasks in current week
  const thisWeekTasks = await prisma.tacticalTask.findMany({
    where: { dueDate: { gte: weekStart, lte: weekEnd } },
    include: { module: true }
  });
  console.log(`\nTasks in current week (${thisWeekTasks.length}):`);
  thisWeekTasks.forEach(t => console.log(`  - ${t.title} - due: ${t.dueDate} - module: ${t.module?.code}`));
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
