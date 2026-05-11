import axios from 'axios';

async function testBudgets() {
  const token = 'YOUR_TOKEN_HERE'; // I can't get this easily
  try {
    const res = await axios.get('http://localhost:5000/api/budgets', {
      headers: { Authorization: `Bearer ${token}` }
    });
    console.log('Budgets:', res.data);
  } catch (err: any) {
    console.error('Error:', err.response?.data || err.message);
  }
}
