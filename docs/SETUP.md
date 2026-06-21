# Sinum Agro FarmOS — Setup & Architecture

What's been scaffolded for **Phase 1 (Farm ERP)** and how to run it.
See [PRD-Phase1-FarmERP.md](./PRD-Phase1-FarmERP.md) for the full spec.

---

## Stack

| Concern | Choice |
|---|---|
| Framework | Next.js 15.5 (App Router) |
| Language | TypeScript (incremental — existing public site stays `.jsx`) |
| Database | **Postgres (Neon)** |
| ORM | **Prisma 7** with the `@prisma/adapter-pg` driver adapter |
| Auth | **NextAuth v5** (Credentials + bcrypt), users stored in our DB |
| Validation | Zod (for API routes, as they're built) |
| Styling | Tailwind CSS 3 |

---

## Project layout

```
app/
  layout.js                 # slim root (html/body + global metadata only)
  (public)/                 # marketing storefront — Navbar/Footer/Cart chrome
    layout.jsx
    page.js  products/  company/  cart/
  farm/                     # Sinum Agro FarmOS (protected)
    login/                  # standalone sign-in (no sidebar)
    (dashboard)/
      layout.tsx            # sidebar + sign-out; redirects if unauthenticated
      page.tsx              # dashboard with live data from Postgres
  api/auth/[...nextauth]/   # NextAuth route handlers (Node runtime)
auth.config.ts              # edge-safe config (used by middleware)
auth.ts                     # full config w/ Credentials provider (Node)
middleware.ts               # protects /farm/*
lib/
  db.ts                     # Prisma client singleton (pg adapter)
  generated/prisma/         # generated client (gitignored-friendly, lint-ignored)
prisma/
  schema.prisma             # full Phase 1 schema (PRD §7)
  seed.ts                   # seeds owner + discovery data
  migrations/               # SQL migrations
prisma.config.ts            # Prisma 7 config (schema + migrations + datasource)
```

**Why the `(public)` route group:** route groups don't change URLs (`/`, `/products`
still work), but let the storefront keep its Navbar/Footer/Cart while the farm admin
gets its own chrome — no public header bleeding into the dashboard.

---

## Environment variables (`.env`, gitignored)

```
DATABASE_URL="postgresql://…neon.tech/neondb?sslmode=require&channel_binding=require"
AUTH_SECRET="…"            # generate: openssl rand -base64 33
AUTH_TRUST_HOST=true
OWNER_EMAIL="owner@sinumagro.com"
OWNER_PASSWORD="changeme123"   # change, then re-run npm run db:seed
```

> ⚠️ The seeded owner password defaults to `changeme123`. **Change `OWNER_PASSWORD`
> in `.env` and re-run `npm run db:seed`** before any real use.

---

## Commands

```bash
npm run dev            # start dev server
npm run build          # production build

npm run db:migrate     # create/apply a migration (prisma migrate dev)
npm run db:generate    # regenerate Prisma client after schema edits
npm run db:seed        # seed owner + discovery data (idempotent)
npm run db:studio      # browse data in Prisma Studio
```

After editing `prisma/schema.prisma`: `npm run db:migrate` then `npm run db:generate`.

---

## What works now

- **Auth:** `/farm/*` is protected by middleware → unauthenticated users are redirected
  to `/farm/login`. Sign in with the seeded owner credentials.
- **Dashboard (`/farm`):** pulls live data from Postgres — broiler/layer counts, pond
  count, feed remaining (with low-stock flags), mortality rate %, today's feed usage,
  7-day expenses.
- **Seed data:** owner account; Batch A (150 broilers); Flock A (200 layers); 2 catfish
  ponds; feed stock (Broiler 4 / Layer 10 / Fish 6 bags); 4 medications; frozen stock 0.

## Not built yet (next up, per PRD §12)

Data-entry modules: Mortality, Feed (usage/purchase), Expenses first — then Poultry,
Fish, Medication, Harvest, Finance, Analytics. Sidebar items are marked **"soon"** until
their pages land.
