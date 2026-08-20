# Master Prompt for Cursor — Fixed Income Order Execution System (Next.js)

Paste everything below into Cursor's chat (Composer/Agent mode) inside your already-initialized Next.js project. If your project is large, you can also paste it in and ask Cursor to execute it **phase by phase** rather than all at once (see note at the bottom).

---

## PROMPT START

I'm building a capstone project: a **Fixed Income Order Execution System** — a broker-dealer web platform for trading Indian fixed income instruments (bonds, G-Secs, T-Bills, NCDs, CDs, CPs etc.), styled after a UBS-style institutional trading terminal. Build this as a polished, realistic front-end product using **Next.js (App Router) + TypeScript + Tailwind CSS**. All data should come from static local JSON files (no backend/API/database) — treat the JSON as if it were an API response, so the code is structured cleanly enough that swapping in a real API later would be trivial.

### Tech stack to use
- Next.js 14+ App Router, TypeScript
- Tailwind CSS for styling
- **Recharts** for all charts (line charts, area charts, donut/pie charts, bar charts)
- **lucide-react** for icons
- Client-side state with React hooks (useState/useReducer/Context) — no need for Redux/Zustand unless the app state genuinely gets complex, in which case use Zustand
- Store all data in `/data/*.json` and load via TypeScript data-access functions in `/lib/data.ts` (so components never import JSON directly — always through typed helper functions, e.g. `getBonds()`, `getBondByISIN(isin)`, `getPortfolio(clientId)`)

### Design system — READ CAREFULLY, apply consistently everywhere
This must look like a real institutional banking platform, not a generic dashboard template. Reference: UBS's corporate site design language.

- **Background:** pure white (`#FFFFFF`) throughout — no light grey panels-on-grey-background pattern. Use thin borders (`1px solid #E5E5E5` or similar) to separate sections instead of background-color changes.
- **Primary text:** black (`#000000` or near-black `#111111`)
- **Accent color:** UBS red (`#EC0016` or similar — use a single consistent red hex across the whole app, define it once as a Tailwind custom color `ubs-red`) — used for:
  - Key lines/dividers/underlines (e.g., a red horizontal rule under section headers, like the letterhead in the requirement doc)
  - Primary CTA buttons (Buy button, Submit Order, Apply)
  - Negative values (price down, negative P&L) — standard red-for-negative convention
  - Active nav item indicator
  - Small accent details: active tab underline, hover states, badges
- **Secondary accent for positive values:** a clean green (`#0F9D58` or similar) ONLY for positive P&L/price-up — everything else stays black/red/white, don't introduce other colors
- **Typography:** clean sans-serif (Inter or system-ui), bold uppercase for section headers similar to "UBS TECH GRADS PROGRAM" letterhead style in the brief. Generous letter-spacing on headers/labels.
- **Density:** this is a trading terminal, not a marketing site — favor information-dense tables and compact spacing over large whitespace-heavy cards, while still keeping it clean and aligned to a strict grid.
- **Buttons:** sharp corners or very minimal border-radius (2-4px) — avoid overly rounded/bubbly UI, keep it institutional/serious.
- No gradients, no drop shadows except very subtle ones on modals/dropdowns, no playful illustration — clean, data-dense, corporate.

Before writing any component code, first create a `tailwind.config.ts` color/typography setup and a small set of reusable base components (`<Button>`, `<Badge>`, `<DataTable>`, `<Card>`, `<SectionHeader>` with the red underline treatment, `<StatChip>` for showing a value with red/green delta) so every screen reuses the same primitives instead of one-off styling.

### Data model
Create `/data/bonds.json` — an array of 15-20 realistic mock Indian fixed income instruments spanning multiple types (G-Secs, SDLs, T-Bills, NCDs from PSUs like REC/PFC/NHAI, corporate NCDs, AT1/perpetual bonds, a CD, a CP). Each instrument object should include ALL of these fields:

```
isin, ticker, issuerName, issuerType (Sovereign/State/PSU/Bank/Corporate),
instrumentType (G-Sec/SDL/T-Bill/NCD/CD/CP/AT1 etc.),
bidPrice, askPrice, lastTradedPrice, dayChangePercent,
ytm, currentYield, couponRate, couponType (Fixed/Floating/Zero),
couponFrequency (Annual/Semi-Annual/Quarterly), floatingBenchmark (nullable),
faceValue, minLotSize,
issueDate, issuePrice, redemptionDate, redemptionPrice,
daysToMaturity, maturityYears,
modifiedDuration, macaulayDuration, convexity,
creditRating (e.g. "AAA"), ratingAgency (CRISIL/ICRA/CARE/India Ratings),
ratingOutlook (Stable/Positive/Negative), ratingDate,
seniority (Senior/Subordinated), securedStatus (Secured/Unsecured),
callable (bool), callDate (nullable), callPrice (nullable),
puttable (bool), putDate (nullable), putPrice (nullable),
dayCountConvention ("30/360" or "Actual/365"),
accruedInterestApplicable (bool), accruedInterestAmount,
outstandingIssueSize, listingExchange (NSE/BSE),
couponPaymentDates (array of future dates),
sector (e.g. Infrastructure/Banking/Power/Sovereign),
priceHistory (array of {date, price, yield} for last ~90 days — generate a realistic-looking random walk),
indentureDocUrl (can be a placeholder "#")
```

Also create:
- `/data/watchlist.json` — array of ISINs a demo user has watchlisted
- `/data/portfolio.json` — demo holdings: array of {isin, quantity, averageCostPrice, purchaseDate, costingMethod} plus enough entries to make the portfolio page meaningful (8-10 holdings across different sectors/ratings)
- `/data/trades.json` — demo order/trade history with a mix of statuses: Placed, Pending, Partially Filled, Filled, Cancelled, Rejected — with realistic timestamps, order types (Market/Limit/Stop-Loss/GTD/GTC), buy/sell, disclosed quantity where relevant
- `/data/dealers.json` — for the admin side: demo dealers/clients with trading limits, limit utilized %, KYC status
- `/data/newsFeed.json` — 10-15 short mock news items (headline, source, timestamp, related ISIN if applicable)
- `/data/rates.json` — repo rate, reverse repo rate, 10-yr G-Sec benchmark yield, USD/INR — for the top ticker
- `/data/yieldCurve.json` — array of {tenor, yield} points across 3M/6M/1Y/2Y/5Y/10Y/15Y/30Y for the sovereign yield curve chart

### Pages/routes to build

**Client-side app:**
1. `/` — Home / Market Watch (Requirement 1)
   - Top ticker bar (rates + scrolling news headlines) — persistent across all client pages, put it in a shared layout
   - Left sidebar: Watchlist panel (compact list with live-style price/YTM, red/green day change)
   - Main area: Market watch data table — sortable, filterable (by instrument type, issuer type, rating, coupon type), searchable, all the columns listed in the data model
   - "New Issuances" horizontal card rail above or beside the table — 3-4 upcoming bond IPOs with subscription dates and an "Apply" button
   - Yield curve chart (line chart, tenor vs yield) somewhere on this page — nice visual anchor

2. `/instrument/[isin]` — Instrument Detail Page
   - Header with issuer name, ticker, rating badge, current price/yield
   - Tabs: Overview (price/yield history chart via recharts), Bond Characteristics (full field table from the data model — organize into labeled sub-sections: Identification / Credit & Risk / Coupon & Yield / Accrued Interest & Day Count / Dates & Lifecycle / Optionality / Structural), Cash Flow Schedule (table of coupon dates + amounts + final redemption), Documents (placeholder link), Peer Comparison (table of 3-4 similar rated/tenor bonds)
   - "Trade" button that opens the order ticket (modal or slide-over panel)

3. `/search` — dedicated search/screener page with the advanced filter panel described above, results in the same data table component used on Home (reuse the component)

4. Order Execution — build as a **slide-over panel/modal component** (`<OrderTicket />`) that can be triggered from the instrument detail page or market watch row, not necessarily its own route. Fields: Buy/Sell toggle, Order type (Market/Limit/Stop-Loss/GTD/GTC), quantity (face value, with min lot validation), disclosed quantity (optional field), limit price/trigger price as relevant, live calculation showing clean price + accrued interest = dirty price + estimated brokerage = total consideration, a mock "limit utilization" bar (e.g. "$4.2M / $10M used"), Confirm button that adds a new entry to trade history state (in-memory, doesn't need to persist across reload unless you want to use localStorage for demo persistence)

5. `/trades` — Trade Management (Requirement 3)
   - Tabs: Open Orders / Executed Trades / All
   - Table with modify/cancel actions on open orders (can just update in-memory state)
   - Status badges color-coded (use red only for Rejected/Cancelled, black/grey for Pending, green for Filled)
   - Filters by date range, instrument, status

6. `/portfolio` — Portfolio / Net Position (Requirement 4)
   - Summary stat chips at top: Total Invested, Current Value, Overall Return %, Total Accrued Interest Receivable
   - Costing method toggle: FIFO / LIFO / Weighted Average — recalculate net position figures when toggled
   - Holdings table
   - Charts: Sector allocation (donut), Rating allocation (donut), Portfolio value vs invested amount over time (area/line chart) with a benchmark overlay toggle (Nifty Composite Debt Index / 10-yr G-Sec Index — mock this data too, add to a `/data/benchmarks.json`)
   - MTM profit/loss per holding shown inline in the holdings table

**Admin/broker side:**
7. `/admin` — Admin dashboard shell with its own nav (visually distinguish from client side slightly, e.g. a dark header bar instead of white, while keeping the same red/black/white palette)
   - `/admin/blotter` — centralized trade blotter, all trades across all dealers, filterable table
   - `/admin/limits` — dealer/client limit management table with utilization bars, edit limit modal
   - `/admin/commissions` — commission rate card (editable grid: instrument type × client tier → bps), plus a summary of commission earned today/this month (simple bar chart)
   - `/admin/risk` — aggregate exposure dashboard: exposure by issuer (bar chart), by rating band (donut), breach alerts list
   - `/admin/kyc` — pending KYC approval queue table

### Component/architecture requirements
- Shared `<TopTicker />`, `<Navbar />` in a layout for client pages; separate `<AdminNavbar />` for admin pages
- Reusable `<DataTable>` component with generic column config, sorting, and filtering — don't hand-roll a new table for every page
- Reusable chart wrapper components so all charts share consistent styling (axis fonts, red/black/green color usage, tooltip styling)
- Reusable `<RatingBadge rating="AAA" />`, `<DeltaValue value={...} />` (auto red/green + up/down arrow icon) components
- Fully responsive down to tablet width at minimum; desktop-first is fine given this is a trading terminal
- Add loading skeleton states even though data is static (shows attention to real-world UX)
- Add a simple global search in the navbar (Cmd+K style command palette is a nice-to-have if time allows, otherwise a simple search bar routing to `/search`)

### Build order (please work in this order so I can review incrementally)
1. Tailwind config + base reusable UI components (Button, Badge, Card, DataTable, SectionHeader, chart wrapper)
2. All JSON data files + `/lib/data.ts` typed data-access layer + TypeScript types/interfaces for every data shape (`/lib/types.ts`)
3. Layout + TopTicker + Navbar (client side)
4. Home / Market Watch page
5. Instrument Detail page + OrderTicket component
6. Trades page
7. Portfolio page + its charts
8. Admin section (all sub-pages)
9. Final pass: consistency check on colors/spacing across every page, empty states, responsive check

After each numbered step, stop and summarize what you built before moving to the next, so I can review.

## PROMPT END

---

### Note on using this in Cursor
This is a large build. Two ways to run it:
1. **Paste the whole thing** into Cursor's Agent/Composer mode and let it work through the numbered build order autonomously — it will likely pause naturally between big chunks.
2. **Safer approach for a capstone (recommended):** paste the whole prompt as context/spec once, but then explicitly tell Cursor to only do Step 1, review the output, then say "continue to step 2," and so on. This keeps you in control of quality and lets you catch design-system drift early before it compounds across 15+ files.

If Cursor's output starts drifting from the white/black/red palette on later pages, just say: *"Restyle this page to match the design system from step 1 — pure white background, black text, UBS red for accents/negatives, green only for positive deltas."*
