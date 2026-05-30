import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { authenticate, AuthRequest } from '../middleware/auth';
import type {
  CreateSplitBillInput,
  SplitParticipantInput,
} from '../types/splitBill.types';

const router = Router();
const prisma = new PrismaClient();

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Basic validation for a CreateSplitBillInput payload */
function validateCreateBody(body: unknown): body is CreateSplitBillInput {
  if (!body || typeof body !== 'object') return false;
  const b = body as Record<string, unknown>;

  if (typeof b.title !== 'string' || b.title.trim() === '') return false;
  if (typeof b.totalAmount !== 'number' || b.totalAmount <= 0) return false;
  if (!Array.isArray(b.participants) || b.participants.length === 0) return false;

  for (const p of b.participants as SplitParticipantInput[]) {
    if (typeof p.participantName !== 'string' || p.participantName.trim() === '') return false;
    if (typeof p.owedAmount !== 'number' || p.owedAmount < 0) return false;
  }

  return true;
}

// ─── GET /api/split ───────────────────────────────────────────────────────────
// Return all split sessions created by the authenticated user, newest first.

router.get('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bills = await prisma.splitBill.findMany({
      where: { paidById: req.user!.id },
      include: { participants: { orderBy: { createdAt: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });

    res.json(bills);
  } catch (error) {
    console.error('[SplitBill] GET / error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// ─── GET /api/split/:id ───────────────────────────────────────────────────────
// Return a single split session with all participants.

router.get('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const bill = await prisma.splitBill.findFirst({
      where: { id, paidById: req.user!.id },
      include: { participants: { orderBy: { createdAt: 'asc' } } },
    });

    if (!bill) {
      res.status(404).json({ message: 'الحسبة مش موجودة' });
      return;
    }

    res.json(bill);
  } catch (error) {
    console.error('[SplitBill] GET /:id error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// ─── POST /api/split ──────────────────────────────────────────────────────────
// Create a new split session + all participant rows in ONE transaction.
// If anything fails, the whole operation is rolled back automatically.

router.post('/', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const body = req.body;

    // ── Validate ──────────────────────────────────────────────────────────────
    if (!validateCreateBody(body)) {
      res.status(400).json({
        message: 'بيانات غير صحيحة — تأكد من العنوان، المبلغ، وقائمة الأشخاص',
      });
      return;
    }

    const { title, totalAmount, participants } = body;

    // ── Sanity check: sum of shares must not exceed the total ─────────────────
    const sharesSum = participants.reduce((acc, p) => acc + p.owedAmount, 0);
    const diff = Math.abs(sharesSum - totalAmount);
    if (diff > 0.5) {
      // Allow up to 0.5 EGP rounding tolerance
      res.status(400).json({
        message: `مجموع الأنصبة (${sharesSum.toFixed(2)}) لا يساوي إجمالي الفاتورة (${totalAmount.toFixed(2)})`,
      });
      return;
    }

    // ── Atomic transaction: create bill + all participants at once ─────────────
    const splitBill = await prisma.$transaction(async (tx) => {
      const bill = await tx.splitBill.create({
        data: {
          paidById: req.user!.id,
          title: title.trim(),
          totalAmount,
          participants: {
            create: participants.map((p) => ({
              participantName: p.participantName.trim(),
              participantId:   p.participantId ?? null,
              owedAmount:      p.owedAmount,
              isPaid:          false,
            })),
          },
        },
        include: { participants: { orderBy: { createdAt: 'asc' } } },
      });

      return bill;
    });

    res.status(201).json(splitBill);
  } catch (error) {
    console.error('[SplitBill] POST / error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

// ─── PATCH /api/split/:billId/participants/:participantId ─────────────────────
// Toggle isPaid for a single participant (e.g. someone paid their share).

router.patch(
  '/:billId/participants/:participantId',
  authenticate,
  async (req: AuthRequest, res: Response): Promise<void> => {
    try {
      const billId = req.params.billId as string;
      const participantId = req.params.participantId as string;
      const { isPaid } = req.body as { isPaid: boolean };

      if (typeof isPaid !== 'boolean') {
        res.status(400).json({ message: 'isPaid لازم يكون true أو false' });
        return;
      }

      // Ensure the bill belongs to this user
      const bill = await prisma.splitBill.findFirst({
        where: { id: billId, paidById: req.user!.id },
      });

      if (!bill) {
        res.status(404).json({ message: 'الحسبة مش موجودة' });
        return;
      }

      const updated = await prisma.splitParticipant.update({
        where: { id: participantId as string },
        data: {
          isPaid,
          paidAt: isPaid ? new Date() : null,
        },
      });

      res.json(updated);
    } catch (error) {
      console.error('[SplitBill] PATCH participant error:', error);
      res.status(500).json({ message: 'حدث خطأ في الخادم' });
    }
  }
);

// ─── DELETE /api/split/:id ────────────────────────────────────────────────────
// Delete a split session. Cascade in schema handles participants automatically.

router.delete('/:id', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = req.params.id as string;
    const bill = await prisma.splitBill.findFirst({
      where: { id, paidById: req.user!.id },
    });

    if (!bill) {
      res.status(404).json({ message: 'الحسبة مش موجودة' });
      return;
    }

    await prisma.splitBill.delete({ where: { id } });
    res.json({ message: 'تم حذف الحسبة بنجاح' });
  } catch (error) {
    console.error('[SplitBill] DELETE error:', error);
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

export default router;
