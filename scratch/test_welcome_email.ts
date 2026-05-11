import { PrismaClient } from '@prisma/client';
import { sendEmail } from '../src/utils/mailer';
const prisma = new PrismaClient();

async function testApprovalEmail() {
  const testEmail = 'alienghassan000@gmail.com';
  const testName = 'تجربة ترحيب';

  console.log(`Sending test welcome email to ${testEmail}...`);

  const welcomeHtml = `
      <div dir="rtl" style="font-family: 'Cairo', sans-serif; background-color: #f8fafc; padding: 20px; border-radius: 15px; border: 1px solid #e2e8f0; max-width: 600px; margin: auto;">
        <div style="background-color: #1e1b4b; color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0;">أهلاً بك في عائلة مدبّر! 🎉</h1>
          <p style="opacity: 0.9; margin-top: 10px;">تم تفعيل حسابك بنجاح يا ${testName}</p>
        </div>

        <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <h2 style="color: #4f46e5; margin-top: 0;">ماذا يمكنك أن تفعل الآن؟</h2>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #1e293b;">💰 إدارة المعاملات:</strong>
            <p style="margin: 5px 0; color: #475569; font-size: 14px;">سجل كل قرش تصرفه أو تربحه لتعرف أين تذهب أموالك بدقة.</p>
          </div>

          <div style="margin-bottom: 15px;">
            <strong style="color: #1e293b;">📅 الفواتير الذكية:</strong>
            <p style="margin: 5px 0; color: #475569; font-size: 14px;">أضف فواتيرك الشهرية وسيقوم النظام بتذكيرك بها يومياً حتى لا تنساها.</p>
          </div>

          <div style="margin-bottom: 15px;">
            <strong style="color: #1e293b;">🤖 التحليل الذكي (AI):</strong>
            <p style="margin: 5px 0; color: #475569; font-size: 14px;">احصل على نصائح مالية مخصصة لك من خلال الذكاء الاصطناعي بناءً على نمط صرفك.</p>
          </div>

          <div style="margin-top: 30px; text-align: center;">
            <a href="https://ha-smart-home.vercel.app/login" style="background-color: #4f46e5; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">ابدأ رحلتك المالية الآن</a>
          </div>
        </div>

        <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">هذا الإيميل مرسل آلياً من نظام مدبّر لإدارة المنزل.</p>
      </div>
    `;

  const success = await sendEmail(testEmail, 'تم تفعيل حسابك بنجاح - مرحباً بك في مدبّر', welcomeHtml);
  if (success) {
    console.log('✅ Welcome email sent successfully!');
  } else {
    console.log('❌ Failed to send welcome email.');
  }
}

testApprovalEmail().catch(err => console.error(err)).finally(() => prisma.$disconnect());
