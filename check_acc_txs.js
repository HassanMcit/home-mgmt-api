const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Querying transactions for accounts...');
  const txs = await prisma.transaction.findMany({
    orderBy: { createdAt: 'desc' },
    take: 20,
    include: {
      account: true
    }
  });

  txs.forEach(t => {
    console.log(`- ID: ${t.id}, AccountName: "${t.account ? (t.account.alias || t.account.name) : 'None'}", Amount: ${t.amount}, Type: ${t.type}, Category: "${t.category}", Desc: "${t.description}", CreatedAt: ${t.createdAt}`);
  });
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

