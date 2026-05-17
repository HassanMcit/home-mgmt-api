import nodemailer from 'nodemailer';
import dns from 'dns';

// Force Node to use IPv4! Render servers do not support outbound IPv6 for SMTP.
// This single line fixes the ENETUNREACH error.
dns.setDefaultResultOrder('ipv4first');

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('❌ [Mailer] Critical Error: EMAIL_USER or EMAIL_PASS not found in environment variables!');
} else {
  console.log(`✅ [Mailer] Initialized: Sender is ${process.env.EMAIL_USER}`);
}

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 5000, // 5 seconds max to connect
  greetingTimeout: 5000,   // 5 seconds max for greeting
  socketTimeout: 10000,    // 10 seconds max for any socket operation
});

// We now use Google Apps Script over HTTPS to bypass Render's SMTP blocks
export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
    
    if (!scriptUrl) {
      console.warn('⚠️ [Mailer] GOOGLE_SCRIPT_URL is not set. Email will not be sent.');
      return false;
    }

    console.log(`📧 [Mailer] ====== EMAIL DISPATCH START ======`);
    console.log(`📧 [Mailer] VIA:  Google Apps Script Webhook`);
    console.log(`📧 [Mailer] TO:   ${to}`);
    console.log(`📧 [Mailer] SUBJ: ${subject}`);
    
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        to,
        subject,
        html
      }),
    });

    const result = await response.json();

    if (result.status === 'success') {
      console.log(`📧 [Mailer] SUCCESS! Email sent via Webhook.`);
      console.log(`📧 [Mailer] ====== EMAIL DISPATCH END ========`);
      return true;
    } else {
      console.error(`❌ [Mailer] Webhook returned error:`, result.message);
      return false;
    }
  } catch (error) {
    console.error('❌ [Mailer] Error sending via Webhook:', error);
    return false;
  }
};
