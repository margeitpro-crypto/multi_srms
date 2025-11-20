#!/usr/bin/env tsx
/**
 * Database Initialization Script for Multi-School Result Management System
 * 
 * This script helps set up the PostgreSQL database for development purposes.
 * It checks for PostgreSQL installation, creates the database, and initializes
 * the schema with proper tables and relationships.
 */

import { Client } from 'pg';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';

// Load environment variables
dotenv.config();

interface DatabaseConfig {
  host: string;
  port: number;
  database: string;
  user: string;
  password: string;
}

class DatabaseInitializer {
  private config: DatabaseConfig;

  constructor() {
    this.config = {
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432'),
      database: process.env.DB_NAME || 'multi_srms',
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || 'postgres'
    };
  }

  /**
   * Check if PostgreSQL is accessible by testing database connection
   */
  public async isPostgreSQLAccessible(): Promise<boolean> {
    const client = new Client({
      host: this.config.host,
      port: this.config.port,
      user: this.config.user,
      password: this.config.password,
      database: 'postgres' // Connect to default database to test connection
    });

    try {
      await client.connect();
      await client.end();
      return true;
    } catch (error) {
      return false;
    }
  }

  /**
   * Create the application database if it doesn't exist
   */
  public async createDatabase(): Promise<boolean> {
    const client = new Client({
      host: this.config.host,
      port: this.config.port,
      user: this.config.user,
      password: this.config.password,
      database: 'postgres' // Connect to default database to create new one
    });

    try {
      await client.connect();
      console.log('✓ Connected to PostgreSQL server');

      // Check if database exists
      const result = await client.query(
        'SELECT 1 FROM pg_database WHERE datname = $1',
        [this.config.database]
      );

      if (result.rowCount === 0) {
        // Database doesn't exist, create it
        await client.query(`CREATE DATABASE "${this.config.database}"`);
        console.log(`✓ Database '${this.config.database}' created successfully`);
      } else {
        console.log(`✓ Database '${this.config.database}' already exists`);
      }

      await client.end();
      return true;
    } catch (error) {
      console.error('✗ Error creating database:', (error as Error).message);
      await client.end();
      return false;
    }
  }

  /**
   * Initialize database schema using the provided SQL file
   */
  public async initializeSchema(): Promise<boolean> {
    const client = new Client({
      host: this.config.host,
      port: this.config.port,
      user: this.config.user,
      password: this.config.password,
      database: this.config.database
    });

    try {
      await client.connect();
      console.log('✓ Connected to database for schema initialization');

      // Drop existing tables and types in reverse order to avoid foreign key constraints
      console.log('⚠️  Dropping existing tables and types...');
      await client.query('DROP TABLE IF EXISTS application_settings CASCADE');
      await client.query('DROP TABLE IF EXISTS academic_years CASCADE');
      await client.query('DROP TABLE IF EXISTS student_marks CASCADE');
      await client.query('DROP TABLE IF EXISTS extra_credit_assignments CASCADE');
      await client.query('DROP TABLE IF EXISTS student_subject_assignments CASCADE');
      await client.query('DROP TABLE IF EXISTS students CASCADE');
      await client.query('DROP TABLE IF EXISTS users CASCADE');
      await client.query('DROP TABLE IF EXISTS schools CASCADE');
      await client.query('DROP TABLE IF EXISTS subjects CASCADE');
      await client.query('DROP TYPE IF EXISTS subscription_plan, school_status, student_gender, user_role CASCADE');
      console.log('✓ Existing tables and types dropped');

      // Read the schema file
      const schemaSql = readFileSync('./init-scripts/01-init-schema.sql', 'utf8');
      
      // Execute the entire schema at once (PostgreSQL can handle multiple statements)
      await client.query(schemaSql);

      console.log('✓ Database schema initialized successfully');
      
      // Add default admin user
      await this.addDefaultAdminUser(client);
      
      // Add default academic years
      await this.addDefaultAcademicYears(client);
      
      // Add default application settings
      await this.addDefaultAppSettings(client);
      
      await client.end();
      return true;
    } catch (error) {
      console.error('✗ Error initializing schema:', (error as Error).message);
      await client.end();
      return false;
    }
  }
  
  /**
   * Add default admin user
   */
  private async addDefaultAdminUser(client: Client): Promise<void> {
    try {
      // Hash the password
      const saltRounds = 10;
      const password = 'password';
      const passwordHash = await bcrypt.hash(password, saltRounds);
      
      // Insert the default admin user with IEMIS code
      await client.query(
        `INSERT INTO users (iemis_code, password_hash, role) 
         VALUES ($1, $2, $3) 
         ON CONFLICT (iemis_code) DO NOTHING`,
        ['827792360', passwordHash, 'admin']
      );
      
      console.log('✓ Default admin user added successfully');
    } catch (error) {
      console.error('✗ Error adding default admin user:', (error as Error).message);
    }
  }

  /**
   * Add default academic years
   */
  private async addDefaultAcademicYears(client: Client): Promise<void> {
    try {
      // Insert default academic years
      const defaultYears = [
        { year: 2080, is_active: true },
        { year: 2081, is_active: true },
        { year: 2082, is_active: true },
        { year: 2083, is_active: true },
        { year: 2084, is_active: true }
      ];
      
      for (const academicYear of defaultYears) {
        await client.query(
          `INSERT INTO academic_years (year, is_active) 
           VALUES ($1, $2) 
           ON CONFLICT (year) DO NOTHING`,
          [academicYear.year, academicYear.is_active]
        );
      }
      
      console.log('✓ Default academic years added successfully');
    } catch (error) {
      console.error('✗ Error adding default academic years:', (error as Error).message);
    }
  }

  /**
   * Add default application settings
   */
  private async addDefaultAppSettings(client: Client): Promise<void> {
    try {
      // Insert default application settings
      const defaultSettings = [
        { key: 'app_name', value: '"ResultSys"', description: 'Application name displayed in the UI' },
        { key: 'academic_year', value: '"2082"', description: 'Current academic year for the application' }
      ];
      
      for (const setting of defaultSettings) {
        await client.query(
          `INSERT INTO application_settings (key, value, description) 
           VALUES ($1, $2, $3) 
           ON CONFLICT (key) DO UPDATE SET value = $2, description = $3, updated_at = NOW()`,
          [setting.key, setting.value, setting.description]
        );
      }
      
      console.log('✓ Default application settings added successfully');
    } catch (error) {
      console.error('✗ Error adding default application settings:', (error as Error).message);
    }
  }

  /**
   * Main initialization process
   */
  public async initialize(): Promise<void> {
    console.log('🚀 Initializing PostgreSQL Database for Multi-School Result Management System...\n');

    // Check if PostgreSQL is accessible
    const isAccessible = await this.isPostgreSQLAccessible();
    if (!isAccessible) {
      console.log('⚠️  Cannot connect to PostgreSQL database.');
      console.log('\nPlease check the following:');
      console.log('1. Ensure PostgreSQL service is running');
      console.log('2. Verify the connection details in your .env file:');
      console.log(`   Host: ${this.config.host}`);
      console.log(`   Port: ${this.config.port}`);
      console.log(`   User: ${this.config.user}`);
      console.log(`   Password: ${this.config.password ? '****' : '(empty)'}`);
      console.log('3. Make sure PostgreSQL is accepting connections');
      process.exit(1);
    }

    console.log('✓ PostgreSQL is accessible\n');

    // Create database
    console.log('Creating database...');
    const dbCreated = await this.createDatabase();
    if (!dbCreated) {
      console.log('✗ Failed to create database. Exiting.');
      process.exit(1);
    }

    console.log('');

    // Initialize schema
    console.log('Initializing database schema...');
    const schemaInitialized = await this.initializeSchema();
    if (!schemaInitialized) {
      console.log('✗ Failed to initialize database schema.');
      process.exit(1);
    }

    console.log('\n🎉 PostgreSQL database setup completed successfully!');
    console.log(`\nDatabase: ${this.config.database}`);
    console.log(`Host: ${this.config.host}:${this.config.port}`);
    console.log('\nYour application is now configured to use the real PostgreSQL database.');
    console.log('Restart your development server to use the real database instead of mock data.');
  }
}

// Run the initialization if this script is executed directly
const initializer = new DatabaseInitializer();
initializer.initialize().catch(error => {
  console.error('Database initialization failed:', error);
  process.exit(1);
});

export default DatabaseInitializer;