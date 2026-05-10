async function listModels() {
  const apiKey = 'AIzaSyBW9J38JsAH0zC7TswuK2BYg-8wTsXbDFA';
  const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
  
  try {
    const response = await fetch(url);
    const data = await response.json();
    console.log('Response status:', response.status);
    console.log('Models found:', JSON.stringify(data, null, 2));
  } catch (error) {
    console.error('Fetch error:', error);
  }
}

listModels();
