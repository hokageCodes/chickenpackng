# PRD — Phase 1: Protein Park FarmOS (Farm ERP Core)

> Product Requirements Document for the first buildable system.
> Parent strategy: [PROJECT_BLUEPRINT.md](./PROJECT_BLUEPRINT.md)
>
> _Version 1.0 — 2026-06-21_

---

## 1. Executive Summary

Protein Park is a Lagos poultry + fish farm (350 birds — 150 broilers, 200 layers —
plus 2 catfish ponds) that currently runs on paper, manual measurement, and WhatsApp.
Mortality and vaccinations are not recorded at all; harvests are on paper; expenses
live in WhatsApp. The owner therefore has **no visibility** into mortality rate, cost
per bird, feed efficiency, or profit per batch.

**Phase 1 delivers a Farm Operating System (FarmOS)** — an internal web app that
records daily farm operations (livestock, feed, medication, mortality, harvest, eggs)
and finances (expenses, revenue), and surfaces the numbers that were previously
invisible. **No public website or online payments in this phase** — those are Phases 4–5.

**Primary outcome:** the owner can log in and immediately see live stock, feed
remaining, today's mortality, recent expenses, mortality rate %, and per-batch
profitability.

---

## 2. Business Goals

| # | Goal | Success signal |
|---|---|---|
| G1 | End operational blindness | Mortality, feed, expenses all recorded daily in one place |
| G2 | Reveal profitability | Owner can see net profit per broiler batch / layer flock / pond |
| G3 | Replace WhatsApp expense tracking | 100% of expenses logged in-app within 30 days |
| G4 | Reduce losses | Mortality rate visible and trending; early disease signals |
| G5 | Foundation for commerce | Inventory data clean enough to later power the website (Phases 3–4) |

---

## 3. User Types

| User | Phase 1 access | Notes |
|---|---|---|
| **Owner** | Full access to everything | The only login for now |
| `farm_manager` | (schema-ready, not provisioned) | Full incl. finance |
| `farm_staff` | (schema-ready, not provisioned) | Daily data entry only |
| `sales_staff` | (schema-ready, not provisioned) | Commerce only (Phase 3+) |

> Build RBAC now (role on `User`, permission checks on every route), but seed **one
> owner account**. Adding staff later = create users + assign roles, no rework.

---

## 4. User Stories (Phase 1)

**Dashboard**
- As the owner, I see total broilers, layers, ponds, and feed remaining the moment I log in.
- As the owner, I see today's feed usage, recent mortality, recent expenses, and estimated inventory value.

**Poultry**
- As the owner, I create a **broiler batch** (breed, arrival date, quantity, expected harvest).
- As the owner, I create a **layer flock** and log **daily egg production**.
- As the owner, I see current count = initial − mortality − harvested, per batch/flock.

**Fish**
- As the owner, I set up each **pond** (catfish, quantity stocked) and log feed + mortality + harvest.

**Feed**
- As the owner, I record **daily feed usage** per category; the system decrements feed stock automatically.
- As the owner, I record **feed purchases** that increment stock.
- As the owner, I get a low-stock warning when a feed type runs low.

**Medication & vaccination**
- As the owner, I track medication stock (Doxygen, Tylodox, Amprolium, multivitamin) with expiry.
- As the owner, I log a vaccination/medication event against a batch/flock.

**Mortality**
- As the owner, I log every death (date, animal, batch/flock/pond, quantity, cause).
- As the owner, I see **mortality rate %** per batch and overall.

**Harvest**
- As the owner, I record a harvest (poultry: qty + weight; fish: pond + weight) which moves stock from live → inventory.

**Finance**
- As the owner, I log an **expense** (category, amount, date, vendor).
- As the owner, I log **revenue** from a sale.
- As the owner, I see **monthly profit** = revenue − expenses, and **net profit per batch**.

---

## 5. Functional Requirements

### 5.1 Dashboard
- FR-D1: Show live counts: broilers, layers, ponds (with fish count).
- FR-D2: Show feed remaining per category (broiler/layer/fish) in bags.
- FR-D3: Show today's feed usage, recent mortality (last 7d), recent expenses (last 7d).
- FR-D4: Show **mortality rate %** (overall + per active batch).
- FR-D5: Show **estimated inventory value** (live stock × est. value + feed + frozen/smoked stock).

### 5.2 Poultry
- FR-P1: CRUD broiler **batches** and layer **flocks** (shared `AnimalGroup`, `type` = BROILER|LAYER).
- FR-P2: Auto-compute `currentCount = initialCount − Σ mortality − Σ harvested`.
- FR-P3: Layer flocks support **daily egg log** (collected, grade, broken).
- FR-P4: Status lifecycle: `ACTIVE → HARVESTING → CLOSED`.

### 5.3 Fish
- FR-F1: CRUD **ponds** (species default "Catfish", quantity stocked).
- FR-F2: Log pond feed usage, mortality, harvest (weight).
- FR-F3: **Smoked fish** is produced from harvested catfish → tracked as an inventory item (processing event reduces fresh-fish stock, increases smoked-fish stock).

### 5.4 Feed
- FR-FE1: Feed categories: Broiler, Layer, Fish (extensible).
- FR-FE2: **FeedPurchase** increments stock; **FeedUsage** decrements stock; running balance per category.
- FR-FE3: Low-stock threshold per category → dashboard warning.

### 5.5 Medication & Vaccination
- FR-M1: Medication stock with purchase date, expiry, quantity, remaining.
- FR-M2: **HealthEvent** (vaccination | medication | vet visit | outbreak) logged against a group/pond.
- FR-M3: Expiry warning on dashboard.

### 5.6 Mortality
- FR-MO1: Log per event: date, animalType, groupId/pondId, quantity, cause, notes.
- FR-MO2: Decrements the group/pond current count.
- FR-MO3: Mortality rate % = Σ mortality ÷ initialCount, per group and overall.

### 5.7 Harvest
- FR-H1: Poultry harvest: quantity + total weight → reduces live count, creates Inventory (frozen/processed).
- FR-H2: Fish harvest: pond + quantity + weight → reduces pond count, creates Inventory.

### 5.8 Finance
- FR-FN1: Expense CRUD (category, amount ₦, date, vendor, notes, optional link to group/pond for cost attribution).
- FR-FN2: Revenue CRUD (source: online|offline|wholesale, amount, date, optional customer, optional group/pond).
- FR-FN3: Monthly profit = Σ revenue − Σ expenses.
- FR-FN4: **Per-batch profitability** = revenue attributed − (feed + medication + transport + other) attributed.

---

## 6. Non-Functional Requirements

- **NFR1 Mobile-first:** data entry happens on a phone at the farm → fast, large tap targets, minimal typing.
- **NFR2 Speed:** dashboard loads < 2s; entry forms submit < 1s perceived (optimistic UI).
- **NFR3 Reliability of data:** all writes are transactional (mortality/harvest/feed must atomically update counts).
- **NFR4 Auditability:** every record stores `createdBy` + timestamps (ready for multi-user).
- **NFR5 Currency:** all money in **₦ (NGN)**, integer kobo or 2-dp decimal — pick one and be consistent.
- **NFR6 Security:** owner auth required for all routes; RBAC enforced server-side.
- **NFR7 Offline tolerance:** ❓ confirm farm connectivity — if poor, queue writes locally and sync (can defer to v1.1).

---

## 7. Database Entities (Prisma-style schema)

```prisma
// ── Identity & RBAC ─────────────────────────────────────────
enum Role { OWNER FARM_MANAGER FARM_STAFF SALES_STAFF }

model User {
  id        String   @id @default(cuid())
  name      String
  email     String   @unique
  phone     String?
  role      Role     @default(OWNER)
  createdAt DateTime @default(now())
  // relations: createdBy on records below
}

// ── Livestock ───────────────────────────────────────────────
enum AnimalType { BROILER LAYER }
enum GroupStatus { ACTIVE HARVESTING CLOSED }

model AnimalGroup {            // broiler "batch" OR layer "flock"
  id            String      @id @default(cuid())
  type          AnimalType
  label         String      // "Batch A", "Flock A"
  breed         String?
  arrivalDate   DateTime
  initialCount  Int
  currentCount  Int
  expectedHarvest DateTime?
  status        GroupStatus @default(ACTIVE)
  houseName     String?
  mortalities   MortalityRecord[]
  healthEvents  HealthEvent[]
  eggLogs       EggLog[]      // layers only
  harvests      HarvestRecord[]
  createdById   String
  createdAt     DateTime    @default(now())
}

model Pond {
  id             String  @id @default(cuid())
  label          String  // "Pond 1"
  species        String  @default("Catfish")
  quantityStocked Int
  currentCount   Int
  stockedDate    DateTime
  mortalities    MortalityRecord[]
  harvests       HarvestRecord[]
  createdById    String
  createdAt      DateTime @default(now())
}

model EggLog {
  id        String   @id @default(cuid())
  groupId   String
  group     AnimalGroup @relation(fields: [groupId], references: [id])
  date      DateTime
  collected Int
  grade     String?   // small/medium/large or A/B
  broken    Int       @default(0)
  createdById String
}

// ── Feed ────────────────────────────────────────────────────
enum FeedCategory { BROILER LAYER FISH }

model FeedPurchase {
  id        String   @id @default(cuid())
  category  FeedCategory
  bags      Float
  costNGN   Decimal  @db.Decimal(12,2)
  vendor    String?
  date      DateTime
  createdById String
}

model FeedUsage {
  id        String   @id @default(cuid())
  category  FeedCategory
  bags      Float
  date      DateTime
  groupId   String?  // optional attribution
  pondId    String?
  createdById String
}

model FeedStock {            // running balance, one row per category
  category  FeedCategory @id
  bags      Float
  lowThreshold Float    @default(2)
  updatedAt DateTime @updatedAt
}

// ── Medication & Health ─────────────────────────────────────
model Medication {
  id          String   @id @default(cuid())
  name        String   // Doxygen, Tylodox, Amprolium, Multivitamin
  quantity    Float
  unit        String   @default("unit")
  purchaseDate DateTime?
  expiryDate  DateTime?
  remaining   Float
  createdById String
}

enum HealthEventType { VACCINATION MEDICATION VET_VISIT OUTBREAK }

model HealthEvent {
  id        String   @id @default(cuid())
  type      HealthEventType
  date      DateTime
  groupId   String?
  group     AnimalGroup? @relation(fields: [groupId], references: [id])
  pondId    String?
  medicationId String?
  dosage    String?
  notes     String?
  createdById String
}

// ── Mortality & Harvest ─────────────────────────────────────
model MortalityRecord {
  id        String   @id @default(cuid())
  date      DateTime
  animalType String  // "broiler" | "layer" | "catfish"
  groupId   String?
  group     AnimalGroup? @relation(fields: [groupId], references: [id])
  pondId    String?
  pond      Pond?    @relation(fields: [pondId], references: [id])
  quantity  Int
  cause     String?
  notes     String?
  createdById String
}

model HarvestRecord {
  id        String   @id @default(cuid())
  date      DateTime
  groupId   String?
  group     AnimalGroup? @relation(fields: [groupId], references: [id])
  pondId    String?
  pond      Pond?    @relation(fields: [pondId], references: [id])
  quantity  Int
  weightKg  Float
  createdById String
}

// ── Inventory (live, frozen, processed, feed) ───────────────
enum InventoryKind { LIVE_POULTRY LIVE_FISH FROZEN_CHICKEN FRESH_FISH SMOKED_FISH EGGS }

model Inventory {
  id        String   @id @default(cuid())
  kind      InventoryKind
  label     String
  quantity  Float    // kg or units
  unit      String   // "kg" | "crate" | "piece"
  updatedAt DateTime @updatedAt
}

// ── Finance ─────────────────────────────────────────────────
enum ExpenseCategory { FEED MEDICATION FUEL STAFF TRANSPORTATION MAINTENANCE UTILITIES OTHER }
enum RevenueSource { ONLINE OFFLINE WHOLESALE }

model Expense {
  id        String   @id @default(cuid())
  category  ExpenseCategory
  amountNGN Decimal  @db.Decimal(12,2)
  date      DateTime
  vendor    String?
  notes     String?
  groupId   String?  // attribute cost to a batch/flock
  pondId    String?
  createdById String
}

model Revenue {
  id        String   @id @default(cuid())
  source    RevenueSource
  amountNGN Decimal  @db.Decimal(12,2)
  date      DateTime
  customer  String?
  groupId   String?
  pondId    String?
  notes     String?
  createdById String
}
```

> **Seed data** (from discovery): 1 broiler batch (150), 1 layer flock (200),
> 2 catfish ponds; FeedStock: Broiler 4, Layer 10, Fish 6 bags; Medications:
> Doxygen, Tylodox, Amprolium, Multivitamin; Frozen stock 0.

---

## 8. Workflows

**Daily feed entry**
```
Owner → Feed → "Log usage" → category + bags + date → submit
  → FeedUsage created → FeedStock.bags -= bags → dashboard balance updates
  → if balance < lowThreshold → dashboard low-stock badge
```

**Log a death**
```
Owner → Mortality → "Log" → date, animalType, select group/pond, qty, cause
  → MortalityRecord created (transaction) → group/pond.currentCount -= qty
  → dashboard mortality rate % recomputed
```

**Harvest a batch**
```
Owner → Group → "Harvest" → quantity + weightKg
  → HarvestRecord created → group.currentCount -= qty (status → HARVESTING/CLOSED)
  → Inventory(FROZEN_CHICKEN, +weightKg) created
```

**Fish → smoked fish (processing)**
```
Harvest catfish → Inventory(FRESH_FISH, +kg)
  → "Process to smoked" → FRESH_FISH -= kg, SMOKED_FISH += yield kg
```

**Per-batch profitability (analytics)**
```
For group G: Σ Revenue(groupId=G) − Σ Expense(groupId=G)
  (+ allocate shared feed cost via FeedUsage attributed to G) = Net Profit
```

---

## 9. Permissions Matrix

| Capability | Owner | farm_manager | farm_staff | sales_staff |
|---|:--:|:--:|:--:|:--:|
| View dashboard | ✅ | ✅ | ✅ | partial |
| Livestock/fish CRUD | ✅ | ✅ | ➖ entry only | ❌ |
| Feed / mortality / health entry | ✅ | ✅ | ✅ | ❌ |
| Harvest | ✅ | ✅ | ❌ | ❌ |
| Finance (expense/revenue) | ✅ | ✅ | ❌ | view |
| Analytics / profitability | ✅ | ✅ | ❌ | sales only |
| Manage users | ✅ | ❌ | ❌ | ❌ |

_Phase 1 provisions **Owner** only; the rest are enforced-but-unused until staff are added._

---

## 10. UI Screens (Phase 1)

1. **Login** (owner)
2. **Dashboard** — KPI cards + recent activity (the home screen)
3. **Poultry** — list of batches/flocks → group detail (counts, mortality, eggs, health, harvest)
4. **Fish** — 2 pond cards → pond detail
5. **Feed** — stock balances + "Log usage" / "Log purchase"
6. **Medication** — stock list + expiry flags + "Log health event"
7. **Mortality** — log + history table + rate % chart
8. **Harvest** — log + history
9. **Finance** — Expenses tab, Revenue tab, Monthly profit summary
10. **Analytics** — mortality rate, feed analytics, per-batch profitability

Design priorities (NFR1): mobile-first, big buttons, dropdowns over free text, today's
date prefilled, one-tap "log again".

---

## 11. API Requirements

REST route handlers (or server actions) under `/api`, all owner-auth guarded:

```
GET  /api/dashboard                 → aggregated KPIs
CRUD /api/groups                    → broiler batches & layer flocks
CRUD /api/ponds
POST /api/eggs                      → daily egg log
CRUD /api/feed/purchases | /usage   → mutate FeedStock transactionally
GET  /api/feed/stock
CRUD /api/medications  | /api/health-events
CRUD /api/mortality                 → mutates counts transactionally
CRUD /api/harvests                  → mutates counts + inventory
CRUD /api/inventory  | POST /api/inventory/process-smoked
CRUD /api/expenses   | /api/revenue
GET  /api/analytics/profitability?groupId=
```

Validation with Zod; all count-mutating writes wrapped in DB transactions.

---

## 12. MVP Scope (build order within Phase 1)

> Ship in this order — highest value + fastest wins first.

1. **Auth + app shell + Prisma schema + seed** (foundation).
2. **Dashboard (read-only skeleton)** + **Mortality** + **Feed** + **Expenses**
   — the four that immediately end the blindness.
3. **Poultry** (batches/flocks + egg logs) + **Fish** (ponds).
4. **Medication/health** + **Harvest + Inventory**.
5. **Finance summary + Analytics** (monthly profit, per-batch profitability).

**Explicitly OUT of Phase 1:** public website, cart/checkout, online payments,
customer-facing anything, multi-user staff accounts (schema-ready only).

---

## 13. Future Scope (later phases)

- **Phase 2:** full Inventory (live/frozen/smoked/feed unified, valuation).
- **Phase 3:** Sales (customers: retail/distributor/agent, orders, revenue linkage).
- **Phase 4:** Public website (Protein Park brand, chicken + catfish + smoked fish + eggs, Request-Order via WhatsApp).
- **Phase 5:** Full e-commerce (cart, checkout, Paystack/Flutterwave, delivery tracking, customer portal).
- **Later:** multi-user staff, forecasting, FCR analytics, SaaS multi-tenant (sell FarmOS to other farms).

---

## 14. Open items before build

- ❓ Confirm **tech stack** sign-off: Next.js + Postgres (Neon) + Prisma + TypeScript + Clerk/Auth.js.
- ❓ **Farm connectivity** → decide if offline-queue is needed in v1 (NFR7).
- ❓ Estimated **per-kg / per-bird values** for inventory valuation (FR-D5).
- ❓ Smoked-fish **yield ratio** (kg fresh → kg smoked) for processing math.
