const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Querying transfer transactions...');
  const txs = await prisma.transaction.findMany({
    where: {
      category: 'transfer'
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  });

  txs.forEach(t => {
    console.log(`- Amount: ${t.amount}, Type: ${t.type}, Desc: "${t.description}", Date: ${t.createdAt}`);
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
