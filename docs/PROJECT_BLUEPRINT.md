# Sinum Agro FarmOS — Master Project Blueprint

> Single source of truth for the platform.
>
> **North star:** _"A farm management and commerce platform that allows Sinum Agro
> to manage livestock operations, inventory, finances, and customer orders from a
> single system."_
>
> Status legend: ✅ built · 🟡 partial · ⬜ not started · ❓ needs decision
>
> _Last updated: 2026-06-21 — reconciled with the Sinum Agro planning conversation._

---

## 0. The single most important decision

**The real product is a Farm Operating System ("FarmOS") that happens to sell chicken
and fish — not an online shop.**

The biggest pain is **not sales**. It's **operational blindness**. Today the owner
does **not** know:
- Cost per bird / cost per kg of fish
- Mortality percentage
- Profit per batch
- Feed conversion efficiency
- Which flock/pond is actually making money

That's where the value (and the future SaaS/subscription opportunity) is. **We build
the internal system first, the website second.** Do **not** overbuild the public
website before the internal system is stable — if inventory is wrong, the website
becomes a liar.

### Brand & entity note
- **Sinum Agro Food Technology** is the **farm / parent business**. The internal
  **FarmOS** is *its* operating system (livestock, fish, feed, finance, analytics).
- **Protein Pack** is the **e-commerce offshoot** — the consumer-facing storefront
  brand that sells what the farm produces.
- The existing repo is currently branded **"Chicken Pack" / ChickenPack NG** (chicken
  only); the public storefront becomes **Protein Pack** (expanding into fish + eggs).
- So: **Sinum Agro FarmOS** (internal) + **Protein Pack** (public store), one shared DB.

---

## 1. Business Reality (from discovery)

Actual current operation — the ground truth everything is modelled on:

| Area | Reality today |
|---|---|
| **Poultry** | 350 birds total: **150 broilers** (grouped by *batch*), **200 layers** (grouped by *flock*) |
| **Fish** | **2 ponds** |
| **Feed tracking** | Measured **manually, daily** |
| **Mortality** | ❌ **Not recorded** (poultry or fish) |
| **Vaccinations** | ❌ **Not recorded** |
| **Harvest / slaughter** | Recorded **manually on paper** |
| **Sales channels** | Direct ✅, Distributors ✅, Agents ✅, Delivery ✅ |
| **Expense tracking** | **WhatsApp messages** |
| **Frozen stock** | **0** |
| **Live stock** | 150 broilers, 200 layers (fish count: ❓ get exact) |
| **Feed stock** | 6 bags fish feed, 10 bags layer feed, 4 bags broiler feed |
| **Medicine stock** | Doxygen, Tylodox, Amprolium, Multivitamin |

**Implication:** the highest-value early features are **mortality tracking,
expense tracking, and per-batch profitability** — none of which exist today.

---

## 2. Three Surfaces, One Database

Two products sharing one database, plus the internal engine:

| Surface | Audience | Purpose | Build priority |
|---|---|---|---|
| **Farm ERP (FarmOS)** | Farm owner/managers/staff | Livestock, feed, health, mortality, harvest, **finance**, analytics | **1st — the core** |
| **Commerce Admin** | Sales/ops staff | Products, orders, payments, customers, delivery | 2nd |
| **Public Website** | Customers, distributors, agents | Trust + discovery + **order requests** | 3rd (feature, not foundation) |

The **bridge** that unifies them is **Inventory**: harvested/processed livestock →
frozen/live stock → sellable products on the website.

```
   INTERNET
       ↓
 [ Protein Pack Website ]
    ↓            ↓
 Orders     Leads / WhatsApp
    ↓
 Admin System (FarmOS)
    ↓
 Inventory + Farm Operations
    ↓
 Real-world fulfillment
```

---

## 3. Current State of the Codebase

Front-end-only **chicken** storefront. Useful, but it's effectively a head-start on
**Phase 4 (website)** — while the real priority is the internal FarmOS that doesn't
exist yet. It is **chicken-only**, has **no fish**, no backend, and uses a
localStorage cart (which is Phase 5 territory, ahead of where the strategy says to be).

**Stack (as built):** Next.js `15.5.19` (App Router, **JavaScript**), React `19.1.0`,
Tailwind `3.4.17`, framer-motion, `@vercel/analytics`. Deployed on Vercel.

| Area | Status | Notes |
|---|---|---|
| Home / Products / Product detail / Company | ✅ | Chicken only |
| Cart | 🟡 | `contexts/CartContext.jsx`, localStorage only, no checkout |
| Catalog data | 🟡 | Hard-coded `data/products.js` (4 chicken products) |
| SEO / OG / JSON-LD | ✅ | In `app/layout.js` |
| Fish products | ⬜ | Not represented anywhere |
| Backend / DB / Auth / Admin / Finance / Farm | ⬜ | None |

**Reuse plan:** keep the front-end shell, brand system, and components; repoint the
catalog at a real API; add fish; replace cart-first checkout with the **Request Order**
flow for the MVP.

---

## 4. Surface A — Farm ERP / FarmOS  ⭐ (build first)

The real business engine. Route group `/farm` (or its own app), RBAC-gated.

### 4.1 Dashboard (login screen)
At a glance:
- Total Broilers: 150 · Total Layers: 200 · Fish Ponds: 2
- Feed remaining: Broiler 4 bags · Layer 10 bags · Fish 6 bags
- Today's feed usage
- Recent expenses
- Recent mortality
- Estimated inventory value

### 4.2 Poultry Module
**Broilers (by batch)** — per batch: `Batch ID, breed, arrival date, quantity,
expected harvest date, feed consumption, mortality, projected profit`.

**Layers (by flock)** — per flock: `Flock ID, breed, quantity, feed consumption,
**egg production**, mortality, medication history`.
> Add **egg production** immediately if eggs are sold — that's where layer
> profitability lives. ❓ Confirm eggs are sold.

### 4.3 Fish Module
Per pond (×2): `species, quantity stocked, feed consumed, mortality, projected
harvest date/weight`. ❓ Get exact fish species + counts.

### 4.4 Feed Management (one of the most-used modules)
Current inventory: Fish 6 · Layer 10 · Broiler 4 bags.
Daily **Feed Usage** entry → `date, category, quantity (e.g. 0.5 bag)` → system
auto-decrements inventory.

| Feed | Purchased | Used | Balance |
|---|---|---|---|
| Starter Mash | 50 bags | 20 bags | 30 bags |

### 4.5 Medication Management
Stock today: Doxygen, Tylodox, Amprolium, Multivitamin.
Track: `medication, quantity, purchase date, expiry date, used for, remaining`.
Plus **vaccination schedule/log** (currently not recorded at all).

### 4.6 Mortality Tracking  ⭐ (must-have, biggest quick win)
Every death logged: `date, animal type, batch/flock/pond, quantity, possible cause,
notes`. Dashboard surfaces **Mortality Rate %** — _"that number alone can save thousands."_

### 4.7 Harvest Management
Poultry: `harvest date, quantity, weight`. Fish: `harvest date, pond, weight`.
On harvest → feeds **Inventory** (live → frozen/processed stock).

### 4.8 Finance Module  ⭐ (replaces WhatsApp — owners get addicted to this)
- **Expenses:** `category, amount, date, vendor, notes`. Categories: Feed, Medication,
  Fuel, Staff, Transportation, Maintenance, Utilities.
- **Revenue:** online sales, offline sales, wholesale sales.
- **Profit dashboard (monthly):** `Revenue − Expenses = Profit`.

### 4.9 Analytics Module (CEO dashboard)
- **Farm KPIs:** mortality rate, feed consumption, growth rate, harvest yield.
- **Feed analytics:** purchased vs used vs remaining.
- **Sales KPIs:** total/monthly revenue, top customers, top products.
- **Profitability per batch ⭐ (the killer feature):**
  `Revenue − Feed − Medication − Transportation − Other = Net Profit` per batch/flock/pond.

---

## 5. Surface B — Commerce Admin (Store operations)

Route group `/admin`, RBAC-gated. Built after FarmOS core + inventory exist.

| Module | Scope |
|---|---|
| **Products** | CRUD, categories, pricing (retail vs wholesale tiers) |
| **Orders** | Statuses: Pending → Processing → Delivered / Cancelled |
| **Payments** | View, verify, refunds (later: PSP integration) |
| **Customers** | List, purchase history, analytics; types: **Retail / Distributor / Agent** |
| **Delivery** | Delivery status, dispatch records, zones & fees |

Order lifecycle (MVP — request-driven):
```
REQUEST RECEIVED → CONFIRMED (via WhatsApp/admin) → PROCESSING → DELIVERED
        └───────────────── CANCELLED ─────────────────┘
```

---

## 6. Surface C — Public Website

A **sales + trust + lead + ordering engine** that plugs into FarmOS later. Wins on
**speed-to-order, trust, WhatsApp integration, and simplicity** — *not* aesthetics.
Three layers: **brand & trust → product discovery → order/conversion.**

### 6.1 Sitemap
| Page | Status | Contents |
|---|---|---|
| **Home** | ✅ (chicken) | Hero, quick stats (years/birds/customers), featured products (broilers, eggs, fish), how it works (Farm → Processing → Delivery), testimonials, CTAs |
| **Shop / Products** | 🟡 | Chicken (whole/halved/cut), **fish (tilapia/catfish ❓)**, eggs (future). Card: image, price per kg/unit, availability (in stock / pre-order), "Add to order" |
| **Product detail** | ✅ (chicken) | Description, weight options, **retail vs wholesale pricing**, availability, delivery info |
| **Order page** | ⬜ | **MVP = Request Order System** (see §6.2), not full checkout |
| **About** | 🟡 | Protein Pack story, expansion into fish, farming practices, hygiene/freezing process |
| **Contact** | ⬜ | Click-to-call, **WhatsApp button (critical in NG)**, email, map, hours |
| **Delivery Info** | ⬜ | Zones (mainland / island / outside Lagos), fees, min order, same-day vs scheduled |
| **FAQ** | 🟡 | Live chickens? Deliver outside Lagos? Fresh vs frozen fish? Bulk? Min order? |
| **Blog (optional)** | ⬜ | SEO: storing frozen chicken, broiler feed practices, farm updates |

### 6.2 Order flow — MVP (Request Order, recommended)
```
User selects products → fills form (name, phone, address, quantity)
   → submits request → admin receives in dashboard
   → admin confirms via WhatsApp/system → delivery arranged
```
**No online payment at MVP.** Full e-commerce (cart, checkout, online payment, order
tracking) is **Phase 5**.

### 6.3 Lead capture (every page)
- **"Order via WhatsApp"** · **"Request Delivery"** · **"Check Availability"**
- Click-to-call + WhatsApp + order-request form, everywhere.

### 6.4 Product sync (future integration)
Website reads **read-only** from FarmOS: product name, price, availability, stock
status. Admin updates → website updates automatically. (Don't enable until inventory
is trustworthy.)

---

## 7. Database Entities (high-level)

```
# Identity & commerce
User, Customer (type: retail|distributor|agent), Address
Product, Category, ProductVariant (weight/unit, retail & wholesale price)
Order, OrderItem, Payment
Inventory  ← shared bridge (live / frozen / feed / medication)

# Farm — poultry & fish
AnimalBatch (broiler batch | layer flock: id, breed, type, arrivalDate, quantity, expectedHarvest, status)
Pond (id, species, quantityStocked)
EggLog (flockId, date, collected, grade, broken)
FeedPurchase, FeedUsage (category, quantity, date)
Medication, MedicationUsage (incl. expiry, usedFor)
VaccinationRecord
MortalityRecord (date, animalType, batch/flock/pond, quantity, cause, notes)
HarvestRecord (date, type, pond?, quantity, weight)

# Finance
Expense (category, amount, date, vendor, notes)
Revenue (source: online|offline|wholesale, amount, date)
```

---

## 8. Roles & Permissions (RBAC)

| Role | Website | Commerce Admin | Farm ERP |
|---|---|---|---|
| `customer / distributor / agent` | full | — | — |
| `sales_staff` | — | orders, customers, delivery | read-only inventory |
| `farm_staff` | — | — | daily logs (feed, mortality, health) |
| `farm_manager` | — | read-only inventory | full incl. finance |
| `owner / super_admin` | — | full | full |

❓ Confirm who logs in day-to-day (owner only, or staff too?).

---

## 9. Roadmap (authoritative — from the planning conversation)

> Farm-first. Each phase ships independently.

**Phase 1 — Farm ERP core (≈4–6 weeks)** ⬜ ⭐
Dashboard · Poultry (broiler batches + layer flocks + eggs) · Fish · Feed · Medication
· **Mortality** · **Expenses**. _No website work yet._

**Phase 2 — Inventory** ⬜
Live stock · frozen stock · feed stock — unified and trustworthy.

**Phase 3 — Sales** ⬜
Customers (retail/distributor/agent) · orders · revenue. Finance: profit per batch.

**Phase 4 — Public Website** ⬜
About · Products (chicken + fish + eggs) · Contact (WhatsApp) · Delivery Info · FAQ ·
**Request Order** flow. _Reuses/ rebrands existing storefront; adds fish._

**Phase 5 — Full E-Commerce** ⬜
Cart · checkout · online payments · delivery tracking · customer portal (order history,
reorder, saved addresses).

---

## 10. Tech Direction

- Keep **Next.js (App Router)** for website + admin shells; **shared backend** for
  FarmOS + Commerce + Website.
- Add **Postgres (Neon via Vercel Marketplace) + Prisma**; introduce **TypeScript**
  for API/admin.
- **Auth + RBAC:** Clerk (Vercel Marketplace) or Auth.js.
- **WhatsApp + SMS:** Termii / Twilio / WhatsApp Business — central to the order flow.
- **Payments (Phase 5):** Paystack (NG-first) or Flutterwave. ❓
- **Images:** Vercel Blob.
- Core APIs: Products, Orders, Inventory (read-only for website), Customer-requests,
  plus Farm + Finance internal APIs.

---

## 11. PRD Structure (deliverable to dev team)

1. Executive Summary · 2. Business Goals · 3. User Types · 4. User Stories ·
5. Functional Requirements · 6. Non-Functional Requirements · 7. Database Entities ·
8. Workflows · 9. Permissions Matrix · 10. UI Screens · 11. API Requirements ·
12. MVP Scope · 13. Future Scope.

---

## 12. Decisions & Open Questions

**Resolved (2026-06-21):**
1. ✅ **Branding:** proceed as **Sinum Agro**. Storefront gets rebranded/folded in.
2. ✅ **Eggs:** **yes, eggs are sold** → layer egg-production is **in Phase 1**.
3. ✅ **Fish:** **catfish** (live/fresh from 2 ponds) + **smoked fish** (processed,
   value-added product made from catfish — an inventory item *and* a sellable product).
   **2 ponds.**
4. ✅ **Login:** **owner only for now**, but **schema must be staff-ready** (User has a
   `role`; RBAC designed in from day one).

**Still open:**
5. **Wholesale pricing:** retail vs distributor/agent price tiers — confirm structure.
6. **Delivery:** which Lagos zones, fee model, same-day vs scheduled, own riders vs 3rd party?
7. **Payments (Phase 5):** Paystack vs Flutterwave?
8. **Tech:** OK to add Postgres/Prisma + TypeScript and a shared backend?
9. **Hosting/offline:** is farm internet reliable, or do we need offline-tolerant data entry?

---

## 13. Immediate Next Steps

1. Confirm §12 answers (esp. branding, eggs, fish details, login users).
2. Write the **PRD** (§11) targeting **Phase 1 Farm ERP** scope.
3. Scaffold backend: Prisma schema (§7), auth + RBAC, FarmOS app shell.
4. Build Phase 1: Dashboard + Mortality + Feed + Expenses first (highest-value, fastest wins).

> Living document — each surface (§4–6) graduates into its own detailed spec under
> `docs/` as we begin building it.
