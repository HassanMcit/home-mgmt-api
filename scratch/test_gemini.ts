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

  console.log('Testing Gemini API with key:', apiKey.substring(0, 10) + '...');
  
  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    
    // Try to list models
    console.log('Listing available models...');
    // Note: there isn't a direct listModels in the genAI class easily accessible like this in some versions
    // but let's try gemini-1.5-flash again with a different check or try gemini-pro
    
    const models = ['gemini-1.5-flash', 'gemini-1.5-pro', 'gemini-pro'];
    for (const modelName of models) {
      try {
        console.log(`Testing model: ${modelName}`);
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await model.generateContent('Say hi');
        console.log(`✅ ${modelName} worked:`, result.response.text());
        break; 
      } catch (e: any) {
        console.log(`❌ ${modelName} failed:`, e.message);
      }
    }
  } catch (error: any) {
    console.error('❌ Gemini Error:', error.message);
  }
}

testGemini();
