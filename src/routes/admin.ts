import { Router, Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import { authenticate, requireAdmin, AuthRequest } from '../middleware/auth';
import { generateAndSendMonthlyReports } from '../services/reportService';
import { sendEmail } from '../utils/mailer';
import { getWelcomeEmailHtml } from '../utils/welcomeTemplate';

const router = Router();
const prisma = new PrismaClient();

// TEST ROUTE: Trigger monthly report manually
router.post('/test-report', authenticate, async (req: AuthRequest, res: Response) => {
  if (req.user!.role !== 'admin' && req.user!.role !== 'super_admin') {
    return res.status(403).json({ message: 'غير مصرح لك' });
  }
  await generateAndSendMonthlyReports();
  res.json({ message: 'تم إرسال التقارير التجريبية بنجاح! تفقد بريدك.' });
});

// Get all registration requests (including past ones)
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

    // 1. Create user and update request status in a transaction
    await prisma.$transaction([
      prisma.user.create({
        data: {
          name: request.name,
          email: request.email,
          password: request.password,
          role: 'member',
        },
      }),
      prisma.registrationRequest.update({
        where: { id: id as string },
        data: { status: 'approved' },
      })
    ]);

    console.log(`[Admin Approval] Success: User ${request.email} created and request marked as approved.`);

    // 2. Prepare and send Welcome Email
    const welcomeHtml = getWelcomeEmailHtml(request.name);

    console.log(`[Admin Approval] Attempting to send welcome email to TARGET: ${request.email}`);

    try {
      const emailSent = await sendEmail(request.email, 'تم تفعيل حسابك بنجاح - مرحباً بك في مدبّر', welcomeHtml);
      if (emailSent) {
        console.log(`[Admin Approval] Welcome email DISPATCHED successfully to: ${request.email}`);
      } else {
        console.warn(`[Admin Approval] Welcome email FAILED for: ${request.email}`);
      }
    } catch (err) {
      console.error(`[Admin Approval] Critical Error sending email to ${request.email}:`, err);
    }

    res.json({
      message: `تم قبول طلب تسجيل ${request.name} بنجاح`
    });
  } catch (error: any) {
    console.error('[Admin Approval] Error:', error);
    // Check if error is due to unique constraint (email already exists)
    if (error.code === 'P2002') {
      res.status(400).json({ message: 'هذا البريد الإلكتروني مسجل بالفعل كمستخدم' });
    } else {
      res.status(500).json({ message: 'حدث خطأ في الخادم أثناء معالجة الطلب' });
    }
  }
});

// Quick Approve via Email Link (GET request)
router.get('/requests/:id/quick-approve', async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const request = await prisma.registrationRequest.findUnique({ where: { id: id as string } });
    if (!request) {
      res.send('<h1 style="text-align: center; margin-top: 50px;">الطلب غير موجود</h1>');
      return;
    }

    if (request.status !== 'pending') {
      res.send('<h1 style="text-align: center; margin-top: 50px;">تمت معالجة هذا الطلب مسبقاً (مقبول/مرفوض)</h1>');
      return;
    }

    await prisma.$transaction([
      prisma.user.create({
        data: {
          name: request.name,
          email: request.email,
          password: request.password,
          role: 'member',
        },
      }),
      prisma.registrationRequest.update({
        where: { id: id as string },
        data: { status: 'approved' },
      })
    ]);

    const welcomeHtml = getWelcomeEmailHtml(request.name);

    const { sendEmail } = require('../utils/mailer');
    try {
      await sendEmail(request.email, 'تم تفعيل حسابك بنجاح - مرحباً بك في مدبّر', welcomeHtml);
    } catch (err) {
      console.error('[Admin Quick Approval] Email error:', err);
    }

    res.send(`
      <div dir="rtl" style="font-family: sans-serif; text-align: center; margin-top: 50px;">
        <h1 style="color: green;">تم قبول طلب التسجيل بنجاح! ✅</h1>
        <p>تم إرسال بريد إلكتروني ترحيبي للمستخدم.</p>
        <a href="${process.env.FRONTEND_URL || 'https://ha-smart-home.vercel.app'}/dashboard/admin" style="display: inline-block; margin-top: 20px; padding: 10px 20px; background: #4f46e5; color: white; text-decoration: none; border-radius: 5px;">العودة للوحة التحكم</a>
      </div>
    `);
  } catch (error: any) {
    if (error.code === 'P2002') {
      res.send('<h1 style="text-align: center; margin-top: 50px; color: red;">هذا البريد الإلكتروني مسجل بالفعل كمستخدم</h1>');
    } else {
      res.send('<h1 style="text-align: center; margin-top: 50px; color: red;">حدث خطأ في الخادم أثناء الموافقة</h1>');
    }
  }
});
// Reject registration request
router.post('/requests/:id/reject', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
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

// Update user role/name
router.put('/users/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { name, role } = req.body;

    const user = await prisma.user.update({
      where: { id: id as string },
      data: { name, role },
      select: { id: true, name: true, email: true, role: true, avatar: true },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ أثناء تحديث بيانات المستخدم' });
  }
});

// Resend welcome email to a user
router.post('/users/:id/resend-welcome', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({ where: { id: id as string } });
    if (!user) {
      res.status(404).json({ message: 'المستخدم غير موجود' });
      return;
    }

    const welcomeHtml = getWelcomeEmailHtml(user.name);
    console.log(`[Admin Resend] Attempting to resend welcome email to: ${user.email}`);

    const emailSent = await sendEmail(user.email, 'تفعيل الحساب ودليل استخدام نظام مدبّر', welcomeHtml);

    if (emailSent) {
      res.json({ message: 'تم إعادة إرسال بريد التفعيل والدليل بنجاح' });
    } else {
      res.status(500).json({ message: 'فشل إرسال البريد الإلكتروني. يرجى التحقق من الإعدادات.' });
    }
  } catch (error: any) {
    console.error('[Admin Resend Welcome] Error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم أثناء إعادة إرسال البريد' });
  }
});

// Delete user
router.delete('/users/:id', authenticate, requireAdmin, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (id === req.user!.id) {
      res.status(400).json({ message: 'لا يمكنك حذف حسابك الخاص من هنا' });
      return;
    }

    await prisma.user.delete({
      where: { id: id as string },
    });

    res.json({ message: 'تم حذف المستخدم بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ أثناء حذف المستخدم' });
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
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    const totalExpenses = monthlyTransactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + (t.amount || 0), 0);

    res.json({ totalUsers, pendingRequests, totalIncome, totalExpenses });
  } catch (error) {
    console.error('[Admin Stats] Error:', error);
    res.status(500).json({ message: 'حدث خطأ في تحميل إحصائيات الإدارة' });
  }
});

// Get active reset codes
router.get('/reset-codes', authenticate, requireAdmin, async (_req: AuthRequest, res: Response): Promise<void> => {
  try {
    const codes = await prisma.passwordReset.findMany({
      where: { expiresAt: { gt: new Date() } },
      orderBy: { createdAt: 'desc' }
    });

    // Get user names for these emails
    const emails = codes.map(c => c.email);
    const users = await prisma.user.findMany({
      where: { email: { in: emails } },
      select: { email: true, name: true }
    });

    const userMap = users.reduce((acc, u) => {
      acc[u.email] = u.name;
      return acc;
    }, {} as Record<string, string>);

    const codesWithNames = codes.map(c => ({
      id: c.id,
      email: c.email,
      name: userMap[c.email] || 'مستخدم غير معروف',
      code: c.code,
      expiresAt: c.expiresAt
    }));

    res.json(codesWithNames);
  } catch (error) {
    console.error('[Admin Reset Codes] Error:', error);
    res.status(500).json({ message: 'حدث خطأ في تحميل أكواد استعادة كلمة المرور' });
  }
});

export default router;
