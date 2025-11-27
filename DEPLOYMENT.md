# Production Deployment Guide

## Prerequisites
- Node.js (version 18 or higher)
- PostgreSQL database or Supabase account
- Environment variables configured

## Build Process

1. Install dependencies:
```bash
npm install
```

2. Build the frontend:
```bash
npm run build
```

3. Set environment variables:
Create a `.env` file in the root directory with the following variables:
```
DATABASE_URL=your_database_connection_string
SUPABASE_URL=your_supabase_project_url
SUPABASE_KEY=your_supabase_anon_key
JWT_SECRET=your_jwt_secret_key
PORT=3002
NODE_ENV=production
```

## Starting the Application

Start the application in production mode:
```bash
npm start
```

The application will be available at `http://localhost:3002` (or your configured PORT).

## Process Management

For production deployments, it's recommended to use a process manager like PM2:

1. Install PM2 globally:
```bash
npm install -g pm2
```

2. Start the application with PM2:
```bash
pm2 start start-production.js --name "multi-srms"
```

3. Set PM2 to start on system boot:
```bash
pm2 startup
pm2 save
```

## Database Setup

If starting with a fresh database:

1. Initialize the database schema:
```bash
npm run init:db
```

2. Add initial academic years:
```bash
npm run init:academic-years
```

3. Add initial application settings:
```bash
npm run init:app-settings
```

4. Add an admin user:
```bash
npm run add:admin
```

## Health Checks

The application exposes a health check endpoint at:
```
GET /api/health
```

This can be used for monitoring and uptime checks.

## Backup and Monitoring

Regular database backups are recommended. The application includes a backup script:
```bash
npm run backup:db
```

Health monitoring can be enabled with:
```bash
npm run monitor:health
```