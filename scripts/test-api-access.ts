import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

// Define response types
interface LoginResponse {
  token: string;
  user: any;
}

interface School {
  id: number;
  name: string;
  iemis_code: string;
  // Add other school properties as needed
}

async function testApiAccess() {
  console.log('Testing API access with authentication...');
  
  try {
    // First, login to get a token
    console.log('Logging in to get authentication token...');
    const loginResponse = await axios.post<LoginResponse>('http://localhost:3002/api/users/login', {
      identifier: '9827792360',
      password: 'admin123'
    });
    
    const token = loginResponse.data.token;
    console.log('✅ Login successful');
    console.log('Token:', token);
    
    // Now try to access the schools API with the token
    console.log('\nAccessing schools API...');
    const schoolsResponse = await axios.get<School[]>('http://localhost:3002/api/schools', {
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log('✅ Schools API access successful');
    console.log('Number of schools:', schoolsResponse.data.length);
    console.log('First school:', schoolsResponse.data[0]);
    
  } catch (error: any) {
    console.error('❌ Error:', error.message);
    if (error.response) {
      console.error('Response status:', error.response.status);
      console.error('Response data:', error.response.data);
    }
  }
}

testApiAccess();