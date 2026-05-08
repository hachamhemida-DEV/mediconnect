#!/usr/bin/env bash
# =============================================================================
#  MediConnect — Daily backup
# =============================================================================
#
#  Produces a timestamped tarball in ./backups/ containing:
#    - Postgres dump (pg_dump custom format, compressed)
#    - Uploaded files (CCP receipts, product images)
#
#  Keeps the last 30 days, deletes older ones.
#
#  Cron (run nightly at 03:00):
#    0 3 * * * cd /opt/mediconnect && bash deploy/backup.sh >> backups/backup.log 2>&1
# =============================================================================

set -euo pipefail

STAMP=$(date +%Y%m%d-%H%M%S)
BACKUP_DIR="./backups"
mkdir -p "$BACKUP_DIR"

# Source .env.production to get DB creds.
set -a; source .env.production; set +a

echo "→ [$STAMP] Postgres dump"
docker compose exec -T postgres pg_dump \
  -U "${POSTGRES_USER:-mediconnect}" \
  -d "${POSTGRES_DB:-mediconnect}" \
  --format=custom --compress=9 \
  > "$BACKUP_DIR/db-$STAMP.dump"

echo "→ [$STAMP] Uploads archive"
docker run --rm \
  -v mediconnect_uploads_data:/uploads:ro \
  -v "$(pwd)/$BACKUP_DIR:/backup" \
  alpine tar czf "/backup/uploads-$STAMP.tar.gz" -C /uploads .

# Trim anything older than 30 days.
find "$BACKUP_DIR" -name 'db-*.dump'       -mtime +30 -delete
find "$BACKUP_DIR" -name 'uploads-*.tar.gz' -mtime +30 -delete

echo "✓ Backup complete: $BACKUP_DIR/db-$STAMP.dump + uploads-$STAMP.tar.gz"
