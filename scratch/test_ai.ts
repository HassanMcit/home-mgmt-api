import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { GoogleGenerativeAI } from '@google/generative-ai';

async function testAI() {
  const apiKey = process.env.GEMINI_API_KEY;
  console.log('Using API Key:', apiKey ? 'FOUND' : 'NOT FOUND');
  
  if (!apiKey) return;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });
    
    console.log('Requesting Gemini...');
    const result = await model.generateContent('أهلاً، هل تسمعني؟ أعطني نصيحة مالية قصيرة جداً.');
    console.log('AI Response:', result.response.text());
    console.log('✅ AI is working perfectly locally!');
  } catch (error: any) {
    console.error('❌ AI Failed:', error.message);
    if (error.message.includes('API_KEY_INVALID')) {
      console.error('سبب الفشل: مفتاح الـ API غير صالح.');
    } else if (error.message.includes('safety')) {
      console.error('سبب الفشل: تم حجب الرد بسبب سياسات الأمان.');
    }
  }
}

testAI();
