import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, isAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all bills
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { isPaid, userId } = req.query;

    const where: any = {};
    if (req.user!.role !== 'admin' && req.user!.role !== 'super_admin') {
      where.userId = req.user!.id;
    } else if (userId && userId !== 'all') {
      // Admin can filter by specific user
      where.userId = userId as string;
    }

    // Lazy reset recurring bills that were paid in previous months
    const now = new Date();
    const startOfCurrentMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const billsToReset = await prisma.bill.findMany({
      where: {
        ...where,
        isRecurring: true,
        isPaid: true,
        dueDate: {
          lt: startOfCurrentMonth
        }
      }
    });

    for (const bill of billsToReset) {
      const nextDueDate = new Date(bill.dueDate);
      nextDueDate.setMonth(now.getMonth());
      nextDueDate.setFullYear(now.getFullYear());
      
      await prisma.bill.update({
        where: { id: bill.id },
        data: {
          isPaid: false,
          dueDate: nextDueDate
        }
      });
    }

    if (isPaid !== undefined) where.isPaid = isPaid === 'true';

    const bills = await prisma.bill.findMany({
      where,
      orderBy: { dueDate: 'asc' },
    });

    res.json(bills);
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// Create bill
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, amount, dueDate, isRecurring, category } = req.body;

    if (!name || !amount || !dueDate) {
      res.status(400).json({ message: 'الاسم والمبلغ وتاريخ الاستحقاق مطلوبة' });
      return;
    }

    const bill = await prisma.bill.create({
      data: {
        userId: req.user!.id,
        name,
        amount: parseFloat(amount),
        dueDate: new Date(dueDate),
        isRecurring: isRecurring || false,
        category: category || 'other',
      },
    });

    res.status(201).json(bill);
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// Mark bill as paid/unpaid
router.put('/:id/toggle', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { accountId } = req.body;

    const where: any = { id: id as string };
    if (!isAdmin(req.user!.role)) {
      where.userId = req.user!.id;
    }

    const existing = await prisma.bill.findFirst({ where });

    if (!existing) {
      res.status(404).json({ message: 'الفاتورة غير موجودة' });
      return;
    }

    const newStatus = !existing.isPaid;

    // Use a transaction to ensure all operations succeed or fail together
    const result = await prisma.$transaction(async (tx) => {
      // 1. Update the current bill status
      const updatedBill = await tx.bill.update({
        where: { id: id as string },
        data: { isPaid: newStatus },
      });

      // 2. If bill is being marked as PAID
      if (newStatus === true) {
        // Determine valid accountId
        let validAccountId: string | null = null;
        if (accountId && accountId !== 'none') {
          const account = await tx.account.findFirst({
            where: {
              id: accountId,
              userId: existing.userId
            }
          });
          if (account) {
            validAccountId = accountId;
            // Deduct balance
            await tx.account.update({
              where: { id: accountId },
              data: { balance: { decrement: existing.amount } }
            });
          }
        }

        // Create an expense transaction
        await tx.transaction.create({
          data: {
            userId: existing.userId,
            amount: existing.amount,
            type: 'expense',
            category: existing.category,
            description: `دفع فاتورة: ${existing.name}`,
            date: new Date(), // Recorded today
            createdById: req.user!.id,
            accountId: validAccountId
          }
        });
      }

      return updatedBill;
    });

    res.json(result);
  } catch (error) {
    console.error('Bill toggle error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// Update bill
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, amount, dueDate, isRecurring, category } = req.body;

    const where: any = { id: id as string };
    if (!isAdmin(req.user!.role)) {
      where.userId = req.user!.id;
    }

    const existing = await prisma.bill.findFirst({ where });

    if (!existing) {
      res.status(404).json({ message: 'الفاتورة غير موجودة' });
      return;
    }

    const bill = await prisma.bill.update({
      where: { id: id as string },
      data: {
        name: name || existing.name,
        amount: amount ? parseFloat(amount) : existing.amount,
        dueDate: dueDate ? new Date(dueDate) : existing.dueDate,
        isRecurring: isRecurring !== undefined ? isRecurring : existing.isRecurring,
        category: category || existing.category,
      },
    });

    res.json(bill);
  } catch (error) {
    console.error('Bill update error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// Delete bill
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const where: any = { id: id as string };
    if (!isAdmin(req.user!.role)) {
      where.userId = req.user!.id;
    }

    const existing = await prisma.bill.findFirst({ where });

    if (!existing) {
      res.status(404).json({ message: 'الفاتورة غير موجودة' });
      return;
    }

    await prisma.bill.delete({ where: { id: id as string } });
    res.json({ message: 'تم حذف الفاتورة بنجاح' });
  } catch (error) {
    console.error('Bill delete error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

export default router;
