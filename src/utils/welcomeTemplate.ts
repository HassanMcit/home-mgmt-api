export const getWelcomeEmailHtml = (name: string): string => {
  return `
    <div dir="rtl" style="font-family: 'Cairo', Arial, sans-serif; background-color: #0f0f23; padding: 30px 10px; min-height: 100%;">
      <!-- Outer Table wrapper with background image attribute for maximum email client compatibility (iCloud, Gmail, Outlook) -->
      <table cellpadding="0" cellspacing="0" border="0" width="100%" max-width="650" align="center" background="https://ha-smart-home.vercel.app/icon-512x512.png" style="max-width: 650px; margin: auto; background-image: url('https://ha-smart-home.vercel.app/icon-512x512.png'); background-repeat: no-repeat; background-position: center 300px; background-size: 320px; border-radius: 20px; border: 1px solid #2d2d5e; border-collapse: collapse; overflow: hidden; box-shadow: 0 10px 30px rgba(0,0,0,0.5);">
        <tr>
          <!-- Semi-transparent overlay to ensure text readability over the background logo -->
          <td style="background-color: rgba(15, 15, 35, 0.95); padding: 35px 25px; color: #e2e8f0;">
            
            <!-- Header Logo & Greeting -->
            <table cellpadding="0" cellspacing="0" border="0" width="100%" style="text-align: center; border-bottom: 1px solid #2d2d5e; padding-bottom: 25px; margin-bottom: 30px;">
              <tr>
                <td align="center">
                  <img src="https://ha-smart-home.vercel.app/icon-192x192.png" alt="مدبّر" style="width: 80px; height: 80px; margin-bottom: 15px;" />
                  <h1 style="color: #6366f1; margin: 0; font-size: 28px; font-weight: 900; letter-spacing: -0.5px;">عائلة مدبّر ترحب بك! 🎉</h1>
                </td>
              </tr>
            </table>

            <!-- Warm Greeting -->
            <div style="margin-bottom: 25px; line-height: 1.8;">
              <p style="font-size: 18px; font-weight: bold; color: #ffffff; margin-top: 0; margin-bottom: 10px;">السلام عليكم ورحمة الله وبركاته،</p>
              <p style="font-size: 16px; color: #cbd5e1; margin: 0;">
                أسعد الله صباحكم ويومكم بالخير والبركات والرزق الوفير. نسأل الله أن يبارك في أوقاتكم وأموالكم وأن يجعل هذا النظام عوناً لكم على إدارة حياتكم المالية بيسر وبركة.
              </p>
              <p style="font-size: 15px; color: #a5b4fc; font-weight: bold; margin-top: 15px;">
                تم تفعيل حسابك بنجاح يا ${name}! يمكنك الآن استخدام كافة مميزات نظام "مدبّر" المتكامل.
              </p>
            </div>

            <hr style="border: 0; border-top: 1px solid #2d2d5e; margin: 25px 0;" />

            <!-- Detailed Feature Guide -->
            <h2 style="color: #ffffff; font-size: 20px; font-weight: 800; margin-top: 0; margin-bottom: 25px; border-right: 4px solid #6366f1; padding-right: 10px;">💡 دليل استخدام النظام والخطوات التفصيلية:</h2>

            <!-- Step 1 -->
            <div style="background-color: rgba(99, 102, 241, 0.05); border: 1px solid rgba(99, 102, 241, 0.1); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
              <h3 style="color: #818cf8; margin-top: 0; margin-bottom: 10px; font-size: 16px; font-weight: 700;">1. تسجيل المعاملات المالية (الدخل والمصروفات) 💰</h3>
              <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 10px 0; line-height: 1.6;">تتبع أين تذهب أموالك بدقة لتتمكن من ترشيد الاستهلاك.</p>
              <strong style="color: #ffffff; font-size: 13px;">الخطوات:</strong>
              <ol style="margin: 5px 0 0 0; padding-right: 20px; color: #94a3b8; font-size: 13px; line-height: 1.6;">
                <li>ادخل إلى صفحة "المعاملات" من القائمة الجانبية.</li>
                <li>انقر على زر "إضافة معاملة" بالأعلى.</li>
                <li>اختر نوع المعاملة (مصروف 🔴 أو إيراد 🟢).</li>
                <li>حدد المبلغ، واختر الفئة المناسبة (مواصلات، طعام، إلخ)، واكتب وصفاً بسيطاً، ثم احفظ.</li>
                <li>يمكنك تعديل أي معاملة لاحقاً بالضغط على زر القلم ✏️ أو حذفها 🗑️.</li>
              </ol>
            </div>

            <!-- Step 2 -->
            <div style="background-color: rgba(245, 158, 11, 0.05); border: 1px solid rgba(245, 158, 11, 0.1); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
              <h3 style="color: #fbbf24; margin-top: 0; margin-bottom: 10px; font-size: 16px; font-weight: 700;">2. الفواتير والالتزامات الشهرية 📄</h3>
              <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 10px 0; line-height: 1.6;">تجنب قطع الخدمات أو دفع غرامات التأخير بتسجيل فواتيرك.</p>
              <strong style="color: #ffffff; font-size: 13px;">الخطوات:</strong>
              <ol style="margin: 5px 0 0 0; padding-right: 20px; color: #94a3b8; font-size: 13px; line-height: 1.6;">
                <li>اذهب إلى قسم "الفواتير".</li>
                <li>اضغط "إضافة فاتورة" واكتب الاسم (مثل كهرباء، إنترنت)، والمبلغ، وتاريخ الاستحقاق.</li>
                <li>اختر إذا كانت الفاتورة متكررة شهرياً ليتم إنشاؤها تلقائياً كل شهر.</li>
                <li>عند السداد، اضغط على زر الدائرة ليتم وضع علامة "مدفوعة" 🎉.</li>
              </ol>
            </div>

            <!-- Step 3 -->
            <div style="background-color: rgba(16, 185, 129, 0.05); border: 1px solid rgba(16, 185, 129, 0.1); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
              <h3 style="color: #34d399; margin-top: 0; margin-bottom: 10px; font-size: 16px; font-weight: 700;">3. أهداف الادخار وتجميع المال 🛢️</h3>
              <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 10px 0; line-height: 1.6;">خطط للمستقبل، اشترِ سيارة، أو وفر المال لرحلة عائلية.</p>
              <strong style="color: #ffffff; font-size: 13px;">الخطوات:</strong>
              <ol style="margin: 5px 0 0 0; padding-right: 20px; color: #94a3b8; font-size: 13px; line-height: 1.6;">
                <li>ادخل إلى صفحة "الادخار".</li>
                <li>انقر "هدف جديد" وحدد اسم الهدف، والمبلغ المطلوب جمعه، ولون الكارت.</li>
                <li>كلما توفر لديك فائض مالي، اضغط على "+ إضافة مبلغ" لتغذية هدفك تدريجياً ومتابعة نسبة الإنجاز 📈.</li>
              </ol>
            </div>

            <!-- Step 4 -->
            <div style="background-color: rgba(99, 102, 241, 0.05); border: 1px solid rgba(99, 102, 241, 0.1); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
              <h3 style="color: #818cf8; margin-top: 0; margin-bottom: 10px; font-size: 16px; font-weight: 700;">4. تحديد الميزانيات الشهرية 🎯</h3>
              <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 10px 0; line-height: 1.6;">ضع حداً أقصى للمصاريف في فئة معينة لتجنب تجاوز الميزانية المحددة.</p>
              <strong style="color: #ffffff; font-size: 13px;">الخطوات:</strong>
              <ol style="margin: 5px 0 0 0; padding-right: 20px; color: #94a3b8; font-size: 13px; line-height: 1.6;">
                <li>اذهب لصفحة "الميزانية".</li>
                <li>اضغط "إضافة ميزانية" واختر الفئة والمبلغ الأقصى المسموح بصرفه شهرياً.</li>
                <li>سيقوم النظام تلقائياً بحساب وتحديث ما تم صرفه وعرض مؤشر النسبة، وسيحذرك باللون البرتقالي والأحمر عند الاقتراب من تجاوز الحد!</li>
              </ol>
            </div>

            <!-- Step 5 -->
            <div style="background-color: rgba(239, 68, 68, 0.05); border: 1px solid rgba(239, 68, 68, 0.1); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
              <h3 style="color: #fca5a5; margin-top: 0; margin-bottom: 10px; font-size: 16px; font-weight: 700;">5. ذكّرني والمهام (مع تنبيهات البريد) 🔔</h3>
              <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 10px 0; line-height: 1.6;">سجل مهامك اليومية أو مواعيد الصيانة واستقبل تنبيهات بريدية آلياً.</p>
              <strong style="color: #ffffff; font-size: 13px;">الخطوات:</strong>
              <ol style="margin: 5px 0 0 0; padding-right: 20px; color: #94a3b8; font-size: 13px; line-height: 1.6;">
                <li>ادخل على صفحة "ذكّرني".</li>
                <li>اضغط "إضافة تذكير جديد" واكتب العنوان، التفاصيل، الأولوية، ووقت التنبيه.</li>
                <li>سيقوم النظام بإرسال بريد إلكتروني تلقائي لتذكيرك بالمهمة فور حلول الوقت المحدد ✉️.</li>
              </ol>
            </div>

            <!-- Step 6 -->
            <div style="background-color: rgba(139, 92, 246, 0.05); border: 1px solid rgba(139, 92, 246, 0.1); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
              <h3 style="color: #c084fc; margin-top: 0; margin-bottom: 10px; font-size: 16px; font-weight: 700;">6. المستشار المالي بالذكاء الاصطناعي (AI) 🤖</h3>
              <p style="color: #cbd5e1; font-size: 14px; margin: 0 0 10px 0; line-height: 1.6;">احصل على تحليل عميق ومخصص لكافة بنود صرفك ودخلك الشهري.</p>
              <strong style="color: #ffffff; font-size: 13px;">الخطوات:</strong>
              <ol style="margin: 5px 0 0 0; padding-right: 20px; color: #94a3b8; font-size: 13px; line-height: 1.6;">
                <li>اذهب لقسم "التحليل الذكي".</li>
                <li>اضغط على "طلب تحليل مالي ذكي" ليقوم الذكاء الاصطناعي بدراسة معاملاتك وتقديم خطة ترشيد مخصصة وتوصيات للاستثمار والادخار بناءً على بياناتك الفعلية!</li>
              </ol>
            </div>

            <div style="text-align: center; margin-top: 35px; margin-bottom: 20px;">
              <a href="https://ha-smart-home.vercel.app/login" style="background-color: #6366f1; color: #ffffff; padding: 14px 40px; border-radius: 12px; text-decoration: none; font-weight: bold; font-size: 16px; display: inline-block; box-shadow: 0 10px 15px -3px rgba(99, 102, 241, 0.3);">تسجيل الدخول وبدء الاستخدام 🚀</a>
            </div>

            <hr style="border: 0; border-top: 1px solid #2d2d5e; margin: 30px 0 20px 0;" />

            <p style="text-align: center; color: #64748b; font-size: 12px; margin: 0; line-height: 1.5;">
              هذا البريد مرسل آلياً من نظام مدبّر لإدارة المنزل والمالية الأسرية.<br />
              يرجى عدم الرد على هذه الرسالة.
            </p>

          </td>
        </tr>
      </table>
    </div>
  `;
};
