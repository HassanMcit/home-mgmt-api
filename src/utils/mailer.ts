import nodemailer from 'nodemailer';

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
});

export const sendEmail = async (to: string, subject: string, html: string) => {
  try {
    const from = `"مدبّر | إدارة المنزل" <${process.env.EMAIL_USER}>`;
    console.log(`\n📧 [Mailer] ====== EMAIL DISPATCH START ======`);
    console.log(`📧 [Mailer] FROM: ${process.env.EMAIL_USER}`);
    console.log(`📧 [Mailer] TO:   ${to}`);
    console.log(`📧 [Mailer] SUBJ: ${subject}`);
    
    // Verify transporter connection first
    await transporter.verify();
    console.log(`📧 [Mailer] SMTP connection verified ✅`);
    
    const info = await transporter.sendMail({
      from,
      to,
      subject,
      html,
    });
    
    console.log(`📧 [Mailer] SUCCESS! MessageId: ${info.messageId}`);
    console.log(`📧 [Mailer] ====== EMAIL DISPATCH END ========\n`);
    return true;
  } catch (error: any) {
    console.error(`\n❌ [Mailer] ====== EMAIL FAILED ======`);
    console.error(`❌ [Mailer] TO: ${to}`);
    console.error(`❌ [Mailer] Error Code: ${error.code}`);
    console.error(`❌ [Mailer] Error Message: ${error.message}`);
    console.error(`❌ [Mailer] Full Error:`, error);
    console.error(`❌ [Mailer] ============================\n`);
    return false;
  }
};
