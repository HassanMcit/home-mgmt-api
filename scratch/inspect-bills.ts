import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('🔍 Fetching all bills and checking their statuses...');
  
  const bills = await prisma.bill.findMany({
    include: {
      user: {
        select: {
          name: true,
          email: true,
        }
      }
    },
    orderBy: { dueDate: 'asc' }
  });

  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  console.log('\n--- Current Date Details ---');
  console.log(`Current Time: ${now.toISOString()} (${now.toLocaleString()})`);
  console.log(`End of Current Month: ${endOfMonth.toISOString()} (${endOfMonth.toLocaleString()})`);

  console.log('\n--- Bills Statuses ---');
  const formattedBills = bills.map(b => ({
    user: b.user.name,
    email: b.user.email,
    name: b.name,
    amount: `${b.amount} EGP`,
    dueDate: b.dueDate.toISOString().split('T')[0],
    isPaid: b.isPaid,
    isDueThisMonthOrEarlier: b.dueDate <= endOfMonth,
  }));
  
  console.table(formattedBills);
}

main().finally(async () => {
  await prisma.$disconnect();
});
