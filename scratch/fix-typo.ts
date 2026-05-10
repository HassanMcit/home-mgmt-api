import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const result = await prisma.bill.updateMany({
    where: { name: { contains: 'مصرؤف' } },
    data: { name: 'مصروف البيت والزوجه' }
  });
  console.log(`Updated ${result.count} bills.`);
}
main();
