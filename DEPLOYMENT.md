# MediConnect — Deployment Guide (دليل النشر)

> Production deployment on an Algerian VPS (IDJI, Ayrade, DZSecurity, or any Ubuntu host).
> Tested on Ubuntu 22.04 and 24.04. Should also work on Debian 12.

---

## Contents · المحتوى

- [Option A: Docker Compose (recommended)](#option-a-docker-compose-recommended)
- [Option B: PM2 + systemd (traditional)](#option-b-pm2--systemd-traditional)
- [Option C: Vercel (zero-config SaaS)](#option-c-vercel-zero-config-saas)
- [Obtaining SSL certificates](#obtaining-ssl-certificates)
- [Backups](#backups)
- [Upgrades & rollback](#upgrades--rollback)
- [Monitoring & logs](#monitoring--logs)
- [Troubleshooting](#troubleshooting)
- [Production checklist before launch](#production-checklist-before-launch)

---

## Requirements

| Resource | Minimum | Recommended |
|---|---|---|
| CPU | 1 vCPU | 2 vCPU |
| RAM | 2 GB | 4 GB |
| Disk | 20 GB SSD | 40 GB SSD |
| OS | Ubuntu 22.04 | Ubuntu 24.04 |
| Bandwidth | 1 TB/month | — |

**Domain name**: Point an `A` record at your server's public IP. Both `mediconnect.dz` and `www.mediconnect.dz` should resolve to it before you run certbot.

---

## Option A: Docker Compose (recommended)

This runs three containers: the app, Postgres 16, and Nginx (reverse proxy + TLS). Everything is in `docker-compose.yml`, one command brings the whole stack up.

### 1. Prepare the server

SSH into the VPS as root:

```bash
ssh root@your-server-ip
```

Upload the project (either via `scp`, `git clone` from your private repo, or `rsync`):

```bash
# From your laptop
scp mediconnect-deploy.zip root@your-server-ip:/opt/
ssh root@your-server-ip
cd /opt
unzip mediconnect-deploy.zip
mv mediconnect-deploy mediconnect   # if the folder name differs
cd mediconnect
```

### 2. Run the installer

```bash
sudo bash deploy/install.sh
```

This takes about 2 minutes. It will:

- Update apt packages
- Install Docker + docker-compose plugin
- Configure UFW firewall (ports 22, 80, 443 only)
- Install fail2ban
- Generate `nginx/dhparam.pem` (2048 bits)
- Generate `.env.production` with a strong `JWT_SECRET` and `POSTGRES_PASSWORD`
- Create `backups/` directory

### 3. Edit `.env.production`

The installer leaves placeholders for three important fields:

```bash
nano .env.production
```

Fill in:
- `NEXT_PUBLIC_APP_URL` — e.g. `https://mediconnect.dz`
- `CCP_ACCOUNT_NUMBER`, `CCP_ACCOUNT_KEY`, `CCP_ACCOUNT_HOLDER` — your real post-office coordinates
- (Later, optional) `RESEND_API_KEY` — when you sign up at resend.com

Save and exit.

### 4. Obtain SSL certificate

```bash
sudo bash deploy/obtain-cert.sh mediconnect.dz www.mediconnect.dz
```

Certbot runs in standalone mode on port 80. Make sure your DNS is already pointing at this server, otherwise validation will fail.

### 5. Start the stack

```bash
docker compose up -d
```

First boot is slow (~3 min) because the Next.js image is being built from scratch. Subsequent `docker compose up -d` restarts take 5-10 seconds.

### 6. Watch logs while it boots

```bash
docker compose logs -f app
```

You should see:

```
✓ Ready in 2.8s
```

Then `https://mediconnect.dz` should load the Arabic landing page.

### 7. Seed the database (first time only)

```bash
docker compose exec app npx prisma db seed
```

Creates the 12 categories, 3 demo suppliers, 24 products, and the demo admin + buyer accounts. **Delete the demo accounts in production** — see the "Production checklist" at the bottom.

### 8. Automate backups

```bash
# Edit root's crontab
sudo crontab -e
```

Add:

```
0 3 * * * cd /opt/mediconnect && bash deploy/backup.sh >> backups/backup.log 2>&1
```

Runs nightly at 3 AM. Keeps the last 30 days.

---

## Option B: PM2 + systemd (traditional)

Use this if you can't run Docker (some shared hosts) or prefer bare Node.

### 1. Install Node 20

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
```

### 2. Install Postgres 16

```bash
sudo apt-get install -y postgresql postgresql-contrib
sudo -u postgres psql -c "CREATE USER mediconnect WITH PASSWORD 'strong-password-here';"
sudo -u postgres psql -c "CREATE DATABASE mediconnect OWNER mediconnect;"
```

### 3. Create system user and deploy

```bash
sudo useradd --system --create-home --shell /bin/bash mediconnect
sudo mv mediconnect-source /opt/mediconnect
sudo chown -R mediconnect:mediconnect /opt/mediconnect
sudo -u mediconnect bash <<EOF
cd /opt/mediconnect
npm ci
cp .env.production.example .env.production
# edit .env.production now
npm run build
npx prisma migrate deploy
npx prisma db seed
EOF
```

### 4. Install and start the service

```bash
sudo cp deploy/systemd/mediconnect.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now mediconnect
sudo systemctl status mediconnect
```

### 5. Install Nginx separately

```bash
sudo apt-get install -y nginx certbot python3-certbot-nginx
sudo cp nginx/mediconnect.conf /etc/nginx/sites-available/mediconnect
sudo ln -s /etc/nginx/sites-available/mediconnect /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d mediconnect.dz -d www.mediconnect.dz
```

---

## Option C: Vercel (zero-config SaaS)

The fastest, most expensive, and most "just works" option.

1. Push the source to a private GitHub repo.
2. Import into Vercel at https://vercel.com/new
3. Add environment variables (copy from `.env.production.example`) in Project Settings
4. Provision a Postgres database — Vercel Postgres, Neon, or Supabase all work identically; set `DATABASE_URL`
5. Deploy — Vercel auto-runs `npm run build` (which includes `prisma generate`)
6. After first deploy, run `npx prisma migrate deploy` and `npx prisma db seed` once using Vercel's CLI or a one-off serverless function

Beware: Vercel's filesystem is ephemeral. **CCP receipt uploads will not persist** on Vercel — you must configure S3 (Wasabi, Cloudflare R2, or AWS S3) via the `S3_*` env vars.

---

## Obtaining SSL certificates

Already covered in Option A step 4 for Docker. For non-Docker setups:

```bash
sudo certbot --nginx -d mediconnect.dz -d www.mediconnect.dz
sudo certbot renew --dry-run
```

Certbot schedules automatic renewal via systemd timer — no cron needed.

---

## Backups

The included `deploy/backup.sh` produces two files per run:

- `backups/db-YYYYMMDD-HHMMSS.dump` — Postgres custom-format dump (compressed)
- `backups/uploads-YYYYMMDD-HHMMSS.tar.gz` — all uploaded CCP receipts + product images

To restore:

```bash
# Restore Postgres
docker compose exec -T postgres pg_restore \
  -U mediconnect -d mediconnect --clean --if-exists \
  < backups/db-20260421-030000.dump

# Restore uploads
docker run --rm \
  -v mediconnect_uploads_data:/uploads \
  -v $(pwd)/backups:/backup \
  alpine tar xzf /backup/uploads-20260421-030000.tar.gz -C /uploads
```

**Offsite backups**: copy `backups/` to S3 or a second server daily — the backup script runs on the same disk as the data, so a disk failure loses both.

---

## Upgrades & rollback

### Deploying a new version

```bash
cd /opt/mediconnect
bash deploy/backup.sh               # always backup first
git pull                            # or upload the new tarball
docker compose build app            # rebuild image
docker compose up -d                # restart with zero downtime (healthcheck gates switchover)
```

### Rolling back

Docker keeps previous image layers. To revert to yesterday's code:

```bash
git reset --hard HEAD~1
docker compose build app
docker compose up -d
```

If the database schema changed, restore from the backup:

```bash
docker compose down
bash deploy/backup.sh
docker compose exec -T postgres pg_restore \
  -U mediconnect -d mediconnect --clean < backups/db-yesterday.dump
docker compose up -d
```

---

## Monitoring & logs

### View logs

```bash
# Docker:
docker compose logs -f app             # app only
docker compose logs -f                 # all services
docker compose logs --tail=200 app     # recent history

# systemd:
sudo journalctl -u mediconnect -f
```

### Health check

```bash
curl https://mediconnect.dz/api/health
```

Returns:

```json
{"status":"ok","ts":"2026-04-21T12:00:00.000Z","uptimeSec":3600,"db":{"ok":true,"latencyMs":3}}
```

Use this endpoint with any uptime monitor (UptimeRobot, BetterStack, etc).

### Correlate a bug report to logs

Every response includes an `x-request-id` header. When a user reports a problem, grab that ID from their browser's DevTools → Network tab → Response headers, then:

```bash
docker compose logs app | grep "requestId:\"abc-123-def\""
```

---

## Troubleshooting

### The app container exits immediately on boot

```bash
docker compose logs app
```

Common causes:
- **`DATABASE_URL` unreachable** — check that the Postgres container is healthy (`docker compose ps`)
- **`JWT_SECRET` too short** — must be at least 32 characters
- **Migrations failed** — run `docker compose exec app npx prisma migrate status` to see the last applied migration

### Nginx returns 502 Bad Gateway

- The app container is down or still starting. Wait 30 seconds, check `docker compose ps`.
- If it's `unhealthy`, look at app logs.

### Login returns 429

You've hit the rate limiter (10 attempts per 5 minutes per IP+email). Wait 5 minutes, or clear the limiter by restarting the app container (it's in-memory).

### Prisma migrate fails with "Environment variable not found"

Make sure `.env.production` exists and contains `DATABASE_URL`. For Docker, it's constructed automatically from `POSTGRES_USER`/`POSTGRES_PASSWORD`/etc.

### Arabic characters render as boxes

The dev Google Fonts fallback is active — check that the server has internet access to `fonts.googleapis.com`. If behind a strict firewall, self-host the Tajawal font files and add them to `public/fonts/`.

---

## Production checklist before launch

- [ ] Changed `JWT_SECRET` from the example value (generated by installer)
- [ ] Changed `POSTGRES_PASSWORD` from the example (generated by installer)
- [ ] Deleted demo accounts: `admin@mediconnect.dz`, `buyer@demo.dz`, `sup1@demo.dz`, `sup2@demo.dz`, `sup3@demo.dz`
- [ ] Replaced seed-data products with real supplier catalog (or left empty for suppliers to fill in)
- [ ] Pointed DNS A-record at the server's public IP
- [ ] Obtained SSL cert via certbot
- [ ] Set `NEXT_PUBLIC_APP_URL` to the real HTTPS domain
- [ ] Set real `CCP_ACCOUNT_*` values
- [ ] Enabled automatic backups via cron
- [ ] Configured offsite backup copy (S3 or second server)
- [ ] Set up uptime monitoring pointing at `/api/health`
- [ ] Configured `fail2ban` (auto-installed by installer, review `/etc/fail2ban/jail.local`)
- [ ] Tested full user flow: register → add to cart → checkout CCP → admin approves → delivery updates status
- [ ] Tested rate limits by repeatedly hitting `/api/auth/login`
- [ ] Reviewed `LOG_LEVEL` — `info` is production default
- [ ] Set up email sending (Resend API key) — otherwise order confirmations are terminal-only
- [ ] Tested the Arabic RTL rendering, French, and English switch
- [ ] Optional: set up Postgres read replica + WAL archiving for disaster recovery
- [ ] Optional: move uploads to S3 via `S3_*` env vars (uploads won't survive container rebuilds otherwise)
- [ ] Optional: register for a Satim merchant agreement to enable real Edahabia card payments (Phase 4)

---

## Contact & support

- Project docs: `README.md`
- Architecture notes: Phase 1-3.5 sections of `README.md`
- Deployment questions: reach out to the original developer
- Live issues: check `/api/health` first, then `docker compose logs`

🇩🇿 Made for the Algerian medical-equipment market.
