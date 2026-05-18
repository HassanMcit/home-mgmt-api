import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // Update Hassan Ali from super_admin → admin
  const updated = await prisma.user.update({
    where: { email: 'alienghassan000@gmail.com' },
    data: { role: 'admin' },
    select: { name: true, email: true, role: true }
  });
  console.log('✅ Updated user role:');
  console.log(`   ${updated.name} (${updated.email}) → role: ${updated.role}`);

  // Show all users after update
  const all = await prisma.user.findMany({ select: { name: true, email: true, role: true } });
  console.log('\n👥 All users now:');
  all.forEach(u => console.log(`   [${u.role.toUpperCase()}] ${u.name} — ${u.email}`));

  await prisma.$disconnect();
}

main().catch(async err => {
  console.error(err);
  await prisma.$disconnect();
  process.exit(1);
});
