#!/usr/bin/env bash
# =============================================================================
#  MediConnect — One-shot installer for Ubuntu 22.04 / 24.04
# =============================================================================
#
#  Automates:
#    - System update + essential packages
#    - Docker + docker-compose plugin
#    - UFW firewall (SSH + HTTP + HTTPS only)
#    - DH params generation for Nginx
#    - .env.production skeleton with generated secrets
#
#  Usage (run as root or with sudo):
#    cd mediconnect
#    sudo bash deploy/install.sh
#
#  After this script finishes, edit .env.production with your real values,
#  then bring the stack up:
#    docker compose up -d
#
#  To add SSL later, see DEPLOYMENT.md §3 (certbot standalone mode).
# =============================================================================

set -euo pipefail

log() { printf "\n\033[36m→ %s\033[0m\n" "$*"; }
ok()  { printf "  \033[32m✓\033[0m %s\n" "$*"; }
warn(){ printf "  \033[33m⚠\033[0m %s\n" "$*"; }
fail(){ printf "  \033[31m✗\033[0m %s\n" "$*" >&2; exit 1; }

[[ $EUID -eq 0 ]] || fail "Run with sudo or as root."

log "1/7  System update"
apt-get update -qq
apt-get upgrade -y -qq
ok "apt updated"

log "2/7  Essential packages"
apt-get install -y -qq \
  ca-certificates curl gnupg openssl ufw fail2ban \
  unzip zip jq postgresql-client \
  >/dev/null
ok "installed ca-certificates, curl, openssl, ufw, fail2ban, postgresql-client"

log "3/7  Docker + compose plugin"
if ! command -v docker &>/dev/null; then
  install -m 0755 -d /etc/apt/keyrings
  curl -fsSL https://download.docker.com/linux/ubuntu/gpg | gpg --dearmor -o /etc/apt/keyrings/docker.gpg
  chmod a+r /etc/apt/keyrings/docker.gpg
  . /etc/os-release
  echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $VERSION_CODENAME stable" \
    > /etc/apt/sources.list.d/docker.list
  apt-get update -qq
  apt-get install -y -qq docker-ce docker-ce-cli containerd.io docker-buildx-plugin docker-compose-plugin >/dev/null
  ok "Docker installed"
else
  ok "Docker already installed"
fi
systemctl enable --now docker >/dev/null 2>&1 || true

log "4/7  Firewall (SSH + HTTP + HTTPS)"
ufw --force reset >/dev/null
ufw default deny incoming  >/dev/null
ufw default allow outgoing >/dev/null
ufw allow 22/tcp comment 'SSH'   >/dev/null
ufw allow 80/tcp comment 'HTTP'  >/dev/null
ufw allow 443/tcp comment 'HTTPS' >/dev/null
ufw --force enable >/dev/null
ok "UFW active: 22, 80, 443"

log "5/7  DH params for Nginx (one-time, 2048 bits)"
if [[ ! -f nginx/dhparam.pem ]]; then
  mkdir -p nginx
  openssl dhparam -out nginx/dhparam.pem 2048 2>/dev/null
  ok "nginx/dhparam.pem generated"
else
  ok "nginx/dhparam.pem already exists"
fi

log "6/7  .env.production skeleton"
if [[ ! -f .env.production ]]; then
  cp .env.production.example .env.production
  JWT=$(openssl rand -base64 32)
  PGP=$(openssl rand -base64 24 | tr -d '/=+' | cut -c1-22)
  sed -i "s|^JWT_SECRET=.*|JWT_SECRET=\"$JWT\"|"            .env.production
  sed -i "s|^POSTGRES_PASSWORD=.*|POSTGRES_PASSWORD=\"$PGP\"|" .env.production
  chmod 600 .env.production
  ok ".env.production created with generated JWT_SECRET + POSTGRES_PASSWORD"
  warn "Edit .env.production now — set CCP_* fields and NEXT_PUBLIC_APP_URL"
else
  ok ".env.production already exists (not overwriting)"
fi

log "7/7  Backups directory"
mkdir -p backups && chown -R 1001:1001 backups
ok "backups/ ready"

cat <<EOF

$(printf '\033[32m')═══════════════════════════════════════════════════════════════$(printf '\033[0m')
  $(printf '\033[1m')Setup complete.$(printf '\033[0m') Next steps:

   1. Edit .env.production — set CCP_* fields and NEXT_PUBLIC_APP_URL
   2. Point your DNS A-record at this server's IP
   3. Obtain TLS cert:
        sudo bash deploy/obtain-cert.sh mediconnect.dz
   4. Bring up the stack:
        docker compose up -d
   5. Watch the logs:
        docker compose logs -f app
   6. Seed initial data (first time only):
        docker compose exec app npx prisma db seed

  Full reference: DEPLOYMENT.md
$(printf '\033[32m')═══════════════════════════════════════════════════════════════$(printf '\033[0m')

EOF
