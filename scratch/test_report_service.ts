import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { sendDailyBillReminders, generateAndSendMonthlyReports } from '../src/services/reportService';

(async () => {
  console.log('⏳ Testing sendDailyBillReminders()...');
  try {
    await sendDailyBillReminders();
    console.log('✅ Daily reminders test finished successfully!');
  } catch (error) {
    console.error('❌ Daily reminders test failed:', error);
  }

  console.log('\n⏳ Testing generateAndSendMonthlyReports()...');
  try {
    await generateAndSendMonthlyReports();
    console.log('✅ Monthly reports test finished successfully!');
  } catch (error) {
    console.error('❌ Monthly reports test failed:', error);
  }
})();
