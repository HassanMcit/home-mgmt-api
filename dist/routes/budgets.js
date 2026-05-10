"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get budgets
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const { month, year } = req.query;
        const now = new Date();
        const m = Number(month) || now.getMonth() + 1;
        const y = Number(year) || now.getFullYear();
        const whereBudget = { month: m, year: y };
        if (req.user.role !== 'admin') {
            whereBudget.userId = req.user.id;
        }
        const budgets = await prisma.budget.findMany({
            where: whereBudget,
        });
        // Get actual spending per category for this month
        const startDate = new Date(y, m - 1, 1);
        const endDate = new Date(y, m, 0, 23, 59, 59);
        const whereTransaction = {
            type: 'expense',
            date: { gte: startDate, lte: endDate },
        };
        if (req.user.role !== 'admin') {
            whereTransaction.userId = req.user.id;
        }
        const transactions = await prisma.transaction.findMany({
            where: whereTransaction,
        });
        const spending = {};
        transactions.forEach(t => {
            spending[t.category] = (spending[t.category] || 0) + t.amount;
        });
        const budgetsWithSpending = budgets.map(b => ({
            ...b,
            spent: spending[b.category] || 0,
            remaining: b.amount - (spending[b.category] || 0),
        }));
        res.json(budgetsWithSpending);
    }
    catch (error) {
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
});
// Create/update budget
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const { category, amount, month, year } = req.body;
        const now = new Date();
        const budget = await prisma.budget.upsert({
            where: {
                userId_category_month_year: {
                    userId: req.user.id,
                    category,
                    month: month || now.getMonth() + 1,
                    year: year || now.getFullYear(),
                },
            },
            update: { amount: parseFloat(amount) },
            create: {
                userId: req.user.id,
                category,
                amount: parseFloat(amount),
                month: month || now.getMonth() + 1,
                year: year || now.getFullYear(),
            },
        });
        res.json(budget);
    }
    catch (error) {
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
});
// Delete budget
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma.budget.findFirst({
            where: { id: id, userId: req.user.id },
        });
        if (!existing) {
            res.status(404).json({ message: 'الميزانية غير موجودة' });
            return;
        }
        await prisma.budget.delete({ where: { id: id } });
        res.json({ message: 'تم حذف الميزانية بنجاح' });
    }
    catch (error) {
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
});
exports.default = router;
//# sourceMappingURL=budgets.js.map