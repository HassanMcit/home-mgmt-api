import { GoogleGenerativeAI } from '@google/generative-ai';

const key1 = 'AIzaSyBtFZNJiHgYgHuOvHlKGVNW3E0OzIy5FQ8'; // SmartHome
const key2 = 'AIzaSyC_tF_Zr6XLGq8W2h6uvxhAdBL9oW-mrIs'; // Smart Home

async function testKey(name: string, key: string) {
  console.log(`\n--- Testing ${name} (${key.substring(0, 10)}...) ---`);
  try {
    const genAI = new GoogleGenerativeAI(key);
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash' });
    const r = await model.generateContent('Hello, say only "OK" if you receive this.');
    console.log(`✅ Success! Response: ${r.response.text().trim()}`);
  } catch (error: any) {
    console.error(`❌ Failed: ${error.status || ''} - ${error.message}`);
  }
}

(async () => {
  await testKey('SmartHome (Key 1)', key1);
  await testKey('Smart Home (Key 2)', key2);
})();
