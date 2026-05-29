import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, isAdmin } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get transactions
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { userId, limit } = req.query;
    const where: any = {};

    if (isAdmin(req.user!.role)) {
      if (userId && userId !== 'all' && userId !== 'undefined' && userId !== '') {
        where.userId = userId as string;
      }
    } else {
      where.userId = req.user!.id;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        account: {
          select: { id: true, name: true, type: true }
        }
      },
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
    const { userId: queryUserId, month, year } = req.query;
    
    // Determine which user's stats to fetch
    let userId = req.user!.id;
    if (isAdmin(req.user!.role) && queryUserId && queryUserId !== 'all' && queryUserId !== 'undefined' && queryUserId !== '') {
      userId = queryUserId as string;
    }

    const now = new Date();
    const m = month ? parseInt(month as string) : now.getMonth() + 1;
    const y = year ? parseInt(year as string) : now.getFullYear();

    const startOfMonth = new Date(y, m - 1, 1);
    const endOfMonth = new Date(y, m, 0, 23, 59, 59);

    // 1. Total Balance (All time) - sum of all accounts' balances
    const accounts = await prisma.account.findMany({
      where: { userId }
    });
    
    let balance = 0;
    if (accounts.length > 0) {
      balance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
    } else {
      // Fallback for backward compatibility if no accounts exist yet
      const allTransactions = await prisma.transaction.findMany({
        where: { userId },
      });
      allTransactions.forEach(t => {
        if (t.type === 'income') balance += t.amount;
        else balance -= t.amount;
      });
    }

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
    const { amount, type, category, description, date, targetUserId, accountId } = req.body;

    if (!amount || !type || !category) {
      res.status(400).json({ message: 'المبلغ والنوع والفئة مطلوبان' });
      return;
    }

    // Determine target user
    let userId = req.user!.id;
    if (isAdmin(req.user!.role) && targetUserId && targetUserId !== 'undefined' && targetUserId !== '') {
      userId = targetUserId;
    }

    const parsedAmount = parseFloat(amount);

    const transaction = await prisma.$transaction(async (tx) => {
      // If accountId provided, verify and update its balance
      if (accountId) {
        const account = await tx.account.findUnique({
          where: { id: accountId }
        });
        if (!account || account.userId !== userId) {
          throw new Error('الحساب المالي غير موجود أو غير تابع للمستخدم');
        }
        
        // Update balance
        const balanceChange = type === 'income' ? parsedAmount : -parsedAmount;
        await tx.account.update({
          where: { id: accountId },
          data: { balance: { increment: balanceChange } }
        });
      }

      // Create the transaction
      return await tx.transaction.create({
        data: {
          userId,
          amount: parsedAmount,
          type,
          category,
          description,
          date: date ? new Date(date) : new Date(),
          createdById: req.user!.id,
          accountId: accountId || null,
        },
        include: {
          account: {
            select: { id: true, name: true, type: true }
          }
        }
      });
    });

    res.json(transaction);
  } catch (error: any) {
    console.error('[Transaction POST] Fatal Error:', error);
    res.status(500).json({ message: error.message || 'حدث خطأ أثناء حفظ المعاملة' });
  }
});

// Delete transaction
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const transaction = await prisma.transaction.findUnique({
      where: { id: req.params.id as string },
    });

    if (!transaction) {
      res.status(404).json({ message: 'المعاملة غير موجودة' });
      return;
    }

    if (!isAdmin(req.user!.role) && transaction.userId !== req.user!.id) {
      res.status(403).json({ message: 'غير مصرح لك بحذف هذه المعاملة' });
      return;
    }

    await prisma.$transaction(async (tx) => {
      // Revert balance change from account
      if (transaction.accountId) {
        const balanceChange = transaction.type === 'income' ? -transaction.amount : transaction.amount;
        await tx.account.update({
          where: { id: transaction.accountId },
          data: { balance: { increment: balanceChange } }
        });
      }

      await tx.transaction.delete({
        where: { id: req.params.id as string },
      });
    });

    res.json({ message: 'تم حذف المعاملة بنجاح' });
  } catch (error: any) {
    console.error('[Transaction DELETE] Error:', error);
    res.status(500).json({ message: error.message || 'حدث خطأ أثناء حذف المعاملة' });
  }
});

// Update transaction
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { amount, type, category, description, date, targetUserId, accountId } = req.body;

    const transaction = await prisma.transaction.findUnique({
      where: { id: req.params.id as string },
    });

    if (!transaction) {
      res.status(404).json({ message: 'المعاملة غير موجودة' });
      return;
    }

    if (!isAdmin(req.user!.role) && transaction.userId !== req.user!.id) {
      res.status(403).json({ message: 'غير مصرح لك بتعديل هذه المعاملة' });
      return;
    }

    // Determine target user
    let userId = transaction.userId;
    if (isAdmin(req.user!.role) && targetUserId && targetUserId !== 'undefined' && targetUserId !== '') {
      userId = targetUserId;
    }

    const updatedTransaction = await prisma.$transaction(async (tx) => {
      // 1. Revert old transaction effect
      if (transaction.accountId) {
        const revertChange = transaction.type === 'income' ? -transaction.amount : transaction.amount;
        await tx.account.update({
          where: { id: transaction.accountId },
          data: { balance: { increment: revertChange } }
        });
      }

      const targetAccountId = req.body.hasOwnProperty('accountId') ? accountId : transaction.accountId;
      const targetAmount = req.body.hasOwnProperty('amount') ? parseFloat(amount) : transaction.amount;
      const targetType = req.body.hasOwnProperty('type') ? type : transaction.type;

      // 2. Apply new transaction effect
      if (targetAccountId) {
        // Verify account belongs to user
        const account = await tx.account.findUnique({ where: { id: targetAccountId } });
        if (!account || account.userId !== userId) {
          throw new Error('الحساب المالي المستهدف غير موجود أو غير تابع للمستخدم');
        }

        const applyChange = targetType === 'income' ? targetAmount : -targetAmount;
        await tx.account.update({
          where: { id: targetAccountId },
          data: { balance: { increment: applyChange } }
        });
      }

      // 3. Update the transaction
      return await tx.transaction.update({
        where: { id: req.params.id as string },
        data: {
          userId,
          amount: amount !== undefined ? parseFloat(amount) : undefined,
          type,
          category,
          description,
          date: date ? new Date(date) : undefined,
          accountId: targetAccountId || null,
        },
        include: {
          account: {
            select: { id: true, name: true, type: true }
          }
        }
      });
    });

    res.json(updatedTransaction);
  } catch (error: any) {
    console.error('[Transaction PUT] Error:', error);
    res.status(500).json({ message: error.message || 'حدث خطأ أثناء تعديل المعاملة' });
  }
});

// Transfer funds between accounts
router.post('/transfer', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { fromAccountId, toAccountId, amount, description, date } = req.body;

    if (!fromAccountId || !toAccountId || !amount) {
      res.status(400).json({ message: 'حساب المرسل وحساب المستقبل والمبلغ مطلوبين' });
      return;
    }

    if (fromAccountId === toAccountId) {
      res.status(400).json({ message: 'لا يمكن التحويل لنفس الحساب المالي' });
      return;
    }

    const userId = req.user!.id;
    const parsedAmount = parseFloat(amount);

    if (parsedAmount <= 0) {
      res.status(400).json({ message: 'المبلغ يجب أن يكون أكبر من الصفر' });
      return;
    }

    const result = await prisma.$transaction(async (tx) => {
      // 1. Get both accounts and verify ownership
      const fromAccount = await tx.account.findUnique({ where: { id: fromAccountId } });
      const toAccount = await tx.account.findUnique({ where: { id: toAccountId } });

      if (!fromAccount || fromAccount.userId !== userId || !toAccount || toAccount.userId !== userId) {
        throw new Error('أحد الحسابات المالية غير موجود أو غير تابع للمستخدم');
      }

      if (fromAccount.balance < parsedAmount) {
        throw new Error('الرصيد في حساب المرسل غير كافٍ لإتمام عملية التحويل');
      }

      // 2. Update balances
      await tx.account.update({
        where: { id: fromAccountId },
        data: { balance: { decrement: parsedAmount } }
      });

      await tx.account.update({
        where: { id: toAccountId },
        data: { balance: { increment: parsedAmount } }
      });

      // Fetch account display names for the description
      const fromName = fromAccount.alias || fromAccount.name;
      const toName = toAccount.alias || toAccount.name;

      const desc = description || 'تحويل مالي';
      const fromDesc = `${desc} (تحويل إلى ${toName})`;
      const toDesc = `${desc} (تحويل من ${fromName})`;

      // 3. Create two transactions
      const fromTx = await tx.transaction.create({
        data: {
          userId,
          amount: parsedAmount,
          type: 'expense',
          category: 'transfer',
          description: fromDesc,
          date: date ? new Date(date) : new Date(),
          createdById: userId,
          accountId: fromAccountId
        }
      });

      const toTx = await tx.transaction.create({
        data: {
          userId,
          amount: parsedAmount,
          type: 'income',
          category: 'transfer',
          description: toDesc,
          date: date ? new Date(date) : new Date(),
          createdById: userId,
          accountId: toAccountId
        }
      });

      return { fromTx, toTx };
    });

    res.json(result);
  } catch (error: any) {
    console.error('[Transactions Transfer] Error:', error);
    res.status(500).json({ message: error.message || 'حدث خطأ أثناء إجراء عملية التحويل' });
  }
});

export default router;
