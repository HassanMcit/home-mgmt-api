const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('Querying all accounts...');
  const accs = await prisma.account.findMany({
    orderBy: { type: 'asc' }
  });

  accs.forEach(a => {
    console.log(`- ID: ${a.id}, Name: "${a.name}", Alias: "${a.alias}", Type: ${a.type}, Balance: ${a.balance}`);
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
