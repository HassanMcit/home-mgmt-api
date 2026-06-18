const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const accountId = 'cmpqm94vq0009wfg1b0zarr88';
  console.log(`Calculating balance from transactions for account: ${accountId}`);

  const account = await prisma.account.findUnique({
    where: { id: accountId }
  });
  console.log(`Current Account Balance: ${account.balance}`);

  const txs = await prisma.transaction.findMany({
    where: { accountId }
  });

  let sum = 0;
  txs.forEach(t => {
    if (t.type === 'income') sum += t.amount;
    else sum -= t.amount;
  });

  console.log(`Sum of all transactions: ${sum}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
