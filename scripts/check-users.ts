import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Users in database:');
  
  for (const user of users) {
    const modules = await prisma.module.findMany({
      where: { ownerId: user.id },
      include: { 
        assignments: true, 
        tasks: true 
      }
    });
    console.log(`- ${user.id}: ${user.name} (${user.email}) - ${modules.length} modules`);
  }
}

main().then(() => prisma.$disconnect()).catch(console.error);
