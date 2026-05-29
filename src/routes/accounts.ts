import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Self-healing interest payments processor for certificate of deposits
async function processInterestPayments(userId: string) {
  try {
    const now = new Date();
    const deposits = await prisma.account.findMany({
      where: { userId, subType: 'deposit' }
    });

    for (const account of deposits) {
      if (!account.depositAmount || !account.interestRate || !account.interestDay) continue;

      let lastPaid = account.lastInterestPaid || account.createdAt;
      let checkDate = new Date(lastPaid);
      let paymentsToProcess: Date[] = [];
      
      while (true) {
        // Next payout date: interestDay of the next month
        let nextPayout = new Date(checkDate.getFullYear(), checkDate.getMonth() + 1, account.interestDay);
        if (nextPayout > now) {
          break; 
        }
        paymentsToProcess.push(nextPayout);
        checkDate = nextPayout;
      }

      if (paymentsToProcess.length > 0) {
        await prisma.$transaction(async (tx) => {
          let balanceIncrement = 0;
          for (const payoutDate of paymentsToProcess) {
            const monthlyInterest = account.depositAmount! * (account.interestRate! / 100) / 12;
            balanceIncrement += monthlyInterest;

            // Create transaction log
            await tx.transaction.create({
              data: {
                userId,
                amount: monthlyInterest,
                type: 'income',
                category: 'investment',
                description: `عوائد الوديعة لـ ${account.alias || account.name}`,
                date: payoutDate,
                accountId: account.id
              }
            });
          }

          // Update balance and last interest paid date
          await tx.account.update({
            where: { id: account.id },
            data: {
              balance: { increment: balanceIncrement },
              lastInterestPaid: paymentsToProcess[paymentsToProcess.length - 1]
            }
          });
        });
      }
    }
  } catch (err) {
    console.error('[processInterestPayments] Error:', err);
  }
}

// Get all accounts for user
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    await processInterestPayments(userId);
    const accounts = await prisma.account.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
    res.json(accounts);
  } catch (error) {
    console.error('[Accounts GET] Error:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء تحميل الحسابات' });
  }
});

// Get specific account details
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const accountId = req.params.id as string;
    const userId = req.user!.id;

    const account = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!account) {
      res.status(404).json({ message: 'الحساب غير موجود' });
      return;
    }

    if (account.userId !== userId) {
      res.status(403).json({ message: 'غير مصرح لك بعرض هذا الحساب' });
      return;
    }

    res.json(account);
  } catch (error) {
    console.error('[Account GET BY ID] Error:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء تحميل تفاصيل الحساب' });
  }
});

// Create new account
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, type, iban, accountNum, balance, alias, subType, depositAmount, interestRate, interestDay } = req.body;

    if (!name || !type) {
      res.status(400).json({ message: 'اسم الحساب ونوعه مطلوبان' });
      return;
    }

    // Check duplicate account number
    if (accountNum && accountNum.trim() !== '') {
      const duplicate = await prisma.account.findFirst({
        where: { userId, accountNum: accountNum.trim() }
      });
      if (duplicate) {
        res.status(400).json({ message: 'رقم الحساب أو الهاتف هذا مسجل بالفعل لحساب آخر' });
        return;
      }
    }

    const account = await prisma.account.create({
      data: {
        userId,
        name,
        type,
        iban: type === 'bank' ? iban : null,
        accountNum: (type === 'bank' || type === 'wallet') ? (accountNum ? accountNum.trim() : null) : null,
        balance: parseFloat(balance) || 0,
        alias: alias || null,
        subType: subType || 'current',
        depositAmount: subType === 'deposit' ? parseFloat(depositAmount) || 0 : null,
        interestRate: subType === 'deposit' ? parseFloat(interestRate) || 0 : null,
        interestDay: subType === 'deposit' ? parseInt(interestDay) || 1 : null,
      },
    });

    res.json(account);
  } catch (error) {
    console.error('[Account POST] Error:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء إنشاء الحساب' });
  }
});

// Onboard accounts (multiple accounts)
router.post('/onboard', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { accounts } = req.body; // Array of account objects

    const accountsToCreate = (accounts && accounts.length > 0) ? accounts : [
      { name: 'كاش', type: 'cash', balance: 0 }
    ];

    // Check duplicate account numbers in the batch first
    for (const acc of accountsToCreate) {
      if (acc.accountNum && acc.accountNum.trim() !== '') {
        const duplicate = await prisma.account.findFirst({
          where: { userId, accountNum: acc.accountNum.trim() }
        });
        if (duplicate) {
          res.status(400).json({ message: `رقم الحساب/الهاتف "${acc.accountNum}" مسجل بالفعل لحساب آخر` });
          return;
        }
      }
    }

    const createdAccounts = await prisma.$transaction(
      accountsToCreate.map((acc: any) => 
        prisma.account.create({
          data: {
            userId,
            name: acc.name,
            type: acc.type,
            iban: acc.type === 'bank' ? acc.iban : null,
            accountNum: (acc.type === 'bank' || acc.type === 'wallet') ? (acc.accountNum ? acc.accountNum.trim() : null) : null,
            balance: parseFloat(acc.balance) || 0,
            alias: acc.alias || null,
            subType: acc.subType || 'current',
            depositAmount: acc.subType === 'deposit' ? parseFloat(acc.depositAmount) || 0 : null,
            interestRate: acc.subType === 'deposit' ? parseFloat(acc.interestRate) || 0 : null,
            interestDay: acc.subType === 'deposit' ? parseInt(acc.interestDay) || 1 : null,
          }
        })
      )
    );

    res.json(createdAccounts);
  } catch (error) {
    console.error('[Accounts Onboard] Error:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء تهيئة الحسابات' });
  }
});

// Update account
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, iban, accountNum, balance, alias, subType, depositAmount, interestRate, interestDay } = req.body;
    const accountId = req.params.id as string;
    const userId = req.user!.id;

    // Check ownership
    const existing = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!existing) {
      res.status(404).json({ message: 'الحساب غير موجود' });
      return;
    }

    if (existing.userId !== userId) {
      res.status(403).json({ message: 'غير مصرح لك بتعديل هذا الحساب' });
      return;
    }

    // Check duplicate account number if changed
    if (accountNum && accountNum.trim() !== '' && accountNum.trim() !== existing.accountNum) {
      const duplicate = await prisma.account.findFirst({
        where: { userId, accountNum: accountNum.trim(), id: { not: accountId } }
      });
      if (duplicate) {
        res.status(400).json({ message: 'رقم الحساب أو الهاتف هذا مسجل بالفعل لحساب آخر' });
        return;
      }
    }

    const updated = await prisma.account.update({
      where: { id: accountId },
      data: {
        name: name !== undefined ? name : undefined,
        iban: existing.type === 'bank' && iban !== undefined ? iban : undefined,
        accountNum: (existing.type === 'bank' || existing.type === 'wallet') && accountNum !== undefined ? (accountNum ? accountNum.trim() : null) : undefined,
        balance: balance !== undefined ? parseFloat(balance) : undefined,
        alias: alias !== undefined ? alias : undefined,
        subType: subType !== undefined ? subType : undefined,
        depositAmount: subType === 'deposit' && depositAmount !== undefined ? parseFloat(depositAmount) : undefined,
        interestRate: subType === 'deposit' && interestRate !== undefined ? parseFloat(interestRate) : undefined,
        interestDay: subType === 'deposit' && interestDay !== undefined ? parseInt(interestDay) : undefined,
      },
    });

    res.json(updated);
  } catch (error) {
    console.error('[Account PUT] Error:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء تعديل الحساب' });
  }
});

// Delete account
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const accountId = req.params.id as string;
    const userId = req.user!.id;

    // Check ownership
    const existing = await prisma.account.findUnique({
      where: { id: accountId },
    });

    if (!existing) {
      res.status(404).json({ message: 'الحساب غير موجود' });
      return;
    }

    if (existing.userId !== userId) {
      res.status(403).json({ message: 'غير مصرح لك بحذف هذا الحساب' });
      return;
    }

    await prisma.account.delete({
      where: { id: accountId },
    });

    res.json({ message: 'تم حذف الحساب بنجاح' });
  } catch (error) {
    console.error('[Account DELETE] Error:', error);
    res.status(500).json({ message: 'حدث خطأ أثناء حذف الحساب' });
  }
});

export default router;
