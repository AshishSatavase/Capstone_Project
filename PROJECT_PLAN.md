# Fixed Income Order Execution System - Detailed Project Plan

**Status:** Step 2 Complete, Ready for Step 3  
**Last Updated:** 2026-08-20 02:01 UTC+5:30  
**Capstone Steps:** 1-10

---

## 📊 Milestones & Deliverables

### ✅ MILESTONE 1: Foundation (Steps 1-2)
**Status:** COMPLETE  
**What Was Built:**
- Tailwind v4 config with institutional design tokens (colors, typography, spacing)
- 12 base UI components (Button, Badge, Card, DataTable, etc.)
- 4 chart wrapper components (Line, Area, Bar, Donut)
- Full TypeScript types (`lib/types.ts` — 248 lines)
- Data-access layer (`lib/data.ts` — 297 lines, ~15 functions)
- 11 JSON data files with realistic bond/trade/portfolio data
- **Portfolio MTM calculation verified:** percent-of-par pricing, lot date filtering, costing methods

**Verifications Passed:**
- ✅ `getPortfolioValueSeries()` uses `priceHistory.price` (%-of-par)
- ✅ Filters lots by `l.date <= date` (only count existing lots per date)
- ✅ Sums quantity across filtered lots correctly
- ✅ Applies FIFO/LIFO/Weighted Average costing via `lotCost()`
- ✅ Handles missing price data (fallback to `lastTradedPrice`)

**Deliverable:** `/EXPLORATION_SUMMARY.md` + working Style Guide page at `/`

---

### ⏭️ MILESTONE 2: Client App Structure (Steps 3-7)
**Status:** TODO  
**Estimated Lines:** ~2500-3000

#### Step 3: Layout & Navigation
**Scope:**
- Root layout with TopTicker (persistent across pages)
- TopTicker component (market rates + scrolling news feed)
- Navbar component (client-side with logo, search, profile)
- AdminNavbar component (darker styling, admin links)
- Sidebar watchlist component (compact list, live prices, red/green deltas)

**Components to Create:**
- `components/layout/RootLayout.tsx` (or adjust app/layout.tsx)
- `components/layout/TopTicker.tsx` (rates + news scroll)
- `components/layout/Navbar.tsx` (client nav)
- `components/layout/AdminNavbar.tsx` (admin nav)
- `components/layout/Sidebar.tsx` (watchlist panel)

**Data Functions Needed:**
- `getRates()` ✅ (already exists)
- `getNews()` ✅ (already exists)
- `getWatchlist()` ✅ (already exists)
- `getWatchlistBonds()` ✅ (already exists)

**Estimated Effort:** 6-8 hours

---

#### Step 4: Home / Market Watch Page (`/`)
**Scope:**
- Main data table (bonds, sortable, filterable, searchable)
- Filters: instrument type, issuer type, rating, coupon type
- New Issuances card rail (horizontal, 3-4 cards, subscription dates, "Apply" button)
- Yield curve chart (line chart, tenor × yield)
- Responsive layout (sidebar + main area)

**Components to Create:**
- `app/(client)/page.tsx` (MarketWatch page)
- `components/market/MarketWatchTable.tsx` (reusable, uses DataTable)
- `components/market/NewIssuancesRail.tsx` (card rail component)
- `components/market/YieldCurveChart.tsx` (line chart wrapper)

**Data Functions Needed:**
- `getBonds()` ✅ (already exists)
- `filterBonds()` ✅ (already exists)
- `getNewIssuances()` ✅ (already exists)
- `getYieldCurve()` ✅ (already exists)
- `getWatchlistBonds()` ✅ (already exists)

**Estimated Effort:** 8-10 hours

---

#### Step 5: Instrument Detail Page (`/instrument/[isin]`)
**Scope:**
- Header: issuer name, ticker, rating badge, price, yield
- Tabs: Overview / Characteristics / Cash Flows / Documents / Peer Comparison
  - Overview: price/yield history line chart + area chart overlay
  - Characteristics: table organized into sub-sections (Identification, Credit & Risk, Coupon & Yield, Accrued Interest, Dates, Optionality, Structural)
  - Cash Flows: table (date, type, amount)
  - Documents: placeholder link to indenture doc
  - Peer Comparison: 3-4 similar bonds (similar rating/tenor)
- "Trade" button (opens OrderTicket modal)

**Components to Create:**
- `app/(client)/instrument/[isin]/page.tsx` (detail page)
- `components/instrument/InstrumentHeader.tsx`
- `components/instrument/CharacteristicsTable.tsx` (with subsections)
- `components/instrument/CashFlowTable.tsx`
- `components/instrument/PriceHistoryChart.tsx`
- `components/instrument/PeerComparison.tsx`
- `components/instrument/DocumentsSection.tsx`

**Data Functions Needed:**
- `getBondByISIN()` ✅ (already exists)
- `getCashFlowSchedule()` ✅ (already exists)
- `getPeerBonds()` ✅ (already exists)
- `dirtyPrice()` ✅ (already exists)

**Estimated Effort:** 10-12 hours

---

#### Step 6: Order Execution (Modal/Slide-over `<OrderTicket />`)
**Scope:**
- Modal/slide-over panel (reusable, triggered from instrument detail + market watch)
- Fields:
  - Buy/Sell toggle
  - Order type (Market/Limit/Stop-Loss/GTD/GTC)
  - Quantity (face value, with min lot validation)
  - Disclosed quantity (optional)
  - Limit/trigger price (conditional)
  - Live calculation display:
    - Clean price + accrued interest = dirty price
    - Dirty price × qty = notional
    - Notional × (brokerage bps / 10000) = brokerage fee
    - Notional + brokerage = total consideration
  - Limit utilization bar (e.g., "$4.2M / $10M used")
  - Confirm button (adds to trades state in-memory)

**Components to Create:**
- `components/orders/OrderTicket.tsx` (modal wrapper)
- `components/orders/OrderForm.tsx` (form fields)
- `components/orders/OrderCalculator.tsx` (price calculations)
- `components/orders/LimitUtilizationBar.tsx`

**Data Functions Needed:**
- `getBondByISIN()` ✅ (already exists)
- `dirtyPrice()` ✅ (already exists)
- `getCommissions()` ✅ (already exists, includes rates)
- Will need: state management for trade history (React context or localStorage)

**Estimated Effort:** 8-10 hours

---

#### Step 7: Trades Management Page (`/trades`)
**Scope:**
- Tabs: Open Orders / Executed Trades / All
- Table with columns: Order ID, ISIN, Side, Quantity, Status, Placed At, Updated At
- Actions on Open Orders: Modify, Cancel (update in-memory state)
- Status badges (red for Rejected/Cancelled, grey for Pending, green for Filled)
- Filters: date range, instrument, status
- Sort by any column

**Components to Create:**
- `app/(client)/trades/page.tsx` (trades page)
- `components/trades/TradesTable.tsx` (reusable)
- `components/trades/TradeFilters.tsx` (filter form)
- `components/trades/StatusBadge.tsx` (already have Badge, may just reuse)

**Data Functions Needed:**
- `getTrades()` ✅ (already exists)
- `getOpenOrders()` ✅ (already exists)
- `getTradesByClient()` ✅ (already exists)

**Estimated Effort:** 6-8 hours

---

### 📊 MILESTONE 3: Portfolio & Analytics (Step 8)
**Status:** TODO  
**Estimated Lines:** ~1500-2000

#### Step 8: Portfolio / Net Position Page (`/portfolio`)
**Scope:**
- Summary stat chips (4-column grid):
  - Total Invested (₹X.XX Cr)
  - Current Value (₹X.XX Cr, with delta %)
  - Overall Return % (with delta %)
  - Accrued Interest Receivable (₹X.XX L, "Receivable" hint)
- Costing method toggle (FIFO / LIFO / Weighted Avg) — recalculate stats on change
- Holdings table:
  - Columns: ISIN, Ticker, Issuer, Quantity, Avg Cost, Current Price, MTM Value, MTM P&L %, Rating
  - Sort by any column
- Charts (2×2 grid):
  1. **Sector Allocation** (donut chart, issuer type breakdown)
  2. **Rating Allocation** (donut chart, rating band breakdown)
  3. **Portfolio Value Over Time** (area chart, 2 series: Current Value + Invested, with benchmark toggle)
  4. **Benchmark Overlay** (toggle to show NIFTY_COMPOSITE_DEBT or GSEC_10Y_INDEX on chart)

**Components to Create:**
- `app/(client)/portfolio/page.tsx` (portfolio page)
- `components/portfolio/PortfolioSummary.tsx` (stat chips + costing toggle)
- `components/portfolio/HoldingsTable.tsx` (table with MTM P&L)
- `components/portfolio/SectorChart.tsx` (donut)
- `components/portfolio/RatingChart.tsx` (donut)
- `components/portfolio/ValueOverTimeChart.tsx` (area + benchmark toggle)

**Data Functions Needed:**
- `getPortfolio()` ✅ (already exists)
- `getPortfolioValueSeries()` ✅ (already exists, verified correct)
- `getHoldingCost()` ✅ (already exists)
- `getBondByISIN()` ✅ (already exists)
- `getBenchmark()` ✅ (already exists)
- New: `getPortfolioAllocationBySector()` (compute from holdings)
- New: `getPortfolioAllocationByRating()` (compute from holdings)
- New: `getHoldingMTM()` (compute for each holding: currentPrice × qty - investedCost)

**Estimated Effort:** 10-12 hours

---

### 🔐 MILESTONE 4: Admin Section (Step 9)
**Status:** TODO  
**Estimated Lines:** ~2000-2500

#### Step 9: Admin Dashboard & Sub-pages (`/admin`)
**Scope:**

##### 9a. Admin Shell (`/admin`)
- Separate layout with AdminNavbar (dark header bar)
- Sidebar with admin links: Blotter, Limits, Commissions, Risk, KYC
- Same palette (red/black/white) but darker header for visual distinction

**Components:**
- `app/(admin)/layout.tsx` (or `app/admin/layout.tsx`)
- `components/admin/AdminNavbar.tsx` (dark header)
- `components/admin/AdminSidebar.tsx` (admin links)

**Effort:** 3-4 hours

---

##### 9b. Trade Blotter (`/admin/blotter`)
- Centralized table of all trades across all dealers + all clients
- Columns: Order ID, Dealer, Client, ISIN, Side, Quantity, Price, Status, Placed At, Updated At
- Filters: dealer, client, status, date range
- Sort by any column
- Status badges (red/grey/green as per Trades page)

**Components:**
- `app/(admin)/blotter/page.tsx`
- `components/admin/BlotterTable.tsx`
- `components/admin/BlotterFilters.tsx`

**Data Functions Needed:**
- `getTrades()` ✅ (already exists, returns all)
- `getParties()` ✅ (already exists, includes dealers + clients)

**Effort:** 5-6 hours

---

##### 9c. Limit Management (`/admin/limits`)
- Table of dealers + clients with:
  - Columns: Party ID, Name, Type (Dealer/Client), Trading Limit (₹), Utilized (₹), Available (₹), Utilization % (bar chart)
- Edit limit modal (to change limit for a party)
- Filter by party type, utilization threshold

**Components:**
- `app/(admin)/limits/page.tsx`
- `components/admin/LimitsTable.tsx`
- `components/admin/EditLimitModal.tsx`
- `components/admin/UtilizationBar.tsx` (bar chart)

**Data Functions Needed:**
- `getParties()` ✅ (already exists, has tradingLimit + utilizedAmount)
- Will need: state management for editing limits (React context)

**Effort:** 6-8 hours

---

##### 9d. Commissions (`/admin/commissions`)
- Commission Rate Grid:
  - Rows: Instrument Types (G-Sec, SDL, T-Bill, NCD, CD, CP, AT1)
  - Columns: Client Tiers (Institutional, HNI, Bank-Treasury)
  - Cells: editable bps values
- Earned Summary:
  - Stat chips or bar chart: Earned Today (₹X), Earned This Month (₹X)
  - Daily breakdown bar chart (dates × amounts)

**Components:**
- `app/(admin)/commissions/page.tsx`
- `components/admin/CommissionRateGrid.tsx` (editable table)
- `components/admin/CommissionSummary.tsx` (stat chips)
- `components/admin/DailyCommissionChart.tsx` (bar chart)

**Data Functions Needed:**
- `getCommissions()` ✅ (already exists, has rates + summary)
- Will need: state management for editing rates (React context)

**Effort:** 6-8 hours

---

##### 9e. Risk Dashboard (`/admin/risk`)
- Exposure by Issuer:
  - Horizontal bar chart: issuer name × notional amount (₹)
- Exposure by Rating:
  - Donut chart: rating band × notional
- Breach Alerts List:
  - Table of alerts where utilization > limit or exposure > threshold (mock some data)

**Components:**
- `app/(admin)/risk/page.tsx`
- `components/admin/ExposureByIssuerChart.tsx` (bar chart)
- `components/admin/ExposureByRatingChart.tsx` (donut)
- `components/admin/BreachAlertsList.tsx` (table)

**Data Functions Needed:**
- `getPortfolio()` ✅ (across all clients to aggregate exposure)
- `getParties()` ✅ (to check limits)
- New: `getAggregateExposureByIssuer()` (sum across all portfolios)
- New: `getAggregateExposureByRating()` (sum across all portfolios)
- New: `getBreachAlerts()` (mock or compute from limits/exposure)

**Effort:** 8-10 hours

---

##### 9f. KYC Queue (`/admin/kyc`)
- Table of pending KYC approvals:
  - Columns: Party ID, Name, Status (Pending/Approved/Expired), Updated At, Action (Approve/Reject/Extend)
- Filter by status
- Approve/Reject/Extend buttons (update state in-memory)

**Components:**
- `app/(admin)/kyc/page.tsx`
- `components/admin/KycTable.tsx`
- `components/admin/KycActionModal.tsx` (approve/reject/extend)

**Data Functions Needed:**
- `getClients()` ✅ (already exists, filter by KYC status)
- `getDealers()` ✅ (already exists)

**Effort:** 4-5 hours

---

### ✔️ MILESTONE 5: Polish & QA (Step 10)
**Status:** TODO  
**Estimated Lines:** ~500-800

#### Step 10: Final Consistency Pass
**Scope:**
- Color consistency check (red, black, green used correctly across all pages)
- Spacing/padding consistency (4px grid adherence)
- Typography consistency (font sizes, weights, tracking)
- Empty states on all tables (no data, loading, error)
- Loading skeleton states on slow components
- Responsive design review (mobile, tablet, desktop)
- Accessibility check (contrast, keyboard nav)
- Cross-page navigation test (all links work)

**Deliverable:** Verified working demo of all 11 pages + admin sub-pages

---

## 📈 Total Project Scope

| Milestone | Steps | Status | Est. Effort | Est. Lines |
|-----------|-------|--------|-------------|------------|
| Foundation | 1-2 | ✅ DONE | 20h | 3,500 |
| Client App | 3-7 | ⏭️ TODO | 38-46h | 2,500-3,000 |
| Portfolio | 8 | ⏭️ TODO | 10-12h | 1,500-2,000 |
| Admin | 9 | ⏭️ TODO | 32-40h | 2,000-2,500 |
| Polish | 10 | ⏭️ TODO | 4-6h | 500-800 |
| **TOTAL** | **1-10** | **35% DONE** | **84-110h** | **~10,000-11,800** |

---

## 🎯 Next Immediate Actions

### Immediate (Next Session)
1. **Step 3: Layout & Navigation**
   - Create `components/layout/TopTicker.tsx` (rates + scrolling news)
   - Create `components/layout/Navbar.tsx` (client nav)
   - Adjust root layout or create segment layout for client vs admin
   - Create watchlist sidebar component
   - Test TopTicker persistence across pages

2. **Step 4: Home / Market Watch**
   - Replace Style Guide page with MarketWatch page at `/`
   - Build market watch table using existing DataTable component
   - Add filter controls (instrument, issuer, rating, coupon)
   - Add New Issuances rail
   - Add yield curve chart

### Review Checkpoints
- After Step 3: Layout + navigation working, TopTicker persists ✓
- After Step 4: Home page fully functional, filters work, data flows correctly ✓
- After Step 5: Instrument detail page navigable from market watch ✓
- After Step 6: Order ticket modal works from instrument detail ✓
- After Step 7: Trades page shows history + open orders ✓
- After Step 8: Portfolio page with charts + costing toggle ✓
- After Step 9: Admin section complete with all sub-pages ✓
- After Step 10: Full app polished + responsive ✓

---

## 📚 Architecture Notes

### Routing Strategy
- Next.js App Router (already using v16.3.1)
- Route groups: `(client)` vs `(admin)` for layout separation
- Dynamic routes: `[isin]` for instrument detail

### State Management
- **Portfolio/Holdings:** Static JSON (via `getPortfolio()`)
- **Trades:** In-memory state (React Context or localStorage for persistence)
- **Limits:** In-memory state (React Context)
- **Commissions:** In-memory state (React Context)
- **KYC Actions:** In-memory state (React Context)

### Data Flow
- All component data fetches go through `lib/data.ts`
- Never import JSON files directly
- All computations (MTM, allocations, utilization) via helper functions

### Styling
- Tailwind v4 with custom theme tokens from `app/globals.css`
- All colors from `lib/theme.ts`
- No CSS modules or inline styles (use Tailwind utilities)
- Responsive: `mobile-first` but desktop-focused (terminal UI)

---

## ✅ Verification Checklist

- [x] Tailwind config with institutional tokens
- [x] All base UI components built
- [x] All chart wrappers built
- [x] TypeScript types complete
- [x] Data layer functions verified
- [x] **Portfolio MTM calculation verified:** percent-of-par ✓, lot filtering ✓, costing methods ✓
- [ ] Multi-page routing
- [ ] TopTicker component
- [ ] Navbar components
- [ ] Home / Market Watch page
- [ ] Instrument Detail page
- [ ] Order Ticket modal
- [ ] Trades page
- [ ] Portfolio page with charts
- [ ] Admin section (all 5 sub-pages)
- [ ] Responsive design
- [ ] Empty states
- [ ] Loading states
- [ ] Final polish pass

---

## 🚀 Ready for Step 3

**Blockers:** None  
**Dependencies:** All installed (npm i already run)  
**Next Task:** Build Layout + TopTicker + Navbar  
**Estimated Time:** 6-8 hours  

**Start with:** Creating route groups `(client)` and `(admin)`, then build TopTicker component.
