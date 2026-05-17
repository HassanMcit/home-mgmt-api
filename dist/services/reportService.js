"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.initMonthlyReportCron = exports.sendDailyBillReminders = exports.generateAndSendMonthlyReports = void 0;
const node_cron_1 = __importDefault(require("node-cron"));
const client_1 = require("@prisma/client");
const mailer_1 = require("../utils/mailer");
const prisma = new client_1.PrismaClient();
const generateAndSendMonthlyReports = async () => {
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
            const categories = {};
            transactions.forEach(t => {
                if (t.type === 'income')
                    totalIncome += t.amount;
                else {
                    totalExpenses += t.amount;
                    categories[t.category] = (categories[t.category] || 0) + t.amount;
                }
            });
            const topCategory = Object.entries(categories).sort((a, b) => b[1] - a[1])[0];
            const balance = totalIncome - totalExpenses;
            let savingsTips = `
        <ul style="padding-right: 20px; color: #0f766e; line-height: 1.6;">
          <li>حاول تخصيص 20% من دخلك للمدخرات فور استلام الراتب.</li>
          <li>راجع المصروفات غير الضرورية في بند (الترفيه والمطاعم).</li>
          <li>تأكد من إلغاء أي اشتراكات لا تستخدمها بانتظام.</li>
          <li>استخدم قاعدة الـ 24 ساعة قبل أي عملية شراء غير ضرورية.</li>
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
            await (0, mailer_1.sendEmail)(user.email, `تقرير شهر ${monthName} وخطة التوفير - مدبّر`, html);
            console.log(`[Monthly Report] Email sent to ${user.email}`);
        }
        console.log('[Monthly Report] All reports sent successfully!');
    }
    catch (error) {
        console.error('[Monthly Report] Error:', error);
    }
};
exports.generateAndSendMonthlyReports = generateAndSendMonthlyReports;
const sendDailyBillReminders = async () => {
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
            // Filter bills that are actually due this month
            const unpaidBills = allUnpaidBills.filter(b => b.dueDate <= endOfMonth);
            if (unpaidBills.length > 0) {
                const html = `
          <div dir="rtl" style="font-family: 'Cairo', sans-serif; padding: 20px; border-radius: 15px; border: 2px solid #ef4444; max-width: 500px; margin: auto;">
            <h2 style="color: #ef4444; margin-top: 0;">صباح الخير يا ${user.name} ☀️</h2>
            <p>نذكرك بوجود فواتير تستحق الدفع:</p>
            <div style="background: #fef2f2; padding: 15px; border-radius: 10px;">
              ${unpaidBills.map(b => `
                <div style="padding: 10px 0; border-bottom: 1px solid #fee2e2;">
                  <strong>${b.name}</strong> - <span style="color: #b91c1c;">${b.amount.toLocaleString()} ج.م</span><br>
                  <small style="color: #7f1d1d;">تاريخ الاستحقاق: ${b.dueDate.toLocaleDateString('ar-EG')}</small>
                </div>
              `).join('')}
            </div>
            <p style="margin-top: 20px; font-size: 14px; color: #64748b;">الرجاء الدخول للموقع لتسجيل الدفع.</p>
          </div>
        `;
                await (0, mailer_1.sendEmail)(user.email, `⚠️ تذكير: لديك ${unpaidBills.length} فواتير لم تُدفع`, html);
            }
        }
    }
    catch (error) {
        console.error('[Daily Reminder] Error:', error);
    }
};
exports.sendDailyBillReminders = sendDailyBillReminders;
const initMonthlyReportCron = () => {
    // Day 30 at 9 AM for monthly report
    node_cron_1.default.schedule('0 9 30 * *', () => {
        (0, exports.generateAndSendMonthlyReports)();
    });
    // Daily reminder at 09:00 AM for unpaid bills
    node_cron_1.default.schedule('0 9 * * *', () => {
        (0, exports.sendDailyBillReminders)();
    });
    console.log('📅 Financial cron jobs (Monthly day 30 & Daily 9AM) initialized');
};
exports.initMonthlyReportCron = initMonthlyReportCron;
//# sourceMappingURL=reportService.js.map