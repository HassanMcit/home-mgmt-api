export const getWelcomeEmailHtml = (name: string): string => {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>دليل استخدام نظام مدبّر</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0;
      padding: 0;
      font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #0f0f23;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    table, td {
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      -ms-interpolation-mode: bicubic;
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
    }
    @media only screen and (max-width: 600px) {
      .email-container {
        width: 100% !important;
        max-width: 100% !important;
        border-radius: 0 !important;
        border: none !important;
      }
      .content-cell {
        padding: 25px 15px !important;
      }
      .title-text {
        font-size: 22px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #0f0f23; min-height: 100%;">
  <div style="background-color: #0f0f23; padding: 30px 10px; min-height: 100%; direction: rtl;" dir="rtl">
    
    <!-- Outer Table wrapper with background image attribute for maximum email client compatibility (iCloud, Gmail, Outlook) -->
    <table class="email-container" cellpadding="0" cellspacing="0" border="0" width="100%" max-width="650" align="center" background="https://ha-smart-home.vercel.app/icon-512x512.png" style="max-width: 650px; margin: auto; background-image: url('https://ha-smart-home.vercel.app/icon-512x512.png'); background-repeat: no-repeat; background-position: center 350px; background-size: 300px; border-radius: 20px; border: 1px solid #2d2d5e; border-collapse: collapse; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
      <tr>
        <!-- Semi-transparent overlay to ensure text readability over the background logo -->
        <td class="content-cell" style="background-color: rgba(15, 15, 35, 0.96); padding: 40px 30px; color: #e2e8f0;">
          
          <!-- Header Logo & Title -->
          <table cellpadding="0" cellspacing="0" border="0" width="100%" style="text-align: center; border-bottom: 1px solid #2d2d5e; padding-bottom: 25px; margin-bottom: 30px;">
            <tr>
              <td align="center">
                <img src="https://ha-smart-home.vercel.app/icon-192x192.png" alt="مدبّر" style="width: 80px; height: 80px; margin-bottom: 15px;" />
                <h1 class="title-text" style="color: #6366f1; margin: 0; font-size: 26px; font-weight: 900; letter-spacing: -0.5px; font-family: 'Cairo', Arial, sans-serif;">عائلة مدبّر ترحب بك! 🎉</h1>
              </td>
            </tr>
          </table>

          <!-- Warm Greeting -->
          <div style="margin-bottom: 30px; line-height: 1.8; text-align: right;">
            <h2 style="color: #fbbf24; margin-top: 0; margin-bottom: 15px; font-size: 20px; font-weight: 800; text-align: center; font-family: 'Cairo', Arial, sans-serif;">
              ☀️ صبحكم الله بالخير والبركات والمسرات ☀️
            </h2>
            <p style="font-size: 16px; color: #cbd5e1; margin: 0; font-family: 'Cairo', Arial, sans-serif;">
              السلام عليكم ورحمة الله وبركاته، نسأل الله أن يبارك في أوقاتكم وأرزقكم وأن يجعل هذا النظام عوناً لكم على إدارة حياتكم المالية بيسر وبركة وطمأنينة.
            </p>
            <p style="font-size: 15px; color: #a5b4fc; font-weight: bold; margin-top: 15px; font-family: 'Cairo', Arial, sans-serif;">
              تم تفعيل حسابك بنجاح يا ${name}! يمكنك الآن الاستفادة من كافة أدوات وميزات نظام "مدبّر" المتكامل.
            </p>
          </div>

          <hr style="border: 0; border-top: 1px solid #2d2d5e; margin: 25px 0;" />

          <!-- Detailed Feature Guide -->
          <h3 style="color: #ffffff; font-size: 18px; font-weight: 800; margin-top: 0; margin-bottom: 25px; border-right: 4px solid #6366f1; padding-right: 10px; font-family: 'Cairo', Arial, sans-serif; text-align: right;">💡 دليل استخدام النظام والخطوات التفصيلية (الكلام مرتب تحت بعضه):</h3>

          <!-- Step 1 -->
          <div style="background-color: rgba(99, 102, 241, 0.04); border: 1px solid rgba(99, 102, 241, 0.1); padding: 20px; border-radius: 12px; margin-bottom: 20px; text-align: right;">
            <h4 style="color: #818cf8; margin-top: 0; margin-bottom: 8px; font-size: 16px; font-weight: 700; font-family: 'Cairo', Arial, sans-serif;">1. تسجيل المعاملات المالية (الدخل والمصروفات) 💰</h4>
            <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 12px 0; line-height: 1.6; font-family: 'Cairo', Arial, sans-serif;">تتبع أين تذهب أموالك بدقة لتتمكن من ترشيد الاستهلاك اليومي.</p>
            <strong style="color: #ffffff; font-size: 13px; font-family: 'Cairo', Arial, sans-serif;">الخطوات:</strong>
            <ol style="margin: 8px 0 0 0; padding-right: 20px; color: #94a3b8; font-size: 13px; line-height: 1.7; font-family: 'Cairo', Arial, sans-serif;">
              <li style="margin-bottom: 4px;">ادخل إلى صفحة "المعاملات" من القائمة الجانبية.</li>
              <li style="margin-bottom: 4px;">انقر على زر "إضافة معاملة" بالأعلى.</li>
              <li style="margin-bottom: 4px;">اختر نوع المعاملة (مصروف 🔴 أو إيراد 🟢).</li>
              <li style="margin-bottom: 4px;">حدد المبلغ، واختر الفئة المناسبة (مواصلات، طعام، إلخ)، واكتب وصفاً بسيطاً، ثم احفظ.</li>
              <li style="margin-bottom: 0;">يمكنك تعديل أي معاملة لاحقاً بالضغط على زر القلم ✏️ أو حذفها نهائياً 🗑️.</li>
            </ol>
          </div>

          <!-- Step 2 -->
          <div style="background-color: rgba(245, 158, 11, 0.04); border: 1px solid rgba(245, 158, 11, 0.1); padding: 20px; border-radius: 12px; margin-bottom: 20px; text-align: right;">
            <h4 style="color: #fbbf24; margin-top: 0; margin-bottom: 8px; font-size: 16px; font-weight: 700; font-family: 'Cairo', Arial, sans-serif;">2. الفواتير والالتزامات الشهرية 📄</h4>
            <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 12px 0; line-height: 1.6; font-family: 'Cairo', Arial, sans-serif;">تجنب انقطاع الخدمات أو دفع غرامات التأخير بتسجيل فواتيرك وتذكيرك بها.</p>
            <strong style="color: #ffffff; font-size: 13px; font-family: 'Cairo', Arial, sans-serif;">الخطوات:</strong>
            <ol style="margin: 8px 0 0 0; padding-right: 20px; color: #94a3b8; font-size: 13px; line-height: 1.7; font-family: 'Cairo', Arial, sans-serif;">
              <li style="margin-bottom: 4px;">اذهب إلى قسم "الفواتير" من القائمة الجانبية.</li>
              <li style="margin-bottom: 4px;">اضغط "إضافة فاتورة" واكتب الاسم (مثل كهرباء، إنترنت)، والمبلغ، وتاريخ الاستحقاق.</li>
              <li style="margin-bottom: 4px;">اختر إذا كانت الفاتورة متكررة شهرياً ليتم إنشاؤها تلقائياً مع بداية كل شهر.</li>
              <li style="margin-bottom: 0;">عند السداد الفعلي للفاتورة، اضغط على زر الدائرة ليتم تمييزها كـ "مدفوعة" 🎉.</li>
            </ol>
          </div>

          <!-- Step 3 -->
          <div style="background-color: rgba(16, 185, 129, 0.04); border: 1px solid rgba(16, 185, 129, 0.1); padding: 20px; border-radius: 12px; margin-bottom: 20px; text-align: right;">
            <h4 style="color: #34d399; margin-top: 0; margin-bottom: 8px; font-size: 16px; font-weight: 700; font-family: 'Cairo', Arial, sans-serif;">3. أهداف الادخار وتجميع المال 🎯</h4>
            <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 12px 0; line-height: 1.6; font-family: 'Cairo', Arial, sans-serif;">خطط للمستقبل، وفر لشراء شيء محدد، أو للرحلات الصيفية.</p>
            <strong style="color: #ffffff; font-size: 13px; font-family: 'Cairo', Arial, sans-serif;">الخطوات:</strong>
            <ol style="margin: 8px 0 0 0; padding-right: 20px; color: #94a3b8; font-size: 13px; line-height: 1.7; font-family: 'Cairo', Arial, sans-serif;">
              <li style="margin-bottom: 4px;">ادخل إلى صفحة "الادخار" من القائمة الجانبية.</li>
              <li style="margin-bottom: 4px;">انقر "هدف جديد" وحدد اسم الهدف، والمبلغ المستهدف، ولون الكارت المفضل.</li>
              <li style="margin-bottom: 0;">كلما توفر لديك فائض مالي، اضغط على "+ إضافة مبلغ" لتغذية هدفك تدريجياً ومتابعة شريط التقدم 📈.</li>
            </ol>
          </div>

          <!-- Step 4 -->
          <div style="background-color: rgba(99, 102, 241, 0.04); border: 1px solid rgba(99, 102, 241, 0.1); padding: 20px; border-radius: 12px; margin-bottom: 20px; text-align: right;">
            <h4 style="color: #818cf8; margin-top: 0; margin-bottom: 8px; font-size: 16px; font-weight: 700; font-family: 'Cairo', Arial, sans-serif;">4. تحديد الميزانيات الشهرية (بودجيت) 📊</h4>
            <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 12px 0; line-height: 1.6; font-family: 'Cairo', Arial, sans-serif;">ضع حداً أقصى للمصاريف في فئة معينة لتجنب تجاوز الميزانية المحددة.</p>
            <strong style="color: #ffffff; font-size: 13px; font-family: 'Cairo', Arial, sans-serif;">الخطوات:</strong>
            <ol style="margin: 8px 0 0 0; padding-right: 20px; color: #94a3b8; font-size: 13px; line-height: 1.7; font-family: 'Cairo', Arial, sans-serif;">
              <li style="margin-bottom: 4px;">اذهب لصفحة "الميزانية" من القائمة الجانبية.</li>
              <li style="margin-bottom: 4px;">اضغط "إضافة ميزانية" واختر الفئة والمبلغ الأقصى المسموح بصرفه شهرياً.</li>
              <li style="margin-bottom: 0;">سيقوم النظام تلقائياً بحساب ما تم صرفه وعرض مؤشر النسبة، وسيحذرك باللون البرتقالي والأحمر عند الاقتراب من تجاوز الحد!</li>
            </ol>
          </div>

          <!-- Step 5 -->
          <div style="background-color: rgba(239, 68, 68, 0.04); border: 1px solid rgba(239, 68, 68, 0.1); padding: 20px; border-radius: 12px; margin-bottom: 20px; text-align: right;">
            <h4 style="color: #fca5a5; margin-top: 0; margin-bottom: 8px; font-size: 16px; font-weight: 700; font-family: 'Cairo', Arial, sans-serif;">5. ذكّرني والمهام (مع تنبيهات البريد) 🔔</h4>
            <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 12px 0; line-height: 1.6; font-family: 'Cairo', Arial, sans-serif;">سجل مهامك الهامة، مواعيد صيانة المنزل، أو موعد طبيب، واستقبل تذكيراً بريدياً.</p>
            <strong style="color: #ffffff; font-size: 13px; font-family: 'Cairo', Arial, sans-serif;">الخطوات:</strong>
            <ol style="margin: 8px 0 0 0; padding-right: 20px; color: #94a3b8; font-size: 13px; line-height: 1.7; font-family: 'Cairo', Arial, sans-serif;">
              <li style="margin-bottom: 4px;">ادخل على صفحة "ذكّرني".</li>
              <li style="margin-bottom: 4px;">اضغط "إضافة تذكير جديد" واكتب العنوان، التفاصيل، درجة الأولوية، ووقت التنبيه.</li>
              <li style="margin-bottom: 0;">سيقوم النظام بإرسال بريد إلكتروني تلقائي لتذكيرك بالمهمة فور حلول الوقت المحدد ✉️.</li>
            </ol>
          </div>

          <!-- Step 6 -->
          <div style="background-color: rgba(139, 92, 246, 0.04); border: 1px solid rgba(139, 92, 246, 0.1); padding: 20px; border-radius: 12px; margin-bottom: 20px; text-align: right;">
            <h4 style="color: #c084fc; margin-top: 0; margin-bottom: 8px; font-size: 16px; font-weight: 700; font-family: 'Cairo', Arial, sans-serif;">6. المستشار المالي بالذكاء الاصطناعي (AI) 🤖</h4>
            <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 12px 0; line-height: 1.6; font-family: 'Cairo', Arial, sans-serif;">احصل على تحليل عميق وتوصيات ذكية مخصصة لنشاطك المالي.</p>
            <strong style="color: #ffffff; font-size: 13px; font-family: 'Cairo', Arial, sans-serif;">الخطوات:</strong>
            <ol style="margin: 8px 0 0 0; padding-right: 20px; color: #94a3b8; font-size: 13px; line-height: 1.7; font-family: 'Cairo', Arial, sans-serif;">
              <li style="margin-bottom: 4px;">اذهب لقسم "التحليل الذكي" من القائمة الجانبية.</li>
              <li style="margin-bottom: 0;">اضغط على "طلب تحليل مالي ذكي" ليقوم الذكاء الاصطناعي بدراسة معاملاتك وتقديم خطة ترشيد مخصصة وتوصيات عملية لزيادة ادخارك 📈.</li>
            </ol>
          </div>

          <div style="text-align: center; margin-top: 35px; margin-bottom: 20px;">
            <a href="https://ha-smart-home.vercel.app/login" style="background-color: #6366f1; color: #ffffff; padding: 14px 40px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3); font-family: 'Cairo', Arial, sans-serif;">تسجيل الدخول وبدء الاستخدام 🚀</a>
          </div>

          <hr style="border: 0; border-top: 1px solid #2d2d5e; margin: 30px 0 20px 0;" />

          <p style="text-align: center; color: #64748b; font-size: 12px; margin: 0; line-height: 1.5; font-family: 'Cairo', Arial, sans-serif;">
            هذا البريد مرسل آلياً من نظام مدبّر لإدارة المنزل والمالية الأسرية.<br />
            يرجى عدم الرد على هذه الرسالة.
          </p>

        </td>
      </tr>
    </table>
  </div>
</body>
</html>
`;
};
