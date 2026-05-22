import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

const key1 = 'AIzaSyBtFZNJiHgYgHuOvHlKGVNW3E0OzIy5FQ8';
const key2 = 'AIzaSyC_tF_Zr6XLGq8W2h6uvxhAdBL9oW-mrIs';

async function testKey(name: string, key: string) {
  console.log(`\n--- Testing ${name} ---`);
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const r = await model.generateContent('قول تم لو استلمت الرسالة');
    console.log(`✅ WORKS: ${r.response.text().trim()}`);
  } catch(e: any) {
    console.log(`❌ FAILED: ${e.status || ''} ${e.message}`);
  }
}

(async () => {
  await testKey('Key 1 (SmartHome)', key1);
  await testKey('Key 2 (Smart Home)', key2);
})();
