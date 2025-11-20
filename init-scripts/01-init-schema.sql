-- =================================================================
-- PostgreSQL Database Schema for Multi-School Result Management System
-- Version 2.3
-- =================================================================
-- Changelog:
-- v2.3:
--   - Modified users table to use iemis_code instead of email for authentication
--   - Added iemis_code column to users table
--   - Made email optional in users table
-- v2.2:
--   - Added `subscription_plan` column to `schools` table with a corresponding ENUM type.
--   - Added `alph` column to `students` table.
--   - Added `application_settings` table to store global configurations (e.g., page visibility) as JSONB.
-- v2.1:
--   - Added `extra_credit_assignments` table to manage optional, non-GPA subjects.
--   - Changed default status for `schools.status` to 'Inactive' to align with the registration approval flow.
--   - Expanded the trigger section to explicitly show application to all relevant tables.
-- v2.0:
--   - Initial production-ready schema.
-- =================================================================
-- This schema is designed for production use, emphasizing robustness, data integrity, and scalability.
-- It defines the core tables, their relationships with explicit foreign key actions, and indexes for optimal performance.

-- Create custom ENUM types for roles and statuses to ensure data consistency and constraint validation.
CREATE TYPE user_role AS ENUM ('admin', 'school');
CREATE TYPE school_status AS ENUM ('Active', 'Inactive');
CREATE TYPE student_gender AS ENUM ('Male', 'Female', 'Other');
CREATE TYPE subscription_plan AS ENUM ('Basic', 'Pro', 'Enterprise');

-- =============================================
-- Table: schools
-- Purpose: Stores information about each school registered in the system.
-- =============================================
CREATE TABLE schools (
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
);

-- =============================================
-- Table: users
-- Purpose: Manages authentication, roles, and authorization for system access.
-- =============================================
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    iemis_code VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(255) UNIQUE,  -- Email is now optional
    password_hash VARCHAR(255) NOT NULL,
    role user_role NOT NULL,
    -- A user can be associated with a specific school (e.g., a school account).
    -- ON DELETE SET NULL: If a school is deleted, the associated user account is not deleted, 
    -- but its link to the school is severed. This prevents accidental user deletion.
    school_id INTEGER REFERENCES schools(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Table: students
-- Purpose: Stores detailed records of each student.
-- =============================================
CREATE TABLE students (
    id SERIAL PRIMARY KEY, -- Using SERIAL for robust identification.
    student_system_id VARCHAR(50) UNIQUE NOT NULL, -- Corresponds to `Student.id` in the frontend type.
    -- ON DELETE CASCADE: If a school is deleted, all its students are also deleted.
    school_id INTEGER NOT NULL REFERENCES schools(id) ON DELETE CASCADE,
    name VARCHAR(255) NOT NULL,
    dob DATE, -- Date of Birth (AD)
    gender student_gender,
    grade VARCHAR(10) NOT NULL,
    roll_no VARCHAR(20),
    photo_url TEXT,
    academic_year INTEGER NOT NULL, -- e.g., 2082
    symbol_no VARCHAR(50) NOT NULL,
    alph VARCHAR(10),
    registration_id VARCHAR(50) NOT NULL,
    dob_bs VARCHAR(50), -- Date of Birth (BS)
    father_name VARCHAR(255),
    mother_name VARCHAR(255),
    mobile_no VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    -- Constraint: A symbol number must be unique for a specific school in a given academic year.
    UNIQUE(school_id, symbol_no, academic_year) 
);

-- =============================================
-- Table: subjects
-- Purpose: Stores details of all subjects offered, for Grade 11 and 12.
-- =============================================
CREATE TABLE subjects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    grade INTEGER NOT NULL CHECK (grade IN (11, 12)), -- Ensures only grade 11 or 12 is entered.
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
    UNIQUE(name, grade) -- A subject name should be unique within a grade.
);

-- =============================================
-- Table: student_subject_assignments (Junction Table)
-- Purpose: Maps which students are taking which subjects in a given academic year (Many-to-Many relationship).
-- =============================================
CREATE TABLE student_subject_assignments (
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    academic_year INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (student_id, subject_id, academic_year)
);

-- =============================================
-- Table: extra_credit_assignments
-- Purpose: Maps a student to a single optional extra credit subject per academic year.
-- This subject does not contribute to the GPA calculation.
-- =============================================
CREATE TABLE extra_credit_assignments (
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE CASCADE,
    academic_year INTEGER NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    -- A student can have only one extra credit subject per year.
    PRIMARY KEY (student_id, academic_year)
);

-- =============================================
-- Table: student_marks
-- Purpose: Stores the marks obtained by a student in a specific subject for a year.
-- =============================================
CREATE TABLE student_marks (
    id SERIAL PRIMARY KEY,
    student_id INTEGER NOT NULL REFERENCES students(id) ON DELETE CASCADE,
    -- ON DELETE RESTRICT: Prevents a subject from being deleted if marks records exist for it.
    subject_id INTEGER NOT NULL REFERENCES subjects(id) ON DELETE RESTRICT,
    academic_year INTEGER NOT NULL,
    theory_obtained NUMERIC(5, 2),
    practical_obtained NUMERIC(5, 2),
    is_absent BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(student_id, subject_id, academic_year)
);

-- =============================================
-- Table: application_settings
-- Purpose: Stores global key-value settings for the application, such as feature flags or UI configurations.
-- =============================================
CREATE TABLE application_settings (
    id SERIAL PRIMARY KEY,
    key VARCHAR(255) UNIQUE NOT NULL,
    value JSONB NOT NULL,
    description TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Table: academic_years
-- Purpose: Stores the list of academic years available in the system.
-- =============================================
CREATE TABLE academic_years (
    id SERIAL PRIMARY KEY,
    year INTEGER UNIQUE NOT NULL,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- =============================================
-- Indexes for Performance Optimization
-- =============================================
-- Indexes on foreign keys and frequently queried columns to speed up joins and searches.
CREATE INDEX idx_users_school_id ON users(school_id);
CREATE INDEX idx_students_school_id_year ON students(school_id, academic_year);
CREATE INDEX idx_students_name ON students(name);
CREATE INDEX idx_students_symbol_no ON students(symbol_no);
CREATE INDEX idx_student_subject_assignments_student_id ON student_subject_assignments(student_id);
CREATE INDEX idx_extra_credit_assignments_student_id ON extra_credit_assignments(student_id);
CREATE INDEX idx_student_marks_student_id_year ON student_marks(student_id, academic_year);
CREATE INDEX idx_application_settings_key ON application_settings(key);

-- =============================================
-- Trigger for automatic `updated_at` timestamp
-- =============================================
-- This function and trigger ensure the `updated_at` column is automatically
-- updated whenever a row in any table is modified.
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create a macro function to apply the trigger easily
CREATE OR REPLACE FUNCTION apply_updated_at_trigger(table_name TEXT)
RETURNS VOID AS $$
BEGIN
    EXECUTE 'CREATE TRIGGER update_' || table_name || '_updated_at
             BEFORE UPDATE ON ' || table_name || '
             FOR EACH ROW
             EXECUTE FUNCTION update_updated_at_column();';
END;
$$ language 'plpgsql';

-- Apply the trigger to all tables with an `updated_at` column
SELECT apply_updated_at_trigger('schools');
SELECT apply_updated_at_trigger('users');
SELECT apply_updated_at_trigger('students');
SELECT apply_updated_at_trigger('subjects');
SELECT apply_updated_at_trigger('student_marks');
SELECT apply_updated_at_trigger('application_settings');
SELECT apply_updated_at_trigger('academic_years');


-- =============================================
-- End of Schema
-- =============================================