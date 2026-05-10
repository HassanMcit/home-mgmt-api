import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const users = await prisma.user.findMany();
  console.log('--- Current Users in DB ---');
  users.forEach(u => console.log(`- ${u.name} (${u.email}) [Role: ${u.role}]`));
  
  const requests = await prisma.registrationRequest.findMany();
  console.log('--- Pending Requests ---');
  requests.forEach(r => console.log(`- ${r.name} (${r.email}) [Status: ${r.status}]`));
  
  await prisma.$disconnect();
}

check();
