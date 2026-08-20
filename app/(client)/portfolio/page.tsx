"use client";

import { useMemo, useState } from "react";
import {
  getPortfolio,
  getBondByISIN,
  DEMO_CLIENT_ID,
  getPortfolioValueSeries,
  getPortfolioAllocationBySector,
  getPortfolioAllocationByRating,
  getHoldingMTM,
  getHoldingCost,
} from "@/lib/data";
import { SectionHeader, DataTable, Card, type DataTableColumn } from "@/components/ui";
import { AppAreaChart, AppDonutChart, type DonutSlice, type ChartPoint } from "@/components/charts";
import type { Holding, CostingMethod } from "@/lib/types";

export default function PortfolioPage() {
  const portfolio = getPortfolio(DEMO_CLIENT_ID);
  const [costingMethod, setCostingMethod] = useState<CostingMethod>("FIFO");

  if (!portfolio) {
    return (
      <div className="p-6">
        <SectionHeader title="Portfolio" eyebrow="Holdings" />
        <div className="text-center text-muted py-12">No portfolio data available</div>
      </div>
    );
  }

  const stats = useMemo(() => {
    let totalInvested = 0;
    let totalCurrent = 0;

    for (const holding of portfolio.holdings) {
      const bond = getBondByISIN(holding.isin);
      if (!bond) continue;

      const { totalCost } = getHoldingCost(holding, costingMethod);
      totalInvested += totalCost;

      const currentPrice = bond.lastTradedPrice;
      const currentValue = (currentPrice / 100) * bond.faceValue * holding.quantity;
      totalCurrent += currentValue;
    }

    const overallReturn = totalInvested > 0 ? totalCurrent - totalInvested : 0;
    const overallReturnPct =
      totalInvested > 0 ? ((overallReturn / totalInvested) * 100).toFixed(2) : "0.00";

    return {
      totalInvested,
      totalCurrent,
      overallReturn,
      overallReturnPct,
    };
  }, [portfolio.holdings, costingMethod]);

  const holdingsColumns: DataTableColumn<Holding>[] = [
    {
      id: "isin",
      header: "ISIN",
      accessor: (h) => {
        const bond = getBondByISIN(h.isin);
        return (
          <div>
            <div className="font-semibold">{h.isin}</div>
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
      id: "unitCost",
      header: "Unit Cost",
      align: "right",
      accessor: (h) => {
        const { unitCost } = getHoldingCost(h, costingMethod);
        return `${unitCost.toFixed(2)}`;
      },
      sortValue: (h) => {
        const { unitCost } = getHoldingCost(h, costingMethod);
        return unitCost;
      },
    },
    {
      id: "totalCost",
      header: "Total Cost",
      align: "right",
      accessor: (h) => {
        const { totalCost } = getHoldingCost(h, costingMethod);
        return `₹${totalCost.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
      },
      sortValue: (h) => {
        const { totalCost } = getHoldingCost(h, costingMethod);
        return totalCost;
      },
    },
    {
      id: "currentPrice",
      header: "Current Price",
      align: "right",
      accessor: (h) => {
        const bond = getBondByISIN(h.isin);
        if (!bond) return "—";
        return `${bond.lastTradedPrice.toFixed(2)}`;
      },
      sortValue: (h) => {
        const bond = getBondByISIN(h.isin);
        return bond?.lastTradedPrice || 0;
      },
    },
    {
      id: "currentValue",
      header: "Current Value",
      align: "right",
      accessor: (h) => {
        const bond = getBondByISIN(h.isin);
        if (!bond) return "—";
        const value = (bond.lastTradedPrice / 100) * bond.faceValue * h.quantity;
        return `₹${value.toLocaleString("en-IN", { maximumFractionDigits: 0 })}`;
      },
      sortValue: (h) => {
        const bond = getBondByISIN(h.isin);
        if (!bond) return 0;
        return (bond.lastTradedPrice / 100) * bond.faceValue * h.quantity;
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

  return (
    <div className="space-y-6 p-6">
      <SectionHeader title="Portfolio" eyebrow="Holdings" />

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

      {/* Costing Method */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold text-muted">Costing Method:</span>
        {costingMethods.map((method) => (
          <button
            key={method}
            onClick={() => setCostingMethod(method)}
            className={`px-3 py-1 text-sm font-semibold rounded transition-colors ${
              costingMethod === method
                ? "bg-ink text-white"
                : "bg-faint text-ink hover:bg-faint/80"
            }`}
          >
            {method === "Weighted Average" ? "AVG" : method}
          </button>
        ))}
      </div>

      {/* Holdings Table */}
      <div>
        <div className="mb-4 text-sm text-muted">{portfolio.holdings.length} holding(s)</div>
        <DataTable
          columns={holdingsColumns}
          data={portfolio.holdings}
          rowKey={(h) => h.isin}
          searchable={false}
        />
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Sector Allocation Donut */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-ink mb-4">Sector Allocation</h3>
          <div className="h-64">
            <AppDonutChart data={sectorData} />
          </div>
        </Card>

        {/* Rating Allocation Donut */}
        <Card className="p-6">
          <h3 className="text-sm font-semibold text-ink mb-4">Rating Allocation</h3>
          <div className="h-64">
            <AppDonutChart data={ratingData} />
          </div>
        </Card>

        {/* Value Over Time Area Chart */}
        <Card className="p-6 lg:col-span-2">
          <h3 className="text-sm font-semibold text-ink mb-4">Portfolio Value Over Time</h3>
          <div className="h-80">
            <AppAreaChart
              data={valueSeriesData}
              xKey="date"
              series={[
                { dataKey: "Current", name: "Current Value" },
                { dataKey: "Invested", name: "Total Invested" },
              ]}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
