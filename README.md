<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# Multi School Result Management System (Grade 11-12)

This is a comprehensive school result management system for Grade 11 and 12 institutions, built with React, Node.js, and Supabase.

## Prerequisites
- Node.js (v16 or higher)
- Supabase account and project

## Setup Instructions

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure Supabase:
   - The project is already configured to use Supabase
   - Database connection details are in the `.env` file
   - Make sure your Supabase project is properly set up

3. Run database migrations:
   ```bash
   npm run migrate:db-automation
   ```

4. Seed the database with initial data:
   ```bash
   npm run test:supabase-db
   ```

5. Run the development server:
   ```bash
   npm run dev
   ```

6. Access the application:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3002

## Available Scripts

- `npm run dev` - Start frontend development server
- `npm run dev:backend` - Start backend development server
- `npm run migrate:db-automation` - Run full Supabase database migration
- `npm run test:supabase-db` - Test Supabase database connection and schema
- `npm run build` - Build the application for production