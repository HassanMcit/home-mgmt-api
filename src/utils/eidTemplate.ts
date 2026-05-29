export const getEidEmailHtml = (name: string): string => {
  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>عيد الأضحى المبارك - مدبّر</title>
  <link href="https://fonts.googleapis.com/css2?family=Cairo:wght@400;600;700;900&display=swap" rel="stylesheet">
  <style>
    body {
      margin: 0; padding: 0;
      font-family: 'Cairo', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
      background-color: #0f0f23;
      -webkit-text-size-adjust: 100%;
    }
    table, td { mso-table-lspace: 0pt; mso-table-rspace: 0pt; }
    img { border: 0; height: auto; outline: none; text-decoration: none; }
    @media only screen and (max-width: 600px) {
      .email-container { width: 100% !important; border-radius: 0 !important; }
      .content-cell { padding: 25px 15px !important; }
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:#0f0f23;">
<div style="background-color:#0f0f23;padding:30px 10px;direction:rtl;" dir="rtl">

  <table class="email-container" cellpadding="0" cellspacing="0" border="0" width="100%" align="center"
    style="max-width:650px;margin:auto;background-color:rgba(15,15,35,0.98);border-radius:20px;border:1px solid #2d2d5e;overflow:hidden;box-shadow:0 10px 30px rgba(0,0,0,0.5);">
    <tr>
      <td class="content-cell" style="padding:40px 30px;color:#e2e8f0;">

        <!-- ── عيد Header ── -->
        <table cellpadding="0" cellspacing="0" border="0" width="100%"
          style="text-align:center;padding-bottom:25px;margin-bottom:5px;">
          <tr>
            <td align="center">
              <!-- Eid Decorative Banner -->
              <div style="background:linear-gradient(135deg,#92400e,#d97706,#fbbf24,#d97706,#92400e);
                          padding:3px;border-radius:18px;margin-bottom:20px;">
                <div style="background:#1a1208;border-radius:16px;padding:25px 20px;">
                  <p style="margin:0;font-size:40px;letter-spacing:8px;">🌙✨🕌✨🌙</p>
                  <h1 style="color:#fbbf24;margin:10px 0 5px;font-size:30px;font-weight:900;
                              font-family:'Cairo',Arial,sans-serif;letter-spacing:-0.5px;">
                    كل عام وأنتم بخير
                  </h1>
                  <h2 style="color:#f59e0b;margin:0;font-size:22px;font-weight:800;
                              font-family:'Cairo',Arial,sans-serif;">
                    عيد الأضحى المبارك 1446 هـ 🐑
                  </h2>
                </div>
              </div>

              <img src="https://ha-smart-home.vercel.app/icon-192x192.png" alt="مدبّر"
                style="width:65px;height:65px;margin-bottom:10px;" />
            </td>
          </tr>
        </table>

        <!-- ── تهنئة شخصية ── -->
        <div style="background:rgba(251,191,36,0.06);border:1px solid rgba(251,191,36,0.2);
                    border-radius:14px;padding:20px 25px;margin-bottom:28px;text-align:right;">
          <p style="font-size:17px;color:#fde68a;font-weight:700;margin:0 0 12px;
                     font-family:'Cairo',Arial,sans-serif;">
            أخي / أختي الكريم/ة ${name} 👋
          </p>
          <p style="font-size:15px;color:#cbd5e1;margin:0;line-height:1.9;
                     font-family:'Cairo',Arial,sans-serif;">
            من فريق <strong style="color:#a5b4fc;">مدبّر</strong> لإدارة المنزل والمالية الأسرية،
            نتقدم إليكم بأحر التهاني وأطيب الأمنيات بمناسبة عيد الأضحى المبارك.
            تقبّل الله منّا ومنكم صالح الأعمال، وجعله عيداً مباركاً علينا وعليكم،
            وأعاده الله عليكم وعلى أسركم الكرام بكل خير ويُسر وصحة وسعادة.
          </p>
          <p style="font-size:14px;color:#94a3b8;margin:12px 0 0;
                     font-family:'Cairo',Arial,sans-serif;font-style:italic;">
            تقبّل الله منّا ومنكم 🤲
          </p>
        </div>

        <hr style="border:0;border-top:1px solid #2d2d5e;margin:5px 0 25px;" />

        <!-- ── قسم الميزات الجديدة ── -->
        <h3 style="color:#ffffff;font-size:18px;font-weight:900;margin:0 0 8px;
                    border-right:4px solid #6366f1;padding-right:12px;
                    font-family:'Cairo',Arial,sans-serif;">
          🎁 هدية العيد — ميزات جديدة في مدبّر!
        </h3>
        <p style="color:#94a3b8;font-size:13px;margin:0 0 20px;font-family:'Cairo',Arial,sans-serif;">
          بمناسبة العيد المبارك، يسعدنا إعلامكم بمجموعة من الإضافات والتحسينات الجديدة
          التي تم تطويرها خصيصاً لتجعل تجربتكم مع مدبّر أكثر سهولة واحترافية:
        </p>

        <!-- Feature 1: Multi-bank accounts -->
        <div style="background:rgba(99,102,241,0.07);border:1px solid rgba(99,102,241,0.2);
                    border-radius:13px;padding:18px 20px;margin-bottom:15px;text-align:right;">
          <h4 style="color:#818cf8;margin:0 0 8px;font-size:15px;font-weight:800;
                      font-family:'Cairo',Arial,sans-serif;">
            🏦 1. حسابات بنكية متعددة لنفس البنك
          </h4>
          <p style="color:#cbd5e1;font-size:13px;margin:0 0 8px;line-height:1.7;
                     font-family:'Cairo',Arial,sans-serif;">
            يمكنك الآن إضافة أكثر من حساب لنفس البنك. مثلاً: حساب جاري + شهادة ادخار في البنك الأهلي في نفس الوقت.
          </p>
          <p style="color:#6366f1;font-size:12px;font-weight:700;margin:0;
                     font-family:'Cairo',Arial,sans-serif;">
            💡 الفائدة: تتبع كل حساباتك منفصلةً بدقة تامة دون خلط في الأرصدة.
          </p>
        </div>

        <!-- Feature 2: Edit accounts -->
        <div style="background:rgba(16,185,129,0.06);border:1px solid rgba(16,185,129,0.15);
                    border-radius:13px;padding:18px 20px;margin-bottom:15px;text-align:right;">
          <h4 style="color:#34d399;margin:0 0 8px;font-size:15px;font-weight:800;
                      font-family:'Cairo',Arial,sans-serif;">
            ✏️ 2. تعديل بيانات الحسابات
          </h4>
          <p style="color:#cbd5e1;font-size:13px;margin:0 0 8px;line-height:1.7;
                     font-family:'Cairo',Arial,sans-serif;">
            الآن بجانب زر الحذف 🗑️ ستجد زر التعديل ✏️. يمكنك تغيير اسم البنك، رقم الحساب، الـ IBAN، الرصيد، نوع الحساب،
            وبيانات الوديعة (الفائدة السنوية + يوم الصرف) في أي وقت.
          </p>
          <p style="color:#10b981;font-size:12px;font-weight:700;margin:0;
                     font-family:'Cairo',Arial,sans-serif;">
            💡 الفائدة: لا داعي لحذف الحساب وإعادة إنشائه عند تغيير أي بيانات.
          </p>
        </div>

        <!-- Feature 3: Account details page -->
        <div style="background:rgba(245,158,11,0.06);border:1px solid rgba(245,158,11,0.15);
                    border-radius:13px;padding:18px 20px;margin-bottom:15px;text-align:right;">
          <h4 style="color:#fbbf24;margin:0 0 8px;font-size:15px;font-weight:800;
                      font-family:'Cairo',Arial,sans-serif;">
            📋 3. صفحة تفاصيل الحساب المخصصة
          </h4>
          <p style="color:#cbd5e1;font-size:13px;margin:0 0 8px;line-height:1.7;
                     font-family:'Cairo',Arial,sans-serif;">
            اضغط على أي حساب بنكي في الصفحة الرئيسية وستنتقل لصفحة مخصصة تعرض:
            كشف كامل لجميع حركات هذا الحساب، إجمالي الإيداعات والسحوبات، وأرقام الحساب والـ IBAN بشكل واضح مع إمكانية النسخ.
          </p>
          <p style="color:#f59e0b;font-size:12px;font-weight:700;margin:0;
                     font-family:'Cairo',Arial,sans-serif;">
            💡 الفائدة: كشف حساب فوري لأي بنك دون الحاجة للتواصل مع البنك.
          </p>
        </div>

        <!-- Feature 4: Transfer -->
        <div style="background:rgba(139,92,246,0.06);border:1px solid rgba(139,92,246,0.15);
                    border-radius:13px;padding:18px 20px;margin-bottom:15px;text-align:right;">
          <h4 style="color:#c084fc;margin:0 0 8px;font-size:15px;font-weight:800;
                      font-family:'Cairo',Arial,sans-serif;">
            ↔️ 4. التحويل بين الحسابات
          </h4>
          <p style="color:#cbd5e1;font-size:13px;margin:0 0 8px;line-height:1.7;
                     font-family:'Cairo',Arial,sans-serif;">
            في صفحة المعاملات، أضفنا خيار "تحويل بين الحسابات". اختر الحساب المُرسِل والمستقبِل والمبلغ،
            وسيقوم النظام تلقائياً بخصم المبلغ من الأول وإضافته للثاني.
          </p>
          <p style="color:#8b5cf6;font-size:12px;font-weight:700;margin:0;
                     font-family:'Cairo',Arial,sans-serif;">
            💡 الفائدة: تتبع التحويلات بين البنك الأهلي، والمحفظة، والكاش بضغطة واحدة.
          </p>
        </div>

        <!-- Feature 5: Wallets & bill payment -->
        <div style="background:rgba(239,68,68,0.06);border:1px solid rgba(239,68,68,0.12);
                    border-radius:13px;padding:18px 20px;margin-bottom:25px;text-align:right;">
          <h4 style="color:#fca5a5;margin:0 0 8px;font-size:15px;font-weight:800;
                      font-family:'Cairo',Arial,sans-serif;">
            💳 5. دفع الفواتير من أي حساب + المحافظ الإلكترونية
          </h4>
          <p style="color:#cbd5e1;font-size:13px;margin:0 0 8px;line-height:1.7;
                     font-family:'Cairo',Arial,sans-serif;">
            عند دفع فاتورة، سيسألك النظام من أي حساب تريد الدفع (بنك محدد / كاش / محفظة إلكترونية).
            كما تم إضافة دعم كامل للمحافظ الإلكترونية: فودافون كاش، أورانج كاش، اتصالات كاش، وي باي.
          </p>
          <p style="color:#ef4444;font-size:12px;font-weight:700;margin:0;
                     font-family:'Cairo',Arial,sans-serif;">
            💡 الفائدة: معرفة دقيقة لأي حساب يتأثر عند دفع كل فاتورة.
          </p>
        </div>

        <!-- ── كيفية الاستخدام ── -->
        <div style="background:rgba(99,102,241,0.04);border:1px solid rgba(99,102,241,0.12);
                    border-radius:13px;padding:18px 20px;margin-bottom:25px;text-align:right;">
          <h4 style="color:#a5b4fc;margin:0 0 12px;font-size:15px;font-weight:800;
                      font-family:'Cairo',Arial,sans-serif;">
            🚀 كيف تجرب الميزات الجديدة الآن؟
          </h4>
          <ol style="margin:0;padding-right:20px;color:#94a3b8;font-size:13px;
                      line-height:1.9;font-family:'Cairo',Arial,sans-serif;">
            <li>سجّل الدخول لحسابك في مدبّر.</li>
            <li>من الصفحة الرئيسية، اضغط على <strong style="color:#e2e8f0;">"إضافة حساب"</strong> لإضافة حساب بنكي جديد.</li>
            <li>اضغط على أي حساب موجود لعرض صفحة تفاصيله الكاملة.</li>
            <li>استخدم زر ✏️ بجانب الحساب لتعديل أي بيانات.</li>
            <li>في صفحة المعاملات، جرّب خيار <strong style="color:#e2e8f0;">"تحويل بين الحسابات"</strong>.</li>
          </ol>
        </div>

        <!-- CTA Button -->
        <div style="text-align:center;margin:30px 0 25px;">
          <a href="https://ha-smart-home.vercel.app/login"
            style="background:linear-gradient(135deg,#6366f1,#8b5cf6);color:#ffffff;
                    padding:15px 45px;border-radius:14px;text-decoration:none;
                    font-weight:900;font-size:16px;display:inline-block;
                    box-shadow:0 10px 25px rgba(99,102,241,0.4);
                    font-family:'Cairo',Arial,sans-serif;">
            دخول مدبّر وتجربة الجديد 🚀
          </a>
        </div>

        <hr style="border:0;border-top:1px solid #2d2d5e;margin:25px 0 20px;" />

        <!-- Footer -->
        <div style="text-align:center;">
          <p style="color:#fbbf24;font-size:16px;font-weight:800;margin:0 0 8px;
                     font-family:'Cairo',Arial,sans-serif;">
            🌙 عيدكم مبارك وعساكم من عواده 🌙
          </p>
          <p style="color:#64748b;font-size:12px;margin:0;line-height:1.6;
                     font-family:'Cairo',Arial,sans-serif;">
            فريق مدبّر لإدارة المنزل والمالية الأسرية<br/>
            يرجى عدم الرد على هذه الرسالة — هذا البريد مُرسَل آلياً.
          </p>
        </div>

      </td>
    </tr>
  </table>
</div>
</body>
</html>`;
};
