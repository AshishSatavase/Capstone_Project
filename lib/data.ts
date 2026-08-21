/**
 * Typed data-access layer. Components import from here — never from JSON files.
 * Swap these functions for fetch() later without touching UI.
 */
import bondsJson from "@/data/bonds.json";
import watchlistJson from "@/data/watchlist.json";
import portfolioJson from "@/data/portfolio.json";
import tradesJson from "@/data/trades.json";
import dealersJson from "@/data/dealers.json";
import newsJson from "@/data/newsFeed.json";
import ratesJson from "@/data/rates.json";
import yieldCurveJson from "@/data/yieldCurve.json";
import benchmarksJson from "@/data/benchmarks.json";
import newIssuancesJson from "@/data/newIssuances.json";
import commissionsJson from "@/data/commissions.json";
import type {
  BenchmarkId,
  BenchmarkSeries,
  Bond,
  BondFilters,
  CashFlow,
  CommissionsFile,
  CostingMethod,
  Holding,
  Lot,
  MarketRates,
  NewIssuance,
  NewsItem,
  Party,
  Portfolio,
  PortfolioValuePoint,
  Trade,
  Watchlist,
  YieldCurvePoint,
} from "@/lib/types";

export const DEMO_CLIENT_ID = "CLT-1001";

const bonds = bondsJson as Bond[];
const watchlists = watchlistJson as Watchlist[];
const portfolios = portfolioJson as Portfolio[];
const trades = tradesJson as Trade[];
const parties = dealersJson as Party[];
const news = newsJson as NewsItem[];
const rates = ratesJson as MarketRates;
const yieldCurve = yieldCurveJson as YieldCurvePoint[];
const benchmarks = benchmarksJson as BenchmarkSeries[];
const newIssuances = newIssuancesJson as NewIssuance[];
const commissions = commissionsJson as CommissionsFile;

function haystack(bond: Bond) {
  return [
    bond.isin,
    bond.ticker,
    bond.issuerName,
    bond.instrumentType,
    bond.issuerType,
    bond.creditRating,
    bond.sector,
  ]
    .join(" ")
    .toLowerCase();
}

export function getBonds(): Bond[] {
  return bonds;
}

export function getBondByISIN(isin: string): Bond | undefined {
  return bonds.find((b) => b.isin === isin);
}

export function searchBonds(query: string): Bond[] {
  const q = query.trim().toLowerCase();
  if (!q) return bonds;
  return bonds.filter((b) => haystack(b).includes(q));
}

export function filterBonds(filters: BondFilters = {}): Bond[] {
  const {
    query,
    instrumentType = "All",
    issuerType = "All",
    rating = "All",
    couponType = "All",
  } = filters;
  return searchBonds(query ?? "").filter((b) => {
    if (instrumentType !== "All" && b.instrumentType !== instrumentType) return false;
    if (issuerType !== "All" && b.issuerType !== issuerType) return false;
    if (rating !== "All" && b.creditRating !== rating) return false;
    if (couponType !== "All" && b.couponType !== couponType) return false;
    return true;
  });
}

export function getWatchlist(clientId: string = DEMO_CLIENT_ID): string[] {
  return watchlists.find((w) => w.clientId === clientId)?.isins ?? [];
}

export function getWatchlistBonds(clientId: string = DEMO_CLIENT_ID): Bond[] {
  const isins = new Set(getWatchlist(clientId));
  return bonds.filter((b) => isins.has(b.isin));
}

export function getPortfolio(clientId: string = DEMO_CLIENT_ID): Portfolio | undefined {
  return portfolios.find((p) => p.clientId === clientId);
}

export function getTrades(): Trade[] {
  return [...trades].sort((a, b) => b.placedAt.localeCompare(a.placedAt));
}

export function getTradesByClient(clientId: string): Trade[] {
  return getTrades().filter((t) => t.clientId === clientId);
}

export function getOpenOrders(clientId?: string): Trade[] {
  const open: Trade["status"][] = ["Placed", "Pending", "Partially Filled"];
  return getTrades().filter(
    (t) => open.includes(t.status) && (!clientId || t.clientId === clientId),
  );
}

export function getParties(): Party[] {
  return parties;
}

export function getDealers(): Party[] {
  return parties.filter((p) => p.type === "Dealer");
}

export function getClients(): Party[] {
  return parties.filter((p) => p.type === "Client");
}

export function getPartyById(id: string): Party | undefined {
  return parties.find((p) => p.id === id);
}

export function getNews(): NewsItem[] {
  return [...news].sort((a, b) => b.timestamp.localeCompare(a.timestamp));
}

export function getRates(): MarketRates {
  return rates;
}

export function getYieldCurve(): YieldCurvePoint[] {
  return yieldCurve;
}

export function getBenchmarks(): BenchmarkSeries[] {
  return benchmarks;
}

export function getBenchmark(id: BenchmarkId): BenchmarkSeries | undefined {
  return benchmarks.find((b) => b.id === id);
}

export function getNewIssuances(): NewIssuance[] {
  return newIssuances;
}

export function getCommissions(): CommissionsFile {
  return commissions;
}

export function getPeerBonds(isin: string, limit = 4): Bond[] {
  const bond = getBondByISIN(isin);
  if (!bond) return [];
  return bonds
    .filter((b) => b.isin !== isin)
    .map((b) => {
      const tenorGap = Math.abs(b.maturityYears - bond.maturityYears);
      const score =
        (b.creditRating === bond.creditRating ? 3 : 0) +
        (b.instrumentType === bond.instrumentType ? 2 : 0) +
        (b.issuerType === bond.issuerType ? 1 : 0) +
        (tenorGap < 2 ? 3 : tenorGap < 5 ? 1 : 0);
      return { b, score };
    })
    .sort((a, c) => c.score - a.score)
    .slice(0, limit)
    .map((x) => x.b);
}

function couponAmount(bond: Bond): number {
  if (bond.couponType === "Zero" || bond.couponFrequency === "None") return 0;
  const periods =
    bond.couponFrequency === "Annual"
      ? 1
      : bond.couponFrequency === "Semi-Annual"
        ? 2
        : 4;
  return (bond.faceValue * bond.couponRate) / 100 / periods;
}

export function getCashFlowSchedule(isin: string): CashFlow[] {
  const bond = getBondByISIN(isin);
  if (!bond) return [];
  const coupon = couponAmount(bond);
  const dates = [...bond.couponPaymentDates];
  const perpetual = bond.maturityYears > 40;
  if (!perpetual && !dates.includes(bond.redemptionDate)) {
    dates.push(bond.redemptionDate);
  }
  dates.sort();
  return dates.map((date) => {
    const isRedemption = !perpetual && date === bond.redemptionDate;
    const hasCoupon = coupon > 0 && bond.couponPaymentDates.includes(date);
    if (isRedemption && hasCoupon) {
      return {
        date,
        type: "Coupon + Redemption",
        amount: coupon + bond.redemptionPrice,
      };
    }
    if (isRedemption) {
      return { date, type: "Redemption", amount: bond.redemptionPrice };
    }
    return { date, type: "Coupon", amount: coupon };
  });
}

function lotCost(lots: Lot[], quantity: number, method: CostingMethod): number {
  if (quantity <= 0 || lots.length === 0) return 0;
  if (method === "Weighted Average") {
    const totalQty = lots.reduce((s, l) => s + l.quantity, 0);
    const avg =
      lots.reduce((s, l) => s + l.quantity * l.price, 0) / (totalQty || 1);
    return avg * quantity;
  }
  const ordered =
    method === "FIFO"
      ? [...lots].sort((a, b) => a.date.localeCompare(b.date))
      : [...lots].sort((a, b) => b.date.localeCompare(a.date));
  let remaining = quantity;
  let cost = 0;
  for (const lot of ordered) {
    if (remaining <= 0) break;
    const take = Math.min(remaining, lot.quantity);
    cost += take * lot.price;
    remaining -= take;
  }
  return cost;
}

export function getHoldingCost(
  holding: Holding,
  method: CostingMethod = holding.costingMethod,
): { unitCost: number; totalCost: number } {
  const totalCost = lotCost(holding.lots, holding.quantity, method);
  return {
    totalCost,
    unitCost: holding.quantity ? totalCost / holding.quantity : 0,
  };
}

export function getPortfolioValueSeries(
  clientId: string = DEMO_CLIENT_ID,
  method?: CostingMethod,
): PortfolioValuePoint[] {
  const portfolio = getPortfolio(clientId);
  if (!portfolio) return [];

  const dateSet = new Set<string>();
  for (const h of portfolio.holdings) {
    const bond = getBondByISIN(h.isin);
    bond?.priceHistory.forEach((p) => dateSet.add(p.date));
  }
  const dates = [...dateSet].sort();

  return dates.map((date) => {
    let value = 0;
    let invested = 0;
    for (const h of portfolio.holdings) {
      const bond = getBondByISIN(h.isin);
      if (!bond) continue;
      const lots = h.lots.filter((l) => l.date <= date);
      if (lots.length === 0) continue;
      const qty = lots.reduce((s, l) => s + l.quantity, 0);
      const px =
        [...bond.priceHistory].reverse().find((p) => p.date <= date)?.price ??
        bond.lastTradedPrice;
      const notional = bond.faceValue / 100;
      value += (px / 100) * bond.faceValue * qty;
      invested +=
        lotCost(lots, qty, method ?? h.costingMethod) * notional;
    }
    return { date, value, invested };
  });
}

export function dirtyPrice(bond: Bond, cleanPrice: number): number {
  return cleanPrice + (bond.accruedInterestApplicable ? bond.accruedInterestAmount : 0);
}

export function getPortfolioAllocationBySector(clientId: string = DEMO_CLIENT_ID) {
  const portfolio = getPortfolio(clientId);
  if (!portfolio) return [];

  const sectorMap = new Map<string, number>();
  for (const holding of portfolio.holdings) {
    const bond = getBondByISIN(holding.isin);
    if (!bond) continue;
    const value = (bond.lastTradedPrice / 100) * bond.faceValue * holding.quantity;
    sectorMap.set(bond.sector, (sectorMap.get(bond.sector) || 0) + value);
  }

  return Array.from(sectorMap.entries()).map(([name, value]) => ({ name, value }));
}

export function getPortfolioAllocationByRating(clientId: string = DEMO_CLIENT_ID) {
  const portfolio = getPortfolio(clientId);
  if (!portfolio) return [];

  const ratingMap = new Map<string, number>();
  for (const holding of portfolio.holdings) {
    const bond = getBondByISIN(holding.isin);
    if (!bond) continue;
    const value = (bond.lastTradedPrice / 100) * bond.faceValue * holding.quantity;
    ratingMap.set(bond.creditRating, (ratingMap.get(bond.creditRating) || 0) + value);
  }

  return Array.from(ratingMap.entries()).map(([name, value]) => ({ name, value }));
}

export function getHoldingMTM(holding: any, bond: Bond) {
  const { unitCost } = getHoldingCost(holding);
  const currentPrice = bond.lastTradedPrice / 100;
  const mtmPerUnit = currentPrice - unitCost;
  const mtmTotal = mtmPerUnit * holding.quantity * bond.faceValue;
  const mtmPercent = unitCost > 0 ? ((mtmPerUnit / unitCost) * 100) : 0;
  return { mtmPerUnit, mtmTotal, mtmPercent };
}

/* ----- New helpers appended below ----- */

export type TradeFilter = {
  from?: string; // ISO date 'YYYY-MM-DD' expected
  to?: string; // ISO date 'YYYY-MM-DD'
  clientId?: string;
  isin?: string;
  status?: Trade["status"];
};

/** Filter trades by date range (inclusive), client, isin and status.
 * - If only from is provided and to is missing => treat as single day (00:00 - 23:59).
 * - If only to is provided and from is missing => treat as single day (00:00 - 23:59) for that 'to' date.
 */
export function filterTrades(filters: TradeFilter = {}): Trade[] {
  const { from, to, clientId, isin, status } = filters;
  let result = getTrades();

  if (clientId) {
    result = result.filter((t) => t.clientId === clientId);
  }
  if (isin) {
    result = result.filter((t) => t.isin === isin);
  }
  if (status && status !== "All") {
    result = result.filter((t) => t.status === status);
  }

  if (from || to) {
    // create inclusive start/end Date objects
    let start: Date | null = null;
    let end: Date | null = null;

    if (from && !to) {
      start = new Date(from);
      start.setHours(0, 0, 0, 0);
      end = new Date(start);
      end.setHours(23, 59, 59, 999);
    } else if (!from && to) {
      end = new Date(to);
      end.setHours(23, 59, 59, 999);
      start = new Date(end);
      start.setHours(0, 0, 0, 0);
    } else if (from && to) {
      start = new Date(from);
      start.setHours(0, 0, 0, 0);
      end = new Date(to);
      end.setHours(23, 59, 59, 999);
    }

    if (start && end) {
      result = result.filter((t) => {
        const d = new Date(t.placedAt);
        return d >= start! && d <= end!;
      });
    }
  }

  return result.sort((a, b) => b.placedAt.localeCompare(a.placedAt));
}

/** Aggregate simple metrics for a set of trades */
export function aggregateTrades(trades: Trade[]) {
  const count = trades.length;
  const totalQuantity = trades.reduce((s, t) => s + (t.quantity || 0), 0);
  const totalFilledQuantity = trades.reduce((s, t) => s + (t.filledQuantity || 0), 0);
  const totalNotional = trades.reduce(
    (s, t) => s + ((t.avgFillPrice ?? 0) * (t.filledQuantity ?? 0)),
    0,
  );
  const avgFillPriceWeighted = totalFilledQuantity ? totalNotional / totalFilledQuantity : 0;

  return {
    count,
    totalQuantity,
    totalFilledQuantity,
    totalNotional,
    avgFillPriceWeighted,
  };
}