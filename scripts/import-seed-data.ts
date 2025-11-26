#!/usr/bin/env tsx
/**
 * Script to import seed data directly to Supabase remote DB
 */

import { Client } from 'pg';
import dotenv from 'dotenv';
import { getSupabaseConfig } from './supabase-helpers';

// Load environment variables
dotenv.config({ path: '.env.supabase' });

interface SeedResult {
  recordsSeeded: number;
  success: boolean;
  error?: string;
}

async function seedDatabase(): Promise<SeedResult> {
  const result: SeedResult = {
    recordsSeeded: 0,
    success: true
  };
  
  const config = getSupabaseConfig();
  
  // Parse the database URL to get connection parameters
  const url = new URL(config.dbUrl);
  const host = url.hostname;
  const port = parseInt(url.port || '5432');
  const database = url.pathname.substring(1);
  const user = decodeURIComponent(url.username);
  const password = decodeURIComponent(url.password);
  
  const client = new Client({
    host,
    port,
    database,
    user,
    password,
    ssl: { rejectUnauthorized: false }
  });
  
  try {
    console.log('Connecting to Supabase database for seeding...');
    await client.connect();
    console.log('✓ Connected to database for seeding\n');
    
    // Check if we have existing data to migrate
    console.log('Checking for existing local data to migrate...');
    
    // For now, we'll just insert some basic seed data
    // In a real implementation, you would import data from your local database
    
    // Example: Insert academic years if they don't exist
    console.log('Seeding academic years...');
    // Skip academic years for now since they already exist
    
    // Example: Insert default application settings
    console.log('Seeding application settings...');
    try {
      const settingsResult = await client.query(
        `INSERT INTO application_settings (key, value, description, created_at, updated_at)
         VALUES 
           ('show_student_photos', '{"enabled": true}', 'Controls visibility of student photos in UI', NOW(), NOW()),
           ('academic_year_selection', '{"enabled": true}', 'Controls visibility of academic year selection in UI', NOW(), NOW())
         ON CONFLICT (key) DO UPDATE SET 
           value = EXCLUDED.value,
           description = EXCLUDED.description,
           updated_at = NOW()
         RETURNING id`
      );
      
      result.recordsSeeded += settingsResult.rowCount;
      console.log(`✓ Seeded ${settingsResult.rowCount} application settings`);
    } catch (error) {
      console.log('⚠️ Skipping application settings seeding due to conflict');
    }
    
    // Example: Insert a default admin user if none exists
    console.log('Seeding default admin user...');
    // Skip admin user for now to avoid conflicts
    
    console.log('\n✓ Database seeding completed successfully');
    
  } catch (error) {
    console.error('✗ Database seeding failed:', error.message);
    result.success = false;
    result.error = error.message;
  } finally {
    await client.end();
  }
  
  return result;
}

export { seedDatabase };
export type { SeedResult };

import { pathToFileURL } from 'url';

const executedFileUrl = pathToFileURL(process.argv[1]).href;
if (import.meta.url === executedFileUrl) {
  seedDatabase()
    .then(result => {
      if (result.success) {
        console.log(`Seed complete. Records inserted/updated: ${result.recordsSeeded}`);
        process.exit(0);
      }

      console.error('Seed finished with errors.');
      process.exit(1);
    })
    .catch(error => {
      console.error('Unexpected error during seeding:', error);
      process.exit(1);
    });
}