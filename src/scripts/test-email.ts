import { sendEmail } from '../utils/mailer';
import dotenv from 'dotenv';
import path from 'path';

// Load env variables
dotenv.config({ path: path.join(__dirname, '../../.env') });

async function test() {
  console.log('Using EMAIL_USER:', process.env.EMAIL_USER);
  console.log('Using GOOGLE_SCRIPT_URL:', process.env.GOOGLE_SCRIPT_URL);
  
  const recipient = 'alienghassan000@gmail.com';
  console.log(`Sending a test email to ${recipient}...`);
  const success = await sendEmail(recipient, 'Test Email from Mudabbar (Local Debug)', '<h1>Hello from Local Debug!</h1><p>If you see this, email sending works.</p>');
  
  if (success) {
    console.log('🎉 Email sent successfully!');
  } else {
    console.log('❌ Email sending failed.');
  }
}

test().catch(console.error);
