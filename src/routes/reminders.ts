import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// GET all reminders for the current user
router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { isCompleted } = req.query;

    const where: any = { userId: req.user!.id };
    if (isCompleted !== undefined) {
      where.isCompleted = isCompleted === 'true';
    }

    const reminders = await prisma.reminder.findMany({
      where,
      orderBy: [
        { isCompleted: 'asc' },
        { reminderAt: 'asc' },
        { createdAt: 'desc' },
      ],
    });

    res.json(reminders);
  } catch (error) {
    console.error('[Reminders] GET error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// GET single reminder
router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const reminder = await prisma.reminder.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!reminder) {
      res.status(404).json({ message: 'التذكير غير موجود' });
      return;
    }

    res.json(reminder);
  } catch (error) {
    console.error('[Reminders] GET/:id error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// CREATE reminder
router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { title, description, reminderAt, priority } = req.body;

    if (!title || title.trim() === '') {
      res.status(400).json({ message: 'عنوان التذكير مطلوب' });
      return;
    }

    const reminder = await prisma.reminder.create({
      data: {
        userId: req.user!.id,
        title: title.trim(),
        description: description?.trim() || null,
        reminderAt: reminderAt ? new Date(reminderAt) : null,
        priority: priority || 'medium',
        emailSent: false,
        isCompleted: false,
      },
    });

    res.status(201).json(reminder);
  } catch (error) {
    console.error('[Reminders] POST error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// UPDATE reminder
router.put('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { title, description, reminderAt, priority, isCompleted } = req.body;

    const existing = await prisma.reminder.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existing) {
      res.status(404).json({ message: 'التذكير غير موجود' });
      return;
    }

    // If reminder time is changed, reset emailSent so it can fire again
    const reminderAtChanged =
      reminderAt !== undefined &&
      (existing.reminderAt?.toISOString() !== new Date(reminderAt).toISOString());

    const reminder = await prisma.reminder.update({
      where: { id },
      data: {
        title: title !== undefined ? title.trim() : existing.title,
        description: description !== undefined ? (description?.trim() || null) : existing.description,
        reminderAt: reminderAt !== undefined ? (reminderAt ? new Date(reminderAt) : null) : existing.reminderAt,
        priority: priority !== undefined ? priority : existing.priority,
        isCompleted: isCompleted !== undefined ? isCompleted : existing.isCompleted,
        emailSent: reminderAtChanged ? false : existing.emailSent,
      },
    });

    res.json(reminder);
  } catch (error) {
    console.error('[Reminders] PUT error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// TOGGLE complete/incomplete
router.put('/:id/toggle', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.reminder.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existing) {
      res.status(404).json({ message: 'التذكير غير موجود' });
      return;
    }

    const reminder = await prisma.reminder.update({
      where: { id },
      data: { isCompleted: !existing.isCompleted },
    });

    res.json(reminder);
  } catch (error) {
    console.error('[Reminders] TOGGLE error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// DELETE reminder
router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const existing = await prisma.reminder.findFirst({
      where: { id, userId: req.user!.id },
    });

    if (!existing) {
      res.status(404).json({ message: 'التذكير غير موجود' });
      return;
    }

    await prisma.reminder.delete({ where: { id } });
    res.json({ message: 'تم حذف التذكير بنجاح' });
  } catch (error) {
    console.error('[Reminders] DELETE error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

export default router;
