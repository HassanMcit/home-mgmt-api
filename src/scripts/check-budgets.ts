import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function check() {
  const budgets = await prisma.budget.findMany({
    include: {
      user: {
        select: { name: true, email: true }
      }
    }
  });
  console.log('--- Current Budgets in DB ---');
  budgets.forEach(b => {
    console.log(`- User: ${b.user.name} (${b.user.email})`);
    console.log(`  Category: ${b.category}, Amount: ${b.amount}, Month: ${b.month}/${b.year}`);
  });
  await prisma.$disconnect();
}

check();
