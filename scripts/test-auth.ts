import dotenv from 'dotenv';
import { login } from '../backend/services/authService';
import { verifyToken } from '../backend/services/authService';

// Load environment variables
dotenv.config();

async function testAuth() {
  console.log('Testing authentication system...');
  
  try {
    // Test login with admin user
    console.log('Attempting login with admin user...');
    // Using a common test password
    const loginResult = await login('9827792360', 'password123');
    
    if (loginResult.error) {
      console.log('❌ Login failed:', loginResult.error);
      // Try another common password
      console.log('Trying alternative password...');
      const loginResult2 = await login('9827792360', 'admin123');
      if (loginResult2.error) {
        console.log('❌ Login failed with alternative password:', loginResult2.error);
        return;
      }
      
      console.log('✅ Login successful with alternative password');
      console.log('User:', loginResult2.user);
      console.log('Token:', loginResult2.token);
      
      // Test token verification
      console.log('\nTesting token verification...');
      const verifiedPayload = verifyToken(loginResult2.token);
      
      if (!verifiedPayload) {
        console.log('❌ Token verification failed');
        return;
      }
      
      console.log('✅ Token verification successful');
      console.log('Verified payload:', verifiedPayload);
      return;
    }
    
    if (!loginResult.user || !loginResult.token) {
      console.log('❌ Login failed: No user or token returned');
      return;
    }
    
    console.log('✅ Login successful');
    console.log('User:', loginResult.user);
    console.log('Token:', loginResult.token);
    
    // Test token verification
    console.log('\nTesting token verification...');
    const verifiedPayload = verifyToken(loginResult.token);
    
    if (!verifiedPayload) {
      console.log('❌ Token verification failed');
      return;
    }
    
    console.log('✅ Token verification successful');
    console.log('Verified payload:', verifiedPayload);
    
  } catch (error) {
    console.error('Error:', error);
  }
}

testAuth();