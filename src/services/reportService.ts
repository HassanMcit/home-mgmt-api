import cron from 'node-cron';
import { PrismaClient } from '@prisma/client';
import { sendEmail } from '../utils/mailer';
import { GoogleGenerativeAI } from '@google/generative-ai';

const prisma = new PrismaClient();

const getDefaultSavingsTips = () => {
  return `
    <li>حاول تخصيص 20% من دخلك للمدخرات فور استلام الراتب.</li>
    <li>راجع المصروفات غير الضرورية في بند (الترفيه والمطاعم).</li>
    <li>تأكد من إلغاء أي اشتراكات لا تستخدمها بانتظام.</li>
    <li>استخدم قاعدة الـ 24 ساعة قبل أي عملية شراء غير ضرورية.</li>
  `;
};

const generateSavingsTipsWithAI = async (
  userName: string,
  totalIncome: number,
  totalExpenses: number,
  transactions: any[]
): Promise<string> => {
  const apiKey = process.env.GEMINI_API_KEY?.trim();
  if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
    return getDefaultSavingsTips();
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    
    // Group transactions by category
    const categories: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categories[t.category] = (categories[t.category] || 0) + t.amount;
      });

    const categoryText = Object.entries(categories)
      .map(([cat, amt]) => `- ${cat}: ${amt.toLocaleString()} ج.م`)
      .join('\n');

    const prompt = `أنت مستشار مالي خبير للأسرة ومساعد ذكي في تطبيق "مدبّر". قم بصياغة نصائح توفير وادخار مخصصة وعملية جداً باللغة العربية بناءً على البيانات المالية التالية للمستخدم "${userName}" هذا الشهر:
- إجمالي الدخل: ${totalIncome.toLocaleString()} ج.م
- إجمالي المصاريف: ${totalExpenses.toLocaleString()} ج.م
- المتبقي (الصافي): ${(totalIncome - totalExpenses).toLocaleString()} ج.م
- تفاصيل المصاريف حسب الفئة:
${categoryText || 'لا توجد مصروفات مسجلة بعد'}

المطلوب:
أعطِ 4 نصائح/مقترحات مخصصة ومحددة بوضوح لكيفية توفير المال والادخار بشكل أفضل للمستقبل. 
اجعل الرد كقائمة عناصر HTML (باستخدام علامات <li> فقط بدون علامات <ul> أو <ol> أو عناوين، حيث سيتم إدراجها داخل علامة <ul> جاهزة). 
اجعل الأسلوب ودوداً وعملياً جداً ويشجع على الادخار، وركّز على الفئات الأكثر استهلاكاً إذا وُجدت.
تجنب إضافة أي شرح أو مقدمة أو خاتمة، فقط ابدأ بكتابة علامات <li> مباشرة.`;

    const response = await model.generateContent(prompt);
    let text = response.response.text().trim();
    
    text = text.replace(/```html/g, '').replace(/```/g, '').trim();
    if (text.includes('<li>')) {
      return text;
    }
    
    const lines = text.split('\n').map(l => l.trim()).filter(l => l.length > 0);
    return lines.map(line => `<li>${line.replace(/^[*-]\s*/, '')}</li>`).join('\n');
  } catch (error) {
    console.error('[AI Savings Tips] Error generating AI tips:', error);
    return getDefaultSavingsTips();
  }
};

const billReminderHtml = (name: string, bills: any[]) => `
<div dir="rtl" style="font-family: 'Cairo', Arial, sans-serif; background-color: #f4f7f6; padding: 24px; max-width: 600px; margin: auto; border-radius: 16px;">

  <div style="background: linear-gradient(135deg, #1a1a35 0%, #2d2d5e 100%); border-radius: 20px; padding: 28px 24px; text-align: center; margin-bottom: 20px;">
    <div style="font-size: 36px; margin-bottom: 8px;">⚠️</div>
    <h1 style="margin: 0; font-size: 20px; color: #ffffff; font-weight: 900;">تذكير بالفواتير المستحقة</h1>
    <p style="margin: 8px 0 0; color: rgba(255,255,255,0.7); font-size: 14px;">مدبّر - إدارة المنزل الذكية</p>
  </div>

  <div style="background: #ffffff; border-radius: 16px; padding: 24px; margin-bottom: 16px; box-shadow: 0 2px 12px rgba(0,0,0,0.06);">
    <h2 style="color: #1e293b; font-size: 18px; margin: 0 0 16px; font-weight: 900;">
      صباح الخير يا ${name} ☀️
    </h2>
    <p style="color: #475569; font-size: 14px; margin: 0 0 20px; line-height: 1.7;">
      هذه قائمة فواتيرك غير المدفوعة حتى الآن. يرجى الدفع وتسجيلها في التطبيق.
    </p>

    <div style="border-radius: 12px; overflow: hidden; border: 1px solid #e2e8f0;">
      <div style="background: #f8fafc; padding: 10px 16px; display: flex; justify-content: space-between; border-bottom: 1px solid #e2e8f0;">
        <span style="font-weight: 900; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">الفاتورة</span>
        <span style="font-weight: 900; font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 0.05em;">المبلغ</span>
      </div>
      ${bills.map((b, i) => {
        const late = new Date(b.dueDate) < new Date();
        return `
      <div style="padding: 14px 16px; display: flex; justify-content: space-between; align-items: center; border-bottom: ${i < bills.length - 1 ? '1px solid #f1f5f9' : 'none'}; background: ${late ? '#fff5f5' : '#ffffff'};">
        <div>
          <div style="font-weight: 700; font-size: 14px; color: #1e293b;">${b.name}</div>
          <div style="font-size: 12px; color: ${late ? '#ef4444' : '#94a3b8'}; margin-top: 2px;">
            ${late ? '⚠️ متأخرة - ' : '📅 '}${new Date(b.dueDate).toLocaleDateString('ar-EG')}
          </div>
        </div>
        <span style="font-weight: 900; font-size: 15px; color: ${late ? '#ef4444' : '#1e293b'};">${b.amount.toLocaleString()} ج.م</span>
      </div>`;
      }).join('')}
    </div>

    <div style="margin-top: 16px; padding: 12px 16px; background: #fef3c7; border-radius: 10px; border-right: 3px solid #f59e0b;">
      <p style="margin: 0; font-size: 13px; color: #92400e; font-weight: 600;">
        💡 إجمالي المستحق: <strong>${bills.reduce((s, b) => s + b.amount, 0).toLocaleString()} ج.م</strong>
      </p>
    </div>
  </div>

  <div style="text-align: center; margin-bottom: 20px;">
    <a href="https://home-mgmt-frontend.onrender.com/dashboard/bills"
       style="display: inline-block; background: linear-gradient(135deg, #f59e0b 0%, #d97706 100%); color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 12px; font-weight: 900; font-size: 15px; box-shadow: 0 4px 15px rgba(245,158,11,0.3);">
      سجّل الدفع الآن →
    </a>
  </div>

  <div style="text-align: center; color: #94a3b8; font-size: 11px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
    <p style="margin: 0;">هذا إيميل تذكير يومي تلقائي من نظام مدبّر 🏠</p>
  </div>
</div>
`;

export const generateAndSendMonthlyReports = async () => {
  try {
    console.log('[Monthly Report] Starting report generation...');
    
    const now = new Date();
    const month = now.getMonth() + 1; // current month (1-12)
    const year = now.getFullYear();
    
    const startOfMonth = new Date(year, month - 1, 1);
    const endOfMonth = new Date(year, month, 0, 23, 59, 59);

    const monthName = startOfMonth.toLocaleString('ar-EG', { month: 'long' });

    const users = await prisma.user.findMany();

    for (const user of users) {
      const transactions = await prisma.transaction.findMany({
        where: {
          userId: user.id,
          date: { gte: startOfMonth, lte: endOfMonth }
        }
      });

      let totalIncome = 0;
      let totalExpenses = 0;
      const categories: Record<string, number> = {};

      transactions.forEach(t => {
        if (t.type === 'income') totalIncome += t.amount;
        else {
          totalExpenses += t.amount;
          categories[t.category] = (categories[t.category] || 0) + t.amount;
        }
      });

      const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
      
      const balance = totalIncome - totalExpenses;
      
      const tipsHtml = await generateSavingsTipsWithAI(user.name, totalIncome, totalExpenses, transactions);
      let savingsTips = `
        <ul style="padding-right: 20px; color: #0f766e; line-height: 1.6;">
          ${tipsHtml}
        </ul>
      `;

      const html = `
        <div dir="rtl" style="font-family: 'Cairo', sans-serif; background-color: #f4f7f6; padding: 20px; border-radius: 10px; max-width: 600px; margin: auto;">
          <div style="background-color: #1a1a35; color: white; padding: 30px 20px; border-radius: 20px; text-align: center; margin-bottom: 20px;">
            <h1 style="margin: 0; font-size: 24px;">ملخصك المالي لشهر ${monthName}</h1>
            <p style="opacity: 0.8; margin-top: 10px;">أهلاً بك يا ${user.name}</p>
          </div>
          
          <div style="padding: 25px; background: white; border-radius: 20px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
            <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px; background: #f0fdf4; border-radius: 10px;">
              <span style="color: #166534;">إجمالي الدخل:</span>
              <span style="font-weight: bold; color: #15803d;">${totalIncome.toLocaleString()} ج.م</span>
            </div>

            <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px; background: #fef2f2; border-radius: 10px;">
              <span style="color: #991b1b;">إجمالي المصاريف:</span>
              <span style="font-weight: bold; color: #b91c1c;">${totalExpenses.toLocaleString()} ج.م</span>
            </div>

            <div style="display: flex; justify-content: space-between; padding: 10px; background: #f8fafc; border-radius: 10px; border: 1px dashed #e2e8f0;">
              <span style="color: #475569;">صافي الرصيد:</span>
              <span style="font-weight: bold; color: #1e293b;">${balance.toLocaleString()} ج.م</span>
            </div>

            ${topCategory ? `
              <div style="margin-top: 25px; padding: 20px; background: linear-gradient(135deg, #6366f1, #818cf8); border-radius: 15px; color: white;">
                <p style="margin: 0; font-size: 14px; opacity: 0.9;">أكبر بند استهلاك:</p>
                <h3 style="margin: 5px 0 0 0; font-size: 20px;">${topCategory[0]}</h3>
                <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold;">بإجمالي: ${topCategory[1].toLocaleString()} ج.م</p>
              </div>
            ` : ''}
          </div>

          <div style="margin-top: 20px; padding: 25px; background: #f0fdfa; border-radius: 20px; border: 1px solid #ccfbf1;">
            <h2 style="color: #0f766e; margin-top: 0; font-size: 18px;">💡 خطة التوفير المقترحة:</h2>
            ${savingsTips}
          </div>

          <div style="margin-top: 30px; text-align: center; color: #94a3b8; font-size: 12px;">
            <p>شكراً لاستخدامك نظام إدارة المنزل الذكي.</p>
          </div>
        </div>
      `;

      await sendEmail(user.email, `تقرير شهر ${monthName} وخطة التوفير - مدبّر`, html);
      console.log(`[Monthly Report] Email sent to ${user.email}`);
    }

    console.log('[Monthly Report] All reports sent successfully!');
  } catch (error) {
    console.error('[Monthly Report] Error:', error);
  }
};

export const sendDailyBillReminders = async () => {
  try {
    const users = await prisma.user.findMany();
    const now = new Date();
    // Only check bills due this month or earlier
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);
    
    for (const user of users) {
      const allUnpaidBills = await prisma.bill.findMany({
        where: {
          userId: user.id,
          isPaid: false
        },
        orderBy: { dueDate: 'asc' }
      });

      // Remind about all unpaid bills (both overdue and upcoming)
      const unpaidBills = allUnpaidBills;

      if (unpaidBills.length > 0) {
        const html = billReminderHtml(user.name, unpaidBills);
        await sendEmail(user.email, `⚠️ تذكير: لديك ${unpaidBills.length} فواتير لم تُدفع - مدبّر`, html);
      }
    }
  } catch (error) {
    console.error('[Daily Reminder] Error:', error);
  }
};

export const sendScheduledReminderEmails = async () => {
  try {
    const now = new Date();
    // Find reminders that are due (reminderAt <= now) and email not yet sent
    const dueReminders = await prisma.reminder.findMany({
      where: {
        reminderAt: { lte: now },
        emailSent: false,
        isCompleted: false,
      },
      include: { user: true },
    });

    for (const reminder of dueReminders) {
      const priorityLabel =
        reminder.priority === 'high' ? '🔴 عالية'
        : reminder.priority === 'low' ? '🟢 منخفضة'
        : '🟡 متوسطة';

      const html = `
        <div dir="rtl" style="font-family: 'Cairo', sans-serif; background-color: #f4f7f6; padding: 20px; border-radius: 10px; max-width: 600px; margin: auto;">
          <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); color: white; padding: 30px 20px; border-radius: 20px; text-align: center; margin-bottom: 20px;">
            <div style="font-size: 48px; margin-bottom: 10px;">🔔</div>
            <h1 style="margin: 0; font-size: 22px;">تذكير: ${reminder.title}</h1>
            <p style="opacity: 0.85; margin-top: 8px; font-size: 14px;">أهلاً يا ${reminder.user.name}، هذا تذكير مجدول من نظام مدبّر</p>
          </div>

          <div style="padding: 25px; background: white; border-radius: 20px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
            <div style="margin-bottom: 15px; padding: 12px 16px; background: #f8fafc; border-radius: 12px; border-right: 4px solid #6366f1;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">العنوان</p>
              <p style="margin: 4px 0 0 0; font-weight: bold; color: #1e293b; font-size: 16px;">${reminder.title}</p>
            </div>

            ${reminder.description ? `
            <div style="margin-bottom: 15px; padding: 12px 16px; background: #f8fafc; border-radius: 12px;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">التفاصيل</p>
              <p style="margin: 4px 0 0 0; color: #475569;">${reminder.description}</p>
            </div>
            ` : ''}

            <div style="margin-bottom: 15px; padding: 12px 16px; background: #f8fafc; border-radius: 12px;">
              <p style="margin: 0; font-size: 12px; color: #64748b;">الأولوية</p>
              <p style="margin: 4px 0 0 0; font-weight: bold;">${priorityLabel}</p>
            </div>

            <div style="margin-top: 25px; padding: 20px; background: linear-gradient(135deg, #f0fdf4, #dcfce7); border-radius: 15px; text-align: center;">
              <p style="margin: 0; color: #166534; font-weight: bold;">⏰ وقت التذكير: ${now.toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' })}</p>
            </div>
          </div>

          <div style="margin-top: 20px; text-align: center; color: #94a3b8; font-size: 12px;">
            <p>شكراً لاستخدامك نظام مدبّر لإدارة المنزل. 🏠</p>
          </div>
        </div>
      `;

      await sendEmail(reminder.user.email, `🔔 تذكير: ${reminder.title}`, html);

      // Mark email as sent
      await prisma.reminder.update({
        where: { id: reminder.id },
        data: { emailSent: true },
      });

      console.log(`[Reminder] Email sent to ${reminder.user.email} for reminder: ${reminder.title}`);
    }
  } catch (error) {
    console.error('[Reminder] Error sending scheduled reminders:', error);
  }
};

export const initMonthlyReportCron = () => {
  // Day 30 at 9 AM for monthly report
  cron.schedule('0 9 30 * *', () => {
    generateAndSendMonthlyReports();
  });
  
  // Daily reminder at 09:00 AM for unpaid bills
  cron.schedule('0 9 * * *', () => {
    sendDailyBillReminders();
  });

  // Every minute: check for due reminder emails
  cron.schedule('* * * * *', () => {
    sendScheduledReminderEmails();
  });
  
  console.log('📅 Financial cron jobs (Monthly day 30, Daily 9AM, Reminders every 1min) initialized');
};
