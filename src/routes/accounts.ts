import express, { Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = express.Router();
const prisma = new PrismaClient();

// Get all accounts for user
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
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

// Create new account
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user!.id;
    const { name, type, iban, accountNum, balance } = req.body;

    if (!name || !type) {
      res.status(400).json({ message: 'اسم الحساب ونوعه مطلوبان' });
      return;
    }

    const account = await prisma.account.create({
      data: {
        userId,
        name,
        type,
        iban: type === 'bank' ? iban : null,
        accountNum: (type === 'bank' || type === 'wallet') ? accountNum : null,
        balance: parseFloat(balance) || 0,
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

    // If empty, create a default "كاش" account
    const accountsToCreate = (accounts && accounts.length > 0) ? accounts : [
      { name: 'كاش', type: 'cash', balance: 0 }
    ];

    const createdAccounts = await prisma.$transaction(
      accountsToCreate.map((acc: any) => 
        prisma.account.create({
          data: {
            userId,
            name: acc.name,
            type: acc.type,
            iban: acc.type === 'bank' ? acc.iban : null,
            accountNum: (acc.type === 'bank' || acc.type === 'wallet') ? acc.accountNum : null,
            balance: parseFloat(acc.balance) || 0,
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
    const { name, iban, accountNum, balance } = req.body;
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

    const updated = await prisma.account.update({
      where: { id: accountId },
      data: {
        name: name !== undefined ? name : undefined,
        iban: existing.type === 'bank' && iban !== undefined ? iban : undefined,
        accountNum: (existing.type === 'bank' || existing.type === 'wallet') && accountNum !== undefined ? accountNum : undefined,
        balance: balance !== undefined ? parseFloat(balance) : undefined,
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
