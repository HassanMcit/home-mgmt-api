import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get transactions
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, limit } = req.query;
    const where: any = {};

    if (req.user!.role === 'admin') {
      if (userId && userId !== 'all' && userId !== 'undefined' && userId !== '') {
        where.userId = userId as string;
      }
    } else {
      where.userId = req.user!.id;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
      take: limit ? parseInt(limit as string) : undefined,
    });

    res.json(transactions);
  } catch (error) {
    console.error('[Transactions GET] Error:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء تحميل المعاملات' });
  }
});

// Get statistics
router.get('/stats', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

    // 1. Total Balance (All time)
    const allTransactions = await prisma.transaction.findMany({
      where: { userId },
    });

    let balance = 0;
    allTransactions.forEach(t => {
      if (t.type === 'income') balance += t.amount;
      else balance -= t.amount;
    });

    // 2. Monthly Stats
    const monthlyTransactions = await prisma.transaction.findMany({
      where: {
        userId,
        date: { gte: startOfMonth, lte: endOfMonth },
      },
    });

    let totalIncome = 0;
    let totalExpenses = 0;
    const categoryBreakdown: Record<string, number> = {};

    monthlyTransactions.forEach(t => {
      if (t.type === 'income') {
        totalIncome += t.amount;
      } else {
        totalExpenses += t.amount;
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
      }
    });

    res.json({
      balance,
      totalIncome,
      totalExpenses,
      categoryBreakdown,
    });
  } catch (error) {
    console.error('[Transactions Stats] Error:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء تحميل الإحصائيات' });
  }
});

// Create transaction
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, type, category, description, date, targetUserId } = req.body;

    if (!amount || !type || !category) {
      res.status(400).json({ message: 'المبلغ والنوع والفئة مطلوبان' });
      return;
    }

    // Determine target user
    let userId = req.user!.id;
    if (req.user!.role === 'admin') {
      if (targetUserId && targetUserId !== 'all' && targetUserId !== 'undefined' && targetUserId !== '') {
        userId = targetUserId;
      }
    }

    console.log(`[Transaction POST] Creating for User: ${userId}, Type: ${type}, Amt: ${amount}`);

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

    res.json(transaction);
  } catch (error) {
    console.error('[Transaction POST] Fatal Error:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء حفظ المعاملة' });
  }
});

// Delete transaction
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: req.params.id },
    });

    if (!transaction) {
      res.status(404).json({ message: 'المعاملة غير موجودة' });
      return;
    }

    if (req.user!.role !== 'admin' && transaction.userId !== req.user!.id) {
      res.status(403).json({ message: 'غير مصرح لك بحذف هذه المعاملة' });
      return;
    }

    await prisma.transaction.delete({
      where: { id: req.params.id },
    });

    res.json({ message: 'تم حذف المعاملة بنجاح' });
  } catch (error) {
    console.error('[Transaction DELETE] Error:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء حذف المعاملة' });
  }
});

export default router;
