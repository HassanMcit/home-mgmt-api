import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting DB wipe...');
  
  // 1. Delete all users except Hassan and Shrouk
  const keepUserIds = [
    'cmp09l8wv00008n767h7lbm71', // Hassan
    'cmp4tcna00001hl8pfg6kn77x'  // Shrouk
  ];
  
  const deletedUsers = await prisma.user.deleteMany({
    where: {
      id: { notIn: keepUserIds }
    }
  });
  console.log(`Deleted ${deletedUsers.count} users.`);

  // 2. Delete ALL records to start fresh
  const d1 = await prisma.transaction.deleteMany();
  console.log(`Deleted ${d1.count} transactions.`);
  
  const d2 = await prisma.bill.deleteMany();
  console.log(`Deleted ${d2.count} bills.`);
  
  const d3 = await prisma.budget.deleteMany();
  console.log(`Deleted ${d3.count} budgets.`);
  
  const d4 = await prisma.saving.deleteMany();
  console.log(`Deleted ${d4.count} savings.`);

  const d5 = await prisma.registrationRequest.deleteMany();
  console.log(`Deleted ${d5.count} registration requests.`);
  
  const d6 = await prisma.passwordReset.deleteMany();
  console.log(`Deleted ${d6.count} password resets.`);

  console.log('Database wiped successfully! Only Hassan and Shrouk remain.');
}

main().catch(console.error).finally(() => prisma.$disconnect());
