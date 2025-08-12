import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Check if seed-user-1 exists
  const existingUser = await prisma.user.findFirst({ where: { id: 'seed-user-1' } });
  
  if (!existingUser) {
    // Find any existing user to update or create new one
    const anyUser = await prisma.user.findFirst();
    
    if (anyUser) {
      // Update existing user to have the seed-user-1 ID
      console.log(`Updating user ${anyUser.id} to seed-user-1`);
      
      // We need to handle this carefully due to foreign key constraints
      // Create a new user with the expected ID
      await prisma.user.create({
        data: {
          id: 'seed-user-1',
          email: 'seed-user-1@example.com',
          name: 'Seed User 1',
          degreeId: anyUser.degreeId,
        },
      });
      
      // Update all related records to use the new user ID
      await prisma.module.updateMany({
        where: { ownerId: anyUser.id },
        data: { ownerId: 'seed-user-1' },
      });
      
      await prisma.studyLog.updateMany({
        where: { userId: anyUser.id },
        data: { userId: 'seed-user-1' },
      });
      
      // Delete the old user
      await prisma.user.delete({ where: { id: anyUser.id } });
      
      console.log('User updated successfully');
    } else {
      // Create new seed user
      const degree = await prisma.degree.findFirst();
      await prisma.user.create({
        data: {
          id: 'seed-user-1',
          email: 'seed-user-1@example.com',
          name: 'Seed User 1',
          degreeId: degree?.id,
        },
      });
      console.log('New seed user created');
    }
  } else {
    console.log('seed-user-1 already exists');
  }
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
