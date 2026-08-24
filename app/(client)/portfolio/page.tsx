"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { X } from "lucide-react";
import {
  getPortfolio,
  getBondByISIN,
  DEMO_CLIENT_ID,
  getPortfolioValueSeries,
  getPortfolioAllocationBySector,
  getPortfolioAllocationByRating,
  getHoldingMTM,
  getHoldingCost,
  getCashFlowSchedule,
} from "@/lib/data";
import { getBonds } from "@/lib/data";
import { SectionHeader, DataTable, Card, type DataTableColumn } from "@/components/ui";
import { AppAreaChart, AppDonutChart, type DonutSlice, type ChartPoint } from "@/components/charts";
import { OrderTicket } from "@/components/orders/OrderTicket";
import type { Holding, CostingMethod } from "@/lib/types";

export default function PortfolioPage() {
  const portfolio = getPortfolio(DEMO_CLIENT_ID);
  const [costingMethod, setCostingMethod] = useState<CostingMethod>("FIFO");
  // Filters specific to fixed-income
  const [instrumentFilter, setInstrumentFilter] = useState<string>("All");
  const [maturityFilter, setMaturityFilter] = useState<string>("All");
  const [ratingFilter, setRatingFilter] = useState<string>("All");
  const [issuerFilter, setIssuerFilter] = useState<string>("");
  const [sectorFilter, setSectorFilter] = useState<string>("All");
  // ytm min/max removed from UI but keep state for backwards compatibility
  const [ytmMin, setYtmMin] = useState<number | "">("");
  const [ytmMax, setYtmMax] = useState<number | "">("");
  const [selectedHolding, setSelectedHolding] = useState<Holding | null>(null);
  const [orderTicketOpen, setOrderTicketOpen] = useState(false);
  const [orderSide, setOrderSide] = useState<"Buy" | "Sell">("Buy");
  const [orderBond, setOrderBond] = useState<ReturnType<typeof getBondByISIN> | null>(null);
  
  const allBonds = getBonds();
  const uniqueInstrumentTypes = ["All", ...Array.from(new Set(allBonds.map((b) => b.instrumentType)))];
  const uniqueRatings = ["All", ...Array.from(new Set(allBonds.map((b) => b.creditRating)))];
  const uniqueSectors = ["All", ...Array.from(new Set(allBonds.map((b) => b.sector)))];
  const invalidPortfolioIsins = useMemo(
    () => portfolio?.holdings.filter((h) => !getBondByISIN(h.isin)).map((h) => h.isin) ?? [],
    [portfolio]
  );

  if (!portfolio) {
    return (
      <div className="p-6">
        <SectionHeader title="Portfolio" eyebrow="Holdings" />
        <div className="text-center text-muted py-12">No portfolio data available</div>
      </div>
    );
  }
  // Filter holdings according to selected filters
  const filteredHoldings = useMemo(() => {
    return portfolio.holdings.filter((h) => {
      const bond = getBondByISIN(h.isin);
      if (!bond) return false;
      if (instrumentFilter !== "All" && bond.instrumentType !== instrumentFilter) return false;
      if (ratingFilter !== "All" && bond.creditRating !== ratingFilter) return false;
      if (sectorFilter !== "All" && bond.sector !== sectorFilter) return false;
      if (issuerFilter && !bond.issuerName.toLowerCase().includes(issuerFilter.toLowerCase())) return false;
      if (ytmMin !== "" && bond.ytm < Number(ytmMin)) return false;
      if (ytmMax !== "" && bond.ytm > Number(ytmMax)) return false;
      // maturity filter buckets
      const years = bond.maturityYears;
      if (maturityFilter !== "All") {
        const f = maturityFilter;
        if (f === "<3M" && years > 0.25) return false;
        if (f === "3-12M" && (years <= 0.25 || years > 1)) return false;
        if (f === "1-3Y" && (years <= 1 || years > 3)) return false;
        if (f === "3-5Y" && (years <= 3 || years > 5)) return false;
        if (f === "5-10Y" && (years <= 5 || years > 10)) return false;
        if (f === ">10Y" && years <= 10) return false;
      }
      
      return true;
    });
  }, [portfolio.holdings, instrumentFilter, maturityFilter, ratingFilter, issuerFilter, sectorFilter, ytmMin, ytmMax]);

  const stats = useMemo(() => {
    let totalInvested = 0;
    let totalCurrent = 0;
    let totalAccrued = 0;
    let weightedYtmSum = 0;
    let weightForYtm = 0;
    let weightedDurationSum = 0;
    let weightForDuration = 0;
    let annualCouponIncome = 0;

    for (const holding of filteredHoldings) {
      const bond = getBondByISIN(holding.isin);
      if (!bond) continue;

      const { totalCost } = getHoldingCost(holding, costingMethod);
      totalInvested += totalCost;

      const value = bond.lastTradedPrice * (bond.faceValue / 100) * holding.quantity;
      totalCurrent += value;

      if (bond.accruedInterestApplicable) {
        totalAccrued += bond.accruedInterestAmount * (bond.faceValue / 100) * holding.quantity;
      }

      // weighted YTM and duration by market value
      weightedYtmSum += (bond.ytm || 0) * value;
      weightForYtm += value;
      weightedDurationSum += (bond.modifiedDuration || 0) * value;
      weightForDuration += value;

      // annual coupon income estimate
      const periods = bond.couponFrequency === "Annual" ? 1 : bond.couponFrequency === "Semi-Annual" ? 2 : bond.couponFrequency === "Quarterly" ? 4 : 0;
      const couponPerUnit = periods > 0 ? (bond.faceValue * bond.couponRate) / 100 : 0;
      annualCouponIncome += couponPerUnit * holding.quantity;
    }

    const overallReturn = totalInvested > 0 ? totalCurrent - totalInvested : 0;
    const overallReturnPct = totalInvested > 0 ? ((overallReturn / totalInvested) * 100).toFixed(2) : "0.00";

    return {
      totalInvested,
      totalCurrent,
      overallReturn,
      overallReturnPct,
      totalAccrued,
      portfolioYtm: weightForYtm ? weightedYtmSum / weightForYtm : 0,
      avgDuration: weightForDuration ? weightedDurationSum / weightForDuration : 0,
      annualCouponIncome,
    };
  }, [filteredHoldings, costingMethod]);

  const holdingsColumns: DataTableColumn<Holding>[] = [
    {
      id: "security",
      header: "Security",
      accessor: (h) => {
        const bond = getBondByISIN(h.isin);
        return (
          <div>
            <Link
              href={`/instrument/${h.isin}`}
              onClick={(event) => event.stopPropagation()}
              className="font-semibold text-ubs-red hover:underline"
            >
              {bond?.ticker ?? h.isin}
            </Link>
            <div className="text-2xs text-muted">{bond?.issuerName || "—"}</div>
          </div>
        );
      },
      sortValue: (h) => h.isin,
    },
    {
      id: "quantity",
      header: "Quantity",
      align: "right",
      accessor: (h) => h.quantity.toLocaleString(),
      sortValue: (h) => h.quantity,
    },
    {
      id: "marketValue",
      header: "Market Value",
      align: "right",
      accessor: (h) => {
        const bond = getBondByISIN(h.isin);
        if (!bond) return "—";
        const value = bond.lastTradedPrice * (bond.faceValue / 100) * h.quantity;
        return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
      },
      sortValue: (h) => {
        const bond = getBondByISIN(h.isin);
        return bond ? bond.lastTradedPrice * (bond.faceValue / 100) * h.quantity : 0;
      },
    },
    {
      id: "mtm",
      header: "MTM P&L",
      align: "right",
      accessor: (h) => {
        const bond = getBondByISIN(h.isin);
        if (!bond) return "—";
        const { mtmTotal, mtmPercent } = getHoldingMTM(h, bond);
        const color = mtmTotal >= 0 ? "text-positive" : "text-ubs-red";
        return (
          <div className={color}>
            <div className="font-semibold">
              {mtmTotal >= 0 ? "+" : ""}
              {mtmTotal.toLocaleString("en-IN", {
                maximumFractionDigits: 0,
              })}
            </div>
            <div className="text-2xs">({mtmPercent.toFixed(2)}%)</div>
          </div>
        );
      },
      sortValue: (h) => {
        const bond = getBondByISIN(h.isin);
        if (!bond) return 0;
        const { mtmTotal } = getHoldingMTM(h, bond);
        return mtmTotal;
      },
    },
  ];

  const sectorData: DonutSlice[] = getPortfolioAllocationBySector(DEMO_CLIENT_ID)
    .sort((a, b) => b.value - a.value)
    .slice(0, 8);

  const ratingData: DonutSlice[] = getPortfolioAllocationByRating(DEMO_CLIENT_ID)
    .sort((a, b) => b.value - a.value);

  const valueSeriesData: ChartPoint[] = getPortfolioValueSeries(DEMO_CLIENT_ID).map((d) => ({
    date: new Date(d.date).toLocaleDateString("en-IN", { month: "short", day: "numeric" }),
    Current: Math.round(d.value),
    Invested: Math.round(d.invested),
  }));

  const costingMethods: CostingMethod[] = ["FIFO", "LIFO", "Weighted Average"];

  // Derived visuals and lists based on filtered holdings
  const instrumentAllocation = useMemo(() => {
    const map = new Map<string, number>();
    for (const h of filteredHoldings) {
      const b = getBondByISIN(h.isin);
      if (!b) continue;
      const v = b.lastTradedPrice * (b.faceValue / 100) * h.quantity;
      map.set(b.instrumentType, (map.get(b.instrumentType) || 0) + v);
    }
    return Array.from(map.entries()).map(([name, value]) => ({ name, value })).sort((a, b) => b.value - a.value);
  }, [filteredHoldings]);

  const maturityProfile = useMemo(() => {
    const buckets: Record<string, number> = {
      "<3M": 0,
      "3-12M": 0,
      "1-3Y": 0,
      "3-5Y": 0,
      "5-10Y": 0,
      ">10Y": 0,
    };
    for (const h of filteredHoldings) {
      const b = getBondByISIN(h.isin);
      if (!b) continue;
      const years = b.maturityYears;
      const v = b.lastTradedPrice * (b.faceValue / 100) * h.quantity;
      if (years <= 0.25) buckets["<3M"] += v;
      else if (years <= 1) buckets["3-12M"] += v;
      else if (years <= 3) buckets["1-3Y"] += v;
      else if (years <= 5) buckets["3-5Y"] += v;
      else if (years <= 10) buckets["5-10Y"] += v;
      else buckets[">10Y"] += v;
    }
    return Object.entries(buckets).map(([name, value]) => ({ name, value }));
  }, [filteredHoldings]);

  const expectedCashFlows = useMemo(() => {
    const now = new Date();
    const end = new Date(now);
    end.setMonth(end.getMonth() + 12);
    const buckets: Record<string, number> = {}; // month-year -> amount
    for (const h of filteredHoldings) {
      const b = getBondByISIN(h.isin);
      if (!b) continue;
      const schedule = getCashFlowSchedule(h.isin);
      for (const cf of schedule) {
        const d = new Date(cf.date);
        if (d >= now && d <= end) {
          const key = `${d.getFullYear()}-${d.getMonth()+1}`;
          buckets[key] = (buckets[key] || 0) + cf.amount * (b.faceValue/100) * h.quantity / (b.redemptionPrice && b.redemptionPrice !== 100 ? 1 : 1);
        }
      }
    }
    // convert to sorted array by month
    const points = Object.entries(buckets)
      .map(([k, v]) => ({ month: k, amount: v }))
      .sort((a, c) => a.month.localeCompare(c.month));
    return points;
  }, [filteredHoldings]);

  const upcomingMaturities = useMemo(() => {
    const rows: { isin: string; security: string; maturity: string; days: number; faceValue: number; expectedRedemption: number }[] = [];
    const today = new Date();
    for (const h of filteredHoldings) {
      const b = getBondByISIN(h.isin);
      if (!b) continue;
      const mat = new Date(b.redemptionDate);
      const days = Math.ceil((mat.getTime() - today.getTime()) / (1000*60*60*24));
      const expected = b.redemptionPrice * (b.faceValue/100) * h.quantity;
      rows.push({ isin: h.isin, security: b.ticker, maturity: b.redemptionDate, days, faceValue: b.faceValue, expectedRedemption: expected });
    }
    return rows.sort((a, b) => a.days - b.days).slice(0, 7);
  }, [filteredHoldings]);
  const selectedBond = selectedHolding ? getBondByISIN(selectedHolding.isin) : null;
  const selectedHoldingMarketValue = selectedHolding && selectedBond
    ? selectedBond.lastTradedPrice * (selectedBond.faceValue / 100) * selectedHolding.quantity
    : 0;
  const selectedHoldingMtm = selectedHolding && selectedBond ? getHoldingMTM(selectedHolding, selectedBond) : null;

  return (
    <div className="space-y-6 p-6">
      <SectionHeader title="Portfolio" eyebrow="Holdings" />

      {/* Filters */}
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-label text-muted">Filters</p>
        <div className="grid grid-cols-2 gap-4 md:grid-cols-6">
          <div>
            <label className="block text-2xs font-semibold text-muted mb-1">Instrument</label>
            <select
              value={instrumentFilter}
              onChange={(e) => setInstrumentFilter(e.target.value)}
              className="w-full rounded border border-border px-2 py-1 text-sm text-ink focus:border-ubs-red focus:outline-none"
            >
              {uniqueInstrumentTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-2xs font-semibold text-muted mb-1">Maturity</label>
            <select
              value={maturityFilter}
              onChange={(e) => setMaturityFilter(e.target.value)}
              className="w-full rounded border border-border px-2 py-1 text-sm text-ink focus:border-ubs-red focus:outline-none"
            >
              <option>All</option>
              <option>&lt;3M</option>
              <option>3-12M</option>
              <option>1-3Y</option>
              <option>3-5Y</option>
              <option>5-10Y</option>
              <option>&gt;10Y</option>
            </select>
          </div>

          <div>
            <label className="block text-2xs font-semibold text-muted mb-1">Rating</label>
            <select
              value={ratingFilter}
              onChange={(e) => setRatingFilter(e.target.value)}
              className="w-full rounded border border-border px-2 py-1 text-sm text-ink focus:border-ubs-red focus:outline-none"
            >
              {uniqueRatings.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-2xs font-semibold text-muted mb-1">Issuer</label>
            <input
              placeholder="Issuer name"
              value={issuerFilter}
              onChange={(e) => setIssuerFilter(e.target.value)}
              className="w-full rounded border border-border px-2 py-1 text-sm text-ink focus:border-ubs-red focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-2xs font-semibold text-muted mb-1">Sector</label>
            <select
              value={sectorFilter}
              onChange={(e) => setSectorFilter(e.target.value)}
              className="w-full rounded border border-border px-2 py-1 text-sm text-ink focus:border-ubs-red focus:outline-none"
            >
              {uniqueSectors.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-2xs font-semibold text-muted mb-1">Costing Method</label>
            <select
              value={costingMethod}
              onChange={(e) => setCostingMethod(e.target.value as CostingMethod)}
              className="w-full rounded border border-border px-2 py-1 text-sm text-ink focus:border-ubs-red focus:outline-none"
            >
              {costingMethods.map((m) => (
                <option key={m} value={m}>{m === "Weighted Average" ? "AVG" : m}</option>
              ))}
            </select>
          </div>

          
        </div>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <Card className="p-4">
          <div className="text-2xs font-semibold text-muted mb-1">Total Invested</div>
          <div className="text-lg font-semibold text-ink">
            ₹{stats.totalInvested.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-2xs font-semibold text-muted mb-1">Current Value</div>
          <div className="text-lg font-semibold text-ink">
            ₹{stats.totalCurrent.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-2xs font-semibold text-muted mb-1">Overall Return</div>
          <div className={`text-lg font-semibold ${stats.overallReturn >= 0 ? "text-positive" : "text-ubs-red"}`}>
            {stats.overallReturn >= 0 ? "+" : ""}
            ₹{stats.overallReturn.toLocaleString("en-IN", { maximumFractionDigits: 0 })}
          </div>
        </Card>
        <Card className="p-4">
          <div className="text-2xs font-semibold text-muted mb-1">Return %</div>
          <div className={`text-lg font-semibold ${parseFloat(stats.overallReturnPct) >= 0 ? "text-positive" : "text-ubs-red"}`}>
            {parseFloat(stats.overallReturnPct) >= 0 ? "+" : ""}
            {stats.overallReturnPct}%
          </div>
        </Card>
      </div>

      

      {/* Holdings Table */}
      <div>
        <div className="mb-4 text-sm text-muted">{filteredHoldings.length} holding(s) (filtered)</div>
        {invalidPortfolioIsins.length > 0 && (
          <div className="mb-3 rounded border border-ubs-red bg-ubs-red/5 px-3 py-2 text-2xs text-ubs-red">
            Data warning: {invalidPortfolioIsins.length} holding(s) have ISIN not found in bond master:
            {" "}
            {invalidPortfolioIsins.join(", ")}
          </div>
        )}
        <DataTable
          columns={holdingsColumns}
          data={filteredHoldings}
          rowKey={(h) => h.isin}
          searchable={false}
          onRowClick={(holding) => setSelectedHolding(holding)}
        />
      </div>

      {selectedHolding && selectedBond && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
          onClick={() => setSelectedHolding(null)}
          role="presentation"
        >
          <div
            className="w-full max-w-xl rounded-lg border border-border bg-white shadow-lg"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-start justify-between border-b border-border px-5 py-4">
              <div>
                <Link
                  href={`/instrument/${selectedBond.isin}`}
                  className="text-lg font-bold text-ubs-red hover:underline"
                  onClick={() => setSelectedHolding(null)}
                >
                  {selectedBond.ticker}
                </Link>
                <p className="mt-1 text-sm text-muted">{selectedBond.issuerName}</p>
                <p className="text-2xs text-muted">ISIN: {selectedBond.isin}</p>
              </div>
              <button
                type="button"
                onClick={() => setSelectedHolding(null)}
                className="inline-flex h-8 w-8 items-center justify-center rounded border border-border text-ink hover:bg-faint/5"
                aria-label="Close"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="grid grid-cols-2 gap-3 px-5 py-4 text-sm">
              <div>
                <p className="text-2xs text-muted">Quantity</p>
                <p className="font-semibold text-ink">{selectedHolding.quantity.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-2xs text-muted">Price</p>
                <p className="font-semibold text-ink">{selectedBond.lastTradedPrice.toFixed(2)}</p>
              </div>
              <div>
                <p className="text-2xs text-muted">YTM</p>
                <p className="font-semibold text-ink">{selectedBond.ytm.toFixed(2)}%</p>
              </div>
              <div>
                <p className="text-2xs text-muted">Rating</p>
                <p className="font-semibold text-ink">{selectedBond.creditRating}</p>
              </div>
              <div>
                <p className="text-2xs text-muted">Market Value</p>
                <p className="font-semibold text-ink">
                  ₹{Math.round(selectedHoldingMarketValue).toLocaleString("en-IN")}
                </p>
              </div>
              <div>
                <p className="text-2xs text-muted">MTM P&L</p>
                <p className={`font-semibold ${selectedHoldingMtm && selectedHoldingMtm.mtmTotal >= 0 ? "text-positive" : "text-ubs-red"}`}>
                  {selectedHoldingMtm && selectedHoldingMtm.mtmTotal >= 0 ? "+" : ""}
                  {Math.round(selectedHoldingMtm?.mtmTotal ?? 0).toLocaleString("en-IN")}
                </p>
              </div>
            </div>
            <div className="flex gap-2 border-t border-border px-5 py-4">
              <button
                type="button"
                className="h-11 flex-1 rounded border border-border text-sm font-semibold text-ubs-red hover:bg-ubs-red/5"
                onClick={() => {
                  setOrderBond(selectedBond);
                  setOrderSide("Sell");
                  setSelectedHolding(null);
                  setOrderTicketOpen(true);
                }}
              >
                Sell
              </button>
              <button
                type="button"
                className="h-11 flex-1 rounded bg-positive text-sm font-semibold text-white hover:opacity-90"
                onClick={() => {
                  setOrderBond(selectedBond);
                  setOrderSide("Buy");
                  setSelectedHolding(null);
                  setOrderTicketOpen(true);
                }}
              >
                Buy
              </button>
              <button
                type="button"
                className="h-11 flex-1 rounded border border-ink text-sm font-semibold text-ink hover:bg-black/[0.04]"
                onClick={() => {
                  setOrderBond(selectedBond);
                  setOrderSide("Buy");
                  setSelectedHolding(null);
                  setOrderTicketOpen(true);
                }}
              >
                RFQ
              </button>
            </div>
          </div>
        </div>
      )}

      {orderBond && (
        <OrderTicket
          bond={orderBond}
          open={orderTicketOpen}
          initialSide={orderSide}
          onClose={() => {
            setOrderTicketOpen(false);
            setOrderBond(null);
          }}
        />
      )}

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Sector Allocation Donut */}
        {/* Instrument Allocation */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-ink mb-4">Instrument Allocation</h3>
          <div className="h-64">
            <AppDonutChart data={instrumentAllocation as any} />
          </div>
        </Card>

        {/* Maturity Profile */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-ink mb-4">Maturity Profile</h3>
          <div className="h-64">
            <AppDonutChart data={maturityProfile as any} />
          </div>
        </Card>

        {/* Upcoming Maturities (moved into charts row) */}
        <Card className="p-4">
          <h4 className="text-sm font-semibold mb-3">Upcoming Maturities</h4>
          <div className="space-y-2">
            {upcomingMaturities.map((r) => (
              <div key={r.isin} className="flex justify-between text-sm">
                <div>
                  <div className="font-semibold">{r.security}</div>
                  <div className="text-2xs text-muted">{r.isin}</div>
                </div>
                <div className="text-right">
                  <div>{r.maturity}</div>
                  <div className="text-2xs text-muted">{r.days} days • ₹{Math.round(r.expectedRedemption).toLocaleString("en-IN")}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Expected Cash Flows */}
        <Card className="p-6 lg:col-span-3">
          <h3 className="text-sm font-semibold text-ink mb-4">Expected Cash Flows (next 12 months)</h3>
          <div className="h-80">
            {/* Simple area chart showing monthly amounts */}
            <AppAreaChart
              data={expectedCashFlows.map((p) => ({
                date: p.month,
                Amount: Math.round(p.amount),
              }))}
              xKey="date"
              series={[{ dataKey: "Amount", name: "Expected Cash Flow" }]}
            />
          </div>
        </Card>
      </div>

      
    </div>
  );
}
