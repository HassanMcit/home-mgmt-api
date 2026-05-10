import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function checkModels() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('No API Key found');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    console.log('Fetching models for key:', apiKey.substring(0, 5) + '...');
    // The SDK might not have listModels easily accessible in this version as a top level
    // But we can try the fetch manually or use the genAI.getGenerativeModel
    
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro', 'gemini-1.5-flash-latest'];
    
    for (const m of models) {
      try {
        const model = genAI.getGenerativeModel({ model: m });
        const result = await model.generateContent('hi');
        console.log(`✅ Model ${m} is working!`);
        break; // Stop at first working model
      } catch (e: any) {
        console.log(`❌ Model ${m} failed: ${e.message}`);
      }
    }
  } catch (error: any) {
    console.error('Error:', error.message);
  }
}

checkModels();
