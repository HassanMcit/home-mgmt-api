import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get budgets
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { month, year, userId } = req.query;
    const now = new Date();
    const m = Number(month) || now.getMonth() + 1;
    const y = Number(year) || now.getFullYear();

    const whereBudget: any = { month: m, year: y };
    
    // If admin and userId is provided in query, get budgets for that user
    // Otherwise if admin, get all for that month/year (default behavior)
    // If not admin, strictly only their own budgets
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

    // Get actual spending per category for this month
    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59);

    const whereTransaction: any = {
      type: 'expense',
      date: { gte: startDate, lte: endDate },
    };

    // Spending filter logic similar to budget filter
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

    // If userId is NOT provided and user is Admin, this logic might need aggregation per user,
    // but usually members view their own dashboard, and admins view specific user dashboards.
    // Let's stick to user-specific aggregation for now.
    
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
    const { category, amount, month, year, targetUserId } = req.body;
    const now = new Date();

    // Admin sets budget for a user (or themselves if targetUserId is null)
    const userId = targetUserId || req.user!.id;

    const budget = await prisma.budget.upsert({
      where: {
        userId_category_month_year: {
          userId,
          category,
          month: month || now.getMonth() + 1,
          year: year || now.getFullYear(),
        },
      },
      update: { amount: parseFloat(amount) },
      create: {
        userId,
        category,
        amount: parseFloat(amount),
        month: month || now.getMonth() + 1,
        year: year || now.getFullYear(),
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
