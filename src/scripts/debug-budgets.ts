import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testBudgetsGet() {
  console.log('Testing GET /api/budgets logic...');
  try {
    const now = new Date();
    const m = now.getMonth() + 1;
    const y = now.getFullYear();

    const budgets = await prisma.budget.findMany({
      include: {
        user: {
          select: { name: true }
        }
      }
    });
    console.log('Budgets fetched:', budgets.length);

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59);

    const transactions = await prisma.transaction.findMany({
      where: {
        type: 'expense',
        date: { gte: startDate, lte: endDate },
      },
    });
    console.log('Transactions fetched:', transactions.length);

    const spendingMap: Record<string, Record<string, number>> = {};
    transactions.forEach(t => {
      if (!spendingMap[t.userId]) spendingMap[t.userId] = {};
      spendingMap[t.userId][t.category] = (spendingMap[t.userId][t.category] || 0) + t.amount;
    });

    const result = budgets.map(b => {
      const userSpent = spendingMap[b.userId] || {};
      const actualSpent = userSpent[b.category] || 0;
      return {
        ...b,
        userName: b.user?.name || 'مستخدم',
        spent: actualSpent,
        remaining: Math.max(0, b.amount - actualSpent),
      };
    });

    console.log('SUCCESS! Sample result:', result[0] || 'No budgets');
  } catch (error) {
    console.error('FAILED! Internal Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testBudgetsGet();
