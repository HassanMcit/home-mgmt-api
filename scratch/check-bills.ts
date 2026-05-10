import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const bills = await prisma.bill.findMany({ select: { name: true } });
  console.log(JSON.stringify(bills, null, 2));
}
main();
