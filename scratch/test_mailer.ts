import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { sendEmail, transporter } from '../src/utils/mailer';

async function testMailer() {
  console.log('Testing Mailer Configuration...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER);
  console.log('EMAIL_PASS length:', process.env.EMAIL_PASS?.length);

  try {
    console.log('Verifying transporter...');
    await transporter.verify();
    console.log('✅ Transporter verified successfully!');
  } catch (error) {
    console.error('❌ Transporter verification failed:', error);
    return;
  }

  console.log('\nSending test email...');
  const testHtml = `
    <div dir="rtl" style="font-family: 'Cairo', sans-serif; padding: 20px;">
      <h2>تجربة إرسال بريد</h2>
      <p>هذا إيميل تجريبي من النظام.</p>
    </div>
  `;
  
  // Use a known email to test sending. 
  // You can use the EMAIL_USER to send an email to itself.
  const targetEmail = process.env.EMAIL_USER || 'test@example.com';
  
  const success = await sendEmail(targetEmail, 'اختبار إرسال الإيميل - مدبّر', testHtml);
  
  if (success) {
    console.log('✅ Test email sent successfully to:', targetEmail);
  } else {
    console.log('❌ Test email failed to send.');
  }
}

testMailer();
