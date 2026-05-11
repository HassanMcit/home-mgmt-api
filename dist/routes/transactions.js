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
// Get transactions
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const { userId, limit } = req.query;
        const where = {};
        if (req.user.role === 'admin') {
            if (userId && userId !== 'all' && userId !== 'undefined' && userId !== '') {
                where.userId = userId;
            }
        }
        else {
            where.userId = req.user.id;
        }
        const transactions = await prisma.transaction.findMany({
            where,
            orderBy: { date: 'desc' },
            take: limit ? parseInt(limit) : undefined,
        });
        res.json(transactions);
    }
    catch (error) {
        console.error('[Transactions GET] Error:', error);
        res.status(500).json({ message: 'حدث خطأ أثناء تحميل المعاملات' });
    }
});
// Get statistics
router.get('/stats', auth_1.authenticate, async (req, res) => {
    try {
        const { userId: queryUserId, month, year } = req.query;
        // Determine which user's stats to fetch
        let userId = req.user.id;
        if (req.user.role === 'admin' && queryUserId && queryUserId !== 'all' && queryUserId !== 'undefined' && queryUserId !== '') {
            userId = queryUserId;
        }
        const now = new Date();
        const m = month ? parseInt(month) : now.getMonth() + 1;
        const y = year ? parseInt(year) : now.getFullYear();
        const startOfMonth = new Date(y, m - 1, 1);
        const endOfMonth = new Date(y, m, 0, 23, 59, 59);
        // 1. Total Balance (All time)
        const allTransactions = await prisma.transaction.findMany({
            where: { userId },
        });
        let balance = 0;
        allTransactions.forEach(t => {
            if (t.type === 'income')
                balance += t.amount;
            else
                balance -= t.amount;
        });
        // 2. Monthly Stats
        const monthlyTransactions = await prisma.transaction.findMany({
            where: {
                userId,
                date: { gte: startOfMonth, lte: endOfMonth },
            },
        });
        let totalIncome = 0;
        let totalExpenses = 0;
        const categoryBreakdown = {};
        monthlyTransactions.forEach(t => {
            if (t.type === 'income') {
                totalIncome += t.amount;
            }
            else {
                totalExpenses += t.amount;
                categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
            }
        });
        res.json({
            balance,
            totalIncome,
            totalExpenses,
            categoryBreakdown,
        });
    }
    catch (error) {
        console.error('[Transactions Stats] Error:', error);
        res.status(500).json({ message: 'حدث خطأ أثناء تحميل الإحصائيات' });
    }
});
// Create transaction
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const { amount, type, category, description, date, targetUserId } = req.body;
        if (!amount || !type || !category) {
            res.status(400).json({ message: 'المبلغ والنوع والفئة مطلوبان' });
            return;
        }
        // Determine target user
        let userId = req.user.id;
        if (req.user.role === 'admin' && targetUserId && targetUserId !== 'undefined' && targetUserId !== '') {
            userId = targetUserId;
        }
        const transaction = await prisma.transaction.create({
            data: {
                userId,
                amount: parseFloat(amount),
                type,
                category,
                description,
                date: date ? new Date(date) : new Date(),
                createdById: req.user.id,
            },
        });
        res.json(transaction);
    }
    catch (error) {
        console.error('[Transaction POST] Fatal Error:', error);
        res.status(500).json({ message: 'حدث خطأ أثناء حفظ المعاملة' });
    }
});
// Delete transaction
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: req.params.id },
        });
        if (!transaction) {
            res.status(404).json({ message: 'المعاملة غير موجودة' });
            return;
        }
        if (req.user.role !== 'admin' && transaction.userId !== req.user.id) {
            res.status(403).json({ message: 'غير مصرح لك بحذف هذه المعاملة' });
            return;
        }
        await prisma.transaction.delete({
            where: { id: req.params.id },
        });
        res.json({ message: 'تم حذف المعاملة بنجاح' });
    }
    catch (error) {
        console.error('[Transaction DELETE] Error:', error);
        res.status(500).json({ message: 'حدث خطأ أثناء حذف المعاملة' });
    }
});
exports.default = router;
//# sourceMappingURL=transactions.js.map