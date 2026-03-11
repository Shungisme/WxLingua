#!/bin/bash
# =============================================================
# WxLingua — Automated Database Backup & Google Drive Upload
# Runs inside the backup Docker container each day at 2 AM
# =============================================================

set -euo pipefail

# ─── Config (injected via environment variables) ──────────────
POSTGRES_HOST="${DB_HOST:-postgres}"
POSTGRES_PORT="${DB_PORT:-5432}"
POSTGRES_USER="${DB_USER:-postgres}"
POSTGRES_PASSWORD="${DB_PASSWORD}"
POSTGRES_DB="${DB_NAME:-wxlingua}"
ENVIRONMENT="${ENVIRONMENT:-production}"

BACKUP_DIR="/backups"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
DATE_LABEL=$(date +%Y-%m-%d)
BACKUP_FILE="${BACKUP_DIR}/wxlingua_${ENVIRONMENT}_${TIMESTAMP}.sql"
COMPRESSED_FILE="${BACKUP_FILE}.gz"

# Google Drive remote name as configured in rclone.conf
GDRIVE_REMOTE="${GDRIVE_REMOTE:-gdrive}"
GDRIVE_FOLDER="${GDRIVE_FOLDER:-WxLingua/backups}"

# Retention: how many days of local backups to keep
LOCAL_RETENTION_DAYS="${LOCAL_RETENTION_DAYS:-7}"
# Number of daily backups to keep on Google Drive (0 = keep all)
GDRIVE_RETENTION_COUNT="${GDRIVE_RETENTION_COUNT:-30}"

LOG_PREFIX="[$(date '+%Y-%m-%d %H:%M:%S')]"

# ─── Helpers ──────────────────────────────────────────────────
log()   { echo "${LOG_PREFIX} $*"; }
error() { echo "${LOG_PREFIX} ERROR: $*" >&2; }

check_postgres() {
    PGPASSWORD="$POSTGRES_PASSWORD" pg_isready \
        -h "$POSTGRES_HOST" -p "$POSTGRES_PORT" -U "$POSTGRES_USER" \
        -d "$POSTGRES_DB" -q
}

cleanup_local() {
    log "Cleaning local backups older than ${LOCAL_RETENTION_DAYS} days..."
    find "$BACKUP_DIR" -name "wxlingua_*.sql.gz" \
        -mtime "+${LOCAL_RETENTION_DAYS}" -delete
    local count
    count=$(find "$BACKUP_DIR" -name "wxlingua_*.sql.gz" | wc -l)
    log "Local backups retained: ${count}"
}

cleanup_gdrive() {
    if [ "${GDRIVE_RETENTION_COUNT}" -le 0 ]; then
        return
    fi
    log "Pruning Google Drive: keeping last ${GDRIVE_RETENTION_COUNT} backups..."
    # List all backup files sorted by name (date embedded), delete oldest
    rclone ls "${GDRIVE_REMOTE}:${GDRIVE_FOLDER}" \
        --include "wxlingua_*.sql.gz" 2>/dev/null \
        | sort -k2 \
        | head -n -"${GDRIVE_RETENTION_COUNT}" \
        | awk '{print $2}' \
        | while read -r fname; do
            log "  Deleting old remote backup: ${fname}"
            rclone deletefile "${GDRIVE_REMOTE}:${GDRIVE_FOLDER}/${fname}" || true
        done
}

# ─── Main ─────────────────────────────────────────────────────
log "=========================================="
log "WxLingua DB Backup — ${ENVIRONMENT}"
log "Start: $(date)"
log "=========================================="

# 1. Wait for PostgreSQL to be ready (max 60s)
log "Checking PostgreSQL connectivity..."
for i in $(seq 1 12); do
    if check_postgres; then
        log "PostgreSQL is ready."
        break
    fi
    if [ "$i" -eq 12 ]; then
        error "PostgreSQL not reachable after 60 seconds. Aborting."
        exit 1
    fi
    log "Waiting for PostgreSQL... (${i}/12)"
    sleep 5
done

# 2. Create snapshot
mkdir -p "$BACKUP_DIR"
log "Creating pg_dump snapshot → ${COMPRESSED_FILE}..."

PGPASSWORD="$POSTGRES_PASSWORD" pg_dump \
    -h "$POSTGRES_HOST" \
    -p "$POSTGRES_PORT" \
    -U "$POSTGRES_USER" \
    -d "$POSTGRES_DB" \
    --no-password \
    --format=plain \
    --no-owner \
    --no-acl \
    | gzip > "$COMPRESSED_FILE"

BACKUP_SIZE=$(du -sh "$COMPRESSED_FILE" | cut -f1)
log "Snapshot created: ${COMPRESSED_FILE} (${BACKUP_SIZE})"

# 3. Verify rclone config
if ! rclone listremotes | grep -q "^${GDRIVE_REMOTE}:"; then
    error "rclone remote '${GDRIVE_REMOTE}' not found in config."
    error "Check /config/rclone.conf inside the container."
    error "Backup saved locally only: ${COMPRESSED_FILE}"
    exit 2
fi

# 4. Upload to Google Drive
GDRIVE_DEST="${GDRIVE_REMOTE}:${GDRIVE_FOLDER}"
log "Uploading to Google Drive → ${GDRIVE_DEST}..."

rclone copy "$COMPRESSED_FILE" "$GDRIVE_DEST" \
    --progress \
    --stats-one-line \
    --stats 10s

log "Upload complete."

# 5. Verify upload
REMOTE_SIZE=$(rclone size "${GDRIVE_DEST}/$(basename "$COMPRESSED_FILE")" 2>/dev/null \
    | grep "Total size" | awk '{print $NF}' || echo "unknown")
log "Remote file size: ${REMOTE_SIZE}"

# 6. Cleanup
cleanup_local
cleanup_gdrive

log "=========================================="
log "Backup completed successfully."
log "  File   : $(basename "$COMPRESSED_FILE")"
log "  Size   : ${BACKUP_SIZE}"
log "  Remote : ${GDRIVE_DEST}"
log "  End    : $(date)"
log "=========================================="
