#!/usr/bin/env bash
# =============================================================================
#  MediConnect — SSL certificate provisioning
# =============================================================================
#
#  Uses certbot in standalone mode. Stops Nginx briefly to free port 80,
#  runs certbot, then restarts. Needs to be re-run every 90 days — or set
#  up the included systemd timer (deploy/certbot-renew.timer).
#
#  Usage:
#    sudo bash deploy/obtain-cert.sh mediconnect.dz
#    sudo bash deploy/obtain-cert.sh mediconnect.dz www.mediconnect.dz
# =============================================================================

set -euo pipefail

[[ $EUID -eq 0 ]] || { echo "Run with sudo"; exit 1; }
[[ $# -ge 1 ]]    || { echo "Usage: $0 <domain> [more-domains...]"; exit 1; }

DOMAIN_ARGS=""
for d in "$@"; do
  DOMAIN_ARGS+=" -d $d"
done

if ! command -v certbot &>/dev/null; then
  echo "→ Installing certbot"
  apt-get update -qq
  apt-get install -y -qq certbot
fi

# Stop whatever is on :80 so certbot standalone can bind to it.
echo "→ Pausing Nginx while certbot runs"
docker compose stop nginx 2>/dev/null || true
# In case nothing is running yet, also try systemctl just in case.
systemctl stop nginx 2>/dev/null || true

echo "→ Running certbot"
certbot certonly --standalone --non-interactive --agree-tos \
  --email "admin@$1" \
  $DOMAIN_ARGS

echo "→ Restarting Nginx"
docker compose up -d nginx

echo "✓ Certificate installed at /etc/letsencrypt/live/$1/"
echo "  Test renewal:   certbot renew --dry-run"
echo "  Schedule cron:  echo '0 3 * * * root certbot renew --quiet && docker compose exec nginx nginx -s reload' > /etc/cron.d/certbot-renew"
