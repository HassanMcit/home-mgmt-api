import { sendEmail } from '../utils/mailer';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const users = await prisma.user.findMany();
  
  const htmlContent = `
    <div dir="rtl" style="font-family: 'Cairo', sans-serif; background-color: #f8fafc; padding: 20px; border-radius: 15px; max-width: 600px; margin: auto;">
      <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 30px; border-radius: 20px; text-align: center; color: white; margin-bottom: 20px;">
        <h1 style="margin: 0; font-size: 26px;">🎉 ميزة جديدة في مدبّر: ذكّرني</h1>
        <p style="opacity: 0.9; margin-top: 10px; font-size: 16px;">لأن وقتك غالي، ضفنا ميزة هتساعدك ترتب مهامك</p>
      </div>

      <div style="background: white; padding: 25px; border-radius: 15px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        <h2 style="color: #1e293b; margin-top: 0;">إيه هي ميزة "ذكّرني"؟ 🤔</h2>
        <p style="color: #475569; line-height: 1.6;">
          ميزة <strong>"ذكّرني"</strong> هي عبارة عن قائمة مهام (To-Do List) متطورة جوه نظام مدبّر. 
          بتسمحلك تضيف أي مهمة أو حاجة عايز تفتكرها، وتحدد وقت معين عشان النظام يبعتلك إيميل يفكرك بيها.
        </p>

        <h3 style="color: #4f46e5; margin-top: 20px;">مميزات الإضافة الجديدة: ✨</h3>
        <ul style="color: #475569; line-height: 1.8;">
          <li>📝 <strong>إضافة مهام وتفاصيلها:</strong> تقدر تكتب المهمة وأي ملاحظات عليها.</li>
          <li>⏰ <strong>تنبيهات بالإيميل:</strong> حدد وقت معين وهيوصلك إيميل فوراً يفكرك.</li>
          <li>🎯 <strong>تحديد الأولوية:</strong> رتب مهامك (عالية، متوسطة، منخفضة) عشان تعرف تبدأ بإيه.</li>
          <li>✅ <strong>تتبع الإنجاز:</strong> علم على المهام اللي خلصت عشان تحس بالإنجاز.</li>
        </ul>

        <div style="margin-top: 30px; padding: 15px; background: #eff6ff; border-radius: 10px; border-right: 4px solid #3b82f6;">
          <h4 style="margin: 0 0 10px 0; color: #1e40af;">ليه ضفنا الميزة دي؟ (لازمتها) 💡</h4>
          <p style="margin: 0; color: #3b82f6; line-height: 1.6;">
            إدارة البيت والفلوس محتاجة تركيز، وساعات كتير بننسى ندفع فاتورة معينة أو نخلص مشوار مهم. 
            الميزة دي بتشتغل كمساعد شخصي بيفكرك بكل حاجة في وقتها عشان تشيل من دماغك وتخليك مركز في الأهم!
          </p>
        </div>
        
        <div style="margin-top: 30px; text-align: center;">
          <a href="http://localhost:3000/dashboard/reminders" style="display: inline-block; padding: 12px 25px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 10px; font-weight: bold;">جربها دلوقتي! 🚀</a>
        </div>
      </div>
      
      <p style="text-align: center; color: #94a3b8; font-size: 12px; margin-top: 20px;">
        شكراً لاستخدامك نظام مدبّر ❤️
      </p>
    </div>
  `;

  for (const user of users) {
    console.log(`Sending email to ${user.email}...`);
    await sendEmail(user.email, '🚀 جديد مدبّر: إضافة ميزة "ذكّرني" (المهام والتنبيهات)', htmlContent);
  }

  console.log('✅ All update emails sent!');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
