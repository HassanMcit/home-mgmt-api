"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const client_1 = require("@prisma/client");
const auth_1 = require("../middleware/auth");
const router = (0, express_1.Router)();
const prisma = new client_1.PrismaClient();
// Get all bills
router.get('/', auth_1.authenticate, async (req, res) => {
    try {
        const { isPaid } = req.query;
        const where = {};
        if (req.user.role !== 'admin') {
            where.userId = req.user.id;
        }
        if (isPaid !== undefined)
            where.isPaid = isPaid === 'true';
        const bills = await prisma.bill.findMany({
            where,
            orderBy: { dueDate: 'asc' },
        });
        res.json(bills);
    }
    catch (error) {
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
});
// Create bill
router.post('/', auth_1.authenticate, async (req, res) => {
    try {
        const { name, amount, dueDate, isRecurring, category } = req.body;
        if (!name || !amount || !dueDate) {
            res.status(400).json({ message: 'الاسم والمبلغ وتاريخ الاستحقاق مطلوبة' });
            return;
        }
        const bill = await prisma.bill.create({
            data: {
                userId: req.user.id,
                name,
                amount: parseFloat(amount),
                dueDate: new Date(dueDate),
                isRecurring: isRecurring || false,
                category: category || 'other',
            },
        });
        res.status(201).json(bill);
    }
    catch (error) {
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
});
// Mark bill as paid/unpaid
router.put('/:id/toggle', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const where = { id: id };
        if (req.user.role !== 'admin') {
            where.userId = req.user.id;
        }
        const existing = await prisma.bill.findFirst({ where });
        if (!existing) {
            res.status(404).json({ message: 'الفاتورة غير موجودة' });
            return;
        }
        const bill = await prisma.bill.update({
            where: { id: id },
            data: { isPaid: !existing.isPaid },
        });
        res.json(bill);
    }
    catch (error) {
        console.error('Bill toggle error:', error);
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
});
// Update bill
router.put('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const { name, amount, dueDate, isRecurring, category } = req.body;
        const where = { id: id };
        if (req.user.role !== 'admin') {
            where.userId = req.user.id;
        }
        const existing = await prisma.bill.findFirst({ where });
        if (!existing) {
            res.status(404).json({ message: 'الفاتورة غير موجودة' });
            return;
        }
        const bill = await prisma.bill.update({
            where: { id: id },
            data: {
                name: name || existing.name,
                amount: amount ? parseFloat(amount) : existing.amount,
                dueDate: dueDate ? new Date(dueDate) : existing.dueDate,
                isRecurring: isRecurring !== undefined ? isRecurring : existing.isRecurring,
                category: category || existing.category,
            },
        });
        res.json(bill);
    }
    catch (error) {
        console.error('Bill update error:', error);
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
});
// Delete bill
router.delete('/:id', auth_1.authenticate, async (req, res) => {
    try {
        const { id } = req.params;
        const where = { id: id };
        if (req.user.role !== 'admin') {
            where.userId = req.user.id;
        }
        const existing = await prisma.bill.findFirst({ where });
        if (!existing) {
            res.status(404).json({ message: 'الفاتورة غير موجودة' });
            return;
        }
        await prisma.bill.delete({ where: { id: id } });
        res.json({ message: 'تم حذف الفاتورة بنجاح' });
    }
    catch (error) {
        console.error('Bill delete error:', error);
        res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
});
exports.default = router;
//# sourceMappingURL=bills.js.map