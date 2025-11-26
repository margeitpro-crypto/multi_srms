import dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';

// Load environment variables
dotenv.config();

async function testSupabaseAuth() {
  console.log('Testing Supabase Authentication...');
  
  // Check if environment variables are loaded
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    console.error('Missing Supabase environment variables');
    console.log('SUPABASE_URL:', supabaseUrl ? 'SET' : 'NOT SET');
    console.log('SUPABASE_KEY:', supabaseKey ? 'SET' : 'NOT SET');
    return;
  }
  
  // Create Supabase client
  const supabase = createClient(supabaseUrl, supabaseKey);
  
  // Test 1: Check if we can access Supabase
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Error accessing Supabase Auth:', error.message);
      return;
    }
    
    console.log('✓ Supabase Auth is accessible');
    
    // Test 2: Try to sign up a test user
    const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
      email: 'test@example.com',
      password: 'testpassword123',
      options: {
        data: {
          iemis_code: 'TEST001',
          role: 'admin'
        }
      }
    });
    
    if (signUpError) {
      console.error('Error signing up test user:', signUpError.message);
    } else {
      console.log('✓ Test user signup successful');
      console.log('User ID:', signUpData.user?.id);
    }
    
    // Test 3: Try to sign in with the test user
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email: 'test@example.com',
      password: 'testpassword123'
    });
    
    if (signInError) {
      console.error('Error signing in test user:', signInError.message);
    } else {
      console.log('✓ Test user sign in successful');
      console.log('Session token:', signInData.session?.access_token ? signInData.session?.access_token.substring(0, 20) + '...' : 'NOT AVAILABLE');
    }
    
  } catch (error) {
    console.error('Unexpected error:', error);
  }
}

testSupabaseAuth();