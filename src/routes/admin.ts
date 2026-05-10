import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Get all registration requests
router.get('/requests', authenticate, requireAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const requests = await prisma.registrationRequest.findMany({
      orderBy: { createdAt: 'desc' },
    });
    res.json(requests);
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// Approve registration request
router.post('/requests/:id/approve', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const request = await prisma.registrationRequest.findUnique({ where: { id: id as string } });
    if (!request) {
      res.status(404).json({ message: 'الطلب غير موجود' });
      return;
    }

    if (request.status !== 'pending') {
      res.status(400).json({ message: 'تم معالجة هذا الطلب مسبقاً' });
      return;
    }

    // Create user
    await prisma.user.create({
      data: {
        name: request.name,
        email: request.email,
        password: request.password, // already hashed
        role: 'member',
      },
    });

    // Update request status
    await prisma.registrationRequest.update({
      where: { id: id as string },
      data: { status: 'approved' },
    });

    res.json({ message: `تم قبول طلب تسجيل ${request.name} بنجاح` });
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// Reject registration request
router.post('/requests/:id/reject', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const request = await prisma.registrationRequest.findUnique({ where: { id: id as string } });
    if (!request) {
      res.status(404).json({ message: 'الطلب غير موجود' });
      return;
    }

    await prisma.registrationRequest.update({
      where: { id: id as string },
      data: { status: 'rejected' },
    });

    res.json({ message: 'تم رفض الطلب' });
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// Get all users
router.get('/users', authenticate, requireAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const users = await prisma.user.findMany({
      select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true },
      orderBy: { createdAt: 'asc' },
    });
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// Create user directly (admin only)
router.post('/users', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'الاسم والبريد الإلكتروني وكلمة المرور مطلوبة' });
      return;
    }

    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      res.status(400).json({ message: 'البريد الإلكتروني مستخدم بالفعل' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'member',
      },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    res.status(201).json(user);
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// Update user
router.put('/users/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, role } = req.body;

    const user = await prisma.user.update({
      where: { id: id as string },
      data: { name, role },
      select: { id: true, name: true, email: true, role: true, createdAt: true },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// Delete user
router.delete('/users/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Prevent deleting yourself
    if (id === req.user!.id) {
      res.status(400).json({ message: 'لا يمكنك حذف حسابك الخاص' });
      return;
    }

    await prisma.user.delete({ where: { id: id as string } });
    res.json({ message: 'تم حذف المستخدم بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// Get dashboard stats (admin)
router.get('/stats', authenticate, requireAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const totalUsers = await prisma.user.count();
    const pendingRequests = await prisma.registrationRequest.count({ where: { status: 'pending' } });

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const monthlyTransactions = await prisma.transaction.findMany({
      where: { date: { gte: startOfMonth } },
    });

    const totalIncome = monthlyTransactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    res.json({ totalUsers, pendingRequests, totalIncome, totalExpenses });
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// Get active password reset codes
router.get('/reset-codes', authenticate, requireAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const usersWithReset = await prisma.user.findMany({
      where: { avatar: { startsWith: 'RESET:' } },
      select: { id: true, name: true, email: true, avatar: true },
    });

    const activeResets = usersWithReset.map(user => {
      const parts = user.avatar!.split(':');
      const code = parts[1];
      const expiry = parseInt(parts[2]);
      
      // Only return if not expired
      if (Date.now() < expiry) {
        return {
          id: user.id,
          name: user.name,
          email: user.email,
          code,
          expiresAt: new Date(expiry),
        };
      }
      return null;
    }).filter(Boolean);

    res.json(activeResets);
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

export default router;
