import { Client } from 'pg';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

// Load environment variables
dotenv.config();

// Database connection configuration
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'multi_srms',
  user: process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD || 'postgres',
};

// Create custom ENUM types
const enumTypes = [
  "CREATE TYPE user_role AS ENUM ('admin', 'school')",
  "CREATE TYPE school_status AS ENUM ('Active', 'Inactive')",
  "CREATE TYPE student_gender AS ENUM ('Male', 'Female', 'Other')",
  "CREATE TYPE subscription_plan AS ENUM ('Basic', 'Pro', 'Enterprise')"
];

// Create tables
const createTables = [
  `CREATE TABLE schools (
    id SERIAL PRIMARY KEY,
    iemis_code VARCHAR(50) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    logo_url TEXT,
    municipality VARCHAR(255) NOT NULL,
    estd VARCHAR(50),
    prepared_by VARCHAR(255),
    checked_by VARCHAR(255),
    head_teacher_name VARCHAR(255),
    head_teacher_contact VARCHAR(50),
    email VARCHAR(255) UNIQUE,
    status school_status DEFAULT 'Inactive',
    subscription_plan subscription_plan DEFAULT 'Basic',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  )`,
  
  `CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    school_id INTEGER REFERENCES schools(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  )`,
  
  `CREATE TABLE students (
    id SERIAL PRIMARY KEY,
    student_system_id VARCHAR(50) UNIQUE NOT NULL,
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    dob DATE,
    gender student_gender,
    grade VARCHAR(10) NOT NULL,
    roll_no VARCHAR(20),
    photo_url TEXT,
    academic_year INTEGER NOT NULL,
    symbol_no VARCHAR(50) NOT NULL,
    alph VARCHAR(10),
    registration_id VARCHAR(50) NOT NULL,
    dob_bs VARCHAR(50),
    father_name VARCHAR(255),
    mother_name VARCHAR(255),
    mobile_no VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(school_id, symbol_no, academic_year)
  )`,
  
  `CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    grade INTEGER NOT NULL CHECK (grade IN (11, 12)),
    theory_sub_code VARCHAR(20),
    theory_credit NUMERIC(4, 2) NOT NULL,
    theory_full_marks INTEGER NOT NULL,
    theory_pass_marks INTEGER NOT NULL,
    internal_sub_code VARCHAR(20),
    internal_credit NUMERIC(4, 2) NOT NULL,
    internal_full_marks INTEGER NOT NULL,
    internal_pass_marks INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(name, grade)
  )`,
  
  `CREATE TABLE student_subject_assignments (
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    academic_year INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, subject_id, academic_year)
  )`,
  
  `CREATE TABLE student_marks (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
    academic_year INTEGER NOT NULL,
    theory_obtained NUMERIC(5, 2),
    practical_obtained NUMERIC(5, 2),
    is_absent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, subject_id, academic_year)
  )`,
  
  `CREATE TABLE application_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  )`,
  
  `CREATE TABLE academic_years (
    id SERIAL PRIMARY KEY,
    year INTEGER UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  )`,
  
  `CREATE TABLE otp (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) NOT NULL,
    otp VARCHAR(6) NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
  )`
];

// Create indexes
const createIndexes = [
  "CREATE INDEX idx_users_school_id ON users(school_id)",
  "CREATE INDEX idx_students_school_id_year ON students(school_id, academic_year)",
  "CREATE INDEX idx_students_name ON students(name)",
  "CREATE INDEX idx_students_symbol_no ON students(symbol_no)",
  "CREATE INDEX idx_student_subject_assignments_student_id ON student_subject_assignments(student_id)",
  "CREATE INDEX idx_student_marks_student_id_year ON student_marks(student_id, academic_year)",
  "CREATE INDEX idx_application_settings_key ON application_settings(key)",
  "CREATE INDEX idx_otp_email ON otp(email)",
  "CREATE INDEX idx_otp_expires_at ON otp(expires_at)"
];

// Create trigger function
const createTriggerFunction = `
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';
`;

// Apply triggers to tables
const applyTriggers = [
  "SELECT apply_updated_at_trigger('schools')",
  "SELECT apply_updated_at_trigger('users')",
  "SELECT apply_updated_at_trigger('students')",
  "SELECT apply_updated_at_trigger('subjects')",
  "SELECT apply_updated_at_trigger('student_marks')",
  "SELECT apply_updated_at_trigger('application_settings')",
  "SELECT apply_updated_at_trigger('academic_years')"
];

// Sample data
const sampleSchools = [
  { id: 1, iemisCode: 'SCH001', name: 'Test School 1', municipality: 'Test Municipality 1' },
  { id: 2, iemisCode: 'SCH002', name: 'Test School 2', municipality: 'Test Municipality 2' },
];

async function setupAuthSystem() {
  const client = new Client(dbConfig);
  
  try {
    // Connect to database
    await client.connect();
    console.log('Connected to database');
    
    // Create ENUM types
    console.log('Creating ENUM types...');
    for (const enumType of enumTypes) {
      try {
        await client.query(enumType);
        console.log(`  ✅ Created ENUM type`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`  ℹ️  ENUM type already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }
    
    // Create tables
    console.log('Creating tables...');
    for (const table of createTables) {
      try {
        await client.query(table);
        console.log(`  ✅ Created table`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`  ℹ️  Table already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }
    
    // Create indexes
    console.log('Creating indexes...');
    for (const index of createIndexes) {
      try {
        await client.query(index);
        console.log(`  ✅ Created index`);
      } catch (error) {
        if (error.message.includes('already exists')) {
          console.log(`  ℹ️  Index already exists, skipping...`);
        } else {
          throw error;
        }
      }
    }
    
    // Create trigger function
    console.log('Creating trigger function...');
    await client.query(createTriggerFunction);
    console.log(`  ✅ Created trigger function`);
    
    // Create macro function to apply triggers
    console.log('Creating macro function for triggers...');
    await client.query(`
      CREATE OR REPLACE FUNCTION apply_updated_at_trigger(table_name TEXT)
      RETURNS VOID AS $$
      BEGIN
          EXECUTE 'CREATE TRIGGER update_' || table_name || '_updated_at
                   BEFORE UPDATE ON ' || table_name || '
                   FOR EACH ROW
                   EXECUTE FUNCTION update_updated_at_column();';
      END;
      $$ language 'plpgsql';
    `);
    console.log(`  ✅ Created macro function`);
    
    // Apply triggers to tables
    console.log('Applying triggers to tables...');
    for (const trigger of applyTriggers) {
      try {
        await client.query(trigger);
        console.log(`  ✅ Applied trigger`);
      } catch (error) {
        console.log(`  ℹ️  Trigger may already exist, skipping...`);
      }
    }
    
    // Insert sample schools
    console.log('Inserting sample schools...');
    for (const school of sampleSchools) {
      try {
        await client.query(
          `INSERT INTO schools (id, iemis_code, name, municipality, status) 
           VALUES ($1, $2, $3, $4, 'Active')
           ON CONFLICT (id) DO UPDATE SET
             iemis_code = EXCLUDED.iemis_code,
             name = EXCLUDED.name,
             municipality = EXCLUDED.municipality,
             status = EXCLUDED.status`,
          [school.id, school.iemisCode, school.name, school.municipality]
        );
        console.log(`  ✅ Inserted/updated school: ${school.name}`);
      } catch (error) {
        console.error(`  ❌ Error inserting school ${school.name}:`, error);
      }
    }
    
    console.log('\n🎉 Authentication system setup completed successfully!');
    console.log('Next steps:');
    console.log('1. Run the init-sample-users.ts script to add sample users');
    console.log('2. Start the application server');
    
  } catch (err) {
    console.error('Database setup error:', err);
  } finally {
    await client.end();
    console.log('\nDisconnected from database');
  }
}

// Run the function
setupAuthSystem();