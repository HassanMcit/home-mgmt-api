import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  console.log('Current Users in DB:');
  users.forEach(u => console.log(`- ${u.name}: ${u.email} (Role: ${u.role})`));
}

main().catch(err => console.error(err)).finally(() => prisma.$disconnect());
