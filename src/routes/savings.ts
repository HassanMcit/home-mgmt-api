import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest, isAdmin } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all savings
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const where: any = {};
    if (!isAdmin(req.user!.role)) {
      where.userId = req.user!.id;
    }

    const savings = await prisma.saving.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    res.json(savings);
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// Create saving goal
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, targetAmount, currentAmount, deadline, color } = req.body;

    if (!name || !targetAmount) {
      res.status(400).json({ message: 'الاسم والمبلغ المستهدف مطلوبان' });
      return;
    }

    const saving = await prisma.saving.create({
      data: {
        userId: req.user!.id,
        name,
        targetAmount: parseFloat(targetAmount),
        currentAmount: currentAmount ? parseFloat(currentAmount) : 0,
        deadline: deadline ? new Date(deadline) : null,
        color: color || '#10b981',
      },
    });

    res.status(201).json(saving);
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// Update saving
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, targetAmount, currentAmount, deadline, color } = req.body;

    const existing = await prisma.saving.findUnique({
      where: { id: id as string },
    });

    if (!existing) {
      res.status(404).json({ message: 'هدف الادخار غير موجود' });
      return;
    }

    if (!isAdmin(req.user!.role) && existing.userId !== req.user!.id) {
      res.status(403).json({ message: 'غير مصرح لك بتعديل هذا الهدف' });
      return;
    }

    const saving = await prisma.saving.update({
      where: { id: id as string },
      data: {
        name: name || existing.name,
        targetAmount: targetAmount ? parseFloat(targetAmount) : existing.targetAmount,
        currentAmount: currentAmount !== undefined ? parseFloat(currentAmount) : existing.currentAmount,
        deadline: deadline ? new Date(deadline) : existing.deadline,
        color: color || existing.color,
      },
    });

    res.json(saving);
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// Add amount to saving
router.post('/:id/deposit', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { amount } = req.body;

    const existing = await prisma.saving.findUnique({
      where: { id: id as string },
    });

    if (!existing) {
      res.status(404).json({ message: 'هدف الادخار غير موجود' });
      return;
    }

    if (!isAdmin(req.user!.role) && existing.userId !== req.user!.id) {
      res.status(403).json({ message: 'غير مصرح لك بالإيداع في هذا الهدف' });
      return;
    }

    const saving = await prisma.saving.update({
      where: { id: id as string },
      data: {
        currentAmount: existing.currentAmount + parseFloat(amount),
      },
    });

    res.json(saving);
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// Delete saving
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.saving.findUnique({
      where: { id: id as string },
    });

    if (!existing) {
      res.status(404).json({ message: 'هدف الادخار غير موجود' });
      return;
    }

    if (!isAdmin(req.user!.role) && existing.userId !== req.user!.id) {
      res.status(403).json({ message: 'غير مصرح لك بحذف هذا الهدف' });
      return;
    }

    await prisma.saving.delete({ where: { id: id as string } });
    res.json({ message: 'تم حذف هدف الادخار بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

export default router;
