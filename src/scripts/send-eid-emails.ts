import dotenv from 'dotenv';
import path from 'path';

// Load env variables BEFORE importing anything else so mailer connects correctly
dotenv.config({ path: path.join(__dirname, '../../.env') });

import { PrismaClient } from '@prisma/client';
import { sendEmail } from '../utils/mailer';
import { getEidEmailHtml } from '../utils/eidTemplate';

const prisma = new PrismaClient();

async function main() {
  console.log('--- Mudabbar Eid Email Broadcast Script ---');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('GOOGLE_SCRIPT_URL:', process.env.GOOGLE_SCRIPT_URL);

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true }
  });

  if (users.length === 0) {
    console.log('⚠️ No users found in the database to broadcast to.');
    return;
  }

  console.log(`📋 Found ${users.length} users in the database.`);
  console.log('Starting broadcast...');

  let successCount = 0;
  let failCount = 0;

  for (const user of users) {
    console.log(`\n✉️ Sending Eid email to: ${user.name} (${user.email})...`);
    try {
      const html = getEidEmailHtml(user.name);
      const sent = await sendEmail(
        user.email,
        'عيد الأضحى المبارك 🌙 — وميزات جديدة في مدبّر',
        html
      );

      if (sent) {
        successCount++;
        console.log(`✅ Success for ${user.email}`);
      } else {
        failCount++;
        console.warn(`⚠️ Failed to send to ${user.email}`);
      }
    } catch (err) {
      failCount++;
      console.error(`❌ Critical error sending to ${user.email}:`, err);
    }
  }

  console.log('\n--- Broadcast Summary ---');
  console.log(`📊 Total Users: ${users.length}`);
  console.log(`✅ Successfully Sent: ${successCount}`);
  console.log(`❌ Failed: ${failCount}`);
}

main()
  .catch(console.error)
  .finally(async () => {
    await prisma.$disconnect();
  });
