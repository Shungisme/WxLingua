#!/bin/bash

# WxLingua Database Restore Script
# Usage: ./restore.sh [backup_file] [environment]

set -e

BACKUP_FILE=$1
ENVIRONMENT=${2:-production}

if [ -z "$BACKUP_FILE" ]; then
    echo "❌ Error: Please provide backup file"
    echo "Usage: ./restore.sh [backup_file] [environment]"
    exit 1
fi

echo "🔄 WxLingua Restore Script"
echo "================================"
echo "Backup file: $BACKUP_FILE"
echo "Environment: $ENVIRONMENT"
echo "================================"

# Check if backup file exists
if [ ! -f "$BACKUP_FILE" ]; then
    echo "❌ Error: Backup file not found: $BACKUP_FILE"
    exit 1
fi

# Load environment variables
if [ -f "deployment/.env.$ENVIRONMENT" ]; then
    source "deployment/.env.$ENVIRONMENT"
fi

# Determine container name
CONTAINER_NAME="wxlingua_${ENVIRONMENT}_postgres"

# Check if container is running
if ! docker ps | grep -q $CONTAINER_NAME; then
    echo "❌ Error: PostgreSQL container is not running"
    exit 1
fi

# Confirm restore
read -p "⚠️  This will replace current database. Continue? (y/N) " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "❌ Restore cancelled"
    exit 1
fi

# Decompress if needed
if [[ $BACKUP_FILE == *.gz ]]; then
    echo "🗜️  Decompressing backup..."
    gunzip -k $BACKUP_FILE
    BACKUP_FILE="${BACKUP_FILE%.gz}"
fi

# Drop and recreate database
echo "🗑️  Dropping existing database..."
docker exec -t $CONTAINER_NAME psql -U ${DB_USER:-postgres} -c "DROP DATABASE IF EXISTS ${DB_NAME:-wxlingua};"
docker exec -t $CONTAINER_NAME psql -U ${DB_USER:-postgres} -c "CREATE DATABASE ${DB_NAME:-wxlingua};"

# Restore backup
echo "📥 Restoring database..."
docker exec -i $CONTAINER_NAME psql -U ${DB_USER:-postgres} ${DB_NAME:-wxlingua} < $BACKUP_FILE

echo "✅ Restore completed successfully!"
