import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🧹 Clearing all data (Transactions, Budgets, Savings, Bills)...');
  
  await prisma.transaction.deleteMany({});
  await prisma.budget.deleteMany({});
  await prisma.saving.deleteMany({});
  await prisma.bill.deleteMany({});
  
  console.log('✅ Database cleared successfully! (Admin user preserved)');
}

main().finally(async () => {
  await prisma.$disconnect();
});
