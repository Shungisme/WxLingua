#!/bin/bash

# WxLingua Database Backup Script
# Usage: ./backup.sh [environment] [--upload]
#
# Options:
#   environment   production | staging | dev (default: production)
#   --upload      upload the backup to Google Drive via rclone after creating it
#
# Examples:
#   ./backup.sh production          # local backup only
#   ./backup.sh production --upload # backup + upload to Google Drive

set -e

ENVIRONMENT=${1:-production}
UPLOAD=false
for arg in "$@"; do
    [ "$arg" = "--upload" ] && UPLOAD=true
done

BACKUP_DIR="./backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/wxlingua_${ENVIRONMENT}_${TIMESTAMP}.sql"

echo "💾 WxLingua Backup Script"
echo "================================"
echo "Environment: $ENVIRONMENT"
echo "Backup directory: $BACKUP_DIR"
echo "Upload to GDrive: $UPLOAD"
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
docker exec -t $CONTAINER_NAME pg_dump \
    -U ${DB_USER:-postgres} \
    --no-owner --no-acl \
    ${DB_NAME:-wxlingua} > $BACKUP_FILE

# Compress backup
echo "🗜️  Compressing backup..."
gzip $BACKUP_FILE
COMPRESSED="${BACKUP_FILE}.gz"

# Keep only last 30 days of backups
echo "🧹 Cleaning old backups..."
find $BACKUP_DIR -name "*.gz" -mtime +30 -delete

echo "✅ Backup completed successfully!"
echo "Backup file: ${COMPRESSED}"
echo "Size: $(du -h ${COMPRESSED} | cut -f1)"

# ─── Optional: Upload to Google Drive ────────────────────────────────
if [ "$UPLOAD" = true ]; then
    echo ""
    echo "☁️  Uploading to Google Drive..."

    GDRIVE_REMOTE="${GDRIVE_REMOTE:-gdrive}"
    GDRIVE_FOLDER="${GDRIVE_FOLDER:-WxLingua/backups}"
    GDRIVE_DEST="${GDRIVE_REMOTE}:${GDRIVE_FOLDER}"

    if ! command -v rclone &>/dev/null; then
        echo "❌ rclone not found. Install it first: https://rclone.org/install/"
        echo "   Or use the Docker backup service (deployment/backup/) for automated uploads."
        exit 1
    fi

    if ! rclone listremotes | grep -q "^${GDRIVE_REMOTE}:"; then
        echo "❌ rclone remote '${GDRIVE_REMOTE}' not configured."
        echo "   Run: ./deployment/scripts/setup-gdrive.sh"
        exit 1
    fi

    rclone copy "$COMPRESSED" "$GDRIVE_DEST" --progress
    echo "✅ Uploaded to ${GDRIVE_DEST}/$(basename ${COMPRESSED})"
fi
