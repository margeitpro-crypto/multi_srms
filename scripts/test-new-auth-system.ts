/**
 * Test script for the updated authentication system
 * This script tests the new login requirements:
 * 1. Admin users can only log in with IEMIS Code (827792360) and password (password)
 * 2. School users can only log in with IEMIS Code and password
 */

import axios from 'axios';

// Create an instance of axios for API calls
const api = axios.create({
  baseURL: 'http://localhost:3002/api',  // Updated to match the backend port
  headers: {
    'Content-Type': 'application/json',
  }
});

async function testAdminLogin() {
  console.log('Testing Admin Login with IEMIS Code...');
  
  try {
    // Correct admin login with IEMIS Code
    const response = await api.post('/users/login', {
      iemisCode: '827792360',
      password: 'password'
    });
    
    console.log('✅ Admin login with IEMIS Code successful:', response.data);
    
    // Try to login with email as admin (should fail in the new system)
    try {
      await api.post('/users/login', {
        email: 'admintest@gmail.com',
        password: 'admin123'
      });
      console.log('❌ Admin login with email should have failed in the new system');
    } catch (error: any) {
      console.log('✅ Admin login correctly rejected email login:', error.response?.data?.error);
    }
  } catch (error: any) {
    console.log('❌ Admin login failed:', error.response?.data?.error || error.message);
  }
}

async function testSchoolLogin() {
  console.log('\nTesting School Login with IEMIS Code...');
  
  try {
    // Correct school login
    const response = await api.post('/users/login', {
      iemisCode: '720160001',
      password: 'school123'
    });
    
    console.log('✅ School login successful:', response.data);
    
    // Try to login with email as school (should fail)
    try {
      await api.post('/users/login', {
        email: 'schooltest@gmail.com',
        password: 'school123'
      });
      console.log('❌ School login with email should have failed');
    } catch (error: any) {
      console.log('✅ School login correctly rejected email:', error.response?.data?.error);
    }
  } catch (error: any) {
    console.log('❌ School login failed:', error.response?.data?.error || error.message);
  }
}

async function runTests() {
  console.log('Running Updated Authentication Tests\n');
  
  await testAdminLogin();
  await testSchoolLogin();
  
  console.log('\nAuthentication tests completed.');
}

// Run the tests
runTests().catch(console.error);