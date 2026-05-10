import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get budgets
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.query;
    
    // Spending calculation still needs current month/year
    const now = new Date();
    const m = now.getMonth() + 1;
    const y = now.getFullYear();

    const whereBudget: any = {};
    
    if (req.user!.role === 'admin') {
      if (userId) {
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

    // Get actual spending per category for THIS month
    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59);

    const whereTransaction: any = {
      type: 'expense',
      date: { gte: startDate, lte: endDate },
    };

    if (req.user!.role === 'admin') {
      if (userId) {
        whereTransaction.userId = userId as string;
      }
    } else {
      whereTransaction.userId = req.user!.id;
    }

    const transactions = await prisma.transaction.findMany({
      where: whereTransaction,
    });
    
    const spending: Record<string, number> = {};
    transactions.forEach(t => {
      spending[t.category] = (spending[t.category] || 0) + t.amount;
    });

    const budgetsWithSpending = budgets.map(b => ({
      ...b,
      userName: b.user.name,
      spent: spending[b.category] || 0,
      remaining: b.amount - (spending[b.category] || 0),
    }));

    res.json(budgetsWithSpending);
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// Create/update budget (ADMIN ONLY)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, amount, targetUserId } = req.body;

    const userId = targetUserId || req.user!.id;

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
    console.error('Budget Error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// Delete budget (ADMIN ONLY)
router.delete('/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.budget.findUnique({
      where: { id: id as string },
    });

    if (!existing) {
      res.status(404).json({ message: 'الميزانية غير موجودة' });
      return;
    }

    await prisma.budget.delete({ where: { id: id as string } });
    res.json({ message: 'تم حذف الميزانية بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

export default router;
