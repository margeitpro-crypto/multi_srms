import dotenv from 'dotenv';
import axios from 'axios';

// Load environment variables
dotenv.config();

// Define response types
interface LoginResponse {
  message: string;
  token: string;
  user: {
    id: number;
    iemis_code: string;
    email: string;
    role: string;
    school_id: number | null;
  };
}

interface ErrorResponse {
  error: string;
}

async function testLogin() {
  console.log('Testing login system...');
  
  const apiBaseUrl = process.env.VITE_API_URL || 'http://localhost:3002';
  
  // Test users
  const testUsers = [
    {
      email: 'margeitpro@gmail.com',
      password: 'testpassword', // This would need to be the actual password used when creating the hash
      iemis_code: '9827792360',
      role: 'admin'
    },
    {
      email: 'tsguideman@gmail.com',
      password: 'testpassword',
      iemis_code: '9827792361',
      role: 'school'
    }
  ];
  
  console.log(`Using API base URL: ${apiBaseUrl}`);
  
  for (const user of testUsers) {
    console.log(`\nTesting login for ${user.email} (${user.role})...`);
    
    try {
      const response = await axios.post<LoginResponse>(`${apiBaseUrl}/api/users/login`, {
        email: user.email,
        password: user.password
      });
      
      if (response.status === 200 && response.data.token) {
        console.log(`  ✅ Login successful for ${user.email}`);
        console.log(`  🎯 Token: ${response.data.token.substring(0, 20)}...`);
        console.log(`  👤 User ID: ${response.data.user.id}`);
        console.log(`  📧 Email: ${response.data.user.email}`);
        console.log(`  🏷️  Role: ${response.data.user.role}`);
        console.log(`  🏫 School ID: ${response.data.user.school_id || 'N/A'}`);
      } else {
        console.log(`  ❌ Login failed for ${user.email}: Unexpected response`);
        console.log(`  Response:`, response.data);
      }
    } catch (error: any) {
      if (error.response) {
        const errorData = error.response.data as ErrorResponse;
        console.log(`  ❌ Login failed for ${user.email}: ${errorData.error || error.response.statusText}`);
      } else {
        console.log(`  ❌ Login failed for ${user.email}: ${error.message}`);
      }
    }
  }
  
  console.log('\n✅ Login tests completed');
}

testLogin();