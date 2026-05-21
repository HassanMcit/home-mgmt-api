import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '../.env') });

async function main() {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    console.error('No API key found in .env');
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });

  const prompt = `
أنت خبير مستشار مالي ومساعد ذكي في نظام "مدبّر" لإدارة المنزل.
الرجاء تقديم مقترح ونصائح عملية وممتازة باللغة العربية حول كيفية توفير المال والادخار بشكل ذكي في المنزل وللعائلة.
اجعل النصائح مرتبة في نقاط واضحة وعملية، وتتحدث بأسلوب ودي ومشجع.
`;

  try {
    console.log('🤖 Querying Gemini (gemini-2.5-flash) for savings advice...');
    const result = await model.generateContent(prompt);
    console.log('\n✨ RESPONSE:\n');
    console.log(result.response.text());
  } catch (error) {
    console.error('Error generating content:', error);
  }
}

main();
