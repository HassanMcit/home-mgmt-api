import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get transactions
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId } = req.query;
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
    });

    res.json(transactions);
  } catch (error) {
    console.error('[Transactions GET] Error:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء تحميل المعاملات' });
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
      } else {
        // For admin, we force explicit userId if they want to add for someone else
        // If they don't provide it, it defaults to them (Admin's own wallet)
        userId = req.user!.id;
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

    // Admins can delete anything, users only their own
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
