import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.join(__dirname, '../.env') });

import { GoogleGenerativeAI } from '@google/generative-ai';

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return;

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    // There isn't a direct listModels in the simple SDK, but we can try common ones
    const models = ['gemini-1.5-flash-001', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    
    for (const m of models) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        await model.generateContent('hi');
        console.log(`✅ Model ${m} is WORKING!`);
        process.exit(0);
      } catch (e: any) {
        console.log(`❌ Model ${m} failed: ${e.message}`);
      }
    }
  } catch (error: any) {
    console.error('Fatal:', error.message);
  }
}

listModels();
