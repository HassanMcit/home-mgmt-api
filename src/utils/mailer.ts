import nodemailer from 'nodemailer';

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.error('❌ [Mailer] Critical Error: EMAIL_USER or EMAIL_PASS not found in environment variables!');
}

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const from = `"مدبّر | إدارة المنزل" <${process.env.EMAIL_USER}>`;
    console.log(`[Mailer] Sending email FROM: ${from} TO: ${to} | Subject: ${subject}`);
    await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
    return true;
  } catch (error) {
    console.error('[Mailer Error]:', error);
    return false;
  }
};
