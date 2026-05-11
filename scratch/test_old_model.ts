import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { GoogleGenerativeAI } from '@google/generative-ai';

async function testOldModel() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: 'gemini-pro' }); // Legacy name
    console.log('Testing gemini-pro...');
    const result = await model.generateContent('hi');
    console.log('✅ AI Response:', result.response.text());
  } catch (error: any) {
    console.error('❌ Failed:', error.message);
  }
}

testOldModel();
