import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  await prisma.user.update({
    where: { email: 'admin@home.com' },
    data: { email: 'alienghassan000@gmail.com' }
  });
  console.log('User email updated to alienghassan000@gmail.com successfully!');
}

main().catch(err => console.error(err)).finally(() => prisma.$disconnect());
