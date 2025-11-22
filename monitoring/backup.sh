#!/usr/bin/env bash

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
