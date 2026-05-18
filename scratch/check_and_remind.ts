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
      to, subject, html,
    });
    return true;
  } catch (err: any) {
    console.error('  Mail error:', err.message);
    return false;
  }
}

const billReminderHtml = (name: string, bills: { name: string; amount: number; dueDate: Date }[]) => `
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

async function main() {
  // ── 1. Show all users & roles ────────────────────────────────────
  console.log('\n👥 المستخدمون في قاعدة البيانات:');
  console.log('─'.repeat(55));
  const users = await prisma.user.findMany({
    select: { id: true, name: true, email: true, role: true }
  });
  users.forEach(u => {
    console.log(`  [${u.role.toUpperCase()}] ${u.name} — ${u.email}`);
  });
  console.log('─'.repeat(55));

  // ── 2. Send bill reminders ────────────────────────────────────────
  console.log('\n📧 إرسال تذكير الفواتير:\n');
  const now = new Date();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

  let sent = 0, skipped = 0, failed = 0;

  for (const user of users) {
    const unpaid = await prisma.bill.findMany({
      where: {
        userId: user.id,
        isPaid: false,
        dueDate: { lte: endOfMonth },
      },
      orderBy: { dueDate: 'asc' },
    });

    if (unpaid.length === 0) {
      console.log(`  ⏭️  ${user.name} — لا توجد فواتير مستحقة`);
      skipped++;
      continue;
    }

    process.stdout.write(`  📧 ${user.name} (${unpaid.length} فاتورة)... `);
    const ok = await sendEmail(
      user.email,
      `⚠️ تذكير: لديك ${unpaid.length} فاتورة غير مدفوعة - مدبّر`,
      billReminderHtml(user.name, unpaid)
    );
    if (ok) { console.log('✅'); sent++; }
    else { console.log('❌'); failed++; }

    await new Promise(r => setTimeout(r, 1500));
  }

  console.log(`\n📊 النتيجة: ${sent} تم الإرسال | ${skipped} بدون فواتير | ${failed} فشل\n`);
  await prisma.$disconnect();
}

main().catch(async err => {
  console.error('Fatal:', err);
  await prisma.$disconnect();
  process.exit(1);
});
