#!/bin/bash

# WxLingua Database Backup Script
# Usage: ./backup.sh [environment]

set -e

ENVIRONMENT=${1:-production}
BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/wxlingua_${ENVIRONMENT}_${TIMESTAMP}.sql"

echo "💾 WxLingua Backup Script"
echo "================================"
echo "Environment: $ENVIRONMENT"
echo "Backup directory: $BACKUP_DIR"
echo "================================"

# Create backup directory if it doesn't exist
mkdir -p $BACKUP_DIR

# Load environment variables
if [ -f "deployment/.env.$ENVIRONMENT" ]; then
    source "deployment/.env.$ENVIRONMENT"
fi

# Determine container name
CONTAINER_NAME="wxlingua_${ENVIRONMENT}_postgres"

echo "📦 Creating database backup..."

# Check if container is running
if ! docker ps | grep -q $CONTAINER_NAME; then
    echo "❌ Error: PostgreSQL container is not running"
    exit 1
fi

# Create backup
docker exec -t $CONTAINER_NAME pg_dump -U ${DB_USER:-postgres} ${DB_NAME:-wxlingua} > $BACKUP_FILE

# Compress backup
echo "🗜️  Compressing backup..."
gzip $BACKUP_FILE

# Keep only last 30 days of backups
echo "🧹 Cleaning old backups..."
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "✅ Backup completed successfully!"
echo "Backup file: ${BACKUP_FILE}.gz"
echo "Size: $(du -h ${BACKUP_FILE}.gz | cut -f1)"
