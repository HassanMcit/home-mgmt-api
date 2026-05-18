import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';
import nodemailer from 'nodemailer';
import dns from 'dns';

dns.setDefaultResultOrder('ipv4first');

const prisma = new PrismaClient();

const mailer = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    await mailer.sendMail({
      from: `"مدبّر - إدارة المنزل" <${process.env.EMAIL_USER}>`,
      to,
      subject,
      html,
    });
    return true;
  } catch (err) {
    console.error('  Mail error:', err);
    return false;
  }
}

const apologyHtml = (name: string) => `
<div dir="rtl" style="font-family: 'Cairo', Arial, sans-serif; background-color: #f4f7f6; padding: 24px; max-width: 600px; margin: auto; border-radius: 16px;">

  <!-- Header -->
  <div style="background: linear-gradient(135deg, #1a1a35 0%, #2d2d5e 100%); border-radius: 20px; padding: 32px 24px; text-align: center; margin-bottom: 24px;">
    <div style="font-size: 40px; margin-bottom: 12px;">🏠</div>
    <h1 style="margin: 0; font-size: 22px; color: #ffffff; font-weight: 900;">مدبّر - إدارة المنزل الذكية</h1>
    <p style="margin: 8px 0 0; color: rgba(255,255,255,0.7); font-size: 14px;">نظام إدارة الشؤون المالية للعائلة</p>
  </div>

  <!-- Apology Card -->
  <div style="background: #ffffff; border-radius: 16px; padding: 28px 24px; margin-bottom: 20px; border-right: 4px solid #f59e0b; box-shadow: 0 4px 20px rgba(0,0,0,0.06);">
    <h2 style="color: #1e293b; font-size: 20px; margin: 0 0 12px; font-weight: 900;">
      أهلاً يا ${name} 👋
    </h2>
    <p style="color: #475569; line-height: 1.8; margin: 0 0 16px; font-size: 15px;">
      نتوجه إليك بأعمق اعتذاراتنا عن بعض المشكلات التقنية التي واجهت النظام مؤخراً، والتي أثّرت على تجربتك مع تطبيق <strong style="color: #4f46e5;">مدبّر</strong>.
    </p>
    <p style="color: #475569; line-height: 1.8; margin: 0; font-size: 15px;">
      نؤكد لك أننا تجاوزنا هذه المشكلات بشكل كامل، وعملنا على تحسين النظام لضمان أفضل تجربة ممكنة لك ولعائلتك. <strong>لن تتكرر هذه المشكلة مرة أخرى بإذن الله.</strong>
    </p>
  </div>

  <!-- New Feature Announcement -->
  <div style="background: linear-gradient(135deg, #eff6ff 0%, #f0fdf4 100%); border-radius: 16px; padding: 28px 24px; margin-bottom: 20px; border: 1px solid #bfdbfe;">
    <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 16px;">
      <div style="font-size: 28px;">🔔</div>
      <h3 style="color: #1e40af; font-size: 18px; margin: 0; font-weight: 900;">خبر سار! ميزة جديدة</h3>
    </div>
    <p style="color: #1e293b; line-height: 1.8; font-size: 15px; margin: 0 0 16px;">
      ابتداءً من الآن، ستصلك <strong>رسالة تذكير يومية كل صباح على الساعة 9⃣</strong> تحتوي على قائمة بجميع الفواتير والالتزامات المالية المستحقة عليك.
    </p>

    <!-- Steps -->
    <div style="background: #ffffff; border-radius: 12px; padding: 20px; border: 1px solid #dbeafe;">
      <p style="color: #1e40af; font-weight: 900; font-size: 14px; margin: 0 0 12px; text-transform: uppercase; letter-spacing: 0.05em;">كيف يعمل النظام؟</p>
      <div style="display: flex; flex-direction: column; gap: 10px;">
        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <span style="background: #4f46e5; color: #fff; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 900; flex-shrink: 0;">١</span>
          <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6;">سجّل فواتيرك الشهرية في قسم <strong>"الفواتير والالتزامات"</strong> مع تحديد تاريخ الاستحقاق.</p>
        </div>
        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <span style="background: #4f46e5; color: #fff; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 900; flex-shrink: 0;">٢</span>
          <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6;">كل يوم الساعة 9 صباحاً ستصلك رسالة على بريدك بقائمة فواتيرك غير المدفوعة.</p>
        </div>
        <div style="display: flex; gap: 12px; align-items: flex-start;">
          <span style="background: #4f46e5; color: #fff; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 12px; font-weight: 900; flex-shrink: 0;">٣</span>
          <p style="margin: 0; color: #334155; font-size: 14px; line-height: 1.6;">بعد دفع الفاتورة، اضغط عليها في التطبيق لتعليمها كـ <strong>"مدفوعة"</strong> وستُسجَّل كمصروف تلقائياً.</p>
        </div>
      </div>
    </div>
  </div>

  <!-- CTA -->
  <div style="text-align: center; margin-bottom: 24px;">
    <a href="https://home-mgmt-frontend.onrender.com/dashboard/bills"
       style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 14px 36px; border-radius: 12px; font-weight: 900; font-size: 16px; box-shadow: 0 4px 15px rgba(79,70,229,0.3);">
      📋 سجّل فواتيرك الآن
    </a>
  </div>

  <!-- Footer -->
  <div style="text-align: center; color: #94a3b8; font-size: 12px; padding-top: 20px; border-top: 1px solid #e2e8f0;">
    <p style="margin: 0 0 4px;">شكراً لثقتك واستخدامك لنظام <strong>مدبّر</strong> 💙</p>
    <p style="margin: 0;">هذا الإيميل مرسل تلقائياً - يرجى عدم الرد عليه</p>
  </div>

</div>
`;

async function sendAnnouncementToAll() {
  console.log('🚀 Starting announcement email blast...\n');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ EMAIL_USER or EMAIL_PASS is not set in .env!');
    process.exit(1);
  }

  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true }
  });

  console.log(`📋 Found ${users.length} users to notify.\n`);

  let successCount = 0;
  let failCount = 0;

  for (const user of users) {
    process.stdout.write(`📧 Sending to ${user.name} (${user.email})... `);
    const ok = await sendEmail(
      user.email,
      '🙏 اعتذار وإشعار بميزة جديدة - مدبّر',
      apologyHtml(user.name)
    );
    if (ok) {
      console.log('✅ Done');
      successCount++;
    } else {
      console.log('❌ Failed');
      failCount++;
    }
    // Small delay between emails to avoid rate limiting
    await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`\n📊 Results: ${successCount} sent, ${failCount} failed out of ${users.length} users.`);
  await prisma.$disconnect();
}

sendAnnouncementToAll().catch(async (err) => {
  console.error('Fatal error:', err);
  await prisma.$disconnect();
  process.exit(1);
});
