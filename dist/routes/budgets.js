"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
const prisma = new client_1.PrismaClient();
// Get budgets with actual spending calculation
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const { userId, month, year } = req.query;
        const now = new Date();
        let m = month ? parseInt(month) : now.getMonth() + 1;
        let y = year ? parseInt(year) : now.getFullYear();
        if (isNaN(m) || m < 1 || m > 12)
            m = now.getMonth() + 1;
        if (isNaN(y) || y < 2000 || y > 2100)
            y = now.getFullYear();
        const whereBudget = {};
        if (req.user.role !== 'admin') {
            whereBudget.userId = req.user.id;
        }
        else if (userId && userId !== 'all' && userId !== 'undefined') {
            whereBudget.userId = userId;
        }
        const budgets = await prisma.budget.findMany({
            where: whereBudget,
        });
        const startDate = new Date(y, m - 1, 1);
        const endDate = new Date(y, m, 0, 23, 59, 59);
        const whereTransaction = {
            type: 'expense',
            date: { gte: startDate, lte: endDate },
        };
        if (req.user.role !== 'admin') {
            whereTransaction.userId = req.user.id;
        }
        else if (userId && userId !== 'all' && userId !== 'undefined') {
            whereTransaction.userId = userId;
        }
        const transactions = await prisma.transaction.findMany({
            where: whereTransaction,
            select: { amount: true, category: true, userId: true }
        });
        const spendingMap = {};
        transactions.forEach(t => {
            if (t && t.userId && t.category) {
                if (!spendingMap[t.userId])
                    spendingMap[t.userId] = {};
                spendingMap[t.userId][t.category] = (spendingMap[t.userId][t.category] || 0) + (t.amount || 0);
            }
        });
        const budgetsWithSpending = budgets.map(b => {
            const userSpent = spendingMap[b.userId] || {};
            const actualSpent = userSpent[b.category] || 0;
            return {
                ...b,
                userName: 'مستخدم',
                spent: actualSpent,
                remaining: Math.max(0, b.amount - actualSpent),
            };
        });
        res.json(budgetsWithSpending);
    }
    catch (error) {
        console.error('[Budgets GET] Error:', error);
        res.status(500).json({
            message: 'فشل في تحميل الميزانية: ' + (error.message || 'خطأ في قاعدة البيانات')
        });
    }
});
// Create/update budget (ADMIN ONLY)
router.post('/', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        const { category, amount, targetUserId } = req.body;
        if (!category || !amount) {
            res.status(400).json({ message: 'الفئة والمبلغ مطلوبان' });
            return;
        }
        // Force Admin to specify a user explicitly if they are doing it for someone else
        // We don't default to Admin ID here anymore to prevent accidental self-attribution
        const userId = req.user.id;
        console.log(`[Budget POST] Assigning for User: ${userId}, Cat: ${category}, Amt: ${amount}`);
        const existingBudget = await prisma.budget.findFirst({
            where: { userId, category }
        });
        let budget;
        if (existingBudget) {
            budget = await prisma.budget.update({
                where: { id: existingBudget.id },
                data: { amount: parseFloat(amount) },
            });
        }
        else {
            budget = await prisma.budget.create({
                data: {
                    userId,
                    category,
                    amount: parseFloat(amount),
                },
            });
        }
        res.json(budget);
    }
    catch (error) {
        console.error('[Budgets POST] Fatal Error:', error);
        res.status(500).json({ message: 'حدث خطأ أثناء حفظ الميزانية' });
    }
});
// Delete budget (ADMIN ONLY)
router.delete('/:id', auth_1.authenticate, auth_1.requireAdmin, async (req, res) => {
    try {
        await prisma.budget.delete({
            where: { id: req.params.id },
        });
        res.json({ message: 'تم حذف الميزانية بنجاح' });
    }
    catch (error) {
        console.error('[Budgets DELETE] Error:', error);
        res.status(500).json({ message: 'حدث خطأ أثناء حذف الميزانية' });
    }
});
exports.default = router;
//# sourceMappingURL=budgets.js.map