import nodemailer from 'nodemailer';

export const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    console.log(`[Mailer] Sending email to: ${to} | Subject: ${subject}`);
    await transporter.sendMail({
      from: `"مدبّر | إدارة المنزل" <${process.env.EMAIL_USER}>`,
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
