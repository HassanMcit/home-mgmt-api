"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const auth_1 = require("../middleware/auth");
const reportService_1 = require("../services/reportService");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// TEST ROUTE: Trigger monthly report manually
router.post('/test-report', auth_1.authenticate, async (req, res) => {
    if (req.user.role !== 'admin') {
        return res.status(403).json({ message: 'غير مصرح لك' });
    }
    await (0, reportService_1.generateAndSendMonthlyReports)();
    res.json({ message: 'تم إرسال التقارير التجريبية بنجاح! تفقد بريدك.' });
});
// Get all registration requests
router.get('/requests', auth_1.authenticate, auth_1.requireAdmin, async (_req, res) => {
    try {
        const requests = await prisma.registrationRequest.findMany({
            orderBy: { createdAt: 'desc' },
        });
        res.json(requests);
    }
    catch (error) {
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
});
const mailer_1 = require("../utils/mailer");
// ... (existing routes up to approve)
// Approve registration request
router.post('/requests/:id/approve', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const request = await prisma.registrationRequest.findUnique({ where: { id: id } });
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
            where: { id: id },
            data: { status: 'approved' },
        });
        // Send Welcome Email
        const welcomeHtml = `
      <div dir="rtl" style="font-family: 'Cairo', sans-serif; background-color: #f8fafc; padding: 20px; border-radius: 15px; border: 1px solid #e2e8f0; max-width: 600px; margin: auto;">
        <div style="background-color: #1e1b4b; color: white; padding: 30px; border-radius: 12px; text-align: center; margin-bottom: 20px;">
          <h1 style="margin: 0;">أهلاً بك في عائلة مدبّر! 🎉</h1>
          <p style="opacity: 0.9; margin-top: 10px;">تم تفعيل حسابك بنجاح يا ${request.name}</p>
        </div>

        <div style="background: white; padding: 25px; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);">
          <h2 style="color: #4f46e5; margin-top: 0;">ماذا يمكنك أن تفعل الآن؟</h2>
          
          <div style="margin-bottom: 15px;">
            <strong style="color: #1e293b;">💰 إدارة المعاملات:</strong>
            <p style="margin: 5px 0; color: #475569; font-size: 14px;">سجل كل قرش تصرفه أو تربحه لتعرف أين تذهب أموالك بدقة.</p>
          </div>

          <div style="margin-bottom: 15px;">
            <strong style="color: #1e293b;">📅 الفواتير الذكية:</strong>
            <p style="margin: 5px 0; color: #475569; font-size: 14px;">أضف فواتيرك الشهرية وسيقوم النظام بتذكيرك بها يومياً حتى لا تنساها.</p>
          </div>

          <div style="margin-bottom: 15px;">
            <strong style="color: #1e293b;">🤖 التحليل الذكي (AI):</strong>
            <p style="margin: 5px 0; color: #475569; font-size: 14px;">احصل على نصائح مالية مخصصة لك من خلال الذكاء الاصطناعي بناءً على نمط صرفك.</p>
          </div>

          <div style="margin-top: 30px; text-align: center;">
            <a href="https://ha-smart-home.vercel.app/login" style="background-color: #4f46e5; color: white; padding: 12px 30px; border-radius: 8px; text-decoration: none; font-weight: bold; display: inline-block;">ابدأ رحلتك المالية الآن</a>
          </div>
        </div>

        <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">هذا الإيميل مرسل آلياً من نظام مدبّر لإدارة المنزل.</p>
      </div>
    `;
        await (0, mailer_1.sendEmail)(request.email, 'تم تفعيل حسابك بنجاح - مرحباً بك في مدبّر', welcomeHtml);
        res.json({ message: `تم قبول طلب تسجيل ${request.name} بنجاح وإرسال بريد ترحيبي` });
    }
    catch (error) {
        console.error('Approval error:', error);
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
});
// Reject registration request
router.post('/requests/:id/reject', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const request = await prisma.registrationRequest.findUnique({ where: { id: id } });
        if (!request) {
            res.status(404).json({ message: 'الطلب غير موجود' });
            return;
        }
        await prisma.registrationRequest.update({
            where: { id: id },
            data: { status: 'rejected' },
        });
        res.json({ message: 'تم رفض الطلب' });
    }
    catch (error) {
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
});
// Get all users
router.get('/users', auth_1.authenticate, auth_1.requireAdmin, async (_req, res) => {
    try {
        const users = await prisma.user.findMany({
            select: { id: true, name: true, email: true, role: true, avatar: true, createdAt: true },
            orderBy: { createdAt: 'asc' },
        });
        res.json(users);
    }
    catch (error) {
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
});
// Create user directly (admin only)
router.post('/users', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
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
        const hashedPassword = await bcryptjs_1.default.hash(password, 12);
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
    }
    catch (error) {
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
});
// Update user
router.put('/users/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, role } = req.body;
        const user = await prisma.user.update({
            where: { id: id },
            data: { name, role },
            select: { id: true, name: true, email: true, role: true, createdAt: true },
        });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
});
// Delete user
router.delete('/users/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        // Prevent deleting yourself
        if (id === req.user.id) {
            res.status(400).json({ message: 'لا يمكنك حذف حسابك الخاص' });
            return;
        }
        await prisma.user.delete({ where: { id: id } });
        res.json({ message: 'تم حذف المستخدم بنجاح' });
    }
    catch (error) {
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
});
// Get dashboard stats (admin)
router.get('/stats', auth_1.authenticate, auth_1.requireAdmin, async (_req, res) => {
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
    }
    catch (error) {
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
});
// Get active password reset codes
router.get('/reset-codes', auth_1.authenticate, auth_1.requireAdmin, async (_req, res) => {
    try {
        const usersWithReset = await prisma.user.findMany({
            where: { avatar: { startsWith: 'RESET:' } },
            select: { id: true, name: true, email: true, avatar: true },
        });
        const activeResets = usersWithReset.map(user => {
            const parts = user.avatar.split(':');
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
    }
    catch (error) {
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
});
exports.default = router;
//# sourceMappingURL=admin.js.map