const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Querying transactions created after 13:30...');
  const cutoff = new Date('2026-06-18T10:30:00Z');

  const txs = await prisma.transaction.findMany({
    where: {
      createdAt: { gte: cutoff }
    },
    orderBy: { createdAt: 'desc' },
    include: {
      account: true
    }
  });

  console.log(JSON.stringify(txs, null, 2));
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
