import dotenv from 'dotenv';
import path from 'path';
import nodemailer from 'nodemailer';

dotenv.config({ path: path.join(__dirname, '../.env') });

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function test() {
  console.log('Testing Email for:', process.env.EMAIL_USER);
  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: 'hassan.a173784@gmail.com',
      subject: 'Test Email from HA Home Management',
      text: 'This is a test email to verify the mailer configuration.',
    });
    console.log('✅ Email sent successfully!');
  } catch (error: any) {
    console.error('❌ Mailer Error:', error.message);
  }
}

test();
