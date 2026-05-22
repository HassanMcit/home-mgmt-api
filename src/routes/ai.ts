import { Router, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { authenticate, AuthRequest } from '../middleware/auth';

const router = Router();
const prisma = new PrismaClient();

const CATEGORY_NAMES: Record<string, string> = {
  installments: 'اقساط',
  allowance: 'مصروفي',
  services: 'خدمات',
  debts: 'ديون',
  bank_fees: 'مصاريف بنك',
  insurance: 'تامين',
  haircut: 'حلاقة',
  travel: 'سفر',
  landline_bill: 'فاتورة ارضي',
  gas_cylinder: 'انبوبة',
  nestle_water: 'ماية نسلة',
  money_pool: 'جميعة',
  house_wife_allowance: 'مصروف البيت و الزوجه',
  general_bills: 'فواتير عامه',
  doorman: 'بواب العماره',
  internet_bill: 'فاتورة الانترنت',
  apartment_services: 'خدمات شقة',
  child_expenses: 'مصروف طفل',
  emergency: 'طوارئ',
  subscriptions: 'اشتراكات',
  phone_recharge: 'شحن هاتف',
  food: 'طعام وشراب',
  housing: 'سكن وإيجار',
  transport: 'مواصلات',
  utilities: 'فواتير ومرافق',
  health: 'صحة وطب',
  education: 'تعليم',
  entertainment: 'ترفيه',
  shopping: 'تسوق وملابس',
  savings: 'مدخرات',
  investment: 'استثمار',
  charity: 'تبرعات وصدقات',
  family: 'أسرة وأطفال',
  personal: 'مصروف شخصي',
  outings: 'خروجات',
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

    const topExpensesList = [...transactions]
      .filter(t => t.type === 'expense')
      .sort((a, b) => b.amount - a.amount)
      .slice(0, 20)
      .map(t => {
        const catName = CATEGORY_NAMES[t.category] || t.category;
        return `- ${t.description ? `${t.description} (${catName})` : catName}: ${t.amount.toFixed(2)} جنيه`;
      })
      .join('\n');

    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

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

أهم المعاملات والمصاريف التفصيلية هذا الشهر (مرتبة حسب القيمة تنازلياً):
${topExpensesList || 'لا توجد مصاريف تفصيلية مسجلة'}

المطلوب:
1. تحليل شامل ومحدد للمصاريف والبنود التفصيلية هذا الشهر
2. تحديد أعلى مصادر المصاريف (سواء كانت فئة عامة أو بنداً تفصيلياً معيناً مثل فاتورة كهرباء معينة أو خدمة محددة) وتقييم مدى ضرورتها
3. نصائح عملية ومباشرة لتوفير المال بناءً على الفئات والبنود التفصيلية المحددة أعلاه (مع ذكر أرقام ونسب توفير متوقعة)
4. خطة ترشيد وتوفير مقترحة للشهر القادم
5. توصيات للاستثمار أو الادخار بناءً على الوضع المالي والرصيد المتبقي

اجعل التحليل عملياً ومحدداً وموجهاً بشكل مخصص للبنود المذكورة (مثل أسماء الفواتير والمصاريف الفعلية بدلاً من الاكتفاء بالحديث عن الفئات العامة). استخدم اللغة العربية الفصحى المبسطة بأسلوب ودود ومحفز.`;

    let aiAnalysis = '';
    let quotaExceeded = false;
    
    try {
      const result = await model.generateContent(prompt);
      if (!result || !result.response) {
        throw new Error('فشل الحصول على رد من الذكاء الاصطناعي');
      }
      aiAnalysis = result.response.text();
    } catch (aiError: any) {
      console.error('AI generation error:', aiError?.status, aiError?.message?.substring(0, 200));
      if (aiError?.status === 429 || aiError?.message?.includes('429')) {
        aiAnalysis = '⚠️ خدمة التحليل الذكي غير متاحة حالياً بسبب الوصول للحد الأقصى للاستخدام المجاني. يُرجى المحاولة مرة أخرى لاحقاً أو التواصل مع المدير لتفعيل الخدمة.';
        quotaExceeded = true;
      } else if (aiError?.status === 403 || aiError?.message?.includes('403')) {
        aiAnalysis = '⚠️ خدمة التحليل الذكي تحتاج تفعيل. يُرجى التواصل مع المدير.';
        quotaExceeded = true;
      } else {
        throw aiError; // throw to outer catch
      }
    }

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
      ...(quotaExceeded && { quotaExceeded: true })
    });
  } catch (error: any) {
    console.error('AI route general error:', error);
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
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

    const result = await model.generateContent(
      'أعطني نصيحة مالية عملية قصيرة ومفيدة باللغة العربية (جملة أو جملتين فقط) للمساعدة في إدارة الميزانية الأسرية.'
    );

    res.json({ tip: result.response.text() });
  } catch (error) {
    res.status(500).json({ message: 'حدث خطأ في الخادم' });
  }
});

export default router;
