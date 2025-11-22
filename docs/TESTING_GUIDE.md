# Testing Guide: Safe Production Database Cloning

This guide explains how to safely clone your production PostgreSQL database for testing without affecting real data.

## Table of Contents
1. [Clone Production Database](#1-clone-production-database)
2. [Configure Backend for Testing](#2-configure-backend-for-testing)
3. [Sanitize Test Data](#3-sanitize-test-data)
4. [Run System Tests](#4-run-system-tests)
5. [Switch Back to Production](#5-switch-back-to-production)

## 1. Clone Production Database

### 1.1 Create Test Database
```bash
# Connect to PostgreSQL as superuser
psql -U postgres

# Create the test database
CREATE DATABASE multi_srms_test;

# Create a dedicated user for the test database
CREATE USER multi_srms_test_user WITH PASSWORD 'test_password_123';

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE multi_srms_test TO multi_srms_test_user;

# Exit psql
\q
```

### 1.2 Clone Production Data
```bash
# Dump the production database
pg_dump -U postgres -h localhost multi_srms_prod > multi_srms_prod_backup.sql

# Restore to test database
psql -U multi_srms_test_user -h localhost -d multi_srms_test -f multi_srms_prod_backup.sql
```

## 2. Configure Backend for Testing

### 2.1 Environment Configuration
The system uses different environment files:
- `.env` - Default development environment
- `.env.test` - Test environment (created in step 2)
- `.env.production` - Production environment

### 2.2 Start Backend in Test Mode
```bash
# Start backend with test environment
npm run dev:test
```

## 3. Sanitize Test Data

### 3.1 Run Data Sanitization Script
```bash
# Sanitize sensitive data in test database
npm run sanitize:test-data
```

This script will:
- Replace real user emails with test emails
- Set all user passwords to a default test password
- Replace real phone numbers with test numbers
- Update school contact information

## 4. Run System Tests

### 4.1 Automated System Testing
```bash
# Run comprehensive system tests
npm run test:system
```

### 4.2 Manual Testing Checklist
- [ ] Login with test credentials
- [ ] CRUD operations on all entities
- [ ] Pagination functionality
- [ ] File upload/download
- [ ] PDF/Print reports
- [ ] Authentication & authorization checks
- [ ] Email/OTP functionality (using Ethereal)

## 5. Switch Back to Production

### 5.1 Stop Test Environment
```bash
# Stop the test backend server (Ctrl+C if running)
```

### 5.2 Start Production Environment
```bash
# Start backend with production environment
NODE_ENV=production npm run dev:backend
```

Alternatively, you can set the environment variables directly:
```bash
# On Linux/Mac
export NODE_ENV=production
npm run dev:backend

# On Windows
set NODE_ENV=production
npm run dev:backend
```

### 5.3 Update Environment Variables (if needed)
Ensure your `.env.production` file has the correct production values:
- Database connection details
- Email service credentials
- JWT secret
- API URLs

## Security Notes

1. **Never** use production environment variables in test mode
2. **Always** sanitize sensitive data before testing
3. **Never** send real emails during testing (use Ethereal)
4. **Always** verify you're connected to the test database before running tests
5. **Never** run destructive operations on production data

## Troubleshooting

### Database Connection Issues
1. Verify database server is running
2. Check database credentials in `.env.test`
3. Ensure test database user has proper permissions

### Email Issues
1. For testing, Ethereal is automatically configured
2. In production, ensure Gmail credentials are correct
3. For Gmail, use App Passwords instead of regular passwords

### Authentication Issues
1. Run the sanitization script to ensure test users exist
2. Default test password is `TestPass123!`
3. Check JWT secrets match between frontend and backend