# Complete Setup Instructions

## Overview
This document provides step-by-step instructions to get the Multi-School Result Management System fully operational with PostgreSQL database connectivity.

## Prerequisites
- Node.js (version 16 or higher)
- npm (comes with Node.js)
- Git (for version control)

## Step 1: Install PostgreSQL

### Windows
1. Download PostgreSQL from https://www.postgresql.org/download/windows/
2. Run the installer and follow the setup wizard
3. During installation:
   - Set password to empty (press Enter when prompted)
   - Keep default port 5432
   - Select all default components
4. Complete the installation

### macOS
```bash
# Using Homebrew
brew install postgresql

# Start PostgreSQL service
brew services start postgresql
```

### Ubuntu/Debian
```bash
# Update package list
sudo apt update

# Install PostgreSQL
sudo apt install postgresql postgresql-contrib

# Start PostgreSQL service
sudo systemctl start postgresql
sudo systemctl enable postgresql
```

## Step 2: Configure PostgreSQL User

### Windows/macOS/Linux
```bash
# Switch to postgres user
sudo -u postgres psql

# In PostgreSQL shell, create the required user
CREATE USER postgres SUPERUSER;

# Set empty password for postgres user
ALTER USER postgres PASSWORD '';

# Create the database
CREATE DATABASE multi_srms_new;

# Grant privileges
GRANT ALL PRIVILEGES ON DATABASE multi_srms_new TO postgres;

# Exit PostgreSQL
\q
```

## Step 3: Verify Database Configuration

Check your `.env` file in the project root:
```env
# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_NAME=multi_srms_new
DB_USER=postgres
DB_PASS=
DB_SSL=false

# API Configuration
PORT=3002
VITE_API_URL=http://localhost:3002
```

## Step 4: Initialize Database Schema

From the project root directory:
```bash
# Install dependencies (if not already done)
npm install

# Initialize database schema
npm run init:db
```

## Step 5: Test Database Connection

```bash
# Test database connectivity
npm run test-db-connection
```

Expected output:
```
Testing database connection...
✓ Successfully connected to PostgreSQL database
✓ Database query test successful: [current timestamp]
```

## Step 6: Start Backend Server

```bash
# Start backend API server
npm run dev:backend
```

The backend should start on port 3002.

## Step 7: Start Frontend Development Server

In a new terminal:
```bash
# Start frontend development server
npm run dev
```

The frontend should start on port 3003 (or next available port).

## Step 8: Access the Application

1. Open your browser to http://localhost:3003
2. You should see the application homepage
3. Navigate to http://localhost:3003/login to access the login page

## Step 9: Create Initial Admin User

```bash
# Create an admin user
npm run add:admin
```

Follow the prompts to create an admin user with:
- IEMIS Code: ADMIN001
- Password: admin123

## Step 10: Verify Full System Functionality

1. Log in with admin credentials
2. Navigate to different sections (Schools, Students, Subjects)
3. Test CRUD operations
4. Verify grade calculation
5. Test report generation
6. Test print functionality

## Troubleshooting

### Common Issues

1. **Database Connection Failed**
   - Ensure PostgreSQL service is running
   - Check that port 5432 is not blocked by firewall
   - Verify database name and user credentials

2. **Port Conflicts**
   - If port 3002 is in use, update PORT in .env
   - Update VITE_API_URL accordingly

3. **Permission Errors**
   - Ensure postgres user has SUPERUSER privileges
   - Check database ownership and permissions

4. **Module Not Found Errors**
   - Run `npm install` to install all dependencies
   - Check Node.js version compatibility

### Useful Commands

```bash
# Check if PostgreSQL is running
# Windows
pg_ctl -D "C:\Program Files\PostgreSQL\14\data" status

# macOS
brew services list | grep postgresql

# Ubuntu
sudo systemctl status postgresql

# Test database connection manually
psql -h localhost -p 5432 -U postgres -d multi_srms_new

# View database tables
psql -h localhost -p 5432 -U postgres -d multi_srms_new -c "\dt"

# Reset database (use with caution)
npm run init:db -- --reset
```

## Production Deployment

For production deployment:

1. Update `.env.production` with production database credentials
2. Set up SSL certificates
3. Configure reverse proxy (nginx/Apache)
4. Implement backup strategies
5. Set up monitoring and logging
6. Run security audits

## Support

If you encounter any issues during setup:

1. Check the error messages carefully
2. Verify all prerequisites are met
3. Ensure PostgreSQL is properly installed and running
4. Confirm environment variables are correctly set
5. Review the database user permissions

For additional help, refer to:
- PostgreSQL documentation: https://www.postgresql.org/docs/
- Node.js documentation: https://nodejs.org/en/docs/
- Project documentation in the `docs/` directory