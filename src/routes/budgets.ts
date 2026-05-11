import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, requireAdmin } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get budgets with actual spending calculation
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.query;
    
    const now = new Date();
    const m = now.getMonth() + 1;
    const y = now.getFullYear();

    // 1. Determine which budgets to fetch
    const whereBudget: any = {};
    if (req.user!.role === 'admin') {
      if (userId && userId !== 'all' && userId !== 'undefined' && userId !== '') {
        whereBudget.userId = userId as string;
      }
    } else {
      whereBudget.userId = req.user!.id;
    }

    const budgets = await prisma.budget.findMany({
      where: whereBudget,
      include: {
        user: {
          select: { name: true }
        }
      }
    });

    // 2. Determine which transactions to fetch for spending calculation
    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59);

    const whereTransaction: any = {
      type: 'expense',
      date: { gte: startDate, lte: endDate },
    };

    if (req.user!.role === 'admin') {
      if (userId && userId !== 'all' && userId !== 'undefined' && userId !== '') {
        whereTransaction.userId = userId as string;
      }
    } else {
      whereTransaction.userId = req.user!.id;
    }

    const transactions = await prisma.transaction.findMany({
      where: whereTransaction,
    });
    
    // 3. Map spending by [userId][category] to avoid mixed up data for Admins
    const spendingMap: Record<string, Record<string, number>> = {};
    transactions.forEach(t => {
      if (!spendingMap[t.userId]) spendingMap[t.userId] = {};
      spendingMap[t.userId][t.category] = (spendingMap[t.userId][t.category] || 0) + t.amount;
    });

    // 4. Combine budget info with calculated spending
    const budgetsWithSpending = budgets.map(b => {
      const userSpent = spendingMap[b.userId] || {};
      const actualSpent = userSpent[b.category] || 0;
      
      return {
        ...b,
        userName: b.user?.name || 'مستخدم',
        spent: actualSpent,
        remaining: Math.max(0, b.amount - actualSpent),
      };
    });

    res.json(budgetsWithSpending);
  } catch (error: any) {
    console.error('[Budgets GET] Fatal Error:', error);
    res.status(500).json({ 
      message: 'خطأ تحميل الميزانية: ' + (error.message || 'خطأ مجهول'),
      debug: error.stack 
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
    const userId = targetUserId;
    
    if (!userId || userId === 'all' || userId === 'undefined' || userId === '') {
      res.status(400).json({ message: 'يرجى تحديد المستخدم المستهدف بوضوح' });
      return;
    }

    console.log(`[Budget POST] Assigning for User: ${userId}, Cat: ${category}, Amt: ${amount}`);

    const budget = await prisma.budget.upsert({
      where: {
        userId_category: {
          userId,
          category,
        },
      },
      update: { amount: parseFloat(amount) },
      create: {
        userId,
        category,
        amount: parseFloat(amount),
      },
    });

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
