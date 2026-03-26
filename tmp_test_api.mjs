import axios from 'axios';

async function testMusicApi() {
  try {
    const baseUrl = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000';
    console.log(`Testing API at: ${baseUrl}/api/music`);
    const response = await axios.get(`${baseUrl}/api/music?limit=10&page=1`);
    console.log('Response status:', response.status);
    console.log('Response data:', JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error('API Test Error:', error.message);
    if (error.response) {
      console.error('Response data:', error.response.data);
    }
  }
}

testMusicApi();
