# FarmOS — Handoff (for the next dev / Copilot)

Read this top-to-bottom once; it's enough to continue without re-deriving anything.
Companion docs: [PROJECT_BLUEPRINT.md](./PROJECT_BLUEPRINT.md) (strategy),
[PRD-Phase1-FarmERP.md](./PRD-Phase1-FarmERP.md) (spec), [SETUP.md](./SETUP.md) (run).

---

## 1. What this is

Internal **Farm Operating System** for **Sinum Agro Food Technology** (a Lagos poultry +
catfish farm). **Protein Pack** is the e-commerce offshoot (public storefront — not built
yet). One Postgres DB underneath. We are building the internal FarmOS **first**.

- **Public storefront** lives in `app/(public)/` (the original "Chicken Pack" marketing
  site, dark theme). Untouched recently.
- **FarmOS** lives in `app/farm/` and is the active work. Auth-gated.

---

## 2. Run it

```bash
npm install
npm run dev            # http://localhost:3000  → FarmOS at /farm/login
npm run build          # prod build
npm run db:migrate     # prisma migrate dev
npm run db:seed        # idempotent seed (owner + discovery data)
npm run db:studio
```

**Login:** `owner@sinumagro.com` / `changeme123` (in `.env`; change via `OWNER_PASSWORD` + re-seed).

### ⚠️ Critical environment gotchas
- **iCloud build-cache fix:** the repo is under `~/Desktop` (iCloud-synced), which
  corrupts Turbopack's temp files. `next.config.mjs` sets `distDir` to **`.next.nosync`**
  locally (iCloud ignores `*.nosync`) and `.next` on Vercel/CI. **Don't "fix" this back to
  `.next`** — it's intentional. If you ever see `ENOENT … _buildManifest.js.tmp`, that's
  the symptom of this; the nosync dir prevents it.
- **Secrets:** `.env` is gitignored and was never committed (verified across full history).
  It holds the real Neon `DATABASE_URL`, `AUTH_SECRET`, `OWNER_*`. GitGuardian may flag the
  `"changeme123"` placeholder in `prisma/seed.ts`/`SETUP.md` — that's a **false positive**,
  not a live secret.

---

## 3. Stack & key files

| Concern | Choice / file |
|---|---|
| Framework | Next.js 15.5 App Router, **TypeScript** (public site still `.jsx`) |
| DB | Postgres (Neon) |
| ORM | **Prisma 7** + `@prisma/adapter-pg` driver adapter. Client generated to `lib/generated/prisma` (gitignored; `postinstall` regenerates). Singleton: `lib/db.ts` (`import { prisma } from "@/lib/db"`) |
| Schema | `prisma/schema.prisma` — full Phase-1 model already exists |
| Auth | **NextAuth v5** credentials. `auth.ts` (Node, has the DB-refresh session callback), `auth.config.ts` (edge-safe, used by `middleware.ts`), `types/next-auth.d.ts`. `/farm/*` is protected. `session.user` is refreshed from DB on every request. Get the user id via `const s = await auth(); s.user.id`. |
| Styling | Tailwind 3 + **shadcn-style design tokens** in `app/globals.css` (`bg-card`, `text-muted-foreground`, `border-border`, `bg-primary`, etc.) |
| Brand colors | `--primary` = **wine `#7F5283`**; `--gold` (`#FBBF24`, Tailwind `bg-gold`/`text-gold-foreground`). Palette: dark / white / wine / gold. Sign-out is `bg-red-600`. |

---

## 4. FarmOS shell (already built — don't rebuild)

- `app/farm/login/` — credentials login (server action + `useActionState`).
- `app/farm/(dashboard)/layout.tsx` — auth guard + desktop sidebar + profile/sign-out footer.
  Renders `SidebarNav` (desktop) and `MobileNav` (mobile drawer, `md:hidden`).
- `app/farm/(dashboard)/SidebarNav.tsx` — the nav array. **Each module has `ready: boolean`.**
  Unbuilt modules show a "soon" chip and don't link.
- `app/farm/(dashboard)/MobileNav.tsx` — mobile top bar + full-screen nav (only mounts when open).
- `app/farm/(dashboard)/page.tsx` — the **dashboard/overview** (greeting, icon stat cards with
  feed gauge folded into livestock cards, quick-log links, analytics: expenses-by-category +
  livestock mix, snapshot).

> **WORKFLOW RULE (from the owner):** when starting a module that's marked `ready: false`,
> the **first** step is to flip it to `ready: true` in `SidebarNav.tsx` — before building the page.

---

## 5. Module status

| Module | Route | Status |
|---|---|---|
| Dashboard / Overview | `/farm` | ✅ done |
| Feed | `/farm/feed` | ✅ done (canonical example) |
| Mortality | `/farm/mortality` | ✅ done (canonical example) |
| Finance | `/farm/finance` | ✅ done (two record types) |
| Poultry | `/farm/poultry` | ✅ done (card-based + delete guard + egg logging) |
| Fish | `/farm/fish` | ✅ done (card-based + restock delta) |
| **Medication** | `/farm/medication` | ⬜ **next** |
| **Harvest** | `/farm/harvest` | ⬜ (the farm→store Inventory bridge) |
| **Analytics** | `/farm/analytics` | ⬜ (read-only, build last) |

Build order for what's left: **Medication → Harvest → Analytics**.

---

## 6. THE MODULE TEMPLATE (copy this for each new module)

Every built module follows the same shape. **Feed** (`app/farm/(dashboard)/feed/`) and
**Mortality** are the cleanest references. A module = three files in
`app/farm/(dashboard)/<module>/`:

### a) `actions.ts` (`"use server"`)
- Export a `…State = { error?: string; success?: string }` type.
- Zod-validate `FormData`; return `{ error }` on failure.
- `create…` / `log…`, `update…` (id from a hidden form field), and a `delete…(id)` that
  **isn't** a `useActionState` action (called directly from the client).
- **Always** `revalidatePath("/farm/<module>"); revalidatePath("/farm");` after a write
  (a `done()` helper in finance/poultry/fish does this).
- **Count/stock side-effects must be reversed transactionally** on edit/delete:
  - Mortality edit: `available = entity.currentCount + old.qty; new = available - newQty` (guard ≥ 0).
  - Mortality delete: `currentCount += old.qty`.
  - Feed usage/purchase: see `feed/actions.ts` (delete usage gives bags back; delete purchase removes them; `FeedStock.capacityBags` tracks peak for the dashboard gauge).
  - Finance/eggs/medication have **no** count side-effects — plain CRUD.
- **Delete guards** for parent entities (Poultry group, Fish pond): count linked records
  (`mortality/harvest/health/feedUsage/expense/revenue` + `eggLog` for groups); if any exist,
  return `{ ok:false, error }` and tell the user to close/keep instead. See `poultry/actions.ts`.

### b) `<Module>Entries.tsx` (`"use client"`)
Holds **all** interactivity. Reusable pieces (copy from `feed/FeedEntries.tsx`):
- `Modal` (bottom-sheet on mobile `items-end`, centered `sm:items-center`; locks body scroll).
- `Segmented<T>` (desktop filter) + a `<select>` for the mobile filter.
- A form component that handles **both create and edit** via an optional `initial` prop and
  picking the right action (`isEdit ? updateX : logX`); on `state.success` call
  `router.refresh()` + `onDone()`. Hidden `id` input when editing. Lock immutable fields
  (e.g. feed category, mortality location) by showing a read-only div instead of an input.
- List/cards with per-row **edit** (opens modal) + **delete** (`confirm()` → server action →
  `router.refresh()`). For guarded deletes, `alert(res.error)` when `!res.ok`.
- **Client pagination** (`pageSize`, `page` state, reset page in `useEffect` on filter change,
  slice the filtered array, prev/next controls). Feed/Mortality/Finance use 8/page; Poultry 6.

### c) `page.tsx` (server component, `export const dynamic = "force-dynamic"`)
- `getData()` with `prisma` + `Promise.all`; build the typed `Entry[]`/`Card[]` the client wants
  (convert `Decimal` via `Number()`, dates to `isoDate` for inputs + `fmtDate` for labels in
  `Africa/Lagos`).
- A `StatCard` (hero number `text-3xl sm:text-4xl`, label, icon chip `h-10 w-10 sm:h-12 sm:w-12`).
  Grid `grid-cols-2 sm:gap-4 lg:grid-cols-4` (or `sm:grid-cols-3`).
- Render header → stat cards → `<ModuleEntries … />`.

### Conventions / gotchas
- Design tokens only (no raw neutral/emerald); icon chips: wine `bg-primary/10 text-primary`,
  gold `bg-gold/20 text-gold-foreground`, fish `bg-sky-100 text-sky-600`, danger `bg-red-100 text-red-600`.
- Mobile: rows use `px-2 sm:px-5`; put the date in the meta line (don't hide it).
- The 3-tier gauge (feed): `>50%` green, `25–50%` amber, `<25%` red (vs `capacityBags`).
- Server actions are imported and called directly from client components; follow with
  `router.refresh()` so the server component re-renders.
- After **every** module: enable it in `SidebarNav`, `npm run build` (must be green), and a
  quick `tsx` DB script to verify any count side-effects, then **delete the script**.

---

## 7. Remaining modules — specs (schema already exists in `prisma/schema.prisma`)

### Medication (`/farm/medication`)
- Models: **`Medication`** (name, quantity, unit, purchaseDate, expiryDate, remaining) and
  **`HealthEvent`** (type: `VACCINATION|MEDICATION|VET_VISIT|OUTBREAK`, date, optional
  group/pond/medication, dosage, notes). Seeded meds: Doxygen, Tylodox, Amprolium, Multivitamin.
- Suggested: stat cards (meds in stock, expiring soon, health events 7d). Two sections — a
  **medication stock** list (CRUD; flag expiry) and a **health/vaccination events** log
  (CRUD; filter by type; target = group/pond/medication). No count side-effects.

### Harvest (`/farm/harvest`)  ← the important one
- Model **`HarvestRecord`** (date, optional group/pond, quantity, weightKg). On create it
  should **reduce the live count** (group/pond `currentCount -= quantity`, like mortality) and
  **create/increment `Inventory`** (kind `FROZEN_CHICKEN` for poultry, `FRESH_FISH` for fish;
  `quantity += weightKg`). This is the **farm → store bridge** (see PRD §6.3, §8).
- Edit/delete must reverse both the count and the inventory. Add a small **Inventory** read-out
  (`Inventory` model: kinds incl. `SMOKED_FISH`, `EGGS`). Optionally a "process fresh→smoked
  fish" action (FRESH_FISH→SMOKED_FISH) per PRD.

### Analytics (`/farm/analytics`)  ← build last, read-only
- Aggregations across the now-populated data: mortality trend, feed purchased/used/remaining,
  expenses by category, revenue by source, and the **killer feature — per-batch/flock/pond
  profitability** = revenue attributed − (feed + medication + transport + other) attributed
  (use the optional `groupId`/`pondId` on Expense/Revenue/FeedUsage). CSS-bar charts like the
  dashboard's expenses-by-category; no chart lib needed.

---

## 8. Git state

- Branch: **`feat/farmos-foundation`** (origin: `github.com/hokageCodes/chickenpackng`).
- Working tree clean. **Two local unpushed commits:** `60b797f` (poultry), `733f576` (fish).
  Earlier work is pushed. `git push origin feat/farmos-foundation` when ready.
- Commits end with `Co-Authored-By: Claude …` — adjust as you like.
- Two migrations applied: `…_init`, `…_feedstock_capacity`.

---

## 9. Immediate next steps

1. Push the branch (2 unpushed commits) so nothing is lost.
2. Build **Medication** using §6 template (enable sidebar first).
3. Then **Harvest** (wire the Inventory bridge), then **Analytics**.
4. Optional polish: full all-time history pages (current lists are recent-window + client
   pagination); a Profile/Settings page to edit owner name/password in-app; rotate Neon
   password + `AUTH_SECRET` if the exposed-in-chat credentials are a concern.

Everything compiles and the four core data flows are DB-verified. Pick up at Medication.
