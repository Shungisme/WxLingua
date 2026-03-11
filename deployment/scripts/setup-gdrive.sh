#!/bin/bash
# =============================================================
# WxLingua — Google Drive Backup Setup Helper
# Run this ONCE on the server to configure rclone for GDrive
# =============================================================
#
# Usage:
#   ./setup-gdrive.sh            # interactive OAuth setup (needs browser)
#   ./setup-gdrive.sh --sa       # service account setup (recommended for servers)
#
# After running this script, start the backup service:
#   docker-compose -f deployment/docker-compose.prod.yml up -d backup

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BACKUP_DIR="${SCRIPT_DIR}/../backup"
RCLONE_CONF="${BACKUP_DIR}/rclone.conf"
METHOD="${1:-}"

echo "======================================================"
echo "  WxLingua Google Drive Backup Setup"
echo "======================================================"
echo ""

# ─── Check rclone is available (inside the backup container or on host) ───
if ! command -v rclone &>/dev/null; then
    echo "rclone is not installed on this host."
    echo "We will configure it inside the backup Docker container instead."
    echo ""
    USE_DOCKER=true
else
    USE_DOCKER=false
fi

run_rclone() {
    if [ "$USE_DOCKER" = true ]; then
        docker run --rm -it \
            -v "${BACKUP_DIR}:/config" \
            rclone/rclone "$@"
    else
        rclone "$@"
    fi
}

# ─── Method A: Service Account (recommended) ──────────────────────────────
if [ "$METHOD" = "--sa" ]; then
    echo "=== Method A: Service Account Setup ==="
    echo ""
    echo "Steps:"
    echo "  1. Go to https://console.cloud.google.com"
    echo "  2. Create or select a project"
    echo "  3. APIs & Services → Enable 'Google Drive API'"
    echo "  4. IAM & Admin → Service Accounts → Create Service Account"
    echo "     - Name: wxlingua-backup"
    echo "     - Skip role assignment (we'll share a folder instead)"
    echo "  5. Click the service account → Keys → Add Key → Create new key → JSON"
    echo "  6. Download the JSON file"
    echo "  7. In Google Drive, create folder 'WxLingua/backups'"
    echo "  8. Right-click folder → Share → paste the service account email"
    echo "     (looks like: wxlingua-backup@YOUR_PROJECT.iam.gserviceaccount.com)"
    echo ""
    read -rp "Enter full path to the downloaded service account JSON: " SA_JSON_PATH

    if [ ! -f "$SA_JSON_PATH" ]; then
        echo "File not found: $SA_JSON_PATH"
        exit 1
    fi

    # Copy JSON to backup config folder
    cp "$SA_JSON_PATH" "${BACKUP_DIR}/gdrive-sa.json"
    chmod 600 "${BACKUP_DIR}/gdrive-sa.json"
    echo "Service account JSON copied to ${BACKUP_DIR}/gdrive-sa.json"
    echo ""

    # Generate rclone.conf
    cat > "$RCLONE_CONF" <<EOF
[gdrive]
type = drive
scope = drive
service_account_file = /config/gdrive-sa.json
EOF
    chmod 600 "$RCLONE_CONF"
    echo "rclone.conf created at ${RCLONE_CONF}"
    echo ""

    # Test connection
    echo "Testing Google Drive connection..."
    if run_rclone lsd gdrive: --config /config/rclone.conf 2>&1 | head -5; then
        echo ""
        echo "Connection successful!"
    else
        echo ""
        echo "Connection test failed. Check service account permissions and JSON file."
        exit 1
    fi

# ─── Method B: OAuth (interactive) ────────────────────────────────────────
else
    echo "=== Method B: OAuth Setup (interactive) ==="
    echo ""
    echo "This method requires a browser. If you are on a headless server,"
    echo "run rclone config on a local machine with a browser and copy the"
    echo "generated token/conf here."
    echo ""
    echo "Steps:"
    echo "  1. Go to https://console.cloud.google.com"
    echo "  2. Create or select a project"
    echo "  3. APIs & Services → Enable 'Google Drive API'"
    echo "  4. OAuth consent screen → External → fill in app name"
    echo "  5. Credentials → Create Credentials → OAuth client ID"
    echo "     - Application type: Desktop app"
    echo "  6. Download the client_secrets.json (note client_id and client_secret)"
    echo ""
    read -rp "Press Enter to launch rclone interactive config..."
    echo ""

    if [ "$USE_DOCKER" = true ]; then
        echo "Running rclone config inside Docker (headless mode — copy link to browser)..."
        docker run --rm -it \
            -v "${BACKUP_DIR}:/config" \
            rclone/rclone config \
            --config /config/rclone.conf
    else
        RCLONE_CONFIG="$RCLONE_CONF" rclone config
    fi

    echo ""
    echo "rclone config completed."
fi

echo ""
echo "======================================================"
echo "  Setup complete! Next steps:"
echo "======================================================"
echo ""
echo "  1. Verify the backup folder exists in Google Drive:"
echo "     The folder path set in .env.prod: \${GDRIVE_FOLDER:-WxLingua/backups}"
echo ""
echo "  2. Update deployment/.env.prod if needed:"
echo "     GDRIVE_REMOTE=gdrive"
echo "     GDRIVE_FOLDER=WxLingua/backups"
echo "     GDRIVE_SA_FILE=./backup/gdrive-sa.json  (Method A only)"
echo ""
echo "  3. Start the backup service:"
echo "     docker-compose -f deployment/docker-compose.prod.yml up -d backup"
echo ""
echo "  4. Run a manual test backup:"
echo "     docker-compose -f deployment/docker-compose.prod.yml exec backup /app/backup.sh"
echo ""
echo "  5. Watch logs:"
echo "     docker-compose -f deployment/docker-compose.prod.yml logs -f backup"
echo ""
