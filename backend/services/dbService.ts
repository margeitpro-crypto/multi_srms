import dotenv from 'dotenv';
dotenv.config();

import { Pool, QueryResult } from 'pg';
import logger from './logger';

// Import real database services
import * as realSchoolsService from './schoolsService';
import * as realStudentsService from './studentsService';
import * as realSubjectsService from './subjectsService';
import * as realStudentSubjectAssignmentsService from './studentSubjectAssignmentsService';
import * as realStudentMarksService from './studentMarksService';
import * as realUsersService from './usersService';
import * as realOtpService from './otpService';

// Database connection pool
let pool: Pool | null = null;

async function initializeDatabaseConnection() {
  try {
    // Connect to Supabase database
    const supabaseDbUrl = process.env.SUPABASE_DB_URL;
    
    if (supabaseDbUrl) {
      logger.info('Connecting to Supabase database...');
      logger.info('Supabase DB URL:', supabaseDbUrl);
      pool = new Pool({
        connectionString: supabaseDbUrl,
        ssl: { rejectUnauthorized: false }
      });
      
      // Test the connection
      const client = await pool.connect();
      await client.query('SELECT 1');
      client.release();
      
      logger.info('Successfully connected to Supabase database');
    } else {
      throw new Error('SUPABASE_DB_URL environment variable is not set');
    }
  } catch (error) {
    logger.error('Database connection failed:', error);
    // Instead of falling back to mock services, we'll throw an error
    throw new Error('Failed to connect to Supabase database. Please check your database configuration.');
  }
}

// Initialize the database connection
initializeDatabaseConnection();

// Helper function to execute queries
export async function query(text: string, params?: any[]): Promise<QueryResult> {
  // Remove mock service fallback
  if (!pool) {
    throw new Error('Database connection not initialized');
  }
  
  const start = Date.now();
  const res = await pool.query(text, params);
  const duration = Date.now() - start;
  logger.debug('Executed query', { query: text, duration, rows: res.rowCount });
  return res;
}

// Export only real services
export const schoolsService = realSchoolsService;
export const studentsService = realStudentsService;
export const subjectsService = realSubjectsService;
export const studentSubjectAssignmentsService = realStudentSubjectAssignmentsService;
export const studentMarksService = realStudentMarksService;
export const usersService = realUsersService;
export const otpService = realOtpService;

export default {
  query
};