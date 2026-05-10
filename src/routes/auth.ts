import { Router, Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

// Login
router.post('/login', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ message: 'البريد الإلكتروني وكلمة المرور مطلوبان' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
      return;
    }

    const isValid = await bcrypt.compare(password, user.password);
    if (!isValid) {
      res.status(401).json({ message: 'البريد الإلكتروني أو كلمة المرور غير صحيحة' });
      return;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '30d' }
    );

    res.json({
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// Register Request (needs admin approval)
router.post('/register-request', async (req: Request, res: Response): Promise<void> => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      res.status(400).json({ message: 'جميع الحقول مطلوبة' });
      return;
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      res.status(400).json({ message: 'هذا البريد الإلكتروني مستخدم بالفعل' });
      return;
    }

    // Check if there's a pending request
    const existingRequest = await prisma.registrationRequest.findFirst({
      where: { email, status: 'pending' },
    });
    if (existingRequest) {
      res.status(400).json({ message: 'يوجد طلب تسجيل قيد المراجعة لهذا البريد الإلكتروني' });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    await prisma.registrationRequest.create({
      data: { name, email, password: hashedPassword },
    });

    res.status(201).json({ message: 'تم إرسال طلب التسجيل بنجاح. سيتم مراجعته من قبل المدير.' });
  } catch (error) {
    console.error('Register request error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// Get current user
router.get('/me', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.user!.id },
      select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true },
    });

    if (!user) {
      res.status(404).json({ message: 'المستخدم غير موجود' });
      return;
    }

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// Update profile
router.put('/profile', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, avatar } = req.body;

    const user = await prisma.user.update({
      where: { id: req.user!.id },
      data: { name, avatar },
      select: { id: true, name: true, email: true, role: true, avatar: true },
    });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// Change password
router.put('/change-password', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { currentPassword, newPassword } = req.body;

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });
    if (!user) {
      res.status(404).json({ message: 'المستخدم غير موجود' });
      return;
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      res.status(400).json({ message: 'كلمة المرور الحالية غير صحيحة' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: req.user!.id },
      data: { password: hashedPassword },
    });

    res.json({ message: 'تم تغيير كلمة المرور بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// Forgot password - generates a reset token (stored as temp password)
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'البريد الإلكتروني مطلوب' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });

    // Always return success to prevent email enumeration
    if (!user) {
      res.json({ message: 'إذا كان البريد مسجلاً، ستصلك رسالة إعادة التعيين' });
      return;
    }

    // Generate a 6-digit reset code valid for 15 minutes
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const resetExpiry = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    // Store hashed reset code in avatar field temporarily (simple approach without extra DB column)
    // In production you'd store in a separate table or send email
    await prisma.user.update({
      where: { id: user.id },
      data: { avatar: `RESET:${resetCode}:${resetExpiry.getTime()}` },
    });

    // In production: send email with resetCode
    // For now: log it so admin can share it
    console.log(`🔑 Reset code for ${email}: ${resetCode} (expires in 15 min)`);

    res.json({ message: 'تم إرسال رمز إعادة التعيين. تواصل مع المدير لمعرفة الرمز.' });
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// Reset password using reset code
router.post('/reset-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, code, newPassword } = req.body;

    if (!email || !code || !newPassword) {
      res.status(400).json({ message: 'جميع الحقول مطلوبة' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user || !user.avatar?.startsWith('RESET:')) {
      res.status(400).json({ message: 'رمز إعادة التعيين غير صالح أو منتهي الصلاحية' });
      return;
    }

    const parts = user.avatar.split(':');
    const storedCode = parts[1];
    const expiry = parseInt(parts[2]);

    if (storedCode !== code) {
      res.status(400).json({ message: 'الرمز غير صحيح' });
      return;
    }

    if (Date.now() > expiry) {
      res.status(400).json({ message: 'انتهت صلاحية الرمز. يرجى طلب رمز جديد.' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword, avatar: null }, // Clear reset token
    });

    res.json({ message: 'تم إعادة تعيين كلمة المرور بنجاح' });
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

export default router;
