import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const requests = await prisma.registrationRequest.findMany();
  console.log('Registration Requests:');
  console.dir(requests, { depth: null });
  
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true }
  });
  console.log('\nCurrent Users:');
  console.dir(users, { depth: null });
}

main().catch(console.error).finally(() => prisma.$disconnect());
