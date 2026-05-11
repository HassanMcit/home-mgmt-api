import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, requireAdmin } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get budgets with actual spending calculation
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, month, year } = req.query;
    
    const now = new Date();
    let m = month ? parseInt(month as string) : now.getMonth() + 1;
    let y = year ? parseInt(year as string) : now.getFullYear();
    
    if (isNaN(m) || m < 1 || m > 12) m = now.getMonth() + 1;
    if (isNaN(y) || y < 2000 || y > 2100) y = now.getFullYear();

    const whereBudget: any = {};
    if (req.user!.role !== 'admin') {
      whereBudget.userId = req.user!.id;
    } else if (userId && userId !== 'all' && userId !== 'undefined') {
      whereBudget.userId = userId as string;
    }

    const budgets = await prisma.budget.findMany({
      where: whereBudget,
    });

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59);

    const whereTransaction: any = {
      type: 'expense',
      date: { gte: startDate, lte: endDate },
    };

    if (req.user!.role !== 'admin') {
      whereTransaction.userId = req.user!.id;
    } else if (userId && userId !== 'all' && userId !== 'undefined') {
      whereTransaction.userId = userId as string;
    }

    const transactions = await prisma.transaction.findMany({
      where: whereTransaction,
      select: { amount: true, category: true, userId: true }
    });
    
    const spendingMap: Record<string, Record<string, number>> = {};
    transactions.forEach(t => {
      if (!spendingMap[t.userId]) spendingMap[t.userId] = {};
      spendingMap[t.userId][t.category] = (spendingMap[t.userId][t.category] || 0) + t.amount;
    });

    const budgetsWithSpending = budgets.map(b => {
      const userSpent = spendingMap[b.userId] || {};
      const actualSpent = userSpent[b.category] || 0;
      
      return {
        ...b,
        userName: 'مستخدم',
        spent: actualSpent,
        remaining: Math.max(0, b.amount - actualSpent),
      };
    });

    res.json(budgetsWithSpending);
  } catch (error: any) {
    console.error('[Budgets GET] Error:', error);
    res.status(500).json({ 
      message: 'فشل في تحميل الميزانية: ' + (error.message || 'خطأ في قاعدة البيانات')
    });
  }
});

// Create/update budget (ADMIN ONLY)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, amount, targetUserId } = req.body;

    if (!category || !amount) {
      res.status(400).json({ message: 'الفئة والمبلغ مطلوبان' });
      return;
    }

    // Force Admin to specify a user explicitly if they are doing it for someone else
    // We don't default to Admin ID here anymore to prevent accidental self-attribution
    const userId = req.user!.id;

    console.log(`[Budget POST] Assigning for User: ${userId}, Cat: ${category}, Amt: ${amount}`);

    const existingBudget = await prisma.budget.findFirst({
      where: { userId, category }
    });

    let budget;
    if (existingBudget) {
      budget = await prisma.budget.update({
        where: { id: existingBudget.id },
        data: { amount: parseFloat(amount) },
      });
    } else {
      budget = await prisma.budget.create({
        data: {
          userId,
          category,
          amount: parseFloat(amount),
        },
      });
    }

    res.json(budget);
  } catch (error) {
    console.error('[Budgets POST] Fatal Error:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء حفظ الميزانية' });
  }
});

// Delete budget (ADMIN ONLY)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await prisma.budget.delete({
      where: { id: req.params.id },
    });
    res.json({ message: 'تم حذف الميزانية بنجاح' });
  } catch (error) {
    console.error('[Budgets DELETE] Error:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء حذف الميزانية' });
  }
});

export default router;
