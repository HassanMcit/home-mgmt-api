import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Create admin user
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.upsert({
    where: { email: 'admin@home.com' },
    update: {},
    create: {
      name: 'حسن علي',
      email: 'admin@home.com',
      password: adminPassword,
      role: 'admin',
    },
  });

  console.log('✅ Admin user created:', admin.email);

  // Create wife user
  const wifePassword = await bcrypt.hash('wife123', 12);
  const wife = await prisma.user.upsert({
    where: { email: 'wife@home.com' },
    update: {},
    create: {
      name: 'زوجتي',
      email: 'wife@home.com',
      password: wifePassword,
      role: 'member',
    },
  });

  console.log('✅ Wife user created:', wife.email);

  // Create son user
  const sonPassword = await bcrypt.hash('son123', 12);
  const son = await prisma.user.upsert({
    where: { email: 'son@home.com' },
    update: {},
    create: {
      name: 'ابني',
      email: 'son@home.com',
      password: sonPassword,
      role: 'member',
    },
  });

  console.log('✅ Son user created:', son.email);

  // Add sample transactions for admin
  const now = new Date();
  const month = now.getMonth();
  const year = now.getFullYear();

  const sampleTransactions = [
    { amount: 15000, type: 'income', category: 'other', description: 'راتب شهر مايو', date: new Date(year, month, 1) },
    { amount: 2500, type: 'expense', category: 'housing', description: 'إيجار الشقة', date: new Date(year, month, 2) },
    { amount: 800, type: 'expense', category: 'food', description: 'سوبرماركت', date: new Date(year, month, 3) },
    { amount: 300, type: 'expense', category: 'transport', description: 'بنزين', date: new Date(year, month, 5) },
    { amount: 500, type: 'expense', category: 'utilities', description: 'فاتورة كهرباء', date: new Date(year, month, 7) },
    { amount: 250, type: 'expense', category: 'utilities', description: 'فاتورة مياه', date: new Date(year, month, 7) },
    { amount: 600, type: 'expense', category: 'food', description: 'مطعم وطلبات', date: new Date(year, month, 10) },
    { amount: 1200, type: 'expense', category: 'health', description: 'دكتور وأدوية', date: new Date(year, month, 12) },
    { amount: 400, type: 'expense', category: 'entertainment', description: 'نتفليكس وترفيه', date: new Date(year, month, 15) },
    { amount: 2000, type: 'income', category: 'other', description: 'عمل إضافي', date: new Date(year, month, 15) },
    { amount: 700, type: 'expense', category: 'clothing', description: 'ملابس', date: new Date(year, month, 18) },
    { amount: 350, type: 'expense', category: 'education', description: 'كتب دراسية', date: new Date(year, month, 20) },
  ];

  for (const tx of sampleTransactions) {
    await prisma.transaction.create({
      data: {
        userId: admin.id,
        ...tx,
      },
    });
  }

  console.log('✅ Sample transactions created');

  // Add sample budgets
  const budgets = [
    { category: 'food', amount: 1500 },
    { category: 'transport', amount: 500 },
    { category: 'housing', amount: 3000 },
    { category: 'health', amount: 1000 },
    { category: 'entertainment', amount: 600 },
    { category: 'utilities', amount: 800 },
  ];

  for (const b of budgets) {
    await prisma.budget.upsert({
      where: {
        userId_category_month_year: {
          userId: admin.id,
          category: b.category,
          month: month + 1,
          year,
        },
      },
      update: {},
      create: {
        userId: admin.id,
        category: b.category,
        amount: b.amount,
        month: month + 1,
        year,
      },
    });
  }

  console.log('✅ Sample budgets created');

  // Add sample savings
  const savings = [
    { name: 'سيارة جديدة', targetAmount: 80000, currentAmount: 15000, color: '#3b82f6' },
    { name: 'إجازة صيفية', targetAmount: 20000, currentAmount: 5000, color: '#10b981' },
    { name: 'طوارئ', targetAmount: 30000, currentAmount: 10000, color: '#f59e0b' },
  ];

  for (const s of savings) {
    const existing = await prisma.saving.findFirst({
      where: { userId: admin.id, name: s.name },
    });
    if (!existing) {
      await prisma.saving.create({
        data: {
          userId: admin.id,
          ...s,
        },
      });
    }
  }

  console.log('✅ Sample savings created');

  // Add fixed monthly expenses (Bills)
  const bills = [
    { name: 'قسط شقة بدر (7 سنين)', amount: 0, dueDate: new Date(year, month + 1, 1), isRecurring: true, category: 'housing' },
    { name: 'قسط شقة برج العرب (14 سنة)', amount: 0, dueDate: new Date(year, month + 1, 5), isRecurring: true, category: 'housing' },
    { name: 'مصروف مواصلات القرية', amount: 0, dueDate: new Date(year, month + 1, 10), isRecurring: true, category: 'transport' },
    { name: 'انترنت', amount: 0, dueDate: new Date(year, month + 1, 20), isRecurring: true, category: 'utilities' },
    { name: 'ماية نسله', amount: 0, dueDate: new Date(year, month + 1, 15), isRecurring: true, category: 'utilities' },
    { name: 'عاصمة', amount: 0, dueDate: new Date(year, month + 1, 1), isRecurring: true, category: 'other' },
    { name: 'مصاريف البنك', amount: 0, dueDate: new Date(year, month + 1, 28), isRecurring: true, category: 'other' },
    { name: 'فواتير', amount: 0, dueDate: new Date(year, month + 1, 1), isRecurring: true, category: 'utilities' },
    { name: 'جمعية', amount: 0, dueDate: new Date(year, month + 1, 1), isRecurring: true, category: 'other' },
    { name: 'مصروف مواصلات العاصمة', amount: 0, dueDate: new Date(year, month + 1, 1), isRecurring: true, category: 'transport' },
    { name: 'تامين', amount: 0, dueDate: new Date(year, month + 1, 1), isRecurring: true, category: 'other' },
    { name: 'حلاقة', amount: 0, dueDate: new Date(year, month + 1, 1), isRecurring: true, category: 'other' },
    { name: 'سفر | ارضي', amount: 0, dueDate: new Date(year, month + 1, 1), isRecurring: true, category: 'transport' },
    { name: 'بواب', amount: 0, dueDate: new Date(year, month + 1, 1), isRecurring: true, category: 'housing' },
    { name: 'انبوبة', amount: 0, dueDate: new Date(year, month + 1, 1), isRecurring: true, category: 'utilities' },
    { name: 'مصروف البيت والزوجه', amount: 0, dueDate: new Date(year, month + 1, 1), isRecurring: true, category: 'other' },
    { name: 'شحن الموبيل', amount: 0, dueDate: new Date(year, month + 1, 1), isRecurring: true, category: 'utilities' },
    { name: 'مصروف علي', amount: 0, dueDate: new Date(year, month + 1, 1), isRecurring: true, category: 'other' },
    { name: 'طوارئ', amount: 0, dueDate: new Date(year, month + 1, 1), isRecurring: true, category: 'other' },
    { name: 'كهرباء بدر', amount: 0, dueDate: new Date(year, month + 1, 1), isRecurring: true, category: 'utilities' },
    { name: 'مصاريف خدمات شقة العشرين', amount: 0, dueDate: new Date(year, month + 1, 1), isRecurring: true, category: 'housing' },
    { name: 'ماية بدر', amount: 0, dueDate: new Date(year, month + 1, 1), isRecurring: true, category: 'utilities' },
    { name: 'غاز بدر', amount: 0, dueDate: new Date(year, month + 1, 1), isRecurring: true, category: 'utilities' },
    { name: 'قسط الموبيل', amount: 0, dueDate: new Date(year, month + 1, 1), isRecurring: true, category: 'other' },
    { name: 'اشتراك gemini الشهري', amount: 0, dueDate: new Date(year, month + 1, 1), isRecurring: true, category: 'other' },
  ];

  for (const bill of bills) {
    const existing = await prisma.bill.findFirst({
      where: { userId: admin.id, name: bill.name },
    });
    if (!existing) {
      await prisma.bill.create({
        data: {
          userId: admin.id,
          ...bill,
        },
      });
    }
  }

  console.log('✅ Sample bills created');

  console.log('\n🎉 Database seeded successfully!');
  console.log('\n📋 Login credentials:');
  console.log('Admin: admin@home.com / admin123');
  console.log('Wife:  wife@home.com / wife123');
  console.log('Son:   son@home.com / son123');
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
