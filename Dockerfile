# =============================================================================
#  MediConnect — Production Dockerfile
# =============================================================================
#
#  Three-stage build on Node 20 Alpine:
#    1. deps    — installs production + build-time npm packages
#    2. builder — runs `prisma generate` and `next build`
#    3. runner  — minimal image containing only what's needed at runtime
#
#  Final image is ~180 MB thanks to Next.js standalone output.
#
#  Build:   docker build -t mediconnect:latest .
#  Run:     docker run -p 3000:3000 --env-file .env.production mediconnect:latest
# =============================================================================

# -----------------------------------------------------------------------------
#  Stage 1 — Install dependencies
# -----------------------------------------------------------------------------
FROM node:20-alpine AS deps
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

# Dependency lockfile first — lets Docker cache `npm ci` when only app code changes.
COPY package.json package-lock.json* ./
# Prisma postinstall needs the schema to generate the client.
COPY prisma ./prisma

RUN npm ci --prefer-offline --no-audit --progress=false

# -----------------------------------------------------------------------------
#  Stage 2 — Build the app
# -----------------------------------------------------------------------------
FROM node:20-alpine AS builder
RUN apk add --no-cache libc6-compat openssl
WORKDIR /app

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Needed at build time to resolve env vars baked into the client bundle.
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

RUN npx prisma generate
RUN npm run build

# -----------------------------------------------------------------------------
#  Stage 3 — Minimal runtime image
# -----------------------------------------------------------------------------
FROM node:20-alpine AS runner
WORKDIR /app

RUN apk add --no-cache openssl tini \
 && addgroup --system --gid 1001 nodejs \
 && adduser  --system --uid 1001 nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Next.js standalone output — includes only the runtime files needed.
COPY --from=builder --chown=nextjs:nodejs /app/public ./public
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma client + migration engine needed at runtime.
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/@prisma/client ./node_modules/@prisma/client
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma

# Uploads directory (CCP receipts, product images). Mount a volume here in prod.
RUN mkdir -p /app/uploads && chown -R nextjs:nodejs /app/uploads

USER nextjs
EXPOSE 3000

# Tini is PID 1 so SIGTERM propagates properly to the Node process.
ENTRYPOINT ["/sbin/tini", "--"]

# Run migrations on start, then the server.
CMD ["sh", "-c", "npx prisma migrate deploy && node server.js"]
