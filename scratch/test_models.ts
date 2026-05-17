import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

const models = [
  'gemini-2.0-flash-lite',
  'gemini-2.5-flash',
  'gemini-2.5-flash-preview-05-20',
  'gemini-2.0-flash-exp',
];

(async () => {
  const apiKey = process.env.GEMINI_API_KEY!;
  console.log('Testing alternative models...\n');
  for (const m of models) {
    try {
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: m });
      const r = await model.generateContent('قل مرحباً');
      console.log(`✅ WORKS: ${m}`);
      console.log(`   Response: ${r.response.text()}\n`);
      break;
    } catch(e: any) {
      console.log(`❌ FAILED: ${m}`);
      console.log(`   ${e.status || ''} ${e.message?.substring(0, 120)}\n`);
    }
  }
})();
