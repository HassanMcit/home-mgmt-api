"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get all transactions for user (with filters)
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const { type, category, month, year, limit } = req.query;
        const where = {};
        if (req.user.role !== 'admin') {
            where.userId = req.user.id;
        }
        if (type)
            where.type = type;
        if (category)
            where.category = category;
        if (month && year) {
            const startDate = new Date(Number(year), Number(month) - 1, 1);
            const endDate = new Date(Number(year), Number(month), 0, 23, 59, 59);
            where.date = { gte: startDate, lte: endDate };
        }
        const transactions = await prisma.transaction.findMany({
            where,
            orderBy: { date: 'desc' },
            take: limit ? parseInt(limit) : undefined,
        });
        res.json(transactions);
    }
    catch (error) {
        console.error('Get transactions error:', error);
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
});
// Get transaction stats
router.get('/stats', auth_1.authenticate, async (req, res) => {
    try {
        const { month, year } = req.query;
        const now = new Date();
        const m = Number(month) || now.getMonth() + 1;
        const y = Number(year) || now.getFullYear();
        const startDate = new Date(y, m - 1, 1);
        const endDate = new Date(y, m, 0, 23, 59, 59);
        const where = {
            date: { gte: startDate, lte: endDate },
        };
        if (req.user.role !== 'admin') {
            where.userId = req.user.id;
        }
        const transactions = await prisma.transaction.findMany({
            where,
        });
        const totalIncome = transactions
            .filter(t => t.type === 'income')
            .reduce((sum, t) => sum + t.amount, 0);
        const totalExpenses = transactions
            .filter(t => t.type === 'expense')
            .reduce((sum, t) => sum + t.amount, 0);
        // Category breakdown
        const categoryBreakdown = {};
        transactions
            .filter(t => t.type === 'expense')
            .forEach(t => {
            categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
        });
        // Daily chart data
        const dailyData = {};
        transactions.forEach(t => {
            const day = new Date(t.date).getDate().toString();
            if (!dailyData[day])
                dailyData[day] = { income: 0, expenses: 0 };
            if (t.type === 'income')
                dailyData[day].income += t.amount;
            else
                dailyData[day].expenses += t.amount;
        });
        res.json({
            totalIncome,
            totalExpenses,
            balance: totalIncome - totalExpenses,
            categoryBreakdown,
            dailyData,
            transactionCount: transactions.length,
        });
    }
    catch (error) {
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
});
// Create transaction
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const { amount, type, category, description, date } = req.body;
        if (!amount || !type || !category) {
            res.status(400).json({ message: 'المبلغ والنوع والفئة مطلوبة' });
            return;
        }
        const transaction = await prisma.transaction.create({
            data: {
                userId: req.user.id,
                amount: parseFloat(amount),
                type,
                category,
                description,
                date: date ? new Date(date) : new Date(),
            },
        });
        res.status(201).json(transaction);
    }
    catch (error) {
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
});
// Update transaction
router.put('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { amount, type, category, description, date } = req.body;
        const existing = await prisma.transaction.findFirst({
            where: { id: id, userId: req.user.id },
        });
        if (!existing) {
            res.status(404).json({ message: 'المعاملة غير موجودة' });
            return;
        }
        const transaction = await prisma.transaction.update({
            where: { id: id },
            data: {
                amount: amount ? parseFloat(amount) : existing.amount,
                type: type || existing.type,
                category: category || existing.category,
                description: description !== undefined ? description : existing.description,
                date: date ? new Date(date) : existing.date,
            },
        });
        res.json(transaction);
    }
    catch (error) {
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
});
// Delete transaction
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const existing = await prisma.transaction.findFirst({
            where: { id: id, userId: req.user.id },
        });
        if (!existing) {
            res.status(404).json({ message: 'المعاملة غير موجودة' });
            return;
        }
        await prisma.transaction.delete({ where: { id: id } });
        res.json({ message: 'تم حذف المعاملة بنجاح' });
    }
    catch (error) {
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
});
exports.default = router;
//# sourceMappingURL=transactions.js.map