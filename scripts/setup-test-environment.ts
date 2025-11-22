#!/usr/bin/env tsx

/**
 * Setup Test Environment Script
 * 
 * This script automates the entire process of setting up a test environment
 * with anonymized data for pre-production testing.
 */

import { exec } from 'child_process';
import { promisify } from 'util';
import * as fs from 'fs';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execPromise = promisify(exec);

async function runCommand(command: string, description: string): Promise<void> {
  console.log(`\n--- ${description} ---`);
  console.log(`Executing: ${command}`);
  
  try {
    const { stdout, stderr } = await execPromise(command);
    if (stdout) console.log(stdout);
    if (stderr) console.error(stderr);
    console.log('✓ Completed successfully');
  } catch (error: any) {
    console.error(`✗ Failed: ${error.message}`);
    throw error;
  }
}

async function checkPrerequisites(): Promise<void> {
  console.log('--- Checking Prerequisites ---');
  
  // Check if .env file exists
  if (!fs.existsSync(path.join(__dirname, '../.env'))) {
    console.warn('⚠ Warning: .env file not found. Using default configuration.');
  }
  
  // Check if database is accessible
  try {
    await runCommand('npm run test-db-connection', 'Testing database connection');
  } catch (error) {
    console.warn('⚠ Warning: Database connection test failed. Please check your database configuration.');
  }
  
  console.log('✓ Prerequisites check completed');
}

async function setupTestEnvironment(): Promise<void> {
  try {
    console.log('='.repeat(60));
    console.log('     MULTI-SRMS TEST ENVIRONMENT SETUP');
    console.log('='.repeat(60));
    
    // Check prerequisites
    await checkPrerequisites();
    
    // Step 1: Anonymize data
    await runCommand('npm run anonymize:data', 'Step 1: Anonymizing production data');
    
    // Step 2: Initialize test database
    await runCommand('npm run init:db', 'Step 2: Initializing test database schema');
    
    // Step 3: Import anonymized data
    await runCommand('npm run import:anonymized-data', 'Step 3: Importing anonymized data');
    
    // Step 4: Run tests
    await runCommand('npm run test:anonymized-data', 'Step 4: Running comprehensive tests');
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ TEST ENVIRONMENT SETUP COMPLETED SUCCESSFULLY!');
    console.log('='.repeat(60));
    
    console.log('\nNext steps:');
    console.log('1. Start the backend server: npm run dev:backend');
    console.log('2. Start the frontend: npm run dev');
    console.log('3. Access the application at http://localhost:3000');
    
  } catch (error) {
    console.error('\n❌ SETUP FAILED!');
    console.error('Error:', error);
    process.exit(1);
  }
}

// Simple approach to run the setup
setupTestEnvironment();

export default setupTestEnvironment;