import dotenv from 'dotenv';
import path from 'path';
// Load .env from the parent directory
dotenv.config({ path: path.join(__dirname, '../.env') });

import { generateAndSendMonthlyReports } from '../src/services/reportService';

console.log('Testing email service with:', process.env.EMAIL_USER);

generateAndSendMonthlyReports()
  .then(() => {
    console.log('Test process finished.');
    process.exit(0);
  })
  .catch(err => {
    console.error('Test failed:', err);
    process.exit(1);
  });
