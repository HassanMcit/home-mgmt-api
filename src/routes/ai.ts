import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const CATEGORY_NAMES: Record<string, string> = {
  food: 'طعام ومشروبات',
  transport: 'مواصلات',
  housing: 'سكن وإيجار',
  health: 'صحة وطب',
  education: 'تعليم',
  entertainment: 'ترفيه',
  clothing: 'ملابس',
  utilities: 'فواتير ومرافق',
  shopping: 'تسوق',
  savings: 'ادخار',
  other: 'أخرى',
};

// Get AI monthly analysis
router.get('/analysis', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { month, year, userId } = req.query;
    const now = new Date();
    const m = Number(month) || now.getMonth() + 1;
    const y = Number(year) || now.getFullYear();

    const startDate = new Date(y, m - 1, 1);
    const endDate = new Date(y, m, 0, 23, 59, 59);

    const where: any = {
      date: { gte: startDate, lte: endDate },
    };
    
    if (req.user!.role !== 'admin') {
      where.userId = req.user!.id;
    } else if (userId && userId !== 'all' && userId !== 'undefined') {
      where.userId = userId as string;
    }

    const transactions = await prisma.transaction.findMany({
      where,
      orderBy: { date: 'desc' },
    });

    const user = await prisma.user.findUnique({ where: { id: req.user!.id } });

    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((sum, t) => sum + t.amount, 0);

    const totalExpenses = transactions
      .filter(t => t.type === 'expense')
      .reduce((sum, t) => sum + t.amount, 0);

    const categoryBreakdown: Record<string, number> = {};
    transactions
      .filter(t => t.type === 'expense')
      .forEach(t => {
        categoryBreakdown[t.category] = (categoryBreakdown[t.category] || 0) + t.amount;
      });

    const sortedCategories = Object.entries(categoryBreakdown)
      .sort(([, a], [, b]) => b - a)
      .map(([cat, amount]) => ({
        category: cat,
        categoryAr: CATEGORY_NAMES[cat] || cat,
        amount,
        percentage: totalExpenses > 0 ? ((amount / totalExpenses) * 100).toFixed(1) : '0',
      }));

    const monthNames = ['يناير', 'فبراير', 'مارس', 'أبريل', 'مايو', 'يونيو',
      'يوليو', 'أغسطس', 'سبتمبر', 'أكتوبر', 'نوفمبر', 'ديسمبر'];

    const apiKey = process.env.GEMINI_API_KEY?.trim();
    
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      // Return analysis without AI if no API key
      res.json({
        month: m,
        year: y,
        monthName: monthNames[m - 1],
        totalIncome,
        totalExpenses,
        balance: totalIncome - totalExpenses,
        categoryBreakdown: sortedCategories,
        transactionCount: transactions.length,
        aiAnalysis: null,
        noApiKey: true,
      });
      return;
    }

    // 3. Handle Empty Data Case
    if (transactions.length === 0) {
      res.json({
        month: m,
        year: y,
        monthName: monthNames[m - 1],
        totalIncome: 0,
        totalExpenses: 0,
        balance: 0,
        categoryBreakdown: [],
        transactionCount: 0,
        aiAnalysis: "لا توجد معاملات مسجلة لهذا الشهر حتى الآن. ابدأ بتسجيل معاملاتك المالية لتصلك التحليلات الذكية!",
        noApiKey: false,
      });
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-flash-latest' });

    const prompt = `أنت مستشار مالي خبير. قم بتحليل بيانات المصاريف الشهرية التالية وتقديم تقرير مفصل باللغة العربية.

اسم المستخدم: ${user?.name || 'مستخدم النظام'}
الشهر: ${monthNames[m - 1]} ${y}

الإحصائيات:
- إجمالي الدخل: ${totalIncome.toFixed(2)} جنيه
- إجمالي المصاريف: ${totalExpenses.toFixed(2)} جنيه
- الرصيد المتبقي: ${(totalIncome - totalExpenses).toFixed(2)} جنيه
- عدد المعاملات: ${transactions.length}

توزيع المصاريف حسب الفئة:
${sortedCategories.map(c => `- ${c.categoryAr}: ${c.amount.toFixed(2)} جنيه (${c.percentage}%)`).join('\n')}

المطلوب:
1. تحليل شامل للمصاريف هذا الشهر
2. تحديد أعلى 3 فئات مصاريف وتقييمها
3. نصائح عملية لتوفير المال (مع أرقام محددة)
4. خطة ادخار مقترحة للشهر القادم
5. توصيات للاستثمار بناءً على الوضع المالي

اجعل التحليل عملياً ومحدداً مع أرقام وتوصيات واقعية. استخدم أسماء الفئات بالعربية.`;

    const result = await model.generateContent(prompt);
    
    if (!result || !result.response) {
      throw new Error('فشل الحصول على رد من الذكاء الاصطناعي');
    }

    const aiAnalysis = result.response.text();

    res.json({
      month: m,
      year: y,
      monthName: monthNames[m - 1],
      totalIncome,
      totalExpenses,
      balance: totalIncome - totalExpenses,
      categoryBreakdown: sortedCategories,
      transactionCount: transactions.length,
      aiAnalysis,
      noApiKey: false,
    });
    } catch (error: any) {
      console.error('AI analysis error details:', error);
      res.status(500).json({ 
        message: 'حدث خطأ أثناء إجراء التحليل الذكي',
        details: error.message,
        error: true 
      });
    }
});

// Get quick AI tip
router.get('/tip', authenticate, async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    
    if (!apiKey || apiKey === 'YOUR_GEMINI_API_KEY_HERE') {
      res.json({ tip: 'أضف مفتاح Gemini API للحصول على نصائح مالية ذكية!' });
      return;
    }

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

    const result = await model.generateContent(
      'أعطني نصيحة مالية عملية قصيرة ومفيدة باللغة العربية (جملة أو جملتين فقط) للمساعدة في إدارة الميزانية الأسرية.'
    );

    res.json({ tip: result.response.text() });
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

export default router;
