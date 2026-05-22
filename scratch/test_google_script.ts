import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testGoogleScript() {
  const scriptUrl = process.env.GOOGLE_SCRIPT_URL;
  
  if (!scriptUrl) {
    console.error('❌ GOOGLE_SCRIPT_URL is not set in .env');
    return;
  }

  console.log('🔗 Testing Google Apps Script Webhook...');
  console.log('URL:', scriptUrl.substring(0, 60) + '...');

  const payload = {
    to: process.env.EMAIL_USER,
    subject: '🧪 اختبار Webhook - مدبّر',
    html: `<div dir="rtl" style="font-family: Cairo, sans-serif; padding: 20px;">
      <h2 style="color: #4f46e5;">✅ اختبار الـ Webhook</h2>
      <p>هذا إيميل تجريبي للتأكد من أن نظام الإيميل عبر Google Apps Script يعمل بشكل صحيح.</p>
      <p style="color: #64748b; font-size: 13px;">وقت الإرسال: ${new Date().toLocaleString('ar-EG')}</p>
    </div>`
  };

  try {
    console.log('\n📤 Sending POST request to webhook...');
    const response = await fetch(scriptUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });

    console.log('📥 Response status:', response.status, response.statusText);

    const text = await response.text();
    console.log('📥 Response body:', text);

    try {
      const json = JSON.parse(text);
      if (json.status === 'success') {
        console.log('\n✅ SUCCESS! Google Script webhook is working!');
      } else {
        console.log('\n❌ FAILED! Webhook returned error:', json);
      }
    } catch {
      console.log('\n⚠️ Response is not valid JSON:', text);
    }
  } catch (error: any) {
    console.error('\n❌ Network error calling webhook:', error.message);
  }
}

testGoogleScript();
