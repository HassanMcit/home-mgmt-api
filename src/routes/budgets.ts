import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, requireAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get budgets
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.query;
    
    const now = new Date();
    const m = now.getMonth() + 1;
    const y = now.getFullYear();

    const whereBudget: any = {};
    
    // Admin can filter by user, or see all if no userId/ 'all'
    if (req.user!.role === 'admin') {
      if (userId && userId !== 'all' && userId !== 'undefined') {
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
      if (userId && userId !== 'all' && userId !== 'undefined') {
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
    console.error('Fetch Budgets Error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// Create/update budget (ADMIN ONLY)
router.post('/', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { category, amount, targetUserId } = req.body;

    // Admin sets budget for a user. Priority: targetUserId > current user
    let userId = req.user!.id;
    if (req.user!.role === 'admin' && targetUserId && targetUserId !== 'all' && targetUserId !== 'undefined') {
      userId = targetUserId;
    }

    console.log(`[Budget] Creating/Updating for User: ${userId}, Category: ${category}, Amount: ${amount}`);

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
    console.error('Budget Creation Error:', error);
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
