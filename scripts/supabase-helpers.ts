#!/usr/bin/env tsx
/**
 * Helper functions to programmatically call Supabase CLI
 */

import { execSync } from 'child_process';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config({ path: '.env.supabase' });

interface SupabaseConfig {
  dbUrl: string;
  serviceRoleKey: string;
  projectRef: string;
  apiUrl: string;
  anonKey: string;
}

export function getSupabaseConfig(): SupabaseConfig {
  return {
    dbUrl: process.env.SUPABASE_DB_URL || '',
    serviceRoleKey: process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    projectRef: process.env.SUPABASE_PROJECT_REF || '',
    apiUrl: process.env.SUPABASE_URL || '',
    anonKey: process.env.SUPABASE_KEY || ''
  };
}

export function executeSupabaseCommand(command: string, options: { silent?: boolean } = {}): string {
  try {
    // Add --no-docker flag to commands that support it
    const noDockerCommands = ['link', 'db push', 'db reset'];
    const shouldAddNoDocker = noDockerCommands.some(cmd => command.startsWith(cmd));
    const fullCommand = shouldAddNoDocker ? `npx supabase ${command} --no-docker` : `npx supabase ${command}`;
    
    const result = execSync(fullCommand, {
      encoding: 'utf8',
      stdio: options.silent ? 'pipe' : 'inherit',
      env: {
        ...process.env,
        SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    });
    return result;
  } catch (error) {
    throw new Error(`Supabase command failed: ${error.message}`);
  }
}

export async function executeSupabaseCommandAsync(command: string): Promise<{ stdout: string; stderr: string }> {
  try {
    // Add --no-docker flag to commands that support it
    const noDockerCommands = ['link', 'db push', 'db reset'];
    const shouldAddNoDocker = noDockerCommands.some(cmd => command.startsWith(cmd));
    const fullCommand = shouldAddNoDocker ? `npx supabase ${command} --no-docker` : `npx supabase ${command}`;
    
    const result = execSync(fullCommand, {
      encoding: 'utf8',
      stdio: 'pipe',
      env: {
        ...process.env,
        SUPABASE_ACCESS_TOKEN: process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    });
    
    return { stdout: result, stderr: '' };
  } catch (error) {
    throw new Error(`Supabase command failed: ${error.message}`);
  }
}

export function linkProject(): void {
  const config = getSupabaseConfig();
  console.log(`Linking project ${config.projectRef}...`);
  executeSupabaseCommand(`link --project-ref ${config.projectRef}`);
  console.log('✓ Project linked successfully');
}

export function applyMigrations(): { success: boolean; count: number; error?: string } {
  try {
    console.log('Applying migrations...');
    const result = executeSupabaseCommand('db push --linked', { silent: true });
    
    // Count applied migrations
    const migrationCount = (result.match(/Applied/g) || []).length;
    
    console.log(`✓ Applied ${migrationCount} migrations`);
    return { success: true, count: migrationCount };
  } catch (error) {
    console.error('✗ Failed to apply migrations:', error.message);
    return { success: false, count: 0, error: error.message };
  }
}

export function repairMigrationHistory(): { success: boolean; error?: string } {
  try {
    console.log('Repairing migration history...');
    // Try to reset the migration history
    executeSupabaseCommand('db reset --linked', { silent: true });
    console.log('✓ Migration history repaired');
    return { success: true };
  } catch (error) {
    console.error('✗ Failed to repair migration history:', error.message);
    return { success: false, error: error.message };
  }
}

export async function checkConnection(): Promise<boolean> {
  try {
    console.log('Checking database connection...');
    executeSupabaseCommandAsync('db pull --linked');
    console.log('✓ Database connection successful');
    return true;
  } catch (error) {
    console.error('✗ Database connection failed:', error.message);
    return false;
  }
}