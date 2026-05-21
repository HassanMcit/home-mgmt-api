import dotenv from 'dotenv';
import path from 'path';

// Load environmental variables
dotenv.config({ path: path.join(__dirname, '../.env') });

import { PrismaClient } from '@prisma/client';
import { sendEmail } from '../src/utils/mailer';

const prisma = new PrismaClient();

const generateEmailHtml = (name: string) => `
<div dir="rtl" style="font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; background-color: #f1f5f9; padding: 40px 20px; max-width: 650px; margin: auto; border-radius: 24px;">

  <!-- Decorative Eid Top Header -->
  <div style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 60%, #4338ca 100%); border-radius: 24px; padding: 40px 24px; text-align: center; margin-bottom: 28px; box-shadow: 0 10px 25px -5px rgba(49, 46, 129, 0.3);">
    <div style="font-size: 52px; margin-bottom: 12px; filter: drop-shadow(0 4px 6px rgba(0,0,0,0.1));">🐑🌙</div>
    <h1 style="margin: 0; font-size: 24px; color: #ffffff; font-weight: 900; letter-spacing: -0.5px; line-height: 1.4;">نظام مدبّر - إدارة المنزل الذكية</h1>
    <p style="margin: 8px 0 0; color: #c7d2fe; font-size: 14px; font-weight: 500;">شريككم المالي والمنزلي الذكي</p>
  </div>

  <!-- Welcome / Eid Card -->
  <div style="background: #ffffff; border-radius: 20px; padding: 32px 28px; margin-bottom: 24px; border: 1px solid #e2e8f0; border-right: 6px solid #eab308; box-shadow: 0 4px 12px rgba(0,0,0,0.03);">
    <h2 style="color: #1e1b4b; font-size: 20px; margin: 0 0 16px; font-weight: 800;">
      أهلاً يا ${name} 👋
    </h2>
    <p style="color: #334155; line-height: 1.8; margin: 0 0 16px; font-size: 15px;">
      يسرّ أسرة نظام <strong style="color: #4f46e5;">مدبّر</strong> أن تتقدم إليكم بأصدق التهاني والتبريكات بمناسبة حلول <strong>عيد الأضحى المبارك</strong>، أعاده الله علينا وعليكم وعلى الأمة الإسلامية بالخير واليمن والبركات، وكل عام وأنتم بخير وصحة وسعادة. تقبل الله طاعاتكم وصالح أعمالكم.
    </p>
    <p style="color: #475569; line-height: 1.8; margin: 0; font-size: 15px; font-style: italic;">
      وبهذه المناسبة السعيدة، يسعدنا أن نقدّم لكم دليلاً شاملاً لكافة ميزات ووظائف نظامكم <strong>"مدبّر"</strong>، لمساعدتكم على تنظيم ميزانيتكم وإدارة مصاريفكم ومهامكم العائلية اليومية بكل كفاءة وسهولة.
    </p>
  </div>

  <!-- Features Title -->
  <h3 style="color: #0f172a; font-size: 18px; margin: 0 0 16px 8px; font-weight: 800; border-bottom: 2px solid #e2e8f0; padding-bottom: 8px;">
    📘 الدليل الشامل لميزات نظام "مدبّر"
  </h3>

  <!-- Feature Grid / Cards -->
  <div style="margin-bottom: 28px; display: block;">

    <!-- 1. Dashboard -->
    <div style="background: #ffffff; border-radius: 16px; padding: 20px 24px; border: 1px solid #e2e8f0; border-right: 6px solid #3b82f6; margin-bottom: 16px; display: block;">
      <h4 style="margin: 0 0 8px; color: #1d4ed8; font-size: 16px; font-weight: 800;">📊 لوحة التحكم الشاملة (Dashboard)</h4>
      <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.7;">
        تعطيكم ملخصاً بيانياً فورياً لحالتكم المالية: إجمالي الدخل، إجمالي المصروفات، الرصيد المتبقي، استهلاك الميزانيات، وقائمة الفواتير المستحقة لتكونوا على دراية تامة بوضعكم المالي في لمحة واحدة.
      </p>
    </div>

    <!-- 2. Transactions -->
    <div style="background: #ffffff; border-radius: 16px; padding: 20px 24px; border: 1px solid #e2e8f0; border-right: 6px solid #10b981; margin-bottom: 16px; display: block;">
      <h4 style="margin: 0 0 8px; color: #047857; font-size: 16px; font-weight: 800;">💸 تسجيل المعاملات المالية (Transactions)</h4>
      <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.7;">
        سجلوا دخلكم ومصروفاتكم اليومية بكل دقة مع خيارات تصنيف متعددة (طعام، فواتير، سفر، صحة، إلخ) لمعرفة أين تذهب أموالكم وحظر الهدر المالي غير الضروري.
      </p>
    </div>

    <!-- 3. Budgets -->
    <div style="background: #ffffff; border-radius: 16px; padding: 20px 24px; border: 1px solid #e2e8f0; border-right: 6px solid #ec4899; margin-bottom: 16px; display: block;">
      <h4 style="margin: 0 0 8px; color: #be185d; font-size: 16px; font-weight: 800;">🎯 الميزانيات المحددة (Budgets)</h4>
      <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.7;">
        حددوا سقفاً مالياً لكل تصنيف شهرياً (مثل: مصروفات السوبرماركت 2000 ريال). سيقوم النظام بمراقبة استهلاككم وإبلاغكم بنسبة استهلاك الميزانية حتى لا تتجاوزوها.
      </p>
    </div>

    <!-- 4. Savings -->
    <div style="background: #ffffff; border-radius: 16px; padding: 20px 24px; border: 1px solid #e2e8f0; border-right: 6px solid #f59e0b; margin-bottom: 16px; display: block;">
      <h4 style="margin: 0 0 8px; color: #b45309; font-size: 16px; font-weight: 800;">🐖 أهداف الادخار (Savings)</h4>
      <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.7;">
        خططوا لمستقبلكم عبر إنشاء أهداف ادخارية (كشراء سيارة، أو صندوق طوارئ). يمكنكم تحديد المبلغ المستهدف وتاريخ الإنجاز ومتابعة وتغذية المدخرات بنسب مئوية وألوان توضيحية مميزة.
      </p>
    </div>

    <!-- 5. Bills & Auto-reminders -->
    <div style="background: #ffffff; border-radius: 16px; padding: 20px 24px; border: 1px solid #e2e8f0; border-right: 6px solid #ef4444; margin-bottom: 16px; display: block;">
      <h4 style="margin: 0 0 8px; color: #b91c1c; font-size: 16px; font-weight: 800;">🔔 إدارة الفواتير والتذكير اليومي (Bills)</h4>
      <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.7;">
        سجلوا فواتيركم الدورية (إيجار، كهرباء، إنترنت). **سيقوم النظام تلقائياً بإرسال بريد إلكتروني تذكيري كل صباح في تمام الساعة 9:00 صباحاً** بجميع الفواتير المستحقة وغير المدفوعة. وعند السداد، يمكنكم بضغطة زر تحويلها لمصروف مسجل تلقائياً.
      </p>
    </div>

    <!-- 6. Tasks -->
    <div style="background: #ffffff; border-radius: 16px; padding: 20px 24px; border: 1px solid #e2e8f0; border-right: 6px solid #06b6d4; margin-bottom: 16px; display: block;">
      <h4 style="margin: 0 0 8px; color: #0e7490; font-size: 16px; font-weight: 800;">📝 المهام والتنبيهات المنزلية (Tasks)</h4>
      <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.7;">
        جدولوا المهام والواجبات المنزلية واليومية للأعضاء مع تحديد الأولوية (عالية، متوسطة، منخفضة) وحالة الاكتمال، لضمان سير أعمال المنزل بأعلى كفاءة.
      </p>
    </div>

    <!-- 7. AI Assistant -->
    <div style="background: #ffffff; border-radius: 16px; padding: 20px 24px; border: 1px solid #e2e8f0; border-right: 6px solid #8b5cf6; margin-bottom: 16px; display: block;">
      <h4 style="margin: 0 0 8px; color: #6d28d9; font-size: 16px; font-weight: 800;">🤖 المساعد الذكي المالي (Mudabbir AI)</h4>
      <p style="margin: 0; color: #475569; font-size: 14px; line-height: 1.7;">
        مساعدكم الشخصي المتكامل الذي يعتمد على نموذج الذكاء الاصطناعي **Gemini**. يمكنكم التحدث معه باللغة العربية للاستعلام عن ميزانيتكم، تسجيل فواتير جديدة، الاستفسار عن فواتيركم المستحقة، أو طلب نصائح مالية واستشارية ذكية لتحسين مصروفاتكم.
      </p>
    </div>

  </div>

  <!-- CTA Action Button -->
  <div style="text-align: center; margin-bottom: 32px;">
    <a href="https://home-mgmt-frontend.onrender.com"
       style="display: inline-block; background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); color: #ffffff; text-decoration: none; padding: 16px 40px; border-radius: 16px; font-weight: 800; font-size: 16px; box-shadow: 0 8px 20px rgba(79,70,229,0.3); transition: all 0.3s ease;">
      🚀 الدخول إلى حسابك في مدبّر
    </a>
  </div>

  <!-- Footer -->
  <div style="text-align: center; color: #94a3b8; font-size: 13px; padding-top: 24px; border-top: 1px solid #cbd5e1;">
    <p style="margin: 0 0 6px; font-weight: 700; color: #64748b;">شكراً لثقتكم واختياركم لنظام مدبّر 💙</p>
    <p style="margin: 0; font-size: 11px; color: #94a3b8;">هذا البريد الإلكتروني مُرسل تلقائياً بشكل رسمي - يرجى عدم الرد المباشر عليه.</p>
  </div>

</div>
`;

async function main() {
  const targetEmail = process.argv[2];

  if (targetEmail) {
    // Single recipient mode (For testing)
    console.log(`🧪 Running in test mode for single user: ${targetEmail}`);
    const user = await prisma.user.findFirst({
      where: {
        email: {
          equals: targetEmail,
          mode: 'insensitive'
        }
      }
    });

    if (!user) {
      console.error(`❌ User with email "${targetEmail}" was not found in the database!`);
      await prisma.$disconnect();
      process.exit(1);
    }

    console.log(`📧 Pre-flight check: Sending test email to ${user.name} (${user.email})...`);
    const success = await sendEmail(
      user.email,
      '🐑 تهنئة عيد الأضحى المبارك والدليل الشامل لنظام مدبّر',
      generateEmailHtml(user.name)
    );

    if (success) {
      console.log('✅ Test mail sent successfully!');
    } else {
      console.error('❌ Failed to send test email.');
    }
  } else {
    // Full dispatch mode
    console.log('🚀 Running in production mode: Querying all registered users...');
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true }
    });

    console.log(`📋 Found ${users.length} users to notify.`);
    
    let successCount = 0;
    let failCount = 0;

    for (const user of users) {
      console.log(`📧 Dispatching to: ${user.name} (${user.email})...`);
      const success = await sendEmail(
        user.email,
        '🐑 تهنئة عيد الأضحى المبارك والدليل الشامل لنظام مدبّر',
        generateEmailHtml(user.name)
      );

      if (success) {
        console.log(`  ✅ Done sending to ${user.email}`);
        successCount++;
      } else {
        console.log(`  ❌ Failed to send to ${user.email}`);
        failCount++;
      }

      // Small delay between emails to avoid rate limits
      await new Promise(resolve => setTimeout(resolve, 2000));
    }

    console.log(`\n📊 Dispatch completed. Success: ${successCount}, Failures: ${failCount} out of ${users.length} total users.`);
  }

  await prisma.$disconnect();
}

main().catch(async (error) => {
  console.error('💥 Fatal script execution error:', error);
  await prisma.$disconnect();
  process.exit(1);
});
