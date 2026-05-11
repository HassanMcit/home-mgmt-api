import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function listModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('❌ GEMINI_API_KEY not found');
    return;
  }

  try {
    // There isn't a direct listModels in the high-level SDK easily, 
    // but we can try common ones and see the error messages more closely.
    const genAI = new GoogleGenerativeAI(apiKey);
    
    const testModels = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.0-pro'];
    
    for (const m of testModels) {
      try {
        console.log(`Testing ${m}...`);
        const model = genAI.getGenerativeModel({ model: m });
        const res = await model.generateContent('hi');
        console.log(`✅ ${m} works! Response: ${res.response.text()}`);
        return;
      } catch (e: any) {
        console.log(`❌ ${m} failed: ${e.message}`);
        // If it's a 404, it might be the model name. 
        // If it's a 403, it's the API key permissions.
        // If it's a 400, it's something else.
      }
    }
  } catch (error: any) {
    console.error('Global error:', error);
  }
}

listModels();
