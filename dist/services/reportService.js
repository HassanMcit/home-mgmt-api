"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendDailyBillReminders = exports.initMonthlyReportCron = exports.generateAndSendMonthlyReports = void 0;
const nodemailer_1 = __importDefault(require("nodemailer"));
const node_cron_1 = __importDefault(require("node-cron"));
const client_1 = require("@prisma/client");
const prisma = new client_1.PrismaClient();
// Configure the email transporter
// You'll need to set these in your .env file
const transporter = nodemailer_1.default.createTransport({
    service: 'gmail',
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS, // This should be the 16-character App Password
    },
});
const generateAndSendMonthlyReports = async () => {
    try {
        console.log('[Monthly Report] Starting report generation...');
        // Calculate last month and year
        const now = new Date();
        let month = now.getMonth(); // previous month (0-11)
        let year = now.getFullYear();
        if (month === 0) { // If currently January, previous month is December of previous year
            month = 12;
            year -= 1;
        }
        const startOfMonth = new Date(year, month - 1, 1);
        const endOfMonth = new Date(year, month, 0, 23, 59, 59);
        const monthName = startOfMonth.toLocaleString('ar-EG', { month: 'long' });
        // Get all users
        const users = await prisma.user.findMany();
        for (const user of users) {
            // 1. Get user's transactions for the PREVIOUS month
            const transactions = await prisma.transaction.findMany({
                where: {
                    userId: user.id,
                    date: { gte: startOfMonth, lte: endOfMonth }
                }
            });
            // 2. Get user's UNPAID bills for the NEW month (and previous unpaid)
            const unpaidBills = await prisma.bill.findMany({
                where: {
                    userId: user.id,
                    isPaid: false
                },
                orderBy: { dueDate: 'asc' }
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
            // Email Template
            const mailOptions = {
                from: `"نظام إدارة المنزل" <${process.env.EMAIL_USER}>`,
                to: user.email,
                subject: `تقرير شهر ${monthName} وتذكير فواتير الشهر الجديد`,
                html: `
          <div dir="rtl" style="font-family: 'Cairo', sans-serif; background-color: #f4f7f6; padding: 20px; border-radius: 10px; max-width: 600px; margin: auto;">
            <div style="background-color: #1a1a35; color: white; padding: 30px 20px; border-radius: 20px; text-align: center; margin-bottom: 20px;">
              <h1 style="margin: 0; font-size: 24px;">ملخصك المالي الذكي</h1>
              <p style="opacity: 0.8; margin-top: 10px;">أهلاً بك يا ${user.name}، إليك مراجعة شهر ${monthName}</p>
            </div>

            <!-- New Month Reminders -->
            ${unpaidBills.length > 0 ? `
            <div style="padding: 20px; background: #fffbeb; border: 1px solid #fef3c7; margin-bottom: 20px; border-radius: 15px;">
              <h2 style="color: #92400e; margin-top: 0; font-size: 18px; display: flex; align-items: center;">
                🔔 تذكير بالفواتير القادمة:
              </h2>
              <p style="color: #b45309; font-size: 14px;">لديك <strong>${unpaidBills.length}</strong> فواتير بانتظار الدفع هذا الشهر:</p>
              <ul style="padding-right: 20px; color: #78350f;">
                ${unpaidBills.map(b => `
                  <li style="margin-bottom: 8px;">
                    <strong>${b.name}</strong>: ${b.amount.toLocaleString()} ج.م 
                    <span style="font-size: 11px; opacity: 0.7;">(تاريخ الاستحقاق: ${new Date(b.dueDate).toLocaleDateString('ar-EG')})</span>
                  </li>
                `).join('')}
              </ul>
            </div>
            ` : ''}
            
            <!-- Previous Month Stats -->
            <div style="padding: 25px; background: white; border-radius: 20px; box-shadow: 0 10px 15px -3px rgba(0,0,0,0.1);">
              <h2 style="color: #6366f1; border-bottom: 2px solid #f8fafc; padding-bottom: 15px; margin-top: 0;">تقرير أداء شهر ${monthName}:</h2>
              
              <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px; background: #f0fdf4; border-radius: 10px;">
                <span style="color: #166534;">إجمالي الدخل:</span>
                <span style="font-weight: bold; color: #15803d;">${totalIncome.toLocaleString()} ج.م</span>
              </div>

              <div style="display: flex; justify-content: space-between; margin-bottom: 15px; padding: 10px; background: #fef2f2; border-radius: 10px;">
                <span style="color: #991b1b;">إجمالي المصاريف:</span>
                <span style="font-weight: bold; color: #b91c1c;">${totalExpenses.toLocaleString()} ج.م</span>
              </div>

              <div style="display: flex; justify-content: space-between; padding: 10px; background: #f8fafc; border-radius: 10px; border: 1px dashed #e2e8f0;">
                <span style="color: #475569;">صافي الرصيد من هذا الشهر:</span>
                <span style="font-weight: bold; color: #1e293b;">${(totalIncome - totalExpenses).toLocaleString()} ج.م</span>
              </div>

              ${topCategory ? `
                <div style="margin-top: 25px; padding: 20px; background: linear-gradient(135deg, #6366f1, #818cf8); border-radius: 15px; color: white;">
                  <p style="margin: 0; font-size: 14px; opacity: 0.9;">أكبر بند استهلاك للميزانية:</p>
                  <h3 style="margin: 5px 0 0 0; font-size: 20px;">${topCategory[0]}</h3>
                  <p style="margin: 5px 0 0 0; font-size: 16px; font-weight: bold;">بإجمالي: ${topCategory[1].toLocaleString()} ج.م</p>
                </div>
              ` : ''}
            </div>

            <div style="margin-top: 30px; text-align: center; color: #94a3b8; font-size: 12px; line-height: 1.6;">
              <p>شكراً لاستخدامك نظام إدارة المنزل الذكي.<br>نتمنى لك شهراً مليئاً بالبركة والتوفير!</p>
            </div>
          </div>
        `,
            };
            await transporter.sendMail(mailOptions);
            console.log(`[Monthly Report] Email sent to ${user.email}`);
        }
        console.log('[Monthly Report] All reports sent successfully!');
    }
    catch (error) {
        console.error('[Monthly Report] Error:', error);
    }
};
exports.generateAndSendMonthlyReports = generateAndSendMonthlyReports;
// Schedule the task to run on the 1st day of every month at 00:00
const initMonthlyReportCron = () => {
    node_cron_1.default.schedule('0 0 1 * *', () => {
        (0, exports.generateAndSendMonthlyReports)();
    });
    // Daily reminder at 09:00 AM for unpaid bills
    node_cron_1.default.schedule('0 9 * * *', () => {
        (0, exports.sendDailyBillReminders)();
    });
    console.log('📅 Financial cron jobs (Monthly & Daily) initialized');
};
exports.initMonthlyReportCron = initMonthlyReportCron;
const sendDailyBillReminders = async () => {
    try {
        const users = await prisma.user.findMany();
        for (const user of users) {
            const unpaidBills = await prisma.bill.findMany({
                where: {
                    userId: user.id,
                    isPaid: false
                },
                orderBy: { dueDate: 'asc' }
            });
            if (unpaidBills.length > 0) {
                const mailOptions = {
                    from: `"تنبيه الفواتير" <${process.env.EMAIL_USER}>`,
                    to: user.email,
                    subject: `⚠️ تذكير: لديك ${unpaidBills.length} فواتير لم تُدفع بعد`,
                    html: `
            <div dir="rtl" style="font-family: 'Cairo', sans-serif; padding: 20px; border-radius: 15px; border: 2px solid #ef4444; max-width: 500px; margin: auto;">
              <h2 style="color: #ef4444; margin-top: 0;">صباح الخير يا ${user.name} ☀️</h2>
              <p>نذكرك بوجود فواتير تستحق الدفع قريباً:</p>
              <div style="background: #fef2f2; padding: 15px; border-radius: 10px;">
                ${unpaidBills.map(b => `
                  <div style="padding: 10px 0; border-bottom: 1px solid #fee2e2;">
                    <strong>${b.name}</strong> - <span style="color: #b91c1c;">${b.amount.toLocaleString()} ج.م</span><br>
                    <small style="color: #7f1d1d;">تاريخ الاستحقاق: ${new Date(b.dueDate).toLocaleDateString('ar-EG')}</small>
                  </div>
                `).join('')}
              </div>
              <p style="margin-top: 20px; font-size: 14px; color: #64748b;">يرجى الدخول للموقع لتسجيل الدفع والحفاظ على توازن ميزانيتك.</p>
              <a href="${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard/bills" style="display: block; text-align: center; background: #ef4444; color: white; padding: 12px; border-radius: 8px; text-decoration: none; font-weight: bold; margin-top: 15px;">انتقل لصفحة الفواتير الآن</a>
            </div>
          `
                };
                await transporter.sendMail(mailOptions);
            }
        }
    }
    catch (error) {
        console.error('[Daily Reminder] Error:', error);
    }
};
exports.sendDailyBillReminders = sendDailyBillReminders;
//# sourceMappingURL=reportService.js.map