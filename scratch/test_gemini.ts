import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function testGemini() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found in .env');
    return;
  }

  console.log('🔑 API Key found:', apiKey.substring(0, 15) + '...');
  
  // Test the exact same models used in ai.ts
  const models = ['gemini-2.0-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
  
  for (const modelName of models) {
    try {
      console.log(`\n🧪 Testing model: ${modelName}`);
      const genAI = new GoogleGenerativeAI(apiKey);
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent('قل مرحباً باللغة العربية في جملة واحدة فقط.');
      const text = result.response.text();
      console.log(`✅ ${modelName} SUCCESS:`, text);
      break;
    } catch (e: any) {
      console.error(`❌ ${modelName} FAILED:`);
      console.error(`   Code: ${e.status || e.code}`);
      console.error(`   Message: ${e.message}`);
    }
  }
}

testGemini();
