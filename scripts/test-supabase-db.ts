import { Client } from 'pg';
import dotenv from 'dotenv';

const envMode = process.env.APP_ENV || process.env.NODE_ENV;
const envFile = process.env.ENV_FILE
  || (envMode === 'test'
    ? '.env.test'
    : envMode === 'production'
    ? '.env.production'
    : envMode === 'supabase'
    ? '.env.supabase'
    : '.env');

dotenv.config({ path: envFile });

async function main() {
  try {
    const connectionString = process.env.SUPABASE_DB_URL;

    if (!connectionString) {
      console.error('SUPABASE_DB_URL is not set. Please update your environment configuration.');
      process.exit(1);
    }

    const client = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });

    await client.connect();
    console.log('✅ Connected to Supabase database');

    const tablesResult = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    console.log(`Found ${tablesResult.rows.length} tables in public schema`);

    const existingTables = new Set(tablesResult.rows.map(row => row.table_name));
    const sampleTables = ['schools', 'students', 'subjects', 'student_marks'];
    for (const table of sampleTables) {
      if (!existingTables.has(table)) {
        console.warn(` - ${table}: table not found`);
        continue;
      }

      const countResult = await client.query(`SELECT COUNT(*) FROM ${table}`);
      console.log(` - ${table}: ${countResult.rows[0].count} rows`);
    }

    await client.end();
    console.log('Supabase schema verification complete.');
  } catch (error) {
    console.error('Error verifying Supabase database:', error);
    process.exit(1);
  }
}

main();
