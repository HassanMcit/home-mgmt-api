import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all transactions for user (with filters)
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { type, category, month, year, limit } = req.query;

    const where: any = {};
    if (req.user!.role !== 'admin') {
      where.userId = req.user!.id;
    }

    if (type) where.type = type as string;
    if (category) where.category = category as string;

    if (month && year) {
      const startDate = new Date(Number(year), Number(month) - 1, 1);
      const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);
      where.date = { gte: startDate, lte: endDate };
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit ? parseInt(limit as string) : undefined,
    });

    res.json(transactions);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// Get transaction stats
router.get('/stats', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { month, year, userId } = req.query;
    const now = new Date();
    const m = Number(month) || now.getMonth() + 1;
    const y = Number(year) || now.getFullYear();

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59);

    // Filter for cumulative balance (all time)
    const cumulativeWhere: any = {};
    if (req.user!.role === 'admin' && userId) {
      cumulativeWhere.userId = userId as string;
    } else if (req.user!.role !== 'admin') {
      cumulativeWhere.userId = req.user!.id;
    } else if (req.user!.role === 'admin' && !userId) {
       // If admin but no userId, usually we show admin's own or global? 
       // Let's stick to current user (admin) by default
       cumulativeWhere.userId = req.user!.id;
    }

    // Filter for monthly stats
    const monthlyWhere: any = {
      ...cumulativeWhere,
      date: { gte: startDate, lte: endDate },
    };

    // Get all transactions for balance
    const allTransactions = await prisma.transaction.findMany({
      where: cumulativeWhere,
      select: { amount: true, type: true }
    });

    // Get monthly transactions for breakdown
    const monthlyTransactions = await prisma.transaction.findMany({
      where: monthlyWhere,
    });

    // Monthly calculations
    const totalIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    // Cumulative calculations (The "Wallet")
    const allTimeIncome = allTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);
    
    const allTimeExpenses = allTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const cumulativeBalance = allTimeIncome - allTimeExpenses;

    // Category breakdown (Monthly)
    const categoryBreakdown: Record<string, number> = {};
    monthlyTransactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
      });

    // Daily chart data (Monthly)
    const dailyData: Record<string, { income: number; expenses: number }> = {};
    monthlyTransactions.forEach(t => {
      const day = new Date(t.date).getDate().toString();
      if (!dailyData[day]) dailyData[day] = { income: 0, expenses: 0 };
      if (t.type === 'income') dailyData[day].income += t.amount;
      else dailyData[day].expenses += t.amount;
    });

    res.json({
      totalIncome,
      totalExpenses,
      balance: cumulativeBalance, // Returning cumulative balance as the main "balance"
      monthlyBalance: totalIncome - totalExpenses,
      categoryBreakdown,
      dailyData,
      transactionCount: monthlyTransactions.length,
    });
  } catch (error) {
    console.error('Stats Error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// Create transaction
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, type, category, description, date, targetUserId } = req.body;

    if (!amount || !type || !category) {
      res.status(400).json({ message: 'المبلغ والنوع والفئة مطلوبة' });
      return;
    }

    // Admin can specify a target user, members can only create for themselves
    let userId = req.user!.id;
    if (req.user!.role === 'admin' && targetUserId) {
      userId = targetUserId;
    }

    const transaction = await prisma.transaction.create({
      data: {
        userId,
        amount: parseFloat(amount),
        type,
        category,
        description,
        date: date ? new Date(date) : new Date(),
      },
    });

    res.status(201).json(transaction);
  } catch (error) {
    console.error('Create Transaction Error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// Update transaction
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { amount, type, category, description, date } = req.body;

    const existing = await prisma.transaction.findFirst({
      where: { id: id as string, userId: req.user!.id },
    });

    if (!existing) {
      res.status(404).json({ message: 'المعاملة غير موجودة' });
      return;
    }

    const transaction = await prisma.transaction.update({
      where: { id: id as string },
      data: {
        amount: amount ? parseFloat(amount) : existing.amount,
        type: type || existing.type,
        category: category || existing.category,
        description: description !== undefined ? description : existing.description,
        date: date ? new Date(date) : existing.date,
      },
    });

    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// Delete transaction
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.transaction.findFirst({
      where: { id: id as string, userId: req.user!.id },
    });

    if (!existing) {
      res.status(404).json({ message: 'المعاملة غير موجودة' });
      return;
    }

    await prisma.transaction.delete({ where: { id: id as string } });
    res.json({ message: 'تم حذف المعاملة بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

export default router;
