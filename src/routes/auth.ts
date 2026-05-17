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

import { sendEmail } from '../utils/mailer';

// ... (existing routes up to forgot-password)

// Forgot password - generates a reset code and sends it via email
router.post('/forgot-password', async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;

    if (!email) {
      res.status(400).json({ message: 'البريد الإلكتروني مطلوب' });
      return;
    }

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      // Still return success to prevent email enumeration, but don't send anything
      res.json({ message: 'إذا كان البريد مسجلاً، ستصلك رسالة إعادة التعيين' });
      return;
    }

    // Generate a 6-digit reset code
    const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000); // 15 min

    // Save to DB
    await prisma.passwordReset.create({
      data: { email, code: resetCode, expiresAt }
    });

    // Send Email
    const emailHtml = `
      <div dir="rtl" style="font-family: 'Cairo', sans-serif; padding: 20px; border: 1px solid #e2e8f0; border-radius: 15px; max-width: 500px; margin: auto;">
        <h2 style="color: #6366f1;">إعادة تعيين كلمة المرور 🔐</h2>
        <p>مرحباً ${user.name}،</p>
        <p>لقد طلبت إعادة تعيين كلمة المرور الخاصة بك. استخدم الكود التالي:</p>
        <div style="background: #f8fafc; padding: 20px; text-align: center; border-radius: 10px; margin: 20px 0; border: 2px dashed #6366f1;">
          <h1 style="margin: 0; letter-spacing: 8px; color: #1e293b; font-size: 36px; font-weight: bold;">${resetCode}</h1>
        </div>
        <p style="color: #64748b; font-size: 14px;">⏰ هذا الكود صالح لمدة <strong>15 دقيقة</strong> فقط.</p>
        <p style="color: #64748b; font-size: 14px;">إذا لم تطلب هذا التغيير، يرجى تجاهل الرسالة.</p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 20px 0;">
        <p style="color: #94a3b8; font-size: 12px; text-align: center;">هذا الإيميل مرسل آلياً من نظام مدبّر لإدارة المنزل.</p>
      </div>
    `;

    console.log(`[Forgot Password] Sending reset code to: ${email}`);
    const emailSent = await sendEmail(email, 'رمز إعادة تعيين كلمة المرور - مدبّر', emailHtml);
    
    if (!emailSent) {
      console.error(`[Forgot Password] FAILED to send email to: ${email}. Code was: ${resetCode}`);
      // Still return success message to user (don't leak info), but log the failure
      res.json({ message: 'إذا كان البريد مسجلاً، ستصلك رسالة إعادة التعيين' });
      return;
    }

    console.log(`[Forgot Password] Reset code sent successfully to: ${email}`);
    res.json({ message: 'تم إرسال رمز إعادة التعيين إلى بريدك الإلكتروني.' });
  } catch (error) {
    console.error('Forgot password error:', error);
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

    // Find the latest valid code for this email
    const resetRequest = await prisma.passwordReset.findFirst({
      where: { email, code },
      orderBy: { createdAt: 'desc' }
    });

    if (!resetRequest) {
      res.status(400).json({ message: 'الرمز غير صحيح أو منتهي الصلاحية' });
      return;
    }

    if (newPassword.length < 6) {
      res.status(400).json({ message: 'كلمة المرور يجب أن تكون 6 أحرف على الأقل' });
      return;
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);

    await prisma.$transaction([
      prisma.user.update({
        where: { email },
        data: { password: hashedPassword }
      }),
      prisma.passwordReset.deleteMany({ where: { email } }) // Clear all codes for this user
    ]);

    res.json({ message: 'تم إعادة تعيين كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.' });
  } catch (error) {
    console.error('Reset password error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// Diagnostic endpoint for testing SMTP connection from production
router.get('/test-smtp', async (req: Request, res: Response) => {
  try {
    const { transporter } = require('../utils/mailer');
    await transporter.verify();
    res.json({ 
      status: 'success', 
      message: 'SMTP connection is working perfectly!',
      user: process.env.EMAIL_USER ? 'Set' : 'Missing',
      pass: process.env.EMAIL_PASS ? 'Set (Length: ' + process.env.EMAIL_PASS.length + ')' : 'Missing'
    });
  } catch (error: any) {
    res.status(500).json({ 
      status: 'error', 
      message: error.message,
      code: error.code,
      response: error.response,
      user: process.env.EMAIL_USER ? 'Set' : 'Missing',
      pass: process.env.EMAIL_PASS ? 'Set (Length: ' + process.env.EMAIL_PASS?.length + ')' : 'Missing'
    });
  }
});

export default router;
