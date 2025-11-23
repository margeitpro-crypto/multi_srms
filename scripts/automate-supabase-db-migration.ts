#!/usr/bin/env tsx
/**
 * Production-ready Supabase Database Migration Script
 * 
 * This script automates database migrations for Supabase without requiring
 * a local PostgreSQL installation. It connects directly to the remote
 * Supabase PostgreSQL database and applies migrations in order.
 */

import { Client } from 'pg';
import { readFile, readdir } from 'fs/promises';
import { join } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';
import dotenv from 'dotenv';

// Load environment variables from .env.supabase
dotenv.config({ path: '.env.supabase' });

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Types
interface MigrationResult {
  migrationsApplied: number;
  success: boolean;
  errors: string[];
  warnings: string[];
}

interface MigrationFile {
  filename: string;
  path: string;
  timestamp: number;
}

// Configuration
const SUPABASE_DB_URL = process.env.SUPABASE_DB_URL;
const MIGRATIONS_DIR = join(__dirname, '..', 'supabase', 'migrations');
const SEEDS_DIR = join(__dirname, '..', 'supabase', 'seeds');

/**
 * Main migration class
 */
class SupabaseDatabaseMigrator {
  private dbClient: Client | null = null;

  constructor() {
    this.validateConfiguration();
  }

  /**
   * Validate required environment variables
   */
  private validateConfiguration(): void {
    console.log('🔍 Validating configuration...');
    
    if (!SUPABASE_DB_URL) {
      throw new Error('❌ SUPABASE_DB_URL is not defined in .env.supabase');
    }
    
    console.log('✅ Configuration validated');
    // Mask the password for security
    const maskedUrl = SUPABASE_DB_URL.replace(/:(.*?):/, ':****:');
    console.log(`   SUPABASE_DB_URL: ${maskedUrl}`);
  }

  /**
   * Initialize database client
   */
  private initializeDatabaseClient(): void {
    console.log('🔧 Initializing database client...');
    
    try {
      this.dbClient = new Client({
        connectionString: SUPABASE_DB_URL,
        ssl: { rejectUnauthorized: false }
      });
      console.log('✅ Database client initialized');
    } catch (error) {
      throw new Error(`❌ Failed to initialize database client: ${error.message}`);
    }
  }

  /**
   * Connect to database
   */
  private async connect(): Promise<boolean> {
    console.log('🔗 Connecting to database...');
    
    try {
      this.initializeDatabaseClient();
      if (!this.dbClient) {
        throw new Error('Database client not initialized');
      }
      
      await this.dbClient.connect();
      console.log('✅ Database connected successfully');
      return true;
    } catch (error) {
      console.error(`❌ Database connection failed: ${error.message}`);
      return false;
    }
  }

  /**
   * Disconnect from database
   */
  private async disconnect(): Promise<void> {
    if (this.dbClient) {
      console.log('🔓 Disconnecting from database...');
      
      try {
        await this.dbClient.end();
        console.log('✅ Database disconnected successfully');
        this.dbClient = null;
      } catch (error) {
        console.error(`❌ Database disconnection failed: ${error.message}`);
      }
    }
  }

  /**
   * Test database connection
   */
  async testConnection(): Promise<boolean> {
    console.log('📡 Testing database connection...');
    
    try {
      // Connect to database
      const connected = await this.connect();
      if (!connected) {
        return false;
      }
      
      // Run a simple query
      if (!this.dbClient) {
        throw new Error('Database client not available');
      }
      
      const result = await this.dbClient.query('SELECT 1 as test');
      
      if (result.rows.length > 0) {
        console.log('✅ Database connection successful');
        return true;
      } else {
        console.error('❌ Database connection test returned no results');
        return false;
      }
    } catch (error) {
      console.error(`❌ Connection test failed: ${error.message}`);
      return false;
    } finally {
      await this.disconnect();
    }
  }

  /**
   * Get migration files sorted by timestamp
   */
  private async getMigrationFiles(): Promise<MigrationFile[]> {
    console.log('📂 Reading migration files...');
    
    try {
      const files = await readdir(MIGRATIONS_DIR);
      const migrationFiles: MigrationFile[] = [];
      
      // Filter and sort migration files by timestamp
      for (const file of files) {
        if (file.endsWith('.sql')) {
          const parts = file.split('_');
          if (parts.length > 0) {
            const timestamp = parseInt(parts[0]);
            if (!isNaN(timestamp)) {
              migrationFiles.push({
                filename: file,
                path: join(MIGRATIONS_DIR, file),
                timestamp
              });
            }
          }
        }
      }
      
      // Sort by timestamp
      migrationFiles.sort((a, b) => a.timestamp - b.timestamp);
      
      console.log(`✅ Found ${migrationFiles.length} migration files`);
      return migrationFiles;
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('⚠️ Migrations directory not found, skipping migrations');
        return [];
      }
      throw new Error(`❌ Failed to read migration files: ${error.message}`);
    }
  }

  /**
   * Apply a single migration
   */
  private async applyMigration(migration: MigrationFile): Promise<boolean> {
    console.log(`🚀 Applying migration: ${migration.filename}`);
    
    try {
      // Read migration file
      const sql = await readFile(migration.path, 'utf8');
      
      // Skip empty files
      if (!sql.trim()) {
        console.log(`✅ Migration ${migration.filename} is empty, skipping`);
        return true;
      }
      
      // Execute migration
      if (!this.dbClient) {
        throw new Error('Database client not available');
      }
      
      await this.dbClient.query(sql);
      
      console.log(`✅ Migration ${migration.filename} applied successfully`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to apply migration ${migration.filename}: ${error.message}`);
      return false;
    }
  }

  /**
   * Apply all pending migrations
   */
  async applyMigrations(): Promise<{ success: boolean; migrationsApplied: number }> {
    console.log('📋 Applying database migrations...');
    
    try {
      // Connect to database
      const connected = await this.connect();
      if (!connected) {
        throw new Error('Database connection failed');
      }
      
      // Get migration files
      const migrationFiles = await this.getMigrationFiles();
      
      if (migrationFiles.length === 0) {
        await this.disconnect();
        console.log('✅ No migrations to apply');
        return { success: true, migrationsApplied: 0 };
      }
      
      let migrationsApplied = 0;
      
      // Apply each migration
      for (const migration of migrationFiles) {
        const success = await this.applyMigration(migration);
        if (!success) {
          await this.disconnect();
          return { success: false, migrationsApplied };
        }
        migrationsApplied++;
      }
      
      await this.disconnect();
      console.log('✅ All migrations applied successfully');
      return { success: true, migrationsApplied };
    } catch (error) {
      await this.disconnect();
      throw new Error(`❌ Failed to apply migrations: ${error.message}`);
    }
  }

  /**
   * Get seed files
   */
  private async getSeedFiles(): Promise<string[]> {
    console.log('🌱 Reading seed files...');
    
    try {
      const files = await readdir(SEEDS_DIR);
      const seedFiles = files.filter(file => file.endsWith('.sql'));
      
      console.log(`✅ Found ${seedFiles.length} seed files`);
      return seedFiles;
    } catch (error) {
      if (error.code === 'ENOENT') {
        console.log('⚠️ Seeds directory not found, skipping seeding');
        return [];
      }
      throw new Error(`❌ Failed to read seed files: ${error.message}`);
    }
  }

  /**
   * Apply seed data
   */
  async seedDatabase(): Promise<{ success: boolean; recordsSeeded: number }> {
    console.log('🌱 Seeding database...');
    
    try {
      // Connect to database
      const connected = await this.connect();
      if (!connected) {
        throw new Error('Database connection failed');
      }
      
      const seedFiles = await this.getSeedFiles();
      
      if (seedFiles.length === 0) {
        await this.disconnect();
        console.log('✅ No seed files to apply');
        return { success: true, recordsSeeded: 0 };
      }
      
      let recordsSeeded = 0;
      
      // Apply each seed file
      for (const file of seedFiles) {
        console.log(`🌱 Applying seed: ${file}`);
        
        try {
          const sql = await readFile(join(SEEDS_DIR, file), 'utf8');
          
          // Skip empty files
          if (!sql.trim()) {
            console.log(`✅ Seed ${file} is empty, skipping`);
            recordsSeeded++;
            continue;
          }
          
          // Execute seed
          if (!this.dbClient) {
            throw new Error('Database client not available');
          }
          
          await this.dbClient.query(sql);
          
          console.log(`✅ Seed ${file} applied successfully`);
          recordsSeeded++;
        } catch (error) {
          console.error(`❌ Failed to apply seed ${file}: ${error.message}`);
          await this.disconnect();
          return { success: false, recordsSeeded };
        }
      }
      
      await this.disconnect();
      console.log('✅ Database seeding completed');
      return { success: true, recordsSeeded };
    } catch (error) {
      await this.disconnect();
      throw new Error(`❌ Failed to seed database: ${error.message}`);
    }
  }

  /**
   * Run full migration process
   */
  async runFullMigration(): Promise<MigrationResult> {
    console.log('=== Supabase Database Migration Process ===\n');
    
    const result: MigrationResult = {
      migrationsApplied: 0,
      success: true,
      errors: [],
      warnings: []
    };
    
    try {
      // Step 1: Test connection
      console.log('Step 1: Testing database connection');
      const isConnected = await this.testConnection();
      if (!isConnected) {
        throw new Error('Database connection failed. Please check your network connection and Supabase credentials.');
      }
      console.log('');
      
      // Step 2: Apply migrations
      console.log('Step 2: Applying database migrations');
      const migrationResult = await this.applyMigrations();
      if (!migrationResult.success) {
        throw new Error('Migration application failed');
      }
      result.migrationsApplied = migrationResult.migrationsApplied;
      console.log('');
      
      // Step 3: Seed database
      console.log('Step 3: Seeding database');
      const seedResult = await this.seedDatabase();
      if (!seedResult.success) {
        result.warnings.push('Database seeding had issues');
        console.warn('⚠️ Database seeding had issues, but continuing...');
      }
      console.log('');
      
      console.log('🎉 All migration steps completed successfully!\n');
    } catch (error) {
      console.error(`\n💥 Migration process failed: ${error.message}`);
      result.success = false;
      result.errors.push(error.message);
    }
    
    return result;
  }

  /**
   * Print migration summary
   */
  printSummary(result: MigrationResult): void {
    console.log('=== Migration Summary ===');
    console.log(`Migrations Applied: ${result.migrationsApplied}`);
    console.log(`Status: ${result.success ? 'SUCCESS ✅' : 'FAILURE ❌'}`);
    
    if (result.warnings.length > 0) {
      console.log('\nWarnings:');
      result.warnings.forEach((warning, index) => {
        console.log(`${index + 1}. ⚠️ ${warning}`);
      });
    }
    
    if (result.errors.length > 0) {
      console.log('\nErrors:');
      result.errors.forEach((error, index) => {
        console.log(`${index + 1}. ❌ ${error}`);
      });
      
      console.log('\n💡 Recommendations:');
      console.log('- Check your network connection');
      console.log('- Verify your Supabase database URL in .env.supabase');
      console.log('- Ensure your IP is allowed in Supabase database settings');
      console.log('- Check that your Supabase project is active');
    }
    
    console.log('\n=== Process Complete ===');
  }
}

// Run the migration if this script is executed directly
async function runMigration(): Promise<void> {
  const migrator = new SupabaseDatabaseMigrator();
  
  try {
    const result = await migrator.runFullMigration();
    migrator.printSummary(result);
    process.exit(result.success ? 0 : 1);
  } catch (error) {
    console.error('\n💥 Unexpected error during migration:', error);
    
    const result: MigrationResult = {
      migrationsApplied: 0,
      success: false,
      errors: [error.message],
      warnings: []
    };
    
    migrator.printSummary(result);
    process.exit(1);
  }
}

// Execute the migration
runMigration().catch(error => {
  console.error('Unhandled error:', error);
  process.exit(1);
});

export { SupabaseDatabaseMigrator, type MigrationResult };