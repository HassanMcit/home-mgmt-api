import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { GoogleGenerativeAI } from '@google/generative-ai';

async function testExactModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash-latest' }); 
    console.log('Testing gemini-1.5-flash-latest...');
    const result = await model.generateContent('أهلاً، هل تسمعني؟');
    console.log('✅ AI Response:', result.response.text());
  } catch (error: any) {
    console.error('❌ Failed:', error.message);
  }
}

testExactModel();
