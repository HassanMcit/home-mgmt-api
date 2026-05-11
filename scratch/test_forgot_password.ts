import axios from 'axios';

async function testForgotPassword() {
  try {
    const email = 'alienghassan000@gmail.com'; // This email exists in the system (from previous logs)
    console.log(`Testing Forgot Password for ${email}...`);
    const response = await axios.post('http://localhost:5000/api/auth/forgot-password', { email });
    console.log('✅ Response:', response.data);
  } catch (error: any) {
    if (error.response) {
      console.error('❌ Error:', error.response.data);
    } else {
      console.error('❌ Error:', error.message);
    }
  }
}

testForgotPassword();
