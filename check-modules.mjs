import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const modules = await prisma.module.findMany({
    select: { id: true, code: true, title: true }
  });
  
  console.log(JSON.stringify(modules, null, 2));
  await prisma.$disconnect();
}

main().catch(console.error);
