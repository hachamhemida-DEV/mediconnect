# MediConnect — منصّة سوق المعدات الطبية الذكي في الجزائر

<div align="right" dir="rtl">

المنصّة الإلكترونية التي تربط المشترين (عيادات، صيدليات، مستشفيات) بالموردين المعتمدين للمعدات الطبية في الجزائر، مع سوق مستعمل مجاني ونظام شركات توصيل.

</div>

> **Status**: Phase 1 + Phase 2 + Phase 3 + **Phase 3.5 delivered** (observability · rate limits · email service · health + error UX). Phase 4 items — which need external credentials or a live origin — are listed at the bottom.

<div align="center">

`Next.js 15` · `React 19` · `TypeScript 5.7` · `Tailwind 3.4` · `next-intl v3` · `Arabic / French / English`

</div>

---

## Quick start

```bash
git clone <this-repo>
cd mediconnect
npm install                        # runs postinstall: prisma generate
cp .env.example .env.local         # edit JWT_SECRET at minimum

npx prisma migrate dev --name init # creates ./prisma/dev.db (SQLite) + runs migration
npx prisma db seed                 # loads 12 categories, 24 products, demo accounts

npm run dev
```

Open [http://localhost:3000](http://localhost:3000) — you land on the Arabic (RTL) version at `/`; French and English are under `/fr` and `/en`.

### Demo accounts (created by `prisma db seed`)

| Role | Email | Password | Notes |
|---|---|---|---|
| Admin    | `admin@mediconnect.dz` | `admin123`      | Access to `/admin` |
| Buyer    | `buyer@demo.dz`        | `buyer123`      | Has a demo used listing |
| Supplier | `sup1@demo.dz`         | `supplier123`   | **Gold** plan, 8 products |
| Supplier | `sup2@demo.dz`         | `supplier123`   | **Pro** plan, 8 products |
| Supplier | `sup3@demo.dz`         | `supplier123`   | **Basic** plan, 8 products |

### Database tooling

| Command                 | What it does |
|-------------------------|--------------|
| `npm run db:migrate`    | Create + apply a new migration from schema.prisma |
| `npm run db:push`       | Push schema without migration (handy in dev) |
| `npm run db:seed`       | Run `prisma/seed.ts` (idempotent) |
| `npm run db:reset`      | Drop + recreate + re-seed (nuclear) |
| `npm run db:studio`     | Open Prisma Studio (visual browser) |
| `npm run db:generate`   | Regenerate the Prisma client |

**Requirements**: Node 20+ and npm 10+.

### Available scripts

| Script | What it does |
|---|---|
| `npm run dev`       | Start the Next dev server with HMR |
| `npm run build`     | Production build |
| `npm run start`     | Serve the production build |
| `npm run lint`      | ESLint (with `eslint-config-next`) |
| `npm run typecheck` | `tsc --noEmit` over the whole tree |

---

## What's in Phase 1

| Area | Delivered |
|---|---|
| **Public landing** | All 9 sections matching the supplied iPad mockups — Hero, Problems, Solutions, Features, Stats + Testimonials, HowItWorks, WhyUs, Pricing (3-tier), CTA. |
| **Authentication** | Registration (3 roles: buyer / supplier / delivery), login, logout. JWT in an `httpOnly` cookie via `jose`. bcrypt-hashed passwords. Zod-validated API payloads. |
| **Dashboard** | Authenticated shell + buyer landing with quick actions and catalog placeholder. Session-guarded layout. |
| **Internationalisation** | Arabic (default, RTL), French, English. Every visible string lives in `src/messages/{locale}.json`. `next-intl` handles routing, direction, metadata. |
| **Design system** | Brand palette derived from the mockups (teal-green `#15b886`, sky `#2a9ed4`, six accent hues). Reusable classes: `container-mc`, `card-mc`, `badge-mc`, `accent-bar`, `btn-primary`, `btn-secondary`. Tajawal (Arabic) + Inter (Latin) via `next/font/google`. |
| **Data layer** | In-memory mock DB with the exact same method signatures we'll use against Prisma + Postgres in Phase 2 — so swapping the backend is a single-file change in `src/lib/db.ts`. |

## What's in Phase 2

| Area | Delivered |
|---|---|
| **Catalog** | `/catalog` — product grid, sticky filter sidebar (sort / category / price range), client-driven search bar, URL-synced filters (so a filtered view is shareable). 24 realistic medical products across 12 categories, trilingual names + descriptions + specs, featured flags, SVG placeholder images. |
| **Product detail** | `/catalog/[id]` — breadcrumb, hero gallery, star rating, stock badge, quantity stepper + add-to-cart, rich supplier card (plan-tinted badge, wilaya, rating), full specifications list, related products in the same category. |
| **Cart** | `/cart` — line items with qty stepper + remove, live TVA 19% + total recalculation, free-shipping badge, sticky summary, session-scoped via `httpOnly` cookie (server-readable for price-tamper protection). |
| **Checkout** | `/checkout` — shipping address + wilaya selector, 3-method payment picker (**cash at office / CCP via Baridi Mob / Edahabia**) with contextual help (CCP shows the post-office workflow, Edahabia notes instant activation). Success page at `/checkout/success` renders CCP account coordinates dynamically when that method is chosen. |
| **RFQ** | `/dashboard/buyer/rfq` — buyer's requests with status chips (open/closed/fulfilled), and `/dashboard/buyer/rfq/new` — a full form with title/description/category/qty/budget/wilaya. |
| **Used marketplace** | `/used` — gradient hero strip, grid of listings with condition badges, and `/used/[id]` — detail with phone CTA (`tel:` link) and disclaimer. `/dashboard/buyer/used/new` — 100% free listing form. Two seeded demo listings so the page isn't empty on first boot. |
| **Supplier dashboard** | `/dashboard/supplier` — 5-stat overview (products, orders, RFQs, monthly revenue, rating), plan badge (Basic / Pro / Gold with visual hierarchy), product table with stock chips and rating. Add/edit deliberately deferred to Phase 3. |
| **Cart badge in header** | Live count polled via `GET /api/cart/count`, visible on landing + catalog + product + dashboard routes, refreshes on route change and tab-focus. |
| **APIs (JSON, zod-validated)** | `POST /api/cart/add` · `POST /api/cart/update` · `GET /api/cart/count` · `POST /api/orders/create` · `POST /api/rfq/create` · `POST /api/used/create`. All session-guarded where appropriate; `create-order` snapshots price and stock, clears the cart on success. |

---

## Architecture decisions

These were picked deliberately in Phase 1's executable summary. Each one has a one-paragraph rationale so future contributors don't re-open a settled question.

### Next.js 15 App Router + TypeScript

Chosen over a vanilla HTML prototype because the spec (4 versions × many sub-features) describes a real platform, not a pitch page. We need route-grouped auth areas, API routes, streaming SSR for SEO on the catalog, and `generateStaticParams` for locale prerendering — all of which App Router does natively. Strict TypeScript catches the mistakes that would otherwise ship as runtime bugs in Arabic/French/English strings and currency formatting.

### next-intl v3, not i18next

`next-intl` integrates with App Router's request context and `setRequestLocale`, so server components can `getTranslations` without a provider in the tree. It also owns routing — `Link`, `useRouter`, `usePathname` re-exported from `@/i18n/routing` always produce the correct locale-prefixed URL. `localePrefix: 'as-needed'` keeps Arabic on `/` (no prefix) while French and English live at `/fr` and `/en`.

### Tailwind 3.4, not Tailwind 4 alpha

Tailwind 4's new engine is compelling but the ecosystem (plugins, prose, build tools) is still catching up in April 2026. Staying on 3.4 is the conservative choice; we revisit in Phase 3.

### JWT in an `httpOnly` cookie via `jose`

`jose` is edge-runtime compatible (middleware can verify a session without importing Node crypto), which matters because Next 15 ships middleware on the edge by default. The cookie is `httpOnly + SameSite=Lax + Secure` in production, with a 7-day TTL. Passkeys (WebAuthn) are the planned Phase 3 upgrade — not Phase 1 — because they require a real deployed origin.

### Data layer: in-memory in Phase 1, Prisma from Phase 3

Phase 1 used in-memory maps so we could ship the landing + auth flow without provisioning a database. Phase 3 swapped that out for **Prisma + SQLite (dev) / Postgres (prod)** without changing a single call site: the functions in `src/lib/db.ts`, `src/lib/db-phase2.ts`, and the new `src/lib/catalog.ts` kept the same signatures, just went `async`. The static arrays in `src/lib/seed.ts` are still exported for reference data (CATEGORIES, SUPPLIERS) and for the Prisma seed script, but product lookups now always hit the database.

### RTL is default, not a toggle

Arabic is the primary language of the Algerian medical market. The `html` element's `dir` and `lang` are set per request in `src/app/[locale]/layout.tsx`. All directional icons (chevrons, arrows) carry `data-flip-on-rtl`, and we use logical CSS (`margin-inline-start`, `text-start`) everywhere rather than `margin-left` / `text-left`.

---

## Project structure

```
mediconnect/
├── src/
│   ├── app/
│   │   ├── icon.svg                       # auto-detected favicon
│   │   ├── globals.css                    # Tailwind + RTL base + component classes
│   │   ├── layout.tsx                     # root shell
│   │   ├── [locale]/
│   │   │   ├── layout.tsx                 # lang + dir + fonts + NextIntlClientProvider
│   │   │   ├── page.tsx                   # landing (assembles all 9 sections)
│   │   │   ├── auth/
│   │   │   │   ├── layout.tsx             # centered, brand-mesh background
│   │   │   │   ├── login/page.tsx
│   │   │   │   └── register/page.tsx      # role picker + wilaya dropdown
│   │   │   ├── catalog/
│   │   │   │   ├── page.tsx               # grid + filters + search (Phase 2)
│   │   │   │   └── [id]/page.tsx          # product detail (Phase 2)
│   │   │   ├── cart/page.tsx              # cart (Phase 2)
│   │   │   ├── checkout/
│   │   │   │   ├── page.tsx               # 3-method payment picker (Phase 2)
│   │   │   │   └── success/page.tsx       # order confirmation + CCP coords (Phase 2)
│   │   │   ├── used/
│   │   │   │   ├── page.tsx               # used-equipment marketplace (Phase 2)
│   │   │   │   └── [id]/page.tsx          # listing detail (Phase 2)
│   │   │   └── dashboard/
│   │   │       ├── layout.tsx             # session guard + top bar + cart badge
│   │   │       ├── buyer/
│   │   │       │   ├── page.tsx           # buyer overview
│   │   │       │   ├── rfq/page.tsx       # RFQ list (Phase 2)
│   │   │       │   ├── rfq/new/page.tsx   # new RFQ (Phase 2)
│   │   │       │   └── used/new/page.tsx  # create used listing (Phase 2)
│   │   │       └── supplier/page.tsx      # supplier overview + product table (Phase 2)
│   │   └── api/
│   │       ├── auth/
│   │       │   ├── register/route.ts      # POST – creates user, sets cookie
│   │       │   ├── login/route.ts         # POST – verifies, sets cookie
│   │       │   └── logout/route.ts        # POST – clears cookie
│   │       ├── cart/
│   │       │   ├── add/route.ts           # POST – add item (Phase 2)
│   │       │   ├── update/route.ts        # POST – change qty / remove (Phase 2)
│   │       │   └── count/route.ts         # GET  – for header badge (Phase 2)
│   │       ├── orders/create/route.ts     # POST – snapshot + create order (Phase 2)
│   │       ├── rfq/create/route.ts        # POST – create RFQ (Phase 2)
│   │       └── used/create/route.ts       # POST – create used listing (Phase 2)
│   ├── components/
│   │   ├── landing/                       # Hero, Problems, Solutions, Features,
│   │   │                                  # Stats, HowItWorks, WhyUs, Pricing, CTA
│   │   ├── layout/                        # Header, Footer, LocaleSwitcher,
│   │   │                                  # LogoutButton, CartBadge
│   │   ├── catalog/                       # ProductCard, CatalogFilters,
│   │   │                                  # CatalogSearchBar, AddToCartButton
│   │   ├── cart/CartItemRow.tsx
│   │   ├── checkout/CheckoutForm.tsx
│   │   └── ui/                            # Logo, Button
│   ├── i18n/
│   │   ├── routing.ts                     # locales + navigation helpers
│   │   └── request.ts                     # per-request message loader
│   ├── messages/
│   │   ├── ar.json                        # primary, RTL, all Phase 1 + 2 namespaces
│   │   ├── fr.json
│   │   └── en.json
│   ├── lib/
│   │   ├── auth.ts                        # jose-based JWT sign/verify, cookie helpers
│   │   ├── db.ts                          # in-memory user store
│   │   ├── db-phase2.ts                   # in-memory orders / RFQs / used listings
│   │   ├── cart.ts                        # cart cookie helpers (Phase 2)
│   │   ├── seed.ts                        # 12 categories + 3 suppliers + 24 products
│   │   ├── types.ts                       # shared domain types
│   │   ├── utils.ts                       # cn(), formatDZD(), formatNumber()
│   │   └── wilayas.ts                     # 58 Algerian wilayas, trilingual
│   └── middleware.ts                      # locale detection + redirect
├── public/
│   ├── favicon.svg
│   └── logo.svg
├── .env.example
├── next.config.mjs
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Internationalisation — how to add or edit strings

**Every visible string goes through `useTranslations('namespace')`.** Never hard-code text in JSX.

To add a new language (e.g. Arabic-Tunisia `ar-TN`):

1. Copy `src/messages/ar.json` → `src/messages/ar-TN.json`, translate.
2. Add `'ar-TN'` to `locales` in `src/i18n/routing.ts` and an entry in `localeMeta`.
3. Done — middleware picks it up automatically, and `generateStaticParams` in the locale layout will prerender it.

To rename or add a translation key:

1. Add it to `ar.json` first (the primary source of truth).
2. Mirror it in `fr.json` and `en.json`.
3. Reference it via `t('namespace.key')` — TypeScript won't catch missing keys (next-intl limitation), so keep the three files in lockstep.

**Arabic number convention**: `formatNumber()` in `lib/utils.ts` forces Latin digits for Arabic (the Algerian convention) via the `u-nu-latn` BCP-47 extension.

---

## Payments — the three local methods

The spec mandates three local payment methods. Phase 2 ships the full **user-facing flow** for all three; Phase 3 adds the real backend integrations.

| Method | Phase 2 (shipped) | Phase 3 (planned) |
|---|---|---|
| Cash at office | Radio option at checkout → order created with status `pending` | Admin-only UI to record the paid transaction + print a receipt |
| CCP (Baridi Mob) | Radio option → success page renders the platform's CCP coordinates + reference number + amount | User uploads receipt image → admin verification queue → account activated |
| Edahabia | Radio option → order created with status `confirmed` | Real Satim REST integration (merchant ID + API key from `.env`) with 3-D Secure + signed webhooks |

`.env.example` already lists every env var these integrations will read.

---

## What's in Phase 3

| Area | Delivered |
|---|---|
| **Persistent database** | Prisma + **SQLite** for dev (zero-config, file at `./prisma/dev.db`), **Postgres** for prod (flip `provider` in `schema.prisma`, set `DATABASE_URL`). Full schema: 15 tables — User, Supplier, DeliveryCompany, SupplierSubscription, Category, Product, Order + OrderItem + Shipment, Rfq + RfqReply, UsedListing, Review, AdCampaign. All indices, FK cascades, and `@unique` constraints present. The phase 2 in-memory maps are gone. |
| **Seed script** | `prisma/seed.ts` — idempotent: 12 categories, 3 demo suppliers (Basic/Pro/Gold), 24 products, 2 used listings, admin + buyer demo accounts. Re-running is safe. |
| **Supplier product CRUD** | `/dashboard/supplier/products/new` and `/dashboard/supplier/products/[id]/edit` — trilingual form (AR/FR/EN) for name, description, specs, price, stock. **Per-plan limits enforced at the API**: Basic ≤ 50, Pro ≤ 500, Gold ∞. Gold-tier products are auto-featured in search. Ownership check on every write. |
| **Admin panel** | `/admin` — role-guarded layout with side nav. Overview page pulls 4 KPIs (users, products, orders, gross revenue) + 3 action queues (pending supplier verifications, pending CCP payments, open RFQs) from real Prisma queries. `/admin/suppliers` — verification queue with approve/reject. `/admin/payments` — CCP receipt viewer + approve/reject. |
| **CCP proof-of-payment** | On `/checkout/success` for CCP orders, the buyer now uploads a receipt (image or PDF, ≤ 5 MB). `POST /api/orders/[id]/upload-proof` stores the file under `./uploads/ccp/` (or `UPLOADS_DIR`). Admin reviews it in `/admin/payments`; approval flips `order.paymentVerified = true` and `order.status = confirmed`. |
| **Review system** | `POST /api/reviews/create` — purchase-verified (the reviewer must have an OrderItem linking them to the product), one review per (user, product, order) tuple (enforced via `@@unique`). Aggregate `rating` and `reviewsCount` recomputed on every submit. `/catalog/[id]` shows the full review feed with stars and relative dates. |
| **Delivery company dashboard** | `/dashboard/delivery` — 4 stat cards (pending, in-transit, delivered, monthly revenue from 5% commission), shipment table with dropdown status changes. `POST /api/delivery/shipments/[id]/status` also syncs the parent `order.status` on terminal transitions (`delivered` → order `delivered`; `in_transit`/`picked_up` → order `shipped`). Role guard for `delivery` + `admin`. |
| **Subscription schema** | `SupplierSubscription` table ready for recurring billing; writes not yet automated. |
| **Ad schema** | `AdCampaign` table ready for CPM/CPC/time-based campaigns; serving integration arrives in 3.5. |
| **APIs added (zod-validated)** | `POST /api/supplier/products` · `PATCH/DELETE /api/supplier/products/[id]` · `POST /api/admin/suppliers/[id]/verify` · `POST /api/admin/orders/[id]/verify-payment` · `POST /api/orders/[id]/upload-proof` · `POST /api/reviews/create` · `POST /api/delivery/shipments/[id]/status`. All session-guarded with role checks and ownership enforcement. |

---

## What's in Phase 3.5

| Area | Delivered |
|---|---|
| **Structured logging** | `src/lib/logger.ts` — single-line JSON on stdout in production, colour-pretty in development. `logger.with({ requestId })` creates a child logger that tags every line with the correlation id from `middleware.ts`, so grepping `requestId:abc` shows every log line a single request touched. `LOG_LEVEL` env var controls the threshold. |
| **Request-ID correlation** | `middleware.ts` now generates (or forwards) an `x-request-id` header on every request and echoes it back on the response. API handlers wrapped by `apiHandler()` automatically get the id in their logger context. |
| **Rate limiting** | `src/lib/rate-limit.ts` — sliding-window in-memory limiter with the **exact same signature as `@upstash/ratelimit`**, so swapping to Redis in production is a one-file change. Three preconfigured buckets: `authLimiter` (10 / 5 min), `mutationLimiter` (60 / min), `uploadLimiter` (10 / min). Applied to login, register, supplier-product create, review create, RFQ create, used-listing create, and CCP proof upload. Login uses a composite `ip::email` key to thwart both distributed and targeted brute force. |
| **Health endpoint** | `GET /api/health` — returns `200` with uptime + DB ping latency on success, `503` with `cache-control: no-store` when Prisma fails. Ready for any load balancer that expects an HTTP health signal. |
| **Error boundaries** | `src/app/global-error.tsx` catches crashes in the root layout; `src/app/[locale]/error.tsx` catches crashes inside the locale subtree with themed UI, i18n, and a retry button. Users see the Next.js-provided `digest` (request correlation id) to quote to support. |
| **Email service** | `src/lib/email.ts` — Resend-compatible `sendEmail()`. With `RESEND_API_KEY` unset (dev), it logs a cyan-bordered preview box to the terminal. Set the key in production to enable real delivery — no code change needed. |
| **Email templates** | `src/lib/email-templates.ts` — three production templates in AR / FR / EN with inline CSS, RTL support, and the brand palette: `orderConfirmationEmail`, `ccpVerifiedEmail`, `supplierApprovedEmail`. |
| **Fire-and-forget hooks** | Order creation → `orderConfirmationEmail` (method-aware copy: cash vs. CCP vs. Edahabia next-step). Admin CCP approval → `ccpVerifiedEmail`. Admin supplier approval → `supplierApprovedEmail`. All wrapped in try/catch with `logger.warn` — email failure never breaks the request. |
| **Safe-by-default API wrapper** | `src/lib/api-handler.ts` — `apiHandler(fn, opts)` threads request-id, logs request timings, converts uncaught exceptions into a sanitized 500 (never leaks stack traces to clients), echoes `x-request-id` on every response, and composes with any limiter. |
| **Bug hunt by-catch** | Three latent `createX(...)` calls without `await` were caught and fixed (`createOrder`, `createRfq`, `createUsedListing`). These would have silently succeeded in Phase 3 but returned a `Promise` to the client. |

---

## Phase 4 roadmap — what genuinely needs external pieces

These are the only things left that can't be written against a local dev machine. Each has an env-var slot in `.env.example`.

1. **Satim 3-D Secure** — replace the Edahabia stub with the real CIB/Satim flow. Needs `SATIM_MERCHANT_ID`, `SATIM_API_KEY`, a publicly-reachable callback URL, and the bank-side sandbox access for integration testing. Reconciliation and refund/chargeback queues come with it.
2. **Passkeys (WebAuthn)** — requires a deployed HTTPS origin for relying-party binding. The JWT-cookie path we ship today remains the fallback.
3. **Upstash Redis for rate limiting** — swap `src/lib/rate-limit.ts` from in-memory to `@upstash/ratelimit`; one file, identical signature. Then rate limits work correctly behind a multi-pod load balancer.
4. **S3-compatible object storage** — CCP proof uploads currently hit the local filesystem under `./uploads/`. In production, point `S3_BUCKET` / `S3_REGION` / `S3_ACCESS_KEY` / `S3_SECRET_KEY` at Wasabi or Cloudflare R2 and swap the `writeFile` calls.
5. **Subscription auto-billing engine** — `SupplierSubscription` table exists; the cron-driven renewal runner, grace periods, and downgrade rules don't.
6. **Ad serving + billing** — `AdCampaign` table exists; sponsored catalog slots, click tracking, impression counting, and invoice generation need building.
7. **SMS provider** — password-reset SMS and CCP upload reminders. Pick a provider (Twilio is easiest, local Algerian providers are cheaper).
8. **Error tracking (Sentry / Rollbar)** — Phase 3.5 logs errors to stdout; forwarding them to a tracker is a 20-line change in `global-error.tsx` and `api-handler.ts`.

---

## Compliance notes (Algerian market)

- **E-commerce law 09-04** — terms of use and privacy policy must be rendered in Arabic. The key is in `footer.links.privacy` / `footer.links.terms`; connect these routes in Phase 2.
- **Data protection law 18-07** — personal data minimisation; we only request fields we actually use on registration.
- **TVA 19%** — invoice lines carry VAT as a separate line. `formatDZD()` returns inclusive amounts; the invoice template in Phase 2 will split.

---

## Licence

Proprietary — all rights reserved © MediConnect. Not open-source.
