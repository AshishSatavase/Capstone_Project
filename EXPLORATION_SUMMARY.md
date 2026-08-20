# Fixed Income Order Execution System - Codebase Exploration Summary

**Date:** 2026-08-20 | **Status:** Initial exploration complete

---

## 📋 Project Overview

**Type:** Next.js + TypeScript + Tailwind CSS  
**Purpose:** Institutional Fixed Income Bond Trading Terminal (UBS-style)  
**Design Direction:** White background, black text, red (#EC0016) for CTAs/negatives/dividers, green (#0F9D58) for positive values only

**Current Step:** Step 1 of 8 - Design System foundation  
**Next Step:** Market Watch page (replaces current Style Guide)

---

## 🎨 Design Tokens & Theme

### Tailwind Configuration
- **Location:** `tailwind.config.ts` (extends base colors from `lib/theme.ts`)
- **CSS Theme:** `app/globals.css` (@theme directive with Tailwind v4)

### Color Palette (Institutional)
```typescript
const colors = {
  ubsRed: "#EC0016",        // CTAs, negatives, dividers
  positive: "#0F9D58",      // Positive values only
  ink: "#111111",           // Primary text
  black: "#000000",         // Full black
  white: "#FFFFFF",         // Surfaces
  border: "#E5E5E5",        // Dividers
  muted: "#666666",         // Secondary text
  faint: "#9A9A9A",         // Tertiary text
};
```

### Typography & Spacing
- **Font:** Inter (Google Fonts), system fallback
- **Font Features:** Tabular numbers (tnum), stylistic set 01 (ss01)
- **Border Radius:** `sm: 2px`, `md: 4px` (minimal)
- **Tracking:** `header: 0.14em`, `label: 0.08em`
- **Font Sizes:** Includes custom `2xs: 0.6875rem` for dense UI

### Chart Configuration
- **Axis:** Ink color
- **Grid:** Border gray
- **Accent:** UBS red
- **Positive Series:** Green
- **Neutral Slices:** Grayscale + red palette (7 colors)
- **Tooltip:** White surface, border, 4px shadow, 12px font

---

## 🏗️ Project Structure

```
/app
  ├── layout.tsx          (RootLayout with metadata, font setup)
  ├── page.tsx            (home → StyleGuide component)
  └── globals.css         (@import tailwindcss, @theme tokens, base styles)

/components
  ├── /ui                 (primitives & patterns)
  │   ├── Button.tsx      (variants: primary, buy, sell, secondary, outline, ghost, loading)
  │   ├── Badge.tsx       (status indicators)
  │   ├── Card.tsx        (white surface, minimal border)
  │   ├── DataTable.tsx   (searchable, sortable)
  │   ├── DeltaValue.tsx  (formatted ±% with color)
  │   ├── RatingBadge.tsx (credit ratings)
  │   ├── SectionHeader.tsx (eyebrow + title + optional actions)
  │   ├── StatChip.tsx    (KPI display with optional delta/hint)
  │   ├── Input.tsx       (text input)
  │   ├── Skeleton.tsx    (table loading state)
  │   └── EmptyState.tsx  (no data)
  ├── /charts             (Recharts wrappers)
  │   ├── index.tsx       (AppLineChart, AppAreaChart, AppBarChart, AppDonutChart)
  │   ├── ChartContainer.tsx (title + height wrapper)
  │   └── ChartTooltip.tsx (theme-consistent tooltips)
  └── /dev
      └── StyleGuide.tsx  (design system review surface, steps 1-8)

/lib
  ├── theme.ts           (color tokens, chart palette, tooltip styles)
  ├── types.ts           (domain types: Bond, Holding, Portfolio, Trade, etc.)
  ├── data.ts            (typed data-access layer, ~297 lines)
  └── utils.ts           (cn() utility for classname merging)

/data                    (JSON seed data files)
  ├── bonds.json         (bond instrument catalog with priceHistory)
  ├── portfolio.json     (holdings with lots, costing methods)
  ├── trades.json        (order history)
  ├── dealers.json       (party master)
  ├── watchlist.json     (ISIN lists per client)
  ├── newsFeed.json      (news items)
  ├── rates.json         (market rates snapshot)
  ├── yieldCurve.json    (tenor × yield)
  ├── benchmarks.json    (NIFTY_COMPOSITE_DEBT, GSEC_10Y_INDEX)
  ├── newIssuances.json  (upcoming issues)
  ├── commissions.json   (rates × tier + summary)
  └── [others]

/public                 (static assets, currently minimal)
/scripts                (utility scripts, currently empty)
```

---

## 🧩 Base Components (Complete)

All primitives are built and exported from `components/ui/index.tsx`:

### UI Components
| Component | Status | Features |
|-----------|--------|----------|
| **Button** | ✅ Done | 6 variants (primary, buy/sell, secondary, outline, ghost), size, loading state |
| **Badge** | ✅ Done | 4 variants (default, red, outline, muted) for status display |
| **Card** | ✅ Done | White surface, 1px border, no shadow (minimal) |
| **DataTable** | ✅ Done | Columns (sort, align, custom render), searchable, sortable, row keys |
| **DeltaValue** | ✅ Done | Signed ± format, color-coded (red negative, green positive, neutral zero) |
| **RatingBadge** | ✅ Done | Credit rating display (AAA, AA+, BBB, etc.) |
| **SectionHeader** | ✅ Done | Eyebrow + title + optional actions layout |
| **StatChip** | ✅ Done | Label + value + optional delta + hint, multi-column grid support |
| **Input** | ✅ Done | Text input with theming |
| **Skeleton** | ✅ Done | Table loading skeleton |
| **EmptyState** | ✅ Done | No data message |

### Chart Components
- **AppLineChart, AppAreaChart, AppBarChart, AppDonutChart** ✅ Done (Recharts wrappers)
- **ChartContainer** ✅ Done (title + height)
- **ChartTooltip** ✅ Done (theme-consistent tooltips)

---

## 📊 Data Layer (`lib/data.ts`)

### Data Access Functions
**Bonds:**
- `getBonds()` → all instruments
- `getBondByISIN(isin)` → single bond
- `searchBonds(query)` → full-text search
- `filterBonds(filters)` → by type, issuer, rating, coupon
- `getPeerBonds(isin, limit)` → similar instruments for comparison

**Portfolio:**
- `getPortfolio(clientId)` → holdings with lots
- `getPortfolioValueSeries(clientId, method?)` → **[CRITICAL - SEE BELOW]**
- `getHoldingCost(holding, method)` → invested cost by costing method

**Holdings & Lots:**
- `getWatchlist(clientId)` → ISINs list
- `getWatchlistBonds(clientId)` → bonds in watchlist
- `getCashFlowSchedule(isin)` → coupon + redemption dates

**Trades & Orders:**
- `getTrades()` → all trades sorted desc by date
- `getTradesByClient(clientId)` → client's trades
- `getOpenOrders(clientId?)` → Placed/Pending/Partially Filled

**Market Data:**
- `getRates()` → repo, reverse-repo, GSec 10Y, USD/INR
- `getYieldCurve()` → tenor × yield
- `getBenchmarks()` → indices with price history
- `getNewIssuances()` → upcoming issues
- `getCommissions()` → rates × tier + daily summary

**Helpers:**
- `lotCost(lots, quantity, method)` → applies FIFO/LIFO/WeightedAvg
- `dirtyPrice(bond, cleanPrice)` → adds accrued interest
- `couponAmount(bond)` → per-period coupon

---

## 🔍 Portfolio MTM Calculation - **STATUS: APPEARS COMPLETE**

### Current Implementation (`getPortfolioValueSeries`)

**Function Logic:**
```typescript
export function getPortfolioValueSeries(
  clientId: string = DEMO_CLIENT_ID,
  method?: CostingMethod,
): PortfolioValuePoint[] {
  const portfolio = getPortfolio(clientId);
  
  // 1. Collect all unique dates from priceHistory across all bonds
  const dateSet = new Set<string>();
  for (const h of portfolio.holdings) {
    const bond = getBondByISIN(h.isin);
    bond?.priceHistory.forEach((p) => dateSet.add(p.date));
  }
  const dates = [...dateSet].sort();

  // 2. For each date, calculate value & invested
  return dates.map((date) => {
    let value = 0;
    let invested = 0;
    for (const h of portfolio.holdings) {
      const bond = getBondByISIN(h.isin);
      
      // ✅ Filter: only count lots that existed on/before this date
      const lots = h.lots.filter((l) => l.date <= date);
      if (lots.length === 0) continue;
      
      // ✅ Quantity: sum of filtered lots
      const qty = lots.reduce((s, l) => s + l.quantity, 0);
      
      // ✅ Price: lookup in priceHistory for this date (or fallback to lastTradedPrice)
      const px = [...bond.priceHistory]
        .reverse()
        .find((p) => p.date <= date)?.price ?? bond.lastTradedPrice;
      
      // 📌 Price Units: priceHistory.price is PERCENT-OF-PAR (e.g., 101.15)
      const notional = bond.faceValue / 100;  // e.g., 100/100 = 1
      
      // ✅ MTM Value: (price% / 100) * faceValue * qty
      //   e.g., (101.15 / 100) * 100 * 50000 = 101.15 * 50000
      value += (px / 100) * bond.faceValue * qty;
      
      // ✅ Invested Cost: applies costing method (FIFO/LIFO/WeightedAvg)
      //   lotCost returns (average_price_% * qty)
      //   Then multiply by notional (1 when faceValue=100)
      invested += lotCost(lots, qty, method ?? h.costingMethod) * notional;
    }
    return { date, value, invested };
  });
}
```

### ✅ Verification Against Requirements

| Requirement | Status | Details |
|-------------|--------|---------|
| **Use percent-of-par pricing** | ✅ Yes | `priceHistory.price` is stored as %-of-par (101.15, etc.) |
| **Only count lots that existed on each date** | ✅ Yes | `lots.filter((l) => l.date <= date)` filters by purchase date |
| **Handle multiple lots per holding** | ✅ Yes | Sums `qty` across all lots existing on date |
| **Support costing methods** | ✅ Yes | Passes `method ?? h.costingMethod` to `lotCost()` |
| **Calculate invested cost correctly** | ✅ Yes | Applies FIFO/LIFO/WeightedAvg logic |
| **Handle missing price data** | ✅ Yes | Fallback to `lastTradedPrice` if no history for date |

### 📊 Data Structure Example

**Bond** (from bonds.json):
```json
{
  "isin": "IN0020230061",
  "faceValue": 100,
  "lastTradedPrice": 101.15,
  "priceHistory": [
    {"date": "2026-05-25", "price": 101.1918, "yield": 6.9185},
    {"date": "2026-05-26", "price": 101.1872, "yield": 6.9186}
  ]
}
```

**Portfolio Holding** (from portfolio.json):
```json
{
  "isin": "IN0020230061",
  "quantity": 50000,
  "averageCostPrice": 99.4,
  "costingMethod": "Weighted Average",
  "lots": [
    {"quantity": 30000, "price": 98.85, "date": "2024-11-12"},
    {"quantity": 20000, "price": 100.22, "date": "2025-06-18"}
  ]
}
```

---

## 📄 Types (`lib/types.ts`)

### Core Domain Types
- **Bond** (87 fields): issuer, instrument, pricing, coupons, ratings, maturity, durations, cashflows, priceHistory
- **Holding** (6 fields): isin, quantity, costingMethod, lots, dates
- **Lot** (3 fields): quantity, price (%-of-par), date
- **Portfolio** (3 fields): clientId, asOf, holdings[]
- **Trade** (14 fields): order placement, fills, pricing, status, validity
- **Party** (6 fields): name, type (Dealer/Client), tier, limits, KYC
- **NewsItem** (4 fields): headline, source, timestamp, relatedIsin
- **MarketRates** (4 fields): repo, reverse-repo, GSec 10Y, USD/INR
- **NewIssuance** (9 fields): subscription, priceBand, status
- **CommissionRate & CommissionSummary** (for earnings tracking)
- **PortfolioValuePoint** (3 fields): date, value, invested (for charting)

---

## 🎯 Capstone Requirements (8 Steps)

### **BUILD ORDER (Sequential Reviews)**

1. ✅ **Tailwind + Base UI Components** — COMPLETE
   - Button, Badge, Card, DataTable, SectionHeader, chart wrappers
   
2. ⏭️ **JSON Data + Data-Access Layer** — COMPLETE
   - lib/types.ts (all domain types)
   - lib/data.ts (all data functions)
   - /data/*.json (all seed files)
   - ✅ Portfolio MTM calculation: percent-of-par pricing + lot date filtering
   
3. **Layout + TopTicker + Navbar** — TODO
   - Shared TopTicker (rates + scrolling news)
   - Navbar (client-side) & AdminNavbar
   
4. **Home / Market Watch** (`/`)
   - Watchlist sidebar
   - Main data table (sortable, filterable, searchable)
   - New Issuances card rail
   - Yield curve chart
   
5. **Instrument Detail** (`/instrument/[isin]`)
   - Price/yield history chart
   - Bond Characteristics table (sub-sections)
   - Cash Flow Schedule
   - Documents placeholder
   - Peer Comparison
   
6. **Order Execution** (Modal/Slide-over `<OrderTicket />`)
   - Buy/Sell + order type
   - Quantity (with min lot validation)
   - Price calculation (clean + accrued = dirty + brokerage = total)
   - Limit utilization bar
   - Confirm → add to trades (in-memory)
   
7. **Trades Management** (`/trades`)
   - Tabs: Open Orders / Executed / All
   - Modify/Cancel actions
   - Status badges (red/black/green)
   - Date/status filters
   
8. **Portfolio / Net Position** (`/portfolio`)
   - Summary stats: Invested, Current Value, Return %, Accrued Interest
   - Costing method toggle (FIFO/LIFO/Weighted Avg)
   - Holdings table with MTM P&L
   - Charts: Sector donut, Rating donut, Value vs Invested area chart (with benchmark toggle)
   
9. **Admin Section** (`/admin`)
   - `/admin/blotter` — trade blotter (all trades, all dealers)
   - `/admin/limits` — dealer/client limits + utilization
   - `/admin/commissions` — rate grid + earned summary
   - `/admin/risk` — exposure by issuer/rating, breach alerts
   - `/admin/kyc` — pending KYC queue
   
10. **Final Pass** — consistency check, empty states, responsive

### ✅ COMPLETE (STEPS 1-2)
- Tailwind v4 configuration with institutional design tokens
- All base UI components (button, badge, card, table, etc.)
- Chart wrappers (line, area, bar, donut) with tooltips
- Full typed data-access layer with ~15 data functions
- **Portfolio MTM calculation with percent-of-par pricing ✅**
- **Lot filtering by purchase date ✅**
- **Costing method support (FIFO/LIFO/Weighted Average) ✅**
- JSON seed data for 10+ bond types + portfolio + trades
- Layout & typography system
- Style Guide page (design system review surface)

### 📋 TODO (STEPS 3-10)
- Multi-page routing (currently single page)
- Navigation (TopTicker, Navbar, AdminNavbar)
- All feature pages (6 client + 5 admin)
- Order ticket modal
- Responsive design
- Empty states

### ❓ NOTES
- **No routing:** Currently single page (page.tsx → StyleGuide)
- **No navigation:** No nav bar / sidebar implemented
- **No API routes:** All data is static JSON imports
- **No tests:** No test suite configured
- **Build status:** Ready to run `npm run dev`

---

## 🚀 Quick Start

```bash
npm install
npm run dev
# Open http://localhost:3000
```

The Style Guide page demos all components and charts. No styling issues observed.

---

## 🎓 Key Insights

1. **Design System is Stable** — Color palette, typography, and spacing are well-defined and consistently applied
2. **Data Layer Abstraction is Strong** — Components never import from `/data` directly; all access through `lib/data.ts`
3. **MTM Calculation is Correct** — Uses percent-of-par pricing, filters lots by date, applies costing methods
4. **Next Phase is Navigation** — The Style Guide will be replaced by Market Watch page, which implies a multi-page app with routing

---

## 📌 Ready for Next Task

**Blockers:** None identified  
**Dependencies:** All installed  
**Type Safety:** Strict TypeScript throughout  

**Recommendation:** Proceed with Market Watch page or other features as specified by capstone requirements.
