import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  const result = await prisma.registrationRequest.deleteMany();
  console.log(`Successfully deleted ${result.count} registration requests.`);
}

main().catch(err => console.error(err)).finally(() => prisma.$disconnect());
