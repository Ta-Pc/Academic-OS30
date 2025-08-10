import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany({ 
    include: { 
      modules: { 
        include: { 
          assignments: true, 
          tasks: true 
        } 
      } 
    } 
  });
  console.log('Users in database:');
  users.forEach(user => {
    console.log(`- ${user.id}: ${user.name} (${user.email}) - ${user.modules.length} modules`);
  });
}

main().then(() => prisma.$disconnect()).catch(console.error);
