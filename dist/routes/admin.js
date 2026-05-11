"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const reportService_1 = require("../services/reportService");
const mailer_1 = require("../utils/mailer");
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
            where: { status: 'pending' },
            orderBy: { createdAt: 'desc' },
        });
        res.json(requests);
    }
    catch (error) {
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
});
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
// Update user role/name
router.put('/users/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, role } = req.body;
        const user = await prisma.user.update({
            where: { id: id },
            data: { name, role },
            select: { id: true, name: true, email: true, role: true, avatar: true },
        });
        res.json(user);
    }
    catch (error) {
        res.status(500).json({ message: 'حدث خطأ أثناء تحديث بيانات المستخدم' });
    }
});
// Delete user
router.delete('/users/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { id } = req.params;
        // Prevent admin from deleting themselves
        if (id === req.user.id) {
            res.status(400).json({ message: 'لا يمكنك حذف حسابك الخاص من هنا' });
            return;
        }
        await prisma.user.delete({
            where: { id: id },
        });
        res.json({ message: 'تم حذف المستخدم بنجاح' });
    }
    catch (error) {
        res.status(500).json({ message: 'حدث خطأ أثناء حذف المستخدم' });
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
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        const totalExpenses = monthlyTransactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + (t.amount || 0), 0);
        res.json({ totalUsers, pendingRequests, totalIncome, totalExpenses });
    }
    catch (error) {
        console.error('[Admin Stats] Error:', error);
        res.status(500).json({ message: 'حدث خطأ في تحميل إحصائيات الإدارة' });
    }
});
// Get active reset codes
router.get('/reset-codes', auth_1.authenticate, auth_1.requireAdmin, async (_req, res) => {
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
        }, {});
        const codesWithNames = codes.map(c => ({
            id: c.id,
            email: c.email,
            name: userMap[c.email] || 'مستخدم غير معروف',
            code: c.code,
            expiresAt: c.expiresAt
        }));
        res.json(codesWithNames);
    }
    catch (error) {
        console.error('[Admin Reset Codes] Error:', error);
        res.status(500).json({ message: 'حدث خطأ في تحميل أكواد استعادة كلمة المرور' });
    }
});
exports.default = router;
//# sourceMappingURL=admin.js.map