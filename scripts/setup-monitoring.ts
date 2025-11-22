#!/usr/bin/env node

/**
 * Production Monitoring Setup Script
 * 
 * This script sets up basic monitoring for the Multi-School Result Management System.
 * It includes health checks, resource monitoring, and alerting mechanisms.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { exec } from 'child_process';
import { promisify } from 'util';

// Get __dirname equivalent for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const execPromise = promisify(exec);

// Create monitoring directory
const monitoringDir = path.join(__dirname, '../monitoring');
if (!fs.existsSync(monitoringDir)) {
  fs.mkdirSync(monitoringDir, { recursive: true });
}

// Create a simple health check script
const healthCheckScript = `#!/usr/bin/env node

/**
 * Simple Health Check Script
 * 
 * This script performs basic health checks on the application.
 */

import http from 'http';

// Check if the backend API is running
function checkBackendHealth() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3002,
      path: '/api/health',
      method: 'GET',
      timeout: 5000
    };

    const req = http.request(options, (res) => {
      resolve({
        status: res.statusCode === 200 ? 'healthy' : 'unhealthy',
        statusCode: res.statusCode
      });
    });

    req.on('error', (error) => {
      resolve({
        status: 'unhealthy',
        error: error.message
      });
    });

    req.on('timeout', () => {
      req.destroy();
      resolve({
        status: 'unhealthy',
        error: 'Request timeout'
      });
    });

    req.end();
  });
}

// Check database connectivity
function checkDatabaseHealth() {
  // This would require actual database connection logic
  // For now, we'll just return a mock response
  return Promise.resolve({
    status: 'unknown',
    message: 'Database health check not implemented'
  });
}

// Main health check function
async function performHealthCheck() {
  const backend = await checkBackendHealth();
  const database = await checkDatabaseHealth();

  const overallStatus = backend.status === 'healthy' ? 'healthy' : 'unhealthy';

  const report = {
    timestamp: new Date().toISOString(),
    status: overallStatus,
    components: {
      backend: backend,
      database: database
    }
  };

  console.log(JSON.stringify(report, null, 2));
  return report;
}

// Run health check
performHealthCheck().catch(console.error);
`;

fs.writeFileSync(path.join(monitoringDir, 'health-check.js'), healthCheckScript);

// Create a simple backup script
const backupScript = `#!/usr/bin/env bash

# Database Backup Script
# This script creates a backup of the production database

# Configuration
DB_NAME="multi_srms_new"
BACKUP_DIR="./backups"
DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/backup_$DATE.sql"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Create database backup
pg_dump -h localhost -p 5432 -U postgres $DB_NAME > $BACKUP_FILE

if [ $? -eq 0 ]; then
  echo "Database backup created successfully: $BACKUP_FILE"
  
  # Compress the backup
  gzip $BACKUP_FILE
  echo "Backup compressed: $BACKUP_FILE.gz"
  
  # Remove backups older than 7 days
  find $BACKUP_DIR -name "backup_*.sql.gz" -mtime +7 -delete
  echo "Old backups cleaned up"
else
  echo "Database backup failed"
  exit 1
fi
`;

fs.writeFileSync(path.join(monitoringDir, 'backup.sh'), backupScript);
fs.chmodSync(path.join(monitoringDir, 'backup.sh'), 0o755);

// Create a simple monitoring configuration
const monitoringConfig = {
  healthCheckInterval: 30000, // 30 seconds
  alertThresholds: {
    cpuUsage: 80,
    memoryUsage: 80,
    responseTime: 5000 // 5 seconds
  },
  notification: {
    email: "admin@multi_srms.com",
    slackWebhook: ""
  }
};

fs.writeFileSync(path.join(monitoringDir, 'config.json'), JSON.stringify(monitoringConfig, null, 2));

console.log('Production monitoring setup completed successfully!');
console.log('Created files:');
console.log('- monitoring/health-check.js');
console.log('- monitoring/backup.sh');
console.log('- monitoring/config.json');